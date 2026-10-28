import { test, expect } from "@playwright/test";
import { customerCare } from "../src/data/customer-care";

test("customer care has the correct placement, responsive columns, and disclosures", async ({
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
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const section = page.locator(".customer-care");
    await section.scrollIntoViewIfNeeded();
    await expect(
      section.getByRole("heading", { name: customerCare.heading }),
    ).toBeVisible();
    expect(
      await section.evaluate((el) => {
        const collections = document.querySelector(".collections-section")!;
        const story = document.querySelector("#our-story")!;
        return (
          Boolean(
            collections.compareDocumentPosition(el) &
            Node.DOCUMENT_POSITION_FOLLOWING,
          ) &&
          Boolean(
            el.compareDocumentPosition(story) &
            Node.DOCUMENT_POSITION_FOLLOWING,
          )
        );
      }),
    ).toBe(true);
    const boxes = await section
      .locator(".customer-care-item")
      .evaluateAll((items) =>
        items.map((el) => el.getBoundingClientRect().toJSON()),
      );
    expect(boxes).toHaveLength(3);
    if (width > 760) {
      expect(boxes[0].top).toBe(boxes[1].top);
      expect(boxes[1].top).toBe(boxes[2].top);
      expect(boxes[0].width).toBeCloseTo(boxes[1].width, 1);
    } else {
      expect(boxes[1].top).toBeGreaterThanOrEqual(boxes[0].bottom);
      expect(boxes[2].top).toBeGreaterThanOrEqual(boxes[1].bottom);
    }
    for (const item of customerCare.items) {
      const button = section.getByRole("button", {
        name: item.title,
        exact: true,
      });
      const panel = page.locator(`#customer-care-${item.id}-panel`);
      await expect(button).toHaveAttribute("aria-expanded", "false");
      await expect(panel).toHaveAttribute("inert", "");
      await button.click();
      await expect(button).toHaveAttribute("aria-expanded", "true");
      await expect(
        section.getByRole("region", { name: item.title }),
      ).toBeVisible();
      await expect(panel).toContainText(item.status);
      await expect
        .poll(() =>
          panel.evaluate((el) => el.getAnimations({ subtree: true }).length),
        )
        .toBe(0);
      await button.click();
      await expect(panel).toHaveAttribute("aria-hidden", "true");
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
    ).toBe(false);
  }
  await page
    .locator(".customer-care")
    .screenshot({ path: "test-results/customer-care-desktop.png" });
  expect(errors).toEqual([]);
});

test("customer care supports keyboard, touch, and smooth normal-motion expansion", async ({
  page,
  browser,
  baseURL,
}) => {
  await page.goto("/");
  const section = page.locator(".customer-care");
  const shipping = section.getByRole("button", {
    name: "Shipping Information",
    exact: true,
  });
  const warranty = section.getByRole("button", {
    name: "Warranty & Watch Care",
    exact: true,
  });
  await shipping.focus();
  await page.keyboard.press("Enter");
  await expect(shipping).toHaveAttribute("aria-expanded", "true");
  await expect
    .poll(() =>
      page
        .locator("#customer-care-shipping-panel")
        .evaluate((el) => el.getBoundingClientRect().height),
    )
    .toBeGreaterThan(20);
  await page.keyboard.press("Tab");
  await expect(warranty).toBeFocused();
  await page.keyboard.press("Space");
  await expect(warranty).toHaveAttribute("aria-expanded", "true");
  await expect(shipping).toHaveAttribute("aria-expanded", "true");
  await warranty.press("Space");
  await expect(warranty).toHaveAttribute("aria-expanded", "false");
  await expect
    .poll(() =>
      page
        .locator("#customer-care-warranty-care-panel")
        .evaluate((el) => el.getBoundingClientRect().height),
    )
    .toBe(0);
  const context = await browser.newContext({
    hasTouch: true,
    viewport: { width: 320, height: 900 },
  });
  try {
    const mobile = await context.newPage();
    await mobile.goto(baseURL!);
    const repair = mobile
      .locator(".customer-care")
      .getByRole("button", { name: "Repair Pricing", exact: true });
    await repair.tap();
    await expect(repair).toHaveAttribute("aria-expanded", "true");
    await expect(
      mobile.getByRole("region", { name: "Repair Pricing" }),
    ).toContainText("Quote required");
    await mobile
      .locator(".customer-care")
      .screenshot({ path: "test-results/customer-care-mobile.png" });
    await repair.tap();
    await expect(repair).toHaveAttribute("aria-expanded", "false");
  } finally {
    await context.close();
  }
});
