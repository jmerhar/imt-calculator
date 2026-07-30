# IMT Calculator · Portugal 2026

A fully client-side calculator for the Portuguese property-transfer tax (**IMT** — Imposto
Municipal sobre as Transmissões Onerosas de Imóveis) and the associated **stamp duty** (Imposto do
Selo), for purchases under the 2026 rules, including the non-resident regime introduced by
**Decreto-Lei n.º 97/2026**.

No backend, no tracking — it runs entirely in the browser and is deployed to GitHub Pages.

> Not tax advice. See the *How it works* page for sources and assumptions.

## Development

```sh
make install   # install dependencies
make dev       # start the dev server
make check     # lint + tests + coverage gate
make build     # production build into dist/
make help      # list all targets
```

Requires Node ≥ 20 and (for the coverage gate) Python 3.

## Documentation

- **How it works** — methodology, the legal rules applied, and full data provenance.
- **Glossary** — every term in English and Portuguese.

More detail is added to this README as the project is built out.
