// Post-build steps for the static site:
//   1. dist/404.html — a copy of the built index.html so GitHub Pages serves the SPA shell for any
//      un-prerendered path (old hash links, typos); the client router then renders the match.
//   2. dist/sitemap.xml — the canonical URLs (trailing-slash form, matching what Pages serves).
// The site origin is duplicated here (build script, no TS loader); keep it in sync with src/config.

import { copyFileSync, existsSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const SITE_URL = "https://calc-imt.online";
const PATHS = ["/", "/glossary/", "/how-it-works/"];

const dist = resolve(process.cwd(), "dist");
const index = resolve(dist, "index.html");

if (!existsSync(index)) {
  console.error("postbuild: dist/index.html not found — did the SSG build run?");
  process.exit(1);
}

copyFileSync(index, resolve(dist, "404.html"));
console.log("postbuild: wrote dist/404.html (SPA fallback)");

const today = new Date().toISOString().slice(0, 10);
const urls = PATHS.map(
  (p) => `  <url>\n    <loc>${SITE_URL}${p}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`,
).join("\n");
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
writeFileSync(resolve(dist, "sitemap.xml"), sitemap);
console.log(`postbuild: wrote dist/sitemap.xml (${PATHS.length} URLs)`);
