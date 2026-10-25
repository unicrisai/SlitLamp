# SlitLamp — Ophthalmology Evidence Tracker

A weekly tracker for ophthalmologists in Thailand: guideline changes, new high-evidence studies from PubMed, and a reviewed abbreviation glossary. Plan: [docs/BLUEPRINT.md](docs/BLUEPRINT.md). Working rules: [CLAUDE.md](CLAUDE.md).

Information, not medical advice.

## Run locally

```sh
npm install
cp .env.example .env.local   # fill in NCBI_EMAIL (and optionally NCBI_API_KEY)
npm run fetch:pubmed         # last complete Mon–Sun week; or: -- --week 2026-10-12
npm run dev                  # http://localhost:3000
```

| Script | What it does |
| --- | --- |
| `npm run fetch:pubmed` | Fetches the week's ophthalmology RCTs, systematic reviews, meta-analyses and practice guidelines into `data/papers.json` and `data/digests.json`. Idempotent (dedupes on PMID). |
| `npm run validate` | Checks every file in `data/` against the Zod schemas in `src/lib/schemas.ts` and cross-file references. |
| `npm run export:glossary` | Writes approved abbreviations to `public/glossary.csv` and `public/glossary.txt`. Runs before every build. |
| `npm run build` | Static export to `out/`. |

## Data

JSON files in `data/`, shaped after the data model in the blueprint:
`subspecialties`, `sources`, `guidelines`, `papers`, `abbreviations`, `digests`.
Unknown values are `null` and shown as "not yet verified". Papers are mapped to subspecialties by MeSH heading using `src/lib/mesh-map.ts`.

To review an item, edit its JSON: set `summary_status` / `change_note_status` to `"reviewed"` with `reviewed_by` and `reviewed_at`, or an abbreviation's `status` to `"approved"` with `approved_by` and `approved_at`. `npm run validate` checks the result.

## Deploy (GitHub Pages)

1. Repo **Settings → Pages → Source: GitHub Actions**.
2. Repo **Settings → Secrets and variables → Actions**: add `NCBI_EMAIL` and optionally `NCBI_API_KEY`.
3. `deploy.yml` builds and publishes on every push to `main`. `weekly-fetch.yml` runs Mondays 01:00 UTC (08:00 in Thailand), commits new data, and triggers a redeploy. Both can be run by hand from the Actions tab.
