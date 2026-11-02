import { chromium } from "@playwright/test";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { brandMarkSvg } from "../src/data/brand.js";

// Render directly from vector geometry: no raster source, remote font, or API.
const font = (await readFile("public/fonts/inter-latin.woff2")).toString(
  "base64",
);
const fontFace =
  "@font-face{font-family:Inter;src:url(data:font/woff2;base64," +
  font +
  ") format('woff2');font-weight:100 900}";
const symbol = brandMarkSvg();
const inverse = brandMarkSvg({ color: "#ffffff" });
const icon = brandMarkSvg({
  color: "#ffffff",
  background: "#185bf1",
  inset: 6,
});
const appIcon = brandMarkSvg({
  color: "#ffffff",
  background: "#185bf1",
  inset: 6,
  cornerRadius: 0,
});
await mkdir("public/brand", { recursive: true });
await writeFile("public/brand/sleektech-symbol.svg", symbol);
await writeFile("public/brand/sleektech-symbol-white.svg", inverse);
await writeFile("public/favicon.svg", icon);

const browser = await chromium.launch({
  executablePath:
    process.env.SLEEKTECH_CHROME ||
    process.env.SIMPTECH_CHROME ||
    "/usr/bin/google-chrome",
  headless: true,
  args: ["--no-sandbox"],
});
try {
  const page = await browser.newPage({
    viewport: { width: 800, height: 200 },
    deviceScaleFactor: 1,
  });
  await page.setContent(
    "<style>" +
      fontFace +
      'body{margin:0}.wordmark{display:inline-block;font:650 64px/1 Inter;letter-spacing:-.065em}</style><span class="wordmark">sleektech</span>',
  );
  await page.evaluate(() => document.fonts.ready);
  const wordWidth = await page
    .locator(".wordmark")
    .evaluate((el) => el.getBoundingClientRect().width);
  function logo(color, mark) {
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' +
      Math.ceil(wordWidth + 88) +
      ' 72" role="img" aria-label="SleekTech">' +
      "<style>" +
      fontFace +
      '</style><g transform="translate(0 4) scale(1.333333)">' +
      mark.replace(/<svg[^>]*>|<\/svg>/g, "") +
      '</g><text x="82" y="59" fill="' +
      color +
      '" font-family="Inter,sans-serif" font-size="64" font-weight="650" letter-spacing="-4.16">sleektech</text></svg>'
    );
  }
  await writeFile("public/brand/sleektech-logo.svg", logo("#15181d", symbol));
  await writeFile(
    "public/brand/sleektech-logo-white.svg",
    logo("#ffffff", inverse),
  );

  const pngs = [];
  for (const [size, name] of [
    [16, "favicon-16.png"],
    [32, "favicon-32.png"],
    [48, null],
    [180, "apple-touch-icon.png"],
    [192, "icon-192.png"],
    [512, "icon-512.png"],
  ]) {
    await page.setViewportSize({ width: size, height: size });
    await page.setContent(
      "<style>*{box-sizing:border-box}body{margin:0}svg{display:block;width:100vw;height:100vh}</style>" +
        (size >= 180 ? appIcon : icon),
    );
    const png = await page.screenshot({ omitBackground: true });
    if (name) await writeFile("public/" + name, png);
    if (size <= 48) pngs.push({ size, png });
  }
  // An ICO containing PNG payloads at 16, 32, and 48 px supports legacy requests.
  const header = Buffer.alloc(6 + 16 * pngs.length);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);
  let offset = header.length;
  pngs.forEach(({ size, png }, index) => {
    const entry = 6 + index * 16;
    header[entry] = size;
    header[entry + 1] = size;
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(png.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += png.length;
  });
  await writeFile(
    "public/favicon.ico",
    Buffer.concat([header, ...pngs.map((item) => item.png)]),
  );
  await writeFile(
    "public/site.webmanifest",
    JSON.stringify(
      {
        name: "SleekTech",
        short_name: "SleekTech",
        start_url: "/",
        display: "browser",
        background_color: "#ffffff",
        theme_color: "#185bf1",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
        ],
      },
      null,
      2,
    ) + "\n",
  );
  console.log(
    "Generated SleekTech SVG logos, browser icons, Apple touch icon, and web manifest.",
  );
} finally {
  await browser.close();
}
