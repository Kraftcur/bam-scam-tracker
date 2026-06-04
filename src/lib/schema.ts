import { z } from "zod";

export const reliabilityTierSchema = z.enum([
  "court-record",
  "official",
  "trusted-archive",
  "reported",
  "primary-video",
  "community"
]);

export const sourceTypeSchema = z.enum([
  "court-record",
  "official-statement",
  "public-archive",
  "news-report",
  "video",
  "audio",
  "community"
]);

export const recordStatusSchema = z.enum([
  "court-record",
  "official-statement",
  "verified",
  "alleged",
  "disputed",
  "needs-review",
  "community"
]);

export const sourceSchema = z.object({
  id: z.string().min(3),
  url: z.string().url(),
  title: z.string().min(4),
  publisher: z.string().min(2),
  sourceType: sourceTypeSchema,
  archiveUrl: z.string().url().optional(),
  dateFound: z.string().datetime({ offset: true }),
  reliabilityTier: reliabilityTierSchema,
  lastChecked: z.string().datetime({ offset: true }),
  notes: z.string().optional()
});

export const timelineEventSchema = z.object({
  id: z.string().min(3),
  occurredAt: z.string().datetime({ offset: true }),
  title: z.string().min(4),
  summary: z.string().min(10),
  category: z.enum([
    "collection",
    "franchise",
    "court",
    "police",
    "video",
    "statement",
    "media",
    "site"
  ]),
  involvedParties: z.array(z.string().min(2)),
  sourceIds: z.array(z.string().min(3)).min(1),
  confidence: z.enum(["high", "medium", "low"]),
  status: recordStatusSchema,
  publicationRisk: z.enum(["low", "moderate", "high"]),
  imageUrl: z.string().url().optional(),
  videoUrl: z.string().url().optional(),
  benPerspective: z.string().optional(),
  bamPerspective: z.string().optional()
});

export const caseRecordSchema = z.object({
  id: z.string().min(3),
  caseNumber: z.string().min(3),
  title: z.string().min(4),
  jurisdiction: z.string().min(2),
  court: z.string().min(2),
  parties: z.array(z.string().min(2)),
  judge: z.string().optional(),
  status: z.string().min(2),
  nextHearingAt: z.string().datetime({ offset: true }).optional(),
  sourceIds: z.array(z.string().min(3)).min(1),
  summary: z.string().min(10),
  lastChecked: z.string().datetime({ offset: true })
});

export const documentRecordSchema = z.object({
  id: z.string().min(3),
  title: z.string().min(4),
  sourceId: z.string().min(3),
  caseId: z.string().optional(),
  documentType: z.string().min(2),
  fileType: z.enum(["pdf", "png", "html", "audio", "video", "other"]),
  datePublished: z.string().datetime({ offset: true }).optional(),
  r2Key: z.string().optional(),
  externalUrl: z.string().url(),
  redactionStatus: z.enum(["public-redacted", "public", "unknown", "needs-review"]),
  extractedText: z.string().optional(),
  status: recordStatusSchema
});

export const clipRecordSchema = z.object({
  id: z.string().min(3),
  title: z.string().min(4),
  platform: z.string().min(2),
  sourceUrl: z.string().url(),
  sourceId: z.string().min(3),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
  transcriptExcerpt: z.string(),
  relatedEventIds: z.array(z.string().min(3)),
  status: recordStatusSchema,
  publicationRisk: z.enum(["low", "moderate", "high"])
});

export const claimRecordSchema = z.object({
  id: z.string().min(3),
  claimant: z.string().min(2),
  claimText: z.string().min(10),
  relatedEvidenceIds: z.array(z.string().min(3)),
  relatedSourceIds: z.array(z.string().min(3)).min(1),
  status: recordStatusSchema,
  confidence: z.enum(["high", "medium", "low"]),
  publicationRisk: z.enum(["low", "moderate", "high"]),
  editorNote: z.string().min(4)
});

export const submissionSchema = z.object({
  id: z.string().min(3),
  submitterName: z.string().optional(),
  submitterContact: z.string().optional(),
  url: z.string().url().optional(),
  title: z.string().min(4),
  summary: z.string().min(20),
  suggestedCategory: z.string().min(2),
  moderationStatus: z.enum(["new", "triaged", "approved", "rejected"]),
  createdAt: z.string().datetime({ offset: true }),
  reviewerNote: z.string().optional(),
  imageUrl: z.string().url().optional(),
  videoUrl: z.string().url().optional(),
  benPerspective: z.string().optional(),
  bamPerspective: z.string().optional(),
  communityEventId: z.string().optional(),
  aiScore: z.number().int().min(0).max(100).optional(),
  aiScoreReasons: z.array(z.string()).optional(),
  clusterKey: z.string().optional(),
  duplicateKey: z.string().optional(),
  suggestedAction: z.enum(["feed", "timeline-review", "duplicate", "needs-human", "reject"]).optional(),
  aiSummary: z.string().optional(),
  processedAt: z.string().datetime({ offset: true }).optional()
});

export const ingestionRunSchema = z.object({
  id: z.string().min(3),
  sourceName: z.string().min(2),
  startedAt: z.string().datetime({ offset: true }),
  finishedAt: z.string().datetime({ offset: true }).optional(),
  status: z.enum(["queued", "running", "completed", "failed"]),
  candidatesFound: z.number().int().nonnegative(),
  autoPublished: z.number().int().nonnegative(),
  needsReview: z.number().int().nonnegative(),
  error: z.string().optional()
});

export const sourceCheckSchema = z.object({
  sourceId: z.string().min(3),
  url: z.string().url(),
  title: z.string().min(4),
  checkedAt: z.string().datetime({ offset: true }),
  lastChangedAt: z.string().datetime({ offset: true }).optional(),
  httpStatus: z.number().int().optional(),
  ok: z.boolean(),
  contentHash: z.string().optional(),
  contentLength: z.number().int().nonnegative(),
  changed: z.boolean(),
  error: z.string().optional()
});

export const trackerDataSchema = z.object({
  sources: z.array(sourceSchema),
  events: z.array(timelineEventSchema),
  cases: z.array(caseRecordSchema),
  documents: z.array(documentRecordSchema),
  clips: z.array(clipRecordSchema),
  claims: z.array(claimRecordSchema),
  submissions: z.array(submissionSchema),
  ingestionRuns: z.array(ingestionRunSchema),
  sourceChecks: z.array(sourceCheckSchema)
});

export const publicSubmissionInputSchema = z.object({
  submitterName: z.string().trim().max(120).optional(),
  submitterContact: z.string().trim().max(240).optional(),
  url: z.string().trim().url().optional().or(z.literal("")),
  title: z.string().trim().min(4).max(180),
  summary: z.string().trim().min(20).max(4000),
  suggestedCategory: z.string().trim().min(2).max(80),
  website: z.string().trim().max(500).optional(),
  formStartedAt: z.string().trim().optional(),
  turnstileToken: z.string().trim().optional()
});

export type PublicSubmissionInput = z.infer<typeof publicSubmissionInputSchema>;
