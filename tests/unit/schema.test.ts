import { describe, expect, it } from "vitest";
import { seedData } from "../../src/data/seed";
import { trackerDataSchema } from "../../src/lib/schema";

describe("seed data", () => {
  it("matches the public tracker schema", () => {
    expect(() => trackerDataSchema.parse(seedData)).not.toThrow();
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
});
