// Requires MongoDB and the CRM UI at CRM_TEST_URL (defaults to local dev).
// All API operations use an isolated database and are removed after verification.
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, stat, mkdir, writeFile } from "node:fs/promises";
import { resolve, extname } from "node:path";
import { chromium, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { database, id } from "../../backend/src/db.mjs";
import { createApp } from "../../backend/src/app.mjs";
import { createUser } from "../../backend/src/auth.mjs";

let db, apiServer, siteServer, browser;
const output = resolve("test-results");
const report = { checks: [], accessibility: [], errors: [] };
const oldOrigin = process.env.MARKETING_ORIGIN;
try {
  await mkdir(output, { recursive: true });
  const types = {
    ".html": "text/html",
    ".js": "text/javascript",
    ".css": "text/css",
    ".woff2": "font/woff2",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".webp": "image/webp",
    ".ico": "image/x-icon",
  };
  siteServer = createServer(async (req, res) => {
    let path = resolve(
      "dist",
      "." + new URL(req.url, "http://localhost").pathname,
    );
    if (path !== resolve("dist") && !path.startsWith(resolve("dist") + "/")) {
      res.writeHead(403).end();
      return;
    }
    try {
      if ((await stat(path)).isDirectory()) path = resolve(path, "index.html");
      const content = await readFile(path);
      res
        .writeHead(200, {
          "Content-Type": types[extname(path)] || "application/octet-stream",
        })
        .end(content);
    } catch {
      res.writeHead(404).end();
    }
  });
  await new Promise((done) => siteServer.listen(0, "127.0.0.1", done));
  const site = `http://127.0.0.1:${siteServer.address().port}`;
  process.env.MARKETING_ORIGIN = site;
  db = await database({
    name: "sleektech_browser_discovery_" + id().replaceAll("-", ""),
  });
  await createUser(db, {
    name: "Discovery Tester",
    email: "discovery@example.test",
    password: "browser-discovery-test-password",
    role: "sales",
  });
  apiServer = createApp(db).listen(0, "127.0.0.1");
  await new Promise((done) => apiServer.once("listening", done));
  const apiBase = `http://127.0.0.1:${apiServer.address().port}`;
  browser = await chromium.launch({
    executablePath: "/usr/bin/google-chrome",
    headless: true,
    args: ["--no-sandbox"],
  });
  const client = await browser.newContext({
    viewport: { width: 1440, height: 1100 },
    reducedMotion: "reduce",
  });
  const staff = await browser.newContext({
    viewport: { width: 1440, height: 1100 },
    reducedMotion: "reduce",
  });
  for (const context of [client, staff])
    await context.route("**/api/**", async (route) => {
      const url = new URL(route.request().url());
      const response = await route.fetch({
        url: apiBase + url.pathname + url.search,
      });
      await route.fulfill({ response });
    });
  const page = await client.newPage(),
    crm = await staff.newPage();
  for (const p of [page, crm]) {
    p.setDefaultTimeout(20000);
    p.on("pageerror", (error) => report.errors.push(error.message));
  }
  async function axe(p, label, selector) {
    let check = new AxeBuilder({ page: p }).withTags([
      "wcag2a",
      "wcag2aa",
      "wcag21aa",
    ]);
    if (selector) check = check.include(selector);
    const result = await check.analyze();
    report.accessibility.push({
      label,
      violations: result.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.target),
      })),
    });
  }
  await page.goto(site);
  await page.locator(".what-we-build").scrollIntoViewIfNeeded();
  await page
    .locator(".what-we-build")
    .screenshot({ path: resolve(output, "solutions-gallery-desktop.png") });
  await page.setViewportSize({ width: 390, height: 844 });
  await page
    .locator(".what-we-build")
    .screenshot({ path: resolve(output, "solutions-gallery-mobile.png") });
  await page.goto(site + "/contact");
  await page.getByLabel("Your name").fill("Alex Client");
  await page.getByLabel("Email address").fill("alex.client@example.test");
  await page
    .getByLabel("Company", { exact: false })
    .fill("Example Discovery Studio");
  await page.getByLabel("Phone", { exact: false }).fill("+91 98765 43210");
  await page
    .locator('select[name="interest"]')
    .selectOption({ label: "CRM Development" });
  await page.getByRole("checkbox").check();
  await page.screenshot({
    path: resolve(output, "registration-mobile.png"),
    fullPage: true,
  });
  await axe(page, "Mobile registration");
  await page
    .getByRole("button", { name: "Let’s start a conversation" })
    .click();
  await expect(
    page.getByRole("heading", { name: "You’re on our radar." }),
  ).toBeVisible();
  const lead = await db.findOne("leads", { email: "alex.client@example.test" });
  assert.equal(lead.source, "Website");
  assert.equal(lead.stage, "New");
  assert.ok(lead.consent_at);
  report.checks.push(
    "Mobile registration persists a website lead and follow-up",
  );

  await crm.goto(process.env.CRM_TEST_URL || "http://127.0.0.1:3001");
  await crm.getByLabel("Email address").fill("discovery@example.test");
  await crm
    .getByLabel("Password", { exact: true })
    .fill("browser-discovery-test-password");
  await crm.getByRole("button", { name: "Sign in", exact: true }).click();
  await crm
    .getByRole("navigation", { name: "CRM navigation" })
    .getByRole("button", { name: "All leads", exact: true })
    .click();
  await expect(
    crm.getByText("Example Discovery Studio", { exact: true }),
  ).toBeVisible();
  await crm.getByRole("button", { name: "Open brief", exact: true }).click();
  await crm
    .getByLabel("Business objectives")
    .fill("Create a clear customer onboarding experience.");
  await crm
    .getByLabel("Scope & priorities")
    .fill("A client portal with shared project milestones and approvals.");
  await crm
    .getByLabel("Internal team notes")
    .fill("PRIVATE: internal qualification notes.");
  await crm.getByRole("button", { name: "Save brief", exact: true }).click();
  await expect(
    crm.getByText("Discovery brief saved.", { exact: true }),
  ).toBeVisible();
  await axe(crm, "CRM discovery dialog", "dialog");
  await crm
    .getByRole("button", { name: "Create client invitation", exact: true })
    .click();
  const invitation = crm.getByLabel("Private client invitation", {
    exact: true,
  });
  await expect(invitation).toHaveValue(/\/discovery#token=/);
  const invitationURL = await invitation.inputValue();
  await crm
    .getByRole("button", { name: "Prepare email draft", exact: true })
    .click();
  await expect(
    crm.getByRole("button", { name: "Email draft ready" }),
  ).toBeDisabled();
  const messages = await db.find("messages", { lead_id: lead.id });
  assert.equal(messages.length, 1);
  assert.equal(messages[0].status, "Draft");
  assert.ok(messages[0].body.includes(invitationURL));
  report.checks.push(
    "CRM saves private notes, creates an expiring invitation and an unsent email draft",
  );
  await crm
    .locator("dialog")
    .screenshot({ path: resolve(output, "crm-discovery-desktop.png") });

  await page.goto(invitationURL);
  await expect(page.getByLabel("What would you like to achieve?")).toHaveValue(
    "Create a clear customer onboarding experience.",
  );
  assert.ok(!(await page.locator("body").innerText()).includes("PRIVATE"));
  await page
    .getByLabel("What should we build?")
    .fill(
      "A customer portal with project status, file sharing, and approvals.",
    );
  await page.getByLabel("Your name").fill("Alex Client");
  await page.getByRole("checkbox").check();
  await axe(page, "Client discovery form");
  await page
    .getByRole("button", { name: "Share with the team", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Your perspective is in the picture." }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Your perspective is in the picture." }),
  ).toBeVisible();
  await crm.reload();
  await crm
    .getByRole("navigation", { name: "CRM navigation" })
    .getByRole("button", { name: "All leads", exact: true })
    .click();
  await crm.getByRole("button", { name: "Open brief", exact: true }).click();
  await expect(
    crm.getByText("Response received", { exact: true }),
  ).toBeVisible();
  await crm
    .getByText("View response from Alex Client", { exact: true })
    .click();
  await expect(
    crm.getByText(
      "A customer portal with project status, file sharing, and approvals.",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(crm.getByLabel("Internal team notes")).toHaveValue(
    "PRIVATE: internal qualification notes.",
  );
  await crm.setViewportSize({ width: 390, height: 844 });
  assert.equal(
    await crm.evaluate(() => document.documentElement.scrollWidth > innerWidth),
    false,
  );
  await axe(crm, "Mobile CRM discovery", "dialog");
  report.checks.push(
    "Client response survives refresh and is visible to staff without overwriting the working brief",
  );
  assert.deepEqual(report.errors, []);
  assert.deepEqual(
    report.accessibility.flatMap((r) => r.violations),
    [],
  );
  console.log(JSON.stringify(report, null, 2));
} finally {
  await writeFile(
    resolve(output, "lead-journey-verification.json"),
    JSON.stringify(report, null, 2),
  );
  await browser?.close();
  if (apiServer) await new Promise((done) => apiServer.close(done));
  if (siteServer) await new Promise((done) => siteServer.close(done));
  if (db) {
    await db.native.dropDatabase();
    await db.close();
  }
  if (oldOrigin === undefined) delete process.env.MARKETING_ORIGIN;
  else process.env.MARKETING_ORIGIN = oldOrigin;
}
