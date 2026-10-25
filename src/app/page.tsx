import Link from "next/link";
import { InfoNotice } from "@/components/InfoNotice";
import { PixelEye } from "@/components/PixelEye";
import { loadAll } from "@/lib/data";
import { weekRange } from "@/lib/format";
import { PUBLICATION_TYPE_LABELS } from "@/lib/schemas";

const FEATURES = [
  {
    title: "Weekly evidence digest",
    body: "New randomized controlled trials, systematic reviews, meta-analyses and practice guidelines from PubMed, tagged by subspecialty and filterable.",
    href: "/digest/",
    cta: "Read the digest",
  },
  {
    title: "Guideline tracker",
    body: "The guidelines you rely on, grouped by subspecialty, with issuer, version and the date we last checked. Changes are flagged with a reviewed note.",
    href: "/guidelines/",
    cta: "See guidelines",
  },
  {
    title: "Reviewed abbreviation glossary",
    body: "Abbreviations are expanded only from a glossary checked by a practising ophthalmologist, by subspecialty. Anything not in it is marked, never guessed.",
    href: "/glossary/",
    cta: "Open the glossary",
  },
];

const STEPS = [
  { n: "1", title: "Fetch", body: "Every Monday, PubMed is searched for the week's newly indexed high-evidence ophthalmology papers." },
  { n: "2", title: "Tag", body: "Each paper is sorted into subspecialties from its MeSH headings." },
  { n: "3", title: "Summarise", body: "Short summaries in our own words, labelled as AI drafts until a clinician reviews them." },
  { n: "4", title: "Publish", body: "Everything links to its original source, with the date it was retrieved." },
];

const PRINCIPLES = [
  "Source and date on every item",
  "AI-written text labelled until reviewed",
  "Information, never treatment advice",
  "No patient data, ever",
];

export default function HomePage() {
  const data = loadAll();
  const latest = [...data.digests].sort((a, b) => b.week_start.localeCompare(a.week_start))[0];
  const papersById = new Map(data.papers.map((p) => [p.id, p]));
  const latestPapers = latest ? latest.paper_ids.flatMap((id) => papersById.get(id) ?? []) : [];
  const approvedAbbreviations = data.abbreviations.filter((a) => a.status === "approved").length;

  const stats = [
    { value: latestPapers.length, label: latest ? `papers in the latest digest` : "papers so far" },
    { value: data.guidelines.length, label: "guidelines tracked" },
    { value: data.subspecialties.length, label: "subspecialties covered" },
    { value: approvedAbbreviations, label: "reviewed abbreviations" },
  ];

  return (
    <>
      {/* Hero */}
      <section className="border-b border-line bg-surface">
        <div className="mx-auto grid max-w-5xl items-center gap-10 px-4 py-14 md:grid-cols-[1.1fr_1fr] md:py-20">
          <div>
            <p className="text-sm font-medium tracking-wide text-brand">For ophthalmologists in Thailand</p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
              What changed in ophthalmology this week.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
              SlitLamp gathers the week&rsquo;s strongest new evidence and the guideline updates that matter, across
              every subspecialty, so keeping up takes minutes instead of hours.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/digest/" className="rounded-lg bg-brand px-5 py-3 font-medium text-white shadow-sm hover:opacity-90">
                Read this week&rsquo;s digest
              </Link>
              <Link href="/about/" className="rounded-lg border border-line bg-surface px-5 py-3 font-medium hover:border-brand hover:text-brand">
                How it works
              </Link>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-md">
            <div aria-hidden className="absolute inset-6 rounded-full bg-brand-soft blur-2xl" />
            <PixelEye className="relative w-full drop-shadow-sm" />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4">
        {/* Stats */}
        <section className="grid grid-cols-2 gap-4 py-10 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-line bg-surface p-5">
              <p className="text-3xl font-semibold tracking-tight text-ink">{s.value}</p>
              <p className="mt-1 text-sm text-muted">{s.label}</p>
            </div>
          ))}
        </section>

        {/* Features */}
        <section className="pb-14">
          <h2 className="text-2xl font-semibold tracking-tight">Three things, done carefully</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {FEATURES.map((f) => (
              <Link
                key={f.title}
                href={f.href}
                className="group flex flex-col rounded-xl border border-line bg-surface p-6 shadow-sm transition hover:border-brand"
              >
                <h3 className="font-semibold">{f.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{f.body}</p>
                <span className="mt-4 text-sm font-medium text-brand group-hover:underline">{f.cta} →</span>
              </Link>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="pb-14">
          <h2 className="text-2xl font-semibold tracking-tight">How it works</h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-4">
            {STEPS.map((s) => (
              <li key={s.n} className="rounded-xl border border-line bg-surface p-5">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-brand-soft font-semibold text-brand">
                  {s.n}
                </span>
                <h3 className="mt-3 font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{s.body}</p>
              </li>
            ))}
          </ol>
          <ul className="mt-6 flex flex-wrap gap-2">
            {PRINCIPLES.map((p) => (
              <li key={p} className="rounded-full bg-brand-soft px-3 py-1 text-sm text-brand">
                {p}
              </li>
            ))}
          </ul>
        </section>

        {/* Latest papers */}
        {latest && latestPapers.length > 0 && (
          <section className="pb-14">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">From the latest digest</h2>
                <p className="mt-1 text-sm text-muted">{weekRange(latest.week_start)}</p>
              </div>
              <Link href="/digest/" className="text-sm font-medium text-brand hover:underline">
                All {latestPapers.length} papers →
              </Link>
            </div>
            <ul className="mt-5 divide-y divide-line rounded-xl border border-line bg-surface">
              {latestPapers.slice(0, 5).map((p) => (
                <li key={p.id}>
                  <Link href={`/papers/${p.pmid}/`} className="block px-5 py-4 hover:bg-canvas">
                    <p className="text-xs font-medium text-brand">
                      {p.publication_types.map((t) => PUBLICATION_TYPE_LABELS[t]).join(" · ")}
                    </p>
                    <p className="mt-1 font-medium leading-snug">{p.title}</p>
                    <p className="mt-1 text-sm italic text-muted">{p.journal}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="pb-12">
          <InfoNotice />
        </div>
      </div>
    </>
  );
}
