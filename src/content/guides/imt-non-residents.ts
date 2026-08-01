import type { Lang } from "@/i18n/lang";
import type { GuideBody } from "./registry";

// Guide: IMT for non-residents. Bilingual; the flat 7.5% cites CIMT art. 17.º as amended by
// Decreto-Lei n.º 97/2026. Mentions of the 2026 reform are legislative history and stay literal;
// the worked-example figures are {tokens} resolved from computed.ts (precomputed from the engine).

export const imtNonResidents: Record<Lang, GuideBody> = {
  en: {
    intro:
      "Since 2026, non-residents buying property in Portugal pay a flat 7.5% IMT (property-transfer tax) instead of the progressive rates. Here is exactly when that rate applies, the exceptions that let you avoid or recover it, and a worked example.",
    sections: [
      {
        heading: "What changed in 2026",
        blocks: [
          {
            p: "Decreto-Lei n.º 97/2026 added a flat rate of 7.5% to CIMT article 17.º (n.º 10): a buyer who is not tax-resident in Portugal, and does not fall under one of the exceptions below, pays 7.5% of the taxable value in IMT — regardless of the price or whether the home is a permanent residence.",
          },
          {
            p: "The rate has applied since the fifth day after the decree was published, around 25 May 2026. It is not tied to 1 September 2026 — that later date only starts separate rental regimes (CIA and RSAA) and does not change IMT.",
          },
        ],
      },
      {
        heading: "The flat 7.5% rate",
        blocks: [
          {
            p: "The 7.5% is applied to the taxable base — the higher of the purchase price and the VPT (rateable value) — with no progressive brackets and no deduction. IMT Jovem and the ordinary own-home rates do not apply while the 7.5% rate is in force for that buyer.",
          },
          {
            p: "A separate 10% flat rate applies to buyers domiciled in a blacklisted tax haven, but only to companies and other entities — individuals are expressly excluded (art. 17.º n.º 7), so a non-resident individual is never charged the 10%.",
          },
        ],
      },
      {
        heading: "When it doesn't apply: the exceptions",
        blocks: [
          {
            p: "Three situations in art. 17.º take a non-resident out of the flat 7.5%:",
          },
          {
            ul: [
              "Former resident — a buyer who has already been a Portuguese tax resident keeps the ordinary progressive rates; the 7.5% does not apply.",
              "Becoming resident within two years — the buyer pays 7.5% at the deed but can later reclaim the difference down to the ordinary rate once residence is established (n.º 11–12).",
              "Letting at a moderate rent — the buyer pays 7.5% now and can reclaim the same difference if the property is let at a moderate rent within the legal limits.",
            ],
          },
          {
            p: "In the two reclaimable cases the calculator shows both the 7.5% due now and the ordinary amount it can be reduced to, so you can see the reclaimable difference.",
          },
        ],
      },
      {
        heading: "Buying with a resident: the totality rule",
        blocks: [
          {
            p: "When a resident and a non-resident buy together in one deed, each buyer's own rate applies to their share. Under the co-ownership totality rule (art. 17.º n.º 6 a) the rate is set on the whole property value and applied to each share, so splitting a purchase across buyers gives no bracket advantage — the resident's share is taxed at the ordinary rate and the non-resident's at 7.5%.",
          },
        ],
      },
      {
        heading: "Worked example: a €400,000 purchase",
        blocks: [
          {
            p: "A non-resident individual buying a €400,000 home, with no exception: IMT is 7.5% of €400,000 = €{nonResidentImt}. Acquisition stamp duty (verba 1.1) adds 0.8% = €{stamp400}. Total tax: €{nonResidentTotal} — an effective {nonResidentEffRate} of the price.",
          },
          {
            p: "By comparison, a resident buying the same home as a secondary property would pay progressive IMT of about €{nonResidentOrdinaryImt} plus €{stamp400} stamp duty. The 7.5% flat rate is what makes the non-resident's bill higher.",
          },
        ],
      },
    ],
    faq: [
      {
        q: "Does the purchase date change the non-resident rate in 2026?",
        a: "No. The 7.5% flat rate has applied since the fifth day after Decreto-Lei n.º 97/2026 was published (around 25 May 2026). It is not tied to 1 September 2026, which only starts the CIA and RSAA rental regimes.",
      },
      {
        q: "Do non-resident individuals ever pay the 10% tax-haven rate?",
        a: "No. The 10% rate applies only to companies and other entities domiciled in a blacklisted jurisdiction; individuals are excluded by CIMT art. 17.º n.º 7. A non-resident individual pays the 7.5% flat rate (or the ordinary rate if an exception applies).",
      },
      {
        q: "Can I get the extra tax back if I move to Portugal?",
        a: "If you commit to becoming resident within two years, or let the property at a moderate rent, you pay 7.5% at the deed and can later reclaim the difference down to the ordinary rate (CIMT art. 17.º n.º 11–12).",
      },
    ],
    cta: "Calculate your non-resident IMT",
  },
  pt: {
    intro:
      "Desde 2026, os não residentes que compram imóveis em Portugal pagam uma taxa única de 7,5% de IMT em vez das taxas progressivas. Veja exatamente quando essa taxa se aplica, as exceções que permitem evitá-la ou recuperá-la, e um exemplo prático.",
    sections: [
      {
        heading: "O que mudou em 2026",
        blocks: [
          {
            p: "O Decreto-Lei n.º 97/2026 aditou uma taxa única de 7,5% ao artigo 17.º do CIMT (n.º 10): um comprador que não seja residente fiscal em Portugal, e que não se enquadre numa das exceções abaixo, paga 7,5% do valor tributável em IMT — independentemente do preço ou de a casa ser habitação permanente.",
          },
          {
            p: "A taxa aplica-se desde o quinto dia após a publicação do decreto-lei, por volta de 25 de maio de 2026. Não está ligada a 1 de setembro de 2026 — essa data apenas inicia os regimes de arrendamento (CIA e RSAA) e não altera o IMT.",
          },
        ],
      },
      {
        heading: "A taxa única de 7,5%",
        blocks: [
          {
            p: "Os 7,5% incidem sobre a base tributável — o maior valor entre o preço de compra e o VPT (valor patrimonial tributário) — sem escalões progressivos e sem parcela a abater. O IMT Jovem e as taxas normais de habitação própria não se aplicam enquanto vigorar a taxa de 7,5% para esse comprador.",
          },
          {
            p: "Existe ainda uma taxa única de 10% para compradores domiciliados num paraíso fiscal (lista negra), mas apenas para empresas e outras entidades — as pessoas singulares estão expressamente excluídas (art. 17.º n.º 7), pelo que um particular não residente nunca é tributado a 10%.",
          },
        ],
      },
      {
        heading: "Quando não se aplica: as exceções",
        blocks: [
          {
            p: "Três situações do art. 17.º retiram o não residente da taxa única de 7,5%:",
          },
          {
            ul: [
              "Antigo residente — quem já foi residente fiscal em Portugal mantém as taxas progressivas normais; os 7,5% não se aplicam.",
              "Passar a residente em dois anos — o comprador paga 7,5% na escritura, mas pode depois reaver a diferença até à taxa normal quando fixar residência (n.º 11–12).",
              "Arrendar com renda moderada — o comprador paga 7,5% agora e pode reaver a mesma diferença se colocar o imóvel em regime de renda moderada.",
            ],
          },
          {
            p: "Nos dois casos reembolsáveis, a calculadora mostra os 7,5% devidos agora e o valor normal a que pode ser reduzido, para ver a diferença reembolsável.",
          },
        ],
      },
      {
        heading: "Comprar com um residente: a regra da totalidade",
        blocks: [
          {
            p: "Quando um residente e um não residente compram juntos numa única escritura, aplica-se a taxa própria de cada comprador à sua quota-parte. Pela regra da totalidade na compropriedade (art. 17.º n.º 6 a), a taxa é fixada sobre a totalidade do valor do imóvel e aplicada a cada quota, pelo que dividir a compra por vários compradores não traz vantagem de escalões — a parte do residente é tributada à taxa normal e a do não residente a 7,5%.",
          },
        ],
      },
      {
        heading: "Exemplo: uma compra de €400 000",
        blocks: [
          {
            p: "Um particular não residente que compra uma casa de €400 000, sem exceção: o IMT é 7,5% de €400 000 = €{nonResidentImt}. Acresce o imposto do selo da aquisição (verba 1.1), de 0,8% = €{stamp400}. Total de impostos: €{nonResidentTotal} — uma taxa efetiva de {nonResidentEffRate} sobre o preço.",
          },
          {
            p: "Em comparação, um residente que comprasse a mesma casa como habitação secundária pagaria cerca de €{nonResidentOrdinaryImt} de IMT progressivo mais €{stamp400} de imposto do selo. É a taxa única de 7,5% que torna a conta do não residente mais alta.",
          },
        ],
      },
    ],
    faq: [
      {
        q: "A data da compra altera a taxa de não residente em 2026?",
        a: "Não. A taxa única de 7,5% aplica-se desde o quinto dia após a publicação do Decreto-Lei n.º 97/2026 (por volta de 25 de maio de 2026). Não está ligada a 1 de setembro de 2026, data que apenas inicia os regimes de arrendamento CIA e RSAA.",
      },
      {
        q: "Os particulares não residentes alguma vez pagam a taxa de 10% de paraíso fiscal?",
        a: "Não. A taxa de 10% aplica-se apenas a empresas e outras entidades domiciliadas numa jurisdição da lista negra; as pessoas singulares estão excluídas pelo art. 17.º n.º 7 do CIMT. Um particular não residente paga a taxa única de 7,5% (ou a taxa normal, se houver exceção).",
      },
      {
        q: "Posso reaver o imposto adicional se me mudar para Portugal?",
        a: "Se se comprometer a passar a residente em dois anos, ou arrendar o imóvel com renda moderada, paga 7,5% na escritura e pode depois reaver a diferença até à taxa normal (art. 17.º n.º 11–12 do CIMT).",
      },
    ],
    cta: "Calcular o meu IMT de não residente",
  },
};
