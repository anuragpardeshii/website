import { Router } from "express";
import { z } from "zod";
import { rateLimit } from "express-rate-limit";
import { allow } from "./auth.mjs";
import { id } from "./db.mjs";
import { fail } from "./validation.mjs";
import { paging, pageOf, searchFilter } from "./pagination.mjs";
import { records, crmRoles, recordEvent, notify } from "./record-events.mjs";
const targetSchema = z.object({
  type: z.enum(Object.keys(records)),
  id: z.uuid(),
});
const commentSchema = z
  .object({
    body: z.string().trim().min(1).max(5000),
    parent_id: z.uuid().nullable().default(null),
    mention_ids: z.array(z.uuid()).max(10).default([]),
    request_id: z.uuid(),
  })
  .strict();
export function collaborationRoutes(db) {
  const router = Router();
  router.use(allow("admin", "sales"));
  router.get("/people", async (req, res) => {
    const page = paging({ ...req.query, limit: 8 });
    if (page.q.length < 2) return res.json({ items: [] });
    const items = await db.find(
      "users",
      {
        role: { $in: crmRoles },
        disabled: { $ne: true },
        ...searchFilter(page.q, ["name", "email"]),
      },
      {
        projection: { id: 1, name: 1, email: 1, role: 1 },
        limit: 8,
        sort: { search_name: 1 },
        maxTimeMS: 1500,
      },
    );
    res.json({ items });
  });
  router.get("/notifications", async (req, res) => {
    const page = paging(req.query);
    const [result, unread] = await Promise.all([
      pageOf(db, "notifications", { recipient_id: req.user.id }, page),
      db.count("notifications", { recipient_id: req.user.id, read_at: null }),
    ]);
    res.json({ ...result, unread });
  });
  router.get("/notifications/count", async (req, res) =>
    res.json({
      unread: await db.count("notifications", {
        recipient_id: req.user.id,
        read_at: null,
      }),
    }),
  );
  router.patch("/notifications/:id", async (req, res) => {
    z.uuid().parse(req.params.id);
    z.object({ read: z.literal(true) })
      .strict()
      .parse(req.body);
    const result = await db.update(
      "notifications",
      { id: req.params.id, recipient_id: req.user.id },
      { $set: { read_at: new Date() } },
    );
    if (!result) fail(404, "Notification not found.");
    res.json({ ok: true });
  });
  async function target(req, repo = db) {
    const { type, id: recordId } = targetSchema.parse(req.params);
    const record = await repo.findOne(records[type], { id: recordId });
    if (!record) fail(404, "Record not found.");
    return { type, recordId, record };
  }
  router.get("/records/:type/:id/comments", async (req, res) => {
    const { type, recordId } = await target(req);
    const parent = req.query.parent ? z.uuid().parse(req.query.parent) : null;
    if (
      parent &&
      !(await db.findOne("comments", {
        id: parent,
        record_type: type,
        record_id: recordId,
        parent_id: null,
      }))
    )
      fail(404, "Comment not found.");
    res.json(
      await pageOf(
        db,
        "comments",
        { record_type: type, record_id: recordId, parent_id: parent },
        paging(req.query),
        { sort: { created_at: 1, id: 1 } },
      ),
    );
  });
  router.get(
    "/records/:type/:id/comments/:commentId/location",
    async (req, res) => {
      const { type, recordId } = await target(req);
      const commentId = z.uuid().parse(req.params.commentId);
      const scope = { record_type: type, record_id: recordId };
      const comment = await db.findOne("comments", { ...scope, id: commentId });
      if (!comment) fail(404, "This comment is no longer available.");
      const root = comment.parent_id
        ? await db.findOne("comments", {
            ...scope,
            id: comment.parent_id,
            parent_id: null,
          })
        : comment;
      if (!root) fail(404, "This conversation is no longer available.");
      const before = (item) => ({
        ...scope,
        parent_id: item.parent_id || null,
        $or: [
          { created_at: { $lt: item.created_at } },
          { created_at: item.created_at, id: { $lt: item.id } },
        ],
      });
      const [roots, replies] = await Promise.all([
        db.count("comments", before(root)),
        comment.parent_id ? db.count("comments", before(comment)) : 0,
      ]);
      res.json({
        comment_id: comment.id,
        parent_id: comment.parent_id,
        page: Math.floor(roots / 10) + 1,
        reply_page: Math.floor(replies / 10) + 1,
      });
    },
  );
  router.post(
    "/records/:type/:id/comments",
    rateLimit({
      windowMs: 60000,
      limit: 30,
      keyGenerator: (req) => req.user.id,
      standardHeaders: "draft-8",
      legacyHeaders: false,
      message: { error: "Please wait before posting another comment." },
    }),
    async (req, res) => {
      const data = commentSchema.parse(req.body);
      const result = await db.transaction(async (tx) => {
        const { type, recordId, record } = await target(req, tx);
        const existing = await tx.findOne("comments", {
          author_id: req.user.id,
          request_id: data.request_id,
        });
        if (existing) {
          if (
            existing.record_type !== type ||
            existing.record_id !== recordId ||
            existing.body !== data.body
          )
            fail(409, "This comment request has already been used.");
          return existing;
        }
        if (data.parent_id) {
          const parent = await tx.lock("comments", {
            id: data.parent_id,
            record_type: type,
            record_id: recordId,
            parent_id: null,
          });
          if (!parent)
            fail(404, "The comment you are replying to was not found.");
          await tx.update(
            "comments",
            { id: parent.id },
            { $inc: { reply_count: 1 } },
          );
        }
        const ids = [...new Set(data.mention_ids)];
        const people = ids.length
          ? await tx.find(
              "users",
              {
                id: { $in: ids },
                role: { $in: crmRoles },
                disabled: { $ne: true },
              },
              { projection: { id: 1, name: 1 } },
            )
          : [];
        if (
          people.length !== ids.length ||
          people.some((person) => !data.body.includes("@" + person.name))
        )
          fail(400, "Choose mentions from the teammate suggestions.");
        const comment = await tx.insert("comments", {
          id: id(),
          record_type: type,
          record_id: recordId,
          author_id: req.user.id,
          author_name: req.user.name,
          body: data.body,
          parent_id: data.parent_id,
          mentions: people,
          reply_count: 0,
          request_id: data.request_id,
        });
        await recordEvent(
          tx,
          type,
          recordId,
          req.user,
          data.parent_id ? "reply_added" : "comment_added",
          data.parent_id ? "Reply added" : "Comment added",
          [{ field: "comment_id", after: comment.id }],
        );
        for (const person of people)
          await notify(
            tx,
            person.id,
            req.user,
            "mention",
            type,
            recordId,
            `${req.user.name} mentioned you in ${record.title || record.company || record.name || record.subject || "a record"}`,
            comment.id,
          );
        return comment;
      });
      res.status(201).json(result);
    },
  );
  router.get("/records/:type/:id/timeline", async (req, res) => {
    const { type, recordId } = await target(req);
    res.json(
      await pageOf(
        db,
        "record_events",
        { record_type: type, record_id: recordId },
        paging(req.query),
      ),
    );
  });
  return router;
}
