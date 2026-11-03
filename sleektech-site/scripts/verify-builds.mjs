import assert from "node:assert/strict";
import { expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

export async function verifyBuilds(context, base) {
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  try {
    const panels = new Map();
    for (const path of ["/", "/work"]) {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(base + path);
      const section = page.locator(".what-we-build");
      const showcase = section.locator(".wb-showcase");
      const tabs = section.getByRole("tab");
      const ids = [
        "websites",
        "crm",
        "erp",
        "analytics",
        "commerce",
        "logistics",
        "automation",
      ];
      assert.equal(await tabs.count(), 7);
      await expect(section.locator(".wb-tabs")).toHaveCSS(
        "flex-direction",
        "column",
      );
      await expect(
        section.locator(".film-pointer, .film-save-indicator"),
      ).toHaveCount(0);
      for (const width of [320, 390, 768, 1024, 1440]) {
        await page.setViewportSize({ width, height: 1000 });
        for (const [index, id] of ids.entries()) {
          await tabs.nth(index).click();
          await expect(showcase).toHaveAttribute("data-capability", id);
          await expect(tabs.nth(index)).toHaveAttribute(
            "aria-selected",
            "true",
          );
          await expect(showcase).toHaveAttribute("data-running", "false");
          await expect(section.locator(".wb-delivery > span")).toHaveCount(3);
          // Wait for React's zero-duration reduced-motion crossfade to settle.
          await expect(section.locator(".wb-scene")).toHaveCount(1);
          await expect(section.locator(".film-scene-layer")).toHaveCount(1);
          await expect(
            section.locator(
              ".wb-demo-footer, .wb-workflow-terminal, .wb-task-total, .wb-playback, .wb-workflow",
            ),
          ).toHaveCount(0);
          await expect(
            section.locator(
              ".wb-tablet > .wb-tablet-screen > .wb-safari .wb-scene",
            ),
          ).toHaveCount(1);
          await expect(
            section.locator(".wb-tablet-camera, .wb-tablet-home > i"),
          ).toHaveCount(2);
          await expect(section.locator(".wb-safari-lights i")).toHaveCount(3);
          await expect(section.locator(".wb-safari-address > span")).toHaveText(
            /^[a-z]+\.example$/,
          );
          await expect(section.locator(".wb-panel")).toHaveCSS(
            "background-image",
            "none",
          );
          const deviceFits = await section
            .locator(".wb-tablet")
            .evaluate((device) => {
              const inside = (inner, outer) =>
                inner.left >= outer.left - 1 &&
                inner.right <= outer.right + 1 &&
                inner.top >= outer.top - 1 &&
                inner.bottom <= outer.bottom + 1;
              const screen = device
                .querySelector(".wb-tablet-screen")
                .getBoundingClientRect();
              const browser = device
                .querySelector(".wb-safari")
                .getBoundingClientRect();
              const scene = device
                .querySelector(".wb-scene-container")
                .getBoundingClientRect();
              const toolbar = device
                .querySelector(".wb-safari-toolbar")
                .getBoundingClientRect();
              return (
                inside(screen, device.getBoundingClientRect()) &&
                inside(browser, screen) &&
                inside(scene, browser) &&
                [...device.querySelectorAll(".wb-safari-toolbar > div")].every(
                  (el) => inside(el.getBoundingClientRect(), toolbar),
                )
              );
            });
          assert.equal(
            deviceFits,
            true,
            id + " Safari stays within the tablet at " + width,
          );
          const panel = section.getByRole("tabpanel");
          const sample = `${width}:${id}`;
          if (path === "/") panels.set(sample, await panel.innerText());
          else
            await expect
              .poll(() => panel.innerText(), {
                message: `Work matches the homepage solution at ${sample}`,
              })
              .toBe(panels.get(sample));
          assert.equal(
            await page.evaluate(
              () => document.documentElement.scrollWidth > innerWidth,
            ),
            false,
            id + " fits at " + width,
          );
          const clipping = await section
            .locator(".wb-scene")
            .evaluate((scene) => {
              const box = scene.getBoundingClientRect();
              return [
                ...scene.querySelectorAll(
                  ".story-note, .story-report-grid, .story-web-bottom, .ai-composer, .story-message",
                ),
              ]
                .filter((el) => {
                  const r = el.getBoundingClientRect();
                  const boundary =
                    el
                      .closest(".solution-live-preview")
                      ?.getBoundingClientRect() || box;
                  return (
                    (!el.closest('[data-scroll-demo="true"]') &&
                      r.bottom > boundary.bottom + 1) ||
                    r.right > boundary.right + 1
                  );
                })
                .map((el) => el.className);
            });
          assert.deepEqual(
            clipping,
            [],
            id + " content fits its scrollable product viewport at " + width,
          );
          if (width === 1440) {
            const result = await new AxeBuilder({ page })
              .include(".what-we-build")
              .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
              .analyze();
            assert.deepEqual(
              result.violations.map((v) => ({
                id: v.id,
                targets: v.nodes.map((n) => n.target),
              })),
              [],
              id + " accessibility",
            );
          }
        }
      }
      await tabs.last().focus();
      await page.keyboard.press("Home");
      await expect(tabs.first()).toBeFocused();
      await page.keyboard.press("ArrowRight");
      await expect(tabs.nth(1)).toBeFocused();
      await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
      await page.keyboard.press("End");
      await expect(tabs.last()).toBeFocused();

      assert.equal(
        await section.locator(".wb-tabs svg, .wb-controls").count(),
        0,
      );
      assert.equal(await page.locator(".motion-toggle").count(), 0);
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await page.evaluate(() => document.activeElement?.blur());
      await tabs.first().hover();
      await expect(showcase).toHaveAttribute("data-capability", "websites");
      await tabs.last().hover();
      await expect(showcase).toHaveAttribute("data-capability", "automation");
      // Both routes are checked for identical rendering above; exercise the shared clock once.
      if (path === "/work") await verifyPlayback(context, base + path);
    }
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(base + "/work");
    await expect(page.locator(".what-we-build").getByRole("tab")).toHaveCount(
      7,
    );
    await expect(
      page
        .locator(".wb-section-heading")
        .getByRole("link", { name: "Build with us" }),
    ).toHaveAttribute("href", "/contact");
    await page.getByRole("button", { name: "CRM", exact: true }).click();
    await expect(page.locator(".project-card")).toHaveCount(1);
    assert.deepEqual(errors, []);
    return "Product showcase: matching seven solution demos on home and Work at five widths, final-state layout, accessibility, keyboard tabs, three deliverables per capability, hover preview, Safari inside a responsive tablet with no colored backdrop or workflow panel, slower product animations, automatic advance and loop wrap, pause/resume, click replay, keyboard focus protection, offscreen/background suspension, and Work-page integration";
  } finally {
    await page.close();
  }
}

export async function verifyPlayback(context, url) {
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  try {
    page.setDefaultTimeout(15000);
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto(url);
    const section = page.locator(".what-we-build");
    const showcase = section.locator(".wb-showcase");
    const tabs = section.getByRole("tab");
    const demo = section.locator(".wb-demo");
    const progress = section.locator(".solution-story");
    const progressValue = () =>
      progress.evaluate((el) => Number(el.dataset.time) / 11200);
    const centerDemo = async () => {
      await demo.evaluate((el) =>
        el.scrollIntoView({ block: "center", behavior: "instant" }),
      );
      await page.mouse.move(0, 0);
    };
    await demo.scrollIntoViewIfNeeded();
    await tabs.first().click();
    await centerDemo();
    await expect(showcase).toHaveAttribute("data-running", "true");
    await expect(
      section.locator(".wb-demo-footer, .wb-workflow-terminal"),
    ).toHaveCount(0);
    await expect.poll(progressValue).toBeGreaterThan(0.04);

    const motionControl = section.locator(".wb-motion-control");
    await motionControl.focus();
    await page.keyboard.press("Enter");
    await expect(showcase).toHaveAttribute("data-running", "false");
    const paused = await progressValue();
    await page.waitForTimeout(1200);
    assert.equal(
      await progressValue(),
      paused,
      "Pause freezes the product animation",
    );
    await page.keyboard.press("Enter");
    await page.evaluate(() => document.activeElement?.blur());
    await expect(showcase).toHaveAttribute("data-running", "true");
    await expect.poll(progressValue).toBeGreaterThan(paused);

    await page.evaluate(() =>
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "instant",
      }),
    );
    await expect(showcase).toHaveAttribute("data-running", "false");
    const offscreen = await progressValue();
    await page.waitForTimeout(1000);
    assert.equal(
      await progressValue(),
      offscreen,
      "Offscreen work does not advance",
    );
    await centerDemo();
    await expect(showcase).toHaveAttribute("data-running", "true");
    await expect.poll(progressValue).not.toBe(offscreen);
    await page.evaluate(() => {
      Object.defineProperty(document, "hidden", {
        configurable: true,
        value: true,
      });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await expect(showcase).toHaveAttribute("data-running", "false");
    const background = await progressValue();
    await page.waitForTimeout(1000);
    assert.equal(
      await progressValue(),
      background,
      "Background work does not advance",
    );
    await page.evaluate(() => {
      delete document.hidden;
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await expect(showcase).toHaveAttribute("data-running", "true");
    await tabs.first().click();
    await centerDemo();
    assert.ok(
      (await progressValue()) < background,
      "Click replays the selected product animation",
    );
    await expect(
      section.locator(".engineering-story, .story-code"),
    ).toHaveCount(0);
    await expect(section.locator(".web-projects")).toBeVisible({
      timeout: 10000,
    });
    await expect(section.locator(".web-project-detail")).toBeVisible({
      timeout: 10000,
    });
    await expect(section.locator(".web-enquiry")).toBeVisible({
      timeout: 10000,
    });
    await expect(section.locator(".web-confirmation")).toContainText(
      "Thanks, Alex",
      { timeout: 10000 },
    );
    await expect(showcase).toHaveAttribute("data-capability", "websites");
    // Motion's native Web Animations need real browser time alongside the clock.
    await expect(showcase).toHaveAttribute("data-capability", "crm", {
      timeout: 20000,
    });
    await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
    await expect(section.locator(".story-crm")).toBeVisible();
    console.log(
      `Showcase ${new URL(url).pathname}: product animation advances to CRM without a workflow panel`,
    );

    await tabs.first().focus();
    await page.keyboard.press("ArrowRight");
    await expect(tabs.nth(1)).toBeFocused();
    await expect(showcase).toHaveAttribute("data-running", "false");
    await page.waitForTimeout(1200);
    await expect(showcase).toHaveAttribute("data-capability", "crm");

    await tabs.last().click();
    await centerDemo();
    await expect(section.locator(".customer-ai")).toBeVisible({
      timeout: 45000,
    });
    await expect(section.locator(".ai-chat-main > header")).toContainText(
      "Meet Relay.",
    );
    await expect(section.locator(".solution-story")).toHaveAttribute(
      "data-phase",
      "4",
      { timeout: 40000 },
    );
    await expect(section.locator(".film-scene-layer")).toHaveCount(1);
    await expect(section.locator(".ai-composer")).toContainText(
      "Conversation resolved",
      { timeout: 10000 },
    );
    await expect(showcase).toHaveAttribute("data-capability", "websites", {
      timeout: 20000,
    });
    await expect(section.locator(".customer-website")).toBeVisible();
    console.log(
      `Showcase ${new URL(url).pathname}: final solution completes and loops back to websites`,
    );

    await tabs.last().click();
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(section.locator(".solution-story")).toHaveAttribute(
      "data-reduced",
      "true",
    );
    await expect(section.locator(".solution-story")).toHaveAttribute(
      "data-phase",
      "4",
    );
    await expect(showcase).toHaveAttribute("data-running", "false");
    await expect(section.locator(".film-scene-layer")).toHaveCount(1);
    await expect(section.locator(".ai-composer")).toContainText(
      "Conversation resolved",
      { timeout: 10000 },
    );
    await page.waitForTimeout(1200);
    await expect(showcase).toHaveAttribute("data-capability", "automation");
    await expect(motionControl).toHaveCount(0);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await tabs.nth(3).click();
    await centerDemo();
    await expect(section.locator(".customer-dashboard")).toBeVisible();
    await expect(section.locator(".dashboard-kpis")).toContainText("$128,400", {
      timeout: 6000,
    });
    await expect
      .poll(
        () => section.locator(".story-page").evaluate((el) => el.scrollTop),
        { timeout: 12000 },
      )
      .toBeGreaterThan(10);
    await motionControl.focus();
    await page.keyboard.press("Enter");
    await expect(showcase).toHaveAttribute("data-running", "false");
    const scrollPosition = await section
      .locator(".story-page")
      .evaluate((el) => el.scrollTop);
    await page.waitForTimeout(600);
    assert.equal(
      await section.locator(".story-page").evaluate((el) => el.scrollTop),
      scrollPosition,
      "Pause freezes the guided report scroll",
    );
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(section.locator(".solution-story")).toHaveAttribute(
      "data-reduced",
      "true",
    );
    await expect(section.locator(".solution-story")).toHaveAttribute(
      "data-phase",
      "4",
    );
    await expect(section.locator(".film-scene-layer")).toHaveCount(1);
    await expect(section.locator(".film-pointer")).toHaveCount(0);
    await expect
      .poll(() => section.locator(".story-page").evaluate((el) => el.scrollTop))
      .toBe(0);
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }
}
