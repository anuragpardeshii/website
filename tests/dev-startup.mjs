import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import {
  mkdtemp,
  mkdir,
  cp,
  symlink,
  rm,
  appendFile,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as delay } from "node:timers/promises";
import { WebSocket } from "ws";
import { chromium, expect } from "@playwright/test";
import { database, id } from "../backend/src/db.mjs";
import { createUser } from "../backend/src/auth.mjs";
import { notify } from "../backend/src/record-events.mjs";
const root = fileURLToPath(new URL("../", import.meta.url));
const output = "/tmp/sleektech-port-tests";
const blockers = [],
  launches = [],
  checks = [];
let temp, db, browser;
const waitFor = async (fn, description, ms = 60000) => {
  const until = Date.now() + ms;
  while (Date.now() < until) {
    if (await fn()) return;
    await delay(200);
  }
  throw new Error("Timed out: " + description);
};
const listen = (port) =>
  new Promise((resolve, reject) => {
    const server = createServer((socket) => socket.destroy());
    server.once("error", reject);
    server.listen(port, "127.0.0.1", () => resolve(server));
  });
const healthy = async (url) => {
  try {
    const response = await fetch(url + "/api/health", {
      signal: AbortSignal.timeout(2000),
    });
    return response.ok && (await response.json()).service === "sleektech-api";
  } catch {
    return false;
  }
};
async function start() {
  const child = spawn(process.execPath, [join(temp, "scripts/dev.mjs")], {
    cwd: temp,
    env: {
      ...process.env,
      MONGODB_DATABASE: db.name,
      API_PORT: "4000",
      CRM_PORT: "3001",
      CAREERS_PORT: "3002",
      WEBSITE_PORT: "5173",
      NEXT_TELEMETRY_DISABLED: "1",
    },
    stdio: ["ignore", "pipe", "pipe"],
    detached: true,
  });
  const instance = {
    child,
    log: "",
    urls: {},
    ended: new Promise((resolve) => child.once("exit", resolve)),
  };
  launches.push(instance);
  for (const stream of [child.stdout, child.stderr])
    stream.on("data", (data) => {
      instance.log += data;
    });
  await waitFor(() => {
    if (child.exitCode !== null) throw new Error(instance.log);
    for (const label of ["API", "CRM", "Careers", "Website"]) {
      const match = instance.log.match(
        new RegExp("^" + label + ": (http://127\\.0\\.0\\.1:\\d+)", "m"),
      );
      if (match) instance.urls[label] = match[1];
    }
    return Object.keys(instance.urls).length === 4;
  }, "selected URLs");
  await waitFor(async () => {
    if (child.exitCode !== null) throw new Error(instance.log);
    return (await Promise.all(Object.values(instance.urls).map(healthy))).every(
      Boolean,
    );
  }, "four apps proxy to the selected API");
  return instance;
}
async function stop(instance) {
  if (instance.child.exitCode !== null || instance.child.signalCode !== null)
    return;
  instance.child.kill("SIGTERM");
  await Promise.race([
    instance.ended,
    delay(12000).then(() => {
      throw new Error("Launcher failed to shut down: " + instance.log);
    }),
  ]);
  assert.equal(instance.child.exitCode, 0);
  assert.doesNotMatch(
    instance.log,
    /Assertion failed|EADDRINUSE|Failed to start server|Unable to acquire lock/,
  );
}
async function socketAt(url, cookie, origin) {
  const socket = new WebSocket(
    url.replace("http:", "ws:") + "/api/collaboration/notifications/socket",
    { origin, headers: { Cookie: cookie } },
  );
  const messages = [];
  socket.on("error", () => {});
  socket.on("message", (data) => messages.push(JSON.parse(data)));
  try {
    await waitFor(
      () => messages.some((item) => item.type === "notifications:ready"),
      "socket handshake",
      12000,
    );
  } catch (error) {
    socket.terminate();
    throw error;
  }
  return { socket, messages };
}
try {
  await mkdir(output, { recursive: true });
  // Do not stop unrelated listeners: reserve a default only when it is free.
  for (const port of [3001, 3002, 4000, 5173]) {
    try {
      blockers.push(await listen(port));
    } catch (error) {
      if (error.code !== "EADDRINUSE") throw error;
    }
  }
  temp = await mkdtemp(join(tmpdir(), "sleektech-dev-startup-"));
  const filter = (source) => {
    const name = source.split("/").at(-1);
    return (
      !["node_modules", ".data", ".git", "test-results"].includes(name) &&
      !name.startsWith(".next") &&
      !name.startsWith(".env") &&
      !name.endsWith(".tsbuildinfo") &&
      !["dist", ".prerender"].includes(name)
    );
  };
  for (const folder of [
    "scripts",
    "backend",
    "crm",
    "careers",
    "shared",
    "sleektech-site",
  ])
    await cp(join(root, folder), join(temp, folder), {
      recursive: true,
      filter,
    });
  for (const file of ["package.json", "package-lock.json"])
    await cp(join(root, file), join(temp, file));
  await symlink(join(root, "node_modules"), join(temp, "node_modules"), "dir");
  await symlink(
    join(root, "sleektech-site/node_modules"),
    join(temp, "sleektech-site/node_modules"),
    "dir",
  );
  db = await database({
    name: "sleektech_dev_startup_" + id().replaceAll("-", ""),
  });
  const password = "Isolated port fallback test passphrase";
  const admin = await createUser(db, {
    name: "Port Test Admin",
    email: "admin@port-tests.test",
    password,
    role: "super_admin",
  });
  const first = await start();
  for (const [name, port] of [
    ["API", 4000],
    ["CRM", 3001],
    ["Careers", 3002],
    ["Website", 5173],
  ])
    assert.notEqual(new URL(first.urls[name]).port, String(port));
  checks.push(
    "All four occupied default ports fall back and every frontend proxies to the selected backend",
  );
  for (const name of ["CRM", "Careers", "Website"]) {
    for (const origin of [
      first.urls[name],
      first.urls[name].replace("127.0.0.1", "localhost"),
    ]) {
      const response = await fetch(first.urls.API + "/api/auth/login", {
        method: "OPTIONS",
        headers: { Origin: origin },
      });
      assert.equal(response.status, 204);
      assert.equal(response.headers.get("access-control-allow-origin"), origin);
    }
  }
  const denied = await fetch(first.urls.API + "/api/auth/login", {
    method: "OPTIONS",
    headers: { Origin: "http://localhost:59999" },
  });
  assert.equal(denied.status, 403);
  checks.push(
    "CORS allows selected ports and localhost aliases while denying unconfigured origins",
  );
  const response = await fetch(first.urls.CRM + "/api/auth/login", {
    method: "POST",
    headers: {
      Origin: first.urls.CRM,
      "X-Sleektech-Request": "1",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: admin.email, password }),
  });
  assert.equal(response.status, 200);
  const cookie = response.headers.get("set-cookie").split(";")[0];
  const connection = await socketAt(
    first.urls.CRM,
    cookie,
    first.urls.CRM.replace("127.0.0.1", "localhost"),
  );
  await notify(
    db,
    admin.id,
    { id: id(), name: "Port Test Actor" },
    "assignment",
    "tasks",
    id(),
    "Shifted socket delivery",
  );
  await waitFor(
    () =>
      connection.messages.some((item) => item.type === "notifications:changed"),
    "socket delivery",
  );
  connection.socket.close();
  checks.push(
    "Login passes CSRF and live notification WebSockets work through the shifted CRM proxy",
  );
  browser = await chromium.launch({
    executablePath: process.env.SLEEKTECH_CHROME || "/usr/bin/google-chrome",
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  const context = await browser.newContext();
  await context.addCookies([
    {
      name: "sleektech_session",
      value: cookie.split("=")[1],
      url: first.urls.CRM,
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(first.urls.CRM + "/notifications");
  await expect(page.getByText("Live updates", { exact: true })).toBeVisible({
    timeout: 45000,
  });
  await expect(
    page.locator('a[href="' + first.urls.Careers + '/manage"]'),
  ).toBeVisible();
  await page.goto(first.urls.Careers + "/manage");
  await expect(page.locator(".sidebar")).toBeVisible({ timeout: 45000 });
  await expect(page.locator('a[href="' + first.urls.CRM + '"]')).toBeVisible();
  await page.goto(first.urls.Website + "/careers");
  await expect(page.locator("body")).toContainText("Careers");
  assert.deepEqual(errors, []);
  checks.push(
    "CRM and careers render successfully and their cross-portal links use the selected ports",
  );
  const starts = (first.log.match(/Backend: starting with hot reload/g) || [])
    .length;
  await appendFile(
    join(temp, "backend/src/origins.mjs"),
    "\n// Isolated hot-reload verification.\n",
  );
  await waitFor(
    () =>
      (first.log.match(/Backend: starting with hot reload/g) || []).length >
      starts,
    "backend hot reload",
  );
  await waitFor(() => healthy(first.urls.API), "API recovery after hot reload");
  checks.push(
    "A source change restarts the API cleanly and releases its previous listener",
  );
  const second = await start();
  assert.equal(
    new Set([...Object.values(first.urls), ...Object.values(second.urls)]).size,
    8,
  );
  await page.goto(second.urls.CRM + "/notifications");
  await expect(page.getByText("Live updates", { exact: true })).toBeVisible({
    timeout: 45000,
  });
  await page.goto(second.urls.Careers + "/manage");
  await expect(page.locator(".sidebar")).toBeVisible({ timeout: 45000 });
  checks.push(
    "A second stack starts alongside the first with independent ports and Next development directories",
  );
  await browser.close();
  browser = null;
  await stop(second);
  assert.ok(await healthy(first.urls.CRM));
  await stop(first);
  for (const instance of [first, second])
    for (const url of Object.values(instance.urls)) {
      const released = await listen(Number(new URL(url).port));
      await new Promise((resolve) => released.close(resolve));
    }
  checks.push(
    "Shutdown releases all owned ports, leaves the other stack running, and produces no native watcher assertion",
  );
  await writeFile(
    join(output, "results.json"),
    JSON.stringify({ checks, first: first.urls, second: second.urls }, null, 2),
  );
  console.log(
    JSON.stringify(
      { passed: checks.length, checks, artifacts: output },
      null,
      2,
    ),
  );
} finally {
  await browser?.close();
  for (const [index, instance] of launches.entries()) {
    await writeFile(join(output, `launcher-${index}.log`), instance.log);
    await stop(instance).catch((error) => {
      console.error(error.message);
      try {
        process.kill(-instance.child.pid, "SIGKILL");
      } catch {}
    });
  }
  for (const server of blockers)
    await new Promise((resolve) => server.close(resolve));
  if (db) {
    await db.native.dropDatabase();
    await db.close();
  }
  if (temp) await rm(temp, { recursive: true, force: true });
}
