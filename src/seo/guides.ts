// Build-time SEO for the guide routes (index + articles), injected into the prerendered HTML by
// vite.config.ts. Because guide slugs and the section segment are localized, canonical/hreflang
// pairing is resolved through the registry here rather than by prefixing. Pure module (no
// browser/React), so the config can import it.

import { SITE_URL } from "../config";
import { GUIDES_SEGMENT, GUIDE_META, GUIDES_INDEX_SEO } from "../content/guides/registry";
import type { GuideMeta } from "../content/guides/registry";
import { GUIDE_BODIES } from "../content/guides";
import { resolveText } from "../content/guides/figures";

type Lang = "en" | "pt";

const BRAND: Record<Lang, string> = { en: "IMT Calculator", pt: "Calculadora de IMT" };
const GUIDES_NAME: Record<Lang, string> = { en: "Guides", pt: "Guias" };

const homeUrl = (lang: Lang) => `${SITE_URL}/${lang === "pt" ? "pt/" : ""}`;
const indexUrl = (lang: Lang) => `${SITE_URL}/${lang === "pt" ? `pt/${GUIDES_SEGMENT.pt}` : GUIDES_SEGMENT.en}/`;
const articleUrl = (lang: Lang, m: GuideMeta) =>
  `${SITE_URL}/${lang === "pt" ? `pt/${GUIDES_SEGMENT.pt}` : GUIDES_SEGMENT.en}/${m.slug[lang]}/`;

const script = (o: object) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`;

const breadcrumb = (lang: Lang, tail: { name: string; item: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [{ name: BRAND[lang], item: homeUrl(lang) }, ...tail].map((x, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: x.name,
    item: x.item,
  })),
});

const faqPage = (lang: Lang, faq: { q: string; a: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  inLanguage: lang,
  mainEntity: faq.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
});

function indexJsonLd(lang: Lang): string {
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: GUIDE_META.map((m, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: m.navLabel[lang],
      url: articleUrl(lang, m),
    })),
  };
  const crumbs = breadcrumb(lang, [{ name: GUIDES_NAME[lang], item: indexUrl(lang) }]);
  return script(itemList) + script(crumbs);
}

function articleJsonLd(lang: Lang, m: GuideMeta, url: string): string {
  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: m.title[lang],
    description: m.description[lang],
    inLanguage: lang,
    image: [`${SITE_URL}/og-${lang}.png`],
    // Full ISO 8601 with a time zone — a bare date reads as an "invalid datetime" to Google.
    datePublished: `${m.published}T00:00:00Z`,
    dateModified: `${m.updated}T00:00:00Z`,
    mainEntityOfPage: url,
    author: { "@type": "Organization", name: BRAND.en, url: `${SITE_URL}/` },
    // A full Organization (with logo) rather than an @id ref: the Organization node only lives on
    // the home page, so on an article the reference wouldn't resolve to a name/logo for the
    // Article rich result.
    publisher: {
      "@type": "Organization",
      name: BRAND.en,
      url: `${SITE_URL}/`,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/icon-512.png` },
    },
  };
  const crumbs = breadcrumb(lang, [
    { name: GUIDES_NAME[lang], item: indexUrl(lang) },
    { name: m.navLabel[lang], item: url },
  ]);
  const body = GUIDE_BODIES[m.id][lang];
  // Resolve {token} figures/year in the FAQ so the FAQPage JSON-LD carries real numbers, not tokens.
  const faq = body.faq?.length
    ? script(faqPage(lang, body.faq.map((f) => ({ q: resolveText(f.q, lang), a: resolveText(f.a, lang) }))))
    : "";
  return script(article) + script(crumbs) + faq;
}

export interface GuidePageSeo {
  lang: Lang;
  canonical: string;
  altEn: string;
  altPt: string;
  title: string;
  description: string;
  jsonLd: string;
}

/**
 * SEO for a guide route key ("/guides", "/guides/<slug>", "/pt/guias", "/pt/guias/<slug>"), or null
 * if the key is not a guide route. Provides canonical + EN/PT alternates (localized), title,
 * description and JSON-LD.
 */
export function guideSeoForKey(key: string): GuidePageSeo | null {
  const en = key.match(new RegExp(`^/${GUIDES_SEGMENT.en}(?:/([^/]+))?$`));
  const pt = key.match(new RegExp(`^/pt/${GUIDES_SEGMENT.pt}(?:/([^/]+))?$`));
  const lang: Lang | null = en ? "en" : pt ? "pt" : null;
  if (!lang) return null;
  const slug = (en ?? pt)![1];

  if (!slug) {
    return {
      lang,
      canonical: indexUrl(lang),
      altEn: indexUrl("en"),
      altPt: indexUrl("pt"),
      title: GUIDES_INDEX_SEO[lang].title,
      description: GUIDES_INDEX_SEO[lang].description,
      jsonLd: indexJsonLd(lang),
    };
  }
  const m = GUIDE_META.find((x) => x.slug[lang] === slug);
  if (!m) return null;
  return {
    lang,
    canonical: articleUrl(lang, m),
    altEn: articleUrl("en", m),
    altPt: articleUrl("pt", m),
    title: m.title[lang],
    description: m.description[lang],
    jsonLd: articleJsonLd(lang, m, articleUrl(lang, m)),
  };
}
