import assert from "node:assert/strict";
import { expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

export async function verifyBuilds(context, base) {
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  try {
    await page.goto(base + "/");
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
    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const [index, id] of ids.entries()) {
        await tabs.nth(index).click();
        await expect(showcase).toHaveAttribute("data-capability", id);
        await expect(tabs.nth(index)).toHaveAttribute("aria-selected", "true");
        await expect(showcase).toHaveAttribute("data-running", "false");
        await expect(section.locator(".wb-delivery > span")).toHaveCount(3);
        // Wait for React's zero-duration reduced-motion crossfade to settle.
        await expect(section.locator(".wb-scene")).toHaveCount(1);
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
                ".wb-citation, .wb-phone-secure, .wb-voice-confirm, .wb-data-insight",
              ),
            ]
              .filter((el) => {
                const r = el.getBoundingClientRect();
                return r.bottom > box.bottom + 1 || r.right > box.right + 1;
              })
              .map((el) => el.className);
          });
        assert.deepEqual(
          clipping,
          [],
          id + " final content is unclipped at " + width,
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
    await tabs.first().hover();
    await expect(showcase).toHaveAttribute("data-capability", "websites");
    await tabs.last().hover();
    await expect(showcase).toHaveAttribute("data-capability", "automation");
    await section.locator(".wb-demo").scrollIntoViewIfNeeded();
    await expect(showcase).toHaveAttribute("data-running", "true");
    await expect(section.locator(".wb-agent-answer")).toHaveClass(
      /is-visible/,
      { timeout: 5000 },
    );
    await expect(showcase).toHaveAttribute("data-running", "false", {
      timeout: 5500,
    });
    const completed = await section.locator(".wb-scene").textContent();
    await page.waitForTimeout(800);
    assert.equal(await section.locator(".wb-scene").textContent(), completed);
    await tabs.last().click();
    await expect(section.locator(".wb-agent-answer")).not.toHaveClass(
      /is-visible/,
    );
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await expect(showcase).toHaveAttribute("data-running", "false");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(base + "/work");
    await expect(page.locator(".what-we-build").getByRole("tab")).toHaveCount(
      6,
    );
    await page.getByRole("button", { name: "CRM", exact: true }).click();
    await expect(page.locator(".project-card")).toHaveCount(1);
    assert.deepEqual(errors, []);
    return "Product showcase: seven solution demos at five widths, final-state layout, accessibility, keyboard tabs, three deliverables per capability, hover preview, short finite playback, click replay, offscreen suspension, and Work-page integration";
  } finally {
    await page.close();
  }
}
