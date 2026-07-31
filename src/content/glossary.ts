// Bilingual glossary. The English view shows each term in both languages (English + Portuguese)
// with an English definition; the Portuguese view is Portuguese-only.

export interface GlossaryEntry {
  id: string;
  en: { term: string; def: string };
  pt: { term: string; def: string };
}

export const glossary: GlossaryEntry[] = [
  {
    id: "imt",
    en: {
      term: "IMT (Municipal Property Transfer Tax)",
      def: "A one-off municipal tax on transfers of property for value, paid by the buyer before the deed is signed.",
    },
    pt: {
      term: "IMT (Imposto Municipal sobre as Transmissões Onerosas de Imóveis)",
      def: "Imposto municipal pago uma só vez pelo comprador sobre a transmissão onerosa de um imóvel, antes da escritura.",
    },
  },
  {
    id: "selo",
    en: {
      term: "Stamp duty",
      def: "A tax on legal acts and documents. On a purchase it is 0.8% of the taxable value (TGIS verba 1.1), plus a charge on any mortgage (verba 17).",
    },
    pt: {
      term: "Imposto do Selo",
      def: "Imposto sobre atos e documentos. Na compra é 0,8% sobre a base tributável (verba 1.1 da TGIS), acrescido do imposto sobre o crédito (verba 17).",
    },
  },
  {
    id: "vpt",
    en: {
      term: "Taxable value (VPT)",
      def: "The tax authority's rateable value of a property. IMT and stamp duty are charged on whichever is higher, the price or the VPT.",
    },
    pt: {
      term: "VPT (Valor Patrimonial Tributário)",
      def: "O valor atribuído ao imóvel pela Autoridade Tributária. O IMT e o selo incidem sobre o maior valor entre o preço e o VPT.",
    },
  },
  {
    id: "hpp",
    en: {
      term: "Own permanent home (HPP)",
      def: "A dwelling that is the buyer's main and permanent residence. It uses a lower IMT table with an exempt first band.",
    },
    pt: {
      term: "Habitação própria e permanente (HPP)",
      def: "A habitação que constitui a residência principal e permanente do adquirente. Usa uma tabela de IMT mais baixa, com um primeiro escalão isento.",
    },
  },
  {
    id: "jovem",
    en: {
      term: "IMT Jovem (young buyers' relief)",
      def: "Relief for a first own permanent home bought by people aged 35 or under: both IMT and the 0.8% acquisition stamp duty are exempt up to a ceiling (€330,539 on the mainland in 2026) and charged only on the excess above it.",
    },
    pt: {
      term: "IMT Jovem",
      def: "Benefício para a primeira habitação própria e permanente de pessoas até 35 anos: o IMT e o imposto do selo de 0,8% da aquisição estão isentos até um limite (€330 539 no continente em 2026) e apenas incidem sobre o excedente.",
    },
  },
  {
    id: "nonresident",
    en: {
      term: "Non-resident",
      def: "For IMT, a buyer who is not tax-resident in Portugal. Since 2026 they pay a flat 7.5% on housing (CIMT art. 17.º n.º 10), unless an exception applies.",
    },
    pt: {
      term: "Não residente",
      def: "Para efeitos de IMT, o adquirente sem residência fiscal em Portugal. Desde 2026 paga uma taxa fixa de 7,5% na habitação (art. 17.º n.º 10 do CIMT), salvo exceção.",
    },
  },
  {
    id: "taxhaven",
    en: {
      term: "Tax haven",
      def: "A jurisdiction on Portugal's blacklist. An entity domiciled there pays a flat 10% IMT (art. 17.º n.º 4); this does not apply to individuals.",
    },
    pt: {
      term: "Paraíso fiscal",
      def: "Jurisdição constante da lista negra portuguesa. Uma entidade aí domiciliada paga 10% de IMT (art. 17.º n.º 4); não se aplica a particulares.",
    },
  },
  {
    id: "rate-deduction",
    en: {
      term: "Rate and deduction",
      def: "IMT is progressive: tax = value × the band's marginal rate − a fixed deduction that keeps the bands continuous.",
    },
    pt: {
      term: "Taxa e parcela a abater",
      def: "O IMT é progressivo: imposto = valor × taxa marginal do escalão − uma parcela fixa a abater que torna os escalões contínuos.",
    },
  },
  {
    id: "taxa-unica",
    en: {
      term: "Flat rate",
      def: "For high-value property the progressive bands give way to a single flat rate applied to the whole value.",
    },
    pt: {
      term: "Taxa única",
      def: "Para imóveis de valor elevado, os escalões progressivos dão lugar a uma taxa única aplicada a todo o valor.",
    },
  },
  {
    id: "totality",
    en: {
      term: "Co-ownership & the totality rule",
      def: "When several buyers acquire the whole property in one deed, the rate is set by the total value and applied to each share (art. 17.º n.º 6 a) — buying together gives no band-splitting advantage.",
    },
    pt: {
      term: "Compropriedade e a regra da totalidade",
      def: "Quando vários compradores adquirem a totalidade do imóvel na mesma escritura, a taxa é a correspondente ao valor total e aplica-se a cada quota (art. 17.º n.º 6 a) — comprar em conjunto não reduz o escalão.",
    },
  },
  {
    id: "escritura",
    en: {
      term: "Deed",
      def: "The notarial contract that transfers the property. IMT and stamp duty must be paid before it is signed.",
    },
    pt: {
      term: "Escritura",
      def: "O contrato notarial que transmite o imóvel. O IMT e o selo têm de ser pagos antes da sua celebração.",
    },
  },
  {
    id: "moderate-rent",
    en: {
      term: "Moderate rent",
      def: "A rent within the limits of Decreto-Lei n.º 97/2026. A non-resident who lets the home at moderate rent can reclaim the 7.5% surcharge down to ordinary rates.",
    },
    pt: {
      term: "Renda moderada",
      def: "Renda dentro dos limites do Decreto-Lei n.º 97/2026. Um não residente que arrende a habitação com renda moderada pode reaver o agravamento de 7,5% até às taxas normais.",
    },
  },
  {
    id: "at",
    en: {
      term: "Tax Authority (AT)",
      def: "Portugal's tax and customs authority, which assesses and collects IMT and stamp duty.",
    },
    pt: {
      term: "Autoridade Tributária e Aduaneira (AT)",
      def: "A autoridade tributária e aduaneira portuguesa, que liquida e cobra o IMT e o imposto do selo.",
    },
  },
  {
    id: "imi",
    en: {
      term: "IMI (Municipal Property Tax)",
      def: "An annual municipal tax for owning property, charged on the VPT (typically 0.3–0.45% a year for urban property, set by each municipality). Separate from the one-off IMT paid when buying.",
    },
    pt: {
      term: "IMI (Imposto Municipal sobre Imóveis)",
      def: "Imposto municipal anual pela propriedade de um imóvel, incidente sobre o VPT (normalmente 0,3% a 0,45% por ano nos prédios urbanos, fixado por cada município). Distinto do IMT, pago uma só vez na compra.",
    },
  },
  {
    id: "aimi",
    en: {
      term: "AIMI (Additional to IMI)",
      def: "An extra annual tax on high-value property holdings, above a VPT threshold. Most single homes are not affected.",
    },
    pt: {
      term: "AIMI (Adicional ao IMI)",
      def: "Imposto anual adicional sobre patrimónios imobiliários de valor elevado, acima de um limite de VPT. A maioria das habitações não é abrangida.",
    },
  },
  {
    id: "base-tributavel",
    en: {
      term: "Tax base (base tributável)",
      def: "The value IMT and stamp duty are charged on: the higher of the purchase price and the VPT.",
    },
    pt: {
      term: "Base tributável",
      def: "O valor sobre o qual incidem o IMT e o imposto do selo: o maior entre o preço de compra e o VPT.",
    },
  },
  {
    id: "compropriedade",
    en: {
      term: "Co-ownership (compropriedade)",
      def: "Buying a property in shares among several buyers. Under the totality rule the rate is set on the whole value and applied to each buyer's share, so splitting a purchase gives no bracket advantage.",
    },
    pt: {
      term: "Compropriedade",
      def: "Compra de um imóvel em quotas por vários compradores. Pela regra da totalidade, a taxa é fixada sobre o valor total e aplicada à quota de cada comprador, pelo que dividir a compra não traz vantagem de escalões.",
    },
  },
  {
    id: "contrato-promessa",
    en: {
      term: "CPCV (promissory contract)",
      def: "The contrato-promessa de compra e venda — a binding pre-agreement to buy and sell, signed before the final deed, at which the deposit (sinal) is usually paid. IMT is due before the deed, not the CPCV.",
    },
    pt: {
      term: "CPCV (contrato-promessa de compra e venda)",
      def: "Acordo prévio vinculativo de compra e venda, assinado antes da escritura definitiva, altura em que normalmente se paga o sinal. O IMT é devido antes da escritura, não do CPCV.",
    },
  },
  {
    id: "residente",
    en: {
      term: "Tax resident (residente fiscal)",
      def: "Someone tax-resident in Portugal. Residents pay the ordinary progressive IMT rates — in contrast to a non-resident, who pays a flat 7.5%.",
    },
    pt: {
      term: "Residente fiscal",
      def: "Quem é residente fiscal em Portugal. Os residentes pagam as taxas progressivas normais de IMT — ao contrário do não residente, que paga uma taxa única de 7,5%.",
    },
  },
];
