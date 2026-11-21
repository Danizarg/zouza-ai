-- 0007 safety: a word filter on everything users write, reports (insert-only), and blocks that hide
-- listings, conversations, messages and reviews between the two people in both directions.

create extension if not exists unaccent with schema extensions;

-- ---------- word filter ----------
create table private.banned_terms (term text primary key);

-- True when t contains a banned term as whole words, ignoring case, accents and extra spaces.
-- Lives in the private schema so it is not exposed as an API function.
create or replace function private.contains_banned_term(t text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(t, '') <> '' and exists (
    select 1 from private.banned_terms b
    where regexp_replace(lower(extensions.unaccent(t)), '\s+', ' ', 'g')
          ~ ('\m' || regexp_replace(b.term, '([.^$*+?()\[\]{}|\\])', '\\\1', 'g') || '\M'));
$$;

create or replace function public.filter_listing_text()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if private.contains_banned_term(concat_ws(' ', new.title, new.summary, new.description, new.owner_rules, new.faq::text)) then
    raise exception 'content_rejected' using errcode = '23514';
  end if;
  return new;
end $$;

create or replace function public.filter_message_text()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if private.contains_banned_term(new.body) then
    raise exception 'content_rejected' using errcode = '23514';
  end if;
  return new;
end $$;

create or replace function public.filter_review_text()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if private.contains_banned_term(new.comment) then
    raise exception 'content_rejected' using errcode = '23514';
  end if;
  return new;
end $$;

-- A rejected name at sign-up becomes the default name (failing would break sign-up with an
-- opaque error); a rejected name on edit is refused.
create or replace function public.filter_profile_name()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if private.contains_banned_term(new.full_name) then
    if tg_op = 'INSERT' then
      new.full_name := 'Zouza user';
    else
      raise exception 'content_rejected' using errcode = '23514';
    end if;
  end if;
  return new;
end $$;

create trigger listings_filter before insert or update on public.listings
  for each row execute function public.filter_listing_text();
create trigger messages_filter before insert or update on public.messages
  for each row execute function public.filter_message_text();
create trigger reviews_filter before insert or update on public.reviews
  for each row execute function public.filter_review_text();
create trigger profiles_filter before insert or update of full_name on public.profiles
  for each row execute function public.filter_profile_name();

-- ---------- reports ----------
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles (id) on delete set null,
  target_type text not null check (target_type in ('listing', 'user', 'message', 'review')),
  target_id uuid not null,
  reason text not null check (reason in ('spam', 'scam', 'offensive', 'inappropriate_photos', 'wrong_info', 'other')),
  details text check (details is null or length(details) <= 2000),
  status text not null default 'open' check (status in ('open', 'actioned', 'dismissed')),
  created_at timestamptz not null default now()
);
create index reports_reporter_idx on public.reports (reporter_id);
create index reports_open_idx on public.reports (status, created_at);
alter table public.reports enable row level security;

create policy "Signed-in users file reports as themselves" on public.reports
  for insert to authenticated with check (
    reporter_id = (select auth.uid())
    and coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false);
revoke update, delete on public.reports from anon, authenticated;
-- Clients cannot choose a report's status.
revoke insert on public.reports from anon, authenticated;
grant insert (reporter_id, target_type, target_id, reason, details) on public.reports to authenticated;

-- ---------- blocks ----------
create table public.blocks (
  blocker_id uuid not null references public.profiles (id) on delete cascade,
  blocked_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);
create index blocks_blocked_idx on public.blocks (blocked_id);
alter table public.blocks enable row level security;

create policy "Users see their own blocks" on public.blocks
  for select to authenticated using (blocker_id = (select auth.uid()));
create policy "Users block as themselves" on public.blocks
  for insert to authenticated with check (blocker_id = (select auth.uid()));
create policy "Users unblock their own blocks" on public.blocks
  for delete to authenticated using (blocker_id = (select auth.uid()));

-- Either person blocked the other. False when either id is null (signed-out visitors).
create or replace function public.is_blocked_between(a uuid, b uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select a is not null and b is not null and exists (
    select 1 from public.blocks k
    where (k.blocker_id = a and k.blocked_id = b) or (k.blocker_id = b and k.blocked_id = a));
$$;

-- ---------- rules that respect blocks ----------
drop policy if exists "Published listings are public" on public.listings;
create policy "Published listings are public, except between blocked users" on public.listings
  for select using (
    owner_id = (select auth.uid())
    or (status = 'published' and not public.is_blocked_between(owner_id, (select auth.uid()))));

drop policy if exists "Participants read conversations" on public.conversations;
create policy "Participants read conversations unless blocked" on public.conversations
  for select to authenticated using (
    (seeker_id = (select auth.uid()) or owner_id = (select auth.uid()))
    and not public.is_blocked_between(seeker_id, owner_id));

drop policy if exists "Seekers start conversations about published listings" on public.conversations;
create policy "Seekers start conversations about published listings" on public.conversations
  for insert to authenticated with check (
    seeker_id = (select auth.uid())
    and seeker_id <> owner_id
    and not public.is_blocked_between(seeker_id, owner_id)
    and exists (select 1 from public.listings l
                where l.id = listing_id and l.status = 'published' and l.owner_id = conversations.owner_id));

-- Messages: reading and sending both go through a conversation the caller can see (blocked threads
-- are invisible), so a block also stops sending into an existing thread.
drop policy if exists "Participants read messages" on public.messages;
create policy "Participants read messages" on public.messages
  for select to authenticated using (
    exists (select 1 from public.conversations c where c.id = conversation_id));

drop policy if exists "Participants send messages as themselves" on public.messages;
create policy "Participants send messages as themselves" on public.messages
  for insert to authenticated with check (
    sender_id = (select auth.uid())
    and sender_kind = 'user'
    and exists (select 1 from public.conversations c where c.id = conversation_id));

drop policy if exists "Reviews are public" on public.reviews;
create policy "Reviews are public, except between blocked users" on public.reviews
  for select using (not public.is_blocked_between(author_id, (select auth.uid())));
