import type { Friend } from "../store/types";
import { linkedInSearchUrl } from "../utils/linkedin";
import { fmtDate } from "./JobCard";

interface Props {
  friend: Friend;
  onEdit: () => void;
  onAddJob: () => void;
}

const isLink = (s: string) => /^https?:\/\//i.test(s);

export function FriendHeader({ friend, onEdit, onAddJob }: Props) {
  const skills = (friend.skills || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
  return (
    <header className="top">
      <div className="top-main">
        <h1>{friend.name}</h1>
        <p>
          {friend.headline || "No target role yet"}
          {friend.location ? ` · ${friend.location}` : ""}
        </p>
        {skills.length > 0 && (
          <ul className="skills" aria-label="Skills">
            {skills.map(s => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        )}
        {(friend.notes || friend.resume || friend.searchedOn) && (
          <div className="friend-notes">
            {friend.resume && (
              <div>
                <span className="lbl">Resume</span>
                {isLink(friend.resume) ? (
                  <a href={friend.resume} target="_blank" rel="noopener noreferrer">
                    {friend.resume}
                  </a>
                ) : (
                  friend.resume
                )}
              </div>
            )}
            {friend.searchedOn && (
              <div>
                <span className="lbl">Last searched</span>
                {fmtDate(friend.searchedOn)}
              </div>
            )}
            {friend.notes && (
              <div className="notes-text">
                <span className="lbl">Notes</span>
                {friend.notes}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="top-actions">
        <a className="btn ghost" href={linkedInSearchUrl(friend)} target="_blank" rel="noopener noreferrer">
          Search LinkedIn ↗
        </a>
        <button type="button" className="btn ghost" onClick={onEdit}>
          Edit profile
        </button>
        <button type="button" className="btn" onClick={onAddJob}>
          + Add job
        </button>
      </div>
    </header>
  );
}
