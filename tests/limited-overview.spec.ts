import { test, expect } from "@playwright/test";
import { products, money } from "../src/data/products";
import { limitedPresentations } from "../src/data/limited-edition-presentation";

test("Limited Edition showcase has four correct campaigns and responsive discovery links", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/limited-editions/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Beyond the ordinary.");
  await expect(page.locator(".limited-overview-card")).toHaveCount(4);
  for (const product of products.filter(p => p.category === "Limited Edition")) {
    const card = page.locator('[data-edition="' + product.slug + '"]');
    await expect(card.getByRole("heading", { name: product.name, exact: true })).toBeVisible();
    await expect(card.locator(".limited-overview-price")).toHaveText(money(product.price));
    await expect(card.locator(".limited-overview-description")).toHaveText(product.description);
    await expect(card.locator("img")).toHaveAttribute("src", limitedPresentations[product.slug].storyImage);
    await card.locator("img").evaluate(image => (image as HTMLImageElement).decode());
    await expect(card.getByRole("link", { name: "Discover " + product.name, exact: true })).toHaveAttribute("href", "/watches/" + product.slug + "/");
  }
  for (const width of [320,375,412,768,1024,1440,1920]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const columns = await page.locator(".limited-overview-gallery").evaluate(el => getComputedStyle(el).gridTemplateColumns.split(" ").length);
    expect(columns).toBe(width <= 760 ? 1 : 2);
    if ([375,1440].includes(width)) {
      await page.evaluate(() => { (document.activeElement as HTMLElement)?.blur(); scrollTo({ top: 0, behavior: "instant" }); });
      await page.screenshot({ path: "test-results/limited-overview-" + width + ".png", fullPage: true });
    }
  }
  await page.getByRole("link", { name: "Discover Aurora", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/watches\/aurora\//);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Aurora");
  expect(errors).toEqual([]);
});
