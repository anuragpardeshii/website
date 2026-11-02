import { test } from "node:test";
import assert from "node:assert/strict";
import { allowedOrigins } from "../src/origins.mjs";
import { createApp } from "../src/app.mjs";
const env = {
  NODE_ENV: "development",
  CRM_ORIGIN: "http://127.0.0.1:33003",
  TALENT_ORIGIN: "http://127.0.0.1:33004",
  MARKETING_ORIGIN: "http://127.0.0.1:35175",
};
test("CORS and WebSocket origin policies follow selected ports with exact loopback aliases", () => {
  const origins = allowedOrigins(undefined, env);
  for (const port of [33003, 33004, 35175])
    for (const hostname of ["localhost", "127.0.0.1", "[::1]"])
      assert.ok(origins.has(`http://${hostname}:${port}`));
  for (const value of [
    "http://localhost:3001",
    "http://localhost:33005",
    "https://attacker.test",
    "http://localhost:33003.attacker.test",
    "null",
  ])
    assert.equal(origins.has(value), false);
  const socket = allowedOrigins(["CRM_ORIGIN"], env);
  assert.ok(socket.has("http://localhost:33003"));
  assert.equal(socket.has(env.TALENT_ORIGIN), false);
});
test("production accepts only configured exact origins", () => {
  const origins = allowedOrigins(undefined, { ...env, NODE_ENV: "production" });
  assert.equal(origins.size, 3);
  assert.equal(origins.has("http://localhost:33003"), false);
  for (const value of [
    "http://user:password@localhost:33003",
    "https://example.test/path",
    "https://example.test?query=1",
    "file:///tmp",
  ])
    assert.throws(() =>
      allowedOrigins(["CRM_ORIGIN"], { ...env, CRM_ORIGIN: value }),
    );
});
test("shifted-origin preflight and CSRF accept selected ports and reject unknown ports", async () => {
  const before = Object.fromEntries(
    Object.keys(env).map((key) => [key, process.env[key]]),
  );
  Object.assign(process.env, env);
  const server = createApp({}).listen(0, "127.0.0.1");
  try {
    await new Promise((resolve) => server.once("listening", resolve));
    const base = "http://127.0.0.1:" + server.address().port;
    for (const origin of [
      env.CRM_ORIGIN,
      "http://localhost:33003",
      env.TALENT_ORIGIN,
      env.MARKETING_ORIGIN,
    ]) {
      const preflight = await fetch(base + "/api/auth/login", {
        method: "OPTIONS",
        headers: { Origin: origin },
      });
      assert.equal(preflight.status, 204);
      assert.equal(
        preflight.headers.get("access-control-allow-origin"),
        origin,
      );
      assert.equal(
        preflight.headers.get("access-control-allow-credentials"),
        "true",
      );
      const post = await fetch(base + "/api/auth/login", {
        method: "POST",
        headers: {
          Origin: origin,
          "X-Sleektech-Request": "1",
          "Content-Type": "application/json",
        },
        body: "{}",
      });
      assert.equal(
        post.status,
        400,
        "Passed CSRF; fails expected input validation",
      );
    }
    for (const origin of [
      "http://localhost:33005",
      "http://localhost:3001",
      "https://attacker.test",
    ]) {
      const response = await fetch(base + "/api/auth/login", {
        method: "OPTIONS",
        headers: { Origin: origin },
      });
      assert.equal(response.status, 403);
      assert.equal(response.headers.get("access-control-allow-origin"), null);
      const post = await fetch(base + "/api/auth/login", {
        method: "POST",
        headers: {
          Origin: origin,
          "X-Sleektech-Request": "1",
          "Content-Type": "application/json",
        },
        body: "{}",
      });
      assert.equal(post.status, 403);
    }
  } finally {
    await new Promise((resolve) => {
      server.close(resolve);
      server.closeAllConnections();
    });
    for (const [key, value] of Object.entries(before))
      value === undefined
        ? delete process.env[key]
        : (process.env[key] = value);
  }
});
