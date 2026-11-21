-- 0006 viewing requests (incl. stays and move-ins) with role-checked status changes and public busy
-- dates without names; reviews (one per user per listing, never your own) with a rating rollup.

-- ---------- viewing requests ----------
alter table public.viewing_requests add column kind text not null default 'viewing'
  check (kind in ('viewing', 'stay', 'move_in'));
alter table public.viewing_requests add column end_date date;
alter table public.viewing_requests add column guests int check (guests is null or guests between 1 and 50);
alter table public.viewing_requests add constraint viewing_requests_dates_check
  check (end_date is null or end_date >= preferred_date);

alter table public.viewing_requests drop constraint viewing_requests_status_check;
alter table public.viewing_requests add constraint viewing_requests_status_check
  check (status in ('pending', 'confirmed', 'declined', 'cancelled'));

alter table public.viewing_requests drop constraint viewing_requests_requester_id_fkey;
alter table public.viewing_requests alter column requester_id set not null;
alter table public.viewing_requests add constraint viewing_requests_requester_id_fkey
  foreign key (requester_id) references public.profiles (id) on delete cascade;

create index if not exists viewing_requests_listing_idx on public.viewing_requests (listing_id);
create index if not exists viewing_requests_requester_idx on public.viewing_requests (requester_id);

create policy "Requesters and listing owners read requests" on public.viewing_requests
  for select to authenticated using (
    requester_id = (select auth.uid())
    or exists (select 1 from public.listings l where l.id = listing_id and l.owner_id = (select auth.uid())));
create policy "Seekers request published listings" on public.viewing_requests
  for insert to authenticated with check (
    requester_id = (select auth.uid())
    and exists (select 1 from public.listings l
                where l.id = listing_id and l.status = 'published' and l.owner_id <> (select auth.uid())));
create policy "Requesters and listing owners update requests" on public.viewing_requests
  for update to authenticated using (
    requester_id = (select auth.uid())
    or exists (select 1 from public.listings l where l.id = listing_id and l.owner_id = (select auth.uid())));

revoke delete on public.viewing_requests from anon, authenticated;

create or replace function public.viewing_request_defaults()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  select p.full_name into new.requester_name from public.profiles p where p.id = new.requester_id;
  new.requester_name := coalesce(new.requester_name, '');
  new.status := case when current_user in ('anon', 'authenticated') then 'pending' else new.status end;
  return new;
end;
$$;

create trigger viewing_requests_defaults
  before insert on public.viewing_requests
  for each row execute function public.viewing_request_defaults();

-- Clients may only change status: the owner pending -> confirmed|declined, the requester
-- pending|confirmed -> cancelled. Nothing else.
create or replace function public.viewing_request_transition()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  me uuid := auth.uid();
  is_owner boolean;
begin
  if current_user not in ('anon', 'authenticated') then
    return new;
  end if;
  if (to_jsonb(new) - 'status') is distinct from (to_jsonb(old) - 'status') then
    raise exception 'only_status_can_change' using errcode = '42501';
  end if;
  select exists (select 1 from public.listings l where l.id = new.listing_id and l.owner_id = me) into is_owner;
  if is_owner and old.status = 'pending' and new.status in ('confirmed', 'declined') then
    return new;
  end if;
  if old.requester_id = me and old.status in ('pending', 'confirmed') and new.status = 'cancelled' then
    return new;
  end if;
  raise exception 'transition_not_allowed' using errcode = '42501';
end;
$$;

create trigger viewing_requests_transition
  before update on public.viewing_requests
  for each row execute function public.viewing_request_transition();

-- Confirmed stays and move-ins only, dates only: lets any calendar grey out taken nights.
create or replace function public.listing_busy_ranges(p_listing_id uuid)
returns table (start_date date, end_date date)
language sql
stable
security definer
set search_path = ''
as $$
  select v.preferred_date, coalesce(v.end_date, v.preferred_date)
  from public.viewing_requests v
  join public.listings l on l.id = v.listing_id and l.status = 'published'
  where v.listing_id = p_listing_id
    and v.status = 'confirmed'
    and v.kind in ('stay', 'move_in')
  order by 1;
$$;

revoke execute on function public.listing_busy_ranges(uuid) from public;
grant execute on function public.listing_busy_ranges(uuid) to anon, authenticated;

-- ---------- reviews ----------
alter table public.reviews drop constraint reviews_author_id_fkey;
alter table public.reviews alter column author_id set not null;
alter table public.reviews add constraint reviews_author_id_fkey
  foreign key (author_id) references public.profiles (id) on delete cascade;
alter table public.reviews add constraint reviews_listing_author_key unique (listing_id, author_id);
create index if not exists reviews_author_idx on public.reviews (author_id);

create policy "Users review published listings that are not theirs" on public.reviews
  for insert to authenticated with check (
    author_id = (select auth.uid())
    and exists (select 1 from public.listings l
                where l.id = listing_id and l.status = 'published' and l.owner_id <> (select auth.uid())));

revoke update, delete on public.reviews from anon, authenticated;

create or replace function public.review_defaults()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  select p.full_name into new.author_name from public.profiles p where p.id = new.author_id;
  new.author_name := coalesce(new.author_name, '');
  return new;
end;
$$;

create trigger reviews_defaults
  before insert on public.reviews
  for each row execute function public.review_defaults();

create or replace function public.reviews_rollup()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare lid uuid := coalesce(new.listing_id, old.listing_id);
begin
  update public.listings l
     set rating = (select round(avg(r.rating)::numeric, 2) from public.reviews r where r.listing_id = lid),
         review_count = (select count(*) from public.reviews r where r.listing_id = lid)
   where l.id = lid;
  return null;
end;
$$;

create trigger reviews_rollup
  after insert or update or delete on public.reviews
  for each row execute function public.reviews_rollup();
