import { SOURCES, type Job, type Match, type Source } from "../store/types";
import { jobSource } from "./source";

export type SortKey = "match" | "newest" | "company";

export interface Filters {
  query: string;
  matches: Record<Match, boolean>;
  source: Source | "All";
  sort: SortKey;
  hideApplied: boolean;
}

export const DEFAULT_FILTERS: Filters = {
  query: "",
  matches: { Strong: true, Good: true, Stretch: true },
  source: "All",
  sort: "match",
  hideApplied: false,
};

const ORDER: Record<Match, number> = { Strong: 0, Good: 1, Stretch: 2 };
const byNewest = (a: Job, b: Job) => (b.posted || "").localeCompare(a.posted || "");

export function filterSortJobs(jobs: Job[], f: Filters): Job[] {
  const q = f.query.trim().toLowerCase();
  return jobs
    .filter(j => f.matches[j.match])
    .filter(j => f.source === "All" || jobSource(j) === f.source)
    .filter(j => !f.hideApplied || !j.applied)
    .filter(j => !q || [j.title, j.company, j.location, j.fit, j.gaps, jobSource(j)].join(" ").toLowerCase().includes(q))
    .sort((a, b) => {
      if (f.sort === "newest") return byNewest(a, b);
      if (f.sort === "company") return a.company.localeCompare(b.company);
      return ORDER[a.match] - ORDER[b.match] || byNewest(a, b);
    });
}

/** Sources that appear in these jobs, with how many jobs each has, in the standard source order. */
export function sourceCounts(jobs: Job[]): { source: Source; count: number }[] {
  const counts = new Map<Source, number>();
  for (const j of jobs) counts.set(jobSource(j), (counts.get(jobSource(j)) ?? 0) + 1);
  return SOURCES.filter(s => counts.has(s)).map(source => ({ source, count: counts.get(source)! }));
}
