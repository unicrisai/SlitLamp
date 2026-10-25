// Exports approved abbreviations to public/glossary.csv and public/glossary.txt
// so the first user can hand the glossary to Claude or other AI tools.
// Suggested (unreviewed) entries are never exported.
import { writeFileSync } from "node:fs";
import path from "node:path";
import { loadCollection } from "../src/lib/data";

const subspecialties = new Map(loadCollection("subspecialties").map((s) => [s.id, s.name]));
const approved = loadCollection("abbreviations")
  .filter((a) => a.status === "approved")
  .sort((a, b) => a.abbr.localeCompare(b.abbr) || a.expansion.localeCompare(b.expansion));

const context = (id: string | null) => (id === null ? "General" : (subspecialties.get(id) ?? id));
const csvCell = (v: string) => (/[",\n]/.test(v) ? `"${v.replaceAll('"', '""')}"` : v);

const csv = [
  "abbreviation,expansion,context,notes,approved_by,approved_at",
  ...approved.map((a) =>
    [a.abbr, a.expansion, context(a.subspecialty_id), a.notes ?? "", a.approved_by ?? "", a.approved_at ?? ""]
      .map(csvCell)
      .join(","),
  ),
].join("\n");

const txt = [
  "Ophthalmology abbreviation glossary (reviewed entries only).",
  "Use these expansions exactly. If an abbreviation is not listed, or has several",
  "meanings and the context is unclear, ask rather than guess.",
  "",
  ...approved.map(
    (a) => `${a.abbr} = ${a.expansion} [${context(a.subspecialty_id)}]${a.notes ? ` (${a.notes})` : ""}`,
  ),
].join("\n");

const publicDir = path.join(process.cwd(), "public");
writeFileSync(path.join(publicDir, "glossary.csv"), csv + "\n");
writeFileSync(path.join(publicDir, "glossary.txt"), txt + "\n");
console.log(`Exported ${approved.length} approved abbreviations to public/glossary.{csv,txt}`);
