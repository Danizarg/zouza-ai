-- 0009 advisor fixes: trigger functions are not API-callable; the block check only answers for the
-- caller's own relationships; baseline rules evaluate auth.uid() once per query; FK indexes.
-- Intentionally left as advisor notes: listing_busy_ranges (public by design), mark_conversation_read
-- (signed-in users by design), is_blocked_between (used inside row rules, so it must be executable),
-- and ai_generated_content / verification_records having RLS with no policies (server-only tables).

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.messages_touch() from public, anon, authenticated;
revoke execute on function public.reviews_rollup() from public, anon, authenticated;
revoke execute on function public.filter_listing_text() from public, anon, authenticated;
revoke execute on function public.filter_message_text() from public, anon, authenticated;
revoke execute on function public.filter_review_text() from public, anon, authenticated;
revoke execute on function public.filter_profile_name() from public, anon, authenticated;

-- Only answers when the caller is one of the two people (or for server code with no user).
create or replace function public.is_blocked_between(a uuid, b uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select a is not null and b is not null
    and (auth.uid() is null or auth.uid() in (a, b))
    and exists (
      select 1 from public.blocks k
      where (k.blocker_id = a and k.blocked_id = b) or (k.blocker_id = b and k.blocked_id = a));
$$;

drop policy if exists "Owners insert listings" on public.listings;
drop policy if exists "Owners update own listings" on public.listings;
drop policy if exists "Owners delete own listings" on public.listings;
create policy "Owners insert listings" on public.listings
  for insert to authenticated with check (owner_id = (select auth.uid()));
create policy "Owners update own listings" on public.listings
  for update to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "Owners delete own listings" on public.listings
  for delete to authenticated using (owner_id = (select auth.uid()));

drop policy if exists "Users manage saved listings" on public.saved_listings;
create policy "Users manage saved listings" on public.saved_listings
  for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create index if not exists saved_listings_listing_idx on public.saved_listings (listing_id);
create index if not exists ai_generated_content_listing_idx on public.ai_generated_content (listing_id);
create index if not exists verification_records_listing_idx on public.verification_records (listing_id);
