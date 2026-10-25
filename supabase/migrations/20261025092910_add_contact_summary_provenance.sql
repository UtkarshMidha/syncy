alter table public.contacts
  add column if not exists summary_edited_by_user boolean not null default false;

notify pgrst, 'reload schema';
