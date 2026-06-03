import { ExternalLink, Plus, Sparkles } from "lucide-react";
import type { SubmissionRecord, TimelineEvent } from "../types";
import { formatDateTime } from "../lib/format";
import { Badge } from "./Badge";

type Props = {
  events: TimelineEvent[];
  submissions: SubmissionRecord[];
};

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

export default function CommunityTimeline({ events, submissions }: Props) {
  const sorted = [...events].sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
  const timelineCandidates = submissions.filter((submission) => submission.suggestedAction === "timeline-review").length;
  const clusters = new Set(submissions.map((submission) => submission.clusterKey).filter(Boolean)).size;

  return (
    <div className="community-feed-shell">
      <section className="community-feed-hero">
        <div>
          <span className="eyebrow">Public lead board</span>
          <h1>Community Feed</h1>
          <p>
            Add a clip, filing, screenshot link, correction, or social lead. The system scores,
            clusters, and posts it here first. Strong items become timeline-review candidates.
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
          <strong>{sorted.length}</strong>
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

      <section className="community-feed-list" aria-label="Community submitted leads">
        {sorted.length === 0 ? (
          <div className="empty community-empty">
            <Sparkles size={20} aria-hidden="true" />
            No public community leads have been processed yet.
            <a href="/submit">Add the first one.</a>
          </div>
        ) : (
          sorted.map((event) => {
            const submission = submissionForEvent(event, submissions);
            const href = sourceHref(event, submission);
            return (
              <article className="community-feed-card" key={event.id} id={submission?.id}>
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
          })
        )}
      </section>
    </div>
  );
}
