import type { Lang } from "@/i18n/lang";
import type { GuideBody } from "./registry";

// Guide: buying in the Azores/Madeira — the ×1.25 regional IMT tables (Lei n.º 21/90). Bilingual.
// Worked-example figures (bracket rate, band, deduction, amounts) are {tokens} resolved from
// computed.ts (precomputed from tables IV/V/VI), so they always match the calculator.

export const imtRegions: Record<Lang, GuideBody> = {
  en: {
    intro:
      "Buying in the Azores or Madeira uses its own IMT tables: the same rates as the mainland, but the value thresholds are 25% higher, so a given price is taxed a little less than on the mainland. Here is how it works, with a worked example.",
    sections: [
      {
        heading: "The ×1.25 rule",
        blocks: [
          {
            p: "Under Lei n.º 21/90, the autonomous-region IMT brackets are the mainland thresholds increased by 25%. The marginal rates (0–8%, then the flat top bands) are identical; only the value at which each band starts and ends is higher. The practical effect is that the same purchase price falls into a lower band than it would on the mainland, so the IMT is somewhat lower.",
          },
        ],
      },
      {
        heading: "Which table applies",
        blocks: [
          {
            p: "The region uses Table IV for an own permanent home, Table V for a first home under IMT Jovem, and Table VI for other housing (secondary or rental) — the regional counterparts of the mainland Tables I, II and III. The calculator picks the right one automatically once you set the location to Açores or Madeira.",
          },
        ],
      },
      {
        heading: "Worked example: a €400,000 home in the Azores",
        blocks: [
          {
            p: "An own permanent home at €400,000 in the Azores uses Table IV: the €400,000 falls in the {regionRate} band ({regionBandLo}–{regionBandHi}), so IMT is 400,000 × {regionRate} − {regionDeduction} = €{regionImt}. Add 0.8% stamp duty (€{stamp400}) for €{regionTotal} in total.",
          },
          {
            p: "The same €400,000 own home on the mainland (Table I) would be €{regionMainlandImt} IMT + €{stamp400} = €{regionMainlandTotal} — about €{regionDiff} more, purely from the ×1.25 thresholds.",
          },
        ],
      },
      {
        heading: "IMT Jovem in the regions",
        blocks: [
          {
            p: "IMT Jovem works the same way, with the higher regional ceiling: a first own permanent home for a buyer aged 35 or under is exempt from IMT and the acquisition stamp duty up to €{jovemCapRegion} (Table V), versus €{jovemCap} on the mainland — and charged only on any excess above that.",
          },
        ],
      },
      {
        heading: "Stamp duty is the same",
        blocks: [
          {
            p: "The 0.8% acquisition stamp duty (and the mortgage stamp duty) are national and not increased in the regions. Only the IMT tables differ.",
          },
        ],
      },
    ],
    faq: [
      {
        q: "Is IMT cheaper in the Azores and Madeira?",
        a: "For the same price, usually yes: the rates are identical but the brackets are 25% higher (Lei n.º 21/90), so the value tends to fall into a lower band than on the mainland.",
      },
      {
        q: "Which IMT table applies in the autonomous regions?",
        a: "Table IV for an own permanent home, Table V for a first home under IMT Jovem, and Table VI for other housing — the ×1.25 versions of the mainland Tables I, II and III.",
      },
      {
        q: "Does the higher threshold apply to stamp duty too?",
        a: "No. Only the IMT tables are increased by 25%. The 0.8% acquisition stamp duty and the mortgage stamp duty are the same nationwide.",
      },
    ],
    cta: "Calculate for the Azores or Madeira",
  },
  pt: {
    intro:
      "A compra nos Açores ou na Madeira segue tabelas de IMT próprias: as mesmas taxas do continente, mas com os limites de valor 25% mais altos, pelo que um dado preço é tributado um pouco menos do que no continente. Veja como funciona, com um exemplo prático.",
    sections: [
      {
        heading: "A regra do ×1,25",
        blocks: [
          {
            p: "Ao abrigo da Lei n.º 21/90, os escalões de IMT das regiões autónomas são os limites do continente acrescidos de 25%. As taxas marginais (0–8% e depois as taxas únicas do topo) são idênticas; apenas o valor em que cada escalão começa e acaba é mais alto. Na prática, o mesmo preço de compra cai num escalão mais baixo do que cairia no continente, pelo que o IMT é um pouco menor.",
          },
        ],
      },
      {
        heading: "Que tabela se aplica",
        blocks: [
          {
            p: "A região usa a Tabela IV para habitação própria e permanente, a Tabela V para a primeira habitação ao abrigo do IMT Jovem, e a Tabela VI para outra habitação (secundária ou arrendamento) — as equivalentes regionais das Tabelas I, II e III do continente. A calculadora escolhe a correta automaticamente quando definir a localização como Açores ou Madeira.",
          },
        ],
      },
      {
        heading: "Exemplo: uma casa de €400 000 nos Açores",
        blocks: [
          {
            p: "Uma habitação própria e permanente de €400 000 nos Açores usa a Tabela IV: os €400 000 caem no escalão de {regionRate} ({regionBandLo}–{regionBandHi}), pelo que o IMT é 400 000 × {regionRate} − {regionDeduction} = €{regionImt}. Acresce 0,8% de imposto do selo (€{stamp400}), num total de €{regionTotal}.",
          },
          {
            p: "A mesma casa própria de €400 000 no continente (Tabela I) seria €{regionMainlandImt} de IMT + €{stamp400} = €{regionMainlandTotal} — cerca de €{regionDiff} a mais, apenas devido aos limites ×1,25.",
          },
        ],
      },
      {
        heading: "IMT Jovem nas regiões",
        blocks: [
          {
            p: "O IMT Jovem funciona da mesma forma, com o limite regional mais alto: a primeira habitação própria e permanente de quem tem até 35 anos está isenta de IMT e do imposto do selo da aquisição até €{jovemCapRegion} (Tabela V), contra €{jovemCap} no continente — e só é tributada sobre o eventual excedente.",
          },
        ],
      },
      {
        heading: "O imposto do selo é igual",
        blocks: [
          {
            p: "O imposto do selo da aquisição de 0,8% (e o selo do crédito) são nacionais e não são aumentados nas regiões. Só as tabelas de IMT é que diferem.",
          },
        ],
      },
    ],
    faq: [
      {
        q: "O IMT é mais barato nos Açores e na Madeira?",
        a: "Para o mesmo preço, normalmente sim: as taxas são iguais, mas os escalões são 25% mais altos (Lei n.º 21/90), pelo que o valor tende a cair num escalão mais baixo do que no continente.",
      },
      {
        q: "Que tabela de IMT se aplica nas regiões autónomas?",
        a: "A Tabela IV para habitação própria e permanente, a Tabela V para a primeira habitação ao abrigo do IMT Jovem, e a Tabela VI para outra habitação — as versões ×1,25 das Tabelas I, II e III do continente.",
      },
      {
        q: "O limite mais alto também se aplica ao imposto do selo?",
        a: "Não. Apenas as tabelas de IMT são acrescidas de 25%. O imposto do selo da aquisição de 0,8% e o selo do crédito são iguais em todo o país.",
      },
    ],
    cta: "Calcular para os Açores ou a Madeira",
  },
};
