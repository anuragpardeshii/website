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
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1200, height: 630 });
  await page.setContent(
    `<style>@font-face{font-family:Inter;src:url('data:font/woff2;base64,${font}')}*{box-sizing:border-box}body{margin:0;width:1200px;height:630px;background:#f8fbff;color:#172333;font-family:Inter,Arial,sans-serif;padding:70px 80px;overflow:hidden}.brand{font-size:30px;font-weight:650}.brand span{color:#1462ed}h1{font-size:82px;line-height:1.08;letter-spacing:-4px;font-weight:600;margin:70px 0 25px;position:relative;z-index:2}h1 span{color:#1462ed}p{font-size:19px;color:#66758b;position:relative;z-index:2}.shape{position:absolute;right:65px;top:145px;width:295px;height:310px;border-radius:15px 95px 15px 75px;background:#1462ed;transform:rotate(-8deg)}.ring{position:absolute;right:9px;top:76px;width:240px;height:240px;border:40px solid #c1d8fc;border-radius:50%}.card{position:absolute;right:68px;top:310px;background:white;border:1px solid #e0e8f5;border-radius:12px;width:310px;padding:24px;box-shadow:0 15px 40px #183d6e15;transform:rotate(-4deg)}.card b{font-size:15px}.bars{display:flex;align-items:end;gap:15px;height:80px;margin-top:15px}.bars i{background:#a4c5fa;width:35px;border-radius:4px 4px 0 0;height:40px}.bars i:nth-child(2){height:55px}.bars i:nth-child(3){height:48px}.bars i:nth-child(4){height:65px}.bars i:nth-child(5){height:80px;background:#1462ed}</style><div class="brand"><span>ϟ</span> SimpTech<span>.</span></div><div class="ring"></div><div class="shape"></div><h1>Big possibilities.<br/>Simply <span>built.</span></h1><p>Thoughtfully built software. Simply better experiences.</p><div class="card"><b>Built around your business.</b><div class="bars"><i></i><i></i><i></i><i></i><i></i></div></div>`,
  );
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: resolve("public/social-card.png") });
} finally {
  await browser.close();
}
