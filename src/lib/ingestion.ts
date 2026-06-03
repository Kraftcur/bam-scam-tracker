import { seedData } from "../data/seed";
import type { AppEnv } from "./data";
import { extractCandidatesWithAi } from "./ai";
import { canAutoPublish } from "./policy";

export function isAiIngestionEnabled(env: Pick<AppEnv, "ENABLE_AI_INGESTION" | "GEMINI_API_KEY"> | undefined) {
  return Boolean(env?.GEMINI_API_KEY && env.ENABLE_AI_INGESTION === "true");
}

function parsePositiveInt(value: string | undefined, fallback: number, max: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, max);
}

function stripHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeXml(value = "") {
  return value
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .trim();
}

function xmlTag(block: string, name: string) {
  return decodeXml(block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`))?.[1] ?? "");
}

function xmlAttr(block: string, tagName: string, attrName: string) {
  return decodeXml(block.match(new RegExp(`<${tagName}[^>]*${attrName}="([^"]+)"`))?.[1] ?? "");
}

export function parseYouTubeFeedEntries(xml: string) {
  return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)]
    .map((match) => {
      const entry = match[1];
      const videoId = xmlTag(entry, "yt:videoId");
      return {
        videoId,
        title: xmlTag(entry, "title"),
        published: xmlTag(entry, "published"),
        updated: xmlTag(entry, "updated"),
        url: `https://www.youtube.com/watch?v=${videoId}`,
        thumbnail: xmlAttr(entry, "media:thumbnail", "url") || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        views: Number.parseInt(xmlAttr(entry, "media:statistics", "views") || "0", 10),
        description: xmlTag(entry, "media:description")
      };
    })
    .filter((entry) => {
      const searchable = `${entry.title} ${entry.description}`;
      return entry.videoId && /\b(lego|legos|brick|bricks|minifigs|bam|police|arrest|ceo)\b/i.test(searchable);
    });
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
      moderation_status, created_at, reviewer_note, image_url, video_url, ben_perspective, bam_perspective
    ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
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
      "Automated watcher candidate. Verify sources, redactions, and status before publishing.",
      null,
      null,
      null,
      null
    )
    .run();
}

export async function processCommunitySubmissions(env: AppEnv) {
  if (!env.DB) return { published: 0 };
  
  const { results: pending } = await env.DB.prepare(
    "select id, title, summary, url from submissions where moderation_status = 'new'"
  ).all<{ id: string; title: string; summary: string; url: string | null }>();
  
  if (!pending || pending.length === 0) return { published: 0 };
  
  let publishedCount = 0;
  
  for (const sub of pending) {
    let eventsCreated = 0;

    if (isAiIngestionEnabled(env) && (sub.summary?.length ?? 0) >= 80) {
      try {
        const extraction = await extractCandidatesWithAi({
          apiKey: env.GEMINI_API_KEY,
          model: env.GEMINI_MODEL,
          sourceTitle: "Community Submission",
          sourceUrl: sub.url ?? "",
          sourceText: `Title: ${sub.title}\nSummary: ${sub.summary}`
        });
        
        for (const candidate of extraction.timelineCandidates) {
          await env.DB.prepare(
            `insert or ignore into events (
              id, occurred_at, title, summary, category, involved_parties,
              source_ids, confidence, status, publication_risk, image_url, video_url, ben_perspective, bam_perspective
            ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
          )
            .bind(
              `evt-${crypto.randomUUID()}`,
              candidate.occurredAt,
              candidate.title,
              candidate.summary,
              candidate.category,
              JSON.stringify([]),
              JSON.stringify([]),
              candidate.confidence,
              "community",
              "high",
              (candidate as any).imageUrl || null,
              (candidate as any).videoUrl || null,
              (candidate as any).benPerspective || null,
              (candidate as any).bamPerspective || null
            )
            .run();
          eventsCreated += 1;
        }
      } catch (e) {
         console.error("AI extraction failed for community submission", e);
      }
    }
    
    if (eventsCreated === 0) {
      await env.DB.prepare(
        `insert or ignore into events (
          id, occurred_at, title, summary, category, involved_parties,
          source_ids, confidence, status, publication_risk, image_url, video_url, ben_perspective, bam_perspective
        ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
        .bind(
          `evt-${crypto.randomUUID()}`,
          new Date().toISOString(),
          sub.title,
          sub.summary || "No summary provided.",
          "media",
          JSON.stringify([]),
          JSON.stringify([]),
          "low",
          "community",
          "high",
          null,
          null,
          null,
          null
        )
        .run();
      eventsCreated += 1;
    }
    
    publishedCount += eventsCreated;
    
    await env.DB.prepare(
      "update submissions set moderation_status = 'triaged', reviewer_note = 'Auto-processed by AI into community timeline' where id = ?"
    ).bind(sub.id).run();
  }
  
  return { published: publishedCount };
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
  let aiExtractionsUsed = 0;
  const aiMaxSources = parsePositiveInt(env.AI_MAX_SOURCES_PER_RUN, 2, 5);
  const aiSourceCharLimit = parsePositiveInt(env.AI_SOURCE_CHAR_LIMIT, 4000, 12000);

  try {
    const watchedSources = seedData.sources.filter((source) =>
      ["official", "court-record", "trusted-archive", "primary-video"].includes(source.reliabilityTier)
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
      const body =
        contentType.includes("text") ||
        contentType.includes("html") ||
        contentType.includes("xml") ||
        contentType.includes("atom") ||
        contentType.includes("application")
          ? await response.text()
          : "";
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

      // Generic source-change alert disabled as we are now auto-publishing directly
      /*
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
      */

      // Generic YouTube feed alerts disabled as we are now auto-publishing directly
      /*
      if (source.id === "src-recklessben-channel" && (!previousHash || changed)) {
        for (const video of parseYouTubeFeedEntries(body).slice(0, 8)) {
          await insertReviewSubmission(env, {
            id: `youtube-${video.videoId}`,
            title: `RecklessBen upload: ${video.title}`,
            summary:
              `Published ${video.published || "unknown date"}. Views in RSS: ${video.views || "unknown"}. ` +
              "Review this creator-video lead, add timestamped clips if relevant, and label underlying claims separately from what the video itself proves.",
            suggestedCategory: "video",
            url: video.url
          });
          candidatesFound += 1;
          needsReview += 1;
        }
      }
      */

      const allowsAiExtraction = ["official", "court-record", "trusted-archive"].includes(source.reliabilityTier);
      const shouldExtractWithAi =
        allowsAiExtraction && isAiIngestionEnabled(env) && changed && aiExtractionsUsed < aiMaxSources;
      if (shouldExtractWithAi) aiExtractionsUsed += 1;

      const extraction = shouldExtractWithAi
        ? await extractCandidatesWithAi({
            apiKey: env.GEMINI_API_KEY,
            model: env.GEMINI_MODEL,
            sourceTitle: source.title,
            sourceUrl: source.url,
            sourceText: sourceText.slice(0, aiSourceCharLimit)
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
              source_ids, confidence, status, publication_risk, image_url, video_url, ben_perspective, bam_perspective
            ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
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
              "low",
              (candidate as any).imageUrl || null,
              (candidate as any).videoUrl || null,
              (candidate as any).benPerspective || null,
              (candidate as any).bamPerspective || null
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
        if (env.DB) {
          const docId = `doc-${crypto.randomUUID()}`;
          await env.DB.prepare(
            `insert or ignore into documents (
              id, title, source_id, case_id, document_type, file_type, date_published,
              r2_key, external_url, redaction_status, extracted_text, status
            ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
          )
            .bind(
              docId,
              candidate.title,
              source.id,
              null,
              candidate.documentType,
              candidate.fileType,
              new Date().toISOString(),
              null,
              source.url,
              "public",
              null,
              candidate.status
            )
            .run();
          autoPublished += 1;
        }
      }

      for (const candidate of extraction.claimCandidates) {
        if (env.DB) {
          const claimId = `claim-${crypto.randomUUID()}`;
          await env.DB.prepare(
            `insert or ignore into claims (
              id, claimant, claim_text, related_evidence_ids, related_source_ids,
              status, confidence, publication_risk, editor_note
            ) values (?, ?, ?, ?, ?, ?, ?, ?, ?)`
          )
            .bind(
              claimId,
              candidate.claimant,
              candidate.claimText,
              JSON.stringify([]),
              JSON.stringify([source.id]),
              candidate.status,
              candidate.confidence,
              "low",
              candidate.editorNote
            )
            .run();
          autoPublished += 1;
        }
      }
    }

    const { published: communityPublished } = await processCommunitySubmissions(env);
    autoPublished += communityPublished;

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
