# SEO plan — maximize organic traffic

Goal: rank the IMT calculator for Portuguese property-transfer-tax queries (EN **and** PT) and grow
organic traffic. This is a living checklist — update the marker as items land. Ordered by
**impact ÷ effort**; do P0 before P1 before P2.

**Legend:** ✅ fixed · ⏳ not fixed (tracked) · 📋 later phase · ➖ won't fix · ❓ needs decision ·
**Impact** H/M/L · 🔑 = blocker others depend on.

## The honest current-state audit

The app is well-built but, as of this plan, **structurally near-invisible to search engines**:

- 🔴 **HashRouter** — routes live behind `#/glossary`, `#/how-it-works`. Google ignores URL
  fragments, so all three "pages" collapse to one indexable URL (`calc-imt.online/`). The glossary
  and how-it-works content — our best keyword surface — is effectively uncrawlable as distinct pages.
- 🔴 **Client-side rendering only** — the HTML shipped is an empty `#root`; content appears only
  after JS runs. Googlebot can render JS but slower and less reliably; Bing and most others index
  the raw HTML poorly. No SSR/prerender.
- 🔴 **One URL for two languages** — EN/PT switch in-place on the same URL. Search engines can't
  index a PT version and an EN version separately, and there's no `hreflang`. We're leaving the
  entire Portuguese-language market (the primary audience) on the table.
- 🟠 **Metadata is minimal** — only `title` + `description` in `index.html`; no per-route meta, no
  canonical, no Open Graph / Twitter cards, no structured data.
- 🟠 **No `robots.txt`, no `sitemap.xml`, no `404.html`.**
- 🟢 Good foundations to build on: fast, accessible, HTTPS, custom domain, clean semantic-ish
  markup, bilingual content already written.

> This audit describes the **starting point**. Everything in P0/P1 below has since been fixed — the
> site is now crawlable, prerendered, bilingual with hreflang, and rich-result-annotated. The
> remaining open work is **content** (P1/P2) and **off-page authority** (P2).

---

## P0 — Make the site crawlable and indexable (do this first)

Without these, the rest barely matters.

### Routing & rendering 🔑

- ✅ **Switch `HashRouter` → real paths** — done via `vite-react-ssg` (data `BrowserRouter`); routes
  are `/`, `/glossary`, `/how-it-works`. The URL state token moved from the hash to the real query
  string (`/?c=…`), with a legacy-hash fallback so old shared links still decode.
- ✅ **Pre-render each route to static HTML at build time** — `vite-react-ssg build` emits
  `/index.html`, `/glossary/index.html`, `/how-it-works/index.html` (nested `dirStyle`), then
  hydrates on the client. Chosen for the maintained SSG + head + hydration support.
- ✅ **SPA deep-link fallback** — `scripts/postbuild.mjs` writes `dist/404.html` from the built
  shell so any un-prerendered path boots the app.
- ✅ **Verify JS-off / view-source** — confirmed each built route contains real rendered DOM
  (form, glossary terms, how-it-works copy), assets are absolute `/assets/…`, and `vite preview`
  serves `/glossary` with HTTP 200.

> Migration caveats (from adversarial review): token share links from the HashRouter era
> (`/#/?c=…`) still decode via a fallback, but old **non-token** hash deep links to sub-pages
> (`/#/glossary`) land on the calculator (BrowserRouter ignores the fragment) — acceptable, rarely
> shared. Tests render via `MemoryRouter`, so the production data-router + hydration path is covered
> by the build and the live site, not unit tests.

### Indexing signals

- ✅ **`public/robots.txt`** — allow all, links the sitemap.
- ✅ **`sitemap.xml`** — generated during the SSG build (`vite.config` `ssgOptions.onFinished`,
  `src/seo/sitemap.ts`) from the route + guide registry (trailing-slash canonical URLs matching what
  Pages serves), with reciprocal `hreflang` alternates for every EN/PT pair (18 URLs).
- ✅ **Canonical tags** — self-referential `<link rel="canonical">` per prerendered page (injected
  build-time via `vite-react-ssg` `onPageRendered`; subpages use the trailing-slash form).
- ✅ **Registered in Google Search Console** and submitted `https://calc-imt.online/sitemap.xml`.
  Ongoing: watch Coverage/Indexing weekly (see Measurement below).
- ✅ **Registered in Bing Webmaster Tools** and submitted the sitemap.

## P1 — Internationalization, metadata, structured data

### Per-language URLs & hreflang 🔑

- ✅ **Give each language its own URL** — EN at `/`, PT under `/pt/…`, with **localized slugs**
  (`/pt/glossario`, `/pt/como-funciona`, `/pt/guias/<slug>`). Language is driven by the route
  (RootLayout passes `lang`), not client state, so each URL's HTML is deterministic and hydrates
  without a flash.
- ✅ **`hreflang` alternates** — `en`/`pt`/`x-default` in each page's `<head>` (build-time) and in
  the sitemap (`xhtml:link`), reciprocal and self-referential. Verified in `dist`.
- ✅ **Localized `<html lang>`, title, description** per prerendered page (PT pages ship PT
  metadata; `src/seo/meta.ts` + injectSeo).
- ✅ **Language toggle navigates** to the other-language URL (preserving the `?c=` token) instead
  of swapping state, so the URL and `hreflang` stay truthful.

### On-page metadata (per route, in the prerendered HTML)

- ✅ **Per-route `<title>` and meta `description`** — written into the static HTML at build time
  (`vite-react-ssg` `onPageRendered`, strings in `src/seo/meta.ts`), unique per route and localized.
- ✅ **Open Graph** — `og:type/site_name/title/description/url/image` + localized `og:locale`
  (+ alternate), injected per page at build.
- ✅ **Twitter Card** — `summary_large_image` with title/description/image.
- ✅ **Share/OG image** (1200×630) — **per-language** branded PNGs (`public/og-en.png`,
  `public/og-pt.png`), generated from SVGs by `scripts/gen-og.mjs` (`make og-image`); injectSeo
  serves the one matching each page's language (with `og:image:width/height`).
- ✅ **`theme-color`, apple-touch-icon, web app manifest** — per-scheme `theme-color`, an
  apple-touch-icon, and `public/manifest.webmanifest` make the site installable and tint the mobile
  browser UI. Icons generated from `favicon.svg` by `scripts/gen-icons.mjs` (`make icons`).

### Structured data (JSON-LD, in the prerendered HTML)

- ✅ **`WebApplication`** on the calculator (FinanceApplication, free offer, `inLanguage`),
  localized. `src/seo/jsonld.ts`.
- ✅ **`FAQPage`** on how-it-works — three localized Q&As (non-resident date, totality rule,
  non-resident rate). Valid JSON verified in `dist`.
- ✅ **`BreadcrumbList`** on glossary, how-it-works, the guides index, and every guide article —
  with **visible breadcrumbs** on each sub-page matching the markup (shared `Breadcrumb` component).
- ✅ **`Organization` + `WebSite`** on the home page (both languages), linked by a stable `@id`.
  ➖ **SearchAction omitted** — no on-site search to point it at.
- ✅ **Validated with the Google Rich Results Test** — Article, BreadcrumbList, and the guides-index
  ItemList (Carousel) all report valid / eligible. The non-critical Article warnings were fixed:
  added `image`, ISO datetimes with a time zone (`…T00:00:00Z`), and a full Organization publisher
  with a logo (so the reference resolves on the article page).

## P1/P2 — Content & keyword strategy (the biggest organic lever, long-term)

Tooling gets pages *indexed*; **content gets them ranked.** This is where sustained organic traffic
comes from. Bias toward Portuguese — it's the primary market. **Planned in `docs/content-plan.md`.**

- ✅ **Keyword research & mapping** — target-query list with one primary intent per page, in
  `docs/content-plan.md`. Refine from real Search Console queries as they arrive. Seed terms:
  - PT: `simulador IMT`, `calcular IMT 2026`, `IMT não residentes`, `IMT jovem`, `imposto do selo
    compra casa`, `IMT Açores`, `IMT Madeira`, `tabelas IMT 2026`, `quanto pago de IMT`.
  - EN: `Portugal IMT calculator`, `Portugal property transfer tax`, `IMT non-resident Portugal
    2026`, `stamp duty Portugal property`, `buying property Portugal taxes`.
  **Impact H · Effort M.**
- ✅ **Optimize the home page** — added a keyword-led `<h1>` ("Portugal IMT & Stamp-Duty
  Calculator — 2026") and an intro paragraph (both localized). Glossary and how-it-works already
  have `<h1>` + intros.
- ✅ **Guides section shipped** — a `/guides` (PT `/pt/guias`) section with localized slugs and
  **five** bilingual articles: IMT for non-residents, IMT Jovem, the 2026 rate tables, IMT vs IMI vs
  stamp duty, and buying in the Açores/Madeira. Each has Article + FAQ + Breadcrumb JSON-LD and a
  prefilled-CTA. **Publishing more articles remains the ongoing lever** (backlog in
  `docs/content-plan.md`).
- ✅ **Worked examples** — embedded in the guides (the €400k non-resident, IMT Jovem, and Açores
  cases) and deep-linked: each guide's CTA pre-fills that scenario into the calculator via a `?c=`
  token.
- ✅ **Expanded the glossary** — added six terms (IMI, AIMI, tax base, co-ownership, CPCV, tax
  resident) with per-term `id` anchors for deep-linking (e.g. `/glossary#imi`). Optional next step:
  contextual in-body links from guide prose to glossary terms.
- ✅ **Internal linking** — header nav links all pages in the current language; footer links to
  how-it-works; visible breadcrumbs on every sub-page; each guide CTA deep-links into the
  calculator. Optional next step: contextual in-body links from guide prose to glossary terms.
- ✅ **Freshness** — the tax-year framing in titles, the `<h1>`, meta, guides and OG images now
  derives from `LATEST_YEAR` (the newest registered tables), not the calendar; guide figures are
  precomputed from the engine. The yearly refresh is one command, `make bump-year YEAR=…`, plus a
  human data review — see `docs/year-rollover.md`. Slugs are evergreen so the URLs never churn.
- ✅ **Cite primary sources** — how-it-works cites CIMT/TGIS/DL 97/2026; `reference/` holds the
  source docs. E-E-A-T signal in place.

## P2 — Performance, accessibility, semantics (verified good — hold)

- ✅ **Core Web Vitals** — mobile PageSpeed Performance ~99 (LCP 2.1 s, CLS 0, TBT 20 ms), desktop
  100 (lab, Slow-4G). Re-check field data (CrUX) in Search Console once traffic accrues.
- ✅ **Font loading** — self-hosted, latin-subset woff2 (no Google Fonts request); display + body
  on `font-display: block` + preload (never a fallback flash), figures on `swap`. Analytics deferred
  to idle. `bin/psi.mjs` (`make psi`) runs PageSpeed on demand.
- ✅ **Semantic HTML & headings** — every page has exactly one `<h1>`, then logical `<h2>`/`<h3>`;
  landmarks (header/nav/main#main/footer + skip link) in place.
- ✅ **Image `alt`, descriptive link text, keyboard/reduced-motion** — labelled controls,
  `:focus-visible`, `prefers-reduced-motion`; accessibility PageSpeed 100.
- ✅ **Mobile-first UX / CWV** — responsive, light (~70 KB gzip), mobile PageSpeed ~99. Held.

## P2 — Off-page / authority & promotion (ongoing)

Rankings for a YMYL query need trust signals and links; this is slow but decisive.

- 📋 **Relevant backlinks** — expat/relocation sites (e.g. Portugal-move communities), real-estate
  and mortgage blogs, finance directories, "useful tools" roundups. Outreach with a genuinely useful
  free tool is realistic. **Impact H · Effort H.**
- 📋 **Communities** — answer real questions on Reddit (r/PortugalExpats, r/portugal), expat forums,
  Facebook groups, with the calculator where it genuinely helps (no spam). **Impact M · Effort M.**
- 📋 **Tool/startup directories** — Product Hunt, indie-tool listings, calculator aggregators.
  **Impact M · Effort M.**
- ✅ **Shareability** — per-language OG images (`og-en.png`/`og-pt.png`) with `og:image:width/height`,
  the in-app share-link, and OG previews verified across platforms. Fixed a bug where a mobile Share
  after client-side navigation shared the landed URL: canonical + `og:url`/`og:title`/`og:image` now
  update on every route change.
- 📋 **(Optional) a short branded domain / consistent NAP** if we ever add an "about"/contact for
  trust. Decision: deferred (see Open decisions). **Impact L · Effort L.**

## Measurement & iteration

- ⏳ **Google Search Console** — the source of truth for impressions, queries, CTR, indexing. Review
  weekly; feed discovered queries back into content. **Impact H · Effort L.**
- ⏳ **GA4** — organic-traffic segment, landing-page performance, engagement by page (we already
  track rich events). **Impact M · Effort L.**
- 📋 **Rank tracking** for the target keyword set (a lightweight tracker or periodic manual checks).
  **Impact M · Effort L.**
- ✅ **Baseline captured** — Search Console is indexing (first impressions arriving, e.g. "imt
  portugal" at ~position 72, 0 clicks). Starting point ≈ 0, so growth is measurable from here.

---

## Suggested roadmap

1. **Phase 1 (unblock indexing):** BrowserRouter + prerender + 404 fallback → robots.txt + sitemap +
   canonical → Search Console + submit sitemap. ✅ **Done.**
2. **Phase 2 (double the market + earn clicks):** per-language URLs + hreflang + localized per-route
   meta → Open Graph/Twitter + OG image → JSON-LD (WebApplication + FAQPage + Organization/WebSite).
   ✅ **Done.**
3. **Phase 3 (rank & grow):** keyword mapping → optimize existing pages → add guides/worked examples
   → internal linking. ✅ **Largely done:** the guides section (five bilingual articles, localized
   slugs, prefilled-CTA worked examples), the glossary expansion, and the keyword map have shipped.
   Ongoing: publish more guide articles as topics/queries warrant. See `docs/content-plan.md`.
4. **Phase 4 (authority):** backlinks, community presence, directories. 📋 **Later, ongoing** — the
   main remaining lever now that the on-site content foundation is in place.

## Resolved decisions

- **Host:** keep **GitHub Pages** (SSG on Pages — free and simple).
- **Default language:** **EN-first** (`/` = EN, `/pt/…` = PT), with `hreflang`. One-way choice, now locked.
- **Content appetite:** willing to invest in ongoing content (guides) — hence Phase 3.
- **Theme:** respects the OS `prefers-color-scheme` (no forced default).

## Open decisions

- 📋 **About/contact surface** — deferred (not now, possibly later). Would enable an `Organization`
  contact point / consistent NAP and a small trust boost; no plan to add it yet.
