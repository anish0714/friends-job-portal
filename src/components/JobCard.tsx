import { STATUSES, type Job, type Status } from "../store/types";
import { jobStatus } from "../store/reducer";
import { jobSource, sourceClass } from "../utils/source";

interface Props {
  job: Job;
  onStatus: (s: Status) => void;
  onRemove: () => void;
}

export function fmtDate(d?: string) {
  if (!d) return "";
  const date = new Date(d + "T12:00:00");
  return isNaN(date.getTime()) ? d : date.toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" });
}

export function JobCard({ job, onStatus, onRemove }: Props) {
  const status = jobStatus(job);
  const source = jobSource(job);
  const statusId = `status-${job.id}`;
  return (
    <article className={"job" + (job.applied ? " applied" : "")} aria-label={`${job.title} at ${job.company}`}>
      <div>
        <h3>
          {job.url ? (
            <a href={job.url} target="_blank" rel="noopener noreferrer">
              {job.title}
            </a>
          ) : (
            job.title
          )}
        </h3>
        <div className="meta">
          <span>
            <b>{job.company}</b>
          </span>
          {job.location && <span>📍 {job.location}</span>}
          {job.posted && <span>🗓 {fmtDate(job.posted)}</span>}
          {job.salary && <span className="sal">💰 {job.salary}</span>}
        </div>
      </div>
      <div className="tags">
        <span className={"badge " + job.match}>{job.match} match</span>
        <span className={"src src-" + sourceClass(source)} title={`Found on ${source}`}>
          <span className="sr-only">Source: </span>
          {source}
        </span>
      </div>
      {(job.fit || job.gaps) && (
        <div className="notes">
          <div className="fit">
            <span className="lbl">Why it fits</span>
            {job.fit || "—"}
          </div>
          <div className="gap">
            <span className="lbl">Gaps / watch-outs</span>
            {job.gaps || "—"}
          </div>
        </div>
      )}
      <div className="actions">
        <div className="status-field">
          <label htmlFor={statusId}>Status</label>
          <select id={statusId} className={"status " + status} value={status} onChange={e => onStatus(e.target.value as Status)}>
            {STATUSES.map(s => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="card-buttons">
          <button type="button" className="btn ghost small" onClick={onRemove} aria-label={`Remove ${job.title} at ${job.company}`}>
            Remove
          </button>
          {job.url && (
            <a className="btn small" href={job.url} target="_blank" rel="noopener noreferrer">
              View posting ↗
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
