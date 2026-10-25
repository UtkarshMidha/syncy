// Shared data adapter: live Supabase when config.js is present, otherwise the local prototype.
(function () {
  const TODAY = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  const KEY = 'syncy-db-v1';

  const t = (date, time = '12:00') => `${date}T${time}:00+02:00`;

  const EVENTS = [
    // Event URLs other than the hackathon's own page are placeholders on example.com.
    { id: 'ev-bcbt', name: 'BCBT AI Hackathon', location: 'CIC Berlin', url: 'https://berlincollege.de/hackathon', starts_on: '2026-10-23' },
    { id: 'ev-bfm', name: 'Berlin Frontend Meetup', location: 'Factory Görlitzer Park', url: 'https://events.example.com/berlin-frontend-meetup-oct', starts_on: '2026-10-15' },
    { id: 'ev-fnb', name: 'Founders Night Berlin', location: 'Mitte', url: 'https://events.example.com/founders-night-berlin', starts_on: '2026-10-08' },
    { id: 'ev-ktm', name: 'Kreuzberg Tech Mixer', location: 'Kreuzberg', url: null, starts_on: '2026-09-30' },
  ];

  const PROJECTS = [
    { id: 'pr-client', emoji: '💼', name: 'Client work: React dashboards',
      description: 'Land 2 new freelance clients for Q1: React, data dashboards, frontend, KPI and analytics work, migrations.' },
    { id: 'pr-cofounder', emoji: '🚀', name: 'Co-founder search: HR-tech',
      description: 'Find a sales-minded co-founder, pilot customers and investors for an employee onboarding tool (HR, hiring, onboarding).' },
    { id: 'pr-speaking', emoji: '🎤', name: 'Speaking & visibility',
      description: 'Get a meetup or conference talk slot in Berlin this winter; podcasts, workshops, talks, speaker slots.' },
  ];

  // Shape of one contacts row with every column, as in the schema.
  function contactRow(fields) {
    return {
      id: null, event_id: null, project_id: null,
      source: 'qr_linkedin', profile_url: '', profile_slug: null, name: null, role: null, company: null, scanned_at: null,
      note_kind: null, note_text: null, audio_path: null,
      summary: null, summary_edited_by_user: false, discussed: [], needs: null, match_reason: null, match_confidence: null, project_set_by: null,
      next_step: null, next_step_date: null, follow_up_draft: null,
      status: 'captured', stage: 'to_follow_up', user_notes: null,
      external_id: null, external_synced_at: null,
      created_at: null, updated_at: null,
      ...fields,
    };
  }

  const seed = (id, ev, at, f) => contactRow({ id, event_id: ev, scanned_at: at, created_at: at, updated_at: at, status: 'saved', project_set_by: 'ai', match_confidence: 'high', note_kind: 'voice', ...f });

  const CONTACTS = [
    seed('ct-aylin', 'ev-bcbt', t('2026-10-23', '11:05'), {
      source: 'qr_linkedin', profile_url: 'https://linkedin.com/in/aylin-demir-demo', profile_slug: 'aylin-demir-demo',
      name: 'Aylin Demir', role: 'Organiser', company: 'Berlin Frontend Meetup', project_id: 'pr-speaking',
      note_text: 'Aylin runs the Berlin Frontend Meetup. They still have open speaker slots in December, she liked the idea of a talk about building dashboards fast. Send her a title and two sentences by Friday.',
      summary: 'Has open speaker slots in December; liked a talk idea on building dashboards fast.',
      discussed: ['Runs the Berlin Frontend Meetup', 'Open speaker slots in December', 'Liked the dashboards talk idea'],
      needs: 'Speakers for the December meetup.',
      match_reason: 'Direct path to the Berlin talk slot you want this winter: “still have open speaker slots in December”.',
      next_step: 'Send talk title + abstract', next_step_date: '2026-10-30',
      follow_up_draft: 'Hi Aylin, thanks for the chat! Talk idea for December: "Shipping a data dashboard in a weekend". Happy to adjust to your audience.' }),
    contactRow({ id: 'ct-priya', event_id: 'ev-bcbt', scanned_at: t('2026-10-23', '11:40'), created_at: t('2026-10-23', '11:40'), updated_at: t('2026-10-23', '11:40'),
      source: 'qr_linkedin', profile_url: 'https://linkedin.com/in/priya-raman-7b2a1', profile_slug: 'priya-raman-7b2a1', name: 'Priya Raman', status: 'captured' }),
    seed('ct-marco', 'ev-bfm', t('2026-10-15', '19:20'), {
      source: 'qr_linkedin', profile_url: 'https://linkedin.com/in/marco-rossi-demo', profile_slug: 'marco-rossi-demo',
      name: 'Marco Rossi', role: 'CTO', company: 'Parkwise', project_id: 'pr-client',
      summary: 'Wants to move their parking admin dashboard from jQuery to React; asked for a rough estimate.',
      discussed: ['Admin dashboard is legacy jQuery', 'Team of 3, no frontend specialist', 'Wants an estimate before budgeting'],
      needs: 'An estimate for a React migration of the admin dashboard.',
      match_reason: 'A concrete migration project you could quote for this quarter: “can you send me a rough estimate”.',
      next_step: 'Send a rough estimate', next_step_date: '2026-10-20',
      follow_up_draft: 'Hi Marco, good to meet at the Frontend Meetup. Here is a rough estimate for moving the Parkwise admin dashboard to React, split into three phases.' }),
    seed('ct-sophie', 'ev-bfm', t('2026-10-15', '20:05'), {
      source: 'qr_linkedin', profile_url: 'https://linkedin.com/in/sophie-laurent-demo', profile_slug: 'sophie-laurent-demo',
      name: 'Sophie Laurent', role: 'Product Manager', company: 'Kiezkauf', project_id: 'pr-client', match_confidence: 'medium',
      summary: 'Wants better charts in the merchant analytics page; budget decision after their funding round.',
      discussed: ['Merchant analytics page needs charts', 'Funding round closes in November', 'Prefers a freelancer over an agency'],
      needs: 'Charts for the merchant analytics page, maybe Q1.',
      match_reason: 'Likely Q1 dashboard work once their round closes: “after the round closes we can talk budget”.',
      next_step: 'Check in after their funding round', next_step_date: '2026-11-10', stage: 'followed_up',
      follow_up_draft: 'Hi Sophie, hope the round is going well! Happy to sketch a few chart ideas for the merchant analytics page whenever it suits you.' }),
    seed('ct-tobias', 'ev-bfm', t('2026-10-15', '20:30'), {
      source: 'qr_xing', profile_url: 'https://xing.com/profile/Tobias_Krueger_demo', profile_slug: 'Tobias_Krueger_demo',
      name: 'Tobias Krüger', role: 'Freelance UX designer', company: 'Self-employed', project_id: 'pr-speaking', note_kind: 'text',
      summary: 'Suggested co-hosting a design-meets-code workshop at the meetup.',
      discussed: ['Runs UX workshops', 'Idea: joint design + React workshop', 'Could also refer clients'],
      needs: 'A developer to co-host a workshop.',
      match_reason: 'A workshop raises your visibility with the same audience: “we could do a workshop together”.',
      next_step: 'Agree on the workshop topic', next_step_date: '2026-10-22', stage: 'followed_up',
      follow_up_draft: 'Hi Tobias, still keen on the workshop idea. How about "From Figma to a working dashboard in 90 minutes"?' }),
    seed('ct-mina', 'ev-fnb', t('2026-10-08', '19:10'), {
      source: 'qr_linkedin', profile_url: 'https://linkedin.com/in/mina-park-demo', profile_slug: 'mina-park-demo',
      name: 'Mina Park', role: 'HR Director', company: 'Brightwork GmbH', project_id: 'pr-cofounder',
      summary: 'Onboarding 300 staff by hand in spreadsheets; open to being a pilot customer.',
      discussed: ['300 employees, onboarding in spreadsheets', 'New hires wait days for accounts', 'Open to a pilot'],
      needs: 'A simpler onboarding process for new hires.',
      match_reason: 'A potential first pilot customer for the HR-tech idea: “we would try it as a pilot”.',
      next_step: '30-min problem interview', next_step_date: '2026-10-24', stage: 'meeting_set',
      follow_up_draft: 'Hi Mina, thanks again for offering to talk. Looking forward to our 30 minutes on Saturday about how onboarding works at Brightwork today.' }),
    seed('ct-david', 'ev-fnb', t('2026-10-08', '19:45'), {
      source: 'qr_linkedin', profile_url: 'https://linkedin.com/in/david-okafor-demo', profile_slug: 'david-okafor-demo',
      name: 'David Okafor', role: 'Angel investor', company: 'Independent', project_id: 'pr-cofounder', note_kind: 'text',
      summary: 'Invests in pre-seed HR-tech; wants to see traction (three pilots) before talking money.',
      discussed: ['Writes €25–50k pre-seed tickets', 'Likes HR-tech', 'Wants 3 pilots first'],
      needs: 'Traction: three pilot customers.',
      match_reason: 'A likely first investor once pilots are running: “come back when you have three pilots”.',
      next_step: 'Send an update once 3 pilots run', next_step_date: '2026-12-01', stage: 'followed_up',
      follow_up_draft: 'Hi David, quick update as promised: we have our first pilot conversations lined up. I will share numbers once three pilots are live.' }),
    seed('ct-clara', 'ev-fnb', t('2026-10-08', '20:15'), {
      source: 'qr_linkedin', profile_url: 'https://linkedin.com/in/clara-schmidt-demo', profile_slug: 'clara-schmidt-demo',
      name: 'Clara Schmidt', role: 'Engineering Manager', company: 'Fahrwerk Mobility', project_id: 'pr-client',
      summary: 'Signed a 3-month contract for a React fleet dashboard. Kick-off next week.',
      discussed: ['Fleet dashboard for 2,000 vehicles', '3-month contract', 'Team in Berlin and Lisbon'],
      needs: 'A React contractor for 3 months.',
      match_reason: 'Turned into a signed client project: “we need someone for three months”.',
      next_step: 'Kick-off call', next_step_date: '2026-10-26', stage: 'won',
      follow_up_draft: 'Hi Clara, excited to start! I have sent the kick-off agenda for Monday.' }),
    seed('ct-felix', 'ev-fnb', t('2026-10-08', '21:00'), {
      source: 'qr_xing', profile_url: 'https://xing.com/profile/Felix_Braun_demo', profile_slug: 'Felix_Braun_demo',
      name: 'Felix Braun', role: 'Podcast host', company: 'Berlin Builds podcast', project_id: 'pr-speaking', match_confidence: 'medium',
      summary: 'Invited you as a guest on his podcast about Berlin freelancers.',
      discussed: ['Weekly podcast, ~2,000 listeners', 'Episodes on freelancing', 'Records in his Neukölln studio'],
      needs: 'Guests with a freelancing story.',
      match_reason: 'A podcast episode puts you in front of potential clients: “come on the show”.',
      next_step: 'Pick a recording date', next_step_date: null,
      follow_up_draft: 'Hi Felix, I would love to come on Berlin Builds. Which dates work for recording in November?' }),
    seed('ct-anna', 'ev-ktm', t('2026-09-30', '18:50'), {
      source: 'qr_linkedin', profile_url: 'https://linkedin.com/in/anna-novak-demo', profile_slug: 'anna-novak-demo',
      name: 'Anna Novak', role: 'Recruiter', company: 'Talentbridge', project_id: null, match_confidence: null, note_kind: 'text',
      summary: 'Recruits for full-time roles only; not a fit for freelance work right now.',
      discussed: ['Full-time roles only', 'Mostly backend positions', 'Might hire freelancers next year'],
      needs: 'Full-time candidates.',
      match_reason: 'No match with your current projects.',
      next_step: 'No follow-up needed', next_step_date: null, stage: 'not_relevant',
      follow_up_draft: 'Hi Anna, nice to meet you at the mixer. Let me know if freelance projects come up next year.' }),
    seed('ct-yusuf', 'ev-ktm', t('2026-09-30', '19:30'), {
      source: 'qr_linkedin', profile_url: 'https://linkedin.com/in/yusuf-aydin-demo', profile_slug: 'yusuf-aydin-demo',
      name: 'Yusuf Aydın', role: 'Freelance data engineer', company: 'Self-employed', project_id: 'pr-client',
      summary: 'Has more backend work than he can take; could pass dashboard frontends your way.',
      discussed: ['Builds data pipelines for SMEs', 'Clients keep asking for dashboards', 'Wants a frontend partner'],
      needs: 'A frontend partner for client dashboards.',
      match_reason: 'A steady source of referred dashboard projects: “my clients always want a dashboard on top”.',
      next_step: 'Agree how to share overflow work', next_step_date: '2026-11-05',
      follow_up_draft: 'Hi Yusuf, great idea to team up. Shall we have a call next week to agree how we hand over dashboard work?' }),
    seed('ct-elena', 'ev-ktm', t('2026-09-30', '20:10'), {
      source: 'qr_xing', profile_url: 'https://xing.com/profile/Elena_Petrova_demo', profile_slug: 'Elena_Petrova_demo',
      name: 'Elena Petrova', role: 'COO', company: 'Lernwerk', project_id: 'pr-cofounder',
      summary: 'Onboarding new tutors is fully manual; wanted to see the HR-tech prototype.',
      discussed: ['Onboards ~40 tutors a month', 'Everything happens by email', 'Asked for the prototype link'],
      needs: 'Faster onboarding for new tutors.',
      match_reason: 'A second potential pilot with a clear onboarding pain: “send me the link when it works”.',
      next_step: 'Send the prototype link', next_step_date: '2026-10-15',
      follow_up_draft: 'Hi Elena, the prototype is ready to try. Here is the link; I would love your feedback on the tutor onboarding flow.' }),
    seed('ct-ben', 'ev-ktm', t('2026-09-30', '20:40'), {
      source: 'qr_linkedin', profile_url: 'https://linkedin.com/in/ben-fischer-demo', profile_slug: 'ben-fischer-demo',
      name: 'Ben Fischer', role: 'Developer advocate', company: 'Datenhafen', project_id: 'pr-speaking',
      summary: 'Their frontend conference opens its call for papers soon; encouraged you to submit.',
      discussed: ['Conference in February', 'Call for papers closes mid-November', 'Looking for practical talks'],
      needs: 'Practical talk submissions.',
      match_reason: 'A conference talk is the next step up from the meetup: “you should submit something practical”.',
      next_step: 'Submit a talk proposal', next_step_date: '2026-11-14',
      follow_up_draft: 'Hi Ben, thanks for the tip! I have submitted "Shipping a data dashboard in a weekend" to the call for papers.' }),
  ];

  const stamp = rows => rows.map(r => ({ created_at: t(TODAY, '09:00'), updated_at: t(TODAY, '09:00'), ...r }));
  const SEED = { events: stamp(EVENTS), projects: stamp(PROJECTS.map(p => ({ archived: false, external_source: null, external_id: null, external_updated_at: null, ...p }))), contacts: CONTACTS };

  const clone = x => JSON.parse(JSON.stringify(x));
  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY));
      if (saved && saved.events && saved.projects && saved.contacts) {
        // Like a migration: events saved before the url column existed get the seed value or null.
        saved.events.forEach(e => {
          if (!('url' in e)) e.url = SEED.events.find(s => s.id === e.id)?.url ?? null;
        });
        return saved;
      }
    } catch (e) { /* storage blocked or corrupt: fall back to seed */ }
    return clone(SEED);
  }
  let data = load();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* keep in memory */ } }

  let counter = 0;
  const newId = table => `${table.slice(0, 2)}-${Date.now().toString(36)}${(counter++).toString(36)}`;
  const now = () => new Date().toISOString();

  let client = null;
  let live = false;
  let userId = null;
  let currentUser = null;
  let channel = null;
  let audioBlob = null;
  const writes = new Map();
  const tables = ['events', 'projects', 'contacts'];
  const report = error => { console.error('Syncy backend:', error); window.dispatchEvent(new CustomEvent('db-error', { detail: error.message || String(error) })); };
  const enqueue = (table, id, action) => {
    const key = `${table}:${id}`;
    const task = (writes.get(key) || Promise.resolve()).catch(() => {}).then(action).catch(error => { report(error); throw error; });
    task.catch(() => {});
    writes.set(key, task);
    return task;
  };
  window.db = {
    TODAY,
    contactRow,
    get live() { return live; },
    get user() { return currentUser; },
    async init() {
      if (!window.SYNCY_CONFIG?.supabaseUrl || !window.SYNCY_CONFIG?.supabaseAnonKey) {
        throw new Error('Supabase is not configured. Add the project URL and public key, then reload.');
      }
      client = window.supabase.createClient(window.SYNCY_CONFIG.supabaseUrl, window.SYNCY_CONFIG.supabaseAnonKey);
      const { data: { session }, error: sessionError } = await client.auth.getSession();
      if (sessionError) throw sessionError;
      if (session?.user.email?.toLowerCase() === 'demo@syncy.local') {
        await client.auth.signOut();
        return false;
      }
      if (session) await this.activateSession(session);
      client.auth.onAuthStateChange((_event, sessionNow) => {
        if (sessionNow) {
          if (currentUser && currentUser.id !== sessionNow.user.id) {
            live = false; data = { events: [], projects: [], contacts: [] };
            window.dispatchEvent(new Event('auth-change'));
          }
          userId = sessionNow.user.id; currentUser = sessionNow.user;
        }
        else if (live) {
          live = false; userId = null; currentUser = null;
          channel?.close(); channel = null;
          writes.clear();
          data = { events: [], projects: [], contacts: [] };
          window.dispatchEvent(new Event('auth-change'));
        }
      });
      return Boolean(session);
    },
    async activateSession(session) {
      userId = session.user.id;
      currentUser = session.user;
      live = true;
      try { await this.reload(false); } catch (error) { live = false; userId = null; currentUser = null; throw error; }
      if ('BroadcastChannel' in window && !channel) {
        channel = new BroadcastChannel('syncy-live');
        channel.onmessage = () => this.reload().catch(report);
      }
    },
    async signIn(email, password) {
      if (email.trim().toLowerCase() === 'demo@syncy.local') throw new Error('The shared demo account is no longer supported. Create a personal account.');
      const { data: result, error } = await client.auth.signInWithPassword({ email, password });
      if (error) throw error;
      await this.activateSession(result.session);
      return result.user;
    },
    async signUp(email, password, emailRedirectTo) {
      const { data: result, error } = await client.auth.signUp({ email, password, options: { emailRedirectTo } });
      if (error) throw error;
      if (result.session) await this.activateSession(result.session);
      return { user: result.user, authenticated: Boolean(result.session) };
    },
    async signInWithGoogle(redirectTo) {
      const { error } = await client.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } });
      if (error) throw error;
    },
    async sendPasswordReset(email, redirectTo) {
      const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) throw error;
    },
    async updatePassword(password) {
      const { error } = await client.auth.updateUser({ password });
      if (error) throw error;
    },
    async notion(action, fields = {}) {
      const { data, error } = await client.functions.invoke('notion-projects', { body: { action, ...fields } });
      if (error) {
        let message = error.message;
        try { message = (await error.context.json()).error || message; } catch { /* keep the SDK message */ }
        throw new Error(message);
      }
      return data;
    },
    async signOut() {
      const { error } = await client.auth.signOut();
      if (error) throw error;
      live = false; userId = null; currentUser = null;
      channel?.close(); channel = null;
      writes.clear();
      data = { events: [], projects: [], contacts: [] };
      window.dispatchEvent(new Event('auth-change'));
    },
    async reload(notify = true) {
      if (!live) return;
      const rows = await Promise.all(tables.map(async table => {
        const { data: rows, error } = await client.from(table).select('*');
        if (error) throw error;
        return rows;
      }));
      data = Object.fromEntries(tables.map((table, i) => [table, rows[i]]));
      if (notify) window.dispatchEvent(new Event('db-change'));
    },
    async flush(table, id) { await writes.get(`${table}:${id}`); },
    list(table) { return clone(data[table]); },
    get(table, id) { const r = data[table].find(r => r.id === id); return r ? clone(r) : null; },
    insert(table, row) {
      const base = table === 'contacts' ? contactRow({}) : {};
      const r = { ...base, ...row, id: live ? crypto.randomUUID() : newId(table), ...(live ? { user_id: userId } : {}), created_at: now(), updated_at: now() };
      data[table].push(r);
      if (live) enqueue(table, r.id, async () => { const { error } = await client.from(table).insert(r); if (error) throw error; channel?.postMessage('changed'); }); else save();
      return clone(r);
    },
    update(table, id, patch) {
      const r = data[table].find(r => r.id === id);
      if (!r) return null;
      Object.assign(r, patch, { updated_at: now() });
      if (live) enqueue(table, id, async () => { const { error } = await client.from(table).update(patch).eq('id', id).eq('user_id', userId); if (error) throw error; channel?.postMessage('changed'); }); else save();
      return clone(r);
    },
    async deleteContact(id) {
      const contact = this.get('contacts', id);
      if (!contact) throw new Error('Contact not found.');
      if (live) {
        await this.flush('contacts', id);
        const { data: deleted, error } = await client.from('contacts').delete().eq('id', id).eq('user_id', userId).select('id').maybeSingle();
        if (error) throw error;
        if (!deleted) throw new Error('Contact not found or you do not have permission to delete it.');
      }
      data.contacts = data.contacts.filter(row => row.id !== id);
      if (!live) { save(); return { audioRemoved: true }; }
      channel?.postMessage('changed');
      if (contact.audio_path) {
        const { error } = await client.storage.from('voice-notes').remove([contact.audio_path]);
        if (error) return { audioRemoved: false };
      }
      return { audioRemoved: true };
    },
    // Mirrors the unique index contacts_once_per_event.
    findContact(eventId, profileUrl) {
      const canonical = window.parseProfile(profileUrl).profile_url;
      const r = data.contacts.find(c => c.event_id === eventId && window.parseProfile(c.profile_url).profile_url === canonical);
      return r ? clone(r) : null;
    },
    async transcribeAudio(blob, debugId) {
      const form = new FormData();
      form.set('action', 'transcribe');
      form.set('debug_id', debugId);
      form.set('audio', blob, blob.type.includes('mp4') ? 'voice.mp4' : 'voice.webm');
      const { data: { session }, error: sessionError } = await client.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session) throw new Error('Your session expired. Sign in again.');
      const response = await fetch(`${window.SYNCY_CONFIG.supabaseUrl.replace(/\/$/, '')}/functions/v1/process-note`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}`, apikey: window.SYNCY_CONFIG.supabaseAnonKey },
        body: form,
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message = result.error || `Transcription request failed (${response.status}).`;
        window.syncyVoiceDebug?.(debugId, 'transcription_function_failed', { message });
        throw new Error(message);
      }
      return result?.transcript || '';
    },
    async process(contactId, debugId) {
      window.syncyVoiceDebug?.(debugId, 'pending_database_writes_wait');
      await Promise.all([...writes].filter(([key]) => key.startsWith('projects:') || key === `contacts:${contactId}`).map(([, task]) => task));
      window.syncyVoiceDebug?.(debugId, 'pending_database_writes_complete');
      const { error } = await client.functions.invoke('process-note', { body: { contact_id: contactId, debug_id: debugId } });
      if (error) {
        let message = error.message;
        try { message = (await error.context.json()).error || message; } catch { /* keep the SDK message */ }
        window.syncyVoiceDebug?.(debugId, 'edge_function_call_failed', { message });
        throw new Error(message);
      }
      await this.reload();
      channel?.postMessage('changed');
      return this.get('contacts', contactId);
    },
    reset() { if (live) { this.reload().catch(report); return; } data = clone(SEED); save(); },
  };

  // Keep open tabs (phone app + dashboard) in step.
  window.addEventListener('storage', e => {
    if (e.key !== KEY) return;
    data = load();
    window.dispatchEvent(new Event('db-change'));
  });

  // Event links: add https:// when missing; null when empty or not a web address (matches the events.url check).
  window.normalizeUrl = function (raw) {
    const s = String(raw ?? '').trim();
    if (!s) return null;
    const withScheme = /^https?:\/\//i.test(s) ? s : `https://${s}`;
    try {
      const u = new URL(withScheme);
      return u.hostname.includes('.') ? u.href : null;
    } catch (e) {
      return null;
    }
  };
  window.urlHost = url => { try { return new URL(url).hostname.replace(/^www\./, ''); } catch (e) { return url; } };

  // What the scan step stores: profile URL, slug, and a display name from the slug.
  window.parseProfile = function (raw) {
    let parsed;
    try { parsed = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`); } catch { return { profile_url: '', profile_slug: '', source: 'qr_other', name: null }; }
    const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
    const url = `https://${host}${parsed.pathname.replace(/\/+$/, '')}`;
    let source = 'qr_other', slug = parsed.pathname.split('/').filter(Boolean).pop() || '';
    const li = host === 'linkedin.com' && parsed.pathname.match(/^\/in\/([^/]+)/i);
    const xi = host === 'xing.com' && parsed.pathname.match(/^\/profile\/([^/]+)/i);
    if (li) { source = 'qr_linkedin'; slug = li[1]; }
    else if (xi) { source = 'qr_xing'; slug = xi[1]; }
    let decoded = slug;
    try { decoded = decodeURIComponent(slug); } catch (e) { /* keep raw slug */ }
    const name = decoded.split(/[-_.\s]+/)
      .filter(part => part && !/\d/.test(part) && part.toLowerCase() !== 'demo')
      .map(part => part[0].toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
    return { profile_url: url, profile_slug: slug, source, name: name || null };
  };
})();
