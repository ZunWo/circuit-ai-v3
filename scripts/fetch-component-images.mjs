import { mkdir, writeFile, stat } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const userAgent = "CircuitLib-AssetFetch/1.0 (educational local project)";
const searches = {
  resistor: "axial resistor filetype:bitmap",
  "ceramic-capacitor": "ceramic disc capacitor filetype:bitmap",
  "film-capacitor": "film capacitor filetype:bitmap",
  "electrolytic-capacitor": "electrolytic capacitor filetype:bitmap",
  diode: "1N4148 diode filetype:bitmap",
  transistor: "TO-92 transistor filetype:bitmap",
  led: "LED component filetype:bitmap",
  "ir-led-photo-transistor": "phototransistor filetype:bitmap",
  "ir-led": "infrared LED filetype:bitmap",
  switch: "tactile pushbutton switch filetype:bitmap",
  photoresistor: "photoresistor filetype:bitmap",
  "seven-segment": '"seven-segment" "LED" filetype:bitmap -IV -VFD',
  potentiometer: "potentiometer filetype:bitmap",
  buzzer: "piezoelectric buzzer filetype:bitmap",
  thermistor: "thermistor filetype:bitmap",
  multimeter: "digital multimeter filetype:bitmap",
  "power-supply": '"bench power supply" filetype:bitmap',
  oscilloscope: "digital oscilloscope filetype:bitmap",
  "function-generator": "function generator filetype:bitmap",
};

const plainText = (html = "") =>
  html
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
async function request(url) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const response = await fetch(url, {
      headers: { "User-Agent": userAgent },
      signal: AbortSignal.timeout(30_000),
    });
    if (response.status === 429 && attempt < 3) {
      await new Promise((resolve) =>
        setTimeout(
          resolve,
          Math.min(
            10_000,
            Math.max(
              1500,
              Number(response.headers.get("retry-after") ?? 3) * 1000,
            ),
          ),
        ),
      );
      continue;
    }
    if (!response.ok) throw new Error(`${response.status} ${url}`);
    return response;
  }
}

function parsePage(page) {
  const info = page.imageinfo?.[0];
  if (!info) return null;
  const metadata = info.extmetadata ?? {};
  const license = metadata.LicenseShortName?.value ?? "";
  if (!/CC0|CC BY|Public domain/i.test(license)) return null;
  const imageUrl = new URL(info.thumburl ?? info.url);
  imageUrl.search = "";
  return {
    title: page.title,
    source: info.descriptionurl,
    download: imageUrl.href,
    author: plainText(metadata.Artist?.value),
    license,
    licenseUrl:
      metadata.LicenseUrl?.value ||
      "https://commons.wikimedia.org/wiki/Commons:Licensing",
    description: plainText(metadata.ImageDescription?.value).slice(0, 250),
    width: info.width,
    height: info.height,
    mime: info.mime,
  };
}

async function discover(id, query) {
  const url = new URL("https://commons.wikimedia.org/w/api.php");
  url.search = new URLSearchParams({
    action: "query",
    format: "json",
    generator: "search",
    gsrsearch: query,
    gsrnamespace: "6",
    gsrlimit: "5",
    prop: "imageinfo",
    iiprop: "url|extmetadata|size|mime",
    iiurlwidth: "640",
  });
  const result = await (await request(url)).json();
  return [
    id,
    Object.values(result.query?.pages ?? {})
      .sort((a, b) => a.index - b.index)
      .map(parsePage)
      .filter(Boolean),
  ];
}

if (process.argv.some((argument) => argument.startsWith("--lookup="))) {
  const titles = process.argv
    .find((argument) => argument.startsWith("--lookup="))
    .slice(9);
  const url = new URL("https://commons.wikimedia.org/w/api.php");
  url.search = new URLSearchParams({
    action: "query",
    format: "json",
    titles,
    prop: "imageinfo",
    iiprop: "url|extmetadata|size|mime",
    iiurlwidth: "640",
  });
  const result = await (await request(url)).json();
  console.log(
    JSON.stringify(
      Object.values(result.query?.pages ?? {})
        .map(parsePage)
        .filter(Boolean),
    ),
  );
} else if (process.argv.includes("--discover")) {
  const results = {};
  const requestedIds = process.argv
    .find((argument) => argument.startsWith("--ids="))
    ?.slice(6)
    .split(",");
  const entries = Object.entries(searches).filter(
    ([id]) => !requestedIds || requestedIds.includes(id),
  );
  for (const [id, query] of entries) {
    try {
      const [, candidates] = await discover(id, query);
      results[id] = candidates.slice(0, 3);
      console.log(JSON.stringify({ id, candidates: results[id] }));
    } catch (error) {
      console.log(JSON.stringify({ id, candidates: [], error: error.message }));
    }
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
} else {
  const { imageCredits } = await import("../src/data/imageCredits.js");
  for (const [id, asset] of Object.entries(imageCredits)) {
    if (!/CC0|CC BY|Public domain/i.test(asset.license))
      throw new Error(`Unverified license: ${id}`);
    const target = path.resolve(root, `public${asset.image}`);
    const imageRoot = path.resolve(root, "public/images") + path.sep;
    if (!target.startsWith(imageRoot))
      throw new Error("Asset path must remain inside public/images");
    try {
      const existing = await stat(target);
      if (existing.size > 0) {
        console.log(`${id}: already downloaded`);
        continue;
      }
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
    await new Promise((resolve) => setTimeout(resolve, 2500));
    const response = await request(asset.download);
    if (!response.headers.get("content-type")?.startsWith("image/"))
      throw new Error(`Not an image: ${id}`);
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length > 5 * 1024 * 1024)
      throw new Error(`Image too large: ${id}`);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, buffer);
    console.log(`${id}: ${buffer.length} bytes • ${asset.license}`);
  }
  const escape = (value) =>
    String(value).replace(
      /[&<>"']/g,
      (character) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[character],
    );
  const cards = Object.entries(imageCredits)
    .map(
      ([id, asset]) =>
        `<article><img src="${escape(asset.image)}" alt="${escape(asset.caption ?? id)}" loading="lazy"><h2>${escape(asset.title.replace(/^File:/, ""))}</h2><p>ผู้สร้าง: ${escape(asset.author)}</p><p>สัญญาอนุญาต: <a href="${escape(asset.licenseUrl)}">${escape(asset.license)}</a></p><a href="${escape(asset.source)}">ภาพต้นฉบับและรายละเอียดสิทธิ์</a></article>`,
    )
    .join("\n");
  await writeFile(
    path.join(root, "public/images/credits.html"),
    `<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#f8fafc"><script src="/theme.js"></script><link rel="icon" type="image/svg+xml" href="/circuitlib-logo.svg"><title>เครดิตภาพอุปกรณ์ | CircuitLib</title><style>:root{color-scheme:light;--credits-bg:#f8fafc;--credits-text:#0f172a;--credits-surface:white;--credits-border:#e2e8f0;--credits-link:#0369a1}[data-theme="dark"]{color-scheme:dark;--credits-bg:#0b1220;--credits-text:#e2e8f0;--credits-surface:#162033;--credits-border:#334155;--credits-link:#7dd3fc}body{font-family:Tahoma,system-ui,sans-serif;background:var(--credits-bg);color:var(--credits-text);margin:0;padding:32px 20px;line-height:1.8}main{max-width:1100px;margin:auto}h1{font-size:26px}h2{font-size:14px;overflow-wrap:anywhere}p,a{font-size:13px}a{color:var(--credits-link)}section{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;margin-top:28px}article{background:var(--credits-surface);border:1px solid var(--credits-border);border-radius:14px;padding:20px;min-width:0}img{width:100%;height:160px;object-fit:contain;background:white;border-radius:8px}article p{overflow-wrap:anywhere}</style></head><body><main><a href="/">← กลับ CircuitLib</a><h1>เครดิตภาพอุปกรณ์</h1><p>ภาพจาก Wikimedia Commons เก็บไว้ในโครงการเพื่อใช้เป็นตัวอย่างการเรียนรู้ ขนาดภาพบางรายการย่อโดยบริการ thumbnail ของ Wikimedia ไม่มีการแก้เนื้อหาหรือเติมเครื่องหมายขาอุปกรณ์</p><p>แต่ละภาพใช้สัญญาอนุญาตตามที่ระบุด้านล่าง ภาพ CC BY-SA ที่นำมาใช้ยังอยู่ภายใต้สัญญาอนุญาตเดิม เครดิตนี้ไม่ได้เปลี่ยนสัญญาอนุญาตของ source code ทั้งโครงการ ภาพตัวอย่างไม่ยืนยันค่า เบอร์รุ่น หรือ pinout ของอุปกรณ์ที่ผู้ใช้อัปโหลด</p><section>${cards}</section></main></body></html>`,
  );
  console.log("Saved public/images/credits.html");
}
