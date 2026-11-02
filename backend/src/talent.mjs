import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import { rateLimit } from "express-rate-limit";
import { allow } from "./auth.mjs";
import { id, audit, lookup } from "./db.mjs";
import { jobSchema, profileSchema, parsePatch, fail } from "./validation.mjs";
import { saveResume } from "./resumes.mjs";

export const transitions = {
  Applied: ["Screening", "Rejected"],
  Screening: ["Interview", "Rejected"],
  Interview: ["Screening", "Offer", "Rejected"],
  Offer: ["Interview", "Hired", "Rejected"],
  Hired: [],
  Rejected: [],
  Withdrawn: [],
};
export function publicJobs(db, demo) {
  const router = Router();
  router.get("/", async (req, res) =>
    res.json({
      jobs: await db.find(
        "jobs",
        { status: "Published" },
        {
          projection: {
            id: 1,
            slug: 1,
            title: 1,
            department: 1,
            location: 1,
            employment_type: 1,
            work_mode: 1,
            salary: 1,
            description: 1,
            requirements: 1,
            created_at: 1,
          },
          sort: { created_at: -1 },
        },
      ),
      demo,
    }),
  );
  router.get("/:slug", async (req, res) => {
    const job = await db.findOne(
      "jobs",
      { slug: req.params.slug, status: "Published" },
      {
        projection: {
          id: 1,
          slug: 1,
          title: 1,
          department: 1,
          location: 1,
          employment_type: 1,
          work_mode: 1,
          salary: 1,
          description: 1,
          requirements: 1,
          created_at: 1,
        },
      },
    );
    if (!job) fail(404, "This role is no longer accepting applications.");
    res.json({ job, demo });
  });
  return router;
}
export function candidateRoutes(db, { directory } = {}) {
  const router = Router();
  router.use(allow("candidate"));
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 2 },
  });
  router.patch("/profile", async (req, res) => {
    const profile = profileSchema.parse(req.body);
    if (profile.email.toLowerCase() !== req.user.email)
      fail(400, "Use your account email address.");
    await db.update(
      "users",
      { id: req.user.id },
      { $set: { name: profile.name, profile: profile } },
    );
    res.json(profile);
  });
  router.post(
    "/resume",
    rateLimit({
      windowMs: 3600000,
      limit: 20,
      standardHeaders: "draft-8",
      legacyHeaders: false,
      message: { error: "Upload limit reached. Please try again later." },
    }),
    upload.single("resume"),
    async (req, res) => {
      if (req.body.consent !== "true")
        fail(400, "Please consent to résumé processing.");
      res
        .status(201)
        .json(
          await saveResume(
            db,
            req.user,
            req.file,
            req.body.use_ai === "true",
            directory,
          ),
        );
    },
  );
  router.get("/applications", async (req, res) => {
    const applications = await db.aggregate("applications", [
      { $match: { user_id: req.user.id } },
      ...lookup("jobs", "job_id", {
        title: "title",
        department: "department",
        location: "location",
        slug: "slug",
      }),
      { $sort: { created_at: -1 } },
    ]);
    for (const app of applications) {
      app.timeline = await db.find(
        "application_events",
        { application_id: app.id },
        { projection: { stage: 1, created_at: 1 }, sort: { created_at: 1 } },
      );
      app.interviews = await db.find(
        "interviews",
        { application_id: app.id },
        {
          projection: {
            id: 1,
            title: 1,
            starts_at: 1,
            duration: 1,
            location: 1,
          },
          sort: { starts_at: 1 },
        },
      );
    }
    res.json(applications);
  });
  router.post("/applications", async (req, res) => {
    const data = z
      .object({
        job_id: z.uuid(),
        resume_id: z.uuid().nullable().default(null),
        profile: profileSchema,
        cover_letter: z.string().max(6000).default(""),
        consent: z.literal(true),
      })
      .parse(req.body);
    if (data.profile.email.toLowerCase() !== req.user.email)
      fail(400, "Use your account email address.");
    const application = await db.transaction(async (tx) => {
      const job = await tx.lock(
        "jobs",
        { id: data.job_id, status: "Published" },
        { projection: { id: 1 } },
      );
      if (!job) fail(409, "This role is no longer accepting applications.");
      if (
        data.resume_id &&
        !(await tx.findOne(
          "resumes",
          { id: data.resume_id, user_id: req.user.id },
          { projection: { id: 1 } },
        ))
      )
        fail(403, "That résumé is not attached to your account.");
      if (
        await tx.findOne(
          "applications",
          { job_id: data.job_id, user_id: req.user.id },
          { projection: { id: 1 } },
        )
      )
        fail(409, "You already have an application for this role.");
      const result = await tx.insert("applications", {
        id: id(),
        job_id: data.job_id,
        user_id: req.user.id,
        resume_id: data.resume_id,
        profile: data.profile,
        cover_letter: data.cover_letter,
      });
      await tx.update(
        "users",
        { id: req.user.id },
        { $set: { name: data.profile.name, profile: data.profile } },
      );
      await tx.insert("application_events", {
        id: id(),
        application_id: result.id,
        stage: "Applied",
      });
      await audit(tx, "talent", result.id, req.user.id, "Application received");
      return result;
    });
    res.status(201).json(application);
  });
  router.post("/applications/:id/withdraw", async (req, res) => {
    const result = await db.transaction(async (tx) => {
      const app = await tx.lock("applications", {
        id: req.params.id,
        user_id: req.user.id,
      });
      if (!app) fail(404, "Application not found.");
      if (["Hired", "Rejected", "Withdrawn"].includes(app.stage))
        fail(409, "This application is already closed.");
      await tx.update(
        "applications",
        { id: app.id },
        { $set: { stage: "Withdrawn", updated_at: new Date() } },
      );
      await tx.insert("application_events", {
        id: id(),
        application_id: app.id,
        stage: "Withdrawn",
      });
      await audit(
        tx,
        "talent",
        app.id,
        req.user.id,
        "Candidate withdrew application",
      );
      return { ok: true };
    });
    res.json(result);
  });
  return router;
}
export function talentRoutes(db) {
  const router = Router();
  router.use(allow("admin", "recruiter"));
  router.get("/overview", async (req, res) =>
    res.json({
      jobs: await db.aggregate("jobs", [
        { $sort: { created_at: -1 } },
        {
          $lookup: {
            from: "applications",
            let: { jobId: "$id" },
            pipeline: [
              { $match: { $expr: { $eq: ["$job_id", "$$jobId"] } } },
              { $count: "total" },
            ],
            as: "_counts",
          },
        },
        {
          $set: { applicants: { $ifNull: [{ $first: "$_counts.total" }, 0] } },
        },
        { $unset: "_counts" },
      ]),
      applications: await db.aggregate("applications", [
        ...lookup("jobs", "job_id", {
          title: "title",
          department: "department",
        }),
        ...lookup("users", "user_id", { name: "name", email: "email" }),
        { $sort: { updated_at: -1 } },
      ]),
      interviews: await db.aggregate("interviews", [
        { $sort: { starts_at: 1 } },
        ...lookup("applications", "application_id", {
          profile: "profile",
          job_id: "job_id",
        }),
        ...lookup("jobs", "job_id", { role: "title" }),
        { $unset: "job_id" },
      ]),
      activity: await db.aggregate("activity", [
        { $match: { domain: "talent" } },
        { $sort: { created_at: -1 } },
        { $limit: 20 },
        ...lookup("users", "actor_id", { actor: "name" }, true),
      ]),
      transitions,
    }),
  );
  router.get("/jobs/:id", async (req, res) => {
    const jobId = z.uuid().parse(req.params.id);
    const job = await db.findOne("jobs", { id: jobId });
    if (!job) fail(404, "Role not found.");
    const applicants = await db.count("applications", { job_id: jobId });
    res.json({ ...job, applicants });
  });
  router.post("/jobs", async (req, res) => {
    const data = jobSchema.parse(req.body);
    const jobId = id();
    const slug =
      data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") +
      "-" +
      jobId.slice(0, 8);
    const keys = Object.keys(data);
    const job = await db.insert("jobs", { id: jobId, slug, ...data });
    await audit(
      db,
      "talent",
      job.id,
      req.user.id,
      "Created role · " + job.title,
    );
    res.status(201).json(job);
  });
  router.patch("/jobs/:id", async (req, res) => {
    const data = parsePatch(jobSchema, req.body);
    const keys = Object.keys(data);
    if (!keys.length) fail(400, "No changes supplied.");
    const job = await db.update("jobs", { id: req.params.id }, { $set: data });
    if (!job) fail(404, "Role not found.");
    await audit(
      db,
      "talent",
      job.id,
      req.user.id,
      "Updated role · " + job.title,
    );
    res.json(job);
  });
  router.get("/applications/:id", async (req, res) => {
    z.uuid().parse(req.params.id);
    const app = await (
      await db.aggregate("applications", [
        { $match: { id: req.params.id } },
        ...lookup("jobs", "job_id", {
          title: "title",
          department: "department",
        }),
        ...lookup("users", "user_id", { name: "name", email: "email" }),
        ...lookup("resumes", "resume_id", { filename: "filename" }, true),
      ])
    )[0];
    if (!app) fail(404, "Application not found.");
    app.timeline = await db.find(
      "application_events",
      { application_id: app.id },
      { sort: { created_at: 1 } },
    );
    app.scorecards = await db.aggregate("scorecards", [
      { $match: { application_id: app.id } },
      { $sort: { created_at: -1 } },
      ...lookup("users", "reviewer_id", { reviewer: "name" }),
    ]);
    app.interviews = await db.find(
      "interviews",
      { application_id: app.id },
      { sort: { starts_at: 1 } },
    );
    res.json({ ...app, transitions });
  });
  router.patch("/applications/:id/stage", async (req, res) => {
    const { stage, note } = z
      .object({
        stage: z.enum(["Screening", "Interview", "Offer", "Hired", "Rejected"]),
        note: z.string().trim().min(5).max(2000),
      })
      .parse(req.body);
    await db.transaction(async (tx) => {
      const app = await tx.lock("applications", { id: req.params.id });
      if (!app) fail(404, "Application not found.");
      if (!transitions[app.stage].includes(stage))
        fail(
          409,
          "This stage transition is not available. Refresh the application.",
        );
      if (
        stage === "Offer" &&
        !(await tx.findOne(
          "scorecards",
          { application_id: app.id },
          { projection: { id: 1 } },
        ))
      )
        fail(409, "Record an interview scorecard before moving to Offer.");
      await tx.update(
        "applications",
        { id: app.id },
        { $set: { stage: stage, updated_at: new Date() } },
      );
      await tx.insert("application_events", {
        id: id(),
        application_id: app.id,
        stage: stage,
        note: note,
      });
      await audit(
        tx,
        "talent",
        app.id,
        req.user.id,
        "Moved application to " + stage,
      );
    });
    res.json({ ok: true });
  });
  router.post("/applications/:id/scorecards", async (req, res) => {
    const data = z
      .object({
        craft: z.number().int().min(1).max(5),
        communication: z.number().int().min(1).max(5),
        problem_solving: z.number().int().min(1).max(5),
        evidence: z.string().trim().min(20).max(6000),
        recommendation: z.enum(["Strong yes", "Yes", "Further review", "No"]),
      })
      .parse(req.body);
    if (
      !(await db.findOne(
        "applications",
        { id: req.params.id },
        { projection: { id: 1 } },
      ))
    )
      fail(404, "Application not found.");
    res.status(201).json(
      await db.insert("scorecards", {
        id: id(),
        application_id: req.params.id,
        reviewer_id: req.user.id,
        craft: data.craft,
        communication: data.communication,
        problem_solving: data.problem_solving,
        evidence: data.evidence,
        recommendation: data.recommendation,
      }),
    );
  });
  router.post("/applications/:id/interviews", async (req, res) => {
    const data = z
      .object({
        title: z.string().min(3).max(160),
        starts_at: z.iso.datetime({ offset: true }),
        duration: z.number().int().min(15).max(240),
        interviewer: z.string().min(2).max(160),
        location: z.string().max(500).default(""),
      })
      .parse(req.body);
    if (new Date(data.starts_at) <= new Date())
      fail(400, "Choose a future interview time.");
    const app = await db.findOne(
      "applications",
      { id: req.params.id },
      { projection: { stage: 1 } },
    );
    if (!app) fail(404, "Application not found.");
    if (["Hired", "Rejected", "Withdrawn"].includes(app.stage))
      fail(409, "This application is closed.");
    const interview = await db.insert("interviews", {
      id: id(),
      application_id: req.params.id,
      title: data.title,
      starts_at: new Date(data.starts_at),
      duration: data.duration,
      interviewer: data.interviewer,
      location: data.location,
    });
    await audit(
      db,
      "talent",
      req.params.id,
      req.user.id,
      "Scheduled " + data.title,
    );
    res.status(201).json(interview);
  });
  return router;
}
