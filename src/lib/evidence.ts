import type { ClipRecord, DocumentRecord, RecordStatus, TimelineEvent } from "../types";

export function youTubeId(url?: string): string {
  if (!url) return "";
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1).split("/")[0];
    const v = u.searchParams.get("v");
    if (v) return v;
    if (u.pathname.startsWith("/embed/")) return u.pathname.split("/")[2] || "";
    return "";
  } catch {
    return "";
  }
}

export function youTubeThumb(url?: string): string | undefined {
  const id = youTubeId(url);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : undefined;
}

// Machine-ingested items use these id prefixes (community submissions + auto-imported
// uploads). Hand-curated seed events never do.
export function isAutoIngested(event: Pick<TimelineEvent, "id">): boolean {
  return event.id.startsWith("evt-community-") || event.id.startsWith("evt-yt-");
}

// Statuses that make an item "graduated" enough to be a full, visible timeline node.
const CURATED_STATUSES: RecordStatus[] = ["court-record", "official-statement", "verified"];

// A full Spine node is: anything hand-curated, OR an auto-ingested item that has been
// reviewed up to a verified/official/court status. Raw needs-review/community leads
// are NOT nodes — they live in the Evidence Locker until reviewed.
export function isCuratedNode(event: TimelineEvent): boolean {
  if (!isAutoIngested(event)) return true;
  return CURATED_STATUSES.includes(event.status);
}

export type EvidenceKind = "recklessben" | "bodycam" | "interview" | "news" | "court-doc" | "commentary";

export const evidenceKindLabels: Record<EvidenceKind, string> = {
  recklessben: "RecklessBen",
  bodycam: "Bodycam & police",
  interview: "Interviews",
  news: "News coverage",
  "court-doc": "Court & documents",
  commentary: "Commentary & other"
};

export const evidenceKindOrder: EvidenceKind[] = [
  "recklessben",
  "bodycam",
  "interview",
  "news",
  "court-doc",
  "commentary"
];

// Classify footage into browsable sections. Source ids are the reliable signal:
// every RecklessBen video (including auto-imported uploads from his channel) carries
// a "recklessben" source id, which separates his channel from police footage and news.
export function evidenceKind(input: {
  category?: string;
  title?: string;
  sourceIds?: string[];
  platform?: string;
}): EvidenceKind {
  const ids = (input.sourceIds || []).join(" ").toLowerCase();
  const title = (input.title || "").toLowerCase();
  const category = (input.category || "").toLowerCase();
  const platform = (input.platform || "").toLowerCase();

  if (ids.includes("recklessben")) return "recklessben";
  if (category === "police" || /police|mcneff|bodycam|dashcam/.test(ids) || (platform.includes("twitter") && /mcneff|police/.test(ids))) {
    return "bodycam";
  }
  if (/\binterview\b/.test(title) || /clutch|\bfox\b/.test(ids) || /clutch power|fox 5/.test(title)) {
    return "interview";
  }
  if (category === "media" || /dexerto|kotaku|tribune|globenewswire|brickfanatic|news/.test(ids)) {
    return "news";
  }
  return "commentary";
}

export type EvidenceMoment = {
  title: string;
  href: string;
  timestamp?: string;
};

export type EvidenceItem = {
  id: string;
  title: string;
  date: string;
  kind: EvidenceKind;
  status: RecordStatus;
  href: string;
  thumb?: string;
  summary?: string;
  source: "event" | "document";
  inTimeline: boolean;
  // internal matchers for nesting clips
  eventId?: string;
  sourceIds?: string[];
  videoId?: string;
  moments?: EvidenceMoment[];
};

function timeRange(clip: ClipRecord): string | undefined {
  if (clip.startsAt && clip.endsAt) return `${clip.startsAt}–${clip.endsAt}`;
  return clip.startsAt || clip.endsAt || undefined;
}

// Build the unified, de-duplicated evidence list for the Evidence Locker.
// - footage events become cards (same video from two sources collapses into one,
//   preferring the curated representation so timing/analysis is kept)
// - documents become "Court & documents" cards
// - clips (timestamped "key moments") nest UNDER their parent video instead of
//   appearing as separate near-duplicate cards
export function buildEvidence(
  events: TimelineEvent[],
  clips: ClipRecord[] = [],
  documents: DocumentRecord[] = []
): EvidenceItem[] {
  const footageEvents = events.filter(
    (event) => Boolean(event.videoUrl) || ["video", "police", "audio"].includes(event.category)
  );

  const byVideo = new Map<string, EvidenceItem>();
  const items: EvidenceItem[] = [];

  for (const event of footageEvents) {
    const item: EvidenceItem = {
      id: event.id,
      title: event.title,
      date: event.occurredAt,
      kind: evidenceKind({ category: event.category, title: event.title, sourceIds: event.sourceIds }),
      status: event.status,
      href: event.videoUrl || event.imageUrl || "/community",
      thumb: youTubeThumb(event.videoUrl) || event.imageUrl,
      summary: event.summary,
      source: "event",
      inTimeline: isCuratedNode(event),
      eventId: event.id,
      sourceIds: event.sourceIds,
      videoId: youTubeId(event.videoUrl) || undefined,
      moments: []
    };
    const videoId = item.videoId;
    if (!videoId) {
      items.push(item);
      continue;
    }
    const existing = byVideo.get(videoId);
    if (!existing) {
      byVideo.set(videoId, item);
      items.push(item);
    } else if (item.inTimeline && !existing.inTimeline) {
      Object.assign(existing, item); // upgrade the shared item to its curated version
    }
  }

  // Documents → Court & documents cards. Skip video/audio "documents" — those are
  // footage that belongs in a video section, not filings (and are usually already
  // represented as events).
  for (const doc of documents) {
    if (doc.fileType === "video" || doc.fileType === "audio") continue;
    items.push({
      id: doc.id,
      title: doc.title,
      date: doc.datePublished || "",
      kind: "court-doc",
      status: doc.status,
      href: doc.externalUrl,
      summary: doc.documentType,
      source: "document",
      inTimeline: true,
      moments: []
    });
  }

  // Nest clips as timestamped moments under their parent video.
  for (const clip of clips) {
    const clipVideoId = youTubeId(clip.sourceUrl);
    const parent = items.find(
      (item) =>
        (clipVideoId && item.videoId === clipVideoId) ||
        (clip.relatedEventIds || []).some((id) => id === item.eventId) ||
        (item.sourceIds || []).includes(clip.sourceId)
    );
    const moment: EvidenceMoment = {
      title: clip.title,
      href: clip.sourceUrl,
      timestamp: timeRange(clip)
    };
    if (parent) {
      (parent.moments ??= []).push(moment);
    } else {
      // No parent video on the board — surface the clip as its own card.
      items.push({
        id: clip.id,
        title: clip.title,
        date: "",
        kind: evidenceKind({ title: clip.title, sourceIds: [clip.sourceId], platform: clip.platform }),
        status: clip.status,
        href: clip.sourceUrl,
        thumb: youTubeThumb(clip.sourceUrl),
        summary: clip.transcriptExcerpt,
        source: "event",
        inTimeline: clip.relatedEventIds.length > 0,
        moments: []
      });
    }
  }

  return items.sort((a, b) => {
    if (a.source !== b.source) return a.source === "event" ? -1 : 1;
    return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
  });
}

// Most-recently-dated items across the whole tracker, for the homepage "latest" strip.
export function latestAdditions(events: TimelineEvent[], limit = 5): TimelineEvent[] {
  return [...events]
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
    .slice(0, limit);
}
