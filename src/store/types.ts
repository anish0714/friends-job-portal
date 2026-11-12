export type Match = "Strong" | "Good" | "Stretch";
export const MATCHES: Match[] = ["Strong", "Good", "Stretch"];

export type Status = "Saved" | "Applied" | "Interview" | "Offer" | "Rejected";
export const STATUSES: Status[] = ["Saved", "Applied", "Interview", "Offer", "Rejected"];

export type Source = "LinkedIn" | "Indeed" | "Eluta" | "Glassdoor" | "Job Bank" | "Company site" | "Referral" | "Other";
export const SOURCES: Source[] = ["LinkedIn", "Indeed", "Eluta", "Glassdoor", "Job Bank", "Company site", "Referral", "Other"];

export interface Job {
  id: string; // LinkedIn job id, or a generated uid for manual jobs
  title: string;
  company: string;
  location?: string;
  posted?: string; // ISO date, YYYY-MM-DD
  salary?: string | null;
  url?: string;
  /** Where the posting was found. When missing, it is worked out from `url` (see utils/source.ts). */
  source?: Source;
  match: Match;
  fit?: string;
  gaps?: string;
  /** true once the friend has applied (any status other than "Saved"). Kept in sync with `status`. */
  applied: boolean;
  status?: Status;
}

export interface Friend {
  id: string;
  name: string;
  headline?: string;
  location?: string;
  skills?: string; // comma-separated
  searchedOn?: string;
  notes?: string;
  resume?: string; // file name or link
  jobs: Job[];
}

export interface AppState {
  friends: Friend[];
  activeId?: string;
}

export type FriendInput = Pick<Friend, "name" | "headline" | "location" | "skills" | "notes" | "resume">;
export type JobInput = Omit<Job, "id" | "applied" | "status"> & { id?: string; status?: Status };
