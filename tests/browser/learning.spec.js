import { test, expect } from "@playwright/test";

test("resistor reader decodes 4/5 bands, tolerance ranges and fractional multipliers", async ({
  page,
}, testInfo) => {
  await page.goto("/components?component=resistor");
  const reader = page.locator(".resistor-reader");
  await reader.scrollIntoViewIfNeeded();
  await expect(reader.getByRole("status")).toContainText("4.7 kΩ");
  await expect(reader.getByRole("status")).toContainText("±5%");
  await expect(reader.getByRole("status")).toContainText("4.465 kΩ – 4.935 kΩ");
  await reader.getByRole("button", { name: "5 แถบ", exact: true }).click();
  await reader.locator("#band-first").selectOption("brown");
  await reader.locator("#band-second").selectOption("black");
  await reader.locator("#band-third").selectOption("black");
  await reader.locator("#band-multiplier").selectOption("red");
  await reader.locator("#band-tolerance").selectOption("brown");
  await expect(reader.getByRole("status")).toContainText("10 kΩ");
  await expect(reader.getByRole("status")).toContainText("±1%");
  await reader.getByRole("button", { name: "4 แถบ", exact: true }).click();
  await reader.locator("#band-first").selectOption("red");
  await reader.locator("#band-second").selectOption("black");
  await reader.locator("#band-multiplier").selectOption("silver");
  await reader.locator("#band-tolerance").selectOption("gold");
  await expect(reader.getByRole("status")).toContainText("0.2 Ω");
  await expect(reader.getByRole("status")).toContainText("0.19 Ω – 0.21 Ω");
  await reader.getByText("ดูตารางสีและค่าที่ใช้").click();
  await expect(reader.locator("tbody tr")).toHaveCount(12);
  await page.screenshot({
    path: testInfo.outputPath("resistor-guide.png"),
    fullPage: true,
  });
});

test("every component has a local photo, practical guide and attribution; equipment photos load", async ({
  page,
}) => {
  await page.goto("/components");
  await expect(page.locator(".component-grid img")).toHaveCount(14);
  for (const image of await page.locator(".component-grid img").all()) {
    await image.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        image.evaluate(
          (element) => element.complete && element.naturalWidth > 0,
        ),
      )
      .toBe(true);
    expect(await image.getAttribute("src")).toMatch(/^\/images\/components\//);
  }
  const ids = [
    "resistor",
    "ceramic-capacitor",
    "film-capacitor",
    "electrolytic-capacitor",
    "diode",
    "transistor",
    "led",
    "ir-led-photo-transistor",
    "switch",
    "photoresistor",
    "seven-segment",
    "potentiometer",
    "buzzer",
    "thermistor",
  ];
  for (const id of ids) {
    await page.goto(`/components?component=${id}`);
    const guide = page.locator(".practical-guide");
    await guide.scrollIntoViewIfNeeded();
    await expect(
      guide.getByRole("heading", {
        name: "อ่านค่าและดูขาอุปกรณ์",
        exact: true,
      }),
    ).toBeVisible();
    await expect(guide.locator(".polarity-summary")).not.toBeEmpty();
    await expect(
      page.locator(".detail-overview .image-credit").first(),
    ).toContainText("ต้นฉบับ");
    await expect(guide.locator(".practical-sources a").first()).toHaveAttribute(
      "href",
      /^https:/,
    );
  }
  await page.goto("/components?component=ir-led-photo-transistor");
  await expect(page.locator(".extra-component-image img")).toHaveAttribute(
    "alt",
    /IR LED/,
  );
  await page.goto("/equipment");
  await expect(page.locator(".equipment-grid img")).toHaveCount(4);
  for (const image of await page.locator(".equipment-grid img").all()) {
    await image.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        image.evaluate(
          (element) => element.complete && element.naturalWidth > 0,
        ),
      )
      .toBe(true);
    expect(await image.getAttribute("src")).toMatch(/^\/images\/equipment\//);
  }
  await page.goto("/images/credits.html");
  await expect(page.locator("article")).toHaveCount(19);
  await expect(
    page.getByRole("heading", { name: "เครดิตภาพอุปกรณ์", exact: true }),
  ).toBeVisible();
});

test("practical guide and resistor controls fit a 320px screen", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 900 });
  for (const id of [
    "resistor",
    "electrolytic-capacitor",
    "transistor",
    "ir-led-photo-transistor",
  ]) {
    await page.goto(`/components?component=${id}`);
    await page.locator(".practical-guide").scrollIntoViewIfNeeded();
    const width = await page.evaluate(() => ({
      document: document.documentElement.scrollWidth,
      viewport: window.innerWidth,
    }));
    expect(width.document).toBeLessThanOrEqual(width.viewport);
  }
});
