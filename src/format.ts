import type { Lang } from "@/i18n";

// Locale-aware money and percent formatting. Portuguese uses "400 000,00 €"; English uses the
// euro-native Irish English form "€400,000.00".
const locale = (lang: Lang) => (lang === "pt" ? "pt-PT" : "en-IE");

/** Format an amount as euros in the language's locale (e.g. "€400,000.00" / "400 000,00 €"). */
export function formatEuro(value: number, lang: Lang): string {
  return new Intl.NumberFormat(locale(lang), {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(value);
}

/** Format a 0..1 fraction as a percentage in the language's locale (e.g. "7.50%" / "7,50 %"). */
export function formatPercent(fraction: number, lang: Lang, digits = 2): string {
  return new Intl.NumberFormat(locale(lang), {
    style: "percent",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(fraction);
}
