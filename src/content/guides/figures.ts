import type { Lang } from "@/i18n/lang";
// Relative value imports: this resolver is reached from vite.config.ts (via seo/guides) at build
// time, where esbuild does not apply the "@" alias. fmt lives in the DOM-free lang module.
import { fmt } from "../../i18n/lang";
import { LATEST_YEAR } from "../../engine/tables";
import { FIGURES } from "./computed";

/**
 * Token map for a language: the precomputed worked-example figures (from computed.ts) plus the
 * display year. Guide/glossary/how-it-works prose interpolates these with {token} placeholders so
 * every annual-data figure and year label tracks the latest registered tables automatically.
 */
export function contentVars(lang: Lang): Record<string, string> {
  return { ...FIGURES[lang], year: String(LATEST_YEAR) };
}

/** Resolve {token} placeholders in a content string against the figures + year for `lang`. */
export function resolveText(str: string, lang: Lang): string {
  return fmt(str, contentVars(lang));
}
