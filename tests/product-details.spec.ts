import { test, expect } from "@playwright/test";
import { products, money } from "../src/data/products";

test('modern product details preserve information and adapt across requested widths', async ({ page }) => {
  const product = products.find(p => p.slug === 'apex')!;
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/watches/apex/');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('h1')).toHaveText(product.name);
  await expect(page.locator('.detail-price')).toHaveText(money(product.price));
  await expect(page.locator('.detail-description')).toHaveText(product.description);
  await expect(page.locator('.product-specifications dl > div')).toHaveCount(product.details.specifications.length);
  const care = page.getByRole('button', { name: 'Care guide', exact: true });
  await care.click();
  await expect(page.getByRole('region', { name: 'Care guide', exact: true })).toHaveText(product.details.careGuide);
  const warranty = page.getByRole('button', { name: 'Warranty', exact: true });
  await warranty.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('region', { name: 'Warranty', exact: true })).toContainText(product.details.warranty);
  for (const width of [320,375,412,768,1024,1440,1920]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.getByRole('button', { name: 'Add to bag', exact: true })).toBeVisible();
    const image = (await page.locator('.gallery-main').boundingBox())!;
    expect(image.width).toBeLessThanOrEqual(width <= 760 ? 280 : 420);
    expect(image.height).toBeLessThanOrEqual(561);
    if ([375,1440].includes(width)) {
      await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
      await page.screenshot({ path: 'test-results/product-details-' + width + '.png', fullPage: true });
    }
  }
  await page.goto('/watches/aurora/');
  await page.getByRole('button', { name: 'Show view 2', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Show view 2', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Enlarge watch image', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Show full watch', exact: true })).toHaveAttribute('aria-pressed', 'true');
  expect(errors).toEqual([]);
});
