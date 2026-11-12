import { describe, expect, it } from "vitest";
import { reducer } from "../store/reducer";
import { loadState, mergeSeed, saveState, seedState, SEED_VERSION, STORE_KEY } from "../store/storage";
import type { AppState } from "../store/types";

describe("seed merge for returning visitors", () => {
  it("adds new seed jobs without touching saved jobs or statuses", () => {
    const seed = seedState();
    const saved: AppState = {
      ...seed,
      friends: seed.friends.map(f => ({
        ...f,
        searchedOn: "2026-01-01",
        jobs: f.jobs.slice(0, 5).map((j, i) => (i === 0 ? { ...j, status: "Interview" as const, applied: true } : j)),
      })),
    };
    const merged = mergeSeed(saved, seed);
    const jobs = merged.friends[0].jobs;
    expect(jobs).toHaveLength(seed.friends[0].jobs.length);
    expect(jobs[0]).toMatchObject({ status: "Interview", applied: true });
    expect(merged.friends[0].searchedOn).toBe(seed.friends[0].searchedOn);
  });

  it("fills in a missing salary but keeps a salary the user saved", () => {
    const seed = seedState();
    const withSalary = seed.friends[0].jobs.filter(j => j.salary).slice(0, 2);
    expect(withSalary).toHaveLength(2);
    const saved: AppState = {
      friends: [
        {
          ...seed.friends[0],
          jobs: [
            { ...withSalary[0], salary: null },
            { ...withSalary[1], salary: "$1 (my note)" },
          ],
        },
      ],
    };
    const jobs = mergeSeed(saved, seed).friends[0].jobs;
    expect(jobs[0].salary).toBe(withSalary[0].salary);
    expect(jobs[1].salary).toBe("$1 (my note)");
  });

  it("does not bring back a friend the user removed", () => {
    expect(mergeSeed({ friends: [] }).friends).toEqual([]);
  });

  it("merges on load only when the saved seed version is older", () => {
    const seed = seedState();
    const trimmed = { ...seed, friends: seed.friends.map(f => ({ ...f, jobs: f.jobs.slice(0, 3) })) };
    localStorage.setItem(STORE_KEY, JSON.stringify({ ...trimmed, seedVersion: SEED_VERSION - 1 }));
    expect(loadState().friends[0].jobs).toHaveLength(seed.friends[0].jobs.length);

    saveState(trimmed);
    expect(loadState().friends[0].jobs).toHaveLength(3);
  });
});

const empty: AppState = { friends: [] };

function withFriend(): AppState {
  return reducer(empty, { type: "ADD_FRIEND", id: "f1", friend: { name: "Friend #2", headline: "Designer" } });
}

describe("reducer: friends", () => {
  it("adds a friend and selects them", () => {
    const s = withFriend();
    expect(s.friends).toHaveLength(1);
    expect(s.friends[0]).toMatchObject({ id: "f1", name: "Friend #2", jobs: [] });
    expect(s.activeId).toBe("f1");
  });

  it("edits a friend", () => {
    const s = reducer(withFriend(), { type: "EDIT_FRIEND", id: "f1", patch: { location: "Remote", notes: "Prefers startups" } });
    expect(s.friends[0]).toMatchObject({ name: "Friend #2", location: "Remote", notes: "Prefers startups" });
  });

  it("removes a friend and moves selection to the next one", () => {
    let s = withFriend();
    s = reducer(s, { type: "ADD_FRIEND", id: "f2", friend: { name: "Friend #3" } });
    s = reducer(s, { type: "REMOVE_FRIEND", id: "f2" });
    expect(s.friends.map(f => f.id)).toEqual(["f1"]);
    expect(s.activeId).toBe("f1");
    s = reducer(s, { type: "REMOVE_FRIEND", id: "f1" });
    expect(s.friends).toEqual([]);
    expect(s.activeId).toBeUndefined();
  });
});

describe("reducer: jobs", () => {
  const add = (s: AppState) =>
    reducer(s, { type: "ADD_JOB", friendId: "f1", job: { id: "123456789", title: "Designer", company: "Acme", match: "Strong" } });

  it("adds a job as Saved and not applied", () => {
    const s = add(withFriend());
    expect(s.friends[0].jobs[0]).toMatchObject({ id: "123456789", title: "Designer", applied: false, status: "Saved" });
  });

  it("gives duplicate ids a fresh uid", () => {
    const s = add(add(withFriend()));
    const ids = s.friends[0].jobs.map(j => j.id);
    expect(ids).toHaveLength(2);
    expect(new Set(ids).size).toBe(2);
  });

  it("removes a job", () => {
    const s = reducer(add(withFriend()), { type: "REMOVE_JOB", friendId: "f1", jobId: "123456789" });
    expect(s.friends[0].jobs).toEqual([]);
  });

  it("toggles applied and keeps status in sync", () => {
    let s = reducer(add(withFriend()), { type: "TOGGLE_APPLIED", friendId: "f1", jobId: "123456789" });
    expect(s.friends[0].jobs[0]).toMatchObject({ applied: true, status: "Applied" });
    s = reducer(s, { type: "TOGGLE_APPLIED", friendId: "f1", jobId: "123456789" });
    expect(s.friends[0].jobs[0]).toMatchObject({ applied: false, status: "Saved" });
  });

  it("sets a pipeline status", () => {
    const s = reducer(add(withFriend()), { type: "SET_STATUS", friendId: "f1", jobId: "123456789", status: "Interview" });
    expect(s.friends[0].jobs[0]).toMatchObject({ applied: true, status: "Interview" });
  });
});

describe("seed data", () => {
  it("has Friend #1 with 61 jobs: 12 Strong, 41 Good, 8 Stretch", () => {
    const s = seedState();
    expect(s.friends[0].name).toBe("Friend #1");
    const jobs = s.friends[0].jobs;
    expect(jobs).toHaveLength(61);
    expect(jobs.filter(j => j.match === "Strong")).toHaveLength(12);
    expect(jobs.filter(j => j.match === "Good")).toHaveLength(41);
    expect(jobs.filter(j => j.match === "Stretch")).toHaveLength(8);
    expect(jobs.every(j => j.status === "Saved")).toBe(true);
  });
});
