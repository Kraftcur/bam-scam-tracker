import { Check, X } from "lucide-react";
import { useState } from "react";
import { formatDateTime } from "../lib/format";
import type { SubmissionRecord } from "../types";
import { Badge } from "./Badge";

type Props = {
  submissions: SubmissionRecord[];
};

export default function AdminReview({ submissions }: Props) {
  const [token, setToken] = useState("");
  const [items, setItems] = useState(submissions);
  const [message, setMessage] = useState("");

  async function review(id: string, moderationStatus: "approved" | "rejected") {
    setMessage("");
    const response = await fetch("/api/admin/review", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-admin-token": token
      },
      body: JSON.stringify({ id, moderationStatus })
    });

    if (!response.ok) {
      setMessage("Review failed. Check token and D1 binding.");
      return;
    }
    setItems((current) => current.map((item) => (item.id === id ? { ...item, moderationStatus } : item)));
    setMessage(`Marked ${moderationStatus}.`);
  }

  return (
    <section className="stack">
      <div className="panel">
        <div className="panel-header">
          <h2>Review Queue</h2>
        </div>
        <div className="panel-body">
          <label className="field">
            <span>Admin token</span>
            <input className="input" type="password" value={token} onChange={(event) => setToken(event.target.value)} />
          </label>
          {message && <p className="notice">{message}</p>}
        </div>
      </div>
      <div className="list">
        {items.map((item) => (
          <article className="row-card" key={item.id}>
            <div className="row-top">
              <div className="stack">
                <div className="meta">
                  <Badge value={item.moderationStatus} />
                  <span>{formatDateTime(item.createdAt)}</span>
                  <span>{item.suggestedCategory}</span>
                </div>
                <h3>{item.title}</h3>
              </div>
              <div className="toolbar">
                <button className="icon-button" type="button" title="Approve" onClick={() => review(item.id, "approved")}>
                  <Check size={18} aria-hidden="true" />
                </button>
                <button className="icon-button" type="button" title="Reject" onClick={() => review(item.id, "rejected")}>
                  <X size={18} aria-hidden="true" />
                </button>
              </div>
            </div>
            <p>{item.summary}</p>
            <div className="meta">
              {item.url && (
                <a className="pill" href={item.url} rel="noreferrer" target="_blank">
                  Source
                </a>
              )}
              {item.submitterName && <span className="pill">{item.submitterName}</span>}
            </div>
          </article>
        ))}
        {items.length === 0 && <div className="empty">No submissions yet.</div>}
      </div>
    </section>
  );
}
