import type { Lang } from "@/i18n/lang";
import type { GuideBody } from "./registry";

// Guide: IMT vs IMI vs imposto do selo. Bilingual. Clarifies the three property taxes; the
// calculator covers IMT + purchase/mortgage stamp duty (not the annual IMI).

export const imtImiStampDuty: Record<Lang, GuideBody> = {
  en: {
    intro:
      "Buying and owning property in Portugal involves three different taxes that are easy to confuse: IMT and stamp duty, paid once when you buy, and IMI, paid every year you own. Here is what each is and how they differ.",
    sections: [
      {
        heading: "IMT — the property-transfer tax",
        blocks: [
          {
            p: "IMT (Imposto Municipal sobre as Transmissões Onerosas de Imóveis) is a one-off tax on buying a property. It is charged on the higher of the price and the VPT, using progressive brackets that depend on the property's location and use — with a flat 7.5% for non-residents and relief under IMT Jovem for a first home. It is paid before the deed. This is the main tax this calculator works out.",
          },
        ],
      },
      {
        heading: "Stamp duty (imposto do selo)",
        blocks: [
          {
            p: "Stamp duty is also a one-off purchase tax: 0.8% of the tax base on the transfer itself (TGIS verba 1.1), plus, if the purchase is financed, stamp duty on the loan (verba 17.1). It is paid alongside IMT at the deed. The calculator includes both the transfer stamp duty and the mortgage stamp duty.",
          },
        ],
      },
      {
        heading: "IMI — the annual property tax",
        blocks: [
          {
            p: "IMI (Imposto Municipal sobre Imóveis) is different: it is a recurring tax you pay every year for owning the property, not for buying it. Each municipality sets the rate within legal limits — typically 0.3% to 0.45% of the VPT per year for urban property — and it is billed the following year. Very high-value holdings can also attract AIMI (the additional to IMI).",
          },
          {
            p: "Because IMI is an ongoing ownership cost rather than a purchase cost, it is not part of what you pay to complete a purchase, and this calculator does not compute it.",
          },
        ],
      },
      {
        heading: "At a glance",
        blocks: [
          {
            ul: [
              "IMT — one-off, on purchase; progressive rate on max(price, VPT); paid before the deed.",
              "Stamp duty — one-off, on purchase; 0.8% of the base (+ mortgage stamp duty on any loan).",
              "IMI — annual, for ownership; ~0.3–0.45% of the VPT for urban property, set by the municipality.",
            ],
          },
          {
            p: "So the cost of buying is IMT + stamp duty (what this tool calculates); IMI is a yearly cost that starts after you own the home.",
          },
        ],
      },
    ],
    faq: [
      {
        q: "Is IMI part of the cost of buying a house?",
        a: "No. IMI is an annual tax for owning the property; it is billed each year after purchase. The one-off taxes due to complete a purchase are IMT and stamp duty.",
      },
      {
        q: "How often do I pay each one?",
        a: "IMT and stamp duty are paid once, at the purchase. IMI is paid every year for as long as you own the property.",
      },
      {
        q: "Does this calculator include IMI?",
        a: "No — it computes the purchase taxes (IMT and stamp duty). IMI depends on the VPT and your municipality's annual rate, and is a separate, recurring charge.",
      },
    ],
    cta: "Calculate your IMT and stamp duty",
  },
  pt: {
    intro:
      "Comprar e ter um imóvel em Portugal envolve três impostos diferentes que é fácil confundir: o IMT e o imposto do selo, pagos uma só vez na compra, e o IMI, pago todos os anos enquanto se é proprietário. Veja o que é cada um e em que diferem.",
    sections: [
      {
        heading: "IMT — o imposto sobre a transmissão",
        blocks: [
          {
            p: "O IMT (Imposto Municipal sobre as Transmissões Onerosas de Imóveis) é um imposto único sobre a compra de um imóvel. Incide sobre o maior valor entre o preço e o VPT, com escalões progressivos que dependem da localização e da finalidade do imóvel — com uma taxa única de 7,5% para não residentes e o benefício do IMT Jovem na primeira habitação. Paga-se antes da escritura. É o imposto principal que esta calculadora apura.",
          },
        ],
      },
      {
        heading: "Imposto do selo",
        blocks: [
          {
            p: "O imposto do selo é também um imposto único da compra: 0,8% da base tributável sobre a transmissão (verba 1.1 da TGIS) e, se a compra for financiada, o selo sobre o crédito (verba 17.1). Paga-se com o IMT na escritura. A calculadora inclui tanto o selo da transmissão como o selo do crédito.",
          },
        ],
      },
      {
        heading: "IMI — o imposto anual sobre o imóvel",
        blocks: [
          {
            p: "O IMI (Imposto Municipal sobre Imóveis) é diferente: é um imposto recorrente que se paga todos os anos por ser proprietário do imóvel, e não por o comprar. Cada município fixa a taxa dentro dos limites legais — normalmente entre 0,3% e 0,45% do VPT por ano para prédios urbanos — e é liquidado no ano seguinte. Patrimónios de valor muito elevado podem ainda estar sujeitos ao AIMI (adicional ao IMI).",
          },
          {
            p: "Como o IMI é um custo contínuo da propriedade e não da compra, não faz parte do que se paga para concluir a aquisição, e esta calculadora não o apura.",
          },
        ],
      },
      {
        heading: "Em resumo",
        blocks: [
          {
            ul: [
              "IMT — único, na compra; taxa progressiva sobre o máximo entre preço e VPT; pago antes da escritura.",
              "Imposto do selo — único, na compra; 0,8% da base (+ selo do crédito, se houver empréstimo).",
              "IMI — anual, pela propriedade; cerca de 0,3% a 0,45% do VPT nos prédios urbanos, fixado pelo município.",
            ],
          },
          {
            p: "Assim, o custo de comprar é IMT + imposto do selo (o que esta ferramenta calcula); o IMI é um custo anual que começa depois de já se ter a casa.",
          },
        ],
      },
    ],
    faq: [
      {
        q: "O IMI faz parte do custo de comprar uma casa?",
        a: "Não. O IMI é um imposto anual pela propriedade do imóvel, liquidado todos os anos após a compra. Os impostos únicos para concluir a compra são o IMT e o imposto do selo.",
      },
      {
        q: "Com que frequência se paga cada um?",
        a: "O IMT e o imposto do selo pagam-se uma só vez, na compra. O IMI paga-se todos os anos enquanto se for proprietário do imóvel.",
      },
      {
        q: "Esta calculadora inclui o IMI?",
        a: "Não — apura os impostos da compra (IMT e imposto do selo). O IMI depende do VPT e da taxa anual do seu município, e é um encargo separado e recorrente.",
      },
    ],
    cta: "Calcular o meu IMT e imposto do selo",
  },
};
