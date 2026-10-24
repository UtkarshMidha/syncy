# Implementation Plan — Syncy

> Historical hackathon schedule; its progress/status notes are stale. Current auth, setup, and deployment instructions are in [README.md](README.md) and [TODO.md](TODO.md). Phase 1 now includes per-user email and Google authentication.

> **Status Sat 24 Oct, morning:** pitch delivered (M1 ✅) · stack locked + schema written (M2 ◐) · **backend build 0% — nothing created in Supabase yet.** This plan is re-dated from that reality.
> Gates and AC numbers: [ACCEPTANCE_CRITERIA.md](ACCEPTANCE_CRITERIA.md) · timeline: [PM_PLAN.md §3](PM_PLAN.md).
> Single sources of truth: screens = [prototype/index.html](prototype/index.html) + [prototype/dashboard.html](prototype/dashboard.html) · schema = [supabase/migrations/0001_phase1_schema.sql](supabase/migrations/0001_phase1_schema.sql) · flow and field mapping = [docs/DATA_MODEL.md](docs/DATA_MODEL.md). If this plan and those files disagree, the files win; fix the plan.
> Detail docs: backend hand-off = [docs/BACKEND_BRIEF.md](docs/BACKEND_BRIEF.md) · business tasks = [docs/BUSINESS_TASKS.md](docs/BUSINESS_TASKS.md) · slides = [SLIDES_BRIEF.md](SLIDES_BRIEF.md) · diagrams for slides = [docs/diagrams/](docs/diagrams/).

## Team — who owns what

| Who | Owns | Judging weight covered |
|---|---|---|
| **Nodir** | PM · **frontend** (phone app screens on supabase-js) · **demo video** | 30% works live (with Utkarsh) · 15% demo |
| **Utkarsh** | **Backend, end to end**: Supabase project, migration, storage, AI processing endpoint, HTTPS deploy | 30% works live |
| **Sadaf** | Economics, pricing, competition, market · **slides lead** | 20% who pays · 15% cost (with Bhuvanesh) |
| **Anastasiya** | User research, ICP, positioning, GTM, demo script · slides with Sadaf | 20% real problem/user · 15% demo |
| **Bhuvanesh** | **Floater**: build support (seed data, dashboard wiring) + business support (cost log, BI numbers) | 15% cost & dependencies |

**Milestone reality check:**

| Gate | Official | Actual plan |
|---|---|---|
| M3 end-to-end slice | Sat midday | **Sat 18:00 hard target.** If the slice isn't green by then: Sun becomes fix-only on the thinnest path, and the demo narrows to QR + typed note (voice memo becomes a stretch goal). Nodir calls it. |
| M4 freeze | Sun afternoon | unchanged |
| M5 video · M6 submission | Sun | unchanged — video needs the flow stable by **Sun midday** |
| M7 live demo | Mon | unchanged |

**Hard dependencies (today):**
1. Supabase project + applied migration + demo user (**Utkarsh, Sat morning**) → until then Nodir builds against the localStorage prototype; the swap is drop-in later.
2. Processing endpoint skeleton (even with fake AI fields) → unblocks Nodir's Processing→Review wiring. **Skeleton before perfection.**
3. Utkarsh's measured per-contact cost (Sat evening) → Sadaf's cost slide; the ⚠️ estimate stays until then.
4. Anastasiya's demo script (Sun morning) → Nodir's video recording (Sun midday).
5. Notion = Phase 2. Nothing this weekend touches it.

---

## Phase 1 build map (mirrors the prototype and the schema)

| # | Screen | User does | Writes / reads (table.columns) | How | Owner | AC |
|---|---|---|---|---|---|---|
| 1 | **Event picker** (Today, no event) | Choose an event, create one, or edit its details (name, place, date, link) → **Enter event** | `events`: name, location, url, starts_on | supabase-js select / insert / update | Nodir | P-1 |
| 2 | **Event home** | See people scanned here, "Needs a note" badges, open / add / edit the event link, Leave | `contacts` where event_id; `events.url` | supabase-js | Nodir | P-1 |
| 3 | **Scan** | Point camera at a QR | `contacts` insert: source, profile_url, profile_slug, name (from slug), event_id, scanned_at, `status='captured'`; same person + event = existing row (unique index) | Camera QR library (D3) + `parseProfile()` from data.js; supabase-js insert | Nodir | P-2 |
| 4 | **Project pick** (note screen, optional) | Tap a project, "Let AI suggest" or "No project" | `contacts`: project_id, `project_set_by='user'`, match_reason | supabase-js update | Nodir | P-3 |
| 5 | **Note** | Write a note **or** record a voice memo; "Later" skips | `contacts`: note_kind + note_text; audio sent in memory to Edge Function on stop, not stored | Supabase Functions invoke + multipart audio | Nodir | P-4 |
| 6 | **Processing** | Wait ≤ 15 s | `status='processing'` → AI fields → `status='review'`; failure → `status='error'`, note kept | `POST /api/contacts/:id/process` (server, key never in the browser) | Utkarsh | P-5, P-7 |
| 7 | **Review** | Edit any field, change the project, Save | name, role, company, summary, discussed[≤3], needs, project_id, project_set_by, match_reason, next_step, next_step_date, follow_up_draft, `status='saved'` | supabase-js update | Nodir | P-6 |
| 8 | **Projects tab** | See projects, add one (name + description) | `projects`: name, description, emoji | supabase-js select / insert | Nodir | P-5 |
| 9 | **Dashboard** (desktop) | Filter (search, project, event, due, capture status, source, stage), sort, edit every field, stage, notes | `contacts` (all columns incl. stage, user_notes), `events`, `projects` | supabase-js select / update | Bhuvanesh | P-8 |
| — | **Demo data** | — | seed rows for all three tables | `supabase/seed.sql` generated from `prototype/data.js` | Bhuvanesh | P-9 |

### The processing endpoint (step 6)
`POST /api/contacts/:id/process`, runs server-side (stack per D1; a Supabase Edge Function also works — identical contract, see [docs/BACKEND_BRIEF.md](docs/BACKEND_BRIEF.md)):
1. Read the contact row; set `status='processing'`.
2. Voice transcription runs when recording stops; return transcript to the editable note field. Save `note_text` when the user taps Process.
3. **LLM call 1:** note_text + name-from-slug + event name → `{name?, role?, company?, summary, discussed[≤3], needs, next_step, next_step_date?}`. Unknown = empty, never invented.
4. **LLM call 2:** call-1 JSON + the user's `projects` (name + description, `archived=false`) → `{project_id | null, match_reason (quotes the note), match_confidence, follow_up_draft}`. **If `project_set_by='user'`, keep the user's project** and only draft the follow-up.
5. Write the fields, set `status='review'`, return the row. On any failure: `status='error'`, note and audio stay, the app offers Retry.

### Swapping the prototype for the real backend
The prototype already uses the schema's table and column names. Replace the four `db.*` functions in `prototype/data.js` with supabase-js (mapping in [docs/DATA_MODEL.md §3](docs/DATA_MODEL.md)) and replace `simulateAI()` with a call to the endpoint above. Screens stay as they are.

---

# Workstream A — product build

## Utkarsh — backend (all of it; follow [docs/BACKEND_BRIEF.md §3](docs/BACKEND_BRIEF.md) in order)

### Sat morning — unblock everyone first
- [ ] Supabase project created (EU region); URL + anon key to Nodir and Bhuvanesh (brief step 1)
- [ ] Migration `0001` applied; demo user created (D6); RLS smoke test — a second user sees zero rows (step 2)
- [ ] AI key into server-side secrets only; `.env` in `.gitignore`; key shared only in the team channel (AC-2.2)
- [ ] `parseProfile()` rules confirmed for LinkedIn / Xing / other (P-2). **No scraping, URL only** (PM_PLAN §9)

### Sat afternoon — the M3 slice
- [ ] Processing endpoint **skeleton first**: statuses + error path with fake AI fields (brief step 6) → hand to Nodir immediately
- [ ] Real AI inside: STT → LLM call 1 → `projects` read → LLM call 2, per the endpoint spec above (brief steps 7–8; prompts in `/prompts`, AC-6.5)
- [ ] Both pages deployed to the HTTPS host; camera + mic work on the demo phone (D9/D10, brief step 9)
- [ ] **18:00: slice green** — scan → note → AI fields on screen (M3, AC-3.1–3.3); show the mentor
- [ ] Measure seconds + tokens per step; hand € per contact to Sadaf (brief step 10)

### Sun
- [ ] Failures set `status='error'`, note + audio kept, Retry works (P-7)
- [ ] 3 clean runs in a row on demo data (AC-4.1); after freeze, fixes only (AC-4.3)
- [ ] Repo history clean of secrets (AC-6.6)

### Mon
- [ ] API key valid, credits left (pre-flight); on standby during the demo

## Nodir — frontend + demo video

### Sat (don't wait for the backend — prototype's localStorage layer keeps working)
- [ ] Real camera QR scan (html5-qrcode, D3) + `parseProfile()` on the scan screen
- [ ] Voice memo via MediaRecorder (⚠️ Safari records `audio/mp4`, Chrome `webm` — name by actual mimeType)
- [ ] When keys arrive: swap the four `data.js` functions → supabase-js (brief step 4); sign in demo user on load; screens unchanged
- [ ] Wire Processing → the endpoint, poll the row every 2 s until `status != 'processing'`; Review fully editable; Save → `status='saved'` (P-6)
- [ ] Evening: full flow on the demo phone, end to end

### Sun
- [ ] Error + empty states (P-7); non-builder usability test, fix what it surfaces (AC-4.2)
- [ ] Call and enforce **feature freeze** in the afternoon (AC-4.3)
- [ ] **Record the ≤ 2-min demo video** to Anastasiya's script; store locally + backup (M5, AC-5.1–5.2)
- [ ] README: what it does, how to run, live URL (AC-6.1) · **submit GitHub + slides EOD** (M6)

### Mon
- [ ] Pre-flight checklist 1 h before the slot (AC-7.6); present; video fallback ready

## Bhuvanesh — build support (mornings with Workstream A)

- [ ] Sat: `supabase/seed.sql` from [prototype/data.js](prototype/data.js) — demo user, 1 event, 4–5 projects **with 1–2-sentence descriptions** (the AI matches on them), fake personas only (AC-2.4, P-9); load after the migration, verify RLS
- [ ] Sat: dashboard.html onto supabase-js — list, filters, sorting, detail edits, stage (P-8)
- [ ] Sun: verify every AI field lands in the row after processing (P-5/P-6) · reset script so the demo starts clean · backup dashboard tab open

---

# Workstream B — business & story

## Sadaf — economics · pricing · competition · market · **slides lead**

> Detail, formulas and templates: [docs/BUSINESS_TASKS.md §S1–S5](docs/BUSINESS_TASKS.md)

- [ ] Sat: unit economics skeleton now, real numbers when Utkarsh delivers (evening) · pricing ladder + WTP probes in interviews · competitor table verified · market one-pager
- [ ] Sat evening: **slides v1 in the official template** (Gamma draft ok) — all 11 slots from [SLIDES_BRIEF.md](SLIDES_BRIEF.md), placeholders where numbers are pending
- [ ] Sun: cost + dependencies slide final with Bhuvanesh (AC-4.4, AC-7.4) · final deck for submission (AC-6.3, AC-6.4) · judge Q&A prep (10 questions)
- [ ] Mon: field business questions (AC-7.3)

## Anastasiya — research · ICP · positioning · GTM · demo script

> Detail, scripts and templates: [docs/BUSINESS_TASKS.md §A1–A5](docs/BUSINESS_TASKS.md)

- [ ] Sat: 3+ interviews, replace the ⚠️ numbers in IDEA_PITCH.md and the deck (AC-1.2, AC-7.2) · ICP one-pager · positioning one-liner + objection answers · UX copy pass on the real screens (feeds AC-4.2)
- [ ] Sat evening: demo script outline to Nodir (AC-3.5)
- [ ] Sun: 2 interviews · usability test with Nodir · final script + 2 timed rehearsals (AC-7.5) · GTM slide · demo video with Nodir (M5)
- [ ] Mon: Q&A on user, problem evidence, ICP (AC-7.2)

## Bhuvanesh — business support (afternoons with Workstream B)

- [ ] Running-cost log with Sadaf: every tool, plan, usage, €/month (PM_PLAN §7, AC-4.4)
- [ ] Sun: dashboard-derived numbers for the slides — contacts captured, follow-ups due, € per contact (AC-7.4)

---

## Shared — whole team

- [ ] Daily: 10-min sync at start of day + before each mentor check-in
- [ ] Sun: 15-min walkthrough so **every member can explain every part**: screens, schema, both prompts (AC-6.5, AI policy — judges check this)
- [ ] Every tool used goes in the tool log with "who can explain it" (PM_PLAN §7, [SLIDES_BRIEF.md §10](SLIDES_BRIEF.md))
- [ ] Decisions and mentor feedback into PM_PLAN §9 the same day
- [ ] Sunday morning: re-check the schedule — clocks went back overnight (DST risk, PM_PLAN §8)

## Later (Phase 2, not this weekend)
- Notion / notes-app sync: projects in, contacts out ([docs/DATA_MODEL.md §5](docs/DATA_MODEL.md), [docs/ARCHITECTURE.md §3](docs/ARCHITECTURE.md))
- Badge / business-card photo and vCard QR (D4)
- Reminders when a follow-up is due
