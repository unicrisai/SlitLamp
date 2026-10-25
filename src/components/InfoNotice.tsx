// Shown on every page (rule 4: information, not advice).
export function InfoNotice() {
  return (
    <p className="mb-8 rounded-lg border border-line bg-surface px-4 py-3 text-sm text-muted">
      <strong className="text-ink">Information, not advice.</strong> This site reports what published
      literature and guidelines say. It does not recommend treatment for any patient. Check the original
      source before relying on anything here.
    </p>
  );
}
