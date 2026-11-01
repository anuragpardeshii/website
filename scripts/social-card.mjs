import { chromium } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const font = (await readFile("public/fonts/inter-latin.woff2")).toString(
  "base64",
);
const landscape = (
  await readFile("public/media/intelligence-sculpture.webp")
).toString("base64");
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
      *{box-sizing:border-box}body{margin:0;width:1200px;height:630px;background:#030303;color:#f4f4f4;font-family:Inter,Arial,sans-serif;padding:42px 60px;overflow:hidden}
      .landscape{position:absolute;inset:0;background:linear-gradient(90deg,#030303ce,#03030355),linear-gradient(0deg,#030303,#03030320 60%),url('data:image/webp;base64,${landscape}') center/cover;z-index:-1}
      .brand{font-size:29px;font-weight:550;letter-spacing:-1.5px}.kicker{position:absolute;right:60px;top:55px;font-size:10px;letter-spacing:1.3px;color:#aaa}
      h1{font-size:105px;line-height:1.06;letter-spacing:-7px;font-weight:450;margin:92px 0 28px}h1 span{color:#a6a6a6}p{font-size:18px;color:#bbb;letter-spacing:-.3px}
      .footer{position:absolute;bottom:40px;left:60px;right:60px;display:flex;align-items:center;justify-content:space-between;border-top:1px solid #ffffff33;padding-top:22px;font-size:10px;letter-spacing:1px;color:#aaa}.cta{color:#080808;background:#eee;border-radius:4px;padding:12px 18px;letter-spacing:0;font-size:12px}
    </style>
    <div class="landscape"></div><div class="brand">ϟ SimpTech.</div><div class="kicker">SIMPTECH / DIGITAL SYSTEMS STUDIO</div>
    <h1>Intelligence.<br /><span>Made useful.</span></h1>
    <p>AI systems. Thoughtful websites. Connected software.</p>
    <div class="footer"><span>STRATEGY / DESIGN / DEVELOPMENT</span><span class="cta">Start a project ↗</span></div>
  `);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: resolve("public/social-card.png") });
} finally {
  await browser.close();
}
