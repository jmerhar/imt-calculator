// Guide registry — the light metadata for each guide article (id, localized slug, SEO title +
// description, dates, and a short nav label). Kept free of article prose so it can be imported into
// the main bundle (path helpers, analytics, nav) without shipping the article bodies; the heavy
// bilingual content lives in the per-guide modules aggregated by ./index.ts.
//
// URL scheme: guides live under a localized section segment — English at /guides/<en-slug>,
// Portuguese at /pt/guias/<pt-slug>. Slugs are localized (better PT SEO), so the EN↔PT pairing for
// hreflang/canonical/language-toggle is resolved through this registry, not by string manipulation.

import type { Lang } from "@/i18n/lang";
import type { TableId } from "@/engine/types";

/** The section path segment per language: /guides/… (EN) and /pt/guias/… (PT). */
export const GUIDES_SEGMENT: Record<Lang, string> = { en: "guides", pt: "guias" };

/** A block of guide body content: a paragraph, a bullet list, or a rendered IMT rate table. */
export type Block = { p: string } | { ul: string[] } | { table: TableId };

export interface GuideSection {
  heading: string;
  blocks: Block[];
}

/** One guide's body in a single language. Prose only; metadata lives in GuideMeta. */
export interface GuideBody {
  intro: string;
  sections: GuideSection[];
  faq?: { q: string; a: string }[];
  /** Call-to-action label linking into the calculator. */
  cta: string;
}

export interface GuideMeta {
  id: string;
  slug: Record<Lang, string>;
  /** SEO <title> — also the browser-tab / analytics title, so the two never diverge. */
  title: Record<Lang, string>;
  description: Record<Lang, string>;
  /** Short label for the guides index card, nav, and breadcrumbs. */
  navLabel: Record<Lang, string>;
  /** ISO dates for Article JSON-LD (datePublished / dateModified). */
  published: string;
  updated: string;
}

export const GUIDE_META: GuideMeta[] = [
  {
    id: "imt-non-residents",
    slug: { en: "imt-non-residents-2026", pt: "imt-nao-residentes-2026" },
    title: {
      en: "IMT for Non-Residents in Portugal (2026)",
      pt: "IMT para não residentes em 2026: a taxa de 7,5%",
    },
    description: {
      en: "How Portugal's 7.5% flat IMT rate for non-residents works in 2026 under Decreto-Lei n.º 97/2026 — the exceptions, the cases where the extra tax is reclaimable, and a worked example.",
      pt: "Como funciona a taxa única de 7,5% de IMT para não residentes em 2026 (Decreto-Lei n.º 97/2026) — as exceções, os casos em que o imposto é reembolsável e um exemplo prático.",
    },
    navLabel: { en: "IMT for non-residents", pt: "IMT para não residentes" },
    published: "2026-07-31",
    updated: "2026-07-31",
  },
  {
    id: "imt-jovem",
    slug: { en: "imt-jovem-2026", pt: "imt-jovem-2026" },
    title: {
      en: "IMT Jovem 2026: Who Qualifies and How Much You Save",
      pt: "IMT Jovem 2026: quem tem direito e quanto poupa",
    },
    description: {
      en: "IMT Jovem in 2026: the IMT and stamp-duty exemption on a first own permanent home bought by under-36s, the €330,539 cap, how it maps to the tax tables, and a worked example.",
      pt: "IMT Jovem em 2026: a isenção de IMT e do imposto do selo na primeira habitação própria e permanente para menores de 36 anos, o limite de €330 539, as tabelas aplicáveis e um exemplo.",
    },
    navLabel: { en: "IMT Jovem", pt: "IMT Jovem" },
    published: "2026-07-31",
    updated: "2026-07-31",
  },
  {
    id: "imt-imi-stamp-duty",
    slug: { en: "imt-imi-stamp-duty", pt: "imt-imi-imposto-do-selo" },
    title: {
      en: "IMT vs IMI vs Stamp Duty in Portugal (2026)",
      pt: "IMT, IMI e imposto do selo: qual é a diferença?",
    },
    description: {
      en: "The three Portuguese property taxes people confuse: IMT and stamp duty (one-off, on the purchase) versus IMI (the annual municipal property tax). What each is, when you pay, and how they are calculated.",
      pt: "Os três impostos imobiliários que se confundem em Portugal: o IMT e o imposto do selo (únicos, na compra) e o IMI (imposto municipal anual). O que é cada um, quando se paga e como se calcula.",
    },
    navLabel: { en: "IMT vs IMI vs stamp duty", pt: "IMT, IMI e imposto do selo" },
    published: "2026-07-31",
    updated: "2026-07-31",
  },
  {
    id: "imt-regions",
    slug: { en: "imt-azores-madeira", pt: "imt-acores-madeira" },
    title: {
      en: "Buying in the Azores or Madeira: the IMT ×1.25 Tables (2026)",
      pt: "Comprar nos Açores ou na Madeira: as tabelas de IMT ×1,25",
    },
    description: {
      en: "How IMT works in Portugal's autonomous regions in 2026: the regional tables are the mainland brackets increased by 25% (Lei n.º 21/90), so the same rates reach higher values. Worked example and IMT Jovem.",
      pt: "Como funciona o IMT nas regiões autónomas em 2026: as tabelas regionais são os escalões do continente acrescidos de 25% (Lei n.º 21/90), pelo que as mesmas taxas se estendem a valores mais altos. Exemplo prático e IMT Jovem.",
    },
    navLabel: { en: "Azores & Madeira (×1.25)", pt: "Açores e Madeira (×1,25)" },
    published: "2026-07-31",
    updated: "2026-07-31",
  },
  {
    id: "imt-tables",
    slug: { en: "imt-tables-2026", pt: "tabelas-imt-2026" },
    title: {
      en: "IMT Tables 2026: Brackets and Rates (All Regions)",
      pt: "Tabelas de IMT 2026: escalões e taxas",
    },
    description: {
      en: "The 2026 IMT tables for mainland Portugal, the Azores and Madeira — the progressive brackets, marginal rates and deductions, how the right table is chosen, and stamp duty.",
      pt: "As tabelas de IMT de 2026 para o continente, Açores e Madeira — os escalões progressivos, as taxas marginais e as parcelas a abater, a tabela aplicável e o imposto do selo.",
    },
    navLabel: { en: "IMT tables 2026", pt: "Tabelas de IMT 2026" },
    published: "2026-07-31",
    updated: "2026-07-31",
  },
];

/** SEO for the guides index page (/guides, /pt/guias). */
export const GUIDES_INDEX_SEO: Record<Lang, { title: string; description: string }> = {
  en: {
    title: "Guides · IMT Calculator",
    description:
      "Guides to Portugal's property-transfer tax (IMT) and stamp duty in 2026: non-residents, IMT Jovem, and the full 2026 rate tables.",
  },
  pt: {
    title: "Guias · Calculadora de IMT",
    description:
      "Guias sobre o IMT e o imposto do selo em Portugal em 2026: não residentes, IMT Jovem e as tabelas de taxas de 2026.",
  },
};

export const guideById = (id: string): GuideMeta | undefined => GUIDE_META.find((g) => g.id === id);
export const guideBySlug = (lang: Lang, slug: string): GuideMeta | undefined =>
  GUIDE_META.find((g) => g.slug[lang] === slug);
