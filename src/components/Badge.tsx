import { titleCase } from "../lib/format";

// Display-label overrides for status/type values whose raw name reads poorly.
// "needs-review" implies a pending editorial action; we don't have a manual review
// step, so auto-imported footage reads more honestly as "Unverified".
const labelOverrides: Record<string, string> = {
  "needs-review": "Unverified"
};

export function Badge({ value }: { value: string }) {
  return <span className={`pill ${value}`}>{labelOverrides[value] ?? titleCase(value)}</span>;
}
