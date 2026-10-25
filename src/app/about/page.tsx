export const metadata = { title: "About · SlitLamp" };

export default function AboutPage() {
  return (
    <article className="max-w-2xl space-y-4 leading-relaxed">
      <h1 className="text-2xl font-semibold tracking-tight">About SlitLamp</h1>
      <p>
        A weekly tracker for ophthalmologists in Thailand: which guidelines changed and which new high-evidence
        studies were published, across all subspecialties.
      </p>

      <h2 className="pt-2 text-lg font-semibold">Information, not advice</h2>
      <p>
        This site reports what published literature and clinical guidelines say. It does not give medical
        advice and never recommends treatment for an individual patient. Always read the original paper or
        guideline, linked on every item, before acting on it.
      </p>

      <h2 className="pt-2 text-lg font-semibold">Where the content comes from</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          Papers: PubMed citation data for randomized controlled trials, systematic reviews, meta-analyses and
          practice guidelines indexed under ophthalmology MeSH terms. Abstracts are not copied; each item links
          to PubMed.
        </li>
        <li>Guidelines: links and version details from each issuing body. Guideline text is not copied.</li>
        <li>Every item shows its source and when it was retrieved or last checked.</li>
      </ul>

      <h2 className="pt-2 text-lg font-semibold">AI-written content</h2>
      <p>
        Any summary or change note written by AI is labelled &ldquo;AI draft&rdquo; until a clinician reviews it,
        then shows who reviewed it and when. Abbreviations are expanded only from a glossary reviewed by a
        practising ophthalmologist; anything not in it is marked, not guessed.
      </p>

      <h2 className="pt-2 text-lg font-semibold">No patient data</h2>
      <p>The site collects and stores no patient information.</p>
    </article>
  );
}
