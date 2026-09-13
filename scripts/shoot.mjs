// Screenshots a URL at phone, tablet and desktop widths, and reports any
// element whose box sticks out past the viewport.
//
//   node scripts/shoot.mjs <url> <out-dir> [label]
//
// Headless Chrome clamps its own window to about 500px, so --window-size alone
// silently lies about narrow layouts. This drives the viewport through CDP,
// which is the only way to see what a 390px phone actually gets.
import puppeteer from "puppeteer-core";
import path from "node:path";
import fs from "node:fs";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const [url, outDir, label = "page"] = process.argv.slice(2);
const WIDTHS = [390, 768, 1440];

fs.mkdirSync(outDir, { recursive: true });

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
let failures = 0;

for (const width of WIDTHS) {
  const page = await browser.newPage();
  await page.setViewport({ width, height: 900, deviceScaleFactor: 1 });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });
  // Let scroll-driven reveals settle, then go back to the top for the shot.
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await new Promise((r) => setTimeout(r, 700));

  const overflow = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const out = [];
    for (const el of document.querySelectorAll("*")) {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.right > vw + 1) {
        out.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 50)} right=${Math.round(r.right)}`);
      }
    }
    return { vw, scrollWidth: document.documentElement.scrollWidth, out: out.slice(0, 8) };
  });

  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise((r) => setTimeout(r, 250));
  const file = path.join(outDir, `${label}-${width}.png`);
  await page.screenshot({ path: file, fullPage: false });

  const bad = overflow.scrollWidth > overflow.vw + 1 || overflow.out.length > 0;
  if (bad || errors.length) failures++;
  console.log(
    `${width}px  viewport=${overflow.vw} scrollWidth=${overflow.scrollWidth} ` +
      `${bad ? "OVERFLOW " + JSON.stringify(overflow.out) : "no overflow"}` +
      `${errors.length ? "  ERRORS " + JSON.stringify(errors.slice(0, 3)) : ""}`,
  );
  await page.close();
}

await browser.close();
process.exit(failures ? 1 : 0);
