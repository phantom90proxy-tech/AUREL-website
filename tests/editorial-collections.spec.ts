import { test, expect } from "@playwright/test";

const categories = ['Sport Collection', 'Classic Collection', 'Chronograph Collection', 'Minimal Collection', 'Limited Edition'];

test('editorial chapters and discovery links and VIEW cursor remain accessible', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/collections/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('The Collections.');
  await expect(page.locator('.editorial-image-link')).toHaveCount(5);
  const expectedImages = ['velocity', 'monarch', 'chrono', 'linea', 'eclipse'];
  for (let index = 0; index < expectedImages.length; index++) {
    await expect(page.locator('.editorial-image-link img').nth(index)).toHaveAttribute('src', '/images/collections/' + expectedImages[index] + '-v2.webp');
  }
  await expect(page.getByRole('navigation', { name: 'Explore the collections' })).toHaveCount(0);
  for (const name of categories) {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const section = page.locator('.editorial-chapter').filter({ has: page.getByRole('heading', { name, exact: true }) });
    await section.scrollIntoViewIfNeeded();
    const href = await section.getByRole('link', { name: 'Discover Collection', exact: true }).getAttribute('href');
    expect(new URL(href!, page.url()).searchParams.get('collection')).toBe(name);
    await section.getByRole('link', { name: 'Discover Collection', exact: true }).click();
    await expect(page).toHaveURL(new URL(href!, 'http://127.0.0.1:3112').href.replace('/watches?', '/watches/?'));
    await page.goBack();
  }
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const photo = page.locator('[data-editorial-view]').first();
  await photo.hover();
  await expect(page.locator('.circle-cursor')).toHaveAttribute('data-editorial', 'true');
  await expect(page.locator('.cursor-view-label')).toBeVisible();
  await photo.click();
  await expect(page).toHaveURL(/collection=Sport/);
  expect(errors).toEqual([]);
});


test('campaign parallax follows scrolling without moving copy or shifting layout', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/collections/');
  const panel = page.locator('#classic');
  await panel.scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  const measure = () => panel.evaluate(el => {
    const rect = el.getBoundingClientRect();
    const copy = el.querySelector('.editorial-chapter-copy')!.getBoundingClientRect();
    const matrix = new DOMMatrix(getComputedStyle(el.querySelector('.collection-parallax-art')!).transform);
    return { height: rect.height, copyOffset: copy.top - rect.top, y: matrix.m42, scale: matrix.a };
  });
  const before = await measure();
  await page.evaluate(() => scrollBy({ top: 240, behavior: 'instant' }));
  await expect.poll(async () => Math.abs((await measure()).y - before.y)).toBeGreaterThan(1);
  const after = await measure();
  expect(after.height).toBeCloseTo(before.height, 1);
  expect(after.copyOffset).toBeCloseTo(before.copyOffset, 1);
  expect(after.scale).toBeCloseTo(1.05, 2);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(async () => (await measure()).scale).toBeCloseTo(1, 3);
  await expect.poll(async () => (await measure()).y).toBeCloseTo(0, 3);
});


test('campaigns use compact controlled-height banners and readable responsive copy', async ({ page }) => {
  await page.goto('/collections/');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [320, 375, 412, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    const panels = page.locator('.campaign-panel');
    for (const panel of await panels.all()) {
      const image = (await panel.locator('.editorial-image-link').boundingBox())!;
      const copy = (await panel.locator('.editorial-chapter-copy').boundingBox())!;
      if (width > 700) {
        expect(image.height).toBeGreaterThanOrEqual(420);
        expect(image.height).toBeLessThanOrEqual(550);
        expect(copy.x + copy.width).toBeLessThan(width * 0.46);
      } else {
        expect(copy.y).toBeGreaterThanOrEqual(image.y + image.height - 1);
      }
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});
