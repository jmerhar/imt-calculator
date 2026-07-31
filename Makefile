.PHONY: help install dev preview lint test coverage check build clean fetch-tables ga-setup

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

coverage: ## Run tests with coverage and enforce the gate
	npm run test:cov && python3 scripts/coverage-report.py --gate

check: lint test coverage ## Lint + test + coverage gate (gate a commit on this)

##@ Build

build: ## Type-check and produce the production build in dist/
	npm run build

clean: ## Remove build + coverage artifacts (all regenerable)
	rm -rf dist coverage coverage-upload node_modules/.vite

##@ Data

fetch-tables: ## Fetch AT IMT tables for a year and regenerate the .ts (usage: make fetch-tables YEAR=2026)
	@test -n "$(YEAR)" || { echo "Usage: make fetch-tables YEAR=2026"; exit 1; }
	node bin/fetch-tables.mjs $(YEAR)

##@ Analytics

ga-setup: ## Register GA4 custom dimensions/metrics, idempotently (uses ./ga-key.json; ARGS=--dry-run to preview)
	node bin/ga-setup.mjs $(ARGS)
