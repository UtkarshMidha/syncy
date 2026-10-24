-- Prevent an authenticated user from attaching their contact to another user's event or project.
create or replace function public.check_contact_reference_ownership()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.event_id is not null and not exists (
    select 1 from public.events
    where id = new.event_id and user_id = new.user_id
  ) then
    raise exception 'event_id must refer to one of your events';
  end if;

  if new.project_id is not null and not exists (
    select 1 from public.projects
    where id = new.project_id and user_id = new.user_id
  ) then
    raise exception 'project_id must refer to one of your projects';
  end if;

  return new;
end;
$$;

drop trigger if exists contacts_reference_ownership on public.contacts;
create trigger contacts_reference_ownership
before insert or update of user_id, event_id, project_id on public.contacts
for each row execute function public.check_contact_reference_ownership();
