# Syncy: slide brief for the pitch deck

> Content for each slide, ready to paste into the official template (Gamma for drafts is fine; the final version goes in the template).
> Source of truth: [IDEA_PITCH.md](IDEA_PITCH.md). Screenshots: [docs/screenshots/](docs/screenshots/).
> ⚠️ = a guess we still have to confirm by talking to real users. Replace it with real numbers or quotes before the final deck.

Judges score: **30%** works live · **20%** real problem for a real user · **20%** who pays and why switch · **15%** cost to run and dependencies · **15%** demo quality.

**Owners & deadlines (24 Oct):** deck build = **Sadaf (lead)**; slides 2–3 content = Anastasiya; slides 7–8 content = Sadaf; slide 6 assets (screens, video) = Nodir; numbers on slide 8 = Bhuvanesh + Utkarsh. **v1 in the official template Sat evening → final Sun before submission (M6).**
Diagram assets for slides 4/5/8/9: [docs/diagrams/](docs/diagrams/) (user journey + architecture SVGs).

---

## 1. Title

- **Syncy**
- Tagline: *From "who was that?" to a next step.*
- Team Syncy · BCBT AI Entrepreneurship Hackathon · CIC Berlin · 23–26 Oct 2026
- Visual: `02-event-home.png`

## 2. Problem

- Opening question: *"Who here has opened LinkedIn after an event and had no idea who someone was?"*
- A Berlin freelancer goes to ~2 networking events a month and meets 5–10 people at each ⚠️
- The next day they spend ~1 h ⚠️ trying to remember who was who and what was discussed, and most follow-ups are dropped ⚠️
- Why: the LinkedIn connection stores the name and job title, but not the conversation or why it mattered
- Add **1 real quote** from our interviews here

## 3. User

- **Freelance consultants and developers** who go to Berlin startup and networking events to find clients
- Today they use: LinkedIn connect + phone notes app + memory
- CRMs (HubSpot etc.) are too heavy for one person and don't capture the conversation
- Evidence: `N` conversations held, `quote`, `hours lost` ⚠️ (fill from PM_PLAN §4)

## 4. Product: how it works

Three steps, one screen each:

1. **Scan** their LinkedIn or Xing QR code (we store the link only, no scraping)
2. **Record** a 20-second voice note right after the chat
3. **Get** a contact card in Syncy: what you discussed, which of your projects it matters for, next step + date, a draft follow-up. Manage everything in the contacts dashboard; Notion / notes-app sync comes in Phase 2

- Visuals: `01-event-picker.png` → `03-scan.png` → `04-note-and-project.png` (or `05-voice-memo.png`) → `07-review.png` → `10-dashboard.png`

## 5. What the AI does

- **Summarises** the voice note: who they are, what was discussed, what they need
- **Reads** your own project list (in Syncy; from Notion in Phase 2) and **sorts** the contact to the project it fits, with a one-line reason quoting the conversation. If you already picked a project after the scan, it keeps yours
- **Drafts** the follow-up message (you review it; nothing is sent automatically)
- Key line: *"Without the AI it's just another contact list."*
- Visual: `06-ai-processing.png` + `07-review.png`

## 6. Demo

- Live walkthrough: enter the event → scan Lena → pick a project (optional) → voice memo → AI result → save → contacts dashboard
- Backup: 2-minute screen recording (made on Day 3)

## 7. Business model: who pays and why switch

- **Who pays:** the freelancer, **€9.99 / month** ⚠️ (later: €19 / seat for sales and business-development teams) — final price is Sadaf's call D11, Sat EOD
- **Today:** LinkedIn + notes app + memory: free, but contacts and context get lost
- **Why switch:** one contact turned into a client pays for years of Syncy; saves ~1 h ⚠️ of sorting after each event
- Optional: a one-sentence market-size estimate (number of freelancers in Berlin / Germany) — only if we can source it

## 8. Cost to run and dependencies

| Item | Assumption | € / month |
|---|---|---|
| AI model (transcription + 2 short calls) | ~€0.01 per contact | < €5 at hackathon scale |
| Hosting | free tier | €0 |
| Supabase (database, voice-memo storage, auth) | free tier | €0 |
| **Total** | | **< €5 / month** (update from PM_PLAN §7 cost log) |

Visual: [docs/diagrams/architecture-phase1.svg](docs/diagrams/architecture-phase1.svg) — one picture answers "what does it run on".

Dependencies and risks:
- **AI model provider:** prices and API keys; we could switch to an open model (Ollama) if needed
- **Supabase:** database, storage and auth in one service; free tier covers the hackathon
- **Notion / notes apps:** Phase 2 integration (projects in, contacts out), not a dependency of the MVP
- **LinkedIn / Xing:** we only read the URL inside the QR code, no scraping, so changes to their terms don't break us
- **Personal data:** notes about other people are stored per user with row-level security (each user sees only their own rows); the demo uses invented people only

## 9. What's next (the "Later" list)

Visual: [docs/diagrams/architecture-phase2.svg](docs/diagrams/architecture-phase2.svg) — the Notion sync picture.

- Sync with Notion and other notes apps (Phase 2)
- Google Drive / Sheets as another target
- Photo of a badge or business card instead of a QR code
- Reminders when a follow-up is due
- Team version for sales and business-development teams

## 10. Tools we used (required by the AI policy)

| Tool | Used for | Who can explain it |
|---|---|---|
| Claude Code | Pitch documents, clickable prototype, plans and diagrams | Nodir |
| `add: AI model per D2 (mentor key)` | Transcription, summary, project match, follow-up draft | Utkarsh |
| Supabase | Database, voice-memo storage, auth (RLS), processing | Utkarsh |
| html5-qrcode (JS library) | Camera QR scanning in the browser | Nodir |
| `add: HTTPS hosting per D9` | Serving the phone app + dashboard | Utkarsh |
| `add: Gamma, if used` | Slide drafts | Sadaf |

## 11. Team

- **Nodir** — PM, frontend, demo video · **Utkarsh** — backend & AI · **Anastasiya** — user research, positioning, GTM · **Sadaf** — economics, pricing, slides · **Bhuvanesh** — data, dashboards, cost tracking

---

### Screenshot list (`docs/screenshots/`)

| File | Shows |
|---|---|
| `01-event-picker.png` | Choose, create or edit the event, then enter it |
| `02-event-home.png` | Inside the event: link, stats, Scan button, people scanned here |
| `03-scan.png` | QR scanned: link, slug and name saved at once |
| `04-note-and-project.png` | Pick a project (optional) and write a note |
| `05-voice-memo.png` | Voice memo being recorded, transcript appearing live |
| `06-ai-processing.png` | AI steps: save → transcribe → summarise → compare with projects → draft |
| `07-review.png` | Review: assigned project with reason, editable fields, follow-up draft |
| `08-saved.png` | Saved; everyone at this event, Notion sync noted as Phase 2 |
| `09-projects.png` | The user's own projects the AI matches against; add a project |
| `10-dashboard.png` | Contacts dashboard: stats, filters, sorting, stages |

The screenshots come from the clickable prototype (demo data, AI output simulated). The live demo on Day 4 must use real AI calls.
