import { test, expect } from "@playwright/test";

test('quick collection filters synchronize with search, selectors and reset', async ({ page }) => {
  await page.goto('/watches/?collection=Classic%20Collection');
  const filters = page.getByRole('group', { name: 'Quick collection filters' });
  await expect(filters.getByRole('button', { name: 'Classic Collection', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('searchbox', { name: 'Search watches', exact: true }).fill('Aster');
  await expect(page.locator('.product-card')).toHaveCount(1);
  await page.getByRole('button', { name: 'Reset filters' }).click();
  await expect(page.locator('.product-card')).toHaveCount(12);
  await expect(page.getByRole('combobox', { name: 'Collection', exact: true })).toHaveCount(0);
  await filters.getByRole('button', { name: 'Minimal Collection', exact: true }).click();
  await expect(filters.getByRole('button', { name: 'Minimal Collection', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await filters.getByRole('button', { name: 'Sport Collection', exact: true }).click();
  await expect(filters.getByRole('button', { name: 'Sport Collection', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Reset filters' }).click();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [320, 375, 412, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.getByRole('searchbox', { name: 'Search watches', exact: true })).toBeVisible();
    const search = (await page.getByRole('searchbox', { name: 'Search watches', exact: true }).boundingBox())!;
    const sort = (await page.getByRole('combobox', { name: 'Sort watches', exact: true }).boundingBox())!;
    expect(sort.y).toBeGreaterThan(search.y + search.height);
    if ([375,1440].includes(width)) {
      await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
      await page.screenshot({ path: 'test-results/modern-catalog-' + width + '.png' });
    }
  }
});


test('search and sorting animate on hover and keyboard focus with reduced-motion fallback', async ({ page }) => {
  await page.goto('/watches/');
  const search = page.locator('.catalog-controls .search-bar');
  await search.hover();
  await expect(search).toHaveCSS('border-top-color', 'rgb(8, 8, 8)');
  await expect.poll(() => search.evaluate(el => getComputedStyle(el, '::after').opacity)).toBe('1');
  const sorting = page.getByRole('combobox', { name: 'Sort watches', exact: true });
  const label = sorting.locator('..');
  await label.hover();
  await expect(label).toHaveCSS('background-color', 'rgb(247, 246, 242)');
  await expect.poll(() => label.evaluate(el => getComputedStyle(el, '::after').opacity)).toBe('1');
  await sorting.focus();
  await expect(sorting).toBeFocused();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(label).toHaveCSS('transition-duration', '0s');
  await expect(search).toHaveCSS('transition-duration', '0s');
});


test('filter fields show their selected values without overlapping icons or inner outlines', async ({ page }) => {
  await page.goto('/watches/');
  const fields = page.locator('.filter-controls');
  await expect(fields.locator('.catalog-control-icon')).toHaveCount(0);
  await expect(fields.locator('svg')).toHaveCount(1);
  await expect(fields.locator('.catalog-select-value').last()).toHaveText('Featured');
  for (const control of await fields.locator('select').all()) {
    await control.focus();
    await expect(control).toHaveCSS('outline-style', 'none');
    const field = control.locator('..');
    await expect(field).toHaveCSS('border-top-color', 'rgb(8, 8, 8)');
    await expect(field.locator('.catalog-select-value')).toBeVisible();
    expect(await field.locator('.catalog-select-value').evaluate(el => el.getBoundingClientRect().height)).toBeGreaterThanOrEqual(18);
  }
});
