import { ExternalLink, Film, Search, Shield, Newspaper } from "lucide-react";
import { useMemo, useState } from "react";
import type { ClipRecord, TimelineEvent } from "../types";
import { buildEvidence, evidenceKindLabels, type EvidenceItem, type EvidenceKind } from "../lib/evidence";
import { formatDateTime } from "../lib/format";
import { Badge } from "./Badge";

type Props = {
  events: TimelineEvent[];
  clips: ClipRecord[];
};

const KIND_ORDER: EvidenceKind[] = ["creator-video", "bodycam", "news-clip"];

function KindIcon({ kind }: { kind: EvidenceKind }) {
  if (kind === "bodycam") return <Shield size={14} aria-hidden="true" />;
  if (kind === "news-clip") return <Newspaper size={14} aria-hidden="true" />;
  return <Film size={14} aria-hidden="true" />;
}

export default function EvidenceLocker({ events, clips }: Props) {
  const allItems = useMemo(() => buildEvidence(events, clips), [events, clips]);
  const [kind, setKind] = useState<"all" | EvidenceKind>("all");
  const [query, setQuery] = useState("");

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: allItems.length };
    for (const k of KIND_ORDER) map[k] = allItems.filter((item) => item.kind === k).length;
    return map;
  }, [allItems]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return allItems.filter((item) => {
      if (kind !== "all" && item.kind !== kind) return false;
      if (!needle) return true;
      return `${item.title} ${item.summary ?? ""}`.toLowerCase().includes(needle);
    });
  }, [allItems, kind, query]);

  return (
    <div className="evidence-shell">
      <div className="evidence-toolbar">
        <div className="evidence-chips" role="tablist" aria-label="Filter footage by type">
          <button
            aria-selected={kind === "all"}
            className={`evidence-chip ${kind === "all" ? "active" : ""}`}
            onClick={() => setKind("all")}
            role="tab"
            type="button"
          >
            All footage <span className="evidence-chip-count">{counts.all}</span>
          </button>
          {KIND_ORDER.map((k) => (
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
            placeholder="Search footage by title or detail"
            value={query}
          />
        </label>
      </div>

      {filtered.length === 0 ? (
        <div className="empty">No footage matches this filter yet.</div>
      ) : (
        <div className="evidence-grid" aria-live="polite">
          {filtered.map((item) => (
            <EvidenceCard item={item} key={`${item.source}-${item.id}`} />
          ))}
        </div>
      )}
    </div>
  );
}

function EvidenceCard({ item }: { item: EvidenceItem }) {
  return (
    <a className={`evidence-card ${item.kind}`} href={item.href} rel="noreferrer" target="_blank">
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
        {item.date && <span className="evidence-date">{formatDateTime(item.date).slice(0, 10)}</span>}
        <strong className="evidence-title">{item.title}</strong>
        {item.summary && <span className="evidence-summary">{item.summary}</span>}
        <span className="evidence-badges">
          <Badge value={item.status} />
          {item.inTimeline ? (
            <span className="evidence-flag in-timeline">In timeline</span>
          ) : (
            <span className="evidence-flag lead">Needs review</span>
          )}
          {item.source === "clip" && <span className="evidence-flag">Key moment</span>}
          <span className="evidence-open">
            Open <ExternalLink size={12} aria-hidden="true" />
          </span>
        </span>
      </span>
    </a>
  );
}
