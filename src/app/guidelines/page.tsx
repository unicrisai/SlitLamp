import { Page } from "@/components/Page";
import { AbbrText } from "@/components/AbbrText";
import { NotVerified, ReviewBadge } from "@/components/Badges";
import { loadAll } from "@/lib/data";
import { formatDate } from "@/lib/format";
import type { Guideline } from "@/lib/schemas";

export const metadata = { title: "Guideline tracker · SlitLamp" };

const STATUS: Record<Guideline["status"], { label: string; className: string }> = {
  current: { label: "Current", className: "bg-canvas text-muted ring-1 ring-line" },
  updated: { label: "Updated", className: "bg-draft-soft text-draft" },
  superseded: { label: "Superseded", className: "bg-canvas text-flag ring-1 ring-line" },
};

export default function GuidelinesPage() {
  const data = loadAll();
  const sourceNames = new Map(data.sources.map((s) => [s.id, s.name]));
  const groups = data.subspecialties
    .map((s) => ({ sub: s, items: data.guidelines.filter((g) => g.subspecialty_ids.includes(s.id)) }))
    .filter((g) => g.items.length > 0);

  return (
    <Page>
      <div>
        <header className="mb-6">
          <p className="text-sm font-medium text-brand">Guideline tracker</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Guidelines by subspecialty</h1>
          <p className="mt-1 text-sm text-muted">
            Links and version details only; the guideline text stays with its issuer. Versions marked
            &ldquo;not yet verified&rdquo; still need checking against the issuer&rsquo;s page.
          </p>
        </header>

        <div className="space-y-8">
          {groups.map(({ sub, items }) => (
            <section key={sub.id}>
              <h2 className="mb-3 text-lg font-semibold">{sub.name}</h2>
              <div className="space-y-3">
                {items.map((g) => {
                  const status = STATUS[g.status];
                  return (
                    <article key={g.id} className="rounded-xl border border-line bg-surface p-4 shadow-sm">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h3 className="font-semibold leading-snug">
                          <a href={g.url} target="_blank" rel="noopener noreferrer" className="hover:text-brand hover:underline">
                            {g.title}
                          </a>
                        </h3>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}>{status.label}</span>
                      </div>
                      <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                        <dt className="text-muted">Issuer</dt>
                        <dd>{g.issuer}</dd>
                        <dt className="text-muted">Version</dt>
                        <dd>{g.version_label ?? <NotVerified />}</dd>
                        <dt className="text-muted">Version date</dt>
                        <dd>{g.version_date ? formatDate(g.version_date) : <NotVerified />}</dd>
                      </dl>
                      {g.change_note && g.change_note_status && (
                        <div className="mt-3 rounded-lg bg-canvas p-3 text-sm">
                          <p className="mb-1 font-medium">What changed</p>
                          <p>
                            <AbbrText text={g.change_note} glossary={data.abbreviations} context={g.subspecialty_ids} />
                          </p>
                          <div className="mt-2">
                            <ReviewBadge status={g.change_note_status} reviewedBy={g.reviewed_by} reviewedAt={g.reviewed_at} />
                          </div>
                        </div>
                      )}
                      <p className="mt-3 text-xs text-muted">
                        Source: {sourceNames.get(g.source_id) ?? g.source_id} · Last checked {formatDate(g.last_checked_at)}
                      </p>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </Page>
  );
}
