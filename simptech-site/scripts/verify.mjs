import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, stat, mkdir, writeFile } from "node:fs/promises";
import { resolve, extname } from "node:path";
import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { routes } from "../.prerender/entry-server.js";
import { verifyJourney } from "./verify-journey.mjs";
import { verifyBuilds } from "./verify-builds.mjs";

const output = resolve("test-results");
await mkdir(output, { recursive: true });
const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".woff2": "font/woff2",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webmanifest": "application/manifest+json",
  ".png": "image/png",
  ".webp": "image/webp",
  ".xml": "application/xml",
  ".txt": "text/plain",
};
const server = createServer(async (req, res) => {
  let path = resolve(
    "dist",
    `.${decodeURIComponent(new URL(req.url, "http://localhost").pathname)}`,
  );
  if (!path.startsWith(resolve("dist") + "/") && path !== resolve("dist")) {
    res.writeHead(403);
    res.end();
    return;
  }
  try {
    if ((await stat(path)).isDirectory()) path = resolve(path, "index.html");
    const data = await readFile(path);
    res.writeHead(200, {
      "Content-Type": types[extname(path)] || "application/octet-stream",
    });
    res.end(data);
  } catch {
    res.writeHead(404, { "Content-Type": "text/html" });
    res.end(await readFile("dist/404.html"));
  }
});
await new Promise((done) => server.listen(0, "127.0.0.1", done));
const base = `http://127.0.0.1:${server.address().port}`;
let browser;
const report = {
  routes: [],
  interactions: [],
  accessibility: [],
  consoleErrors: [],
  brokenLinks: [],
};
try {
  browser = await chromium.launch({
    executablePath:
      process.env.SLEEKTECH_CHROME ||
      process.env.SIMPTECH_CHROME ||
      "/usr/bin/google-chrome",
    headless: true,
    args: ["--no-sandbox"],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  page.on("pageerror", (error) => report.consoleErrors.push(error.message));
  page.on("console", (message) => {
    if (
      message.type() === "error" &&
      !(
        message.text().includes("404 (Not Found)") &&
        page.url().endsWith("/missing-page")
      )
    )
      report.consoleErrors.push(message.text());
  });
  const validPaths = new Set(routes.map((r) => r.path));
  for (const route of routes) {
    const response = await page.goto(base + route.path);
    await page.evaluate(() => document.fonts.ready);
    const failedImages = await page
      .locator("img")
      .evaluateAll(async (images) => {
        return (
          await Promise.all(
            images.map(async (img) => {
              img.loading = "eager";
              try {
                await img.decode();
                return img.naturalWidth > 0 ? null : img.src;
              } catch {
                return img.src;
              }
            }),
          )
        ).filter(Boolean);
      });
    assert.equal(
      failedImages.length,
      0,
      `All artwork loads on ${route.path}: ${failedImages.join(", ")}`,
    );
    assert.equal(response.status(), 200, `Route ${route.path} returns 200`);
    assert.equal(
      await page.locator("main h1").count(),
      1,
      `One h1 on ${route.path}`,
    );
    assert(
      (await page.title()).includes(route.title),
      `Title on ${route.path}`,
    );
    assert(
      await page
        .locator('head meta[name="description"]')
        .getAttribute("content"),
      `Description on ${route.path}`,
    );
    assert(
      await page.locator('head link[rel="canonical"]').getAttribute("href"),
      `Canonical on ${route.path}`,
    );
    const links = await page
      .locator('a[href^="/"]')
      .evaluateAll((els) =>
        els.map(
          (e) =>
            e
              .getAttribute("href")
              .split("?")[0]
              .split("#")[0]
              .replace(/\/$/, "") || "/",
        ),
      );
    for (const link of links)
      if (!validPaths.has(link))
        report.brokenLinks.push({ from: route.path, to: link });
    const desktopOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    );
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    if (results.violations.length)
      report.accessibility.push({
        path: route.path,
        violations: results.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          description: v.description,
          nodes: v.nodes.map((n) => ({
            html: n.html,
            target: n.target,
            summary: n.failureSummary,
          })),
        })),
      });
    if (route.path === "/") {
      await page.screenshot({
        path: resolve(output, "home-desktop.png"),
        fullPage: true,
      });
      await page.screenshot({
        path: resolve(output, "home-desktop-viewport.png"),
      });
    }
    if (
      ["/services", "/contact", "/about", "/work/meridian-analytics"].includes(
        route.path,
      )
    )
      await page.screenshot({
        path: resolve(
          output,
          route.path.slice(1).replaceAll("/", "-") + "-desktop.png",
        ),
        fullPage: true,
      });
    await page.setViewportSize({ width: 390, height: 844 });
    const mobileOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    );
    if (route.path === "/") {
      await page.screenshot({
        path: resolve(output, "home-mobile.png"),
        fullPage: true,
      });
      await page.screenshot({
        path: resolve(output, "home-mobile-viewport.png"),
      });
    }
    if (route.path === "/contact")
      await page.screenshot({
        path: resolve(output, "contact-mobile.png"),
        fullPage: true,
      });
    report.routes.push({ path: route.path, desktopOverflow, mobileOverflow });
    console.log(`Checked ${route.path}`);
    await page.setViewportSize({ width: 1440, height: 1000 });
  }
  await page.goto(base + "/");
  await page.keyboard.press("Tab");
  assert.equal(await page.locator(":focus").textContent(), "Skip to content");
  await page.keyboard.press("Enter");
  assert.equal(new URL(page.url()).hash, "#main-content");
  await page.locator(".nav-dropdown>summary").first().focus();
  await page.keyboard.press("Enter");
  assert(
    (await page.locator(".nav-dropdown").first().getAttribute("open")) !== null,
  );
  await page.keyboard.press("Escape");
  assert.equal(
    await page.locator(".nav-dropdown").first().getAttribute("open"),
    null,
  );
  report.interactions.push("Skip link, keyboard dropdown, and Escape");
  await page.setViewportSize({ width: 390, height: 844 });
  await page
    .getByRole("button", { name: "Open navigation", exact: true })
    .click();
  assert.equal(
    await page
      .getByRole("button", { name: "Close navigation" })
      .getAttribute("aria-expanded"),
    "true",
  );
  await page.locator(".nav-dropdown>summary").first().click();
  await page.screenshot({ path: resolve(output, "mobile-navigation.png") });
  await page.locator(".mega-links a").first().click();
  assert(page.url().includes("/services/website-development"));
  report.interactions.push("Mobile navigation and service destination");
  await page.goto(base + "/");
  const initialTab = page.getByRole("tab", { name: /CRM platforms/ });
  await initialTab.focus();
  await page.keyboard.press("ArrowDown");
  assert.equal(
    await page
      .getByRole("tab", { name: /Enterprise systems/ })
      .getAttribute("aria-selected"),
    "true",
  );
  await page.locator('.wb-showcase[data-capability="erp"]').waitFor();
  await page.keyboard.press("Home");
  assert.equal(
    await page
      .getByRole("tab", { name: /Websites & experiences/ })
      .getAttribute("aria-selected"),
    "true",
  );
  await page.getByRole("button", { name: "Logistics", exact: true }).click();
  assert(
    (await page.locator(".connection-detail").innerText()).includes(
      "Everything moving in the right direction.",
    ),
  );
  assert.equal(await page.locator("html").getAttribute("data-motion"), "off");
  await page.setViewportSize({ width: 1440, height: 1000 });
  assert.equal(await page.locator(".motion-toggle").count(), 0);
  report.interactions.push(
    "Solution tabs support arrows and Home, connected-system controls update content, reduced-motion preference respected",
  );
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.waitForFunction(
    () => document.documentElement.dataset.motion === "on",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  report.interactions.push(
    "Motion follows device preferences without a navbar toggle",
  );
  report.interactions.push(await verifyJourney(context, base, output));
  report.interactions.push(await verifyBuilds(context, base));

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(base + "/work");
  await page.getByRole("button", { name: "CRM", exact: true }).click();
  assert.equal(await page.locator(".project-card").count(), 1);
  assert(
    await page
      .locator(".project-card")
      .innerText()
      .then((s) => s.includes("Orbit") || s.includes("Less busywork")),
  );
  await page.getByRole("button", { name: "All projects" }).click();
  assert.equal(await page.locator(".project-card").count(), 4);
  report.interactions.push("Project category filters");
  await page.goto(base + "/insights");
  await page.getByRole("searchbox").fill("dashboard");
  assert.equal(await page.locator(".article-card").count(), 1);
  await page.getByRole("searchbox").fill("no-matching-article");
  assert.equal(await page.locator(".article-card").count(), 0);
  await page.getByRole("button", { name: "Clear filters" }).click();
  assert.equal(await page.locator(".article-card").count(), 3);
  report.interactions.push("Article search, empty state, and reset");
  await page.goto(base + "/faq");
  await page.getByRole("button", { name: "Delivery & support" }).click();
  assert.equal(await page.locator(".faq-list details").count(), 3);
  await page.locator(".faq-list summary").first().focus();
  await page.keyboard.press("Enter");
  assert(
    (await page.locator(".faq-list details").first().getAttribute("open")) !==
      null,
  );
  report.interactions.push("FAQ category filter and keyboard accordion");
  let registrationPayload;
  await page.route("**/api/public/leads", async (route) => {
    registrationPayload = route.request().postDataJSON();
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    });
  });
  await page.goto(base + "/contact?service=web-applications");
  assert.equal(
    await page.locator('select[name="interest"]').inputValue(),
    "Web applications",
  );
  await page
    .getByRole("button", { name: "Let’s start a conversation" })
    .click();
  assert.equal(await page.locator(".brief-success").count(), 0);
  await page.getByLabel("Your name").fill("Taylor Sample");
  await page.getByLabel("Email address").fill("taylor@example.test");
  await page.getByLabel("Company", { exact: false }).fill("Example Studio");
  await page.getByRole("checkbox").check();
  await page
    .getByRole("button", { name: "Let’s start a conversation" })
    .click();
  await page.getByRole("heading", { name: "You’re on our radar." }).waitFor();
  assert.equal(registrationPayload.consent, true);
  assert.equal(registrationPayload.name, "Taylor Sample");
  assert.equal(
    await page.locator(":focus").getAttribute("class"),
    "brief-success",
  );
  report.interactions.push(
    "Registration: service preselection, required fields, consent, API request, success focus (transport mocked; full CRM journey tested separately)",
  );
  await page.goto(base + "/missing-page");
  assert.equal(await page.locator("h1").textContent(), "A small detour.");
  report.interactions.push("Custom 404");
  for (const width of [320, 375, 768, 1024]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(base + "/");
    assert(
      !(await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      )),
      `Home fits at ${width}px`,
    );
  }
  report.interactions.push(
    "Home layouts at 320, 375, 768, 1024, and 1440 pixels",
  );
  await writeFile(
    resolve(output, "verification.json"),
    JSON.stringify(report, null, 2),
  );
  const overflow = report.routes.filter(
    (r) => r.desktopOverflow || r.mobileOverflow,
  );
  console.log(
    JSON.stringify(
      {
        pages: report.routes.length,
        interactions: report.interactions,
        accessibility: report.accessibility.map((r) => ({
          path: r.path,
          rules: r.violations.map((v) => v.id),
        })),
        overflow,
        brokenLinks: report.brokenLinks,
        consoleErrors: report.consoleErrors,
        report: resolve(output, "verification.json"),
      },
      null,
      2,
    ),
  );
  assert.equal(report.brokenLinks.length, 0, "No broken internal links");
  assert.equal(report.consoleErrors.length, 0, "No browser errors");
  assert.equal(overflow.length, 0, "No page overflow");
  assert.equal(
    report.accessibility.length,
    0,
    "No automated WCAG A/AA violations",
  );
} catch (error) {
  await writeFile(
    resolve(output, "verification.json"),
    JSON.stringify(report, null, 2),
  );
  throw error;
} finally {
  await browser?.close();
  await new Promise((done) => server.close(done));
}
