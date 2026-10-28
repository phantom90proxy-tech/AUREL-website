import { test, expect } from "@playwright/test";

test("watch and philosophy reveal once without moving the layout", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 500 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const image = page.locator(".watch-detail img");
  const copy = page.locator(".philosophy-copy");
  const height = await page
    .locator(".watch-philosophy")
    .evaluate((el) => el.getBoundingClientRect().height);
  await copy.scrollIntoViewIfNeeded();
  const heading = copy.locator("blockquote");
  await expect
    .poll(() => heading.evaluate((el) => getComputedStyle(el).transform))
    .not.toBe("none");
  await expect
    .poll(() =>
      copy.evaluate((el) =>
        Array.from(el.children).every(
          (child) =>
            getComputedStyle(child).opacity === "1" &&
            getComputedStyle(child).transform === "none",
        ),
      ),
    )
    .toBe(true);
  await page.evaluate(() => {
    const el = document.querySelector(".watch-detail")!;
    window.scrollTo(0, el.getBoundingClientRect().top + scrollY - 100);
  });
  await expect
    .poll(() => image.evaluate((el) => Number(getComputedStyle(el).opacity)))
    .toBeLessThan(1);
  await expect
    .poll(() => image.evaluate((el) => Number(getComputedStyle(el).opacity)))
    .toBe(1);
  await expect
    .poll(() => image.evaluate((el) => getComputedStyle(el).transform))
    .toBe("none");
  expect(
    await page
      .locator(".watch-philosophy")
      .evaluate((el) => el.getBoundingClientRect().height),
  ).toBeCloseTo(height, 1);
  await page.evaluate(() => scrollTo(0, 0));
  await image.scrollIntoViewIfNeeded();
  await copy.scrollIntoViewIfNeeded();
  await page.waitForTimeout(150);
  expect(
    await page
      .locator(".watch-philosophy")
      .evaluate((el) => el.getAnimations({ subtree: true }).length),
  ).toBe(0);
  expect(errors).toEqual([]);
});

test("philosophy preserves the photograph and stays readable with reduced motion and no JavaScript", async ({
  page,
  browser,
  baseURL,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [320, 375, 412, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const image = page.locator(".watch-detail img");
    await image.scrollIntoViewIfNeeded();
    await image.evaluate((el) => (el as HTMLImageElement).decode());
    const order = await page.locator(".watch-philosophy").evaluate((el) => ({
      quoteFirst: el.firstElementChild?.classList.contains("philosophy-copy"),
      background: getComputedStyle(el).backgroundColor,
      centered: getComputedStyle(el.querySelector(".philosophy-copy")!)
        .textAlign,
    }));
    expect(order).toEqual({
      quoteFirst: true,
      background: "rgb(255, 255, 255)",
      centered: "center",
    });
    await expect(page.locator(".philosophy-attribution")).toHaveText(
      "\u2014 AUREL",
    );
    await expect(
      page.locator(".philosophy-description, .philosophy-closing"),
    ).toHaveCount(0);
    const bounds = await image.boundingBox();
    expect(bounds!.width).toBe(width);
    expect(bounds!.height).toBe(width / 2);
    await page.locator(".philosophy-copy").scrollIntoViewIfNeeded();
    await expect(
      page.getByRole("heading", { name: /Every second tells a story/ }),
    ).toBeVisible();
    expect(
      await page
        .locator(".watch-philosophy")
        .evaluate((el) => el.getAnimations({ subtree: true }).length),
    ).toBe(0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
    ).toBe(false);
  }
  await page.screenshot({
    path: "test-results/philosophy-desktop.png",
    fullPage: true,
  });
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const staticPage = await context.newPage();
    await staticPage.goto(baseURL!);
    await staticPage.locator(".philosophy-copy").scrollIntoViewIfNeeded();
    await expect(
      staticPage.getByRole("heading", { name: /Every second tells a story/ }),
    ).toBeVisible();
    await expect(staticPage.locator(".philosophy-attribution")).toHaveText(
      "\u2014 AUREL",
    );
  } finally {
    await context.close();
  }
});
