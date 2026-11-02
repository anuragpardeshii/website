import { Router } from "express";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { rateLimit } from "express-rate-limit";
import { allow, validPassword, hashPassword, digest } from "./auth.mjs";
import { id, audit } from "./db.mjs";
import { fail, passwordSchema } from "./validation.mjs";
import { paging, pageOf, searchFilter, searchFields } from "./pagination.mjs";
const roles = z.enum([
  "super_admin",
  "admin",
  "sales",
  "recruiter",
  "candidate",
]);
const projection = {
  id: 1,
  name: 1,
  email: 1,
  role: 1,
  disabled: 1,
  created_at: 1,
  updated_at: 1,
  version: 1,
};
const reauth = z.string().min(1).max(128);
const sensitiveLimit = rateLimit({
  windowMs: 15 * 60000,
  limit: 12,
  keyGenerator: (req) => req.user.id,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many sensitive account requests. Try again later." },
});
export function userAdminRoutes(db) {
  const router = Router();
  router.use(allow("super_admin"));
  router.get("/", async (req, res) => {
    const filter = { ...searchFilter(paging(req.query).q, ["name", "email"]) };
    if (req.query.role) filter.role = roles.parse(req.query.role);
    res.json(
      await pageOf(db, "users", filter, paging(req.query), { projection }),
    );
  });
  router.get("/:id", async (req, res) => {
    z.uuid().parse(req.params.id);
    const user = await db.findOne(
      "users",
      { id: req.params.id },
      { projection },
    );
    if (!user) fail(404, "User not found.");
    res.json({ user });
  });
  async function verify(req, password) {
    const actor = await db.findOne("users", {
      id: req.user.id,
      role: "super_admin",
      disabled: { $ne: true },
    });
    if (!actor || !(await validPassword(password, actor.password_hash)))
      fail(403, "Confirm your current password to continue.");
  }
  router.patch("/:id", sensitiveLimit, async (req, res) => {
    z.uuid().parse(req.params.id);
    const data = z
      .object({
        name: z.string().trim().min(2).max(100),
        role: roles,
        disabled: z.boolean(),
        version: z.number().int().positive(),
        current_password: reauth,
      })
      .strict()
      .parse(req.body);
    await verify(req, data.current_password);
    const user = await db.transaction(async (tx) => {
      await tx.lock("security_locks", { id: "user-administration" });
      const actor = await tx.findOne("users", {
        id: req.user.id,
        role: "super_admin",
        disabled: { $ne: true },
      });
      if (!actor) fail(403, "Your account cannot administer users.");
      const old = await tx.lock("users", { id: req.params.id });
      if (!old) fail(404, "User not found.");
      if ((old.version || 1) !== data.version)
        fail(
          409,
          "This user was updated by another administrator. Reload before editing.",
        );
      if (
        old.id === req.user.id &&
        (data.role !== "super_admin" || data.disabled)
      )
        fail(409, "You cannot remove your own super admin access.");
      if (
        old.role === "super_admin" &&
        !old.disabled &&
        (data.role !== "super_admin" || data.disabled) &&
        (await tx.count("users", {
          role: "super_admin",
          disabled: { $ne: true },
        })) <= 1
      )
        fail(409, "Keep at least one active super admin.");
      const update = {
        name: data.name,
        role: data.role,
        disabled: data.disabled,
        version: (old.version || 1) + 1,
        updated_at: new Date(),
        ...searchFields({ name: data.name }),
      };
      const updated = await tx.update(
        "users",
        { id: old.id },
        { $set: update },
      );
      if (old.role !== data.role || !!old.disabled !== data.disabled) {
        await tx.remove("sessions", { user_id: old.id });
        await tx.remove("password_resets", { user_id: old.id });
      }
      await audit(
        tx,
        "security",
        old.id,
        req.user.id,
        `Updated user access: ${old.role} → ${data.role}; ${data.disabled ? "disabled" : "active"}`,
      );
      return Object.fromEntries(
        Object.keys(projection).map((key) => [key, updated[key]]),
      );
    });
    res.json({ user });
  });
  router.post("/:id/reset-link", sensitiveLimit, async (req, res) => {
    z.uuid().parse(req.params.id);
    const { current_password } = z
      .object({ current_password: reauth })
      .strict()
      .parse(req.body);
    await verify(req, current_password);
    const token = randomBytes(32).toString("hex"),
      expires_at = new Date(Date.now() + 30 * 60000);
    const user = await db.transaction(async (tx) => {
      await tx.lock("security_locks", { id: "user-administration" });
      const actor = await tx.findOne("users", {
        id: req.user.id,
        role: "super_admin",
        disabled: { $ne: true },
      });
      if (!actor) fail(403, "Your account cannot administer users.");
      const user = await tx.lock("users", {
        id: req.params.id,
        disabled: { $ne: true },
      });
      if (!user) fail(404, "Active user not found.");
      await tx.remove("password_resets", { user_id: user.id });
      await tx.insert("password_resets", {
        id: id(),
        user_id: user.id,
        token_hash: digest(token),
        expires_at,
        used_at: null,
        created_by: req.user.id,
      });
      await audit(
        tx,
        "security",
        user.id,
        req.user.id,
        "Created password reset link",
      );
      return user;
    });
    const base = ["candidate", "recruiter"].includes(user.role)
      ? process.env.TALENT_ORIGIN || "http://localhost:3002"
      : process.env.CRM_ORIGIN || "http://localhost:3001";
    res.json({
      url: base.replace(/\/$/, "") + "/reset-password#token=" + token,
      expires_at,
    });
  });
  return router;
}
export function passwordResetRoutes(db) {
  const router = Router();
  router.post(
    "/reset-password",
    rateLimit({
      windowMs: 15 * 60000,
      limit: 15,
      standardHeaders: "draft-8",
      legacyHeaders: false,
      message: { error: "Too many reset attempts. Please try again later." },
    }),
    async (req, res) => {
      const data = z
        .object({
          token: z.string().regex(/^[a-f0-9]{64}$/),
          password: passwordSchema,
        })
        .strict()
        .parse(req.body);
      const reset = await db.findOne("password_resets", {
        token_hash: digest(data.token),
        used_at: null,
        expires_at: { $gt: new Date() },
      });
      if (!reset)
        fail(
          400,
          "This reset link is invalid or has expired. Ask your administrator for a new link.",
        );
      const user = await db.findOne("users", {
        id: reset.user_id,
        disabled: { $ne: true },
      });
      if (!user) fail(400, "This reset link is invalid or has expired.");
      if (data.password.toLowerCase() === user.email.toLowerCase())
        fail(400, "Choose a password different from your email address.");
      const password_hash = await hashPassword(data.password);
      await db.transaction(async (tx) => {
        const locked = await tx.lock("users", {
          id: user.id,
          disabled: { $ne: true },
        });
        if (!locked) fail(400, "This reset link is invalid or has expired.");
        const consumed = await tx.update(
          "password_resets",
          { id: reset.id, used_at: null, expires_at: { $gt: new Date() } },
          { $set: { used_at: new Date() } },
        );
        if (!consumed) fail(400, "This reset link is invalid or has expired.");
        await tx.update(
          "users",
          { id: user.id },
          {
            $set: { password_hash, updated_at: new Date() },
            $inc: { version: 1 },
          },
        );
        await tx.remove("sessions", { user_id: user.id });
        await tx.remove("password_resets", { user_id: user.id });
        await audit(
          tx,
          "security",
          user.id,
          user.id,
          "Reset password and revoked all sessions",
        );
      });
      res.clearCookie("sleektech_session", {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
      res.json({ ok: true });
    },
  );
  return router;
}
