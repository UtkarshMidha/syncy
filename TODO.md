# Syncy — Product build checklist

This checklist reflects the current PRD, implementation plan, backend brief, architecture, data model, schema, and app. The repo now requires authenticated Supabase accounts; project credentials, OAuth provider setup, deployment, and live verification remain external setup work.

## Scope and decisions

- **Phase 1:** Supabase is the source of truth with email/password and Google sign-in and per-user RLS. Projects are managed in Syncy; the user can match contacts automatically, assign projects manually, and edit later.
- **Notion import:** Users can copy projects from a shared Notion database into Syncy; contacts and project matching continue to use Supabase. Automatic refresh and contact write-back remain future work.
- Supabase Edge Functions handle transcription and insights. OpenRouter is the LLM/STT provider; Vercel hosts the frontend.
- Use OpenRouter's Whisper transcription endpoint (`openai/whisper-1`); it accepts the same OpenRouter key as the text calls.
- Treat the $18 OpenRouter balance as a hard test budget across transcription and text calls: choose a low-cost model, bound prompts/output, log per-call usage/cost, and stop before exhausting the balance.
- Provider and service-role secrets stay server-side. Browser receives only the Supabase public key and requires a signed-in user; RLS scopes data to that user.

## Current state

- [x] Reviewed PRD, pitch, PM plan, implementation plan, acceptance criteria, data model, schema, prototype, and the new backend/architecture/business docs.
- [x] Phone flow and dashboard exist as clickable HTML/JS prototypes with invented seed data.
- [x] Prototype supports basic manual project assignment, editing, filters, and localStorage persistence.
- [x] Supabase/Edge Function pipeline, per-user auth, and Vercel build configuration are implemented.
- [x] Supabase adapter, email/Google auth UI, password reset, per-user access, QR scan, stop-to-transcript voice flow, and Vercel build config are implemented.
- [ ] Supabase project/credentials, provider keys, and deployment still need to be configured outside the repo.
- [x] Notion OAuth, database selection, and one-way project import are implemented; external credentials, migration, deployment, and live verification remain.

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

## Notion project import

- [x] Initial import, repeat import, auto-match, and manual contact assignment behavior are implemented; missing descriptions import as blank.
- [x] Import discovers shared Notion data sources and maps the title property plus a description-like rich-text property; the user chooses the database in the app.
- [x] Design per-user Notion OAuth and project import permissions.
- [x] Read shared Notion data sources server-side; copy title and description into the authenticated user's `projects` rows.
- [x] Add project-screen connect, database selection, import, result count, and recoverable error states.
- [x] Re-import updates the existing project by Notion page ID without changing its project UUID/contact links; missing Notion pages remain in Syncy.
- [ ] Apply the connection-table migration, create a public Notion integration, configure secrets/redirect URLs, deploy the Edge Function, and verify against a real workspace.
- [x] Preserve manually created projects and user-assigned contact projects; repeat imports retain project UUIDs/contact links.
- [ ] Consider contacts-out sync and conflict handling only if they become product requirements; they are outside the requested import workflow.

## Deferred beyond Phase 1

- [ ] Automatic Notion refresh, project deletion handling, contact write-back/two-way Notion sync, and other notes-app connectors.
- [ ] Other notes-app connectors, billing, automatic follow-up sending, and LinkedIn scraping.
- [ ] Badge/business-card vision extraction and vCard QR parsing unless the core MVP is complete early.

## Risks and dependencies

- Users must share the Notion database with the public integration during OAuth; only shared data sources are visible to import.
- The importer uses the title property as the project name and prefers a rich-text property named Description, Summary, Details, or Goal.
- Whisper transcription and the LLM calls both draw from the OpenRouter balance; monitor their combined usage against $18.
- The schema enables per-user RLS, while the backend brief expects demo-user sign-in; configure auth before exposing the app.
- The €0.02/contact estimate is unverified; use measured provider usage before claiming it.
