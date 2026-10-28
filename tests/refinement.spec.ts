import { test, expect } from "@playwright/test";
import { imageFraming } from "../src/data/image-framing";

const widths = [320, 375, 412, 768, 1024, 1440, 1920];

test("editorial collections preserve complete photographic frames across widths", async ({ page }) => {
  await page.goto('/collections/');
  await expect(page.locator('.editorial-chapter')).toHaveCount(5);
  for (const width of widths) {
    await page.setViewportSize({ width, height: 1000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    for (const image of await page.locator('.editorial-image-link:visible img').all()) {
      await image.scrollIntoViewIfNeeded();
      await image.evaluate(el => (el as HTMLImageElement).decode());
      const framing = await image.evaluate(el => {
        const img = el as HTMLImageElement;
        const box = img.getBoundingClientRect();
        return { frame: box.width / box.height, original: img.naturalWidth / img.naturalHeight, fit: getComputedStyle(img).objectFit };
      });
      expect(framing.fit).toBe('cover');
      expect(framing.frame).toBeGreaterThan(0.65);
      expect(framing.frame).toBeLessThan(3.6);
    }
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [375, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.screenshot({ path: 'test-results/editorial-collections-' + width + '.png', fullPage: true });
  }
});

test("all 30 cards use one full-frame image with safe crops", async ({
  page,
  browser,
  baseURL,
}) => {
  await page.goto("/watches/");
  await page.getByRole("button", { name: "See more", exact: true }).click();
  await page.getByRole("button", { name: "See more", exact: true }).click();
  await expect(page.locator(".product-card")).toHaveCount(30);
  for (const image of await page.locator(".product-image img").all()) {
    await image.scrollIntoViewIfNeeded();
    await image.evaluate((el) => (el as HTMLImageElement).decode());
  }
  const measure = () =>
    page.locator(".product-card").evaluateAll(
      (cards, profiles) =>
        cards.map((card) => {
          const slug = (card as HTMLElement).dataset.product!;
          const img = card.querySelector("img")!;
          const frame = card
            .querySelector(".product-image")!
            .getBoundingClientRect();
          const box = img.getBoundingClientRect();
          const fit = getComputedStyle(img).objectFit;
          const scale = (fit === "cover" ? Math.max : Math.min)(
            box.width / img.naturalWidth,
            box.height / img.naturalHeight,
          );
          const width = img.naturalWidth * scale,
            height = img.naturalHeight * scale;
          const left = box.left + (box.width - width) / 2,
            top = box.top + (box.height - height) / 2;
          const [x, y, w, h] = profiles[slug].bounds;
          const control = card
            .querySelector(".wishlist-button")!
            .getBoundingClientRect();
          return {
            slug,
            fit,
            cutout: Boolean(profiles[slug].cardImage),
            images: card.querySelectorAll("img").length,
            ratio: frame.width / frame.height,
            height: frame.height,
            width: frame.width,
            loaded: img.complete && img.naturalWidth > 0,
            safe: Math.min(
              left + (width * x) / 100 - frame.left,
              top + (height * y) / 100 - frame.top,
              frame.right - left - (width * (x + w)) / 100,
              frame.bottom - top - (height * (y + h)) / 100,
            ),
            fills:
              box.left <= frame.left + 0.5 &&
              box.right >= frame.right - 0.5 &&
              box.top <= frame.top + 0.5 &&
              box.bottom >= frame.bottom - 0.5,
            filter: getComputedStyle(img).filter,
            controlInside:
              control.left >= frame.left &&
              control.right <= frame.right &&
              control.top >= frame.top &&
              control.bottom <= frame.bottom,
            extras: card.querySelectorAll(
              ".product-tools,.product-artwork,.product-photo-backdrop-frame,.product-tag",
            ).length,
          };
        }),
      imageFraming,
    );
  for (const width of widths) {
    await page.setViewportSize({ width, height: 1000 });
    const measurements = await measure();
    for (const m of measurements) {
      expect(m.loaded, m.slug).toBe(true);
      expect(m.images).toBe(1);
      expect(m.fit).toBe(m.cutout ? "contain" : "cover");
      expect(m.ratio).toBeCloseTo(0.75, 2);
      expect(m.safe, m.slug + " watch bounds at " + width).toBeGreaterThan(-1);
      expect(m.fills).toBe(true);
      expect(m.filter).toBe("none");
      expect(m.controlInside).toBe(true);
      expect(m.extras).toBe(0);
      expect(Math.abs(m.height - measurements[0].height)).toBeLessThan(1);
    }
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  const card = page.locator('[data-product="apex"]');
  await card.hover();
  await expect
    .poll(() =>
      card
        .locator("img")
        .evaluate((img) => new DOMMatrix(getComputedStyle(img).transform).a),
    )
    .toBeCloseTo(1.025, 3);
  expect((await measure())[0].safe).toBeGreaterThan(-1);
  await page.mouse.move(0, 0);
  await expect
    .poll(() =>
      card
        .locator("img")
        .evaluate((img) => new DOMMatrix(getComputedStyle(img).transform).a),
    )
    .toBe(1);
  for (const slug of ["apex", "aster", "chrono"])
    await page
      .locator('[data-product="' + slug + '"] .product-image')
      .screenshot({ path: "test-results/reference-" + slug + ".png" });
  await page.screenshot({
    path: "test-results/catalog-refined-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 375, height: 900 });
  await page.screenshot({
    path: "test-results/catalog-refined-mobile.png",
    fullPage: true,
  });
  const captureContext = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 2,
    reducedMotion: "reduce",
  });
  try {
    const capture = await captureContext.newPage();
    await capture.goto(baseURL! + "/watches/");
    await capture.getByRole("button", { name: "See more", exact: true }).click();
  await capture.getByRole("button", { name: "See more", exact: true }).click();
  await expect(capture.locator(".product-card")).toHaveCount(30);
    for (const slug of ["apex", "aster", "chrono"]) {
      const frame = capture.locator(
        '[data-product="' + slug + '"] .product-image',
      );
      await frame.scrollIntoViewIfNeeded();
      await frame
        .locator("img")
        .evaluate((el) => (el as HTMLImageElement).decode());
      await frame.screenshot({
        path: "test-results/reference-" + slug + ".png",
      });
    }
  } finally {
    await captureContext.close();
  }
});

test("navigation transitions preserve history, page layout and shopping state", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await page
    .locator(".desktop-nav")
    .getByRole("link", { name: "All Watches" })
    .click();
  await expect(page).toHaveURL(/\/watches\/?$/);
  await expect(page.locator("h1")).toHaveText("All Watches");
  await expect
    .poll(() =>
      page
        .locator("[data-page-transition]")
        .evaluate((el) => getComputedStyle(el).opacity),
    )
    .toBe("1");
  await page.locator('[data-product="aster"] .wishlist-button').click();
  await page.goBack();
  await expect(page.locator("h1")).toHaveText("Discover AUREL.");
  await page.goForward();
  await expect(
    page.locator('[data-product="aster"] .wishlist-button'),
  ).toHaveAttribute("aria-pressed", "true");
  await page.evaluate(() =>
    Object.assign(window, { aurelDocumentMarker: true }),
  );
  await page.locator('[data-product="aster"] .product-image a').click();
  await expect(page.locator("h1")).toHaveText("Aster");
  expect(await page.evaluate(() => "aurelDocumentMarker" in window)).toBe(true);
  await page.goBack();
  await expect(
    page.locator('[data-product="aster"] .wishlist-button'),
  ).toHaveAttribute("aria-pressed", "true");
  await page.setViewportSize({ width: 375, height: 900 });
  const before = await page
    .locator("main")
    .evaluate((el) => el.getBoundingClientRect().top + scrollY);
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(page.locator("#mobile-menu")).toBeVisible();
  const after = await page
    .locator("main")
    .evaluate((el) => el.getBoundingClientRect().top + scrollY);
  expect(after).toBe(before);
  await page.keyboard.press("Escape");
  await expect(page.locator("#mobile-menu")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Open navigation" }),
  ).toBeFocused();
  await page.goto("/watches?search=1");
  await expect(page.getByRole("searchbox")).toBeFocused();
  expect(errors).toEqual([]);
});

test("reduced motion and missing JavaScript leave content readable", async ({
  page,
  browser,
  baseURL,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/watches/");
  await page.locator(".product-card").first().hover();
  expect(
    await page
      .locator(".product-card img")
      .first()
      .evaluate((img) => getComputedStyle(img).transform),
  ).toBe("none");
  await page
    .locator(".desktop-nav")
    .getByRole("link", { name: "Collections", exact: true })
    .click();
  expect(
    await page
      .locator("[data-page-transition]")
      .evaluate((el) => getComputedStyle(el).transform),
  ).toBe("none");
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const staticPage = await context.newPage();
    await staticPage.goto(baseURL!);
    for (const section of [
      ".watch-philosophy",
      ".collections-section",
      "#our-story",
    ]) {
      const element = staticPage.locator(section);
      await element.scrollIntoViewIfNeeded();
      await expect(element).toBeVisible();
      expect(await element.evaluate((el) => getComputedStyle(el).opacity)).toBe(
        "1",
      );
    }
  } finally {
    await context.close();
  }
});
