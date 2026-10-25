import { z } from "zod";

// Shapes follow the data model in docs/BLUEPRINT.md so they can move to
// Postgres + Drizzle later. Unknown values are null, never guessed.

const isoDate = z.iso.date(); // YYYY-MM-DD
const isoDateTime = z.iso.datetime({ offset: true });

export const SubspecialtySchema = z.object({
  id: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
});

export const SourceSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  url: z.url(),
  licence: z.string().nullable(),
  retrieved_at: isoDateTime.nullable(),
});

export const ReviewStatusSchema = z.enum(["ai_draft", "reviewed"]);

export const GuidelineSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1),
    issuer: z.string().min(1),
    subspecialty_ids: z.array(z.string()),
    url: z.url(),
    version_label: z.string().nullable(),
    version_date: isoDate.nullable(),
    last_checked_at: isoDateTime.nullable(),
    status: z.enum(["current", "updated", "superseded"]),
    change_note: z.string().nullable(),
    change_note_status: ReviewStatusSchema.nullable(),
    reviewed_by: z.string().nullable(),
    reviewed_at: isoDateTime.nullable(),
    source_id: z.string().min(1),
  })
  .refine((g) => (g.change_note === null) === (g.change_note_status === null), {
    message: "change_note and change_note_status must both be set or both be null",
  })
  .refine((g) => g.change_note_status !== "reviewed" || (g.reviewed_by && g.reviewed_at), {
    message: "reviewed change notes need reviewed_by and reviewed_at",
  });

export const PublicationTypeSchema = z.enum([
  "randomized_controlled_trial",
  "systematic_review",
  "meta_analysis",
  "practice_guideline",
]);

export const PaperSchema = z
  .object({
    id: z.string().min(1),
    pmid: z.string().regex(/^\d+$/),
    doi: z.string().nullable(),
    title: z.string().min(1),
    journal: z.string().min(1),
    pub_date: z.string().nullable(), // as PubMed reports it, e.g. "2026 Oct 18"
    publication_types: z.array(PublicationTypeSchema).min(1),
    subspecialty_ids: z.array(z.string()),
    url: z.url(),
    open_access_licence: z.string().nullable(),
    summary: z.string().nullable(),
    summary_status: z.enum(["none", "ai_draft", "reviewed"]),
    reviewed_by: z.string().nullable(),
    reviewed_at: isoDateTime.nullable(),
    retrieved_at: isoDateTime,
    source_id: z.string().min(1),
  })
  .refine((p) => (p.summary === null) === (p.summary_status === "none"), {
    message: "summary must be null exactly when summary_status is 'none'",
  })
  .refine((p) => p.summary_status !== "reviewed" || (p.reviewed_by && p.reviewed_at), {
    message: "reviewed summaries need reviewed_by and reviewed_at",
  });

export const AbbreviationSchema = z
  .object({
    id: z.string().min(1),
    abbr: z.string().min(1),
    expansion: z.string().min(1),
    subspecialty_id: z.string().nullable(), // null = general meaning
    notes: z.string().nullable(),
    status: z.enum(["suggested", "approved"]),
    approved_by: z.string().nullable(),
    approved_at: isoDateTime.nullable(),
  })
  .refine((a) => a.status !== "approved" || (a.approved_by && a.approved_at), {
    message: "approved abbreviations need approved_by and approved_at",
  });

export const DigestSchema = z.object({
  id: z.string().min(1),
  week_start: isoDate,
  paper_ids: z.array(z.string()),
  guideline_ids: z.array(z.string()),
  published_at: isoDateTime.nullable(),
});

export const SubspecialtiesFile = z.array(SubspecialtySchema);
export const SourcesFile = z.array(SourceSchema);
export const GuidelinesFile = z.array(GuidelineSchema);
export const PapersFile = z.array(PaperSchema);
export const AbbreviationsFile = z.array(AbbreviationSchema);
export const DigestsFile = z.array(DigestSchema);

export type Subspecialty = z.infer<typeof SubspecialtySchema>;
export type Source = z.infer<typeof SourceSchema>;
export type Guideline = z.infer<typeof GuidelineSchema>;
export type PublicationType = z.infer<typeof PublicationTypeSchema>;
export type Paper = z.infer<typeof PaperSchema>;
export type Abbreviation = z.infer<typeof AbbreviationSchema>;
export type Digest = z.infer<typeof DigestSchema>;

export const PUBLICATION_TYPE_LABELS: Record<PublicationType, string> = {
  randomized_controlled_trial: "Randomized controlled trial",
  systematic_review: "Systematic review",
  meta_analysis: "Meta-analysis",
  practice_guideline: "Practice guideline",
};
