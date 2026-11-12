import { useRef } from "react";
import type { Friend } from "../store/types";

interface Props {
  friends: Friend[];
  activeId?: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onExport: () => void;
  onImportFile: (file: File) => void;
  onReset: () => void;
}

export function Sidebar({ friends, activeId, onSelect, onAdd, onExport, onImportFile, onReset }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <aside className="side">
      <div className="brand">
        <span aria-hidden="true">🤝</span> Friends Job Help
      </div>
      <p className="side-sub">Help your friends land their next role.</p>
      <nav aria-label="Friends">
        <ul className="friends">
          {friends.map(f => (
            <li key={f.id}>
              <button
                type="button"
                className={"friend" + (f.id === activeId ? " on" : "")}
                aria-current={f.id === activeId ? "true" : undefined}
                onClick={() => onSelect(f.id)}
              >
                <span className="avatar" aria-hidden="true">
                  {f.name.trim()[0]?.toUpperCase() || "?"}
                </span>
                <span className="fmeta">
                  <b>{f.name}</b>
                  <small>
                    {f.jobs.length} jobs · {f.jobs.filter(j => j.applied).length} applied
                  </small>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <button type="button" className="btn full" onClick={onAdd}>
        + Add a friend
      </button>

      <div className="data-tools">
        <span className="lbl">Data</span>
        <button type="button" className="btn ghost small" onClick={onExport}>
          Export JSON
        </button>
        <button type="button" className="btn ghost small" onClick={() => fileRef.current?.click()}>
          Import JSON / CSV
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".json,.csv,application/json,text/csv"
          className="sr-only"
          aria-label="Import JSON or CSV file"
          tabIndex={-1}
          onChange={e => {
            const file = e.target.files?.[0];
            if (file) onImportFile(file);
            e.target.value = "";
          }}
        />
        <button type="button" className="linkbtn" onClick={onReset}>
          Reset to sample data
        </button>
      </div>
    </aside>
  );
}
