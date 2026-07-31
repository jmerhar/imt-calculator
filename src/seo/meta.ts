// Per-route SEO metadata injected into the prerendered HTML at build time (see vite.config.ts
// onPageRendered). Keyed by route path (no trailing slash); English at the root, Portuguese under
// /pt. Titles mirror the client-side per-route titles (Analytics.tsx) for consistency.

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
  "/pt": {
    title: "Calculadora de IMT · Portugal · 2026",
    description:
      "Calculadora gratuita do IMT (imposto municipal sobre transmissões) e do imposto do selo em Portugal para 2026 — inclui a taxa de 7,5% para não residentes, o IMT Jovem, vários compradores e as tabelas dos Açores e da Madeira. Funciona no seu navegador.",
  },
  "/pt/glossary": {
    title: "Glossário · Calculadora de IMT",
    description:
      "Glossário de termos fiscais imobiliários em Portugal: IMT, VPT, imposto do selo, IMT Jovem, residência habitual e as regras para não residentes do Decreto-Lei n.º 97/2026.",
  },
  "/pt/how-it-works": {
    title: "Como funciona · Calculadora de IMT",
    description:
      "Como a calculadora apura o IMT e o imposto do selo em Portugal para 2026: os escalões progressivos, a regra da totalidade na compropriedade, a taxa de 7,5% para não residentes, o imposto do selo do crédito e as fontes oficiais (CIMT/TGIS).",
  },
};
