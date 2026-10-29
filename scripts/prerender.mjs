import { readFile, writeFile, mkdir } from "node:fs/promises";
import { render, routes, getRoute } from "../.prerender/entry-server.js";
import { site } from "../src/data/content.js";

const escape = (text) =>
  String(text)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
const template = await readFile("dist/index.html", "utf8");
for (const path of [...routes.map((r) => r.path), "/404"]) {
  const route = getRoute(path);
  const title = `${route.title} | ${site.name}`;
  const url = `${site.origin}${path === "/" ? "" : path}`;
  const meta = `<title>${escape(title)}</title>\n<meta name="description" content="${escape(route.description)}"/>\n<link rel="canonical" href="${url}"/>\n<meta property="og:type" content="${path.startsWith("/insights/") ? "article" : "website"}"/>\n<meta property="og:title" content="${escape(title)}"/>\n<meta property="og:description" content="${escape(route.description)}"/>\n<meta property="og:url" content="${url}"/>\n<meta property="og:site_name" content="${site.name}"/>\n<meta name="twitter:card" content="summary_large_image"/>\n<meta property="og:image" content="${site.origin}/social-card.png"/>\n<meta name="twitter:image" content="${site.origin}/social-card.png"/>\n<meta name="twitter:title" content="${escape(title)}"/>\n<meta name="twitter:description" content="${escape(route.description)}"/>\n${path === "/404" ? '<meta name="robots" content="noindex"/>' : ""}<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "Organization", name: site.name, url: site.origin, description: site.description, logo: `${site.origin}/favicon.svg` }).replaceAll("<", "\\u003c")}</script>`;
  const html = template
    .replace("<!--page-meta-->", meta)
    .replace("<!--app-html-->", render(path));
  if (path === "/404") await writeFile("dist/404.html", html);
  else {
    const directory = `dist${path === "/" ? "" : path}`;
    await mkdir(directory, { recursive: true });
    await writeFile(`${directory}/index.html`, html);
  }
}
await writeFile(
  "dist/sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map((r) => `<url><loc>${site.origin}${r.path === "/" ? "" : r.path}</loc></url>`).join("")}</urlset>`,
);
await writeFile(
  "dist/robots.txt",
  `User-agent: *\nAllow: /\nSitemap: ${site.origin}/sitemap.xml\n`,
);
console.log(
  `Pre-rendered ${routes.length} pages plus a custom 404, sitemap, and robots.txt.`,
);
