import { jobStatus } from "../store/reducer";
import { STATUSES, type Job } from "../store/types";

export function Stats({ jobs }: { jobs: Job[] }) {
  const count = (m: Job["match"]) => jobs.filter(j => j.match === m).length;
  return (
    <>
      <section className="stats" aria-label="Match summary">
        <div className="stat">
          <b>{jobs.length}</b>
          <span>Total matches</span>
        </div>
        <div className="stat">
          <b className="c-strong">{count("Strong")}</b>
          <span>Strong</span>
        </div>
        <div className="stat">
          <b className="c-good">{count("Good")}</b>
          <span>Good</span>
        </div>
        <div className="stat">
          <b className="c-stretch">{count("Stretch")}</b>
          <span>Stretch</span>
        </div>
        <div className="stat">
          <b>{jobs.filter(j => j.applied).length}</b>
          <span>Applied</span>
        </div>
      </section>
      <section className="pipeline" aria-label="Application pipeline">
        {STATUSES.map(s => (
          <div key={s} className={"pipe " + s}>
            <b>{jobs.filter(j => jobStatus(j) === s).length}</b> {s}
          </div>
        ))}
      </section>
    </>
  );
}
