# Yearly tax-year rollover (2026 → 2027 → …)

Portugal re-indexes the IMT brackets every year through the Orçamento do Estado, and the
Autoridade Tributária (AT) publishes the practical tables via an *Ofício Circulado* in early
January. This is the once-a-year task to move the site to the new tables.

The site is built so a rollover is **one command plus one human review** — not a scavenger hunt for
hardcoded "2026"s.

## How it's wired (why the rollover is small)

- **One source of truth for the year.** `LATEST_YEAR` in `src/engine/tables/index.ts` is the newest
  registered `tables/<year>.ts`. Every user-facing year — the header subtitle, page titles/H1s,
  meta descriptions, guide titles, OG images — derives from it. Nothing reads the calendar clock, so
  the site never advertises a year it can't compute.
- **Evergreen slugs.** Guide URLs carry no year (`/guides/imt-jovem`, not `…-2026`), so a rollover
  doesn't break URLs or discard ranking history. The year stays in the title/H1 for SERP freshness.
- **Precomputed guide figures.** Every euro amount, ceiling, bracket rate and deduction in the guide
  prose is a `{token}` resolved from `src/content/guides/computed.ts`, which `bin/precompute-guides`
  generates straight from the engine. Bumping the tables regenerates them all.
- **Literal by design:** statutory rates (7.5% non-resident, 0.8% stamp, 10% tax-haven, the ×1.25
  regional multiplier, mortgage verba rates) and legislative history (Decreto-Lei n.º 97/2026,
  "25 May 2026", "Since 2026") are *not* templated — they don't re-index annually, and a change to
  them is a law event that warrants a full content review, not a routine bump.

## The steps

When AT has published the new practical tables (≈ early January):

```
make bump-year YEAR=2027
```

That runs, in order:

1. **`fetch-tables`** — scrapes the AT CIMT art. 17.º consolidated page, derives the autonomous-region
   tables ×1.25 (Lei n.º 21/90), and writes `src/engine/tables/2027.ts`. (The 2026 baseline
   self-check only guards 2026; a new year is scraped and written.)
2. **Register** — adds the import and `YEARS` entry in `src/engine/tables/index.ts`, so `LATEST_YEAR`
   becomes 2027 and the whole site follows.
3. **`precompute-guides`** — regenerates `src/content/guides/computed.ts` from the 2027 tables.
4. **`gen-og`** — regenerates `public/og-en.png` / `og-pt.png` with the new year.
5. **`make check`** — lint, type-check, tests, coverage gate.

## The human review (do not skip — this is YMYL)

`make bump-year` does the mechanical work. Before committing, verify by hand:

1. **The scraped tables.** Open `src/engine/tables/2027.ts` and check the thresholds, rates and
   deductions against the AT *Ofício Circulado* (and CIMT art. 17.º). This is legal-adjacent data;
   a scraper reading a government HTML page can drift. Confirm it.
2. **`git diff src/content/guides/computed.ts`** — sanity-check the regenerated figures look right
   (e.g. the mainland IMT-Jovem ceiling moved up a couple of percent, not by 10×).
3. **Guide prose logic.** The *numbers* update automatically, but the surrounding *wording* does not.
   If a rule changed shape (a new bracket, a changed rate, a restructured relief), re-read the
   affected guide so the explanation still matches — the figures alone can't tell you that.

Then commit (e.g. `feat: roll tax tables and figures over to 2027`) and push. The deploy workflow
publishes; resubmit nothing — the sitemap regenerates on build.

## What can go wrong

- **`fetch-tables` fails / finds ≠ 3 mainland tables.** The AT page changed shape. Fetch by hand into
  a file and pass `--source <file>`, or adjust the parser in `bin/fetch-tables.mjs`. It fails loudly
  rather than guessing.
- **`make check` fails on a pinned figure.** A test asserted a value for the *old* latest year.
  Tests that mean "the latest year" already derive from `LATEST_YEAR`; tests that lock a *specific
  historical year* (e.g. the 2026 Table III figure in `imt.test.ts`) are correct to keep literal,
  because that year stays registered. `year.test.ts` will fail if `computed.ts` wasn't regenerated
  (`GENERATED_FOR_YEAR` must equal `LATEST_YEAR`) — re-run `make precompute-guides`.

## Later: make it a PR (Option D)

The design supports upgrading to a January GitHub Action that runs `make bump-year` and, if AT has
published, opens a **PR** with the new tables + regenerated figures/OG for a human to verify and
merge. That keeps the YMYL human gate while removing the "remember to do it" step. It's a thin
wrapper over `bin/bump-year.mjs`; not built yet.
