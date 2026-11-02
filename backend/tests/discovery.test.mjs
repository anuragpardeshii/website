import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { database, id } from "../src/db.mjs";
import { createApp } from "../src/app.mjs";
import { createUser, digest } from "../src/auth.mjs";
let db, server, base, staff, outsider, leadId;
const registration = {
  registration_id: id(),
  name: "Alex Sample",
  email: "alex@sample.test",
  company: "Sample Studio",
  phone: "+91 98765 43210",
  interest: "CRM platforms",
  consent: true,
};
async function request(path, body, cookie, method = body ? "POST" : "GET") {
  const response = await fetch(base + "/api" + path, {
    method,
    headers: {
      Origin: "http://localhost:5173",
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
    name: "sleektech_discovery_test_" + id().replaceAll("-", ""),
  });
  for (const role of ["sales", "candidate"])
    await createUser(db, {
      name: role,
      email: `${role}@example.test`,
      password: "test-discovery-password",
      role,
    });
  server = createApp(db).listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  base = `http://127.0.0.1:${server.address().port}`;
  staff = (
    await request("/auth/login", {
      email: "sales@example.test",
      password: "test-discovery-password",
    })
  ).cookie;
  outsider = (
    await request("/auth/login", {
      email: "candidate@example.test",
      password: "test-discovery-password",
    })
  ).cookie;
});
after(async () => {
  await new Promise((resolve) => server?.close(resolve));
  if (db) {
    await db.native.dropDatabase();
    await db.close();
  }
});

test("public registration requires consent and creates one lead and follow-up on concurrent retry", async () => {
  assert.equal(
    (await request("/public/leads", { ...registration, consent: false }))
      .status,
    400,
  );
  assert.equal(
    (await request("/public/leads", { ...registration, phone: "wrong" }))
      .status,
    400,
  );
  assert.equal(
    (await request("/public/leads", { ...registration, website: "spam.test" }))
      .status,
    400,
  );
  const responses = await Promise.all([
    request("/public/leads", {
      ...registration,
      stage: "Won",
      whatsapp_consent: true,
    }),
    request("/public/leads", registration),
  ]);
  responses.forEach((result) => {
    assert.equal(result.status, 201);
    assert.deepEqual(result.data, { ok: true });
  });
  const leads = await db.find("leads", {
    registration_id: registration.registration_id,
  });
  assert.equal(leads.length, 1);
  const lead = leads[0];
  leadId = lead.id;
  assert.equal(lead.stage, "New");
  assert.equal(lead.source, "Website");
  assert.equal(lead.whatsapp_consent, false);
  assert.equal(lead.phone, "+919876543210");
  assert.ok(lead.consent_at);
  assert.equal(await db.count("tasks", { lead_id: lead.id }), 1);
  assert.equal((await request("/crm/overview", null, outsider)).status, 403);
});

test("staff brief uses optimistic revisions and invitation excludes internal notes and CRM data", async () => {
  const path = `/crm/leads/${leadId}/discovery`;
  assert.equal((await request(path)).status, 401);
  assert.equal((await request(path, null, outsider)).status, 403);
  const start = await request(path, null, staff);
  assert.equal(start.data.draft.revision, 0);
  const body = {
    revision: 0,
    answers: {
      objectives: "Improve customer onboarding",
      scope: "A shared customer portal",
    },
    internal_notes: "PRIVATE qualification notes",
  };
  const saved = await request(path, body, staff, "PATCH");
  assert.equal(saved.status, 200);
  assert.equal(saved.data.draft.revision, 1);
  assert.equal((await request(path, body, staff, "PATCH")).status, 409);
  assert.equal(
    (await request(path + "/share", { revision: 1 }, outsider)).status,
    403,
  );
  const shared = await request(path + "/share", { revision: 1 }, staff);
  assert.equal(shared.status, 201);
  const token = new URL(shared.data.url).hash.split("=")[1];
  const stored = await db.findOne("discovery_links", { id: shared.data.id });
  assert.equal(stored.token_hash, digest(token));
  assert.ok(!JSON.stringify(stored).includes(token));
  const publicView = await request("/public/discovery/read", { token });
  assert.equal(publicView.status, 200);
  assert.equal(publicView.data.answers.objectives, body.answers.objectives);
  assert.ok(!JSON.stringify(publicView.data).includes("PRIVATE"));
  assert.ok(!JSON.stringify(publicView.data).includes(registration.email));
  const history = await request(path, null, staff);
  assert.ok(!JSON.stringify(history.data).includes(stored.token_hash));
  await request(
    path,
    {
      ...body,
      revision: 1,
      answers: {
        ...body.answers,
        objectives: "A changed internal working draft",
      },
    },
    staff,
    "PATCH",
  );
  assert.equal(
    (await request("/public/discovery/read", { token })).data.answers
      .objectives,
    body.answers.objectives,
  );
  const submission = {
    token,
    name: "Alex Sample",
    consent: true,
    answers: {
      objectives: "Reduce onboarding friction",
      scope: "Build a secure client portal",
    },
  };
  assert.equal(
    (
      await request("/public/discovery/submit", {
        ...submission,
        consent: false,
      })
    ).status,
    400,
  );
  assert.equal(
    (await request("/public/discovery/submit", submission)).status,
    200,
  );
  assert.equal(
    (await request("/public/discovery/submit", submission)).status,
    409,
  );
  const updated = await request(path, null, staff);
  assert.equal(
    updated.data.invitations[0].submission.answers.scope,
    submission.answers.scope,
  );
  assert.equal(updated.data.draft.internal_notes, body.internal_notes);
  assert.equal(
    updated.data.draft.answers.objectives,
    "A changed internal working draft",
  );
});

test("replaced, revoked, expired and invalid invitations deny read and write access", async () => {
  const path = `/crm/leads/${leadId}/discovery`;
  assert.equal(
    (await request(path + "/share", { revision: 1 }, staff)).status,
    409,
  );
  const first = await request(path + "/share", { revision: 2 }, staff);
  const second = await request(path + "/share", { revision: 2 }, staff);
  const token1 = new URL(first.data.url).hash.split("=")[1],
    token2 = new URL(second.data.url).hash.split("=")[1];
  assert.equal(
    (await request("/public/discovery/read", { token: token1 })).status,
    404,
  );
  assert.equal(
    (
      await request("/public/discovery/submit", {
        token: token1,
        name: "Sample",
        consent: true,
        answers: {
          objectives: "A valid objective",
          scope: "A valid project scope",
        },
      })
    ).status,
    404,
  );
  await request(path + "/revoke", { invitation_id: second.data.id }, staff);
  assert.equal(
    (await request("/public/discovery/read", { token: token2 })).status,
    404,
  );
  const third = await request(path + "/share", { revision: 2 }, staff);
  const token3 = new URL(third.data.url).hash.split("=")[1];
  await db.update(
    "discovery_links",
    { id: third.data.id },
    { $set: { expires_at: new Date(Date.now() - 1000) } },
  );
  assert.equal(
    (await request("/public/discovery/read", { token: token3 })).status,
    404,
  );
  assert.equal(
    (await request("/public/discovery/read", { token: "a".repeat(64) })).status,
    404,
  );
});
