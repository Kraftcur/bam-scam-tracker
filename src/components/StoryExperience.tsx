import { BookOpen, Coffee, ExternalLink, FileSearch, MessagesSquare, ShieldAlert, Sparkles, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type {
  StoryPlayer,
  StorySpineNode,
} from "../data/story";
import {
  storyPlayers,
} from "../data/story";
import { formatDate, formatDateTime } from "../lib/format";
import { isCuratedNode, latestAdditions } from "../lib/evidence";
import type { DocumentRecord, IngestionRun, Source, SourceCheck, TimelineEvent } from "../types";
import { Badge } from "./Badge";
import { StoryPlayback } from "./StoryPlayback";

type Props = {
  documents: DocumentRecord[];
  events: TimelineEvent[];
  ingestionRuns: IngestionRun[];
  sources: Source[];
  sourceChecks: SourceCheck[];
  donationUrl?: string;
};

const spineTypeLabels: Record<StorySpineNode["type"], string> = {
  "court-record": "Court record",
  "official-statement": "Official statement",
  "creator-video": "Creator video",
  "news-coverage": "News",
  "social-signal": "Social signal",
  "source-watch": "Source watch",
  context: "Context"
};

const spineLegendItems: Array<{ type: StorySpineNode["type"]; label: string }> = [
  { type: "court-record", label: "Court record" },
  { type: "official-statement", label: "Official statement" },
  { type: "creator-video", label: "Creator video" },
  { type: "news-coverage", label: "News" },
  { type: "social-signal", label: "Social signal" },
  { type: "source-watch", label: "Needs review" }
];

function isExternalUrl(href: string) {
  return /^https?:\/\//i.test(href);
}

type SpineLead = {
  id: string;
  dateLabel: string;
  headline: string;
  category: string;
  href: string;
};

function SpineLeadsGroup({ leads }: { leads: SpineLead[] }) {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(8);
  if (leads.length === 0) return null;
  const shown = leads.slice(0, visible);
  return (
    <article className={`spine-node spine-leads-group ${open ? "open" : ""}`}>
      <div className="spine-tick" aria-hidden="true">
        <span />
      </div>
      <button
        aria-expanded={open}
        className="spine-leads-toggle"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <span className="spine-date">Auto-ingested</span>
        <span className="spine-headline">Latest auto-imported footage</span>
        <span className="spine-dek">
          {leads.length} community-submitted and auto-imported clip{leads.length === 1 ? "" : "s"} (bodycam,
          creator video, and news footage) kept out of the curated story. Browse them all, organized by type,
          in the Evidence Locker.
        </span>
        <span className="spine-meta-row">
          <Badge value="auto-imported" />
          <span className="spine-source-count">
            {leads.length} clip{leads.length === 1 ? "" : "s"}
          </span>
          <span className="spine-leads-caret">{open ? "Hide" : "Show"}</span>
        </span>
      </button>
      {open && (
        <div className="spine-leads-list">
          {shown.map((lead) => (
            <a
              className="spine-lead-row"
              href={lead.href}
              key={lead.id}
              rel={isExternalUrl(lead.href) ? "noreferrer" : undefined}
              target={isExternalUrl(lead.href) ? "_blank" : undefined}
            >
              <span className="spine-lead-date">{lead.dateLabel}</span>
              <span className="spine-lead-title">{lead.headline}</span>
              <Badge value={lead.category} />
              {isExternalUrl(lead.href) && <ExternalLink size={13} aria-hidden="true" />}
            </a>
          ))}
          {visible < leads.length && (
            <button className="spine-leads-more" onClick={() => setVisible((value) => value + 12)} type="button">
              Show {Math.min(12, leads.length - visible)} more
            </button>
          )}
          <a className="spine-leads-all" href="/evidence">
            Open Evidence Locker →
          </a>
        </div>
      )}
    </article>
  );
}

function SpineLegend() {
  return (
    <aside className="spine-legend" aria-label="Timeline source legend">
      {spineLegendItems.map((item) => (
        <span className={`legend-pill ${item.type}`} key={item.type}>
          <span aria-hidden="true" />
          {item.label}
        </span>
      ))}
      <small>Social signals show public discussion, not verified facts.</small>
    </aside>
  );
}

function StorySpineItem({
  node,
  index,
  isOpen,
  onToggle
}: {
  node: StorySpineNode;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const panelId = `spine-panel-${node.id}`;
  return (
    <article className={`spine-node ${index % 2 === 0 ? "left" : "right"} ${node.type} ${isOpen ? "open" : ""}`}>
      <div className="spine-tick" aria-hidden="true">
        <span />
      </div>
      <button
        aria-controls={panelId}
        aria-expanded={isOpen}
        className="spine-node-trigger"
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onToggle();
          }
        }}
        onClick={onToggle}
        type="button"
      >
        <span className="spine-date">{node.dateLabel}</span>
        <span className="spine-headline">{node.headline}</span>
        <span className="spine-dek">{node.dek}</span>
        <span className="spine-meta-row">
          <Badge value={spineTypeLabels[node.type].toLowerCase().replaceAll(" ", "-")} />
          <Badge value={node.status} />
          <span className="spine-source-count">{node.sources.length} source{node.sources.length === 1 ? "" : "s"}</span>
        </span>
        <span className="spine-burst" aria-hidden="true">
          <span>{spineTypeLabels[node.type]}</span>
          <span>{node.confidence} confidence</span>
          <span>{node.tags[0]}</span>
        </span>
      </button>
      <div aria-hidden={!isOpen} className="spine-detail" id={panelId}>
        <div className="spine-detail-inner">
          <div>
            <strong>Known</strong>
            <p>{node.known}</p>
          </div>
          <div>
            <strong>Open question</strong>
            <p>{node.disputed}</p>
          </div>
          <div className="spine-talk-track">
            <strong>Talk track</strong>
            <p>{node.detail}</p>
          </div>
          <div className="spine-tags" aria-label={`Tags for ${node.headline}`}>
            {node.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
          {node.videoSnippets && node.videoSnippets.length > 0 && (
            <div className="spine-video-snippets" aria-label={`Video snippets for ${node.headline}`}>
              {node.videoSnippets.map((snippet) => (
                <a href={snippet.href} key={`${node.id}-${snippet.label}`} rel="noreferrer" target="_blank" tabIndex={isOpen ? 0 : -1}>
                  <img src={snippet.thumbnail} alt="" loading="lazy" />
                  <span>
                    <small>{snippet.timestamp}</small>
                    <strong>{snippet.label}</strong>
                    <span>{snippet.snippet}</span>
                  </span>
                  <ExternalLink size={13} aria-hidden="true" />
                </a>
              ))}
            </div>
          )}
          <div className="spine-sources" aria-label={`Sources for ${node.headline}`}>
            {node.sources.map((source) => (
              <a
                href={source.href}
                key={`${node.id}-${source.label}`}
                rel={isExternalUrl(source.href) ? "noreferrer" : undefined}
                target={isExternalUrl(source.href) ? "_blank" : undefined}
                tabIndex={isOpen ? 0 : -1}
              >
                <Badge value={source.kind} />
                <span>{source.label}</span>
                {isExternalUrl(source.href) && <ExternalLink size={13} aria-hidden="true" />}
              </a>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

function playerInitials(player: StoryPlayer) {
  return player.shortName.slice(0, 3).toUpperCase();
}

function FloatingPeopleDrawer({
  id,
  title,
  eyebrow,
  side,
  players,
  active,
  onToggle
}: {
  id: string;
  title: string;
  eyebrow: string;
  side: "left" | "right";
  players: StoryPlayer[];
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <aside className={`people-dock ${side} ${active ? "open" : ""}`} aria-label={title}>
      <button aria-controls={`${id}-panel`} aria-expanded={active} className="people-dock-toggle" onClick={onToggle} type="button">
        <Users size={17} aria-hidden="true" />
        <span>{title}</span>
      </button>
      <div aria-hidden={!active} className="people-dock-panel" id={`${id}-panel`}>
        <div className="people-dock-inner">
          <div>
            <span className="eyebrow">{eyebrow}</span>
            <h2>{title}</h2>
          </div>
          <div className="people-list">
            {players.map((player) => (
              <article className={`person-card ${player.lane}`} key={player.id}>
                <div className="person-image" aria-hidden="true">
                  <span>{playerInitials(player)}</span>
                </div>
                <div>
                  <span className="person-lane">{player.lane.replaceAll("-", " ")}</span>
                  <h3>{player.name}</h3>
                  <strong>{player.role}</strong>
                  <p>{player.tagline}</p>
                  <a href={player.sourceUrl} rel="noreferrer" target="_blank" tabIndex={active ? 0 : -1}>
                    {player.sourceLabel}
                    <ExternalLink size={13} aria-hidden="true" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

function TimelineSpine({
  nodes,
  leads,
  players,
  courtRecordCount,
  policeRecordCount,
  sourceChecks,
  changedChecks,
  latestRun,
  supportUrl
}: {
  nodes: StorySpineNode[];
  leads: SpineLead[];
  players: StoryPlayer[];
  courtRecordCount: number;
  policeRecordCount: number;
  sourceChecks: SourceCheck[];
  changedChecks: number;
  latestRun?: IngestionRun;
  supportUrl: string;
}) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [openPeopleDock, setOpenPeopleDock] = useState<"public" | "institutions" | null>(null);
  const [openNodeIds, setOpenNodeIds] = useState<string[]>([nodes[0]?.id, nodes.find((node) => node.id === "spine-lawsuit")?.id]
    .filter((id): id is string => Boolean(id)));
  const publicPlayers = players.filter((player) => ["ben-side", "operators"].includes(player.lane));
  const institutionPlayers = players.filter((player) => !["ben-side", "operators"].includes(player.lane));

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const toggleNode = (id: string) => {
    setOpenNodeIds((current) => {
      if (current.includes(id)) return current.filter((nodeId) => nodeId !== id);
      return [id, ...current].slice(0, 2);
    });
  };

  return (
    <div className="spine-shell" data-spine-ready={isHydrated ? "true" : "false"}>
      <div className="spine-copy">
        <span className="eyebrow">Evidence-tiered public record</span>
        <h1>The BAM / RecklessBen story, on one scroll.</h1>
        <p>
          A continuous case spine where every entry is tagged by evidence tier — court records and
          official statements are kept separate from creator video, news coverage, and unverified social
          chatter — so you can see exactly what each claim is backed by. Verified-tier sources are watched
          automatically and the timeline updates itself as they change.
        </p>
      </div>

      <div className="spine-status-strip" aria-label="Tracker status">
        <div>
          <span>Court records indexed</span>
          <strong>{courtRecordCount}</strong>
        </div>
        <div>
          <span>Police / warrant records</span>
          <strong>{policeRecordCount}</strong>
        </div>
        <div>
          <span>Watched sources</span>
          <strong>{sourceChecks.length}</strong>
        </div>
        <div>
          <span>Changed sources</span>
          <strong>{changedChecks}</strong>
        </div>
      </div>

      <SpineLegend />

      <div className="spine-track" aria-label="Continuous case timeline">
        {nodes.map((node, index) => (
          <StorySpineItem
            index={index}
            isOpen={openNodeIds.includes(node.id)}
            key={node.id}
            node={node}
            onToggle={() => toggleNode(node.id)}
          />
        ))}
        <SpineLeadsGroup leads={leads} />
        <article className="spine-support-node">
          <div className="spine-tick" aria-hidden="true">
            <span />
          </div>
          <div className="spine-support-card">
            <div>
              <span className="spine-date">Support</span>
              <strong>Keep the timeline updated</strong>
              <p>
                Donations support hosting, record access, storage, and review time.
                They do not buy editorial treatment.
              </p>
            </div>
            <a className="coffee-card" href={supportUrl} rel="noreferrer" target="_blank">
              <img src="/buy-me-a-coffee-qr.png" alt="QR code for buymeacoffee.com/bam.scam.tracker" loading="lazy" />
              <span>
                <small>Optional support</small>
                <strong>Buy me a coffee</strong>
              </span>
              <Coffee size={18} aria-hidden="true" />
            </a>
          </div>
        </article>
      </div>

      <div className="spine-footer-actions">
        <a className="button primary" href="/submit">
          Submit Evidence
          <Sparkles size={17} aria-hidden="true" />
        </a>
        <a className="button" href="/documents">
          Source Vault
          <FileSearch size={17} aria-hidden="true" />
        </a>
        <a className="button" href="/community">
          Community Feed
          <MessagesSquare size={17} aria-hidden="true" />
        </a>
        <a className="button" href="/about">
          Editorial Policy
          <ShieldAlert size={17} aria-hidden="true" />
        </a>
        <span>
          Last source check: {latestRun ? formatDateTime(latestRun.finishedAt ?? latestRun.startedAt) : "pending"}
        </span>
      </div>

      <FloatingPeopleDrawer
        active={openPeopleDock === "public"}
        eyebrow="People"
        id="public-players"
        onToggle={() => setOpenPeopleDock((current) => (current === "public" ? null : "public"))}
        players={publicPlayers}
        side="left"
        title="People + owners"
      />
      <FloatingPeopleDrawer
        active={openPeopleDock === "institutions"}
        eyebrow="Organizations"
        id="institution-players"
        onToggle={() => setOpenPeopleDock((current) => (current === "institutions" ? null : "institutions"))}
        players={institutionPlayers}
        side="right"
        title="Organizations"
      />
    </div>
  );
}


export default function StoryExperience({ documents, events, ingestionRuns, sources, sourceChecks, donationUrl }: Props) {
  const [viewMode, setViewMode] = useState<"spine" | "play">("play");

  const latestRun = ingestionRuns[0];
  const changedChecks = sourceChecks.filter((check) => check.changed).length;
  const courtRecordCount = documents.filter((doc) => doc.status === "court-record").length;
  const policeRecordCount = documents.filter((doc) =>
    /police|warrant|probable cause|booking/i.test(`${doc.title} ${doc.documentType}`)
  ).length;
  
  const supportUrl = donationUrl || "https://buymeacoffee.com/bam.scam.tracker";

  // Split the curated story from auto-ingested footage leads. An item is a curated
  // node if it's hand-authored OR reviewed up to verified/official/court status (so the
  // Fox 5 interview shows as a real node); raw needs-review leaks roll into one group
  // and live in the Evidence Locker, keeping the Spine and Watch Recap uncluttered.
  const curatedEvents = useMemo(() => events.filter(isCuratedNode), [events]);
  const latest = useMemo(() => latestAdditions(events, 5), [events]);
  const spineLeads = useMemo<SpineLead[]>(
    () =>
      events
        .filter((event) => !isCuratedNode(event))
        .slice()
        .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
        .map((event) => ({
          id: event.id,
          dateLabel: formatDate(event.occurredAt),
          headline: event.title,
          category: event.category,
          href: event.videoUrl || event.imageUrl || "/community"
        })),
    [events]
  );

  const spineNodes = useMemo<StorySpineNode[]>(() => {
    return curatedEvents.map((event) => {
      let type: StorySpineNode["type"] = "context";
      if (event.category === "court") type = "court-record";
      else if (event.category === "statement") type = "official-statement";
      else if (event.category === "media") type = "news-coverage";
      else if (event.category === "video") type = "creator-video";
      else if (event.category === "police") type = "court-record";
      else type = "source-watch";

      let status: StorySpineNode["status"] = "context";
      if (event.status === "court-record") status = "recorded";
      else if (event.status === "official-statement") status = "recorded";
      else if (event.status === "alleged") status = "alleged";
      else if (event.status === "disputed") status = "disputed";
      else if (event.status === "needs-review") status = "needs-review";
      else if (event.status === "verified") status = "recorded";
      
      return {
        id: event.id,
        dateLabel: formatDate(event.occurredAt),
        headline: event.title,
        dek: event.summary,
        type,
        status,
        confidence: event.confidence,
        tags: [event.category],
        known: event.summary,
        disputed: "",
        detail: "",
        sources: []
      };
    });
  }, [curatedEvents]);

  return (
    <div className="experience-container">
      <nav className="view-mode-nav" aria-label="View mode navigation">
        <div className="nav-inner">
          <button
            aria-label="Watch Story Recap"
            className={`nav-tab-btn ${viewMode === "play" ? "active" : ""}`}
            onClick={() => setViewMode("play")}
          >
            <span className="tab-icon">🎬</span>
            <span className="tab-text-full">Watch Story Recap</span>
            <span className="tab-text-short">Recap</span>
          </button>
          <button
            aria-label="Continuous Case Spine"
            className={`nav-tab-btn ${viewMode === "spine" ? "active" : ""}`}
            onClick={() => setViewMode("spine")}
          >
            <span className="tab-icon">📜</span>
            <span className="tab-text-full">Continuous Case Spine</span>
            <span className="tab-text-short">Spine</span>
          </button>
        </div>
      </nav>

      {latest.length > 0 && (
        <aside className="latest-strip" aria-label="Latest additions">
          <span className="latest-strip-label">Latest</span>
          <div className="latest-strip-track">
            {latest.map((event) => {
              const curated = isCuratedNode(event);
              const href = curated ? `/timeline#${event.id}` : event.videoUrl || "/evidence";
              return (
                <a
                  className="latest-chip"
                  href={href}
                  key={event.id}
                  rel={isExternalUrl(href) ? "noreferrer" : undefined}
                  target={isExternalUrl(href) ? "_blank" : undefined}
                >
                  <span className="latest-chip-date">{formatDate(event.occurredAt)}</span>
                  <span className="latest-chip-title">{event.title}</span>
                  <Badge value={event.status} />
                </a>
              );
            })}
          </div>
          <a className="latest-strip-all" href="/evidence">
            Evidence Locker →
          </a>
        </aside>
      )}

      {viewMode === "play" && (
        <StoryPlayback events={curatedEvents} sources={sources} />
      )}

      {viewMode === "spine" && (
        <TimelineSpine
          changedChecks={changedChecks}
          courtRecordCount={courtRecordCount}
          latestRun={latestRun}
          leads={spineLeads}
          nodes={spineNodes}
          players={storyPlayers}
          policeRecordCount={policeRecordCount}
          sourceChecks={sourceChecks}
          supportUrl={supportUrl}
        />
      )}

      <section className="section-band action-band" id="help">
        <div className="action-copy">
          <span className="eyebrow">Help Build the Receipts</span>
          <h2>Got a timestamp, screenshot, filing, bodycam link, or correction?</h2>
          <p>
            Send it in. The tracker gets stronger when every claim is tied to a source and every
            source is labeled clearly.
          </p>
        </div>
        <div className="action-panel">
          <div className="action-buttons">
            <a className="button primary" href="/submit">
              Submit Evidence
              <Sparkles size={17} aria-hidden="true" />
            </a>
            <a className="button" href="/timeline">
              Open Data Archive
              <BookOpen size={17} aria-hidden="true" />
            </a>
            <a className="button" href="/about">
              Editorial Policy
              <ShieldAlert size={17} aria-hidden="true" />
            </a>
          </div>
          <a className="coffee-card" href={supportUrl} rel="noreferrer" target="_blank">
            <img src="/buy-me-a-coffee-qr.png" alt="QR code for buymeacoffee.com/bam.scam.tracker" loading="lazy" />
            <span>
              <small>Keep the receipts flowing</small>
              <strong>Buy me a coffee</strong>
            </span>
            <Coffee size={18} aria-hidden="true" />
          </a>
        </div>
      </section>
    </div>
  );
}
