import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { database, id } from "../src/db.mjs";
import { createApp } from "../src/app.mjs";
import { createUser, digest, validPassword } from "../src/auth.mjs";
let db, server, base;
const users = {};
const password = "Isolated collaboration test passphrase";
async function request(
  path,
  role = "super_admin",
  body,
  method = body ? "POST" : "GET",
  extra = {},
) {
  const response = await fetch(base + "/api" + path, {
    method,
    headers: {
      Origin: "http://localhost:3001",
      "X-Sleektech-Request": "1",
      "Content-Type": "application/json",
      ...(users[role]?.cookie ? { Cookie: users[role].cookie } : {}),
      ...extra,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  return {
    status: response.status,
    data: await response.json(),
    cookie: response.headers.get("set-cookie")?.split(";")[0],
    headers: response.headers,
  };
}
before(async () => {
  db = await database({
    name: "sleektech_collaboration_test_" + id().replaceAll("-", ""),
  });
  server = createApp(db).listen(0, "127.0.0.1");
  await new Promise((r) => server.once("listening", r));
  base = "http://127.0.0.1:" + server.address().port;
  for (const role of [
    "super_admin",
    "admin",
    "sales",
    "recruiter",
    "candidate",
    "other",
  ]) {
    const user = await createUser(db, {
      name:
        role === "other"
          ? "Another Seller"
          : role === "sales"
            ? "Sales Teammate"
            : role,
      email: role + "@collaboration.test",
      password,
      role: role === "other" ? "sales" : role,
    });
    const login = await request("/auth/login", null, {
      email: user.email,
      password,
    });
    assert.equal(login.status, 200);
    users[role] = { ...user, cookie: login.cookie };
  }
});
after(async () => {
  if (server)
    await new Promise((r) => {
      server.close(r);
      server.closeAllConnections();
    });
  if (db) {
    await db.native.dropDatabase();
    await db.close();
  }
});
test("super admin inherits CRM and hiring access but cannot impersonate candidates; user directory has safe projections", async () => {
  for (const path of ["/crm/overview", "/talent/overview", "/admin/users"])
    assert.equal((await request(path)).status, 200);
  assert.equal((await request("/candidate/applications")).status, 403);
  for (const role of ["admin", "sales", "recruiter", "candidate", null])
    assert.equal(
      (await request("/admin/users", role)).status,
      role ? 403 : 401,
    );
  const result = await request("/admin/users?q=Sales&limit=1");
  assert.equal(result.data.items.length, 1);
  assert.equal(result.data.items[0].email, users.sales.email);
  assert.equal(result.data.items[0].password_hash, undefined);
  assert.equal(result.data.items[0].profile, undefined);
});
test("strict input validation, CSRF origin checks and bounded pagination", async () => {
  for (const query of [
    "limit=51",
    "page=0",
    "page=501",
    "q=" + "a".repeat(81),
    "q[$ne]=x",
  ])
    assert.equal((await request("/crm/tasks?" + query)).status, 400, query);
  for (const body of [
    { title: "ab" },
    { title: "Valid title", priority: "invalid" },
    {
      title: "Valid title",
      assigned_date: "2026-12-31",
      due_date: "2026-12-01",
    },
    { title: "Valid title", role: "super_admin" },
    { title: { $ne: null } },
    { title: "Valid title", owner_id: users.candidate.id },
  ])
    assert.equal(
      (await request("/crm/tasks", "super_admin", body)).status,
      400,
      JSON.stringify(body),
    );
  assert.equal(
    (
      await request(
        "/crm/tasks",
        "super_admin",
        { title: "Rejected origin" },
        "POST",
        { Origin: "https://untrusted.example" },
      )
    ).status,
    403,
  );
  assert.equal(
    (
      await request(
        "/crm/tasks",
        "super_admin",
        { title: "Missing header" },
        "POST",
        { "X-Sleektech-Request": "" },
      )
    ).status,
    403,
  );
  assert.equal(
    (
      await request("/auth/register", null, {
        name: "New Person",
        email: "new@collaboration.test",
        password: "short",
        consent: true,
      })
    ).status,
    400,
  );
  const response = await request("/crm/tasks");
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
});
let task;
test("tasks persist full details, enforce owner editing, reject stale writes, and retain actor change history", async () => {
  const create = await request("/crm/tasks", "super_admin", {
    title: "Review account rollout",
    description: "Review acceptance criteria.",
    owner_id: users.sales.id,
    assigned_date: "2026-11-01",
    due_date: "2026-12-01",
    priority: "High",
    remarks: "Customer review required.",
  });
  assert.equal(create.status, 201);
  task = create.data;
  assert.equal(task.owner, "Sales Teammate");
  assert.equal(task.version, 1);
  assert.equal(
    (
      await request(
        "/crm/tasks/" + task.id,
        "other",
        { status: "Completed", expected_version: 1 },
        "PATCH",
      )
    ).status,
    403,
  );
  assert.equal(
    (await request("/crm/tasks/" + task.id, "other")).data.can_edit,
    false,
  );
  const changed = await request(
    "/crm/tasks/" + task.id,
    "sales",
    { status: "In progress", due_date: "2026-12-02", expected_version: 1 },
    "PATCH",
  );
  assert.equal(changed.status, 200);
  assert.equal(changed.data.version, 2);
  assert.equal(changed.data.done, false);
  assert.equal(
    (
      await request(
        "/crm/tasks/" + task.id,
        "super_admin",
        { status: "Completed", expected_version: 1 },
        "PATCH",
      )
    ).status,
    409,
  );
  const competing = await Promise.all(
    ["Completed", "Blocked"].map((status) =>
      request(
        "/crm/tasks/" + task.id,
        "super_admin",
        { status, expected_version: 2 },
        "PATCH",
      ),
    ),
  );
  assert.deepEqual(competing.map((r) => r.status).sort(), [200, 409]);
  const timeline = await request(
    "/collaboration/records/tasks/" + task.id + "/timeline",
  );
  assert.equal(timeline.data.items.length, 3);
  assert.equal(timeline.data.items.at(-1).summary, "Task created");
  const change = timeline.data.items.find((e) => e.actor_id === users.sales.id);
  assert.ok(change.created_at);
  assert.equal(change.actor_name, "Sales Teammate");
  assert.ok(
    change.changes.some(
      (c) =>
        c.field === "due_date" &&
        c.before === "2026-12-01" &&
        c.after === "2026-12-02",
    ),
  );
  const own = await request("/crm/tasks?owner=me", "sales");
  assert.equal(own.data.items[0].id, task.id);
});
test("mentions are active CRM users only; threaded replies and notifications cannot cross record or recipient boundaries", async () => {
  const people = await request("/collaboration/people?q=sa");
  assert.equal(people.data.items.length, 1);
  assert.equal(people.data.items[0].id, users.sales.id);
  assert.equal(people.data.items[0].password_hash, undefined);
  assert.equal(
    (await request("/collaboration/people?q=ca")).data.items.length,
    0,
  );
  const path = "/collaboration/records/tasks/" + task.id;
  const payload = {
    body: "Please review @Sales Teammate <script>alert(1)</script>",
    mention_ids: [users.sales.id],
    request_id: id(),
  };
  const added = await request(path + "/comments", "super_admin", payload);
  assert.equal(added.status, 201);
  assert.equal(added.data.body, payload.body);
  assert.equal(
    (await request(path + "/comments", "super_admin", payload)).data.id,
    added.data.id,
  );
  assert.equal(await db.count("comments", { record_id: task.id }), 1);
  const reply = await request(path + "/comments", "sales", {
    body: "Reviewing the acceptance criteria.",
    parent_id: added.data.id,
    request_id: id(),
  });
  assert.equal(reply.status, 201);
  assert.equal(
    (await request(path + "/comments?parent=" + added.data.id)).data.items[0]
      .id,
    reply.data.id,
  );
  assert.equal(
    (await request(path + "/comments")).data.items[0].reply_count,
    1,
  );
  const another = await request("/crm/tasks", "super_admin", {
    title: "A separate task",
  });
  assert.equal(
    (
      await request(
        "/collaboration/records/tasks/" + another.data.id + "/comments",
        "super_admin",
        {
          body: "Invalid cross-record reply",
          parent_id: added.data.id,
          request_id: id(),
        },
      )
    ).status,
    404,
  );
  assert.equal(
    (
      await request(path + "/comments", "super_admin", {
        body: "@candidate",
        mention_ids: [users.candidate.id],
        request_id: id(),
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await request(path + "/comments", "super_admin", {
        body: "No matching name",
        mention_ids: [users.sales.id],
        request_id: id(),
      })
    ).status,
    400,
  );
  assert.equal((await request(path + "/comments", "candidate")).status, 403);
  const notes = (await request("/collaboration/notifications", "sales")).data;
  assert.equal(notes.items.length, 2);
  assert.equal(notes.unread, 2);
  const mention = notes.items.find((n) => n.type === "mention");
  assert.ok(mention);
  assert.equal(mention.comment_id, added.data.id);
  assert.equal(
    (await request("/collaboration/notifications", "other")).data.items.length,
    0,
  );
  assert.equal(
    (
      await request(
        "/collaboration/notifications/" + mention.id,
        "other",
        { read: true },
        "PATCH",
      )
    ).status,
    404,
  );
  assert.equal(
    (
      await request(
        "/collaboration/notifications/" + mention.id,
        "sales",
        { read: true },
        "PATCH",
      )
    ).status,
    200,
  );
  assert.equal(
    (await request("/collaboration/notifications/count", "sales")).data.unread,
    1,
  );
});
test("pagination is stable, prefix queries are literal, and indexed search stays synchronized after editing", async () => {
  for (let n = 0; n < 25; n++)
    await db.insert("tasks", {
      id: id(),
      title: "Pagination " + String(n).padStart(2, "0"),
      created_at: new Date("2026-01-01"),
    });
  const one = (await request("/crm/tasks?q=pagination&limit=10")).data;
  const two = (await request("/crm/tasks?q=pagination&limit=10&page=2")).data;
  assert.equal(one.items.length, 10);
  assert.equal(one.pagination.total, 25);
  assert.equal(one.pagination.pages, 3);
  assert.equal(new Set([...one.items, ...two.items].map((t) => t.id)).size, 20);
  assert.equal(
    (await request("/crm/tasks?q=" + encodeURIComponent(".*"))).data.items
      .length,
    0,
  );
  await request(
    "/crm/tasks/" + one.items[0].id,
    "super_admin",
    { title: "Renamed searchable task", expected_version: 1 },
    "PATCH",
  );
  assert.equal((await request("/crm/tasks?q=renamed")).data.items.length, 1);
  const indexes = await db.native.collection("tasks").indexes();
  assert.ok(indexes.some((i) => i.key.search_title === 1));
  const overview = (await request("/crm/overview")).data;
  assert.ok(overview.tasks.length <= 5);
  assert.ok(overview.leads.length <= 5);
});
test("user administration requires reauthentication, rejects self-demotion and revokes sessions when access changes", async () => {
  const target = users.other;
  const body = {
    name: target.name,
    role: "recruiter",
    disabled: false,
    version: 1,
    current_password: password,
  };
  assert.equal(
    (
      await request(
        "/admin/users/" + target.id,
        "super_admin",
        { ...body, current_password: "incorrect" },
        "PATCH",
      )
    ).status,
    403,
  );
  assert.equal(
    (await request("/admin/users/" + target.id, "admin", body, "PATCH")).status,
    403,
  );
  assert.equal(
    (
      await request(
        "/admin/users/" + users.super_admin.id,
        "super_admin",
        { ...body, name: "Super Admin", role: "admin" },
        "PATCH",
      )
    ).status,
    409,
  );
  const changed = await request(
    "/admin/users/" + target.id,
    "super_admin",
    body,
    "PATCH",
  );
  assert.equal(changed.status, 200);
  assert.equal(changed.data.user.role, "recruiter");
  assert.equal(changed.data.user.password_hash, undefined);
  assert.equal((await request("/crm/tasks", "other")).status, 401);
  assert.equal(
    (await request("/admin/users/" + target.id, "super_admin", body, "PATCH"))
      .status,
    409,
  );
});
test("reset links are hashed, expiring, replaceable and single use under concurrent requests; password changes revoke all sessions", async () => {
  const path = "/admin/users/" + users.sales.id + "/reset-link";
  assert.equal(
    (await request(path, "super_admin", { current_password: "incorrect" }))
      .status,
    403,
  );
  const first = await request(path, "super_admin", {
    current_password: password,
  });
  assert.equal(first.status, 200);
  const oldToken = new URL(first.data.url).hash.split("token=")[1];
  const second = await request(path, "super_admin", {
    current_password: password,
  });
  const token = new URL(second.data.url).hash.split("token=")[1];
  const stored = await db.findOne("password_resets", {
    user_id: users.sales.id,
  });
  assert.equal(stored.token_hash, digest(token));
  assert.equal(stored.token, undefined);
  assert.equal(
    await db.count("password_resets", { user_id: users.sales.id }),
    1,
  );
  const newPassword = "A newly generated test passphrase";
  assert.equal(
    (
      await request("/auth/reset-password", null, {
        token: oldToken,
        password: newPassword,
      })
    ).status,
    400,
  );
  assert.equal(
    (await request("/auth/reset-password", null, { token, password: "weak" }))
      .status,
    400,
  );
  const results = await Promise.all(
    [1, 2].map(() =>
      request("/auth/reset-password", null, { token, password: newPassword }),
    ),
  );
  assert.deepEqual(results.map((r) => r.status).sort(), [200, 400]);
  assert.equal((await request("/crm/tasks", "sales")).status, 401);
  assert.equal(
    (
      await request("/auth/reset-password", null, {
        token,
        password: newPassword,
      })
    ).status,
    400,
  );
  const user = await db.findOne("users", { id: users.sales.id });
  assert.ok(await validPassword(newPassword, user.password_hash));
  assert.equal(await validPassword(password, user.password_hash), false);
  assert.ok(user.password_hash.startsWith("scrypt:32768:8:3:"));
  const expiredToken = "a".repeat(64);
  await db.insert("password_resets", {
    id: id(),
    user_id: user.id,
    token_hash: digest(expiredToken),
    expires_at: new Date(Date.now() - 1000),
    used_at: null,
  });
  assert.equal(
    (
      await request("/auth/reset-password", null, {
        token: expiredToken,
        password: newPassword,
      })
    ).status,
    400,
  );
});
test("disabled and idle sessions cannot access records", async () => {
  await db.update(
    "users",
    { id: users.admin.id },
    { $set: { disabled: true } },
  );
  assert.equal((await request("/crm/tasks", "admin")).status, 401);
  await db.update(
    "sessions",
    { user_id: users.super_admin.id },
    { $set: { last_seen_at: new Date(Date.now() - 61 * 60000) } },
  );
  assert.equal((await request("/admin/users")).status, 401);
});
