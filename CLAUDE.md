# Ophthalmology Evidence Tracker

A weekly tracker for ophthalmologists in Thailand: which guidelines changed, which new high-evidence studies matter, across all subspecialties, with abbreviations expanded from a reviewed glossary. The full plan is in `docs/BLUEPRINT.md`. Read it before starting any task.

## Current stage

Zero-cost prototype. No server, no database, no paid services, no user accounts.

- Static Next.js export (App Router, TypeScript strict), Tailwind
- Data lives as JSON files in `data/`, validated with Zod schemas in `src/lib/schemas.ts`
- Scripts in `scripts/` fetch and process data; GitHub Actions runs them on a schedule
- Hosting: GitHub Pages or Vercel free tier

## Rules (non-negotiable)

1. **Never invent data.** No made-up papers, guideline versions, dates, abbreviations or summaries. If a value is unknown, leave it empty or `null` and show "not yet verified" in the UI.
2. **Source and date on everything.** Every paper, guideline and summary stores `source_id` and `retrieved_at` (and `last_checked_at` for guidelines). The UI shows them.
3. **Label AI output.** Any AI-written summary, change note or quiz question has status `ai_draft` until a human reviews it. The UI shows "AI draft" or "Reviewed by [name], [date]".
4. **Information, not advice.** The site reports what literature and guidelines say. It never recommends treatment for a patient. Every page carries a short notice saying so.
5. **Copyright.** Store and show titles, citation data, links and our own short summaries. Do not store or republish full abstracts or paper text unless the article's licence allows it (e.g. CC-BY open access).
6. **Abbreviations.** Only expand abbreviations from approved entries in `data/abbreviations.json`. Unknown or ambiguous ones are flagged, never guessed.
7. **No patient data**, ever.
8. **Secrets.** API keys (NCBI, any AI provider) go in `.env.local` and GitHub Actions secrets. Never commit them.

## PubMed E-utilities

- Max 3 requests/second without an API key, 10 with one. Throttle accordingly.
- Send registered `tool` and `email` parameters on every request.
- Default filter: ophthalmology MeSH terms; publication types Randomized Controlled Trial, Systematic Review, Meta-Analysis, Practice Guideline.

## Conventions

- TypeScript strict mode; no `any`.
- Data shapes follow the data model in `docs/BLUEPRINT.md`, so they can move to Postgres + Drizzle later.
- Design: light, clean, calm health-tech look; good contrast; mobile-friendly.
- Keep scripts idempotent: re-running a fetch for the same week must not create duplicates (dedupe on PMID).

## Out of scope for now

Forum, dataset analysis, user accounts, translation of papers, quiz/study tool (phase 3), anything that interprets patient data.
