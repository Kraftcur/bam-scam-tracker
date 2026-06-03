import { ExternalLink, Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { ClaimRecord, DocumentRecord, Source } from "../types";
import { Badge } from "./Badge";

type Props = {
  claims: ClaimRecord[];
  documents: DocumentRecord[];
  sources: Source[];
};

export default function ClaimsMatrix({ claims, documents, sources }: Props) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const docMap = useMemo(() => new Map(documents.map((doc) => [doc.id, doc])), [documents]);
  const sourceMap = useMemo(() => new Map(sources.map((source) => [source.id, source])), [sources]);
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return claims.filter((claim) => {
      const haystack = [claim.claimant, claim.claimText, claim.editorNote, claim.status].join(" ").toLowerCase();
      return (!term || haystack.includes(term)) && (status === "all" || claim.status === status);
    });
  }, [claims, query, status]);

  return (
    <section>
      <div className="filters">
        <label className="field">
          <span>
            <Search size={14} aria-hidden="true" /> Search
          </span>
          <input className="input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="claimant, topic, evidence" />
        </label>
        <label className="field">
          <span>Status</span>
          <select className="select" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="all">All statuses</option>
            {Array.from(new Set(claims.map((claim) => claim.status))).map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Claim</th>
              <th>Status</th>
              <th>Evidence</th>
              <th>Editor Note</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((claim) => (
              <tr key={claim.id}>
                <td>
                  <strong>{claim.claimant}</strong>
                  <p>{claim.claimText}</p>
                </td>
                <td>
                  <div className="meta">
                    <Badge value={claim.status} />
                    <Badge value={`${claim.confidence}-confidence`} />
                  </div>
                </td>
                <td>
                  <div className="meta">
                    {claim.relatedEvidenceIds.map((id) => {
                      const doc = docMap.get(id);
                      return doc ? <span className="pill" key={id}>{doc.title}</span> : null;
                    })}
                    {claim.relatedSourceIds.map((id) => {
                      const source = sourceMap.get(id);
                      return source ? (
                        <a className="pill" href={source.url} rel="noreferrer" target="_blank" key={id}>
                          {source.publisher}
                          <ExternalLink size={13} aria-hidden="true" />
                        </a>
                      ) : null;
                    })}
                  </div>
                </td>
                <td>{claim.editorNote}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filtered.length === 0 && <div className="empty">No matching claims.</div>}
    </section>
  );
}
