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

// Thresholds + marginal rates (percent) expected on the mainland for the baseline year. Used only
// as a scrape tripwire; deductions are derived, so they are not part of the fingerprint.
const EXPECTED_2026 = {
  I: [[0, 0], [106346, 2], [145470, 5], [198347, 7], [330539, 8], [660982, 6], [1150853, 7.5]],
  II: [[0, 0], [330539, 8], [660982, 6], [1150853, 7.5]],
  III: [[0, 1], [106346, 2], [145470, 5], [198347, 7], [330539, 8], [633931, 6], [1150853, 7.5]],
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
  return { lower, rate };
}

function extractRateTables(html) {
  const root = parse(html);
  const out = [];
  for (const table of root.querySelectorAll("table")) {
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
  // Flat tail = the last brackets at 6% then 7.5% with no threshold-continuous predecessor.
  const flatFrom = brackets.findIndex(
    (b, i) => i > 0 && (b.rate === 0.06 || b.rate === 0.075),
  );
  let ded = 0;
  return brackets.map((b, i) => {
    if (flatFrom !== -1 && i >= flatFrom) return { lower: b.lower, rate: b.rate, deduction: 0 };
    if (i > 0) ded = round2(ded + b.lower * (b.rate - brackets[i - 1].rate));
    return { lower: b.lower, rate: b.rate, deduction: ded };
  });
}

function deriveRegion(mainland) {
  // IV/V/VI = mainland I/II/III with thresholds × 1.25 (rounded), same rates, recomputed deductions.
  const scale = (t) =>
    withDeductions(t.map((b) => ({ lower: b.lower === 0 ? 0 : roundHalfUp(b.lower * 1.25), rate: b.rate })));
  return { IV: scale(mainland.I), V: scale(mainland.II), VI: scale(mainland.III) };
}

function verifyFingerprint(mainland) {
  for (const [id, expected] of Object.entries(EXPECTED_2026)) {
    const got = mainland[id].map((b) => [b.lower, round2(b.rate * 100)]);
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
  if (scraped.length < 3) fail(`expected ≥3 rate tables on the page, found ${scraped.length}`);
  const mainlandRaw = classifyMainland(scraped);

  if (args.year === 2026) verifyFingerprint(mainlandRaw);

  const mainland = {
    I: withDeductions(mainlandRaw.I),
    II: withDeductions(mainlandRaw.II),
    III: withDeductions(mainlandRaw.III),
  };
  const region = deriveRegion(mainlandRaw);
  const tables = { ...mainland, ...region };
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
