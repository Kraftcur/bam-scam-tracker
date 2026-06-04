import { describe, expect, it } from "vitest";
import { seedData } from "../../src/data/seed";
import { timelineEventSchema, trackerDataSchema } from "../../src/lib/schema";

describe("seed data", () => {
  it("matches the public tracker schema", () => {
    expect(() => trackerDataSchema.parse(seedData)).not.toThrow();
    expect(seedData.sourceChecks).toEqual([]);
  });

  it("keeps every event tied to at least one known source", () => {
    const sourceIds = new Set(seedData.sources.map((source) => source.id));
    for (const event of seedData.events) {
      expect(event.sourceIds.length).toBeGreaterThan(0);
      for (const sourceId of event.sourceIds) {
        expect(sourceIds.has(sourceId)).toBe(true);
      }
    }
  });

  it("does not auto-label disputed claims as verified", () => {
    for (const claim of seedData.claims) {
      if (claim.publicationRisk !== "low") {
        expect(claim.status).not.toBe("verified");
      }
    }
  });

  it("accepts auto-ingested event dates with a +00:00 offset (YouTube feed format)", () => {
    // The YouTube RSS feed publishes dates like 2026-06-01T15:00:30+00:00. If the
    // schema rejects the offset, every auto-imported event is silently dropped and
    // the live site falls back to seed-only data.
    const parsed = timelineEventSchema.safeParse({
      id: "evt-yt-2YEzhDn0jY8",
      occurredAt: "2026-06-01T15:00:30+00:00",
      title: "RecklessBen upload: a real title",
      summary: "A summary long enough to satisfy the event schema.",
      category: "video",
      involvedParties: [],
      sourceIds: ["src-recklessben-channel"],
      confidence: "low",
      status: "needs-review",
      publicationRisk: "low",
      videoUrl: "https://www.youtube.com/watch?v=2YEzhDn0jY8"
    });
    expect(parsed.success).toBe(true);
  });

  it("uses the visible bodycam timestamp for the McNeff police-call event", () => {
    const event = seedData.events.find((item) => item.id === "evt-mcneff-police-call-clip");
    const source = seedData.sources.find((item) => item.id === "src-twitter-mcneff-police-call");

    expect(event?.occurredAt).toBe("2026-03-10T22:45:50.000Z");
    expect(event?.summary).toContain("surfaced on June 3");
    expect(event?.imageUrl).toContain("mcneff-police-call-poster.jpg");
    expect(event?.videoUrl).toContain("mcneff-police-call.mp4");
    expect(source?.notes).toContain("Bodycam overlay reads 2026-03-10 16:45:50 -0600");
    expect(source?.url).toContain("video.twimg.com");
  });
});
