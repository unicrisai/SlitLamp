import Link from "next/link";
import { FilterableList } from "@/components/FilterableList";
import { PaperCard } from "@/components/PaperCard";
import type { AllData } from "@/lib/data";
import { formatDate, weekRange } from "@/lib/format";
import { PUBLICATION_TYPE_LABELS, type Digest } from "@/lib/schemas";

export function DigestView({ digest, data }: { digest: Digest; data: AllData }) {
  const subNames = new Map(data.subspecialties.map((s) => [s.id, s.name]));
  const sourceNames = new Map(data.sources.map((s) => [s.id, s.name]));
  const papersById = new Map(data.papers.map((p) => [p.id, p]));
  const papers = digest.paper_ids.flatMap((id) => papersById.get(id) ?? []);
  const guidelines = data.guidelines.filter((g) => digest.guideline_ids.includes(g.id));

  const usedTypes = new Set(papers.flatMap((p) => p.publication_types));
  const usedSubs = new Set(papers.flatMap((p) => p.subspecialty_ids));

  return (
    <div>
      <header className="mb-6">
        <p className="text-sm font-medium text-brand">Weekly evidence digest</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">{weekRange(digest.week_start)}</h1>
        <p className="mt-1 text-sm text-muted">
          {papers.length} papers newly indexed in PubMed this week (randomized controlled trials, systematic reviews,
          meta-analyses, practice guidelines). Published {formatDate(digest.published_at)}.
        </p>
      </header>

      {guidelines.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-semibold">Guideline changes</h2>
          <ul className="space-y-2">
            {guidelines.map((g) => (
              <li key={g.id}>
                <Link href="/guidelines/" className="text-brand hover:underline">
                  {g.title}
                </Link>{" "}
                <span className="text-sm text-muted">({g.issuer})</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <FilterableList
        subspecialties={data.subspecialties.filter((s) => usedSubs.has(s.id)).map((s) => ({ id: s.id, label: s.name }))}
        types={[...usedTypes].map((t) => ({ id: t, label: PUBLICATION_TYPE_LABELS[t] }))}
        items={papers.map((p) => ({
          key: p.id,
          subspecialtyIds: p.subspecialty_ids,
          types: p.publication_types,
          node: (
            <PaperCard
              paper={p}
              glossary={data.abbreviations}
              subspecialtyNames={subNames}
              sourceName={sourceNames.get(p.source_id) ?? p.source_id}
            />
          ),
        }))}
      />
    </div>
  );
}
