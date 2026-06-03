import type { TimelineEvent } from "../types";
import { formatDateTime } from "../lib/format";
import { Badge } from "./Badge";

type Props = {
  events: TimelineEvent[];
};

export default function CommunityTimeline({ events }: Props) {
  // Sort events newest first
  const sorted = [...events].sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());

  return (
    <div className="community-timeline panel" style={{ maxWidth: "800px", margin: "40px auto" }}>
      <div className="panel-header">
        <h2>Community Submissions Timeline</h2>
      </div>
      <div className="panel-body stack" style={{ padding: "16px" }}>
        {sorted.length === 0 ? (
          <p style={{ opacity: 0.7 }}>No community submissions have been processed yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {sorted.map(event => (
              <div key={event.id} style={{ 
                padding: "16px", 
                border: "1px solid var(--border-color)", 
                borderRadius: "8px",
                background: "rgba(255, 255, 255, 0.03)",
                display: "flex",
                flexDirection: "column",
                gap: "8px"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                  <h3 style={{ margin: 0, fontSize: "1.1rem", lineHeight: 1.3 }}>{event.title}</h3>
                  <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                    <Badge value={event.category} />
                    <Badge value={event.confidence} />
                  </div>
                </div>
                <div style={{ fontSize: "0.85rem", opacity: 0.6 }}>
                  {formatDateTime(event.occurredAt)}
                </div>
                <p style={{ margin: 0, fontSize: "0.95rem", lineHeight: 1.5, opacity: 0.9 }}>
                  {event.summary}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
