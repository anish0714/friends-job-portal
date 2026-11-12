import { useState, type ChangeEvent } from "react";
import type { FriendInput } from "../store/types";

interface Props {
  initial?: FriendInput;
  onSave: (f: FriendInput) => void;
  onCancel: () => void;
}

const EMPTY: FriendInput = { name: "", headline: "", location: "", skills: "", notes: "", resume: "" };

export function FriendForm({ initial, onSave, onCancel }: Props) {
  const [f, setF] = useState<FriendInput>({ ...EMPTY, ...initial });
  const set = (k: keyof FriendInput) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF({ ...f, [k]: e.target.value });

  return (
    <form
      className="form"
      onSubmit={e => {
        e.preventDefault();
        if (f.name.trim()) onSave({ ...f, name: f.name.trim() });
      }}
    >
      <label>
        Name or nickname*
        <input value={f.name} onChange={set("name")} placeholder="e.g. Friend #2" required />
      </label>
      <label>
        Target role / headline
        <input value={f.headline} onChange={set("headline")} placeholder="e.g. Senior Java Developer" />
      </label>
      <label>
        Preferred location
        <input value={f.location} onChange={set("location")} placeholder="e.g. Toronto, ON or Remote" />
      </label>
      <label>
        Key skills
        <textarea rows={3} value={f.skills} onChange={set("skills")} placeholder="Comma-separated skills from their resume" />
      </label>
      <label>
        Resume (file name or link)
        <input value={f.resume} onChange={set("resume")} placeholder="e.g. resume-2026.pdf or https://…" />
      </label>
      <label>
        Notes
        <textarea rows={3} value={f.notes} onChange={set("notes")} placeholder="Preferences, salary floor, people to ask for referrals…" />
      </label>
      <div className="form-actions">
        <button type="button" className="btn ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn">
          Save friend
        </button>
      </div>
    </form>
  );
}
