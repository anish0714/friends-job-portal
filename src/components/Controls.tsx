import { MATCHES } from "../store/types";
import type { Filters, SortKey } from "../utils/filterSort";

interface Props {
  filters: Filters;
  onChange: (f: Filters) => void;
}

export function Controls({ filters, onChange }: Props) {
  const set = <K extends keyof Filters>(k: K, v: Filters[K]) => onChange({ ...filters, [k]: v });
  return (
    <section className="controls" aria-label="Filter jobs">
      <label className="sr-only" htmlFor="job-search">
        Search jobs
      </label>
      <input
        id="job-search"
        type="search"
        placeholder="Search title, company, skill (e.g. Azure, Hybris)…"
        value={filters.query}
        onChange={e => set("query", e.target.value)}
      />
      <div className="chips" role="group" aria-label="Match level">
        {MATCHES.map(m => (
          <button
            key={m}
            type="button"
            className={"chip" + (filters.matches[m] ? " on" : "")}
            aria-pressed={filters.matches[m]}
            onClick={() => set("matches", { ...filters.matches, [m]: !filters.matches[m] })}
          >
            {m}
          </button>
        ))}
      </div>
      <label className="sr-only" htmlFor="job-sort">
        Sort jobs
      </label>
      <select id="job-sort" value={filters.sort} onChange={e => set("sort", e.target.value as SortKey)}>
        <option value="match">Sort: best match</option>
        <option value="newest">Sort: newest</option>
        <option value="company">Sort: company A–Z</option>
      </select>
      <label className="toggle">
        <input type="checkbox" checked={filters.hideApplied} onChange={e => set("hideApplied", e.target.checked)} /> Hide applied
      </label>
    </section>
  );
}
