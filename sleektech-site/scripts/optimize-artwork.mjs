import { chromium } from "@playwright/test";
import { readFile, writeFile, mkdir } from "node:fs/promises";
const inputPaths = process.argv.slice(2);
if (inputPaths.length !== 2)
  throw new Error(
    "Usage: node scripts/optimize-artwork.mjs <hero.png> <logistics.png>",
  );
const sources = [
  ["connected-architecture", inputPaths[0]],
  ["logistics-architecture", inputPaths[1]],
];
const browser = await chromium.launch({
  executablePath: "/usr/bin/google-chrome",
  headless: true,
  args: ["--no-sandbox"],
});
try {
  const page = await browser.newPage();
  await mkdir("public/images", { recursive: true });
  for (const [name, path] of sources) {
    const data =
      "data:image/png;base64," + (await readFile(path)).toString("base64");
    const output = await page.evaluate(async (src) => {
      const img = new Image();
      img.src = src;
      await img.decode();
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext("2d").drawImage(img, 0, 0);
      return canvas.toDataURL("image/webp", 0.9).split(",")[1];
    }, data);
    const buffer = Buffer.from(output, "base64");
    await writeFile(`public/images/${name}.webp`, buffer);
    console.log(`${name}: ${Math.round(buffer.length / 1024)} KB`);
  }
} finally {
  await browser.close();
}
