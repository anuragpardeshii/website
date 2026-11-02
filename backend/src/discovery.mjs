import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { allow, digest } from "./auth.mjs";
import { id, audit } from "./db.mjs";
import { fail } from "./validation.mjs";
import { recordEvent } from "./record-events.mjs";
import { paging, pageOf } from "./pagination.mjs";

const field = z.string().trim().max(3000).default("");
const answersSchema = z.object({
  objectives: field,
  audience: field,
  current_process: field,
  scope: field,
  integrations: field,
  timeline: field,
  budget: field,
  success_metrics: field,
  stakeholders: field,
});
const draftSchema = z.object({
  revision: z.number().int().min(0),
  answers: answersSchema,
  internal_notes: z.string().trim().max(6000).default(""),
});
const tokenSchema = z.object({ token: z.string().regex(/^[a-f0-9]{64}$/) });
const linkProjection = {
  id: 1,
  created_at: 1,
  expires_at: 1,
  revoked_at: 1,
  submitted_at: 1,
  submission: 1,
  revision: 1,
};
const emptyDraft = () => ({
  revision: 0,
  answers: answersSchema.parse({}),
  internal_notes: "",
});
async function validLink(tx, token, lock = false) {
  const query = {
    token_hash: digest(token),
    revoked_at: null,
    expires_at: { $gt: new Date() },
  };
  const link = await (lock
    ? tx.lock("discovery_links", query)
    : tx.findOne("discovery_links", query));
  if (!link)
    fail(
      404,
      "This invitation has expired or is no longer available. Please contact your Sleektech representative.",
    );
  return link;
}
export function publicLeadRoutes(db) {
  const router = Router();
  router.use(
    rateLimit({
      windowMs: 15 * 60000,
      limit: 12,
      standardHeaders: "draft-8",
      legacyHeaders: false,
      message: { error: "Please wait a few minutes before submitting again." },
    }),
  );
  router.post("/", async (req, res) => {
    const data = z
      .object({
        registration_id: z.uuid(),
        name: z.string().trim().min(2).max(100),
        email: z
          .email()
          .max(254)
          .transform((v) => v.trim().toLowerCase()),
        company: z.string().trim().max(160).default(""),
        phone: z
          .string()
          .trim()
          .max(30)
          .refine(
            (v) => !v || /^[+0-9\s().-]+$/.test(v),
            "Enter a valid phone number.",
          )
          .default("")
          .transform((v) => v.replace(/[^+0-9]/g, ""))
          .refine(
            (v) => !v || /^\+?\d{7,15}$/.test(v),
            "Enter a valid phone number, including country code.",
          ),
        interest: z.string().trim().max(160).default(""),
        consent: z.literal(true),
        website: z.literal("").default(""),
      })
      .parse(req.body);
    try {
      await db.transaction(async (tx) => {
        const lead = await tx.insertOnce(
          "leads",
          { registration_id: data.registration_id },
          {
            id: id(),
            registration_id: data.registration_id,
            name: data.name,
            email: data.email,
            company: data.company || "Independent project",
            phone: data.phone,
            source: "Website",
            interest: data.interest,
            consent_at: new Date(),
            consent_version: "contact-v1",
            next_action: "Arrange a discovery conversation",
            notes: data.interest ? `Interested in: ${data.interest}` : "",
          },
        );
        if (!lead) return;
        await audit(
          tx,
          "crm",
          lead.id,
          null,
          "Website registration · " + lead.company,
        );
        const task = await tx.insert("tasks", {
          id: id(),
          lead_id: lead.id,
          title: "Discovery conversation · " + lead.company,
        });
        const actor = { id: null, name: "Website registration" };
        await recordEvent(
          tx,
          "leads",
          lead.id,
          actor,
          "created",
          "Lead created from website registration",
        );
        await recordEvent(
          tx,
          "tasks",
          task.id,
          actor,
          "created",
          "Task created from website registration",
        );
      });
    } catch (error) {
      if (
        error.code !== 11000 ||
        !(await db.findOne("leads", { registration_id: data.registration_id }))
      )
        throw error;
    }
    // Do not disclose whether an email or company already exists in the CRM.
    res.status(201).json({ ok: true });
  });
  return router;
}
export function staffDiscoveryRoutes(db) {
  const router = Router();
  router.use(allow("admin", "sales"));
  router.get("/leads/:id/discovery", async (req, res) => {
    const lead = await db.findOne("leads", { id: req.params.id });
    if (!lead) fail(404, "Lead not found.");
    const links = await pageOf(
      db,
      "discovery_links",
      { lead_id: lead.id },
      paging(req.query),
      { projection: linkProjection },
    );
    res.json({
      draft: lead.discovery || emptyDraft(),
      invitations: links.items,
      pagination: links.pagination,
    });
  });
  router.patch("/leads/:id/discovery", async (req, res) => {
    const data = draftSchema.parse(req.body);
    const draft = await db.transaction(async (tx) => {
      const lead = await tx.lock("leads", { id: req.params.id });
      if (!lead) fail(404, "Lead not found.");
      if ((lead.discovery?.revision || 0) !== data.revision)
        fail(
          409,
          "Another team member updated this brief. Reopen it to load their changes.",
        );
      const saved = {
        ...data,
        revision: data.revision + 1,
        updated_at: new Date(),
        updated_by: req.user.id,
        updated_by_name: req.user.name,
      };
      await tx.update(
        "leads",
        { id: lead.id },
        { $set: { discovery: saved, updated_at: new Date() } },
      );
      await audit(
        tx,
        "crm",
        lead.id,
        req.user.id,
        "Saved discovery brief · " + lead.company,
      );
      await recordEvent(
        tx,
        "briefs",
        lead.id,
        req.user,
        "updated",
        "Client brief updated",
        [{ field: "revision", before: data.revision, after: saved.revision }],
      );
      return saved;
    });
    res.json({ draft });
  });
  router.post("/leads/:id/discovery/share", async (req, res) => {
    const { revision } = z
      .object({ revision: z.number().int().min(1) })
      .parse(req.body);
    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 7 * 86400000);
    const invitation = await db.transaction(async (tx) => {
      const lead = await tx.lock("leads", { id: req.params.id });
      if (!lead) fail(404, "Lead not found.");
      if (lead.discovery?.revision !== revision)
        fail(409, "The brief changed. Save the latest version before sharing.");
      const existing = await tx.find("discovery_links", {
        lead_id: lead.id,
        revoked_at: null,
        submitted_at: null,
      });
      for (const old of existing)
        await tx.update(
          "discovery_links",
          { id: old.id },
          { $set: { revoked_at: new Date() } },
        );
      const link = await tx.insert("discovery_links", {
        id: id(),
        lead_id: lead.id,
        token_hash: digest(token),
        company: lead.company,
        answers: lead.discovery.answers,
        revision,
        expires_at: expires,
        revoked_at: null,
        submitted_at: null,
      });
      await audit(
        tx,
        "crm",
        lead.id,
        req.user.id,
        "Prepared discovery invitation · " + lead.company,
      );
      return link;
    });
    const origin = process.env.MARKETING_ORIGIN || "http://localhost:5173";
    res.status(201).json({
      id: invitation.id,
      expires_at: expires,
      url: `${origin.replace(/\/$/, "")}/discovery#token=${token}`,
    });
  });
  router.post("/leads/:id/discovery/revoke", async (req, res) => {
    const { invitation_id } = z
      .object({ invitation_id: z.uuid() })
      .parse(req.body);
    const link = await db.update(
      "discovery_links",
      { id: invitation_id, lead_id: req.params.id },
      { $set: { revoked_at: new Date() } },
    );
    if (!link) fail(404, "Invitation not found.");
    await audit(
      db,
      "crm",
      req.params.id,
      req.user.id,
      "Revoked discovery invitation",
    );
    res.json({ ok: true });
  });
  return router;
}
export function publicDiscoveryRoutes(db) {
  const router = Router();
  router.use(
    rateLimit({
      windowMs: 15 * 60000,
      limit: 60,
      standardHeaders: "draft-8",
      legacyHeaders: false,
      message: { error: "Too many requests. Please try again later." },
    }),
  );
  router.post("/read", async (req, res) => {
    const { token } = tokenSchema.parse(req.body);
    const link = await validLink(db, token);
    res.json({
      company: link.company,
      answers: link.submission?.answers || link.answers,
      submitted: !!link.submitted_at,
      expires_at: link.expires_at,
    });
  });
  router.post("/submit", async (req, res) => {
    const data = tokenSchema
      .extend({
        answers: answersSchema.extend({
          objectives: z.string().trim().min(10).max(3000),
          scope: z.string().trim().min(10).max(3000),
        }),
        name: z.string().trim().min(2).max(100),
        consent: z.literal(true),
      })
      .parse(req.body);
    await db.transaction(async (tx) => {
      const link = await validLink(tx, data.token, true);
      if (link.submitted_at)
        fail(
          409,
          "This questionnaire has already been submitted. Contact your representative for further changes.",
        );
      const submission = {
        answers: data.answers,
        name: data.name,
        consent_at: new Date(),
      };
      await tx.update(
        "discovery_links",
        { id: link.id },
        { $set: { submission, submitted_at: new Date() } },
      );
      await tx.update(
        "leads",
        { id: link.lead_id },
        {
          $set: {
            next_action: "Review client discovery response",
            updated_at: new Date(),
          },
        },
      );
      await audit(
        tx,
        "crm",
        link.lead_id,
        null,
        "Client submitted discovery questionnaire · " + link.company,
      );
    });
    res.json({ ok: true });
  });
  return router;
}
