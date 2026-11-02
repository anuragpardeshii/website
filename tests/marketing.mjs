import assert from "node:assert/strict";
import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";
const output = new URL("../test-results/", import.meta.url).pathname;
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.SLEEKTECH_CHROME || "/usr/bin/google-chrome",
  headless: true,
  args: ["--no-sandbox"],
});
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1100 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  await page.goto(
    process.env.MARKETING_TEST_URL || "http://127.0.0.1:5175/careers",
  );
  await page.locator(".career-opening").first().waitFor();
  const data = await page.evaluate(async () => {
    const r = await fetch("/api/public/jobs");
    return r.json();
  });
  assert.equal(await page.locator(".career-opening").count(), data.jobs.length);
  assert.match(
    await page.locator(".career-opening").first().getAttribute("href"),
    /\/jobs\//,
  );
  const results = await new AxeBuilder({ page })
    .include("#open-roles")
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  await page
    .locator("#open-roles")
    .screenshot({ path: output + "marketing-careers-desktop.png" });
  await page.setViewportSize({ width: 390, height: 900 });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  await page
    .locator("#open-roles")
    .screenshot({ path: output + "marketing-careers-mobile.png" });
  assert.equal(
    results.violations.length,
    0,
    JSON.stringify(
      results.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => ({
          target: n.target,
          summary: n.failureSummary,
        })),
      })),
      null,
      2,
    ),
  );
  console.log(
    "Marketing careers integration: " +
      data.jobs.length +
      " published roles, correct portal links, no accessibility violations or mobile overflow.",
  );
} finally {
  await browser.close();
}
