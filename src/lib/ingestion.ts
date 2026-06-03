import { seedData } from "../data/seed";
import type { AppEnv } from "./data";
import { extractCandidatesWithAi } from "./ai";
import { canAutoPublish } from "./policy";

export function isAiIngestionEnabled(env: Pick<AppEnv, "ENABLE_AI_INGESTION" | "OPENAI_API_KEY"> | undefined) {
  return Boolean(env?.OPENAI_API_KEY && env.ENABLE_AI_INGESTION === "true");
}

function stripHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function sha256Hex(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function getPreviousSourceHash(env: AppEnv, sourceId: string) {
  if (!env.DB) return undefined;
  const row = await env.DB.prepare("select content_hash from source_checks where source_id = ?")
    .bind(sourceId)
    .first<{ content_hash?: string }>();
  return row?.content_hash || undefined;
}

async function upsertSourceCheck(
  env: AppEnv,
  input: {
    sourceId: string;
    url: string;
    title: string;
    checkedAt: string;
    httpStatus?: number;
    ok: boolean;
    contentHash?: string;
    contentLength: number;
    changed: boolean;
    error?: string;
  }
) {
  if (!env.DB) return;
  const previous = await env.DB.prepare("select last_changed_at from source_checks where source_id = ?")
    .bind(input.sourceId)
    .first<{ last_changed_at?: string }>();
  const lastChangedAt = input.changed ? input.checkedAt : previous?.last_changed_at ?? null;

  await env.DB.prepare(
    `insert or replace into source_checks (
      source_id, url, title, checked_at, last_changed_at, http_status, ok,
      content_hash, content_length, changed, error
    ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      input.sourceId,
      input.url,
      input.title,
      input.checkedAt,
      lastChangedAt,
      input.httpStatus ?? null,
      input.ok ? 1 : 0,
      input.contentHash ?? null,
      input.contentLength,
      input.changed ? 1 : 0,
      input.error ?? null
    )
    .run();

  await env.DB.prepare("update sources set last_checked = ? where id = ?")
    .bind(input.checkedAt, input.sourceId)
    .run();
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
    id?: string;
    title: string;
    summary: string;
    suggestedCategory: string;
    url: string;
  }
) {
  if (!env.DB) return;
  await env.DB.prepare(
    `insert or ignore into submissions (
      id, submitter_name, submitter_contact, url, title, summary, suggested_category,
      moderation_status, created_at, reviewer_note
    ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      input.id ?? `ai-${crypto.randomUUID()}`,
      "Automated ingestion",
      null,
      input.url,
      input.title,
      input.summary,
      input.suggestedCategory,
      "new",
      new Date().toISOString(),
      "Automated watcher candidate. Verify sources, redactions, and status before publishing."
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
      const checkedAt = new Date().toISOString();
      let response: Response;
      try {
        response = await fetch(source.url, {
          headers: { "user-agent": "BAM Scam Tracker source watcher" }
        });
      } catch (error) {
        await upsertSourceCheck(env, {
          sourceId: source.id,
          url: source.url,
          title: source.title,
          checkedAt,
          ok: false,
          contentLength: 0,
          changed: false,
          error: error instanceof Error ? error.message : String(error)
        });
        continue;
      }

      if (!response.ok) {
        await upsertSourceCheck(env, {
          sourceId: source.id,
          url: source.url,
          title: source.title,
          checkedAt,
          httpStatus: response.status,
          ok: false,
          contentLength: 0,
          changed: false,
          error: `HTTP ${response.status}`
        });
        continue;
      }

      const contentType = response.headers.get("content-type") ?? "";
      const body = contentType.includes("text") || contentType.includes("html") ? await response.text() : "";
      const sourceText = stripHtml(body).slice(0, 12000);
      const contentHash = await sha256Hex(sourceText);
      const previousHash = await getPreviousSourceHash(env, source.id);
      const changed = Boolean(previousHash && previousHash !== contentHash);

      await upsertSourceCheck(env, {
        sourceId: source.id,
        url: source.url,
        title: source.title,
        checkedAt,
        httpStatus: response.status,
        ok: true,
        contentHash,
        contentLength: sourceText.length,
        changed
      });

      if (changed) {
        candidatesFound += 1;
        await insertReviewSubmission(env, {
          id: `watch-${source.id}-${contentHash.slice(0, 16)}`,
          title: `Watched source changed: ${source.title}`,
          summary:
            "The scheduled watcher detected a content-hash change on a trusted source. Review the source manually before adding timeline, claim, or document updates.",
          suggestedCategory: "source-change",
          url: source.url
        });
        needsReview += 1;
      }

      const extraction = isAiIngestionEnabled(env)
        ? await extractCandidatesWithAi({
            apiKey: env.OPENAI_API_KEY,
            model: env.OPENAI_MODEL,
            sourceTitle: source.title,
            sourceUrl: source.url,
            sourceText
          })
        : {
            timelineCandidates: [],
            documentCandidates: [],
            claimCandidates: []
          };

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
      needsReview,
      error: isAiIngestionEnabled(env) ? undefined : "AI extraction skipped; ENABLE_AI_INGESTION is not true."
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
