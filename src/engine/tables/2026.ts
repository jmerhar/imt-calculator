import type { YearData } from "@/engine/types";

// IMT rate tables in force for 2026, from the AT practical tables (Ofício Circulado
// n.º 40129/2026) and CIMT art. 17.º as amended by Decreto-Lei n.º 97/2026. Autonomous-region
// tables (IV–VI) are the mainland thresholds × 1.25 (Lei n.º 21/90); the values below are the
// AT-published figures.
//
// Each bracket is {lower, rate, deduction}. A bracket applies to the greatest `lower` strictly
// below the tax base. Progressive deductions follow the continuity rule
// `deduction_k = deduction_{k-1} + lower_k * (rate_k - rate_{k-1})`; flat ("taxa única")
// brackets carry rate on the whole value with deduction 0.

export const data2026: YearData = {
  year: 2026,
  tables: {
    // Continente — habitação própria e permanente (CIMT art. 17.º n.º 1 a).
    I: [
      { lower: 0, rate: 0, deduction: 0 },
      { lower: 106346, rate: 0.02, deduction: 2126.92 },
      { lower: 145470, rate: 0.05, deduction: 6491.02 },
      { lower: 198347, rate: 0.07, deduction: 10457.96 },
      { lower: 330539, rate: 0.08, deduction: 13763.35 },
      { lower: 660982, rate: 0.06, deduction: 0 },
      { lower: 1150853, rate: 0.075, deduction: 0 },
    ],
    // Continente — HPP, IMT Jovem (buyers ≤ 35, first home) (art. 17.º n.º 1 b).
    II: [
      { lower: 0, rate: 0, deduction: 0 },
      { lower: 330539, rate: 0.08, deduction: 26443.12 },
      { lower: 660982, rate: 0.06, deduction: 0 },
      { lower: 1150853, rate: 0.075, deduction: 0 },
    ],
    // Continente — habitação (não-HPP / secondary) (art. 17.º n.º 1 c).
    III: [
      { lower: 0, rate: 0.01, deduction: 0 },
      { lower: 106346, rate: 0.02, deduction: 1063.46 },
      { lower: 145470, rate: 0.05, deduction: 5427.56 },
      { lower: 198347, rate: 0.07, deduction: 9394.5 },
      { lower: 330539, rate: 0.08, deduction: 12699.89 },
      { lower: 633931, rate: 0.06, deduction: 0 },
      { lower: 1150853, rate: 0.075, deduction: 0 },
    ],
    // Regiões Autónomas — HPP.
    IV: [
      { lower: 0, rate: 0, deduction: 0 },
      { lower: 132933, rate: 0.02, deduction: 2658.66 },
      { lower: 181838, rate: 0.05, deduction: 8113.8 },
      { lower: 247934, rate: 0.07, deduction: 13072.48 },
      { lower: 413174, rate: 0.08, deduction: 17204.22 },
      { lower: 826228, rate: 0.06, deduction: 0 },
      { lower: 1438566, rate: 0.075, deduction: 0 },
    ],
    // Regiões Autónomas — HPP, IMT Jovem.
    V: [
      { lower: 0, rate: 0, deduction: 0 },
      { lower: 413174, rate: 0.08, deduction: 33053.92 },
      { lower: 826228, rate: 0.06, deduction: 0 },
      { lower: 1438566, rate: 0.075, deduction: 0 },
    ],
    // Regiões Autónomas — habitação (não-HPP / secondary).
    VI: [
      { lower: 0, rate: 0.01, deduction: 0 },
      { lower: 132933, rate: 0.02, deduction: 1329.33 },
      { lower: 181838, rate: 0.05, deduction: 6784.47 },
      { lower: 247934, rate: 0.07, deduction: 11743.15 },
      { lower: 413174, rate: 0.08, deduction: 15874.89 },
      { lower: 792414, rate: 0.06, deduction: 0 },
      { lower: 1438566, rate: 0.075, deduction: 0 },
    ],
  },
  nonResidentRate: 0.075, // CIMT art. 17.º n.º 10 (DL 97/2026)
  taxHavenRate: 0.1, // CIMT art. 17.º n.º 4
  stampDutyTransferRate: 0.008, // TGIS verba 1.1
  mortgageRates: {
    lt1PerMonth: 0.0004, // verba 17.1.1 — 0.04% per month or fraction
    y1to5: 0.005, // verba 17.1.2 — ≥1 and <5 years
    ge5: 0.006, // verba 17.1.3 — ≥5 years
  },
};
