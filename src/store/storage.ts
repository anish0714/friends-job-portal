import seed from "../data/seed-data.json";
import { normalizeState } from "./reducer";
import type { AppState } from "./types";

export const STORE_KEY = "friends-job-portal-v1";

export function seedState(): AppState {
  const data = structuredClone(seed) as AppState;
  return normalizeState({ friends: data.friends, activeId: data.friends[0]?.id });
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      if (Array.isArray(parsed?.friends)) return normalizeState(parsed);
    }
  } catch {
    /* fall through to seed */
  }
  return seedState();
}

export function saveState(state: AppState) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch {
    /* storage full or blocked: keep working in memory */
  }
}
