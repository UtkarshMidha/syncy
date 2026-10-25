import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.118.0';

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
const notionHeaders = (token: string) => ({ Authorization: `Bearer ${token}`, 'Notion-Version': '2026-03-11', 'Content-Type': 'application/json' });
const adminClient = () => createClient(required('SUPABASE_URL'), required('SUPABASE_SERVICE_ROLE_KEY'), { auth: { persistSession: false } });
const allowedRedirects = () => required('NOTION_REDIRECT_URIS').split(',').map(value => value.trim()).filter(Boolean);

async function authenticate(req: Request) {
  const token = req.headers.get('Authorization')?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) throw new Error('Sign in to connect Notion.');
  const client = createClient(required('SUPABASE_URL'), required('SUPABASE_ANON_KEY'), {
    auth: { persistSession: false }, global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) throw new Error('Your session expired. Sign in again.');
  return data.user.id;
}

async function refreshConnection(admin: ReturnType<typeof adminClient>, connection: Record<string, any>) {
  if (!connection.refresh_token) throw new Error('Notion access expired. Reconnect Notion and retry.');
  const response = await fetch('https://api.notion.com/v1/oauth/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${btoa(`${required('NOTION_CLIENT_ID')}:${required('NOTION_CLIENT_SECRET')}`)}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ grant_type: 'refresh_token', refresh_token: connection.refresh_token }),
  });
  const tokens = await response.json().catch(() => ({}));
  if (!response.ok || !tokens.access_token) throw new Error('Could not refresh Notion access. Reconnect Notion and retry.');
  const patch = {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token || connection.refresh_token,
    access_token_expires_at: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000).toISOString() : null,
  };
  const { error } = await admin.from('notion_connections').update(patch).eq('user_id', connection.user_id);
  if (error) throw new Error('Could not save refreshed Notion access.');
  return { ...connection, ...patch };
}

async function notionRequest(admin: ReturnType<typeof adminClient>, connection: Record<string, any>, path: string, body?: unknown) {
  const send = (token: string) => fetch(`https://api.notion.com/v1${path}`, {
    method: body === undefined ? 'GET' : 'POST', headers: notionHeaders(token), ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  let response = await send(connection.access_token);
  if (response.status === 401 && connection.refresh_token) {
    Object.assign(connection, await refreshConnection(admin, connection));
    response = await send(connection.access_token);
  }
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.message || `Notion request failed (${response.status}).`);
  return result;
}

function plainText(value: unknown) {
  if (!Array.isArray(value)) return '';
  return value.map(part => typeof part?.plain_text === 'string' ? part.plain_text : part?.text?.content || '').join('').trim();
}

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'POST required' }, 405);

  try {
    const userId = await authenticate(req);
    const { action, ...body } = await req.json();
    const admin = adminClient();

    if (action === 'start') {
      const redirectUri = String(body.redirect_uri || '');
      if (!allowedRedirects().includes(redirectUri)) return json({ error: 'This app URL is not registered for Notion. Add it to NOTION_REDIRECT_URIS.' }, 400);
      const state = crypto.randomUUID();
      const { data: existing, error: readError } = await admin.from('notion_connections').select('user_id').eq('user_id', userId).maybeSingle();
      if (readError) throw readError;
      const oauth = { oauth_state: state, oauth_redirect_uri: redirectUri, oauth_state_expires_at: new Date(Date.now() + 10 * 60_000).toISOString() };
      const { error } = existing
        ? await admin.from('notion_connections').update(oauth).eq('user_id', userId)
        : await admin.from('notion_connections').insert({ user_id: userId, ...oauth });
      if (error) throw error;
      const url = new URL('https://api.notion.com/v1/oauth/authorize');
      url.search = new URLSearchParams({
        client_id: required('NOTION_CLIENT_ID'), response_type: 'code', owner: 'user',
        redirect_uri: redirectUri, state,
      }).toString();
      return json({ authorization_url: url.href });
    }

    if (action === 'exchange') {
      const state = String(body.state || ''), code = String(body.code || '');
      const { data: connection, error } = await admin.from('notion_connections').select('*')
        .eq('user_id', userId).eq('oauth_state', state).maybeSingle();
      if (error) throw error;
      if (!connection || !connection.oauth_state_expires_at || Date.parse(connection.oauth_state_expires_at) < Date.now()) {
        return json({ error: 'Notion connection expired. Start the connection again.' }, 400);
      }
      if (!allowedRedirects().includes(connection.oauth_redirect_uri)) return json({ error: 'Notion redirect URL is no longer allowed.' }, 400);
      const response = await fetch('https://api.notion.com/v1/oauth/token', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${btoa(`${required('NOTION_CLIENT_ID')}:${required('NOTION_CLIENT_SECRET')}`)}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ grant_type: 'authorization_code', code, redirect_uri: connection.oauth_redirect_uri }),
      });
      const tokens = await response.json().catch(() => ({}));
      if (!response.ok || !tokens.access_token) return json({ error: tokens.error_description || 'Notion authorization failed. Try connecting again.' }, 400);
      const patch = {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || null,
        workspace_id: tokens.workspace_id || null,
        workspace_name: tokens.workspace_name || null,
        access_token_expires_at: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000).toISOString() : null,
        oauth_state: null,
        oauth_redirect_uri: null,
        oauth_state_expires_at: null,
        connected_at: new Date().toISOString(),
      };
      const { error: saveError } = await admin.from('notion_connections').update(patch).eq('user_id', userId);
      if (saveError) throw saveError;
      return json({ connected: true, workspace_name: patch.workspace_name });
    }

    const { data: connection, error: connectionError } = await admin.from('notion_connections').select('*').eq('user_id', userId).maybeSingle();
    if (connectionError) throw connectionError;
    if (action === 'status') return json({ connected: Boolean(connection?.access_token), workspace_name: connection?.workspace_name || null });
    if (!connection?.access_token) return json({ error: 'Connect your Notion workspace first.' }, 400);

    if (action === 'sources') {
      const sources: Record<string, unknown>[] = [];
      let cursor: string | undefined;
      for (let page = 0; page < 20; page++) {
        const result = await notionRequest(admin, connection, '/search', {
          filter: { property: 'object', value: 'data_source' }, page_size: 100, ...(cursor ? { start_cursor: cursor } : {}),
        });
        sources.push(...(result.results || []));
        if (!result.has_more || !result.next_cursor) break;
        cursor = result.next_cursor;
        await new Promise(resolve => setTimeout(resolve, 350));
      }
      return json({ sources: sources.map(source => ({
        id: source.id,
        title: typeof source.title === 'string' ? source.title : plainText(source.title) || source.name || 'Untitled database',
      })) });
    }

    if (action === 'import') {
      const sourceId = String(body.data_source_id || '');
      if (!/^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i.test(sourceId)) return json({ error: 'Choose a valid Notion projects database.' }, 400);
      const source = await notionRequest(admin, connection, `/data_sources/${sourceId}`);
      const properties = source.properties || {};
      const propertyEntries = Object.entries(properties) as [string, Record<string, any>][];
      const titleEntry = propertyEntries.find(([, property]) => property.type === 'title');
      const descriptions = propertyEntries.filter(([, property]) => property.type === 'rich_text');
      const descriptionEntry = descriptions.find(([name]) => ['description', 'project description', 'summary', 'details', 'goal'].includes(name.trim().toLowerCase())) || descriptions[0];
      if (!titleEntry) return json({ error: 'This Notion database has no title property.' }, 400);

      const pages: Record<string, any>[] = [];
      let cursor: string | undefined;
      do {
        const result = await notionRequest(admin, connection, `/data_sources/${sourceId}/query`, {
          page_size: 100, ...(cursor ? { start_cursor: cursor } : {}),
        });
        pages.push(...(result.results || []));
        cursor = result.has_more ? result.next_cursor : undefined;
        if (cursor) await new Promise(resolve => setTimeout(resolve, 350));
      } while (cursor);

      const imported = pages.map(page => {
        const title = plainText(page.properties?.[titleEntry[0]]?.title);
        if (!title) return null;
        const icon = page.icon?.type === 'emoji' ? page.icon.emoji : '📌';
        return {
          user_id: userId, name: Array.from(title).slice(0, 120).join(''),
          description: descriptionEntry ? plainText(page.properties?.[descriptionEntry[0]]?.rich_text) : '',
          emoji: icon, archived: false, external_source: 'notion', external_id: page.id,
          external_updated_at: page.last_edited_time || null,
        };
      }).filter(Boolean) as Record<string, any>[];

      const pageIds = imported.map(project => project.external_id);
      const existing: Record<string, string> = {};
      for (let i = 0; i < pageIds.length; i += 100) {
        const { data, error } = await admin.from('projects').select('id,external_id')
          .eq('user_id', userId).eq('external_source', 'notion').in('external_id', pageIds.slice(i, i + 100));
        if (error) throw error;
        for (const row of data || []) existing[row.external_id] = row.id;
      }

      let added = 0, updated = 0;
      for (const project of imported) {
        const id = existing[project.external_id];
        const result = id
          ? await admin.from('projects').update({ name: project.name, description: project.description, external_updated_at: project.external_updated_at, archived: false })
              .eq('id', id).eq('user_id', userId)
          : await admin.from('projects').insert(project);
        if (result.error) throw result.error;
        if (id) updated++; else added++;
      }
      return json({ added, updated, empty_descriptions: imported.filter(project => !project.description).length });
    }

    return json({ error: 'Unsupported Notion action.' }, 400);
  } catch (error) {
    console.error('Notion projects:', error);
    return json({ error: error instanceof Error ? error.message : 'Notion import failed.' }, 500);
  }
});
