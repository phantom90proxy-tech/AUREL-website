import { test, expect } from "@playwright/test";

test("circle and centered dot follow the pointer with native accessibility fallbacks", async ({ page }) => {
  await page.goto("/");
  const cursor = page.locator(".circle-cursor");
  await page.locator(".brand-introduction h1").hover();
  await expect(cursor).toHaveAttribute("data-visible", "true");
  await expect(cursor.locator("filter")).toHaveCount(1);
  const ring = await cursor.locator(".circle-cursor-ring").boundingBox();
  const dot = await cursor.locator(".circle-cursor-dot").boundingBox();
  expect(ring).toBeTruthy();
  expect(dot).toBeTruthy();
  expect(Math.abs(ring!.x + ring!.width / 2 - dot!.x - dot!.width / 2)).toBeLessThan(1);
  expect(Math.abs(ring!.y + ring!.height / 2 - dot!.y - dot!.height / 2)).toBeLessThan(1);
  await page.keyboard.press("Tab");
  await expect(cursor).toHaveAttribute("data-visible", "false");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.mouse.move(100, 200);
  await expect(page.locator("html")).not.toHaveAttribute("data-circle-cursor", "active");
});


test("VIEW cursor is limited to collection images and preserves collection links", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  const carousel = page.locator(".collection-carousel");
  await carousel.scrollIntoViewIfNeeded();
  const cursor = page.locator(".circle-cursor");
  // Use the center of the gallery, where the active image faces forward.
  const bounds = await carousel.locator('.collection-carousel-viewport').boundingBox();
  await page.mouse.move(bounds!.x + bounds!.width / 2, bounds!.y + bounds!.height / 2);
  await expect(cursor).toHaveAttribute("data-view", "true");
  await expect(cursor.locator('.circle-cursor-label')).toHaveCSS('opacity', '1');
  await expect(cursor.locator('.circle-cursor-ring')).toHaveCSS('width', '76px');
  await expect(cursor.locator('.circle-cursor-ring')).toHaveCSS('background-color', 'rgb(8, 8, 8)');
  await page.screenshot({ path: 'test-results/collection-view-cursor.png' });
  const href = await page.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.closest('a')?.getAttribute('href'), { x: bounds!.x + bounds!.width / 2, y: bounds!.y + bounds!.height / 2 });
  expect(new URL(href!, page.url()).pathname).toMatch(/^\/watches\/?$/);
  expect(new URL(href!, page.url()).searchParams.has('collection')).toBe(true);
  await carousel.locator('button').first().hover();
  await expect(cursor).toHaveAttribute('data-view', 'false');
  await expect(cursor).toHaveAttribute('data-arrow', 'true');
  await expect(cursor.locator('.circle-cursor-dot')).toHaveCSS('opacity', '0');
  await expect(carousel.locator('button').first()).toHaveCSS('color', 'rgb(255, 255, 255)');
  await page.mouse.move(bounds!.x + bounds!.width / 2, bounds!.y + bounds!.height / 2);
  await expect(cursor).toHaveAttribute('data-view', 'true');
  await page.mouse.click(bounds!.x + bounds!.width / 2, bounds!.y + bounds!.height / 2);
  await expect(page).toHaveURL(new URL(href!, page.url()).href);
  await expect(cursor).toHaveAttribute('data-view', 'false');
});


test("arrow ink originates at entry, contracts toward exit, and supports keyboard focus", async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  const controls = page.locator('.collection-carousel-controls');
  await controls.scrollIntoViewIfNeeded();
  for (const label of ['Previous collection', 'Next collection']) {
    const arrow = page.getByRole('button', { name: label, exact: true });
    const rect = (await arrow.boundingBox())!;
    await page.mouse.move(rect.x - 12, rect.y + 24);
    await arrow.hover({ position: { x: 5, y: 24 } });
    expect(await arrow.evaluate(el => parseFloat(el.style.getPropertyValue('--ink-x')))).toBeLessThan(8);
    await expect(arrow).toHaveCSS('color', 'rgb(255, 255, 255)');
    await expect(arrow.locator('.carousel-arrow-ink')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, -70, -70)');
    await page.mouse.move(rect.x + 52, rect.y + 24);
    expect(await arrow.evaluate(el => parseFloat(el.style.getPropertyValue('--ink-x')))).toBeGreaterThan(40);
    await expect(arrow.locator('.carousel-arrow-ink')).toHaveCSS('transform', 'matrix(0, 0, 0, 0, -70, -70)');
    await arrow.focus();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Shift+Tab');
    await expect(arrow).toBeFocused();
    await expect(arrow).toHaveCSS('color', 'rgb(255, 255, 255)');
  }
});


test("cursor disappears outside the viewport and restores on reentry", async ({ page }) => {
  await page.goto('/');
  const cursor = page.locator('.circle-cursor');
  await page.locator('.brand-introduction h1').hover();
  await expect(cursor).toHaveAttribute('data-visible', 'true');
  await page.evaluate(() => document.documentElement.dispatchEvent(new PointerEvent('pointerleave', { pointerType: 'mouse', relatedTarget: null })));
  await expect(cursor).toHaveAttribute('data-visible', 'false');
  await expect(page.locator('html')).not.toHaveAttribute('data-circle-cursor', 'active');
  await page.mouse.move(100, 200);
  await expect(cursor).toHaveAttribute('data-visible', 'true');
  await page.mouse.move(-10, 200);
  await expect(cursor).toHaveAttribute('data-visible', 'false');
  await page.mouse.move(120, 210);
  await expect(cursor).toHaveAttribute('data-visible', 'true');
});


test("DRAG indicator supports desktop dragging without opening a collection", async ({ page }) => {
  await page.goto('/');
  const viewport = page.locator('.collection-carousel-viewport');
  await viewport.scrollIntoViewIfNeeded();
  const box = (await viewport.boundingBox())!;
  const x = box.x + box.width / 2, y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await expect(page.locator('.cursor-drag-label')).toHaveText('DRAG');
  await expect(page.locator('.circle-cursor')).toHaveAttribute('data-view', 'true');
  const before = await viewport.evaluate(el => el.scrollLeft);
  await page.mouse.down();
  await page.mouse.move(x - 180, y, { steps: 12 });
  await expect(page.locator('.circle-cursor')).toHaveAttribute('data-visible', 'true');
  const after = await viewport.evaluate(el => el.scrollLeft);
  expect(after - before).toBeGreaterThan(100);
  await page.mouse.up();
  await expect(page).toHaveURL(/\/$/);
  await page.getByRole('heading', { name: 'Designed around you.' }).hover();
  await expect(page.locator('.circle-cursor')).toHaveAttribute('data-view', 'false');
});
