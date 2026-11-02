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
const output = "/tmp/sleektech-crm-ui-results";
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
  await rm(join(output, "failure.png"), { force: true });
  const portProbe = createServer().listen(0, "127.0.0.1");
  await new Promise((resolve) => portProbe.once("listening", resolve));
  const port = portProbe.address().port;
  await new Promise((resolve) => portProbe.close(resolve));
  const origin = "http://127.0.0.1:" + port;
  process.env.CRM_ORIGIN = origin;
  db = await database({
    name: "sleektech_crm_ui_browser_" + id().replaceAll("-", ""),
  });
  const users = {};
  for (const role of ["admin", "sales", "other"]) {
    const user = await createUser(db, {
      name: role === "sales" ? "Morgan Seller" : "Socket " + role,
      email: role + "@notification-browser.test",
      password: "Isolated socket browser passphrase",
      role: role === "admin" ? "super_admin" : "sales",
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
  temp = await mkdtemp(join(tmpdir(), "sleektech-crm-ui-preview-"));
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
      viewport: { width: 1680, height: 1000 },
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

  const records = [];
  for (const [company, name, stage, value, owner, next_action] of [
    [
      "Orbit Commerce",
      "Rohan Shah",
      "New",
      500000,
      "Morgan Seller",
      "Schedule introduction",
    ],
    [
      "Aster Health",
      "Sofia Reed",
      "Qualified",
      900000,
      "Morgan Seller",
      "Share technical approach",
    ],
    [
      "Northstar Labs",
      "Maya Kapoor",
      "Qualified",
      800000,
      "Alex Chen",
      "Discovery workshop",
    ],
    [
      "Forma Studio",
      "Arjun Mehta",
      "Proposal",
      600000,
      "Morgan Seller",
      "Review project proposal",
    ],
    [
      "Meridian Group",
      "Ella Chen",
      "Negotiation",
      1300000,
      "Alex Chen",
      "Confirm delivery scope",
    ],
    [
      "Lumen Partners",
      "Samira Khan",
      "Won",
      1100000,
      "Morgan Seller",
      "Kick-off scheduled",
    ],
  ])
    records.push(
      await db.insert("leads", {
        id: id(),
        company,
        name,
        stage,
        value,
        owner,
        next_action,
        email: company.split(" ")[0].toLowerCase() + "@ui-browser.test",
        source: "Referral",
        notes:
          "A connected customer platform for the next phase of growth. Align the delivery roadmap with the client’s operational priorities.",
      }),
    );
  const orbit = records[0],
    aster = records[1];
  const context = await contextFor("admin");
  page = await context.newPage();
  await page.goto(origin + "/pipeline");
  await expect(page.locator(".pipeline-column")).toHaveCount(6, {
    timeout: 45000,
  });
  const tops = await page
    .locator(".pipeline-column")
    .evaluateAll((items) =>
      items.map((item) => item.getBoundingClientRect().top),
    );
  assert.ok(
    tops.every((top) => top === tops[0]),
    "Stages must stay on one row",
  );
  await page.screenshot({
    path: join(output, "pipeline-desktop.png"),
    fullPage: true,
  });
  const card = (record) => page.locator(`[data-lead-id="${record.id}"]`);
  const column = (stage) => page.locator(`[data-stage="${stage}"]`);
  async function drag(record, stage, cancel = false) {
    const handle = await card(record)
      .getByRole("button", { name: "Drag " + record.company })
      .boundingBox();
    const target = await column(stage)
      .locator(".pipeline-column-heading")
      .boundingBox();
    await page.mouse.move(
      handle.x + handle.width / 2,
      handle.y + handle.height / 2,
    );
    await page.mouse.down();
    await page.mouse.move(handle.x + 12, handle.y + 12, { steps: 5 });
    await page.mouse.move(
      target.x + target.width / 2,
      target.y + target.height / 2,
      { steps: 15 },
    );
    if (cancel) await page.keyboard.press("Escape");
    await page.mouse.up();
  }
  await drag(orbit, "Qualified");
  await expect(
    column("Qualified").locator(`[data-lead-id="${orbit.id}"]`),
  ).toBeVisible();
  await expect(page.locator(".pipeline-save-state")).toContainText(
    "Orbit Commerce moved from New to Qualified.",
  );
  assert.equal(
    (await db.findOne("leads", { id: orbit.id })).stage,
    "Qualified",
  );
  await page.reload();
  await expect(
    column("Qualified").locator(`[data-lead-id="${orbit.id}"]`),
  ).toBeVisible();
  checks.push("Mouse drag persists stage changes and survives a full reload");
  await drag(orbit, "Proposal", true);
  await expect(page.locator(".pipeline-save-state")).toContainText(
    "Move cancelled",
  );
  assert.equal(
    (await db.findOne("leads", { id: orbit.id })).stage,
    "Qualified",
  );
  checks.push("Escape cancels dragging without updating the record");
  const selector = card(orbit).getByRole("combobox");
  await selector.focus();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(page.locator(".pipeline-save-state")).toContainText(
    "to Proposal.",
  );
  await expect(
    card(orbit).getByRole("link", { name: orbit.company }),
  ).toBeFocused();
  checks.push(
    "Keyboard stage selection saves and restores focus to the moved opportunity",
  );
  // A rejected write must restore the card and its count/value.
  await page.route("**/api/crm/pipeline/*/stage", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ error: "Test: service unavailable" }),
    }),
  );
  await card(orbit).getByRole("combobox").selectOption("Negotiation");
  await expect(page.locator(".notice.error")).toContainText(
    "Could not move Orbit Commerce",
  );
  await expect(
    column("Proposal").locator(`[data-lead-id="${orbit.id}"]`),
  ).toBeVisible();
  await expect(card(orbit).getByRole("combobox")).toBeEnabled();
  assert.equal((await db.findOne("leads", { id: orbit.id })).stage, "Proposal");
  await page.unroute("**/api/crm/pipeline/*/stage");
  checks.push(
    "Failed saves roll back the optimistic card and re-enable controls",
  );
  const latest = await db.findOne("leads", { id: orbit.id });
  await request(
    `/crm/pipeline/${orbit.id}/stage`,
    { stage: "Negotiation", expected_version: latest.version },
    "sales",
    "PATCH",
  );
  await card(orbit).getByRole("combobox").selectOption("Lost");
  await expect(page.locator(".notice.error")).toContainText(
    "Another teammate updated",
  );
  await expect(
    column("Negotiation").locator(`[data-lead-id="${orbit.id}"]`),
  ).toBeVisible();
  assert.equal(
    (await db.findOne("leads", { id: orbit.id })).stage,
    "Negotiation",
  );
  checks.push(
    "Stale moves show a conflict and reconcile to the teammate’s saved stage",
  );
  await card(orbit).getByRole("combobox").selectOption("Won");
  await expect(page.locator(".pipeline-save-state")).toContainText(
    "Customer created.",
  );
  const customer = await db.findOne("clients", { lead_id: orbit.id });
  assert.ok(customer);
  await expect(card(orbit).getByRole("combobox")).toHaveCount(0);
  checks.push(
    "Moving to Won creates the customer and locks the converted stage",
  );
  for (let index = 0; index < 16; index++)
    await db.insert("leads", {
      id: id(),
      name: "Paging Contact " + index,
      company: "Paging Company " + index,
      email: `paging${index}@ui-browser.test`,
      value: 100,
      stage: "New",
    });
  await page.getByRole("button", { name: "Refresh pipeline" }).click();
  await expect(column("New").locator(".pipeline-count")).toHaveText("17");
  await expect(column("New").locator(".opportunity-card")).toHaveCount(12);
  await column("New").getByRole("button", { name: "Load more" }).click();
  await expect(column("New").locator(".opportunity-card")).toHaveCount(17);
  await page.getByPlaceholder("Search contacts or companies…").fill("Aster");
  await expect(column("Qualified").locator(".pipeline-count")).toHaveText("1");
  await expect(page.locator(".opportunity-card")).toHaveCount(1);
  checks.push(
    "Per-stage load more and debounced search keep accurate totals beyond the initial batch",
  );
  await page.getByPlaceholder("Search contacts or companies…").fill("");
  await expect(column("New").locator(".pipeline-count")).toHaveText("17");
  const pipelineAxe = await new AxeBuilder({ page }).analyze();
  assert.deepEqual(
    pipelineAxe.violations
      .filter((item) => ["critical", "serious"].includes(item.impact))
      .map((item) => ({
        id: item.id,
        nodes: item.nodes.map((node) => node.target),
      })),
    [],
  );
  await page.goto(origin + `/leads/${aster.id}?from=%2Fpipeline`);
  await expect(
    page.getByRole("heading", { name: "Aster Health", exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("Add a comment", { exact: true })).toBeVisible();
  assert.equal(
    await page
      .locator(".record-content input, .record-content textarea")
      .count(),
    0,
    "Details stay read-only",
  );
  const summary = await page.locator(".record-content").boundingBox();
  const discussion = await page.locator(".discussion").boundingBox();
  assert.ok(summary.height < 430, "Summary should not waste vertical space");
  assert.ok(discussion.y < 650, "Collaboration should be close to the summary");
  await page.screenshot({
    path: join(output, "opportunity-desktop.png"),
    fullPage: true,
  });
  await page
    .getByLabel("Add a comment", { exact: true })
    .fill("Review the revised scope with the client.");
  await page.getByRole("button", { name: "Post comment", exact: true }).click();
  await expect(page.locator(".comment")).toHaveCount(1);
  await page.getByRole("button", { name: "Reply", exact: true }).click();
  await page
    .getByLabel("Your reply")
    .fill("Confirmed for the next discovery call.");
  await page.getByRole("button", { name: "Post reply", exact: true }).click();
  await expect(page.locator(".comment-replies .comment")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Activity timeline", exact: true })
    .click();
  await expect(page.locator(".record-timeline")).toContainText("Comment added");
  await page
    .getByRole("button", { name: "Edit opportunity", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Save changes", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Team workspace" }),
  ).toBeVisible();
  checks.push(
    "Compact read-only details preserve editing, comments, replies and activity history",
  );
  await db.insert("projects", {
    id: id(),
    client_id: customer.id,
    name: "Customer experience platform",
    owner: "Alex Chen",
    description:
      "Build a unified service experience across customer touchpoints.",
    status: "In progress",
    progress: 42,
    due_date: "2026-12-10",
  });
  await page.goto(origin + `/customers/${customer.id}`);
  await expect(
    page.getByRole("heading", { name: "Orbit Commerce", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Customer experience platform", { exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: join(output, "customer-desktop.png"),
    fullPage: true,
  });
  for (const route of [
    "/",
    "/leads",
    "/customers",
    "/projects",
    "/tasks",
    "/communications",
    "/users",
    "/integrations",
  ]) {
    await page.goto(origin + route);
    await expect(page.locator(".workspace-main h1")).toBeVisible();
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth + 1,
      ),
      false,
      route + " must not overflow the viewport",
    );
  }
  await page.goto(origin + "/leads");
  await expect(page.locator("tbody tr").first()).toBeVisible();
  assert.ok((await page.locator("tbody tr").first().boundingBox()).height < 76);
  await page.screenshot({
    path: join(output, "leads-desktop.png"),
    fullPage: true,
  });
  checks.push(
    "Overview, directories, tasks, communications, users and integrations use the compact shell without page overflow",
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(origin + `/customers/${customer.id}`);
  await expect(
    page.getByRole("heading", { name: "Orbit Commerce", exact: true }),
  ).toBeVisible();
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth + 1,
    ),
    false,
  );
  const detailsAxe = await new AxeBuilder({ page }).analyze();
  assert.deepEqual(
    detailsAxe.violations
      .filter((item) => ["critical", "serious"].includes(item.impact))
      .map((item) => item.id),
    [],
  );
  await page.screenshot({
    path: join(output, "customer-mobile.png"),
    fullPage: true,
  });
  await page.goto(origin + "/pipeline");
  await expect(page.locator(".pipeline-column")).toHaveCount(6);
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth + 1,
    ),
    false,
  );
  await page
    .getByRole("combobox", { name: "Filter pipeline stage" })
    .selectOption("Qualified");
  await expect(page.locator(".pipeline-column")).toHaveCount(1);
  await card(aster).getByRole("combobox").selectOption("Proposal");
  await expect(page.locator(".pipeline-save-state")).toContainText(
    "Aster Health moved from Qualified to Proposal.",
  );
  await page
    .getByRole("combobox", { name: "Filter pipeline stage" })
    .selectOption("Proposal");
  await expect(card(aster)).toBeVisible();
  await page.screenshot({
    path: join(output, "pipeline-mobile.png"),
    fullPage: true,
  });
  checks.push(
    "Mobile layouts contain overflow, stage selection persists, and pipeline/details have no serious or critical axe violations",
  );

  // Pointer events from a touch device use the same handle, without stealing
  // scrolling from the rest of the card/board.
  const touchContext = await browser.newContext({
    viewport: { width: 900, height: 900 },
    hasTouch: true,
    isMobile: true,
    reducedMotion: "reduce",
  });
  await touchContext.addCookies([
    {
      name: "sleektech_session",
      value: users.admin.token,
      url: origin,
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
  const touchPage = await touchContext.newPage();
  touchPage.on("pageerror", (error) => errors.push(error.message));
  await touchPage.goto(origin + "/pipeline");
  const touchRecord = await db.findOne("leads", {
    company: "Paging Company 15",
  });
  const touchCard = touchPage.locator(`[data-lead-id="${touchRecord.id}"]`);
  await expect(touchCard).toBeVisible();
  const grip = await touchCard
    .getByRole("button", { name: "Drag " + touchRecord.company })
    .boundingBox();
  const destination = await touchPage
    .locator('[data-stage="Qualified"] .pipeline-column-heading')
    .boundingBox();
  const cdp = await touchContext.newCDPSession(touchPage);
  const x1 = grip.x + grip.width / 2,
    y1 = grip.y + grip.height / 2;
  const x2 = destination.x + destination.width / 2,
    y2 = destination.y + destination.height / 2;
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: x1, y: y1 }],
  });
  for (let step = 1; step <= 12; step++) {
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [
        { x: x1 + ((x2 - x1) * step) / 12, y: y1 + ((y2 - y1) * step) / 12 },
      ],
    });
    await delay(20);
  }
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await expect(touchPage.locator(".pipeline-save-state")).toContainText(
    "moved from New to Qualified.",
  );
  assert.equal(
    (await db.findOne("leads", { id: touchRecord.id })).stage,
    "Qualified",
  );
  await touchContext.close();
  checks.push("A real touch pointer drag saves the stage through the API");
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
