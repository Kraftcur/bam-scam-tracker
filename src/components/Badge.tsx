import { titleCase } from "../lib/format";

export function Badge({ value }: { value: string }) {
  return <span className={`pill ${value}`}>{titleCase(value)}</span>;
}
