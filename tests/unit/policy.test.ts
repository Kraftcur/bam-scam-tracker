import { describe, expect, it } from "vitest";
import { canAutoPublish, requiresModeration } from "../../src/lib/policy";

describe("publish policy", () => {
  it("allows official statements and court records to publish when no private-person risk is flagged", () => {
    expect(canAutoPublish({ sourceType: "official-statement", reliabilityTier: "official" })).toBe(true);
    expect(canAutoPublish({ sourceType: "court-record", reliabilityTier: "court-record" })).toBe(true);
  });

  it("never requires moderation under the auto-publish policy", () => {
    expect(requiresModeration({ sourceType: "community", reliabilityTier: "community" })).toBe(false);
    expect(canAutoPublish({ sourceType: "official-statement", reliabilityTier: "official", mentionsPrivatePerson: true })).toBe(true);
  });
});
