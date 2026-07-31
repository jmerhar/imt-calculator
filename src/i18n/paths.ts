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

/** Strip the language prefix: "/pt/glossary" → "/glossary", "/pt" → "/", "/glossary" → "/glossary". */
export function barePath(pathname: string): string {
  const stripped = pathname.replace(/^\/pt(?=\/|$)/, "");
  return stripped === "" ? "/" : stripped;
}

/** Add the language prefix to a bare path: ("pt","/glossary") → "/pt/glossary"; ("en",…) → unchanged. */
export function localizedPath(lang: Lang, bare: string): string {
  if (lang === "en") return bare;
  return bare === "/" ? "/pt" : `/pt${bare}`;
}

/** The current path expressed in another language, preserving the page. */
export function switchLangPath(pathname: string, target: Lang): string {
  return localizedPath(target, barePath(pathname));
}
