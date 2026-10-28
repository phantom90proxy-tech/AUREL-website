import { test, expect } from "@playwright/test";
import { products } from "../src/data/products";
import { getLimitedAnatomy } from "../src/data/limited-anatomy";

test("Limited anatomy uses catalog specifications and accessible responsive tabs", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const product of products.filter(p => p.category === "Limited Edition")) {
    await page.goto("/watches/" + product.slug + "/");
    const section = page.locator(".limited-anatomy");
    const components = getLimitedAnatomy(product);
    await expect(section.getByRole("heading", { name: "Anatomy of a Timepiece." })).toBeVisible();
    for (const component of components) {
      await section.getByRole("tab", { name: component.navigation, exact: true }).click();
      const panel = section.getByRole("tabpanel");
      await expect(panel).toContainText(component.title);
      const artwork = section.locator(".anatomy-image img");
      if (component.image) {
        await expect(artwork).toHaveAttribute("src", component.image.src);
        await expect(artwork).toHaveAttribute("alt", component.image.alt);
        await expect(section.locator("figcaption")).toHaveText(component.image.caption);
      }
      await artwork.evaluate(image => (image as HTMLImageElement).decode());
      for (const spec of component.specifications) {
        expect(product.details.specifications).toContainEqual(spec);
        await expect(panel).toContainText(spec.value);
      }
      if (!component.specifications.length) await expect(panel).toContainText(component.description);
    }
    await section.getByRole("tab", { name: "Additional", exact: true }).focus();
    await page.keyboard.press("Home");
    await expect(section.getByRole("tab", { name: "Dial", exact: true })).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(section.getByRole("tab", { name: "Calibre", exact: true })).toHaveAttribute("aria-selected", "true");
    for (const width of [320, 375, 412, 768, 1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: 1000 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      if (product.slug === "aurora" && [375, 1440].includes(width)) {
        await section.scrollIntoViewIfNeeded();
        await section.locator("img").evaluate(image => (image as HTMLImageElement).decode());
        await section.screenshot({ path: "test-results/anatomy-" + width + ".png" });
      }
    }
  }
  await page.goto("/watches/apex/");
  await expect(page.locator(".limited-anatomy")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("anatomy selection works with normal motion and live reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/watches/glen/");
  const section = page.locator(".limited-anatomy");
  await expect(section.getByRole("tabpanel")).toContainText("Dial details not yet available");
  await section.getByRole("tab", { name: "Case", exact: true }).click();
  await expect(section.getByRole("tabpanel")).toContainText("40 mm");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await section.getByRole("tab", { name: "Strap", exact: true }).click();
  await expect(section.getByRole("tabpanel")).toContainText("Leather");
});
