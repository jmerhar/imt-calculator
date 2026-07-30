# IMT Calculator · Portugal 2026

[![CI](https://github.com/jmerhar/imt-calculator/actions/workflows/ci.yml/badge.svg)](https://github.com/jmerhar/imt-calculator/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/jmerhar/imt-calculator/branch/main/graph/badge.svg)](https://app.codecov.io/gh/jmerhar/imt-calculator)

A fully client-side calculator for the Portuguese property-transfer tax (**IMT** — Imposto
Municipal sobre as Transmissões Onerosas de Imóveis) and the associated **stamp duty** (Imposto
do Selo), for purchases under the 2026 rules — including the non-resident regime introduced by
**Decreto-Lei n.º 97/2026**.

**Live:** https://calc-imt.online/

No backend, no tracking: it runs entirely in the browser and is deployed to GitHub Pages.

> ⚠️ This is an estimate, **not tax advice**. Confirm any figure with the Autoridade Tributária or a
> notary. See the in-app *How it works* page for the exact rules and sources.

## Features

- IMT computed per buyer with the progressive AT tables (mainland + Açores/Madeira, incl. IMT Jovem).
- The co-ownership **totality rule** (CIMT art. 17.º n.º 6 a) — several buyers in one deed get no
  band-splitting advantage.
- **Non-resident** flat 7.5% (art. 17.º n.º 10) with its exceptions and the reclaim mechanism, plus
  the **tax-haven** 10% for entities (n.º 4).
- Stamp duty on the transfer (TGIS verba 1.1) and, optionally, on the mortgage (verba 17.1).
- Unlimited buyers with custom shares, VPT tax-base handling, shareable-link state, print view,
  English/Portuguese, and a light/dark theme.

## Quick start

```sh
make install   # install dependencies
make dev       # dev server at http://localhost:5173
make check     # lint + type-check + tests + coverage gate
make build     # production build into dist/
make help      # list every target
```

Requires Node ≥ 20 and (for the coverage gate) Python 3.

## Data & sources

Rates and tables are for the **2026** tax year, from:

- **CIMT art. 17.º** (Portal das Finanças) and AT **Ofício Circulado n.º 40129/2026** — IMT rates & tables;
- **Decreto-Lei n.º 97/2026** — the non-resident, tax-haven and totality rules;
- **Tabela Geral do Imposto do Selo**, verbas 1.1 and 17 — stamp duty.

Copies of the primary sources are kept in [`reference/`](reference/). The autonomous-region tables
are the mainland thresholds × 1.25 (Lei n.º 21/90).

### Updating for a future tax year

The table data is bundled per year, so the app stays offline. When the AT publishes the next year's
tables:

```sh
make fetch-tables YEAR=2027     # scrapes CIMT art. 17.º, derives the regions, writes src/engine/tables/2027.ts
```

The fetcher self-checks the 2026 scrape against a committed fingerprint. After generating a new year,
register it in `src/engine/tables/index.ts` and review the carried-forward constants — the year
selector then picks it up automatically.

## Project layout

```
src/engine/     pure tax logic (imt.ts), bracket tables, deterministic calc IDs — heavily unit-tested
src/state/      URL state serialisation + input defaults
src/i18n/       EN/PT dictionaries (parity-checked) + provider
src/theme/      light/dark theme provider
src/components/ layout, form controls, buyer card, results panel
src/pages/      calculator, glossary, how-it-works
src/content/    bilingual glossary & how-it-works content
bin/            fetch-tables.mjs (table maintenance)
scripts/        coverage gate + publish
reference/      primary-source documents
```

## Testing & coverage

`make check` runs ESLint, `tsc`, the Vitest suite and a coverage gate
(`scripts/coverage-report.py --gate`, 95% line floor). CI additionally uploads to Codecov
(informational) and publishes the HTML report to the shared `jmerhar/coverage` site.

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds and deploys to GitHub
Pages (Pages source must be **GitHub Actions**). The site is served at the custom domain
`calc-imt.online` (a `public/CNAME` keeps the domain across deploys), so the Vite `base` is `/`.
Coverage publishing needs a `COVERAGE_PAGES_TOKEN` repo secret (a PAT with write access to
`jmerhar/coverage`); it is skipped gracefully if absent. The Codecov upload uses a `CODECOV_TOKEN`
repo secret.

## Tech stack

Vite · React · TypeScript · Vitest. No UI framework — the design system is hand-authored CSS.

## License

GPL-3.0-or-later — see [LICENSE](LICENSE).
