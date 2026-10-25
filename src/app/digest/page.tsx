import Link from "next/link";
import { DigestView } from "@/components/DigestView";
import { Page } from "@/components/Page";
import { loadAll } from "@/lib/data";
import { weekRange } from "@/lib/format";

export const metadata = { title: "Weekly digest · SlitLamp" };

export default function LatestDigestPage() {
  const data = loadAll();
  const digests = [...data.digests].sort((a, b) => b.week_start.localeCompare(a.week_start));
  const [latest, ...older] = digests;

  if (!latest) {
    return (
      <Page>
        <p className="rounded-xl border border-dashed border-line p-8 text-center text-muted">
          No weekly digest yet. The first one appears after the weekly PubMed fetch runs.
        </p>
      </Page>
    );
  }

  return (
    <Page>
      <DigestView digest={latest} data={data} />
      {older.length > 0 && (
        <section className="mt-12 border-t border-line pt-6">
          <h2 className="mb-3 text-lg font-semibold">Earlier digests</h2>
          <ul className="space-y-1 text-sm">
            {older.map((d) => (
              <li key={d.id}>
                <Link href={`/digests/${d.week_start}/`} className="text-brand hover:underline">
                  {weekRange(d.week_start)}
                </Link>{" "}
                <span className="text-muted">· {d.paper_ids.length} papers</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </Page>
  );
}
