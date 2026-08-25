@AGENTS.md

# Zouza — Permanent Development Context

**This file is the entry point for any Claude session picking up Zouza.**
It is the durable product + architecture context. `CONTEXT.md` is the
older, chronological build journal (§1–§18) — still valuable for the
"why" behind specific bugs and decisions, but where the two disagree,
**this file wins**.

- Repo: https://github.com/Danizarg/zouza-ai
- Local path: `C:\Users\husky\Documents\GitHub\zouza-ai`
  (CONTEXT.md §2 says `C:\Users\husky\Documents\Mamawebseite` — that is
  stale, the project moved.)
- Domain: **zouza.ai** (Vercel)
- Last verified: 2026-08-25 — `tsc --noEmit`, `npm run lint`,
  `npm run build` all clean, 23/23 routes.

---

## 1. Product vision

**Zouza is an AI-first real estate platform, Spain-first.** The interface
is a conversation, not a search form.

**Suzi** is the AI persona and the product's centre of gravity —
"Just tell Suzi what you need. She'll do the rest."
Zouza is the platform; Suzi is who you talk to.

**The differentiator:** Zouza must not become another property portal
with a chatbot bolted on. Suzi is intended to be the *intelligence layer*
connecting **properties + buyers + sellers + agents + market data** —
helping people *understand and decide*, not just browse listings.

**Brand rule (enforced throughout the codebase):** never label the AI
"AI Assistant", "Bot", or "Chat" as its primary label. Always
"Suzi" / "Talk to Suzi" / "Ask Suzi" / "List with Suzi".
Tagline: *"Powered by AI. Guided by Suzi."*

### Hard business boundaries (do not violate in code or copy)

Zouza is a **pure intermediary**. It does **not** provide, and the UI must
never imply: payment processing, rent collection, escrow, deposit
handling, rent guarantees, or legal/tax/financial advice.
`getSuziResponse` in `lib/ai/suzi-assistant.ts` intercepts
advice-seeking phrasing *before* any other routing, and the Suzi panel
always shows a one-line disclaimer footer. Preserve both.

---

## 2. Users

Four groups. Only the first two are represented in the current data
model; the last two are **not yet modelled at all** (see §6).

| Group | What they do | Status in code |
|---|---|---|
| **Private buyers / seekers** | Discover, compare, decide, save, enquire | Modelled (`profiles.role = 'seeker'`) |
| **Private sellers / owners** | List a property with Suzi's help, manage enquiries | Modelled (`profiles.role = 'owner'`) |
| **Agents** | Professional listing + client + lead workflows | **Not modelled** |
| **Agencies** | Teams, shared inventory, shared leads, billing | **Not modelled** |

Zouza is explicitly **not** trying to eliminate agents. Agents are a
core customer group; the product gives them professional tools that make
them more productive.

---

## 3. Business model

Zouza is a multi-sided marketplace with several revenue streams.
**Recurring subscriptions matter most** — the business should build
predictable recurring revenue rather than depend on transactions or ads.

### 3.1 Private buyers / seekers — free → **Zouza / Suzi Premium**

Entry stays **free**, and the free tier must remain genuinely useful:
Zouza needs adoption, so **do not paywall basic functionality**
(searching, browsing, talking to Suzi at a basic level, saving homes).

Premium unlocks depth, not access. Candidate premium surface:
advanced Suzi capability, deeper property analysis, advanced
comparisons, personalised property intelligence, saved-search
intelligence, alerts, advanced recommendations, decision-support tools,
premium AI workflows.

### 3.2 Private sellers — free basic listing → optional premium

Creating a **basic listing is free** and stays free. This is strategic:
**Zouza needs inventory.** The goal is to make listing a property
dramatically easier than on a traditional portal — owner supplies photos
+ facts, AI produces the listing (this is what `/list-with-ai` already
does).

Optional paid seller functionality later: premium visibility, featured
listings, enhanced AI presentation, listing optimisation, performance
analytics, buyer-interest insights, extra media/presentation, seller
tools.

### 3.3 Agents & agencies — **Professional / Agency monthly subscriptions**

The main B2B revenue line. Four capability pillars:

- **AI** — listing creation, descriptions, translation, property
  analysis, client-communication assistance, intelligent matching
- **Automation** — lead follow-up, inquiry management, automated
  responses, client workflows, property alerts, admin tasks
- **Lead management** — buyer + seller leads, qualification, history,
  client/property matching, follow-up tracking
- **Property management** — listing management, analytics, portfolio,
  status, team workflows

Agency tier adds: multiple agent accounts, roles/permissions, shared
inventory, shared leads, agency dashboards, performance analytics, team
management, centralised billing.

**Do not build all of this at once.** Design so it can arrive
incrementally (see §6 and §9).

### 3.4 Future revenue

- **Premium placement** — featured/promoted listings, higher visibility,
  premium search placement.
  **Non-negotiable trust rule:** paid placement must be *visibly
  distinguished* from organic results, and **payment must never
  secretly influence Suzi's recommendations or property evaluations.**
  If Suzi surfaces a promoted property, she says so.
- **Partner services** — mortgages/financing, insurance, legal,
  inspections, renovation, moving, utilities, interior design.
  Future possibility only. Keep the architecture from making these
  hard, but **do not overengineer for them now.**

---

## 4. Architecture

### Stack

- **Next.js 16.2.10** — App Router, Turbopack. ⚠ See `AGENTS.md`: this
  is *not* the Next.js in your training data. Read
  `node_modules/next/dist/docs/` before writing framework-level code.
- **React 19.2.4**, **TypeScript 5**
- **Tailwind CSS v4** — the design system *is* the `@theme` block in
  `app/globals.css`. There is no `tailwind.config.js`.
- **Framer Motion 12** — reveals, wizard progress, motion primitives
- **Supabase** (`@supabase/ssr`, `@supabase/supabase-js`) — auth, DB,
  storage. **Entirely optional** (see mock mode below).
- **Zod 4** (server-action validation) + **React Hook Form** (available,
  lightly used — most forms are hand-rolled controlled inputs)
- **lucide-react** icons; fonts **Fraunces** (display) + **Inter** (body)
  via `next/font/google`
- **No test framework installed.** No `test` script in `package.json`.

### The mock-mode contract (central architectural decision — preserve it)

Every data/AI path checks whether it is configured and **falls back to
realistic local behaviour** if not:

- `isSupabaseConfigured()` (`lib/supabase/config.ts`) — true only when
  `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set.
  Otherwise `lib/mock-data.ts` (12 realistic Spain listings) and
  `localStorage` back the whole product.
- `isAiEnabled()` (`lib/ai/provider.ts`, server-only) — true when
  `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` is set. Otherwise every AI
  surface answers from the deterministic layer. `hasAiProvider()` in
  `lib/ai/service.ts` mirrors it for client-safe callers.

**Result: `git clone && npm install && npm run dev` gives a fully
clickable product with zero configuration.** This is a deliberate
property worth keeping — never make a feature *require* config to be
demonstrable. Add real backends *behind* the existing fallbacks.

### Server / client boundary (a real bug source here)

`lib/listings.ts` is **server-only** (imports `next/headers` through the
Supabase server client). Client-safe filter/sort logic lives separately
in `lib/listing-filters.ts` *specifically* so client components don't
drag `next/headers` into the browser bundle. If you add server-only data
access, keep it out of any module a client component imports.

### Directory map

```
app/
  actions.ts              Server actions: generateListingAction,
                          submitContact, joinWaitlist
  page.tsx                AI-first homepage (see §5)
  ai-search/              Natural-language search
  explore/                Classic browsing (All/Rent/Buy toggle)
  list-with-ai/           The 7-step AI listing wizard
  property/[id]/          Property detail (server component)
  dashboard/              dashboard, /listings, /messages
  auth/                   sign-in, sign-up, forgot-password
  about|trust|pricing|contact|how-it-works|legal/*
  sitemap.ts, robots.ts
components/
  ui/                     button, field, badge — design primitives
  home/                   Hero (Suzi conversation), value-strip,
                          conversation-showcase, live-demo,
                          nl-search-demo, agent-demo, suzi-* hero parts
  suzi/                   Global floating Suzi avatar assistant
  wizard/                 7-step listing creation
  listing/                Detail page parts incl. agent-chat
  search/                 filter-panel, search-results
  dashboard/, messages/, auth/, motion/
lib/
  types.ts                All domain types (mirrors schema.sql)
  mock-data.ts            12 Spain listings + testimonials + chat examples
  listings.ts             SERVER-ONLY data access
  listing-filters.ts      CLIENT-SAFE filter/sort
  local-listings.ts       localStorage listing store (mock mode)
  ai/service.ts           generateListingContent, answerAgentQuestion,
                          chatRespond, interpretSearchQuery, hasAiProvider
  ai/suzi-assistant.ts    Global Suzi widget brain (page/property aware)
  supabase/               config, client (browser), server (SSR)
  suzi-events.ts          Cross-component "open Suzi" event bus
  use-client-snapshot.ts  useSyncExternalStore wrapper (see §8)
  use-speech-recognition.ts
supabase/schema.sql       Full Postgres schema + RLS + storage bucket
```

### Design system

`app/globals.css` `@theme`. Backgrounds `ivory`/`parchment`/`sand`;
ink `navy-900…950`; accent `gold-500/600`; primary CTA `terra-600`
(terracotta). Utilities `.container-page`, `.eyebrow`, `.glow-cta`
(reserved for primary "Start with Suzi" CTAs only). Shadows
`shadow-card` / `shadow-lift`. Radius: `rounded-2xl` cards,
`rounded-full` buttons/badges.

Constraints deliberately followed: one accent colour, one neutral
background system, no gradient blobs, no glassmorphism, restrained
shadow/radius scales, specific real copy over "revolutionary AI
platform" filler. `design.md` holds the full spec.

---

## 5. Current features — status

**COMPLETE** (built and verified)

- **Real AI behind every Suzi surface** — chat, per-property Q&A,
  natural-language search, and listing generation run on a real model when
  `ANTHROPIC_API_KEY` is set, with a deterministic fallback that keeps the
  whole product working when it isn't (§7)

- AI-first homepage: Suzi hero conversation (type + native speech-to-text),
  value strip, 4-step how-it-works, tabbed conversation showcase,
  featured properties, "Why Suzi is different", property-AI demo,
  seller flow (live demo + creates-grid), NL search demo, testimonials,
  final CTA + mini prompt
- Global floating **Suzi avatar assistant** on every route — page-aware
  greetings/suggestions/quick actions, property-aware on
  `/property/[id]`, navigation-intent auto-routing, ESC/focus a11y,
  localStorage greeting memory
- `/explore` — filters, sort, list/map toggle (map is a placeholder)
- `/ai-search` — natural-language query → scored matches with
  `match_percent` + structured reasons
- `/list-with-ai` — full 7-step wizard: intent → photos → **chat-driven
  facts** → generation animation → editable review → preview → publish
- `/property/[id]` — gallery+lightbox, specs, verification badges,
  description, features, price breakdown, reviews, contact/viewing
  actions, per-listing Suzi chat; falls back to a localStorage-backed
  client view for listings published in mock mode
- Marketing/legal surface: `/about`, `/trust`, `/pricing`,
  `/how-it-works`, `/contact`, `/legal/{terms,privacy,disclaimer}`,
  sitemap + robots with `noindex` on private routes
- Motion system: thinking dots, typewriter reveal, cursor glow, voice
  waveform — wired into every AI surface
- Design system + responsive layout throughout

**PARTIAL**

- **Supabase integration** — code paths exist everywhere
  (`getListings`, `getListingById`, wizard publish insert, photo upload
  to the `listing-photos` bucket, auth calls) but **no project is
  configured** (`.env.local` absent), so every path falls through to
  mock. Untested against a live database.
- **Auth** — sign-in/sign-up/forgot-password call real Supabase Auth
  when configured, but there is **no session anywhere else**: no
  middleware, no server-side session read, header never shows a signed-in
  state, and `/dashboard` is publicly reachable.
- **Wizard publish** — writes to Supabase *and* always to localStorage;
  `owner_id` is hardcoded `"local-owner"` (`components/wizard/wizard.tsx:65`).
- **Pricing page** — describes a transactional platform-fee model that
  predates the subscription business model in §3. Needs rewriting.

**UI-ONLY / MOCK (no backend)**

- Messaging (`/dashboard/messages`) — sending updates React state only
- Dashboard stats, viewing requests, reviews — read from `mock-data.ts`
- Map and availability calendar — static placeholder blocks (by design)
- Contract-template area — placeholder + disclaimer, no file
- Contact/waitlist forms — persist only if Supabase is configured; no
  rate limiting or spam protection
- Photo persistence in mock mode — `blob:` URLs, session-only; resolves
  itself once Supabase Storage is configured

**BROKEN**

- Nothing currently fails to build, typecheck, or lint.

**PLANNED / NOT STARTED**

- Everything in §3 beyond the free tier: agents, agencies, memberships,
  roles beyond owner/seeker, subscriptions, entitlements, leads,
  listing analytics, premium placement, partner services
- Automated tests of any kind

---

## 6. Database

`supabase/schema.sql` — a single idempotent script (paste into the
Supabase SQL editor). **It has never been run against a live project.**

**Entities today:** `profiles` (extends `auth.users`), `listings`,
`listing_images`, `listing_features`, `conversations`, `messages`,
`viewing_requests`, `reviews`, `saved_listings`,
`verification_records`, `ai_generated_content`, `contact_submissions`,
`waitlist_signups`. Plus a public `listing-photos` storage bucket and
RLS policies (public read for published listings/images/reviews,
owner-only writes, participant-only messages).

**Denormalisation note:** the app's `Listing` type carries `images: string[]`
and `features: string[]`; in Postgres these live in `listing_images` /
`listing_features` and are flattened by `rowToListing()` in
`lib/listings.ts`.

### Can this schema support the §3 business model?

**Partly — the listing/marketplace core is sound and worth keeping.**
`listings.owner_id → profiles.id` already gives per-user listing
ownership, and RLS is already owner-scoped, which is the right
foundation. What is missing:

| Needed for | Missing |
|---|---|
| Agents / agencies | `agencies`, `agency_members` (role + permissions), agent profile fields; listings need an optional `agency_id` alongside `owner_id` |
| Roles | `profiles.role` is `owner\|seeker\|both` — no `agent`/`agency_admin` |
| Subscriptions | `plans`, `subscriptions` (per profile *and* per agency), billing-provider ids |
| Entitlements | a feature-flag/limit layer so code asks "can this account do X?" rather than "which plan is it?" |
| Premium listings | `listings.promotion_tier` + a `promotions` record, with an explicit `is_promoted` flag surfaced in UI |
| Leads | `leads` (buyer + seller), qualification state, assignment, history — distinct from `conversations` |
| AI usage/limits | `ai_usage` metering per account per period |
| Listing analytics | `listing_events` (view/save/enquiry) + rollups |

**Do not rewrite the database.** Add these incrementally as numbered
migrations. Recommended first step: convert `schema.sql` into
`supabase/migrations/0001_init.sql` and add new files rather than
editing the baseline, so a live project can be migrated forward.

**Decision to preserve:** an *entitlement* layer (`can(account, feature)`)
sits between plans and features. Feature code must never branch on a
plan name directly — that makes pricing changes a refactor.

---

## 7. AI / Suzi

**Suzi runs on a real model** when a provider key is set, and falls back
to a deterministic layer when it isn't. Wired 2026-08-25.

**Production runs OpenAI `gpt-5-nano`** — that is the owner's cost choice.
The provider is chosen from whichever key is present:

| Key | Provider | Default model |
|---|---|---|
| `OPENAI_API_KEY` | OpenAI (Responses API) | `gpt-5-nano` |
| `ANTHROPIC_API_KEY` | Anthropic | `claude-opus-5` |

`ZOUZA_AI_MODEL` overrides the model; `ZOUZA_AI_PROVIDER` breaks the tie
when both keys exist (OpenAI wins by default). **Switching models is an
environment-variable change, never a code change** — keep it that way.

`gpt-5-nano` is the smallest model in its family. If Suzi's answers ever
read as thin, generic, or drift off the persona in `lib/ai/prompts.ts`,
try `ZOUZA_AI_MODEL=gpt-5-mini` before rewriting prompts — the prompts
were authored against a strong model.

### The four layers

| Layer | File | Role |
|---|---|---|
| Model access | `lib/ai/provider.ts` | The **only** module importing a provider SDK. `import "server-only"`. `runText()` / `runStructured()` return `null` on missing key, auth failure, rate limit, timeout, refusal, or schema mismatch — they never throw. Requests are sent with `store: false` so visitors' words aren't retained provider-side. |
| Prompts | `lib/ai/prompts.ts` | Suzi's persona, the §1 business boundaries, an injection guard, and the listing/facts context builders. Pure strings. |
| Server actions | `app/actions.ts` | `askSuzi`, `askSuziSearch`, `generateListingAction`. |
| Deterministic | `lib/ai/service.ts`, `lib/ai/suzi-assistant.ts` | Client-safe, offline. The zero-config demo **and** the permanent fallback. |

### The pattern every AI action follows

Compute the deterministic result first → try the model → return whichever
you got. This is why a missing key, an outage, or a bad response degrades
the answer instead of breaking the page. **Keep it.** Never delete a
deterministic function because "we have a real model now."

### Surfaces

`askSuzi` is the single conversational entry point behind *all* chat:
the homepage hero, the mini CTA prompt, the global floating avatar, the
homepage property demo, and the per-property chat. It takes
`{ message, route, history, listing }`; when a `listing` is passed it is
serialised into the prompt (capped at 8k chars) and Suzi answers from that
property's facts. Navigation intent stays deterministic on both paths, so
"sell my property" still routes to `/list-with-ai`.

`askSuziSearch` splits understanding from ranking on purpose: the model
turns free text into `SearchCriteria` (city, budget, bedrooms, beach,
mode, property type), then `rankListings()` — plain, inspectable code —
does the scoring, because visitors are shown a match percentage and the
reasons behind it. `normalizeCity()` maps whatever the model returns onto
the exact `listing.city` spelling in the inventory.

`generateListingAction` asks for the written content under a schema and
merges it over the template result, which keeps supplying the verification
checklist and translation map (platform facts, not prose).

### Non-negotiable boundary

Client components **never** call a model. They call server actions. Do not
import `lib/ai/provider.ts`, or a provider SDK, from any module a
client component imports — the key is server-only, and `lib/ai/service.ts`
is imported directly by client code. Verify after changes:
`grep -rlE "anthropic|openai" .next/static/` must return nothing.

### Still to do here

- **Streaming.** Replies arrive whole, then type out via `TypewriterText`.
  Streaming real tokens into it would cut perceived latency a lot.
- **Prompt caching.** The system prompt is below the ~1024-token minimum
  cacheable prefix, so nothing caches yet. Worth revisiting as prompts grow.
- **No usage metering or rate limiting.** Anyone can call the actions
  freely. Needed before public launch (and required anyway for the plan
  limits in §3).
- Suzi still can't *act* — no tools, no ability to save a search, book a
  viewing, or message an owner on the visitor's behalf. That needs §10's
  identity work first.

---

## 8. Codebase conventions & gotchas

Learned the hard way — see `CONTEXT.md` §11, §16, §17, §18 for full
detail.

1. **`react-hooks/set-state-in-effect` is a lint ERROR here.** Never
   `setState` synchronously in a `useEffect` body. Established fixes:
   read external browser state through `lib/use-client-snapshot.ts`
   (a `useSyncExternalStore` wrapper — it memoises by `JSON.stringify`,
   don't bypass that or you get an infinite render loop); move derived
   state into the event/callback that caused it; or remount a component
   with a `key` instead of resetting state. **Do not `eslint-disable`.**
2. **`react-hooks/purity` is a lint ERROR here.** No `Math.random()`
   reachable from a component/hook body — even inside a `setTimeout`.
3. **`AnimatePresence` is unverified/risky** in this Next 16 + React 19 +
   Framer Motion combination. It ran exit animations but never unmounted
   the child, making the Suzi panel impossible to close. Current code
   uses plain conditional rendering. If you reintroduce it, test the
   unmount path explicitly.
4. **Client/server module boundary** — see §4.
5. **Unsplash mock images**: verify new photo IDs return 200 before
   committing; a dead ID fails silently in `next/image`.
6. **Testing React controlled inputs via raw JS doesn't work** — React 19
   patches the instance value setter. Use the preview tool's fill, or grab
   the setter off `HTMLInputElement.prototype`.
7. **Budget parsing in `interpretSearchQuery`** previously turned `"€1.2M"`
   into 12,000,000. If you touch it, re-test with decimal + suffix inputs.
8. **`chatRespond` scoring** needs `CHAT_STOPWORDS`; if you add
   `MOCK_AI_CHAT_EXAMPLES`, verify an unrelated query still falls through
   to the generic reply instead of tying on filler words.

### Local environment

Node.js was **not installed** on this machine as of 2026-08-25; installed
Node LTS **v24.19.0** via `winget install OpenJS.NodeJS.LTS`. It lives at
`C:\Program Files\nodejs` and may not be on a fresh shell's PATH —
prepend it if `node` is not found.

```bash
npm install && npm run dev
```

Before shipping anything: `npx tsc --noEmit`, `npm run lint`,
`npm run build` must all stay clean.

### Deployment

Vercel, domain `zouza.ai`. **Known trap:** commits authored with a
GitHub `*.users.noreply.github.com` proxy email get "Deployment Blocked —
commit author did not have contributing access" on a Hobby plan. Fix is
to set `git config user.email` to the account's real verified primary
email (see `CONTEXT.md` §15). Current git user: `Danizarg`.

---

## 9. Current development state

**Session of 2026-08-25** (this handover): reconstructed the project from
the repo, wrote this file, installed Node 24 LTS (the machine had none),
and implemented P0.1 — the real AI layer in §7. Also fixed three genuine
bugs found while testing (see §13).

Before that, the last commit was `6c79f61` (2026-07-18) — hero/header
polish, following the Suzi persona + global assistant work in
`CONTEXT.md` §18. Nothing had been left half-written.

**Where the project stands now:** Zouza is a polished front-end with a
genuinely intelligent AI layer behind it, and a well-designed but still
**largely unexercised** data layer. Every user-visible flow works. Suzi is
real. What is still missing is *persistence and identity*: no live
Supabase project, no session, no account owns anything. That is the next
block of work and everything in §3's business model sits behind it.

---

## 10. Roadmap

Ordered by dependency, not by appeal. Core product before monetisation —
there is no point building Stripe subscriptions while Suzi is a keyword
matcher.

### P0 — Core blockers

1. ~~**Make Suzi real.**~~ **Done 2026-08-25** — see §7. Needs an
   `ANTHROPIC_API_KEY` in the Vercel project to be live in production.
2. **Real identity + ownership.** ← *next up.* Supabase session plumbing
   (middleware refresh, server-side session read, signed-in header state,
   protected `/dashboard`), and listings owned by the actual creator
   instead of `"local-owner"`. Everything in §3 depends on knowing who
   someone is, and Suzi can't *act* on anyone's behalf until it exists.
3. **Live Supabase project.** Run the schema, verify the read/write
   paths that have never executed, confirm photo upload + RLS.

### P1 — Essential MVP

4. Real inventory: listings persist, are readable, searchable, editable
   by their owner; drafts survive a refresh.
5. Real enquiries: contact + viewing requests persist and reach the owner.
6. Real messaging (replace `mock-data` inbox with a Supabase-backed
   conversation store).
7. Saved homes + saved searches per account (migrate off localStorage).
8. Seller dashboard truth: real listing status, real enquiry counts.

### P2 — Major product functionality

9. Account roles: extend `profiles.role` to include agent/agency admin;
   add `agencies` + `agency_members`.
10. Agent tooling v1: AI-assisted listing creation at volume, portfolio
    management, listing analytics.
11. **Leads** as a first-class entity (distinct from conversations):
    capture, qualification, assignment, follow-up tracking.
12. Suzi intelligence depth: property analysis, comparisons,
    personalised recommendations, saved-search intelligence, alerts.
13. Agency features: shared inventory, shared leads, team management,
    dashboards.

### P3 — Growth, monetisation, polish

14. Entitlement layer (`can(account, feature)`) + plan definitions.
15. Billing (Stripe): Suzi Premium, Professional, Agency; centralised
    agency billing.
16. Premium seller functionality + **clearly-labelled** premium placement.
17. AI usage metering and limits per plan.
18. Automation: lead follow-up, automated responses, property alerts.
19. Partner services integrations.
20. Test suite, rate limiting/spam protection, real map + availability
    calendar, i18n/translation delivery.

---

## 11. Important decisions (do not reverse without reason)

1. **Mock mode is a feature, not debt.** The app must stay fully
   demonstrable with zero configuration. Add real backends *behind* the
   existing fallbacks; never make a flow require config.
2. **Suzi is the interface.** Conversation first, forms second. Don't
   "fix" the product by adding a big search bar to the homepage.
3. **Never label the AI generically** — always "Suzi" (§1).
4. **Zouza is an intermediary** — no payments, escrow, guarantees, or
   legal/tax/financial advice, in code or copy (§1).
5. **Paid placement must never influence Suzi's recommendations**, and
   promoted results must be visibly marked (§3.4).
6. **Free tiers stay useful.** Basic search/browse/Suzi for buyers, and
   basic listing creation for private sellers, remain free — Zouza needs
   both adoption and inventory.
7. **Agents are customers, not targets.** Build tools that make them
   productive.
8. **Entitlements, not plan-name checks** (§6).
9. **Server-only code stays out of client-imported modules** (§4).
10. **Deterministic AI fallbacks are kept permanently**, not deleted once
    a real model is wired in (§7).
11. **The design system is `app/globals.css`'s `@theme`** — no
    `tailwind.config.js`, no ad-hoc arbitrary shadows/colours.

---

## 12. Working agreement for future sessions

Loop: **Inspect → Understand → Plan → Implement → Test → Fix → Document
→ Continue.**

- Read `AGENTS.md` first (Next.js 16 is not what you remember).
- Verify with `npx tsc --noEmit`, `npm run lint`, `npm run build`.
- Don't silence errors by deleting functionality or weakening types.
- Don't expose server secrets to the client.
- Don't replace real functionality with mocks (adding a *fallback* is
  different — that's the §11.1 pattern).
- Update this file when the state of the project changes; append
  chronological build detail to `CONTEXT.md` if it's worth keeping.

---

## 13. Bugs fixed 2026-08-25 (worth not reintroducing)

1. **The chat listing wizard silently discarded the owner's last answer.**
   `StepChatFacts` called `onContinue()` from a `setTimeout` scheduled in
   the render *before* `onChange(next)` was applied, so the
   `handleFactsSubmit` it held closed over one-answer-stale `facts`. Every
   sale listing was generated with the default €1,200 price instead of the
   price the owner typed. Fixed by passing the completed facts as an
   argument (`onContinue(next)`) rather than relying on parent state having
   settled. **General rule for this codebase:** when a child finishes a
   flow, hand the parent the final value — don't assume the callback the
   child holds has seen the latest state.

2. **AI search returned rentals for purchase queries.** `rankListings`
   scored budget without regard to mode, so a €1,450/month flat "fitted" a
   €1.2M purchase budget and ranked at 55%. Now, when the query states a
   mode, listings in the other mode are filtered out entirely.

3. **The wizard never asked what kind of property it was**, so every
   AI-created listing was an `apartment` — a 280 m² 4-bed with a pool in
   Marbella published as "Apartment". Added a property-type question with
   alias handling (chalet → villa, flat/piso → apartment, cortijo/masía →
   finca). This also matters because property type is now a search
   criterion.

### Verified this session

`npx tsc --noEmit`, `npm run lint`, `npm run build` all clean (23/23
routes). Live in-browser: hero chat, property Q&A (answered from the
listing's real `distance_to_beach_min`), `/ai-search` with `€1.2M` parsing
and mode filtering, and the **entire** `/list-with-ai` flow — intent →
photo → 9 chat questions → generation → review → preview → publish, with
the published listing confirmed in `localStorage` as
`{property_type: "villa", price_sale: 1750000, mode: "buy"}`.

Fallback behaviour was verified by running with a deliberately invalid
`ANTHROPIC_API_KEY`: chat and search both answered normally from the
deterministic layer, and the server logged exactly one line —
`[suzi:text] ANTHROPIC_API_KEY rejected — falling back.`

**Not verified:** actual model output quality. No API key was available on
this machine, so the real-model path has been exercised only for its
failure modes. The first thing to do with a key is a pass over Suzi's
tone, answer length, and refusal behaviour against `lib/ai/prompts.ts`.
