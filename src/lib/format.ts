const DATE = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

export function formatDate(iso: string | null): string {
  if (!iso) return "unknown date";
  const d = new Date(iso.length === 10 ? `${iso}T00:00:00Z` : iso);
  return Number.isNaN(d.getTime()) ? iso : DATE.format(d);
}

export function weekRange(weekStart: string): string {
  const start = new Date(`${weekStart}T00:00:00Z`);
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);
  return `${formatDate(weekStart)} – ${formatDate(end.toISOString())}`;
}

// GitHub Pages serves under a base path; next/link adds it, plain <a> does not.
export function withBasePath(href: string): string {
  return `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${href}`;
}
