import { describe, expect, it } from "vitest";
import { buildEvidence, isCuratedNode, youTubeId } from "../../src/lib/evidence";
import type { TimelineEvent } from "../../src/types";

function event(partial: Partial<TimelineEvent> & Pick<TimelineEvent, "id">): TimelineEvent {
  return {
    occurredAt: "2026-03-10T12:00:00.000Z",
    title: "Untitled",
    summary: "",
    category: "video",
    involvedParties: [],
    sourceIds: [],
    confidence: "low",
    status: "needs-review",
    publicationRisk: "low",
    ...partial
  };
}

describe("youTubeId", () => {
  it("extracts ids from watch, youtu.be, and embed urls", () => {
    expect(youTubeId("https://www.youtube.com/watch?v=wscQpkcwgNU&t=81s")).toBe("wscQpkcwgNU");
    expect(youTubeId("https://youtu.be/QfmWZ0Bkduw?si=abc")).toBe("QfmWZ0Bkduw");
    expect(youTubeId("https://www.youtube.com/embed/abc123")).toBe("abc123");
    expect(youTubeId("https://example.com/video.mp4")).toBe("");
    expect(youTubeId(undefined)).toBe("");
  });
});

describe("isCuratedNode", () => {
  it("treats hand-authored events as curated nodes", () => {
    expect(isCuratedNode(event({ id: "evt-consignment-2023", status: "alleged" }))).toBe(true);
  });

  it("treats auto-ingested verified items as curated, but raw leads as not", () => {
    expect(isCuratedNode(event({ id: "evt-community-fox5", status: "verified" }))).toBe(true);
    expect(isCuratedNode(event({ id: "evt-yt-abc", status: "needs-review" }))).toBe(false);
    expect(isCuratedNode(event({ id: "evt-community-x", status: "community" }))).toBe(false);
  });
});

describe("buildEvidence", () => {
  it("de-duplicates the same video and prefers the curated representation", () => {
    const curated = event({
      id: "evt-consignment-2023",
      status: "verified",
      videoUrl: "https://www.youtube.com/watch?v=wscQpkcwgNU&t=81s",
      title: "Curated consignment node"
    });
    const autoImport = event({
      id: "evt-yt-wscQpkcwgNU",
      status: "needs-review",
      videoUrl: "https://www.youtube.com/watch?v=wscQpkcwgNU",
      title: "RecklessBen upload: thief video"
    });
    const items = buildEvidence([curated, autoImport], []);
    const forVideo = items.filter((item) => youTubeId(item.href) === "wscQpkcwgNU");
    expect(forVideo).toHaveLength(1);
    expect(forVideo[0].inTimeline).toBe(true);
    expect(forVideo[0].title).toBe("Curated consignment node");
  });

  it("classifies bodycam and keeps distinct videos separate", () => {
    const bodycam = event({
      id: "evt-community-bodycam",
      category: "police",
      videoUrl: "https://youtu.be/QfmWZ0Bkduw",
      title: "Bodycam"
    });
    const items = buildEvidence([bodycam], []);
    expect(items).toHaveLength(1);
    expect(items[0].kind).toBe("bodycam");
    expect(items[0].inTimeline).toBe(false);
  });

  it("sorts footage into recklessben / bodycam / news-interview sections by source", () => {
    const ben = event({
      id: "evt-yt-abc",
      title: "RecklessBen upload: arrested over legos",
      sourceIds: ["src-recklessben-channel"],
      videoUrl: "https://youtu.be/abc"
    });
    const benRespondsToPolice = event({
      id: "evt-recklessben-police",
      category: "police",
      title: "RecklessBen responds to American Fork police",
      sourceIds: ["src-recklessben-police-response", "src-recklessben-channel"],
      videoUrl: "https://youtu.be/def"
    });
    const interview = event({
      id: "evt-community-fox5",
      title: "Fox 5 DC Interview With RecklessBen",
      sourceIds: ["src-sub-fox5"],
      videoUrl: "https://youtu.be/ghi"
    });
    const newsReport = event({
      id: "evt-dexerto",
      category: "media",
      title: "National coverage of the dispute",
      sourceIds: ["src-dexerto-may24"],
      videoUrl: "https://youtu.be/jkl"
    });
    const items = buildEvidence([ben, benRespondsToPolice, interview, newsReport], []);
    const kindOf = (id: string) => items.find((i) => i.id === id)?.kind;
    expect(kindOf("evt-yt-abc")).toBe("recklessben");
    // Ben's own video about police stays under RecklessBen, not bodycam
    expect(kindOf("evt-recklessben-police")).toBe("recklessben");
    expect(kindOf("evt-community-fox5")).toBe("news-interview");
    expect(kindOf("evt-dexerto")).toBe("news-interview");
  });
});
