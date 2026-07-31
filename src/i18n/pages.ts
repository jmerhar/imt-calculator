import type { Lang } from "@/i18n/lang";

// Core content pages: the canonical (English, language-neutral) key ↔ the URL slug per language.
// Localized slugs improve Portuguese SEO, while the canonical key stays the English form used
// throughout the app (nav, analytics, the load-time redirect). Home ("/") has no slug. Guides have
// their own registry (content/guides/registry.ts); these are the fixed top-level pages.
//
// Kept DOM-free so build-time helpers (SEO injection, sitemap) can import it too.
export const PAGE_SLUGS: Record<string, Record<Lang, string>> = {
  "/glossary": { en: "glossary", pt: "glossario" },
  "/how-it-works": { en: "how-it-works", pt: "como-funciona" },
};

/** The URL slug for a canonical key in a language ("glossary" / "glossario"); "" for the home page. */
export function pageSlug(lang: Lang, key: string): string {
  if (key === "/") return "";
  return PAGE_SLUGS[key]?.[lang] ?? key.replace(/^\/+/, "");
}

/** Reverse: the canonical key for a language + first path segment ("glossario" → "/glossary"). */
export function canonicalKey(lang: Lang, slug: string): string {
  if (!slug) return "/";
  for (const key in PAGE_SLUGS) if (PAGE_SLUGS[key][lang] === slug) return key;
  return `/${slug}`;
}
