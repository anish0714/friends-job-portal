import seed from "../data/seed-data.json";
import { normalizeJob, normalizeState } from "./reducer";
import type { AppState, Friend } from "./types";

export const STORE_KEY = "friends-job-portal-v1";

interface SeedFile {
  version?: number;
  friends: Friend[];
}

const SEED = seed as unknown as SeedFile;
/** Bump `version` in seed-data.json whenever new jobs are added, so returning visitors get them merged in. */
export const SEED_VERSION = SEED.version ?? 1;

type StoredState = AppState & { seedVersion?: number };

export function seedState(): AppState {
  const data = structuredClone(SEED);
  return normalizeState({ friends: data.friends, activeId: data.friends[0]?.id });
}

/**
 * Adds seed jobs the saved state doesn't have yet to the matching saved friends.
 * Saved jobs (and their statuses) are never changed or removed, and friends the user deleted are not restored.
 */
export function mergeSeed(saved: AppState, seedData: AppState = seedState()): AppState {
  const friends = saved.friends.map(f => {
    const fromSeed = seedData.friends.find(s => s.id === f.id);
    if (!fromSeed) return f;
    const have = new Set(f.jobs.map(j => j.id));
    const added = fromSeed.jobs.filter(j => !have.has(j.id)).map(normalizeJob);
    const searchedOn = [f.searchedOn, fromSeed.searchedOn].filter(Boolean).sort().pop();
    return added.length || searchedOn !== f.searchedOn ? { ...f, searchedOn, jobs: [...f.jobs, ...added] } : f;
  });
  return { ...saved, friends };
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StoredState;
      if (Array.isArray(parsed?.friends)) {
        const { seedVersion = 1, ...state } = parsed;
        const normalized = normalizeState(state);
        return seedVersion < SEED_VERSION ? mergeSeed(normalized) : normalized;
      }
    }
  } catch {
    /* fall through to seed */
  }
  return seedState();
}

export function saveState(state: AppState) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({ ...state, seedVersion: SEED_VERSION }));
  } catch {
    /* storage full or blocked: keep working in memory */
  }
}
