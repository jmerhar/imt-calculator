// One-shot yearly rollover: fetch the new AT tables, register the year, recompute the guide
// figures, regenerate the OG images, and run the full check suite. Usage:
//
//   node bin/bump-year.mjs 2027        (or: make bump-year YEAR=2027)
//
// This does the mechanical work; a human still verifies the scraped tables against the AT source
// and skims the guide prose for qualitative rule changes (see docs/year-rollover.md). Steps are
// idempotent enough to re-run: re-registering an already-present year is skipped.

import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = process.cwd();
const year = Number(process.argv[2]);
if (!Number.isInteger(year) || year < 2000 || year > 2100) {
  console.error("usage: bump-year.mjs <year>   e.g. bump-year.mjs 2027");
  process.exit(1);
}

const run = (cmd) => {
  console.error(`\n$ ${cmd}`);
  execSync(cmd, { stdio: "inherit", cwd: ROOT });
};

// 1. Fetch + parse the AT practical tables for the year (writes src/engine/tables/<year>.ts).
run(`node bin/fetch-tables.mjs ${year}`);
const tablePath = resolve(ROOT, `src/engine/tables/${year}.ts`);
if (!existsSync(tablePath)) {
  console.error(`\n✗ ${tablePath} was not written — aborting. Check the fetch output above.`);
  process.exit(1);
}

// 2. Register the year in the tables index (import + YEARS entry), so LATEST_YEAR advances to it.
const indexPath = resolve(ROOT, "src/engine/tables/index.ts");
let index = readFileSync(indexPath, "utf8");
if (index.includes(`data${year}`)) {
  console.error(`\n✓ ${year} already registered in src/engine/tables/index.ts`);
} else {
  const lines = index.split("\n");
  const lastImport = lines.map((l) => /^import \{ data\d+ \} from /.test(l)).lastIndexOf(true);
  const yearsOpen = lines.findIndex((l) => l.includes("const YEARS"));
  if (lastImport === -1 || yearsOpen === -1) {
    console.error("\n✗ could not locate the import block or YEARS map in index.ts — register by hand.");
    process.exit(1);
  }
  // Insert the YEARS entry first (higher line number) so the import insertion doesn't shift it.
  lines.splice(yearsOpen + 1, 0, `  ${year}: data${year},`);
  lines.splice(lastImport + 1, 0, `import { data${year} } from "./${year}";`);
  index = lines.join("\n");
  writeFileSync(indexPath, index);
  console.error(`\n✓ registered ${year} in src/engine/tables/index.ts`);
}

// 3. Recompute the guides' worked-example figures from the now-latest tables.
run("node bin/precompute-guides.mjs");

// 4. Regenerate the per-language OG images (they read the latest registered year).
run("node scripts/gen-og.mjs");

// 5. Lint, type-check, test and gate coverage. If this fails it is usually a test that pinned a
//    figure to the old latest year — the message says which; fix and re-run `make check`.
try {
  run("make check");
} catch {
  console.error("\n✗ `make check` failed — see above. Fix the reported items, then re-run `make check`.");
}

console.error(`
──────────────────────────────────────────────────────────────
  Year bumped to ${year}. Before committing, verify by hand:
    1. src/engine/tables/${year}.ts matches the AT practical tables
       (Ofício Circulado) — this is YMYL data, check it against the source.
    2. Skim the guides for any qualitative rule change (not just numbers)
       the tables can't capture — the figures updated automatically.
    3. git diff src/content/guides/computed.ts — sanity-check the new figures.
  Then commit. See docs/year-rollover.md.
──────────────────────────────────────────────────────────────`);
