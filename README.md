# The Date Crew — Matchmaker Dashboard MVP

An internal tool prototype for TDC matchmakers to manage clients, view verified profiles,
get gender-specific AI-scored match suggestions, and log notes from calls/meetings.

Built for the Full Stack Developer Internship assignment.

## Demo login

- **URL:** _[(add your deployed link here after step 4 below)](https://matchmaker-mvp-two.vercel.app/login)_
- **Username:** `matchmaker`
- **Password:** `tdc2026`

## Tech stack

- **Frontend:** React 19 + Vite, React Router — no backend needed for this MVP;
  all customer/profile data is static JSON, matching runs client-side.
- **AI:** Google Gemini API (`gemini-2.0-flash`) for match explanations and
  personalized intro emails, called directly from the browser.
- **Hosting:** Vercel or Netlify (static build).

## Local setup

```bash
npm install
cp .env.example .env
# then paste your own Gemini key into .env — get one free at
# https://aistudio.google.com/app/apikey
npm run dev
```

The app works fully even without a Gemini key — it falls back to a deterministic,
rule-based explanation generator so grading/demoing never breaks on a missing key.


## Project structure

```
src/
  data/customers.json     8 matchmaker-assigned clients (mixed gender)
  data/pool.json          120 dummy profiles to simulate the matching pool
  utils/matching.js       gender-specific scoring engine
  utils/gemini.js         Gemini API calls + offline fallback
  pages/                  Login, Dashboard, CustomerDetail
  components/             Layout (sidebar), MatchCard (+ Send Match modal)
  context/AuthContext.jsx demo session auth
scripts/generateProfiles.mjs   one-off script used to generate the dummy data
```

## Write-up

See `WRITEUP.md` for the required 2-3 paragraph explanation of tech choices,
matching logic, AI usage, and assumptions.
