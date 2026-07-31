import type { Lang } from "@/i18n";

// Locale-aware money and percent formatting. Portuguese uses "400 000,00 €"; English uses the
// euro-native Irish English form "€400,000.00".
const locale = (lang: Lang) => (lang === "pt" ? "pt-PT" : "en-IE");

// Intl emits a space before the € and as the thousands separator whose exact character is ICU-
// version-dependent: U+00A0 (regular no-break space) on some builds, U+202F (narrow no-break space)
// on others. Node and the browser can differ, which would mismatch every number baked into the
// prerendered HTML on hydration. Canonicalize to U+00A0 so server and client always agree.
const nbsp = (s: string) => s.replace(/[\u202f\u00a0]/g, "\u00a0");

/** Format an amount as euros in the language's locale (e.g. "€400,000.00" / "400 000,00 €"). */
export function formatEuro(value: number, lang: Lang): string {
  return nbsp(
    new Intl.NumberFormat(locale(lang), {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 2,
    }).format(value),
  );
}

/** Format a plain number in the language's locale, no currency symbol (e.g. "330,539" / "330 539"). */
export function formatAmount(value: number, lang: Lang, digits = 2): string {
  return nbsp(new Intl.NumberFormat(locale(lang), { maximumFractionDigits: digits }).format(value));
}

/** Format a 0..1 fraction as a percentage in the language's locale (e.g. "7.50%" / "7,50 %"). */
export function formatPercent(fraction: number, lang: Lang, digits = 2): string {
  return nbsp(
    new Intl.NumberFormat(locale(lang), {
      style: "percent",
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(fraction),
  );
}
