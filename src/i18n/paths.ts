import type { Lang } from "@/i18n";
import { GUIDES_SEGMENT, GUIDE_META } from "@/content/guides/registry";

// URL scheme: English at the root (`/`, `/glossary`), Portuguese under `/pt` (`/pt`, `/pt/glossary`).
// These helpers translate between a language-neutral "bare" path and the language-prefixed one.
// Guides are the exception: their section segment and slug are both localized (`/guides/<en-slug>`
// vs `/pt/guias/<pt-slug>`), so the EN↔PT pairing is resolved through the guide registry, not by
// prefixing — see the guide helpers at the end of this file.

/** localStorage key for an explicit language choice (set when the user toggles). */
export const LANG_STORAGE_KEY = "imt-lang";

/**
 * The visitor's preferred language for the initial-load redirect: an explicit saved choice wins,
 * otherwise the browser's Accept-Language. Client-only (guards for SSR).
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
 * A clean, language- and slash-neutral page key. Strips the `/pt` prefix and any trailing slash:
 * "/pt/glossary/" → "/glossary", "/glossary/" → "/glossary", "/pt/" → "/", "/" → "/".
 */
export function barePath(pathname: string): string {
  const key = pathname.replace(/^\/pt(?=\/|$)/, "").replace(/\/+$/, "");
  return key === "" ? "/" : key;
}

/**
 * The canonical URL for a page key in a language. Uses a trailing slash to match what GitHub Pages
 * serves and the `<link rel="canonical">`, so internal links point at the canonical URL (no 301
 * hop, no slash/non-slash inconsistency): ("en","/glossary") → "/glossary/", ("pt","/glossary") →
 * "/pt/glossary/", ("en","/") → "/", ("pt","/") → "/pt/".
 */
export function localizedPath(lang: Lang, key: string): string {
  const prefix = lang === "pt" ? "/pt" : "";
  const clean = key === "/" ? "" : key.replace(/\/+$/, "");
  return clean === "" ? `${prefix}/` : `${prefix}${clean}/`;
}

/** The current path expressed in another language, preserving the page (guides included). */
export function switchLangPath(pathname: string, target: Lang): string {
  const guide = guideFromPath(pathname);
  if (guide) {
    return guide.kind === "article" && guide.id ? guidePath(target, guide.id) : guidesIndexPath(target);
  }
  return localizedPath(target, barePath(pathname));
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
