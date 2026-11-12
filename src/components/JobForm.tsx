import { useState, type ChangeEvent } from "react";
import { MATCHES, type JobInput, type Match } from "../store/types";
import { extractLinkedInJobId, linkedInJobUrl } from "../utils/linkedin";

interface Props {
  onSave: (j: JobInput) => void;
  onCancel: () => void;
}

const today = () => new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD in local time

export function JobForm({ onSave, onCancel }: Props) {
  const [j, setJ] = useState({
    title: "",
    company: "",
    location: "",
    url: "",
    salary: "",
    match: "Good" as Match,
    fit: "",
    gaps: "",
    posted: today(),
  });
  const set = (k: keyof typeof j) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setJ({ ...j, [k]: e.target.value });

  const linkedInId = extractLinkedInJobId(j.url);

  return (
    <form
      className="form"
      onSubmit={e => {
        e.preventDefault();
        if (!j.title.trim() || !j.company.trim()) return;
        onSave({
          id: linkedInId ?? undefined,
          title: j.title.trim(),
          company: j.company.trim(),
          location: j.location.trim() || undefined,
          posted: j.posted || undefined,
          url: linkedInId ? linkedInJobUrl(linkedInId) : j.url.trim() || undefined,
          salary: j.salary.trim() || null,
          match: j.match,
          fit: j.fit.trim() || undefined,
          gaps: j.gaps.trim() || undefined,
        });
      }}
    >
      <div className="field">
        <label>
          Job link
          <input
            type="url"
            value={j.url}
            onChange={set("url")}
            onBlur={() => linkedInId && setJ(s => ({ ...s, url: linkedInJobUrl(linkedInId) }))}
            placeholder="Paste a LinkedIn job URL: https://www.linkedin.com/jobs/view/…"
            aria-describedby="job-link-hint"
          />
        </label>
        <small id="job-link-hint" className="hint" aria-live="polite">
          {linkedInId ? `LinkedIn job #${linkedInId}, saved as /jobs/view/${linkedInId}` : "LinkedIn links are tidied up automatically."}
        </small>
      </div>
      <div className="row2">
        <label>
          Job title*
          <input value={j.title} onChange={set("title")} required />
        </label>
        <label>
          Company*
          <input value={j.company} onChange={set("company")} required />
        </label>
      </div>
      <div className="row2">
        <label>
          Location
          <input value={j.location} onChange={set("location")} />
        </label>
        <label>
          Posted
          <input type="date" value={j.posted} onChange={set("posted")} />
        </label>
      </div>
      <div className="row2">
        <label>
          Salary
          <input value={j.salary} onChange={set("salary")} />
        </label>
        <label>
          Match
          <select value={j.match} onChange={set("match")}>
            {MATCHES.map(m => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </label>
      </div>
      <label>
        Why it fits
        <textarea rows={2} value={j.fit} onChange={set("fit")} />
      </label>
      <label>
        Gaps / watch-outs
        <textarea rows={2} value={j.gaps} onChange={set("gaps")} />
      </label>
      <div className="form-actions">
        <button type="button" className="btn ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn">
          Add job
        </button>
      </div>
    </form>
  );
}
