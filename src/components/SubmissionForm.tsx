import { Send } from "lucide-react";
import { useState } from "react";

type FormState = "idle" | "submitting" | "success" | "error";

export default function SubmissionForm({ turnstileSiteKey }: { turnstileSiteKey?: string }) {
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");
  const [formStartedAt] = useState(() => new Date().toISOString());

  async function onSubmit(event: { preventDefault: () => void; currentTarget: HTMLFormElement }) {
    event.preventDefault();
    setState("submitting");
    setMessage("");

    const form = new FormData(event.currentTarget);
    const body = Object.fromEntries(form.entries());

    const response = await fetch("/api/submissions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body)
    });

    if (response.ok) {
      setState("success");
      setMessage("Added to feed for review.");
      event.currentTarget.reset();
    } else {
      const payload = await response.json().catch(() => ({ error: "Submission failed." })) as { error?: string };
      setState("error");
      setMessage(payload.error ?? "Submission failed.");
    }
  }

  return (
    <form className="panel" onSubmit={onSubmit}>
      <div className="panel-header">
        <h2>Add to Community Feed</h2>
      </div>
      <div className="panel-body stack">
        <label className="field">
          <span>Title</span>
          <input className="input" name="title" required minLength={4} maxLength={180} />
        </label>
        <label className="visually-hidden" aria-hidden="true">
          <span>Website</span>
          <input tabIndex={-1} autoComplete="off" name="website" />
        </label>
        <input type="hidden" name="formStartedAt" value={formStartedAt} />
        <label className="field">
          <span>Source URL</span>
          <input className="input" name="url" type="url" />
          <span style={{ fontSize: "0.85rem", opacity: 0.8, marginTop: "4px" }}>
            If you have photos, screenshots, or PDFs, please upload them to a file host (like Imgur or Google Drive) and paste the <b>public link</b> here.
          </span>
        </label>
        <label className="field">
          <span>Category</span>
          <select className="select" name="suggestedCategory" defaultValue="timeline">
            <option value="timeline">Timeline</option>
            <option value="document">Document</option>
            <option value="court-date">Court date</option>
            <option value="clip">Clip</option>
            <option value="correction">Correction</option>
          </select>
        </label>
        <label className="field">
          <span>Summary</span>
          <textarea className="textarea" name="summary" required minLength={20} maxLength={4000} />
        </label>
        <div className="split">
          <label className="field">
            <span>Name <i>(optional)</i></span>
            <input className="input" name="submitterName" maxLength={120} />
          </label>
          <label className="field">
            <span>Contact <i>(optional)</i></span>
            <input className="input" name="submitterContact" maxLength={240} />
          </label>
        </div>
        {turnstileSiteKey && <div className="cf-turnstile" data-sitekey={turnstileSiteKey}></div>}
        <div className="toolbar">
          <button className="button primary" type="submit" disabled={state === "submitting"}>
            <Send size={17} aria-hidden="true" />
            {state === "submitting" ? "Adding" : "Add to feed"}
          </button>
          {message && <span className={`pill ${state === "error" ? "disputed" : "verified"}`}>{message}</span>}
        </div>
      </div>
    </form>
  );
}
