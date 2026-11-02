import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHmac } from "node:crypto";
import { database, id } from "../src/db.mjs";
import { createApp } from "../src/app.mjs";
import { createUser } from "../src/auth.mjs";
import { Webhook } from "svix";

let db,
  server,
  base,
  directory,
  staff,
  candidate,
  second,
  lead,
  client,
  job,
  resume,
  application;
const originalEnv = { ...process.env };
const originalFetch = globalThis.fetch;
const password = "A-long-test-password-42";
async function request(
  path,
  {
    cookie,
    body,
    method = body ? "POST" : "GET",
    origin = "http://localhost:3001",
    headers = {},
  } = {},
) {
  const response = await originalFetch(base + "/api" + path, {
    method,
    headers: {
      Origin: origin,
      "X-Sleektech-Request": "1",
      ...(cookie ? { Cookie: cookie } : {}),
      ...(body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...headers,
    },
    body:
      body instanceof FormData
        ? body
        : body === undefined
          ? undefined
          : JSON.stringify(body),
  });
  const type = response.headers.get("content-type") || "";
  const data = type.includes("json")
    ? await response.json()
    : await response.text();
  return {
    status: response.status,
    data,
    cookie: response.headers.get("set-cookie")?.split(";")[0],
  };
}
function makePDF() {
  const text = [
    "Jordan Example",
    "jordan@example.test",
    "+91 98765 43210",
    "Skills",
    "React, TypeScript, Node.js",
  ];
  const stream =
    "BT /F1 12 Tf 50 750 Td " +
    text
      .map((line, i) => (i ? "0 -20 Td " : "") + "(" + line + ") Tj")
      .join("\n") +
    " ET";
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Length " +
      Buffer.byteLength(stream) +
      " >>\nstream\n" +
      stream +
      "\nendstream",
  ];
  let out = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((obj, i) => {
    offsets.push(Buffer.byteLength(out));
    out += i + 1 + " 0 obj\n" + obj + "\nendobj\n";
  });
  const offset = Buffer.byteLength(out);
  out +=
    "xref\n0 6\n0000000000 65535 f \n" +
    offsets
      .slice(1)
      .map((n) => String(n).padStart(10, "0") + " 00000 n \n")
      .join("") +
    "trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n" +
    offset +
    "\n%%EOF";
  return Buffer.from(out);
}
before(async () => {
  directory = await mkdtemp(join(tmpdir(), ".sleektech-test-"));
  db = await database({ name: "sleektech_test_" + id().replaceAll("-", "") });
  await createUser(db, {
    name: "Test Admin",
    email: "admin@example.test",
    password,
    role: "admin",
  });
  const app = createApp(db, { directory });
  server = app.listen(0, "127.0.0.1");
  await new Promise((r) => server.once("listening", r));
  base = "http://127.0.0.1:" + server.address().port;
});
after(async () => {
  globalThis.fetch = originalFetch;
  for (const key of Object.keys(process.env))
    if (!(key in originalEnv)) delete process.env[key];
  Object.assign(process.env, originalEnv);
  if (server) await new Promise((r) => server.close(r));
  if (db) {
    await db.native.dropDatabase();
    await db.close();
  }
  if (directory) await rm(directory, { recursive: true, force: true });
});

test("anonymous and cross-origin mutations are blocked", async () => {
  assert.equal((await request("/crm/overview")).status, 401);
  assert.equal(
    (
      await request("/auth/register", {
        origin: "https://untrusted.example",
        body: {},
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await request("/auth/login", {
        body: { email: "admin@example.test", password: "wrong-password" },
      })
    ).status,
    401,
  );
  const result = await request("/auth/login", {
    body: { email: "admin@example.test", password },
  });
  assert.equal(result.status, 200);
  staff = result.cookie;
  assert.ok(staff);
});
test("candidate registration cannot grant staff privileges", async () => {
  const result = await request("/auth/register", {
    body: {
      name: "Jordan Example",
      email: "jordan@example.test",
      password,
      role: "admin",
      consent: true,
    },
  });
  assert.equal(result.status, 201);
  assert.equal(result.data.user.role, "candidate");
  candidate = result.cookie;
  const other = await request("/auth/register", {
    body: {
      name: "Other Candidate",
      email: "other@example.test",
      password,
      consent: true,
    },
  });
  second = other.cookie;
  for (const path of ["/crm/overview", "/talent/overview", "/messages"])
    assert.equal((await request(path, { cookie: candidate })).status, 403);
  assert.equal(
    (
      await request("/auth/register", {
        body: { name: "No Consent", email: "none@example.test", password },
      })
    ).status,
    400,
  );
});
test("roles are enforced separately for sales and recruiting", async () => {
  await createUser(db, {
    name: "Sales User",
    email: "sales@example.test",
    password,
    role: "sales",
  });
  const sales = await request("/auth/login", {
    body: { email: "sales@example.test", password },
  });
  assert.equal(
    (await request("/talent/overview", { cookie: sales.cookie })).status,
    403,
  );
  assert.equal(
    (await request("/crm/overview", { cookie: sales.cookie })).status,
    200,
  );
  await createUser(db, {
    name: "Recruiter",
    email: "recruiter@example.test",
    password,
    role: "recruiter",
  });
  const recruiter = await request("/auth/login", {
    body: { email: "recruiter@example.test", password },
  });
  assert.equal(
    (await request("/crm/overview", { cookie: recruiter.cookie })).status,
    403,
  );
});
test("lead creation, updates and concurrent conversion preserve one customer", async () => {
  let result = await request("/crm/leads", {
    cookie: staff,
    body: {
      name: "Taylor Example",
      company: "Example Studio",
      email: "taylor@example.test",
      value: 450000,
      stage: "Qualified",
    },
  });
  assert.equal(result.status, 201);
  lead = result.data;
  result = await request("/crm/leads/" + lead.id, {
    cookie: staff,
    method: "PATCH",
    body: { stage: "Proposal", next_action: "Review scope" },
  });
  assert.equal(result.status, 200);
  const converted = await Promise.all(
    [1, 2].map(() =>
      request("/crm/leads/" + lead.id + "/convert", {
        cookie: staff,
        body: {},
      }),
    ),
  );
  assert.equal(converted[0].status, 200);
  assert.equal(converted[1].status, 200);
  assert.equal(converted[0].data.id, converted[1].data.id);
  client = converted[0].data;
  assert.equal(
    (await { total: await db.count("clients", { lead_id: lead.id }) }).total,
    1,
  );
  assert.equal(
    (
      await request("/crm/leads/" + lead.id, {
        cookie: staff,
        method: "PATCH",
        body: { stage: "New" },
      })
    ).status,
    409,
  );
});
test("projects and tasks persist with validated progress", async () => {
  const project = await request("/crm/projects", {
    cookie: staff,
    body: {
      client_id: client.id,
      name: "Customer platform",
      owner: "Delivery",
    },
  });
  assert.equal(project.status, 201);
  assert.equal(
    (
      await request("/crm/projects/" + project.data.id, {
        cookie: staff,
        method: "PATCH",
        body: { status: "In progress", progress: 130 },
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await request("/crm/projects/" + project.data.id, {
        cookie: staff,
        method: "PATCH",
        body: { status: "Completed", progress: 70 },
      })
    ).data.progress,
    100,
  );
  const task = await request("/crm/tasks", {
    cookie: staff,
    body: { title: "Review delivery scope" },
  });
  assert.equal(task.status, 201);
  assert.equal(
    (
      await request("/crm/tasks/" + task.data.id, {
        cookie: staff,
        method: "PATCH",
        body: { done: true },
      })
    ).data.done,
    true,
  );
});
test("draft roles stay private; publication is shared with the public API", async () => {
  const result = await request("/talent/jobs", {
    cookie: staff,
    body: {
      title: "Platform Engineer",
      department: "Engineering",
      location: "Remote",
      description:
        "Build dependable products with a thoughtful cross-functional engineering team.",
      requirements:
        "Experience with TypeScript, React, Node.js and PostgreSQL.",
      status: "Draft",
    },
  });
  assert.equal(result.status, 201);
  job = result.data;
  assert.equal((await request("/public/jobs")).data.jobs.length, 0);
  assert.equal((await request("/public/jobs/" + job.slug)).status, 404);
  assert.equal(
    (
      await request("/talent/jobs/" + job.id, {
        cookie: staff,
        method: "PATCH",
        body: { status: "Published" },
      })
    ).status,
    200,
  );
  assert.equal((await request("/public/jobs")).data.jobs.length, 1);
});
test("résumé upload validates type, consent, text extraction and ownership", async () => {
  const invalid = new FormData();
  invalid.set("resume", new Blob(["<script>bad</script>"]), "resume.pdf");
  invalid.set("consent", "true");
  assert.equal(
    (await request("/candidate/resume", { cookie: candidate, body: invalid }))
      .status,
    400,
  );
  const missingConsent = new FormData();
  missingConsent.set("resume", new Blob([makePDF()]), "resume.pdf");
  assert.equal(
    (
      await request("/candidate/resume", {
        cookie: candidate,
        body: missingConsent,
      })
    ).status,
    400,
  );
  const valid = new FormData();
  valid.set(
    "resume",
    new Blob([makePDF()], { type: "application/pdf" }),
    "resume.pdf",
  );
  valid.set("consent", "true");
  const result = await request("/candidate/resume", {
    cookie: candidate,
    body: valid,
  });
  assert.equal(result.status, 201, JSON.stringify(result.data));
  resume = result.data;
  assert.equal(resume.extracted.email, "jordan@example.test");
  assert.match(resume.extracted.name, /Jordan/);
  assert.equal(
    (await request("/resumes/" + resume.id, { cookie: second })).status,
    404,
  );
  assert.equal((await request("/resumes/" + resume.id)).status, 401);
  assert.equal(
    (await request("/resumes/" + resume.id, { cookie: staff })).status,
    200,
  );
});
test("applications require ownership, prevent duplicates and preserve a submission snapshot", async () => {
  const profile = {
    name: "Jordan Example",
    email: "jordan@example.test",
    skills: "React, TypeScript",
    experience: "5 years",
  };
  assert.equal(
    (
      await request("/candidate/applications", {
        cookie: second,
        body: {
          job_id: job.id,
          resume_id: resume.id,
          profile: { ...profile, email: "other@example.test" },
          consent: true,
        },
      })
    ).status,
    403,
  );
  const result = await request("/candidate/applications", {
    cookie: candidate,
    body: {
      job_id: job.id,
      resume_id: resume.id,
      profile,
      cover_letter: "I would like to build thoughtful software.",
      consent: true,
    },
  });
  assert.equal(result.status, 201);
  application = result.data;
  assert.equal(
    (
      await request("/candidate/applications", {
        cookie: candidate,
        body: { job_id: job.id, profile, consent: true },
      })
    ).status,
    409,
  );
  assert.equal(
    (await request("/candidate/applications", { cookie: second })).data.length,
    0,
  );
  await request("/candidate/profile", {
    cookie: candidate,
    method: "PATCH",
    body: { ...profile, skills: "Updated profile skills" },
  });
  const mine = await request("/candidate/applications", { cookie: candidate });
  assert.equal(mine.data[0].profile.skills, "React, TypeScript");
  assert.equal(mine.data[0].timeline[0].stage, "Applied");
  assert.equal(
    (
      await request("/candidate/profile", {
        cookie: candidate,
        method: "PATCH",
        body: { ...profile, email: "impersonated@example.test" },
      })
    ).status,
    400,
  );
});
test("selection follows defined stages and requires evidence before an offer", async () => {
  const path = "/talent/applications/" + application.id;
  assert.equal(
    (
      await request(path + "/stage", {
        cookie: staff,
        method: "PATCH",
        body: { stage: "Hired", note: "Skipping review" },
      })
    ).status,
    409,
  );
  for (const stage of ["Screening", "Interview"])
    assert.equal(
      (
        await request(path + "/stage", {
          cookie: staff,
          method: "PATCH",
          body: { stage, note: "Reviewed relevant experience." },
        })
      ).status,
      200,
    );
  assert.equal(
    (
      await request(path + "/stage", {
        cookie: staff,
        method: "PATCH",
        body: { stage: "Offer", note: "Move to offer" },
      })
    ).status,
    409,
  );
  assert.equal(
    (
      await request(path + "/scorecards", {
        cookie: staff,
        body: {
          craft: 4,
          communication: 4,
          problem_solving: 5,
          evidence:
            "Demonstrated a clear approach to modeling a transactional system.",
          recommendation: "Yes",
        },
      })
    ).status,
    201,
  );
  assert.equal(
    (
      await request(path + "/interviews", {
        cookie: staff,
        body: {
          title: "Technical conversation",
          starts_at: new Date(Date.now() + 86400000).toISOString(),
          duration: 45,
          interviewer: "Engineering team",
          location: "Video call",
        },
      })
    ).status,
    201,
  );
  assert.equal(
    (await request("/candidate/applications", { cookie: candidate })).data[0]
      .interviews.length,
    1,
  );
  assert.equal(
    (
      await request(path + "/stage", {
        cookie: staff,
        method: "PATCH",
        body: { stage: "Offer", note: "The panel reviewed the evidence." },
      })
    ).status,
    200,
  );
  assert.equal((await request(path, { cookie: candidate })).status, 403);
});
test("withdrawal is private and closes further selection transitions", async () => {
  assert.equal(
    (
      await request("/candidate/applications/" + application.id + "/withdraw", {
        cookie: second,
        body: {},
      })
    ).status,
    404,
  );
  assert.equal(
    (
      await request("/candidate/applications/" + application.id + "/withdraw", {
        cookie: candidate,
        body: {},
      })
    ).status,
    200,
  );
  assert.equal(
    (
      await request("/talent/applications/" + application.id + "/stage", {
        cookie: staff,
        method: "PATCH",
        body: { stage: "Hired", note: "Late decision" },
      })
    ).status,
    409,
  );
});
test("AI drafting uses server-side structured output and never sends the draft", async () => {
  process.env.OPENAI_API_KEY = "test-key";
  let called = 0;
  globalThis.fetch = async (url, options) => {
    assert.equal(url, "https://api.openai.com/v1/responses");
    const body = JSON.parse(options.body);
    assert.equal(body.store, false);
    assert.equal(body.text.format.type, "json_schema");
    called++;
    return new Response(
      JSON.stringify({
        status: "completed",
        output: [
          {
            content: [
              {
                type: "output_text",
                text: JSON.stringify({
                  subject: "Project follow-up",
                  body: "Hello Taylor, let us review the scope.",
                }),
              },
            ],
          },
        ],
      }),
      { status: 200 },
    );
  };
  const result = await request("/messages/ai-draft", {
    cookie: staff,
    body: {
      lead_id: lead.id,
      purpose: "Follow up on the proposal and ask for a review.",
      tone: "Professional",
    },
  });
  assert.equal(result.status, 200);
  assert.equal(result.data.subject, "Project follow-up");
  assert.equal(called, 1);
  assert.equal((await { total: await db.count("messages", {}) }).total, 0);
  globalThis.fetch = originalFetch;
  delete process.env.OPENAI_API_KEY;
});
test("messaging saves drafts, blocks unconfigured sends, verifies and deduplicates tracking webhooks", async () => {
  delete process.env.RESEND_API_KEY;
  delete process.env.EMAIL_FROM;
  const draft = await request("/messages/draft", {
    cookie: staff,
    body: {
      lead_id: lead.id,
      channel: "email",
      subject: "Scope review",
      body: "Please review our scope.",
    },
  });
  assert.equal(draft.status, 201);
  assert.equal(
    (
      await request("/messages/" + draft.data.id + "/send", {
        cookie: staff,
        body: { confirm: true },
      })
    ).status,
    503,
  );
  process.env.RESEND_API_KEY = "test-resend";
  process.env.EMAIL_FROM = "SleekTech <test@example.test>";
  globalThis.fetch = async (url, options) => {
    assert.equal(url, "https://api.resend.com/emails");
    assert.equal(options.headers["Idempotency-Key"], draft.data.id);
    return new Response(JSON.stringify({ id: "provider-test-message" }), {
      status: 200,
    });
  };
  assert.equal(
    (
      await request("/messages/" + draft.data.id + "/send", {
        cookie: staff,
        body: { confirm: true },
      })
    ).status,
    200,
  );
  assert.equal(
    (
      await request("/messages/" + draft.data.id + "/send", {
        cookie: staff,
        body: { confirm: true },
      })
    ).status,
    409,
  );
  globalThis.fetch = originalFetch;
  const secret =
    "whsec_" +
    Buffer.from("a-secret-only-for-local-tests-1234").toString("base64");
  process.env.RESEND_WEBHOOK_SECRET = secret;
  const payload = JSON.stringify({
    type: "email.delivered",
    data: { email_id: "provider-test-message" },
  });
  const timestamp = new Date();
  const eventId = "evt-test-1";
  const signature = new Webhook(secret).sign(eventId, timestamp, payload);
  const headers = {
    "Content-Type": "application/json",
    "svix-id": eventId,
    "svix-timestamp": String(Math.floor(timestamp.getTime() / 1000)),
    "svix-signature": signature,
  };
  assert.equal(
    (
      await originalFetch(base + "/api/webhooks/resend", {
        method: "POST",
        headers: { ...headers, "svix-signature": "invalid" },
        body: payload,
      })
    ).status,
    401,
  );
  for (let i = 0; i < 2; i++)
    assert.equal(
      (
        await originalFetch(base + "/api/webhooks/resend", {
          method: "POST",
          headers,
          body: payload,
        })
      ).status,
      200,
    );
  assert.equal(
    (
      await {
        total: await db.count("message_events", {
          message_id: draft.data.id,
          event: "Delivered",
        }),
      }
    ).total,
    1,
  );
  assert.equal(
    (
      await db.findOne(
        "messages",
        { id: draft.data.id },
        { projection: { status: 1 } },
      )
    ).status,
    "Delivered",
  );
});
test("WhatsApp requires opt-in and an approved template outside the reply window", async () => {
  process.env.WHATSAPP_TOKEN = "test-wa";
  process.env.WHATSAPP_PHONE_ID = "test-phone";
  process.env.WHATSAPP_GRAPH_VERSION = "v23.0";
  await request("/crm/leads/" + lead.id, {
    cookie: staff,
    method: "PATCH",
    body: { phone: "+919876543210" },
  });
  const draft = await request("/messages/draft", {
    cookie: staff,
    body: { lead_id: lead.id, channel: "whatsapp", body: "Hello" },
  });
  assert.equal(
    (
      await request("/messages/" + draft.data.id + "/send", {
        cookie: staff,
        body: { confirm: true },
      })
    ).status,
    400,
  );
  await request("/crm/leads/" + lead.id, {
    cookie: staff,
    method: "PATCH",
    body: { whatsapp_consent: true },
  });
  assert.match(
    (
      await request("/messages/" + draft.data.id + "/send", {
        cookie: staff,
        body: { confirm: true },
      })
    ).data.error,
    /24-hour/,
  );
  process.env.WHATSAPP_APP_SECRET = "local-test-secret";
  const payload = JSON.stringify({
    entry: [
      {
        changes: [
          {
            value: {
              metadata: { phone_number_id: "test-phone" },
              messages: [
                {
                  id: "incoming-1",
                  from: "919876543210",
                  timestamp: String(Math.floor(Date.now() / 1000)),
                  type: "text",
                  text: { body: "Please share details" },
                },
              ],
            },
          },
        ],
      },
    ],
  });
  const signature =
    "sha256=" +
    createHmac("sha256", process.env.WHATSAPP_APP_SECRET)
      .update(payload)
      .digest("hex");
  for (let n = 0; n < 2; n++)
    assert.equal(
      (
        await originalFetch(base + "/api/webhooks/whatsapp", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-hub-signature-256": signature,
          },
          body: payload,
        })
      ).status,
      200,
    );
  assert.equal(
    (await { total: await db.count("messages", { provider_id: "incoming-1" }) })
      .total,
    1,
  );
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ messages: [{ id: "outgoing-wa-1" }] }), {
      status: 200,
    });
  assert.equal(
    (
      await request("/messages/" + draft.data.id + "/send", {
        cookie: staff,
        body: { confirm: true },
      })
    ).status,
    200,
  );
  globalThis.fetch = originalFetch;
});
test("logout revokes the session", async () => {
  assert.equal(
    (await request("/auth/logout", { cookie: candidate, body: {} })).status,
    200,
  );
  assert.equal(
    (await request("/candidate/applications", { cookie: candidate })).status,
    401,
  );
});

test("DOCX extraction reads a bounded Office document", async () => {
  const form = new FormData();
  form.set(
    "resume",
    new Blob([
      await readFile(new URL("./fixtures/resume.docx", import.meta.url)),
    ]),
    "resume.docx",
  );
  form.set("consent", "true");
  const result = await request("/candidate/resume", {
    cookie: second,
    body: form,
  });
  assert.equal(result.status, 201, JSON.stringify(result.data));
  assert.equal(result.data.extracted.email, "jordan@example.test");
  assert.match(result.data.extracted.skills, /TypeScript/);
});

test("MongoDB records survive closing and reopening the client", async () => {
  const options = { url: db.url, name: db.name };
  const first = await database(options);
  await first.insert("tasks", {
    id: "restart-test",
    title: "Persistent commitment",
  });
  await first.close();
  const reopened = await database(options);
  try {
    assert.equal(
      (
        await reopened.findOne(
          "tasks",
          { id: "restart-test" },
          { projection: { title: 1 } },
        )
      ).title,
      "Persistent commitment",
    );
  } finally {
    await reopened.close();
  }
});

test("MongoDB transactions roll back all records and audit events together", async () => {
  const record = id();
  await assert.rejects(
    db.transaction(async (tx) => {
      await tx.insert("tasks", { id: record, title: "Should not commit" });
      await tx.insert("activity", {
        id: id(),
        domain: "crm",
        entity_id: record,
        action: "Should not commit",
      });
      throw new Error("Simulated failure");
    }),
    /Simulated failure/,
  );
  assert.equal(await db.findOne("tasks", { id: record }), null);
  assert.equal(await db.count("activity", { entity_id: record }), 0);
});

test("migrations are repeatable and reject changed files or concurrent runners", async () => {
  const { runMigrations, migrationDirectory } =
    await import("../src/migrate.mjs");
  const { cp, writeFile, readdir } = await import("node:fs/promises");
  const { pathToFileURL } = await import("node:url");
  const folder = join(directory, "migrations");
  await cp(migrationDirectory, folder, { recursive: true });
  const options = { directory: pathToFileURL(folder + "/") };
  await runMigrations(db.native, options);
  assert.equal(await db.native.collection("_migrations").countDocuments(), (await readdir(folder)).filter(name => /^V\d+__.+\.mjs$/.test(name)).length);
  await db.native
    .collection("_migration_locks")
    .insertOne({ _id: "schema", owner: "test" });
  try {
    await assert.rejects(runMigrations(db.native, options), /schema lock/);
  } finally {
    await db.native
      .collection("_migration_locks")
      .deleteOne({ _id: "schema", owner: "test" });
  }
  await writeFile(
    join(folder, "V2__profile_changes.mjs"),
    "export async function up() {}\n",
  );
  await assert.rejects(
    runMigrations(db.native, options),
    /removed or modified/,
  );
});

test("profile migration backfills missing fields without overwriting candidate details", async () => {
  const user = await createUser(db, {
    name: "Migration Example",
    email: "migration@example.test",
    password,
  });
  await db.update(
    "users",
    { id: user.id },
    {
      $set: { profile: { name: "Preserved profile" } },
      $unset: { profile_version: "" },
    },
  );
  const { up } = await import("../migrations/V2__profile_changes.mjs");
  await up(db.native);
  await up(db.native);
  const saved = await db.findOne("users", { id: user.id });
  assert.equal(saved.profile.name, "Preserved profile");
  assert.equal(saved.profile_version, 1);
});
