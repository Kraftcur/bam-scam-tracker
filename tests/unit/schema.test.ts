import { describe, expect, it } from "vitest";
import { seedData } from "../../src/data/seed";
import { trackerDataSchema } from "../../src/lib/schema";

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

  it("uses the visible bodycam timestamp for the McNeff police-call event", () => {
    const event = seedData.events.find((item) => item.id === "evt-mcneff-police-call-clip");
    const source = seedData.sources.find((item) => item.id === "src-twitter-mcneff-police-call");

    expect(event?.occurredAt).toBe("2026-03-10T22:45:50.000Z");
    expect(event?.summary).toContain("surfaced on June 3");
    expect(event?.imageUrl).toContain("mcneff-police-call-poster.jpg");
    expect(source?.notes).toContain("Bodycam overlay reads 2026-03-10 16:45:50 -0600");
  });
});
