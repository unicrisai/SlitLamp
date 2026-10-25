import { Page } from "@/components/Page";
import { unknownAbbreviations } from "@/lib/abbreviations";
import { loadAll } from "@/lib/data";
import { formatDate, withBasePath } from "@/lib/format";

export const metadata = { title: "Abbreviation glossary · SlitLamp" };

export default function GlossaryPage() {
  const data = loadAll();
  const subNames = new Map(data.subspecialties.map((s) => [s.id, s.name]));
  const approved = data.abbreviations
    .filter((a) => a.status === "approved")
    .sort((a, b) => a.abbr.localeCompare(b.abbr));
  const suggested = data.abbreviations.filter((a) => a.status === "suggested");
  const seen = unknownAbbreviations(
    data.papers.map((p) => ({ text: [p.title, p.summary ?? ""].join(" "), context: p.subspecialty_ids })),
    data.abbreviations,
  );

  return (
    <Page>
      <div>
        <header className="mb-6">
          <p className="text-sm font-medium text-brand">Abbreviation glossary</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Reviewed abbreviations</h1>
          <p className="mt-1 text-sm text-muted">
            Only approved entries are expanded on this site. One abbreviation can have different meanings in
            different subspecialties; when the context is unclear it is flagged, not guessed.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            <a href={withBasePath("/glossary.csv")} download className="rounded-lg bg-brand px-3 py-2 font-medium text-white hover:opacity-90">
              Download CSV
            </a>
            <a href={withBasePath("/glossary.txt")} download className="rounded-lg border border-line bg-surface px-3 py-2 font-medium hover:border-brand">
              Download text for AI tools
            </a>
          </div>
        </header>

        {approved.length === 0 ? (
          <p className="rounded-xl border border-dashed border-line p-8 text-center text-sm text-muted">
            No approved abbreviations yet. Entries appear here once the clinical reviewer approves them.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-line bg-surface">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-canvas text-muted">
                <tr>
                  <th className="px-4 py-2 font-medium">Abbreviation</th>
                  <th className="px-4 py-2 font-medium">Meaning</th>
                  <th className="px-4 py-2 font-medium">Context</th>
                  <th className="px-4 py-2 font-medium">Approved</th>
                </tr>
              </thead>
              <tbody>
                {approved.map((a) => (
                  <tr key={a.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-2 font-semibold">{a.abbr}</td>
                    <td className="px-4 py-2">
                      {a.expansion}
                      {a.notes && <span className="block text-xs text-muted">{a.notes}</span>}
                    </td>
                    <td className="px-4 py-2 text-muted">{a.subspecialty_id ? subNames.get(a.subspecialty_id) : "General"}</td>
                    <td className="px-4 py-2 text-xs text-muted">
                      {a.approved_by}, {formatDate(a.approved_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <section className="mt-10">
          <h2 className="text-lg font-semibold">Waiting for review</h2>
          <p className="mt-1 text-sm text-muted">
            {suggested.length} suggested entries not yet approved. Abbreviations seen in digest titles that have no
            approved meaning (most frequent first), for the reviewer to add:
          </p>
          {seen.length === 0 ? (
            <p className="mt-3 text-sm text-muted">None.</p>
          ) : (
            <ul className="mt-3 flex flex-wrap gap-2">
              {seen.map((s) => (
                <li key={s.abbr} className="rounded-full border border-line bg-surface px-2.5 py-1 text-xs">
                  <span className="font-semibold">{s.abbr}</span> <span className="text-muted">×{s.count}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </Page>
  );
}
