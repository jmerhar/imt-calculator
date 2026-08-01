// Per-route SEO metadata injected into the prerendered HTML at build time (see vite.config.ts
// onPageRendered). Keyed by the canonical (language-neutral) page key, with a variant per language;
// the localized URL/slug is resolved separately (src/i18n/pages.ts). Titles mirror the client-side
// per-route titles (Analytics.tsx) for consistency.

import type { Lang } from "@/i18n/lang";
// Relative import: this module is bundled into vite.config.ts (esbuild, no "@" alias) at build time.
import { LATEST_YEAR } from "../engine/tables";

export interface PageSeo {
  title: string;
  description: string;
}

// The tax year in titles/descriptions tracks the latest registered tables (LATEST_YEAR), never the
// calendar; law references (e.g. Decreto-Lei n.º 97/2026) are literal and must not be interpolated.
export const SEO_PAGES: Record<string, Record<Lang, PageSeo>> = {
  "/": {
    en: {
      title: `IMT Calculator · Portugal · ${LATEST_YEAR}`,
      description: `Free calculator for Portugal's property-transfer tax (IMT) and stamp duty in ${LATEST_YEAR} — including the non-resident 7.5% rate, IMT Jovem relief, multiple buyers, and the Açores/Madeira tables. Runs in your browser.`,
    },
    pt: {
      title: `Calculadora de IMT · Portugal · ${LATEST_YEAR}`,
      description: `Calculadora gratuita do IMT (imposto municipal sobre transmissões) e do imposto do selo em Portugal para ${LATEST_YEAR} — inclui a taxa de 7,5% para não residentes, o IMT Jovem, vários compradores e as tabelas dos Açores e da Madeira. Funciona no seu navegador.`,
    },
  },
  "/glossary": {
    en: {
      title: "Glossary · IMT Calculator",
      description:
        "Plain-language glossary of Portuguese property-tax terms: IMT, VPT, stamp duty, IMT Jovem, habitual residence, and the non-resident rules under Decreto-Lei n.º 97/2026.",
    },
    pt: {
      title: "Glossário · Calculadora de IMT",
      description:
        "Glossário de termos fiscais imobiliários em Portugal: IMT, VPT, imposto do selo, IMT Jovem, residência habitual e as regras para não residentes do Decreto-Lei n.º 97/2026.",
    },
  },
  "/how-it-works": {
    en: {
      title: "How it works · IMT Calculator",
      description: `How the calculator computes Portuguese IMT and stamp duty for ${LATEST_YEAR}: the progressive brackets, the co-ownership totality rule, the non-resident 7.5% rate, mortgage stamp duty, and the official CIMT/TGIS sources.`,
    },
    pt: {
      title: "Como funciona · Calculadora de IMT",
      description: `Como a calculadora apura o IMT e o imposto do selo em Portugal para ${LATEST_YEAR}: os escalões progressivos, a regra da totalidade na compropriedade, a taxa de 7,5% para não residentes, o imposto do selo do crédito e as fontes oficiais (CIMT/TGIS).`,
    },
  },
};
