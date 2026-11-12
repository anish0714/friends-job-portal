import { describe, expect, it } from "vitest";
import { reducer } from "../store/reducer";
import { seedState } from "../store/storage";
import type { AppState } from "../store/types";

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
  it("has Friend #1 with 30 jobs: 10 Strong, 15 Good, 5 Stretch", () => {
    const s = seedState();
    expect(s.friends[0].name).toBe("Friend #1");
    const jobs = s.friends[0].jobs;
    expect(jobs).toHaveLength(30);
    expect(jobs.filter(j => j.match === "Strong")).toHaveLength(10);
    expect(jobs.filter(j => j.match === "Good")).toHaveLength(15);
    expect(jobs.filter(j => j.match === "Stretch")).toHaveLength(5);
    expect(jobs.every(j => j.status === "Saved")).toBe(true);
  });
});
