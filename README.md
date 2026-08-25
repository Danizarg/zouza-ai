# Zouza

**Professional Property Marketing. Powered by AI.**
Upload photos. Zouza creates the listing.

Zouza is an AI-powered real estate marketing assistant and verified
property marketplace — Spain-first, built with Next.js, TypeScript,
Tailwind CSS and Supabase. It is a pure intermediary in this MVP: no
payment processing, escrow, deposit management, rent guarantees, or legal
advice.

## What's built

**Real, working features:**
- Full site: AI-first homepage, `/ai-search`, `/explore`, `/list-with-ai`,
  `/property/[id]`, `/how-it-works`, `/dashboard`, `/dashboard/listings`,
  `/dashboard/messages`, `/auth/sign-in`, `/auth/sign-up`,
  `/auth/forgot-password`, `/contact`, `/about`, `/trust`, `/pricing`,
  `/legal/terms`, `/legal/privacy`, `/legal/disclaimer`
- Homepage AI chat panel ("what would you like to do today?") and a live
  photo-analysis demo, both interactive
- Natural-language property search (`/ai-search`, and a demo on the
  homepage) that parses budget/bedrooms/city/beach intent from free text
- Multi-step AI listing wizard at `/list-with-ai` (photo upload → a short
  **chat Q&A** for basic facts → AI generation → editable review → preview
  → publish)
- Per-property AI assistant that answers from real listing data
  (availability, community fees, taxes, beach distance, pets, etc.)
- Explore page with working filters, sorting, and save/favourite (localStorage)
- Contact form and waitlist form (persist to Supabase when configured)
- Supabase-ready schema (`supabase/schema.sql`) with row-level security
- Deterministic **mock AI generation** — the whole product works with zero
  API keys configured

**Mock / demo-only:**
- All AI behaviour falls back to deterministic template/keyword logic when
  `ANTHROPIC_API_KEY` is not set — see "Turning Suzi on" below
- The homepage's live photo-analysis checklist is a presentational timer
  loop, not real image analysis — actual generation happens in
  `/list-with-ai`
- Messaging, viewing requests, dashboard stats, and reviews use bundled
  demo data (`lib/mock-data.ts`)
- Listings published via the wizard save to `localStorage` when Supabase
  isn't configured, and the property page falls back to that store
- Auth pages call Supabase Auth when configured; otherwise they simulate a
  successful sign-in/sign-up and redirect to the dashboard
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

## Turning Suzi on

Add one variable to `.env.local`:

```
ANTHROPIC_API_KEY=sk-ant-...
```

That's it — restart the dev server and Suzi's chat, the per-property Q&A,
natural-language search, and listing generation all run on a real model.
Optionally set `ZOUZA_AI_MODEL` to override the default (`claude-opus-5`).

**Without the key nothing breaks.** Every AI surface falls back to the
deterministic answers in `lib/ai/service.ts`, so the product stays fully
clickable with zero configuration. The same fallback catches an invalid
key, a rate limit, a timeout, or a model refusal at runtime — the visitor
gets a working answer and the server logs one `[suzi:*]` line.

### How it fits together

| Layer | File | Role |
|---|---|---|
| Model access | `lib/ai/provider.ts` | The only module that talks to Anthropic. **Server-only** (`import "server-only"`). Returns `null` on any failure rather than throwing. |
| Prompts | `lib/ai/prompts.ts` | Suzi's persona, the business boundaries, and the property/facts context builders. |
| Server actions | `app/actions.ts` | `askSuzi`, `askSuziSearch`, `generateListingAction`. Each computes the deterministic result, tries the model, and returns whichever it got. |
| Deterministic layer | `lib/ai/service.ts`, `lib/ai/suzi-assistant.ts` | Client-safe, offline, no key. Both the zero-config demo and the permanent fallback. |

Client components never call a model directly — they call the server
actions, so the API key never reaches the browser. **Do not import
`lib/ai/provider.ts` (or the Anthropic SDK) from anything a client
component imports.**

Search is deliberately split: the model turns free text into structured
`SearchCriteria`, and the deterministic scorer always does the ranking, so
the match percentages and reasons shown to visitors stay inspectable and
stable.

## Environment variables

See `.env.example`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
ZOUZA_AI_MODEL=
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

- Real user accounts: there is no session gate, so `/dashboard` is publicly
  reachable and wizard-published listings are owned by a placeholder id
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
