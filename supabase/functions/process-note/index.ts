import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.118.0';
import { MATCH_PROMPT, SUMMARY_PROMPT } from './prompts.ts';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
const required = (name: string) => {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing Edge Function secret: ${name}`);
  return value;
};
const parseJson = (s: string) => JSON.parse(s.replace(/^```(?:json)?\s*|\s*```$/g, '').trim());

async function transcribeAudio(audio: Blob, filename: string, debugId: string) {
  const model = Deno.env.get('WHISPER_MODEL') || 'openai/whisper-1';
  const form = new FormData();
  form.set('file', audio, filename);
  form.set('model', model);
  form.set('response_format', 'json');
  const started = Date.now();
  console.info(JSON.stringify({ tag: 'VOICE-DEBUG', debug_id: debugId, stage: 'openrouter_transcription_started', model, audio_bytes: audio.size }));
  const response = await fetch('https://openrouter.ai/api/v1/audio/transcriptions', {
    method: 'POST', headers: { Authorization: `Bearer ${required('OPENROUTER_API_KEY')}` }, body: form,
  });
  if (!response.ok) {
    console.error(JSON.stringify({ tag: 'VOICE-DEBUG', debug_id: debugId, stage: 'openrouter_transcription_failed', status: response.status, duration_ms: Date.now() - started }));
    throw new Error(`Whisper transcription failed (${response.status}).`);
  }
  const result = await response.json();
  const text = typeof result.text === 'string' ? result.text.trim() : '';
  console.info(JSON.stringify({ tag: 'VOICE-DEBUG', debug_id: debugId, stage: 'openrouter_transcription_succeeded', transcript_chars: text.length, duration_ms: Date.now() - started, cost: result.usage?.cost }));
  return { text, cost: result.usage?.cost, durationMs: Date.now() - started };
}

async function llm(prompt: string, input: unknown, debugId: string, step: string) {
  const apiKey = required('OPENROUTER_API_KEY');
  const model = required('OPENROUTER_MODEL');
  for (let attempt = 0; attempt < 2; attempt++) {
    console.info(JSON.stringify({ tag: 'VOICE-DEBUG', debug_id: debugId, stage: 'llm_request_started', step, model, attempt: attempt + 1 }));
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'X-Title': 'Syncy' },
      body: JSON.stringify({
        model,
        messages: [{ role: 'system', content: prompt }, { role: 'user', content: JSON.stringify(input) }],
        response_format: { type: 'json_object' },
        temperature: 0.2,
        max_tokens: 900,
      }),
    });
    if (!response.ok) { console.error(JSON.stringify({ tag: 'VOICE-DEBUG', debug_id: debugId, stage: 'llm_request_failed', step, status: response.status })); throw new Error(`OpenRouter request failed (${response.status})`); }
    const payload = await response.json();
    try {
      const value = parseJson(payload.choices?.[0]?.message?.content || '');
      console.log(JSON.stringify({ tag: 'VOICE-DEBUG', debug_id: debugId, stage: 'llm_request_succeeded', step, model, usage: payload.usage }));
      return value;
    } catch (error) {
      if (attempt) throw new Error('AI returned invalid JSON twice');
    }
  }
  throw new Error('AI response could not be read');
}

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'POST required' }, 405);
  let debugId = 'missing';
  const trace = (stage: string, details: Record<string, unknown> = {}) => console.info(JSON.stringify({ tag: 'VOICE-DEBUG', debug_id: debugId, stage, ...details }));

  const authorization = req.headers.get('Authorization') || '';
  const token = authorization.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return json({ error: 'Sign in to process this contact.' }, 401);

  let userId: string;
  let contactId: string;
  let action = 'process';
  let audioFile: File | null = null;
  let admin: ReturnType<typeof createClient>;
  try {
    const url = required('SUPABASE_URL');
    const anon = required('SUPABASE_ANON_KEY');
    admin = createClient(url, required('SUPABASE_SERVICE_ROLE_KEY'), { auth: { persistSession: false } });
    const caller = createClient(url, anon, { auth: { persistSession: false }, global: { headers: { Authorization: `Bearer ${token}` } } });
    const { data, error } = await caller.auth.getUser(token);
    if (error || !data.user) return json({ error: 'Your session expired. Sign in again.' }, 401);
    userId = data.user.id;
    let body: Record<string, unknown>;
    if (req.headers.get('content-type')?.includes('multipart/form-data')) {
      const form = await req.formData();
      action = String(form.get('action') || '');
      const candidate = form.get('audio');
      audioFile = candidate instanceof File ? candidate : null;
      body = { debug_id: form.get('debug_id'), contact_id: form.get('contact_id') };
    } else body = await req.json();
    debugId = typeof body.debug_id === 'string' && /^[0-9a-f-]{36}$/i.test(body.debug_id) ? body.debug_id : 'missing';
    trace('request_authenticated');
    contactId = typeof body.contact_id === 'string' ? body.contact_id : '';
    if (action === 'process' && !/^[0-9a-f-]{36}$/i.test(contactId)) return json({ error: 'A valid contact_id is required.' }, 400);
  } catch (error) {
    trace('authentication_or_request_failed', { message: error instanceof Error ? error.message : 'unknown error' });
    return json({ error: error instanceof Error ? error.message : 'Could not authenticate request.' }, 500);
  }

  if (action === 'transcribe') {
    try {
      if (!audioFile || !audioFile.size) return json({ error: 'No audio file was received.' }, 400);
      if (audioFile.size > 20 * 1024 * 1024) return json({ error: 'Recording is too large. Record a shorter memo.' }, 413);
      trace('audio_received_for_transcription', { audio_bytes: audioFile.size, mime_type: audioFile.type || 'unknown' });
      const result = await transcribeAudio(audioFile, audioFile.name || 'voice.webm', debugId);
      if (!result.text) return json({ error: 'Whisper returned an empty transcript.' }, 422);
      return json({ transcript: result.text });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Transcription failed.';
      console.error(JSON.stringify({ tag: 'VOICE-DEBUG', debug_id: debugId, stage: 'transcription_failed', message }));
      return json({ error: message }, 500);
    }
  }
  if (action !== 'process') return json({ error: 'Unsupported action.' }, 400);

  try {
    const { data: contact, error: readError } = await admin.from('contacts').select('*').eq('id', contactId).eq('user_id', userId).single();
    if (readError || !contact) return json({ error: 'Contact not found.' }, 404);
    trace('contact_loaded', { note_kind: contact.note_kind, audio_path_present: Boolean(contact.audio_path) });
    const { error: statusError } = await admin.from('contacts').update({ status: 'processing' }).eq('id', contactId).eq('user_id', userId);
    if (statusError) throw new Error('Could not start processing this contact.');

    let note = contact.note_text || '';
    if (contact.note_kind === 'voice' && contact.audio_path) {
      if (![`${userId}/${contactId}.webm`, `${userId}/${contactId}.mp4`].includes(contact.audio_path)) throw new Error('The recording path is invalid. Upload it again.');
      const { data: audio, error } = await admin.storage.from('voice-notes').download(contact.audio_path);
      if (error || !audio) throw new Error('Could not load the voice recording. Retry or record it again.');
      trace('audio_downloaded', { audio_bytes: audio.size, mime_type: audio.type || 'unknown' });
      if (audio.size > 20 * 1024 * 1024) throw new Error('The recording is too large. Record a shorter memo.');
      const transcription = await transcribeAudio(audio, contact.audio_path.split('/').pop() || 'voice.webm', debugId);
      note = transcription.text;
      if (!note) throw new Error('Whisper returned an empty transcript.');
      const { error: transcriptError } = await admin.from('contacts').update({ note_text: note }).eq('id', contactId).eq('user_id', userId);
      if (transcriptError) throw new Error('Could not save the transcript. Retry processing.');
    }
    if (!note.trim()) throw new Error('Add a note before processing.');
    if (note.length > 12000) throw new Error('The note is too long to process. Keep it under 12,000 characters.');

    const [{ data: event }, { data: projects, error: projectsError }] = await Promise.all([
      admin.from('events').select('name').eq('id', contact.event_id).eq('user_id', userId).maybeSingle(),
      admin.from('projects').select('id,name,description').eq('user_id', userId).eq('archived', false),
    ]);
    if (projectsError) throw new Error('Could not load your projects.');

    const summary = await llm(SUMMARY_PROMPT, { note, scanned_name: contact.name || '', event: event?.name || '' }, debugId, 'summary');
    if (!Array.isArray(summary.discussed)) summary.discussed = [];
    summary.discussed = summary.discussed.filter((x: unknown) => typeof x === 'string').slice(0, 3);
    for (const key of ['name', 'role', 'company', 'summary', 'needs', 'next_step'] as const) {
      if (typeof summary[key] !== 'string') summary[key] = '';
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(summary.next_step_date || '')) summary.next_step_date = null;
    const match = await llm(MATCH_PROMPT, { note, contact: { name: summary.name || contact.name, role: summary.role, company: summary.company }, projects }, debugId, 'project_match');
    const validProject = projects?.some((p: { id: string }) => p.id === match.project_id);
    const chosenByUser = contact.project_set_by === 'user';
    const patch = {
      name: summary.name || contact.name,
      role: summary.role || null,
      company: summary.company || null,
      summary: summary.summary || null,
      discussed: summary.discussed,
      needs: summary.needs || null,
      next_step: summary.next_step || null,
      next_step_date: summary.next_step_date,
      project_id: chosenByUser ? contact.project_id : (validProject ? match.project_id : null),
      project_set_by: chosenByUser ? 'user' : 'ai',
      match_reason: chosenByUser ? contact.match_reason : (typeof match.match_reason === 'string' ? match.match_reason : null),
      match_confidence: chosenByUser ? null : (['high', 'medium', 'low'].includes(match.match_confidence) ? match.match_confidence : null),
      follow_up_draft: typeof match.follow_up_draft === 'string' ? match.follow_up_draft.split(/\s+/).slice(0, 80).join(' ') : null,
      note_text: note,
      status: 'review',
    };
    const { error: writeError } = await admin.from('contacts').update(patch).eq('id', contactId).eq('user_id', userId);
    if (writeError) throw new Error('Could not save the generated contact details.');
    trace('contact_processing_saved');
    return json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Processing failed. Retry in a moment.';
    console.error(JSON.stringify({ tag: 'VOICE-DEBUG', debug_id: debugId, stage: 'processing_failed', message }));
    await admin.from('contacts').update({ status: 'error' }).eq('id', contactId).eq('user_id', userId);
    return json({ error: message }, 500);
  }
});
