// Bilingual explainer shown below the calculator on the home page: how the tax is worked out, a
// worked example, and the questions people actually search for. Kept here rather than in the i18n
// dictionaries because it is page content, not UI strings — the same split howItWorks.ts follows.
//
// Every figure is a {token} resolved from content/guides/computed.ts, which is generated from the
// engine's tables, so the page can never quote a number the calculator would not produce, and the
// yearly rollover carries the prose with it.
//
// The FAQ is rendered on the page and is also the source of the home page's FAQPage JSON-LD
// (src/seo/jsonld.ts) — one declaration, because structured data that a reader cannot see on the
// page is against Google's guidelines.

/** A paragraph, a bullet list, or a link through to the guide that covers the section in depth. */
export type ExplainerBlock = { p: string } | { ul: string[] } | { guide: string; label: string };

export interface ExplainerSection {
  id: string;
  en: { heading: string; blocks: ExplainerBlock[] };
  pt: { heading: string; blocks: ExplainerBlock[] };
}

export const homeExplainer: ExplainerSection[] = [
  {
    id: "how",
    en: {
      heading: "How IMT is calculated",
      blocks: [
        {
          p: "IMT is charged on the higher of the purchase price and the VPT (the property's rateable value), never on the two added together. That figure is the tax base, and everything else follows from it.",
        },
        {
          p: "IMT is progressive, but it does not accumulate across every band the way income tax does. You find the single band the tax base falls into, multiply the base by that band's rate and subtract the band's fixed deduction — the parcela a abater. One multiplication and one subtraction give the whole amount. Above a high threshold the bands give way to a single flat rate on the whole value.",
        },
        {
          p: "Stamp duty is paid separately and is much simpler: 0.8% of the same tax base on the transfer, plus stamp duty on the loan if the purchase is financed.",
        },
      ],
    },
    pt: {
      heading: "Como se calcula o IMT",
      blocks: [
        {
          p: "O IMT incide sobre o maior valor entre o preço de compra e o VPT (valor patrimonial tributário), nunca sobre a soma dos dois. Esse valor é a base tributável, e todo o resto decorre dele.",
        },
        {
          p: "O IMT é progressivo, mas não se acumula escalão a escalão como no IRS. Identifica-se o escalão em que se insere a base tributável, multiplica-se essa base pela taxa do escalão e subtrai-se a parcela a abater. Bastam uma multiplicação e uma subtração para obter o valor total. Acima de um limite elevado, os escalões dão lugar a uma taxa única sobre a totalidade do valor.",
        },
        {
          p: "O imposto do selo paga-se à parte e é bastante mais simples: 0,8% da mesma base tributável sobre a transmissão, a que acresce o selo sobre o crédito se a compra for financiada.",
        },
      ],
    },
  },
  {
    id: "example",
    en: {
      heading: "How much tax you would pay on a €400,000 home",
      blocks: [
        {
          p: "The same purchase produces three very different tax bills, depending on who is buying and what the property is for:",
        },
        {
          // The `jovem*Ordinary*` tokens are the figures for the same €400,000 purchase *without* the
          // relief — they are named for the comparison they belong to, not for the bullet below.
          ul: [
            "Buying your own permanent home on the mainland: €{jovemOrdinaryImt} of IMT plus €{stamp400} of stamp duty, so €{jovemOrdinaryTotal} in total.",
            "The same purchase under IMT Jovem: €{jovemImt} of IMT and €{jovemStamp} of stamp duty — €{jovemTotal} in all, about €{jovemSaving} less.",
            "Buying as a non-resident: the flat rate applies instead of the bands, giving €{nonResidentImt} of IMT and €{nonResidentTotal} in total — an effective {nonResidentEffRate} of the price.",
          ],
        },
        {
          p: "Enter your own figures above to see the same breakdown applied to your purchase, including the split between several buyers.",
        },
      ],
    },
    pt: {
      heading: "Quanto pagaria de impostos numa casa de €400 000",
      blocks: [
        {
          p: "A mesma compra dá origem a três valores de imposto muito diferentes, consoante quem compra e o fim a que se destina o imóvel:",
        },
        {
          ul: [
            "Compra de habitação própria e permanente no continente: €{jovemOrdinaryImt} de IMT mais €{stamp400} de imposto do selo, ou seja, €{jovemOrdinaryTotal} no total.",
            "A mesma compra ao abrigo do IMT Jovem: €{jovemImt} de IMT e €{jovemStamp} de imposto do selo — €{jovemTotal} ao todo, cerca de €{jovemSaving} a menos.",
            "Compra por um não residente: aplica-se a taxa única em vez dos escalões, o que dá €{nonResidentImt} de IMT e €{nonResidentTotal} no total — uma taxa efetiva de {nonResidentEffRate} sobre o preço.",
          ],
        },
        {
          p: "Introduza os seus valores acima para ver o mesmo detalhe aplicado à sua compra, incluindo a repartição entre vários compradores.",
        },
      ],
    },
  },
  {
    id: "tables",
    en: {
      heading: "Which rate table applies",
      blocks: [
        {
          p: "There is no single set of IMT rates for housing. The table depends on where the property is and what it will be used for: one for an own permanent home, one for a second home or a rental, and a third for a young buyer's first permanent home. The Açores and Madeira use the mainland rates with every band raised by 25% (Lei n.º 21/90), so a given price is taxed a little less than on the mainland.",
        },
        { guide: "imt-tables", label: "See the {year} rate tables in full" },
      ],
    },
    pt: {
      heading: "Que tabela de taxas se aplica",
      blocks: [
        {
          p: "Não existe um único conjunto de taxas de IMT para habitação. A tabela depende da localização do imóvel e do fim a que se destina: uma para habitação própria e permanente, outra para habitação secundária ou arrendamento e uma terceira para a primeira habitação de um jovem comprador. Os Açores e a Madeira usam as taxas do continente com todos os escalões acrescidos de 25% (Lei n.º 21/90), pelo que um dado preço é tributado um pouco menos do que no continente.",
        },
        { guide: "imt-tables", label: "Ver as tabelas de taxas de {year} na íntegra" },
      ],
    },
  },
  {
    id: "who",
    en: {
      heading: "Non-residents, young buyers and buying together",
      blocks: [
        {
          p: "Three rules move the answer more than the price does. Non-resident buyers pay a flat rate instead of the progressive bands — a former resident keeps the ordinary rates, and a buyer who becomes resident within two years or lets at a moderate rent can reclaim the difference, provided the statutory deadlines are met. IMT Jovem exempts a first own permanent home bought by someone aged 35 or under, subject to further conditions, up to a value ceiling, and covers the acquisition stamp duty up to that same ceiling.",
        },
        {
          p: "Where several people buy the whole property in a single deed, the rate is set by the property's total value and then applied to each person's share, so buying together gives no band-splitting advantage. Who the buyers are still matters a great deal, though: if one of them qualifies for IMT Jovem, or is non-resident, the total changes.",
        },
        { guide: "imt-non-residents", label: "How the non-resident rate works" },
        { guide: "imt-jovem", label: "Who qualifies for IMT Jovem" },
      ],
    },
    pt: {
      heading: "Não residentes, jovens compradores e compras em conjunto",
      blocks: [
        {
          p: "Há três regras que pesam mais no resultado do que o próprio preço. Os compradores não residentes pagam uma taxa única em vez dos escalões progressivos — um antigo residente mantém as taxas normais, e quem se torne residente no prazo de dois anos ou arrende com renda moderada pode reaver a diferença, desde que cumpra os prazos legais. O IMT Jovem isenta a primeira habitação própria e permanente de quem tem 35 anos ou menos, sujeito a outras condições, até um limite de valor, e abrange o imposto do selo da aquisição até esse mesmo limite.",
        },
        {
          p: "Quando várias pessoas compram a totalidade do imóvel na mesma escritura, a taxa é fixada pelo valor total e depois aplicada à quota de cada uma, pelo que comprar em conjunto não traz vantagem nos escalões. Mas a composição dos compradores conta muito: se um deles tiver direito ao IMT Jovem, ou for não residente, o total muda.",
        },
        { guide: "imt-non-residents", label: "Como funciona a taxa dos não residentes" },
        { guide: "imt-jovem", label: "Quem tem direito ao IMT Jovem" },
      ],
    },
  },
];

/** Questions rendered on the page and mirrored into the home page's FAQPage structured data. */
export const homeFaq: { id: string; en: { q: string; a: string }; pt: { q: string; a: string } }[] = [
  {
    id: "how-much",
    en: {
      q: "How much IMT will I pay?",
      a: "It depends on the tax base, the table that applies and who is buying. On a €400,000 own permanent home on the mainland the IMT is €{jovemOrdinaryImt}, or €{jovemImt} under IMT Jovem; a non-resident buying the same property pays €{nonResidentImt}, part of which is often reclaimable. Enter your own figures in the calculator above to see the amount in your case.",
    },
    pt: {
      q: "Quanto vou pagar de IMT?",
      a: "Depende da base tributável, da tabela aplicável e de quem compra. Numa habitação própria e permanente de €400 000 no continente, o IMT é de €{jovemOrdinaryImt}, ou de €{jovemImt} ao abrigo do IMT Jovem; um não residente que compre o mesmo imóvel paga €{nonResidentImt}, valor que é muitas vezes parcialmente reembolsável. Introduza os seus valores no simulador acima para saber o valor no seu caso.",
    },
  },
  {
    id: "price-or-vpt",
    en: {
      q: "Is IMT charged on the price or on the VPT?",
      a: "On whichever is higher. If the VPT exceeds the price agreed in the deed, the VPT becomes the tax base; otherwise the price is used. The two are never added together.",
    },
    pt: {
      q: "O IMT incide sobre o preço ou sobre o VPT?",
      a: "Sobre o maior dos dois. Se o VPT for superior ao preço acordado na escritura, é o VPT que passa a ser a base tributável; caso contrário, usa-se o preço. Os dois valores nunca se somam.",
    },
  },
  {
    id: "non-resident-rate",
    en: {
      q: "What IMT rate do non-residents pay?",
      a: "A flat rate on the whole tax base instead of the progressive bands. Former residents keep the ordinary rates. A buyer who becomes resident within two years, or lets the property at a moderate rent, pays the flat rate at the deed and can then reclaim the difference — reclaiming is not automatic, and each route has its own conditions and deadlines, which the guide sets out.",
    },
    pt: {
      q: "Que taxa de IMT pagam os não residentes?",
      a: "Uma taxa única sobre toda a base tributável, em vez dos escalões progressivos. Os antigos residentes mantêm as taxas normais. Quem se torne residente no prazo de dois anos, ou arrende o imóvel com renda moderada, paga a taxa única na escritura e pode depois reaver a diferença — o reembolso não é automático, e cada via tem condições e prazos próprios, indicados no guia.",
    },
  },
  {
    id: "jovem-stamp-duty",
    en: {
      q: "Does IMT Jovem cover stamp duty too?",
      a: "Yes, up to the same value ceiling as the IMT relief. Below the ceiling the 0.8% acquisition stamp duty is covered too, which is why the saving is larger than the IMT figure on its own; above it, stamp duty is charged on the excess — which is why the €400,000 example above still shows some. Stamp duty on the loan is unaffected.",
    },
    pt: {
      q: "O IMT Jovem também abrange o imposto do selo?",
      a: "Sim, até ao mesmo limite de valor da isenção de IMT. Abaixo desse limite, os 0,8% de imposto do selo da aquisição também estão abrangidos, razão pela qual a poupança é maior do que o valor do IMT por si só; acima dele, o selo incide sobre o excedente — daí que o exemplo de €400 000 acima ainda apresente algum. O imposto do selo sobre o crédito não é afetado.",
    },
  },
];
