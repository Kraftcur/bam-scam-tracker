import {
  ArrowRight,
  BookOpen,
  Coffee,
  ExternalLink,
  Filter,
  Flame,
  FileSearch,
  Gavel,
  PlayCircle,
  Search,
  ShieldAlert,
  Sparkles,
  Users
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type {
  ClipMoment,
  ControlRoute,
  EvidenceScene,
  EvidenceThread,
  LawsuitLens,
  ProofLevel,
  StoryAct,
  StoryPlayer,
  StorySpineNode,
  TimelineBeat,
  VerificationLead,
  VideoNode,
  VisualExhibit
} from "../data/story";
import {
  clipMoments,
  controlRoutes,
  decoderCards,
  evidenceScenes,
  evidenceThreads,
  lawsuitLenses,
  proofLevels,
  storyPlayers,
  storySpineNodes,
  storyActs,
  storyStats,
  timelineBeats,
  verificationLeads,
  videoNodes,
  visualExhibits
} from "../data/story";
import { formatDateTime } from "../lib/format";
import type { DocumentRecord, IngestionRun, SourceCheck, TimelineEvent } from "../types";
import { Badge } from "./Badge";

type Props = {
  documents: DocumentRecord[];
  events: TimelineEvent[];
  ingestionRuns: IngestionRun[];
  sourceChecks: SourceCheck[];
  donationUrl?: string;
};

const heatLabels = ["cold", "warm", "hot", "red-hot", "critical"];
const receiptIds = [
  "doc-bam-verified-complaint",
  "doc-tro-260402353",
  "doc-afp-26af02033-probable-cause",
  "doc-afp-search-warrant-3352981",
  "doc-bam-docket-events-260402353",
  "doc-law-gorman-complaint",
  "doc-law-gorman-exhibit-d-termination-letter",
  "doc-bam-may28-statement"
];

function formatDocKind(doc: DocumentRecord) {
  return `${doc.documentType} • ${doc.fileType.toUpperCase()}`;
}

function HeatMeter({ heat }: { heat: EvidenceThread["heat"] }) {
  return (
    <span className="heat-meter" aria-label={`${heat} out of 5 heat`}>
      {Array.from({ length: 5 }, (_, index) => (
        <span key={index} className={index < heat ? "on" : ""} />
      ))}
    </span>
  );
}

function VideoCard({ video }: { video: VideoNode }) {
  return (
    <a className="video-tile" href={video.url} rel="noreferrer" target="_blank">
      <span className="video-thumb">
        <img src={video.thumbnail} alt="" loading="lazy" />
        <span className="play-chip">
          <PlayCircle size={18} aria-hidden="true" />
          Watch
        </span>
      </span>
      <span className="video-copy">
        <span className="meta">
          <Badge value={video.role.toLowerCase().replaceAll(" ", "-")} />
          <span>{video.date}</span>
        </span>
        <strong>{video.title}</strong>
        <span className="watch-list">{video.watchFor.join(" • ")}</span>
      </span>
    </a>
  );
}

function TimelineBeatPanel({ beat }: { beat: TimelineBeat }) {
  return (
    <article className={`showdown-panel ${beat.tone}`} key={beat.id}>
      <div className="row-top">
        <div>
          <span className="thread-tag">{beat.date}</span>
          <h3>{beat.title}</h3>
        </div>
        {beat.isCurrent && <Badge value="latest" />}
      </div>
      <p className="showdown-subtitle">{beat.subtitle}</p>
      <div className="side-grid">
        <div className="side-card ben">
          <span>Ben / Mansell side</span>
          <p>{beat.benSide}</p>
        </div>
        <div className="side-card bam">
          <span>BAM / police side</span>
          <p>{beat.bamSide}</p>
        </div>
        <div className="side-card record">
          <span>Record says</span>
          <p>{beat.recordSays}</p>
        </div>
      </div>
      <div className="settle-box">
        <strong>What would actually settle this</strong>
        <p>{beat.settleIt}</p>
      </div>
      <div className="receipt-belt" aria-label={`Receipts for ${beat.title}`}>
        <span>Receipts loaded</span>
        <div>
          {beat.receipts.map((receipt) => (
            <a className="mini-receipt" href={receipt.href} rel="noreferrer" target="_blank" key={`${beat.id}-${receipt.label}`}>
              <Badge value={receipt.kind} />
              <strong>{receipt.label}</strong>
              <ExternalLink size={13} aria-hidden="true" />
            </a>
          ))}
        </div>
      </div>
      <div className="row-top">
        <p>{beat.whyItMatters}</p>
        <a href={beat.sourceUrl} rel="noreferrer" target="_blank">
          {beat.sourceLabel}
          <ExternalLink size={14} aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}

function TimelineBeatButton({
  beat,
  active,
  onSelect
}: {
  beat: TimelineBeat;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button className={active ? "beat-button active" : "beat-button"} onClick={onSelect} type="button">
      <span>{beat.date}</span>
      <strong>{beat.title}</strong>
      <small>{beat.subtitle}</small>
    </button>
  );
}

function InternalLink({ href, children }: { href: string; children: string }) {
  return (
    <a className="button" href={href}>
      {children}
      <ArrowRight size={14} aria-hidden="true" />
    </a>
  );
}

function ControlRouteCard({ route }: { route: ControlRoute }) {
  return (
    <a className={`control-route ${route.accent}`} href={route.href}>
      <span>{route.label}</span>
      <strong>{route.title}</strong>
      <p>{route.forReader}</p>
      <small>
        {route.payoff}
        <ArrowRight size={13} aria-hidden="true" />
      </small>
    </a>
  );
}

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
  players,
  courtRecordCount,
  policeRecordCount,
  sourceChecks,
  changedChecks,
  latestRun,
  supportUrl
}: {
  nodes: StorySpineNode[];
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
        <span className="eyebrow">Source-labeled public timeline</span>
        <h1>The BAM / RecklessBen story, on one scroll.</h1>
        <p>
          Follow the public controversy as a continuous case spine: records, videos,
          official statements, news coverage, and public conversation, each labeled by what it can actually prove.
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

function LeadCard({ lead }: { lead: VerificationLead }) {
  return (
    <article className="lead-card">
      <div className="row-top">
        <div>
          <span className="thread-tag">{lead.status.replaceAll("-", " ")}</span>
          <h3>{lead.title}</h3>
        </div>
        <Badge value="unverified-lead" />
      </div>
      <p>{lead.whyItMatters}</p>
      <div className="lead-proof">
        <strong>Current proof level</strong>
        <p>{lead.currentEvidence}</p>
      </div>
      <div>
        <strong>Promote only when we get</strong>
        <ul>
          {lead.upgradeNeeds.map((need) => (
            <li key={need}>{need}</li>
          ))}
        </ul>
      </div>
      <a href={lead.sourceUrl} rel="noreferrer" target="_blank">
        {lead.sourceLabel}
        <ExternalLink size={14} aria-hidden="true" />
      </a>
    </article>
  );
}

function ProofLevelCard({ proof }: { proof: ProofLevel }) {
  return (
    <article className={`proof-card ${proof.tone}`}>
      <span>{proof.level}</span>
      <h3>{proof.label}</h3>
      <strong>{proof.shortRule}</strong>
      <p>{proof.example}</p>
      <div>
        <small>Tracker move</small>
        <p>{proof.action}</p>
      </div>
    </article>
  );
}

function EvidenceSceneButton({
  active,
  scene,
  onSelect
}: {
  active: boolean;
  scene: EvidenceScene;
  onSelect: () => void;
}) {
  return (
    <button className={active ? "scene-button active" : "scene-button"} onClick={onSelect} type="button">
      <img src={scene.imageUrl} alt="" loading="lazy" />
      <span>
        <small>{scene.label}</small>
        <strong>{scene.headline}</strong>
      </span>
    </button>
  );
}

function EvidenceScenePanel({ scene }: { scene: EvidenceScene }) {
  return (
    <article className={`scene-panel ${scene.tone}`}>
      <a className="scene-frame" href={scene.sourceUrl} rel="noreferrer" target="_blank">
        <img src={scene.imageUrl} alt="" loading="lazy" />
        <span>
          {scene.sourceLabel}
          <ExternalLink size={14} aria-hidden="true" />
        </span>
      </a>
      <div className="scene-copy">
        <div className="scene-kicker">
          <span>{scene.timeWindow}</span>
          <Badge value={scene.proofLevel} />
        </div>
        <h3>{scene.headline}</h3>
        <p>{scene.whatHappened}</p>
        <div className="scene-lanes">
          <div>
            <span>Ben-side signal</span>
            <p>{scene.benSignal}</p>
          </div>
          <div>
            <span>Pushback / record</span>
            <p>{scene.counterSignal}</p>
          </div>
        </div>
        <div className="scene-translation">
          <strong>Plain read</strong>
          <p>{scene.easyRead}</p>
        </div>
        <div className="scene-translation settle">
          <strong>What would settle it</strong>
          <p>{scene.settleIt}</p>
        </div>
        <div className="scene-receipts" aria-label={`Scene receipts for ${scene.headline}`}>
          {scene.receipts.map((receipt) => (
            <a
              href={receipt.href}
              key={`${scene.id}-${receipt.label}`}
              rel={receipt.href.startsWith("#") ? undefined : "noreferrer"}
              target={receipt.href.startsWith("#") ? undefined : "_blank"}
            >
              <Badge value={receipt.kind} />
              <span>{receipt.label}</span>
              <ExternalLink size={13} aria-hidden="true" />
            </a>
          ))}
        </div>
      </div>
    </article>
  );
}

function ClipMomentButton({
  active,
  clip,
  onSelect
}: {
  active: boolean;
  clip: ClipMoment;
  onSelect: () => void;
}) {
  return (
    <button className={active ? "clip-moment-button active" : "clip-moment-button"} onClick={onSelect} type="button">
      <span>{clip.sequence}</span>
      <strong>{clip.title}</strong>
      <small>{clip.timestamp}</small>
    </button>
  );
}

function ClipMomentPanel({ clip }: { clip: ClipMoment }) {
  return (
    <article className="clip-moment-panel">
      <a className="clip-screen" href={clip.sourceUrl} rel="noreferrer" target="_blank">
        <img src={clip.thumbnail} alt="" loading="lazy" />
        <span>
          <PlayCircle size={18} aria-hidden="true" />
          Jump to {clip.timestamp}
        </span>
      </a>
      <div className="clip-moment-copy">
        <div className="scene-kicker">
          <span>{clip.sequence} / {clip.timestamp}</span>
          <Badge value={clip.proofTag} />
        </div>
        <h3>{clip.title}</h3>
        <p>{clip.hook}</p>
        <div className="clip-proof-grid">
          <div>
            <strong>What the clip shows</strong>
            <p>{clip.whatClipShows}</p>
          </div>
          <div>
            <strong>Why it matters</strong>
            <p>{clip.whyItMatters}</p>
          </div>
          <div>
            <strong>Careful read</strong>
            <p>{clip.carefulRead}</p>
          </div>
        </div>
        <a className="clip-source-link" href={clip.sourceUrl} rel="noreferrer" target="_blank">
          {clip.sourceLabel}
          <ExternalLink size={14} aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}

function LawsuitLensButton({
  active,
  lens,
  onSelect
}: {
  active: boolean;
  lens: LawsuitLens;
  onSelect: () => void;
}) {
  return (
    <button className={active ? "lawsuit-lens-button active" : "lawsuit-lens-button"} onClick={onSelect} type="button">
      <span>{lens.label}</span>
      <strong>{lens.legalBucket}</strong>
      <small>{lens.title}</small>
    </button>
  );
}

function LawsuitLensPanel({ lens }: { lens: LawsuitLens }) {
  return (
    <article className={`lawsuit-lens-panel ${lens.tone}`}>
      <div className="lawsuit-lens-head">
        <div>
          <span className="eyebrow">{lens.legalBucket}</span>
          <h3>{lens.title}</h3>
        </div>
        <Badge value="allegation-map" />
      </div>
      <p className="lawsuit-plain">{lens.plainEnglish}</p>
      <div className="lawsuit-lens-grid">
        <div>
          <strong>BAM says</strong>
          <p>{lens.bamTheory}</p>
        </div>
        <div>
          <strong>Ben-side pressure test</strong>
          <p>{lens.benSidePressureTest}</p>
        </div>
        <div>
          <strong>Court has to decide</strong>
          <p>{lens.whatCourtMustDecide}</p>
        </div>
        <div>
          <strong>Do not overread it</strong>
          <p>{lens.notAFinding}</p>
        </div>
      </div>
      <a className="lawsuit-source-link" href={lens.sourceUrl} rel="noreferrer" target="_blank">
        {lens.sourceLabel}
        <ExternalLink size={14} aria-hidden="true" />
      </a>
    </article>
  );
}

function PlayerButton({
  active,
  player,
  onSelect
}: {
  active: boolean;
  player: StoryPlayer;
  onSelect: () => void;
}) {
  return (
    <button className={active ? "player-button active" : "player-button"} onClick={onSelect} type="button">
      <span>{player.shortName.slice(0, 2).toUpperCase()}</span>
      <strong>{player.shortName}</strong>
      <small>{player.tagline}</small>
    </button>
  );
}

function PlayerPanel({ player }: { player: StoryPlayer }) {
  return (
    <article className={`player-panel ${player.lane}`}>
      <div className="player-panel-head">
        <span>{player.shortName.slice(0, 2).toUpperCase()}</span>
        <div>
          <Badge value={player.lane} />
          <h3>{player.name}</h3>
          <p>{player.role}</p>
        </div>
      </div>
      <div className="player-grid">
        <div>
          <strong>Why they matter</strong>
          <p>{player.whyTheyMatter}</p>
        </div>
        <div>
          <strong>Evidence pull</strong>
          <p>{player.evidencePull}</p>
        </div>
        <div>
          <strong>Pressure on them</strong>
          <p>{player.pressureOnThem}</p>
        </div>
        <div>
          <strong>Careful read</strong>
          <p>{player.carefulRead}</p>
        </div>
      </div>
      <div className="connection-strip" aria-label={`Connections for ${player.name}`}>
        {player.connections.map((connection) => (
          <span key={`${player.id}-${connection.label}-${connection.target}`}>
            <strong>{connection.label}</strong>
            {connection.target}
          </span>
        ))}
      </div>
      <a className="player-source-link" href={player.sourceUrl} rel="noreferrer" target="_blank">
        {player.sourceLabel}
        <ExternalLink size={14} aria-hidden="true" />
      </a>
    </article>
  );
}

export default function StoryExperience({ documents, events, ingestionRuns, sourceChecks, donationUrl }: Props) {
  const [threadQuery, setThreadQuery] = useState("");
  const [threadMode, setThreadMode] = useState("all");
  const [activeAct, setActiveAct] = useState<StoryAct>(storyActs[0]);
  const [activeExhibit, setActiveExhibit] = useState<VisualExhibit>(visualExhibits[0]);
  const [activeSceneId, setActiveSceneId] = useState(evidenceScenes[0].id);
  const [activeClipId, setActiveClipId] = useState(clipMoments[0].id);
  const [activeLensId, setActiveLensId] = useState(lawsuitLenses[0].id);
  const [activePlayerId, setActivePlayerId] = useState(storyPlayers[0].id);
  const [activeBeatId, setActiveBeatId] = useState(timelineBeats.find((beat) => beat.isCurrent)?.id ?? timelineBeats[0].id);

  const filteredThreads = useMemo(() => {
    const query = threadQuery.trim().toLowerCase();
    return evidenceThreads.filter((thread) => {
      const haystack = [
        thread.title,
        thread.tagline,
        thread.summary,
        thread.openQuestion,
        thread.evidence.join(" ")
      ]
        .join(" ")
        .toLowerCase();
      const modeMatch =
        threadMode === "all" ||
        (threadMode === "hottest" && thread.heat >= 4) ||
        (threadMode === "police" && thread.id.includes("police")) ||
        (threadMode === "inventory" && (thread.id.includes("tags") || thread.id.includes("claims")));
      return (!query || haystack.includes(query)) && modeMatch;
    });
  }, [threadMode, threadQuery]);

  const latestEvents = events.slice(0, 5);
  const latestRun = ingestionRuns[0];
  const visibleChecks = sourceChecks.slice(0, 6);
  const changedChecks = sourceChecks.filter((check) => check.changed).length;
  const homepageReceipts = useMemo(() => {
    const byId = new Map(documents.map((doc) => [doc.id, doc]));
    return receiptIds.map((id) => byId.get(id)).filter((doc): doc is DocumentRecord => Boolean(doc));
  }, [documents]);
  const courtRecordCount = documents.filter((doc) => doc.status === "court-record").length;
  const policeRecordCount = documents.filter((doc) =>
    /police|warrant|probable cause|booking/i.test(`${doc.title} ${doc.documentType}`)
  ).length;
  const currentSignal = latestEvents[0];
  const activeScene = evidenceScenes.find((scene) => scene.id === activeSceneId) ?? evidenceScenes[0];
  const activeClip = clipMoments.find((clip) => clip.id === activeClipId) ?? clipMoments[0];
  const activeLens = lawsuitLenses.find((lens) => lens.id === activeLensId) ?? lawsuitLenses[0];
  const activePlayer = storyPlayers.find((player) => player.id === activePlayerId) ?? storyPlayers[0];
  const activeBeat = timelineBeats.find((beat) => beat.id === activeBeatId) ?? timelineBeats[0];
  const supportUrl = donationUrl || "https://buymeacoffee.com/bam.scam.tracker";
  const spineNodes = useMemo<StorySpineNode[]>(() => {
    const liveNode: StorySpineNode = {
      id: "spine-live",
      dateLabel: currentSignal?.occurredAt?.slice(0, 10) ?? "Live",
      headline: "Latest verified update",
      dek: currentSignal?.title ?? "Waiting for the next source-labeled update.",
      type: currentSignal?.category === "statement" ? "official-statement" : currentSignal?.category === "media" ? "news-coverage" : "source-watch",
      status: (currentSignal?.status as StorySpineNode["status"]) ?? "context",
      confidence: currentSignal?.confidence ?? "medium",
      tags: [currentSignal?.category ?? "status", "latest", "tracker"],
      known:
        currentSignal?.summary ??
        "The tracker surfaces the newest court, archive, official statement, or moderated public-record update here.",
      disputed:
        "New items are source-labeled and should be read according to their status: filing, statement, coverage, social signal, or verified record.",
      detail:
        "This live node keeps the top of the timeline current without turning every update into a separate page section.",
      sources: [
        {
          label: "Full timeline archive",
          href: "/timeline",
          kind: "site"
        },
        {
          label: "RSS updates",
          href: "/feed.xml",
          kind: "site"
        }
      ]
    };

    return [liveNode, ...[...storySpineNodes].reverse()];
  }, [currentSignal]);

  if (spineNodes.length >= 0) {
    return (
      <TimelineSpine
        changedChecks={changedChecks}
        courtRecordCount={courtRecordCount}
        latestRun={latestRun}
        nodes={spineNodes}
        players={storyPlayers}
        policeRecordCount={policeRecordCount}
        sourceChecks={sourceChecks}
        supportUrl={supportUrl}
      />
    );
  }

  return (
    <div className="story-page">
      <section className="story-hero" id="story">
        <div className="hero-media-grid" aria-hidden="true">
          {videoNodes.slice(0, 4).map((video) => (
            <img src={video.thumbnail} alt="" key={video.id} />
          ))}
        </div>
        <div className="hero-content">
          <div className="eyebrow">Evidence-first scandal map</div>
          <h1>The LEGO case got weird. This makes it understandable.</h1>
          <p>
            A fast, opinionated guide to the Bricks & Minifigs / RecklessBen controversy:
            what allegedly happened to the Mansell collection, why viewers rallied behind
            Ben, how police became part of the story, and what the court papers actually say.
          </p>
          <div className="hero-actions">
            <a className="button primary" href="#now">
              Latest Info
              <ArrowRight size={17} aria-hidden="true" />
            </a>
            <a className="button" href="#storyline">
              Open Timeline
              <PlayCircle size={17} aria-hidden="true" />
            </a>
            {donationUrl && (
              <a className="button warn" href={donationUrl} rel="noreferrer" target="_blank">
                Support the Tracker
              </a>
            )}
          </div>
        </div>
        <div className="hero-brief">
          <strong>The thesis</strong>
          <p>
            The public support for Ben makes sense because the visible record keeps raising
            the same question: where is the complete inventory trail, and why did the people
            asking for it become the emergency?
          </p>
        </div>
      </section>

      <section className="control-deck" aria-label="Case controls">
        <div className="control-deck-intro">
          <span className="eyebrow">Case Controls</span>
          <h2>Pick the door. The story stays source-labeled.</h2>
        </div>
        <div className="control-route-grid">
          {controlRoutes.map((route) => (
            <ControlRouteCard key={route.id} route={route} />
          ))}
        </div>
      </section>

      <section className="stat-strip" aria-label="Key context">
        {storyStats.map((stat) => (
          <div className="stat-cell" key={stat.label}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
            <p>{stat.note}</p>
          </div>
        ))}
      </section>

      <section className="section-band proof-band" id="proof-ladder">
        <div className="section-heading">
          <span className="eyebrow">Proof Ladder</span>
          <h2>How this site decides what gets promoted.</h2>
          <p>
            The scandal moves through screenshots, clips, filings, statements, and court orders.
            This ladder keeps the tracker spicy without letting vibes cosplay as verdicts.
          </p>
        </div>
        <div className="proof-rail" aria-label="Proof levels">
          {proofLevels.map((proof) => (
            <ProofLevelCard proof={proof} key={proof.id} />
          ))}
        </div>
      </section>

      <section className="section-band now-band" id="now">
        <div className="section-heading">
          <span className="eyebrow">Latest Right Now</span>
          <h2>BAM's lawsuit is the live center of the story.</h2>
          <p>
            This is the clean read before the scroll: the controversy is no longer only
            about missing LEGO. It is now inventory evidence, police power, public pressure,
            and a Utah court docket moving at the same time.
          </p>
        </div>
        <div className="now-grid">
          <article className="now-lead">
            <div className="meta">
              <Badge value={currentSignal?.status ?? "verified"} />
              <Badge value={currentSignal?.category ?? "court"} />
            </div>
            <h3>{currentSignal?.title ?? "Waiting for the next verified update"}</h3>
            <p>{currentSignal?.summary ?? "The tracker will surface the next court, archive, or official-record change here."}</p>
            <div className="now-actions">
              <InternalLink href="/cases">Court tracker</InternalLink>
              <InternalLink href="/documents">Source vault</InternalLink>
              <InternalLink href="/feed.xml">RSS updates</InternalLink>
            </div>
          </article>
          <div className="now-stack" aria-label="Current tracker counts">
            <div>
              <span>Court records indexed</span>
              <strong>{courtRecordCount}</strong>
              <p>Complaint, TRO, docket images, case history, and related filings.</p>
            </div>
            <div>
              <span>Police / warrant records</span>
              <strong>{policeRecordCount}</strong>
              <p>Reports, probable-cause materials, booking sheet, and warrant leads.</p>
            </div>
            <div>
              <span>Best next proof</span>
              <strong>bodycam + docket</strong>
              <p>Primary records beat hot takes. Always.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-band scene-band" id="evidence-console">
        <div className="section-heading">
          <span className="eyebrow">Evidence Console</span>
          <h2>Watch the story like a case board, not a filing cabinet.</h2>
          <p>
            Each scene says what happened, what Ben's side makes visible, what the pushback says,
            and which receipt would move the argument from viral to settled.
          </p>
        </div>
        <div className="scene-rail" aria-label="Evidence scenes">
          {evidenceScenes.map((scene) => (
            <EvidenceSceneButton
              active={activeScene.id === scene.id}
              key={scene.id}
              onSelect={() => setActiveSceneId(scene.id)}
              scene={scene}
            />
          ))}
        </div>
        <EvidenceScenePanel scene={activeScene} />
      </section>

      <section className="section-band lawsuit-band" id="lawsuit-translator">
        <div className="section-heading">
          <span className="eyebrow">Lawsuit Translator</span>
          <h2>The filing, translated into what BAM has to prove.</h2>
          <p>
            The complaint is not one accusation; it is a stack of legal buckets. This panel keeps
            the claims readable while separating allegations, temporary orders, and final findings.
          </p>
        </div>
        <div className="lawsuit-shell">
          <div className="lawsuit-lens-list" aria-label="Lawsuit issue lenses">
            {lawsuitLenses.map((lens) => (
              <LawsuitLensButton
                active={activeLens.id === lens.id}
                key={lens.id}
                lens={lens}
                onSelect={() => setActiveLensId(lens.id)}
              />
            ))}
          </div>
          <LawsuitLensPanel lens={activeLens} />
        </div>
      </section>

      <section className="section-band player-map-band" id="pressure-map">
        <div className="section-heading">
          <span className="eyebrow">Pressure Map</span>
          <h2>Who is pulling on the story, and what do they need to prove?</h2>
          <p>
            The scandal is easier once the cast stops blurring together. Pick a player to see
            their lane, the evidence attached to them, and the assumption this tracker refuses to make.
          </p>
        </div>
        <div className="player-map-shell">
          <div className="player-buttons" aria-label="Story players">
            {storyPlayers.map((player) => (
              <PlayerButton
                active={activePlayer.id === player.id}
                key={player.id}
                onSelect={() => setActivePlayerId(player.id)}
                player={player}
              />
            ))}
          </div>
          <PlayerPanel player={activePlayer} />
        </div>
      </section>

      <section className="section-band lead-queue-band" id="lead-queue">
        <div className="section-heading">
          <span className="eyebrow">Verification Queue</span>
          <h2>Fast leads go here before they become timeline facts.</h2>
          <p>
            The story is moving faster than clean records. This queue keeps hot social leads visible
            without pretending Reddit chatter, private uploads, or platform rumors are court findings.
          </p>
        </div>
        <div className="lead-grid">
          {verificationLeads.map((lead) => (
            <LeadCard lead={lead} key={lead.id} />
          ))}
        </div>
      </section>

      <section className="section-band showdown-band" id="storyline">
        <div className="section-heading">
          <span className="eyebrow">Animated Storyline</span>
          <h2>Move through what happened, one beat at a time.</h2>
          <p>
            Drag the case reel or tap a beat. The panel pops open with the Ben/Mansell read,
            the BAM/police read, and the record-safe version in the middle.
          </p>
        </div>
        <div className="timeline-toolbar">
          <strong>Case reel</strong>
          <span>{timelineBeats.length} beats indexed from consignment to lawsuit</span>
        </div>
        <div className="beat-rail" aria-label="Timeline beats">
          {timelineBeats.map((beat) => (
            <TimelineBeatButton
              active={activeBeat.id === beat.id}
              beat={beat}
              key={beat.id}
              onSelect={() => setActiveBeatId(beat.id)}
            />
          ))}
        </div>
        <TimelineBeatPanel beat={activeBeat} />
      </section>

      <section className="section-band exhibit-band" id="exhibits">
        <div className="section-heading">
          <span className="eyebrow">Visual Evidence Board</span>
          <h2>Screenshots you can actually orient around.</h2>
          <p>
            The story moves fast, so this board anchors the big swings to visible artifacts:
            docket images, case history, and the video stills where the public narrative turns.
          </p>
        </div>
        <div className="exhibit-grid">
          <figure className="exhibit-preview">
            <a href={activeExhibit.sourceUrl} rel="noreferrer" target="_blank">
              <img src={activeExhibit.imageUrl} alt="" loading="lazy" />
            </a>
            <figcaption>
              <span className="eyebrow">{activeExhibit.kicker}</span>
              <h3>{activeExhibit.title}</h3>
              <p>{activeExhibit.caption}</p>
              <div className="why-box">
                <strong>Why it matters</strong>
                <p>{activeExhibit.whyItMatters}</p>
              </div>
              <div className="open-question">
                <FileSearch size={16} aria-hidden="true" />
                <span>{activeExhibit.unresolved}</span>
              </div>
              <a href={activeExhibit.sourceUrl} rel="noreferrer" target="_blank">
                {activeExhibit.sourceLabel}
                <ExternalLink size={14} aria-hidden="true" />
              </a>
            </figcaption>
          </figure>
          <div className="exhibit-pickers" aria-label="Visual exhibits">
            {visualExhibits.map((exhibit) => (
              <button
                className={activeExhibit.id === exhibit.id ? "exhibit-picker active" : "exhibit-picker"}
                key={exhibit.id}
                onClick={() => setActiveExhibit(exhibit)}
                type="button"
              >
                <img src={exhibit.imageUrl} alt="" loading="lazy" />
                <span>
                  <strong>{exhibit.title}</strong>
                  <small>{exhibit.kicker}</small>
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="section-band clip-lab-band" id="clip-lab">
        <div className="section-heading">
          <span className="eyebrow">Clip Lab</span>
          <h2>The timestamp map for the moments people keep arguing about.</h2>
          <p>
            These are not verdicts. They are jump points: what the footage shows, why viewers latch onto it,
            and what the record still has to prove.
          </p>
        </div>
        <div className="clip-lab-grid">
          <div className="clip-moment-rail" aria-label="Timestamped clip moments">
            {clipMoments.map((clip) => (
              <ClipMomentButton
                active={activeClip.id === clip.id}
                clip={clip}
                key={clip.id}
                onSelect={() => setActiveClipId(clip.id)}
              />
            ))}
          </div>
          <ClipMomentPanel clip={activeClip} />
        </div>
      </section>

      <section className="section-band" id="plain-english">
        <div className="section-heading">
          <span className="eyebrow">Plain English</span>
          <h2>The whole thing in five acts.</h2>
          <p>
            Pick an act to see the stripped-down version: what happened, why it matters,
            and which receipts carry the weight.
          </p>
        </div>
        <div className="act-grid">
          <div className="act-rail" role="tablist" aria-label="Story acts">
            {storyActs.map((act) => (
              <button
                type="button"
                className={activeAct.id === act.id ? "act-tab active" : "act-tab"}
                onClick={() => setActiveAct(act)}
                key={act.id}
              >
                <span>{act.date}</span>
                <strong>{act.title}</strong>
              </button>
            ))}
          </div>
          <article className={`act-panel ${activeAct.leaning}`}>
            <div className="meta">
              <Badge value={activeAct.leaning === "ben" ? "ben-side" : activeAct.leaning} />
              <span>{activeAct.kicker}</span>
            </div>
            <h3>{activeAct.title}</h3>
            <p>{activeAct.plainEnglish}</p>
            <div className="why-box">
              <strong>Why it matters</strong>
              <p>{activeAct.whyItMatters}</p>
            </div>
            <div className="receipt-stack">
              {activeAct.receipts.map((receipt) => (
                <span className="pill" key={receipt}>{receipt}</span>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="section-band evidence-band" id="evidence">
        <div className="section-heading">
          <span className="eyebrow">Evidence Map</span>
          <h2>The hot questions, not just the documents.</h2>
          <p>
            This is the part normal public-record sites miss. Each thread explains what the
            evidence suggests, what the opposing story says, and what records would settle it.
          </p>
        </div>
        <div className="evidence-tools">
          <label className="field">
            <span>
              <Search size={14} aria-hidden="true" /> Search the threads
            </span>
            <input
              className="input"
              value={threadQuery}
              onChange={(event) => setThreadQuery(event.target.value)}
              placeholder="inventory, police, default, email"
            />
          </label>
          <label className="field">
            <span>
              <Filter size={14} aria-hidden="true" /> Focus
            </span>
            <select className="select" value={threadMode} onChange={(event) => setThreadMode(event.target.value)}>
              <option value="all">All threads</option>
              <option value="hottest">Hottest</option>
              <option value="police">Police arc</option>
              <option value="inventory">Inventory trail</option>
            </select>
          </label>
        </div>
        <div className="evidence-grid">
          {filteredThreads.map((thread) => (
            <article className="evidence-card" key={thread.id}>
              <div className="row-top">
                <div>
                  <span className="thread-tag">{thread.tagline}</span>
                  <h3>{thread.title}</h3>
                </div>
                <HeatMeter heat={thread.heat} />
              </div>
              <p>{thread.summary}</p>
              <ul>
                {thread.evidence.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="open-question">
                <Flame size={16} aria-hidden="true" />
                <span>{thread.openQuestion}</span>
              </div>
              <a href={thread.sourceUrl} rel="noreferrer" target="_blank">
                {thread.sourceLabel}
                <ExternalLink size={14} aria-hidden="true" />
              </a>
              <span className="heat-label">{heatLabels[thread.heat - 1]}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="section-band video-band" id="videos">
        <div className="section-heading">
          <span className="eyebrow">Video Trail</span>
          <h2>The watch order that makes the story click.</h2>
          <p>
            Start with Ben's core episodes, then compare the police response and legal analysis.
            The point is not just what each video says; it is how each one changes the record.
          </p>
        </div>
        <div className="video-grid">
          {videoNodes.map((video) => (
            <VideoCard video={video} key={video.id} />
          ))}
        </div>
      </section>

      <section className="section-band receipts-band" id="receipts">
        <div className="section-heading">
          <span className="eyebrow">Receipt Vault</span>
          <h2>The records people keep arguing about.</h2>
          <p>
            These are the fast-lane sources: complaint, TRO, police probable cause,
            search warrant, docket image, franchise dispute filings, and BAM's own statement.
          </p>
        </div>
        <div className="receipt-grid">
          {homepageReceipts.map((doc) => (
            <a className="receipt-card" href={doc.externalUrl} rel="noreferrer" target="_blank" key={doc.id}>
              <span className="receipt-icon">
                <FileSearch size={21} aria-hidden="true" />
              </span>
              <span className="receipt-copy">
                <span>{formatDocKind(doc)}</span>
                <strong>{doc.title}</strong>
                <span className="meta">
                  <Badge value={doc.status} />
                  <Badge value={doc.redactionStatus} />
                </span>
              </span>
              <ExternalLink size={16} aria-hidden="true" />
            </a>
          ))}
        </div>
      </section>

      <section className="section-band decoder-band" id="decoder">
        <div className="section-heading">
          <span className="eyebrow">Court Decoder</span>
          <h2>Legalese translated before it melts your brain.</h2>
          <p>
            Court filings matter, but they are written to win disputes, not to help normal people.
            These translations keep the documents useful without letting them cosplay as truth.
          </p>
        </div>
        <div className="decoder-grid">
          {decoderCards.map((card) => (
            <article className="decoder-card" key={card.phrase}>
              <Gavel size={21} aria-hidden="true" />
              <h3>{card.phrase}</h3>
              <p>{card.translation}</p>
              <strong>{card.watchOut}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="section-band timeline-band" id="timeline">
        <div className="section-heading">
          <span className="eyebrow">Live Thread</span>
          <h2>Latest tracker updates.</h2>
          <p>
            The full archive is still available, but the homepage keeps the newest useful
            updates close to the evidence map.
          </p>
        </div>
        <div className="live-grid">
          {latestEvents.map((event) => (
            <article className="live-card" key={event.id}>
              <div className="meta">
                <Badge value={event.status} />
                <Badge value={event.category} />
              </div>
              <h3>{event.title}</h3>
              <p>{event.summary}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-band watchdog-band" id="watchdog">
        <div className="section-heading">
          <span className="eyebrow">Source Watchdog</span>
          <h2>The tracker checks trusted sources every six hours.</h2>
          <p>
            Official statements, court/archive pages, and trusted public records get hash-checked.
            A change creates a moderation lead; it does not auto-publish social claims.
          </p>
        </div>
        <div className="watchdog-summary">
          <div>
            <span>Last run</span>
            <strong>{latestRun ? formatDateTime(latestRun.finishedAt ?? latestRun.startedAt) : "Pending"}</strong>
            <p>{latestRun ? `${latestRun.status}; ${latestRun.needsReview} item(s) need review.` : "Waiting for the first deployed cron run."}</p>
          </div>
          <div>
            <span>Sources checked</span>
            <strong>{sourceChecks.length}</strong>
            <p>{changedChecks} watched source(s) currently flagged as changed since baseline.</p>
          </div>
          <div>
            <span>Auto-publish rule</span>
            <strong>low-risk only</strong>
            <p>Court/official records can publish; allegations and private-person claims wait for review.</p>
          </div>
        </div>
        <div className="watchdog-grid">
          {visibleChecks.map((check) => (
            <a className={check.changed ? "watchdog-card changed" : "watchdog-card"} href={check.url} rel="noreferrer" target="_blank" key={check.sourceId}>
              <span className="meta">
                <Badge value={check.ok ? "checked" : "needs-review"} />
                {check.changed && <Badge value="changed" />}
              </span>
              <strong>{check.title}</strong>
              <span>{formatDateTime(check.checkedAt)}</span>
              <small>{check.ok ? `${check.contentLength.toLocaleString()} chars indexed` : check.error ?? "Check failed"}</small>
            </a>
          ))}
          {visibleChecks.length === 0 && <div className="empty">No deployed source checks yet. The cron will populate this after it runs.</div>}
        </div>
      </section>

      <section className="section-band action-band" id="help">
        <div className="action-copy">
          <span className="eyebrow">Help Build the Receipts</span>
          <h2>Got a timestamp, screenshot, filing, bodycam link, or correction?</h2>
          <p>
            Send it in. The site is pro-accountability, but it gets stronger only when every
            claim is tied to a source and every source is labeled honestly.
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
