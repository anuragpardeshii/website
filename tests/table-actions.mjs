import assert from "node:assert/strict";
import { chromium, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";
import { database, id } from "../backend/src/db.mjs";
import { createApp } from "../backend/src/app.mjs";
import { createUser } from "../backend/src/auth.mjs";
const crm = process.env.SLEEKTECH_TEST_CRM_URL || "http://127.0.0.1:3001";
const careers =
  process.env.SLEEKTECH_TEST_CAREERS_URL || "http://127.0.0.1:3002";
const output = "/tmp/sleektech-table-actions-results";
const password = "Temporary table navigation passphrase";
let db, server, browser, page;
const checks = [],
  errors = [],
  called = [];
try {
  await mkdir(output, { recursive: true });
  db = await database({
    name: "sleektech_table_actions_" + id().replaceAll("-", ""),
  });
  const owner = await createUser(db, {
    email: "owner@table-actions.test",
    name: "Workspace Owner",
    password,
    role: "super_admin",
  });
  const candidate = await createUser(db, {
    email: "candidate@table-actions.test",
    name: "Jordan Candidate",
    password,
    role: "candidate",
  });
  const lead = await db.insert("leads", {
    id: id(),
    name: "Alex Contact",
    company: "Atlas Action Test",
    email: "alex@example.test",
    stage: "Qualified",
  });
  const customer = await db.insert("clients", {
    id: id(),
    lead_id: lead.id,
    name: lead.name,
    company: lead.company,
    email: lead.email,
  });
  const task = await db.insert("tasks", {
    id: id(),
    title: "Review action navigation",
    owner_id: owner.id,
    owner: owner.name,
    created_by: owner.id,
    description: "Confirm every listed record opens from its View action.",
  });
  const message = await db.insert("messages", {
    id: id(),
    lead_id: lead.id,
    channel: "email",
    subject: "Action review message",
    body: "Private detail content.",
    status: "Draft",
  });
  const jobs = [];
  for (const status of ["Draft", "Published", "Closed"])
    jobs.push(
      await db.insert("jobs", {
        id: id(),
        slug: "table-action-" + status.toLowerCase(),
        title: status + " platform role",
        status,
        department: "Engineering",
        location: "Remote",
        employment_type: "Full-time",
        work_mode: "Remote",
        description:
          "Build dependable customer platforms and own the quality of the delivery lifecycle.",
        requirements:
          "Experience in accessible web interfaces, TypeScript and collaborative product development.",
      }),
    );
  const application = await db.insert("applications", {
    id: id(),
    job_id: jobs[1].id,
    user_id: candidate.id,
    profile: {
      name: candidate.name,
      email: candidate.email,
      experience: "5 years",
      skills: "TypeScript, React",
      summary: "Building considered customer experiences.",
    },
    stage: "Applied",
  });
  server = createApp(db).listen(0, "127.0.0.1");
  await new Promise((r) => server.once("listening", r));
  const apiBase = "http://127.0.0.1:" + server.address().port;
  browser = await chromium.launch({
    executablePath: process.env.SLEEKTECH_CHROME || "/usr/bin/google-chrome",
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  await context.route("**/api/**", async (route) => {
    const url = new URL(route.request().url());
    called.push(url.pathname);
    const response = await route.fetch({
      url: apiBase + url.pathname + url.search,
    });
    await route.fulfill({ response });
  });
  page = await context.newPage();
  page.setDefaultTimeout(20000);
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(crm + "/leads");
  await page.getByLabel("Email address").fill(owner.email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(
    page.getByRole("navigation", { name: "CRM navigation" }),
  ).toBeVisible();
  for (const [list, record, title, viewName] of [
    [
      "/leads?q=Atlas&stage=Qualified",
      "/leads/" + lead.id,
      lead.company,
      "View " + lead.company,
    ],
    [
      "/customers?q=Atlas",
      "/customers/" + customer.id,
      customer.company,
      "View " + customer.company,
    ],
    [
      "/tasks?q=Review&priority=Normal",
      "/tasks/" + task.id,
      task.title,
      "View " + task.title,
    ],
    [
      "/communications?q=Action&channel=email",
      "/communications/" + message.id,
      message.subject,
      "View " + message.subject,
    ],
    [
      "/users?q=Workspace&role=super_admin",
      "/users/" + owner.id,
      owner.name,
      "View " + owner.name,
    ],
  ]) {
    await page.goto(crm + list);
    await expect(page.locator("thead th").last()).toHaveText("Actions");
    await expect(page.locator("tbody .table-view")).toHaveCount(1);
    const action = page.getByRole("link", { name: viewName, exact: true });
    await expect(action).toHaveText("View");
    const target = new URL(await action.getAttribute("href"), crm);
    assert.equal(target.pathname, record);
    assert.equal(target.searchParams.get("from"), list);
    await action.focus();
    await page.keyboard.press("Enter");
    await expect(
      page.getByRole("heading", { name: title, exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await page.locator(".record-back").click();
    await expect(page).toHaveURL(crm + list);
    checks.push(
      "CRM View action: " +
        record.split("/")[1] +
        " preserves filters and opens the matching record",
    );
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(crm + "/tasks");
  await expect(page.locator("tbody .table-view")).toBeVisible();
  const rect = await page.locator("tbody .table-view").boundingBox();
  assert.ok(
    rect.x >= 0 && rect.x + rect.width <= 390,
    "View action must remain visible on a narrow table",
  );
  await page.locator("tbody .table-view").click();
  await expect(
    page.getByRole("heading", { name: task.title, exact: true }),
  ).toBeVisible();
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  checks.push("Sticky table action remains reachable on mobile");
  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const job of jobs) {
    const list =
      careers +
      "/manage?" +
      new URLSearchParams({ view: "jobs", q: job.status });
    await page.goto(list);
    await expect(page.locator("thead th").last()).toHaveText("Actions");
    const prior = called.length;
    await page
      .getByRole("link", { name: "View " + job.title, exact: true })
      .click();
    await expect(page).toHaveURL(new RegExp("/manage/jobs/" + job.id));
    await expect(
      page.getByRole("heading", { name: job.title, exact: true }),
    ).toBeVisible();
    await expect(page.getByLabel("Job title", { exact: true })).toHaveCount(0);
    await expect(page.getByRole("dialog")).toHaveCount(0);
    assert.ok(
      !called.slice(prior).includes("/api/talent/overview"),
      "Detail should fetch only its record",
    );
    if (job.status === "Draft") {
      await page
        .getByRole("button", { name: "Edit role", exact: true })
        .click();
      await page
        .getByLabel("Job title", { exact: true })
        .fill("Unsaved role name");
      await page.getByRole("button", { name: "Cancel", exact: true }).click();
      await expect(
        page.getByRole("heading", { name: job.title, exact: true }),
      ).toBeVisible();
      await page
        .getByRole("button", { name: "Edit role", exact: true })
        .click();
      await page.getByLabel("Compensation range (optional)").fill("₹18–25 LPA");
      await page
        .getByRole("button", { name: "Save role", exact: true })
        .click();
      await expect(
        page.getByText("Role updated.", { exact: true }),
      ).toBeVisible();
      await expect(page.getByText("₹18–25 LPA", { exact: true })).toBeVisible();
      await page.reload();
      await expect(page.getByText("₹18–25 LPA", { exact: true })).toBeVisible();
      await page.screenshot({
        path: output + "/role-details.png",
        fullPage: true,
      });
    }
    await page
      .getByRole("link", { name: "Back to role management", exact: true })
      .click();
    await expect(page).toHaveURL(list);
    await expect(
      page.getByRole("textbox", { name: "Search roles…" }),
    ).toHaveValue(job.status);
    checks.push(
      "Careers View action: " +
        job.status +
        " role opens a private detail page",
    );
  }
  const candidateList =
    careers +
    "/manage?" +
    new URLSearchParams({
      view: "candidates",
      layout: "List",
      q: "Jordan",
      role: jobs[1].id,
    });
  await page.goto(candidateList);
  await expect(page.locator("thead th").last()).toHaveText("Actions");
  await page
    .getByRole("link", {
      name: "View Jordan Candidate application",
      exact: true,
    })
    .click();
  await expect(page).toHaveURL(
    new RegExp("/manage/applications/" + application.id),
  );
  await expect(
    page.getByRole("heading", {
      name: "Jordan Candidate",
      exact: true,
      level: 1,
    }),
  ).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByText("Building considered customer experiences.", {
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Decision", exact: true }).click();
  await page.getByLabel("Next stage").selectOption("Screening");
  await page
    .getByLabel("Decision rationale")
    .fill("Reviewed experience against the role requirements.");
  await page
    .getByRole("button", { name: "Record decision", exact: true })
    .click();
  await expect(
    page.getByText("Selection stage updated.", { exact: true }),
  ).toBeVisible();
  assert.equal(
    (await db.findOne("applications", { id: application.id })).stage,
    "Screening",
  );
  await page
    .getByRole("link", { name: "Back to candidates", exact: true })
    .click();
  await expect(page).toHaveURL(candidateList);
  await expect(
    page.getByRole("textbox", { name: "Search candidates or skills…" }),
  ).toHaveValue("Jordan");
  await expect(page.getByLabel("Filter by role")).toHaveValue(jobs[1].id);
  checks.push(
    "Candidate View opens full application page, keeps decision actions and restores list filters",
  );
  // The same candidate-table renderer is used for overview and hiring outcomes.
  await page.goto(careers + "/manage");
  await expect(page.locator("tbody .table-view")).toHaveCount(1);
  await page.locator("tbody .table-view").click();
  await expect(
    page.getByRole("link", { name: "Back to hiring overview", exact: true }),
  ).toBeVisible();
  await db.update(
    "applications",
    { id: application.id },
    { $set: { stage: "Hired" } },
  );
  await page.goto(careers + "/manage?view=decisions");
  await expect(page.locator("thead th").last()).toHaveText("Actions");
  await page.locator("tbody .table-view").click();
  await expect(
    page.getByRole("link", { name: "Back to hiring outcomes", exact: true }),
  ).toBeVisible();
  checks.push(
    "Overview and hiring-outcome tables expose the same record View action",
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(careers + "/manage/jobs/" + jobs[0].id);
  await expect(
    page.getByRole("heading", { name: jobs[0].title, exact: true }),
  ).toBeVisible();
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  await page.screenshot({ path: output + "/role-mobile.png", fullPage: true });
  const axe = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  assert.deepEqual(
    axe.violations
      .filter((v) => ["critical", "serious"].includes(v.impact))
      .map((v) => v.id),
    [],
  );
  checks.push(
    "Role details are responsive and pass serious/critical axe checks",
  );
  await page.goto(
    careers + "/manage/jobs/" + jobs[0].id + "?from=https://example.com",
  );
  await expect(
    page.getByRole("link", { name: "Back to role management", exact: true }),
  ).toHaveAttribute("href", "/manage?view=jobs");
  await page.goto(careers + "/manage/jobs/" + id());
  await expect(page.locator(".talent-record").getByRole("alert")).toHaveText("Role not found.");
  checks.push(
    "Invalid record IDs and external return links are handled safely",
  );
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify(
      {
        passed: checks.length,
        checks,
        browserErrors: errors,
        screenshots: output,
      },
      null,
      2,
    ),
  );
} catch (error) {
  await page
    ?.screenshot({ path: output + "/failure.png", fullPage: true })
    .catch(() => {});
  console.error(JSON.stringify({ completed: checks, error: String(error) }));
  throw error;
} finally {
  await browser?.close();
  if (server)
    await new Promise((r) => {
      server.close(r);
      server.closeAllConnections();
    });
  if (db) {
    await db.native.dropDatabase();
    await db.close();
  }
}
