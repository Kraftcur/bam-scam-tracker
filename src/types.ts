export type ReliabilityTier =
  | "court-record"
  | "official"
  | "trusted-archive"
  | "reported"
  | "primary-video"
  | "community";

export type SourceType =
  | "court-record"
  | "official-statement"
  | "public-archive"
  | "news-report"
  | "video"
  | "audio"
  | "community";

export type RecordStatus =
  | "court-record"
  | "official-statement"
  | "verified"
  | "alleged"
  | "disputed"
  | "needs-review"
  | "community";

export type Confidence = "high" | "medium" | "low";

export type PublicationRisk = "low" | "moderate" | "high";

export type Source = {
  id: string;
  url: string;
  title: string;
  publisher: string;
  sourceType: SourceType;
  archiveUrl?: string;
  dateFound: string;
  reliabilityTier: ReliabilityTier;
  lastChecked: string;
  notes?: string;
};

export type TimelineEvent = {
  id: string;
  occurredAt: string;
  title: string;
  summary: string;
  category:
    | "collection"
    | "franchise"
    | "court"
    | "police"
    | "video"
    | "statement"
    | "media"
    | "site";
  involvedParties: string[];
  sourceIds: string[];
  confidence: Confidence;
  status: RecordStatus;
  publicationRisk: PublicationRisk;
  imageUrl?: string;
  videoUrl?: string;
  benPerspective?: string;
  bamPerspective?: string;
};

export type CaseRecord = {
  id: string;
  caseNumber: string;
  title: string;
  jurisdiction: string;
  court: string;
  parties: string[];
  judge?: string;
  status: string;
  nextHearingAt?: string;
  sourceIds: string[];
  summary: string;
  lastChecked: string;
};

export type DocumentRecord = {
  id: string;
  title: string;
  sourceId: string;
  caseId?: string;
  documentType: string;
  fileType: "pdf" | "png" | "html" | "audio" | "video" | "other";
  datePublished?: string;
  r2Key?: string;
  externalUrl: string;
  redactionStatus: "public-redacted" | "public" | "unknown" | "needs-review";
  extractedText?: string;
  status: RecordStatus;
};

export type ClipRecord = {
  id: string;
  title: string;
  platform: string;
  sourceUrl: string;
  sourceId: string;
  startsAt?: string;
  endsAt?: string;
  transcriptExcerpt: string;
  relatedEventIds: string[];
  status: RecordStatus;
  publicationRisk: PublicationRisk;
};

export type ClaimRecord = {
  id: string;
  claimant: string;
  claimText: string;
  relatedEvidenceIds: string[];
  relatedSourceIds: string[];
  status: RecordStatus;
  confidence: Confidence;
  publicationRisk: PublicationRisk;
  editorNote: string;
};

export type SubmissionRecord = {
  id: string;
  submitterName?: string;
  submitterContact?: string;
  url?: string;
  title: string;
  summary: string;
  suggestedCategory: string;
  moderationStatus: "new" | "triaged" | "approved" | "rejected";
  createdAt: string;
  reviewerNote?: string;
  imageUrl?: string;
  videoUrl?: string;
  benPerspective?: string;
  bamPerspective?: string;
};

export type IngestionRun = {
  id: string;
  sourceName: string;
  startedAt: string;
  finishedAt?: string;
  status: "queued" | "running" | "completed" | "failed";
  candidatesFound: number;
  autoPublished: number;
  needsReview: number;
  error?: string;
};

export type SourceCheck = {
  sourceId: string;
  url: string;
  title: string;
  checkedAt: string;
  lastChangedAt?: string;
  httpStatus?: number;
  ok: boolean;
  contentHash?: string;
  contentLength: number;
  changed: boolean;
  error?: string;
};

export type TrackerData = {
  sources: Source[];
  events: TimelineEvent[];
  cases: CaseRecord[];
  documents: DocumentRecord[];
  clips: ClipRecord[];
  claims: ClaimRecord[];
  submissions: SubmissionRecord[];
  ingestionRuns: IngestionRun[];
  sourceChecks: SourceCheck[];
};
