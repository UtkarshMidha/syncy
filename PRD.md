# PRD — Syncy

> v1 · 23 Oct 2026 · Owner: Nodir (PM) · Status: **draft — needs team lock-in on the 🔒 items**
> Sources: [IDEA_PITCH.md](IDEA_PITCH.md) · [ACCEPTANCE_CRITERIA.md §P](ACCEPTANCE_CRITERIA.md) · [PM_PLAN.md](PM_PLAN.md) · [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md)
> Every 🔒 Dn marker is a decision the team must make together — all collected in [§12](#12-decisions-to-lock-in-) with options, a recommendation, an owner, and a lock-by time.

> **Update 23 Oct (PM decision): Phase 1 / Phase 2 split.** Where this PRD says "Notion", read the following; sections marked ⚠️ are superseded.
> - **Phase 1 (hackathon):** Today screen = choose or create an **event**, then "Enter event". Scan saves `profile_url` + slug name **immediately** to **Supabase**. Note = **typed text or voice memo**. Processing compares the row with the user's **projects stored in Supabase**. Review: LLM output + manual edits + **assign a project**, then save. Everything is editable later in the **dashboard**.
> - **Phase 2:** Notion / notes-app integration (projects in, contacts out).
> - Schema: [supabase/migrations/0001_phase1_schema.sql](supabase/migrations/0001_phase1_schema.sql) · data model, flow and sync design: [docs/DATA_MODEL.md](docs/DATA_MODEL.md) · prototype: [prototype/index.html](prototype/index.html) + [prototype/dashboard.html](prototype/dashboard.html).

## 1. Summary

**Problem.** A Berlin freelancer meets 5–10 people per networking event. The next day the LinkedIn connection holds a name and job title, but not the conversation, why it mattered, or what to do next — so follow-ups are dropped.

**Product.** Scan someone's LinkedIn/Xing QR code, record a ~20-second voice note right after the chat, and get a contact card in your own Notion: who they are, what you discussed, which of **your projects** they matter for (with a reason), the next step, and a drafted follow-up message.

**One line:** *the voice note is the data source — we never scrape LinkedIn.*

**Success =** the judging weights: works live (30%), real problem/user (20%), who pays (20%), cost & dependencies (15%), demo quality (15%).

## 2. Goals and non-goals

### Goals (this weekend)
1. One user (freelancer), one task (capture a contact into a next step), one screen flow.
2. Real AI calls end to end by Day 2 midday (M3).
3. A non-builder completes the flow unaided (M4, AC-4.2).
4. ≤ €0.02 marginal cost per contact, demonstrable (AC-7.4).

### Non-goals (on the "Later" list — do not build)
- ❌ Scraping LinkedIn/Xing in any form, incl. screenshots/headless browsing (locked, PM_PLAN §9).
- ❌ Apify/API enrichment — evaluated and priced ($4/1k), parked for the paid tier. 🔒 D8
- ❌ Sending the follow-up automatically (P-4: nothing is sent).
- ❌ Google Drive or any second integration (Notion only). ⚠️ Updated: **no** external integration in Phase 1; Notion and notes apps are Phase 2.
- ❌ Accounts, sign-up, multi-user (demo runs as one hardcoded user). 🔒 D6
- ❌ Both-sided Syncy QR / consent exchange — roadmap slide only.
- ❌ Native iOS/Android app — web app on the phone browser. 🔒 D1

## 3. Target user

ICP v1 (Anastasiya refines from interviews): freelance consultant / developer in Berlin who attends ~2+ networking events per month to find clients, uses LinkedIn (or Xing) + a notes app + memory today, and has a running list of own projects/goals.

## 4. User stories

1. As a freelancer at an event, I scan a person's LinkedIn QR so that the contact exists before the conversation is over (≤ 3 s, P-1).
2. As a freelancer who just finished a chat, I hold a button and talk for 20 s so that everything I'd forget by tomorrow is captured.
3. As a freelancer the next morning, I open Notion and see each contact matched to one of my projects with a reason and a drafted follow-up, so I act instead of reconstructing.
4. As a freelancer, I review and edit the AI's card before it is saved, so nothing wrong lands in my CRM (P-2).
5. If the person has no QR code, I photograph their badge/business card instead (P-1 fallback). 🔒 D4

## 5. User flow and screens

> ⚠️ Superseded for Phase 1 by the flow in [docs/DATA_MODEL.md §1](docs/DATA_MODEL.md): event picker → scan (saved at once) → typed note or voice memo → processing → review + assign project → saved → dashboard.

Original flow (before the Phase 1 decision; [docs/screenshots/](docs/screenshots/) now shows the Phase 1 flow):

```
01 Today list → 02 Scan (QR / photo) → 03 Record note → 04 Processing → 05 Review & edit → 06 Saved to Notion → 07 Projects view
```

| Screen | Spec | Notes |
|---|---|---|
| **Today** | List of today's contacts: name, one-line summary, status chip (awaiting note / processed / saved). CTA: big "Scan" button. | Entry point; empty state explains the 3 steps. |
| **Scan** | Camera viewfinder, QR auto-detect; toggle "Photo of badge". On success: name + profile link appear instantly (from URL slug). | Browser camera API — needs HTTPS. 🔒 D3, D9 |
| **Record** | Hold-to-record (or tap start/stop), max 60 s, timer, waveform. Optional: event name field (prefilled, editable). | Audio stays until processed (P-5). |
| **Processing** | Progress state ≤ 15 s (P-2). | Show per-step status: transcribe → summarize → match. |
| **Review** | Card with every field editable: name, role, company, discussed (≤3 bullets), they need, next step + date, matched project + reason, follow-up draft. Buttons: Save to Notion / Re-record. | Empty fields show as empty, never invented (P-2). |
| **Saved** | Confirmation + deep link to the Notion row. | |
| **Projects** | Read-only list of the user's Notion projects (what matching runs against). | Demo page, seeded by Bhuvanesh. |

## 6. Functional requirements

| ID | Requirement | AC | Day |
|---|---|---|---|
| FR-1 | Decode LinkedIn (`linkedin.com/in/<slug>`) and Xing (`xing.com/profile/<name>`) QR codes; store URL only; derive display name from slug | P-1 | 1–2 |
| FR-2 | vCard QR support: if the QR is a vCard (conference badges), read name/company/email directly | P-1 | 2, if cheap 🔒 D4 |
| FR-3 | Badge/business-card photo → vision model extracts name, role, company | P-1 | 2 PM 🔒 D4 |
| FR-4 | Record voice note ≤ 60 s in the browser; upload to backend | P-2 | 2 AM |
| FR-5 | Transcribe audio (German + English) 🔒 D7 | P-2 | 2 AM |
| FR-6 | LLM call 1: transcript → structured summary JSON; missing fields = empty | P-2 | 2 AM |
| FR-7 | LLM call 2: summary + user's Notion projects → best project or "none" + one-line reason quoting the conversation + follow-up draft | P-3 | 2 AM/PM |
| FR-8 | Review screen: every field editable before save | P-2 | 2 |
| FR-9 | ⚠️ Phase 1: on scan, insert the `contacts` row in Supabase; on confirm, update it to `status = 'saved'` with the edited fields and assigned project. (Writing to Notion moves to Phase 2.) | P-4 | 2 |
| FR-10 | On AI/Notion failure or timeout: clear message, audio + fields retained, one-tap retry | P-5 | 2 PM–3 |
| FR-11 | Today list shows all contacts of the day with status | — | 2 PM |

**M3 midday slice (what must work by Sat midday):** FR-1 → FR-4 → FR-5 → FR-6 shown on screen. FR-7/FR-9 same afternoon. 🔒 D5 (slice definition confirmed with mentor)

## 7. Non-functional requirements

- **Latency:** scan→contact < 3 s (P-1); note→review screen < 15 s (P-2). Budget: STT ~3 s + LLM1 ~3 s + LLM2 ~3 s + overhead.
- **Cost:** ≤ €0.02 per contact. Estimate: STT ~€0.002 (20 s) + 2 LLM calls ~€0.005–0.01. Utkarsh logs real numbers for Sadaf (Day 2 PM).
- **Privacy/GDPR:** profile URL only, no scraped data; user reviews before anything is stored in Notion; demo uses invented personas only (P-6); no real personal data in the repo or demo.
- **Security:** API keys server-side only, `.env` + `.gitignore` (AC-2.2); no key in client code (P-6).
- **Reliability for demo:** main path 3 runs in a row without error (AC-4.1); offline fallback = demo video.
- **Devices:** works on the presenter's phone browser + laptop webcam as backup. 🔒 D10

## 8. Data model

> ⚠️ Superseded: the Phase 1 schema (`events`, `projects`, `contacts`) is in [supabase/migrations/0001_phase1_schema.sql](supabase/migrations/0001_phase1_schema.sql), explained in [docs/DATA_MODEL.md](docs/DATA_MODEL.md). The Notion table below becomes the Phase 2 mirror.

### Backend `contacts` record (original draft)
```
id, created_at, event,
source: qr_linkedin | qr_xing | vcard | badge_photo,
profile_url, name, role, company,
transcript, discussed[≤3], needs,
next_step, next_step_date,
matched_project, match_reason, follow_up_draft,
status: new | awaiting_note | processed | saved,
notion_page_id
```

### Notion "Contacts" database (Bhuvanesh owns, freeze Day 2 AM 🔒 D5)
| Property | Type |
|---|---|
| Name | title |
| Profile link | url |
| Event | select |
| Role / company | rich text |
| Discussed | rich text |
| They need | rich text |
| Relevant project | select (not relation — simpler) 🔒 D5 |
| Why relevant | rich text |
| Next step | rich text |
| Due | date |
| Follow-up draft | rich text |
| Status | select |

## 9. AI specification

| | Call 1 — summarize | Call 2 — match & draft |
|---|---|---|
| Input | transcript, name-from-slug, event | call-1 JSON + list of user's projects (name + 1-line description, from Notion, cached) |
| Output (JSON, schema-validated) | `{name?, role?, company?, discussed[≤3], needs, next_step, next_step_date?}` | `{project: <name or null>, reason (quotes the note), follow_up_draft (≤80 words, user's voice)}` |
| Rules | Only facts from the transcript; unknown → empty string/null, never guessed (P-2). Voice note beats slug for role/company; slug name wins unless the note clearly corrects it. | Exactly one project or `"none"` (P-3). Reason must reference something actually said. Draft: friendly, no placeholders like `[Name]` left unfilled. |

- Provider/model: from the mentor's API key. 🔒 D2
- STT: Whisper API (or provider equivalent), language auto-detect DE/EN. 🔒 D7
- Both calls server-side; prompt files live in the repo so every member can explain them (AC-6.5).

## 10. Architecture

> Component views for current / Phase 1 / Phase 2: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

One small service + one page frontend (BPMN flow agreed in session, 23 Oct):

```
POST /api/contacts            {source, profile_url | photo}  → contact (name, link)
POST /api/contacts/:id/note   audio                          → processed contact JSON
PATCH /api/contacts/:id        edited fields                  → contact
POST /api/contacts/:id/save   —                              → {notion_url}
GET  /api/contacts?day=today  —                              → list
```

- Single process, synchronous pipeline (no queue at hackathon scale).
- Notion: one integration token, projects list cached in memory (refresh on demand). ⚠️ Phase 1: Supabase Postgres (RLS per user); projects are read from the `projects` table. Voice audio is sent to the Edge Function for transcription on stop and is not stored; transcript text is saved when the user taps Process. Notion sync design for Phase 2: [docs/DATA_MODEL.md §5](docs/DATA_MODEL.md).
- Stack: 🔒 D1 · Hosting with HTTPS (mic/camera need it): 🔒 D9

## 11. Risks

| Risk | Mitigation |
|---|---|
| Mic/camera blocked on stage (browser permissions, wifi) | Test on the demo phone early; HTTPS from Day 2; backup laptop; video fallback (M5) |
| LLM returns invalid JSON | Schema validation + one retry + empty-field fallback (FR-10) |
| Vision/badge path eats Day 2 | It's a fallback — cut to "Later" at the first sign of delay 🔒 D4 |
| Notion API hiccup during demo | Pre-saved rows already in the DB; demo continues on the Today list |
| German-language notes transcribe poorly | Decide demo language D7; rehearse with the exact demo note |

## 12. Decisions to lock in 🔒

> Go through this table as a team **today after the pitch** (15 min, Nodir facilitates). Record outcomes in PM_PLAN §9. "Rec" = recommendation to accept unless someone objects with a reason.

| ID | Decision | Options | Rec | Owner | Lock by |
|---|---|---|---|---|---|
| **D1** | Stack: frontend + backend | a) Plain HTML/JS + FastAPI b) React/Vite + Node c) Streamlit d) Lovable/no-code | **a or b — whatever Utkarsh + Nodir are fastest in**; decide with mentor (AC-2.1), then never switch | Nodir + Utkarsh + mentor | Fri 16:00 |
| **D2** | AI provider + models (LLM, STT, vision) | Depends on the key the mentor hands out | **One provider for all three if possible** — fewer keys, simpler cost slide | Utkarsh + mentor | Fri 16:00 |
| **D3** | QR scanning approach | a) Live camera + JS QR lib (html5-qrcode/jsQR) b) take photo → decode server-side | **a**, with b as silent fallback | Nodir | Fri EOD |
| **D4** | Badge-photo + vCard fallback: in MVP or Later? | a) In (Day 2 PM) b) Later list | **b if Day 2 slips, a otherwise** — demo needs only the QR path | Team | Sat 13:00 |
| **D5** | Notion schema freeze + M3 slice definition | Schema in §8; slice = scan→note→summary on screen | **Accept §8 as written; select not relation** | Bhuvanesh + Utkarsh | Sat 10:00 |
| **D6** | User model | a) Hardcoded single demo user b) Supabase email and Google login | **b** — private user accounts with per-user data isolation | Team | Updated 24 Oct |
| **D7** | Voice note language for the demo | a) English only b) German + English | **b supported (Whisper auto-detects), demo rehearsed in English** | Anastasiya + Utkarsh | Sat 13:00 |
| **D8** | Apify "Enrich" button | a) Feature-flagged build b) Later list + roadmap slide | **b** — €0.004/contact and ToS/GDPR gray zone; keep as evaluated option for judges' Q&A | Team | Fri 16:00 |
| **D9** | Hosting / live URL (must be HTTPS) | Vercel / Render / Railway / fly.io | **Whatever the stack from D1 deploys to in one command**; live URL by Sat evening | Utkarsh | Fri EOD |
| **D10** | Demo device + pitch speaker | Whose phone; who presents; who drives | Phone with the best camera + laptop backup; speaker per IDEA_PITCH | Team | Sat EOD |
| **D11** | Final price point | €9/mo vs other, after interview signal | Sadaf's call from real conversations | Sadaf | Sat EOD |

## 13. Milestones (from ACCEPTANCE_CRITERIA.md)

| Gate | What this PRD requires by then |
|---|---|
| **M2** Fri EOD | D1–D3, D6, D8, D9 locked; repo + keys set; Notion workspace exists |
| **M3** Sat midday | FR-1, 4, 5, 6 live end to end with a real AI call (slice per D5) |
| Sat EOD | FR-7, 9, 11 working; D4, D7 decided; real cost numbers to Sadaf |
| **M4** Sun PM | FR-10 solid; freeze; 3 clean runs; non-builder test passed |
| **M5/M6** Sun | Video; submission; every member can explain every FR and both prompts |
| **M7** Mon | Live demo on the D10 device |
