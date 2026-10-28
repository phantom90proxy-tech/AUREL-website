import { test, expect, type Page } from "@playwright/test";

async function ready(page: Page) {
  await expect(page.locator(".profile-link")).toBeVisible();
}
async function scroll(page: Page, y: number) {
  await page.evaluate(
    (top) => window.scrollTo({ top, behavior: "instant" }),
    y,
  );
}

test("full header restores and floating navigation fits every requested width", async ({
  page,
}) => {
  for (const width of [320, 375, 412, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/");
    await ready(page);
    const header = page.locator("header");
    await expect(header).toHaveAttribute("data-compact", "false");
    await expect(page.getByRole("link", { name: "AUREL home" })).toBeVisible();
    await expect(page.locator(".utility-toggle")).toBeHidden();
    const documentTop = await page
      .locator("main")
      .evaluate((el) => el.getBoundingClientRect().top + scrollY);
    const search = await page
      .locator(".utility-icons a")
      .first()
      .elementHandle();
    await scroll(page, 220);
    await expect(header).toHaveAttribute("data-compact", "true");
    await expect(page.locator(".brand-slot")).toHaveAttribute("inert", "");
    await expect
      .poll(() =>
        page
          .locator(".header-inner")
          .evaluate((el) => Math.round(el.getBoundingClientRect().height)),
      )
      .toBe(width <= 1000 ? 56 : 60);
    expect(
      await search!.evaluate(
        (el) =>
          el.isConnected && el === document.querySelector(".utility-icons a"),
      ),
    ).toBe(true);
    if (width <= 1000) {
      await expect(page.locator(".desktop-nav")).toBeHidden();
      await expect(
        page.getByRole("button", { name: "Open navigation" }),
      ).toBeVisible();
    } else await expect(page.locator(".desktop-nav a")).toHaveCount(6);
    await page.locator(".utility-toggle").click();
    await expect(header).toHaveAttribute("data-utilities-open", "true");
    await expect
      .poll(() =>
        page
          .locator(".utility-actions")
          .evaluate((el) => Math.round(el.getBoundingClientRect().width)),
      )
      .toBe(156);
    const box = await page.locator(".header-inner").boundingBox();
    expect(Math.abs(box!.x + box!.width / 2 - width / 2)).toBeLessThan(1);
    expect(box!.x).toBeGreaterThanOrEqual(11);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(
      await page
        .locator("main")
        .evaluate((el) => el.getBoundingClientRect().top + scrollY),
    ).toBe(documentTop);
    for (const action of await page.locator(".utility-icons a").all()) {
      const size = await action.boundingBox();
      expect(size!.width).toBeGreaterThanOrEqual(44);
      expect(size!.height).toBeGreaterThanOrEqual(44);
    }
    await page.keyboard.press("Escape");
    await expect(header).toHaveAttribute("data-utilities-open", "false");
    await scroll(page, 0);
    await expect(header).toHaveAttribute("data-compact", "false");
    await expect(
      page.getByRole("link", { name: "Search watches" }),
    ).toBeVisible();
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await ready(page);
  await scroll(page, 130);
  await expect(page.locator("header")).toHaveAttribute("data-compact", "false");
  await scroll(page, 141);
  await expect(page.locator("header")).toHaveAttribute("data-compact", "true");
  await scroll(page, 110);
  await expect(page.locator("header")).toHaveAttribute("data-compact", "true");
  await scroll(page, 80);
  await expect(page.locator("header")).toHaveAttribute("data-compact", "false");
});

test("hover, mouse toggle, keyboard focus and Escape control the utility group", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await ready(page);
  await scroll(page, 240);
  const header = page.locator("header"),
    toggle = page.locator(".utility-toggle");
  await expect(header).toHaveAttribute("data-compact", "true");
  await toggle.hover();
  await expect(header).toHaveAttribute("data-utilities-open", "true");
  await expect
    .poll(() =>
      page
        .locator(".utility-actions")
        .evaluate((el) => Math.round(el.getBoundingClientRect().width)),
    )
    .toBe(156);
  await page.locator(".utility-icons a").last().hover();
  await expect(header).toHaveAttribute("data-utilities-open", "true");
  await page.mouse.move(0, 500);
  await expect(header).toHaveAttribute("data-utilities-open", "false");
  await toggle.click();
  await expect(header).toHaveAttribute("data-utilities-open", "true");
  await toggle.click();
  await expect(header).toHaveAttribute("data-utilities-open", "false");
  await page.mouse.move(0, 500);
  await page.locator(".desktop-nav a").last().focus();
  await page.keyboard.press("Tab");
  await expect(toggle).toBeFocused();
  await expect(header).toHaveAttribute("data-utilities-open", "true");
  await page.keyboard.press("Tab");
  await expect(
    page
      .locator(".utility-icons")
      .getByRole("link", { name: "Search watches" }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    page.locator(".utility-icons").getByRole("link", { name: /Wishlist/ }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(toggle).toBeFocused();
  await expect(header).toHaveAttribute("data-utilities-open", "false");
  await page.keyboard.press("Tab");
  expect(
    await page
      .locator(".utility-actions")
      .evaluate((el) => el.contains(document.activeElement)),
  ).toBe(false);
  await scroll(page, 240);
  await toggle.focus();
  await expect(header).toHaveAttribute("data-utilities-open", "true");
  await expect
    .poll(() =>
      page
        .locator(".header-inner")
        .evaluate((el) => Math.round(el.getBoundingClientRect().width)),
    )
    .toBe(924);
  await page.screenshot({ path: "test-results/floating-header-desktop.png" });
  await scroll(page, 0);
  await expect(header).toHaveAttribute("data-compact", "false");
  await expect(
    page
      .locator(".utility-icons")
      .getByRole("link", { name: "Search watches" }),
  ).toBeFocused();
});

test("touch toggles utilities and mobile navigation without overflow", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    viewport: { width: 320, height: 900 },
    hasTouch: true,
  });
  try {
    const page = await context.newPage();
    await page.goto(baseURL!);
    await ready(page);
    await scroll(page, 240);
    const header = page.locator("header"),
      toggle = page.locator(".utility-toggle");
    await expect(header).toHaveAttribute("data-compact", "true");
    await toggle.tap();
    await expect(header).toHaveAttribute("data-utilities-open", "true");
    await expect(
      page
        .locator(".utility-icons")
        .getByRole("link", { name: "Search watches" }),
    ).toBeVisible();
    await toggle.tap();
    await expect(header).toHaveAttribute("data-utilities-open", "false");
    await page.getByRole("button", { name: "Open navigation" }).tap();
    await expect(page.locator("#mobile-menu")).toBeVisible();
    await expect
      .poll(() =>
        page
          .locator("#mobile-menu")
          .evaluate((el) => getComputedStyle(el).opacity),
      )
      .toBe("1");
    await expect
      .poll(() =>
        page
          .locator(".header-inner")
          .evaluate((el) => Math.round(el.getBoundingClientRect().width)),
      )
      .toBe(208);
    await page.screenshot({ path: "test-results/floating-header-mobile.png" });
    await page
      .locator("#mobile-menu")
      .getByRole("link", { name: "Collections", exact: true })
      .tap();
    await expect(page).toHaveURL(/\/collections\/?$/);
    await expect(page.locator("#mobile-menu")).toHaveCount(0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  } finally {
    await context.close();
  }
});

test("floating links preserve wishlist and bag state and search focus", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/watches/aster/");
  await page.getByRole("button", { name: "Add to bag", exact: true }).click();
  await page
    .locator(".product-actions")
    .getByRole("button", { name: "Add to wishlist" })
    .click();
  for (const action of ["Search watches", "Wishlist", "Shopping bag"]) {
    await page.goto("/");
    await ready(page);
    await scroll(page, 240);
    await expect(page.locator("header")).toHaveAttribute(
      "data-compact",
      "true",
    );
    await page.locator(".utility-toggle").focus();
    await expect(page.locator("header")).toHaveAttribute(
      "data-utilities-open",
      "true",
    );
    await page
      .locator(".utility-icons")
      .getByRole("link", {
        name: action === "Wishlist" ? /Wishlist, 1 saved/ : action,
        exact: action !== "Wishlist",
      })
      .click();
    if (action === "Search watches")
      await expect(page.getByRole("searchbox")).toBeFocused();
    else if (action === "Wishlist")
      await expect(page.locator('[data-product="aster"]')).toBeVisible();
    else {
      await expect(page.locator(".bag-item output")).toHaveText("1");
      await expect(page.locator(".total")).toContainText("35,900");
    }
  }
});

test("reduced-motion header transitions finish without running animations", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await ready(page);
  await scroll(page, 240);
  await expect(page.locator("header")).toHaveAttribute("data-compact", "true");
  await page.locator(".utility-toggle").focus();
  await expect(page.locator("header")).toHaveAttribute(
    "data-utilities-open",
    "true",
  );
  await expect
    .poll(() =>
      page
        .locator(".utility-actions")
        .evaluate((el) => Math.round(el.getBoundingClientRect().width)),
    )
    .toBe(156);
  expect(
    await page
      .locator("header")
      .evaluate(
        (el) =>
          el
            .getAnimations({ subtree: true })
            .filter((a) => a.playState === "running").length,
      ),
  ).toBe(0);
});
