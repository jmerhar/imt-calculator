// Per-route SEO metadata injected into the prerendered HTML at build time (see vite.config.ts
// onPageRendered). English only — the prerender runs in the default language; Phase 3 adds
// per-language URLs (/pt/…) with localized metadata. Keyed by route path (no trailing slash).

export interface PageSeo {
  title: string;
  description: string;
}

export const SEO_PAGES: Record<string, PageSeo> = {
  "/": {
    title: "IMT Calculator · Portugal · 2026",
    description:
      "Free calculator for Portugal's property-transfer tax (IMT) and stamp duty in 2026 — including the non-resident 7.5% rate, IMT Jovem relief, multiple buyers, and the Açores/Madeira tables. Runs in your browser.",
  },
  "/glossary": {
    title: "Glossary · IMT Calculator",
    description:
      "Plain-language glossary of Portuguese property-tax terms: IMT, VPT, stamp duty, IMT Jovem, habitual residence, and the non-resident rules under Decreto-Lei n.º 97/2026.",
  },
  "/how-it-works": {
    title: "How it works · IMT Calculator",
    description:
      "How the calculator computes Portuguese IMT and stamp duty for 2026: the progressive brackets, the co-ownership totality rule, the non-resident 7.5% rate, mortgage stamp duty, and the official CIMT/TGIS sources.",
  },
};
