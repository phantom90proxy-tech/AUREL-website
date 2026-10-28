import { test, expect } from "@playwright/test";
import { watchImageCrops } from "../src/data/watch-image-crops";

test("labelled watch photographs crop the top edge without additional image layers", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/watches/");
  await page.getByRole("button", { name: "See more", exact: true }).click();
  await page.getByRole("button", { name: "See more", exact: true }).click();
  await expect(page.locator(".product-image [data-watch-crop]")).toHaveCount(Object.keys(watchImageCrops).length);
  for (const width of [320, 375, 768, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const wrapper of await page.locator(".product-image [data-watch-crop]").all()) {
      await wrapper.scrollIntoViewIfNeeded();
      const result = await wrapper.evaluate(async node => {
        const image = node.querySelector("img")!;
        await image.decode();
        const crop = image.parentElement!.parentElement!.getBoundingClientRect();
        const source = image.getBoundingClientRect();
        return { clippedTop: (crop.top - source.top) / source.height, images: node.querySelectorAll("img").length };
      });
      expect(result.clippedTop).toBeCloseTo(0.055, 2);
      expect(result.images).toBe(1);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});
