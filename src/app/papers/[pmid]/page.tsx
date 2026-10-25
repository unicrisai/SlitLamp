import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AbbrText } from "@/components/AbbrText";
import { ReviewBadge, Tag } from "@/components/Badges";
import { Page } from "@/components/Page";
import { segmentText } from "@/lib/abbreviations";
import { loadAll, loadCollection } from "@/lib/data";
import { formatDate, weekRange } from "@/lib/format";
import { PUBLICATION_TYPE_LABELS } from "@/lib/schemas";

export const dynamicParams = false;

// Static export needs at least one route; "none" stands in until the first paper exists.
const PLACEHOLDER = "none";

export function generateStaticParams() {
  const pmids = loadCollection("papers").map((p) => ({ pmid: p.pmid }));
  return pmids.length > 0 ? pmids : [{ pmid: PLACEHOLDER }];
}

export async function generateMetadata({ params }: { params: Promise<{ pmid: string }> }): Promise<Metadata> {
  const { pmid } = await params;
  const paper = loadCollection("papers").find((p) => p.pmid === pmid);
  return { title: paper ? `${paper.title} · SlitLamp` : "Paper · SlitLamp" };
}

export default async function PaperPage({ params }: { params: Promise<{ pmid: string }> }) {
  const { pmid } = await params;
  const data = loadAll();
  const paper = data.papers.find((p) => p.pmid === pmid);
  if (!paper) {
    if (pmid === PLACEHOLDER) return <Page><p className="text-muted">No papers yet.</p></Page>;
    notFound();
  }

  const subNames = new Map(data.subspecialties.map((s) => [s.id, s.name]));
  const source = data.sources.find((s) => s.id === paper.source_id);
  const digest = data.digests.find((d) => d.paper_ids.includes(paper.id));
  const glossary = data.abbreviations;
  const context = paper.subspecialty_ids;

  // Every abbreviation-like term in the title and summary, once, with how the glossary resolves it.
  const terms = new Map<string, { meaning: string; resolved: boolean }>();
  for (const s of segmentText([paper.title, paper.summary ?? ""].join(" "), glossary, context)) {
    if (s.kind === "known") terms.set(s.text, { meaning: s.expansion, resolved: true });
    else if (s.kind === "ambiguous")
      terms.set(s.text, { meaning: "Several meanings in the glossary; not expanded here", resolved: false });
    else if (s.kind === "unknown") terms.set(s.text, { meaning: "Not in the reviewed glossary yet", resolved: false });
  }

  const linkButton = "rounded-lg border border-line bg-surface px-3 py-2 text-sm font-medium hover:border-brand hover:text-brand";

  return (
    <Page>
      <nav className="mb-6 text-sm">
        {digest ? (
          <Link href={`/digests/${digest.week_start}/`} className="text-brand hover:underline">
            ← Digest {weekRange(digest.week_start)}
          </Link>
        ) : (
          <Link href="/digest/" className="text-brand hover:underline">
            ← Weekly digest
          </Link>
        )}
      </nav>

      <article>
        <div className="mb-3 flex flex-wrap gap-1.5">
          {paper.publication_types.map((t) => (
            <Tag key={t}>{PUBLICATION_TYPE_LABELS[t]}</Tag>
          ))}
          {paper.subspecialty_ids.map((s) => (
            <span key={s} className="rounded-full px-2 py-0.5 text-xs text-muted ring-1 ring-line">
              {subNames.get(s) ?? s}
            </span>
          ))}
        </div>

        <h1 className="text-2xl font-semibold leading-snug tracking-tight">
          <AbbrText text={paper.title} glossary={glossary} context={context} />
        </h1>
        <p className="mt-2 text-sm text-muted">
          <em>{paper.journal}</em>
          {paper.pub_date ? `, ${paper.pub_date}` : ""}
        </p>

        <section className="mt-8 rounded-xl border border-line bg-surface p-5 shadow-sm">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">Our summary</h2>
            <ReviewBadge status={paper.summary_status} reviewedBy={paper.reviewed_by} reviewedAt={paper.reviewed_at} />
          </div>
          {paper.summary ? (
            <div className="space-y-3 leading-relaxed">
              {paper.summary.split(/\n\s*\n/).map((para, i) => (
                <p key={i}>
                  <AbbrText text={para} glossary={glossary} context={context} />
                </p>
              ))}
              {paper.summary_status === "ai_draft" && (
                <p className="rounded-lg bg-draft-soft px-3 py-2 text-sm text-draft">
                  Written by AI and not yet checked by a clinician. Read the original before relying on it.
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted">
              No summary written yet. The abstract and full text are on the publisher&rsquo;s and PubMed&rsquo;s pages
              linked below.
            </p>
          )}
        </section>

        <section className="mt-8">
          <h2 className="mb-3 text-lg font-semibold">Read the original</h2>
          <div className="flex flex-wrap gap-2">
            <a href={paper.url} target="_blank" rel="noopener noreferrer" className={linkButton}>
              PubMed abstract ↗
            </a>
            {paper.doi && (
              <a href={`https://doi.org/${paper.doi}`} target="_blank" rel="noopener noreferrer" className={linkButton}>
                Publisher (DOI) ↗
              </a>
            )}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="mb-3 text-lg font-semibold">Citation</h2>
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 text-sm">
            <dt className="text-muted">Journal</dt>
            <dd>{paper.journal}</dd>
            <dt className="text-muted">Published</dt>
            <dd>{paper.pub_date ?? <span className="italic text-draft">not yet verified</span>}</dd>
            <dt className="text-muted">PMID</dt>
            <dd>{paper.pmid}</dd>
            <dt className="text-muted">DOI</dt>
            <dd className="break-all">{paper.doi ?? "none listed"}</dd>
            <dt className="text-muted">Licence</dt>
            <dd>{paper.open_access_licence ?? "Not checked; the abstract and full text belong to the publisher"}</dd>
            <dt className="text-muted">Source</dt>
            <dd>
              {source?.name ?? paper.source_id}, retrieved {formatDate(paper.retrieved_at)}
            </dd>
          </dl>
        </section>

        {terms.size > 0 && (
          <section className="mt-8">
            <h2 className="mb-3 text-lg font-semibold">Abbreviations on this page</h2>
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 text-sm">
              {[...terms].map(([abbr, t]) => (
                <div key={abbr} className="contents">
                  <dt className="font-semibold">{abbr}</dt>
                  <dd className={t.resolved ? "" : "italic text-muted"}>{t.meaning}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}
      </article>
    </Page>
  );
}
