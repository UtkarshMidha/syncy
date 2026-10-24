# Syncy — Product build checklist

This checklist reflects the current PRD, implementation plan, backend brief, architecture, data model, schema, and app. The repo now requires authenticated Supabase accounts; project credentials, OAuth provider setup, deployment, and live verification remain external setup work.

## Scope and decisions

- **Phase 1:** Supabase is the source of truth with email/password and Google sign-in and per-user RLS. Projects are managed in Syncy; the user can match contacts automatically, assign projects manually, and edit later.
- **Phase 2 (post-hackathon):** Import/refresh projects from Notion, then optionally mirror contacts out. This keeps Notion import as a requested product capability without making it block the team's explicitly Supabase-only MVP.
- Supabase Edge Functions handle transcription and insights. OpenRouter is the LLM/STT provider; Vercel hosts the frontend.
- Use OpenRouter's Whisper transcription endpoint (`openai/whisper-1`); it accepts the same OpenRouter key as the text calls.
- Treat the $18 OpenRouter balance as a hard test budget across transcription and text calls: choose a low-cost model, bound prompts/output, log per-call usage/cost, and stop before exhausting the balance.
- Provider and service-role secrets stay server-side. Browser receives only the Supabase public key and requires a signed-in user; RLS scopes data to that user.

## Current state

- [x] Reviewed PRD, pitch, PM plan, implementation plan, acceptance criteria, data model, schema, prototype, and the new backend/architecture/business docs.
- [x] Phone flow and dashboard exist as clickable HTML/JS prototypes with invented seed data.
- [x] Prototype supports basic manual project assignment, editing, filters, and localStorage persistence.
- [x] New docs define a Phase 1 Supabase/Edge Function pipeline and defer Notion to Phase 2.
- [x] Supabase adapter, email/Google auth UI, password reset, per-user access, QR scan, stop-to-transcript voice flow, and Vercel build config are implemented.
- [ ] Supabase project/credentials, provider keys, and deployment still need to be configured outside the repo.
- [ ] No Notion connector exists (Phase 2 by current team plan).

## Phase 1 — Hackathon MVP

### Backend and data

- [ ] Lock/record D1 stack, D2 model and D9 HTTPS host in the PM plan.
- [ ] Apply migration `0001` and the contact reference ownership migration; configure email and Google Auth; verify two users see separate workspaces.
- [x] Add `supabase/seed.sql` with one fictional event, three projects with descriptions, and an invented contact.
- [x] Add gitignored client config template for the Supabase URL/public key; keep AI and service-role secrets in Edge Function secrets only.
- [x] Replace local data operations with a Supabase adapter while preserving phone/dashboard reads and writes.
- [x] Send voice audio to the Edge Function for transcription without storing the audio.

### Capture and AI processing

- [x] Implement camera QR scanning and LinkedIn/Xing/other URL parsing; insert/deduplicate contacts without scraping profile data.
- [x] Implement typed notes and up-to-60-second voice recording; captured contacts can be deferred.
- [x] Implement the `process-note` Edge Function with processing/review/error statuses and retry while retaining input.
- [x] Implement OpenRouter Whisper transcription on stop and show transcript before Process; save only transcript text.
- [x] Implement server-side OpenRouter structured insights, project match/reason/confidence, and follow-up draft; prompts are in the repo and malformed JSON retries once.
- [x] Match against active project names and descriptions. Leave unknown fields empty, limit discussed items to three, select one project or none, ground the reason in the note, and keep follow-up drafts to 80 words.
- [x] Preserve `project_set_by='user'` assignments through AI processing and retries; only write an AI suggestion if the user has not assigned a project.
- [x] Show processing progress, editable review, clear failure states, and retry while retaining note/audio/project selection.

### Manual assignment, editing, and dashboard

- [x] Allow project or “No project” assignment on note, review, and dashboard; persist user assignment and protect it from AI overwrite.
- [x] Persist review/dashboard edits to the same Supabase contact row through the shared adapter.
- [x] Keep capture `status` separate from relationship `stage`; only explicit review Save marks the contact saved.
- [x] Wire dashboard search, filters, sorting, and drawer edits to Supabase; retain the existing behavior.

### Launch and judging deliverables

- [ ] Configure Vercel Supabase URL/public-key environment variables and deploy; verify signup, email confirmation, Google login, reset, signout, and per-user data isolation.
- [ ] Measure latency, tokens/audio duration, and real cost per contact; give Sadaf the observed figures and update cost scenarios for 100/1,000/10,000 users.
- [ ] Complete three clean end-to-end demo runs, the non-builder usability test, and a fallback recording.
- [ ] Anastasiya: complete at least 8 interviews; record evidence/quotes; finalize ICP, positioning, GTM, and demo script.
- [ ] Sadaf: validate €9.99/month against interview evidence, verify competition/market figures, finalize unit economics and slides.
- [ ] Bhuvanesh: maintain cost log and dashboard-derived demo metrics.
- [ ] Finish official slides, AI tool disclosure, two rehearsals, Q&A prep, and live-demo preflight.
- [x] Update README with Supabase Auth, Google provider, SMTP, and Vercel setup.
- [ ] Add the final deployed URL and verify git history contains no secrets.

## Phase 2 — Notion projects in (requested follow-on)

- [ ] Add acceptance criteria for initial import, refresh, edits/deletions, auto-match, manual override, and later contact editing.
- [ ] Identify the Notion projects database/page and map its title and description properties; decide what to do when descriptions are blank.
- [ ] Design per-user Notion OAuth and project import permissions.
- [ ] Read projects server-side and upsert by Notion page ID into `projects`; verify the actual Postgres conflict target/unique index before implementing upsert.
- [ ] Add initial import and manual refresh controls with a clear result count and recoverable errors.
- [ ] Refresh renamed/edited projects and archive removed Notion projects without deleting rows or breaking existing contact links; exclude archived projects from AI matching.
- [ ] Preserve manually created projects and user-assigned contact projects.
- [ ] Consider contacts-out sync, rate-limit queue, and conflict handling only after projects-in is reliable; these are beyond the requested import workflow.

## Deferred beyond Phase 1

- [ ] Notion import/refresh (Phase 2, while remaining an explicit requested product feature).
- [ ] Contact write-back/two-way Notion sync, other notes-app connectors, multi-user auth/billing, automatic follow-up sending, and LinkedIn scraping.
- [ ] Badge/business-card vision extraction and vCard QR parsing unless the core MVP is complete early.

## Risks and dependencies

- The new team docs explicitly defer Notion; keep it visible as Phase 2 and do not let it block the Supabase MVP.
- Notion source database and title/description mapping are unknown; import cannot be reliable until identified.
- Whisper transcription and the LLM calls both draw from the OpenRouter balance; monitor their combined usage against $18.
- The schema enables per-user RLS, while the backend brief expects demo-user sign-in; configure auth before exposing the app.
- The project's nullable `external_source`/`external_id` uniqueness may not be a safe upsert conflict target in PostgreSQL; verify and add a partial unique index if required.
- The €0.02/contact estimate is unverified; use measured provider usage before claiming it.
