-- Notion OAuth credentials and one-time OAuth state stay server-side.
create table public.notion_connections (
  user_id uuid primary key references auth.users on delete cascade,
  access_token text,
  refresh_token text,
  workspace_id text,
  workspace_name text,
  oauth_state text,
  oauth_redirect_uri text,
  oauth_state_expires_at timestamptz,
  access_token_expires_at timestamptz,
  connected_at timestamptz,
  constraint notion_connections_oauth_state_unique unique (oauth_state)
);

alter table public.notion_connections enable row level security;
revoke all on public.notion_connections from public, anon, authenticated;
grant all on public.notion_connections to service_role;
