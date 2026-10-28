import { test, expect } from "@playwright/test";

const phrases = [
  "personal style.",
  "timeless elegance.",
  "modern sophistication.",
  "individuality.",
  "everyday moments.",
  "your story.",
];

test("hero rotates every five seconds, loops, and keeps its layout stable", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.locator(".rotating-phrase-text")).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  const text = page.locator(".rotating-phrase-text");
  await expect(text).toHaveText(phrases[0]);
  const widths = [320, 375, 412, 768, 1024, 1440, 1920];
  const sizes = new Map<number, number>();
  const height = () =>
    page
      .locator(".brand-introduction h2")
      .evaluate((el) => el.getBoundingClientRect().height);
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    sizes.set(width, await height());
  }
  await page.waitForTimeout(3000);
  await expect(text).toHaveText(phrases[0]);
  for (let index = 1; index <= phrases.length; index++) {
    await expect
      .poll(() => text.allTextContents(), { timeout: 6500 })
      .toEqual([phrases[index % phrases.length]]);
    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 });
      expect(await height()).toBeCloseTo(sizes.get(width)!, 1);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
      ).toBe(false);
      await expect(
        page.getByRole("heading", {
          name: "Where time meets personal style.",
          exact: true,
        }),
      ).toBeVisible();
    }
  }
  expect(errors).toEqual([]);
});

test("reduced motion keeps the original phrase static", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.clock.install();
  await page.goto("/");
  await expect(page.locator(".rotating-phrase-text")).toBeVisible();
  await page.clock.fastForward(35000);
  await expect(page.locator(".rotating-phrase-text")).toHaveText(
    "personal style.",
  );
  expect(
    await page
      .locator(".rotating-phrase")
      .evaluate((el) => el.getAnimations({ subtree: true }).length),
  ).toBe(0);
});
