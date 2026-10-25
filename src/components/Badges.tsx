import { formatDate } from "@/lib/format";

type ReviewState = { status: "none" | "ai_draft" | "reviewed"; reviewedBy: string | null; reviewedAt: string | null };

// Rule 3: AI output is labelled until a human reviews it.
export function ReviewBadge({ status, reviewedBy, reviewedAt }: ReviewState) {
  if (status === "reviewed") {
    return (
      <span className="rounded-full bg-ok-soft px-2 py-0.5 text-xs font-medium text-ok">
        Reviewed by {reviewedBy}, {formatDate(reviewedAt)}
      </span>
    );
  }
  if (status === "ai_draft") {
    return <span className="rounded-full bg-draft-soft px-2 py-0.5 text-xs font-medium text-draft">AI draft</span>;
  }
  return <span className="rounded-full bg-canvas px-2 py-0.5 text-xs text-muted ring-1 ring-line">No summary yet</span>;
}

export function Tag({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-brand-soft px-2 py-0.5 text-xs font-medium text-brand">{children}</span>;
}

export function NotVerified() {
  return <span className="italic text-draft">not yet verified</span>;
}
