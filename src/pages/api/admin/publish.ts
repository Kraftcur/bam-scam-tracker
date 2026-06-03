import type { APIRoute } from "astro";
import { getAdminToken } from "../../../lib/data";
import { canAutoPublish } from "../../../lib/policy";
import { documentRecordSchema, sourceSchema, timelineEventSchema } from "../../../lib/schema";
import { getEnv, isAuthorized, json } from "../../../lib/runtime";
import { z } from "zod";

const publishInputSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("source"),
    item: sourceSchema
  }),
  z.object({
    kind: z.literal("event"),
    item: timelineEventSchema,
    sourceType: z.enum(["court-record", "official-statement", "public-archive", "news-report", "video", "audio", "community"]),
    reliabilityTier: z.enum(["court-record", "official", "trusted-archive", "reported", "primary-video", "community"]),
    mentionsPrivatePerson: z.boolean().optional()
  }),
  z.object({
    kind: z.literal("document"),
    item: documentRecordSchema,
    sourceType: z.enum(["court-record", "official-statement", "public-archive", "news-report", "video", "audio", "community"]),
    reliabilityTier: z.enum(["court-record", "official", "trusted-archive", "reported", "primary-video", "community"]),
    mentionsPrivatePerson: z.boolean().optional()
  })
]);

export const POST: APIRoute = async ({ request, locals }) => {
  const env = getEnv(locals);
  if (!isAuthorized(request, getAdminToken(env))) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const raw = await request.json().catch(() => null);
  const parsed = publishInputSchema.safeParse(raw);
  if (!parsed.success) {
    return json({ error: "Invalid publish payload.", details: parsed.error.flatten() }, { status: 400 });
  }

  if (parsed.data.kind !== "source") {
    const allowed = canAutoPublish({
      sourceType: parsed.data.sourceType,
      reliabilityTier: parsed.data.reliabilityTier,
      mentionsPrivatePerson: parsed.data.mentionsPrivatePerson
    });
    if (!allowed) {
      return json({ error: "This item requires human moderation before publication." }, { status: 409 });
    }
  }

  if (!env?.DB) {
    return json({ ok: true, dryRun: true, item: parsed.data.item });
  }

  if (parsed.data.kind === "source") {
    const item = parsed.data.item;
    await env.DB.prepare(
      `insert or replace into sources (
        id, url, title, publisher, source_type, archive_url, date_found,
        reliability_tier, last_checked, notes
      ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        item.id,
        item.url,
        item.title,
        item.publisher,
        item.sourceType,
        item.archiveUrl ?? null,
        item.dateFound,
        item.reliabilityTier,
        item.lastChecked,
        item.notes ?? null
      )
      .run();
  }

  if (parsed.data.kind === "event") {
    const item = parsed.data.item;
    await env.DB.prepare(
      `insert or replace into events (
        id, occurred_at, title, summary, category, involved_parties,
        source_ids, confidence, status, publication_risk
      ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        item.id,
        item.occurredAt,
        item.title,
        item.summary,
        item.category,
        JSON.stringify(item.involvedParties),
        JSON.stringify(item.sourceIds),
        item.confidence,
        item.status,
        item.publicationRisk
      )
      .run();
  }

  if (parsed.data.kind === "document") {
    const item = parsed.data.item;
    await env.DB.prepare(
      `insert or replace into documents (
        id, title, source_id, case_id, document_type, file_type, date_published,
        r2_key, external_url, redaction_status, extracted_text, status
      ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        item.id,
        item.title,
        item.sourceId,
        item.caseId ?? null,
        item.documentType,
        item.fileType,
        item.datePublished ?? null,
        item.r2Key ?? null,
        item.externalUrl,
        item.redactionStatus,
        item.extractedText ?? null,
        item.status
      )
      .run();
  }

  return json({ ok: true, item: parsed.data.item });
};
