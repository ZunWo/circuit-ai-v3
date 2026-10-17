import assert from "node:assert/strict";
import { createServer, loadEnv } from "vite";
import { chromium } from "@playwright/test";

const modelUrl = loadEnv("development", process.cwd()).VITE_TM_MODEL_URL;
assert.ok(
  modelUrl,
  "Set VITE_TM_MODEL_URL in .env.local before this smoke test",
);
const server = await createServer({
  server: { host: "127.0.0.1", port: 5180, strictPort: true },
});
let browser;
try {
  await server.listen();
  browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await browser.newPage();
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.setDefaultTimeout(120_000);
  await page.goto("http://127.0.0.1:5180/components");
  const probe = await page.evaluate(async (url) => {
    const { probeModel } = await import("/tests/browser/modelHarness.js");
    return await probeModel(url);
  }, modelUrl);
  assert.equal(probe.outputs, 14);
  assert.equal(probe.probabilities.length, 14);
  assert.ok(
    probe.probabilities.every(
      ({ probability }) =>
        Number.isFinite(probability) && probability >= 0 && probability <= 1,
    ),
  );
  assert.ok(Math.abs(probe.probabilitySum - 1) < 0.02);
  assert.deepEqual(pageErrors, []);
  console.log(JSON.stringify({ runtimeSmoke: "passed", ...probe }, null, 2));
  let applicationModelRequests = 0;
  let imagePostRequests = 0;
  page.on("request", (request) => {
    if (request.url() === `${modelUrl}model.json`) applicationModelRequests++;
    if (request.method() === "POST") imagePostRequests++;
  });
  await page.goto("http://127.0.0.1:5180/");
  await page.waitForFunction(
    () =>
      document.querySelector(".status-badge")?.getAttribute("title") !==
      "Loading Model",
    undefined,
    { timeout: 120_000 },
  );
  const status = await page.locator(".status-badge").innerText();
  const errors = await page.locator('[role="alert"]').allTextContents();
  assert.equal(status, "โมเดลพร้อมใช้งาน", errors.join(" "));
  assert.equal(
    applicationModelRequests,
    1,
    "Strict Mode must load this real model only once",
  );
  assert.match(
    await page.locator('[role="note"]').first().innerText(),
    /ยังไม่รองรับการจำแนก IR LED/,
  );
  const imageFixture = {
    name: "runtime-smoke.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jE1sAAAAASUVORK5CYII=",
      "base64",
    ),
  };
  const input = page.getByLabel("เลือกภาพชิ้นส่วนอิเล็กทรอนิกส์");
  const analyze = page.getByRole("button", {
    name: "วิเคราะห์ภาพ (Analyze Image)",
    exact: true,
  });
  // A synthetic image may be rejected by the confidence gate; test that outcome too.
  for (const name of ["runtime-smoke.png", "repeat-smoke.png"]) {
    await input.setInputFiles({ ...imageFixture, name });
    await page.getByAltText(`ภาพที่เลือก: ${name}`).waitFor();
    assert.equal(
      await page.locator(".result-source-real").count(),
      0,
      "Replacing the image must clear old results",
    );
    assert.equal(await analyze.isEnabled(), true);
    await analyze.click();
    await page.waitForFunction(
      () => !document.querySelector(".analysis-loading[open]") &&
        (document.querySelector(".result-source-real") || document.querySelector(".prediction-error")),
      undefined,
      { timeout: 120_000 },
    );
    const realResult = await page.locator(".result-source-real").count();
    if (realResult) {
      assert.equal(await page.locator(".probabilities li").count(), 14);
    } else {
      assert.match(await page.locator(".prediction-error").innerText(), /กรุณาเช็คแสงและความชัดเจนของรูปภาพ/);
      assert.equal(await page.locator(".prediction-top").count(), 0);
    }
    assert.equal(await page.locator(".result-source-demo").count(), 0);
  }
  const actualResult = await page.evaluate(async (url) => {
    const { loadModel, predictImage } = await import(
      "/src/services/teachableMachine.js"
    );
    try {
      return await predictImage(
        await loadModel(url),
        document.querySelector(".image-preview"),
      );
    } catch (error) {
      return { error: error.message };
    }
  }, modelUrl);
  if (actualResult.error) {
    assert.match(actualResult.error, /กรุณาเช็คแสงและความชัดเจนของรูปภาพ/);
    assert.equal(await page.locator(".result-source-real").count(), 0);
  } else {
    assert.equal(actualResult.source, "real");
    assert.ok(actualResult.top.probability > 0.7);
    assert.equal(
      await page.locator(".confidence-row strong").innerText(),
      `${actualResult.top.percentage.toFixed(1)}%`,
    );
    assert.equal(
      await page.locator(".prediction-top h3").innerText(),
      actualResult.top.component.thaiName,
    );
  }
  assert.equal(
    imagePostRequests,
    0,
    "The uploaded image must remain in the browser",
  );
  await page.getByRole("link", { name: "Components", exact: true }).click();
  await page.getByRole("link", { name: "AI Recognition", exact: true }).click();
  await page.waitForFunction(
    () =>
      document.querySelector(".status-badge")?.getAttribute("title") ===
      "Model Ready",
  );
  assert.equal(
    applicationModelRequests,
    1,
    "Navigation must reuse the loaded model",
  );
  assert.deepEqual(pageErrors, []);
  console.log(
    JSON.stringify(
      {
        applicationSmoke: "passed",
        applicationStatus: status,
        repeatedPredictions: 2,
        predictionOutcome: actualResult.error ? "rejected-low-confidence" : "accepted",
        actualModelRequests: applicationModelRequests,
        imagePosts: imagePostRequests,
        fixture: "synthetic 1x1 PNG; NOT a component accuracy test",
      },
      null,
      2,
    ),
  );
} finally {
  await browser?.close();
  await server.close();
}
