# Content plan — rank & grow (SEO Phase 3)

The technical SEO is done (see `docs/seo.md`): the site is crawlable, prerendered, bilingual with
hreflang, and rich-result-annotated. **Content is now the lever.** This plan maps target queries to
pages and specifies a first batch of guide articles. **PT-first** — Portugal is the primary market.

> Status: **draft for sign-off.** Nothing here is written yet. Approve the architecture + the first
> batch (or edit the topics), and I'll produce the articles in atomic commits with adversarial +
> native-pt-PT review, exactly like the engine/i18n work.

## Principles

- **One primary intent per page** — avoid cannibalization (two pages fighting for the same query).
- **Every article links into the calculator** with a clear CTA, ideally deep-linked to a relevant
  pre-filled state (`/?c=…`) — e.g. the non-resident guide links to a non-resident example.
- **E-E-A-T**: cite primary sources (CIMT, TGIS, DL 97/2026) as how-it-works already does. YMYL topic
  → trust matters.
- **Bilingual parity**: every guide ships EN + PT with reciprocal hreflang, like the existing pages.
- **Freshness**: "2026" in titles/H1; a yearly refresh pass is already a known task.

## Keyword map (intent → page)

Existing pages keep a single focus so guides don't cannibalize them:

| Page | Primary intent (PT / EN) |
|---|---|
| `/` (calculator) | transactional: `simulador IMT`, `calcular IMT 2026`, `quanto pago de IMT` / `Portugal IMT calculator` |
| `/how-it-works` | informational-methodology: `como é calculado o IMT`, the rules & citations |
| `/glossary` | definitional long-tail: individual term lookups |

New guide pages target high-intent long-tail queries that none of the above should own:

| Guide (PT slug) | Primary query | Secondary queries |
|---|---|---|
| IMT para não residentes 2026 | `IMT não residentes` | `taxa IMT estrangeiros`, `IMT 7.5%`, `non-resident IMT Portugal` |
| IMT Jovem 2026 | `IMT jovem` | `IMT jovem quem tem direito`, `isenção IMT jovem`, `IMT Jovem simulador` |
| Tabelas de IMT 2026 | `tabelas IMT 2026` | `escalões IMT 2026`, `taxas IMT 2026`, `IMT 2026 table` |
| IMT vs IMI vs imposto do selo | `IMT IMI imposto do selo diferença` | `impostos compra casa Portugal` |
| Comprar nos Açores / Madeira | `IMT Açores`, `IMT Madeira` | `tabelas IMT Açores 2026`, `×1.25` |

Once Search Console has data, feed real discovered queries back into this map (Measurement, `seo.md`).

## Architecture for guides

- **Section:** an index page + individual articles. EN under `/guides/`, PT under `/pt/guias/`.
- **Rendering:** reuse the existing `vite-react-ssg` route + `injectSeo` pipeline. Each article is a
  bilingual content module (`src/content/guides/<slug>.ts` with `{ en, pt }`), rendered by one shared
  `GuidePage` component — same pattern as the glossary/how-it-works content. Prerendered, hydrated.
- **Per-article SEO:** title/description in `src/seo/meta.ts`; `Article` (or `TechArticle`) JSON-LD
  with `datePublished`/`dateModified`/`author`/`publisher` (reuse the `Organization` `@id`); reuse
  `BreadcrumbList`; add `FAQPage` where the article has a Q&A block. hreflang pairs like other pages.
- **Sitemap:** `scripts/postbuild.mjs` gains the new routes + hreflang alternates (extend the route
  list it already iterates).
- **Internal linking:** add a "Guides" nav entry; each guide links to the calculator (deep-linked
  where useful) and to 1–2 sibling guides; how-it-works/glossary link out to relevant guides.

### ❓ One decision needed: localized slugs

PT ranks better with **localized slugs** (`/pt/guias/imt-nao-residentes-2026/`) than with English
slugs under `/pt/` (`/pt/guides/imt-non-residents-2026/`). The current path helpers assume the same
slug in both languages (prefix-only). Localized slugs need a small **per-page slug map** keyed by
language, threaded through `localizedPath`/`barePath`/hreflang + the sitemap.

- **Recommended:** localized slugs (`/guides/…` EN, `/pt/guias/…` PT) — better PT SEO, ~half a day
  to extend the mapping once, then free per article.
- **Simpler:** shared English slugs under `/pt/guides/…` — no mapping change, weaker PT signal.

## First batch (3 articles) — proposed specs

Ordered by impact ÷ effort. Each is bilingual; PT shown, EN mirrors.

### 1. IMT para não residentes em 2026 (`imt-nao-residentes-2026`)
- **Primary:** `IMT não residentes`. **Intent:** informational, high-worry, we have authority.
- **Title (PT):** "IMT para não residentes em 2026: a taxa de 7,5% explicada" (~58 ch).
- **H1:** "IMT para não residentes em Portugal (2026)".
- **Outline:** what changed under DL 97/2026 · the flat 7,5% (art. 17.º n.º 10) · the exceptions
  (former resident; becomes-resident-in-2yr; accessible-rent — reclaimable) · the **wrong "1 Sept"
  date** myth corrected · worked example (non-resident, €400k) · "calculate yours" CTA.
- **Schema:** Article + FAQPage (reuse/extend the how-it-works Q&As). **CTA:** deep link to a
  non-resident pre-filled calc.

### 2. IMT Jovem 2026: quem tem direito e quanto poupa (`imt-jovem-2026`)
- **Primary:** `IMT jovem`. **Intent:** eligibility + savings, high volume among first-time buyers.
- **Title (PT):** "IMT Jovem 2026: quem tem direito e quanto poupa" (~52 ch).
- **H1:** "IMT Jovem em 2026: elegibilidade e poupança".
- **Outline:** what IMT Jovem is · eligibility (age, HPP, first home) · how the relief maps to Tables
  II/V · a €300k first-home example (with vs without Jovem) · limits/caveats · CTA to the calculator
  with Jovem enabled.
- **Schema:** Article + FAQPage. **CTA:** deep link to a Jovem example.

### 3. Tabelas de IMT 2026 (`tabelas-imt-2026`)
- **Primary:** `tabelas IMT 2026`. **Intent:** reference; strong "useful tool" landing.
- **Title (PT):** "Tabelas de IMT 2026: escalões e taxas (todas as regiões)" (~57 ch).
- **H1:** "Tabelas de IMT 2026 (Continente, Açores, Madeira)".
- **Outline:** the six 2026 tables as readable HTML tables · how the applicable table is chosen
  (HPP vs not, region, Jovem) · the ×1.25 autonomous-region rule (Lei 21/90) · stamp duty note ·
  source citations · CTA "calculate for your price".
- **Schema:** Article + BreadcrumbList. (Tables as semantic `<table>` — also good for featured
  snippets.) **CTA:** to the calculator.

**Next batch (backlog):** IMT vs IMI vs imposto do selo · Comprar nos Açores/Madeira (×1.25) ·
worked example: two-buyer €400k (former-resident + non-resident) as a standalone indexable page.

## Glossary & worked examples

- **Glossary expansion** — add per-term anchors (`/glossary#vpt`) and cross-link terms into the
  guides; ensure each term is a crawlable, self-contained definition. Low effort, compounding.
- **Worked examples** — turn the locked test cases (e.g. the €400k two-buyer → €27,850.06) into an
  indexable example page; strong for long-tail "quanto pago" queries and links back to the calculator.

## Cadence & guardrails

- **Batch of ~3 articles at a time**, each: content module (EN+PT) → meta + JSON-LD → sitemap/nav
  wiring → adversarial review → native pt-PT review → commit. One deploy per batch.
- **Cannibalization guard:** before publishing, confirm the new page's primary query isn't already
  the focus of an existing page; if it is, differentiate or consolidate.
- **Measure:** after each batch, watch GSC for the target queries; promote winners with internal
  links and expand; prune/merge losers.

## Effort

- Slug-map extension (if we localize slugs): ~½ day, once.
- `GuidePage` + guides index + nav/sitemap wiring: ~½–1 day, once.
- Per article thereafter: mostly writing (bilingual) + review; the plumbing is reused.
