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
}, testInfo) => {
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
    await expect(guide.getByRole("heading", { name: "วิธีต่อใช้งาน", exact: true })).toBeVisible();
    expect(await guide.locator(".wire-list .wire-row").count()).toBeGreaterThanOrEqual(2);
    await expect(guide.locator(".breadboard-picture")).toBeVisible();
    await expect(guide.getByRole("button", { name: "ภาพ breadboard", exact: true })).toHaveAttribute("aria-pressed", "true");
    await expect(guide.locator(".circuit-picture")).toHaveCount(0);
    if (["ceramic-capacitor", "film-capacitor", "potentiometer", "buzzer"].includes(id)) {
      await guide.locator(".breadboard-picture").screenshot({ path: testInfo.outputPath(id + "-breadboard.png") });
    }
    await expect(guide.locator(".wire-list .wire-terminal").first()).toContainText("ต่อจาก");
    await expect(guide.locator(".wiring-outcome")).not.toBeEmpty();
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
    "seven-segment",
    "film-capacitor",
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

test("connection choices show only the selected receiver or display type", async ({ page }, testInfo) => {
  await page.goto("/components?component=ir-led-photo-transistor");
  let guide = page.locator(".connection-guide");
  await expect(guide.getByRole("button", { name: "ตัวรับแสง", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(guide.locator(".breadboard-picture")).toBeVisible();
  await expect(guide.locator(".breadboard-drawn-wire")).toHaveCount(4);
  await expect(guide.locator(".wire-row")).toHaveCount(4);
  await guide.getByRole("button", { name: "ตัวส่ง IR LED", exact: true }).click();
  await expect(guide.locator(".wire-row")).toHaveCount(3);
  await expect(guide.locator(".breadboard-drawn-wire")).toHaveCount(3);
  await expect(guide.locator(".wiring-outcome")).toContainText("ส่งแสงอินฟราเรด");
  await page.goto("/components?component=seven-segment");
  guide = page.locator(".connection-guide");
  await expect(guide.locator(".breadboard-picture")).toBeVisible();
  await expect(guide.locator(".breadboard-picture")).toContainText("ขาร่วมลบ (CC)");
  await guide.getByRole("button", { name: "ขาร่วมบวก (CA)", exact: true }).click();
  await expect(guide.locator(".breadboard-picture")).toContainText("ขาร่วมบวก (CA)");
  await expect(guide.locator(".breadboard-drawn-wire")).toHaveCount(3);
  await expect(guide.locator(".wiring-outcome")).toContainText("LOW");
  await expect(guide.locator(".wire-row").first()).toContainText("COM");
  await guide.screenshot({ path: testInfo.outputPath("seven-segment-wiring.png") });
  await page.goto("/components?component=transistor");
  guide = page.locator(".connection-guide");
  await expect(guide.locator(".wire-row")).toHaveCount(9);
  await expect(guide.locator(".breadboard-preview svg")).toBeVisible();
  await guide.locator(".breadboard-picture").screenshot({ path: testInfo.outputPath("transistor-breadboard.png") });
  await guide.getByRole("button", { name: "ดูทุกสาย", exact: true }).click();
  await guide.locator(".breadboard-picture").screenshot({ path: testInfo.outputPath("transistor-breadboard-all.png") });
  await guide.getByRole("button", { name: "ดูสายที่ 3", exact: true }).click();
  await guide.locator(".breadboard-picture").screenshot({ path: testInfo.outputPath("transistor-breadboard-step.png") });
});

test("component details use sectioned dialogs with direct links, nested diagrams and focus restoration", async ({ page }, testInfo) => {
  await page.goto("/components");
  const card = page.getByRole("button", { name: "ดูรายละเอียด Resistor ตัวต้านทาน", exact: true });
  await card.click();
  const dialog = page.getByRole("dialog", { name: "Resistor", exact: true });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator(".detail-summary-cards > section")).toHaveCount(4);
  for (const name of ["วิธีสังเกต", "ขั้วและจุดต่อ GND", "วิธีต่อวงจร", "ตัวอย่างการใช้งาน"]) {
    await expect(dialog.locator(".detail-summary-cards").getByRole("heading", { name, exact: true })).toBeVisible();
  }
  await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
  await expect(dialog.getByRole("button", { name: "ปิดรายละเอียดชิ้นส่วน" })).toBeFocused();
  await page.screenshot({ path: testInfo.outputPath("component-details-overview.png") });
  await dialog.getByRole("link", { name: "คำนวณค่าตัวต้านทาน", exact: true }).click();
  await expect(dialog.locator("#library-resistor-calculator")).toBeInViewport();
  await expect(dialog.locator(".resistor-reader").getByRole("status")).toContainText("4.7 kΩ");
  await dialog.getByRole("link", { name: "วิธีต่อวงจร", exact: true }).click();
  await dialog.getByRole("button", { name: "ขยายภาพ", exact: true }).click();
  const zoom = page.getByRole("dialog", { name: "ภาพตัวอย่างการต่อบน breadboard", exact: true });
  await expect(zoom).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(zoom).not.toBeVisible();
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(page).not.toHaveURL(/component=/);
  await expect(card).toBeFocused();
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  await page.goto("/components?component=led");
  await expect(page.getByRole("dialog", { name: "LED", exact: true })).toBeVisible();
  await expect(page.locator(".detail-thai-name")).toHaveText("ไดโอดเปล่งแสง");
  await expect(page.locator(".detail-dialog-body")).toHaveJSProperty("scrollLeft", 0);
  const size = await page.locator(".detail-dialog-body").evaluate((element) => ({
    content: element.scrollWidth, width: element.clientWidth,
  }));
  expect(size.content).toBeLessThanOrEqual(size.width);
  await page.getByRole("button", { name: "ปิดรายละเอียดชิ้นส่วน" }).click();
  await expect(page.locator("#component-details")).toHaveCount(0);
});

test("connection pictures highlight one wire at a time and reset when the device type changes", async ({ page }, testInfo) => {
  await page.goto("/components?component=resistor");
  const guide = page.locator(".connection-guide");
  await expect(guide.locator(".breadboard-preview svg")).toBeVisible();
  await expect(guide.locator(".selected-wire-step")).toContainText("สายที่ 1 / 3");
  await expect(guide.locator('.breadboard-drawn-wire[opacity="1"]')).toHaveCount(1);
  await expect(guide.locator(".breadboard-endpoint")).toHaveCount(2);
  await expect(guide.getByRole("button", { name: "สายก่อนหน้า", exact: true })).toBeDisabled();
  await guide.getByRole("button", { name: "ดูสายที่ 1", exact: true }).click();
  await expect(guide.locator(".breadboard-picture")).toBeVisible();
  await expect(guide.getByRole("button", { name: "ภาพ breadboard", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(guide.locator(".selected-wire-step .wire-hole")).toHaveCount(2);
  await expect(guide.locator(".selected-wire-step")).toContainText("สายที่ 1 / 3");
  await expect(guide.locator('.breadboard-drawn-wire[data-wire-index="0"]')).toHaveAttribute("opacity", "1");
  await expect(guide.locator('.breadboard-drawn-wire[data-wire-index="1"]')).toHaveAttribute("opacity", "0");
  await guide.getByRole("button", { name: "สายถัดไป", exact: true }).click();
  await expect(guide.locator(".selected-wire-step")).toContainText("สายที่ 2 / 3");
  await expect(guide.locator('.breadboard-drawn-wire[data-wire-index="1"]')).toHaveAttribute("opacity", "1");
  await guide.getByRole("button", { name: "ดูทุกสาย", exact: true }).click();
  await expect(guide.locator(".selected-wire-step")).toHaveCount(0);
  await expect(guide.locator('.breadboard-drawn-wire[opacity="1"]')).toHaveCount(3);
  await expect(guide.locator(".breadboard-endpoint")).toHaveCount(0);
  await expect(guide.locator(".connection-wire-details")).not.toHaveAttribute("open", "");
  await page.goto("/components?component=ir-led-photo-transistor");
  await expect(guide.locator(".breadboard-picture")).toBeVisible();
  await guide.getByRole("button", { name: "ดูสายที่ 3", exact: true }).click();
  await expect(guide.locator(".selected-wire-step")).toContainText("สายที่ 3 / 4");
  await guide.getByRole("button", { name: "ตัวส่ง IR LED", exact: true }).click();
  await expect(guide.locator(".selected-wire-step")).toContainText("สายที่ 1 / 3");
  await expect(guide.locator('.breadboard-drawn-wire[opacity="1"]')).toHaveCount(1);
  await expect(guide.locator(".breadboard-drawn-wire")).toHaveCount(3);
  await guide.screenshot({ path: testInfo.outputPath("visual-connection-guide.png") });
  await guide.getByRole("button", { name: "ขยายภาพ", exact: true }).click();
  const zoom = page.getByRole("dialog", { name: "ภาพตัวอย่างการต่อบน breadboard", exact: true });
  await expect(zoom.locator(".breadboard-picture")).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("visual-connection-expanded.png") });
  await zoom.getByRole("button", { name: "ปิดภาพขยาย" }).click();
  await guide.getByRole("button", { name: "ภาพจุดต่อสาย", exact: true }).click();
  await expect(guide.locator(".circuit-picture")).toBeVisible();
  await guide.getByRole("button", { name: "ดูสายที่ 2", exact: true }).click();
  await expect(guide.locator('.circuit-drawn-wire[data-wire-index="1"]')).toHaveAttribute("opacity", "1");
  await guide.getByRole("button", { name: "ภาพ breadboard", exact: true }).click();
  await expect(guide.locator('.breadboard-drawn-wire[data-wire-index="1"]')).toHaveAttribute("opacity", "1");
});

test("expanded wiring fits the screen and supports changing steps, zoom and returning to the guide", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: testInfo.project.name === "mobile" ? 320 : 1440, height: 900 });
  await page.goto("/components?component=transistor");
  const guide = page.locator(".connection-guide");
  await guide.getByRole("button", { name: "ดูสายที่ 3", exact: true }).click();
  const preview = guide.locator(".breadboard-preview .breadboard-picture");
  await expect(preview).toHaveAttribute("data-focused", "true");
  const size = await preview.evaluate(svg => ({ font: svg.getScreenCTM().a * 18, height: svg.getBoundingClientRect().height }));
  expect(size.font).toBeGreaterThan(11);
  expect(size.height).toBeLessThanOrEqual(460);
  await guide.getByRole("button", { name: "ขยายภาพ", exact: true }).click();
  const zoom = page.locator(".breadboard-dialog[open]");
  const fits = () => zoom.locator(".breadboard-zoom").evaluate(region => region.scrollWidth <= region.clientWidth + 1);
  expect(await fits()).toBe(true);
  for (const endpoint of await zoom.locator(".breadboard-endpoint").all()) {
    const box = await endpoint.boundingBox(), region = await zoom.locator(".breadboard-zoom").boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(region.x);
    expect(box.x + box.width).toBeLessThanOrEqual(region.x + region.width + 1);
  }
  await zoom.getByRole("button", { name: "สายถัดไป", exact: true }).click();
  await expect(zoom.getByRole("status")).toContainText("สายที่ 4 / 9");
  await expect(zoom.locator('.breadboard-drawn-wire[opacity="1"]')).toHaveCount(1);
  await zoom.getByRole("button", { name: "ขยายอีก", exact: true }).click();
  await expect(zoom.locator(".breadboard-tools")).toContainText("150%");
  expect(await fits()).toBe(false);
  await zoom.getByRole("button", { name: "พอดีหน้าจอ", exact: true }).click();
  expect(await fits()).toBe(true);
  await zoom.getByRole("button", { name: "แสดงทั้งบอร์ด", exact: true }).click();
  await expect(zoom.locator(".breadboard-picture")).toHaveAttribute("data-focused", "false");
  await zoom.getByRole("button", { name: "ขยายเฉพาะสายนี้", exact: true }).click();
  await expect(zoom.locator(".breadboard-picture")).toHaveAttribute("data-focused", "true");
  await zoom.getByRole("button", { name: "ดูทุกสาย", exact: true }).click();
  await expect(zoom.getByRole("status")).toContainText("ภาพรวมทุกสาย");
  await expect(zoom.locator('.breadboard-drawn-wire[opacity="1"]')).toHaveCount(9);
  await zoom.getByRole("button", { name: "เริ่มสายแรก", exact: true }).click();
  await expect(zoom.getByRole("status")).toContainText("สายที่ 1 / 9");
  await page.screenshot({ path: testInfo.outputPath("readable-expanded-wiring.png") });
  await page.keyboard.press("Escape");
  await expect(page.locator("#component-details")).toBeVisible();
  await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
  await page.keyboard.press("Escape");
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  await page.goto("/");
  await page.getByRole("button", { name: /Demo/ }).click();
  await page.locator(".connection-guide").getByRole("button", { name: "ขยายภาพ", exact: true }).click();
  await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
  await page.keyboard.press("Escape");
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
});
