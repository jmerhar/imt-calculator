// Build-time JSON-LD structured data injected into the prerendered HTML (see vite.config.ts).
// Localized per language. Pure module (no browser/React), so the config can import it.

import { SITE_URL } from "../config";
// Relative import: this module is bundled into vite.config.ts (esbuild, no "@" alias) at build time.
import { LATEST_YEAR } from "../engine/tables";

type Lang = "en" | "pt";

const NAME: Record<Lang, string> = { en: "IMT Calculator", pt: "Calculadora de IMT" };
// The ruleset year tracks the latest registered tables; the FAQ dates below are legislative history
// (Decreto-Lei n.º 97/2026) and stay literal.
const APP_DESC: Record<Lang, string> = {
  en: `Free calculator for Portugal's property-transfer tax (IMT) and stamp duty (${LATEST_YEAR} rules).`,
  pt: `Calculadora gratuita do IMT e do imposto do selo em Portugal (regras de ${LATEST_YEAR}).`,
};
const PAGE_NAME: Record<Lang, { glossary: string; howItWorks: string }> = {
  en: { glossary: "Glossary", howItWorks: "How it works" },
  pt: { glossary: "Glossário", howItWorks: "Como funciona" },
};

// FAQ content mirrors the how-it-works page; drives FAQ rich results.
const FAQ: Record<Lang, { q: string; a: string }[]> = {
  en: [
    {
      q: "Does the purchase date change IMT for non-residents in 2026?",
      a: "No. The 7.5% flat rate for non-residents has applied since the fifth day after Decreto-Lei n.º 97/2026 was published (around 25 May 2026). It is not tied to 1 September 2026, which only starts the CIA and RSAA rental regimes.",
    },
    {
      q: "How is IMT split between co-owners?",
      a: "Under CIMT article 17.º(6)(a), the rate for the whole property value is applied to each owner's share, so splitting a purchase between several buyers gives no band-splitting advantage.",
    },
    {
      q: "What IMT rate do non-residents pay?",
      a: "A flat 7.5% (CIMT article 17.º(10)). Former residents keep the ordinary progressive rates; buyers who become resident within two years, or let at accessible rent, pay 7.5% now and can reclaim the difference.",
    },
  ],
  pt: [
    {
      q: "A data da compra altera o IMT para não residentes em 2026?",
      a: "Não. A taxa única de 7,5% para não residentes aplica-se desde o quinto dia após a publicação do Decreto-Lei n.º 97/2026 (por volta de 25 de maio de 2026). Não está ligada a 1 de setembro de 2026, data que apenas inicia os regimes de arrendamento CIA e RSAA.",
    },
    {
      q: "Como se reparte o IMT entre comproprietários?",
      a: "Nos termos do artigo 17.º, n.º 6, alínea a) do CIMT, aplica-se a cada quota-parte a taxa correspondente à totalidade do valor do imóvel, pelo que dividir a compra por vários compradores não traz vantagem de escalões.",
    },
    {
      q: "Que taxa de IMT pagam os não residentes?",
      a: "Uma taxa única de 7,5% (artigo 17.º, n.º 10 do CIMT). Antigos residentes mantêm as taxas progressivas normais; quem passe a residente em dois anos, ou arrende em renda acessível, paga 7,5% agora e pode reembolsar a diferença.",
    },
  ],
};

// A stable @id lets WebSite.publisher reference the single Organization entity across pages/languages.
const ORG_ID = `${SITE_URL}/#organization`;

const organization = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": ORG_ID,
  name: "IMT Calculator",
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/icon-512.png`,
});

const webSite = (lang: Lang, homeUrl: string) => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: NAME[lang],
  url: homeUrl,
  inLanguage: lang,
  publisher: { "@id": ORG_ID },
});

const webApplication = (lang: Lang, url: string) => ({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: NAME[lang],
  url,
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web",
  inLanguage: lang,
  description: APP_DESC[lang],
  offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
});

const faqPage = (lang: Lang) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  inLanguage: lang,
  mainEntity: FAQ[lang].map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
});

const breadcrumb = (lang: Lang, name: string, url: string, homeUrl: string) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: NAME[lang], item: homeUrl },
    { "@type": "ListItem", position: 2, name, item: url },
  ],
});

/** The JSON-LD <script> tags for a route (by language and bare path) as an HTML string. */
export function jsonLdFor(lang: Lang, bare: string, url: string): string {
  const homeUrl = lang === "en" ? `${SITE_URL}/` : `${SITE_URL}/pt/`;
  const blocks: object[] = [];
  if (bare === "/") blocks.push(organization(), webSite(lang, homeUrl), webApplication(lang, url));
  else if (bare === "/how-it-works") {
    blocks.push(faqPage(lang), breadcrumb(lang, PAGE_NAME[lang].howItWorks, url, homeUrl));
  } else if (bare === "/glossary") {
    blocks.push(breadcrumb(lang, PAGE_NAME[lang].glossary, url, homeUrl));
  }
  return blocks
    .map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`)
    .join("");
}
