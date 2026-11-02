import assert from "node:assert/strict";
import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { fixturePDF } from "./fixture-pdf.mjs";

const crm = "http://127.0.0.1:3001",
  talent = "http://127.0.0.1:3002";
const output = new URL("../test-results/", import.meta.url).pathname;
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.SLEEKTECH_CHROME || "/usr/bin/google-chrome",
  headless: true,
  args: ["--no-sandbox"],
});
const report = { checks: [], accessibility: [], consoleErrors: [] };
const staff = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: "reduce",
});
const candidate = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: "reduce",
});
const page = await staff.newPage();
const person = await candidate.newPage();
for (const p of [page, person]) p.setDefaultTimeout(15000);
for (const p of [page, person])
  p.on("pageerror", (e) => report.consoleErrors.push(e.message));
const suffix = Date.now().toString().slice(-7);
const company = "QA Studio " + suffix;
const name = "QA Candidate " + suffix;
const email = "candidate" + suffix + "@example.test";
async function checkAxe(p, label) {
  const results = await new AxeBuilder({ page: p })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  report.accessibility.push({
    label,
    violations: results.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    })),
  });
}
async function screenshot(p, name) {
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: output + name + ".png", fullPage: true });
}
try {
  await page.goto(crm);
  await page.getByRole("button", { name: "Enter demo workspace" }).click();
  await page
    .getByRole("heading", { name: "Every relationship. One clear view." })
    .waitFor();
  await screenshot(page, "crm-overview-desktop");
  await checkAxe(page, "CRM overview desktop");
  await page.getByRole("button", { name: "New lead", exact: true }).click();
  await page.getByLabel("Contact name").fill("Taylor QA");
  await page.getByLabel("Company", { exact: true }).fill(company);
  await page.getByLabel("Email address").fill("qa" + suffix + "@example.test");
  await page.getByLabel("Deal value (INR)").fill("650000");
  await page.getByLabel("Next action").fill("Review the discovery brief");
  await page.getByRole("button", { name: "Save opportunity" }).click();
  await page.waitForURL(/\/leads\/[a-f0-9-]{36}/);
  await page
    .getByRole("navigation", { name: "CRM navigation" })
    .getByRole("link", { name: "All leads", exact: true })
    .click();
  await page.getByRole("textbox", { name: "Search records…" }).fill(company);
  await page.getByRole("link", { name: new RegExp(company) }).click();
  await page.getByLabel("Pipeline stage").selectOption("Qualified");
  await page.getByRole("button", { name: "Save opportunity" }).click();
  await page.getByText("Opportunity updated.", { exact: true }).waitFor();
  await page.getByRole("button", { name: "Convert to customer" }).click();
  await page.waitForURL(/\/customers\/[a-f0-9-]{36}/);
  await page.getByRole("link", { name: "Customers", exact: true }).click();
  await page.getByRole("textbox", { name: "Search customers…" }).fill(company);
  await page.getByRole("button", { name: "Project", exact: true }).click();
  await page.getByLabel("Project name").fill("QA customer portal " + suffix);
  await page
    .getByRole("button", { name: "Create project", exact: true })
    .click();
  await page.waitForURL(/\/projects\/[a-f0-9-]{36}/);
  await page
    .getByRole("link", { name: "Active projects", exact: true })
    .click();
  await page
    .getByRole("heading", { name: "QA customer portal " + suffix, exact: true })
    .waitFor();
  report.checks.push(
    "Lead creation → qualification → customer conversion → delivery project",
  );
  await page.getByRole("link", { name: "Communications", exact: true }).click();
  await page.getByRole("link", { name: "Compose", exact: true }).click();
  await page
    .getByLabel("Subject", { exact: true })
    .fill("A thoughtful follow-up");
  await page
    .getByLabel("Message", { exact: true })
    .fill("Thank you for the conversation. Let us review the next steps.");
  assert.equal(
    await page
      .getByRole("button", { name: "Send message", exact: true })
      .isDisabled(),
    true,
  );
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await page.waitForURL(/\/communications\/[a-f0-9-]{36}/);
  await page
    .getByRole("link", { name: "Back to communications", exact: true })
    .click();
  await page
    .getByRole("cell", { name: "A thoughtful follow-up", exact: true })
    .first()
    .waitFor();
  report.checks.push("Message draft persisted; demo outbound send disabled");
  await page.getByRole("link", { name: "Sales pipeline", exact: true }).click();
  await screenshot(page, "crm-pipeline-desktop");
  await page.goto(talent + "/manage");
  await page
    .getByRole("heading", { name: "A thoughtful approach to talent." })
    .waitFor();
  await screenshot(page, "talent-overview-desktop");
  await checkAxe(page, "Talent overview");
  await person.goto(talent);
  await person
    .getByRole("heading", { name: "Good work starts here." })
    .waitFor();
  await person.getByRole("link", { name: /Senior Frontend Engineer/ }).click();
  await person.getByRole("link", { name: "Apply for this role" }).click();
  await person
    .getByRole("button", { name: "Create an account", exact: true })
    .click();
  await person.getByLabel("Full name").fill(name);
  await person.getByLabel("Email address").fill(email);
  await person
    .getByLabel("Password", { exact: true })
    .fill("Browser-test-password-123");
  await person.getByRole("checkbox", { name: /I agree to/ }).check();
  await person
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await person
    .getByRole("heading", { name: "Start with your résumé." })
    .waitFor();
  await person.getByLabel("Upload résumé").setInputFiles({
    name: "resume.pdf",
    mimeType: "application/pdf",
    buffer: fixturePDF(),
  });
  await person.getByRole("checkbox", { name: /I consent to résumé/ }).check();
  await person.getByRole("button", { name: "Extract résumé details" }).click();
  await person
    .getByRole("button", { name: "Use extracted details", exact: true })
    .waitFor({ timeout: 30000 });
  await person
    .getByRole("button", { name: "Use extracted details", exact: true })
    .click();
  assert.equal(
    await person.getByLabel("Full name").inputValue(),
    "Jordan Example",
  );
  assert.equal(await person.getByLabel("Email address").inputValue(), email);
  await person.getByLabel("Full name").fill(name);
  await person.getByLabel("Location", { exact: true }).fill("Bengaluru");
  await person.getByLabel("Relevant experience").fill("5 years");
  await screenshot(person, "candidate-application-desktop");
  await checkAxe(person, "Application form");
  await person
    .getByRole("checkbox", { name: /I confirm these details/ })
    .check();
  await person
    .getByRole("button", { name: "Submit application", exact: true })
    .click();
  await person
    .getByRole("heading", { name: "Your next chapter is in motion." })
    .waitFor();
  await person.getByRole("link", { name: "Track my application" }).click();
  await person
    .getByRole("heading", { name: "Senior Frontend Engineer", exact: true })
    .waitFor();
  report.checks.push(
    "Candidate sign-up → PDF extraction → reviewable autofill → submission → portal",
  );
  await page
    .getByRole("button", { name: "Candidate pipeline", exact: false })
    .click();
  await page.getByRole("button", { name: "List", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Search candidates or skills…" })
    .fill(name);
  await page.getByRole("button", { name: new RegExp(name) }).click();
  await page.getByRole("button", { name: "Decision", exact: true }).click();
  await page
    .getByLabel("Decision rationale")
    .fill("Relevant experience reviewed against the published requirements.");
  await page.getByRole("button", { name: "Record decision" }).click();
  await page.getByText("Selection stage updated.", { exact: true }).waitFor();
  await page.getByLabel("Next stage").selectOption("Interview");
  await page
    .getByLabel("Decision rationale")
    .fill("Invite to a structured technical conversation.");
  await page.getByRole("button", { name: "Record decision" }).click();
  await page.getByLabel("Next stage").selectOption("Offer");
  await page.getByRole("button", { name: "Scorecards", exact: true }).click();
  await page
    .getByLabel("Evidence & observations")
    .fill(
      "The candidate explained a careful approach to data consistency with concrete examples.",
    );
  await page
    .getByRole("button", { name: "Submit scorecard", exact: true })
    .click();
  await page.getByText("Scorecard recorded.", { exact: true }).waitFor();
  await page.getByRole("button", { name: "Interviews", exact: true }).click();
  await page.getByLabel("Interviewer / panel").fill("Engineering panel");
  const tomorrow = new Date(Date.now() + 86400000);
  const local = new Date(
    tomorrow.getTime() - tomorrow.getTimezoneOffset() * 60000,
  )
    .toISOString()
    .slice(0, 16);
  await page.getByLabel("Date & time (your timezone)").fill(local);
  await page
    .getByLabel("Meeting link or location")
    .fill("Recruiting team will share video details");
  await page
    .getByRole("button", { name: "Schedule interview", exact: true })
    .click();
  await page.getByText("Interview scheduled.", { exact: false }).waitFor();
  await page.getByRole("button", { name: "Close dialog" }).click();
  await person.reload();
  await person.getByText("Interview", { exact: true }).first().waitFor();
  await person.getByText("Role conversation", { exact: true }).waitFor();
  await screenshot(person, "candidate-portal-desktop");
  report.checks.push(
    "Recruiter stage transitions, scorecard, scheduling and candidate visibility",
  );
  await page.goto(talent + "/manage?view=jobs");
  await page.getByRole("button", { name: "Create role", exact: true }).click();
  await page
    .getByLabel("Job title", { exact: true })
    .fill("QA Researcher " + suffix);
  await page
    .getByLabel("About the role")
    .fill(
      "Conduct thoughtful research that helps cross-functional teams understand people and build useful products.",
    );
  await page
    .getByLabel("What you will bring")
    .fill(
      "Experience in qualitative research and clear written communication.",
    );
  await page.getByLabel("Publication status").selectOption("Published");
  await page.getByRole("button", { name: "Save role", exact: true }).click();
  await page.getByRole("dialog").waitFor({ state: "hidden" });
  await person.goto(talent);
  await person
    .getByRole("link", { name: new RegExp("QA Researcher " + suffix) })
    .waitFor();
  report.checks.push(
    "Published recruiter role appears in the candidate careers page",
  );
  for (const width of [1440, 768, 390]) {
    await person.setViewportSize({ width, height: 900 });
    await person.goto(talent);
    await person
      .getByRole("heading", { name: "Good work starts here." })
      .waitFor();
    await screenshot(person, "careers-" + width);
    assert.equal(
      await person.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
      "Careers overflow " + width,
    );
    if (width === 390) await checkAxe(person, "Careers mobile");
    await page.setViewportSize({ width, height: 950 });
    await page.goto(crm);
    await page
      .getByRole("heading", { name: "Every relationship. One clear view." })
      .waitFor();
    await screenshot(page, "crm-" + width);
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
      "CRM overflow " + width,
    );
  }
  report.checks.push(
    "Desktop, tablet and mobile layouts without page overflow",
  );
  assert.equal(
    report.consoleErrors.length,
    0,
    JSON.stringify(report.consoleErrors),
  );
  const violations = report.accessibility.flatMap((a) => a.violations);
  assert.equal(
    violations.length,
    0,
    JSON.stringify(report.accessibility, null, 2),
  );
  console.log(
    JSON.stringify(
      {
        checks: report.checks,
        accessibility: report.accessibility.map((a) => ({
          label: a.label,
          violations: a.violations.length,
        })),
        consoleErrors: report.consoleErrors,
      },
      null,
      2,
    ),
  );
} catch (error) {
  await screenshot(page, "failure-staff");
  await screenshot(person, "failure-candidate");
  throw error;
} finally {
  await writeFile(
    output + "browser-report.json",
    JSON.stringify(report, null, 2),
  );
  await browser.close();
}
