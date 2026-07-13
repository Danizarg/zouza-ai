# Zouza.ai

**Professional Property Marketing. Powered by AI.**
Upload photos. Zouza creates the listing.

Zouza.ai is an AI-powered real estate marketing assistant and verified
property marketplace — Spain-first, built with Next.js, TypeScript,
Tailwind CSS and Supabase. It is a pure intermediary in this MVP: no
payment processing, escrow, deposit management, rent guarantees, or legal
advice.

## What's built

**Real, working features:**
- Full site: homepage, `/rent`, `/buy`, `/rent-out`, `/sell`, `/create-listing`,
  `/listings/[id]`, `/messages`, `/dashboard`, `/dashboard/owner`, `/login`,
  `/signup`, `/forgot-password`, `/contact`, `/about`, `/trust`, `/pricing`,
  `/legal/terms`, `/legal/privacy`, `/legal/disclaimer`
- Multi-step AI listing wizard (photo upload → facts → AI generation →
  editable review → preview → publish)
- Per-listing AI property agent that answers from real listing data
- Search with working filters, sorting, and save/favourite (localStorage)
- Contact form and waitlist form (persist to Supabase when configured)
- Supabase-ready schema (`supabase/schema.sql`) with row-level security
- Deterministic **mock AI generation** — the whole product works with zero
  API keys configured

**Mock / demo-only:**
- AI generation is deterministic template-based mock content unless an AI
  provider key is added (see `lib/ai/service.ts` — one function to swap in
  a real model call)
- Messaging, viewing requests, dashboard stats, and reviews use bundled
  demo data (`lib/mock-data.ts`)
- Listings published via the wizard save to `localStorage` when Supabase
  isn't configured, and the listing detail page falls back to that store
- Auth pages call Supabase Auth when configured; otherwise they simulate a
  successful login/signup and redirect to the dashboard
- Map and availability calendar are visual placeholders
- Contract template download area is a placeholder

## Tech stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Framer Motion ·
Supabase (`@supabase/ssr`) · Zod · React Hook Form · lucide-react

## Running locally

```bash
npm install
cp .env.example .env.local   # optional — the app works without this
npm run dev
```

Open http://localhost:3000. Without any environment variables set, the
entire app runs in **mock mode**: search, the AI wizard, publishing, and
the property AI agent all work against bundled demo data and
`localStorage`.

## Connecting Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run `supabase/schema.sql` — it creates all tables
   (`profiles`, `listings`, `listing_images`, `listing_features`,
   `conversations`, `messages`, `viewing_requests`, `reviews`,
   `saved_listings`, `verification_records`, `ai_generated_content`,
   `contact_submissions`, `waitlist_signups`), row-level security
   policies, and a public `listing-photos` storage bucket.
3. Copy your project URL and anon key into `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxx
   SUPABASE_SERVICE_ROLE_KEY=xxxx   # server-only, for future admin tasks
   ```
4. Restart the dev server. Listing search, photo uploads, and the contact
   form will now read/write through Supabase automatically — no code
   changes needed, since every data function checks
   `isSupabaseConfigured()` and falls back to mock mode otherwise.

## Connecting a real AI model

`lib/ai/service.ts` exports `generateListingContent(facts)` — the single
integration point used by the wizard's server action
(`app/actions.ts:generateListingAction`). To connect a real model:

1. Add `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` to `.env.local`.
2. Replace the body of `generateListingContent` with a call to your model,
   prompting it to return JSON matching the `GeneratedListingContent` type
   in `lib/types.ts`.
3. Keep the existing `mockGenerate` function as a fallback for missing or
   invalid keys, so the product never breaks without configuration.

The per-listing AI property agent (`answerAgentQuestion` in the same file)
can be swapped the same way — it currently does deterministic keyword
routing over the listing's structured fields.

## Environment variables

See `.env.example`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
NEXT_PUBLIC_APP_URL=
```

All are optional for local development.

## Deploying to Vercel

Live domain: **[zouza.ai](https://zouza.ai)**.

1. Push this repository to GitHub (already done — [Danizarg/zouza-ai](https://github.com/Danizarg/zouza-ai)).
2. Import the repo into [Vercel](https://vercel.com/new).
3. Add the environment variables above in Project Settings → Environment
   Variables (or skip them to launch in mock mode).
4. Set `NEXT_PUBLIC_APP_URL=https://zouza.ai` (used for metadata, Open
   Graph, and the sitemap). If using Supabase, also run
   `supabase/schema.sql` against your production project first.
5. Deploy, then attach the `zouza.ai` domain in Project Settings → Domains
   and point its DNS at Vercel per their instructions. `npm run build` is
   used automatically; there are no local-only dependencies.

## What's still needed for production

- Real AI provider integration (currently mock-only)
- Real-time messaging (current inbox is demo data + local state)
- Payment/rent-collection integration is **intentionally out of scope**
  for this pure-intermediary MVP
- Interactive map (currently a placeholder) and availability calendar
- Contract template library and download flow
- Production-grade owner/property verification workflow (document upload,
  manual review queue) — current schema and UI model this, but the
  backend review process isn't implemented
- Rate limiting and abuse protection on contact/waitlist forms
- End-to-end tests
