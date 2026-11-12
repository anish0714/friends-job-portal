import { SOURCES, type Job, type Source } from "../store/types";

const HOSTS: [RegExp, Source][] = [
  [/(^|\.)linkedin\.com$/, "LinkedIn"],
  [/(^|\.)indeed\.(com|ca)$/, "Indeed"],
  [/(^|\.)eluta\.ca$/, "Eluta"],
  [/(^|\.)glassdoor\.(com|ca)$/, "Glassdoor"],
  [/(^|\.)jobbank\.gc\.ca$/, "Job Bank"],
];

/** Recognises the job site from a posting link, e.g. linkedin.com → "LinkedIn". Unknown sites give undefined. */
export function detectSource(url?: string): Source | undefined {
  if (!url) return undefined;
  let host: string;
  try {
    host = new URL(url.trim()).hostname.toLowerCase();
  } catch {
    return undefined;
  }
  return HOSTS.find(([re]) => re.test(host))?.[1];
}

/** The job's source: the one saved on it, else detected from its link, else "Other". */
export function jobSource(job: Pick<Job, "source" | "url">): Source {
  return job.source ?? detectSource(job.url) ?? "Other";
}

/** Reads a source name typed by a person or in a CSV ("linkedin", "Job bank", …). */
export function parseSource(value: string): Source | undefined {
  const v = value.trim().toLowerCase().replace(/[\s.]+/g, "");
  if (!v) return undefined;
  return SOURCES.find(s => s.toLowerCase().replace(/[\s.]+/g, "") === v) ?? "Other";
}

/** CSS-safe class suffix, e.g. "Job Bank" → "job-bank". */
export const sourceClass = (s: Source) => s.toLowerCase().replace(/\s+/g, "-");
