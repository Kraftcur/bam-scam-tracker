import type { ReliabilityTier, SourceType } from "../types";

// Tiers we treat as "verified" enough to publish to the public timeline without
// a human in the loop. These map 1:1 to the editorial source tiers in seed.ts:
// official statements, court records, trusted archives, and primary video
// (creator uploads, bodycam, dashcam). Everything else — news "reported" leads
// and "community" submissions — is held for review.
const AUTO_PUBLISH_TIERS: ReliabilityTier[] = [
  "court-record",
  "official",
  "trusted-archive",
  "primary-video"
];

export function canAutoPublish(input: {
  sourceType: SourceType;
  reliabilityTier: ReliabilityTier;
  mentionsPrivatePerson?: boolean;
}) {
  // Community leads never auto-publish to the verified timeline. They flow
  // through the community feed (status "community"), not the verified record.
  if (input.reliabilityTier === "community") return false;

  // Only editorially-tiered "verified" sources can auto-publish.
  if (!AUTO_PUBLISH_TIERS.includes(input.reliabilityTier)) return false;

  // Court records and official statements are documentary: the source IS the
  // record, so they publish even when they describe allegations.
  const documentaryTier =
    input.reliabilityTier === "court-record" || input.reliabilityTier === "official";

  // For everything else (archives, primary video), hold back items that name a
  // private person inside an alleged/disputed claim until a human reviews them.
  if (input.mentionsPrivatePerson && !documentaryTier) return false;

  return true;
}

export function requiresModeration(input: {
  sourceType: SourceType;
  reliabilityTier: ReliabilityTier;
  mentionsPrivatePerson?: boolean;
}) {
  return !canAutoPublish(input);
}
