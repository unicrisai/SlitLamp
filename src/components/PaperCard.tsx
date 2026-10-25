import Link from "next/link";
import { AbbrText } from "@/components/AbbrText";
import { ReviewBadge, Tag } from "@/components/Badges";
import { formatDate } from "@/lib/format";
import { PUBLICATION_TYPE_LABELS, type Abbreviation, type Paper } from "@/lib/schemas";

export function PaperCard({
  paper,
  glossary,
  subspecialtyNames,
  sourceName,
}: {
  paper: Paper;
  glossary: readonly Abbreviation[];
  subspecialtyNames: ReadonlyMap<string, string>;
  sourceName: string;
}) {
  return (
    <article className="rounded-xl border border-line bg-surface p-5 shadow-sm">
      <div className="mb-2 flex flex-wrap gap-1.5">
        {paper.publication_types.map((t) => (
          <Tag key={t}>{PUBLICATION_TYPE_LABELS[t]}</Tag>
        ))}
        {paper.subspecialty_ids.map((s) => (
          <span key={s} className="rounded-full px-2 py-0.5 text-xs text-muted ring-1 ring-line">
            {subspecialtyNames.get(s) ?? s}
          </span>
        ))}
      </div>

      <h3 className="text-base font-semibold leading-snug">
        <Link href={`/papers/${paper.pmid}/`} className="hover:text-brand hover:underline">
          <AbbrText text={paper.title} glossary={glossary} context={paper.subspecialty_ids} />
        </Link>
      </h3>
      <p className="mt-1 text-sm text-muted">
        <em>{paper.journal}</em>
        {paper.pub_date ? `, ${paper.pub_date}` : ""} · PMID{" "}
        <a href={paper.url} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
          {paper.pmid}
        </a>
        {paper.doi && (
          <>
            {" "}· DOI{" "}
            <a href={`https://doi.org/${paper.doi}`} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
              {paper.doi}
            </a>
          </>
        )}
      </p>

      {paper.summary && (
        <p className="mt-3 text-sm leading-relaxed">
          <AbbrText text={paper.summary} glossary={glossary} context={paper.subspecialty_ids} />
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
        <ReviewBadge status={paper.summary_status} reviewedBy={paper.reviewed_by} reviewedAt={paper.reviewed_at} />
        <span>
          Source: {sourceName}, retrieved {formatDate(paper.retrieved_at)}
        </span>
        <Link href={`/papers/${paper.pmid}/`} className="ml-auto font-medium text-brand hover:underline">
          {paper.summary ? "Read summary →" : "Details →"}
        </Link>
      </div>
    </article>
  );
}
