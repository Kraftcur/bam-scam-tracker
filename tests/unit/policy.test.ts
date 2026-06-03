import { describe, expect, it } from "vitest";
import { canAutoPublish, requiresModeration } from "../../src/lib/policy";

describe("publish policy", () => {
  it("allows official statements and court records to publish when no private-person risk is flagged", () => {
    expect(canAutoPublish({ sourceType: "official-statement", reliabilityTier: "official" })).toBe(true);
    expect(canAutoPublish({ sourceType: "court-record", reliabilityTier: "court-record" })).toBe(true);
  });

  it("holds community leads for moderation instead of auto-publishing", () => {
    expect(requiresModeration({ sourceType: "community", reliabilityTier: "community" })).toBe(true);
    expect(canAutoPublish({ sourceType: "community", reliabilityTier: "community" })).toBe(false);
  });

  it("treats court records and official statements as documentary, so allegations still publish", () => {
    expect(canAutoPublish({ sourceType: "official-statement", reliabilityTier: "official", mentionsPrivatePerson: true })).toBe(true);
    expect(canAutoPublish({ sourceType: "court-record", reliabilityTier: "court-record", mentionsPrivatePerson: true })).toBe(true);
  });

  it("auto-publishes primary video and trusted archives, but holds them when a private person is in an alleged claim", () => {
    expect(canAutoPublish({ sourceType: "video", reliabilityTier: "primary-video" })).toBe(true);
    expect(canAutoPublish({ sourceType: "public-archive", reliabilityTier: "trusted-archive" })).toBe(true);
    expect(canAutoPublish({ sourceType: "video", reliabilityTier: "primary-video", mentionsPrivatePerson: true })).toBe(false);
  });

  it("does not auto-publish untiered news 'reported' leads", () => {
    expect(canAutoPublish({ sourceType: "news-report", reliabilityTier: "reported" })).toBe(false);
  });
});
