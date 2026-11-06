.PHONY: install dev preview lint test coverage check build clean fetch-tables precompute-guides bump-year ga-setup og-image icons psi

# help, devtools-update, coverage-tooling and devtools-check come from jmerhar/devtools; make
# fetches them on the first run and whenever devtools.toml changes.
.DEFAULT_GOAL := help
include .devtools/make/devtools.mk
.devtools/make/devtools.mk: devtools.toml bin/devtools-fetch.sh
	bin/devtools-fetch.sh

##@ Setup

install: ## Install dependencies (npm ci when a lockfile exists, else npm install)
	@if [ -f package-lock.json ]; then npm ci; else npm install; fi

##@ Dev

dev: ## Start the Vite dev server (http://localhost:5173)
	npm run dev

preview: ## Build then serve the production bundle locally
	npm run build && npm run preview

##@ Quality

lint: ## ESLint + TypeScript type-check
	npm run lint && npm run typecheck

test: ## Run the unit test suite
	npm run test

# The coverage summary and gate are shared tooling from jmerhar/coverage, configured by coverage.toml
# and fetched with the rest of the shared tooling, so a local gate enforces exactly what CI does.
coverage: coverage-tooling ## Run tests with coverage and enforce the gate
	npm run test:cov && python3 $(COVERAGE_TOOLING)/coverage-report.py --gate

check: lint test coverage devtools-check ## Lint + test + coverage gate + devtools (gate a commit on this)

##@ Build

build: ## Type-check and produce the production build in dist/
	npm run build

clean: ## Remove build + coverage artifacts (all regenerable)
	rm -rf dist coverage coverage-upload node_modules/.vite

##@ Data

fetch-tables: ## Fetch AT IMT tables for a year and regenerate the .ts (usage: make fetch-tables YEAR=2026)
	@test -n "$(YEAR)" || { echo "Usage: make fetch-tables YEAR=2026"; exit 1; }
	node bin/fetch-tables.mjs $(YEAR)

precompute-guides: ## Recompute the guides' worked-example figures from the engine into computed.ts
	node bin/precompute-guides.mjs

bump-year: ## Roll over to a new tax year: fetch + register tables, recompute figures, regen OG, check (usage: make bump-year YEAR=2027)
	@test -n "$(YEAR)" || { echo "Usage: make bump-year YEAR=2027"; exit 1; }
	node bin/bump-year.mjs $(YEAR)

##@ Analytics

ga-setup: ## Register GA4 custom dimensions/metrics, idempotently (uses ./ga-key.json; ARGS=--dry-run to preview)
	node bin/ga-setup.mjs $(ARGS)

og-image: ## Regenerate the per-language Open Graph share images (public/og-en.png, og-pt.png)
	node scripts/gen-og.mjs

icons: ## Regenerate the PNG app icons (apple-touch-icon + PWA manifest) from favicon.svg
	node scripts/gen-icons.mjs

psi: ## PageSpeed Insights report (uses ./ga-key.json; URL=… STRATEGY=mobile|desktop)
	node bin/psi.mjs $(URL) --strategy $(or $(STRATEGY),mobile)
