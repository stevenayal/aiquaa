-- Tabla de prospectos: candidatos que RRHH ya tiene en mente antes de que rindan
-- Se vinculan a un proceso de selección y pueden tener CV adjunto (Supabase Storage)

create table if not exists public.prospects (
  id          uuid primary key default gen_random_uuid(),
  process_id  uuid not null references public.hiring_processes(id) on delete cascade,
  name        text not null,
  email       text,
  phone       text,
  cv_url      text,       -- storage path: prospect-cvs/{user_id}/{prospect_id}.pdf
  source      text,       -- 'linkedin' | 'referido' | 'bolsa' | 'otro'
  notes       text,
  status      text not null default 'pendiente',
  -- pendiente | invitado | rendido | descartado
  created_by  uuid not null references public.profiles(id) on delete cascade,
  created_at  timestamptz not null default now()
);

-- Índices útiles
create index if not exists prospects_process_id_idx on public.prospects (process_id);
create index if not exists prospects_created_by_idx on public.prospects (created_by);
create index if not exists prospects_email_idx       on public.prospects (email);

-- RLS: solo el empleador que creó el prospecto puede ver/modificar
alter table public.prospects enable row level security;

create policy "prospects_owner_all"
  on public.prospects
  for all
  using  (created_by = auth.uid())
  with check (created_by = auth.uid());

-- Storage bucket para CVs (ejecutar por separado en Supabase Storage si no existe)
-- insert into storage.buckets (id, name, public)
-- values ('prospect-cvs', 'prospect-cvs', false)
-- on conflict do nothing;

-- Storage RLS: solo el dueño puede subir/leer sus CVs
-- create policy "cv_owner_select" on storage.objects for select
--   using (bucket_id = 'prospect-cvs' and auth.uid()::text = (storage.foldername(name))[1]);
-- create policy "cv_owner_insert" on storage.objects for insert
--   with check (bucket_id = 'prospect-cvs' and auth.uid()::text = (storage.foldername(name))[1]);
-- create policy "cv_owner_delete" on storage.objects for delete
--   using (bucket_id = 'prospect-cvs' and auth.uid()::text = (storage.foldername(name))[1]);
