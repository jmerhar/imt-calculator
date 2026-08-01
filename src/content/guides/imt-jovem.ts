import type { Lang } from "@/i18n/lang";
import type { GuideBody } from "./registry";

// Guide: IMT Jovem. Bilingual; the young-buyer relief cites Decreto-Lei n.º 48-A/2024 (CIMT art.
// 9.º/17.º; CIS art. 7.º-A). Worked-example figures, ceilings and the year are {tokens} resolved
// from computed.ts (precomputed from the engine), so they always match the calculator.

export const imtJovem: Record<Lang, GuideBody> = {
  en: {
    intro:
      "IMT Jovem exempts young buyers from both IMT and the acquisition stamp duty on their first own permanent home. Here is who qualifies, the {year} value ceilings, how much it saves, and the conditions for keeping the benefit.",
    sections: [
      {
        heading: "What IMT Jovem is",
        blocks: [
          {
            p: "Introduced by Decreto-Lei n.º 48-A/2024, IMT Jovem removes both purchase taxes — IMT and the 0.8% acquisition stamp duty (verba 1.1) — on a first own permanent home bought by someone aged 35 or under. Below a value ceiling the purchase is fully exempt; above it, tax is charged only on the part that exceeds the ceiling.",
          },
        ],
      },
      {
        heading: "Who qualifies",
        blocks: [
          {
            ul: [
              "Aged 35 or under on the date of the deed, and not counted as a dependant for IRS in that year.",
              "The property is bought exclusively as an own permanent home (habitação própria e permanente).",
              "It is your first such purchase — and you do not own, and have not owned in the previous three years, an urban residential property (or part of one).",
            ],
          },
          {
            p: "Each buyer is assessed individually. If a couple buys together and only one of them qualifies, the exemption applies to that person's share alone.",
          },
        ],
      },
      {
        heading: "How much you save in {year}",
        blocks: [
          {
            p: "On the mainland, IMT and the acquisition stamp duty are fully exempt up to €{jovemCap}. Above that ceiling each is charged only on the part above it: the 0.8% stamp duty on the whole excess (with no upper limit), and IMT at {jovemRate} up to €{jovemUpper} — beyond which the ordinary own-home IMT rates apply and the IMT is no longer reduced.",
          },
          {
            p: "In the Azores and Madeira the ceiling is higher — €{jovemCapRegion} — because the regional tables are the mainland thresholds increased by 25% (Lei n.º 21/90).",
          },
        ],
      },
      {
        heading: "Worked examples",
        blocks: [
          {
            p: "A €300,000 first home on the mainland: below the €{jovemCap} ceiling, so IMT and acquisition stamp duty are both €0 — the purchase taxes are fully waived.",
          },
          {
            p: "A €400,000 first home on the mainland: IMT is {jovemRate} of the €{jovemExcess} above the ceiling = €{jovemImt}, and stamp duty is 0.8% of that same excess = €{jovemStamp}. Total purchase tax: €{jovemTotal}, versus €{jovemOrdinaryTotal} (€{jovemOrdinaryImt} IMT + €{stamp400} stamp duty) without the relief — a saving of about €{jovemSaving}.",
          },
        ],
      },
      {
        heading: "Keeping the benefit",
        blocks: [
          {
            p: "The property must stay your own permanent home. The exemption lapses if the home is given a different use within six years of the purchase — but not if you sell it, if your household changes (marriage or de facto union, its dissolution, or more dependants), or if you move for work more than 100 km away (CIMT art. 11.º n.º 8).",
          },
        ],
      },
    ],
    faq: [
      {
        q: "Does IMT Jovem also cover stamp duty?",
        a: "Yes. Decreto-Lei n.º 48-A/2024 exempts both IMT and the 0.8% acquisition stamp duty (verba 1.1) up to the same value ceiling — €{jovemCap} on the mainland in {year}, €{jovemCapRegion} in the Azores and Madeira — with tax on the excess above it.",
      },
      {
        q: "What if the home costs more than the ceiling?",
        a: "You still get the relief up to the ceiling. Only the part of the value above €{jovemCap} (mainland) is taxed — at {jovemRate} IMT plus 0.8% stamp duty — so a more expensive home is only partially, not fully, exempt.",
      },
      {
        q: "We are buying together and only one of us is under 36 — do we lose it?",
        a: "No. Eligibility is assessed per buyer. The exemption applies to the qualifying buyer's share; the other share is taxed normally.",
      },
    ],
    cta: "See your IMT Jovem saving",
  },
  pt: {
    intro:
      "O IMT Jovem isenta os jovens compradores de IMT e do imposto do selo da aquisição na sua primeira habitação própria e permanente. Veja quem tem direito, os limites de valor de {year}, quanto poupa e as condições para manter o benefício.",
    sections: [
      {
        heading: "O que é o IMT Jovem",
        blocks: [
          {
            p: "Criado pelo Decreto-Lei n.º 48-A/2024, o IMT Jovem elimina os dois impostos da compra — o IMT e o imposto do selo de 0,8% da aquisição (verba 1.1) — na primeira habitação própria e permanente de quem tem até 35 anos. Abaixo de um limite de valor, a compra está totalmente isenta; acima dele, o imposto incide apenas sobre a parte que excede o limite.",
          },
        ],
      },
      {
        heading: "Quem tem direito",
        blocks: [
          {
            ul: [
              "Ter idade igual ou inferior a 35 anos à data da escritura e não ser considerado dependente para efeitos de IRS nesse ano.",
              "O imóvel destina-se exclusivamente a habitação própria e permanente.",
              "É a primeira aquisição deste tipo — e não é, nem foi nos três anos anteriores, proprietário de um prédio urbano habitacional (ou de parte dele).",
            ],
          },
          {
            p: "Cada comprador é avaliado individualmente. Se um casal compra em conjunto e só um deles reúne as condições, a isenção aplica-se apenas à quota-parte dessa pessoa.",
          },
        ],
      },
      {
        heading: "Quanto poupa em {year}",
        blocks: [
          {
            p: "No continente, o IMT e o imposto do selo da aquisição estão totalmente isentos até €{jovemCap}. Acima desse limite, cada um incide apenas sobre a parte que o excede: o imposto do selo a 0,8% sobre todo o excedente (sem limite superior) e o IMT a {jovemRate} até €{jovemUpper} — acima do qual se aplicam as taxas normais de IMT de habitação própria e o IMT deixa de ser reduzido.",
          },
          {
            p: "Nos Açores e na Madeira o limite é mais alto — €{jovemCapRegion} — porque as tabelas regionais são os escalões do continente acrescidos de 25% (Lei n.º 21/90).",
          },
        ],
      },
      {
        heading: "Exemplos",
        blocks: [
          {
            p: "Uma primeira casa de €300 000 no continente: abaixo do limite de €{jovemCap}, pelo que o IMT e o imposto do selo da aquisição são ambos €0 — os impostos da compra são totalmente dispensados.",
          },
          {
            p: "Uma primeira casa de €400 000 no continente: o IMT é {jovemRate} dos €{jovemExcess} acima do limite = €{jovemImt}, e o imposto do selo é 0,8% desse mesmo excedente = €{jovemStamp}. Total de impostos da compra: €{jovemTotal}, contra €{jovemOrdinaryTotal} (€{jovemOrdinaryImt} de IMT + €{stamp400} de imposto do selo) sem o benefício — uma poupança de cerca de €{jovemSaving}.",
          },
        ],
      },
      {
        heading: "Manter o benefício",
        blocks: [
          {
            p: "O imóvel tem de continuar a ser a sua habitação própria e permanente. A isenção caduca se for dado um destino diferente à casa no prazo de seis anos após a compra — mas não se a vender, se o seu agregado familiar mudar (casamento ou união de facto, a sua dissolução, ou aumento de dependentes), ou se mudar de trabalho para um local a mais de 100 km de distância (art. 11.º n.º 8 do CIMT).",
          },
        ],
      },
    ],
    faq: [
      {
        q: "O IMT Jovem também abrange o imposto do selo?",
        a: "Sim. O Decreto-Lei n.º 48-A/2024 isenta tanto o IMT como o imposto do selo de 0,8% da aquisição (verba 1.1) até ao mesmo limite de valor — €{jovemCap} no continente em {year}, €{jovemCapRegion} nos Açores e na Madeira — com imposto apenas sobre o excedente.",
      },
      {
        q: "E se a casa custar mais do que o limite?",
        a: "Continua a beneficiar da isenção até ao limite. Só a parte do valor acima de €{jovemCap} (continente) é tributada — a {jovemRate} de IMT mais 0,8% de imposto do selo — pelo que uma casa mais cara fica apenas parcialmente, e não totalmente, isenta.",
      },
      {
        q: "Vamos comprar juntos e só um de nós tem menos de 36 anos — perdemos o benefício?",
        a: "Não. A elegibilidade é avaliada por comprador. A isenção aplica-se à quota-parte do comprador que reúne as condições; a outra quota é tributada normalmente.",
      },
    ],
    cta: "Ver a sua poupança com o IMT Jovem",
  },
};
