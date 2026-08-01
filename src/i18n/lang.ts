// The set of supported UI languages. Kept in its own DOM-free module so build-time helpers (the SEO
// injectors, the sitemap, the guide registry) can import the type without pulling in the React i18n
// entry (which references `document`). Re-exported from "@/i18n" for the app's normal imports.
export type Lang = "en" | "pt";

/** Substitute `{name}` placeholders, e.g. fmt("Rates for {year}.", { year: 2026 }). */
export function fmt(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}
