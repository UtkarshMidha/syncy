# Syncy — data model and sync (Phase 1 / Phase 2)

> Current: Supabase stores events, projects, and contacts. Users can connect Notion and copy project titles/descriptions into Syncy; Notion remains read-only from Syncy's perspective.
> Schema: [supabase/migrations/0001_phase1_schema.sql](../supabase/migrations/0001_phase1_schema.sql) · Frontend mirror: [prototype/data.js](../prototype/data.js) (same tables, same column names).

## 1. Phase 1 flow

```
Today: choose event (edit its details if needed) ─or─ create event ──▶ [Enter event]
   │
   ▼
Scan QR ──▶ row INSERTED at once (status = captured): profile_url, profile_slug, name-from-slug, event_id
   │
   ▼
Note: ✍️ type it  ─or─  🎙️ voice memo (audio → Edge Function → transcript in note_text)      [Skip = note later]
   │
   ▼
Processing (status = processing): LLM summarises note_text, compares with the user's projects table,
                                  suggests project_id + match_reason, drafts follow-up
   │
   ▼
Review (status = review): user edits any field, assigns / changes the project ──▶ [Save] (status = saved)
   │
   ▼
Dashboard: filter, sort, edit everything later (stage, project, next step, notes …)
```

| Step | What's written to `contacts` |
|---|---|
| Scan | `source`, `profile_url`, `profile_slug`, `name`, `event_id`, `scanned_at`, `status='captured'` |
| Project pick (optional, right after scan) | `project_id`, `project_set_by='user'`, `match_reason`; processing then keeps this project instead of the AI's suggestion |
| Note | `note_kind`, `note_text` (voice transcript); `audio_path` is legacy only |
| Processing | `status='processing'` → AI fields: `summary`, `discussed[≤3]`, `needs`, `project_id`, `match_reason`, `match_confidence`, `project_set_by='ai'`, `next_step`, `next_step_date`, `follow_up_draft`, then `status='review'` |
| Review / Save | any edited field; changing the project sets `project_set_by='user'`; `status='saved'` |
| Dashboard | `stage`, `user_notes` and any field above |

## 2. Tables

### `events`
| Column | Type | Notes |
|---|---|---|
| id | uuid | |
| user_id | uuid | `auth.uid()`; RLS |
| name | text | "BCBT AI Hackathon" |
| location | text | "CIC Berlin" |
| url | text | Event page link, optional; must start with `http(s)://` |
| starts_on | date | default today |
| created_at, updated_at | timestamptz | |

### `projects`
| Column | Type | Notes |
|---|---|---|
| id, user_id | uuid | |
| name | text | "Client work: React dashboards" |
| description | text | **What the AI matches against** — one or two sentences of goals |
| emoji | text | |
| archived | bool | hidden from matching |
| external_source, external_id, external_updated_at | | Notion import source, page ID, and source edit time |

### `contacts`
| Group | Columns |
|---|---|
| Keys | id, user_id, event_id → events, project_id → projects |
| Scan | source (`qr_linkedin` · `qr_xing` · `qr_other` · `manual`), profile_url, profile_slug, name, role, company, scanned_at |
| Note | note_kind (`text` · `voice`), note_text, `audio_path` (legacy rows only) |
| AI output | summary, discussed text[≤3], needs, match_reason, match_confidence (`high` · `medium` · `low`), project_set_by (`ai` · `user`), next_step, next_step_date, follow_up_draft |
| Management | status (`captured` · `processing` · `review` · `saved` · `error`), stage (`to_follow_up` · `followed_up` · `meeting_set` · `won` · `not_relevant`), user_notes |
| Phase 2 | external_id, external_synced_at |
| Time | created_at, updated_at (trigger) |

Two different "states", on purpose:
- **status** = where the row is in the capture pipeline (the phone app cares).
- **stage** = where the relationship is (the dashboard cares).

Rules in the schema: one row per person per event (`unique (user_id, event_id, profile_url)`), `discussed` max 3 items, RLS so every user only sees their own rows. The private `voice-notes` bucket remains for cleaning up recordings created by the earlier flow; new recordings are not stored there.

## 3. Frontend data access

`prototype/data.js` is the shared Supabase adapter for the phone app and dashboard. It uses the schema's snake_case columns, reads the authenticated user's session, and scopes inserts and updates by that user's ID. Both pages share the same project, event, and contact rows.

## 4. Dashboard ↔ schema

| Dashboard column / control | Column(s) |
|---|---|
| Person | name, role, company, source, profile_url |
| Summary | summary (drawer: + discussed, needs, note_text) |
| Project (filter, editable) | project_id → projects.name, match_reason, project_set_by |
| Next step (sort, editable) | next_step, next_step_date |
| Stage (filter, editable) | stage |
| Met at (filter, sort) | event_id → events.name, events.starts_on, events.url (link) |
| Pipeline badge ("Needs a note") | status |
| Your notes | user_notes |

## 5. Notion projects — one-way import

Supabase is the source of truth after import. Notion is read-only; project copies are used by the existing Syncy project matching and assignment flows.

### 5.1 Projects in (knowledge base → Supabase)
1. User connects a Notion public integration with OAuth and shares a projects data source.
2. A Supabase Edge Function lists accessible data sources and reads selected rows via Notion's API.
3. Project title and description are copied into `projects` with `external_source='notion'`, the Notion page ID in `external_id`, and `last_edited_time` in `external_updated_at`.
4. Importing again updates the same project row by Notion page ID, preserving the Syncy project UUID and contact links. Rows missing from Notion remain in Syncy.
5. OAuth state and access/refresh tokens are stored in a service-role-only connection table; the browser never receives Notion tokens.

### 5.2 Contacts out (future; not implemented)
1. A **database webhook** on `contacts` (insert / update where `status = 'saved'`) calls an Edge Function.
2. It creates the Notion page the first time (`pages.create`, stores the id in `external_id`) and updates it afterwards (`pages.update`), then sets `external_synced_at`.
3. Notion allows ~3 requests/second per integration, so writes go through a small queue table (or Supabase Queues) with retries.

### 5.3 Conflicts
- Fields Syncy creates (summary, match, draft) → **Supabase wins**.
- If two-way editing is wanted for a few fields (stage, user notes, next step date): **last write wins**, comparing `updated_at` with Notion's `last_edited_time`.

### 5.4 Other notes apps
| App | How | Effort |
|---|---|---|
| Notion | Official API + OAuth (above) | Medium, best first target |
| Google Docs / Drive | Drive + Docs API, OAuth; read a "Projects" doc, export contacts to a Sheet | Medium |
| Obsidian | Markdown files in the vault; community sync plugin or a folder export | Medium |
| Evernote | Official API | Medium |
| Apple Notes | **No public API**; only on-device via Shortcuts. Realistic option: share/export, not live sync | High / limited |

Automatic polling/webhooks, Notion deletions, contact write-back, and two-way conflict handling remain future work.
