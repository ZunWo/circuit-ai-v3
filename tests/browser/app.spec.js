import { test, expect } from "@playwright/test";

const testPort = Number(process.env.CIRCUIT_TEST_PORT ?? 5173);

const imageFixture = {
  name: "test-component.png",
  mimeType: "image/png",
  buffer: Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jE1sAAAAASUVORK5CYII=",
    "base64",
  ),
};

test("routes, active navigation, library search, details and all equipment guides", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "รู้จักชิ้นส่วน",
  );
  await page.getByRole("link", { name: "Components", exact: true }).click();
  await expect(
    page.getByRole("link", { name: "Components", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await expect(page.locator(".component-grid .catalog-card")).toHaveCount(14);
  await page.getByRole("searchbox").fill("ตัวต้านทาน");
  await expect(page.locator(".component-grid .catalog-card")).toHaveCount(4);
  await page.getByRole("searchbox").fill("resistor");
  await expect(page.locator(".component-grid .catalog-card")).toHaveCount(2);
  await page
    .getByRole("button", {
      name: "ดูรายละเอียด Resistor ตัวต้านทาน",
      exact: true,
    })
    .click();
  await expect(page.locator("#component-detail-title")).toHaveText("Resistor");
  await expect(page).toHaveURL(/component=resistor/);
  await page.getByRole("searchbox").fill("no-such-component");
  await expect(page.getByText("ไม่พบชิ้นส่วนที่ค้นหา")).toBeVisible();
  await page.getByRole("button", { name: "แสดงชิ้นส่วนทั้งหมด" }).click();
  await expect(page.locator(".component-grid .catalog-card")).toHaveCount(14);
  await page
    .getByRole("link", { name: "Equipment Guide", exact: true })
    .click();
  await expect(page.locator(".equipment-grid .catalog-card")).toHaveCount(4);
  for (const name of [
    "Multimeter",
    "Power Supply",
    "Oscilloscope",
    "Function Generator",
  ]) {
    await page
      .getByRole("button", { name: `อ่านคู่มือ ${name}`, exact: true })
      .click();
    await expect(page.locator("#equipment-detail-title")).toHaveText(name);
    expect(
      await page.locator(".instruction-list li").count(),
    ).toBeGreaterThanOrEqual(5);
    await expect(
      page.getByRole("heading", { name: "ข้อควรระวัง" }),
    ).toBeVisible();
  }
  await page.goto("/invalid-route");
  await expect(
    page.getByRole("heading", { name: "ไม่พบหน้าที่คุณต้องการ" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "กลับหน้า AI Recognition" }).click();
  await expect(page).toHaveURL(`http://127.0.0.1:${testPort}/`);
  expect(errors).toEqual([]);
});

test("missing model, truthful demo, upload, replacement, removal and URL cleanup", async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.releasedObjectUrls = [];
    const revoke = URL.revokeObjectURL.bind(URL);
    URL.revokeObjectURL = (url) => {
      window.releasedObjectUrls.push(url);
      revoke(url);
    };
  });
  const uploads = [];
  page.on("request", (request) => {
    if (request.method() === "POST") uploads.push(request.url());
  });
  await page.goto("/");
  await expect(
    page.getByText("ยังไม่ได้กำหนดโมเดล", { exact: true }),
  ).toBeVisible();
  const analyze = page.getByRole("button", {
    name: "วิเคราะห์ภาพ (Analyze Image)",
    exact: true,
  });
  await expect(analyze).toBeDisabled();
  await page.getByRole("button", { name: "ดูผลลัพธ์ตัวอย่าง (Demo)" }).click();
  await expect(
    page.getByText("Demo / Sample Data", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("94.0%", { exact: true })).toHaveCount(2);
  await expect(page.locator(".probabilities li")).toHaveCount(14);
  const input = page.getByLabel("เลือกภาพชิ้นส่วนอิเล็กทรอนิกส์");
  await input.setInputFiles(imageFixture);
  await expect(
    page.getByAltText("ภาพที่เลือก: test-component.png"),
  ).toBeVisible();
  await expect(
    page.getByText("Demo / Sample Data", { exact: true }),
  ).toHaveCount(0);
  await expect(analyze).toBeDisabled();
  await input.setInputFiles({ ...imageFixture, name: "replacement.png" });
  await expect(page.getByAltText("ภาพที่เลือก: replacement.png")).toBeVisible();
  expect(
    await page.evaluate(() => window.releasedObjectUrls.length),
  ).toBeGreaterThanOrEqual(1);
  await page.getByRole("button", { name: "ลบรูปภาพ" }).click();
  await expect(page.locator(".image-preview")).toHaveCount(0);
  expect(
    await page.evaluate(() => window.releasedObjectUrls.length),
  ).toBeGreaterThanOrEqual(2);
  expect(uploads).toEqual([]);
});

test("unsupported, oversized, empty and corrupt images report validation errors", async ({
  page,
}) => {
  await page.goto("/");
  const input = page.getByLabel("เลือกภาพชิ้นส่วนอิเล็กทรอนิกส์");
  await input.setInputFiles({
    name: "invalid.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("not an image"),
  });
  await expect(page.getByRole("alert")).toContainText("รองรับเฉพาะ");
  await input.setInputFiles({
    name: "large.png",
    mimeType: "image/png",
    buffer: Buffer.alloc(10 * 1024 * 1024 + 1),
  });
  await expect(page.getByRole("alert")).toContainText("เกิน 10 MB");
  await input.setInputFiles({
    name: "empty.png",
    mimeType: "image/png",
    buffer: Buffer.alloc(0),
  });
  await expect(page.getByRole("alert")).toContainText("ไฟล์ภาพว่าง");
  await input.setInputFiles({
    name: "corrupt.png",
    mimeType: "image/png",
    buffer: Buffer.from("invalid binary"),
  });
  await expect(page.getByRole("alert")).toContainText("ไม่สามารถอ่านภาพ");
  await expect(page.locator(".image-preview")).toHaveCount(0);
});

test("drag and drop accepts one decoded image and rejects multiple files", async ({
  page,
}) => {
  await page.goto("/");
  const dataTransfer = await page.evaluateHandle((base64) => {
    const data = Uint8Array.from(atob(base64), (character) =>
      character.charCodeAt(0),
    );
    const transfer = new DataTransfer();
    transfer.items.add(new File([data], "dropped.png", { type: "image/png" }));
    return transfer;
  }, imageFixture.buffer.toString("base64"));
  await page
    .locator(".upload-zone")
    .dispatchEvent("dragenter", { dataTransfer });
  await expect(page.locator(".upload-zone")).toHaveClass(
    /upload-zone-dragging/,
  );
  await page.locator(".upload-zone").dispatchEvent("drop", { dataTransfer });
  await expect(page.getByAltText("ภาพที่เลือก: dropped.png")).toBeVisible();
  const multiple = await page.evaluateHandle(() => {
    const transfer = new DataTransfer();
    transfer.items.add(new File(["a"], "a.png", { type: "image/png" }));
    transfer.items.add(new File(["b"], "b.png", { type: "image/png" }));
    return transfer;
  });
  await page
    .locator(".upload-zone")
    .dispatchEvent("drop", { dataTransfer: multiple });
  await expect(page.getByRole("alert")).toContainText("ครั้งละหนึ่งไฟล์");
  await expect(page.getByAltText("ภาพที่เลือก: dropped.png")).toBeVisible();
});

test("all pages fit narrow and wide viewports without horizontal overflow", async ({
  page,
}) => {
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ["/", "/components", "/equipment"]) {
      await page.goto(route);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      const dimensions = await page.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        viewport: window.innerWidth,
      }));
      expect(dimensions.scroll, `${route} at ${width}px`).toBeLessThanOrEqual(
        dimensions.viewport,
      );
    }
  }
});

test("configured missing model reports loading, error and retry; never claims Ready", async ({
  page,
}) => {
  const pageErrors = [];
  let modelRequests = 0;
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.route("**/models/test-missing/**", async (route) => {
    if (route.request().url().endsWith("/model.json")) modelRequests++;
    await new Promise((resolve) => setTimeout(resolve, 250)); // Network fixture only, never production delay.
    await route.fulfill({
      status: 404,
      contentType: "application/json",
      body: "{}",
    });
  });
  await page.goto(`http://127.0.0.1:${testPort + 1}/`);
  await expect(page.getByText("กำลังโหลดโมเดล", { exact: true })).toBeVisible();
  await expect(
    page.getByText("โหลดโมเดลไม่สำเร็จ", { exact: true }),
  ).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText("โมเดลพร้อมใช้งาน", { exact: true })).toHaveCount(
    0,
  );
  expect(modelRequests, "Strict Mode must reuse a single model load").toBe(1);
  await expect(
    page.getByRole("button", {
      name: "วิเคราะห์ภาพ (Analyze Image)",
      exact: true,
    }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "ลองโหลดใหม่" }).click();
  await expect(
    page.getByText("โหลดโมเดลไม่สำเร็จ", { exact: true }),
  ).toBeVisible();
  expect(modelRequests, "retry must start a fresh failed-model load").toBe(2);
  await page.getByRole("button", { name: "ดูผลลัพธ์ตัวอย่าง (Demo)" }).click();
  await expect(
    page.getByText("Demo / Sample Data", { exact: true }),
  ).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test("keyboard skip link and page screenshots", async ({ page }, testInfo) => {
  await page.goto("/");
  const skipLink = page.getByRole("link", { name: "ข้ามไปเนื้อหาหลัก" });
  expect(await skipLink.evaluate((element) => element.getBoundingClientRect().bottom)).toBeLessThanOrEqual(0);
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "ข้ามไปเนื้อหาหลัก" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
  expect(await skipLink.evaluate((element) => element.getBoundingClientRect().bottom)).toBeLessThanOrEqual(0);
  await page.getByRole("heading", { level: 1 }).click();
  await expect(skipLink).toHaveCSS("clip-path", "inset(50%)");
  await page.screenshot({
    path: testInfo.outputPath("recognition.png"),
    fullPage: true,
  });
  await page.getByRole("button", { name: "ดูผลลัพธ์ตัวอย่าง (Demo)" }).click();
  await page.screenshot({
    path: testInfo.outputPath("demo.png"),
    fullPage: true,
  });
  await page.goto("/components");
  await page.screenshot({
    path: testInfo.outputPath("components.png"),
    fullPage: true,
  });
  await page.goto("/equipment");
  await page.screenshot({
    path: testInfo.outputPath("equipment.png"),
    fullPage: true,
  });
});

test("prediction component renders loading, errors and low-confidence ranking with explicit test fixtures", async ({
  page,
}) => {
  await page.goto("/");
  // Component-only test fixtures: this does not inject fake inference into the application.
  await page.evaluate(async () => {
    const { mountPredictionHarness } = await import(
      "/tests/browser/predictionHarness.jsx"
    );
    const harness = mountPredictionHarness();
    window.renderPredictionFixture = harness.render;
    window.lowConfidenceFixture = harness.lowConfidenceFixture;
    window.renderPredictionFixture({
      status: "analyzing",
      result: null,
      error: "",
    });
  });
  const fixture = page.locator("#component-test-fixture");
  await expect(
    fixture.getByText("กำลังวิเคราะห์ภาพ", { exact: true }),
  ).toBeVisible();
  await page.evaluate(() =>
    window.renderPredictionFixture({
      status: "error",
      result: null,
      error: "Explicit test prediction error",
    }),
  );
  await expect(fixture.getByRole("alert")).toContainText(
    "Explicit test prediction error",
  );
  await page.evaluate(() =>
    window.renderPredictionFixture({
      status: "completed",
      result: window.lowConfidenceFixture,
      error: "",
    }),
  );
  await expect(
    fixture.getByText("Demo / Sample Data", { exact: true }),
  ).toBeVisible();
  await expect(fixture.getByRole("status")).toContainText("คะแนนต่ำกว่า 70%");
  await expect(fixture.locator(".probabilities li")).toHaveCount(14);
});
