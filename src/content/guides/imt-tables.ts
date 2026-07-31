import type { Lang } from "@/i18n/lang";
import type { GuideBody } from "./registry";

// Guide: IMT tables 2026. Bilingual. The { table } blocks render the live 2026 brackets from the
// engine (src/engine/tables/2026.ts), so the figures shown here always match the calculator.

export const imtTables: Record<Lang, GuideBody> = {
  en: {
    intro:
      "IMT is charged on progressive bands that depend on the property's location, its use, and whether the buyer qualifies for IMT Jovem. These are the 2026 tables for mainland Portugal, the Azores and Madeira, and how the applicable one is chosen.",
    sections: [
      {
        heading: "How IMT is calculated",
        blocks: [
          {
            p: "For a given value the IMT is: value × the band's marginal rate − a fixed deduction (the parcela a abater) that keeps the bands continuous. Above a high threshold the progressive bands give way to a single flat rate on the whole value. The tax base is the higher of the purchase price and the VPT (rateable value).",
          },
        ],
      },
      {
        heading: "Mainland tables (2026)",
        blocks: [
          { p: "Table I — own permanent home (habitação própria e permanente):" },
          { table: "I" },
          { p: "Table II — own permanent home under IMT Jovem (first home, buyer aged 35 or under): fully exempt up to €330,539, then 8% on the excess." },
          { table: "II" },
          { p: "Table III — other housing (secondary homes and rentals):" },
          { table: "III" },
        ],
      },
      {
        heading: "Azores & Madeira: the ×1.25 tables",
        blocks: [
          {
            p: "The autonomous-region thresholds are the mainland ones increased by 25% (Lei n.º 21/90), so the same rates reach further up the price scale.",
          },
          { p: "Table IV — own permanent home:" },
          { table: "IV" },
          { p: "Table V — own permanent home under IMT Jovem (exempt up to €413,174):" },
          { table: "V" },
          { p: "Table VI — other housing:" },
          { table: "VI" },
        ],
      },
      {
        heading: "Which table applies",
        blocks: [
          {
            p: "The calculator picks the table automatically: an own permanent home uses Table I (or IV in the regions); the same home under IMT Jovem uses Table II (or V); any other housing uses Table III (or VI). A non-resident pays a flat 7.5% instead of these tables, and a blacklisted-tax-haven entity a flat 10%.",
          },
        ],
      },
      {
        heading: "Stamp duty",
        blocks: [
          {
            p: "On top of IMT, acquisition stamp duty is 0.8% of the tax base (TGIS verba 1.1) — itself exempt up to the IMT Jovem ceiling for a qualifying first home. A mortgage adds stamp duty on the loan under verba 17.1: 0.6% for terms of 5 years or more, 0.5% for 1–5 years, and 0.04% per month below a year.",
          },
        ],
      },
    ],
    faq: [
      {
        q: "Why do the Azores and Madeira tables have higher thresholds?",
        a: "The autonomous-region tables are the mainland thresholds increased by 25% under Lei n.º 21/90, so each rate band starts and ends at a higher value.",
      },
      {
        q: "What is the parcela a abater (deduction)?",
        a: "It is a fixed amount subtracted after applying a band's marginal rate, so that the tax is continuous across band boundaries. The calculator applies it automatically; the flat top bands carry a deduction of zero.",
      },
      {
        q: "Are these the 2026 figures?",
        a: "Yes. The tables are for the 2026 tax year, from CIMT art. 17.º and the AT practical tables (Ofício Circulado n.º 40129/2026), and they are the exact figures the calculator uses.",
      },
    ],
    cta: "Calculate with the 2026 tables",
  },
  pt: {
    intro:
      "O IMT é cobrado por escalões progressivos que dependem da localização do imóvel, da sua finalidade e de o comprador ter ou não direito ao IMT Jovem. Estas são as tabelas de 2026 para o continente, os Açores e a Madeira, e como se escolhe a tabela aplicável.",
    sections: [
      {
        heading: "Como se calcula o IMT",
        blocks: [
          {
            p: "Para um dado valor, o IMT é: valor × taxa marginal do escalão − uma parcela fixa a abater que torna os escalões contínuos. Acima de um limite elevado, os escalões progressivos dão lugar a uma taxa única sobre todo o valor. A base tributável é o maior valor entre o preço de compra e o VPT (valor patrimonial tributário).",
          },
        ],
      },
      {
        heading: "Tabelas do continente (2026)",
        blocks: [
          { p: "Tabela I — habitação própria e permanente:" },
          { table: "I" },
          { p: "Tabela II — habitação própria e permanente ao abrigo do IMT Jovem (primeira habitação, comprador até 35 anos): isenção total até €330 539 e depois 8% sobre o excedente." },
          { table: "II" },
          { p: "Tabela III — outra habitação (habitação secundária e arrendamento):" },
          { table: "III" },
        ],
      },
      {
        heading: "Açores e Madeira: as tabelas ×1,25",
        blocks: [
          {
            p: "Os escalões das regiões autónomas são os do continente acrescidos de 25% (Lei n.º 21/90), pelo que as mesmas taxas se estendem a valores mais altos.",
          },
          { p: "Tabela IV — habitação própria e permanente:" },
          { table: "IV" },
          { p: "Tabela V — habitação própria e permanente ao abrigo do IMT Jovem (isenção até €413 174):" },
          { table: "V" },
          { p: "Tabela VI — outra habitação:" },
          { table: "VI" },
        ],
      },
      {
        heading: "Que tabela se aplica",
        blocks: [
          {
            p: "A calculadora escolhe a tabela automaticamente: a habitação própria e permanente usa a Tabela I (ou IV nas regiões); a mesma habitação ao abrigo do IMT Jovem usa a Tabela II (ou V); qualquer outra habitação usa a Tabela III (ou VI). Um não residente paga uma taxa única de 7,5% em vez destas tabelas, e uma entidade de paraíso fiscal uma taxa única de 10%.",
          },
        ],
      },
      {
        heading: "Imposto do selo",
        blocks: [
          {
            p: "Além do IMT, o imposto do selo da aquisição é 0,8% da base tributável (verba 1.1 da TGIS) — ele próprio isento até ao limite do IMT Jovem numa primeira habitação elegível. Um crédito acrescenta imposto do selo sobre o empréstimo ao abrigo da verba 17.1: 0,6% para prazos iguais ou superiores a 5 anos, 0,5% de 1 a 5 anos e 0,04% por mês para menos de um ano.",
          },
        ],
      },
    ],
    faq: [
      {
        q: "Porque é que as tabelas dos Açores e da Madeira têm limites mais altos?",
        a: "As tabelas das regiões autónomas são os escalões do continente acrescidos de 25% ao abrigo da Lei n.º 21/90, pelo que cada escalão de taxa começa e termina num valor mais alto.",
      },
      {
        q: "O que é a parcela a abater?",
        a: "É um montante fixo subtraído após aplicar a taxa marginal do escalão, para que o imposto seja contínuo nas fronteiras dos escalões. A calculadora aplica-a automaticamente; os escalões de taxa única têm parcela a abater igual a zero.",
      },
      {
        q: "Estes são os valores de 2026?",
        a: "Sim. As tabelas referem-se ao ano fiscal de 2026, do art. 17.º do CIMT e das tabelas práticas da AT (Ofício Circulado n.º 40129/2026), e são exatamente os valores que a calculadora usa.",
      },
    ],
    cta: "Calcular com as tabelas de 2026",
  },
};
