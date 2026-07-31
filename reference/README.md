# Primary sources

Authoritative documents the calculator is built from, kept for provenance and as the baseline the
table fetcher (`bin/fetch-tables.mjs`) self-checks against. All are public.

- **`sources/`** holds the raw originals (HTML, PDF, CSV, TXT) exactly as downloaded — the
  authoritative copies.
- The **`.md` files in this folder** (linked below) are Markdown renditions of those sources,
  converted for easy reading and diffing. If a rendition and its source ever disagree, the file in
  `sources/` wins.

| Markdown | Original | What it is | Provider |
|---|---|---|---|
| [Decreto-Lei-97-2026.md](Decreto-Lei-97-2026.md) | [sources/…-97-2026.txt](sources/Decreto-Lei-97-2026.txt) | Full text of Decreto-Lei n.º 97/2026 (non-resident 7.5% IMT rule; entry into force). | Diário da República |
| [Decreto-Lei-97-2026-DR.md](Decreto-Lei-97-2026-DR.md) | [sources/…-97-2026-DR.html](sources/Decreto-Lei-97-2026-DR.html) | Official DR page of the same decree-law. | diariodarepublica.pt |
| [Decreto-Lei-48-A-2024.md](Decreto-Lei-48-A-2024.md) | [sources/…-48-A-2024.pdf](sources/Decreto-Lei-48-A-2024.pdf) | Decreto-Lei n.º 48-A/2024 — **IMT Jovem**: exempts IMT **and** imposto do selo on a first own permanent home for buyers aged ≤ 35 (amends CIMT art. 9.º/17.º; adds CIS art. 7.º-A). | Autoridade Tributária |
| [Lei-30-A-2024.md](Lei-30-A-2024.md) | [sources/Lei-30-A-2024.pdf](sources/Lei-30-A-2024.pdf) | Lei n.º 30-A/2024 — the legislative authorization for the IMT Jovem decree-law. | Assembleia da República |
| [CIMT-art17-portaldasfinancas.md](CIMT-art17-portaldasfinancas.md) | [sources/CIMT-art17-….html](sources/CIMT-art17-portaldasfinancas.html) | Consolidated **CIMT art. 17.º** (IMT rates/brackets, non-resident n.º 10, tax-haven n.º 4, totality rule n.º 6). | Portal das Finanças |
| [TGIS-imposto-do-selo-portaldasfinancas.md](TGIS-imposto-do-selo-portaldasfinancas.md) | [sources/TGIS-….html](sources/TGIS-imposto-do-selo-portaldasfinancas.html) | Tabela Geral do Imposto do Selo — **verba 1.1** (0.8% on transfers) and **verba 17** (credit / mortgage). | Portal das Finanças |
| [AT-IMT-tables-2026.md](AT-IMT-tables-2026.md) | [sources/AT-IMT-tables-2026.csv](sources/AT-IMT-tables-2026.csv) | AT practical IMT tables for 2026 (Ofício Circulado n.º 40129/2026). | Autoridade Tributária |

The autonomous-region tables (Açores/Madeira) are the mainland brackets × 1.25 (Lei n.º 21/90), so
the fetcher derives them rather than scraping them separately.
