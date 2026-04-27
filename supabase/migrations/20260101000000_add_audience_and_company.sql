-- Adds audience (candidato | empresa) and company_name to profiles
-- Run via `supabase db push` or manually in Supabase SQL editor.

-- 1. Create the audience enum (idempotent)
do $$
begin
  if not exists (select 1 from pg_type where typname = 'audience_type') then
    create type audience_type as enum ('candidato', 'empresa');
  end if;
end$$;

-- 2. Add columns to profiles table
alter table public.profiles
  add column if not exists audience      audience_type not null default 'candidato',
  add column if not exists company_name  text;

-- 3. Backfill existing rows (already covered by default)
update public.profiles
   set audience = 'candidato'
 where audience is null;

-- 4. Update handle_new_user trigger to read new metadata
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, audience, company_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce((new.raw_user_meta_data ->> 'audience')::audience_type, 'candidato'),
    new.raw_user_meta_data ->> 'company_name'
  )
  on conflict (id) do update set
    full_name    = excluded.full_name,
    audience     = excluded.audience,
    company_name = excluded.company_name;
  return new;
end;
$$;

-- 5. Index for "show all empresas" queries
create index if not exists profiles_audience_idx on public.profiles (audience);

-- 6. RLS: empresas read-only on exam_attempts (uncomment + adapt)
-- create policy "empresas read-only on exam_attempts"
--   on public.exam_attempts for insert
--   to authenticated
--   with check (
--     (select audience from public.profiles where id = auth.uid()) = 'candidato'
--   );
