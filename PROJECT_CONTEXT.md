# PROJECT_CONTEXT.md — Zouza (aurora-homes) Handover

Compiled 2026-08-10 by reading the full repository (`C:\Users\husky\Documents\aurora-homes`,
git history, `CONTEXT.md`, `README.md`, `design.md`, `supabase/schema.sql`,
`lib/types.ts`, and every route/component referenced below) — this is a
verification/handover pass, **no code was changed**.

Repo: [Danizarg/zouza-ai](https://github.com/Danizarg/zouza-ai) · Live domain: zouza.ai ·
Vercel project name (stale, see §11): `aurora-homes`.

The repo already contains an excellent, very detailed running log at
[`CONTEXT.md`](CONTEXT.md) (947 lines, written session-by-session by the prior
Claude Code sessions). **This document does not replace it** — treat
`CONTEXT.md` as the primary/authoritative narrative history and this file as
a structured summary + gap/risk report layered on top, current as of the
latest commit (`6c79f61`, 2026-07-18), which is two commits newer than
`CONTEXT.md`'s own "last updated" note.

---

## 1. Website's purpose and target users

**Zouza** is an AI-chat-first real estate platform, Spain-first. Positioning
line: *"Just tell Suzi what you need. She'll do the rest."* **Suzi** is the
branded AI persona (never labelled "AI Assistant/Bot/Chat"); Zouza is the
platform name.

- **Target users:** property owners who want to rent out or sell (talk to
  Suzi → she drafts photos+facts into a full listing), and renters/buyers
  searching for homes in Spain (talk to Suzi in natural language instead of
  filling filter forms).
- **Business model:** pure intermediary marketplace/matching product.
  Explicitly **does not** do payment processing, escrow, rent collection,
  deposit handling, rent guarantees, or legal/tax/financial advice — this
  constraint is enforced in the AI response logic itself (`getSuziResponse`
  refuses advice-seeking phrasing) and repeated on every legal/trust/pricing
  surface. Preserve this in any future work.
- Product pivoted once, from "verified marketplace with AI tools bolted on"
  to "the AI is the product" (2026-07-13) — see `CONTEXT.md` §16.

---

## 2. Architecture and technology stack

- **Next.js 16** (App Router, Turbopack) · **React 19** · **TypeScript**
- **Tailwind CSS v4** — design tokens live in `app/globals.css`'s `@theme`
  block; there is **no `tailwind.config.js`**. `design.md` is the locked
  design-system doc (palette, type, radius, motion, CTA voice rules).
- **Framer Motion** for entrance animation + a few chat "thinking" effects
- **Supabase** (`@supabase/ssr`, `@supabase/supabase-js`) — auth, Postgres,
  storage — **entirely optional**, see §4/§9 (mock-mode pattern)
- **Zod** — used for the two server-action input schemas in `app/actions.ts`
  (contact form, waitlist). React Hook Form is a dependency but forms are
  mostly hand-rolled controlled inputs.
- **lucide-react** icons; **Fraunces** (display) + **Inter** (body) fonts via
  `next/font/google`
- No backend of its own beyond Next.js server actions + optional Supabase —
  no separate API server, no queue, no background jobs.
- No test suite (unit or e2e) anywhere in the repo.

---

## 3. Every implemented feature (verified against `app/` route tree)

| Area | Routes | What it does |
|---|---|---|
| Homepage | `/` | Suzi chat hero (typing/voice input), live AI "photo-analysis" demo (presentational), "how it works" 4-step, `ConversationShowcase` (tabbed scripted demo: Buy/Rent/Sell/List/Invest), featured listings, "Why Suzi is different" capability grid, seller flow recap, natural-language search demo, testimonials, final CTA + mini prompt |
| Search | `/ai-search` | Free-text query parsed by `interpretSearchQuery()` → scored/ranked results with match-% badges; "Refine manually" reveals a small filter set |
| Search (classic) | `/explore` | Filter/sort UI (`FilterPanel` + `SearchResults`), All/Rent/Buy mode toggle, list/map toggle (map is a static placeholder) |
| Listing creation | `/list-with-ai` | 7-step wizard: intent → photo upload (drag-drop) → **chat Q&A** for facts (8 fixed questions) → AI generation (animated) → editable review → preview → publish |
| Listing detail | `/property/[id]` | Gallery+lightbox, spec row, verification badges, description/features, availability placeholder, contract-template placeholder, reviews, sticky price breakdown + contact/viewing forms (client-only, no backend) + per-property Suzi chat |
| Global AI widget | every route | Floating Suzi avatar (`components/suzi/*`), page-aware greeting/suggestions, property-aware on `/property/[id]`, navigation-intent auto-routing (e.g. "sell my property" → `/list-with-ai`), advice-refusal guardrail, ESC/close, localStorage-remembered dismissal |
| Auth | `/auth/sign-in`, `/auth/sign-up`, `/auth/forgot-password` | Supabase Auth when configured; simulated success + redirect to `/dashboard` in mock mode (see §5 — no session enforcement) |
| Dashboard | `/dashboard`, `/dashboard/listings`, `/dashboard/messages` | Stat cards, my listings, saved homes (localStorage), AI drafts (localStorage), viewing requests, verification status, profile, two-pane inbox — **all reads from mock data / localStorage**, publicly reachable regardless of auth state |
| Marketing/static | `/how-it-works`, `/about`, `/trust`, `/pricing`, `/contact` | Static content + `submitContact` server action |
| Legal | `/legal/terms`, `/legal/privacy`, `/legal/disclaimer` | Non-affiliation / no-guarantee language, not touched in recent passes |
| SEO | `/sitemap.xml`, `/robots.txt` | Generated from `app/sitemap.ts`/`app/robots.ts`; dashboard/messages/auth are `noindex` |

Route count: 23 (per last verified build in `CONTEXT.md` §18; unchanged since
— the two commits after that only edited existing components, added no
routes).

---

## 4. AI features — mechanism (all mock/deterministic, no model calls)

Single integration surface: `lib/ai/service.ts` + `lib/ai/suzi-assistant.ts`
(the latter wraps the former for the global widget rather than duplicating
logic).

| Function | Used by | Behavior |
|---|---|---|
| `generateListingContent(facts)` | wizard step 4, via `generateListingAction` server action | Deterministic template generator producing title/summary/description/features/FAQ/etc. |
| `answerAgentQuestion(listing, question)` | property-page chat, homepage demo | Keyword routing over structured listing fields |
| `chatRespond(message)` | homepage hero panel, mini CTA prompt | Keyword-overlap match against `MOCK_AI_CHAT_EXAMPLES`, with a stopword filter (bug-fixed, see `CONTEXT.md` §17) |
| `interpretSearchQuery(query, listings)` | `/ai-search`, homepage NL-search demo | Parses budget/beds/city/beach/buy-rent intent, scores + ranks, returns `match_percent` + structured `reasons[]` |
| `getSuziResponse` / `getPageSuggestions` / `getQuickActions` / `detectNavigationIntent` / `getPropertyAnswer` / `getGreetingForPage` | global avatar widget | Refuses legal/tax/financial-advice phrasing first, then answers from listing context, then navigation intent, then falls back to `chatRespond` |

**Swap-in point for a real model:** `hasAiProvider()` in `lib/ai/service.ts`
already checks `OPENAI_API_KEY`/`ANTHROPIC_API_KEY`. None of these five
functions currently call it — they always run the mock path. To go live:
branch on `hasAiProvider()`, call a real model, keep the mock function as the
fallback so a missing/invalid key never breaks the flow (this pattern is
documented but **not implemented** anywhere yet).

---

## 5. Database structure and external services

**Supabase** (`supabase/schema.sql`, ~200 lines, RLS included) — 13 tables:
`profiles`, `listings`, `listing_images`, `listing_features`,
`conversations`, `messages`, `viewing_requests`, `reviews`,
`saved_listings`, `verification_records`, `ai_generated_content`,
`contact_submissions`, `waitlist_signups`. Also provisions a public
`listing-photos` storage bucket. RLS: public read on published
listings/reviews/images, owner-only write, participant-only message access.

**Mock-mode pattern (applies everywhere):** `isSupabaseConfigured()`
(`lib/supabase/config.ts`) is true only if `NEXT_PUBLIC_SUPABASE_URL` +
`NEXT_PUBLIC_SUPABASE_ANON_KEY` are set. If false, every data path falls
back to `lib/mock-data.ts` (12 seeded Spain listings) or `localStorage`
(`lib/local-listings.ts`). **The entire product is clickable with zero
configuration and no `.env.local`** — confirmed: no `.env.local` present in
this checkout, no secrets committed.

**No other external services.** No Stripe/payment provider, no email
provider (contact/waitlist forms just insert rows or no-op in mock mode), no
analytics, no CDN beyond Vercel/Next's own image optimization, no map
provider (map UI is a static placeholder, not a real Mapbox/Google Maps
integration).

---

## 6. Authentication and payment flow

**Auth:** Supabase Auth (`supabase.auth.signInWithPassword` /
`supabase.auth.signUp`), browser client only
(`lib/supabase/client.ts`/`server.ts`). In mock mode (no Supabase env vars),
sign-in/sign-up **always succeeds** and redirects to `/dashboard` regardless
of input — this is by design for demoability, not a bug, but:

- **There is no `middleware.ts` and no session check in
  `app/dashboard/layout.tsx`.** `/dashboard`, `/dashboard/listings`,
  `/dashboard/messages` are publicly reachable with no auth gate even when
  Supabase *is* configured — they always render demo/mock data regardless of
  session state. This is a known, explicitly documented gap
  (`CONTEXT.md` §12) — **must be fixed before any real production auth
  launch** (add a server-side session check / redirect-to-sign-in in the
  dashboard layout).

**Payment:** none. No payment/checkout code exists anywhere in the repo
(confirmed by grep — the only "payment" hits are disclaimer prose on
`/pricing`, `/about`, `/legal/*`, footer, and the Suzi advice-refusal copy,
all stating Zouza does **not** process payments). This is an intentional
product-scope decision, not an unfinished feature.

---

## 7. Environment variables required (no secret values shown)

From `.env.example` — **all optional**, app runs fully in mock mode with
none set:

```
NEXT_PUBLIC_SUPABASE_URL=          # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=     # Supabase anon/public key
SUPABASE_SERVICE_ROLE_KEY=         # server-only, reserved for future admin tasks — not currently read anywhere in code
OPENAI_API_KEY=                    # checked by hasAiProvider(), not yet used to make any call
ANTHROPIC_API_KEY=                 # checked by hasAiProvider(), not yet used to make any call
NEXT_PUBLIC_APP_URL=               # used for metadata/OG/sitemap; defaults to http://localhost:3000
```

No `.env.local` exists in this checkout (git-ignored, correctly). No secrets
are committed anywhere in the tracked source.

---

## 8. Important design decisions

- **Design system is locked in `design.md`** — "modern-minimal, Stripe/Linear
  school, kept warm by a Mediterranean palette." Navy-led buttons (not the
  earlier terracotta pill), border-led depth (not shadow-led), Fraunces only
  for page-level statement headings, one accent (terracotta) reserved for
  ≤5% of viewport (price totals, wordmark dot, inline links). Any future
  page work should read `design.md` first rather than improvising.
- **Suzi is a persona, not a UI label.** Brand rule: never say "AI
  Assistant/Bot/Chat" as a primary label.
- **Client/server module boundary discipline:** `lib/listings.ts`
  (server-only, imports `next/headers`) is deliberately split from
  `lib/listing-filters.ts` (client-safe) after a real bug where a client
  component importing filter helpers dragged `next/headers` into the client
  bundle. Keep this split if extending data access.
- **`useSyncExternalStore` over `useEffect`+`setState`** for all
  browser-only state reads (localStorage, speech-recognition support,
  pointer-capability detection) — enforced by this repo's stricter ESLint
  rules (`react-hooks/set-state-in-effect`, `react-hooks/purity`). Five
  separate real bugs were hit and fixed this way across the build history
  (`CONTEXT.md` §11, §17, §18) — this is the established idiom, not a
  one-off workaround.
- **`AnimatePresence` (Framer Motion) is flagged as unreliable** in this
  Next 16 + React 19 combination — it silently failed to unmount the Suzi
  panel on close in the one place it was tried. The fix (plain conditional
  render) is in place; treat any future `AnimatePresence` usage here as
  unverified until re-tested.
- **Mock-first architecture is deliberate**, not incomplete: every feature
  is required to work with zero configuration, with Supabase/AI-provider
  config as an additive layer, not a prerequisite.

---

## 9. Known bugs and unfinished work

**Explicitly documented as unfinished (not bugs — scoped-out or template
placeholders):**
- AI generation/chat/search are template/keyword logic, not a real model
  call, despite `hasAiProvider()` existing as an unused hook for it.
- Map and availability calendar are static placeholders.
- Contract-template area is a placeholder with a disclaimer, no real file.
- No rate limiting/spam protection on contact or waitlist forms.
- No automated test suite.
- Photo persistence in mock mode uses `blob:` object URLs — lost on refresh
  for any listing published without Supabase Storage configured (bundled
  mock listings unaffected).
- Messaging/viewing-requests/reviews/dashboard stats are static mock data;
  sending a message in `/dashboard/messages` only updates local React state,
  never persists.

**Real risk not yet flagged as fixed anywhere:**
- **No auth gate on `/dashboard/*`** (§6 above) — the single most important
  item before any real-user launch with Supabase Auth live.
- **Vercel project name (`aurora-homes`) is stale** relative to the
  `zouza-ai` repo/product rename — cosmetic only (§11), but worth a note so
  nobody is confused it's a different/orphaned project.

No open bugs were found in code that contradict what `CONTEXT.md` already
documents as fixed — the five bug writeups in `CONTEXT.md` (§11, §17 ×2,
§18) all show their fixes present in the current source (verified by
reading the relevant files: `lib/listing-filters.ts` split, `use-client-snapshot.ts`
usage in `cursor-glow.tsx`/`typewriter-text.tsx`, stopword filtering in
`chatRespond`, `AnimatePresence` removed from the Suzi panel).

---

## 10. Latest state of each feature (as of commit `6c79f61`)

| Feature | State |
|---|---|
| Suzi persona + hero | Live, rebuilt 2026-07-17 (`CONTEXT.md` §18) |
| Global Suzi avatar widget | Live on every route, property-aware, page-aware |
| Header "Talk to Suzi" button | **Just fixed** (`6c79f61`, 2026-07-18) — now opens the avatar panel via a custom `suzi:open-panel` window event (`lib/suzi-events.ts`) instead of navigating to `/list-with-ai`; verified on `/pricing` and `/about` |
| Hero visual | Refactored (`7827ec6`, 2026-07-18) into a new `components/home/suzi-hero-visual.tsx`, extracted out of `hero.tsx` (149 lines changed) — **not yet documented in `CONTEXT.md`**, see §12 below |
| AI wizard (`/list-with-ai`) | Full 7-step flow working end-to-end, chat-driven facts step |
| Search (`/ai-search`, `/explore`) | Both working, NL parser has the €1.2M decimal bug fixed |
| Auth pages | Working against Supabase when configured; simulated in mock mode; **no dashboard gate** |
| Build/lint/typecheck | Clean as of the last recorded verification pass (23/23 routes) — **not re-run during this handover pass**; recommend re-running `npx tsc --noEmit && npm run lint && npm run build` before further work, since two commits have landed since the last recorded clean run |

---

## 11. Files that appear obsolete, duplicated, or unsafe

- **None found that are actually obsolete, duplicated, or unsafe in the
  tracked source.** `git status` is clean, no stray backup/copy/temp files,
  no `.env.local` or other secret file present, `.gitignore` correctly
  excludes `.env*` (except `.env.example`), `.vercel/`, `.claude/`,
  `node_modules`, and build artifacts.
- **Minor staleness, not a safety issue:** `.vercel/project.json` still
  records `"projectName":"aurora-homes"` from before the Zouza rebrand —
  purely cosmetic (Vercel project names don't have to match the repo/product
  name), but worth renaming in the Vercel dashboard for clarity if anyone
  new picks this up.
- **`AGENTS.md`** contains only a Next.js-version-warning stub pointing
  agents at `node_modules/next/dist/docs/` before writing code — intentional
  scaffolding, not obsolete.
- No duplicate component implementations were found (e.g. only one
  `SuziPromptInput`, reused rather than copy-pasted, per `CONTEXT.md` §18's
  own note).

---

## 12. Gap between the chat history (`CONTEXT.md`) and the current code

`CONTEXT.md`'s own header says it was last updated 2026-07-17 (§18, the Suzi
rebrand). Two commits have landed since that are **not narrated anywhere in
`CONTEXT.md`**:

1. **`7827ec6` "changes" (2026-07-18)** — refactored `components/home/hero.tsx`
   (149 lines touched) and added a new file, `components/home/suzi-hero-visual.tsx`
   (24 lines). The generic commit message ("changes") gives no rationale, and
   no corresponding `CONTEXT.md` section exists. **Recommend reading this
   diff directly (`git show 7827ec6`) before touching `hero.tsx` again** —
   its current structure is not explained in the handover doc.
2. **`6c79f61` "Make header 'Talk to Suzi' open the conversation…" (2026-07-18)**
   — well-described in its own commit message (quoted in §10 above), and
   changes `components/site-header.tsx`, `components/suzi/suzi-avatar-assistant.tsx`,
   and adds `lib/suzi-events.ts`. Functionally clear from the commit message,
   but not yet folded into `CONTEXT.md`'s "New primitives"/"What changed"
   sections for future readers.

**Recommendation:** append a short `CONTEXT.md` §19 covering both commits
(what `suzi-hero-visual.tsx` is for, and the `suzi:open-panel` event pattern)
next time either area is touched, to keep the handover doc authoritative —
this pass intentionally did not edit `CONTEXT.md` since the brief was
read-only.

No other discrepancy was found between what `CONTEXT.md` narrates and what
the code actually does — every feature, bug fix, and architectural decision
described in `CONTEXT.md` §1–§18 was spot-checked against the current
source and matches.

---

## 13. Prioritized development roadmap

**P0 — before any real-user / production launch:**
1. Add a server-side session check to `app/dashboard/layout.tsx` (or
   `middleware.ts`) so `/dashboard*` isn't publicly reachable once Supabase
   Auth is live.
2. Re-run `npx tsc --noEmit && npm run lint && npm run build` to confirm the
   two undocumented recent commits didn't regress the previously-clean state.
3. Document commits `7827ec6` and `6c79f61` in `CONTEXT.md` (§12 above).

**P1 — turning mock AI into real AI (the core product promise):**
4. Wire `hasAiProvider()` into `generateListingContent`, `answerAgentQuestion`,
   `chatRespond`, `interpretSearchQuery`, and the Suzi-assistant functions,
   each keeping the existing mock as a fallback (the pattern is already
   documented in `README.md`/`CONTEXT.md` §7, just not implemented).
5. Persist listing photo uploads to Supabase Storage by default once
   Supabase is configured (currently correct in the wizard's publish step —
   confirm this still works after recent hero changes).

**P2 — product completeness:**
6. Real messaging persistence (`/dashboard/messages` currently local-state
   only).
7. Real map integration (currently a placeholder) and availability calendar.
8. Contract-template library + download flow.
9. Rate limiting/spam protection on `submitContact` / `joinWaitlist`.
10. Verification workflow backend (document upload + review queue) — schema
    already models this (`verification_records`), UI shows badges, no
    processing pipeline exists.

**P3 — polish/hygiene:**
11. Automated test suite (none exists — even smoke tests for the wizard's
    7-step flow and the auth forms would catch regressions early).
12. Rename the Vercel project from `aurora-homes` to something matching
    `zouza-ai` for clarity.

---

## Verification note

This document was produced by reading: full git log + the two most recent
commit diffs, `CONTEXT.md` (947 lines) in full, `README.md`, `design.md`,
`package.json`, `.env.example`, `AGENTS.md`/`CLAUDE.md`, `supabase/schema.sql`
(table list), `lib/types.ts` (full domain model), `lib/actions.ts`
(`app/actions.ts`), `lib/supabase/config.ts`, both auth pages, the dashboard
layout (confirming no auth guard), the full `app/`/`components/`/`lib/`
directory tree, and `git status`/`.gitignore` (confirming no stray or secret
files). No code was modified. No `npm install`/build/lint was run in this
pass — recommended as roadmap item P0-2 above before further development.
