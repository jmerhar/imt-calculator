import type { Lang } from "@/i18n";
import { PAGE_SLUGS, pageSlug, canonicalKey } from "@/i18n/pages";
import { GUIDES_SEGMENT, GUIDE_META } from "@/content/guides/registry";

// URL scheme: English at the root (`/`, `/glossary`), Portuguese under `/pt` with localized slugs
// (`/pt/glossario`, `/pt/como-funciona`). A language-neutral "bare" key (the English form, e.g.
// "/glossary") identifies a page across languages; these helpers translate between it and the
// localized URL via the page-slug registry (src/i18n/pages.ts). Guides do the same through their own
// registry (localized section segment + slug) — see the guide helpers at the end of this file.

/** localStorage key for an explicit language choice (set when the user toggles). */
export const LANG_STORAGE_KEY = "imt-lang";

/**
 * localStorage key recording that the visitor closed the language-suggestion banner. Separate from
 * LANG_STORAGE_KEY because closing the banner is a refusal of the suggestion, not a choice of the
 * language being offered: it must silence the banner without claiming the current language was
 * picked deliberately.
 */
export const LANG_SUGGEST_DISMISSED_KEY = "imt-lang-suggest-dismissed";

/**
 * The visitor's preferred language: an explicit saved choice wins, otherwise the browser's
 * Accept-Language. Drives the language-suggestion banner. Client-only (guards for SSR).
 */
export function preferredLang(): Lang {
  if (typeof localStorage !== "undefined") {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    if (saved === "en" || saved === "pt") return saved;
  }
  if (typeof navigator !== "undefined" && navigator.language?.toLowerCase().startsWith("pt")) {
    return "pt";
  }
  return "en";
}

/**
 * The canonical, language-neutral page key for a pathname: drops the `/pt` prefix and maps the
 * localized slug back to its English form. "/pt/glossario/" → "/glossary", "/glossary/" →
 * "/glossary", "/pt/" → "/", "/" → "/".
 */
export function barePath(pathname: string): string {
  const clean = pathname.replace(/\/+$/, "");
  const pt = /^\/pt(\/|$)/.test(clean);
  const rest = (pt ? clean.replace(/^\/pt/, "") : clean).replace(/^\/+/, "");
  return canonicalKey(pt ? "pt" : "en", rest.split("/")[0] ?? "");
}

/**
 * The canonical URL for a page key in a language, with the localized slug. Uses a trailing slash to
 * match what GitHub Pages serves and the `<link rel="canonical">`, so internal links point at the
 * canonical URL (no 301 hop, no slash/non-slash inconsistency): ("en","/glossary") → "/glossary/",
 * ("pt","/glossary") → "/pt/glossario/", ("en","/") → "/", ("pt","/") → "/pt/".
 */
export function localizedPath(lang: Lang, key: string): string {
  const prefix = lang === "pt" ? "/pt" : "";
  const slug = pageSlug(lang, key);
  return slug === "" ? `${prefix}/` : `${prefix}/${slug}/`;
}

/**
 * The current path expressed in another language, preserving the page (guides included).
 *
 * A path that is not a real page — the not-found route — has no twin, and falls back to the target
 * language's home rather than a translated form of itself: the cross-language links are crawlable, so
 * fabricating one would have the not-found page advertise a URL that is itself a not-found.
 */
export function switchLangPath(pathname: string, target: Lang): string {
  const guide = guideFromPath(pathname);
  if (guide) {
    return guide.kind === "article" && guide.id ? guidePath(target, guide.id) : guidesIndexPath(target);
  }
  const key = barePath(pathname);
  if (key !== "/" && !(key in PAGE_SLUGS)) return localizedPath(target, "/");
  return localizedPath(target, key);
}

// --- Guides (localized section segment + localized slug) ------------------------------------------

/** The guides index URL for a language (trailing slash): "/guides/" (EN), "/pt/guias/" (PT). */
export function guidesIndexPath(lang: Lang): string {
  return lang === "pt" ? `/pt/${GUIDES_SEGMENT.pt}/` : `/${GUIDES_SEGMENT.en}/`;
}

/** A guide article's URL for a language, by guide id (trailing slash, localized segment + slug). */
export function guidePath(lang: Lang, id: string): string {
  const g = GUIDE_META.find((x) => x.id === id);
  if (!g) return guidesIndexPath(lang);
  return lang === "pt" ? `/pt/${GUIDES_SEGMENT.pt}/${g.slug.pt}/` : `/${GUIDES_SEGMENT.en}/${g.slug.en}/`;
}

/**
 * Resolve a pathname to a guide if it is one: the guides index or a specific article. Returns the
 * detected language, whether it is the index or an article, and (for an article) the guide id — or
 * a null id if the slug is unknown. Returns null when the path is not in the guides section.
 */
export function guideFromPath(
  pathname: string,
): { lang: Lang; kind: "index" | "article"; id: string | null } | null {
  const clean = pathname.replace(/\/+$/, "");
  const en = clean.match(new RegExp(`^/${GUIDES_SEGMENT.en}(?:/([^/]+))?$`));
  const pt = clean.match(new RegExp(`^/pt/${GUIDES_SEGMENT.pt}(?:/([^/]+))?$`));
  const lang: Lang | null = en ? "en" : pt ? "pt" : null;
  if (!lang) return null;
  const slug = (en ?? pt)![1];
  if (!slug) return { lang, kind: "index", id: null };
  const g = GUIDE_META.find((x) => x.slug[lang] === slug);
  return { lang, kind: "article", id: g ? g.id : null };
}
