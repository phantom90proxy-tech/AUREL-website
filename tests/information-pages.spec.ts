import { test, expect } from "@playwright/test";
import { createContactDraft } from "../src/lib/contact";

test("About and Contact pages, navigation and responsive forms", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  for (const width of [320, 375, 412, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const path of ["/about/", "/contact/"]) {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.locator("h1")).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        path + " at " + width,
      ).toBe(true);
    }
    if (width > 1000) {
      const nav = page.locator(".desktop-nav");
      await expect(
        nav.getByRole("link", { name: "About Us", exact: true }),
      ).toBeVisible();
      await expect(
        nav.getByRole("link", { name: "Contact", exact: true }),
      ).toHaveAttribute("aria-current", "page");
      const boxes = await nav
        .locator("a")
        .evaluateAll((links) =>
          links.map((link) => link.getBoundingClientRect().toJSON()),
        );
      for (let i = 1; i < boxes.length; i++)
        expect(boxes[i].left).toBeGreaterThanOrEqual(boxes[i - 1].right);
    } else {
      await page.getByRole("button", { name: "Open navigation" }).click();
      await page
        .locator("#mobile-menu")
        .getByRole("link", { name: "About Us", exact: true })
        .click();
      await expect(page).toHaveURL(/\/about\/?$/);
    }
  }
  await page.goto("/contact/");
  await expect(page.locator("form")).toHaveAttribute(
    "action",
    "mailto:hello@aurelwatches.com",
  );
  await expect(
    page.getByRole("link", { name: "hello@aurelwatches.com", exact: true }),
  ).toHaveAttribute("href", "mailto:hello@aurelwatches.com");
  await page.getByRole("button", { name: "Open email draft" }).click();
  expect(
    await page
      .locator("form")
      .evaluate((form) => (form as HTMLFormElement).checkValidity()),
  ).toBe(false);
  await page.getByLabel("Your name", { exact: true }).fill("AUREL visitor");
  await page
    .getByLabel("Email address", { exact: true })
    .fill("visitor@example.com");
  await page
    .getByLabel("What can we help with?")
    .selectOption("Product details");
  await page
    .getByLabel("Your message", { exact: true })
    .fill("I would like to know more about the Aster watch.");
  expect(
    await page
      .locator("form")
      .evaluate((form) => (form as HTMLFormElement).checkValidity()),
  ).toBe(true);
  // Keep email composition local: verify the handler builds a mailto draft,
  // without launching an external app or sending an email during the test.
  const values = await page.locator("form").evaluate((form) => {
    const data = new FormData(form as HTMLFormElement);
    return {
      name: String(data.get("name")),
      email: String(data.get("email")),
      topic: String(data.get("topic")),
      message: String(data.get("message")),
    };
  });
  const draft = new URL(createContactDraft(values));
  expect(draft.protocol).toBe("mailto:");
  expect(draft.pathname).toBe("hello@aurelwatches.com");
  expect(draft.searchParams.get("subject")).toBe(
    "AUREL enquiry: Product details",
  );
  expect(draft.searchParams.get("body")).toContain(
    "Reply email: visitor@example.com",
  );
  expect(draft.searchParams.get("body")).toContain(values.message);
  await expect(
    page.getByText("This opens your email app with a draft.", { exact: false }),
  ).toBeVisible();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/about/");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.screenshot({
    path: "test-results/about-desktop.png",
    fullPage: true,
  });
  await page.goto("/contact/");
  await page.screenshot({
    path: "test-results/contact-desktop.png",
    fullPage: true,
    caret: "initial",
  });
  expect(errors).toEqual([]);
});
