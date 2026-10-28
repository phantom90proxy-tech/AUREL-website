import { test, expect } from "@playwright/test";

test("profile stays accessible at the top and while scrolling", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const width of [320, 375, 412, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const profile = page.getByRole("link", {
      name: "Your profile",
      exact: true,
    });
    await expect(profile).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.evaluate(() => window.scrollTo(0, 450));
    await expect(page.locator("header")).toHaveAttribute(
      "data-compact",
      "true",
    );
    await expect(profile).toBeVisible();
    await expect(page.locator(".utility-actions")).toHaveAttribute("inert", "");
    await page.waitForTimeout(400);
    const box = await profile.boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(width);
    expect(box!.y).toBeLessThan(80);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await profile.click();
    await expect(page).toHaveURL(/\/profile\/?$/);
    await expect(
      page.getByRole("heading", { name: "Your personal collection." }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "View wishlist" }),
    ).toHaveAttribute("href", /^\/wishlist\/?$/);
    await expect(
      page.getByRole("link", { name: "View shopping bag" }),
    ).toHaveAttribute("href", /^\/bag\/?$/);
  }
  expect(errors).toEqual([]);
});
