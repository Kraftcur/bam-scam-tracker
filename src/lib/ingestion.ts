import { seedData } from "../data/seed";
import type { AppEnv } from "./data";
import { extractCandidatesWithAi } from "./ai";
import { canAutoPublish } from "./policy";

function stripHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function insertRun(
  env: AppEnv,
  input: {
    id: string;
    sourceName: string;
    startedAt: string;
    finishedAt?: string;
    status: "queued" | "running" | "completed" | "failed";
    candidatesFound: number;
    autoPublished: number;
    needsReview: number;
    error?: string;
  }
) {
  if (!env.DB) return;
  await env.DB.prepare(
    `insert or replace into ingestion_runs (
      id, source_name, started_at, finished_at, status, candidates_found,
      auto_published, needs_review, error
    ) values (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      input.id,
      input.sourceName,
      input.startedAt,
      input.finishedAt ?? null,
      input.status,
      input.candidatesFound,
      input.autoPublished,
      input.needsReview,
      input.error ?? null
    )
    .run();
}

async function insertReviewSubmission(
  env: AppEnv,
  input: {
    title: string;
    summary: string;
    suggestedCategory: string;
    url: string;
  }
) {
  if (!env.DB) return;
  await env.DB.prepare(
    `insert into submissions (
      id, submitter_name, submitter_contact, url, title, summary, suggested_category,
      moderation_status, created_at, reviewer_note
    ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      `ai-${crypto.randomUUID()}`,
      "Automated ingestion",
      null,
      input.url,
      input.title,
      input.summary,
      input.suggestedCategory,
      "new",
      new Date().toISOString(),
      "AI candidate. Verify sources, redactions, and status before publishing."
    )
    .run();
}

export async function runScheduledIngestion(env: AppEnv) {
  const startedAt = new Date().toISOString();
  const runId = `run-${startedAt.replace(/\W/g, "")}`;
  await insertRun(env, {
    id: runId,
    sourceName: "Scheduled trusted-source watcher",
    startedAt,
    status: "running",
    candidatesFound: 0,
    autoPublished: 0,
    needsReview: 0
  });

  let candidatesFound = 0;
  let autoPublished = 0;
  let needsReview = 0;

  try {
    const watchedSources = seedData.sources.filter((source) =>
      ["official", "court-record", "trusted-archive"].includes(source.reliabilityTier)
    );

    for (const source of watchedSources) {
      const response = await fetch(source.url, {
        headers: { "user-agent": "BAM Scam Tracker source watcher" }
      });
      if (!response.ok) continue;

      const contentType = response.headers.get("content-type") ?? "";
      const body = contentType.includes("text") || contentType.includes("html") ? await response.text() : "";
      const sourceText = stripHtml(body).slice(0, 12000);
      const extraction = await extractCandidatesWithAi({
        apiKey: env.OPENAI_API_KEY,
        model: env.OPENAI_MODEL,
        sourceTitle: source.title,
        sourceUrl: source.url,
        sourceText
      });

      const sourceCandidates =
        extraction.timelineCandidates.length +
        extraction.documentCandidates.length +
        extraction.claimCandidates.length;
      candidatesFound += sourceCandidates;

      for (const candidate of extraction.timelineCandidates) {
        const allowed = canAutoPublish({
          sourceType: source.sourceType,
          reliabilityTier: source.reliabilityTier,
          mentionsPrivatePerson: candidate.status === "alleged" || candidate.status === "disputed"
        });

        if (allowed && env.DB) {
          await env.DB.prepare(
            `insert or ignore into events (
              id, occurred_at, title, summary, category, involved_parties,
              source_ids, confidence, status, publication_risk
            ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
          )
            .bind(
              `evt-${crypto.randomUUID()}`,
              candidate.occurredAt,
              candidate.title,
              candidate.summary,
              candidate.category,
              JSON.stringify([]),
              JSON.stringify([source.id]),
              candidate.confidence,
              candidate.status,
              "low"
            )
            .run();
          autoPublished += 1;
        } else {
          await insertReviewSubmission(env, {
            title: candidate.title,
            summary: candidate.summary,
            suggestedCategory: "timeline",
            url: source.url
          });
          needsReview += 1;
        }
      }

      for (const candidate of extraction.documentCandidates) {
        await insertReviewSubmission(env, {
          title: candidate.title,
          summary: `Document candidate: ${candidate.documentType} (${candidate.fileType}). Status suggested as ${candidate.status}.`,
          suggestedCategory: "document",
          url: source.url
        });
        needsReview += 1;
      }

      for (const candidate of extraction.claimCandidates) {
        await insertReviewSubmission(env, {
          title: `Claim candidate from ${candidate.claimant}`,
          summary: `${candidate.claimText}\n\nAI note: ${candidate.editorNote}`,
          suggestedCategory: "claim",
          url: source.url
        });
        needsReview += 1;
      }
    }

    const finishedAt = new Date().toISOString();
    await insertRun(env, {
      id: runId,
      sourceName: "Scheduled trusted-source watcher",
      startedAt,
      finishedAt,
      status: "completed",
      candidatesFound,
      autoPublished,
      needsReview
    });

    return { candidatesFound, autoPublished, needsReview };
  } catch (error) {
    await insertRun(env, {
      id: runId,
      sourceName: "Scheduled trusted-source watcher",
      startedAt,
      finishedAt: new Date().toISOString(),
      status: "failed",
      candidatesFound,
      autoPublished,
      needsReview,
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
}
