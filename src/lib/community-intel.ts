import type { SubmissionRecord, TimelineEvent } from "../types";

const topicStopwords = new Set([
  "about",
  "after",
  "again",
  "also",
  "because",
  "between",
  "brick",
  "bricks",
  "case",
  "clip",
  "from",
  "have",
  "lego",
  "legos",
  "minifig",
  "minifigs",
  "over",
  "says",
  "source",
  "that",
  "this",
  "through",
  "video",
  "with"
]);

export type CommunityIntelligence = {
  score: number;
  scoreReasons: string[];
  clusterKey: string;
  duplicateKey: string;
  suggestedAction: NonNullable<SubmissionRecord["suggestedAction"]>;
  aiSummary: string;
};

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s:/.-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function words(value: string) {
  return normalize(value)
    .split(" ")
    .map((word) => word.replace(/^\W+|\W+$/g, ""))
    .filter((word) => word.length >= 4 && !topicStopwords.has(word));
}

function urlKey(url?: string) {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    const videoId = parsed.searchParams.get("v");
    if (videoId) return `${host}/watch/${videoId}`;
    return `${host}${parsed.pathname}`.replace(/\/+$/g, "");
  } catch {
    return normalize(url);
  }
}

export function communityDuplicateKey(input: Pick<SubmissionRecord, "url" | "title">) {
  const key = urlKey(input.url);
  if (key) return key;
  return words(input.title).slice(0, 8).join("-");
}

export function communityClusterKey(input: Pick<SubmissionRecord, "title" | "summary" | "suggestedCategory">) {
  const combined = `${input.title} ${input.summary}`;
  const tokens = words(combined);
  const priority = [
    "mcneff",
    "ammon",
    "police",
    "warrant",
    "lawsuit",
    "court",
    "docket",
    "bodycam",
    "consignment",
    "mansell",
    "recklessben",
    "schneider",
    "salem",
    "oregon",
    "franchise"
  ].filter((token) => tokens.includes(token));
  return [input.suggestedCategory, ...priority, ...tokens].slice(0, 5).join("-");
}

function summarize(input: Pick<SubmissionRecord, "title" | "summary">) {
  const compact = input.summary.replace(/\s+/g, " ").trim();
  if (compact.length <= 260) return compact;
  return `${compact.slice(0, 257)}...`;
}

export function scoreCommunitySubmission(
  input: Pick<SubmissionRecord, "url" | "title" | "summary" | "suggestedCategory">,
  existingEvents: TimelineEvent[] = [],
  existingSubmissions: SubmissionRecord[] = [],
  existingSourceKeys: string[] = []
): CommunityIntelligence {
  const reasons: string[] = [];
  let score = 20;
  const combined = `${input.title}\n${input.summary}`;
  const duplicateKey = communityDuplicateKey(input);
  const clusterKey = communityClusterKey(input);
  const existingDuplicate =
    existingSubmissions.some(
      (submission) =>
        submission.moderationStatus !== "rejected" &&
        (submission.duplicateKey === duplicateKey || communityDuplicateKey(submission) === duplicateKey)
    ) ||
    existingSourceKeys.includes(duplicateKey) ||
    existingEvents.some((event) => words(`${event.title} ${event.summary}`).slice(0, 8).join("-") === duplicateKey);

  if (input.url) {
    score += 18;
    reasons.push("has-source-url");
  }
  if (input.summary.length >= 180) {
    score += 14;
    reasons.push("detailed-summary");
  }
  if (/\b(court|docket|filing|complaint|tro|order|hearing|xchange)\b/i.test(combined)) {
    score += 16;
    reasons.push("legal-record-lead");
  }
  if (/\b(video|clip|audio|timestamp|bodycam|dashcam|transcript)\b/i.test(combined)) {
    score += 12;
    reasons.push("media-evidence-lead");
  }
  if (/\b(official|statement|police|ceo|bam|bricks|minifigs)\b/i.test(combined)) {
    score += 8;
    reasons.push("named-source-context");
  }
  if (/\b(address|phone|private email|home address|dox|doxx)\b/i.test(combined)) {
    score -= 45;
    reasons.push("private-info-risk");
  }
  if (/\b(stole|criminal|fraud|extort|threat|vandal|corrupt|guilty)\b/i.test(combined)) {
    score -= 10;
    reasons.push("high-risk-allegation");
  }
  if (existingDuplicate) {
    score -= 35;
    reasons.push("possible-duplicate");
  }

  score = Math.max(0, Math.min(100, score));

  let suggestedAction: CommunityIntelligence["suggestedAction"] = "feed";
  if (score >= 72) suggestedAction = "timeline-review";
  if (score < 35) suggestedAction = "needs-human";
  if (existingDuplicate) suggestedAction = "duplicate";
  if (reasons.includes("private-info-risk")) suggestedAction = "needs-human";

  return {
    score,
    scoreReasons: reasons,
    clusterKey,
    duplicateKey,
    suggestedAction,
    aiSummary: summarize(input)
  };
}

export function publicReviewerNote(intel: CommunityIntelligence) {
  const actionLabel = intel.suggestedAction.replace("-", " ");
  return `Auto-scored ${intel.score}/100; action: ${actionLabel}; cluster: ${intel.clusterKey}; reasons: ${intel.scoreReasons.join(", ") || "none"}.`;
}
