import type {
  Buyer,
  BuyerType,
  CalcInput,
  IntendedUse,
  Location,
  MortgageTerm,
  NonResidentException,
  Residency,
} from "@/engine/types";

// Compact, reversible encoding of the calculator inputs into the URL query, so a calculation can
// be bookmarked or shared. Kept short with single-letter codes; decoding is defensive and returns
// null on anything malformed so the caller can fall back to defaults.

const LOC = { mainland: "m", azores: "a", madeira: "d" } as const;
const USE = { own_permanent: "o", secondary: "s" } as const;
const TYPE = { individual: "i", entity: "e" } as const;
const RES = { resident: "r", non_resident: "n" } as const;
const EXC = { none: "n", former_resident: "f", becomes_resident: "b", accessible_rent: "a" } as const;
const TERM = { ge5: "g", y1to5: "y", lt1: "l" } as const;

const invert = <T extends Record<string, string>>(o: T): Record<string, keyof T> =>
  Object.fromEntries(Object.entries(o).map(([k, v]) => [v, k])) as Record<string, keyof T>;

const LOC_R = invert(LOC);
const USE_R = invert(USE);
const TYPE_R = invert(TYPE);
const RES_R = invert(RES);
const EXC_R = invert(EXC);
const TERM_R = invert(TERM);

function encodeBuyer(b: Buyer): string {
  return [b.share, TYPE[b.type], b.taxHaven ? 1 : 0, RES[b.residency], EXC[b.exception], b.jovem ? 1 : 0].join(",");
}

export function encodeState(input: CalcInput): string {
  const p = new URLSearchParams();
  p.set("y", String(input.year));
  p.set("loc", LOC[input.location]);
  p.set("use", USE[input.intendedUse]);
  p.set("p", String(input.price));
  if (input.vpt != null) p.set("v", String(input.vpt));
  if (input.mortgage) {
    const m = input.mortgage;
    p.set("m", [m.amount, TERM[m.term], m.months ?? ""].join(","));
  }
  p.set("b", input.buyers.map(encodeBuyer).join(";"));
  return p.toString();
}

function num(v: string | null): number | null {
  if (v == null || v.trim() === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function decodeBuyer(s: string): Buyer | null {
  const parts = s.split(",");
  if (parts.length !== 6) return null;
  const share = num(parts[0]);
  const type = TYPE_R[parts[1]] as BuyerType | undefined;
  const residency = RES_R[parts[3]] as Residency | undefined;
  const exception = EXC_R[parts[4]] as NonResidentException | undefined;
  if (share == null || share < 0 || share > 1 || !type || !residency || !exception) return null;
  return {
    share,
    type,
    taxHaven: parts[2] === "1",
    residency,
    exception,
    jovem: parts[5] === "1",
  };
}

export function decodeState(qs: string): CalcInput | null {
  const p = new URLSearchParams(qs);
  const year = num(p.get("y"));
  const location = LOC_R[p.get("loc") ?? ""] as Location | undefined;
  const intendedUse = USE_R[p.get("use") ?? ""] as IntendedUse | undefined;
  const price = num(p.get("p"));
  if (year == null || !location || !intendedUse || price == null || price < 0) return null;

  const buyersRaw = p.get("b");
  if (!buyersRaw) return null;
  const buyers: Buyer[] = [];
  for (const chunk of buyersRaw.split(";")) {
    const b = decodeBuyer(chunk);
    if (!b) return null;
    buyers.push(b);
  }
  if (buyers.length === 0) return null;

  const input: CalcInput = { year, location, intendedUse, price, buyers };

  const vpt = num(p.get("v"));
  if (vpt != null && vpt >= 0) input.vpt = vpt;

  const mRaw = p.get("m");
  if (mRaw) {
    const [amountS, termS, monthsS] = mRaw.split(",");
    const amount = num(amountS);
    const term = TERM_R[termS] as MortgageTerm | undefined;
    if (amount != null && amount >= 0 && term) {
      input.mortgage = { amount, term };
      const months = num(monthsS);
      if (months != null) input.mortgage.months = months;
    }
  }
  return input;
}

/** The query part of the current hash route (`#/path?query`), or "". */
function currentHashQuery(): string {
  const hash = window.location.hash.replace(/^#/, "");
  const q = hash.indexOf("?");
  return q === -1 ? "" : hash.slice(q + 1);
}

/** Parse calculator inputs from the current URL, or null if absent/invalid. */
export function readStateFromUrl(): CalcInput | null {
  if (typeof window === "undefined") return null;
  const qs = currentHashQuery();
  return qs ? decodeState(qs) : null;
}

/**
 * Write inputs into the hash query without navigating: preserves the current hash path and uses
 * replaceState (no history spam, no hashchange, so the router does not react).
 */
export function writeStateToUrl(input: CalcInput): void {
  if (typeof window === "undefined") return;
  const hash = window.location.hash.replace(/^#/, "") || "/";
  const path = hash.split("?")[0] || "/";
  const newHash = `#${path}?${encodeState(input)}`;
  window.history.replaceState(null, "", newHash);
}
