import type { ClipRecord, RecordStatus, TimelineEvent } from "../types";

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
// are NOT nodes — they live in the Evidence Locker until reviewed. This is what keeps
// a verified item (e.g. the Fox 5 interview) visible instead of buried with raw leaks.
export function isCuratedNode(event: TimelineEvent): boolean {
  if (!isAutoIngested(event)) return true;
  return CURATED_STATUSES.includes(event.status);
}

export type EvidenceKind = "recklessben" | "bodycam" | "news-interview" | "commentary";

export const evidenceKindLabels: Record<EvidenceKind, string> = {
  recklessben: "RecklessBen",
  bodycam: "Bodycam & police",
  "news-interview": "News & interviews",
  commentary: "Commentary & other"
};

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
  if (category === "media" || /\binterview\b/.test(title) || /dexerto|kotaku|tribune|globenewswire|brickfanatic|fox/.test(ids)) {
    return "news-interview";
  }
  return "commentary";
}

export type EvidenceItem = {
  id: string;
  title: string;
  date: string;
  kind: EvidenceKind;
  status: RecordStatus;
  href: string;
  thumb?: string;
  summary?: string;
  source: "event" | "clip";
  inTimeline: boolean;
};

// Build the unified, de-duplicated footage list for the Evidence Locker.
// De-dup rule: the same YouTube video can arrive as both a curated node and an
// auto-imported upload — collapse them into one item, preferring the curated one.
export function buildEvidence(events: TimelineEvent[], clips: ClipRecord[] = []): EvidenceItem[] {
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
      inTimeline: isCuratedNode(event)
    };
    const videoId = youTubeId(event.videoUrl);
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

  for (const clip of clips) {
    items.push({
      id: clip.id,
      title: clip.title,
      date: "",
      kind: evidenceKind({ title: clip.title, sourceIds: [clip.sourceId], platform: clip.platform }),
      status: clip.status,
      href: clip.sourceUrl,
      thumb: youTubeThumb(clip.sourceUrl),
      summary: clip.transcriptExcerpt,
      source: "clip",
      inTimeline: clip.relatedEventIds.length > 0
    });
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
