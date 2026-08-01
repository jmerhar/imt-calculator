// Precompute the worked-example figures cited in the guide prose, straight from the engine's tax
// tables, and write them to src/content/guides/computed.ts. The guides interpolate these tokens
// (see src/content/guides/figures.ts), so every euro amount, threshold, deduction and bracket rate
// shown in a guide is the exact figure the calculator would produce for the latest registered year
// — and the yearly rollover regenerates them in one step (`make bump-year`) instead of by hand.
//
// Runs the TypeScript engine through Vite's SSR module loader (no separate TS runner needed). The
// output is committed; the app and build read the static file, never this script.

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createServer } from "vite";

const server = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
  logLevel: "warn",
});

let out;
try {
  const { calculate, pickBracket } = await server.ssrLoadModule("/src/engine/imt.ts");
  const { getYearData, LATEST_YEAR } = await server.ssrLoadModule("/src/engine/tables/index.ts");
  const { formatAmount, formatPercent } = await server.ssrLoadModule("/src/format.ts");
  const { defaultInput, defaultBuyer } = await server.ssrLoadModule("/src/state/defaults.ts");

  const year = getYearData(LATEST_YEAR);
  if (!year) throw new Error(`No tables registered for ${LATEST_YEAR}`);

  // The scenarios the guides walk through, all at €400,000 (the figure the prose uses).
  const base = { ...defaultInput(), price: 400000 };
  const jovem400 = calculate({ ...base, buyers: [{ ...defaultBuyer(), jovem: true }] });
  const ordinary400 = calculate({ ...base, buyers: [defaultBuyer()] }); // own home, Table I
  const resSecondary400 = calculate({ ...base, intendedUse: "secondary", buyers: [defaultBuyer()] }); // Table III
  const azores400 = calculate({ ...base, location: "azores", buyers: [defaultBuyer()] }); // Table IV
  const nonResident400 = calculate({
    ...base,
    intendedUse: "secondary",
    buyers: [{ ...defaultBuyer(), residency: "non_resident", exception: "none" }],
  }); // flat 7.5%

  // IMT-Jovem ceilings are the upper bound of the youth tables' 0% band (Table II mainland, V regions);
  // the 8% band's upper bound is where the youth relief gives way to the ordinary rates.
  const capMainland = year.tables.II[1].lower;
  const capRegion = year.tables.V[1].lower;
  const jovemUpper = year.tables.II[2].lower;
  const jovemRate = year.tables.II[1].rate;
  const jovemExcess = 400000 - capMainland;

  // The Table IV bracket a €400,000 own home falls into, for the Azores worked example.
  const azBracket = pickBracket(400000, year.tables.IV);
  const azIndex = year.tables.IV.findIndex((b) => b.lower === azBracket.lower);
  const azBandHi = year.tables.IV[azIndex + 1]?.lower ?? azBracket.lower;

  // "About" figures are rounded to the nearest €100 — a natural granularity for an approximation.
  const round100 = (v) => Math.round(v / 100) * 100;

  // Per language: number strings only (no € / %), except rate tokens which carry the % — the prose
  // supplies the € prefix. Amounts to cents (2 dp), thresholds/approximations to whole euros (0 dp).
  const figures = (lang) => {
    const n = (v, d = 2) => formatAmount(v, lang, d);
    const p = (frac, d = 0) => formatPercent(frac, lang, d);
    return {
      // Shared: the 0.8% acquisition stamp duty on a €400k purchase (before any IMT-Jovem relief).
      stamp400: n(ordinary400.totalStampDutyTransfer),
      // IMT Jovem
      jovemCap: n(capMainland, 0),
      jovemCapRegion: n(capRegion, 0),
      jovemUpper: n(jovemUpper, 0),
      jovemRate: p(jovemRate, 0),
      jovemExcess: n(jovemExcess, 0),
      jovemImt: n(jovem400.totalImt),
      jovemStamp: n(jovem400.totalStampDutyTransfer),
      jovemTotal: n(jovem400.grandTotal),
      jovemOrdinaryImt: n(ordinary400.totalImt),
      jovemOrdinaryTotal: n(ordinary400.grandTotal),
      jovemSaving: n(round100(ordinary400.grandTotal - jovem400.grandTotal), 0),
      // Non-residents (flat 7.5%); the resident/secondary comparison (Table III) is table-driven.
      nonResidentImt: n(nonResident400.totalImt),
      nonResidentTotal: n(nonResident400.grandTotal),
      nonResidentEffRate: p(nonResident400.effectiveRate, 1),
      nonResidentOrdinaryImt: n(round100(resSecondary400.totalImt), 0),
      // Azores / Madeira (Table IV vs mainland Table I)
      regionBandLo: n(azBracket.lower, 0),
      regionBandHi: n(azBandHi, 0),
      regionRate: p(azBracket.rate, 0),
      regionDeduction: n(azBracket.deduction),
      regionImt: n(azores400.totalImt),
      regionTotal: n(azores400.grandTotal),
      regionMainlandImt: n(ordinary400.totalImt),
      regionMainlandTotal: n(ordinary400.grandTotal),
      regionDiff: n(round100(ordinary400.grandTotal - azores400.grandTotal), 0),
    };
  };

  const en = figures("en");
  const pt = figures("pt");
  const keyLines = (o) =>
    Object.entries(o)
      .map(([k, v]) => `    ${k}: ${JSON.stringify(v)},`)
      .join("\n");

  out = `// GENERATED by bin/precompute-guides.mjs — do not edit by hand.
// Worked-example figures cited in the guide prose, computed from the engine's tax tables for the
// latest registered year so a guide can never show a figure the calculator wouldn't. Regenerate
// with \`make precompute-guides\` (run automatically by \`make bump-year\`). Values are pre-formatted
// per language (thousands separators, decimal comma vs point); the prose adds the € prefix.

import type { Lang } from "@/i18n/lang";

/** The tax year these figures were computed for; asserted to equal LATEST_YEAR in the test suite. */
export const GENERATED_FOR_YEAR = ${LATEST_YEAR};

export const FIGURES: Record<Lang, Record<string, string>> = {
  en: {
${keyLines(en)}
  },
  pt: {
${keyLines(pt)}
  },
};
`;

  console.log(`precompute-guides: computed guide figures for ${LATEST_YEAR}`);
  console.log(`  IMT Jovem €400k: IMT €${en.jovemImt}, stamp €${en.jovemStamp}, total €${en.jovemTotal}`);
  console.log(`  mainland cap €${en.jovemCap}, region cap €${en.jovemCapRegion}`);
  console.log(`  Azores €400k: IMT €${en.regionImt}, total €${en.regionTotal}`);
} finally {
  await server.close();
}

const dest = resolve(process.cwd(), "src/content/guides/computed.ts");
writeFileSync(dest, out);
console.log(`precompute-guides: wrote ${dest}`);
