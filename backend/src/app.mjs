import express from "express";
import { allowedOrigins } from "./origins.mjs";
import { resolve } from "node:path";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { z, ZodError } from "zod";
import {
  authentication,
  hasPersonalStaff,
  allow,
  createUser,
  validPassword,
  signIn,
  publicUser,
  sessionToken,
  digest,
  dummyPasswordHash,
  hashPassword,
} from "./auth.mjs";
import { crmRoutes } from "./crm.mjs";
import {
  publicLeadRoutes,
  publicDiscoveryRoutes,
  staffDiscoveryRoutes,
} from "./discovery.mjs";
import { candidateRoutes, talentRoutes, publicJobs } from "./talent.mjs";
import { messagingRoutes, webhookRoutes, integrations } from "./messaging.mjs";
import { fail, passwordSchema } from "./validation.mjs";
import { collaborationRoutes } from "./collaboration.mjs";
import { userAdminRoutes, passwordResetRoutes } from "./users.mjs";

export function createApp(db, { demo = false, directory } = {}) {
  if (process.env.NODE_ENV === "production" && demo)
    throw new Error("Demo access is forbidden in production.");
  // Demo entry is only available before any personal staff account is provisioned.
  const demoAccess = async () => demo && !(await hasPersonalStaff(db));
  const app = express();
  app.disable("x-powered-by");
  app.use(helmet());
  const origins = allowedOrigins();
  app.use((req, res, next) => {
    const origin = req.get("origin");
    if (origin && origins.has(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Vary", "Origin");
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type,X-Sleektech-Request",
      );
      res.setHeader(
        "Access-Control-Allow-Methods",
        "GET,POST,PATCH,DELETE,OPTIONS",
      );
    }
    if (req.method === "OPTIONS")
      return res.sendStatus(origin && origins.has(origin) ? 204 : 403);
    next();
  });
  app.get("/api/health", (req, res) =>
    res.json({ ok: true, service: "sleektech-api" }),
  );
  app.use("/api/webhooks", webhookRoutes(db));
  app.use(express.json({ limit: "100kb" }));
  app.use(
    "/api",
    rateLimit({
      windowMs: 60000,
      limit: 300,
      standardHeaders: "draft-8",
      legacyHeaders: false,
      message: { error: "Too many requests. Please try again shortly." },
    }),
  );
  app.use((req, res, next) => {
    if (
      !["GET", "HEAD", "OPTIONS"].includes(req.method) &&
      (!origins.has(req.get("origin")) ||
        req.get("x-sleektech-request") !== "1")
    )
      return res.status(403).json({
        error: "This request did not come from an approved application.",
      });
    res.setHeader("Cache-Control", "no-store");
    next();
  });
  app.use(authentication(db));
  app.get("/api/meta", async (req, res) =>
    res.json({
      demo: await demoAccess(),
      ai: integrations(demo).ai,
      registration:
        process.env.NODE_ENV !== "production" ||
        process.env.ENABLE_CANDIDATE_REGISTRATION === "true",
    }),
  );
  app.get("/api/auth/me", async (req, res) =>
    res.json({
      user: req.user ? publicUser(req.user) : null,
      demo: await demoAccess(),
    }),
  );
  const authLimit = rateLimit({
    windowMs: 15 * 60000,
    limit: 30,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
      error: "Too many sign-in attempts. Please try again in 15 minutes.",
    },
  });
  const credentials = z.object({
    email: z
      .email()
      .max(254)
      .transform((v) => v.toLowerCase().trim()),
    password: z.string().min(1).max(128),
  });
  app.post("/api/auth/register", authLimit, async (req, res) => {
    if (
      process.env.NODE_ENV === "production" &&
      process.env.ENABLE_CANDIDATE_REGISTRATION !== "true"
    )
      fail(503, "Candidate registration is not open yet.");
    const data = credentials
      .extend({
        name: z.string().trim().min(2).max(100),
        consent: z.literal(true),
        password: passwordSchema,
      })
      .parse(req.body);
    if (
      await db.findOne(
        "users",
        { email: data.email },
        { projection: { id: 1 } },
      )
    )
      fail(409, "An account already exists for this email. Please sign in.");
    if (data.password.toLowerCase() === data.email)
      fail(400, "Choose a password different from your email address.");
    const user = await createUser(db, data);
    res.status(201).json({ user: await signIn(db, res, user) });
  });
  const accountLimit = rateLimit({
    windowMs: 15 * 60000,
    limit: 10,
    skipSuccessfulRequests: true,
    keyGenerator: (req) =>
      digest(
        String(req.body?.email || "")
          .toLowerCase()
          .trim()
          .slice(0, 254),
      ),
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "Too many sign-in attempts. Please try again later." },
  });
  app.post("/api/auth/login", authLimit, accountLimit, async (req, res) => {
    const { email, password } = credentials.parse(req.body);
    const user = await db.findOne("users", { email: email });
    if (
      !(await validPassword(
        password,
        user?.password_hash || dummyPasswordHash,
      )) ||
      user?.disabled
    )
      fail(401, "The email or password is incorrect.");
    await db.remove("sessions", { token_hash: digest(sessionToken(req)) });
    if (!user.password_hash.startsWith("scrypt:"))
      await db.update(
        "users",
        { id: user.id },
        { $set: { password_hash: await hashPassword(password) } },
      );
    res.json({ user: await signIn(db, res, user) });
  });
  app.post("/api/auth/logout", async (req, res) => {
    await db.remove("sessions", { token_hash: digest(sessionToken(req)) });
    res.clearCookie("sleektech_session", {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    res.json({ ok: true });
  });
  if (demo)
    app.post("/api/auth/demo", authLimit, async (req, res) => {
      if (!(await demoAccess()))
        fail(403, "Demo sign-in is disabled. Use your staff account.");
      if (
        !["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(
          req.socket.remoteAddress,
        )
      )
        fail(403, "Demo access is available only on this computer.");
      const user = await db.findOne("users", {
        email: "team@demo.sleektech.test",
      });
      if (!user) fail(503, "Demo data is unavailable.");
      res.json({ user: await signIn(db, res, user) });
    });
  app.use("/api/auth", passwordResetRoutes(db));
  app.use("/api/admin/users", userAdminRoutes(db));
  app.use("/api/collaboration", collaborationRoutes(db));
  app.use("/api/public/jobs", publicJobs(db, demo));
  app.use("/api/public/leads", publicLeadRoutes(db));
  app.use("/api/public/discovery", publicDiscoveryRoutes(db));
  app.use("/api/crm", staffDiscoveryRoutes(db));
  app.use("/api/crm", crmRoutes(db));
  app.use("/api/messages", messagingRoutes(db, demo));
  app.use("/api/candidate", candidateRoutes(db, { directory }));
  app.use("/api/talent", talentRoutes(db));
  app.get(
    "/api/resumes/:id",
    allow("admin", "recruiter", "candidate"),
    async (req, res) => {
      const file = await db.findOne("resumes", { id: req.params.id });
      if (
        !file ||
        (req.user.role === "candidate" && file.user_id !== req.user.id)
      )
        fail(404, "Résumé not found.");
      res.setHeader("Content-Type", file.mime);
      res.setHeader("X-Content-Type-Options", "nosniff");
      if (!/^resumes\/[0-9a-f-]+\.(pdf|docx)$/.test(file.storage_path))
        fail(404, "Résumé file is unavailable.");
      res.download(
        resolve(
          directory || process.env.DATA_DIR || ".data",
          file.storage_path,
        ),
        file.filename,
        { dotfiles: "allow" },
      );
    },
  );
  app.use((req, res) =>
    res.status(404).json({ error: "This endpoint does not exist." }),
  );
  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    if (error.type === "entity.parse.failed")
      return res.status(400).json({ error: "Invalid JSON request body." });
    if (error instanceof ZodError)
      return res.status(400).json({
        fields: Object.fromEntries(
          error.issues.map((i) => [i.path.join("."), i.message]),
        ),
        error: error.issues
          .map((i) => (i.path.join(".") || "Form") + ": " + i.message)
          .join("; "),
      });
    if (error.code === "LIMIT_FILE_SIZE")
      return res
        .status(413)
        .json({ error: "The résumé must be 5 MB or smaller." });
    if (String(error.code || "").startsWith("LIMIT_"))
      return res
        .status(400)
        .json({ error: "Upload one résumé file at a time." });
    if (error.code === 11000)
      return res.status(409).json({ error: "This record already exists." });
    const status = error.status || 500;
    if (status >= 500)
      console.error(
        "API request failed:",
        req.method,
        req.path,
        "status",
        status,
      );
    res.status(status).json({
      error:
        status === 500
          ? "An unexpected error occurred. Please try again."
          : error.message,
    });
  });
  return app;
}
