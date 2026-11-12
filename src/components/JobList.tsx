import type { Job, Status } from "../store/types";
import { JobCard } from "./JobCard";

interface Props {
  jobs: Job[];
  onStatus: (jobId: string, s: Status) => void;
  onRemove: (job: Job) => void;
}

export function JobList({ jobs, onStatus, onRemove }: Props) {
  return (
    <section className="list" aria-label="Jobs">
      {jobs.length === 0 ? (
        <div className="empty">No jobs here yet. Use “+ Add job” or “Search LinkedIn”.</div>
      ) : (
        jobs.map(j => <JobCard key={j.id} job={j} onStatus={s => onStatus(j.id, s)} onRemove={() => onRemove(j)} />)
      )}
    </section>
  );
}
