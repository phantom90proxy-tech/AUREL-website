import { test, expect } from "@playwright/test";
test("reduced motion, keyboard access, wishlist removal and unavailable storage", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  expect(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).scrollBehavior,
    ),
  ).toBe("auto");
  await page.goto("/watches/aster");
  await page
    .locator(".product-actions")
    .getByRole("button", { name: "Add to wishlist" })
    .click();
  await page.goto("/wishlist");
  await page.getByRole("button", { name: "Remove from wishlist" }).click();
  await expect(
    page.getByRole("heading", { name: "Keep what speaks to you." }),
  ).toBeVisible();
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("Storage blocked", "SecurityError");
    };
  });
  await page.goto("/watches/aster");
  await page.getByRole("button", { name: "Add to bag", exact: true }).click();
  await expect(page.locator(".toast")).toContainText("saved for this visit");
  await page
    .locator("header")
    .getByRole("link", { name: "Shopping bag", exact: true })
    .click();
  await expect(page.locator(".bag-item output")).toHaveText("1");
});
test("navigation, responsive layouts, images and local shopping", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const width of [1920, 1440, 1024, 768, 412, 375, 320]) {
    await page.setViewportSize({ width, height: 950 });
    for (const path of [
      "/",
      "/watches",
      "/collections",
      "/limited-editions",
      "/watches/aurora",
      "/wishlist",
      "/bag",
    ]) {
      await page.goto(path);
      await expect(page.locator("h1")).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${path} overflow at ${width}`,
      ).toBe(true);
    }
  }
  await page.goto("/");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(page.locator("#mobile-menu")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("#mobile-menu")).toHaveCount(0);
  await page.goto("/watches?collection=Classic%20Collection");
  await expect(page.getByRole("button", { name: "Classic Collection", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("searchbox").fill("Aster");
  await expect(page.locator(".product-card")).toHaveCount(1);
  await page.getByLabel("Sort watches").selectOption("low");
  await page
    .locator(".product-card")
    .getByRole("button", { name: "Add to wishlist" })
    .click();
  await page.reload();
  await expect(
    page
      .locator(".product-card")
      .getByRole("button", { name: "Remove from wishlist" }),
  ).toBeVisible();
  await page.goto("/wishlist");
  await expect(page.locator(".product-card")).toHaveCount(1);
  await page.goto("/watches/aster");
  await page.getByRole("button", { name: "Increase quantity" }).click();
  await page.getByRole("button", { name: "Add to bag", exact: true }).click();
  await expect(page.locator(".toast")).toContainText("Added");
  await page.goto("/bag");
  await expect(page.locator(".bag-item output")).toHaveText("2");
  await expect(page.locator(".total")).toContainText("71,800");
  await page.reload();
  await expect(page.locator(".bag-item output")).toHaveText("2");
  await page.getByRole("button", { name: "Increase quantity" }).click();
  await expect(page.locator(".total")).toContainText("107,700");
  await page.getByRole("button", { name: "Remove Aster from bag" }).click();
  await expect(
    page.getByRole("heading", { name: "Your next chapter awaits." }),
  ).toBeVisible();
  await page.goto("/watches");
  await page.getByRole("button", { name: "All watches", exact: true }).click();
  await page.getByRole("button", { name: "See more", exact: true }).click();
  await page.getByRole("button", { name: "See more", exact: true }).click();
  const paths = await page
    .locator(".product-image a")
    .evaluateAll((links) =>
      links.map((a) => (a as HTMLAnchorElement).pathname),
    );
  expect(paths).toHaveLength(30);
  for (const path of paths) {
    await page.goto(path);
    const img = page.locator(".gallery-main img");
    await expect(img).toBeVisible();
    await expect
      .poll(() => img.evaluate((el) => (el as HTMLImageElement).naturalWidth))
      .toBeGreaterThan(0);
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  // Capture the completed design, while motion behavior is tested separately.
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  // Full-page capture does not scroll lazy images into view. Decode them first
  // so visual review shows the completed page rather than unloaded placeholders.
  await page
    .locator('main img:not([data-copy="buffer"] img)')
    .evaluateAll((images) =>
      Promise.all(
        images.map((image) => {
          const img = image as HTMLImageElement;
          img.loading = "eager";
          return img.decode();
        }),
      ),
    );
  // Visit each lazy-image region before capturing the whole document. This
  // also lets once-only reveals finish before comparing the static design.
  for (const image of await page
    .locator('main img:not([data-copy="buffer"] img)')
    .all()) {
    await image.scrollIntoViewIfNeeded();
  }
  await page.mouse.move(0, 0);
  await expect
    .poll(() => page.evaluate(() => document.getAnimations().length))
    .toBe(0);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.screenshot({
    path: "test-results/home-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "test-results/home-mobile.png",
    fullPage: true,
  });
  expect(errors).toEqual([]);
});
test("corrupt saved state safely falls back", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() =>
    localStorage.setItem("aurel-shopping-v1", "broken"),
  );
  await page.goto("/bag");
  await expect(
    page.getByRole("heading", { name: "Your next chapter awaits." }),
  ).toBeVisible();
});
