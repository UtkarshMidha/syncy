# Business tasks — Anastasiya & Sadaf

> 24 Oct. These two own 40%+ of the judging score: real problem/user (20%), who pays & why switch (20%), and half of cost & dependencies (15%).
> Checkboxes mirror [IMPLEMENTATION_PLAN.md](../IMPLEMENTATION_PLAN.md); AC numbers from [ACCEPTANCE_CRITERIA.md](../ACCEPTANCE_CRITERIA.md). Price point per current pitch: **€9.99/month** (Sadaf confirms or changes it, D11).

---

## Anastasiya — user research · ICP · positioning · GTM · demo

### A1. User research (evidence that wins AC-7.2)

- [ ] Interview count: **≥ 8 total by Sun evening** (3 Fri ✅/❌ → 3 Sat → 2 Sun). Hunting grounds: this hackathon's other teams, CIC floors, the coffee machine, tonight's Berlin meetups.
- [ ] Use one script, log every conversation in PM_PLAN §4 (date, role, last event, time lost, workaround, signal).
- [ ] Extract these **numbers** (they replace the ⚠️ in IDEA_PITCH.md and go on the problem slide):
  - events per month · people met per event · minutes spent sorting contacts afterwards
  - % of met contacts never followed up · tool they use today · would they pay? how much?
- [ ] One **quotable quote per day** (verbatim, with role) for the slides.
- [ ] Day 3: run the non-builder usability test (AC-4.2) — someone outside the team completes scan → note → saved with no help; note every stumble for Nodir.

**Interview script (Mom Test — ask about the past, never pitch first):**
1. "When was your last networking event? How many people did you talk to?"
2. "What did you do with those contacts the next day? Show me, if you can."
3. "Think of one promising contact you lost track of — what happened?"
4. "How much time did the sorting/follow-ups take? What tool were you in?"
5. "Have you ever paid for anything to fix this?" (past behaviour = signal; "I would pay" = weak)
6. Only then show the prototype and watch — don't explain.

### A2. ICP one-pager (Sat EOD)

- [ ] Role: Berlin-based freelance consultant / developer who sells their own time
- [ ] Trigger moment: walks out of an event with 5–10 new LinkedIn connections and a client pipeline to fill
- [ ] Current stack: LinkedIn + phone notes + memory; has a projects/goals list somewhere
- [ ] Pains ranked (from interviews, not assumptions) · success metric: follow-ups actually sent
- [ ] Where they gather: which Berlin events/communities, by name (feeds GTM)

### A3. Positioning & messaging (Sat)

- [ ] One-liner: *For [freelancers who network for clients] who [lose the conversation the moment it ends], Syncy is [a capture tool] that [turns a 20-second voice note into a project-matched follow-up], unlike [LinkedIn + notes apps] it [remembers why the person mattered].*
- [ ] Three value props, each mapped to an interview pain: capture speed · "which of MY projects" relevance · ready follow-up draft
- [ ] Category framing: **not a CRM** — nothing to maintain; the note is the work.
- [ ] Objection list with answers, rehearsed for Q&A:
  - Privacy/GDPR → "we never scrape; the QR gives a link, your own voice note is the data; you review before anything is saved"
  - "I can type in my Notes app" → nothing links it to projects or drafts the follow-up
  - "Another subscription" → one recovered client pays for years (Sadaf's math)

### A4. GTM v1 (one slide, Sun)

- [ ] Channels ranked for the first 100 users: event organizers (co-branded "scan me" culture), Berlin tech communities, LinkedIn content, word of mouth at the event itself
- [ ] First-10-customers plan with **named** events/communities and dates
- [ ] Activation metric: first saved contact within 24 h of signup
- [ ] Phase 2 network-effect story: both-sided Syncy QR — every scan recruits the scanned person

### A5. Demo assets (with Nodir)

- [ ] Sat: demo script outline (AC-3.5) — enter event → scan → project chip → voice memo → review → dashboard; the story follows the freelancer, not the tech (AC-7.5)
- [ ] Sun: final script · ≤ 2-min video recorded, stored twice (M5) · 2 timed rehearsals

---

## Sadaf — economics · pricing · competition · market

### S1. Unit economics (the cost slide, AC-7.4)

- [ ] Fill the formula with **Utkarsh's measured numbers** (Sat PM — he owes you seconds + tokens per step):

```
cost_per_contact = STT(20–30 s) + LLM call 1 (summary) + LLM call 2 (match + draft)
                 ≈ €0.01–0.015  ⚠️ replace with measured
user/month: 2 events × 8 contacts = 16 contacts  →  ~€0.16–0.25 variable cost
fixed (hackathon scale): Supabase free tier €0 · hosting €0 · domain ~€1/mo
gross margin at €9.99: ~97%  ⚠️ recompute with real numbers
```

- [ ] Scenario table for 100 / 1,000 / 10,000 users: variable cost, and **where free tiers break** (Supabase Pro ~$25/mo, hosting, STT/LLM volume) — judges love this line
- [ ] Running-cost log with Bhuvanesh: every tool, plan, usage assumption, €/month (PM_PLAN §7, AC-4.4)

### S2. Pricing (AC-7.3, decision D11 is yours — Sat EOD)

- [ ] Tier ladder: **Free** (1 event or 10 contacts/mo, the hook) · **Pro €9.99/mo** (unlimited, dashboard) · **Team €19/seat/mo** (shared pipeline — Phase 2)
- [ ] Willingness-to-pay evidence: sit in on 2 interviews; ask "what do you pay for LinkedIn Premium / tools today?" (anchor), not "would you pay €9.99?"
- [ ] Why-switch math for the slide: 1 won client ≈ €2–10k for a freelancer vs €120/yr — payback in one contact
- [ ] Price objections + answers (too cheap to be serious? annual plan? student/community discount at events?)

### S3. Competition (one table, Sat)

| Alternative | Price | What it does | What it misses (our wedge) |
|---|---|---|---|
| LinkedIn + notes + memory (status quo) | €0 | stores the name | the conversation, the why, the next step |
| Blinq / HiHello | ~€0–7/mo | digital card exchange | nothing after the exchange |
| folk / Dex / Clay | ~€10–20/mo | personal CRM | manual entry; no at-event capture; no project match |
| HubSpot etc. | €20+/seat | team CRM | absurd overhead for one freelancer |

- [ ] Verify prices (15 min on their sites), fill gaps, one wedge sentence: *the only tool that captures the conversation in the moment and ties it to your own projects*
- [ ] Prep the "why can't LinkedIn just build this?" answer (they sell reach, not your pipeline; our data is the user's voice note, not their graph)

### S4. Market sizing (one slide, Sun — bottom-up beats top-down)

- [ ] Bottom-up: Berlin freelancers/consultants who network (⚠️ source it) × €120/yr → SOM; DE solo self-employed ≈ 1.4 M (⚠️ verify via Destatis) → SAM; + Phase 2 sales/BD seats → TAM
- [ ] Every number gets a source or a ⚠️; judges punish confident fiction harder than honest ranges

### S5. Slides & Q&A (Sun, AC-6.4)

- [ ] Final slides: who pays · price · why switch · monthly cost · dependencies + risks (LLM/STT provider pricing, Supabase limits, QR format changes — low)
- [ ] Judge Q&A prep: 10 likely business questions with one-line answers (margin? CAC? churn guess? why now? why you?)

---

## Joint checkpoints

- [ ] Sat 10:00 — agree the WTP question wording before the day's interviews
- [ ] Sat PM — "why switch" slide drafted together (story: Anastasiya · math: Sadaf)
- [ ] Sun — sanity-check the final price with 2 interviewees; lock D11 and record it in PM_PLAN §9
