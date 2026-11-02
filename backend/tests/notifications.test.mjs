import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { setTimeout as delay } from "node:timers/promises";
import { WebSocket } from "ws";
import { database, id } from "../src/db.mjs";
import { createApp } from "../src/app.mjs";
import { createUser, digest } from "../src/auth.mjs";
import { notify } from "../src/record-events.mjs";
import {
  attachNotificationSocket,
  notificationSocketPath,
} from "../src/notification-socket.mjs";
let db, server, second, hub, secondHub, base, secondBase, lead;
const users = {},
  clients = new Set();
const origin = "http://localhost:3001";
const until = async (condition) => {
  const end = Date.now() + 6000;
  while (!condition()) {
    if (Date.now() > end) throw new Error("Timed out waiting for socket event");
    await delay(20);
  }
};
async function session(user) {
  const token = randomBytes(32).toString("hex");
  await db.insert("sessions", {
    token_hash: digest(token),
    user_id: user.id,
    last_seen_at: new Date(),
    expires_at: new Date(Date.now() + 86400000),
  });
  return { cookie: "sleektech_session=" + token, hash: digest(token) };
}
async function request(
  path,
  role = "admin",
  body,
  method = body ? "POST" : "GET",
) {
  const response = await fetch(base + "/api" + path, {
    method,
    headers: {
      Origin: origin,
      "X-Sleektech-Request": "1",
      "Content-Type": "application/json",
      ...(users[role] ? { Cookie: users[role].cookie } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return { status: response.status, data: await response.json() };
}
async function connect(who = users.sales, target = base) {
  const socket = new WebSocket(
    target.replace("http:", "ws:") + notificationSocketPath,
    { origin, headers: { Cookie: who.cookie } },
  );
  clients.add(socket);
  const messages = [];
  let closeCode;
  socket.on("message", (data) => messages.push(JSON.parse(data)));
  socket.on("close", (code) => {
    closeCode = code;
    clients.delete(socket);
  });
  socket.on("error", () => {});
  await until(() =>
    messages.some((item) => item.type === "notifications:ready"),
  );
  return {
    socket,
    messages,
    changed: () =>
      messages.filter((item) => item.type === "notifications:changed").length,
    closeCode: () => closeCode,
  };
}
async function denied({
  who = users.sales,
  requestOrigin = origin,
  path = notificationSocketPath,
} = {}) {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(base.replace("http:", "ws:") + path, {
      origin: requestOrigin,
      headers: who ? { Cookie: who.cookie } : {},
    });
    const timeout = setTimeout(() => {
      socket.terminate();
      reject(new Error("Handshake did not reject"));
    }, 5000);
    socket.on("error", () => {});
    socket.on("unexpected-response", (_, response) => {
      clearTimeout(timeout);
      response.resume();
      socket.terminate();
      resolve(response.statusCode);
    });
    socket.on("open", () => {
      clearTimeout(timeout);
      socket.terminate();
      reject(new Error("Unauthorized socket opened"));
    });
  });
}
before(async () => {
  db = await database({
    name: "sleektech_notifications_" + id().replaceAll("-", ""),
  });
  for (const role of ["admin", "sales", "other", "candidate", "recruiter"]) {
    const user = await createUser(db, {
      name: "Socket " + role,
      email: role + "@socket.test",
      password: "Isolated notification passphrase",
      role: role === "other" ? "sales" : role,
    });
    users[role] = { ...user, ...(await session(user)) };
  }
  lead = await db.insert("leads", {
    id: id(),
    name: "Socket Contact",
    company: "Socket Company",
    email: "lead@socket.test",
  });
  server = createApp(db).listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  base = "http://127.0.0.1:" + server.address().port;
  hub = await attachNotificationSocket(server, db, { heartbeatMs: 500 });
  second = createApp(db).listen(0, "127.0.0.1");
  await new Promise((resolve) => second.once("listening", resolve));
  secondBase = "http://127.0.0.1:" + second.address().port;
  secondHub = await attachNotificationSocket(second, db, { heartbeatMs: 500 });
});
after(async () => {
  for (const client of clients) client.terminate();
  await hub?.close();
  await secondHub?.close();
  for (const item of [server, second])
    if (item)
      await new Promise((resolve) => {
        item.close(resolve);
        item.closeAllConnections();
      });
  if (db) {
    await db.native.dropDatabase();
    await db.close();
  }
});
test("WebSocket handshake rejects unauthenticated, untrusted-origin and non-CRM clients", async () => {
  assert.equal(await denied({ who: null }), 401);
  assert.equal(
    await denied({ requestOrigin: "https://untrusted.example" }),
    403,
  );
  assert.equal(
    await denied({ requestOrigin: "http://localhost:3001.attacker.test" }),
    403,
  );
  for (const role of ["candidate", "recruiter"])
    assert.equal(await denied({ who: users[role] }), 403);
  assert.equal(
    await denied({
      path: notificationSocketPath + "?recipient=" + users.other.id,
    }),
    404,
  );
});
test("committed mentions reach only the recipient across tabs and backend instances", async () => {
  const target = await connect(),
    tab = await connect(users.sales, secondBase),
    author = await connect(users.admin),
    other = await connect(users.other);
  const response = await request(
    `/collaboration/records/leads/${lead.id}/comments`,
    "admin",
    {
      body: "Please review @Socket sales",
      mention_ids: [users.sales.id],
      request_id: id(),
    },
  );
  assert.equal(response.status, 201);
  await until(() => target.changed() === 1 && tab.changed() === 1);
  assert.equal(author.changed(), 0);
  assert.equal(other.changed(), 0);
  assert.deepEqual(target.messages.at(-1), { type: "notifications:changed" });
  const unread = await request("/collaboration/notifications/count", "sales");
  assert.equal(unread.data.unread, 1);
  for (const item of [target, tab, author, other]) item.socket.close();
});
test("rolled-back transactions do not emit ghost notifications", async () => {
  const target = await connect();
  await assert.rejects(
    db.transaction(async (tx) => {
      await notify(
        tx,
        users.sales.id,
        users.admin,
        "mention",
        "leads",
        lead.id,
        "Rolled back",
      );
      throw new Error("rollback");
    }),
    /rollback/,
  );
  await delay(250);
  assert.equal(target.changed(), 0);
  assert.equal(await db.count("notifications", { title: "Rolled back" }), 0);
  target.socket.close();
});
test("task assignment and mark-read events synchronize across instances", async () => {
  const target = await connect(),
    tab = await connect(users.sales, secondBase);
  const task = await request("/crm/tasks", "admin", {
    title: "Review socket delivery",
    owner_id: users.sales.id,
  });
  assert.equal(task.status, 201);
  await until(() => target.changed() === 1 && tab.changed() === 1);
  const note = await db.findOne("notifications", {
    recipient_id: users.sales.id,
    type: "assignment",
  });
  assert.ok(note);
  assert.equal(
    (
      await request(
        "/collaboration/notifications/" + note.id,
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
        "/collaboration/notifications/" + note.id,
        "sales",
        { read: true },
        "PATCH",
      )
    ).status,
    200,
  );
  await until(() => target.changed() === 2 && tab.changed() === 2);
  target.socket.close();
  tab.socket.close();
});
test("reconnecting clients can recover persisted notifications missed offline", async () => {
  const target = await connect();
  target.socket.close();
  await until(() => target.closeCode());
  await notify(
    db,
    users.sales.id,
    users.admin,
    "mention",
    "leads",
    lead.id,
    "While offline",
  );
  const reconnected = await connect();
  const snapshot = await request("/collaboration/notifications", "sales");
  assert.ok(snapshot.data.items.some((item) => item.title === "While offline"));
  reconnected.socket.close();
});
test("revoked sessions cannot receive another event; heartbeat enforces idle expiry and role changes", async () => {
  const fresh = await session(users.sales);
  const target = await connect({ ...users.sales, ...fresh });
  await db.remove("sessions", { token_hash: fresh.hash });
  await notify(
    db,
    users.sales.id,
    users.admin,
    "mention",
    "leads",
    lead.id,
    "After revocation",
  );
  await until(() => target.closeCode());
  assert.equal(target.closeCode(), 4401);
  assert.equal(target.changed(), 0);
  const idle = await session(users.sales),
    idleSocket = await connect({ ...users.sales, ...idle });
  const before = await db.findOne("sessions", { token_hash: idle.hash });
  await delay(600);
  assert.deepEqual(
    (await db.findOne("sessions", { token_hash: idle.hash })).last_seen_at,
    before.last_seen_at,
  );
  await db.update(
    "sessions",
    { token_hash: idle.hash },
    { $set: { last_seen_at: new Date(Date.now() - 61 * 60000) } },
  );
  await until(() => idleSocket.closeCode());
  assert.equal(idleSocket.closeCode(), 4401);
  const other = await connect(users.other);
  await db.update(
    "users",
    { id: users.other.id },
    { $set: { role: "candidate" } },
  );
  await until(() => other.closeCode());
  assert.equal(other.closeCode(), 4401);
  await db.update("users", { id: users.other.id }, { $set: { role: "sales" } });
});
test("socket is read-only, bounds payloads and limits simultaneous connections per user", async () => {
  const target = await connect();
  target.socket.send(JSON.stringify({ recipient: users.other.id }));
  await until(() => target.closeCode());
  assert.equal(target.closeCode(), 1008);
  const oversized = await connect();
  oversized.socket.send("x".repeat(2048));
  await until(() => oversized.closeCode());
  assert.equal(oversized.closeCode(), 1009);
  const tabs = [];
  for (let i = 0; i < 10; i++) tabs.push(await connect(users.other));
  assert.equal(await denied({ who: users.other }), 429);
  for (const tab of tabs) tab.socket.close();
});
test("comment redirects locate later root/reply pages and reject cross-record access", async () => {
  const roots = [],
    replies = [];
  const scope = {
    record_type: "leads",
    record_id: lead.id,
    author_id: users.admin.id,
    author_name: users.admin.name,
    mentions: [],
    reply_count: 0,
  };
  for (let i = 0; i < 12; i++)
    roots.push(
      await db.insert("comments", {
        ...scope,
        id: id(),
        parent_id: null,
        body: "Root " + i,
        request_id: id(),
        created_at: new Date(Date.now() + i * 100),
      }),
    );
  for (let i = 0; i < 12; i++)
    replies.push(
      await db.insert("comments", {
        ...scope,
        id: id(),
        parent_id: roots[11].id,
        body: "Reply " + i,
        request_id: id(),
        created_at: new Date(Date.now() + i * 100),
      }),
    );
  const path = `/collaboration/records/leads/${lead.id}/comments/${replies[11].id}/location`;
  const located = await request(path);
  assert.equal(located.status, 200);
  assert.equal(located.data.page, 2);
  assert.equal(located.data.reply_page, 2);
  assert.equal(located.data.parent_id, roots[11].id);
  const another = await db.insert("leads", {
    id: id(),
    name: "Other record",
    company: "Other",
    email: "other@lead.test",
  });
  assert.equal((await request(path.replace(lead.id, another.id))).status, 404);
  assert.equal((await request(path, "candidate")).status, 403);
  assert.equal((await request(path, null)).status, 401);
});
