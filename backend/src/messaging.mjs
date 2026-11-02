import { Router } from "express";
import express from "express";
import { createHmac, timingSafeEqual } from "node:crypto";
import { Webhook } from "svix";
import { z } from "zod";
import { rateLimit } from "express-rate-limit";
import { allow } from "./auth.mjs";
import { id, audit, lookup } from "./db.mjs";
import { messageSchema, fail } from "./validation.mjs";
import { aiReady, draftEmail } from "./ai.mjs";
import { paging, pageOf, searchFilter } from "./pagination.mjs";
import { recordEvent } from "./record-events.mjs";

export function integrations(demo = false) {
  return {
    demo,
    ai: aiReady(),
    email: !!(process.env.RESEND_API_KEY && process.env.EMAIL_FROM),
    emailTracking: !!process.env.RESEND_WEBHOOK_SECRET,
    whatsapp: !!(
      process.env.WHATSAPP_TOKEN &&
      process.env.WHATSAPP_PHONE_ID &&
      process.env.WHATSAPP_GRAPH_VERSION
    ),
    whatsappTracking: !!(
      process.env.WHATSAPP_APP_SECRET && process.env.WHATSAPP_VERIFY_TOKEN
    ),
  };
}
export function messagingRoutes(db, demo) {
  const router = Router();
  router.use(allow("admin", "sales"));
  router.get("/config", (req, res) =>
    res.json({ integrations: integrations(demo) }),
  );
  router.get("/", async (req, res) => {
    const page = paging(req.query),
      filter = searchFilter(page.q, ["subject"]);
    if (req.query.lead) filter.lead_id = z.uuid().parse(req.query.lead);
    if (req.query.channel)
      filter.channel = z.enum(["email", "whatsapp"]).parse(req.query.channel);
    const result = await pageOf(db, "messages", filter, page);
    const leads = result.items.length
      ? await db.find(
          "leads",
          { id: { $in: result.items.map((message) => message.lead_id) } },
          { projection: { id: 1, name: 1, email: 1, company: 1 } },
        )
      : [];
    result.items = result.items.map((message) => {
      const lead = leads.find((lead) => lead.id === message.lead_id);
      return {
        ...message,
        name: lead?.name,
        company: lead?.company,
        email: lead?.email,
      };
    });
    res.json({
      ...result,
      messages: result.items,
      integrations: integrations(demo),
    });
  });
  router.get("/:id", async (req, res) => {
    z.uuid().parse(req.params.id);
    const [message] = await db.aggregate("messages", [
      { $match: { id: req.params.id } },
      ...lookup("leads", "lead_id", {
        name: "name",
        company: "company",
        email: "email",
      }),
    ]);
    if (!message) fail(404, "Message not found.");
    const events = await pageOf(
      db,
      "message_events",
      { message_id: message.id },
      paging(req.query),
    );
    res.json({
      message,
      events: events.items,
      event_pagination: events.pagination,
      integrations: integrations(demo),
    });
  });
  router.post("/draft", async (req, res) => {
    const data = messageSchema.strict().parse(req.body);
    const result = await db.transaction(async (tx) => {
      if (
        !(await tx.findOne(
          "leads",
          { id: data.lead_id },
          { projection: { id: 1 } },
        ))
      )
        fail(404, "Contact not found.");
      const message = await tx.insert("messages", { id: id(), ...data });
      await recordEvent(
        tx,
        "messages",
        message.id,
        req.user,
        "created",
        "Message draft created",
      );
      return message;
    });
    res.status(201).json(result);
  });
  router.patch("/:id", async (req, res) => {
    z.uuid().parse(req.params.id);
    const { expected_version, ...changes } = messageSchema
      .omit({ lead_id: true, channel: true })
      .extend({ expected_version: z.number().int().positive().optional() })
      .strict()
      .parse(req.body);
    const result = await db.transaction(async (tx) => {
      const old = await tx.lock("messages", { id: req.params.id });
      if (!old) fail(404, "Message not found.");
      if (old.status !== "Draft")
        fail(409, "Only unsent drafts can be edited.");
      if (
        expected_version !== undefined &&
        (old.version || 1) !== expected_version
      )
        fail(
          409,
          "Another teammate updated this draft. Reload it before editing.",
        );
      const message = await tx.update(
        "messages",
        { id: old.id },
        { $set: { ...changes, updated_at: new Date() }, $inc: { version: 1 } },
      );
      await recordEvent(
        tx,
        "messages",
        message.id,
        req.user,
        "updated",
        "Message draft updated",
      );
      return message;
    });
    res.json(result);
  });
  router.post(
    "/ai-draft",
    rateLimit({
      windowMs: 3600000,
      limit: 30,
      standardHeaders: "draft-8",
      legacyHeaders: false,
      message: { error: "AI drafting limit reached. Try again later." },
    }),
    async (req, res) => {
      const data = z
        .object({
          lead_id: z.uuid(),
          purpose: z.string().min(10).max(2500),
          tone: z
            .enum(["Professional", "Warm", "Concise"])
            .default("Professional"),
        })
        .parse(req.body);
      const lead = await db.findOne("leads", { id: data.lead_id });
      if (!lead) fail(404, "Contact not found.");
      res.json(await draftEmail(lead, data.purpose, data.tone));
    },
  );
  router.post("/:id/send", async (req, res) => {
    if (req.body.confirm !== true)
      fail(400, "Review and confirm the message before sending.");
    if (demo) fail(403, "Demo workspaces cannot send messages.");
    const message = await db.findOne("messages", { id: req.params.id });
    if (!message) fail(404, "Message not found.");
    if (!["Draft", "Failed"].includes(message.status))
      fail(
        409,
        "This message has already been submitted or is awaiting provider confirmation.",
      );
    const lead = await db.findOne("leads", { id: message.lead_id });
    const ready = integrations();
    if (message.channel === "email" && !ready.email)
      fail(503, "Connect a verified email sender before sending.");
    if (message.channel === "whatsapp") {
      if (!ready.whatsapp)
        fail(503, "Connect WhatsApp Business before sending.");
      if (!lead.whatsapp_consent)
        fail(400, "Record WhatsApp opt-in on this contact before sending.");
      if (!/^\+[1-9]\d{7,14}$/.test(lead.phone))
        fail(
          400,
          "Use an international phone number, for example +919876543210.",
        );
      if (
        !message.template &&
        (!lead.last_inbound_at ||
          Date.now() - new Date(lead.last_inbound_at) > 86400000)
      )
        fail(
          400,
          "The 24-hour reply window is closed. Use an approved WhatsApp template.",
        );
      if (message.template && !/^[a-z0-9_]+$/.test(message.template))
        fail(400, "Use the exact approved template name.");
    }
    if (
      !(await db.update(
        "messages",
        { id: message.id, status: { $in: ["Draft", "Failed"] } },
        { $set: { status: "Sending" } },
      ))
    )
      fail(409, "This message is already being sent.");
    let response;
    try {
      if (message.channel === "email")
        response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          signal: AbortSignal.timeout(15000),
          headers: {
            Authorization: "Bearer " + process.env.RESEND_API_KEY,
            "Content-Type": "application/json",
            "Idempotency-Key": message.id,
          },
          body: JSON.stringify({
            from: process.env.EMAIL_FROM,
            to: [lead.email],
            subject: message.subject || "A note from SleekTech",
            text: message.body,
            html:
              '<div style="white-space:pre-wrap;font-family:Arial,sans-serif">' +
              escapeHTML(message.body) +
              "</div>",
          }),
        });
      else
        response = await fetch(
          "https://graph.facebook.com/" +
            process.env.WHATSAPP_GRAPH_VERSION +
            "/" +
            process.env.WHATSAPP_PHONE_ID +
            "/messages",
          {
            method: "POST",
            signal: AbortSignal.timeout(15000),
            headers: {
              Authorization: "Bearer " + process.env.WHATSAPP_TOKEN,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messaging_product: "whatsapp",
              to: lead.phone.slice(1),
              ...(message.template
                ? {
                    type: "template",
                    template: {
                      name: message.template,
                      language: {
                        code: process.env.WHATSAPP_TEMPLATE_LANGUAGE || "en",
                      },
                    },
                  }
                : { type: "text", text: { body: message.body } }),
            }),
          },
        );
    } catch {
      await db.update(
        "messages",
        { id: message.id },
        { $set: { status: "Unconfirmed" } },
      );
      fail(
        502,
        "Provider confirmation was interrupted. Check the provider dashboard before attempting another send.",
      );
    }
    if (!response.ok) {
      await db.update(
        "messages",
        { id: message.id },
        { $set: { status: "Failed" } },
      );
      fail(
        502,
        "The provider declined this message. Check sender configuration, recipient and template approval.",
      );
    }
    const result = await response.json();
    const providerId = result.id || result.messages?.[0]?.id;
    if (!providerId) {
      await db.update(
        "messages",
        { id: message.id },
        { $set: { status: "Unconfirmed" } },
      );
      fail(
        502,
        "The provider did not return a message reference. Check its dashboard.",
      );
    }
    await db.transaction(async (tx) => {
      await tx.update(
        "messages",
        { id: message.id },
        { $set: { status: "Sent", provider_id: providerId } },
      );
      await tx.insert("message_events", {
        id: id(),
        message_id: message.id,
        event: "Sent",
      });
      await audit(
        tx,
        "crm",
        lead.id,
        req.user.id,
        "Sent " + message.channel + " to " + lead.company,
      );
    });
    res.json({ ok: true, status: "Sent" });
  });
  return router;
}
const escapeHTML = (s) =>
  s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
const order = {
  Draft: 0,
  Sending: 1,
  Sent: 2,
  Delivered: 3,
  Opened: 4,
  Clicked: 5,
  Failed: 6,
  Bounced: 7,
  Complained: 8,
};
async function event(tx, providerId, type) {
  const message = await tx.lock("messages", { provider_id: providerId });
  if (!message) return;
  await tx.insert("message_events", {
    id: id(),
    message_id: message.id,
    event: type,
  });
  if ((order[type] ?? 0) >= (order[message.status] ?? 0))
    await tx.update("messages", { id: message.id }, { $set: { status: type } });
}
export function webhookRoutes(db) {
  const router = Router();
  router.post(
    "/resend",
    express.raw({ type: "application/json", limit: "1mb" }),
    async (req, res) => {
      if (!process.env.RESEND_WEBHOOK_SECRET)
        fail(503, "Webhook not configured.");
      let payload;
      try {
        payload = new Webhook(process.env.RESEND_WEBHOOK_SECRET).verify(
          req.body.toString(),
          req.headers,
        );
      } catch {
        fail(401, "Invalid webhook signature.");
      }
      const type = {
        "email.sent": "Sent",
        "email.delivered": "Delivered",
        "email.opened": "Opened",
        "email.clicked": "Clicked",
        "email.bounced": "Bounced",
        "email.complained": "Complained",
        "email.failed": "Failed",
      }[payload.type];
      await db.transaction(async (tx) => {
        const receipt = await tx.insertOnce(
          "webhook_receipts",
          { id: "resend:" + req.headers["svix-id"] },
          { id: "resend:" + req.headers["svix-id"] },
        );
        if (receipt && type) await event(tx, payload.data.email_id, type);
      });
      res.json({ received: true });
    },
  );
  router.get("/whatsapp", (req, res) => {
    if (!process.env.WHATSAPP_VERIFY_TOKEN)
      fail(503, "Webhook not configured.");
    if (
      req.query["hub.mode"] !== "subscribe" ||
      req.query["hub.verify_token"] !== process.env.WHATSAPP_VERIFY_TOKEN
    )
      fail(403, "Invalid verification token.");
    res.type("text/plain").send(req.query["hub.challenge"]);
  });
  router.post(
    "/whatsapp",
    express.raw({ type: "application/json", limit: "1mb" }),
    async (req, res) => {
      if (!process.env.WHATSAPP_APP_SECRET)
        fail(503, "Webhook not configured.");
      const expected = Buffer.from(
        "sha256=" +
          createHmac("sha256", process.env.WHATSAPP_APP_SECRET)
            .update(req.body)
            .digest("hex"),
      );
      const signature = Buffer.from(req.get("x-hub-signature-256") || "");
      if (
        expected.length !== signature.length ||
        !timingSafeEqual(expected, signature)
      )
        fail(401, "Invalid webhook signature.");
      let payload;
      try {
        payload = JSON.parse(req.body);
      } catch {
        fail(400, "Invalid payload.");
      }
      for (const entry of payload.entry || [])
        for (const change of entry.changes || []) {
          const value = change.value || {};
          // Do not associate events from other WhatsApp phone numbers with this workspace.
          if (value.metadata?.phone_number_id !== process.env.WHATSAPP_PHONE_ID)
            continue;
          for (const status of value.statuses || [])
            await db.transaction(async (tx) => {
              const receipt = await tx.insertOnce(
                "webhook_receipts",
                {
                  id:
                    "wa:" +
                    status.id +
                    ":" +
                    status.status +
                    ":" +
                    status.timestamp,
                },
                {
                  id:
                    "wa:" +
                    status.id +
                    ":" +
                    status.status +
                    ":" +
                    status.timestamp,
                },
              );
              const type = {
                sent: "Sent",
                delivered: "Delivered",
                read: "Opened",
                failed: "Failed",
              }[status.status];
              if (receipt && type) await event(tx, status.id, type);
            });
          for (const message of value.messages || [])
            await db.transaction(async (tx) => {
              const receipt = await tx.insertOnce(
                "webhook_receipts",
                { id: "wa:" + message.id },
                { id: "wa:" + message.id },
              );
              if (!receipt) return;
              const lead = await tx.findOne(
                "leads",
                { phone: "+" + message.from },
                { sort: { created_at: 1 } },
              );
              if (!lead) return;
              const timestamp = Number(message.timestamp) * 1000;
              if (
                !Number.isFinite(timestamp) ||
                timestamp > Date.now() + 300000
              )
                return;
              await tx.update(
                "leads",
                { id: lead.id },
                { $max: { last_inbound_at: new Date(timestamp) } },
              );
              await tx.insertOnce(
                "messages",
                { provider_id: message.id },
                {
                  id: id(),
                  lead_id: lead.id,
                  channel: "whatsapp",
                  direction: "inbound",
                  body:
                    message.text?.body?.slice(0, 10000) ||
                    "[Received " + message.type + " message]",
                  status: "Received",
                  provider_id: message.id,
                },
              );
            });
        }
      res.json({ received: true });
    },
  );
  return router;
}
