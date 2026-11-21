-- 0003 listings: the app's fields (stays, lofts, FAQ, approximate location), a slug and owner name
-- filled by the database, statuses only Zouza can set, and trust fields no client can write.

alter table public.listings drop constraint listings_mode_check;
alter table public.listings add constraint listings_mode_check
  check (mode in ('rent', 'buy', 'stay', 'live'));

alter table public.listings drop constraint listings_property_type_check;
alter table public.listings add constraint listings_property_type_check
  check (property_type in ('apartment','house','villa','townhouse','penthouse','finca','studio','loft'));

alter table public.listings drop constraint listings_status_check;
alter table public.listings add constraint listings_status_check
  check (status in ('draft', 'published', 'archived', 'pending_review', 'removed'));

alter table public.listings add column faq jsonb not null default '[]'::jsonb;
alter table public.listings add column location_approximate boolean not null default true;
alter table public.listings alter column slug drop not null;

create index if not exists listings_owner_idx on public.listings (owner_id);

-- Slug from the title plus the id's first 8 hex characters; owner name from the profile.
create or replace function public.listing_defaults()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' or coalesce(new.slug, '') = '' then
    if coalesce(new.slug, '') = '' then
      new.slug := trim(both '-' from regexp_replace(lower(new.title), '[^a-z0-9]+', '-', 'g'))
        || '-' || substr(replace(new.id::text, '-', ''), 1, 8);
    end if;
  end if;
  if tg_op = 'INSERT' then
    select p.full_name into new.owner_name from public.profiles p where p.id = new.owner_id;
    new.owner_name := coalesce(new.owner_name, '');
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create trigger listings_defaults
  before insert or update on public.listings
  for each row execute function public.listing_defaults();

-- Clients (anon, authenticated) may not set or leave Zouza-only statuses.
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
    if old.status = 'pending_review' and new.status = 'published' then
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

create trigger listings_guard
  before insert or update on public.listings
  for each row execute function public.listing_guard();

-- Trust and derived columns are server-only: clients get insert/update on every other column.
-- A later migration that adds a client-editable column to listings must grant it too.
revoke insert, update on public.listings from anon, authenticated;
do $$
declare cols text;
begin
  select string_agg(quote_ident(column_name), ', ' order by ordinal_position) into cols
  from information_schema.columns
  where table_schema = 'public' and table_name = 'listings'
    and column_name not in ('verified_owner', 'verified_property', 'last_verified_at', 'rating',
                            'review_count', 'owner_name', 'slug', 'created_at', 'updated_at');
  execute format('grant insert (%s), update (%s) on public.listings to authenticated', cols, cols);
end $$;
