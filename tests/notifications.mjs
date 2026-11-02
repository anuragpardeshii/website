import assert from "node:assert/strict";
import { chromium, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { cp, mkdir, mkdtemp, symlink, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { randomBytes } from "node:crypto";
import { setTimeout as delay } from "node:timers/promises";
import { database, id } from "../backend/src/db.mjs";
import { createApp } from "../backend/src/app.mjs";
import { createUser, digest } from "../backend/src/auth.mjs";
import {
  attachNotificationSocket,
  notificationSocketPath,
} from "../backend/src/notification-socket.mjs";
import { notify } from "../backend/src/record-events.mjs";
const root = fileURLToPath(new URL("../", import.meta.url));
const output = "/tmp/sleektech-notifications-results";
const checks = [],
  errors = [];
let db,
  server,
  hub,
  browser,
  frontend,
  temp,
  page,
  log = "";
const previousOrigin = process.env.CRM_ORIGIN;
try {
  await mkdir(output, { recursive: true });
  const portProbe = createServer().listen(0, "127.0.0.1");
  await new Promise((resolve) => portProbe.once("listening", resolve));
  const port = portProbe.address().port;
  await new Promise((resolve) => portProbe.close(resolve));
  const origin = "http://127.0.0.1:" + port;
  process.env.CRM_ORIGIN = origin;
  db = await database({
    name: "sleektech_notification_browser_" + id().replaceAll("-", ""),
  });
  const users = {};
  for (const role of ["admin", "sales", "other"]) {
    const user = await createUser(db, {
      name: role === "sales" ? "Morgan Seller" : "Socket " + role,
      email: role + "@notification-browser.test",
      password: "Isolated socket browser passphrase",
      role: role === "other" ? "sales" : role,
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
  const lead = await db.insert("leads", {
    id: id(),
    name: "Alex Contact",
    company: "Northstar Socket Review",
    email: "alex@notification-browser.test",
  });
  server = createApp(db).listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  const apiBase = "http://127.0.0.1:" + server.address().port;
  hub = await attachNotificationSocket(server, db);
  const request = async (path, body, role = "admin", method = "POST") => {
    const response = await fetch(apiBase + "/api" + path, {
      method,
      headers: {
        Origin: origin,
        "X-Sleektech-Request": "1",
        "Content-Type": "application/json",
        Cookie: "sleektech_session=" + users[role].token,
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const result = await response.json();
    assert.ok(response.ok, JSON.stringify(result));
    return result;
  };
  // An owned Next instance exercises the actual rewrite/upgrade path against an
  // isolated database without altering or stopping the developer's running apps.
  temp = await mkdtemp(join(tmpdir(), "sleektech-notification-preview-"));
  await cp(join(root, "crm"), join(temp, "crm"), {
    recursive: true,
    filter: (source) => {
      const name = source.split("/").at(-1);
      return (
        !["node_modules", ".git"].includes(name) &&
        !name.startsWith(".next") &&
        !name.startsWith(".env")
      );
    },
  });
  await cp(join(root, "package.json"), join(temp, "package.json"));
  await cp(join(root, "package-lock.json"), join(temp, "package-lock.json"));
  await symlink(join(root, "node_modules"), join(temp, "node_modules"), "dir");
  await symlink(join(root, "shared"), join(temp, "shared"), "dir");
  frontend = spawn(
    process.execPath,
    [
      join(root, "node_modules/next/dist/bin/next"),
      "dev",
      "--webpack",
      "-p",
      String(port),
      "-H",
      "127.0.0.1",
    ],
    {
      cwd: join(temp, "crm"),
      env: {
        ...process.env,
        NODE_ENV: "development",
        API_URL: apiBase,
        NEXT_TELEMETRY_DISABLED: "1",
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  for (const stream of [frontend.stdout, frontend.stderr])
    stream.on("data", (chunk) => {
      log += chunk;
    });
  const deadline = Date.now() + 90000;
  while (true) {
    if (frontend.exitCode !== null)
      throw new Error("Owned Next server exited: " + log.slice(-5000));
    try {
      if ((await fetch(origin + "/api/health")).ok) break;
    } catch {}
    if (Date.now() > deadline)
      throw new Error("Next startup timed out: " + log.slice(-5000));
    await delay(300);
  }
  browser = await chromium.launch({
    executablePath: process.env.SLEEKTECH_CHROME || "/usr/bin/google-chrome",
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  const contextFor = async (role) => {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      reducedMotion: "reduce",
    });
    await context.addCookies([
      {
        name: "sleektech_session",
        value: users[role].token,
        url: origin,
        httpOnly: true,
        sameSite: "Lax",
      },
    ]);
    context.on("page", (item) =>
      item.on("pageerror", (error) => errors.push(error.message)),
    );
    return context;
  };
  const recipient = await contextFor("sales"),
    outsider = await contextFor("other");
  page = await recipient.newPage();
  const frames = [],
    sockets = [];
  page.on("websocket", (socket) => {
    if (!socket.url().endsWith(notificationSocketPath)) return;
    sockets.push(socket.url());
    socket.on("framereceived", (event) =>
      frames.push(JSON.parse(String(event.payload))),
    );
  });
  await page.goto(origin + "/notifications");
  await expect(page.getByText("Live updates", { exact: true })).toBeVisible({
    timeout: 45000,
  });
  assert.ok(
    sockets.some((url) => url.startsWith(origin.replace("http:", "ws:"))),
  );
  assert.ok(frames.some((message) => message.type === "notifications:ready"));
  checks.push(
    "Browser establishes authenticated WebSocket through the real Next.js API rewrite",
  );
  const tab = await recipient.newPage(),
    other = await outsider.newPage();
  await tab.goto(origin + "/notifications");
  await other.goto(origin + "/notifications");
  await expect(tab.getByText("Live updates", { exact: true })).toBeVisible();
  await expect(other.getByText("Live updates", { exact: true })).toBeVisible();
  const post = (body, parent_id = null) =>
    request(`/collaboration/records/leads/${lead.id}/comments`, {
      body,
      parent_id,
      mention_ids: [users.sales.id],
      request_id: id(),
    });
  await post("@Morgan Seller please review the client request.");
  for (const item of [page, tab]) {
    await expect(item.locator(".notification-open")).toHaveCount(1);
    await expect(item.locator(".notification-link b")).toHaveText("1");
  }
  await expect(other.locator(".notification-open")).toHaveCount(0);
  assert.ok(frames.some((message) => message.type === "notifications:changed"));
  checks.push(
    "A committed mention updates the bell and open list in two recipient tabs, with no event for another user",
  );
  await page.getByRole("button", { name: "Mark read", exact: true }).click();
  await expect(tab.locator(".notification-list .unread")).toHaveCount(0);
  await expect(tab.locator(".notification-link b")).toHaveCount(0);
  checks.push("Mark read synchronizes between tabs over the socket");
  const roots = [];
  for (let index = 0; index < 12; index++)
    roots.push(
      await db.insert("comments", {
        id: id(),
        record_type: "leads",
        record_id: lead.id,
        author_id: users.admin.id,
        author_name: users.admin.name,
        body: "Planning note " + index,
        parent_id: null,
        mentions: [],
        reply_count: index === 11 ? 12 : 0,
        request_id: id(),
        created_at: new Date(Date.now() - 20000 + index * 100),
      }),
    );
  for (let index = 0; index < 12; index++)
    await db.insert("comments", {
      id: id(),
      record_type: "leads",
      record_id: lead.id,
      author_id: users.admin.id,
      author_name: users.admin.name,
      body: "Thread context " + index,
      parent_id: roots[11].id,
      mentions: [],
      reply_count: 0,
      request_id: id(),
      created_at: new Date(Date.now() - 10000 + index * 100),
    });
  await post("@Morgan Seller this is the final scoped reply.", roots[11].id);
  await expect(page.locator(".notification-open")).toHaveCount(2);
  await page.locator(".notification-open").first().focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(new RegExp(`/leads/${lead.id}\\?`));
  await expect(page.locator(".comment-highlight > p")).toHaveText(
    "@Morgan Seller this is the final scoped reply.",
  );
  await expect(page.locator(".comment-highlight")).toBeFocused();
  assert.ok(
    await page.locator(".comment-highlight").evaluate((element) => {
      const box = element.getBoundingClientRect();
      return box.top >= 0 && box.bottom <= innerHeight;
    }),
  );
  await page.screenshot({
    path: join(output, "mentioned-reply-desktop.png"),
    fullPage: true,
  });
  await page.reload();
  await expect(page.locator(".comment-highlight > p")).toHaveText(
    "@Morgan Seller this is the final scoped reply.",
  );
  await page.locator(".record-back").click();
  await expect(page).toHaveURL(origin + "/notifications");
  checks.push(
    "Keyboard click opens, scrolls to and focuses a reply on page 2 of a thread on page 2; refresh and back links work",
  );
  await request("/crm/tasks", {
    title: "Confirm production readiness",
    owner_id: users.sales.id,
  });
  const task = await db.findOne("tasks", {
    title: "Confirm production readiness",
  });
  await expect(page.locator(".notification-open")).toHaveCount(3);
  await page
    .locator(".notification-open")
    .first()
    .click({ position: { x: 20, y: 20 } });
  await expect(page).toHaveURL(new RegExp("/tasks/" + task.id));
  await expect(
    page.getByRole("heading", { name: task.title, exact: true }),
  ).toBeVisible();
  checks.push(
    "Clicking a notification's avatar/background opens its assigned task details",
  );
  await page.goto(origin + "/notifications");
  await expect(page.getByText("Live updates", { exact: true })).toBeVisible();
  await recipient.setOffline(true);
  await expect(
    page.getByText("You’re offline. Updates will resume when connected."),
  ).toBeVisible();
  await notify(
    db,
    users.sales.id,
    users.admin,
    "assignment",
    "tasks",
    task.id,
    "Update received while offline",
  );
  await recipient.setOffline(false);
  await expect(page.getByText("Live updates", { exact: true })).toBeVisible({
    timeout: 15000,
  });
  await expect(
    page.getByText("Update received while offline", { exact: true }),
  ).toBeVisible();
  checks.push(
    "Offline recovery reconnects and catches up persisted notifications without polling",
  );
  // Restart only the isolated socket hub: validates server interruption recovery.
  await hub.close();
  hub = await attachNotificationSocket(server, db);
  await expect(page.getByText("Live updates", { exact: true })).toBeVisible({
    timeout: 15000,
  });
  await notify(
    db,
    users.sales.id,
    users.admin,
    "assignment",
    "tasks",
    task.id,
    "Socket server recovered",
  );
  await expect(
    page.getByText("Socket server recovered", { exact: true }),
  ).toBeVisible();
  checks.push(
    "Socket server restart reconnects automatically and resumes delivery",
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator(".notification-open").first()).toBeVisible();
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  const accessibility = await new AxeBuilder({ page }).analyze();
  await writeFile(
    join(output, "accessibility.json"),
    JSON.stringify(accessibility.violations, null, 2),
  );
  assert.deepEqual(
    accessibility.violations
      .filter((item) => ["critical", "serious"].includes(item.impact))
      .map((item) => item.id),
    [],
  );
  await page.screenshot({
    path: join(output, "notifications-mobile.png"),
    fullPage: true,
  });
  checks.push(
    "Notification list works on mobile and has no critical or serious axe violations",
  );
  // No event or user interaction: check requests over the former polling interval.
  let counts = 0;
  page.on("request", (req) => {
    if (req.url().includes("/notifications/count")) counts++;
  });
  await delay(800);
  const before = counts;
  await delay(31000);
  assert.equal(
    counts,
    before,
    "Unread counts must not be polled every 30 seconds",
  );
  checks.push(
    "An idle connected browser makes no notification polling requests across 31 seconds",
  );
  assert.deepEqual(errors, []);
  await writeFile(
    join(output, "results.json"),
    JSON.stringify({ checks, errors }, null, 2),
  );
  console.log(
    JSON.stringify(
      { passed: checks.length, checks, artifacts: output },
      null,
      2,
    ),
  );
} catch (error) {
  await page
    ?.screenshot({ path: join(output, "failure.png"), fullPage: true })
    .catch(() => {});
  console.error(log.slice(-8000));
  throw error;
} finally {
  await browser?.close();
  if (frontend && frontend.exitCode === null) {
    frontend.kill("SIGTERM");
    await Promise.race([
      new Promise((resolve) => frontend.once("exit", resolve)),
      delay(8000),
    ]);
    if (frontend.exitCode === null) frontend.kill("SIGKILL");
  }
  await hub?.close();
  if (server)
    await new Promise((resolve) => {
      server.close(resolve);
      server.closeAllConnections();
    });
  if (db) {
    await db.native.dropDatabase();
    await db.close();
  }
  if (temp) await rm(temp, { recursive: true, force: true });
  if (previousOrigin === undefined) delete process.env.CRM_ORIGIN;
  else process.env.CRM_ORIGIN = previousOrigin;
}
