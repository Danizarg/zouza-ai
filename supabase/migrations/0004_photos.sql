-- 0004 photos and features: visible with their listing, written only by its owner, at most 15
-- photos per listing; the public 'listing-images' bucket where each user writes only in their own folder.

create index if not exists listing_images_listing_idx on public.listing_images (listing_id, sort_order);
create index if not exists listing_features_listing_idx on public.listing_features (listing_id);

drop policy if exists "Listing images are public" on public.listing_images;
drop policy if exists "Listing features are public" on public.listing_features;

-- "Visible" = the listing row is readable by the caller under the listings rules.
create policy "Images visible with their listing" on public.listing_images
  for select using (exists (select 1 from public.listings l where l.id = listing_id));
create policy "Owners add images" on public.listing_images
  for insert to authenticated with check (exists (
    select 1 from public.listings l where l.id = listing_id and l.owner_id = (select auth.uid())));
create policy "Owners update images" on public.listing_images
  for update to authenticated using (exists (
    select 1 from public.listings l where l.id = listing_id and l.owner_id = (select auth.uid())));
create policy "Owners delete images" on public.listing_images
  for delete to authenticated using (exists (
    select 1 from public.listings l where l.id = listing_id and l.owner_id = (select auth.uid())));

create policy "Features visible with their listing" on public.listing_features
  for select using (exists (select 1 from public.listings l where l.id = listing_id));
create policy "Owners add features" on public.listing_features
  for insert to authenticated with check (exists (
    select 1 from public.listings l where l.id = listing_id and l.owner_id = (select auth.uid())));
create policy "Owners update features" on public.listing_features
  for update to authenticated using (exists (
    select 1 from public.listings l where l.id = listing_id and l.owner_id = (select auth.uid())));
create policy "Owners delete features" on public.listing_features
  for delete to authenticated using (exists (
    select 1 from public.listings l where l.id = listing_id and l.owner_id = (select auth.uid())));

create or replace function public.listing_images_cap()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select count(*) from public.listing_images i where i.listing_id = new.listing_id) >= 15 then
    raise exception 'photo_limit' using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger listing_images_cap
  before insert on public.listing_images
  for each row execute function public.listing_images_cap();

-- Storage: public bucket, 5 MB images only; writes only under '<own user id>/...'.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('listing-images', 'listing-images', true, 5242880, '{image/jpeg,image/png,image/webp}')
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "Listing images are publicly readable" on storage.objects
  for select using (bucket_id = 'listing-images');
create policy "Users upload listing images to their own folder" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'listing-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false);
create policy "Users update listing images in their own folder" on storage.objects
  for update to authenticated using (
    bucket_id = 'listing-images' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Users delete listing images in their own folder" on storage.objects
  for delete to authenticated using (
    bucket_id = 'listing-images' and (storage.foldername(name))[1] = (select auth.uid())::text);
