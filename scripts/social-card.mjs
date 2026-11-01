import { chromium } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const font = (await readFile("public/fonts/inter-latin.woff2")).toString(
  "base64",
);
const browser = await chromium.launch({
  executablePath: process.env.SIMPTECH_CHROME || "/usr/bin/google-chrome",
  args: ["--no-sandbox"],
});
try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
  });
  await page.setContent(`
    <style>
      @font-face{font-family:Inter;src:url('data:font/woff2;base64,${font}');font-weight:100 900}
      *{box-sizing:border-box}body{margin:0;width:1200px;height:630px;background:#090b0f;color:#f1f2f5;font-family:Inter,Arial,sans-serif;padding:42px 58px;overflow:hidden}
      .brand{font-size:29px;font-weight:600;letter-spacing:-1.5px}.brand span{color:#8aabff}.kicker{position:absolute;right:58px;top:55px;font-size:10px;letter-spacing:1.3px;color:#a5b3cc}
      h1{font-size:69px;line-height:1.1;letter-spacing:-4px;font-weight:500;margin:60px 0 23px}h1 span{color:#a6b9e7}p{font-size:17px;color:#a6b1c5}
      .workspace{margin-top:45px;border:1px solid #34415a;border-radius:12px;background:#111823;padding:23px;display:flex;gap:20px;align-items:center}
      .intro{width:205px;padding-left:8px}.intro strong{font-size:15px;font-weight:500}.intro small{display:block;color:#9aaac5;font-size:10px;margin-top:9px}
      .metric{background:#182131;border:1px solid #303e54;border-radius:6px;padding:17px 20px;width:192px}.metric small{display:block;font-size:10px;color:#acb9cf}.metric b{display:block;font-size:26px;font-weight:500;margin-top:9px;letter-spacing:-1px}
      svg{flex:1;width:230px;height:95px}.note{font-size:9px;color:#8e9bb1;margin:12px 0 0;text-align:right}
    </style>
    <div class="brand">ϟ SimpTech<span>.</span></div><div class="kicker">STRATEGY / DESIGN / DEVELOPMENT</div>
    <h1>Better websites.<br /><span>Smarter business software.</span></h1>
    <p>From your first impression to your everyday operations.</p>
    <div class="workspace"><div class="intro"><strong>One connected business.</strong><small>Designed around the way you work.</small></div><div class="metric"><small>Customer relationships</small><b>In focus.</b></div><div class="metric"><small>Everyday operations</small><b>In sync.</b></div><svg viewBox="0 0 230 95" fill="none"><path d="M0 85L30 65L60 72L90 42L120 53L150 20L180 31L210 8L230 15V95H0Z" fill="#172d56"/><path d="M0 85L30 65L60 72L90 42L120 53L150 20L180 31L210 8L230 15" stroke="#789dff" stroke-width="2"/></svg></div>
    <div class="note">ORIGINAL INTERFACE CONCEPT</div>
  `);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: resolve("public/social-card.png") });
} finally {
  await browser.close();
}
