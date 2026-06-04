import {
  ExternalLink,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  Film,
  FileText,
  Gavel,
  Shield,
  Youtube,
  Share2,
  Check
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Badge } from "./Badge";
import { formatDateTime } from "../lib/format";
import type { Source, SourceType, TimelineEvent } from "../types";

type PlaybackStep = {
  id: string;
  sequence: string;
  date: string;
  title: string;
  summary: string;
  imageUrl?: string;
  videoUrl?: string;
  benPerspective?: string;
  bamPerspective?: string;
  recordPerspective?: string;
  receipts: Array<{
    label: string;
    href: string;
    kind: "video" | "document" | "statement" | "coverage" | "archive" | "social";
  }>;
};

type Props = {
  events: TimelineEvent[];
  sources: Source[];
};

function getYouTubeEmbedUrl(url: string, autoplay: boolean) {
  try {
    const urlObj = new URL(url);
    let videoId = "";
    if (urlObj.hostname.includes("youtu.be")) {
      videoId = urlObj.pathname.slice(1);
    } else {
      videoId = urlObj.searchParams.get("v") || "";
      if (!videoId && urlObj.pathname.startsWith("/watch")) {
        videoId = urlObj.searchParams.get("v") || "";
      } else if (!videoId) {
        // Handle youtu.be/xxx or youtubes
        videoId = urlObj.pathname.split("/").pop() || "";
      }
    }
    // Clean videoId
    videoId = videoId.split("&")[0];
    
    const t = urlObj.searchParams.get("t");
    let startSeconds = 0;
    if (t) {
      const match = t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s?)$/);
      if (match) {
        const h = parseInt(match[1] || "0", 10);
        const m = parseInt(match[2] || "0", 10);
        const s = parseInt(match[3] || "0", 10);
        startSeconds = h * 3600 + m * 60 + s;
      } else {
        startSeconds = parseInt(t, 10) || 0;
      }
    }
    const params = new URLSearchParams({
      start: String(startSeconds),
      enablejsapi: "1",
      rel: "0"
    });
    if (autoplay) {
      params.set("autoplay", "1");
      params.set("mute", "1");
    }
    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  } catch (e) {
    return "";
  }
}

function isYouTubeUrl(url: string) {
  try {
    const hostname = new URL(url).hostname;
    return hostname.includes("youtube.com") || hostname.includes("youtu.be");
  } catch (e) {
    return false;
  }
}

function receiptKind(sourceType: SourceType): PlaybackStep["receipts"][number]["kind"] {
  if (sourceType === "video") return "video";
  if (sourceType === "audio") return "video";
  if (sourceType === "court-record") return "document";
  if (sourceType === "official-statement") return "statement";
  if (sourceType === "news-report") return "coverage";
  if (sourceType === "community") return "social";
  return "archive";
}

function fallbackPerspective(event: TimelineEvent, lane: "ben" | "bam") {
  if (lane === "ben") {
    if (event.category === "video") return "Creator-side source is linked below. Use the clip and timestamp for the exact claim.";
    if (event.category === "media") return "Creator-side context is not separately summarized yet; this step is coverage of the public dispute.";
    return "Creator-side note not added yet. The receipt links below show what this step is based on.";
  }

  if (event.category === "statement") return "Official-side statement is linked below. Compare it with the surrounding creator videos and filings.";
  if (event.category === "police") return "Police or court-side records are linked below. This step should be read from the cited public record.";
  if (event.category === "court") return "Court-side position is in the filing or docket source linked below; filings are allegations unless a court rules.";
  return "BAM / police-side note not added yet. The receipt links below show what this step is based on.";
}

function visibleChapterIndexes(currentIndex: number, totalSteps: number) {
  const indexes = new Set<number>();
  indexes.add(0);
  indexes.add(totalSteps - 1);
  for (let index = currentIndex - 2; index <= currentIndex + 2; index += 1) {
    if (index >= 0 && index < totalSteps) indexes.add(index);
  }
  return [...indexes].sort((a, b) => a - b);
}

function compactTitle(title: string) {
  return title.length > 46 ? `${title.slice(0, 43)}...` : title;
}

export function StoryPlayback({ events, sources }: Props) {
  // Sort events chronologically for playback (oldest to newest)
  const sortedEvents = [...events].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
  const sourceMap = new Map(sources.map((source) => [source.id, source]));

  const playbackSteps: PlaybackStep[] = sortedEvents.map((event, index) => ({
    id: event.id,
    sequence: String(index + 1).padStart(2, "0"),
    date: formatDateTime(event.occurredAt),
    title: event.title,
    summary: event.summary,
    benPerspective: event.benPerspective || fallbackPerspective(event, "ben"),
    bamPerspective: event.bamPerspective || fallbackPerspective(event, "bam"),
    recordPerspective: event.summary,
    imageUrl: event.imageUrl || "",
    videoUrl: event.videoUrl || "",
    receipts: event.sourceIds
      .map((sourceId) => sourceMap.get(sourceId))
      .filter((source): source is Source => Boolean(source))
      .slice(0, 4)
      .map((source) => ({
        label: source.title,
        href: source.archiveUrl || source.url,
        kind: receiptKind(source.sourceType)
      }))
  }));

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeTab, setActiveTab] = useState<"ben" | "bam" | "record">("ben");
  const [speed, setSpeed] = useState(15); // seconds per step
  const [progress, setProgress] = useState(0); // 0 to 100
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const nativeVideoRef = useRef<HTMLVideoElement | null>(null);
  const [nativeVideoErrored, setNativeVideoErrored] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    try {
      const shareUrl = `${window.location.origin}${window.location.pathname}?view=play&step=${currentStepIndex + 1}`;
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      // safe fallback
    }
  };

  const step = playbackSteps[currentStepIndex];
  const totalSteps = playbackSteps.length;
  const chapterIndexes = visibleChapterIndexes(currentStepIndex, totalSteps);
  const overallProgress = totalSteps > 1 ? ((currentStepIndex + progress / 100) / (totalSteps - 1)) * 100 : 100;

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const stepParam = params.get("step");
      if (stepParam) {
        const stepNum = parseInt(stepParam, 10);
        if (stepNum >= 1 && stepNum <= totalSteps) {
          setCurrentStepIndex(stepNum - 1);
        }
      }
    } catch (e) {
      // safe ignore in non-browser context
    }
  }, [totalSteps]);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      params.set("step", (currentStepIndex + 1).toString());
      params.set("view", "play");
      const hash = window.location.hash;
      const newUrl = `${window.location.pathname}?${params.toString()}${hash}`;
      window.history.replaceState(null, "", newUrl);
    } catch (e) {
      // safe ignore in non-browser context
    }
  }, [currentStepIndex]);

  useEffect(() => {
    // Reset progress when step changes
    setProgress(0);
    setNativeVideoErrored(false);
  }, [currentStepIndex]);

  useEffect(() => {
    if (isPlaying) {
      const stepMs = speed * 1000;
      const intervalMs = 100;
      const progressIncrement = (intervalMs / stepMs) * 100;

      progressIntervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            handleNext();
            return 0;
          }
          return prev + progressIncrement;
        });
      }, intervalMs);
    } else {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    }

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [isPlaying, currentStepIndex, speed]);

  const handleNext = () => {
    setCurrentStepIndex((prev) => (prev + 1) % totalSteps);
  };

  const handlePrev = () => {
    setCurrentStepIndex((prev) => (prev - 1 + totalSteps) % totalSteps);
  };

  const handleTogglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleReset = () => {
    setCurrentStepIndex(0);
    setProgress(0);
    setIsPlaying(true);
  };

  const isYouTubeVideo = step.videoUrl ? isYouTubeUrl(step.videoUrl) : false;
  const youtubeEmbedUrl = step.videoUrl && isYouTubeVideo ? getYouTubeEmbedUrl(step.videoUrl, isPlaying) : "";

  useEffect(() => {
    const video = nativeVideoRef.current;
    if (!video || !step.videoUrl || isYouTubeVideo) return;

    if (!isPlaying) {
      video.pause();
      return;
    }

    video.muted = true;
    video.play().catch(() => {
      setIsPlaying(false);
    });
  }, [isPlaying, step.id, step.videoUrl, isYouTubeVideo]);

  return (
    <div className="playback-shell">
      {/* Top Header Controls */}
      <div className="playback-header">
        <div>
          <span className="eyebrow">Interactive guided recap</span>
          <h1>Timeline Watch Mode</h1>
          <p className="lede">
            Follow the major twists, turns, and evidence clips of the controversy.
          </p>
        </div>
        <div className="playback-meta-controls">
          <label className="playback-speed-select">
            <span>Autoplay Interval</span>
            <select
              value={speed}
              onChange={(e) => setSpeed(parseInt(e.target.value, 10))}
              disabled={!isPlaying}
            >
              <option value={10}>10 Seconds</option>
              <option value={15}>15 Seconds</option>
              <option value={20}>20 Seconds</option>
              <option value={30}>30 Seconds</option>
            </select>
          </label>
          <button className="button" onClick={handleReset} title="Reset to start">
            <RotateCcw size={16} /> Reset
          </button>
        </div>
      </div>

      <div className="playback-chapter-rail" aria-label="Timeline watch mode chapters">
        <div className="chapter-now">
          <span>Now Playing</span>
          <strong>{step.sequence} / {totalSteps}: {compactTitle(step.title)}</strong>
          <div className="chapter-progress-track" aria-hidden="true">
            <span style={{ width: `${Math.min(overallProgress, 100)}%` }} />
          </div>
        </div>
        <div className="chapter-strip" aria-label="Nearby chapters">
          {chapterIndexes.map((idx, position) => {
            const previousIndex = chapterIndexes[position - 1];
            const hasGap = typeof previousIndex === "number" && idx - previousIndex > 1;
            const s = playbackSteps[idx];
            return (
              <span className="chapter-strip-item" key={s.id}>
                {hasGap && <span className="chapter-gap" aria-hidden="true">...</span>}
                <button
                  className={`chapter-chip ${idx === currentStepIndex ? "active" : ""} ${idx < currentStepIndex ? "completed" : ""}`}
                  onClick={() => {
                    setCurrentStepIndex(idx);
                    setProgress(0);
                  }}
                  title={`Go to step ${s.sequence}: ${s.title}`}
                  type="button"
                >
                  <span>{s.sequence}</span>
                  <strong>{compactTitle(s.title)}</strong>
                </button>
              </span>
            );
          })}
        </div>
        <label className="chapter-jump-select">
          <span>Jump to any point</span>
          <select
            aria-label="Jump to timeline step"
            value={currentStepIndex}
            onChange={(event) => {
              setCurrentStepIndex(Number(event.target.value));
              setProgress(0);
            }}
          >
            {playbackSteps.map((s, idx) => (
              <option key={s.id} value={idx}>
                {s.sequence} - {s.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Main Split Player */}
      <div className="playback-player-grid">
        {/* Left Side: Media Screen */}
        <div className="playback-media-card">
          {youtubeEmbedUrl ? (
            <div className="video-embed-wrapper">
              <iframe
                src={youtubeEmbedUrl}
                title={step.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
              <span className="video-badge">
                <Youtube size={14} className="youtube-icon" /> Video Clip
              </span>
            </div>
          ) : step.videoUrl ? (
            <div className="video-embed-wrapper">
              {nativeVideoErrored ? (
                <div className="video-fallback-panel">
                  {step.imageUrl && <img src={step.imageUrl} alt="" aria-hidden="true" />}
                  <div>
                    <strong>Open the clip source</strong>
                    <span>This host blocked inline playback in the browser.</span>
                    <a href={step.videoUrl} rel="noreferrer" target="_blank">
                      Watch source
                      <ExternalLink size={13} aria-hidden="true" />
                    </a>
                  </div>
                </div>
              ) : (
                <video
                  autoPlay={isPlaying}
                  controls
                  crossOrigin="anonymous"
                  key={step.id}
                  muted={isPlaying}
                  playsInline
                  poster={step.imageUrl || undefined}
                  preload="metadata"
                  ref={nativeVideoRef}
                  src={step.videoUrl}
                  onError={() => setNativeVideoErrored(true)}
                />
              )}
              <span className="video-badge">
                <Film size={14} /> Video Clip
              </span>
            </div>
          ) : (
            <div className="image-exhibit-wrapper">
              {step.imageUrl ? (
                <>
                  <img src={step.imageUrl} alt={step.title} />
                  <div className="exhibit-overlay">
                    <span className="image-badge">Exhibit Image</span>
                  </div>
                </>
              ) : (
                <div className="exhibit-record-card">
                  <FileText className="record-card-icon" size={40} aria-hidden="true" />
                  <strong className="record-card-title">{step.title}</strong>
                  <span className="record-card-note">{step.date} · record entry</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Case File Details */}
        <div className="playback-details-card">
          <div className="card-top-header">
            <span className="step-count-badge">Step {step.sequence} of {totalSteps}</span>
            <div className="step-badge-group">
              <button
                className={`share-step-btn ${copied ? "copied" : ""}`}
                onClick={handleShare}
                title="Copy shareable link to this step"
              >
                {copied ? <Check size={13} /> : <Share2 size={13} />}
                <span>{copied ? "Copied!" : "Share Link"}</span>
              </button>
              <span className="step-date-badge">{step.date}</span>
            </div>
          </div>

          <h2 className="step-headline">{step.title}</h2>
          <p className="step-summary-text">{step.summary}</p>

          {/* Perspective Switcher Tabs */}
          <div className="perspective-container">
            <div className="perspective-tabs" role="tablist">
              <button
                className={`tab-btn ben ${activeTab === "ben" ? "active" : ""}`}
                role="tab"
                aria-selected={activeTab === "ben"}
                onClick={() => setActiveTab("ben")}
              >
                <Youtube size={14} /> Ben's Side
              </button>
              <button
                className={`tab-btn bam ${activeTab === "bam" ? "active" : ""}`}
                role="tab"
                aria-selected={activeTab === "bam"}
                onClick={() => setActiveTab("bam")}
              >
                <Shield size={14} /> BAM / Police
              </button>
              <button
                className={`tab-btn record ${activeTab === "record" ? "active" : ""}`}
                role="tab"
                aria-selected={activeTab === "record"}
                onClick={() => setActiveTab("record")}
              >
                <Gavel size={14} /> The Record
              </button>
            </div>

            <div className="perspective-content-panel">
              {activeTab === "ben" && (
                <div className="perspective-body ben">
                  <strong>Ben / Creator View</strong>
                  <p>{step.benPerspective}</p>
                </div>
              )}
              {activeTab === "bam" && (
                <div className="perspective-body bam">
                  <strong>BAM / Corporate / Police View</strong>
                  <p>{step.bamPerspective}</p>
                </div>
              )}
              {activeTab === "record" && (
                <div className="perspective-body record">
                  <strong>Neutral Public Record View</strong>
                  <p>{step.recordPerspective}</p>
                </div>
              )}
            </div>
          </div>

          {/* Receipts Vault */}
          {step.receipts.length > 0 && (
            <div className="step-receipts-vault">
              <span className="vault-title">Verification Receipts</span>
              <div className="vault-links">
                {step.receipts.map((rcpt, index) => (
                  <a
                    key={index}
                    href={rcpt.href}
                    target="_blank"
                    rel="noreferrer"
                    className="mini-receipt-link"
                  >
                    <Badge value={rcpt.kind} />
                    <strong>{rcpt.label}</strong>
                    <ExternalLink size={12} />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Playback Control Bar */}
      <div className="playback-control-bar">
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="control-bar-buttons">
          <button className="icon-btn-large" onClick={handlePrev} title="Previous Step">
            <SkipBack size={20} />
          </button>
          
          <button
            className={`play-pause-btn ${isPlaying ? "playing" : ""}`}
            onClick={handleTogglePlay}
            title={isPlaying ? "Pause autoplay" : "Start autoplay"}
          >
            {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" style={{ marginLeft: "2px" }} />}
          </button>

          <button className="icon-btn-large" onClick={handleNext} title="Next Step">
            <SkipForward size={20} />
          </button>
        </div>
        <div className="playback-status-text">
          {isPlaying ? (
            <span className="status-indicator live">
              <span className="ping-dot"></span> Autoplay Active ({speed}s)
            </span>
          ) : (
            <span className="status-indicator idle">Paused</span>
          )}
        </div>
      </div>
    </div>
  );
}
