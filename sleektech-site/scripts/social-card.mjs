import { chromium } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { brandMarkSvg } from "../src/data/brand.js";
const font = (await readFile("public/fonts/inter-latin.woff2")).toString(
  "base64",
);
const art = (
  await readFile("public/images/connected-architecture.webp")
).toString("base64");
const browser = await chromium.launch({
  executablePath: process.env.SLEEKTECH_CHROME || "/usr/bin/google-chrome",
  args: ["--no-sandbox"],
});
try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
  });
  await page.setContent(
    `<style>@font-face{font-family:Inter;src:url('data:font/woff2;base64,${font}')}*{box-sizing:border-box}body{margin:0;width:1200px;height:630px;background:#fff;color:#15181d;font-family:Inter,Arial,sans-serif;padding:40px 48px;overflow:hidden}.brand{display:flex;align-items:center;gap:12px;font-size:30px;font-weight:650;letter-spacing:-1.65px;color:#020b2b}.brand-tech{color:#0066ff}.brand svg{position:static;width:36px;height:36px;flex:none}.kicker{position:absolute;right:48px;top:52px;font-size:10px;letter-spacing:1.2px}h1{font-size:91px;line-height:1.02;letter-spacing:-6px;font-weight:500;margin:38px 0 0;position:relative;z-index:2}h1 span{color:#185bf1}p{font-size:14px;line-height:1.7;color:#606b7b;max-width:305px;position:absolute;right:48px;top:153px}img{position:absolute;left:48px;top:330px;width:1104px;height:300px;object-fit:cover;object-position:center 54%}.label{position:absolute;left:72px;bottom:23px;padding:15px 20px;background:#fffffff2;font-size:14px;letter-spacing:-.3px;line-height:1.3}.number{position:absolute;right:70px;bottom:24px;color:#173054;background:#ffffffe8;padding:10px 15px;font-size:8px;letter-spacing:1px}</style><div class="brand">${brandMarkSvg()}<span>Sleek<span class="brand-tech">Tech</span></span></div><div class="kicker">STRATEGY × DESIGN × ENGINEERING</div><h1>Ambition, meet<br/><span>execution.</span></h1><p>Exceptional websites.<br/>Connected business software.<br/>Built around your ambition.</p><img src="data:image/webp;base64,${art}" alt=""/><div class="label">Many moving parts.<br/>One clear direction.</div><div class="number">CONNECTED BY DESIGN ↗</div>`,
  );
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: resolve("public/social-card.png") });
} finally {
  await browser.close();
}
