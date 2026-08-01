import { describe, it, expect } from "vitest";
import { LATEST_YEAR } from "@/engine/tables";
import { en } from "@/i18n/en";
import { pt } from "@/i18n/pt";
import { SITE_URL } from "@/config";
import { SEO_PAGES } from "@/seo/meta";
import { jsonLdFor } from "@/seo/jsonld";
import { GUIDE_META, GUIDES_INDEX_SEO } from "@/content/guides/registry";
import { GENERATED_FOR_YEAR } from "@/content/guides/computed";

// Drift guard for the yearly 2026 → 2027 rollover. The display tax-year must come from LATEST_YEAR
// (the newest registered tables), so after `make bump-year` every user-facing title/description
// follows automatically and a stale literal is caught here rather than shipped.
//
// A 4-digit year is legitimate in a legislative reference (Decreto-Lei n.º 97/2026, 48-A/2024) or an
// ISO date (2026-07-31); those are stripped before the check. Anything left that isn't LATEST_YEAR
// is a hardcoded tax-year that would go stale on the next bump. Scope is the display-copy surface;
// guide/glossary/how-it-works prose is covered once its figures are precomputed (see year-rollover).

const LAW_REF = /\b\d+(?:-[A-Z])?\/(?:19|20)\d{2}\b/g;
const ISO_DATE = /\b(?:19|20)\d{2}-\d{2}-\d{2}\b/g;
const YEAR = /\b(?:19|20)\d{2}\b/g;

/** 4-digit years in `s` that are neither LATEST_YEAR nor part of a law reference / ISO date. */
function strayYears(s: string): string[] {
  const stripped = s.replace(LAW_REF, "").replace(ISO_DATE, "");
  return [...stripped.matchAll(YEAR)].map((m) => m[0]).filter((y) => Number(y) !== LATEST_YEAR);
}

const LANGS = ["en", "pt"] as const;

describe("display tax-year tracks LATEST_YEAR", () => {
  // The i18n year strings must stay templated with {year} (rendered via fmt at the call sites) —
  // never a hardcoded year, which fmt would pass through unchanged and let drift.
  const templated: [string, string][] = LANGS.flatMap((l) => {
    const d = l === "en" ? en : pt;
    return [
      [`${l}.app.subtitle`, d.app.subtitle],
      [`${l}.pages.calculatorH1`, d.pages.calculatorH1],
      [`${l}.pages.calculatorIntro`, d.pages.calculatorIntro],
      [`${l}.pages.guidesIntro`, d.pages.guidesIntro],
    ] as [string, string][];
  });

  it.each(templated)("%s uses {year}, not a hardcoded year", (_k, value) => {
    expect(value).toContain("{year}");
    expect(value.match(YEAR) ?? []).toEqual([]);
  });

  // Build-time SEO copy is resolved with LATEST_YEAR at module load; assert no year from a previous
  // cycle survives anywhere in the metadata or JSON-LD.
  const resolved: [string, string][] = [];
  for (const [key, byLang] of Object.entries(SEO_PAGES))
    for (const l of LANGS)
      resolved.push(
        [`meta ${key} ${l} title`, byLang[l].title],
        [`meta ${key} ${l} description`, byLang[l].description],
      );
  for (const m of GUIDE_META)
    for (const l of LANGS)
      resolved.push(
        [`guide ${m.id} ${l} title`, m.title[l]],
        [`guide ${m.id} ${l} description`, m.description[l]],
        [`guide ${m.id} ${l} navLabel`, m.navLabel[l]],
      );
  for (const l of LANGS) {
    resolved.push([`guides-index ${l} description`, GUIDES_INDEX_SEO[l].description]);
    resolved.push([`jsonld ${l} home`, jsonLdFor(l, "/", `${SITE_URL}/`)]);
  }

  it.each(resolved)("%s carries no stray tax-year", (_k, value) => {
    expect(strayYears(value)).toEqual([]);
  });

  // The guide worked-example figures (computed.ts) are regenerated per year by bin/precompute-guides.
  // If the tables are bumped but the figures aren't regenerated, the guides would show last year's
  // numbers — this catches that before it ships (run `make precompute-guides`).
  it("guide figures were generated for the latest registered year", () => {
    expect(GENERATED_FOR_YEAR).toBe(LATEST_YEAR);
  });
});
