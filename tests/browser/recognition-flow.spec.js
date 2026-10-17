import { test, expect } from "@playwright/test";
import { expectedLabels } from "../../src/data/components.js";

const port = Number(process.env.CIRCUIT_TEST_PORT ?? 5173);
const fixture = {
  name: "confidence-fixture.png",
  mimeType: "image/png",
  buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jE1sAAAAASUVORK5CYII=", "base64"),
};

async function mockModel(page, probability = 0.94, holdDownload = false) {
  await page.route("**/src/services/teachableMachine.js", async (route) => {
    const response = await route.fetch();
    const original = await response.text();
    const code = original.replace(
      "export async function loadModel(modelUrl, onProgress)",
      "async function originalLoadModel(modelUrl, onProgress)",
    );
    if (code === original) throw new Error("Model loader interception failed");
    const stub = "\nexport async function loadModel(url, onProgress) { const labels = " + JSON.stringify(expectedLabels) +
      "; window.fixtureProgress = onProgress; onProgress?.(0); " +
      (holdDownload ? "await new Promise(resolve => { window.releaseFixtureModel = resolve; }); " : "") +
      "onProgress?.(100); return { getClassLabels: () => labels, predict: async () => { await new Promise(resolve => setTimeout(resolve, 650)); const score = window.fixtureProbability ?? " +
      probability + "; const label = window.fixtureLabel ?? 'Resistor'; return labels.map(className => ({ className, probability: className === label ? score : (1 - score) / 13 })); } }; }\n";
    await route.fulfill({ response, body: code + stub });
  });
}

async function openReadyModel(page) {
  await page.goto("http://127.0.0.1:" + (port + 1) + "/");
  await expect(page.locator(".status-badge")).toHaveAttribute("title", "Model Ready");
}

async function upload(page, name = fixture.name) {
  await page.getByLabel("เลือกภาพชิ้นส่วนอิเล็กทรอนิกส์").setInputFiles({ ...fixture, name });
  await expect(page.getByAltText("ภาพที่เลือก: " + name)).toBeVisible();
}

const analyze = (page) => page.getByRole("button", { name: "วิเคราะห์ภาพ (Analyze Image)", exact: true }).click();

test("resistor Demo exposes a usable calculator inside the result before wiring", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(page.locator("#resistor-tools")).toHaveCount(0);
  await expect(page.locator('a[href="#resistor-tools"]')).toHaveCount(0);
  await upload(page, "uploaded-resistor.png");
  await expect(page.locator("#resistor-tools")).toHaveCount(0);
  await page.getByRole("button", { name: "ดูผลลัพธ์ตัวอย่าง (Demo)" }).click();
  await expect(page.locator(".result-source-demo")).toBeVisible();
  const reader = page.locator(".result-panel #resistor-tools");
  await expect(reader.getByRole("heading", { name: "คำนวณค่าตัวต้านทาน", exact: true })).toBeVisible();
  await expect(reader.getByRole("status")).toContainText("4.7 kΩ");
  await reader.locator("#band-first").selectOption("brown");
  await reader.locator("#band-second").selectOption("black");
  await reader.locator("#band-multiplier").selectOption("brown");
  await expect(reader.getByRole("status")).toContainText("100 Ω");
  await reader.scrollIntoViewIfNeeded();
  await reader.screenshot({ path: testInfo.outputPath("resistor-calculator-demo.png") });
  const calculatorBox = await reader.boundingBox();
  const wiringBox = await page.locator(".result-panel .connection-guide").boundingBox();
  expect(calculatorBox.y + calculatorBox.height).toBeLessThan(wiringBox.y);
  expect(await page.locator(".resistor-reader").count()).toBe(1);
  const dimensions = await page.evaluate(() => ({ page: document.documentElement.scrollWidth, viewport: innerWidth }));
  expect(dimensions.page).toBeLessThanOrEqual(dimensions.viewport);
  await upload(page, "replacement.png");
  await expect(page.locator("#resistor-tools")).toHaveCount(0);
});

test("real resistor result controls the reader through replacement, other classes and errors", async ({ page }, testInfo) => {
  await mockModel(page);
  await openReadyModel(page);
  await upload(page, "resistor.png");
  await analyze(page);
  const reader = page.locator("#resistor-tools");
  await expect(reader).toBeVisible();
  await expect(reader.getByRole("status")).toContainText("4.7 kΩ");
  await reader.getByRole("button", { name: "5 แถบ", exact: true }).click();
  await expect(reader.locator("#band-third")).toBeVisible();

  const guide = page.locator(".result-panel .connection-guide");
  await expect(guide.locator(".breadboard-preview")).toBeVisible();
  await guide.getByRole("button", { name: "ขยายภาพ", exact: true }).click();
  const zoom = page.getByRole("dialog", { name: "ภาพตัวอย่างการต่อบน breadboard" });
  await expect(zoom).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("breadboard-expanded.png") });
  await zoom.getByRole("button", { name: "ปิดภาพขยาย" }).click();
  await expect(zoom).not.toBeVisible();
  await guide.getByText("ถ้าต่อแล้วไม่ทำงาน ให้ตรวจอะไร?", { exact: true }).click();
  await expect(guide.locator(".wiring-checks li").first()).toBeVisible();

  await upload(page, "led.png");
  await expect(reader).toHaveCount(0);
  await page.evaluate(() => { window.fixtureLabel = "LED"; });
  await analyze(page);
  await expect(page.locator(".prediction-top h3")).toHaveText("ไดโอดเปล่งแสง");
  await expect(reader).toHaveCount(0);

  await upload(page, "unclear-resistor.png");
  await page.evaluate(() => { window.fixtureLabel = "Resistor"; window.fixtureProbability = 0.7; });
  await analyze(page);
  await expect(page.locator(".prediction-error")).toBeVisible();
  await expect(reader).toHaveCount(0);

  await upload(page, "resistor-again.png");
  await page.evaluate(() => { window.fixtureProbability = 0.94; });
  await analyze(page);
  await expect(reader).toBeVisible();
  await expect(reader.getByRole("button", { name: "4 แถบ", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "ดูผลลัพธ์ตัวอย่าง (Demo)" }).click();
  await expect(reader).toBeVisible();
  await expect(page.locator(".result-panel #resistor-tools")).toHaveCount(1);
});

test("download progress follows model events and disappears when ready", async ({ page }) => {
  await mockModel(page, 0.94, true);
  await page.goto("http://127.0.0.1:" + (port + 1) + "/");
  const progress = page.getByRole("progressbar", { name: "ความคืบหน้าการโหลดโมเดล" });
  await expect(progress).toHaveAttribute("aria-valuenow", "0");
  await page.evaluate(() => window.fixtureProgress(42));
  await expect(progress).toHaveAttribute("aria-valuenow", "42");
  await expect(page.locator(".model-download")).toContainText("42%");
  await page.evaluate(() => window.releaseFixtureModel());
  await expect(page.locator(".status-badge")).toHaveAttribute("title", "Model Ready");
  await expect(progress).toHaveCount(0);
});

for (const probability of [0.69, 0.7, 0.70001, 0.94]) {
  test("AI flow shows loading and enforces confidence at " + probability, async ({ page }, testInfo) => {
    await mockModel(page, probability);
    await openReadyModel(page);
    await upload(page);
    await expect(page.locator("#resistor-tools")).toHaveCount(0);
    await analyze(page);
    const dialog = page.getByRole("dialog", { name: "กำลังวิเคราะห์ภาพ" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("status")).toHaveAttribute("aria-busy", "true");
    await expect(dialog.getByRole("progressbar", { name: "กำลังวิเคราะห์รูป" })).not.toHaveAttribute("aria-valuenow");
    await expect(page.locator(".analysis-actions .button-primary")).toBeDisabled();
    await expect(dialog.locator("img")).toHaveAttribute("src", /^blob:/);
    if (probability === 0.7) await page.screenshot({ path: testInfo.outputPath("analysis-loading.png") });
    await expect(dialog).toHaveCount(0);
    if (probability <= 0.7) {
      await expect(page.locator(".prediction-error")).toContainText("กรุณาเช็คแสงและความชัดเจนของรูปภาพ");
      await expect(page.locator(".prediction-top")).toHaveCount(0);
      await expect(page.locator(".result-source-real")).toHaveCount(0);
      await expect(page.locator("#resistor-tools")).toHaveCount(0);
    } else {
      await expect(page.locator(".result-source-real")).toBeVisible();
      await expect(page.locator(".confidence-row strong")).toHaveText(probability === 0.70001 ? ">70.0%" : "94.0%");
      await expect(page.locator(".prediction-top h3")).toHaveText("ตัวต้านทาน");
      await expect(page.locator("#resistor-tools")).toBeVisible();
      await expect(page.locator(".probabilities")).not.toHaveAttribute("open", "");
      await page.locator(".result-panel .connection-guide").screenshot({ path: testInfo.outputPath("simple-wiring.png") });
    }
    await expect(page.locator(".analysis-actions .button-primary")).toBeEnabled();
    await page.getByRole("button", { name: "ลบรูปภาพ" }).click();
    await expect(page.locator(".prediction-error, .prediction-top, #resistor-tools")).toHaveCount(0);
  });
}
