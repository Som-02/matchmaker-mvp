# Write-up

**Tech choices.** I built this as a frontend-only React + Vite app with static JSON as
the data layer, rather than standing up a full Node/Express backend. For a working
session MVP, the goal is to demonstrate product thinking and matching logic quickly and
reliably on a hosted link — a backend adds deployment surface area (server hosting,
CORS, DB provisioning) without changing what's being evaluated here. React Router
handles the login → dashboard → customer-detail flow, and all state (session, notes) is
kept in `sessionStorage`/memory. This keeps the app trivially deployable to Vercel as a
static site and easy to extend into a real Express/Firebase backend later without
touching the matching logic or UI.

**Matching logic.** The engine (`src/utils/matching.js`) first applies hard filters
(opposite gender, same religion — a common gating filter on platforms like
BharatMatrimony and Shaadi.com) and then a weighted soft-compatibility score out of 100.
Per the brief, male customers see women scored with a bias toward younger age, lower
income, shorter height, and matching views on children. Female customers see men scored
on more holistic, values-first compatibility — career stage, shared value tags,
relocation flexibility, and family values alignment — deliberately avoiding a mirrored
demographic filter, since research into matrimonial UX suggests women's stated
preferences skew toward compatibility factors over a single demographic axis. Both
paths share secondary signals (city match, diet, shared values) so results still feel
personalized rather than mechanical. I also added fields researched as standard in the
Indian matchmaking space beyond the brief's list: gotra, manglik status, diet
preference, family type/values, and horoscope-match importance — all used to enrich
scoring.

**How AI is used.** I integrated Google's Gemini API (`gemini-2.0-flash`) in two places:
(1) generating a short, natural-language explanation for each ranked match (e.g. "High
Potential Match — both value family and share a home city"), grounded in the actual
rule-based signals rather than inventing content, and (2) generating a personalized
2–3 sentence intro message shown in the "Send Match" preview modal, used in place of a
generic template email. The Gemini key is read from an environment variable and never
committed to source control; if no key is configured, both features fall back to a
deterministic rule-based generator so the app never breaks in a review environment.

**Assumptions made.** I assumed "assigned customers" means a fixed roster per
matchmaker (modeled as 8 mixed-gender clients) rather than a multi-matchmaker system,
since the brief describes a single logged-in matchmaker's view. I assumed "same
religion" as a reasonable hard filter given how mainstream Indian matrimonial platforms
gate results, while treating caste as a soft/display field rather than a hard filter to
avoid over-constraining an already-small dummy pool. Email sending is mocked via an
in-app confirmation toast rather than a real email service, per the brief's "trigger
mock email" option. Login is a single hardcoded demo account rather than real auth,
appropriate for an MVP working session rather than a production system.
