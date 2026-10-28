import { test, expect } from "@playwright/test";

for (const initial of ["reduce", "no-preference"] as const) {
  test(`live motion preference follows browser changes from ${initial}`, async ({
    page,
  }) => {
    const diagnostics: string[] = [];
    page.on("console", (message) => {
      if (["warning", "error"].includes(message.type()))
        diagnostics.push(message.text());
    });
    page.on("pageerror", (error) => diagnostics.push(error.message));
    await page.emulateMedia({ reducedMotion: initial });
    await page.goto("/");
    const phrase = page.locator(".rotating-phrase-text");
    const button = page.locator(".brand-introduction-cta");
    await expect(phrase).toHaveText("personal style.");

    // Change preference without reloading or remounting the application.
    await page.emulateMedia({ reducedMotion: "no-preference" });
    expect(
      await page.evaluate(
        () => matchMedia("(prefers-reduced-motion: reduce)").matches,
      ),
    ).toBe(false);
    await expect
      .poll(() => phrase.allTextContents(), { timeout: 7000 })
      .toEqual(["timeless elegance."]);
    expect(
      await button.evaluate(
        (el) => getComputedStyle(el, "::before").transitionDuration,
      ),
    ).toBe("0.5s");
    await button.hover();
    await expect
      .poll(() =>
        button.evaluate((el) => getComputedStyle(el, "::before").transform),
      )
      .toBe("matrix(1, 0, 0, 1, 0, 0)");
    await page.mouse.move(0, 0);

    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect
      .poll(() => phrase.allTextContents())
      .toEqual(["personal style."]);
    expect(
      await button.evaluate(
        (el) => getComputedStyle(el, "::before").transitionDuration,
      ),
    ).toBe("0s");
    await page.evaluate(() => scrollTo(0, 250));
    await expect(page.locator("header")).toHaveAttribute(
      "data-compact",
      "true",
    );
    await page.locator(".utility-toggle").click();
    await expect(page.locator("header")).toHaveAttribute(
      "data-utilities-open",
      "true",
    );
    await expect
      .poll(() =>
        page
          .locator("header")
          .evaluate((el) => el.getAnimations({ subtree: true }).length),
      )
      .toBe(0);
    await page.keyboard.press("Escape");
    await page.locator(".watch-detail img").scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        page
          .locator(".watch-philosophy")
          .evaluate((el) => el.getAnimations({ subtree: true }).length),
      )
      .toBe(0);
    await page.waitForTimeout(5300);
    await expect(phrase).toHaveText("personal style.");

    // Restoring normal motion resumes the saved phrase and restarts one timer.
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await expect
      .poll(() => phrase.allTextContents(), { timeout: 7000 })
      .toEqual(["timeless elegance."]);
    await expect
      .poll(() => phrase.allTextContents(), { timeout: 7000 })
      .toEqual(["modern sophistication."]);
    await page.goto("/watches/");
    await page.goto("/");
    await expect(phrase).toHaveText("personal style.");
    expect(diagnostics).toEqual([]);
  });
}
