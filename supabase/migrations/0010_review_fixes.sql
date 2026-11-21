-- 0010 fixes from the branch review: signed-out callers can't probe blocks; a listing in review stays
-- in review and a removed one can't be deleted (and re-inserted); photos can't move between listings;
-- Zouza-only conversation/message columns aren't client-writable; the word filter covers all public
-- user text; the photo bucket can't be listed by others; reviews don't re-run the listing filter.

-- 1. Block check: only the two people, or server code (never anon). Inside a SECURITY DEFINER function
--    current_user is the owner, so the caller is identified by the role in their verified JWT.
create or replace function public.is_blocked_between(a uuid, b uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select a is not null and b is not null
    and (coalesce(auth.role(), '') not in ('anon', 'authenticated') or auth.uid() in (a, b))
    and exists (
      select 1 from public.blocks k
      where (k.blocker_id = a and k.blocked_id = b) or (k.blocker_id = b and k.blocked_id = a));
$$;

-- 2. Status guard: while in review, clients can edit content but not change status at all.
create or replace function public.listing_guard()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user not in ('anon', 'authenticated') then
    return new;
  end if;
  if tg_op = 'UPDATE' then
    if old.status = 'removed' then
      raise exception 'listing_removed' using errcode = '42501';
    end if;
    if old.status = 'pending_review' and new.status is distinct from old.status then
      raise exception 'listing_pending_review' using errcode = '42501';
    end if;
    if new.status in ('pending_review', 'removed') and new.status is distinct from old.status then
      raise exception 'status_not_allowed' using errcode = '42501';
    end if;
  elsif new.status in ('pending_review', 'removed') then
    raise exception 'status_not_allowed' using errcode = '42501';
  end if;
  return new;
end;
$$;

drop policy if exists "Owners delete own listings" on public.listings;
create policy "Owners delete own listings unless removed" on public.listings
  for delete to authenticated using (owner_id = (select auth.uid()) and status <> 'removed');

-- 3. Photos: owners may reorder or replace the URL, never move a photo to another listing.
revoke update on public.listing_images from anon, authenticated;
grant update (url, sort_order) on public.listing_images to authenticated;

-- 4. Conversations and messages: clients write only these columns.
revoke insert on public.conversations from anon, authenticated;
grant insert (listing_id, seeker_id, owner_id) on public.conversations to authenticated;
revoke insert on public.messages from anon, authenticated;
grant insert (conversation_id, sender_id, sender_kind, body) on public.messages to authenticated;

-- 5. Word filter on every piece of user text the public or the other person sees.
create or replace function public.filter_listing_text()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  -- Only when the text changes: unrelated updates (e.g. the review rollup) must not re-run the filter.
  if tg_op = 'UPDATE'
     and (new.title, new.summary, new.description, new.owner_rules, new.faq, new.city, new.address_area,
          new.minimum_stay, new.maximum_stay)
         is not distinct from
         (old.title, old.summary, old.description, old.owner_rules, old.faq, old.city, old.address_area,
          old.minimum_stay, old.maximum_stay) then
    return new;
  end if;
  if private.contains_banned_term(concat_ws(' ', new.title, new.summary, new.description, new.owner_rules,
       new.faq::text, new.city, new.address_area, new.minimum_stay, new.maximum_stay)) then
    raise exception 'content_rejected' using errcode = '23514';
  end if;
  return new;
end $$;

create or replace function public.filter_feature_label()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if private.contains_banned_term(new.label) then
    raise exception 'content_rejected' using errcode = '23514';
  end if;
  return new;
end $$;

create or replace function public.filter_request_note()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if private.contains_banned_term(new.note) then
    raise exception 'content_rejected' using errcode = '23514';
  end if;
  return new;
end $$;

create trigger listing_features_filter before insert or update on public.listing_features
  for each row execute function public.filter_feature_label();
create trigger viewing_requests_filter before insert or update of note on public.viewing_requests
  for each row execute function public.filter_request_note();

revoke execute on function public.filter_feature_label() from public, anon, authenticated;
revoke execute on function public.filter_request_note() from public, anon, authenticated;

-- 6. Photo bucket: files are served by their public URL; listing the bucket is limited to your own folder.
drop policy if exists "Listing images are publicly readable" on storage.objects;
create policy "Users list their own listing images" on storage.objects
  for select to authenticated using (
    bucket_id = 'listing-images' and (storage.foldername(name))[1] = (select auth.uid())::text);
