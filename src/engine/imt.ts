import type {
  Bracket,
  Buyer,
  BuyerResult,
  CalcInput,
  CalcResult,
  ImtRule,
  IntendedUse,
  Location,
  Mortgage,
  TableId,
  YearData,
} from "@/engine/types";
import { getYearData } from "@/engine/tables";
import { calcId } from "@/engine/hash";

/** Round to cents (half up). Keeps displayed parts summing to the displayed totals. */
export function round2(x: number): number {
  return Math.round((x + Number.EPSILON) * 100) / 100;
}

/**
 * The IMT table for a buyer, from property location + intended use + the buyer's IMT-Jovem
 * eligibility. Jovem only applies to own-permanent-home purchases.
 */
export function pickTable(location: Location, use: IntendedUse, jovem: boolean): TableId {
  const mainland = location === "mainland";
  if (use === "own_permanent") {
    if (jovem) return mainland ? "II" : "V";
    return mainland ? "I" : "IV";
  }
  return mainland ? "III" : "VI";
}

/**
 * Ordinary IMT on a value using the AT bracket formula `base * rate − deduction`. The applicable
 * bracket is the one with the greatest `lower` strictly below `base` (so a value exactly on a
 * threshold falls in the lower "até X" bracket). Flat brackets carry deduction 0, so the same
 * formula yields `base * rate`.
 */
export function ordinaryImt(base: number, brackets: Bracket[]): number {
  if (base <= 0) return 0;
  let chosen = brackets[0];
  for (const b of brackets) if (b.lower < base) chosen = b;
  return Math.max(0, base * chosen.rate - chosen.deduction);
}

function mortgageStampDuty(mortgage: Mortgage | undefined, rates: YearData["mortgageRates"]): number {
  if (!mortgage || mortgage.amount <= 0) return 0;
  switch (mortgage.term) {
    case "ge5":
      return mortgage.amount * rates.ge5;
    case "y1to5":
      return mortgage.amount * rates.y1to5;
    case "lt1":
      // 0.04% per month or fraction; at least one month.
      return mortgage.amount * rates.lt1PerMonth * Math.max(1, Math.ceil(mortgage.months ?? 1));
  }
}

function computeBuyer(
  buyer: Buyer,
  input: CalcInput,
  year: YearData,
  taxBase: number,
): BuyerResult {
  const shareValue = taxBase * buyer.share;
  const stampDutyTransfer = round2(shareValue * year.stampDutyTransferRate);

  // Ordinary IMT via the co-ownership "totality" rule (CIMT art. 17.º n.º 6 a): the rate is set
  // by the FULL tax base and applied to this buyer's share — no bracket-splitting benefit.
  const ordinary = (): { table: TableId; amount: number } => {
    const table = pickTable(input.location, input.intendedUse, buyer.jovem);
    const effRate = taxBase > 0 ? ordinaryImt(taxBase, year.tables[table]) / taxBase : 0;
    return { table, amount: shareValue * effRate };
  };

  let rule: ImtRule = "ordinary";
  let table: TableId | null = null;
  let imt: number;
  let reclaimableTo: number | undefined;
  let reclaimDelta: number | undefined;

  if (buyer.type === "entity" && buyer.taxHaven) {
    // Tax-haven flat 10% (art. 17.º n.º 4) takes precedence; entities only (n.º 7).
    rule = "tax_haven_10";
    imt = shareValue * year.taxHavenRate;
  } else if (buyer.residency === "non_resident" && buyer.exception !== "former_resident") {
    // Non-resident flat 7.5% (art. 17.º n.º 10). Former residents fall through to ordinary.
    rule = "non_resident_7_5";
    imt = shareValue * year.nonResidentRate;
    if (buyer.exception === "becomes_resident" || buyer.exception === "accessible_rent") {
      // Paid now, reclaimable down to ordinary later (n.º 11–12). Compute the delta from the
      // rounded, displayed figures so it always equals shown IMT − shown reclaimableTo.
      reclaimableTo = round2(ordinary().amount);
      reclaimDelta = round2(round2(imt) - reclaimableTo);
    }
  } else {
    const o = ordinary();
    table = o.table;
    imt = o.amount;
  }

  imt = round2(imt);
  return {
    share: buyer.share,
    shareValue: round2(shareValue),
    table,
    imt,
    rule,
    reclaimableTo,
    reclaimDelta,
    stampDutyTransfer,
    subtotal: round2(imt + stampDutyTransfer),
  };
}

/** Compute IMT + stamp duty for a purchase. Pure; never throws for bad shares (adds a warning). */
export function calculate(input: CalcInput): CalcResult {
  const year = getYearData(input.year);
  if (!year) throw new Error(`No IMT data bundled for year ${input.year}`);

  const warnings: string[] = [];
  const vpt = input.vpt ?? 0;
  const taxBase = Math.max(input.price, vpt);
  const baseSource: "price" | "vpt" = vpt > input.price ? "vpt" : "price";

  if (input.buyers.length === 0) warnings.push("no_buyers");
  const shareSum = input.buyers.reduce((s, b) => s + b.share, 0);
  if (input.buyers.length > 0 && Math.abs(shareSum - 1) > 0.0001) warnings.push("shares_not_100");

  const buyers = input.buyers.map((b) => computeBuyer(b, input, year, taxBase));

  const totalImt = round2(buyers.reduce((s, b) => s + b.imt, 0));
  const totalStampDutyTransfer = round2(buyers.reduce((s, b) => s + b.stampDutyTransfer, 0));
  const mortgageSd = round2(mortgageStampDuty(input.mortgage, year.mortgageRates));
  const totalStampDuty = round2(totalStampDutyTransfer + mortgageSd);
  const grandTotal = round2(totalImt + totalStampDuty);
  const reclaimableTotal = round2(buyers.reduce((s, b) => s + (b.reclaimDelta ?? 0), 0));

  return {
    year: input.year,
    taxBase,
    baseSource,
    buyers,
    totalImt,
    totalStampDutyTransfer,
    mortgageStampDuty: mortgageSd,
    totalStampDuty,
    grandTotal,
    effectiveRate: input.price > 0 ? grandTotal / input.price : 0,
    totalOutlay: round2(input.price + grandTotal),
    reclaimableTotal,
    calcId: calcId(input),
    warnings,
  };
}
