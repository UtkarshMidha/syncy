# Acceptance Criteria

> Derived from the BCBT Hackathon Field Notes. Each milestone has a gate: all ACs must pass before moving on.
> Product-specific ACs (section P) are filled once the idea is chosen.
> Format: **Given / When / Then** for behaviour, checklists for deliverables.

| Milestone | When | Gate owner |
|---|---|---|
| M1 Idea pitch | **Fri 23 Oct, 13:00** | PM |
| M2 Stack + build plan | Fri 23 Oct, end of day | Build lead |
| M3 End-to-end slice | Sat 24 Oct, midday | Build lead |
| M4 Feature freeze | Sun 25 Oct, afternoon | PM |
| M5 Demo video | Sun 25 Oct | Demo lead |
| M6 Submission | Sun 25 Oct, end of day | PM |
| M7 Live demo | Mon 26 Oct | PM + speaker |

---

## M1 — Early idea pitch (13:00 today)

**AC-1.1 Problem**
- [ ] One sentence that names **who**, **how much time** (or €), **which task**, and **why** it happens.
- [ ] Passes the 5-question filter with ≥ 4 yeses (weekly · quantifiable · existing workaround · AI-suited core · rough version by Day 2 midday).

**AC-1.2 User**
- [ ] One role we could find and talk to this weekend (e.g. "office manager at a language school"), not a sector ("schools").
- [ ] At least **1 real conversation** with someone in or near that role, about their last week (Mom Test), logged in PM_PLAN §4.

**AC-1.3 Product**
- [ ] What it does, in **one line**.
- [ ] Scope is one user · one task · one screen; everything else is on the "Later" list.

**AC-1.4 What the AI does**
- [ ] Names the AI job explicitly: reads / sorts / drafts / searches documents / summarises.
- [ ] Given the AI step were removed, then the product would no longer work (the AI is not decoration).

**AC-1.5 Name**
- [ ] One name used for both product and team. Decided in ≤ 5 minutes.

**AC-1.6 Business case**
- [ ] Who pays and a concrete price (€ / month / unit).
- [ ] What they use today and why they would switch (hours or € saved).
- [ ] First estimate of monthly running cost.
- [ ] *If inside a company:* named sponsor role and whose budget pays.

**AC-1.7 Delivery**
- [ ] All six answers written in [IDEA_PITCH.md](IDEA_PITCH.md) by **12:45**.
- [ ] One dry run done; pitch fits in the given slot (target ≤ 2 min).
- [ ] Speaker chosen; every team member can state the problem in their own words.
- [ ] Mentor feedback captured in PM_PLAN §9 within 15 min after the pitch.

---

## M2 — Stack & build plan (end of Day 1)

- [ ] **AC-2.1** Tool stack chosen **with the mentor** and recorded in PM_PLAN §5; team commits not to switch.
- [ ] **AC-2.2** API key received; stored in `.env`; `.env` is in `.gitignore`; key shared only in the team channel. Given a fresh clone of the repo, when searching for the key, then it is not found.
- [ ] **AC-2.3** GitHub repo exists and every team member can access it.
- [ ] **AC-2.4** Data source chosen: fake or open data only (Mockaroo, Kaggle, Berlin / EU Open Data). No real personal data.
- [ ] **AC-2.5** Day 2 backlog written with owners; every team member has a task for the morning.
- [ ] **AC-2.6** First sketch of the one main screen exists.

---

## M3 — End-to-end by Day 2 midday

- [ ] **AC-3.1** Given the target user's input, when they run the product, then a **real AI model call** is made and the result appears on screen. (Rough UI is fine.)
- [ ] **AC-3.2** The flow runs start → finish without a developer stepping in manually.
- [ ] **AC-3.3** Shown running to the mentor at the midday check-in.
- [ ] **AC-3.4** Price and cost-per-month model v1 drafted (business lead).
- [ ] **AC-3.5** Demo script outline drafted (demo lead).

---

## M4 — Feature freeze (Day 3 afternoon)

- [ ] **AC-4.1** Main path works on demo data 3 runs in a row without errors.
- [ ] **AC-4.2** Given someone who **did not build it**, when they use it with only the on-screen instructions, then they complete the main task unaided.
- [ ] **AC-4.3** After freeze: no new features merged — only fixes (enforced by PM).
- [ ] **AC-4.4** Running-cost log complete for every tool / service used.

---

## M5 — Demo video (Day 3)

- [ ] **AC-5.1** ≤ 2-minute screen recording showing the product working end to end with real AI output.
- [ ] **AC-5.2** Stored locally on the presenter laptop **and** one backup location.

---

## M6 — Submission (end of Day 3)

- [ ] **AC-6.1** GitHub link submitted; repo has a README with what it does, how to run it, and the live URL.
- [ ] **AC-6.2** Slides submitted in the **official template** (Gamma drafts allowed, final in template).
- [ ] **AC-6.3** Slides list **every AI tool used and what for** (AI policy).
- [ ] **AC-6.4** Slides cover: user, problem, product, what the AI does, price, monthly cost, why switch, dependencies.
- [ ] **AC-6.5** Every team member can explain every part of the product (AI policy).
- [ ] **AC-6.6** No secrets in the repo history.

---

## M7 — Live demo (Day 4)

Mapped to the judging weights:

| Weight | AC | Pass condition |
|---|---|---|
| 30% | **AC-7.1 Works live** | Product runs live on stage with real AI calls; fallback video ready if it fails. |
| 20% | **AC-7.2 Real problem / real user** | One named user role + evidence from real conversations (quotes, hours lost). |
| 20% | **AC-7.3 Who pays & why switch** | Price, buyer, current alternative, and switching reason stated in one slide. |
| 15% | **AC-7.4 Cost & dependencies** | Monthly running cost with breakdown; key dependencies + risk named. |
| 15% | **AC-7.5 Demo quality** | Rehearsed ≥ 2×; within time; story follows the user, not the tech. |

- [ ] **AC-7.6** Pre-flight checklist (PM_PLAN §8) completed 1 hour before the slot.

---

## P — Product acceptance criteria (Phase 1)

> Phase 1 stores everything in Supabase; Notion / notes-app sync is Phase 2. Screens: [prototype/](prototype/) · schema: [supabase/migrations/0001_phase1_schema.sql](supabase/migrations/0001_phase1_schema.sql) · build map: [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md).

**P-1 Choose, create or edit the event**
- Given a freelancer opening the app with no active event
- When they pick an event, or create one (name, place, date, optional link), or edit the selected event's details
- Then the event is saved in `events` and **Enter event** opens the event home
- And an event link that isn't a web address is rejected with a clear message

**P-2 Capture a contact (scan)**
- Given the user is inside an event
- When they scan a LinkedIn, Xing or other profile QR code
- Then within 3 s a `contacts` row exists with `profile_url`, `profile_slug`, a name derived from the slug, `event_id` and `status='captured'`
- And scanning the same person again at the same event opens the existing row instead of creating a duplicate
- And no profile data is scraped; only the URL is stored

**P-3 Assign a project by hand**
- Given a contact was just scanned
- When the user taps one of their projects (or "No project") on the note screen
- Then `project_id` and `project_set_by='user'` are saved immediately, even if the user skips the note
- And the AI keeps that project instead of suggesting another

**P-4 Note → structured contact (typed or voice)**
- Given a captured contact
- When the user writes a note, or records a voice memo of up to 60 s, and taps Process
- Then within 15 s the review screen shows: name, role, company, summary, what was discussed (≤ 3), what they need, next step + date, follow-up draft
- And a voice memo is stored in the private `voice-notes` bucket and transcribed into `note_text`
- And fields the AI cannot fill are left empty, not invented
- And "Later" keeps the contact on the list with a "Needs a note" badge

**P-5 Match to the user's projects**
- Given the user's projects are stored in `projects` (added in the Projects tab)
- When a contact is processed and no project was picked by hand
- Then the AI suggests the single best-fitting project (or none) with a one-line reason that quotes the note, and `project_set_by='ai'`

**P-6 Review and save**
- Given the review screen
- When the user edits any field, changes the project, and taps Save
- Then the row is updated with the edits and `status='saved'`
- And nothing is sent to the contact automatically

**P-7 Error handling**
- Given the AI call fails or times out, when the user processes a note, then a clear message and Retry are shown, the row gets `status='error'`, and the note and recording are kept.

**P-8 Dashboard**
- Given saved and captured contacts from several events
- When the user searches, filters (project, event, due date, capture status, source, stage) and sorts (next follow-up, recently met, name, project, stage)
- Then the list updates immediately and every field, the stage and personal notes can be edited and are saved to the same row the phone app uses

**P-9 Data**
- Given any demo, then only invented personas, fictional companies and fake profile URLs are used, every user only sees their own rows (RLS), and no API key appears client-side.
