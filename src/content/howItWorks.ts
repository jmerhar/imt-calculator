// Bilingual "How it works" content. Each section is a heading plus an ordered list of blocks
// (a paragraph or a bullet list), in English and Portuguese, kept side by side so both stay in
// lock-step.

export type Block = { p: string } | { ul: string[] };

export interface HowToSection {
  id: string;
  en: { heading: string; blocks: Block[] };
  pt: { heading: string; blocks: Block[] };
}

export const howItWorks: HowToSection[] = [
  {
    id: "what",
    en: {
      heading: "What it calculates",
      blocks: [
        { p: "For a property purchase it works out the IMT (property-transfer tax) and the stamp duty due, buyer by buyer, and totals them." },
        { p: "The tax base is the higher of the purchase price and the VPT (rateable value). Enter a VPT only if it is higher than the price; otherwise the price is used." },
      ],
    },
    pt: {
      heading: "O que calcula",
      blocks: [
        { p: "Para a compra de um imóvel, apura o IMT e o imposto do selo devidos, comprador a comprador, e soma-os." },
        { p: "A base tributável é o maior valor entre o preço de compra e o VPT (valor patrimonial tributário). Introduza o VPT apenas se for superior ao preço; caso contrário, é usado o preço." },
      ],
    },
  },
  {
    id: "imt",
    en: {
      heading: "How IMT is worked out",
      blocks: [
        { p: "IMT uses progressive bands. For a given value the tax is: value × the band's marginal rate − a fixed deduction (the parcela a abater) that keeps the bands continuous. Above a high threshold the bands give way to a single flat rate on the whole value." },
        { p: "The applicable table is chosen automatically from the property's location (mainland, Azores or Madeira), its intended use (own permanent home or secondary/rental) and, for a first home bought by someone aged 35 or under, IMT Jovem." },
      ],
    },
    pt: {
      heading: "Como se apura o IMT",
      blocks: [
        { p: "O IMT é progressivo. Para um dado valor, o imposto é: valor × taxa marginal do escalão − uma parcela fixa a abater que torna os escalões contínuos. Acima de um limite elevado, os escalões dão lugar a uma taxa única sobre todo o valor." },
        { p: "A tabela aplicável é escolhida automaticamente a partir da localização do imóvel (continente, Açores ou Madeira), da finalidade (habitação própria e permanente ou secundária/arrendamento) e, na primeira habitação de quem tem até 35 anos, do IMT Jovem." },
      ],
    },
  },
  {
    id: "totality",
    en: {
      heading: "Several buyers: the totality rule",
      blocks: [
        { p: "When several people buy the whole property in a single deed, CIMT art. 17.º n.º 6 a) sets the rate by the total value and applies it to each buyer's share. Buying together therefore gives no progressive-band advantage — the total IMT is the same as if one person bought it, just split by share." },
      ],
    },
    pt: {
      heading: "Vários compradores: a regra da totalidade",
      blocks: [
        { p: "Quando várias pessoas compram a totalidade do imóvel numa só escritura, o art. 17.º n.º 6 a) do CIMT fixa a taxa pelo valor total e aplica-a à quota de cada comprador. Comprar em conjunto não traz, por isso, vantagem nos escalões — o IMT total é o mesmo que se um só comprador adquirisse o imóvel, apenas repartido pela quota." },
      ],
    },
  },
  {
    id: "nonresident",
    en: {
      heading: "Non-resident buyers (2026)",
      blocks: [
        { p: "Since Decreto-Lei n.º 97/2026, a non-resident buying housing pays a flat 7.5% IMT with no exemption or reduction (CIMT art. 17.º n.º 10), unless one of these applies:" },
        {
          ul: [
            "the buyer has been a Portuguese tax resident (a former resident) — ordinary rates apply;",
            "the buyer will become resident within two years;",
            "the home will be let at moderate rent within the legal limits.",
          ],
        },
        { p: "In the second and third cases the 7.5% is paid up front and the difference down to ordinary rates can be reclaimed once the condition is met (n.º 11–12)." },
        { p: "Note on dates: this rule has been in force since the decree-law took effect (the 5th day after its 20 May 2026 publication). It is not tied to 1 September 2026 — that date only starts the CIA and RSAA rental regimes, which do not affect an ordinary home purchase." },
      ],
    },
    pt: {
      heading: "Compradores não residentes (2026)",
      blocks: [
        { p: "Desde o Decreto-Lei n.º 97/2026, um não residente que compre habitação paga uma taxa fixa de IMT de 7,5%, sem isenção nem redução (art. 17.º n.º 10 do CIMT), salvo se:" },
        {
          ul: [
            "o comprador já tiver sido residente fiscal em Portugal (antigo residente) — aplicam-se as taxas normais;",
            "o comprador se tornar residente no prazo de dois anos;",
            "a habitação for arrendada com renda moderada dentro dos limites legais.",
          ],
        },
        { p: "No segundo e terceiro casos, os 7,5% são pagos antecipadamente e a diferença até às taxas normais pode ser reembolsada quando a condição se verificar (n.º 11–12)." },
        { p: "Nota sobre datas: esta regra vigora desde a entrada em vigor do decreto-lei (o 5.º dia após a publicação de 20 de maio de 2026). Não está associada a 1 de setembro de 2026 — essa data apenas inicia os regimes de arrendamento CIA e RSAA, que não afetam a compra normal de uma habitação." },
      ],
    },
  },
  {
    id: "entities",
    en: {
      heading: "Companies and tax havens",
      blocks: [
        { p: "An entity domiciled in (or controlled from) a blacklisted jurisdiction pays a flat 10% IMT (CIMT art. 17.º n.º 4). This does not apply to individuals (n.º 7), so it is only offered here when the buyer is a company or entity." },
      ],
    },
    pt: {
      heading: "Empresas e paraísos fiscais",
      blocks: [
        { p: "Uma entidade domiciliada numa jurisdição da lista negra (ou controlada a partir dela) paga uma taxa fixa de IMT de 10% (art. 17.º n.º 4 do CIMT). Não se aplica a particulares (n.º 7), pelo que aqui só é apresentada quando o comprador é uma empresa ou entidade." },
      ],
    },
  },
  {
    id: "stampduty",
    en: {
      heading: "Stamp duty",
      blocks: [
        { p: "Stamp duty on the transfer is 0.8% of the tax base (TGIS verba 1.1). If the purchase is financed, stamp duty on the loan is added under verba 17.1: 0.6% for a term of 5 years or more, 0.5% for 1 to 5 years, and 0.04% per month below a year. A home loan is not consumer credit, so the higher verba 17.2 rates do not apply." },
      ],
    },
    pt: {
      heading: "Imposto do selo",
      blocks: [
        { p: "O imposto do selo sobre a transmissão é 0,8% da base tributável (verba 1.1 da TGIS). Se a compra for financiada, acresce o selo sobre o crédito, ao abrigo da verba 17.1: 0,6% para prazo igual ou superior a 5 anos, 0,5% de 1 a 5 anos e 0,04% por mês para menos de um ano. O crédito à habitação não é crédito ao consumo, pelo que não se aplicam as taxas mais elevadas da verba 17.2." },
      ],
    },
  },
  {
    id: "sources",
    en: {
      heading: "Data & sources",
      blocks: [
        { p: "Rates and tables are for the 2026 tax year. The autonomous-region tables are the mainland thresholds increased by 25% (Lei n.º 21/90). Future years can be added from the same official sources without touching the calculation logic." },
        {
          ul: [
            "IMT rates & tables — CIMT art. 17.º (Portal das Finanças) and AT Ofício Circulado n.º 40129/2026;",
            "Non-resident, tax-haven and totality rules — CIMT art. 17.º, as amended by Decreto-Lei n.º 97/2026;",
            "Stamp duty — Tabela Geral do Imposto do Selo, verbas 1.1 and 17.",
          ],
        },
        { p: "This tool is an estimate and not tax advice. Confirm any figure with the Autoridade Tributária or a notary." },
      ],
    },
    pt: {
      heading: "Dados e fontes",
      blocks: [
        { p: "As taxas e tabelas referem-se ao ano fiscal de 2026. As tabelas das regiões autónomas são os escalões do continente acrescidos de 25% (Lei n.º 21/90). Anos futuros podem ser adicionados a partir das mesmas fontes oficiais sem alterar a lógica de cálculo." },
        {
          ul: [
            "Taxas e tabelas de IMT — art. 17.º do CIMT (Portal das Finanças) e Ofício Circulado n.º 40129/2026 da AT;",
            "Regras de não residente, paraíso fiscal e totalidade — art. 17.º do CIMT, na redação do Decreto-Lei n.º 97/2026;",
            "Imposto do selo — Tabela Geral do Imposto do Selo, verbas 1.1 e 17.",
          ],
        },
        { p: "Esta ferramenta é uma estimativa e não constitui aconselhamento fiscal. Confirme qualquer valor junto da Autoridade Tributária ou de um notário." },
      ],
    },
  },
];
