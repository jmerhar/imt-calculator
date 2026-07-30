import type { YearData } from "@/engine/types";
import { data2026 } from "@/engine/tables/2026";

// Registry of tax-year data. To support 2027, run `make fetch-tables YEAR=2027` (which writes
// `2027.ts` from the AT source) and add it here — the year selector picks it up automatically.
const YEARS: Record<number, YearData> = {
  2026: data2026,
};

/** Tax years with data, most recent first. */
export const AVAILABLE_YEARS: number[] = Object.keys(YEARS)
  .map(Number)
  .sort((a, b) => b - a);

/** The most recent year with data — the sensible default. */
export const LATEST_YEAR: number = AVAILABLE_YEARS[0];

/** Year data, or `undefined` if that year is not bundled. */
export function getYearData(year: number): YearData | undefined {
  return YEARS[year];
}
