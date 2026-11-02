import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { database, id } from "../src/db.mjs";
import { createApp } from "../src/app.mjs";
import { createUser } from "../src/auth.mjs";
let db, server, base;
const users = {};
const password = "role-verification-only-password";
async function request(path, cookie, body, method = body ? "POST" : "GET") {
  const response = await fetch(base + "/api" + path, {
    method,
    headers: {
      Origin: "http://localhost:3001",
      "X-Sleektech-Request": "1",
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return {
    status: response.status,
    data: await response.json(),
    cookie: response.headers.get("set-cookie")?.split(";")[0],
  };
}
before(async () => {
  db = await database({
    name: "sleektech_access_test_" + id().replaceAll("-", ""),
  });
  await createUser(db, {
    name: "Demo team",
    email: "team@demo.sleektech.test",
    password,
    role: "admin",
  });
  server = createApp(db, { demo: true }).listen(0, "127.0.0.1");
  await new Promise((done) => server.once("listening", done));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  if (server) await new Promise((done) => server.close(done));
  if (db) {
    await db.native.dropDatabase();
    await db.close();
  }
});
test("personal staff provisioning disables demo entry and previously issued demo sessions", async () => {
  const demo = await request("/auth/demo", null, {});
  assert.equal(demo.status, 200);
  for (const role of ["admin", "sales", "recruiter", "candidate"]) {
    const user = await createUser(db, {
      name: role,
      email: `${role}@rbac.test`,
      password,
      role,
    });
    const login = await request("/auth/login", null, {
      email: user.email,
      password,
    });
    assert.equal(login.status, 200);
    users[role] = { ...user, cookie: login.cookie };
  }
  assert.equal((await request("/auth/me")).data.demo, false);
  assert.equal((await request("/meta")).data.demo, false);
  assert.equal((await request("/auth/demo", null, {})).status, 403);
  assert.equal((await request("/crm/overview", demo.cookie)).status, 401);
  assert.equal((await request("/talent/overview", demo.cookie)).status, 401);
});
test("role matrix protects both portals, messaging, private resumes, discovery and mutation endpoints", async () => {
  const paths = [
    ["/crm/overview", ["admin", "sales"], undefined, "GET", 200],
    ["/messages", ["admin", "sales"], undefined, "GET", 200],
    ["/messages/" + id(), ["admin", "sales"], undefined, "GET", 404],
    ["/talent/overview", ["admin", "recruiter"], undefined, "GET", 200],
    ["/candidate/applications", ["candidate"], undefined, "GET", 200],
    [
      "/crm/leads/" + id() + "/discovery",
      ["admin", "sales"],
      undefined,
      "GET",
      404,
    ],
    [
      "/resumes/" + id(),
      ["admin", "recruiter", "candidate"],
      undefined,
      "GET",
      404,
    ],
    ["/crm/leads", ["admin", "sales"], {}, "POST", 400],
    ["/talent/jobs", ["admin", "recruiter"], {}, "POST", 400],
    ["/messages/draft", ["admin", "sales"], {}, "POST", 400],
    ["/candidate/profile", ["candidate"], {}, "PATCH", 400],
  ];
  for (const [path, allowed, body, method, success] of paths) {
    assert.equal(
      (await request(path, null, body, method)).status,
      401,
      `${path} anonymous`,
    );
    for (const role of Object.keys(users)) {
      const result = await request(path, users[role].cookie, body, method);
      assert.equal(
        result.status,
        allowed.includes(role) ? success : 403,
        `${path} ${role}`,
      );
    }
  }
  assert.equal((await request("/public/jobs")).status, 200);
});
test("message detail links retrieve older records and only their own delivery events", async () => {
  const lead = await db.insert("leads", {
    id: id(),
    name: "Detail contact",
    company: "Detail account",
    email: "detail@example.test",
  });
  const oldMessage = await db.insert("messages", {
    id: id(),
    lead_id: lead.id,
    channel: "email",
    subject: "Archived conversation",
    body: "Still available through a permanent link.",
    created_at: new Date("2020-01-01"),
  });
  await db.native.collection("messages").insertMany(
    Array.from({ length: 201 }, () => ({
      id: id(),
      lead_id: lead.id,
      channel: "email",
      subject: "Recent conversation",
      body: "Recent",
      status: "Draft",
      created_at: new Date(),
    })),
  );
  const ownEvent = await db.insert("message_events", {
    id: id(),
    message_id: oldMessage.id,
    event: "delivered",
  });
  await db.insert("message_events", {
    id: id(),
    message_id: id(),
    event: "unrelated",
  });
  const list = await request("/messages", users.admin.cookie);
  assert.equal(
    list.data.messages.some((message) => message.id === oldMessage.id),
    false,
  );
  for (const role of ["admin", "sales"]) {
    const detail = await request(
      "/messages/" + oldMessage.id,
      users[role].cookie,
    );
    assert.equal(detail.status, 200);
    assert.equal(detail.data.message.subject, oldMessage.subject);
    assert.equal(detail.data.message.company, lead.company);
    assert.deepEqual(
      detail.data.events.map((event) => event.id),
      [ownEvent.id],
    );
  }
});
test("private role details cover every publication status and enforce recruitment access", async () => {
  for (const status of ["Draft", "Published", "Closed"]) {
    const job = await db.insert("jobs", {
      id: id(),
      slug: "private-detail-" + id(),
      title: status + " role",
      department: "Engineering",
      location: "Remote",
      description:
        "Build reliable business applications and collaborate with the product team.",
      requirements: "Experience with TypeScript and accessible interfaces.",
      status,
    });
    for (const role of ["admin", "recruiter"]) {
      const detail = await request(
        "/talent/jobs/" + job.id,
        users[role].cookie,
      );
      assert.equal(detail.status, 200);
      assert.equal(detail.data.id, job.id);
      assert.equal(detail.data.status, status);
      assert.equal(detail.data.applicants, 0);
    }
    for (const role of ["sales", "candidate"])
      assert.equal(
        (await request("/talent/jobs/" + job.id, users[role].cookie)).status,
        403,
      );
    assert.equal((await request("/talent/jobs/" + job.id)).status, 401);
    if (status !== "Published")
      assert.equal((await request("/public/jobs/" + job.slug)).status, 404);
  }
  assert.equal(
    (await request("/talent/jobs/not-an-id", users.admin.cookie)).status,
    400,
  );
  assert.equal(
    (await request("/talent/jobs/" + id(), users.admin.cookie)).status,
    404,
  );
});
test("role changes take effect on existing sessions and candidate profile changes cannot elevate access", async () => {
  await db.update(
    "users",
    { id: users.sales.id },
    { $set: { role: "recruiter" } },
  );
  assert.equal(
    (await request("/crm/overview", users.sales.cookie)).status,
    403,
  );
  assert.equal(
    (await request("/talent/overview", users.sales.cookie)).status,
    200,
  );
  assert.equal(
    (
      await request(
        "/candidate/profile",
        users.candidate.cookie,
        { name: "Candidate", email: users.candidate.email, role: "admin" },
        "PATCH",
      )
    ).status,
    200,
  );
  assert.equal(
    (await db.findOne("users", { id: users.candidate.id })).role,
    "candidate",
  );
  assert.equal(
    (await request("/crm/overview", users.candidate.cookie)).status,
    403,
  );
});
