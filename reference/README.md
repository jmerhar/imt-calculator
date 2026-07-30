# Primary sources

Authoritative documents the calculator is built from, kept here for provenance and as the
baseline the table fetcher (`bin/fetch-tables.mjs`) self-checks against. All are public.

| File | What it is | Source |
|---|---|---|
| `Decreto-Lei-97-2026.txt` | Full text of Decreto-Lei n.º 97/2026 (non-resident IMT rule, entry-into-force). | Diário da República |
| `Decreto-Lei-97-2026-DR.html` | Official DR page of the same decree-law. | diariodarepublica.pt |
| `CIMT-art17-portaldasfinancas.html` | Consolidated **CIMT art. 17.º** (IMT rates, brackets, non-resident n.º 10, tax-haven n.º 4, totality rule n.º 6). | Portal das Finanças |
| `TGIS-imposto-do-selo-portaldasfinancas.html` | Tabela Geral do Imposto do Selo — **verba 1.1** (0.8% on transfers) and **verba 17** (credit / mortgage). | Portal das Finanças |
| `AT-IMT-tables-2026.csv` | AT practical IMT tables for 2026 (Ofício Circulado n.º 40129/2026). | Autoridade Tributária |

The autonomous-region tables (Açores/Madeira) are the mainland brackets × 1.25 (Lei n.º 21/90),
so the fetcher derives them rather than scraping them separately.
