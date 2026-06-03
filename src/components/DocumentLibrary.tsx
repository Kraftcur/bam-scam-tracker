import { ExternalLink, FileText, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { formatDate } from "../lib/format";
import type { CaseRecord, DocumentRecord, Source } from "../types";
import { Badge } from "./Badge";

type Props = {
  documents: DocumentRecord[];
  sources: Source[];
  cases: CaseRecord[];
};

export default function DocumentLibrary({ documents, sources, cases }: Props) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const sourceMap = useMemo(() => new Map(sources.map((source) => [source.id, source])), [sources]);
  const caseMap = useMemo(() => new Map(cases.map((item) => [item.id, item])), [cases]);
  const types = useMemo(() => Array.from(new Set(documents.map((doc) => doc.documentType))).sort(), [documents]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return documents.filter((doc) => {
      const source = sourceMap.get(doc.sourceId);
      const caseRecord = doc.caseId ? caseMap.get(doc.caseId) : undefined;
      const haystack = [doc.title, doc.documentType, doc.status, source?.title, caseRecord?.caseNumber]
        .join(" ")
        .toLowerCase();
      return (
        (!term || haystack.includes(term)) &&
        (type === "all" || doc.documentType === type) &&
        (status === "all" || doc.status === status)
      );
    });
  }, [caseMap, documents, query, sourceMap, status, type]);

  return (
    <section>
      <div className="filters" aria-label="Document filters">
        <label className="field">
          <span>
            <Search size={14} aria-hidden="true" /> Search
          </span>
          <input className="input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="case, filing, statement" />
        </label>
        <label className="field">
          <span>
            <FileText size={14} aria-hidden="true" /> Type
          </span>
          <select className="select" value={type} onChange={(event) => setType(event.target.value)}>
            <option value="all">All types</option>
            {types.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Status</span>
          <select className="select" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="all">All statuses</option>
            {Array.from(new Set(documents.map((doc) => doc.status))).map((item) => (
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
              <th>Document</th>
              <th>Case</th>
              <th>Source</th>
              <th>Status</th>
              <th>Link</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((doc) => {
              const source = sourceMap.get(doc.sourceId);
              const caseRecord = doc.caseId ? caseMap.get(doc.caseId) : undefined;
              return (
                <tr key={doc.id}>
                  <td>
                    <strong>{doc.title}</strong>
                    <div className="meta">
                      <span>{doc.documentType}</span>
                      <span>{doc.fileType.toUpperCase()}</span>
                      {doc.datePublished && <span>{formatDate(doc.datePublished)}</span>}
                    </div>
                  </td>
                  <td>{caseRecord ? caseRecord.caseNumber : "None"}</td>
                  <td>{source?.publisher ?? "Unknown"}</td>
                  <td>
                    <div className="meta">
                      <Badge value={doc.status} />
                      <Badge value={doc.redactionStatus} />
                    </div>
                  </td>
                  <td>
                    <a className="icon-button" href={doc.externalUrl} rel="noreferrer" target="_blank" title="Open source">
                      <ExternalLink size={18} aria-hidden="true" />
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {filtered.length === 0 && <div className="empty">No matching documents.</div>}
    </section>
  );
}
