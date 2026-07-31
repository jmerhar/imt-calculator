import type { Lang } from "@/i18n";

// URL scheme: English at the root (`/`, `/glossary`), Portuguese under `/pt` (`/pt`, `/pt/glossary`).
// These helpers translate between a language-neutral "bare" path and the language-prefixed one.

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
