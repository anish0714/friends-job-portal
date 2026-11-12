import type { JobInput, Match } from "../store/types";
import { extractLinkedInJobId, normalizeJobUrl } from "./linkedin";

export const CSV_COLUMNS = ["title", "company", "location", "posted", "salary", "url", "match", "fit", "gaps"] as const;

/** Minimal RFC 4180 parser: quoted fields, escaped quotes, commas and newlines inside quotes. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  const src = text.replace(/^﻿/, "");
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && src[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += c;
  }
  if (field !== "" || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter(r => r.some(cell => cell.trim() !== ""));
}

const toMatch = (v: string): Match => {
  const m = v.trim().toLowerCase();
  return m === "strong" ? "Strong" : m === "stretch" ? "Stretch" : "Good";
};

/** Converts CSV text (with a header row) into jobs. Rows without a title and company are skipped. */
export function csvToJobs(text: string): JobInput[] {
  const [header, ...rows] = parseCsv(text);
  if (!header) return [];
  const idx = header.map(h => h.trim().toLowerCase());
  const col = (row: string[], name: string) => {
    const i = idx.indexOf(name);
    return i >= 0 ? (row[i] ?? "").trim() : "";
  };
  return rows
    .map(row => {
      const url = col(row, "url");
      return {
        id: extractLinkedInJobId(url) ?? undefined,
        title: col(row, "title"),
        company: col(row, "company"),
        location: col(row, "location") || undefined,
        posted: col(row, "posted") || undefined,
        salary: col(row, "salary") || null,
        url: url ? normalizeJobUrl(url) : undefined,
        match: toMatch(col(row, "match")),
        fit: col(row, "fit") || undefined,
        gaps: col(row, "gaps") || undefined,
      };
    })
    .filter(j => j.title && j.company);
}
