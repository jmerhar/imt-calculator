import type { Lang } from "@/i18n";

// URL scheme: English at the root (`/`, `/glossary`), Portuguese under `/pt` (`/pt`, `/pt/glossary`).
// These helpers translate between a language-neutral "bare" path and the language-prefixed one.

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

/** The current path expressed in another language, preserving the page. */
export function switchLangPath(pathname: string, target: Lang): string {
  return localizedPath(target, barePath(pathname));
}
