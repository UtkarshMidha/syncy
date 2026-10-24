# PM Plan — BCBT AI Entrepreneurship Hackathon

> 23–26 Oct 2026 · CIC Berlin (Lohmühlenstraße 65) · Source: *BCBT Hackathon Field Notes*
> Status: **scaffold** — product idea TBD, team TBD. Fields marked `TBD` are to be filled.

| | |
|---|---|
| Product name | **Syncy** |
| Team name | **Syncy** |
| Direction | `TBD` — New company **or** Inside a company |
| Mentor | `TBD` |
| Business mentor | `TBD` (visits on Day 1) |
| Repo | `TBD` (GitHub link — handed in end of Day 3) |
| Team channel | `TBD` (Discord; API key shared only here) |

Related files: [IDEA_PITCH.md](IDEA_PITCH.md) (due **13:00 today**) · [ACCEPTANCE_CRITERIA.md](ACCEPTANCE_CRITERIA.md) · [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) · [PRD.md](PRD.md)

---

## 1. Goal

Ship **one working product** that a non-builder can use live, solving **one specific problem** for **one specific user**, with real AI calls, a price, and a monthly running cost.

### What the judges score

| Weight | Criterion | Owner |
|---|---|---|
| 30% | Does it work live? | Build lead |
| 20% | Real problem for a real user? | Research lead |
| 20% | Who pays, how much, why switch? | Business lead |
| 15% | Cost to run & dependencies | Business lead + Build lead |
| 15% | Demo quality | Demo/Design lead |

55% of the score is not code → non-developers own those rows end to end.

### Final-day deliverables (non-negotiable)

- [ ] Product runs live; someone who didn't build it can use it
- [ ] Real AI model calls (no faked / hard-coded answers)
- [ ] One specific user + one specific problem
- [ ] Price + approximate monthly running cost
- [ ] GitHub link + slides handed in **end of Day 3**

---

## 2. Team & roles

> Per-person checklists: [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md)

| Name | Background | Primary role | Secondary | Contact |
|---|---|---|---|---|
| Nodir | PM, frontend | PM / Facilitator | Frontend, PRD, pitch speaker, submission | `TBD` |
| Utkarsh | Backend, AI | Build lead (backend + AI integration) | | `TBD` |
| Bhuvanesh | Dashboards, BI | Build (Supabase demo data, contacts dashboard) | Cost log | `TBD` |
| Anastasiya | Marketing, CX-UX | Research lead (ICP, interviews) | Demo / Design (script, UX copy, GTM) | `TBD` |
| Sadaf | Market analysis | Business lead (pricing, competition, market) | Business slides | `TBD` |

Demo/Design is split: Anastasiya owns script + UX, Nodir owns frontend + slides submission.

### RACI (R = does it, A = accountable, C = consulted)

| Workstream | PM | Build | Research | Business | Demo/Design |
|---|---|---|---|---|---|
| Problem selection | A | C | R | C | C |
| Idea pitch (13:00) | A | C | R | R | R |
| Tool stack choice | C | A/R | | C | |
| MVP build | C | A/R | C | | C |
| User interviews / validation | C | | A/R | C | |
| Pricing & cost model | C | C | C | A/R | |
| Screens / UX | C | C | C | | A/R |
| Demo script, video, slides | A | C | C | R | R |
| Submission (GitHub + slides) | A/R | R | | | R |

---

## 3. Timeline & milestones

> Exact times/rooms: Participant Guide + `#announcements` on Discord. **Clocks go back 1 hour** on the night between Day 2 and Day 3 (Sat → Sun).

| Day | Date | Focus | Milestone (exit gate) |
|---|---|---|---|
| **Day 1** | Fri 23 Oct | Team, problem, pitch, plan | **M1 Idea pitch @ 13:00** · M2 Stack chosen + build plan |
| **Day 2** | Sat 24 Oct | Build | **M3 End-to-end by midday** (rough is fine) |
| **Day 3** | Sun 25 Oct | Finish | **M4 Feature freeze (afternoon)** · M5 Demo video · **M6 Submission end of day** |
| **Day 4** | Mon 26 Oct | Judges, live | **M7 Live demo** |

### Day 1 — today (Fri 23 Oct), working back from 13:00

| Time | Activity | Output | Owner |
|---|---|---|---|
| Start | Intros, skills, assign roles | Section 2 filled | PM |
| +30 min | Problem discovery: "who loses hours, and on what?" | 5–10 candidate problems | All |
| +60 min | Score candidates with the 5 questions (§4) | Top 2 problems | Research |
| +90 min | Quick real-person check (CIC floors / coffee machine) — Mom Test | Notes, 1–3 conversations | Research |
| ~11:45 | Write 5 "How might we…" versions, vote | Chosen HMW | PM |
| ~12:15 | Fill the 6 pitch answers | [IDEA_PITCH.md](IDEA_PITCH.md) | All, per owner |
| **12:45** | **Pitch freeze** + 1 dry run (≤ 2 min) | Final pitch | PM |
| **13:00** | **Pitch the idea** | Mentor feedback logged in §9 | PM + speaker |
| Afternoon | Choose tools with mentor; get API key; repo + `.env` setup; build plan; first screen sketches; more interviews | M2 done | Build / Design / Research |
| End of day | Backlog for Day 2 written; "Later" list started | §6 filled | PM |

### Day 2 (Sat 24 Oct) — Build

- Morning: thinnest end-to-end slice (input → AI call → output on screen).
- **Midday gate (M3):** something runs start to finish. Show mentor at check-in.
- Afternoon: harden the main path, test with a real user's (fake/anonymised) data; business lead finalises price + cost; design lead drafts demo script.
- Evening: slides v1. Don't burn shared free credits overnight.

### Day 3 (Sun 25 Oct) — Finish  *(clocks went back 1 h overnight)*

- Morning: polish main flow, fix bugs, non-builder usability test.
- **Afternoon: Feature freeze (M4)** — after this, fix only.
- Record **2-minute demo video (M5)** of the product working.
- Rehearse pitch + live demo ×2.
- **End of day: submit GitHub link + slides (M6).**

### Day 4 (Mon 26 Oct) — Live demo

- Pre-flight checklist (§8) one hour before slot.
- Live demo; if it fails → play the video and keep presenting.

---

## 4. Problem discovery (Day 1)

**Where to look:** past jobs (weekly task that should be automatic) · anyone who runs something (shop, dental practice, café, one-person agency) · your own paperwork · small companies on the CIC floors.

### Candidate scoring — keep at 4–5 yeses

| # | Candidate problem (who / what task) | Weekly? | Quantifiable (h / €)? | Existing workaround? | AI core = read/sort/draft/search/summarise? | Rough version by Day 2 midday? | Score |
|---|---|---|---|---|---|---|---|
| 1 | Freelancer forgets who they met at networking events and what was discussed → lost follow-ups | ⚠️ events 2–4×/month, not weekly — target people who go weekly, or count weekly follow-ups | ✅ ~1 h per event ⚠️ + lost leads | ✅ LinkedIn + notes app + memory | ✅ summarise note, sort to project, draft follow-up | ✅ QR → voice → Notion row | 5/5 ⚠️ |
| 2 | `TBD` | | | | | | /5 |
| 3 | `TBD` | | | | | | /5 |
| 4 | `TBD` | | | | | | /5 |
| 5 | `TBD` | | | | | | /5 |

### "How might we…" (write 5, vote for the one that leads to most ideas)

1. HMW help freelancers remember what they discussed with each person they met at an event?
2. HMW turn a LinkedIn connection into a next step instead of a name?
3. HMW connect people met at events to the projects the freelancer is working on?
4. HMW make capturing a contact faster than typing into a notes app?
5. HMW make sure no promising contact is forgotten after an event?

Chosen: #3 (with #1 as the capture step) — `confirm by team vote` — check it is neither too wide ("help schools with admin") nor too narrow ("build a chatbot for…").

### User conversations (Mom Test)

Rules: ask about their last week, not your idea · past behaviour is fact, future intent is a guess · praise is free, a request to try it with real data is signal.

| Date | Who (role, org type) | Last time it happened | Time / € lost | Current workaround | Signal (wants to try? pay?) | Notes |
|---|---|---|---|---|---|---|
| | | | | | | |

---

## 5. Build plan

| Item | Decision |
|---|---|
| Team type | `TBD` — No dev / 1–2 devs / Automation / Voice |
| Stack | **Supabase** (Postgres, Storage for voice memos, Auth/RLS) — decided 23 Oct. Frontend framework + AI endpoint host: `TBD` (PRD D1) |
| AI model / provider | `TBD` (key from mentor, Day 1) |
| AI job | **Summarises** the note (typed or transcribed voice memo), **sorts** the contact to one of the user's projects, **drafts** the follow-up |
| Data source | Invented events, projects and personas with fake profile URLs ([prototype/data.js](prototype/data.js) → `supabase/seed.sql`); no real personal data |
| Hosting / live URL | `TBD` |

Rule: choose with the mentor on Day 1 and **do not switch** mid-hackathon.

### Scope: one user · one task · one screen

```
User does ──▶ [input] ──▶ AI does <job> ──▶ [output on one screen] ──▶ user acts
```

---

## 6. Backlog

| ID | Item | Type | Owner | Due | Status |
|---|---|---|---|---|---|
| B-01 | Repo created, `.env` + `.gitignore`, key never committed | Setup | Build | Day 1 | ☐ |
| B-02 | Thinnest end-to-end slice | Build | Build | Day 2 midday | ☐ |
| B-03 | Main screen design | Design | Design | Day 2 AM | ☐ |
| B-04 | Price + monthly cost sheet | Business | Business | Day 2 PM | ☐ |
| B-05 | Demo script | Demo | Design | Day 2 PM | ☐ |
| B-06 | Slides v1 (official template) | Demo | Design + Business | Day 2 eve | ☐ |
| B-07 | Non-builder usability test | QA | Research | Day 3 AM | ☐ |
| B-08 | 2-min demo video | Demo | Design | Day 3 | ☐ |
| B-09 | Submission: GitHub + slides | Admin | PM | Day 3 EOD | ☐ |
| B-xx | `TBD` product features | Build | | | ☐ |

### "Later" list (parked until after Day 4)

- `…`

---

## 7. Business case & cost tracker

| Question | Answer |
|---|---|
| Who pays? | `TBD` |
| How much? | `TBD` €/month (per seat / per org) |
| What do they use today? | `TBD` |
| Why switch? (hours / € saved) | `TBD` |
| Monthly running cost | `TBD` € (see below) |
| *Inside a company:* who backs it, whose budget? | `TBD` |

### Running-cost log (update as you go — judges will ask)

| Tool / service | Plan | Usage assumption | €/month | Dependency risk |
|---|---|---|---|---|
| AI model API | | calls × tokens | | |
| Hosting | | | | |
| Database | | | | |
| Other | | | | |
| **Total** | | | | |

### Tool log (AI policy — list every tool and its purpose in final slides)

| Tool | Used for | Who can explain it |
|---|---|---|
| | | |

---

## 8. Risks & checklists

| Risk | Mitigation | Owner |
|---|---|---|
| Problem too broad | 5-question filter; one user / task / screen | PM |
| Nothing running by Day 2 midday | Thinnest slice first; no stack switching | Build |
| Non-devs idle | Each owns a scoring row (research, pricing, demo, design) | PM |
| Live demo fails | 2-min video recorded Day 3 | Demo |
| API key leak | `.env`, `.gitignore`, share only in team channel | Build |
| Free credits exhausted | Shared budget; no overnight runs | Build |
| Real personal data used | Fake/open data only | Research |
| DST confusion (Day 2→3) | Phone alarms on auto time; re-check schedule Sunday AM | PM |

### Day 4 pre-flight

- [ ] Live URL loads on presenter laptop + backup device
- [ ] API key valid, credits left
- [ ] Demo data loaded; demo script printed
- [ ] Demo video downloaded locally
- [ ] Slides in official template, tools list included
- [ ] Timer + speaker order agreed

---

## 9. Decision & feedback log

| Date / time | Decision or feedback | By | Impact |
|---|---|---|---|
| 23 Oct | Scaffold created | PM | — |
| 23 Oct | Idea: networking contact capture (QR + voice note → AI summary + project match → Notion) | Team | IDEA_PITCH filled; P-ACs drafted |
| 23 Oct | Name: **Syncy** (product + team) | Team | Used in pitch, prototype, slides |
| 23 Oct | **Phase 1 = Supabase** (events, projects, contacts); event picker, typed or voice notes, manual project pick, contacts dashboard. **Notion / notes-app sync = Phase 2** | Nodir (PM) | Supersedes "Notion only" below; schema in supabase/migrations, plan in IMPLEMENTATION_PLAN.md |
| 23 Oct | No LinkedIn scraping — store profile URL only; Notion only (Drive later); fake personas for demo | Team | Avoids ToS / personal-data risk |

## 10. Help

Team → mentor → `#help` on Discord · hackathon@berlincollege.de · +49 30 23598010
