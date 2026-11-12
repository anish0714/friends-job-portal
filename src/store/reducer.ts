import type { AppState, Friend, FriendInput, Job, JobInput, Status } from "./types";

export const uid = () => Math.random().toString(36).slice(2, 10);

export type Action =
  | { type: "ADD_FRIEND"; friend: FriendInput; id?: string }
  | { type: "EDIT_FRIEND"; id: string; patch: Partial<FriendInput> }
  | { type: "REMOVE_FRIEND"; id: string }
  | { type: "SELECT_FRIEND"; id: string }
  | { type: "ADD_JOB"; friendId: string; job: JobInput }
  | { type: "ADD_JOBS"; friendId: string; jobs: JobInput[] }
  | { type: "REMOVE_JOB"; friendId: string; jobId: string }
  | { type: "TOGGLE_APPLIED"; friendId: string; jobId: string }
  | { type: "SET_STATUS"; friendId: string; jobId: string; status: Status }
  | { type: "REPLACE_STATE"; state: AppState };

/** Status is the source of truth; `applied` mirrors it for backwards compatibility. */
export function jobStatus(job: Pick<Job, "status" | "applied">): Status {
  return job.status ?? (job.applied ? "Applied" : "Saved");
}

export function normalizeJob(job: Partial<Job> & Pick<Job, "title" | "company">): Job {
  const status = jobStatus({ status: job.status, applied: !!job.applied });
  return {
    ...job,
    id: job.id || uid(),
    match: job.match ?? "Good",
    status,
    applied: status !== "Saved",
  } as Job;
}

export function normalizeState(state: AppState): AppState {
  const friends = (state.friends ?? []).map(f => ({ ...f, jobs: (f.jobs ?? []).map(normalizeJob) }));
  const activeId = friends.some(f => f.id === state.activeId) ? state.activeId : friends[0]?.id;
  return { friends, activeId };
}

function mapFriend(state: AppState, id: string, fn: (f: Friend) => Friend): AppState {
  return { ...state, friends: state.friends.map(f => (f.id === id ? fn(f) : f)) };
}

function mapJob(state: AppState, friendId: string, jobId: string, fn: (j: Job) => Job): AppState {
  return mapFriend(state, friendId, f => ({ ...f, jobs: f.jobs.map(j => (j.id === jobId ? fn(j) : j)) }));
}

function addJobs(f: Friend, inputs: JobInput[]): Friend {
  const taken = new Set(f.jobs.map(j => j.id));
  const jobs = inputs.map(input => {
    let id = input.id && !taken.has(input.id) ? input.id : uid();
    while (taken.has(id)) id = uid();
    taken.add(id);
    return normalizeJob({ ...input, id });
  });
  return { ...f, jobs: [...f.jobs, ...jobs] };
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "ADD_FRIEND": {
      const id = action.id ?? "friend-" + uid();
      return { friends: [...state.friends, { ...action.friend, id, jobs: [] }], activeId: id };
    }
    case "EDIT_FRIEND":
      return mapFriend(state, action.id, f => ({ ...f, ...action.patch }));
    case "REMOVE_FRIEND": {
      const friends = state.friends.filter(f => f.id !== action.id);
      const activeId = state.activeId === action.id ? friends[0]?.id : state.activeId;
      return { friends, activeId };
    }
    case "SELECT_FRIEND":
      return { ...state, activeId: action.id };
    case "ADD_JOB":
      return mapFriend(state, action.friendId, f => addJobs(f, [action.job]));
    case "ADD_JOBS":
      return mapFriend(state, action.friendId, f => addJobs(f, action.jobs));
    case "REMOVE_JOB":
      return mapFriend(state, action.friendId, f => ({ ...f, jobs: f.jobs.filter(j => j.id !== action.jobId) }));
    case "TOGGLE_APPLIED":
      return mapJob(state, action.friendId, action.jobId, j => {
        const applied = !j.applied;
        return { ...j, applied, status: applied ? "Applied" : "Saved" };
      });
    case "SET_STATUS":
      return mapJob(state, action.friendId, action.jobId, j => ({
        ...j,
        status: action.status,
        applied: action.status !== "Saved",
      }));
    case "REPLACE_STATE":
      return normalizeState(action.state);
    default:
      return state;
  }
}
