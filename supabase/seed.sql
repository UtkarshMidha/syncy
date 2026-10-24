-- After creating demo@syncy.local in Supabase Auth, run this in the SQL editor.
-- All content is invented. Stable IDs make it safe to re-run.
insert into public.events (id, user_id, name, location, url, starts_on) 
select '10000000-0000-4000-8000-000000000001', id, 'BCBT AI Hackathon', 'CIC Berlin', 'https://berlincollege.de/hackathon', current_date
from auth.users where email = 'demo@syncy.local'
on conflict (id) do update set name = excluded.name, location = excluded.location, url = excluded.url, starts_on = excluded.starts_on;

insert into public.projects (id, user_id, name, description, emoji, archived)
select p.id, u.id, p.name, p.description, p.emoji, false
from auth.users u
cross join (values
  ('20000000-0000-4000-8000-000000000001'::uuid, 'Client work: React dashboards', 'Land 2 new freelance clients for Q1: React, data dashboards, frontend, KPI and analytics work, migrations.', '💼'),
  ('20000000-0000-4000-8000-000000000002'::uuid, 'Co-founder search: HR-tech', 'Find a sales-minded co-founder, pilot customers and investors for an employee onboarding tool (HR, hiring, onboarding).', '🚀'),
  ('20000000-0000-4000-8000-000000000003'::uuid, 'Speaking & visibility', 'Get a meetup or conference talk slot in Berlin this winter; podcasts, workshops, talks, speaker slots.', '🎤')
) as p(id, name, description, emoji)
where u.email = 'demo@syncy.local'
on conflict (id) do update set name = excluded.name, description = excluded.description, emoji = excluded.emoji, archived = false;

insert into public.contacts (id, user_id, event_id, project_id, source, profile_url, profile_slug, name, role, company, note_kind, note_text, summary, discussed, needs, match_reason, match_confidence, project_set_by, next_step, next_step_date, follow_up_draft, status)
select '30000000-0000-4000-8000-000000000001', u.id, '10000000-0000-4000-8000-000000000001', p.id,
       'qr_linkedin', 'https://linkedin.com/in/aylin-demir-demo', 'aylin-demir-demo', 'Aylin Demir', 'Organiser', 'Berlin Frontend Meetup', 'text',
       'Aylin runs the Berlin Frontend Meetup. They still have open speaker slots in December and liked the idea of a talk about building dashboards fast. Send her a title and two sentences by Friday.',
       'Open speaker slots in December; interested in a talk about building dashboards fast.',
       array['Runs the Berlin Frontend Meetup', 'Open speaker slots in December', 'Liked the dashboards talk idea'],
       'Speakers for the December meetup.', 'Direct path to a Berlin talk slot: “open speaker slots in December”.', 'high', 'ai', 'Send talk title and abstract', current_date + 6,
       'Hi Aylin, thanks for the chat! I would love to give a practical talk about building dashboards fast. I will send a short abstract by Friday.', 'saved'
from auth.users u join public.projects p on p.user_id = u.id and p.id = '20000000-0000-4000-8000-000000000003'
where u.email = 'demo@syncy.local'
on conflict (id) do nothing;
