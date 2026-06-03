import { ChevronDown, ExternalLink, Plus, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import type { SubmissionRecord, TimelineEvent } from "../types";
import { formatDateTime } from "../lib/format";
import { Badge } from "./Badge";

type Props = {
  events: TimelineEvent[];
  submissions: SubmissionRecord[];
};

const PAGE_SIZE = 6;

const categoryLabels: Record<string, string> = {
  video: "Video & footage",
  police: "Police & bodycam",
  court: "Court & filings",
  statement: "Statements",
  media: "News & media",
  site: "Site & corrections",
  collection: "Collection",
  franchise: "Franchise"
};

function categoryLabel(category: string) {
  return categoryLabels[category] || category;
}

function actionCopy(action?: SubmissionRecord["suggestedAction"]) {
  if (action === "timeline-review") return "Timeline candidate";
  if (action === "duplicate") return "Clustered duplicate";
  if (action === "needs-human") return "Needs editor";
  if (action === "reject") return "Rejected";
  return "Community feed";
}

function submissionForEvent(event: TimelineEvent, submissions: SubmissionRecord[]) {
  return submissions.find((submission) => submission.communityEventId === event.id);
}

function sourceHref(event: TimelineEvent, submission?: SubmissionRecord) {
  return submission?.url || event.videoUrl || event.imageUrl || "";
}

function CommunityCard({ event, submission }: { event: TimelineEvent; submission?: SubmissionRecord }) {
  const href = sourceHref(event, submission);
  return (
    <article className="community-feed-card" id={submission?.id}>
      <div className="community-card-top">
        <div>
          <span className="community-date">{formatDateTime(event.occurredAt)}</span>
          <h2>{event.title}</h2>
        </div>
        <div className="community-badges">
          <Badge value={event.category} />
          <Badge value={actionCopy(submission?.suggestedAction).toLowerCase().replaceAll(" ", "-")} />
          {typeof submission?.aiScore === "number" && <span className="score-pill">{submission.aiScore}</span>}
        </div>
      </div>
      <p>{event.summary}</p>
      <div className="community-meta-row">
        {submission?.clusterKey && <span>Cluster: {submission.clusterKey}</span>}
        {submission?.aiScoreReasons?.slice(0, 3).map((reason) => (
          <span key={`${event.id}-${reason}`}>{reason.replaceAll("-", " ")}</span>
        ))}
      </div>
      <div className="community-actions">
        {href && (
          <a href={href} rel="noreferrer" target="_blank">
            Open source
            <ExternalLink size={13} aria-hidden="true" />
          </a>
        )}
        {submission?.suggestedAction === "timeline-review" && (
          <span className="timeline-review-note">Strong enough for editor timeline review</span>
        )}
      </div>
    </article>
  );
}

export default function CommunityTimeline({ events, submissions }: Props) {
  const groups = useMemo(() => {
    const byCategory = new Map<string, TimelineEvent[]>();
    const sorted = [...events].sort(
      (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
    );
    for (const event of sorted) {
      const bucket = byCategory.get(event.category) ?? [];
      bucket.push(event);
      byCategory.set(event.category, bucket);
    }
    return [...byCategory.entries()]
      .map(([category, items]) => ({ category, items }))
      .sort((a, b) => b.items.length - a.items.length);
  }, [events]);

  const timelineCandidates = submissions.filter((s) => s.suggestedAction === "timeline-review").length;
  const clusters = new Set(submissions.map((s) => s.clusterKey).filter(Boolean)).size;

  // Open the biggest group by default; everything else stays collapsed so the page
  // is short on load no matter how many footage leads have piled up.
  const [openCategories, setOpenCategories] = useState<Set<string>>(
    () => new Set(groups.slice(0, 1).map((group) => group.category))
  );
  const [visibleByCategory, setVisibleByCategory] = useState<Record<string, number>>({});

  const toggleCategory = (category: string) =>
    setOpenCategories((current) => {
      const next = new Set(current);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });

  const visibleFor = (category: string) => visibleByCategory[category] ?? PAGE_SIZE;
  const showMore = (category: string) =>
    setVisibleByCategory((current) => ({ ...current, [category]: visibleFor(category) + PAGE_SIZE }));

  return (
    <div className="community-feed-shell">
      <section className="community-feed-hero">
        <div>
          <span className="eyebrow">Public lead board</span>
          <h1>Community Feed</h1>
          <p>
            Add a clip, filing, screenshot link, correction, or social lead. The system scores,
            clusters, and posts it here first. Strong items become timeline-review candidates and
            graduate to the main timeline automatically.
          </p>
        </div>
        <a className="button primary" href="/submit">
          <Plus size={17} aria-hidden="true" />
          Add to feed
        </a>
      </section>

      <div className="community-signal-strip" aria-label="Community ingestion status">
        <div>
          <span>Feed items</span>
          <strong>{events.length}</strong>
        </div>
        <div>
          <span>Timeline candidates</span>
          <strong>{timelineCandidates}</strong>
        </div>
        <div>
          <span>Clusters</span>
          <strong>{clusters}</strong>
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="empty community-empty">
          <Sparkles size={20} aria-hidden="true" />
          No public community leads have been processed yet.
          <a href="/submit">Add the first one.</a>
        </div>
      ) : (
        <section className="community-feed-groups" aria-label="Community submitted leads by type">
          {groups.map((group) => {
            const open = openCategories.has(group.category);
            const visible = visibleFor(group.category);
            const shown = open ? group.items.slice(0, visible) : [];
            return (
              <section className={`community-group ${open ? "open" : ""}`} key={group.category}>
                <button
                  aria-expanded={open}
                  className="community-group-header"
                  onClick={() => toggleCategory(group.category)}
                  type="button"
                >
                  <span className="community-group-title">{categoryLabel(group.category)}</span>
                  <span className="community-group-count">{group.items.length}</span>
                  <ChevronDown className="community-group-caret" size={18} aria-hidden="true" />
                </button>
                {open && (
                  <div className="community-group-body">
                    {shown.map((event) => (
                      <CommunityCard
                        event={event}
                        key={event.id}
                        submission={submissionForEvent(event, submissions)}
                      />
                    ))}
                    {visible < group.items.length && (
                      <button
                        className="community-show-more"
                        onClick={() => showMore(group.category)}
                        type="button"
                      >
                        Show {Math.min(PAGE_SIZE, group.items.length - visible)} more
                      </button>
                    )}
                  </div>
                )}
              </section>
            );
          })}
        </section>
      )}
    </div>
  );
}
