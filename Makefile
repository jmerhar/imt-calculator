.PHONY: coverage-tooling help install dev preview lint test coverage check build clean fetch-tables precompute-guides bump-year ga-setup og-image icons psi

help: ## Show available commands
	@grep -E '^[a-zA-Z_-]+:.*##|^##@' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*## "}; /^##@/ {printf "\n\033[1m%s\033[0m\n", substr($$0, 5); next} {printf "  \033[36mmake %-16s\033[0m %s\n", $$1, $$2}'

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

# The coverage summary and gate are shared tooling from jmerhar/coverage, configured by coverage.toml.
# It is fetched rather than vendored, so a local gate enforces exactly what CI does.
COVERAGE_REPORT := .coverage-report.py

# Refreshed on every run rather than only when absent: v1 moves within its major version, so a cached
# copy would otherwise drift from what CI enforces. -z makes an unchanged file cost a 304, and a failed
# request falls back to the copy already on disk, so this still works offline.
coverage-tooling:
	@curl -fsSL -z $(COVERAGE_REPORT) -o $(COVERAGE_REPORT) \
		https://raw.githubusercontent.com/jmerhar/coverage/v1/bin/coverage-report.py \
		|| test -f $(COVERAGE_REPORT)

coverage: coverage-tooling ## Run tests with coverage and enforce the gate
	npm run test:cov && python3 $(COVERAGE_REPORT) --gate

check: lint test coverage ## Lint + test + coverage gate (gate a commit on this)

##@ Build

build: ## Type-check and produce the production build in dist/
	npm run build

clean: ## Remove build + coverage artifacts (all regenerable)
	rm -rf dist coverage coverage-upload node_modules/.vite $(COVERAGE_REPORT)

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
