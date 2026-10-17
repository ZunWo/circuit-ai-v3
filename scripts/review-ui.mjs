import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";

const out = "test-results/ui-review";
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: "msedge", headless: true });
const report = [];
try {
  for (const width of [390, 1440]) {
    for (const theme of ["light", "dark"]) {
      const page = await browser.newPage({ viewport: { width, height: 1000 } });
      const errors = [];
      page.on("pageerror", error => errors.push(error.message));
      await page.addInitScript(value => localStorage.setItem("circuitai-theme", value), theme);
      await page.goto("http://127.0.0.1:5204/components?component=transistor");
      await page.locator('.detail-section-nav a[href="#wiring-transistor"]').click();
      const guide = page.locator(".connection-guide");
      await guide.getByRole("button", { name: /3/, exact: true }).click();
      await guide.locator(".breadboard-preview").scrollIntoViewIfNeeded();
      await page.screenshot({ path: `${out}/${width}-${theme}-wiring.png` });
      const preview = await guide.locator(".breadboard-picture").evaluate(svg => {
        const scale = svg.getScreenCTM().a;
        return { width: svg.getBoundingClientRect().width, endpointFont: 18 * scale,
          endpointVisible: [...svg.querySelectorAll(".breadboard-endpoint")].map(node => {
            const box = node.getBoundingClientRect(); return { x: box.x, width: box.width };
          }) };
      });
      await guide.getByRole("button", { name: /ขยายภาพ/ }).click();
      const zoom = page.locator(".breadboard-dialog[open]");
      await page.screenshot({ path: `${out}/${width}-${theme}-expanded.png` });
      const zoomInfo = await zoom.evaluate(dialog => {
        const region = dialog.querySelector(".breadboard-zoom"), svg = region.querySelector("svg");
        return { viewport: region.clientWidth, content: region.scrollWidth,
          hasStepControls: [...dialog.querySelectorAll("button")].some(button => button.textContent.includes("ถัดไป")),
          bodyOverflow: getComputedStyle(document.body).overflow,
          svgWidth: svg.getBoundingClientRect().width };
      });
      await page.keyboard.press("Escape");
      await page.keyboard.press("Escape");
      await page.goto("http://127.0.0.1:5204/");
      await page.getByRole("button", { name: /Demo/ }).click();
      await page.locator(".result-panel").scrollIntoViewIfNeeded();
      await page.screenshot({ path: `${out}/${width}-${theme}-result.png` });
      report.push({ width, theme: await page.locator("html").getAttribute("data-theme"), preview, zoomInfo, errors });
      await page.close();
    }
  }
} finally { await browser.close(); }
await writeFile(`${out}/report.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
