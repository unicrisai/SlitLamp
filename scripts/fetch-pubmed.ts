/**
 * Weekly PubMed fetch.
 *
 *   npm run fetch:pubmed                      # last complete Mon–Sun week
 *   npm run fetch:pubmed -- --week 2026-10-12 # a specific week (Monday)
 *
 * Queries E-utilities for ophthalmology papers of high-evidence publication
 * types whose MeSH date (mhda) falls in the week. MeSH date is used rather
 * than entry date because a record only gets MeSH terms once indexed, so an
 * entry-date query with a MeSH filter would miss most new papers.
 *
 * Stores citation data only (no abstracts). Idempotent: papers are deduped on
 * PMID, existing records (and their review fields) are kept as they are, and
 * the week's digest is rebuilt from the same query.
 */
import { XMLParser } from "fast-xml-parser";
import { loadCollection, saveCollection } from "../src/lib/data";
import { subspecialtiesForMesh } from "../src/lib/mesh-map";
import type { Digest, Paper, PublicationType } from "../src/lib/schemas";

const EUTILS = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";
const EFETCH_BATCH = 200;

const OPHTHALMOLOGY_MESH = [
  '"Eye Diseases"[MeSH Terms]',
  '"Eye"[MeSH Terms]',
  '"Ophthalmology"[MeSH Terms]',
  '"Ophthalmologic Surgical Procedures"[MeSH Terms]',
];

const PUBLICATION_TYPES: Record<string, PublicationType> = {
  "Randomized Controlled Trial": "randomized_controlled_trial",
  "Systematic Review": "systematic_review",
  "Meta-Analysis": "meta_analysis",
  "Practice Guideline": "practice_guideline",
};

// ---- environment ---------------------------------------------------------

function loadEnvLocal(): void {
  try {
    process.loadEnvFile(".env.local");
  } catch {
    // No .env.local (e.g. in GitHub Actions, where secrets come from env).
  }
}

loadEnvLocal();
const email = process.env.NCBI_EMAIL?.trim();
const tool = process.env.NCBI_TOOL?.trim() || "slitlamp";
const apiKey = process.env.NCBI_API_KEY?.trim() || undefined;

if (!email) {
  console.error("NCBI_EMAIL is not set. Copy .env.example to .env.local and fill it in.");
  process.exit(1);
}

// ---- throttled requests --------------------------------------------------

// 3 requests/second without a key, 10 with one; stay just under.
const minIntervalMs = apiKey ? 110 : 350;
let lastRequest = 0;

async function eutils(endpoint: string, params: Record<string, string>): Promise<string> {
  const wait = lastRequest + minIntervalMs - Date.now();
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastRequest = Date.now();

  const body = new URLSearchParams({ ...params, tool, email: email as string });
  if (apiKey) body.set("api_key", apiKey);

  for (let attempt = 1; ; attempt++) {
    const res = await fetch(`${EUTILS}/${endpoint}`, { method: "POST", body });
    if (res.ok) return res.text();
    if (attempt >= 3 || (res.status !== 429 && res.status < 500)) {
      throw new Error(`${endpoint} failed: HTTP ${res.status} ${await res.text()}`);
    }
    await new Promise((r) => setTimeout(r, 1000 * attempt));
  }
}

// ---- week window ---------------------------------------------------------

function parseWeekArg(): Date {
  const i = process.argv.indexOf("--week");
  if (i !== -1) {
    const value = process.argv[i + 1] ?? "";
    const d = new Date(`${value}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(d.getTime()) || d.getUTCDay() !== 1) {
      console.error(`--week must be a Monday as YYYY-MM-DD, got "${value}"`);
      process.exit(1);
    }
    return d;
  }
  // Most recent Monday whose week (Mon–Sun) has fully ended before today.
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const sinceMonday = (today.getUTCDay() + 6) % 7;
  const monday = new Date(today);
  monday.setUTCDate(today.getUTCDate() - sinceMonday - 7);
  return monday;
}

const isoDay = (d: Date) => d.toISOString().slice(0, 10);
const eutilsDay = (d: Date) => isoDay(d).replaceAll("-", "/");

// ---- XML parsing ---------------------------------------------------------

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@",
  textNodeName: "#text",
  // Titles can contain inline markup (<i>, <sup>); keep them as raw strings.
  stopNodes: ["*.ArticleTitle"],
  isArray: (name) =>
    ["PubmedArticle", "PublicationType", "ArticleId", "MeshHeading", "ELocationID"].includes(name),
});

type XmlNode = Record<string, unknown>;

function obj(v: unknown): XmlNode {
  return v !== null && typeof v === "object" && !Array.isArray(v) ? (v as XmlNode) : {};
}
function arr(v: unknown): unknown[] {
  return Array.isArray(v) ? v : v === undefined ? [] : [v];
}
function text(v: unknown): string {
  if (typeof v === "string" || typeof v === "number") return String(v);
  const t = obj(v)["#text"];
  return typeof t === "string" || typeof t === "number" ? String(t) : "";
}
function cleanTitle(raw: string): string {
  return raw
    .replace(/<[^>]+>/g, "")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec: string) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function toPaper(article: unknown, retrievedAt: string): Paper | null {
  const citation = obj(obj(article)["MedlineCitation"]);
  const pubmedData = obj(obj(article)["PubmedData"]);
  const art = obj(citation["Article"]);
  const journal = obj(art["Journal"]);

  const pmid = text(citation["PMID"]);
  const title = cleanTitle(text(art["ArticleTitle"]));
  const journalTitle = text(journal["Title"]) || text(obj(citation["MedlineJournalInfo"])["MedlineTA"]);
  if (!pmid || !title || !journalTitle) return null;

  const pubDate = obj(obj(journal["JournalIssue"])["PubDate"]);
  const pub_date =
    text(pubDate["MedlineDate"]) ||
    [text(pubDate["Year"]), text(pubDate["Month"]), text(pubDate["Day"])].filter(Boolean).join(" ") ||
    null;

  const types = arr(obj(art["PublicationTypeList"])["PublicationType"])
    .map((t) => PUBLICATION_TYPES[text(t)])
    .filter((t): t is PublicationType => t !== undefined);
  if (types.length === 0) return null;

  const ids = arr(obj(pubmedData["ArticleIdList"])["ArticleId"]);
  const idOf = (type: string) => {
    const found = ids.find((i) => obj(i)["@IdType"] === type);
    return found === undefined ? null : text(found) || null;
  };

  const mesh = arr(obj(citation["MeshHeadingList"])["MeshHeading"]).map((h) =>
    text(obj(h)["DescriptorName"]),
  );

  return {
    id: `pmid-${pmid}`,
    pmid,
    doi: idOf("doi"),
    title,
    journal: journalTitle,
    pub_date,
    publication_types: [...new Set(types)],
    subspecialty_ids: subspecialtiesForMesh(mesh),
    url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
    open_access_licence: null, // not checked yet; never assumed
    summary: null,
    summary_status: "none",
    reviewed_by: null,
    reviewed_at: null,
    retrieved_at: retrievedAt,
    source_id: "pubmed",
  };
}

// ---- main ----------------------------------------------------------------

async function main(): Promise<void> {
  const weekStart = parseWeekArg();
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekStart.getUTCDate() + 6);
  const retrievedAt = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");

  const term = `(${OPHTHALMOLOGY_MESH.join(" OR ")}) AND (${Object.keys(PUBLICATION_TYPES)
    .map((t) => `"${t}"[Publication Type]`)
    .join(" OR ")})`;

  console.log(`Week ${isoDay(weekStart)} to ${isoDay(weekEnd)} (MeSH date)`);

  const search = JSON.parse(
    await eutils("esearch.fcgi", {
      db: "pubmed",
      term,
      datetype: "mhda",
      mindate: eutilsDay(weekStart),
      maxdate: eutilsDay(weekEnd),
      retmax: "10000",
      retmode: "json",
    }),
  ) as { esearchresult?: { count?: string; idlist?: string[] } };

  const pmids = search.esearchresult?.idlist ?? [];
  console.log(`Found ${search.esearchresult?.count ?? 0} PMIDs`);

  const papers = loadCollection("papers");
  const byPmid = new Map(papers.map((p) => [p.pmid, p]));
  const toFetch = pmids.filter((id) => !byPmid.has(id));

  let added = 0;
  for (let i = 0; i < toFetch.length; i += EFETCH_BATCH) {
    const batch = toFetch.slice(i, i + EFETCH_BATCH);
    const xml = await eutils("efetch.fcgi", { db: "pubmed", id: batch.join(","), retmode: "xml" });
    const parsed = obj(parser.parse(xml));
    for (const article of arr(obj(parsed["PubmedArticleSet"])["PubmedArticle"])) {
      const paper = toPaper(article, retrievedAt);
      if (paper && !byPmid.has(paper.pmid)) {
        byPmid.set(paper.pmid, paper);
        papers.push(paper);
        added++;
      }
    }
  }

  // A paper belongs to the first digest that included it.
  const digests = loadCollection("digests");
  const weekId = isoDay(weekStart);
  const inOtherDigests = new Set(
    digests.filter((d) => d.week_start !== weekId).flatMap((d) => d.paper_ids),
  );
  const paperIds = pmids
    .map((id) => byPmid.get(id)?.id)
    .filter((id): id is string => id !== undefined && !inOtherDigests.has(id));

  const existing = digests.find((d) => d.week_start === weekId);
  const digest: Digest = {
    id: weekId,
    week_start: weekId,
    paper_ids: paperIds,
    guideline_ids: existing?.guideline_ids ?? [],
    published_at: existing?.published_at ?? retrievedAt,
  };
  const nextDigests = [...digests.filter((d) => d.week_start !== weekId), digest].sort((a, b) =>
    a.week_start.localeCompare(b.week_start),
  );

  const sources = loadCollection("sources").map((s) =>
    s.id === "pubmed" ? { ...s, retrieved_at: retrievedAt } : s,
  );

  saveCollection("papers", papers);
  saveCollection("digests", nextDigests);
  saveCollection("sources", sources);

  console.log(`Added ${added} new papers; digest ${weekId} has ${paperIds.length} papers`);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
