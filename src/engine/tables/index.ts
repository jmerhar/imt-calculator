import type { YearData } from "@/engine/types";
// Relative (not "@/") so build-time SEO modules that need LATEST_YEAR can be reached when Vite
// pre-bundles vite.config.ts with esbuild, which does not apply the "@" alias.
import { data2026 } from "./2026";

// Registry of tax-year data; the newest registered year is LATEST_YEAR, which the whole UI tracks.
// To add a year, run `make bump-year YEAR=…` — it fetches the AT tables, adds the entry here, and
// recomputes the guide figures (see docs/year-rollover.md). The year selector picks it up here.
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
