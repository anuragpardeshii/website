import assert from "node:assert/strict";
import { resolve } from "node:path";
import { expect } from "@playwright/test";

export async function verifyJourney(context, base, output) {
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  try {
    await page.goto(base + "/");
    const journey = page.locator(".development-journey");
    await journey.scrollIntoViewIfNeeded();
    assert.equal(await journey.locator(".dj-journey-header").count(), 0);
    await expect(journey).toHaveAttribute("data-running", "false");
    await expect(page.locator(".dj-request-accept")).toContainText(
      "Discovery call booked",
    );
    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
        "Hero fits at " + width + "px",
      );
    }
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await journey.scrollIntoViewIfNeeded();
    await expect(journey).toHaveAttribute("data-running", "true");
    await expect(journey).toHaveAttribute("data-stage", "0");
    await expect(page.locator(".dj-request-accept")).toContainText(
      "Discovery call booked",
      { timeout: 6000 },
    );

    // Device preferences still control motion after the navbar toggle is removed.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await journey.scrollIntoViewIfNeeded();
    await expect(journey).toHaveAttribute("data-running", "false");
    const frozen = await journey.textContent();
    await page.waitForTimeout(3500);
    assert.equal(await journey.getAttribute("data-stage"), "0");
    assert.equal(await journey.textContent(), frozen);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await journey.scrollIntoViewIfNeeded();
    await expect(journey).toHaveAttribute("data-stage", "1", { timeout: 6500 });
    await expect(journey).toHaveAttribute("data-stage", "2", {
      timeout: 15000,
    });
    await expect(journey).toHaveAttribute("data-stage", "3", {
      timeout: 15000,
    });
    await expect(page.locator(".dj-code-line").nth(9)).toContainText(
      "Find your flow",
      { timeout: 15000 },
    );
    await expect(page.locator(".dj-terminal-content")).toContainText(
      "Compiled successfully",
      { timeout: 15000 },
    );
    await expect(journey).toHaveAttribute("data-stage", "4", { timeout: 6000 });
    await expect(page.locator(".dj-browser-address")).toBeVisible({
      timeout: 15000,
    });
    await expect(page.locator(".dj-browser-address")).toContainText(
      "forma.example",
    );
    await journey.screenshot({
      path: resolve(output, "journey-live-desktop.png"),
      animations: "disabled",
    });
    await expect(journey).toHaveAttribute("data-stage", "0", {
      timeout: 15000,
    });
    await page.evaluate(() =>
      window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }),
    );
    await expect(journey).toHaveAttribute("data-running", "false");
    // Let the pending scene crossfade settle before comparing visible content.
    await page.waitForTimeout(900);
    const offscreenContent = await journey.textContent();
    await page.waitForTimeout(1000);
    assert.equal(await journey.textContent(), offscreenContent);
    assert.deepEqual(errors, []);
    return "Hero journey: removed navigation, five responsive widths, reduced motion, five stages, code edits, terminal, live preview, device motion preferences, looping, and offscreen suspension";
  } finally {
    await page.close();
  }
}
