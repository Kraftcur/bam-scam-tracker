import { ExternalLink, Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { formatDate } from "../lib/format";
import type { Source, TimelineEvent } from "../types";
import { Badge } from "./Badge";

type Props = {
  events: TimelineEvent[];
  sources: Source[];
};

export default function TimelineExplorer({ events, sources }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [confidence, setConfidence] = useState("all");

  const sourceMap = useMemo(() => new Map(sources.map((source) => [source.id, source])), [sources]);
  const categories = useMemo(() => Array.from(new Set(events.map((event) => event.category))).sort(), [events]);
  const statuses = useMemo(() => Array.from(new Set(events.map((event) => event.status))).sort(), [events]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return events.filter((event) => {
      const haystack = [
        event.title,
        event.summary,
        event.category,
        event.status,
        ...event.involvedParties
      ]
        .join(" ")
        .toLowerCase();

      return (
        (!term || haystack.includes(term)) &&
        (category === "all" || event.category === category) &&
        (status === "all" || event.status === status) &&
        (confidence === "all" || event.confidence === confidence)
      );
    });
  }, [category, confidence, events, query, status]);

  return (
    <section>
      <div className="filters" aria-label="Timeline filters">
        <label className="field">
          <span>
            <Search size={14} aria-hidden="true" /> Search
          </span>
          <input
            className="input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="party, filing, statement, report"
          />
        </label>
        <label className="field">
          <span>
            <SlidersHorizontal size={14} aria-hidden="true" /> Category
          </span>
          <select className="select" value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="all">All categories</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Status</span>
          <select className="select" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="all">All statuses</option>
            {statuses.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Confidence</span>
          <select className="select" value={confidence} onChange={(event) => setConfidence(event.target.value)}>
            <option value="all">All confidence</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </label>
      </div>

      <div className="list" aria-live="polite">
        {filtered.map((event) => (
          <article className="row-card" key={event.id}>
            <div className="row-top">
              <div className="stack">
                <div className="meta">
                  <time dateTime={event.occurredAt}>{formatDate(event.occurredAt)}</time>
                  <Badge value={event.category} />
                  <Badge value={event.status} />
                  <Badge value={`${event.confidence}-confidence`} />
                </div>
                <h3>{event.title}</h3>
              </div>
              <Badge value={event.publicationRisk === "low" ? "low-risk" : event.publicationRisk} />
            </div>
            <p>{event.summary}</p>
            <div className="meta">
              {event.involvedParties.map((party) => (
                <span className="pill" key={party}>
                  {party}
                </span>
              ))}
            </div>
            <div className="meta">
              {event.sourceIds.map((id) => {
                const source = sourceMap.get(id);
                if (!source) return null;
                return (
                  <a className="pill" href={source.url} rel="noreferrer" target="_blank" key={id}>
                    {source.publisher}
                    <ExternalLink size={13} aria-hidden="true" />
                  </a>
                );
              })}
            </div>
          </article>
        ))}
        {filtered.length === 0 && <div className="empty">No matching timeline records.</div>}
      </div>
    </section>
  );
}
