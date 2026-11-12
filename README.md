# Friends Job Help Portal

A React app for helping friends find jobs. You keep a profile for each friend, save job postings that
fit them (rated Strong / Good / Stretch, with notes on fit and gaps) and track each application
through Saved → Applied → Interview → Offer / Rejected.

The live site is linked in this repository's "About" panel (GitHub Pages).

Data is saved in each visitor's browser (localStorage). There's no backend, so nothing you enter
leaves your machine unless you export it.

## Features

- Sidebar of friends with job and applied counts; add, edit and remove friends
- Per-friend profile: target role, location, skills, resume name/link and free-text notes
- Job cards with match badge, fit and gap notes, status pipeline dropdown and posting link
- Search, Strong/Good/Stretch filter chips, sort and "Hide applied"
- Add a job by pasting a LinkedIn URL: the job id is pulled out and the link is normalised
- Export everything as JSON; import a JSON backup or a CSV of jobs
  (`title, company, location, posted, salary, url, match, fit, gaps`)
- Light and dark themes, keyboard-friendly modals (Esc to close, focus trapped), works at 375px wide

## Development

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # Vitest + React Testing Library
npm run build      # type-check and build to dist/
npm run preview    # serve the production build
```

Stack: Vite, React 18, TypeScript, plain CSS, `useReducer` + context store.

## Deployment

Every push to `main` runs `.github/workflows/deploy.yml`, which tests, builds and publishes `dist/`
to GitHub Pages. Pull requests run `.github/workflows/ci.yml`.

## Project files

- `CLAUDE.md`: the project brief
- `prototype.html`: the original single-file prototype used as the UI reference
- `src/data/seed-data.json`: sample data (1 friend, 51 LinkedIn and Indeed postings across Toronto, the GTA and Kitchener-Waterloo-Cambridge). Bump its `version` when adding jobs so returning visitors get the new ones merged into their saved data
