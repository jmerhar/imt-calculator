import type { Buyer, CalcInput } from "@/engine/types";
import { LATEST_YEAR } from "@/engine/tables";

/** A single resident individual owning the whole property — the starting point for a new calc. */
export function defaultBuyer(): Buyer {
  return {
    share: 1,
    type: "individual",
    taxHaven: false,
    residency: "resident",
    exception: "none",
    jovem: false,
  };
}

/** Sensible starting inputs: buying an own permanent home on the mainland, latest tax year. */
export function defaultInput(): CalcInput {
  return {
    year: LATEST_YEAR,
    location: "mainland",
    intendedUse: "own_permanent",
    price: 250000,
    buyers: [defaultBuyer()],
  };
}
