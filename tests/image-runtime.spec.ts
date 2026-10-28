import { test, expect } from "@playwright/test";

test("pages and all product images render without browser runtime or console errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  for (const width of [375, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const path of ["/", "/watches/", "/collections/"]) {
      const response = await page.goto(path);
      expect(response?.status(), `${path} at ${width}px`).toBe(200);
      await expect(page.locator("h1")).toBeVisible();
      if (path === "/watches/") {
        await page.getByRole("button", { name: "See more", exact: true }).click();
  await page.getByRole("button", { name: "See more", exact: true }).click();
  await expect(page.locator(".product-card")).toHaveCount(30);
      }
      // Do not mutate SSR image attributes before React hydrates. Exercise native
      // lazy loading by visiting each image, just as a visitor scrolling would.
      // Infinite-carousel buffers reuse these same assets and recenter offscreen;
      // audit the five canonical photographs rather than chasing recycled copies.
      for (const image of await page
        .locator('main img:visible:not([data-copy="buffer"] img)')
        .all()) {
        await image.scrollIntoViewIfNeeded();
        await image.evaluate((element) =>
          (element as HTMLImageElement).decode(),
        );
      }
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      for (const card of await page.locator(".product-card").all()) {
        await expect(card.locator(".product-image img")).toHaveCount(1);
        await expect(
          card.locator(
            ".product-tools, .product-photo-backdrop-frame, .product-artwork",
          ),
        ).toHaveCount(0);
        expect(
          await card
            .locator(".product-image")
            .evaluate((el) => getComputedStyle(el).filter),
        ).toBe("none");
      }
    }
  }
  expect(errors).toEqual([]);
});
