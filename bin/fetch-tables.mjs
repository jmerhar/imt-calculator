#!/usr/bin/env node
// Regenerate an IMT rate-table data file (src/engine/tables/<year>.ts) from the authoritative
// AT source, so future tax years can be added without hand-transcribing figures.
//
//   node bin/fetch-tables.mjs 2026                      # fetch live, verify against the baseline
//   node bin/fetch-tables.mjs 2027                      # fetch live, write a new 2027.ts
//   node bin/fetch-tables.mjs 2026 --source <file|url>  # override the source (e.g. a local copy)
//   node bin/fetch-tables.mjs 2026 --dry-run            # print the generated .ts, do not write
//   node bin/fetch-tables.mjs 2026 --force              # write even for the baseline year
//
// It scrapes the Portal das Finanças consolidated CIMT art. 17.º page for the three MAINLAND
// tables (I HPP, II HPP-Jovem, III habitação) and DERIVES the autonomous-region tables
// (IV/V/VI) as the mainland thresholds × 1.25 (Lei n.º 21/90). Bracket deductions are recomputed
// from thresholds + rates via the continuity rule, so only thresholds and marginal rates are
// scraped. For the baseline year it self-checks the scrape against EXPECTED_2026 and fails loudly
// on drift; the app never fetches at runtime — the committed .ts is the single source of truth.

import { parse } from "node-html-parser";
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");
const DEFAULT_URL =
  "https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cimt/Pages/cimt17.aspx";

// Full expected mainland tables for the baseline year — thresholds, rates AND derived deductions —
// as a scrape/derivation tripwire. Comparing deductions too catches a bad flat-band detection or a
// continuity error, not just a mis-scraped threshold. Values are [lower, rate, deduction].
// Includes the derived autonomous-region tables (IV–VI) so a regression in the ×1.25 scaling or
// its deduction recompute is caught too, not only a mainland scrape drift.
const EXPECTED_2026 = {
  I: [[0, 0, 0], [106346, 0.02, 2126.92], [145470, 0.05, 6491.02], [198347, 0.07, 10457.96], [330539, 0.08, 13763.35], [660982, 0.06, 0], [1150853, 0.075, 0]],
  II: [[0, 0, 0], [330539, 0.08, 26443.12], [660982, 0.06, 0], [1150853, 0.075, 0]],
  III: [[0, 0.01, 0], [106346, 0.02, 1063.46], [145470, 0.05, 5427.56], [198347, 0.07, 9394.5], [330539, 0.08, 12699.89], [633931, 0.06, 0], [1150853, 0.075, 0]],
  IV: [[0, 0, 0], [132933, 0.02, 2658.66], [181838, 0.05, 8113.8], [247934, 0.07, 13072.48], [413174, 0.08, 17204.22], [826228, 0.06, 0], [1438566, 0.075, 0]],
  V: [[0, 0, 0], [413174, 0.08, 33053.92], [826228, 0.06, 0], [1438566, 0.075, 0]],
  VI: [[0, 0.01, 0], [132933, 0.02, 1329.33], [181838, 0.05, 6784.47], [247934, 0.07, 11743.15], [413174, 0.08, 15874.89], [792414, 0.06, 0], [1438566, 0.075, 0]],
};

// Year-level constants (CIMT art. 17.º n.º 4/n.º 10 + TGIS verbas 1.1 & 17.1). Stable across the
// annual table refresh; carried into each generated file and flagged for review in its header.
const CONSTANTS = {
  nonResidentRate: 0.075,
  taxHavenRate: 0.1,
  stampDutyTransferRate: 0.008,
  mortgageRates: { lt1PerMonth: 0.0004, y1to5: 0.005, ge5: 0.006 },
};

function fail(msg) {
  console.error(`✗ ${msg}`);
  process.exit(1);
}

function parseArgs(argv) {
  const args = { force: false, dryRun: false, source: DEFAULT_URL, out: null, year: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--force") args.force = true;
    else if (a === "--dry-run") args.dryRun = true;
    else if (a === "--source") args.source = argv[++i];
    else if (a === "--out") args.out = argv[++i];
    else if (/^\d{4}$/.test(a)) args.year = Number(a);
    else fail(`unrecognised argument: ${a}`);
  }
  if (!args.year) fail("usage: fetch-tables.mjs <year> [--source <file|url>] [--dry-run] [--force]");
  return args;
}

async function readSource(source) {
  if (/^https?:\/\//i.test(source)) {
    const res = await fetch(source);
    if (!res.ok) fail(`fetch ${source} → HTTP ${res.status}`);
    return await res.text();
  }
  const path = resolve(ROOT, source);
  if (!existsSync(path)) fail(`source not found: ${path}`);
  return readFileSync(path, "utf-8");
}

const clean = (s) =>
  (s ?? "")
    .replace(/[\u200b\u00a0\u2009]/g, " ")
    .replace(/\(a\)|\(b\)/gi, " ")
    .replace(/&#160;|&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

function rowToBracket(cells) {
  const rangeText = clean(cells[0]);
  const rateText = clean(cells[1]);
  const nums = [...rangeText.matchAll(/\d[\d ]*/g)].map((m) => Number(m[0].replace(/\s/g, "")));
  let lower;
  if (/^Até/i.test(rangeText)) lower = 0;
  else if (/^De mais de/i.test(rangeText)) lower = nums[0];
  else if (/^Superior a/i.test(rangeText)) lower = nums[0];
  else return null;
  const rateMatch = rateText.match(/(\d+(?:,\d+)?)/);
  if (!rateMatch) return null;
  const rate = Number(rateMatch[1].replace(",", ".")) / 100;
  // Flat ("taxa única") bands are marked as such in the source, so detect them from the text
  // rather than by matching specific rate values (which could change in a future year).
  const flat = /[uú]nica/i.test(rateText);
  return { lower, rate, flat };
}

function extractRateTables(html) {
  const root = parse(html);
  const out = [];
  for (const table of root.querySelectorAll("table")) {
    // Skip layout/container tables that merely wrap the real rate tables — otherwise the outer
    // table's rows (all of a+b+c) look like one giant table and confuse classification.
    if (table.querySelectorAll("table").length > 0) continue;
    const brackets = [];
    for (const tr of table.querySelectorAll("tr")) {
      const cells = tr.querySelectorAll("td,th").map((c) => c.text);
      if (cells.length < 2) continue;
      if (!/^(Até|De mais de|Superior a)/i.test(clean(cells[0]))) continue;
      const b = rowToBracket(cells);
      if (b) brackets.push(b);
    }
    if (brackets.length >= 4) out.push(brackets);
  }
  return out;
}

// Classify each scraped table by its rate signature rather than document order.
function classifyMainland(tables) {
  const byId = {};
  for (const t of tables) {
    const firstRate = Math.round(t[0].rate * 100);
    if (firstRate === 1) byId.III = t;
    else if (t.length <= 4) byId.II = t;
    else byId.I = t;
  }
  for (const id of ["I", "II", "III"]) if (!byId[id]) fail(`could not identify mainland table ${id}`);
  return byId;
}

const roundHalfUp = (x) => Math.round(x);
const round2 = (x) => Math.round((x + Number.EPSILON) * 100) / 100;

// Fill in the "parcela a abater" for each bracket: 0 for the flat (taxa única) tail brackets and,
// for the progressive prefix, the continuity value deduction_k = deduction_{k-1} + lower_k*(r_k−r_{k-1}).
function withDeductions(brackets) {
  // Flat ("taxa única") brackets carry deduction 0 and are flagged from the source, so this holds
  // even if a future year changes the rates or thresholds where the flat tail begins.
  let ded = 0;
  let prev = null;
  return brackets.map((b) => {
    if (b.flat) return { lower: b.lower, rate: b.rate, deduction: 0 };
    if (prev) ded = round2(ded + b.lower * (b.rate - prev.rate));
    prev = b;
    return { lower: b.lower, rate: b.rate, deduction: ded };
  });
}

function deriveRegion(mainland) {
  // IV/V/VI = mainland I/II/III with thresholds × 1.25 (rounded), same rates, recomputed deductions.
  const scale = (t) =>
    withDeductions(
      t.map((b) => ({ lower: b.lower === 0 ? 0 : roundHalfUp(b.lower * 1.25), rate: b.rate, flat: b.flat })),
    );
  return { IV: scale(mainland.I), V: scale(mainland.II), VI: scale(mainland.III) };
}

// Compare the built tables (thresholds, rates AND deductions) — mainland scrape and the derived
// regional tables — against the committed baseline, failing loudly on any drift.
function verifyFingerprint(tables) {
  for (const [id, expected] of Object.entries(EXPECTED_2026)) {
    const got = tables[id].map((b) => [b.lower, b.rate, b.deduction]);
    if (JSON.stringify(got) !== JSON.stringify(expected)) {
      fail(`baseline mismatch in table ${id}\n  expected ${JSON.stringify(expected)}\n  got      ${JSON.stringify(got)}`);
    }
  }
}

function renderTs(year, tables) {
  const bracketLine = (b) => `      { lower: ${b.lower}, rate: ${b.rate}, deduction: ${b.deduction} },`;
  const tableBlock = (id) => `    ${id}: [\n${tables[id].map(bracketLine).join("\n")}\n    ],`;
  const ids = ["I", "II", "III", "IV", "V", "VI"];
  return `import type { YearData } from "@/engine/types";

// GENERATED by bin/fetch-tables.mjs from the AT CIMT art. 17.º source. Mainland tables (I–III)
// are scraped; autonomous-region tables (IV–VI) are the mainland thresholds × 1.25 (Lei n.º 21/90)
// with deductions recomputed. Year-level constants are carried forward — REVIEW them against the
// year's State Budget / any CIMT change before trusting a freshly generated file.

export const data${year}: YearData = {
  year: ${year},
  tables: {
${ids.map(tableBlock).join("\n")}
  },
  nonResidentRate: ${CONSTANTS.nonResidentRate},
  taxHavenRate: ${CONSTANTS.taxHavenRate},
  stampDutyTransferRate: ${CONSTANTS.stampDutyTransferRate},
  mortgageRates: { lt1PerMonth: ${CONSTANTS.mortgageRates.lt1PerMonth}, y1to5: ${CONSTANTS.mortgageRates.y1to5}, ge5: ${CONSTANTS.mortgageRates.ge5} },
};
`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const html = await readSource(args.source);
  const scraped = extractRateTables(html);
  // Exactly the three mainland tables (I HPP, II Jovem, III habitação) are expected; a different
  // count means the page changed shape and classification can't be trusted — stop and get a human.
  if (scraped.length !== 3) fail(`expected exactly 3 rate tables on the page, found ${scraped.length}`);
  const mainlandRaw = classifyMainland(scraped);

  const mainland = {
    I: withDeductions(mainlandRaw.I),
    II: withDeductions(mainlandRaw.II),
    III: withDeductions(mainlandRaw.III),
  };
  const region = deriveRegion(mainlandRaw);
  const tables = { ...mainland, ...region };
  if (args.year === 2026) verifyFingerprint(tables);

  const ts = renderTs(args.year, tables);

  const target = resolve(ROOT, args.out ?? `src/engine/tables/${args.year}.ts`);
  const isBaseline = args.year === 2026 && !args.out;

  if (args.dryRun) {
    process.stdout.write(ts);
    console.error(`\n✓ parsed + derived ${args.year} tables (dry run, nothing written)`);
    return;
  }
  if (isBaseline && !args.force) {
    console.error(`✓ ${args.year} scrape matches the committed baseline (fingerprint OK). ` + `Use --force to overwrite src/engine/tables/2026.ts.`);
    return;
  }
  writeFileSync(target, ts);
  console.error(`✓ wrote ${target}\n  Remember to register the year in src/engine/tables/index.ts.`);
}

main().catch((e) => fail(e.stack || String(e)));
