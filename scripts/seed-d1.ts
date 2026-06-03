import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { seedData } from "../src/data/seed";

const mode = process.argv.includes("--remote") ? "--remote" : "--local";
const database = "bam_scam_tracker";

function sql(value: unknown) {
  if (value === undefined || value === null) return "null";
  return `'${String(value).replaceAll("'", "''")}'`;
}

function json(value: unknown) {
  return sql(JSON.stringify(value));
}

const statements: string[] = [];

for (const source of seedData.sources) {
  statements.push(
    `insert or replace into sources (id, url, title, publisher, source_type, archive_url, date_found, reliability_tier, last_checked, notes) values (${[
      sql(source.id),
      sql(source.url),
      sql(source.title),
      sql(source.publisher),
      sql(source.sourceType),
      sql(source.archiveUrl),
      sql(source.dateFound),
      sql(source.reliabilityTier),
      sql(source.lastChecked),
      sql(source.notes)
    ].join(", ")});`
  );
}

for (const event of seedData.events) {
  statements.push(
    `insert or replace into events (id, occurred_at, title, summary, category, involved_parties, source_ids, confidence, status, publication_risk) values (${[
      sql(event.id),
      sql(event.occurredAt),
      sql(event.title),
      sql(event.summary),
      sql(event.category),
      json(event.involvedParties),
      json(event.sourceIds),
      sql(event.confidence),
      sql(event.status),
      sql(event.publicationRisk)
    ].join(", ")});`
  );
}

for (const caseRecord of seedData.cases) {
  statements.push(
    `insert or replace into cases (id, case_number, title, jurisdiction, court, parties, judge, status, next_hearing_at, source_ids, summary, last_checked) values (${[
      sql(caseRecord.id),
      sql(caseRecord.caseNumber),
      sql(caseRecord.title),
      sql(caseRecord.jurisdiction),
      sql(caseRecord.court),
      json(caseRecord.parties),
      sql(caseRecord.judge),
      sql(caseRecord.status),
      sql(caseRecord.nextHearingAt),
      json(caseRecord.sourceIds),
      sql(caseRecord.summary),
      sql(caseRecord.lastChecked)
    ].join(", ")});`
  );
}

for (const document of seedData.documents) {
  statements.push(
    `insert or replace into documents (id, title, source_id, case_id, document_type, file_type, date_published, r2_key, external_url, redaction_status, extracted_text, status) values (${[
      sql(document.id),
      sql(document.title),
      sql(document.sourceId),
      sql(document.caseId),
      sql(document.documentType),
      sql(document.fileType),
      sql(document.datePublished),
      sql(document.r2Key),
      sql(document.externalUrl),
      sql(document.redactionStatus),
      sql(document.extractedText),
      sql(document.status)
    ].join(", ")});`
  );
}

for (const clip of seedData.clips) {
  statements.push(
    `insert or replace into clips (id, title, platform, source_url, source_id, starts_at, ends_at, transcript_excerpt, related_event_ids, status, publication_risk) values (${[
      sql(clip.id),
      sql(clip.title),
      sql(clip.platform),
      sql(clip.sourceUrl),
      sql(clip.sourceId),
      sql(clip.startsAt),
      sql(clip.endsAt),
      sql(clip.transcriptExcerpt),
      json(clip.relatedEventIds),
      sql(clip.status),
      sql(clip.publicationRisk)
    ].join(", ")});`
  );
}

for (const claim of seedData.claims) {
  statements.push(
    `insert or replace into claims (id, claimant, claim_text, related_evidence_ids, related_source_ids, status, confidence, publication_risk, editor_note) values (${[
      sql(claim.id),
      sql(claim.claimant),
      sql(claim.claimText),
      json(claim.relatedEvidenceIds),
      json(claim.relatedSourceIds),
      sql(claim.status),
      sql(claim.confidence),
      sql(claim.publicationRisk),
      sql(claim.editorNote)
    ].join(", ")});`
  );
}

for (const run of seedData.ingestionRuns) {
  statements.push(
    `insert or replace into ingestion_runs (id, source_name, started_at, finished_at, status, candidates_found, auto_published, needs_review, error) values (${[
      sql(run.id),
      sql(run.sourceName),
      sql(run.startedAt),
      sql(run.finishedAt),
      sql(run.status),
      run.candidatesFound,
      run.autoPublished,
      run.needsReview,
      sql(run.error)
    ].join(", ")});`
  );
}

const dir = mkdtempSync(join(tmpdir(), "bam-seed-"));
const file = join(dir, "seed.sql");
writeFileSync(file, statements.join("\n"));
execFileSync("npx", ["wrangler", "d1", "execute", database, mode, "--file", file], {
  stdio: "inherit"
});
