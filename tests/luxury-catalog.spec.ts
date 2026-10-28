import { test, expect } from "@playwright/test";
import { products, money } from "../src/data/products";

test('catalog pagination exposes all 30 original watches once, with exact names and prices', async ({ page }) => {
  await page.goto('/watches/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('All Watches');
  await expect(page.locator('.product-card')).toHaveCount(12);
  await expect(page.locator('.result-count')).toContainText('30 timepieces');
  await page.getByRole('button', { name: 'See more', exact: true }).click();
  await expect(page.locator('.product-card')).toHaveCount(24);
  await page.getByRole('button', { name: 'See more', exact: true }).click();
  await expect(page.locator('.product-card')).toHaveCount(30);
  await expect(page.getByRole('button', { name: 'See more', exact: true })).toHaveCount(0);
  for (const product of products) {
    const card = page.locator('[data-product="' + product.slug + '"]');
    await expect(card).toHaveCount(1);
    await expect(card.locator('h3')).toHaveText(product.name);
    await expect(card.locator('.product-info > span')).toHaveText(money(product.price));
  }
  await page.getByLabel('Sort watches').selectOption('high');
  await expect(page.locator('.product-card')).toHaveCount(12);
  const first = [...products].sort((a,b) => b.price-a.price)[0];
  await expect(page.locator('.product-card').first()).toHaveAttribute('data-product', first.slug);
});

test('filter panel supports price, category, validation, focus restoration and reset', async ({ page }) => {
  await page.goto('/watches/');
  const trigger = page.getByRole('button', { name: /^Filters/ });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Filters' });
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await trigger.click();
  const max = [...products].sort((a,b)=>a.price-b.price)[9].price;
  await dialog.getByLabel('Maximum price', { exact: true }).fill(String(max));
  await dialog.getByRole('button', { name: /^Show / }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page.locator('.result-count')).toContainText(String(products.filter(p=>p.price<=max).length) + ' timepieces');
  await trigger.click();
  await dialog.getByRole('button', { name: 'Clear filters', exact: true }).click();
  await dialog.getByLabel('Filter by collection').selectOption('Classic Collection');
  await dialog.getByRole('button', { name: /^Show / }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Classic Collection', exact: true })).toHaveAttribute('aria-pressed','true');
  await page.getByRole('searchbox', { name: 'Search watches' }).fill('Aster');
  await expect(page.locator('.product-card')).toHaveCount(1);
  await page.getByRole('button', { name: 'Reset filters' }).click();
  await expect(page.locator('.product-card')).toHaveCount(12);
  await trigger.click();
  await dialog.getByLabel('Minimum price', { exact: true }).fill('60000');
  await dialog.getByLabel('Maximum price', { exact: true }).fill('40000');
  await dialog.getByRole('button', { name: /^Show / }).click();
  await expect(dialog.getByRole('alert')).toContainText('Minimum price');
  await dialog.getByRole('button', { name: 'Close filters' }).click();
});

test('catalog and filter drawer fit all requested widths with reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/watches/');
  for (const width of [320,375,412,768,1024,1440,1920]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.getByRole('button', { name: /^Filters/ }).click();
    const dialog = page.getByRole('dialog', { name: 'Filters' });
    const box=(await dialog.boundingBox())!;
    expect(box.width).toBeLessThanOrEqual(width);
    await expect(dialog.getByLabel('Minimum price', { exact: true })).toBeVisible();
    await dialog.getByRole('button', { name: 'Close filters' }).click();
    expect((await page.getByRole('searchbox', { name: 'Search watches' }).boundingBox())!.height).toBeLessThan(60);
    if ([375,1440].includes(width)) {
      for (const image of await page.locator('.product-card img').all()) { await image.scrollIntoViewIfNeeded(); await image.evaluate(el => (el as HTMLImageElement).decode()); }
      await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
      await page.screenshot({ path: 'test-results/luxury-catalog-' + width + '.png', fullPage: true });
    }
  }
});
