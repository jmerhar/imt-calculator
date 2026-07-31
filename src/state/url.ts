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
import { getYearData, LATEST_YEAR } from "@/engine/tables";
import { defaultBuyer } from "@/state/defaults";

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

/** Legacy readable query-string encoding (kept so older shared links keep decoding). */
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

/** Parse the legacy readable query string; returns null on anything malformed or out of range. */
export function decodeState(qs: string): CalcInput | null {
  const p = new URLSearchParams(qs);
  const year = num(p.get("y"));
  const location = LOC_R[p.get("loc") ?? ""] as Location | undefined;
  const intendedUse = USE_R[p.get("use") ?? ""] as IntendedUse | undefined;
  const price = num(p.get("p"));
  // Reject a year with no bundled table: otherwise calculate() would throw on a stale link.
  if (year == null || !getYearData(year) || !location || !intendedUse || price == null || price < 0) {
    return null;
  }

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

// A single opaque, URL-safe token carrying the whole state, so shared links are one short code
// (`?c=…`) rather than a string of readable parameters. It is fully reversible: decoding it
// reconstructs the exact inputs it was built from.
const toBase64Url = (s: string) =>
  btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const fromBase64Url = (t: string) => atob(t.replace(/-/g, "+").replace(/_/g, "/"));

// --- Compact codec -------------------------------------------------------------------------
// A short, keyed-but-terse payload (raw delimiters, defaults omitted) that is then base64url'd.
// Keyed so it stays extensible: new fields get a new letter, unknown keys are ignored, and an
// absent field falls back to its default — so links keep working as fields are added.

function isDefaultBuyer(b: Buyer): boolean {
  return (
    b.share === 1 &&
    b.type === "individual" &&
    !b.taxHaven &&
    b.residency === "resident" &&
    b.exception === "none" &&
    !b.jovem
  );
}

function encodeBuyerCompact(b: Buyer): string {
  let s = String(Number((b.share * 100).toFixed(2))); // share as a percent
  if (b.type === "entity") s += "e";
  if (b.taxHaven) s += "h";
  if (b.residency === "non_resident") {
    s += "n";
    if (b.exception !== "none") s += EXC[b.exception];
  }
  if (b.jovem) s += "j";
  return s;
}

function parseBuyerCompact(tok: string): Buyer | null {
  const m = tok.match(/^(\d*\.?\d+)(.*)$/);
  if (!m) return null;
  // Shares are stored to 4 decimals (e.g. 0.3334); round back to that precision so a decoded
  // share equals the one that was encoded rather than a float-error neighbour of it.
  const share = Number((Number(m[1]) / 100).toFixed(4));
  if (!Number.isFinite(share) || share < 0 || share > 1) return null;
  const f = m[2];
  const nonResident = f.includes("n");
  const exception: NonResidentException = !nonResident
    ? "none"
    : f.includes("f")
      ? "former_resident"
      : f.includes("b")
        ? "becomes_resident"
        : f.includes("a")
          ? "accessible_rent"
          : "none";
  return {
    share,
    type: f.includes("e") ? "entity" : "individual",
    taxHaven: f.includes("h"),
    residency: nonResident ? "non_resident" : "resident",
    exception,
    jovem: f.includes("j"),
  };
}

/** Encode inputs to the compact payload (keyed fields, defaults omitted); pairs with decodeCompact. */
export function encodeCompact(input: CalcInput): string {
  const parts: string[] = [`p${input.price}`];
  if (input.year !== LATEST_YEAR) parts.push(`y${input.year}`);
  if (input.location !== "mainland") parts.push(`l${LOC[input.location]}`);
  if (input.intendedUse !== "own_permanent") parts.push("us");
  if (input.vpt != null) parts.push(`v${input.vpt}`);
  if (input.mortgage) {
    const m = input.mortgage;
    parts.push(`m${m.amount},${TERM[m.term]}${m.months != null ? "," + m.months : ""}`);
  }
  // Omit the buyer list entirely for the common case: one default resident individual.
  if (!(input.buyers.length === 1 && isDefaultBuyer(input.buyers[0]))) {
    parts.push(`b${input.buyers.map(encodeBuyerCompact).join("|")}`);
  }
  return parts.join(";");
}

/** Parse the compact payload back to inputs; returns null on malformed data or an unknown year. */
export function decodeCompact(payload: string): CalcInput | null {
  const input: CalcInput = {
    year: LATEST_YEAR,
    location: "mainland",
    intendedUse: "own_permanent",
    price: NaN,
    buyers: [defaultBuyer()],
  };
  for (const field of payload.split(";")) {
    if (!field) continue;
    const key = field[0];
    const val = field.slice(1);
    switch (key) {
      case "p":
        input.price = Number(val);
        break;
      case "y":
        input.year = Number(val);
        break;
      case "l": {
        const loc = LOC_R[val] as Location | undefined;
        if (!loc) return null; // reject a corrupted location rather than silently defaulting it
        input.location = loc;
        break;
      }
      case "u":
        input.intendedUse = val === "s" ? "secondary" : "own_permanent";
        break;
      case "v": {
        const n = Number(val);
        if (Number.isFinite(n) && n >= 0) input.vpt = n;
        break;
      }
      case "m": {
        const [a, term, months] = val.split(",");
        const amount = Number(a);
        const t = TERM_R[term] as MortgageTerm | undefined;
        if (Number.isFinite(amount) && amount >= 0 && t) {
          input.mortgage = { amount, term: t };
          const mo = Number(months);
          if (months && Number.isFinite(mo)) input.mortgage.months = mo;
        }
        break;
      }
      case "b": {
        const buyers: Buyer[] = [];
        for (const tok of val.split("|")) {
          const b = parseBuyerCompact(tok);
          if (!b) return null;
          buyers.push(b);
        }
        if (buyers.length === 0) return null;
        input.buyers = buyers;
        break;
      }
    }
  }
  if (!Number.isFinite(input.price) || input.price < 0) return null;
  if (!getYearData(input.year)) return null;
  return input;
}

/** The shareable token: the compact payload, base64url-encoded. */
export function encodeToken(input: CalcInput): string {
  return toBase64Url(encodeCompact(input));
}

/** Decode a shareable token back to inputs; returns null if it is malformed. */
export function decodeToken(token: string): CalcInput | null {
  let payload: string;
  try {
    payload = fromBase64Url(token);
  } catch {
    return null;
  }
  // Older tokens wrapped the readable query string (which contains "&"); decode those too.
  if (payload.includes("&")) return decodeState(payload);
  return decodeCompact(payload);
}

/** The query part of a legacy hash route (`#/path?query`), or "" — for links from the HashRouter era. */
function legacyHashQuery(): string {
  const hash = window.location.hash.replace(/^#/, "");
  const q = hash.indexOf("?");
  return q === -1 ? "" : hash.slice(q + 1);
}

/** Parse a query string into inputs: a compact `c=` token, or a legacy readable query. */
function parseQuery(qs: string): CalcInput | null {
  if (!qs) return null;
  const token = new URLSearchParams(qs).get("c");
  if (token) return decodeToken(token);
  return decodeState(qs); // tolerate a readable query too
}

/**
 * Parse calculator inputs from the current URL, or null if absent/invalid. Reads the real query
 * string first (current form, `/?c=…`), then falls back to the hash query so links shared during
 * the HashRouter era (`/#/?c=…`) keep working.
 */
export function readStateFromUrl(): CalcInput | null {
  if (typeof window === "undefined") return null;
  return parseQuery(window.location.search.replace(/^\?/, "")) ?? parseQuery(legacyHashQuery());
}

/** True if this document was loaded by a reload (rather than a fresh navigation to the URL). */
function isReload(): boolean {
  if (typeof performance === "undefined" || !performance.getEntriesByType) return false;
  const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  return nav?.type === "reload";
}

/**
 * Classify how this page load began, for analytics:
 * - `"ok"`  — the URL carried a valid state token, i.e. someone opened a shared link;
 * - `"bad"` — it carried a token that failed to decode (a broken/truncated shared link);
 * - `"none"` — no token, or a reload of a URL we ourselves wrote (not a genuine share arrival).
 *
 * Must be read once at page load (before the app rewrites the hash), not on every component
 * mount — the calculator writes `?c=…` continuously, so a later read would misread the user's own
 * token as an arrival. Reloads are excluded so refreshing your own work is not counted as a share.
 */
export function arrivalKind(): "none" | "ok" | "bad" {
  if (typeof window === "undefined") return "none";
  const hasToken = /[?&]c=/.test(window.location.search) || /[?&]c=/.test(window.location.hash);
  if (!hasToken) return "none";
  if (isReload()) return "none";
  return readStateFromUrl() ? "ok" : "bad";
}

/**
 * Write inputs into the real query string without navigating: keeps the current path and uses
 * replaceState (no history spam; the router listens to popstate, not replaceState, so it does not
 * react and re-render on every keystroke).
 */
export function writeStateToUrl(input: CalcInput): void {
  if (typeof window === "undefined") return;
  window.history.replaceState(null, "", `${window.location.pathname}?c=${encodeToken(input)}`);
}
