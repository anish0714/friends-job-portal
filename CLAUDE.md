# Friends Job Help Portal: CLAUDE.md

This file sits at the root of the repo, and Claude Code reads it automatically.
The repo should also contain `seed-data.json` (seed data) and `prototype.html` (a working UI reference).
To start, ask Claude Code: **"Build this project as described in CLAUDE.md."**

---

## 1. What we're building

A small React web app for helping friends find jobs. One person (the helper) keeps a list of
friends who are job hunting. For each friend, the helper stores:

- a short profile: target role, location and key skills
- a list of job postings that fit them (mostly from LinkedIn), each rated **Strong / Good / Stretch**
  with notes on why it fits and what the gaps are
- whether the friend has applied

There's a working single-file prototype in `prototype.html`. It uses React from a CDN with
in-browser Babel. Open it in a browser to see the intended UI and behaviour. The task is to turn
it into a proper project.

Don't hard-code any real person's name. The seed friend is called **"Friend #1"**.

## 2. Tech stack

- **Vite + React 18 + TypeScript**
- Plain CSS, or CSS modules. Reuse the CSS variables and the light/dark theme from `prototype.html`.
  Don't add a UI library unless it's really needed.
- State lives in React with a small store (`useReducer` + context) and is saved to
  `localStorage` under the key `friends-job-portal-v1`.
- First run, or a reset: load `src/data/seed-data.json`.
- No backend in v1.
- Scripts: `npm run dev`, `npm run build`, `npm run preview`, `npm test` (Vitest + React Testing Library).

## 3. Data model

```ts
type Match = "Strong" | "Good" | "Stretch";

interface Job {
  id: string;           // LinkedIn job id, or a generated uid for manual jobs
  title: string;
  company: string;
  location?: string;
  posted?: string;      // ISO date, YYYY-MM-DD
  salary?: string | null;
  url?: string;         // posting link
  match: Match;
  fit?: string;         // why it fits
  gaps?: string;        // gaps / watch-outs
  applied: boolean;
  status?: "Saved" | "Applied" | "Interview" | "Offer" | "Rejected"; // v2, see below
}

interface Friend {
  id: string;
  name: string;         // nickname is fine
  headline?: string;    // target role
  location?: string;
  skills?: string;      // comma-separated
  searchedOn?: string;  // ISO date of the last job search
  jobs: Job[];
}

interface AppState { friends: Friend[]; activeId?: string; }
```

`seed-data.json` follows this shape. It has one friend and 51 real postings from LinkedIn and Indeed
(Toronto, GTA and Waterloo region, searched 2026-11-12). Bump the top-level `version` whenever jobs are added so returning visitors get them merged in.

## 4. Features (v1, matches the prototype)

**Layout**
- Left sidebar: app name "🤝 Friends Job Help" and a list of friends. Each entry shows an avatar
  initial, the name, "N jobs · M applied", and an "+ Add a friend" button.
- Main area, for the selected friend:
  - header: name, headline and location, plus skill chips
  - buttons: "Search LinkedIn ↗", "Edit profile", "+ Add job"
  - stat cards: Total, Strong, Good, Stretch, Applied
  - controls: free-text search over title, company, location, fit and gaps; Strong/Good/Stretch
    toggle chips; sort (best match → newest; newest; company A–Z); a "Hide applied" checkbox
  - job cards: the title links to the posting (opens in a new tab); company, location, posted date
    and salary; a match badge; a two-column "Why it fits" / "Gaps / watch-outs" section; an Applied
    checkbox; Remove and "View posting ↗" buttons
  - footer: "Showing X of Y", a note that data is stored in this browser only, and a
    "Remove this friend" link that asks for confirmation first
- Below 800px wide, the sidebar stacks above the main area.

**Modals**
- Add / edit friend: name (required), headline, location, skills.
- Add job: title and company (required), location, posted date (defaults to today), link, salary,
  match, fit, gaps.
- Remove friend confirmation.

**"Search LinkedIn" button** opens:
`https://www.linkedin.com/jobs/search/?keywords=<headline before the first "·">&location=<location>&f_TPR=r604800`

## 5. Improvements to add beyond the prototype

1. **Status pipeline** instead of a single Applied flag: Saved → Applied → Interview → Offer / Rejected.
   Show it as a dropdown on each card and add a count per status to the stats row.
2. **Import / export**: export all data as JSON (file download), and import a JSON or CSV file.
   CSV columns: `title, company, location, posted, salary, url, match, fit, gaps`.
3. **Paste a LinkedIn URL** in the Add-job modal and pull the job id out of `/jobs/view/<id>` so the
   link is normalised.
4. **Per-friend notes** (free text) and an optional resume file name/link field.
5. **Keyboard and accessibility**: modals close on Esc, focus is trapped inside a modal, and all
   inputs have labels. Aim for WCAG AA contrast in both themes.
6. **Tests**: reducer tests (add/edit/remove friend, add/remove/toggle job), plus one RTL test for
   filtering and search.

## 6. Optional v2 (only if asked)

- Backend (Supabase or Firebase) with sign-in, so the helper can share a friend's board with that
  friend.
- Job ingestion through an approved job-search API (for example Indeed's connector or another
  licensed source). **Do not scrape LinkedIn.** Keep it to manual entry and links.

## 7. Suggested file structure

```
src/
  main.tsx
  App.tsx
  styles.css
  data/seed-data.json
  store/{types.ts, reducer.ts, StoreProvider.tsx, storage.ts}
  components/{Sidebar.tsx, FriendHeader.tsx, Stats.tsx, Controls.tsx, JobCard.tsx, JobList.tsx,
              Modal.tsx, FriendForm.tsx, JobForm.tsx, ConfirmDialog.tsx}
  utils/{filterSort.ts, linkedin.ts, csv.ts}
  __tests__/...
```

## 8. Acceptance checklist

- [ ] `npm run dev` shows Friend #1 with 51 jobs: 12 Strong, 32 Good, 7 Stretch.
- [ ] Adding, editing and removing friends and jobs works and survives a page reload.
- [ ] Search, match chips, sort and "Hide applied" combine correctly.
- [ ] Light and dark themes both look right. The layout works at 375px wide.
- [ ] `npm run build` and `npm test` pass with no TypeScript errors.
- [ ] No real person's name appears anywhere in the code or data.
