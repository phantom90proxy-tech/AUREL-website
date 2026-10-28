import { test, expect } from "@playwright/test";
import { products, money } from "../src/data/products";
import { limitedPresentations } from "../src/data/limited-edition-presentation";
import { customerCare } from "../src/data/customer-care";

const limited = products.filter(p => p.category === 'Limited Edition');

test('all four Limited Edition pages preserve catalog data, artwork, specifications and related products', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const product of limited) {
    await page.goto('/watches/' + product.slug + '/');
    await expect(page.locator('[data-product-template="limited-edition"]')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveText(product.name);
    await expect(page.locator('.limited-product-price')).toHaveText(money(product.price));
    await expect(page.locator('.limited-product-description')).toHaveText(product.description);
    await expect(page.locator('.gallery-main img')).toHaveAttribute('src', limitedPresentations[product.slug].artwork);
    await expect(page.locator('.limited-technical-content dl > div')).toHaveCount(product.details.specifications.length);
    for (const spec of product.details.specifications) await expect(page.locator('.limited-technical-content dl')).toContainText(spec.value);
    await expect(page.locator('.limited-related .product-card')).toHaveCount(3);
    for (const other of limited.filter(p => p.slug !== product.slug)) {
      const card = page.locator('.limited-related [data-product="' + other.slug + '"]');
      await expect(card.locator('h3')).toHaveText(other.name);
      await expect(card.locator('.product-info > span')).toHaveText(money(other.price));
    }
    for (const item of customerCare.items) {
      await page.getByRole('button', { name: item.title, exact: true }).click();
      await expect(page.getByRole('region', { name: item.title, exact: true })).toContainText(item.status);
    }
    for (const width of [320,375,412,768,1024,1440,1920]) {
      await page.setViewportSize({ width, height: 1000 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await expect(page.getByRole('button', { name: 'Add to bag', exact: true })).toBeVisible();
      if ([375,1440].includes(width) && product.slug === 'aurora') {
        for (const image of await page.locator('main img').all()) { await image.scrollIntoViewIfNeeded(); await image.evaluate(el => (el as HTMLImageElement).decode()); }
        await page.evaluate(() => { (document.activeElement as HTMLElement)?.blur(); scrollTo({ top: 0, behavior: 'instant' }); });
        await page.screenshot({ path: 'test-results/limited-detail-' + width + '.png', fullPage: true });
      }
    }
  }
  await page.goto('/watches/apex/');
  await expect(page.locator('[data-product-template="limited-edition"]')).toHaveCount(0);
  await expect(page.locator('.detail-page')).toHaveCount(1);
  expect(errors).toEqual([]);
});

test('Limited Edition gallery and local shopping controls work with keyboard and normal motion', async ({ page }) => {
  await page.goto('/watches/aurora/');
  const view = page.getByRole('button', { name: 'Show view 2', exact: true });
  await view.focus(); await page.keyboard.press('Enter');
  await expect(view).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.gallery-main img')).toHaveAttribute('src', limitedPresentations.aurora.alternate!);
  await page.getByRole('button', { name: 'Enlarge watch image', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Show full watch', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Increase quantity', exact: true }).click();
  await page.getByRole('button', { name: 'Add to bag', exact: true }).click();
  await page.locator('.limited-product-copy').getByRole('button', { name: 'Add to wishlist', exact: true }).click();
  await page.goto('/bag/');
  await expect(page.locator('.bag-item').filter({ hasText: 'Aurora' }).locator('.quantity output')).toHaveText('2');
  await page.goto('/wishlist/');
  await expect(page.locator('[data-product="aurora"]')).toHaveCount(1);
  await page.goto('/watches/glen/');
  await expect(page.getByRole('button', { name: 'Show view 2', exact: true })).toHaveCount(1);
  for (const slug of ['solace', 'glen']) {
    await page.goto('/watches/' + slug + '/');
    await expect(page.locator('.gallery-main img')).toHaveAttribute('src', limitedPresentations[slug].artwork);
    await expect(page.locator('.limited-story-image')).toHaveClass(/limited-story-wide/);
    await expect(page.locator('.limited-story-image img')).toHaveAttribute('src', limitedPresentations[slug].storyImage);
    await page.getByRole('button', { name: 'Show view 2', exact: true }).click();
    await expect(page.locator('.gallery-main img')).toHaveAttribute('src', limitedPresentations[slug].alternate!);
  }
});
