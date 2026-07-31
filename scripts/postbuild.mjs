// Post-build steps for the static site:
//   1. dist/404.html — the prerendered /404 page, so GitHub Pages serves a real "not found" page
//      (with a 404 status) for any unknown path; the client `*` route renders the same page.
//   2. dist/sitemap.xml — the canonical URLs (trailing-slash form, matching what Pages serves).
// The site origin is duplicated here (build script, no TS loader); keep it in sync with src/config.

import { copyFileSync, existsSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const SITE_URL = "https://calc-imt.online";
// Language-neutral pages; each is emitted in both languages with hreflang alternates.
const BARE_PATHS = ["/", "/glossary", "/how-it-works"];
const enUrl = (b) => `${SITE_URL}${b === "/" ? "/" : `${b}/`}`;
const ptUrl = (b) => `${SITE_URL}/pt${b === "/" ? "/" : `${b}/`}`;

const dist = resolve(process.cwd(), "dist");
const notFound = resolve(dist, "404", "index.html");

if (!existsSync(notFound)) {
  console.error("postbuild: dist/404/index.html not found — did the SSG build prerender /404?");
  process.exit(1);
}

copyFileSync(notFound, resolve(dist, "404.html"));
console.log("postbuild: wrote dist/404.html (prerendered not-found page)");

const today = new Date().toISOString().slice(0, 10);
const entry = (loc, bare) =>
  `  <url>
    <loc>${loc}</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${enUrl(bare)}" />
    <xhtml:link rel="alternate" hreflang="pt" href="${ptUrl(bare)}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${enUrl(bare)}" />
    <lastmod>${today}</lastmod>
  </url>`;
const entries = BARE_PATHS.flatMap((b) => [entry(enUrl(b), b), entry(ptUrl(b), b)]).join("\n");
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries}
</urlset>
`;
writeFileSync(resolve(dist, "sitemap.xml"), sitemap);
console.log(`postbuild: wrote dist/sitemap.xml (${BARE_PATHS.length * 2} URLs)`);
