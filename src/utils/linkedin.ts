import type { Friend } from "../store/types";

/** Pulls the numeric job id out of a LinkedIn job URL (`/jobs/view/<id>` or `?currentJobId=<id>`). */
export function extractLinkedInJobId(input: string): string | null {
  const s = input.trim();
  if (!/linkedin\.com/i.test(s)) return null;
  const view = s.match(/\/jobs\/view\/(?:[^/?#]*?-)?(\d{6,})/i);
  if (view) return view[1];
  const param = s.match(/[?&]currentJobId=(\d{6,})/i);
  return param ? param[1] : null;
}

export const linkedInJobUrl = (id: string) => `https://www.linkedin.com/jobs/view/${id}`;

/** Returns a clean `https://www.linkedin.com/jobs/view/<id>` link for LinkedIn URLs, otherwise the trimmed input. */
export function normalizeJobUrl(input: string): string {
  const id = extractLinkedInJobId(input);
  return id ? linkedInJobUrl(id) : input.trim();
}

export function linkedInSearchUrl(friend: Pick<Friend, "headline" | "location">): string {
  const keywords = (friend.headline || "").split("·")[0].trim();
  return (
    "https://www.linkedin.com/jobs/search/?keywords=" +
    encodeURIComponent(keywords) +
    "&location=" +
    encodeURIComponent(friend.location || "") +
    "&f_TPR=r604800"
  );
}
