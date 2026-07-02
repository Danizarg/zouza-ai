-- Aurora Homes — Supabase schema
-- Run in the Supabase SQL editor (or `supabase db push`) after creating a project.

-- =========================================================
-- Profiles (extends auth.users)
-- =========================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  email text not null default '',
  avatar_url text,
  role text not null default 'seeker' check (role in ('owner', 'seeker', 'both')),
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

-- =========================================================
-- Listings
-- =========================================================
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  mode text not null check (mode in ('rent', 'buy')),
  intent text not null check (intent in ('rent_out', 'sell')),
  title text not null,
  slug text not null unique,
  summary text not null default '',
  description text not null default '',
  city text not null,
  country text not null default 'Spain',
  address_area text not null default '',
  latitude double precision,
  longitude double precision,
  property_type text not null check (
    property_type in ('apartment','house','villa','townhouse','penthouse','finca','studio')
  ),
  bedrooms int not null default 0,
  bathrooms int not null default 0,
  size_m2 int not null default 0,
  floor int,
  price_monthly numeric,
  price_sale numeric,
  utilities_monthly numeric,
  deposit numeric,
  platform_fee_percent numeric,
  total_move_in_cost numeric,
  available_from date,
  minimum_stay text,
  maximum_stay text,
  term text check (term in ('short_term', 'medium_term', 'long_term')),
  pets_allowed boolean not null default false,
  pool boolean not null default false,
  sea_view boolean not null default false,
  garage boolean not null default false,
  furnished boolean not null default false,
  new_build boolean not null default false,
  direct_owner boolean not null default true,
  verified_owner boolean not null default false,
  verified_property boolean not null default false,
  last_verified_at timestamptz,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  owner_rules text,
  owner_name text not null default '',
  rating numeric,
  review_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists listings_mode_status_idx on public.listings (mode, status);
create index if not exists listings_city_idx on public.listings (city);

-- =========================================================
-- Listing images (Supabase Storage URLs)
-- =========================================================
create table if not exists public.listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  url text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- =========================================================
-- Listing features
-- =========================================================
create table if not exists public.listing_features (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  label text not null
);

-- =========================================================
-- Conversations & messages
-- =========================================================
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  seeker_id uuid not null references public.profiles (id) on delete cascade,
  owner_id uuid not null references public.profiles (id) on delete cascade,
  prequalified boolean not null default false,
  prequalification_note text,
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid references public.profiles (id) on delete set null,
  sender_kind text not null default 'user' check (sender_kind in ('user', 'aurora_ai')),
  body text not null,
  created_at timestamptz not null default now()
);

-- =========================================================
-- Viewing requests
-- =========================================================
create table if not exists public.viewing_requests (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  requester_id uuid references public.profiles (id) on delete set null,
  requester_name text not null default '',
  preferred_date date not null,
  note text,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'declined')),
  created_at timestamptz not null default now()
);

-- =========================================================
-- Reviews
-- =========================================================
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  author_id uuid references public.profiles (id) on delete set null,
  author_name text not null default '',
  rating int not null check (rating between 1 and 5),
  comment text not null default '',
  created_at timestamptz not null default now()
);

-- =========================================================
-- Saved listings (favourites)
-- =========================================================
create table if not exists public.saved_listings (
  user_id uuid not null references public.profiles (id) on delete cascade,
  listing_id uuid not null references public.listings (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

-- =========================================================
-- Verification records
-- =========================================================
create table if not exists public.verification_records (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  kind text not null check (
    kind in ('owner_identity', 'property_ownership', 'video_walkthrough', 'documents')
  ),
  status text not null default 'pending' check (status in ('pending', 'verified', 'rejected')),
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

-- =========================================================
-- AI generated content (exposé, FAQ, agent knowledge base)
-- =========================================================
create table if not exists public.ai_generated_content (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  kind text not null check (
    kind in ('expose', 'faq', 'translation', 'agent_knowledge', 'prequalification')
  ),
  language text not null default 'English',
  content jsonb not null,
  model text,
  created_at timestamptz not null default now()
);

-- =========================================================
-- Contact form submissions & waitlist
-- =========================================================
create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  reason text not null,
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  interest text,
  created_at timestamptz not null default now()
);

-- =========================================================
-- Storage bucket for listing photos
-- =========================================================
insert into storage.buckets (id, name, public)
values ('listing-photos', 'listing-photos', true)
on conflict (id) do nothing;

-- =========================================================
-- Row level security
-- =========================================================
alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.listing_images enable row level security;
alter table public.listing_features enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.viewing_requests enable row level security;
alter table public.reviews enable row level security;
alter table public.saved_listings enable row level security;
alter table public.verification_records enable row level security;
alter table public.ai_generated_content enable row level security;
alter table public.contact_submissions enable row level security;
alter table public.waitlist_signups enable row level security;

-- Public read access to published marketplace data
create policy "Published listings are public" on public.listings
  for select using (status = 'published' or owner_id = auth.uid());
create policy "Listing images are public" on public.listing_images
  for select using (true);
create policy "Listing features are public" on public.listing_features
  for select using (true);
create policy "Reviews are public" on public.reviews
  for select using (true);

-- Owners manage their own data
create policy "Users manage own profile" on public.profiles
  for all using (id = auth.uid());
create policy "Owners insert listings" on public.listings
  for insert with check (owner_id = auth.uid());
create policy "Owners update own listings" on public.listings
  for update using (owner_id = auth.uid());
create policy "Owners delete own listings" on public.listings
  for delete using (owner_id = auth.uid());

-- Conversations visible to their participants
create policy "Participants read conversations" on public.conversations
  for select using (seeker_id = auth.uid() or owner_id = auth.uid());
create policy "Seekers start conversations" on public.conversations
  for insert with check (seeker_id = auth.uid());
create policy "Participants read messages" on public.messages
  for select using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.seeker_id = auth.uid() or c.owner_id = auth.uid())
    )
  );
create policy "Participants send messages" on public.messages
  for insert with check (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.seeker_id = auth.uid() or c.owner_id = auth.uid())
    )
  );

-- Saved listings are private
create policy "Users manage saved listings" on public.saved_listings
  for all using (user_id = auth.uid());

-- Anyone may submit contact / waitlist entries
create policy "Anyone can submit contact form" on public.contact_submissions
  for insert with check (true);
create policy "Anyone can join waitlist" on public.waitlist_signups
  for insert with check (true);
