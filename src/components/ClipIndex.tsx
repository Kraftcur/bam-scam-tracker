import { ExternalLink, Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { ClipRecord, TimelineEvent } from "../types";
import { Badge } from "./Badge";

type Props = {
  clips: ClipRecord[];
  events: TimelineEvent[];
};

export default function ClipIndex({ clips, events }: Props) {
  const [query, setQuery] = useState("");
  const eventMap = useMemo(() => new Map(events.map((event) => [event.id, event])), [events]);
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return clips.filter((clip) => {
      const haystack = [clip.title, clip.platform, clip.transcriptExcerpt, clip.status].join(" ").toLowerCase();
      return !term || haystack.includes(term);
    });
  }, [clips, query]);

  return (
    <section>
      <div className="filters">
        <label className="field">
          <span>
            <Search size={14} aria-hidden="true" /> Search
          </span>
          <input className="input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="video, audio, quote, event" />
        </label>
      </div>
      <div className="list">
        {filtered.map((clip) => (
          <article className="row-card" key={clip.id}>
            <div className="row-top">
              <div className="stack">
                <div className="meta">
                  <Badge value={clip.platform.toLowerCase()} />
                  <Badge value={clip.status} />
                </div>
                <h3>{clip.title}</h3>
              </div>
              <a className="icon-button" href={clip.sourceUrl} rel="noreferrer" target="_blank" title="Open clip source">
                <ExternalLink size={18} aria-hidden="true" />
              </a>
            </div>
            <p>{clip.transcriptExcerpt}</p>
            <div className="meta">
              {clip.startsAt && <span>{clip.startsAt}</span>}
              {clip.endsAt && <span>{clip.endsAt}</span>}
              {clip.relatedEventIds.map((id) => {
                const event = eventMap.get(id);
                return event ? <span className="pill" key={id}>{event.title}</span> : null;
              })}
            </div>
          </article>
        ))}
      </div>
      {filtered.length === 0 && <div className="empty">No matching clips.</div>}
    </section>
  );
}
