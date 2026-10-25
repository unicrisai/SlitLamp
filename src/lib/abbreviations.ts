import type { Abbreviation } from "./schemas";

// Rule 6: only approved glossary entries are expanded. Anything else that
// looks like an abbreviation is flagged, never guessed.

export type Segment =
  | { kind: "text"; text: string }
  | { kind: "known"; text: string; expansion: string }
  | { kind: "ambiguous"; text: string; meanings: string[] }
  | { kind: "unknown"; text: string };

// Two or more capitals, optionally a leading lowercase letter (nAMD) and digits (COVID-19 is split
// at the hyphen). Plural "s" is matched but looked up without it (RCTs -> RCT).
const TOKEN = /\b[a-z]?[A-Z][A-Z0-9]*[A-Z][A-Z0-9]*s?\b/g;
const ROMAN = /^[IVXLC]+$/;

type Resolved = { kind: "known"; expansion: string } | { kind: "ambiguous"; meanings: string[] };

function resolve(abbr: string, approved: readonly Abbreviation[], context: readonly string[]): Resolved | null {
  const meanings = approved.filter((a) => a.abbr === abbr);
  if (meanings.length === 0) return null;
  const inContext = meanings.filter((a) => a.subspecialty_id !== null && context.includes(a.subspecialty_id));
  const general = meanings.filter((a) => a.subspecialty_id === null);
  const pick = inContext.length > 0 ? inContext : general;
  const distinct = [...new Set(pick.map((a) => a.expansion))];
  if (distinct.length === 1) return { kind: "known", expansion: distinct[0] as string };
  return { kind: "ambiguous", meanings: [...new Set(meanings.map((a) => a.expansion))] };
}

export function segmentText(
  text: string,
  glossary: readonly Abbreviation[],
  context: readonly string[],
): Segment[] {
  const approved = glossary.filter((a) => a.status === "approved");
  const out: Segment[] = [];
  let last = 0;
  for (const m of text.matchAll(TOKEN)) {
    const token = m[0];
    if (ROMAN.test(token)) continue;
    const start = m.index;
    if (start > last) out.push({ kind: "text", text: text.slice(last, start) });
    const stem = token.endsWith("s") ? token.slice(0, -1) : token;
    const r = resolve(token, approved, context) ?? (stem !== token ? resolve(stem, approved, context) : null);
    out.push(r ? { ...r, text: token } : { kind: "unknown", text: token });
    last = start + token.length;
  }
  if (last < text.length) out.push({ kind: "text", text: text.slice(last) });
  return out;
}

// Abbreviation-like tokens in the given texts that have no approved entry,
// with how often each appears. Feeds the glossary review list.
export function unknownAbbreviations(
  texts: readonly { text: string; context: readonly string[] }[],
  glossary: readonly Abbreviation[],
): { abbr: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const t of texts) {
    for (const s of segmentText(t.text, glossary, t.context)) {
      if (s.kind !== "unknown" && s.kind !== "ambiguous") continue;
      const key = s.text.length > 2 && s.text.endsWith("s") ? s.text.slice(0, -1) : s.text;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  return [...counts]
    .map(([abbr, count]) => ({ abbr, count }))
    .sort((a, b) => b.count - a.count || a.abbr.localeCompare(b.abbr));
}
