import { Router } from "express";
import { z } from "zod";
import { allow } from "./auth.mjs";
import { id, audit, lookup } from "./db.mjs";
import { leadSchema, parsePatch, fail } from "./validation.mjs";
import { paging, pageOf, searchFilter } from "./pagination.mjs";
import {
  recordEvent,
  differences,
  notify,
  crmRoles,
} from "./record-events.mjs";
const text = (max, min = 0) => z.string().trim().min(min).max(max);
const money = z.coerce.number().min(0).max(1e12);
const expected = z.number().int().positive().optional();
const statuses = ["To do", "In progress", "Blocked", "Completed", "Cancelled"];
const priority = ["Low", "Normal", "High", "Urgent"];
const projectSchema = z
  .object({
    client_id: z.uuid(),
    name: text(160, 3),
    description: text(10000).default(""),
    owner: text(100).default(""),
    due_date: z.iso.date().nullable().default(null),
    status: z
      .enum(["Discovery", "In progress", "In review", "Completed", "On hold"])
      .default("Discovery"),
    progress: z.number().int().min(0).max(100).default(0),
    remarks: text(6000).default(""),
  })
  .strict();
const customerSchema = z
  .object({
    name: text(100, 2),
    company: text(160, 2),
    email: z.email().max(254),
    phone: leadSchema.shape.phone,
    value: money,
    description: text(10000).default(""),
  })
  .strict();
const taskSchema = z
  .object({
    title: text(200, 3),
    description: text(10000).default(""),
    owner: text(100).default(""),
    owner_id: z.uuid().nullable().default(null),
    due_date: z.iso.date().nullable().default(null),
    assigned_date: z.iso.date().optional(),
    status: z.enum(statuses).default("To do"),
    priority: z.enum(priority).default("Normal"),
    remarks: text(6000).default(""),
    done: z.boolean().optional(),
  })
  .strict();
const types = {
  leads: { collection: "leads", search: ["name", "company", "email"] },
  customers: { collection: "clients", search: ["name", "company", "email"] },
  projects: { collection: "projects", search: ["name"] },
  tasks: { collection: "tasks", search: ["title"] },
};
export function canEditTask(user, task) {
  return (
    ["super_admin", "admin"].includes(user.role) ||
    task.owner_id === user.id ||
    task.created_by === user.id
  );
}
function checkVersion(record, version) {
  if (version !== undefined && (record.version || 1) !== version)
    fail(
      409,
      "Another teammate updated this record. Reload it before saving your changes.",
    );
}
const pipelineStages = [
  "New",
  "Qualified",
  "Proposal",
  "Negotiation",
  "Won",
  "Lost",
];
const pipelineProjection = {
  id: 1,
  name: 1,
  company: 1,
  stage: 1,
  value: 1,
  owner: 1,
  next_action: 1,
  version: 1,
  created_at: 1,
  updated_at: 1,
};
// Both conversion entry points use the same transaction and customer history.
async function convertLead(tx, lead, user) {
  const old = await tx.findOne("clients", { lead_id: lead.id });
  if (old) return old;
  if (lead.stage === "Lost")
    fail(409, "Reopen this opportunity before converting it.");
  const customer = await tx.insert("clients", {
    id: id(),
    lead_id: lead.id,
    name: lead.name,
    company: lead.company,
    email: lead.email,
    phone: lead.phone,
    value: lead.value,
    description: lead.notes || "",
  });
  await tx.update(
    "leads",
    { id: lead.id },
    {
      $set: { stage: "Won", updated_at: new Date() },
      $inc: { version: 1 },
    },
  );
  await recordEvent(
    tx,
    "leads",
    lead.id,
    user,
    "converted",
    "Converted to customer",
    [{ field: "stage", before: lead.stage, after: "Won" }],
  );
  await recordEvent(
    tx,
    "customers",
    customer.id,
    user,
    "created",
    "Customer created from opportunity",
  );
  await audit(
    tx,
    "crm",
    lead.id,
    user.id,
    "Converted " + lead.company + " to a customer",
  );
  return customer;
}
export function crmRoutes(db) {
  const router = Router();
  router.use(allow("admin", "sales"));
  router.get("/overview", async (req, res) => {
    const [
      leadStats,
      clientCount,
      projectStats,
      taskCount,
      leads,
      projects,
      tasks,
      activity,
    ] = await Promise.all([
      db.aggregate("leads", [
        {
          $group: {
            _id: "$stage",
            stage: { $first: "$stage" },
            count: { $sum: 1 },
            value: { $sum: "$value" },
          },
        },
      ]),
      db.count("clients", {}),
      db.aggregate("projects", [
        {
          $group: {
            _id: "$status",
            status: { $first: "$status" },
            count: { $sum: 1 },
          },
        },
      ]),
      db.count("tasks", { status: { $nin: ["Completed", "Cancelled"] } }),
      db.find(
        "leads",
        {},
        {
          sort: { created_at: -1, id: -1 },
          limit: 5,
          projection: {
            id: 1,
            name: 1,
            company: 1,
            stage: 1,
            value: 1,
            next_action: 1,
          },
        },
      ),
      db.aggregate("projects", [
        { $sort: { created_at: -1, id: -1 } },
        { $limit: 4 },
        ...lookup("clients", "client_id", { company: "company" }, true),
      ]),
      db.find(
        "tasks",
        { status: { $nin: ["Completed", "Cancelled"] } },
        { sort: { due_date: 1, id: 1 }, limit: 5 },
      ),
      db.aggregate("activity", [
        { $match: { domain: "crm" } },
        { $sort: { created_at: -1 } },
        { $limit: 10 },
        ...lookup("users", "actor_id", { actor: "name" }, true),
      ]),
    ]);
    const open = leadStats.filter((s) => !["Won", "Lost"].includes(s.stage)),
      won = leadStats.find((s) => s.stage === "Won")?.count || 0,
      lost = leadStats.find((s) => s.stage === "Lost")?.count || 0;
    res.json({
      stats: {
        pipeline: open.reduce((v, s) => v + s.value, 0),
        open_leads: open.reduce((v, s) => v + s.count, 0),
        customers: clientCount,
        active_projects: projectStats
          .filter((s) => s.status !== "Completed")
          .reduce((v, s) => v + s.count, 0),
        open_tasks: taskCount,
        win_rate: won + lost ? Math.round((won / (won + lost)) * 100) : 0,
      },
      leadStats,
      leads,
      projects,
      tasks,
      activity,
    });
  });
  // Summaries cover the complete filtered pipeline; cards are bounded per stage.
  router.get("/pipeline", async (req, res) => {
    const page = paging({ ...req.query, limit: req.query.limit ?? 12 });
    const filter = searchFilter(page.q, types.leads.search);
    const [totals, columns] = await Promise.all([
      db.aggregate("leads", [
        { $match: filter },
        {
          $group: {
            _id: "$stage",
            stage: { $first: "$stage" },
            count: { $sum: 1 },
            value: { $sum: "$value" },
          },
        },
      ]),
      Promise.all(
        pipelineStages.map(async (stage) => ({
          stage,
          items: await db.find(
            "leads",
            { ...filter, stage },
            {
              projection: pipelineProjection,
              sort: { updated_at: -1, id: -1 },
              limit: page.limit,
              maxTimeMS: 3000,
            },
          ),
        })),
      ),
    ]);
    res.json({
      columns: columns.map((column) => ({
        ...column,
        page: 1,
        limit: page.limit,
        total: totals.find((item) => item.stage === column.stage)?.count || 0,
        value: totals.find((item) => item.stage === column.stage)?.value || 0,
      })),
    });
  });
  router.get("/pipeline/stages/:stage", async (req, res) => {
    const stage = z.enum(pipelineStages).parse(req.params.stage);
    const page = paging({ ...req.query, limit: req.query.limit ?? 12 });
    res.json(
      await pageOf(
        db,
        "leads",
        { ...searchFilter(page.q, types.leads.search), stage },
        page,
        { projection: pipelineProjection, sort: { updated_at: -1, id: -1 } },
      ),
    );
  });
  router.patch("/pipeline/:id/stage", async (req, res) => {
    z.uuid().parse(req.params.id);
    const { stage, expected_version } = z
      .object({
        stage: z.enum(pipelineStages),
        expected_version: z.number().int().positive(),
      })
      .strict()
      .parse(req.body);
    const result = await db.transaction(async (tx) => {
      const lead = await tx.lock("leads", { id: req.params.id });
      if (!lead) fail(404, "Opportunity not found.");
      checkVersion(lead, expected_version);
      if (stage === lead.stage) return { record: lead };
      if (lead.stage === "Won")
        fail(409, "Converted leads retain their Won stage.");
      if (stage === "Won") {
        const customer = await convertLead(tx, lead, req.user);
        return {
          record: await tx.findOne("leads", { id: lead.id }),
          customer_id: customer.id,
        };
      }
      const record = await tx.update(
        "leads",
        { id: lead.id },
        {
          $set: { stage, updated_at: new Date() },
          $inc: { version: 1 },
        },
      );
      await recordEvent(
        tx,
        "leads",
        lead.id,
        req.user,
        "updated",
        "Stage changed · " + lead.stage + " → " + stage,
        [{ field: "stage", before: lead.stage, after: stage }],
      );
      await audit(
        tx,
        "crm",
        lead.id,
        req.user.id,
        "Moved " + lead.company + " to " + stage,
      );
      return { record };
    });
    res.json(result);
  });
  for (const [type, config] of Object.entries(types)) {
    router.get("/" + type, async (req, res) => {
      const page = paging(req.query),
        filter = searchFilter(page.q, config.search);
      if (type === "leads" && req.query.stage)
        filter.stage = z
          .enum(["New", "Qualified", "Proposal", "Negotiation", "Won", "Lost"])
          .parse(req.query.stage);
      if (type === "projects" && req.query.client)
        filter.client_id = z.uuid().parse(req.query.client);
      if (type === "tasks") {
        if (req.query.status)
          filter.status = z.enum(statuses).parse(req.query.status);
        if (req.query.priority)
          filter.priority = z.enum(priority).parse(req.query.priority);
        if (req.query.owner)
          filter.owner_id =
            req.query.owner === "me"
              ? req.user.id
              : z.uuid().parse(req.query.owner);
      }
      const result = await pageOf(db, config.collection, filter, page);
      if (type === "projects" && result.items.length) {
        const customers = await db.find(
          "clients",
          { id: { $in: result.items.map((p) => p.client_id) } },
          { projection: { id: 1, company: 1 } },
        );
        result.items = result.items.map((p) => ({
          ...p,
          company:
            customers.find((c) => c.id === p.client_id)?.company ||
            "Customer unavailable",
        }));
      }
      if (type === "tasks")
        result.items = result.items.map((t) => ({
          ...t,
          can_edit: canEditTask(req.user, t),
        }));
      res.json(result);
    });
    router.get("/" + type + "/:id", async (req, res) => {
      z.uuid().parse(req.params.id);
      const record = await db.findOne(config.collection, { id: req.params.id });
      if (!record) fail(404, "Record not found.");
      const result = {
        record,
        can_edit: type !== "tasks" || canEditTask(req.user, record),
      };
      if (type === "customers") {
        const [lead, projects, project_count] = await Promise.all([
          db.findOne("leads", { id: record.lead_id }),
          db.find(
            "projects",
            { client_id: record.id },
            { sort: { created_at: -1, id: -1 }, limit: 5 },
          ),
          db.count("projects", { client_id: record.id }),
        ]);
        Object.assign(result, { lead, projects, project_count });
      }
      if (type === "projects")
        result.customer = await db.findOne("clients", { id: record.client_id });
      if (type === "leads")
        result.customer = await db.findOne("clients", { lead_id: record.id });
      res.json(result);
    });
  }
  router.post("/leads", async (req, res) => {
    const data = leadSchema.strict().parse(req.body);
    const lead = await db.transaction(async (tx) => {
      const result = await tx.insert("leads", { id: id(), ...data });
      await audit(
        tx,
        "crm",
        result.id,
        req.user.id,
        "Created lead · " + data.company,
      );
      await recordEvent(
        tx,
        "leads",
        result.id,
        req.user,
        "created",
        "Lead created",
      );
      return result;
    });
    res.status(201).json(lead);
  });
  router.patch("/leads/:id", async (req, res) => {
    z.uuid().parse(req.params.id);
    const { expected_version, ...data } = parsePatch(
      leadSchema.extend({ expected_version: expected }).strict(),
      req.body,
    );
    if (!Object.keys(data).length) fail(400, "No changes supplied.");
    const result = await db.transaction(async (tx) => {
      const old = await tx.lock("leads", { id: req.params.id });
      if (!old) fail(404, "Lead not found.");
      checkVersion(old, expected_version);
      if (old.stage === "Won" && data.stage)
        fail(409, "Converted leads retain their Won stage.");
      const result = await tx.update(
        "leads",
        { id: old.id },
        { $set: { ...data, updated_at: new Date() }, $inc: { version: 1 } },
      );
      await recordEvent(
        tx,
        "leads",
        old.id,
        req.user,
        "updated",
        "Opportunity updated",
        differences(old, data),
      );
      await audit(tx, "crm", old.id, req.user.id, "Updated " + result.company);
      return result;
    });
    res.json(result);
  });
  router.post("/leads/:id/convert", async (req, res) => {
    z.uuid().parse(req.params.id);
    const { expected_version } = z
      .object({ expected_version: expected })
      .strict()
      .parse(req.body);
    const client = await db.transaction(async (tx) => {
      const lead = await tx.lock("leads", { id: req.params.id });
      if (!lead) fail(404, "Lead not found.");
      checkVersion(lead, expected_version);
      return convertLead(tx, lead, req.user);
    });
    res.json(client);
  });
  router.patch("/customers/:id", async (req, res) => {
    z.uuid().parse(req.params.id);
    const { expected_version, ...data } = parsePatch(
      customerSchema.extend({ expected_version: expected }),
      req.body,
    );
    if (!Object.keys(data).length) fail(400, "No changes supplied.");
    const result = await db.transaction(async (tx) => {
      const old = await tx.lock("clients", { id: req.params.id });
      if (!old) fail(404, "Customer not found.");
      checkVersion(old, expected_version);
      const result = await tx.update(
        "clients",
        { id: old.id },
        { $set: { ...data, updated_at: new Date() }, $inc: { version: 1 } },
      );
      await recordEvent(
        tx,
        "customers",
        old.id,
        req.user,
        "updated",
        "Customer details updated",
        differences(old, data),
      );
      return result;
    });
    res.json(result);
  });
  router.post("/projects", async (req, res) => {
    const data = projectSchema.parse(req.body);
    const result = await db.transaction(async (tx) => {
      if (!(await tx.findOne("clients", { id: data.client_id })))
        fail(404, "Customer not found.");
      const project = await tx.insert("projects", {
        id: id(),
        ...data,
        progress: data.status === "Completed" ? 100 : data.progress,
      });
      await recordEvent(
        tx,
        "projects",
        project.id,
        req.user,
        "created",
        "Project created",
      );
      await audit(
        tx,
        "crm",
        project.id,
        req.user.id,
        "Started project · " + data.name,
      );
      return project;
    });
    res.status(201).json(result);
  });
  router.patch("/projects/:id", async (req, res) => {
    z.uuid().parse(req.params.id);
    const { expected_version, ...data } = parsePatch(
      projectSchema
        .omit({ client_id: true })
        .extend({ expected_version: expected }),
      req.body,
    );
    if (!Object.keys(data).length) fail(400, "No changes supplied.");
    if (data.status === "Completed") data.progress = 100;
    const result = await db.transaction(async (tx) => {
      const old = await tx.lock("projects", { id: req.params.id });
      if (!old) fail(404, "Project not found.");
      checkVersion(old, expected_version);
      const result = await tx.update(
        "projects",
        { id: old.id },
        { $set: { ...data, updated_at: new Date() }, $inc: { version: 1 } },
      );
      await recordEvent(
        tx,
        "projects",
        old.id,
        req.user,
        "updated",
        "Project updated",
        differences(old, data),
      );
      return result;
    });
    res.json(result);
  });
  async function taskData(tx, input, old = {}) {
    const data = { ...input };
    if (data.done !== undefined) {
      if (data.status && (data.status === "Completed") !== data.done)
        fail(400, "Task status and completion must agree.");
      if (!data.status) data.status = data.done ? "Completed" : "To do";
    }
    if (data.status) data.done = data.status === "Completed";
    if (data.owner_id) {
      const owner = await tx.findOne(
        "users",
        { id: data.owner_id, role: { $in: crmRoles }, disabled: { $ne: true } },
        { projection: { id: 1, name: 1 } },
      );
      if (!owner) fail(400, "Choose an active CRM teammate as the owner.");
      data.owner = owner.name;
    } else if (data.owner_id === null) data.owner = "";
    const assigned =
      data.assigned_date ||
      old.assigned_date ||
      new Date().toISOString().slice(0, 10);
    const deadline = data.due_date === undefined ? old.due_date : data.due_date;
    if (
      (data.due_date !== undefined || data.assigned_date !== undefined) &&
      deadline &&
      deadline < assigned
    )
      fail(400, "The deadline cannot be before the assigned date.");
    return data;
  }
  router.post("/tasks", async (req, res) => {
    const input = taskSchema.parse(req.body);
    const result = await db.transaction(async (tx) => {
      const data = await taskData(tx, input);
      const task = await tx.insert("tasks", {
        id: id(),
        ...data,
        created_by: req.user.id,
      });
      await recordEvent(
        tx,
        "tasks",
        task.id,
        req.user,
        "created",
        "Task created",
      );
      if (task.owner_id)
        await notify(
          tx,
          task.owner_id,
          req.user,
          "assignment",
          "tasks",
          task.id,
          `${req.user.name} assigned you: ${task.title}`,
        );
      return task;
    });
    res.status(201).json(result);
  });
  router.patch("/tasks/:id", async (req, res) => {
    z.uuid().parse(req.params.id);
    const { expected_version, ...input } = parsePatch(
      taskSchema.extend({ expected_version: expected }),
      req.body,
    );
    if (!Object.keys(input).length) fail(400, "No changes supplied.");
    const result = await db.transaction(async (tx) => {
      const old = await tx.lock("tasks", { id: req.params.id });
      if (!old) fail(404, "Task not found.");
      if (!canEditTask(req.user, old))
        fail(
          403,
          "Only the task owner, creator or an administrator can edit this task.",
        );
      checkVersion(old, expected_version);
      const data = await taskData(tx, input, old),
        changes = differences(old, data);
      const result = await tx.update(
        "tasks",
        { id: old.id },
        { $set: { ...data, updated_at: new Date() }, $inc: { version: 1 } },
      );
      const summary = changes.some((c) => c.field === "status")
        ? "Task status changed"
        : changes.some((c) => c.field === "due_date")
          ? "Task deadline changed"
          : "Task updated";
      if (changes.length)
        await recordEvent(
          tx,
          "tasks",
          old.id,
          req.user,
          "updated",
          summary,
          changes,
        );
      if (data.owner_id && data.owner_id !== old.owner_id)
        await notify(
          tx,
          data.owner_id,
          req.user,
          "assignment",
          "tasks",
          old.id,
          `${req.user.name} assigned you: ${result.title}`,
        );
      return result;
    });
    res.json(result);
  });
  return router;
}
