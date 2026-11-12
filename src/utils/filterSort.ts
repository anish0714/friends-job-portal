import type { Job, Match } from "../store/types";

export type SortKey = "match" | "newest" | "company";

export interface Filters {
  query: string;
  matches: Record<Match, boolean>;
  sort: SortKey;
  hideApplied: boolean;
}

export const DEFAULT_FILTERS: Filters = {
  query: "",
  matches: { Strong: true, Good: true, Stretch: true },
  sort: "match",
  hideApplied: false,
};

const ORDER: Record<Match, number> = { Strong: 0, Good: 1, Stretch: 2 };
const byNewest = (a: Job, b: Job) => (b.posted || "").localeCompare(a.posted || "");

export function filterSortJobs(jobs: Job[], f: Filters): Job[] {
  const q = f.query.trim().toLowerCase();
  return jobs
    .filter(j => f.matches[j.match])
    .filter(j => !f.hideApplied || !j.applied)
    .filter(j => !q || [j.title, j.company, j.location, j.fit, j.gaps].join(" ").toLowerCase().includes(q))
    .sort((a, b) => {
      if (f.sort === "newest") return byNewest(a, b);
      if (f.sort === "company") return a.company.localeCompare(b.company);
      return ORDER[a.match] - ORDER[b.match] || byNewest(a, b);
    });
}
