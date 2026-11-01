import { chromium } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
const font = (await readFile("public/fonts/inter-latin.woff2")).toString(
  "base64",
);
const artwork = (await readFile("public/media/violet-sculpture.webp")).toString(
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
  await page.setContent(`<style>
 @font-face{font-family:Inter;src:url('data:font/woff2;base64,${font}');font-weight:100 900}*{box-sizing:border-box}body{margin:0;width:1200px;height:630px;background:radial-gradient(ellipse at 5% 75%,#7764f5,transparent 48%),radial-gradient(ellipse at 105% 105%,#7acbff,#4536bb66 40%,transparent 60%),#160d2c;color:#f5f0ff;font-family:Inter,Arial,sans-serif;padding:38px 58px;overflow:hidden}.brand{font-size:26px;font-weight:550;letter-spacing:-1.2px}.kicker{position:absolute;right:58px;top:48px;font-size:9px;letter-spacing:1px;color:#cebcec}h1{position:relative;font-size:77px;font-weight:450;line-height:1.06;letter-spacing:-4px;margin:39px 0 0 90px;z-index:2}h1>span{display:block;margin-left:160px}em{font-family:Georgia;font-weight:400;color:#e3ceff}.outline{display:inline-block;font-size:37px;letter-spacing:-1.7px;border:1px solid #be9dfb90;border-radius:100px;padding:9px 23px;margin:13px 0 0 332px;background:#25143c66}.art{position:absolute;width:330px;height:330px;left:70px;top:255px;transform:rotate(-7deg)}.copy{position:absolute;left:600px;top:374px;font-size:19px;line-height:1.5;letter-spacing:-.5px}.copy small{display:block;color:#d2c2eb;font-size:11px;letter-spacing:0;margin-top:20px}.footer{position:absolute;left:58px;right:58px;bottom:25px;display:flex;justify-content:space-between;border-top:1px solid #decaff40;padding-top:17px;font-size:8px;letter-spacing:1px;color:#e5d9fa}.cta{color:#28153c;background:#eee5ff;border-radius:100px;padding:11px 19px;font-size:11px;display:inline-block;margin-top:20px;letter-spacing:0}
 </style><div class="brand">ϟ SimpTech.</div><div class="kicker">YOUR AMBITION. OUR CRAFT.</div><h1>Big ideas.<span>Beautifully <em>built.</em></span></h1><div class="outline">✧ Intelligently connected.</div><img class="art" src="data:image/webp;base64,${artwork}" alt=""/><div class="copy">Distinctive websites. Clearer dashboards.<br/>AI that works for your business.<br/><span class="cta">Let’s build something great ↗</span></div><div class="footer"><span>DESIGN MEETS TECHNOLOGY</span><span>WEBSITES / BUSINESS SOFTWARE / AI SYSTEMS</span></div>`);
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map((i) => i.decode()));
  });
  await page.screenshot({ path: resolve("public/social-card.png") });
} finally {
  await browser.close();
}
