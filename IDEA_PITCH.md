# Idea Pitch — due Fri 23 Oct, 13:00

> Freeze at **12:45**, one dry run, then pitch. Acceptance criteria: [ACCEPTANCE_CRITERIA.md § M1](ACCEPTANCE_CRITERIA.md).
> **Update 23 Oct, after the pitch:** Phase 1 stores contacts and projects in Supabase (with an event picker, typed or voice notes and a contacts dashboard); Notion sync moves to Phase 2. See [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) and [docs/DATA_MODEL.md](docs/DATA_MODEL.md). The answers below are the pitch as given.
> ⚠️ = hypothesis, not yet backed by a conversation. Replace with real numbers from interviews before 12:45.

| # | Question | Our answer | Owner |
|---|---|---|---|
| 1 | **Problem** — who spends how much time on which task, and why? (one sentence) | A Berlin freelancer goes to ~2 networking events a month, meets 5–10 people at each, and the next day spends ~1 h ⚠️ trying to remember who was who and what was discussed — and still drops most follow-ups ⚠️ — because the LinkedIn connection holds the name and job title but not the conversation or why it mattered. | Research |
| 2 | **User** — one role you could find and talk to | Freelance consultants / developers who go to Berlin startup & networking events to find clients (several are in this building today). | Research |
| 3 | **Product** — what it does, in one line | Scan someone's LinkedIn/Xing QR code, record a 20-second voice note after the chat, and get a contact card in your Notion with what you talked about, which of your projects it matters for, and the next step. | PM |
| 4 | **What the AI does** — reads / sorts / drafts / searches documents / summarises | **Summarises** the voice note into who / what was discussed / what they need, **reads** your own Notion project list and **sorts** the contact to the project it fits (with a one-line reason), and **drafts** a follow-up message. Without the AI it is just a contact list. | Build |
| 5 | **Name** — product + team (≤ 5 min) | **Syncy** — product and team name | All |
| 6 | **Business case** — who pays, how much? What do they use today, why switch? Cost per month to run? *(Inside a company: who backs it, whose budget?)* | **Who pays:** the freelancer, €9/month ⚠️ (later: €19/seat for sales & BD teams). **Today:** LinkedIn connect + phone notes app + memory; CRMs like HubSpot are too heavy for one person and don't capture the conversation. **Why switch:** one met contact turned into a client pays for years of the app; saves ~1 h ⚠️ of post-event sorting. **Running cost:** ~€0.01 per contact (transcription + 2 short LLM calls) → < €5/month at hackathon scale, + free-tier hosting and Notion API. | Business |

**Evidence so far:** `TBD` — talk to 3 people in this room before 12:30 (they are our users: they are networking right now). Ask: *"Think of the last event you went to. How many people did you meet? What did you do with them afterwards? Which one did you lose track of?"*

**Speaker:** `TBD` · **Slot length:** `TBD`

---

### How it works (the one screen)

```
At the event                  Right after the chat           Next morning
──────────────                ─────────────────────          ─────────────────────────────
Scan QR (LinkedIn / Xing)  →  Hold to record 20-s note   →   Notion "Contacts" row:
  or photo of badge             "Runs procurement at X,        • who (profile link, role)
                                 needs a React dev in Q1,      • what we discussed
                                 call him next Tuesday"        • relevant to: <your project> — why
                                                               • next step + date
                                                               • draft follow-up message
```

### Decisions we already made (and why)

- **No LinkedIn scraping.** The QR code only gives us the profile URL; we store the link, not scraped data (scraping breaks LinkedIn's terms and is a demo risk). Name / role come from the voice note or a photo of the badge (vision model reads it).
- **Notion first, Drive later.** One integration only for the hackathon.
- **Demo data is fake.** Invented personas with fake profile URLs; the user's "projects" page is a demo Notion page.

### Pitch script (≤ 2 min)

1. **Hook (15 s):** "Raise your hand if you've opened LinkedIn after an event and had no idea who someone was."
2. **Problem (25 s):** sentence #1 + one real quote from this morning's interviews.
3. **Product (40 s):** the three steps above, show the sketch.
4. **AI (20 s):** it doesn't just save the contact — it tells you *which of your projects* this person matters for and what to do next.
5. **Business (20 s):** €9/month, ~€0.01 per contact, one client won = years paid.

---

### Reference level of detail (invented example from the Field Notes)

- **Problem:** Office manager at a small language school spends ~6 h/week answering the same enrolment emails, because dates, prices and levels sit in three documents.
- **User:** Office managers at language schools with 100–500 students.
- **Product:** Drafts a reply to every enrolment email from the school's own course info; the manager checks and sends.
- **AI does:** Reads the email, finds the course details, writes the answer.
- **Name:** ReplyDesk
- **Business case:** €49/month per school; saves ~5 h/week vs. replying by hand; running cost < €10/month.

### Feedback after pitch

| From | Feedback | Action |
|---|---|---|
| | | |
