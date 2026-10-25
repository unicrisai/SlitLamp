import { segmentText } from "@/lib/abbreviations";
import type { Abbreviation } from "@/lib/schemas";

// Renders text with approved abbreviations expanded on hover; unknown or
// ambiguous ones get a wavy underline and a "not in glossary" tooltip.
export function AbbrText({
  text,
  glossary,
  context,
}: {
  text: string;
  glossary: readonly Abbreviation[];
  context: readonly string[];
}) {
  return (
    <>
      {segmentText(text, glossary, context).map((s, i) => {
        switch (s.kind) {
          case "text":
            return s.text;
          case "known":
            return (
              <abbr key={i} data-glossary title={s.expansion}>
                {s.text}
              </abbr>
            );
          case "ambiguous":
            return (
              <abbr key={i} data-flag title={`Ambiguous here, not expanded. Glossary meanings: ${s.meanings.join("; ")}`}>
                {s.text}
              </abbr>
            );
          case "unknown":
            return (
              <abbr key={i} data-flag title="Not in the reviewed glossary yet, not expanded">
                {s.text}
              </abbr>
            );
        }
      })}
    </>
  );
}
