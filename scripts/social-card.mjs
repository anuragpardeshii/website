import { chromium } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const font = (await readFile("public/fonts/inter-latin.woff2")).toString(
  "base64",
);
// An original still of the same toroidal particle construction used by NeuralEngine.
const particles = Array.from({ length: 144 * 40 }, (_, i) => {
  const u = ((i % 144) / 144) * Math.PI * 2,
    v = (Math.floor(i / 144) / 40) * Math.PI * 2;
  const r = 1.62 + 0.54 * Math.cos(v),
    x = r * Math.cos(u),
    y = r * Math.sin(u),
    z = 0.54 * Math.sin(v);
  const ry = y * Math.cos(0.65) - z * Math.sin(0.65),
    rz = y * Math.sin(0.65) + z * Math.cos(0.65),
    perspective = 4.6 / (4.6 - rz);
  const xx =
      385 + (x * Math.cos(-0.5) - ry * Math.sin(-0.5)) * 140 * perspective,
    yy = 355 + (x * Math.sin(-0.5) + ry * Math.cos(-0.5)) * 140 * perspective;
  const light = (Math.sin(u * 3 + v * 2) + 1) * 0.5,
    colors = ["#8b2712", "#cf4219", "#ff6c31", "#ffa16d", "#ffe3c7"];
  const color =
    colors[
      Math.min(4, Math.max(0, Math.floor((rz + 2.1) * 0.7 + light * 1.7)))
    ];
  return `<circle cx="${xx.toFixed(2)}" cy="${yy.toFixed(2)}" r="${((0.5 + light * 0.5) * perspective).toFixed(2)}" fill="${color}"/>`;
}).join("");
const browser = await chromium.launch({
  executablePath: process.env.SIMPTECH_CHROME || "/usr/bin/google-chrome",
  args: ["--no-sandbox"],
});
try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
  });
  await page.setContent(`<style>
  @font-face{font-family:Inter;src:url('data:font/woff2;base64,${font}');font-weight:100 900}
  *{box-sizing:border-box}body{margin:0;width:1200px;height:630px;background:#000;color:#f4f4f4;font-family:Inter,Arial,sans-serif;padding:40px 60px;overflow:hidden}
  .art{position:absolute;right:-80px;top:-25px;width:750px;height:700px;z-index:-1}.brand{font-size:29px;font-weight:550;letter-spacing:-1.5px}.kicker{position:absolute;right:60px;top:55px;font-size:9px;letter-spacing:1px;color:#aaa}
  h1{font-size:93px;line-height:1.01;letter-spacing:-6px;font-weight:450;margin:68px 0 22px}h1 span{color:#a6a6a6}p{font-size:15px;color:#bbb;letter-spacing:-.3px;line-height:1.8}
  .footer{position:absolute;bottom:30px;left:60px;right:60px;display:flex;align-items:center;justify-content:space-between;border-top:1px solid #ffffff33;padding-top:18px;font-size:9px;letter-spacing:1px;color:#aaa}.cta{color:#080808;background:#eee;border-radius:4px;padding:12px 18px;letter-spacing:0;font-size:12px}
  </style><svg class="art" viewBox="0 0 750 700">${particles}</svg><div class="brand">ϟ SimpTech.</div><div class="kicker">DESIGN & TECHNOLOGY / BUILT WITH INTENT.</div>
  <h1>Built to move<br/>business <span>forward.</span></h1><p>Websites. Dashboards. Analytics. AI engines.<br/>Designed with passion. Engineered with purpose.</p>
  <div class="footer"><span>WEBSITES / SOFTWARE / INTELLIGENCE</span><span class="cta">Let’s build your next chapter ↗</span></div>`);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: resolve("public/social-card.png") });
} finally {
  await browser.close();
}
