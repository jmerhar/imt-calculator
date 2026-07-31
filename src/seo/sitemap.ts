// Build the sitemap XML from the route set, including the localized guide URLs and their hreflang
// alternates. Pure module used by vite.config.ts (ssgOptions.onFinished) at build time; keeping it
// here means the guide registry is the single source of truth for both the pages and the sitemap.

import { SITE_URL } from "../config";
import { pageSlug } from "../i18n/pages";
import { GUIDE_META, GUIDES_SEGMENT } from "../content/guides/registry";

// Core pages emitted in both languages (EN at root, PT under /pt with localized slugs).
const CORE_KEYS = ["/", "/glossary", "/how-it-works"];
const bareEn = (key: string) => `${SITE_URL}/${pageSlug("en", key) ? `${pageSlug("en", key)}/` : ""}`;
const barePt = (key: string) => `${SITE_URL}/pt/${pageSlug("pt", key) ? `${pageSlug("pt", key)}/` : ""}`;

const indexEn = `${SITE_URL}/${GUIDES_SEGMENT.en}/`;
const indexPt = `${SITE_URL}/pt/${GUIDES_SEGMENT.pt}/`;
const articleEn = (slug: string) => `${SITE_URL}/${GUIDES_SEGMENT.en}/${slug}/`;
const articlePt = (slug: string) => `${SITE_URL}/pt/${GUIDES_SEGMENT.pt}/${slug}/`;

interface Row {
  loc: string;
  en: string;
  pt: string;
}

/** Every URL in the site with its EN/PT hreflang pair (x-default = EN). */
function rows(): Row[] {
  const out: Row[] = [];
  for (const key of CORE_KEYS) {
    const en = bareEn(key);
    const pt = barePt(key);
    out.push({ loc: en, en, pt }, { loc: pt, en, pt });
  }
  out.push({ loc: indexEn, en: indexEn, pt: indexPt }, { loc: indexPt, en: indexEn, pt: indexPt });
  for (const m of GUIDE_META) {
    const en = articleEn(m.slug.en);
    const pt = articlePt(m.slug.pt);
    out.push({ loc: en, en, pt }, { loc: pt, en, pt });
  }
  return out;
}

/** The sitemap XML string. `today` is an ISO date (YYYY-MM-DD) for <lastmod>. */
export function buildSitemap(today: string): string {
  const entries = rows()
    .map(
      (r) => `  <url>
    <loc>${r.loc}</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${r.en}" />
    <xhtml:link rel="alternate" hreflang="pt" href="${r.pt}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${r.en}" />
    <lastmod>${today}</lastmod>
  </url>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries}
</urlset>
`;
}
