import { ChevronDown, ExternalLink, Film, MessageSquare, Mic, Newspaper, Scale, Search, Shield } from "lucide-react";
import { useMemo, useState } from "react";
import type { ClipRecord, DocumentRecord, TimelineEvent } from "../types";
import {
  buildEvidence,
  evidenceKindLabels,
  evidenceKindOrder,
  type EvidenceItem,
  type EvidenceKind
} from "../lib/evidence";
import { formatDate } from "../lib/format";
import { Badge } from "./Badge";

type Props = {
  events: TimelineEvent[];
  clips: ClipRecord[];
  documents: DocumentRecord[];
};

const PAGE_SIZE = 6;

function KindIcon({ kind }: { kind: EvidenceKind }) {
  if (kind === "bodycam") return <Shield size={14} aria-hidden="true" />;
  if (kind === "interview") return <Mic size={14} aria-hidden="true" />;
  if (kind === "news") return <Newspaper size={14} aria-hidden="true" />;
  if (kind === "court-doc") return <Scale size={14} aria-hidden="true" />;
  if (kind === "commentary") return <MessageSquare size={14} aria-hidden="true" />;
  return <Film size={14} aria-hidden="true" />;
}

export default function EvidenceLocker({ events, clips, documents }: Props) {
  const allItems = useMemo(() => buildEvidence(events, clips, documents), [events, clips, documents]);
  const [kind, setKind] = useState<"all" | EvidenceKind>("all");
  const [query, setQuery] = useState("");
  const [visibleByKind, setVisibleByKind] = useState<Record<string, number>>({});

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: allItems.length };
    for (const k of evidenceKindOrder) map[k] = allItems.filter((item) => item.kind === k).length;
    return map;
  }, [allItems]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return allItems.filter((item) => {
      if (kind !== "all" && item.kind !== kind) return false;
      if (!needle) return true;
      const haystack = `${item.title} ${item.summary ?? ""} ${(item.moments ?? []).map((m) => m.title).join(" ")}`;
      return haystack.toLowerCase().includes(needle);
    });
  }, [allItems, kind, query]);

  const sections = useMemo(
    () =>
      evidenceKindOrder
        .map((k) => ({ kind: k, items: filtered.filter((item) => item.kind === k) }))
        .filter((section) => section.items.length > 0),
    [filtered]
  );

  const visibleFor = (k: string) => visibleByKind[k] ?? PAGE_SIZE;
  const showMore = (k: string) =>
    setVisibleByKind((current) => ({ ...current, [k]: visibleFor(k) + PAGE_SIZE }));

  return (
    <div className="evidence-shell">
      <div className="evidence-toolbar">
        <div className="evidence-chips" role="tablist" aria-label="Filter evidence by type">
          <button
            aria-selected={kind === "all"}
            className={`evidence-chip ${kind === "all" ? "active" : ""}`}
            onClick={() => setKind("all")}
            role="tab"
            type="button"
          >
            All evidence <span className="evidence-chip-count">{counts.all}</span>
          </button>
          {evidenceKindOrder
            .filter((k) => counts[k] > 0)
            .map((k) => (
              <button
                aria-selected={kind === k}
                className={`evidence-chip ${kind === k ? "active" : ""}`}
                key={k}
                onClick={() => setKind(k)}
                role="tab"
                type="button"
              >
                <KindIcon kind={k} />
                {evidenceKindLabels[k]} <span className="evidence-chip-count">{counts[k]}</span>
              </button>
            ))}
        </div>
        <label className="evidence-search">
          <Search size={15} aria-hidden="true" />
          <input
            className="input"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search evidence by title or detail"
            value={query}
          />
        </label>
      </div>

      {sections.length === 0 ? (
        <div className="empty">No evidence matches this filter yet.</div>
      ) : (
        <div aria-live="polite">
          {sections.map((section) => {
            const visible = visibleFor(section.kind);
            const shown = section.items.slice(0, visible);
            return (
              <section className="evidence-section" key={section.kind}>
                <h2 className="evidence-section-title">
                  <KindIcon kind={section.kind} />
                  {evidenceKindLabels[section.kind]}
                  <span className="evidence-section-count">{section.items.length}</span>
                </h2>
                <div className="evidence-grid">
                  {shown.map((item) => (
                    <EvidenceCard item={item} key={`${item.source}-${item.id}`} />
                  ))}
                </div>
                {visible < section.items.length && (
                  <button className="community-show-more" onClick={() => showMore(section.kind)} type="button">
                    Show {Math.min(PAGE_SIZE, section.items.length - visible)} more
                  </button>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function EvidenceCard({ item }: { item: EvidenceItem }) {
  const [open, setOpen] = useState(false);
  const moments = item.moments ?? [];
  return (
    <article className={`evidence-card ${item.kind}`}>
      <a className="evidence-card-main" href={item.href} rel="noreferrer" target="_blank">
        <span className="evidence-thumb">
          {item.thumb ? (
            <img src={item.thumb} alt="" loading="lazy" />
          ) : (
            <span className="evidence-thumb-fallback">
              <KindIcon kind={item.kind} />
            </span>
          )}
          <span className="evidence-kind-tag">
            <KindIcon kind={item.kind} />
            {evidenceKindLabels[item.kind]}
          </span>
        </span>
        <span className="evidence-body">
          {item.date && <span className="evidence-date">{formatDate(item.date)}</span>}
          <strong className="evidence-title">{item.title}</strong>
          {item.summary && <span className="evidence-summary">{item.summary}</span>}
          <span className="evidence-badges">
            <Badge value={item.status} />
            {item.inTimeline ? (
              <span className="evidence-flag in-timeline">In timeline</span>
            ) : (
              <span className="evidence-flag lead">Auto-imported</span>
            )}
            <span className="evidence-open">
              Open <ExternalLink size={12} aria-hidden="true" />
            </span>
          </span>
        </span>
      </a>
      {moments.length > 0 && (
        <div className="evidence-moments">
          <button
            aria-expanded={open}
            className="evidence-moments-toggle"
            onClick={() => setOpen((value) => !value)}
            type="button"
          >
            <ChevronDown className={`evidence-moments-caret ${open ? "open" : ""}`} size={15} aria-hidden="true" />
            {moments.length} key moment{moments.length === 1 ? "" : "s"}
          </button>
          {open && (
            <ul className="evidence-moments-list">
              {moments.map((moment) => (
                <li key={`${item.id}-${moment.title}`}>
                  <a href={moment.href} rel="noreferrer" target="_blank">
                    {moment.timestamp && <span className="evidence-moment-time">{moment.timestamp}</span>}
                    <span className="evidence-moment-title">{moment.title}</span>
                    <ExternalLink size={11} aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </article>
  );
}
