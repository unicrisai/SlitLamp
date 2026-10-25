// Validates every JSON file in data/ against its schema and checks
// cross-file references. Exits non-zero on any problem.
import { checkReferences, loadAll } from "../src/lib/data";

try {
  const data = loadAll();
  const errors = checkReferences(data);
  if (errors.length > 0) {
    console.error(errors.join("\n"));
    process.exit(1);
  }
  console.log(
    `data/ OK: ${data.papers.length} papers, ${data.guidelines.length} guidelines, ` +
      `${data.abbreviations.length} abbreviations, ${data.digests.length} digests`,
  );
} catch (err) {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
}
