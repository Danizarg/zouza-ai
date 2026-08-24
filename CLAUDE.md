# CLAUDE.md — Zouza (zouza-ai) Permanent Project Memory

This file is the single source of truth for any future Claude Code session
(or human) picking up this project cold. Read this first. The detailed
session-by-session build log lives in [`CONTEXT.md`](CONTEXT.md) (947 lines)
and a structured handover audit from 2026-08-10 lives in
[`PROJECT_CONTEXT.md`](PROJECT_CONTEXT.md) — both are still accurate and
worth reading for deep detail; this file is the maintained, current-state
summary. **Update this file whenever you make an architectural or product
change** — don't let it go stale the way the standalone handover docs did.

Repo: [Danizarg/zouza-ai](https://github.com/Danizarg/zouza-ai) · Live
domain: **zouza.ai** (hosted on Vercel) · Local path on this machine:
`C:\Users\husky\Documents\aurora-homes` (folder name is a historical
leftover from before the Zouza rebrand — see "Path history" below).

---

## 1. Product

**Zouza** is an AI-chat-first real estate marketing assistant and
verified-listing marketplace, Spain-first. Tagline: *"Just tell Suzi what
you need. She'll do the rest."*

- **Suzi** is the branded AI persona (never labelled "AI Assistant / Bot /
  Chat" anywhere in the UI or copy — this is a hard brand rule). Zouza is
  the platform/company name; Suzi is who the user talks to.
- **Problem it solves:** property owners in Spain struggle to produce a
  good listing (photos + facts → polished copy) and renters/buyers dislike
  filling out filter forms. Zouza lets both sides just describe what they
  want/have in natural language and has Suzi do the structuring.
- **Target users:** (a) owners who want to rent out or sell — upload
  photos, answer a short chat Q&A, Suzi drafts the full listing; (b)
  renters/buyers searching for homes in Spain via natural-language search
  instead of filters.
- **Business model:** pure intermediary/matching marketplace. Explicitly
  **does not** do payment processing, escrow, rent collection, deposit
  handling, or legal/tax/financial advice — enforced both in the AI
  response logic (`getSuziResponse` refuses advice-seeking phrasing) and in
  copy on every legal/trust/pricing page. **Preserve this constraint** in
  any future work unless the business owner explicitly changes the model
  (see §7, item 8 — monetization is still an open business decision).
- **Product history:** pivoted once, 2026-07-13, from "verified marketplace
  with AI tools bolted on" to "the AI is the product" (`CONTEXT.md` §16),
  then a full Suzi rebrand + global floating assistant widget, 2026-07-17.

### Core user journeys

1. **List a property (owner):** `/list-with-ai` — 7-step wizard: intent →
   photo upload (drag-drop) → chat Q&A for facts (8 fixed questions) → AI
   generation (animated) → editable review → preview → publish.
2. **Find a property (renter/buyer):** homepage chat or `/ai-search` —
   free-text query parsed into budget/beds/city/beach/buy-rent intent,
   ranked results with match-% badges. `/explore` offers a classic
   filter/sort UI for users who prefer that.
3. **Ask about a specific listing:** per-property Suzi chat on
   `/property/[id]`, answers from real structured listing data (pricing,
   pets, beach distance, community fees, etc.).
4. **Global assistant:** floating Suzi avatar present on every route,
   page-aware and property-aware, with navigation-intent auto-routing
   (e.g. "sell my property" → `/list-with-ai`).

---

## 2. Architecture / tech stack

- **Next.js 16** (App Router, Turbopack) · **React 19** · **TypeScript**
- **Tailwind CSS v4** — design tokens live in `app/globals.css`'s `@theme`
  block; there is **no `tailwind.config.js`**, don't create one.
- `design.md` is the locked design-system doc (palette, type, radius,
  motion, CTA voice rules) — **read it before any visual/page work**.
  Summary: modern-minimal, Stripe/Linear-school, warmed by a Mediterranean
  palette; navy-led buttons (not the earlier terracotta pill); border-led
  depth, not shadow-led; Fraunces (display) only for page-level statement
  headings + Inter (body); one accent (terracotta) reserved for ≤5% of
  viewport (price totals, wordmark dot, inline links).
- **Framer Motion** for entrance animation + a few chat "thinking" effects.
  `AnimatePresence` has previously silently failed to unmount a panel in
  this Next 16 + React 19 combo — treat any new `AnimatePresence` usage as
  unverified until re-tested; plain conditional render is the proven
  fallback.
- **Supabase** (`@supabase/ssr`, `@supabase/supabase-js`) — auth, Postgres,
  storage. **Entirely optional** via the mock-mode pattern (§4).
- **Zod** for the two server-action input schemas in `app/actions.ts`
  (contact form, waitlist). React Hook Form is a dependency but most forms
  are hand-rolled controlled inputs.
- **lucide-react** icons; **Fraunces** + **Inter** via `next/font/google`.
- No backend of its own beyond Next.js server actions + optional Supabase.
  No separate API server, no queue, no background jobs, no `middleware.ts`.
- **No automated test suite** (unit or e2e) anywhere in the repo — this is
  a real gap, not a stylistic choice (see §7 P3).

### Key directories

- `app/` — route tree (App Router), 20 routes as of this doc (see table in
  `PROJECT_CONTEXT.md` §3 for the full per-route feature breakdown).
- `components/` — organized roughly by feature area
  (`components/suzi/*` = global assistant widget, `components/dashboard/*`,
  `components/home/*`, `components/auth/*`, `components/ui/*` = shared
  primitives).
- `lib/ai/service.ts` + `lib/ai/suzi-assistant.ts` — the deterministic AI
  logic (templates, keyword matching) and per-message reply construction.
  `lib/ai/protocol.ts` + `lib/ai/protocol-classifier.ts` — the real-AI
  layer added 2026-08-24 (§4): a fixed, owner-editable list of allowed
  actions and an OpenAI-backed classifier constrained to it. `app/actions.ts`
  is where classification and deterministic execution are wired together
  (`suziReplyAction`, `homeChatAction`) — **all AI entry points for the
  browser go through here**, never call `protocol-classifier.ts` directly
  from a Client Component (it reads `OPENAI_API_KEY`).
- `lib/supabase/` — `config.ts` (mode detection), `client.ts` (browser),
  `server.ts` (server, cookie-based).
- `lib/mock-data.ts` — 12 seeded Spain listings + canned AI chat examples.
- `lib/local-listings.ts` — localStorage-backed listing store used when
  Supabase isn't configured.
- `lib/listings.ts` (server-only, imports `next/headers`) is **deliberately
  split** from `lib/listing-filters.ts` (client-safe) — a real bug happened
  when a client component imported filter helpers and dragged
  `next/headers` into the client bundle. **Keep this split** if extending
  data access; never import `lib/listings.ts` from a client component.
- `lib/types.ts` — full domain model (`Listing`, `ListingFacts`,
  `GeneratedListingContent`, etc.).
- `supabase/schema.sql` — ~200 lines, full schema + RLS (see §5).

---

## 3. Current state by feature

| Feature | State | Notes |
|---|---|---|
| Homepage (Suzi hero, live demo, showcase, testimonials) | **COMPLETE** | Rebuilt 2026-07-17, refactored 2026-07-18 |
| Global Suzi avatar widget | **COMPLETE** | Every route, page-aware, property-aware, nav-intent routing |
| `/ai-search` NL search | **COMPLETE** (mock AI) | Deterministic keyword/heuristic scoring, not a model call |
| `/explore` classic search | **COMPLETE**, map is placeholder | Filter/sort real; list/map toggle — map is static |
| `/list-with-ai` 7-step wizard | **COMPLETE** (mock AI) | Full flow works end-to-end |
| `/property/[id]` listing detail | **COMPLETE**, some sections placeholder | Availability calendar + contract-template area are placeholders |
| Auth (`/auth/*`) | **COMPLETE against Supabase; simulated in mock mode** | Mock mode always "succeeds" and redirects — by design for demoability |
| **Dashboard auth gate** | **FIXED 2026-08-18** (this session) | See §6 — was the single most important pre-launch gap |
| Dashboard (`/dashboard*`) | **COMPLETE UI, all mock/localStorage data** | Messaging is local-state only, never persists |
| Marketing/legal pages | **COMPLETE (content), legally UNREVIEWED** | See §7 — needs real lawyer sign-off before real users, per the business owner's own requirements doc |
| Real AI model calls | **PARTIAL — protocol classifier live (OpenAI, no credits yet); `generateListingContent` wired (Anthropic, untested)** | See §4 |
| Real map integration | **PLANNED** | Currently a static placeholder |
| Contract-template library | **PLANNED** | Placeholder with disclaimer only |
| Payments/monetization | **PLANNED — business decision not yet made** | Intentionally out of scope until the owner picks a model |
| Verification workflow backend | **PLANNED** | Schema (`verification_records`) + UI badges exist, no document upload/review pipeline |
| Automated tests | **NOT STARTED** | No test suite of any kind exists |

---

## 4. AI system — how it actually works

Two layers: the **deterministic layer** (templates + keyword matching,
zero API calls, was the entire product until 2026-08-24) and the
**protocol layer** (real AI, added 2026-08-24) that sits in front of it.
The deterministic layer never went away — it's now both the classifier's
execution engine and its fallback, so the product behaves identically with
no key, an unfunded key, or a working key.

### 4a. The protocol design — deliberately not a freeform chatbot

The business owner's explicit requirement: Suzi must never "think for
herself" — every reply and every action must trace back to a fixed list
the owner controls, with the model doing classification only, never
open-ended generation or decision-making. Concretely:

1. **`lib/ai/protocol.ts`** — the fixed, owner-editable list of actions
   Suzi is allowed to take (`PROTOCOL_ACTIONS`): navigate to rent/buy/list
   /pricing/how-it-works/contact, answer a property question from listing
   data, refuse advice, or general chat. **To change what Suzi can do, edit
   this file** — nothing else needs to change.
2. **`lib/ai/protocol-classifier.ts`** (server-only) — sends the visitor's
   message to OpenAI (`gpt-5-nano`) with the protocol's action list, using
   **structured outputs** (`response_format: json_schema`, `strict: true`)
   whose `action` field is a strict enum of the protocol's IDs. The model
   physically cannot return an action outside the list — this is enforced
   by the API's schema validation, not just prompting. Returns `null` on
   *any* failure (missing key, no credits, network error, timeout,
   malformed response) — this call is never load-bearing.
3. **`resolveProtocolAction()`** in `lib/ai/suzi-assistant.ts` — turns the
   classified action ID into the actual reply. **The model never writes
   Suzi's words.** Every navigation action returns a fixed copy string and
   a fixed href from `PROTOCOL_NAVIGATION`; `refuse_advice` returns the
   fixed `ADVICE_REFUSAL_TEXT`; `answer_property_question` calls the
   existing deterministic `getPropertyAnswer` (reads real listing fields,
   still template-based); `general_chat` falls through to the existing
   deterministic `chatRespond`/`getSuziResponse` path. So even when the AI
   *is* working, 100% of user-facing text still comes from code the owner
   controls — the AI's only degree of freedom is which of nine fixed
   buckets a message falls into.
4. **`app/actions.ts` server actions** (`suziReplyAction`, `homeChatAction`)
   — the only entry points the browser calls. Each: classify → if `null`,
   run the original deterministic `getSuziResponse`/`chatRespond` path
   unchanged → else `resolveProtocolAction`. **Never call
   `classifyProtocolAction` from a Client Component** — it reads
   `OPENAI_API_KEY` server-side; doing so from the browser would ship the
   key to every visitor.

All three AI-driven client surfaces were migrated from synchronous local
calls to `await`ing these server actions: `components/suzi/suzi-avatar-assistant.tsx`
(global widget), `components/home/hero.tsx` (homepage chat demo),
`components/home/mini-ai-prompt.tsx` (homepage CTA demo).

### 4b. Listing generation (separate integration point, unchanged from 2026-08-18)

`generateListingContent(facts)` (wizard step 4, via `generateListingAction`)
is a **separate** AI integration, not part of the protocol classifier —
it's a content-generation task (write the exposé), not an intent
classification task, so it doesn't fit the protocol shape. Calls a real
Anthropic model (`claude-sonnet-5`, via `@anthropic-ai/sdk`) when
`ANTHROPIC_API_KEY` is set — see `modelGenerate()` in `lib/ai/service.ts`.
Field-by-field validates the parsed response against the deterministic
mock's output, falls back to `mockGenerate()` entirely on any failure.
**Untested against a real key** — only the "key absent" branch is verified.

### 4c. Functions still fully deterministic (no AI involved)

`interpretSearchQuery` (`/ai-search`, homepage NL-search demo — regex
parsing + scoring) has no AI wiring yet; not in scope for the protocol
classifier as designed (it's a structured-data ranking task, would need
its own integration point if ever made AI-driven).

### 4d. Live-tested 2026-08-24

An OpenAI key (`sk-proj-…`) is configured in `.env.local` (git-ignored,
never committed) but the account has **no credits** — confirmed by
actually exercising the classifier in the dev server: both the homepage
hero chat and the Suzi widget's navigation-intent message triggered a real
call to `https://api.openai.com/v1/chat/completions`, which returned
`429 insufficient_quota` / `credit_balance_exhausted`, and the fallback
caught it cleanly — the UI never broke, replies came from the original
deterministic path exactly as before this session. **This confirms the
fallback works correctly; it does not confirm the live classification
path** — that still needs testing once the OpenAI account has credit (see
§8 P1).

Per the business owner's requirements doc (`Zouza_Was_wir_brauchen.docx`,
§7), the credits/budget decision is hers — the code-side wiring is built
ahead of it so funding the account is the only remaining step to go live.

---

## 5. Database & external services

**Supabase** (`supabase/schema.sql`) — 13 tables: `profiles`, `listings`,
`listing_images`, `listing_features`, `conversations`, `messages`,
`viewing_requests`, `reviews`, `saved_listings`, `verification_records`,
`ai_generated_content`, `contact_submissions`, `waitlist_signups`. Also
provisions a public `listing-photos` storage bucket. RLS: public read on
published listings/reviews/images, owner-only write, participant-only
message access.

**Mock-mode pattern (applies everywhere, this is the core architectural
decision of the whole repo):** `isSupabaseConfigured()`
(`lib/supabase/config.ts`) is true only if `NEXT_PUBLIC_SUPABASE_URL` +
`NEXT_PUBLIC_SUPABASE_ANON_KEY` are set. If false, every data path falls
back to `lib/mock-data.ts` (12 seeded Spain listings) or `localStorage`
(`lib/local-listings.ts`). **The entire product must remain clickable with
zero configuration** — preserve this when adding any new data-backed
feature; add the Supabase path as an *additive* layer behind
`isSupabaseConfigured()`, never as a hard requirement.

**No other external services.** No payment provider, no email provider
(contact/waitlist forms insert Supabase rows, or no-op in mock mode), no
analytics, no map provider (placeholder only).

---

## 6. Authentication — flow and the gate that was just fixed

**Auth:** Supabase Auth (`supabase.auth.signInWithPassword` /
`supabase.auth.signUp`) via `lib/supabase/client.ts` (browser) /
`lib/supabase/server.ts` (server, cookie-based, `@supabase/ssr`). In mock
mode (no Supabase env vars), sign-in/sign-up **always succeeds** and
redirects to `/dashboard` regardless of input — **by design**, for
demoability without configuration.

**Fixed 2026-08-18 (this session) — dashboard auth gate:**
`app/dashboard/layout.tsx` previously had **no session check at all**, so
`/dashboard`, `/dashboard/listings`, `/dashboard/messages` were publicly
reachable with no auth gate even when Supabase *was* configured — this was
flagged as the single most important pre-launch gap in
`PROJECT_CONTEXT.md` §6/§13. Fixed by:

1. `DashboardLayout` is now an async server component that calls
   `getSupabaseServerClient()`; if Supabase is configured, it calls
   `supabase.auth.getUser()` and `redirect("/auth/sign-in")` if there's no
   user. In mock mode (`getSupabaseServerClient()` returns `null`) the gate
   is skipped entirely, so the demo flow is unaffected.
2. **Important gotcha, already hit and fixed:** `isSupabaseConfigured()`
   short-circuits before any dynamic API (`cookies()`) is touched, so
   Next's static-rendering analysis has no signal that this layout needs a
   per-request check — without an explicit override, `/dashboard*` gets
   **prerendered once at build time** (when Supabase is never configured in
   CI/build) and the redirect would then never run again in production.
   Fixed by adding `export const dynamic = "force-dynamic"` to
   `app/dashboard/layout.tsx`. Verified via `npm run build`: all three
   dashboard routes changed from `○ (Static)` to `ƒ (Dynamic)` in the route
   summary. **Do not remove this export** if Supabase is ever configured —
   removing it silently reintroduces the exact bug just fixed.
3. Verified in the dev server (mock mode, no `.env.local`): `/dashboard`
   still renders normally with no redirect loop.

**Still not done (lower priority, no live Supabase project to test against
yet):** no `middleware.ts` for session-cookie refresh — the comment in
`lib/supabase/server.ts` ("middleware refreshes sessions") describes the
standard `@supabase/ssr` pattern but no such middleware exists in this
repo. Irrelevant in mock mode; add it when Supabase auth actually goes
live in production (standard Supabase Next.js SSR middleware boilerplate).

**Payment:** none anywhere in the repo — intentional product-scope
decision (pure intermediary), not an unfinished feature. Do not add
payment code without an explicit business decision (see §7 item 8).

---

## 7. Business-side blockers (not engineering work)

On 2026-08-10 the previous session produced
`Zouza_Was_wir_brauchen.docx` ("What we need from you to keep going") — a
non-technical, German-language document addressed to the business owner,
listing 10 decisions/inputs only she can provide. **These are not
engineering tasks; do not attempt to resolve them in code.** Summarized:

1. Permission to create two "background accounts" under the company name:
   (a) a real database/backend (Supabase), (b) a real AI provider
   (OpenAI/Anthropic) so Suzi can actually think instead of using canned
   replies.
2. An approximate monthly budget cap for those two services (usage-based
   cost, small at low traffic).
3. Real property listings with real photos, address, room count, price —
   everything on the site today is placeholder/demo data.
4. A monitored inbox (e.g. `info@zouza.ai`) and a person responsible for
   checking it — contact-form/waitlist submissions currently reach nobody.
5. A lawyer to review the Terms/Privacy/Disclaimer pages — currently
   template-based, not legally reviewed, especially important for Spanish
   real estate.
6. Confirmation that she owns the `zouza.ai` domain and the Vercel account,
   and that credentials are stored securely and known to more than one
   person.
7. A decision on how owner/property verification will actually work
   (currently just a badge with no real process behind it) — e.g. manual
   document upload + review.
8. A decision on the monetization model — currently no payment/fee
   mechanism exists at all (by design); needs a choice (subscription,
   per-listing fee, success commission, etc.) before building it.
9. Real logo/brand assets — currently wordmark-only, no drawn logo.
10. Her priorities: fast public launch + iterate, vs. fully watertight
    first.

**How to apply:** when picking the next engineering task, prefer work that
is valuable *regardless* of how these business decisions land (e.g. wiring
the AI-provider swap-in point behind a flag, tightening security/auth,
fixing bugs, improving UX) over speculative building of e.g. a payment
system before item 8 is decided.

---

## 8. Prioritized roadmap

**P0 — before any real-user / production launch:**
1. ~~Dashboard auth gate~~ — **DONE 2026-08-18** (§6).
2. Re-run `npx tsc --noEmit && npm run lint && npm run build` before
   further work if picking this project back up after a gap — confirmed
   clean as of 2026-08-18.
3. Business owner sign-off items in §7 (not engineering-blocked, but
   product-blocked).

**P1 — turning mock AI into real AI (the core product promise), code-ready
ahead of the business decision to fund it:**
4. ~~Wire `ANTHROPIC_API_KEY` into `generateListingContent`~~ — **DONE
   2026-08-18** (§4b). Still untested against a real key.
5. ~~Build the protocol-driven intent classifier for Suzi (navigation,
   advice refusal, property Q&A routing, general chat)~~ — **DONE
   2026-08-24** (§4a). `OPENAI_API_KEY` is set in `.env.local` but the
   account has no credits — **fund the OpenAI account, then test the live
   classification branch** (currently only the fallback-on-failure branch
   is verified). Once funded, spot-check: does it correctly route a
   "sell my villa" message to `/list-with-ai`, refuse an
   "is this a good investment" message, and answer a property question
   from real listing data — same checks as the mock path, against the
   live model this time.
6. Confirm listing photo uploads still persist correctly to Supabase
   Storage once configured (currently correct in the wizard's publish step
   per last verification, but re-check after any future hero/wizard
   changes).

**P2 — product completeness:**
7. Real messaging persistence (`/dashboard/messages` is local-state only).
8. Real map integration + availability calendar (currently placeholders).
9. Contract-template library + download flow.
10. Rate limiting/spam protection on `submitContact` / `joinWaitlist`, and
    on the new `suziReplyAction`/`homeChatAction` server actions once the
    OpenAI account has credits — an unrated visitor could otherwise trigger
    unbounded classification calls.
11. Verification workflow backend (document upload + review queue) — schema
    already models this (`verification_records`).
12. `middleware.ts` for Supabase session-cookie refresh, once Supabase auth
    is actually live in production (see §6).

**P3 — polish/hygiene:**
13. Automated test suite (none exists).
14. Rename the Vercel project from `aurora-homes` to something matching
    `zouza-ai` (cosmetic only).

---

## 9. Known issues / fragile systems — do not accidentally break these

- **`lib/listings.ts` vs `lib/listing-filters.ts` split** (§2) — importing
  the server-only file from a client component leaks `next/headers` into
  the client bundle. Real bug, already hit once.
- **`useSyncExternalStore` over `useEffect`+`setState`** for all
  browser-only state reads (localStorage, speech-recognition support,
  pointer-capability detection) — enforced by this repo's stricter ESLint
  rules (`react-hooks/set-state-in-effect`, `react-hooks/purity`). Five
  separate real bugs were hit and fixed this way across the build history.
  Follow this idiom for any new browser-only state.
- **`AnimatePresence` (Framer Motion)** — unreliable in this Next 16 +
  React 19 combo, silently failed to unmount a panel once already. Prefer
  plain conditional rendering unless re-verified.
- **`export const dynamic = "force-dynamic"` on `app/dashboard/layout.tsx`**
  — required for the auth gate to actually run per-request in production;
  see §6 gotcha #2. Do not remove.
- **Suzi brand rule** — never label the assistant "AI Assistant / Bot /
  Chat" in UI copy.
- **No payment code anywhere** — keep it that way until §7 item 8 is
  decided by the business owner.
- **The protocol classifier is the only sanctioned path for AI-driven
  replies.** Do not add a second code path that calls OpenAI/Anthropic
  directly for open-ended generation of user-facing Suzi text — the
  business owner's explicit requirement is that every reply traces back to
  `lib/ai/protocol.ts`'s fixed action list via `resolveProtocolAction()`,
  never freeform model output. If a new capability is needed, add it as a
  new protocol action, not a bypass.
- **Never import `lib/ai/protocol-classifier.ts` from a Client Component**
  — it reads `OPENAI_API_KEY`. All AI calls must go through the
  `"use server"` actions in `app/actions.ts` (`suziReplyAction`,
  `homeChatAction`).

---

## 10. Environment variables (all optional — app runs fully in mock mode
with none set)

```
NEXT_PUBLIC_SUPABASE_URL=          # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=     # Supabase anon/public key
SUPABASE_SERVICE_ROLE_KEY=         # server-only, reserved for future admin tasks — not currently read anywhere
OPENAI_API_KEY=                    # powers the protocol classifier (lib/ai/protocol-classifier.ts) — set locally, account has no credits yet (§4d)
ANTHROPIC_API_KEY=                 # powers generateListingContent (lib/ai/service.ts) — not currently set
NEXT_PUBLIC_APP_URL=               # used for metadata/OG/sitemap; defaults to http://localhost:3000
```

**`.env.local` exists in this checkout as of 2026-08-24** (git-ignored,
confirmed via `git check-ignore -v` — never committed) with a real
`OPENAI_API_KEY`. No secrets are committed anywhere in tracked source.
Remember to add the same variables in **Vercel → Project Settings →
Environment Variables** before they'll work in production — local
`.env.local` and Vercel's env config are entirely separate.

---

## 11. Verification log

- **2026-08-24:** Built the protocol-driven AI layer (§4a): `lib/ai/protocol.ts`,
  `lib/ai/protocol-classifier.ts` (OpenAI `gpt-5-nano`, structured outputs),
  `resolveProtocolAction()` in `lib/ai/suzi-assistant.ts`, and
  `suziReplyAction`/`homeChatAction` server actions in `app/actions.ts`.
  Migrated all three client-side AI call sites to `await` these server
  actions instead of calling local sync functions directly (`openai`
  package installed as a dependency for this). `npx tsc --noEmit`,
  `npm run lint`, `npm run build` all clean (still 20 routes, same
  static/dynamic split as before). Live-tested in the dev server with a
  real `OPENAI_API_KEY` (account has no credits): both the homepage hero
  chat and the Suzi widget correctly triggered a real call to OpenAI,
  received `429 insufficient_quota`, and fell back to the exact
  pre-existing deterministic behavior with no UI breakage — confirmed via
  `preview_logs` showing the real request/error and via `get_page_text`
  showing the correct fallback reply and correct navigation
  (`/list-with-ai`) in the browser. The live (credited) classification path
  itself remains untested — that's the next verification step once the
  OpenAI account is funded.
- **2026-08-18:** Full repo audit + takeover session. `npx tsc --noEmit`,
  `npm run lint`, `npm run build` all clean throughout (20 routes;
  `/dashboard*` correctly `ƒ Dynamic`). Changes made and verified:
  - Dashboard auth gate added + verified in dev server (mock mode: no
    redirect, renders normally; §6).
  - `@anthropic-ai/sdk` added; `generateListingContent` wired to call
    `claude-sonnet-5` when `ANTHROPIC_API_KEY` is set, mock fallback on any
    failure (§4). Verified: build clean, dev-server smoke test of
    `/list-with-ai` with no key set shows unchanged mock-mode behavior.
    **Live model-call branch not tested against a real key.**
  - `npm audit` found 6 high-severity vulnerabilities, all pre-existing
    (not introduced by the SDK install) — 3 in transitive lint tooling
    (`brace-expansion`, `js-yaml`, `nanoid`) fixed via `npm audit fix`; 3 in
    Next.js itself (SSRF via rewrites, image-optimization DoS, internal
    endpoint disclosure) fixed by bumping `next` 16.2.10 → 16.3.1 via
    `npm audit fix --force`. Re-verified clean `tsc`/lint/build and a
    dev-server homepage smoke test after the bump. `npm audit` now reports
    0 vulnerabilities.
- **2026-08-10:** Prior handover audit (`PROJECT_CONTEXT.md`) — read-only,
  no build run, build/lint were last confirmed clean before that at commit
  `6c79f61`.

---

## Path history (do not repeat these mistakes)

This project's local folder has moved twice: scaffolded first in `glucgp`
by mistake, then worked on for a long stretch in
`C:\Users\husky\Documents\Mamawebseite`, then finally moved to its current,
correct location `C:\Users\husky\Documents\aurora-homes` on 2026-07-18 (same
git history, same `Danizarg/zouza-ai` remote). `Mamawebseite` and
`aurora-homes-old-codex-scaffold` may still exist on disk as stale/unrelated
leftovers — do not edit either; this folder (`aurora-homes`) is canonical.
