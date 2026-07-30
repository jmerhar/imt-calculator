// Domain types for the IMT + stamp-duty engine. All monetary values are euros as plain
// numbers; share fractions are 0..1 (not percentages).

export type Location = "mainland" | "azores" | "madeira";

/** HPP = habitação própria e permanente (own permanent home) vs any other housing. */
export type IntendedUse = "own_permanent" | "secondary";

export type BuyerType = "individual" | "entity";

export type Residency = "resident" | "non_resident";

/**
 * Exceptions to the non-resident 7.5% flat rate (CIMT art. 17.º n.º 10):
 * - `former_resident` (a): has been a PT tax resident → ordinary rates apply.
 * - `becomes_resident` (b): will become resident within 2 years → pay 7.5% now, reclaim the
 *   difference down to ordinary later (n.º 11–12).
 * - `accessible_rent` (c): let at moderate rent within limits → same reclaim mechanism.
 * - `none`: 7.5% is final.
 */
export type NonResidentException =
  | "none"
  | "former_resident"
  | "becomes_resident"
  | "accessible_rent";

/** TGIS verba 17.1 credit-term bands. */
export type MortgageTerm = "lt1" | "y1to5" | "ge5";

export type TableId = "I" | "II" | "III" | "IV" | "V" | "VI";

/** A rate bracket. `deduction` is the "parcela a abater"; flat ("taxa única") brackets carry 0. */
export interface Bracket {
  /** Lower threshold: this bracket applies to the greatest `lower` strictly below the base. */
  lower: number;
  /** Marginal rate as a fraction (e.g. 0.075 = 7.5%). */
  rate: number;
  /** Amount subtracted from `base * rate`. */
  deduction: number;
}

export interface Mortgage {
  amount: number;
  term: MortgageTerm;
  /** Only used for the `lt1` band (0.04% per month or fraction). */
  months?: number;
}

export interface Buyer {
  /** Ownership share as a fraction 0..1. */
  share: number;
  type: BuyerType;
  /** Meaningful only when `type === "entity"`: domiciled in / controlled from a tax haven. */
  taxHaven: boolean;
  residency: Residency;
  /** Meaningful only when `residency === "non_resident"`. */
  exception: NonResidentException;
  /** IMT Jovem eligibility; meaningful only when `intendedUse === "own_permanent"`. */
  jovem: boolean;
}

export interface CalcInput {
  year: number;
  location: Location;
  intendedUse: IntendedUse;
  price: number;
  /** Valor Patrimonial Tributário; the base is max(price, vpt). Optional. */
  vpt?: number;
  mortgage?: Mortgage;
  buyers: Buyer[];
}

/** Which rule set each buyer's IMT was computed under. */
export type ImtRule = "ordinary" | "non_resident_7_5" | "tax_haven_10";

export interface BuyerResult {
  share: number;
  shareValue: number;
  table: TableId | null; // null when a flat non-resident/tax-haven rate was applied
  imt: number;
  rule: ImtRule;
  /** When the 7.5% was paid but is reclaimable (exceptions b/c): the ordinary amount and delta. */
  reclaimableTo?: number;
  reclaimDelta?: number;
  stampDutyTransfer: number;
  subtotal: number;
}

export interface CalcResult {
  year: number;
  taxBase: number;
  baseSource: "price" | "vpt";
  buyers: BuyerResult[];
  totalImt: number;
  totalStampDutyTransfer: number;
  mortgageStampDuty: number;
  totalStampDuty: number;
  grandTotal: number;
  /** grandTotal / price (matches the convention of showing tax against the purchase price). */
  effectiveRate: number;
  /** price + grandTotal — the total cash the buyers put up. */
  totalOutlay: number;
  reclaimableTotal: number;
  calcId: string;
  warnings: string[];
}

export interface YearData {
  year: number;
  tables: Record<TableId, Bracket[]>;
  /** CIMT art. 17.º n.º 10 — non-resident flat rate. */
  nonResidentRate: number;
  /** CIMT art. 17.º n.º 4 — tax-haven flat rate (entities). */
  taxHavenRate: number;
  /** TGIS verba 1.1 — stamp duty on the onerous transfer. */
  stampDutyTransferRate: number;
  /** TGIS verba 17.1 — stamp duty on credit, by term. `lt1` is per month. */
  mortgageRates: { lt1PerMonth: number; y1to5: number; ge5: number };
}
