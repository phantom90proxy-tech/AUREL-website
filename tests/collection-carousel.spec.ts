import { test, expect } from "@playwright/test";
import { imageFraming } from "../src/data/image-framing";
import { collectionGeometry } from "../src/lib/collection-geometry";

const names = [
  "Sport Collection",
  "Classic Collection",
  "Chronograph Collection",
  "Minimal Collection",
  "Limited Edition",
];

test("all five homepage collections are reachable and responsive", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (["warning", "error"].includes(message.type()))
      errors.push(message.text());
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [320, 375, 412, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/");
    const carousel = page.getByRole("region", { name: "Watch collections" });
    await expect(carousel).toHaveAttribute("data-ready", "true");
    await expect(
      carousel.locator(
        '.collection-carousel-slide[data-copy="main"] .collection-card',
      ),
    ).toHaveCount(5);
    await expect(carousel.getByRole("status")).toHaveText(
      `${names[2]}, 3 of 5`,
    );
    const previous = carousel.getByRole("button", {
      name: "Previous collection",
    });
    const next = carousel.getByRole("button", { name: "Next collection" });
    await previous.click();
    await expect(carousel.getByRole("status")).toHaveText(
      `${names[1]}, 2 of 5`,
    );
    await previous.click();
    await expect(previous).toBeEnabled();
    for (let index = 0; index < names.length; index++) {
      await expect(carousel.getByRole("status")).toHaveText(
        `${names[index]}, ${index + 1} of 5`,
      );
      const link = carousel
        .locator(
          '.collection-carousel-slide[data-copy="main"] .collection-card',
        )
        .nth(index);
      const url = new URL(
        (await link.getAttribute("href"))!,
        "https://aurel.local",
      );
      expect(url.searchParams.get("collection")).toBe(names[index]);
      const image = link.locator("img");
      await image.evaluate((el) => (el as HTMLImageElement).decode());
      expect(await image.evaluate((el) => getComputedStyle(el).objectFit)).toBe(
        "cover",
      );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
      ).toBe(false);
      if (index < 4) await next.click();
    }
    await expect(next).toBeEnabled();
    await next.click();
    await expect(carousel.getByRole("status")).toHaveText(
      `${names[0]}, 1 of 5`,
    );
    await previous.click();
    await expect(carousel.getByRole("status")).toHaveText(
      `${names[4]}, 5 of 5`,
    );
  }
  expect(errors).toEqual([]);
});

test("carousel arrows, keyboard, wheel and all collection links work", async ({
  page,
}) => {
  await page.goto("/");
  const carousel = page.locator(".collection-carousel");
  await expect(carousel).toHaveAttribute("data-ready", "true");
  await carousel.getByRole("button", { name: "Next collection" }).click();
  await expect(carousel.getByRole("status")).toHaveText(`${names[3]}, 4 of 5`);
  await page.waitForTimeout(650);
  const link = carousel
    .locator('.collection-carousel-slide[data-copy="main"] .collection-card')
    .nth(3);
  await link.focus();
  await link.press("Home");
  await expect(
    carousel
      .locator('.collection-carousel-slide[data-copy="main"] .collection-card')
      .first(),
  ).toBeFocused();
  await expect(carousel.getByRole("status")).toHaveText(`${names[0]}, 1 of 5`);
  await page.keyboard.press("End");
  await expect(
    carousel
      .locator('.collection-carousel-slide[data-copy="main"] .collection-card')
      .last(),
  ).toBeFocused();
  await expect(carousel.getByRole("status")).toHaveText(`${names[4]}, 5 of 5`);
  await page.waitForTimeout(650);
  await carousel.locator(".collection-carousel-viewport").hover();
  await page.mouse.wheel(-800, 0);
  await expect
    .poll(() => carousel.getByRole("status").textContent())
    .not.toContain("5 of 5");
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const name of names) {
    await page.goto("/");
    const card = page
      .locator('.collection-carousel [data-copy="main"] .collection-card')
      .filter({
        has: page.getByRole("img", {
          name,
          exact: true,
        }),
      });
    await card.focus();
    await card.press("Enter");
    await expect(page.getByRole("button", { name: name, exact: true })).toHaveAttribute("aria-pressed", "true");
  }
});

test("native touch swiping changes the mobile collection", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    viewport: { width: 375, height: 900 },
    hasTouch: true,
    isMobile: true,
  });
  try {
    const page = await context.newPage();
    await page.goto(baseURL!);
    const carousel = page.locator(".collection-carousel");
    await carousel.scrollIntoViewIfNeeded();
    await expect(carousel.getByRole("status")).toHaveText(
      `${names[2]}, 3 of 5`,
    );
    const image = carousel
      .locator('.collection-carousel-slide[data-copy="main"] .collection-card')
      .nth(2)
      .locator(".collection-image");
    const box = await image.boundingBox();
    const y = Math.max(120, Math.min(700, box!.y + box!.height / 2));
    const session = await context.newCDPSession(page);
    await session.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x: 310, y }],
    });
    for (let x = 280; x >= 60; x -= 20) {
      await session.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [{ x, y }],
      });
      await page.waitForTimeout(16);
    }
    await session.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    await expect
      .poll(() => carousel.getByRole("status").textContent())
      .not.toContain("3 of 5");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
    ).toBe(false);
  } finally {
    await context.close();
  }
});

test("infinite wrap retains five accessible categories and clickable neighboring copies", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (["warning", "error"].includes(message.type()))
      errors.push(message.text());
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const carousel = page.locator(".collection-carousel");
  await expect(carousel.getByRole("group")).toHaveCount(5);
  for (const link of await carousel.locator('[data-copy="buffer"] a').all()) {
    await expect(link).toHaveAttribute("tabindex", "-1");
  }
  const next = carousel.getByRole("button", { name: "Next collection" });
  const previous = carousel.getByRole("button", {
    name: "Previous collection",
  });
  let index = 2;
  for (const direction of [1, -1]) {
    for (let step = 0; step < 12; step++) {
      await (direction === 1 ? next : previous).click();
      index = (index + direction + 5) % 5;
      await expect(carousel.getByRole("status")).toHaveText(
        `${names[index]}, ${index + 1} of 5`,
      );
    }
  }
  await previous.click();
  await expect(carousel.getByRole("status")).toHaveText(`${names[1]}, 2 of 5`);
  await previous.click();
  await expect(carousel.getByRole("status")).toHaveText(`${names[0]}, 1 of 5`);
  await carousel.locator('[data-copy="buffer"]').nth(4).locator("a").click();
  await expect(page.getByRole("button", { name: "Limited Edition", exact: true })).toHaveAttribute("aria-pressed", "true");
  expect(errors).toEqual([]);
});

test("shared cylindrical geometry stays symmetric with a forward-facing center", () => {
  for (const width of [320, 768, 1440, 1920]) {
    const center = collectionGeometry(0, 400, width);
    expect(center).toEqual({ x: 0, z: 0, rotateY: 0, scale: 1 });
    const near = collectionGeometry(1, 400, width);
    const outer = collectionGeometry(2, 400, width);
    const left = collectionGeometry(-1, 400, width);
    expect(left.z).toBe(near.z);
    expect(left.rotateY).toBe(-near.rotateY);
    expect(left.x).toBe(-near.x);
    expect(outer.z).toBeLessThan(near.z);
    expect(Math.abs(outer.rotateY)).toBeGreaterThan(Math.abs(near.rotateY));
    // Depth follows the cylinder's cosine, not a linear per-card offset.
    expect(Math.abs(outer.z / near.z)).toBeGreaterThan(3.9);
  }
});

test("every centered category shares the curved band and preserves the complete watch", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1200 });
  await page.goto("/");
  const carousel = page.locator(".collection-carousel");
  await page.evaluate(() => {
    const section = document.querySelector(".home-collections")!;
    scrollTo(0, section.getBoundingClientRect().top + scrollY - 80);
  });
  const next = carousel.getByRole("button", { name: "Next collection" });
  for (let step = 0; step < 5; step++) {
    const index = (2 + step) % 5;
    await expect(carousel.getByRole("status")).toHaveText(
      `${names[index]}, ${index + 1} of 5`,
    );
    await page.waitForTimeout(750);
    const card = carousel
      .locator('[data-copy="main"] .collection-card')
      .nth(index);
    await card
      .locator("img")
      .evaluate((el) => (el as HTMLImageElement).decode());
    const result = await card.evaluate((el, profiles) => {
      const surface = el.closest(".collection-carousel-surface")!;
      const matrix = new DOMMatrixReadOnly(getComputedStyle(surface).transform);
      const img = el.querySelector("img")!;
      const box = img.getBoundingClientRect();
      const frame = el
        .querySelector(".collection-image")!
        .getBoundingClientRect();
      const scale = Math.max(
        box.width / img.naturalWidth,
        box.height / img.naturalHeight,
      );
      const photoWidth = img.naturalWidth * scale,
        photoHeight = img.naturalHeight * scale;
      const [x, y, w, h] =
        profiles[(el as HTMLElement).dataset.collectionProduct!].bounds;
      const left =
        box.left + (box.width - photoWidth) / 2 + (photoWidth * x) / 100;
      const top =
        box.top + (box.height - photoHeight) / 2 + (photoHeight * y) / 100;
      const right = left + (photoWidth * w) / 100,
        bottom = top + (photoHeight * h) / 100;
      const band = document
        .querySelector(".collection-carousel-boundary")!
        .getBoundingClientRect();
      return {
        angle: matrix.m13,
        depth: matrix.m43,
        left: left - frame.left,
        right: frame.right - right,
        top: top - (band.top + band.height * 0.095),
        bottom: band.top + band.height * 0.905 - bottom,
        bandLeft: band.left,
        bandWidth: band.width,
      };
    }, imageFraming);
    expect(result.angle).toBeCloseTo(0, 3);
    expect(result.depth).toBeCloseTo(0, 2);
    expect(
      Math.min(result.left, result.right, result.top, result.bottom),
      names[index],
    ).toBeGreaterThan(1);
    expect(result.bandLeft).toBe(0);
    expect(result.bandWidth).toBe(1440);
    const gaps = await carousel.evaluate((el) => {
      const images = Array.from(el.querySelectorAll(".collection-image"))
        .map((image) => image.getBoundingClientRect())
        .filter((box) => box.right > 0 && box.left < innerWidth);
      return images.slice(1).map((box, i) => box.left - images[i].right);
    });
    expect(Math.min(...gaps)).toBeGreaterThan(10);
    expect(Math.max(...gaps) - Math.min(...gaps)).toBeLessThan(4);
    await page.screenshot({
      path: `test-results/curved-collection-${index + 1}.png`,
    });
    await next.click();
  }
});
