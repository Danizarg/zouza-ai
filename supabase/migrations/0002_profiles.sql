-- 0002 profiles: no email (it stays in Supabase Auth), terms acceptance, a profile for every new
-- account, public read, and owners may edit only their name, avatar and role.

alter table public.profiles drop column email;
alter table public.profiles add column terms_version text;
alter table public.profiles add column terms_accepted_at timestamptz;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  terms text := nullif(meta ->> 'terms_version', '');
begin
  insert into public.profiles (id, full_name, terms_version, terms_accepted_at)
  values (
    new.id,
    coalesce(nullif(trim(meta ->> 'full_name'), ''), 'Zouza user'),
    terms,
    case when terms is null then null else now() end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

drop policy if exists "Users manage own profile" on public.profiles;
create policy "Profiles are public" on public.profiles
  for select using (true);
create policy "Users update own profile" on public.profiles
  for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

revoke insert, update, delete on public.profiles from anon, authenticated;
grant update (full_name, avatar_url, role) on public.profiles to authenticated;
