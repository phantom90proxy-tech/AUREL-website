import { test, expect } from "@playwright/test";

test("photographic hero loads both originals and remains readable at all widths", async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  const hero = page.locator('.brand-introduction');
  for (const width of [320, 375, 412, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect(hero.locator('h1')).toBeVisible();
    await expect(hero.locator('.brand-introduction-cta')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(hero.locator('.hero-photograph img')).toHaveCount(3);
    expect(await hero.locator('.hero-photograph img').evaluateAll(images => images.every(image => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0))).toBe(true);
    if (width <= 1100) {
      const text = (await hero.locator('.brand-introduction-inner').boundingBox())!;
      const photo = (await hero.locator('.hero-photography').boundingBox())!;
      expect(photo.y).toBeGreaterThanOrEqual(text.y + text.height);
    }
    if ([375, 768, 1440, 1920].includes(width)) await page.screenshot({ path: 'test-results/hero-' + width + '.png' });
  }
  expect(errors).toEqual([]);
});

test("hero crossfade pauses offscreen, supports controls and reduced motion", async ({ page }) => {
  await page.goto('/');
  const hero = page.locator('.hero-photography');
  await expect(hero).toHaveAttribute('data-active', '0');
  await expect(hero).toHaveAttribute('data-active', '1', { timeout: 9500 });
  await expect(hero.locator('.hero-photograph').nth(1)).toHaveCSS('opacity', '1');
  await page.getByRole('button', { name: 'Pause hero photographs' }).click();
  await page.waitForTimeout(7300);
  await expect(hero).toHaveAttribute('data-active', '1');
  await page.getByRole('button', { name: 'Show Glen photograph' }).click();
  await expect(hero).toHaveAttribute('data-active', '0');
  await page.getByRole('button', { name: 'Play hero photographs' }).click();
  await page.locator('.customer-care').scrollIntoViewIfNeeded();
  await page.waitForTimeout(7300);
  await expect(hero).toHaveAttribute('data-active', '0');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.waitForTimeout(7300);
  await expect(hero).toHaveAttribute('data-active', '0');
  await expect(page.getByRole('button', { name: 'Play hero photographs' })).toBeDisabled();
  await page.getByRole('button', { name: 'Show Aurora photograph' }).click();
  await expect(hero).toHaveAttribute('data-active', '2');
  await page.getByRole('button', { name: 'Show Aurora Emerald photograph' }).click();
  await expect(hero).toHaveAttribute('data-active', '1');
  await expect(hero.locator('.hero-photograph').nth(1).locator('img')).toHaveAttribute('src', '/images/hero/aurora-emerald.webp');
});
