import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { z } from "zod";
import {
  AbbreviationsFile,
  DigestsFile,
  GuidelinesFile,
  PapersFile,
  SourcesFile,
  SubspecialtiesFile,
} from "./schemas";

// Read at build time (pages) and by scripts; both run from the repo root.
const DATA_DIR = path.join(process.cwd(), "data");

export const COLLECTIONS = {
  subspecialties: SubspecialtiesFile,
  sources: SourcesFile,
  guidelines: GuidelinesFile,
  papers: PapersFile,
  abbreviations: AbbreviationsFile,
  digests: DigestsFile,
} as const;

export type CollectionName = keyof typeof COLLECTIONS;
export type CollectionData<K extends CollectionName> = z.infer<(typeof COLLECTIONS)[K]>;

function filePath(name: CollectionName): string {
  return path.join(DATA_DIR, `${name}.json`);
}

export function loadCollection<K extends CollectionName>(name: K): CollectionData<K> {
  const raw: unknown = JSON.parse(readFileSync(filePath(name), "utf8"));
  const result = COLLECTIONS[name].safeParse(raw);
  if (!result.success) {
    throw new Error(`data/${name}.json is invalid:\n${result.error.message}`);
  }
  return result.data as CollectionData<K>;
}

export function saveCollection<K extends CollectionName>(name: K, data: CollectionData<K>): void {
  // Validate before writing so a bad fetch never lands in the repo.
  COLLECTIONS[name].parse(data);
  writeFileSync(filePath(name), JSON.stringify(data, null, 2) + "\n");
}

export function loadAll() {
  return {
    subspecialties: loadCollection("subspecialties"),
    sources: loadCollection("sources"),
    guidelines: loadCollection("guidelines"),
    papers: loadCollection("papers"),
    abbreviations: loadCollection("abbreviations"),
    digests: loadCollection("digests"),
  };
}

export type AllData = ReturnType<typeof loadAll>;

// Cross-file checks that Zod cannot express per file.
export function checkReferences(d: AllData): string[] {
  const errors: string[] = [];
  const subs = new Set(d.subspecialties.map((s) => s.id));
  const sources = new Set(d.sources.map((s) => s.id));
  const papers = new Set(d.papers.map((p) => p.id));
  const guidelines = new Set(d.guidelines.map((g) => g.id));

  const dupes = (ids: string[], label: string) => {
    const seen = new Set<string>();
    for (const id of ids) {
      if (seen.has(id)) errors.push(`duplicate ${label}: ${id}`);
      seen.add(id);
    }
  };
  dupes(d.papers.map((p) => p.pmid), "paper PMID");
  dupes(d.papers.map((p) => p.id), "paper id");
  dupes(d.guidelines.map((g) => g.id), "guideline id");
  dupes(d.abbreviations.map((a) => a.id), "abbreviation id");
  dupes(d.digests.map((g) => g.week_start), "digest week_start");

  for (const g of d.guidelines) {
    if (!sources.has(g.source_id)) errors.push(`guideline ${g.id}: unknown source ${g.source_id}`);
    for (const s of g.subspecialty_ids)
      if (!subs.has(s)) errors.push(`guideline ${g.id}: unknown subspecialty ${s}`);
  }
  for (const p of d.papers) {
    if (!sources.has(p.source_id)) errors.push(`paper ${p.id}: unknown source ${p.source_id}`);
    for (const s of p.subspecialty_ids)
      if (!subs.has(s)) errors.push(`paper ${p.id}: unknown subspecialty ${s}`);
  }
  for (const a of d.abbreviations) {
    if (a.subspecialty_id !== null && !subs.has(a.subspecialty_id))
      errors.push(`abbreviation ${a.id}: unknown subspecialty ${a.subspecialty_id}`);
  }
  for (const dg of d.digests) {
    for (const id of dg.paper_ids) if (!papers.has(id)) errors.push(`digest ${dg.id}: unknown paper ${id}`);
    for (const id of dg.guideline_ids)
      if (!guidelines.has(id)) errors.push(`digest ${dg.id}: unknown guideline ${id}`);
  }
  return errors;
}
