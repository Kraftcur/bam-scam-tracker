import {
  ArrowRight,
  BookOpen,
  ExternalLink,
  Filter,
  Flame,
  FileSearch,
  Gavel,
  PlayCircle,
  Search,
  ShieldAlert,
  Sparkles
} from "lucide-react";
import { useMemo, useState } from "react";
import type { EvidenceThread, StoryAct, TimelineBeat, VerificationLead, VideoNode, VisualExhibit } from "../data/story";
import {
  decoderCards,
  evidenceThreads,
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

export default function StoryExperience({ documents, events, ingestionRuns, sourceChecks, donationUrl }: Props) {
  const [threadQuery, setThreadQuery] = useState("");
  const [threadMode, setThreadMode] = useState("all");
  const [activeAct, setActiveAct] = useState<StoryAct>(storyActs[0]);
  const [activeExhibit, setActiveExhibit] = useState<VisualExhibit>(visualExhibits[0]);
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
  const activeBeat = timelineBeats.find((beat) => beat.id === activeBeatId) ?? timelineBeats[0];

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

      <section className="stat-strip" aria-label="Key context">
        {storyStats.map((stat) => (
          <div className="stat-cell" key={stat.label}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
            <p>{stat.note}</p>
          </div>
        ))}
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
      </section>
    </div>
  );
}
