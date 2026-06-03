import { ExternalLink } from "lucide-react";
import { formatDate } from "../lib/format";
import type { CaseRecord, Source } from "../types";
import { Badge } from "./Badge";

type Props = {
  cases: CaseRecord[];
  sources: Source[];
};

export default function CaseTracker({ cases, sources }: Props) {
  const sourceMap = new Map(sources.map((source) => [source.id, source]));

  return (
    <div className="list">
      {cases.map((caseRecord) => (
        <article className="row-card" key={caseRecord.id}>
          <div className="row-top">
            <div className="stack">
              <div className="meta">
                <Badge value="court-record" />
                <span>{caseRecord.jurisdiction}</span>
                <span>{caseRecord.caseNumber}</span>
              </div>
              <h3>{caseRecord.title}</h3>
            </div>
            <span className="pill">Checked {formatDate(caseRecord.lastChecked)}</span>
          </div>
          <p>{caseRecord.summary}</p>
          <div className="split">
            <div className="stack">
              <div>
                <strong>Court</strong>
                <p>{caseRecord.court}</p>
              </div>
              <div>
                <strong>Status</strong>
                <p>{caseRecord.status}</p>
              </div>
            </div>
            <div className="stack">
              <div>
                <strong>Judge</strong>
                <p>{caseRecord.judge ?? "Not listed"}</p>
              </div>
              <div>
                <strong>Next Date</strong>
                <p>{caseRecord.nextHearingAt ? formatDate(caseRecord.nextHearingAt) : "Verify in court record"}</p>
              </div>
            </div>
          </div>
          <div className="meta">
            {caseRecord.sourceIds.map((id) => {
              const source = sourceMap.get(id);
              if (!source) return null;
              return (
                <a className="pill" href={source.url} rel="noreferrer" target="_blank" key={id}>
                  {source.publisher}
                  <ExternalLink size={13} aria-hidden="true" />
                </a>
              );
            })}
          </div>
        </article>
      ))}
    </div>
  );
}
