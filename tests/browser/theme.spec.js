import { test, expect } from "@playwright/test";

const toggle = (page) =>
  page.getByRole("button", { name: "สลับโหมดมืด", exact: true });

test("theme toggle persists through reload, navigation, credits and cross-tab changes", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(toggle(page)).toHaveAttribute("aria-pressed", "false");
  await toggle(page).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(toggle(page)).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute(
    "content",
    "#0b1220",
  );
  await page.getByRole("link", { name: "Components", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  const other = await context.newPage();
  await other.goto("/equipment");
  await expect(other.locator("html")).toHaveAttribute("data-theme", "dark");
  await toggle(other).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(toggle(page)).toHaveAttribute("aria-pressed", "false");
  await toggle(page).click();
  await other.goto("/images/credits.html");
  await expect(other.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(other.locator("body")).toHaveCSS(
    "background-color",
    "rgb(11, 18, 32)",
  );
  await toggle(page).click();
  await expect(other.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(other.locator("body")).toHaveCSS(
    "background-color",
    "rgb(248, 250, 252)",
  );
});

test("dark pages fit mobile widths and preserve photos and resistor color bands", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  await toggle(page).click();
  await expect(page.locator(".status-neutral")).toHaveCSS(
    "background-color",
    "rgb(22, 32, 51)",
  );
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      "/",
      "/components?component=resistor",
      "/equipment",
      "/not-found",
    ]) {
      await page.goto(route);
      await expect(page.locator("body")).toHaveCSS(
        "background-color",
        "rgb(11, 18, 32)",
      );
      const dimensions = await page.evaluate(() => ({
        document: document.documentElement.scrollWidth,
        viewport: window.innerWidth,
      }));
      expect(dimensions.document, `${route} at ${width}px`).toBeLessThanOrEqual(
        dimensions.viewport,
      );
      if (route.includes("component=resistor")) {
        await expect(page.getByRole("dialog", { name: "Resistor", exact: true })).toBeVisible();
        await expect(page.getByRole("button", { name: "ปิดรายละเอียดชิ้นส่วน" })).toBeVisible();
      } else {
        await expect(toggle(page)).toBeVisible();
      }
    }
  }
  await page.goto("/components?component=resistor");
  await expect(
    page.locator(".resistor-illustration rect").nth(1),
  ).toHaveAttribute("fill", "#facc15");
  await expect(page.locator(".component-grid img").first()).toHaveCSS(
    "filter",
    "none",
  );
  await page.locator(".resistor-reader").scrollIntoViewIfNeeded();
  await page
    .locator(".resistor-reader")
    .screenshot({ path: testInfo.outputPath("dark-resistor-reader.png") });
  await page.goto("/");
  await page.getByRole("button", { name: "ดูผลลัพธ์ตัวอย่าง (Demo)" }).click();
  await expect(
    page.getByText("Demo / Sample Data", { exact: true }),
  ).toBeVisible();
  await expect(page.locator(".panel").first()).toHaveCSS(
    "background-color",
    "rgb(22, 32, 51)",
  );
  await expect(page.getByRole("button", { name: "เลือกรูปภาพ" })).toHaveCSS(
    "color",
    "rgb(255, 255, 255)",
  );
  await page.screenshot({
    path: testInfo.outputPath("dark-recognition.png"),
    fullPage: true,
  });
  await page.goto("/components");
  await page.screenshot({
    path: testInfo.outputPath("dark-components.png"),
    fullPage: true,
  });
  await page.goto("/equipment");
  await page.screenshot({
    path: testInfo.outputPath("dark-equipment.png"),
    fullPage: true,
  });
});

test("theme switch remains usable when browser storage is blocked", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new DOMException("Storage blocked", "SecurityError");
    };
    Storage.prototype.setItem = () => {
      throw new DOMException("Storage blocked", "SecurityError");
    };
  });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await toggle(page).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await toggle(page).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  expect(errors).toEqual([]);
});
