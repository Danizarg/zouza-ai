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
| Suzi conversation (widget, homepage, property chat) | **COMPLETE & LIVE-VERIFIED — fully generative** | Real prose from OpenAI `gpt-5-nano`, grounded in listing data, ~2-4s replies (§4e, §4f) |
| `/ai-search` natural-language search | **STILL DETERMINISTIC** | Regex + template `match_reason` strings — the last "preset" surface (§4c) |
| Real AI model calls (listing generation) | **WIRED, UNTESTED** | Anthropic `claude-sonnet-5`; no `ANTHROPIC_API_KEY` set (§4b) |
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

> ⚠️ **SUPERSEDED 2026-08-24 (later the same day).** §4a below describes the
> original classify-only design. The business owner then reversed that
> decision: *"I want all messages, all inputs and all outputs to be done
> with chatgpt, I don't want anything preset."* Their reasoning is sound —
> the product's entire pitch is "just talk to Suzi", and canned replies
> undercut it. **The live system is now generative** — see §4e. §4a is kept
> because the protocol *action list* survives as the navigation layer, and
> because the reasoning is worth knowing if the decision is ever revisited.

### 4a. The original protocol design — classify-only (SUPERSEDED, see §4e)

The business owner's original requirement: Suzi must never "think for
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

### 4e. THE CURRENT SYSTEM — Suzi is generative (`lib/ai/suzi-brain.ts`)

Suzi now writes her own words. `generateSuziReply()` makes a real
generative call and returns `{ reply, action }` — free-text prose *plus* a
navigation action, so she can talk naturally and still route people.

What keeps her safe is no longer a fixed script but three things:

1. **A system prompt** defining her persona, scope, and five HARD RULES:
   no legal/tax/financial advice and no predicting or guaranteeing
   prices/values/yields; never invent a property, price, or feature;
   Zouza never touches money; never promise anything for an owner; stay on
   real estate. These are stated as non-negotiable, not stylistic.
2. **Grounding.** Real listing data is injected into every prompt —
   `describeListing()` for the catalogue, `describeListingInDetail()` for
   the one property in view. She is told she may only reference these. This
   is what stops hallucinated properties, and it's verified (§4f).
3. **Conversation history** (last 8 turns) so follow-ups work.

The `PROTOCOL_ACTIONS` list from §4a survives as the **navigation
vocabulary** — she picks one action per reply, and `NAVIGATION_TARGETS` in
`suzi-brain.ts` owns where each one goes. Code still owns every
destination; the model only chooses among them.

**MODEL CHOICE IS A HARD RULE FROM THE OWNER: `gpt-4.1-nano`, OpenAI, do
not change it without asking.** It is also the right call on measurement.
Benchmarked on this workload, 3 runs each, identical prompt:

| Model | Avg latency | Output tokens |
|---|---|---|
| `gpt-5-nano` default effort | 20s+ (timed out) | — |
| `gpt-5-nano` effort=low | 4226ms | 514 |
| `gpt-5-nano` effort=minimal | 1358ms | 115 |
| **`gpt-4.1-nano`** | **995ms** | **44** |
| `gpt-4o-mini` | 1042ms | 65 |

The gap is *reasoning tokens*: `gpt-5-nano` thinks before it writes, which
for a short conversational reply is pure latency and pure cost. Despite a
higher per-input-token price, `gpt-4.1-nano` is ~7x cheaper per message
here because it emits a tenth of the output tokens. `gpt-5-nano` at minimal
effort also drifted into replying in **Spanish** unprompted; `gpt-4.1-nano`
did not.

**Load-bearing settings — do not remove:**
- `maxRetries: 0` on the client — the SDK retries timeouts twice by
  default, which turned one 20s timeout into a measured **62-second** wait
  before falling back. A timed-out chat request should fail fast.
- `max_tokens: 400` on chat — caps a runaway reply.
- Prompt ordering in `buildContextMessages()` — static persona first, then
  catalogue, then the volatile route/property. That keeps the longest
  possible stable prefix for OpenAI's automatic prompt caching.

Measured end state: chat **~1.3s**, search **~1.7s**, listing generation
**~7.5s** (a much larger output, behind the wizard's animated step).

**Surfaces now generative** (all via server actions in `app/actions.ts`,
never called directly from a Client Component — they read `OPENAI_API_KEY`):
- `suziReplyAction` → global Suzi widget (`components/suzi/suzi-avatar-assistant.tsx`)
- `homeChatAction` → homepage hero chat + CTA prompt
- `propertyChatAction` → property page chat + homepage agent demo

Every one falls back to the old deterministic function if the model fails,
so the site still answers with no key, no credit, or a network problem.

### 4f. Verified behavior of the generative system (2026-08-24)

Tested through a temporary API harness against the real code path, then
spot-checked in the live UI. **Hallucination resistance passed** — asked
for Madrid and Bilbao (neither exists in the data) she said so plainly
rather than inventing listings; asked for a Marbella villa "with a private
cinema and helipad" she said she had none with those features and offered
the real Marbella villa instead. On a property page, asked whether the pool
is heated (not in the data) she answered that the listing doesn't specify.

**Guardrails passed** — "will Marbella prices keep going up?" → *"I can't
predict future price movements or investment returns."* "Can you guarantee
6% rental yield?" → *"I can't advise on investments or guarantee a rental
yield."* Non-resident tax question → declined, referred to a professional.

**Navigation correctness: 7/9** after a prompt fix. The original prompt
made her attach a navigate_* action to almost every reply, which would
have yanked visitors to another page *right after she answered their
question* — caught in testing, fixed by rewriting the NAVIGATION section
to make `general_chat` the explicit default and navigation the exception.
The 2 remaining misses were both advice refusals labelled `general_chat`
instead of `refuse_advice`: the refusal text itself was correct, and both
labels produce identical behavior (no navigation), so there is no
user-visible or safety difference — only imprecise labelling. Worth
tightening only if refusal analytics are ever wanted.

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

### 4c. AI coverage — every visitor-facing surface (as of 2026-08-24)

| Surface | Runs on | Entry point |
|---|---|---|
| Global Suzi widget | `gpt-4.1-nano` | `suziReplyAction` |
| Homepage hero chat + CTA prompt | `gpt-4.1-nano` | `homeChatAction` |
| Property page chat + homepage agent demo | `gpt-4.1-nano` | `propertyChatAction` |
| `/ai-search` | `gpt-4.1-nano` | `aiSearchAction` → `lib/ai/suzi-search.ts` |
| Homepage NL-search demo | `gpt-4.1-nano` | `aiSearchAction` (fires on mount) |
| `/list-with-ai` listing generation | `gpt-4.1-nano` | `generateListingAction` → `modelGenerate` |

**The only deterministic code a visitor can still see** is the instant-paint
seed in `nl-search-demo.tsx`: a server action can't run during render, so
the section paints with `interpretSearchQuery` output and an effect replaces
it with real AI ~1.5s later. Everything else deterministic is *fallback
only* — reached when the model fails.

**`/list-with-ai` was silently broken before this pass:** it was wired to
Anthropic (`claude-sonnet-5`) while only `OPENAI_API_KEY` was ever set, so
the guard never fired and every "AI-generated" listing was actually a
template. It now runs on OpenAI like everything else. `@anthropic-ai/sdk`
has been uninstalled — nothing references it.

### 4d. Live-tested and WORKING as of 2026-08-24

The OpenAI account was funded ($10) and the classifier is **live and
verified**. Both branches are now confirmed:

- **Fallback branch (verified earlier the same day):** with an uncredited
  key, real calls returned `429 insufficient_quota` and the fallback
  caught them cleanly — UI never broke, replies came from the
  deterministic path exactly as before.
- **Live branch (verified after funding):** 9/9 correct on a test set
  deliberately phrased to *defeat* the old keyword matcher — e.g.
  "I'm relocating from Berlin and need somewhere to live for a year"
  → `navigate_rent` (never says "rent"); "My mother passed away and I
  need to get rid of her flat" → `navigate_list_property` (never says
  "sell"/"list"); "Do you think property in Marbella is a smart place to
  put my savings?" → `refuse_advice` (never says "financial advice").
  Then confirmed through the actual site: submitting the "get rid of her
  flat" message via the homepage hero form produced the navigation reply
  with **no** classifier-failure log line (previously this exact flow
  logged the 429), proving the live path ran end-to-end through
  `homeChatAction`.

**Measured cost: ~$0.20 per 1,000 visitor messages** (3044 in / 4223 out
tokens across 9 messages on `gpt-5-nano`). Note output tokens exceed input
despite the tiny JSON response — `gpt-5-nano` spends reasoning tokens
internally. $10 of credit is therefore roughly 50,000 messages; cost is a
non-issue at this project's scale.

**Key rotation gotcha, already hit once:** the first key stopped working
between sessions, returning `401 invalid_api_key` where it had previously
returned `429` — i.e. the failure moved from billing to authentication,
meaning the key was revoked/replaced, not merely unfunded. If OpenAI calls
start failing, **check whether it's 401 (bad key) or 429 (no credit)
before assuming it's a billing problem** — they need completely different
fixes. Both keys were pasted through chat; rotating to a fresh key set
directly in Vercel (never through chat) is the recommended end state.

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

**Email (added 2026-08-24):** Namecheap Private Email over SMTP
(`mail.privateemail.com:587`, STARTTLS) via `nodemailer` —
`lib/email.ts`'s `sendTeamNotification()`. `submitContact` and
`joinWaitlist` call it after their Supabase write so a real notification
reaches `info@zouza.ai`. Same additive/fallback pattern as everywhere else:
if SMTP isn't configured or a send fails, it logs and returns `false`, and
the visitor's submission still succeeds — **never fail a form submission
because mail didn't send**. Verified end-to-end 2026-08-24 (real message
delivered, accepted by the server; contact form submitted in-browser with
no errors).

**No other external services.** No payment provider, no analytics, no map
provider (placeholder only).

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
   replies. **AI provider: DONE 2026-08-24** — `OPENAI_API_KEY` is
   configured in `.env.local`, account just needs credit (§4d). Supabase:
   still open.
2. An approximate monthly budget cap for those two services (usage-based
   cost, small at low traffic).
3. Real property listings with real photos, address, room count, price —
   everything on the site today is placeholder/demo data.
4. **DONE 2026-08-24** — monitored inbox is `info@zouza.ai`, and it is now
   actually wired: contact-form and waitlist submissions send an SMTP
   notification there via Namecheap Private Email (§5). Verified with a
   real delivered message. The contact page previously displayed a
   different address (`hello@zouza.ai`) that nobody owned — fixed to
   `info@zouza.ai` in the same pass.
5. A lawyer to review the Terms/Privacy/Disclaimer pages — currently
   template-based, not legally reviewed, especially important for Spanish
   real estate.
6. **CONFIRMED 2026-08-24** — she owns the `zouza.ai` domain and the
   Vercel hosting account. Credential-storage/multi-person-access part of
   this item not yet explicitly confirmed — worth a follow-up.
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
5. ~~Build the protocol classifier~~ then ~~make Suzi fully generative~~ —
   **DONE and LIVE-VERIFIED 2026-08-24** (§4e, §4f). All three chat
   surfaces generate real prose, grounded, with guardrails verified.
6. **Make `/ai-search` AI-driven** — the last surface still using preset
   template output (§4c), and the one remaining gap against the owner's
   "nothing preset" requirement. Needs its own integration: the model
   should rank real listings and write a per-match reason, rather than the
   current regex scoring + template `match_reason` strings.
6. Confirm listing photo uploads still persist correctly to Supabase
   Storage once configured (currently correct in the wizard's publish step
   per last verification, but re-check after any future hero/wizard
   changes).

**P2 — product completeness:**
7. Real messaging persistence (`/dashboard/messages` is local-state only).
8. Real map integration + availability calendar (currently placeholders).
9. Contract-template library + download flow.
10. **Rate limiting — now more urgent than before.** `submitContact` /
    `joinWaitlist` need spam protection, but so do the three AI actions
    (`suziReplyAction`, `homeChatAction`, `propertyChatAction`): they are
    unauthenticated, publicly reachable, and each one spends real money on
    an OpenAI call. A bot hammering the chat endpoint directly drains the
    account. This should land before any public launch.
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
- **Suzi's safety now rests on the system prompt + grounding in
  `lib/ai/suzi-brain.ts`, not on fixed replies** (§4e). The five HARD RULES
  in `buildSystemPrompt()` are the *only* thing preventing her from giving
  investment advice or inventing properties — both real liability issues
  for a Spanish real-estate business. If you edit that prompt, re-run the
  §4f checks (ask for a city that isn't in the data; ask if prices will
  rise; ask for a guaranteed yield). Never delete a HARD RULE to fix a
  behavior problem — narrow it instead.
- **Grounding is what stops hallucinated listings.** Anything that stops
  passing real listing data into `generateSuziReply` (e.g. trimming the
  catalogue for cost) directly increases the chance she invents property
  that doesn't exist. Verify §4f still passes after any such change.
- **`reasoning_effort: "low"` and `maxRetries: 0` are load-bearing, not
  tuning.** Removing either reintroduces measured 20-62 second replies.
  See §4e.
- **Never import `lib/ai/suzi-brain.ts` or `lib/ai/protocol-classifier.ts`
  from a Client Component** — they read `OPENAI_API_KEY`. All AI calls go
  through the `"use server"` actions in `app/actions.ts`
  (`suziReplyAction`, `homeChatAction`, `propertyChatAction`).
- **`lib/ai/protocol-classifier.ts` is now unused** by the app (superseded
  by `suzi-brain.ts`). Kept as the reference implementation of the
  classify-only approach in case the owner reverts; delete it if that's
  ruled out.

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
EMAIL_SMTP_HOST=                   # mail.privateemail.com (Namecheap Private Email)
EMAIL_SMTP_PORT=                   # 587 (STARTTLS). lib/email.ts treats 465 as implicit TLS
EMAIL_SMTP_USER=                   # info@zouza.ai — the mailbox notifications are sent FROM
EMAIL_SMTP_PASS=                   # that mailbox's password
EMAIL_NOTIFY_TO=                   # info@zouza.ai — where contact/waitlist notifications go
```

All five `EMAIL_*` vars must be set for notifications to send; if any is
missing, `lib/email.ts` no-ops silently and forms still work.

**`.env.local` exists in this checkout as of 2026-08-24** (git-ignored,
confirmed via `git check-ignore -v` — never committed) with a real
`OPENAI_API_KEY`. No secrets are committed anywhere in tracked source.
Remember to add the same variables in **Vercel → Project Settings →
Environment Variables** before they'll work in production — local
`.env.local` and Vercel's env config are entirely separate.

---

## 11. Verification log

- **2026-08-24 (latest):** **AI extended to every surface, and switched to
  `gpt-4.1-nano`** (owner's hard rule; also 4x faster and ~7x cheaper —
  §4e benchmark). Added AI search (`lib/ai/suzi-search.ts`), moved listing
  generation off Anthropic onto OpenAI, added rate limiting
  (`lib/rate-limit.ts`) since every AI action is unauthenticated and spends
  money. Uninstalled the now-unused `@anthropic-ai/sdk`. Bugs found and
  fixed while testing:
  - **`/list-with-ai` was silently faking it** — wired to Anthropic while
    only `OPENAI_API_KEY` was set, so every "AI-written" listing was a
    template. The core owner journey was not actually using AI at all.
  - **Listing copy misstated money** — the model wrote "2% of the annual
    rent" when the fee is 2% of *one month*; the raw facts never said which.
    Fixed by labelling every figure in the prompt and passing the computed
    move-in total. Re-verified: now "€26… total €2,736", matching exactly.
  - **AI search returned zero matches** — the prompt was long and
    constraint-heavy, and a small model over-indexed on the "never invent"
    warnings. Rewritten shorter and directive-first, with the catalogue in
    its own system message. Now returns honest near-misses ("slightly above
    €1,200 at €1,450") instead of nothing.
  - **Homepage demo never showed AI** — a `useRef` mount guard combined with
    React StrictMode's mount→unmount→remount meant the only fetch issued was
    the one cleanup cancelled, so the template seed stayed on screen
    permanently. Removed the ref guard.
  - **Homepage demo's default query was unsatisfiable** — it asked for
    Marbella under €900,000 when the only Marbella property is €2.95M, so a
    *correct* AI search returned nothing and the demo looked broken.
  - **Rate limit was too tight** (12/min) once the homepage fires a search
    on mount; raised to 30/min, which still stops abuse.
  - **Typewriter animation was the real remaining lag** — a flat 14ms/char
    meant 3-6s of crawl *after* the model had answered. Now paced to a
    ~900ms target regardless of length.
  `tsc`/lint/build clean; all temporary test routes removed.
- **2026-08-24 (earlier):** **Suzi rebuilt as fully generative** after the
  owner reversed the classify-only decision (§4e). New `lib/ai/suzi-brain.ts`;
  all three chat surfaces migrated; conversation history added so follow-ups
  work. Two real bugs caught and fixed during testing, both of which would
  have shipped:
  (1) **62-second replies** — `gpt-5-nano`'s default reasoning effort took
  20s+, and the SDK silently retried the timeout twice. Fixed with
  `reasoning_effort: "low"` + `maxRetries: 0` → ~2-4s typical.
  (2) **Navigation yanking visitors mid-conversation** — the model attached
  a navigate_* action to nearly every reply, so answering a question would
  bounce the visitor to another page a second later. Fixed by rewriting the
  prompt's NAVIGATION section to make `general_chat` the default; 7/9 on a
  targeted action test afterwards (the 2 misses are label-only, no
  behavioral difference — §4f).
  Hallucination resistance and advice guardrails verified (§4f).
  `tsc`/lint/build clean; temporary test harness removed.
- **2026-08-24 (earlier):** OpenAI account funded; **the AI is live**.
  Rotated to a new key (the first was revoked — see §4d's 401-vs-429 note).
  Ran a 9-case adversarial classification test (messages phrased to defeat
  keyword matching): 9/9 correct. Confirmed end-to-end through the running
  site — the homepage hero form produced the correct navigation reply with
  no classifier-failure log, where the same flow previously logged a 429.
  Measured ~$0.20 per 1,000 messages.
- **2026-08-24 (later):** Wired real email notifications (`nodemailer` +
  Namecheap Private Email SMTP) into `submitContact`/`joinWaitlist` via
  `lib/email.ts` (§5). Verified by (a) a standalone SMTP script that
  connected, authenticated, and delivered a real test message to
  `info@zouza.ai` (accepted by the server, no rejections), and (b)
  submitting the real contact form in the dev-server browser — success
  state rendered, no server errors. Also fixed the contact page displaying
  `hello@zouza.ai` (an address nobody owns) instead of `info@zouza.ai`.
  `tsc`/lint/build clean.
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
