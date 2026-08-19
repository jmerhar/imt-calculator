// Build the sitemap XML from the route set, including the localized guide URLs and their hreflang
// alternates. Pure module used by vite.config.ts (ssgOptions.onFinished) at build time; keeping it
// here means the guide registry is the single source of truth for both the pages and the sitemap.

import { SITE_URL } from "../config";
import { pageSlug } from "../i18n/pages";
import { GUIDE_META, GUIDES_SEGMENT } from "../content/guides/registry";

// Core pages emitted in both languages (EN at root, PT under /pt with localized slugs), each with
// the date its content last changed.
//
// These dates are declared rather than taken from the build clock: stamping every URL with the
// deploy date re-announces eighteen unchanged pages on every push, and a <lastmod> that always says
// "today" carries no information, so search engines learn to disregard it — and with it the signal
// that a page genuinely is worth recrawling. Bump a page's date when its copy, or the data it
// presents, actually changes. Guides carry their own `updated` in the registry.
const CORE_PAGES: { key: string; lastmod: string }[] = [
  { key: "/", lastmod: "2026-08-02" },
  { key: "/glossary", lastmod: "2026-08-01" },
  { key: "/how-it-works", lastmod: "2026-08-01" },
];
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
  lastmod: string;
}

/**
 * The guides index changes whenever any guide it lists does, so it inherits the newest guide date
 * rather than declaring one of its own that could silently fall behind.
 */
function guidesIndexLastmod(): string {
  return GUIDE_META.reduce((newest, m) => (m.updated > newest ? m.updated : newest), "");
}

/** Every URL in the site with its EN/PT hreflang pair (x-default = EN) and its last-changed date. */
function rows(): Row[] {
  const out: Row[] = [];
  for (const { key, lastmod } of CORE_PAGES) {
    const en = bareEn(key);
    const pt = barePt(key);
    out.push({ loc: en, en, pt, lastmod }, { loc: pt, en, pt, lastmod });
  }
  const indexLastmod = guidesIndexLastmod();
  out.push(
    { loc: indexEn, en: indexEn, pt: indexPt, lastmod: indexLastmod },
    { loc: indexPt, en: indexEn, pt: indexPt, lastmod: indexLastmod },
  );
  for (const m of GUIDE_META) {
    const en = articleEn(m.slug.en);
    const pt = articlePt(m.slug.pt);
    out.push({ loc: en, en, pt, lastmod: m.updated }, { loc: pt, en, pt, lastmod: m.updated });
  }
  return out;
}

/** The sitemap XML string, each URL carrying the date its own content last changed. */
export function buildSitemap(): string {
  const entries = rows()
    .map(
      (r) => `  <url>
    <loc>${r.loc}</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${r.en}" />
    <xhtml:link rel="alternate" hreflang="pt" href="${r.pt}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${r.en}" />
    <lastmod>${r.lastmod}</lastmod>
  </url>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries}
</urlset>
`;
}
