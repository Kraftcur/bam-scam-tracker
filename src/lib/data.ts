import { seedData } from "../data/seed";
import {
  caseRecordSchema,
  claimRecordSchema,
  clipRecordSchema,
  documentRecordSchema,
  ingestionRunSchema,
  sourceCheckSchema,
  sourceSchema,
  submissionSchema,
  timelineEventSchema,
  trackerDataSchema
} from "./schema";
import type {
  CaseRecord,
  ClaimRecord,
  ClipRecord,
  DocumentRecord,
  IngestionRun,
  Source,
  SourceCheck,
  SubmissionRecord,
  TimelineEvent,
  TrackerData
} from "../types";

export type AppEnv = {
  DB?: D1Database;
  ARCHIVE_BUCKET?: R2Bucket;
  ADMIN_TOKEN?: string;
  ENABLE_AI_INGESTION?: string;
  AI_MAX_SOURCES_PER_RUN?: string;
  AI_SOURCE_CHAR_LIMIT?: string;
  OPENAI_API_KEY?: string;
  OPENAI_MODEL?: string;
  PUBLIC_DONATION_URL?: string;
  PUBLIC_TURNSTILE_SITE_KEY?: string;
  TURNSTILE_SECRET_KEY?: string;
};

type JsonRow = Record<string, unknown>;

const parseList = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value !== "string" || value.length === 0) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }
};

const nullableString = (value: unknown): string | undefined =>
  typeof value === "string" && value.length > 0 ? value : undefined;

const sourceFromRow = (row: JsonRow): Source =>
  sourceSchema.parse({
    id: row.id,
    url: row.url,
    title: row.title,
    publisher: row.publisher,
    sourceType: row.source_type,
    archiveUrl: nullableString(row.archive_url),
    dateFound: row.date_found,
    reliabilityTier: row.reliability_tier,
    lastChecked: row.last_checked,
    notes: nullableString(row.notes)
  });

const eventFromRow = (row: JsonRow): TimelineEvent =>
  timelineEventSchema.parse({
    id: row.id,
    occurredAt: row.occurred_at,
    title: row.title,
    summary: row.summary,
    category: row.category,
    involvedParties: parseList(row.involved_parties),
    sourceIds: parseList(row.source_ids),
    confidence: row.confidence,
    status: row.status,
    publicationRisk: row.publication_risk
  });

const caseFromRow = (row: JsonRow): CaseRecord =>
  caseRecordSchema.parse({
    id: row.id,
    caseNumber: row.case_number,
    title: row.title,
    jurisdiction: row.jurisdiction,
    court: row.court,
    parties: parseList(row.parties),
    judge: nullableString(row.judge),
    status: row.status,
    nextHearingAt: nullableString(row.next_hearing_at),
    sourceIds: parseList(row.source_ids),
    summary: row.summary,
    lastChecked: row.last_checked
  });

const documentFromRow = (row: JsonRow): DocumentRecord =>
  documentRecordSchema.parse({
    id: row.id,
    title: row.title,
    sourceId: row.source_id,
    caseId: nullableString(row.case_id),
    documentType: row.document_type,
    fileType: row.file_type,
    datePublished: nullableString(row.date_published),
    r2Key: nullableString(row.r2_key),
    externalUrl: row.external_url,
    redactionStatus: row.redaction_status,
    extractedText: nullableString(row.extracted_text),
    status: row.status
  });

const clipFromRow = (row: JsonRow): ClipRecord =>
  clipRecordSchema.parse({
    id: row.id,
    title: row.title,
    platform: row.platform,
    sourceUrl: row.source_url,
    sourceId: row.source_id,
    startsAt: nullableString(row.starts_at),
    endsAt: nullableString(row.ends_at),
    transcriptExcerpt: row.transcript_excerpt,
    relatedEventIds: parseList(row.related_event_ids),
    status: row.status,
    publicationRisk: row.publication_risk
  });

const claimFromRow = (row: JsonRow): ClaimRecord =>
  claimRecordSchema.parse({
    id: row.id,
    claimant: row.claimant,
    claimText: row.claim_text,
    relatedEvidenceIds: parseList(row.related_evidence_ids),
    relatedSourceIds: parseList(row.related_source_ids),
    status: row.status,
    confidence: row.confidence,
    publicationRisk: row.publication_risk,
    editorNote: row.editor_note
  });

const submissionFromRow = (row: JsonRow): SubmissionRecord =>
  submissionSchema.parse({
    id: row.id,
    submitterName: nullableString(row.submitter_name),
    submitterContact: nullableString(row.submitter_contact),
    url: nullableString(row.url),
    title: row.title,
    summary: row.summary,
    suggestedCategory: row.suggested_category,
    moderationStatus: row.moderation_status,
    createdAt: row.created_at,
    reviewerNote: nullableString(row.reviewer_note)
  });

const ingestionRunFromRow = (row: JsonRow): IngestionRun =>
  ingestionRunSchema.parse({
    id: row.id,
    sourceName: row.source_name,
    startedAt: row.started_at,
    finishedAt: nullableString(row.finished_at),
    status: row.status,
    candidatesFound: Number(row.candidates_found ?? 0),
    autoPublished: Number(row.auto_published ?? 0),
    needsReview: Number(row.needs_review ?? 0),
    error: nullableString(row.error)
  });

const sourceCheckFromRow = (row: JsonRow): SourceCheck =>
  sourceCheckSchema.parse({
    sourceId: row.source_id,
    url: row.url,
    title: row.title,
    checkedAt: row.checked_at,
    lastChangedAt: nullableString(row.last_changed_at),
    httpStatus: row.http_status === null || row.http_status === undefined ? undefined : Number(row.http_status),
    ok: Boolean(row.ok),
    contentHash: nullableString(row.content_hash),
    contentLength: Number(row.content_length ?? 0),
    changed: Boolean(row.changed),
    error: nullableString(row.error)
  });

async function queryAll<T>(
  db: D1Database,
  sql: string,
  mapper: (row: JsonRow) => T
): Promise<T[]> {
  const result = await db.prepare(sql).all<JsonRow>();
  return (result.results ?? []).map(mapper);
}

export function validateSeedData(): TrackerData {
  return sortTrackerData(trackerDataSchema.parse(seedData));
}

export function sortTrackerData(data: TrackerData): TrackerData {
  return {
    ...data,
    events: [...data.events].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)),
    documents: [...data.documents].sort((a, b) =>
      (b.datePublished ?? "").localeCompare(a.datePublished ?? "")
    ),
    submissions: [...data.submissions].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    ingestionRuns: [...data.ingestionRuns].sort((a, b) => b.startedAt.localeCompare(a.startedAt)),
    sourceChecks: [...data.sourceChecks].sort((a, b) => b.checkedAt.localeCompare(a.checkedAt))
  };
}

export async function getTrackerData(env?: AppEnv): Promise<TrackerData> {
  if (!env?.DB) return validateSeedData();

  try {
    const [sources, events, cases, documents, clips, claims, submissions, ingestionRuns, sourceChecks] =
      await Promise.all([
        queryAll(env.DB, "select * from sources order by date_found desc", sourceFromRow),
        queryAll(env.DB, "select * from events order by occurred_at desc", eventFromRow),
        queryAll(env.DB, "select * from cases order by last_checked desc", caseFromRow),
        queryAll(env.DB, "select * from documents order by coalesce(date_published, '') desc", documentFromRow),
        queryAll(env.DB, "select * from clips order by id asc", clipFromRow),
        queryAll(env.DB, "select * from claims order by id asc", claimFromRow),
        queryAll(env.DB, "select * from submissions order by created_at desc", submissionFromRow),
        queryAll(env.DB, "select * from ingestion_runs order by started_at desc limit 20", ingestionRunFromRow),
        queryAll(env.DB, "select * from source_checks order by checked_at desc", sourceCheckFromRow)
      ]);

    if (sources.length === 0 && events.length === 0) return validateSeedData();
    return sortTrackerData({ sources, events, cases, documents, clips, claims, submissions, ingestionRuns, sourceChecks });
  } catch (error) {
    if (!(error instanceof Error) || !error.message.includes("no such table")) {
      console.warn("Falling back to seed data because D1 query failed.", error);
    }
    return validateSeedData();
  }
}

export function getSourceMap(data: TrackerData): Map<string, Source> {
  return new Map(data.sources.map((source) => [source.id, source]));
}

export function getDonationUrl(env?: AppEnv): string {
  return env?.PUBLIC_DONATION_URL || import.meta.env.PUBLIC_DONATION_URL || "";
}

export function getAdminToken(env?: AppEnv): string {
  return env?.ADMIN_TOKEN || import.meta.env.ADMIN_TOKEN || "";
}

export async function insertSubmission(env: AppEnv | undefined, submission: SubmissionRecord) {
  submissionSchema.parse(submission);
  if (!env?.DB) return submission;

  await env.DB.prepare(
    `insert into submissions (
      id, submitter_name, submitter_contact, url, title, summary, suggested_category,
      moderation_status, created_at, reviewer_note
    ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      submission.id,
      submission.submitterName ?? null,
      submission.submitterContact ?? null,
      submission.url ?? null,
      submission.title,
      submission.summary,
      submission.suggestedCategory,
      submission.moderationStatus,
      submission.createdAt,
      submission.reviewerNote ?? null
    )
    .run();

  return submission;
}

export async function updateSubmissionStatus(
  env: AppEnv | undefined,
  id: string,
  moderationStatus: SubmissionRecord["moderationStatus"],
  reviewerNote?: string
) {
  if (!env?.DB) return;
  await env.DB.prepare(
    "update submissions set moderation_status = ?, reviewer_note = ? where id = ?"
  )
    .bind(moderationStatus, reviewerNote ?? null, id)
    .run();
}
