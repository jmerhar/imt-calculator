// This module intentionally co-locates the provider component with its hook and helpers, which
// is the conventional shape for a React context module; fast-refresh's component-only rule does
// not apply usefully here.
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useEffect } from "react";
import type { ReactNode } from "react";
import { en } from "@/i18n/en";
import { pt } from "@/i18n/pt";
import type { Lang } from "@/i18n/lang";

export type { Lang };

// The dictionary shape: every leaf of the English dictionary widened to `string`. `pt` is typed
// as `Dict`, so a missing or misspelled key fails type-checking (the parity test double-checks it).
type Widen<T> = { [K in keyof T]: T[K] extends string ? string : Widen<T[K]> };
export type Dict = Widen<typeof en>;

export const dictionaries: Record<Lang, Dict> = { en, pt };

/** Substitute `{name}` placeholders, e.g. fmt("Rates for {year}.", { year: 2026 }). */
export function fmt(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}

interface I18nValue {
  lang: Lang;
  t: Dict;
}

const I18nContext = createContext<I18nValue | null>(null);

/**
 * Provides the active language and its dictionary. The language is driven by the route (EN at `/`,
 * PT at `/pt/…`) and passed in, so the prerendered HTML for each language URL is deterministic and
 * hydrates without a flash. Switching language is a navigation (see Layout), not local state.
 */
export function I18nProvider({ lang = "en", children }: { lang?: Lang; children: ReactNode }) {
  // Keep <html lang> in sync for assistive tech and hyphenation.
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo<I18nValue>(() => ({ lang, t: dictionaries[lang] }), [lang]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/** Access the current language and its dictionary (`t`). Throws outside I18nProvider. */
export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within <I18nProvider>");
  return ctx;
}
