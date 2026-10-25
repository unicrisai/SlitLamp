import { notFound } from "next/navigation";
import { DigestView } from "@/components/DigestView";
import { loadAll, loadCollection } from "@/lib/data";

export const dynamicParams = false;

// Static export needs at least one route; "none" stands in until the first digest exists.
const PLACEHOLDER = "none";

export function generateStaticParams() {
  const weeks = loadCollection("digests").map((d) => ({ week: d.week_start }));
  return weeks.length > 0 ? weeks : [{ week: PLACEHOLDER }];
}

export default async function DigestPage({ params }: { params: Promise<{ week: string }> }) {
  const { week } = await params;
  const data = loadAll();
  const digest = data.digests.find((d) => d.week_start === week);
  if (!digest) {
    if (week === PLACEHOLDER) return <p className="text-muted">No digests yet.</p>;
    notFound();
  }
  return <DigestView digest={digest} data={data} />;
}
