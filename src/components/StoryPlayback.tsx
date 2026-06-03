import {
  ExternalLink,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  Film,
  Gavel,
  Shield,
  Youtube,
  Share2,
  Check
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Badge } from "./Badge";
import { formatDateTime } from "../lib/format";
import type { TimelineEvent } from "../types";

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
};

function getYouTubeEmbedUrl(url: string) {
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
    return `https://www.youtube.com/embed/${videoId}?start=${startSeconds}&enablejsapi=1&rel=0`;
  } catch (e) {
    return "";
  }
}

export function StoryPlayback({ events }: Props) {
  // Sort events chronologically for playback (oldest to newest)
  const sortedEvents = [...events].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));

  const playbackSteps: PlaybackStep[] = sortedEvents.map((event, index) => ({
    id: event.id,
    sequence: String(index + 1).padStart(2, "0"),
    date: formatDateTime(event.occurredAt),
    title: event.title,
    summary: event.summary,
    benPerspective: event.benPerspective || "",
    bamPerspective: event.bamPerspective || "",
    recordPerspective: event.summary,
    imageUrl: event.imageUrl || "",
    videoUrl: event.videoUrl || "",
    receipts: []
  }));

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<"ben" | "bam" | "record">("ben");
  const [speed, setSpeed] = useState(15); // seconds per step
  const [progress, setProgress] = useState(0); // 0 to 100
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
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
    setIsPlaying(false);
  };

  const youtubeEmbedUrl = step.videoUrl ? getYouTubeEmbedUrl(step.videoUrl) : "";

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

      {/* Stepper Progress Bar */}
      <div className="playback-stepper">
        {playbackSteps.map((s, idx) => (
          <button
            key={s.id}
            className={`step-dot-btn ${idx === currentStepIndex ? "active" : ""} ${idx < currentStepIndex ? "completed" : ""}`}
            onClick={() => {
              setCurrentStepIndex(idx);
              setIsPlaying(false);
            }}
            title={`Go to step ${s.sequence}: ${s.title}`}
          >
            <span className="dot-label">{s.sequence}</span>
            <span className="dot-progress-container">
              {idx === currentStepIndex ? (
                <span className="dot-progress-fill" style={{ width: `${progress}%` }}></span>
              ) : idx < currentStepIndex ? (
                <span className="dot-progress-fill completed"></span>
              ) : null}
            </span>
          </button>
        ))}
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
          ) : (
            <div className="image-exhibit-wrapper">
              {step.imageUrl ? (
                <img src={step.imageUrl} alt={step.title} />
              ) : (
                <div className="placeholder-art">
                  <Film size={48} className="placeholder-icon" />
                </div>
              )}
              <div className="exhibit-overlay">
                <span className="image-badge">Exhibit Image</span>
              </div>
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
