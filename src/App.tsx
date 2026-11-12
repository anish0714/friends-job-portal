import { useMemo, useState } from "react";
import { useStore } from "./store/StoreProvider";
import { seedState } from "./store/storage";
import type { AppState } from "./store/types";
import { DEFAULT_FILTERS, filterSortJobs, sourceCounts, type Filters } from "./utils/filterSort";
import { csvToJobs } from "./utils/csv";
import { Sidebar } from "./components/Sidebar";
import { FriendHeader } from "./components/FriendHeader";
import { Stats } from "./components/Stats";
import { Controls } from "./components/Controls";
import { JobList } from "./components/JobList";
import { Modal } from "./components/Modal";
import { FriendForm } from "./components/FriendForm";
import { JobForm } from "./components/JobForm";
import { ConfirmDialog } from "./components/ConfirmDialog";

type ModalState =
  | { kind: "addFriend" }
  | { kind: "editFriend" }
  | { kind: "addJob" }
  | { kind: "removeFriend" }
  | { kind: "reset" }
  | { kind: "importJson"; state: AppState; fileName: string }
  | null;

function downloadJson(data: unknown, fileName: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function App() {
  const { state, dispatch } = useStore();
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [modal, setModal] = useState<ModalState>(null);
  const [message, setMessage] = useState("");

  const friend = state.friends.find(f => f.id === state.activeId) ?? state.friends[0];
  const visible = useMemo(() => (friend ? filterSortJobs(friend.jobs, filters) : []), [friend, filters]);
  const close = () => setModal(null);

  async function importFile(file: File) {
    try {
      const text = await file.text();
      if (file.name.toLowerCase().endsWith(".csv")) {
        if (!friend) {
          setMessage("Add a friend first, then import a CSV of jobs for them.");
          return;
        }
        const jobs = csvToJobs(text);
        if (jobs.length === 0) {
          setMessage(`No jobs found in ${file.name}. Expected columns: title, company, location, posted, salary, url, match, fit, gaps (and optionally source).`);
          return;
        }
        dispatch({ type: "ADD_JOBS", friendId: friend.id, jobs });
        setMessage(`Imported ${jobs.length} job${jobs.length === 1 ? "" : "s"} for ${friend.name}.`);
      } else {
        const data = JSON.parse(text) as AppState;
        if (!Array.isArray(data?.friends)) throw new Error("missing friends array");
        setModal({ kind: "importJson", state: data, fileName: file.name });
      }
    } catch {
      setMessage(`Couldn't read ${file.name}. Use a JSON export from this app or a CSV file.`);
    }
  }

  return (
    <div className="shell">
      <Sidebar
        friends={state.friends}
        activeId={friend?.id}
        onSelect={id => dispatch({ type: "SELECT_FRIEND", id })}
        onAdd={() => setModal({ kind: "addFriend" })}
        onExport={() => downloadJson(state, `friends-job-portal-${new Date().toLocaleDateString("en-CA")}.json`)}
        onImportFile={importFile}
        onReset={() => setModal({ kind: "reset" })}
      />

      <main className="wrap">
        {message && (
          <div className="notice" role="status">
            <span>{message}</span>
            <button type="button" className="x small" aria-label="Dismiss message" onClick={() => setMessage("")}>
              ×
            </button>
          </div>
        )}
        {!friend ? (
          <div className="empty">Add a friend to start tracking jobs for them.</div>
        ) : (
          <>
            <FriendHeader friend={friend} onEdit={() => setModal({ kind: "editFriend" })} onAddJob={() => setModal({ kind: "addJob" })} />
            <Stats jobs={friend.jobs} />
            <Controls filters={filters} onChange={setFilters} sources={sourceCounts(friend.jobs)} />
            <JobList
              jobs={visible}
              onStatus={(jobId, status) => dispatch({ type: "SET_STATUS", friendId: friend.id, jobId, status })}
              onRemove={job => dispatch({ type: "REMOVE_JOB", friendId: friend.id, jobId: job.id })}
            />
            <footer>
              Showing {visible.length} of {friend.jobs.length}. Data is saved in this browser only. Postings may close, so check each link
              before applying.{" "}
              <button type="button" className="linkbtn" onClick={() => setModal({ kind: "removeFriend" })}>
                Remove this friend
              </button>
            </footer>
          </>
        )}
      </main>

      {modal?.kind === "addFriend" && (
        <Modal title="Add a friend" onClose={close}>
          <FriendForm
            onCancel={close}
            onSave={f => {
              dispatch({ type: "ADD_FRIEND", friend: f });
              close();
            }}
          />
        </Modal>
      )}
      {modal?.kind === "editFriend" && friend && (
        <Modal title="Edit profile" onClose={close}>
          <FriendForm
            initial={friend}
            onCancel={close}
            onSave={f => {
              dispatch({ type: "EDIT_FRIEND", id: friend.id, patch: f });
              close();
            }}
          />
        </Modal>
      )}
      {modal?.kind === "addJob" && friend && (
        <Modal title={`Add a job for ${friend.name}`} onClose={close}>
          <JobForm
            onCancel={close}
            onSave={job => {
              dispatch({ type: "ADD_JOB", friendId: friend.id, job });
              close();
            }}
          />
        </Modal>
      )}
      {modal?.kind === "removeFriend" && friend && (
        <ConfirmDialog
          title={`Remove ${friend.name}?`}
          onCancel={close}
          onConfirm={() => {
            dispatch({ type: "REMOVE_FRIEND", id: friend.id });
            close();
          }}
        >
          <p>This deletes their profile and all {friend.jobs.length} saved jobs from this browser.</p>
        </ConfirmDialog>
      )}
      {modal?.kind === "reset" && (
        <ConfirmDialog
          title="Reset to sample data?"
          confirmLabel="Reset"
          onCancel={close}
          onConfirm={() => {
            dispatch({ type: "REPLACE_STATE", state: seedState() });
            setMessage("Data reset to the sample friend.");
            close();
          }}
        >
          <p>This replaces every friend and job in this browser with the sample data. Export first if you want a backup.</p>
        </ConfirmDialog>
      )}
      {modal?.kind === "importJson" && (
        <ConfirmDialog
          title="Replace all data?"
          confirmLabel="Import"
          onCancel={close}
          onConfirm={() => {
            dispatch({ type: "REPLACE_STATE", state: modal.state });
            setMessage(`Imported ${modal.state.friends.length} friend(s) from ${modal.fileName}.`);
            close();
          }}
        >
          <p>
            {modal.fileName} has {modal.state.friends.length} friend(s). Importing replaces everything currently saved in this browser.
          </p>
        </ConfirmDialog>
      )}
    </div>
  );
}
