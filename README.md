# Friends Job Help Portal

A React app for helping friends find jobs. You keep a profile for each friend, save job postings that
fit them (rated Strong / Good / Stretch, with notes on fit and gaps) and track their applications.

## Getting started with Claude Code

1. Create an empty GitHub repo, for example `friends-job-portal`.
2. Add these three files to the repo root and push:
   - `CLAUDE.md`: the project brief that Claude Code reads automatically
   - `seed-data.json`: starter data (1 friend, 30 Toronto-area LinkedIn postings)
   - `prototype.html`: a working single-file prototype to use as a UI reference
3. Open the repo in Claude Code and say: **"Build this project as described in CLAUDE.md."**
4. Run it with `npm install && npm run dev`.

The data is saved in each user's browser (localStorage). There's no backend yet.
