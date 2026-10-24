# Syncy

Capture a networking contact, add a typed note or voice memo, and review AI generated insights and a project match. Events, projects, contacts, and note text are stored in Supabase. Voice audio is sent to the Edge Function for transcription and is not stored. Projects can be copied from a user's Notion workspace into Syncy.

## Supabase setup

1. Create a Supabase project.
2. For a new project, in SQL Editor apply `supabase/migrations/0001_phase1_schema.sql`, then `supabase/migrations/20261024110339_enforce_contact_reference_ownership.sql`. If Phase 1 schema is already installed, apply only the new ownership migration. Skip `supabase/seed.sql` for real accounts; new users start with empty workspaces.
3. In **Authentication → URL Configuration**, set the Site URL to `https://YOUR_APP.vercel.app`. Add `http://localhost:5173/login.html`, `https://YOUR_APP.vercel.app/login.html`, and any Vercel preview `login.html` URL patterns you use to the redirect allow list. Password confirmation and recovery links return to these URLs.
4. In **Authentication → Providers → Google**, enable Google and enter its OAuth web client ID and secret. Use the callback URI shown in Supabase as Google's authorized redirect URI; add `http://localhost:5173` and your Vercel domain as authorized JavaScript origins.
5. If users will sign in with email/password, configure production SMTP in Supabase Auth for confirmation and password-reset emails. Google sign-in works without SMTP.
6. Copy `prototype/config.example.js` to `prototype/config.js` and fill in the project URL and anon/publishable key. `config.js` is gitignored.
7. Deploy `supabase/functions/process-note` and set its secrets:

   ```sh
   supabase login
   supabase link --project-ref YOUR_PROJECT_REF
   supabase functions deploy process-note
   supabase secrets set OPENROUTER_API_KEY=YOUR_KEY OPENROUTER_MODEL=YOUR_MODEL
   ```

   The function uses OpenRouter for Whisper transcription when recording stops, then two text calls when the user taps Process. Keep the OpenRouter key in Supabase Function secrets, never in browser config.

## Import projects from Notion

1. Create a **public** integration in the [Notion developer portal](https://www.notion.so/profile/integrations). Enable read access to content. Add both redirect URLs to the integration:
   - `http://localhost:5173/notion-callback.html`
   - `https://YOUR_APP.vercel.app/notion-callback.html`
2. In Supabase, apply `supabase/migrations/20261024132504_notion_project_import.sql` in SQL Editor. It creates a per-user connection table whose OAuth tokens are only accessible to the Edge Function service role.
3. Set the Notion integration secrets and deploy the importer:

   ```powershell
   supabase functions deploy notion-projects
   supabase secrets set NOTION_CLIENT_ID=YOUR_NOTION_CLIENT_ID NOTION_CLIENT_SECRET=YOUR_NOTION_CLIENT_SECRET 'NOTION_REDIRECT_URIS=http://localhost:5173/notion-callback.html,https://YOUR_APP.vercel.app/notion-callback.html'
   ```

4. In Syncy, open **Projects → Connect Notion**, approve access, and share the page/database containing your projects in Notion's page picker. Back in Syncy, choose the projects data source and click **Import projects**.

The importer copies the Notion title and description into Syncy's `projects` table. It updates imported rows by Notion page ID on later imports, leaving contact links intact. Notion edits are copied only when you import again; deleting a page in Notion does not delete its Syncy copy. Syncy never writes contacts or project edits back to Notion. The integration secret and user tokens remain server-side. Add any additional local, production, or preview callback URLs both in the Notion integration and the `NOTION_REDIRECT_URIS` secret.

## Run locally

Serve the `prototype` directory from localhost:

   ```sh
   python -m http.server 5173 --directory prototype
   ```

   Open `http://localhost:5173` and `http://localhost:5173/dashboard.html`. Camera/microphone access requires localhost or HTTPS.

## Deploy to Vercel

Import the repository with its root as the Vercel project root. `vercel.json` runs `node scripts/vercel-build.mjs` and publishes `prototype/`. Add these Vercel environment variables for Production and Preview, then redeploy:

```text
SYNCY_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SYNCY_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_OR_ANON_KEY
```

The build generates `prototype/config.js`; no account password or OpenRouter key is placed in the browser. Supabase Auth sends users through `login.html` before opening the app or dashboard.

## Security and limits

- Browser receives only Supabase's anon/publishable key; RLS and ownership checks isolate each signed-in user's rows.
- OpenRouter, Whisper, and service-role credentials stay server-side in Supabase.
- New accounts start with an empty workspace; add projects and events in the app.
- Check provider pricing and set a spend limit before processing audio; transcription and chat both draw from the OpenRouter balance.
