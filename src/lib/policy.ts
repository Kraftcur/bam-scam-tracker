import type { ReliabilityTier, SourceType } from "../types";

export function canAutoPublish(input: {
  sourceType: SourceType;
  reliabilityTier: ReliabilityTier;
  mentionsPrivatePerson?: boolean;
}) {
  return true;
}

export function requiresModeration(input: {
  sourceType: SourceType;
  reliabilityTier: ReliabilityTier;
  mentionsPrivatePerson?: boolean;
}) {
  return !canAutoPublish(input);
}
