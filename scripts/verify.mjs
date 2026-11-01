import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, stat, mkdir, writeFile } from "node:fs/promises";
import { resolve, extname } from "node:path";
import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { routes } from "../.prerender/entry-server.js";

const output = resolve("test-results");
await mkdir(output, { recursive: true });
const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".woff2": "font/woff2",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
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
    executablePath: process.env.SIMPTECH_CHROME || "/usr/bin/google-chrome",
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
  const skipAudit = await new AxeBuilder({ page })
    .include(".skip-link")
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  assert.equal(
    skipAudit.violations.length,
    0,
    "Focused skip link has readable contrast",
  );
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
  const overviewTab = page.getByRole("tab", {
    name: "Business overview",
    exact: true,
  });
  await overviewTab.focus();
  await page.keyboard.press("ArrowRight");
  await page
    .getByRole("tabpanel", { name: "Sales pipeline", exact: true })
    .getByRole("img", { name: /Orbit crm interface concept/ })
    .waitFor();
  assert.equal(
    await page.locator(".workspace-caption a").getAttribute("href"),
    "/services/crm-development",
  );
  await page.keyboard.press("End");
  await page
    .getByRole("tabpanel", { name: "Operations", exact: true })
    .getByRole("img", { name: /Nexus erp interface concept/ })
    .waitFor();
  assert.equal(
    await page.locator(".workspace-caption a").getAttribute("href"),
    "/services/erp-development",
  );
  await page.keyboard.press("Home");
  await page
    .getByRole("tabpanel", { name: "Business overview", exact: true })
    .getByRole("img", { name: /Meridian analytics interface concept/ })
    .waitFor();
  assert.equal(await overviewTab.getAttribute("aria-selected"), "true");
  report.interactions.push(
    "Hero workspace keyboard controls switch previews and service destinations",
  );
  const initialTab = page.getByRole("tab", { name: /CRM Development/ });
  await initialTab.focus();
  await page.keyboard.press("ArrowDown");
  assert.equal(
    await page
      .getByRole("tab", { name: /ERP Development/ })
      .getAttribute("aria-selected"),
    "true",
  );
  await page.getByRole("link", { name: "Explore ERP", exact: true }).waitFor();
  await page.keyboard.press("Home");
  assert.equal(
    await page
      .getByRole("tab", { name: /Website Development/ })
      .getAttribute("aria-selected"),
    "true",
  );
  for (const [label, slug] of [
    ["Website Development", "website-development"],
    ["CRM Development", "crm-development"],
    ["ERP Development", "erp-development"],
    ["Dashboards & Business Analytics", "business-analytics"],
    ["E-commerce & Order Management", "ecommerce-development"],
    ["Inventory & Logistics Management", "inventory-logistics"],
  ]) {
    await page.getByRole("tab", { name: new RegExp(label) }).click();
    await page.waitForFunction(
      (href) =>
        document.querySelector("#solution-panel a")?.getAttribute("href") ===
        href,
      `/services/${slug}`,
    );
    assert.equal(await page.locator("#solution-panel [role=img]").count(), 1);
    assert(
      await page.locator(".solution-product").evaluate((frame) => {
        const preview = frame
          .querySelector(".solution-product-window")
          .getBoundingClientRect();
        const bounds = frame.getBoundingClientRect();
        return (
          preview.bottom <= bounds.bottom + 1 &&
          preview.right <= bounds.right + 1
        );
      }),
      `Mobile ${label} preview is fully contained in its frame`,
    );
    assert(
      !(await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      )),
      `Mobile ${label} fits`,
    );
    await page
      .locator(".solution-stage")
      .screenshot({ path: resolve(output, `${slug}-mobile.png`) });
    const result = await new AxeBuilder({ page })
      .include(".solution-explorer")
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    if (result.violations.length)
      report.accessibility.push({
        path: `/#solutions/${slug} (mobile)`,
        violations: result.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => ({
            target: n.target,
            html: n.html,
            summary: n.failureSummary,
          })),
        })),
      });
  }
  report.interactions.push(
    "All six mobile solution previews, destination links, and accessibility checks",
  );
  await page.getByRole("button", { name: "Logistics", exact: true }).click();
  assert(
    (await page.locator(".connection-detail").innerText()).includes(
      "Everything moving in the right direction.",
    ),
  );
  assert.equal(await page.locator("html").getAttribute("data-motion"), "off");
  await page.setViewportSize({ width: 1440, height: 1000 });
  assert(
    await page
      .getByRole("button", {
        name: "Animations reduced by your device preference",
      })
      .isDisabled(),
  );
  report.interactions.push(
    "Solution tabs support arrows and Home, connected-system controls update content, reduced-motion preference respected",
  );
  const aiTabs = page.getByRole("tablist", {
    name: "Explore AI workflow concepts",
  });
  await aiTabs.getByRole("tab", { name: "Sales pulse" }).focus();
  await page.keyboard.press("ArrowRight");
  await page
    .getByRole("heading", { name: "A clearer view of what’s running low." })
    .waitFor();
  assert.equal(
    await aiTabs
      .getByRole("tab", { name: "Stock watch" })
      .getAttribute("aria-selected"),
    "true",
  );
  await page.getByRole("button", { name: "Preview an action plan" }).click();
  assert(
    await page
      .getByText("Review the Studio Desk stock level", { exact: true })
      .isVisible(),
  );
  assert(
    await page
      .getByText("Sample plan only. No actions have been taken.")
      .isVisible(),
  );
  await aiTabs.getByRole("tab", { name: "Stock watch" }).focus();
  await page.keyboard.press("End");
  await page
    .getByRole("heading", { name: "The week, without the spreadsheet hunt." })
    .waitFor();
  assert.equal(
    await page
      .getByRole("button", { name: "Preview an action plan" })
      .getAttribute("aria-expanded"),
    "false",
  );
  await page.keyboard.press("Home");
  await page
    .getByRole("heading", { name: "Three conversations to move forward." })
    .waitFor();
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.locator(".intelligence-section").screenshot({
      path: resolve(
        output,
        `intelligence-${width === 1440 ? "desktop" : "mobile"}.png`,
      ),
    });
    const result = await new AxeBuilder({ page })
      .include(".intelligence-section")
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    if (result.violations.length)
      report.accessibility.push({
        path: `/#intelligence-${width}`,
        violations: result.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => ({
            target: n.target,
            summary: n.failureSummary,
          })),
        })),
      });
  }
  for (const scene of await page.locator(".showreel-image").all()) {
    assert(
      await scene.evaluate((element) => {
        const preview = element
          .querySelector(".showreel-screen")
          .getBoundingClientRect();
        const bounds = element.getBoundingClientRect();
        return (
          preview.right <= bounds.right + 1 &&
          preview.bottom <= bounds.bottom + 1
        );
      }),
      "Mobile project preview is fully contained",
    );
  }
  report.interactions.push(
    "AI concept keyboard tabs, sample action plans, reset, mobile containment and accessibility",
  );
  const journeyTabs = page.getByRole("tablist", { name: "AI system chapters" });
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    assert.equal(
      await page.locator(".ai-journey").getAttribute("data-scroll-scene"),
      "false",
    );
    for (const [index, name] of ["Connect", "Understand", "Review"].entries()) {
      const tab = journeyTabs.getByRole("tab", { name: new RegExp(name) });
      await tab.click();
      await page.waitForFunction(
        (i) =>
          document
            .querySelector(`#journey-tab-${i}`)
            ?.getAttribute("aria-selected") === "true",
        index,
      );
      const headings = [
        "Your knowledge. Connected.",
        "Answers with a point of view.",
        "A clear handoff. On your terms.",
      ];
      await page
        .getByRole("heading", { name: headings[index], exact: true })
        .waitFor();
      assert(
        await page
          .locator(".journey-browser")
          .evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
        "AI interface fits its frame",
      );
      const result = await new AxeBuilder({ page })
        .include(".ai-journey")
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      if (result.violations.length)
        report.accessibility.push({
          path: `/#journey-${width}-${name}`,
          violations: result.violations.map((v) => ({
            id: v.id,
            nodes: v.nodes.map((n) => ({
              target: n.target,
              summary: n.failureSummary,
            })),
          })),
        });
    }
    await page.getByRole("button", { name: "Review this sample plan" }).click();
    assert(
      await page
        .getByText(
          "Sample reviewed. No messages sent or business actions taken.",
        )
        .isVisible(),
    );
    await page.getByRole("button", { name: "Reset sample review" }).click();
    assert(
      await page
        .getByText("An interface demonstration. You stay in control.")
        .isVisible(),
    );
    await journeyTabs.getByRole("tab", { name: /Review/ }).focus();
    await page.keyboard.press("Home");
    await page
      .getByRole("heading", { name: "Your knowledge. Connected.", exact: true })
      .waitFor();
    await page.keyboard.press("ArrowRight");
    await page
      .getByRole("heading", {
        name: "Answers with a point of view.",
        exact: true,
      })
      .waitFor();
    await page.locator(".journey-stage").screenshot({
      path: resolve(
        output,
        `ai-journey-${width === 1440 ? "desktop" : "mobile"}.png`,
      ),
    });
  }
  report.interactions.push(
    "AI chapters: keyboard, mobile, sample review/reset, containment and accessibility",
  );
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.waitForFunction(
    () =>
      document
        .querySelector(".ai-journey")
        ?.getAttribute("data-scroll-scene") === "true",
  );
  for (const index of [0, 1, 2]) {
    await page.evaluate((i) => {
      const el = document.querySelector(".ai-journey");
      window.scrollTo({
        top:
          el.getBoundingClientRect().top +
          scrollY +
          (el.offsetHeight - innerHeight) * ((i + 0.45) / 3),
        behavior: "instant",
      });
    }, index);
    await page.waitForFunction(
      (i) =>
        document
          .querySelector(`#journey-tab-${i}`)
          ?.getAttribute("aria-selected") === "true",
      index,
    );
    const scene = await page.locator(".journey-browser").boundingBox();
    assert(
      scene.y >= 70 && scene.y + scene.height <= 1000,
      "Sticky AI interface stays visible during scroll",
    );
  }
  await page.locator(".journey-browser").hover({ position: { x: 40, y: 50 } });
  await page.waitForFunction(() =>
    document
      .querySelector(".journey-browser")
      .style.transform.includes("rotateY"),
  );
  await page.mouse.move(0, 0);
  await page.locator(".signal-section").scrollIntoViewIfNeeded();
  await page.waitForFunction(
    () => document.querySelectorAll(".signal-particle").length === 4,
  );
  await page
    .getByRole("button", { name: "Pause animations", exact: true })
    .click();
  assert.equal(await page.locator("html").getAttribute("data-motion"), "off");
  await page.waitForFunction(
    () => document.querySelectorAll(".signal-particle").length === 0,
  );
  assert.equal(
    await page.locator(".ai-journey").getAttribute("data-scroll-scene"),
    "false",
  );
  assert.equal(
    await page
      .locator(".journey-browser")
      .evaluate((el) => getComputedStyle(el).transform),
    "none",
  );
  await page
    .getByRole("button", { name: "Enable animations", exact: true })
    .click();
  assert.equal(await page.locator("html").getAttribute("data-motion"), "on");
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForFunction(
    () => document.querySelectorAll(".signal-particle").length === 0,
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForFunction(
    () =>
      document
        .querySelector(".ai-journey")
        ?.getAttribute("data-scroll-scene") === "false",
  );
  report.interactions.push(
    "Desktop native-scroll chapters, visible sticky scene, hover depth, offscreen particle suspension and motion pause/resume",
  );

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
  await page.goto(base + "/contact?service=web-applications");
  assert.equal(
    await page.locator('select[name="service"]').inputValue(),
    "web-applications",
  );
  await page.getByRole("button", { name: "Prepare my project brief" }).click();
  assert.equal(await page.locator(".brief-success").count(), 0);
  await page.getByLabel("Your name").fill("Taylor Sample");
  await page.getByLabel("Email address").fill("taylor@example.com");
  await page.getByLabel("Company", { exact: true }).fill("Example Studio");
  await page
    .getByLabel("A little about your project")
    .fill(
      "We need a customer portal to simplify project updates and document handoffs.",
    );
  await page.getByLabel("Save a draft on this device").check();
  await page.getByRole("button", { name: "Prepare my project brief" }).click();
  await page.getByRole("heading", { name: "Your brief is ready." }).waitFor();
  assert.equal(
    await page.locator(":focus").getAttribute("class"),
    "brief-success",
  );
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Download your brief" }).click(),
  ]);
  const downloadPath = await download.path();
  const brief = await readFile(downloadPath, "utf8");
  assert(
    brief.includes("Taylor Sample") &&
      brief.includes("Web applications") &&
      brief.includes("has not been sent"),
  );
  await page.reload();
  await page.getByRole("button", { name: "Restore a saved draft" }).click();
  assert.equal(
    await page.getByLabel("Your name").inputValue(),
    "Taylor Sample",
  );
  await page
    .getByRole("button", { name: "Clear saved draft", exact: true })
    .click();
  assert.equal(
    await page.evaluate(() => localStorage.getItem("simptech-project-draft")),
    null,
  );
  report.interactions.push(
    "Service preselection, required fields, brief generation/download, focus, saved draft restore and deletion",
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
