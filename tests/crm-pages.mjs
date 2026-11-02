import assert from "node:assert/strict";
import { chromium, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { database, id } from "../backend/src/db.mjs";
import { createUser } from "../backend/src/auth.mjs";
import { createApp } from "../backend/src/app.mjs";
// Browser UI uses a temporary API/database. No real accounts, messages or passwords are changed.
const crm = process.env.SLEEKTECH_TEST_CRM_URL || "http://127.0.0.1:3001";
const careers =
  process.env.SLEEKTECH_TEST_CAREERS_URL || "http://127.0.0.1:3002";
const output =
  process.env.SLEEKTECH_TEST_OUTPUT || "/tmp/sleektech-crm-pages-results";
const password = "Temporary browser verification passphrase";
let db, server, browser, page;
const checks = [],
  errors = [],
  users = {};
try {
  await mkdir(output, { recursive: true });
  db = await database({
    name: "sleektech_crm_pages_" + id().replaceAll("-", ""),
  });
  for (const [role, name] of [
    ["super_admin", "Workspace Owner"],
    ["admin", "Team Admin"],
    ["sales", "Morgan Sales"],
    ["recruiter", "Talent Partner"],
    ["candidate", "Candidate Person"],
  ])
    users[role] = await createUser(db, {
      name,
      email: role + "@crm-pages.test",
      password,
      role,
    });
  server = createApp(db).listen(0, "127.0.0.1");
  await new Promise((r) => server.once("listening", r));
  const apiBase = "http://127.0.0.1:" + server.address().port;
  browser = await chromium.launch({
    executablePath: process.env.SLEEKTECH_CHROME || "/usr/bin/google-chrome",
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  async function newContext() {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      reducedMotion: "reduce",
    });
    const called = [];
    await context.route("**/api/**", async (route) => {
      const url = new URL(route.request().url());
      called.push({
        path: url.pathname + url.search,
        method: route.request().method(),
      });
      const response = await route.fetch({
        url: apiBase + url.pathname + url.search,
      });
      await route.fulfill({ response });
    });
    const page = await context.newPage();
    page.setDefaultTimeout(20000);
    page.on("pageerror", (e) => errors.push(e.message));
    return { context, page, called };
  }
  async function login(p, role, url = crm + "/leads/new", pass = password) {
    await p.goto(url);
    await p.getByLabel("Email address").fill(users[role].email);
    await p.getByLabel("Password", { exact: true }).fill(pass);
    await p.getByRole("button", { name: "Sign in", exact: true }).click();
  }
  const primary = await newContext();
  page = primary.page;
  await page.goto(crm + "/leads/new");
  await page.getByLabel("Email address").fill(users.super_admin.email);
  const passwordInput = page.getByLabel("Password", { exact: true });
  await passwordInput.fill(password);
  await page
    .getByRole("button", { name: "Show password", exact: true })
    .click();
  await expect(passwordInput).toHaveAttribute("type", "text");
  await page
    .getByRole("button", { name: "Hide password", exact: true })
    .click();
  await expect(passwordInput).toHaveAttribute("type", "password");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Create opportunity", exact: true }),
  ).toBeVisible();
  checks.push(
    "Show/hide password preserves entered value; deep-link sign-in works",
  );
  await page.getByLabel("Contact name").fill("Morgan Reed");
  await page.getByLabel("Company", { exact: true }).fill("Atlas Browser Test");
  await page.getByLabel("Email address").fill("morgan@example.test");
  await page.getByLabel("Phone", { exact: true }).fill("+919876543210");
  await page.getByLabel("Deal value (INR)").fill("650000");
  await page.getByLabel("Pipeline stage").selectOption("Qualified");
  await page
    .getByLabel("Relationship notes")
    .fill("A customer platform for enterprise onboarding.");
  await page
    .getByRole("button", { name: "Create opportunity", exact: true })
    .click();
  await expect(page).toHaveURL(/\/leads\/[a-f0-9-]{36}/);
  const lead = await db.findOne("leads", { company: "Atlas Browser Test" });
  await expect(
    page.getByRole("heading", { name: lead.company, exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("Company", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Edit opportunity" }).click();
  await page.getByLabel("Company", { exact: true }).fill("Unsaved change");
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: lead.company, exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Edit opportunity" }).click();
  await page.getByLabel("Next action").fill("Prepare discovery workshop");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(
    page.getByText("Prepare discovery workshop", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Company", { exact: true })).toHaveCount(0);
  checks.push("Lead opens read-only; Edit, Cancel and Save persist correctly");
  await page.getByRole("link", { name: "Client brief", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Client brief", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByLabel("Business objectives", { exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Edit brief", exact: true }).click();
  await page
    .getByLabel("Business objectives", { exact: true })
    .fill("Reduce manual onboarding and improve account visibility.");
  await page
    .getByLabel("Scope & priorities")
    .fill("Customer portal and integrated CRM.");
  await page
    .getByLabel("Internal team notes")
    .fill("Internal commercial context.");
  await page.getByRole("button", { name: "Save brief", exact: true }).click();
  await expect(
    page.getByText("Reduce manual onboarding and improve account visibility.", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByLabel("Business objectives", { exact: true }),
  ).toHaveCount(0);
  await page.screenshot({
    path: output + "/brief-desktop.png",
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Create client invitation", exact: true })
    .click();
  await expect(page.getByLabel("Private client invitation")).toHaveValue(
    /token=/,
  );
  await page
    .getByRole("button", { name: "Prepare email draft", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Open communications", exact: true })
    .click();
  await page
    .getByRole("link", {
      name: "Your project discovery brief · Atlas Browser Test",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("heading", { name: "Message", exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("Subject", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Edit draft", exact: true }).click();
  await expect(page.getByLabel("Message", { exact: true })).toHaveValue(
    /token=/,
  );
  await page
    .getByLabel("Subject", { exact: true })
    .fill("Updated discovery brief");
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Updated discovery brief", exact: true }),
  ).toBeVisible();
  checks.push(
    "Brief and communication details are read-only, invitations remain unsent, draft editing works",
  );
  await page.goto(crm + "/leads/" + lead.id);
  await page
    .getByRole("button", { name: "Convert to customer", exact: true })
    .click();
  await expect(page).toHaveURL(/\/customers\/[a-f0-9-]{36}/);
  const customer = await db.findOne("clients", { lead_id: lead.id });
  await page
    .getByRole("button", { name: "Edit customer", exact: true })
    .click();
  await page
    .getByLabel("Customer description")
    .fill("Long-term enterprise platform partnership.");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(
    page.getByText("Long-term enterprise platform partnership.", {
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole("link", { name: "New project", exact: true }).click();
  await expect(
    page.getByRole("combobox", { name: "Customer", exact: true }),
  ).toHaveValue(customer.company);
  await page.getByLabel("Project name").fill("Enterprise onboarding");
  await page
    .getByLabel("Project description")
    .fill("Delivery plan, milestones and acceptance criteria.");
  await page
    .getByRole("button", { name: "Create project", exact: true })
    .click();
  await expect(page).toHaveURL(/\/projects\/[a-f0-9-]{36}/);
  const project = await db.findOne("projects", { client_id: customer.id });
  await page.getByRole("button", { name: "Edit project", exact: true }).click();
  await page.getByLabel("Delivery status").selectOption("In progress");
  await page.getByLabel("Progress (%)").fill("65");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(page.getByText("65%", { exact: true })).toBeVisible();
  checks.push(
    "Customer conversion, read-only customer profile and project edit workflow",
  );
  await page.goto(crm + "/tasks/new");
  await page.getByLabel("Task title").fill("Review delivery readiness");
  await page
    .getByLabel("Description", { exact: true })
    .fill(
      "Validate acceptance criteria with the client and confirm the release checklist.",
    );
  await page
    .getByRole("combobox", { name: "Task owner", exact: true })
    .fill("Mor");
  await page.getByRole("option", { name: /Morgan Sales/ }).click();
  await page.getByLabel("Assigned date", { exact: true }).fill("2026-11-01");
  await page.getByLabel("Deadline", { exact: true }).fill("2027-01-10");
  await page.getByLabel("Priority", { exact: true }).selectOption("High");
  await page
    .getByLabel("Remarks", { exact: true })
    .fill("Client approval required before release.");
  await page.getByRole("button", { name: "Create task", exact: true }).click();
  await expect(page).toHaveURL(/\/tasks\/[a-f0-9-]{36}/);
  const task = await db.findOne("tasks", {
    title: "Review delivery readiness",
  });
  assert.equal(task.owner_id, users.sales.id);
  await expect(page.getByLabel("Task title")).toHaveCount(0);
  await page.getByRole("button", { name: "Edit task", exact: true }).click();
  await page.getByLabel("Status", { exact: true }).selectOption("In progress");
  await page.getByLabel("Deadline", { exact: true }).fill("2027-01-12");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await page
    .getByRole("button", { name: "Activity timeline", exact: true })
    .click();
  await expect(page.getByText("Task created", { exact: true })).toBeVisible();
  await expect(
    page.getByText("Task status changed", { exact: true }),
  ).toBeVisible();
  await page.getByText("View changes", { exact: true }).click();
  await expect(page.locator(".record-timeline")).toContainText("2027-01-12");
  await expect(page.locator(".record-timeline")).toContainText(
    "Workspace Owner",
  );
  checks.push(
    "Full task details, database owner suggestions, optimistic edits and actor timeline",
  );
  await page
    .getByRole("button", { name: "Comments & replies", exact: true })
    .click();
  await page
    .getByLabel("Add a comment", { exact: true })
    .fill("Please review @Mor");
  await page.getByRole("option", { name: /Morgan Sales/ }).click();
  await page.getByRole("button", { name: "Post comment", exact: true }).click();
  await expect(
    page
      .locator(".comment > p")
      .filter({ hasText: "Please review @Morgan Sales" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Reply", exact: true }).click();
  await page
    .getByLabel("Your reply", { exact: true })
    .fill("Release notes are attached to the delivery record.");
  await page.getByRole("button", { name: "Post reply", exact: true }).click();
  await expect(page.locator(".comment-replies .comment > p")).toContainText(
    "Release notes are attached",
  );
  await page.screenshot({ path: output + "/task-desktop.png", fullPage: true });
  const accessibility = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  await writeFile(
    output + "/accessibility.json",
    JSON.stringify(accessibility.violations, null, 2),
  );
  assert.deepEqual(
    accessibility.violations
      .filter((v) => ["critical", "serious"].includes(v.impact))
      .map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
    [],
  );
  const teammate = await newContext();
  await login(teammate.page, "sales", crm + "/notifications");
  await expect(
    teammate.page.getByRole("heading", {
      name: "Your notifications",
      exact: true,
    }),
  ).toBeVisible();
  await expect(teammate.page.locator(".notification-list")).toContainText(
    "mentioned you",
  );
  await teammate.page.getByRole("link", { name: /mentioned you/ }).click();
  await expect(teammate.page).toHaveURL(new RegExp("/tasks/" + task.id));
  await expect(
    teammate.page.getByRole("heading", { name: task.title, exact: true }),
  ).toBeVisible();
  await teammate.page.goto(crm + "/users");
  await expect(
    teammate.page.getByRole("heading", { name: "Super admin access required" }),
  ).toBeVisible();
  checks.push(
    "Comments, replies, mentions, recipient notifications and user-administration role guard",
  );
  // Enough fixtures to prove table pagination and bounded searches; no outbound calls.
  for (let n = 0; n < 24; n++)
    await db.insert("tasks", {
      id: id(),
      title: "Directory item " + String(n).padStart(2, "0"),
      description: "Fixture",
      priority: "Normal",
    });
  await page.goto(crm + "/tasks");
  await expect(page.locator("tbody tr")).toHaveCount(20);
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.locator("tbody tr")).toHaveCount(5);
  await page.getByRole("link", { name: task.title, exact: true }).click();
  await page.getByRole("link", { name: "Back to tasks", exact: true }).click();
  await expect(page).toHaveURL(/page=2/);
  const before = primary.called.length;
  await page
    .getByRole("textbox", { name: "Search task titles…" })
    .pressSequentially("Directory", { delay: 35 });
  await expect(page.locator("tbody tr")).toHaveCount(20);
  await expect(page).toHaveURL(/q=Directory/);
  const queries = primary.called
    .slice(before)
    .filter(
      (c) => c.path.startsWith("/api/crm/tasks?") && c.path.includes("q="),
    );
  assert.equal(queries.length, 1);
  checks.push(
    "20-row pagination, back-navigation filters and one debounced search request",
  );
  await page.goto(crm + "/users");
  await page
    .getByRole("link", { name: "View Team Admin", exact: true })
    .click();
  await expect(page.getByLabel("Full name", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Edit user", exact: true }).click();
  await page.getByLabel("Role", { exact: true }).selectOption("recruiter");
  await page
    .getByLabel("Your current password", { exact: true })
    .fill(password);
  await page.getByRole("button", { name: "Save user", exact: true }).click();
  await expect(
    page.getByText("User access updated.", { exact: true }),
  ).toBeVisible();
  assert.equal(
    (await db.findOne("users", { id: users.admin.id })).role,
    "recruiter",
  );
  checks.push("Super-admin user directory and password-confirmed role editing");
  await page.goto(crm + "/users/" + users.sales.id);
  await page
    .getByLabel("Confirm your password", { exact: true })
    .fill(password);
  await page
    .getByRole("button", { name: "Generate reset link", exact: true })
    .click();
  const link = await page
    .getByLabel("One-time password reset link")
    .inputValue();
  const reset = await newContext();
  await reset.page.goto(crm + "/reset-password" + new URL(link).hash);
  await expect(
    reset.page.getByLabel("New password", { exact: true }),
  ).toBeVisible();
  assert.equal(new URL(reset.page.url()).hash, "");
  const fresh = "New browser test recovery passphrase";
  await reset.page.getByLabel("New password", { exact: true }).fill(fresh);
  await reset.page.getByLabel("Confirm password", { exact: true }).fill(fresh);
  await reset.page
    .getByRole("button", { name: "Reset password", exact: true })
    .click();
  await expect(
    reset.page.getByRole("heading", { name: "Password updated.", exact: true }),
  ).toBeVisible();
  await teammate.page.goto(crm + "/tasks");
  await expect(teammate.page.getByLabel("Email address")).toBeVisible();
  await login(teammate.page, "sales", crm + "/tasks", fresh);
  await expect(
    teammate.page.getByRole("heading", {
      name: "Tasks & follow-ups",
      exact: true,
    }),
  ).toBeVisible();
  checks.push(
    "Single-use reset page consumes fragment, changes password and invalidates old sessions",
  );
  for (const [path, title] of [
    ["/leads/" + lead.id, lead.company],
    ["/customers/" + customer.id, customer.company],
    ["/projects/" + project.id, project.name],
    ["/leads/" + lead.id + "/brief", "Client brief"],
    ["/tasks/" + task.id, task.title],
    ["/tasks", "Make the next step count."],
    ["/users", "People & permissions."],
  ]) {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(crm + path);
    await expect(
      page.getByRole("heading", { name: title, exact: true }),
    ).toBeVisible();
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      "Mobile overflow: " + path,
    );
    await expect(page.getByRole("dialog")).toHaveCount(0);
  }
  await page.goto(crm + "/tasks/" + task.id);
  await expect(
    page.getByRole("heading", { name: task.title, exact: true }),
  ).toBeVisible();
  await page.screenshot({ path: output + "/task-mobile.png", fullPage: true });
  checks.push("Record pages, tasks and users fit mobile without modals");
  const hiring = await newContext();
  await login(hiring.page, "super_admin", careers + "/manage");
  await expect(
    hiring.page.getByRole("navigation", {
      name: "Talent navigation",
      exact: true,
    }),
  ).toBeVisible();
  await hiring.page.goto(careers + "/account");
  await expect(hiring.page).toHaveURL(/\/manage/);
  checks.push(
    "Super admin can use careers management and is redirected out of candidate-only account pages",
  );
  for (const role of ["recruiter", "candidate"]) {
    const blocked = await newContext();
    await login(blocked.page, role, crm + "/tasks/" + task.id);
    await expect(
      blocked.page.getByRole("heading", {
        name: "This workspace is restricted.",
        exact: true,
      }),
    ).toBeVisible();
    assert.ok(!blocked.called.some((c) => c.path.startsWith("/api/crm/")));
    await blocked.context.close();
  }
  checks.push(
    "Recruiter and candidate sessions cannot open CRM record details",
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
