import type { ReliabilityTier, SourceType } from "../types";

export function canAutoPublish(input: {
  sourceType: SourceType;
  reliabilityTier: ReliabilityTier;
  mentionsPrivatePerson?: boolean;
}) {
  if (input.mentionsPrivatePerson) return false;
  return (
    input.reliabilityTier === "court-record" ||
    input.reliabilityTier === "official" ||
    (input.reliabilityTier === "trusted-archive" && input.sourceType === "court-record")
  );
}

export function requiresModeration(input: {
  sourceType: SourceType;
  reliabilityTier: ReliabilityTier;
  mentionsPrivatePerson?: boolean;
}) {
  return !canAutoPublish(input);
}
