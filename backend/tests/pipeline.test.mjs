import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { database, id } from "../src/db.mjs";
import { createApp } from "../src/app.mjs";
import { createUser, digest } from "../src/auth.mjs";

let db, server, base;
const users = {};
async function request(
  path,
  body,
  role = "sales",
  method = body ? "PATCH" : "GET",
) {
  const response = await fetch(base + "/api/crm" + path, {
    method,
    headers: {
      Origin: "http://localhost:3001",
      "X-Sleektech-Request": "1",
      "Content-Type": "application/json",
      ...(users[role]
        ? { Cookie: "sleektech_session=" + users[role].token }
        : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return { status: response.status, data: await response.json() };
}
const lead = (extra = {}) =>
  db.insert("leads", {
    id: id(),
    company: "PipelineFixture " + id(),
    name: "Avery Morgan",
    email: "avery@pipeline.test",
    value: 700000,
    owner: "Sales team",
    next_action: "Review discovery brief",
    notes: "Private sales context",
    ...extra,
  });
const move = (record, stage, role) =>
  request(
    `/pipeline/${record.id}/stage`,
    { stage, expected_version: record.version || 1 },
    role,
  );
before(async () => {
  db = await database({
    name: "sleektech_pipeline_test_" + id().replaceAll("-", ""),
  });
  server = createApp(db).listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  base = "http://127.0.0.1:" + server.address().port;
  for (const role of [
    "super_admin",
    "admin",
    "sales",
    "recruiter",
    "candidate",
  ]) {
    const user = await createUser(db, {
      name: "Pipeline " + role,
      email: role + "@pipeline.test",
      password: "Isolated pipeline test passphrase",
      role,
    });
    const token = randomBytes(32).toString("hex");
    await db.insert("sessions", {
      token_hash: digest(token),
      user_id: user.id,
      last_seen_at: new Date(),
      expires_at: new Date(Date.now() + 86400000),
    });
    users[role] = { ...user, token };
  }
});
after(async () => {
  if (server)
    await new Promise((resolve) => {
      server.close(resolve);
      server.closeAllConnections();
    });
  if (db) {
    await db.native.dropDatabase();
    await db.close();
  }
});

test("board totals cover all matching records while each stage has bounded, stable pagination", async () => {
  for (let index = 0; index < 27; index++)
    await lead({
      company: "SummaryFixture " + index,
      value: 100,
      stage: "New",
    });
  await lead({
    company: "SummaryFixture Qualified",
    stage: "Qualified",
    value: 400,
  });
  await lead({ company: "Different fixture", value: 999999 });
  const result = await request("/pipeline?q=SummaryFixture");
  assert.equal(result.status, 200);
  assert.equal(result.data.columns.length, 6);
  const column = result.data.columns.find((item) => item.stage === "New");
  assert.equal(column.total, 27);
  assert.equal(column.value, 2700);
  assert.equal(column.items.length, 12);
  assert.ok(
    column.items.every((item) => !item.notes && !item.email && item.version),
  );
  const second = await request(
    "/pipeline/stages/New?q=SummaryFixture&page=2&limit=12",
  );
  assert.equal(second.data.pagination.total, 27);
  assert.equal(second.data.items.length, 12);
  assert.ok(
    second.data.items.every(
      (item) => !column.items.some((old) => old.id === item.id),
    ),
  );
  const empty = await request("/pipeline?q=NoMatchesAnywhere");
  assert.ok(
    empty.data.columns.every(
      (item) => item.total === 0 && item.items.length === 0 && item.value === 0,
    ),
  );
  const indexes = await db.native.collection("leads").indexes();
  assert.ok(
    indexes.some(
      (index) =>
        index.key.stage === 1 &&
        index.key.updated_at === -1 &&
        index.key.id === -1,
    ),
  );
});
test("stage changes persist with actor history and reject conflicting edits", async () => {
  const record = await lead();
  const updated = await move(record, "Qualified");
  assert.equal(updated.status, 200);
  assert.equal(updated.data.record.stage, "Qualified");
  assert.equal(updated.data.record.version, 2);
  assert.equal(
    (await db.findOne("leads", { id: record.id })).stage,
    "Qualified",
  );
  const events = await db.find("record_events", { record_id: record.id });
  assert.equal(events.length, 1);
  assert.equal(events[0].actor_id, users.sales.id);
  assert.deepEqual(events[0].changes, [
    { field: "stage", before: "New", after: "Qualified" },
  ]);
  assert.equal((await move(record, "Lost")).status, 409);
  const unchanged = await move(updated.data.record, "Qualified");
  assert.equal(unchanged.data.record.version, 2);
  assert.equal(await db.count("record_events", { record_id: record.id }), 1);
});
test("two teammates cannot overwrite the same version through simultaneous drags", async () => {
  const record = await lead();
  const results = await Promise.all([
    move(record, "Proposal", "sales"),
    move(record, "Negotiation", "admin"),
  ]);
  assert.deepEqual(results.map((result) => result.status).sort(), [200, 409]);
  assert.equal(await db.count("record_events", { record_id: record.id }), 1);
});
test("Won creates exactly one customer, retains history and cannot be moved back", async () => {
  const record = await lead();
  const result = await move(record, "Won", "super_admin");
  assert.equal(result.status, 200);
  assert.equal(result.data.record.stage, "Won");
  const customer = await db.findOne("clients", { lead_id: record.id });
  assert.equal(result.data.customer_id, customer.id);
  assert.equal(customer.description, record.notes);
  assert.equal(customer.value, record.value);
  assert.equal(await db.count("record_events", { record_id: customer.id }), 1);
  assert.equal((await move(record, "Won")).status, 409);
  assert.equal((await move(result.data.record, "New")).status, 409);
  const retry = await request(
    `/leads/${record.id}/convert`,
    {},
    "sales",
    "POST",
  );
  assert.equal(retry.data.id, customer.id);
  assert.equal(await db.count("clients", { lead_id: record.id }), 1);
  const lost = await lead({ stage: "Lost" });
  assert.equal((await move(lost, "Won")).status, 409);
  assert.equal(await db.count("clients", { lead_id: lost.id }), 0);
  assert.equal((await move(lost, "New")).status, 200);
});
test("pipeline APIs enforce roles, required versions, strict payloads and query bounds", async () => {
  const record = await lead();
  for (const role of ["recruiter", "candidate", "anonymous"]) {
    const expected = role === "anonymous" ? 401 : 403;
    assert.equal(
      (await request("/pipeline", undefined, role)).status,
      expected,
    );
    assert.equal((await move(record, "Qualified", role)).status, expected);
  }
  for (const body of [
    { stage: "Qualified" },
    { stage: "Bad stage", expected_version: 1 },
    { stage: "Won", expected_version: 0 },
    { stage: "Qualified", expected_version: 1, owner: "Other" },
  ])
    assert.equal(
      (await request(`/pipeline/${record.id}/stage`, body)).status,
      400,
    );
  for (const query of [
    "limit=51",
    "limit=0",
    "q=" + "x".repeat(81),
    "q[$ne]=x",
    "page=501",
  ])
    assert.equal((await request("/pipeline?" + query)).status, 400);
  assert.equal((await request("/pipeline/stages/Unknown")).status, 400);
  assert.equal((await move({ id: id(), version: 1 }, "New")).status, 404);
  assert.equal((await db.findOne("leads", { id: record.id })).stage, "New");
});
