# Zouza — Project Context

This file is a handover/continuation document for anyone (human or AI) picking
up this project. It records what exists, why it was built this way, what is
real vs. mock, and what's left to do. Keep it updated as the project evolves.

Last updated: 2026-07-17 (see §18 — Suzi persona rebrand + global avatar assistant).

**⚠ Read §16 first.** Later on 2026-07-13 the product pivoted from a
"verified marketplace with AI tools" positioning to an AI-chat-first
product ("AI Operating System for Real Estate"). §1's narrative and §6's
route table below describe the *original* positioning and are kept for
history; §16 has the current routes, files, and rationale. Where the two
disagree, §16 wins.

---

## 1. What this project is

**Zouza** — an AI-powered real estate marketing assistant and
verified property marketplace. Positioning: *"Professional Property
Marketing. Powered by AI."* / *"Upload photos. Zouza creates the
listing."*

Spain-first, global-next. It is **not** Airbnb-but-cheaper and **not**
another Idealista-style portal — the emotional centerpiece is the AI
listing-creation flow, not a big search bar.

**Business model (MVP):** pure intermediary marketplace. Zouza provides
listings, search, messaging, verification, a contract-template area,
reviews, viewing requests, AI listing generation, AI translation, AI FAQ
generation, a dedicated AI agent per listing, and AI lead
prequalification.

**Zouza explicitly does NOT provide** (and the UI must never imply
otherwise): payment processing, rent collection, escrow, deposit
management, rent guarantees, or legal advice. Every legal page and several
UI surfaces (sell page, pricing page, listing detail) carry disclaimers to
this effect — preserve this constraint in any future work.

---

## 2. Where it lives

```
C:\Users\husky\Documents\Mamawebseite
```

**Important history:** this project was originally scaffolded by mistake in
`C:\Users\husky\Documents\glucgp` (a directory whose Claude memory is tied
to an unrelated "Gluc-GP Logistics Website" project). The user corrected
this mid-session; the entire Next.js app (everything except `.claude/`)
was moved from `glucgp` to `Mamawebseite`. `glucgp` should be left alone —
it belongs to a different project.

One side effect: during that session, the Claude Code dev-server launch
config (`.claude/launch.json`) had to live in `glucgp` (the harness's fixed
session root) pointing `--prefix` at the Mamawebseite folder on port
`3100`, because port 3000 was occupied by an unrelated `highersignal-hq`
dev server on that machine at the time. This was a local-session-only
workaround — `package.json`'s `dev` script runs plain `next dev` (port
3000) as normal; don't reintroduce a hardcoded port unless you hit the
same local conflict again.

---

## 3. Tech stack

- **Next.js 16** (App Router, Turbopack), **React 19**, **TypeScript**
- **Tailwind CSS v4** (CSS-based `@theme` tokens in `app/globals.css`, no
  `tailwind.config.js`)
- **Framer Motion** for animation (hero reveals, wizard progress, reveal-on-scroll)
- **Supabase** (`@supabase/ssr`, `@supabase/supabase-js`) for auth/DB/storage —
  fully optional, see mock-mode section below
- **Zod** + **React Hook Form** available (Zod used in `app/actions.ts`
  validation; forms mostly hand-rolled controlled inputs rather than RHF,
  since the forms are simple)
- **lucide-react** for icons
- Fonts: **Fraunces** (display/serif headings) + **Inter** (body), loaded
  via `next/font/google` in `app/layout.tsx`

---

## 4. Design system

Defined in `app/globals.css` via Tailwind v4's `@theme` block — this *is*
the design system, there's no separate config file. Key tokens:

- Backgrounds: `ivory` (#faf7f0), `parchment` (#f4eee1), `sand` (#ece3d0)
- Text/ink: `navy-900`…`navy-950` (deep navy, not black)
- Accent: `gold-500`/`gold-600` (muted gold, badges/highlights)
- Highlight: `terra-600` (terracotta, primary CTA color)
- Utility classes: `.container-page` (max-width page gutter), `.eyebrow`
  (small caps label style)
- Shadows: `shadow-card` / `shadow-lift` (two-tier shadow system, no
  arbitrary box-shadows scattered around)
- Radius: mostly `rounded-2xl` on cards, `rounded-full` on buttons/badges

**Anti-vibe-coded constraints that were followed:** one accent color
(terracotta) for primary actions, one neutral background system, no
gradient blobs, no glassmorphism, restrained shadow/radius scales,
real/specific copy (not "revolutionary AI platform" filler).

---

## 5. Directory map

```
app/                          Routes (see §6 for full list)
  actions.ts                  Server actions: submitContact, joinWaitlist,
                               generateListingAction
components/
  ui/                         button.tsx, field.tsx (Input/Select/Textarea/
                               Checkbox), badge.tsx — base design-system primitives
  home/                       hero.tsx, agent-demo.tsx (homepage-only sections)
  wizard/                     The 7-step create-listing flow (see §8)
  listing/                    Listing detail page parts: gallery, agent-chat,
                               contact-actions, reviews, listing-detail,
                               local-listing-view
  search/                     filter-panel.tsx, search-results.tsx (used by
                               /rent and /buy)
  dashboard/                  sidebar.tsx, stat-card.tsx
  messages/                   inbox.tsx (two-pane messaging UI)
  auth/                       auth-card.tsx (shared shell for login/signup/
                               forgot-password)
  site-header.tsx, site-footer.tsx, listing-card.tsx, price-breakdown.tsx,
  verification-badge.tsx, save-button.tsx, waitlist-form.tsx,
  contact-form.tsx, reveal.tsx (scroll-reveal wrapper), legal-page.tsx
lib/
  types.ts                    All domain types (Listing, Profile, Message,
                               Conversation, ViewingRequest, Review,
                               GeneratedListingContent, ListingFacts, etc.)
                               — mirrors supabase/schema.sql
  mock-data.ts                12 realistic Spain listings (Valencia, Jávea,
                               Palma, Alicante, Seville, Barcelona, Marbella,
                               Dénia, Granada, Sitges, Sóller, Málaga), plus
                               reviews, conversations, messages, viewing
                               requests, destinations
  listings.ts                 SERVER-ONLY data access (getListings,
                               getListingById) — imports next/headers via
                               Supabase server client. Do not import this
                               from a client component.
  listing-filters.ts           Client-SAFE filter/sort logic (applyFilters,
                               sortListings, ListingFilters, SortOption) —
                               split out from listings.ts specifically so
                               client components (search UI) don't
                               accidentally pull in next/headers (this was a
                               real bug hit and fixed during the build — see
                               §11).
  local-listings.ts            localStorage-backed listing store, used when
                               Supabase isn't configured (create-listing
                               wizard publish step, listing detail fallback)
  use-client-snapshot.ts       Custom hook wrapping useSyncExternalStore for
                               reading localStorage safely across SSR/
                               hydration without the useEffect+setState
                               anti-pattern (see §11 — this exists because
                               of a strict lint rule)
  ai/service.ts                AI abstraction: generateListingContent(facts),
                               answerAgentQuestion(listing, question),
                               hasAiProvider(). Mock-only right now (see §7).
  supabase/
    config.ts                  isSupabaseConfigured() — checks NEXT_PUBLIC_
                                SUPABASE_URL / ANON_KEY env vars
    client.ts                  Browser Supabase client (or null in mock mode)
    server.ts                  Server Supabase client (or null) — uses
                                next/headers, SERVER-ONLY
  utils.ts                     cn, formatPrice, slugify, daysAgo, formatDate,
                                totalMoveIn (rent + utilities + deposit + fee)
supabase/schema.sql             Full Postgres schema + RLS policies + storage
                                bucket, ready to paste into Supabase SQL editor
.env.example                    All env vars, all optional
README.md                       Setup / Supabase / AI / Vercel deploy guide
```

---

## 6. Routes built (all 24, `npm run build` verified)

| Route | Notes |
|---|---|
| `/` | AI-first homepage: hero, 4 intent cards (rent out/sell/rent/buy with DE microcopy), 5-step AI flow, example generated listing + live agent demo, verified-homes + real-price trust section, Stay/Live/Buy, featured listings, owner/seeker benefit lists, Spain destinations grid, waitlist form, sticky mobile CTA |
| `/rent`, `/buy` | Search pages, shared `SearchResults` component, filter panel (location, price, beds/baths, type, pool/sea-view/garage/pets/furnished/new-build/direct-owner/verified-only, term length), sort (recommended/lowest-cost/newest/most-verified), list/map toggle (map is a placeholder) |
| `/rent-out`, `/sell` | Owner landing pages: hero, benefits, step flow, FAQ (rent-out); features grid + legal disclaimer (sell) |
| `/create-listing` | The 7-step AI wizard — see §8 |
| `/listings/[id]` | Full detail page — see §9 |
| `/messages` | Two-pane inbox, mock conversations with a prequalification badge and an `zouza_ai` pre-check message type |
| `/dashboard` | Client component: stat cards, my listings, saved homes (from localStorage), AI drafts (from localStorage), viewing requests, verification status, profile |
| `/dashboard/owner` | Listing performance, enquiries/AI-answered stats, viewing requests, verification tasks, draft + published listings |
| `/login`, `/signup`, `/forgot-password` | Supabase Auth when configured; mock mode simulates success and routes to `/dashboard` |
| `/contact` | Reason dropdown + form → `submitContact` server action |
| `/about`, `/trust`, `/pricing` | Static marketing/explainer pages per spec |
| `/legal/terms`, `/legal/privacy`, `/legal/disclaimer` | Required non-affiliation + no-guarantee language |
| `/sitemap.xml`, `/robots.txt` | Generated from `app/sitemap.ts` / `app/robots.ts`; dashboard/messages/auth routes are set `noindex` via per-segment `layout.tsx` metadata |

---

## 7. AI service — what's real vs. mock

`lib/ai/service.ts` is the single integration point.

- `generateListingContent(facts: ListingFacts): Promise<GeneratedListingContent>`
  — currently **always** calls `mockGenerate(facts)`, a deterministic
  template function that builds a title, summary, long description,
  feature bullets, lifestyle/location paragraphs, ideal-tenant profile,
  price explanation, owner-rules summary, verification checklist, FAQ,
  agent knowledge base, and translation-readiness map — all derived from
  the facts the owner entered (no external API call).
  **To go live:** check `hasAiProvider()` (already implemented, checks
  `OPENAI_API_KEY`/`ANTHROPIC_API_KEY`), and if true, call a real model
  asking for JSON matching `GeneratedListingContent`, keeping
  `mockGenerate` as the fallback so a missing/invalid key never breaks
  the flow.
- `answerAgentQuestion(listing, question)` — deterministic keyword routing
  over the listing's structured fields (availability, pets, price/costs,
  viewings, garage, remote-work/wifi, beach distance, furnished, pool,
  verification, house rules). Used both by the homepage demo
  (`components/home/agent-demo.tsx`, hardcoded to the Jávea penthouse
  listing) and the real per-listing chat (`components/listing/agent-chat.tsx`).
  **To go live:** same pattern — swap in a real model call, passing the
  listing as context, with this function as fallback.

This function is called via the server action `generateListingAction` in
`app/actions.ts` (not called directly from the client) so that
`hasAiProvider()`'s server-only env var check works correctly.

---

## 8. The create-listing wizard (`components/wizard/`)

State machine lives in `wizard.tsx`, steps 1–7:

1. **Intent** (`step-intent.tsx`) — rent_out vs sell
2. **Photos** (`step-photos.tsx`) — drag-drop, stores `File` + `URL.createObjectURL`
   preview; if Supabase is configured, files are uploaded to the
   `listing-photos` storage bucket at publish time (step 7), otherwise the
   blob preview URLs are used directly (session-only — this is a known
   demo limitation, see §12)
3. **Facts** (`step-facts.tsx`) — address/city/country, type, beds/baths/size,
   pool/sea-view/garage/pets/furnished, price, utilities/deposit/fee
   (rent only), availability, owner rules, free-text notes
4. **AI generation** (`step-generating.tsx`) — animated "Zouza is creating
   your listing" screen with a 6-stage progress list. **Important
   synchronization detail:** the transition to step 5 happens only once
   *both* the animation has played its full sequence *and* the (mock or
   real) AI call has resolved, whichever is slower — implemented via two
   refs (`animationDoneRef`, `generatedRef`) and a `tryAdvancePastGenerating()`
   function called from both completion points, specifically to avoid
   triggering React's `react-hooks/set-state-in-effect` lint rule (see §11)
5. **Review** (`step-review.tsx`) — every generated field is editable
   (title, summary, description, feature bullets, ideal profile), plus
   read-only price explanation, verification checklist, FAQ, and
   translation-readiness badges
6. **Preview** (`step-preview.tsx`) — renders the assembled listing exactly
   as the public detail page would show it (gallery + price breakdown +
   features)
7. **Publish** (`step-publish.tsx`) — success screen; the actual publish
   logic (building the final `Listing` object, uploading photos if
   Supabase configured, inserting into Supabase or falling back to
   `saveLocalListing`) lives in `wizard.tsx`'s `handlePublish()`

**Verified working end-to-end in-browser during this build** (photo
upload via synthetic `File`/`DataTransfer`, form fill via the preview
tool's `preview_fill`, generation animation, review, preview, publish, and
confirmed the resulting listing was correctly written to
`localStorage['zouza_local_listings']`).

---

## 9. Listing detail page (`/listings/[id]`)

`app/listings/[id]/page.tsx` is a **server component**: tries
`getListingById(id)` (Supabase or `MOCK_LISTINGS`). If not found, it
renders `<LocalListingView id={id} />` — a **client component** that looks
the id up in `localStorage` via `useClientSnapshot` (see §11), so listings
published through the wizard in mock mode are viewable immediately after
publish without needing a backend.

Both paths converge on `<ListingDetail listing={listing} />`
(`components/listing/listing-detail.tsx`), which renders: gallery
(`gallery.tsx`, with lightbox), spec row, verification badges + last-checked
date, description, features, location placeholder, availability (rent
only) + calendar placeholder, contract-template placeholder + disclaimer,
reviews (`reviews.tsx`), and a sticky sidebar with price breakdown
(`components/price-breakdown.tsx` — shared with the wizard preview step),
contact/viewing action forms (`contact-actions.tsx`, client-side only, no
real backend), and the AI agent chat (`agent-chat.tsx`).

---

## 10. Supabase integration

`supabase/schema.sql` — full schema, ready to paste into the Supabase SQL
editor. Tables: `profiles`, `listings`, `listing_images`, `listing_features`,
`conversations`, `messages`, `viewing_requests`, `reviews`,
`saved_listings`, `verification_records`, `ai_generated_content`,
`contact_submissions`, `waitlist_signups`. Includes RLS policies (public
read for published listings/reviews/images, owner-only write, participant-
only message access) and creates the `listing-photos` public storage
bucket.

**Mock-mode pattern used everywhere:** every data-access function checks
`isSupabaseConfigured()` (true only if `NEXT_PUBLIC_SUPABASE_URL` +
`NEXT_PUBLIC_SUPABASE_ANON_KEY` are set) and falls back to
`lib/mock-data.ts` / `localStorage` if not. This means the entire product
is fully clickable with zero configuration — verified by running the app
with no `.env.local` at all.

---

## 11. Non-obvious bugs hit and fixed during this build

Worth knowing before touching related code:

1. **Server/client module boundary bug:** `lib/listings.ts` originally
   mixed server-only Supabase fetching (`getListingById`, `getListings`,
   which import `next/headers`) with pure filter/sort helpers. A client
   component (`components/search/search-results.tsx`) importing the
   filter helpers dragged the whole module — including `next/headers` —
   into the client bundle, crashing with *"You're importing a module that
   depends on next/headers... in the Pages Router"* (a misleading error;
   the real issue was the App Router client/server boundary). **Fix:**
   split into `lib/listings.ts` (server-only) and `lib/listing-filters.ts`
   (client-safe, no Supabase import). If you add new server-only data
   access, keep it out of any file a client component imports from.

2. **React 19 + new strict lint rules:** this repo's ESLint config
   enforces `react-hooks/set-state-in-effect` (calling `setState`
   synchronously inside a `useEffect` body is now a lint **error**, not
   just a discouraged pattern) and `react-hooks/purity` (calling
   `Math.random()` anywhere reachable from a component/hook body is
   flagged, even inside a `setTimeout` callback defined in an event
   handler). Both are real errors that failed `npm run lint`. Fixes
   applied:
   - Any "read from localStorage and store in state" pattern
     (`save-button.tsx`, `local-listing-view.tsx`, both dashboard pages)
     was rewritten using `lib/use-client-snapshot.ts`, a small wrapper
     around `useSyncExternalStore` — the React-blessed way to read
     external browser state without an effect+setState round-trip, and
     it also avoids SSR/hydration mismatches. **Caveat:** the wrapper
     memoizes by `JSON.stringify`-ing the snapshot, because
     `useSyncExternalStore` requires a *stable* reference when nothing
     changed — returning a fresh array/object literal every call causes
     an infinite re-render loop. If you add a new usage, don't bypass
     this caching.
   - `site-header.tsx`'s "close mobile menu on route change" effect was
     replaced with `onClick={() => setOpen(false)}` on each nav link
     directly, instead of watching `pathname`.
   - The wizard's step-4→5 auto-advance (originally a `useEffect` watching
     two booleans) was rewritten as two refs + a plain function called
     directly from the two async completion callbacks (see §8) — this is
     the general pattern for "derived state that used to live in an
     effect": move the triggering logic into the event/callback that
     causes it, not a `useEffect` watching state that already changed.
   - `agent-chat.tsx`'s random response-delay jitter (`Math.random()`) was
     simplified to a fixed 650ms delay.

   **If you hit `react-hooks/set-state-in-effect` or `react-hooks/purity`
   again, these are the two established patterns to reach for** — don't
   suppress with eslint-disable, fix at the root.

3. **Broken Unsplash asset:** one image ID
   (`photo-1600607687644-c7171b42498b`, used for the Alicante rental in
   `lib/mock-data.ts`) 404s. Replaced with
   `photo-1600121848594-d8644e57abab`. All other Unsplash IDs in
   `mock-data.ts` were checked and return 200 — if you add new mock
   listings with new photo IDs, verify them (`curl -o /dev/null -w
   "%{http_code}" <url>`) before committing, since a dead Unsplash ID
   fails silently in `next/image` (404, no build-time error).

4. **Title-generation copy bug:** the mock AI's title template originally
   produced awkward phrasing like *"…with Fully Furnished in Jávea"* when
   `furnished` was the only true amenity flag. Fixed in
   `lib/ai/service.ts` by separating true "amenity" highlights
   (pool/sea-view/garage, used with "with X") from `furnished` (now a
   leading adjective: "Furnished 2-Bedroom Apartment in Jávea").

5. **React-controlled-input testing gotcha** (relevant if you automate
   browser testing against this app): setting `input.value = "x"` via
   plain JS and dispatching an `input` event does **not** reliably trigger
   React 19's `onChange` for controlled inputs, because React patches the
   instance's value setter and tracks it — the DOM shows the new value but
   React's internal state never updates, so a "Continue" button gated on
   that state stays disabled. The reliable fixes are: (a) the preview
   tool's `preview_fill` (works correctly, presumably simulates real key
   events), or (b) grabbing the setter off the **prototype**
   (`Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,
  'value').set`) before dispatching the event. Don't use plain
   `el.value = x` in test scripts against this app's forms.

---

## 12. Known limitations / what's still mock (be upfront about these)

- **AI generation and the AI agent are template-based, not model-backed.**
  This was explicit in the brief ("mock AI generation if API key is
  missing") — see §7 for the swap-in point.
- **Photo persistence:** in mock mode, uploaded photos are `blob:` object
  URLs, which only live for the current browser tab/session. A
  page refresh after publishing (without Supabase configured) will show
  broken images for user-uploaded photos on that specific draft listing
  (the bundled `MOCK_LISTINGS` and their Unsplash images are unaffected).
  This resolves itself automatically once Supabase Storage is configured.
- **Messaging, viewing requests, dashboard stats, reviews** all read from
  `lib/mock-data.ts` — sending a message in `/messages` only updates
  local React state (`components/messages/inbox.tsx`), it doesn't persist.
- **Map and availability calendar** are static placeholder blocks (by
  design, per spec — "map/list toggle placeholder", "availability
  calendar placeholder").
- **Contract template area** is a placeholder with a disclaimer, no actual
  file download.
- **No real authentication gate:** `/dashboard` and `/dashboard/owner` are
  publicly reachable (not behind a Supabase Auth session check) — they
  render demo data regardless of login state. Add a server-side session
  check in `app/dashboard/layout.tsx` before this goes to production with
  Supabase Auth live.
- **Contact/waitlist forms** have no rate limiting or spam protection.
- **No automated test suite** (unit or e2e) — verification so far has been
  manual (build/lint/typecheck + live in-browser click-throughs during
  this session).

---

## 13. How to pick this back up

```bash
cd C:\Users\husky\Documents\Mamawebseite
npm install
npm run dev        # http://localhost:3000
```

Works immediately with no env vars. To connect Supabase or a real AI
provider, see `README.md` (setup steps) and §7/§10 above (what to change
in code).

Before shipping further changes: `npx tsc --noEmit`, `npm run lint`,
`npm run build` should all stay clean — they were clean as of this
writing (24/24 routes built, 0 lint errors).

---

## 14. Rebrand: Aurora Homes → Zouza (2026-07-13)

The user purchased the domain **zouza.ai** and the product was renamed
from "Aurora Homes" to **Zouza** throughout — the GitHub repo was
renamed from `aurora-homes` to `zouza-ai` to match (repo:
[Danizarg/zouza-ai](https://github.com/Danizarg/zouza-ai)).

**What changed:** every user-facing occurrence of "Aurora Homes" →
"Zouza", and standalone "Aurora" (the AI persona in prose, e.g.
"Aurora creates the listing") → "Zouza", across all pages, components,
metadata, legal text, README, and this file. Also renamed:
- `package.json` name: `aurora-homes` → `zouza-ai`
- localStorage keys: `aurora_saved_listings` → `zouza_saved_listings`,
  `aurora_local_listings` → `zouza_local_listings`
- message sender type value: `"aurora_ai"` → `"zouza_ai"` (in
  `lib/types.ts`, `lib/mock-data.ts`, `components/messages/inbox.tsx`,
  `supabase/schema.sql`)
- placeholder contact email: `hello@aurorahomes.example` →
  `hello@zouza.ai`

This was done via a scripted find-and-replace across all git-tracked
source files (ordered substitution: full brand phrase first, then
standalone word, to avoid partial-match corruption), followed by
`npx tsc --noEmit` / `npm run lint` / `npm run build` to confirm nothing
broke — all clean, 24/24 routes.

**If you rebrand again:** repeat this pattern rather than hand-editing —
grep case-insensitively for the old name across the whole repo first to
find every file, decide the exact replacement order (longest/most
specific string first), then verify with the same three commands
afterward. Don't forget `package-lock.json` (regenerate via `npm install`
after changing `package.json`'s `name`, rather than hand-editing the
lockfile) and the GitHub repo name itself (a separate manual/API step,
not part of the codebase).

**Still says the old name:** nothing, as far as a full-repo
case-insensitive grep for "aurora" could find (checked immediately after
the rename). If you spot a leftover, it likely means a new file was added
between the rename and now.

---

## 15. Vercel deployment blocked by commit-author verification (2026-07-13)

Hit right after connecting `zouza.ai`: every push to `main` (and even
manually clicking **Redeploy** in the dashboard) showed **"Deployment
Blocked"** with:

> The deployment was blocked because the commit author did not have
> contributing access to the project on Vercel. Hobby teams do not
> support collaboration. Please upgrade to Pro to add team members.

This looked like a real permissions problem, but the repo owner
(Danizarg) and the Vercel project owner were the same person — the
actual cause was that local git commits were authored with the
**GitHub-generated noreply proxy email**
(`135036797+Danizarg@users.noreply.github.com`, produced by GitHub's
"Keep my email addresses private" setting), and Vercel's commit-author
verification couldn't resolve that address back to a verified account
with access to the Vercel project — even though it's the correct owner.
It blocked the deploy as if it were an untrusted external contributor,
on the Hobby plan's "no collaborators" restriction.

**Fix:** switched git's `user.email` (both local repo config and global)
to the GitHub account's actual primary verified email
(`daniel.zarghoum@gmail.com`, from github.com/settings/emails) instead of
the noreply proxy, then pushed a new commit under the corrected identity.
Did **not** amend/rewrite the already-pushed commits (that needs a force
push, which was avoided) — a fresh commit with the right author was
enough to unblock deploys going forward.

**If this happens again** (e.g. on a new machine, or after re-enabling
"Keep my email addresses private" on GitHub): check
`git config user.email` and `git config --global user.email` — if either
is set to a `*.users.noreply.github.com` address, that's very likely the
cause. Set it to the real verified primary email from
github.com/settings/emails instead.

---

## 16. Product pivot: AI-first "AI Operating System for Real Estate" (2026-07-13)

Same day, after the Hallmark redesign (§14) shipped and deployed
successfully, the user requested a full pivot: not another property
portal with AI features bolted on, but an explicit AI-chat-first product
— "the AI is the product, not the listings." This section is the current
source of truth for routes and architecture; §1–§13 describe the earlier
"verified marketplace" positioning and are historical.

### What changed vs. what was kept

**Kept as-is:** the visual design system (`design.md` — palette,
typography, radius, depth, CTA voice), Supabase schema and mock-mode
pattern, `lib/types.ts`'s core `Listing` shape, the Hallmark redesign's
navy-led/border-led voice, all legal/trust/pricing page content (adjusted
only where copy referenced removed routes).

**Rebuilt:** the homepage (now an AI-chat hero + live-analysis demo +
natural-language search demo + property-AI demo, in that order), the
listing-creation wizard's facts step (form → chat Q&A), the listing
detail page's CTA hierarchy (AI chat promoted above contact/viewing
actions), search (split into `/ai-search` for natural language and
`/explore` for classic browsing).

**Removed:** `/rent`, `/buy`, `/rent-out`, `/sell`, `/create-listing`,
`/listings/[id]`, `/login`, `/signup`, `/forgot-password`, `/messages`
(top-level), `/dashboard/owner`. All replaced per the route map below —
nothing was deleted without a direct replacement covering its function.

### Current route map

| Old route | New route | Notes |
|---|---|---|
| `/` | `/` | Fully rebuilt — see §"New homepage sections" below |
| `/rent` + `/buy` | `/explore` | Combined, mode toggle (All/Rent/Buy) added |
| — | `/ai-search` | New — natural-language search, "Refine manually" reveals basic filters |
| `/create-listing` | `/list-with-ai` | Same wizard, facts step is now chat-driven |
| `/listings/[id]` | `/property/[id]` | Same component (`ListingDetail`), CTA order changed |
| `/rent-out` + `/sell` | `/how-it-works` | Consolidated explainer page |
| `/login` | `/auth/sign-in` | |
| `/signup` | `/auth/sign-up` | |
| `/forgot-password` | `/auth/forgot-password` | |
| `/messages` | `/dashboard/messages` | Moved under the dashboard, same `Inbox` component |
| `/dashboard/owner` | `/dashboard/listings` | Same content, renamed |
| `/dashboard` | `/dashboard` | Unchanged |
| `/about`, `/trust`, `/pricing`, `/contact`, `/legal/*` | unchanged | Internal links updated to new routes |

### New homepage sections (in DOM order)

1. **Hero** (`components/home/hero.tsx`) — headline + an embedded AI chat
   panel (`chatRespond()` in `lib/ai/service.ts`), starter prompts from
   `MOCK_AI_CHAT_EXAMPLES` in `lib/mock-data.ts`.
2. **Live AI demo** (`components/home/live-demo.tsx`) — auto-cycling
   checklist animation (uploading → feature detection → generation →
   publish), purely presentational, loops every ~10s. Not wired to real
   photo upload — that's `/list-with-ai`'s job.
3. **Three simple steps**, **AI creates everything grid** — inline in
   `app/page.tsx`, static content.
4. **Natural-language search demo** (`components/home/nl-search-demo.tsx`)
   — real interactive search against `MOCK_LISTINGS` via
   `interpretSearchQuery()`.
5. **Property AI assistant demo** (`components/home/agent-demo.tsx`,
   restyled from the old version) — now demos the Marbella villa listing
   with "community fees" / "beach distance" as the starter questions,
   matching the brief's example verbatim.
6. Featured properties, testimonials (`MOCK_TESTIMONIALS`), final CTA.

### AI service additions (`lib/ai/service.ts`)

- `chatRespond(message): string` — keyword-overlap match against
  `MOCK_AI_CHAT_EXAMPLES`, generic fallback otherwise. Used by the
  homepage hero panel only (not the property agent, which still uses
  `answerAgentQuestion`).
- `interpretSearchQuery(query, listings): SearchMatch[]` — parses budget
  (see gotcha below), bedroom count, city (via `CITY_ALIASES` lookup),
  beach/buy/rent intent from free text, scores every listing, returns the
  top 6 with a human-readable `match_reason`. Used by both the homepage
  search demo and the real `/ai-search` page.
- Added `community fee` / `tax` question branches to `answerAgentQuestion`
  and a `distance_to_beach_min`-aware beach-distance answer, so the
  property AI assistant can answer the brief's exact example questions
  ("Are there community fees?" / "How far is the beach?").

**Gotcha already hit and fixed:** the first version of the budget parser
in `interpretSearchQuery` stripped `.` and `,` unconditionally as
thousands-separators before applying a unit multiplier, so `"€1.2M"`
became `1,200,000 × 10 = 12,000,000`. Fixed by requiring either an
explicit `k`/`m`/`million` suffix (decimal point preserved, only commas
stripped) or a bare `€`-prefixed number (both `.` and `,` treated as
separators). If you touch this function again, re-verify with an
actual `"€1.2M"`-style query — it's exactly the kind of bug that looks
fine on integer test inputs and breaks on the first decimal.

### Data model additions (`lib/types.ts`, `lib/mock-data.ts`)

Added to `Listing` (all optional, so Supabase rows predating them still
type-check): `ai_summary`, `ai_highlights`, `faq`,
`distance_to_beach_min`, `community_fees_monthly`, `taxes_note`,
`owner_type`, `match_reason`. New top-level types: `Testimonial`,
`AiChatExample`, `SearchMatch`.

These are **derived automatically** inside `mock-data.ts`'s `listing()`
factory function (not hand-authored per listing) from existing fields —
e.g. `distance_to_beach_min` derives from `sea_view`/`pool`,
`community_fees_monthly` from price × property type. If you add a new
mock listing, these fields populate themselves; override any of them
explicitly in the seed object if the derived value doesn't fit.

### The chat-based listing-creation step

`components/wizard/step-chat-facts.tsx` replaces the old
`step-facts.tsx` form (deleted). It's a fixed sequence of 8 questions
(location, bedrooms, bathrooms, size, furnished, pets, pool/sea/garage,
price) with a small per-step parser (`QuestionStep.apply`) that either
updates `ListingFacts` and advances, or re-asks with a retry message if
the answer didn't parse. Everything else in the wizard (`wizard.tsx`,
photo upload, AI generation, review, preview, publish) is unchanged —
only this one step's UI paradigm changed from form fields to chat.

**If you extend the question sequence:** each `QuestionStep.apply`
returns `null` to signal "couldn't parse, re-ask" — don't throw, and
don't skip the retry message, or the chat will silently stall on a bad
answer.

### Known limitations specific to the AI-first features (mock, by design)

- `chatRespond` and `interpretSearchQuery` are deterministic keyword
  matching, not a real model — same caveat as `generateListingContent`
  and `answerAgentQuestion` already documented in §7. All four share the
  same swap-in point pattern: keep the mock as a fallback, add a real
  model call gated on `hasAiProvider()`.
- The homepage "live AI demo" checklist animation is fully presentational
  and loops on a timer — it does not reflect real photo analysis. Actual
  photo upload + generation only happens in `/list-with-ai`.
- `/ai-search`'s "Refine manually" panel is a deliberately small filter
  set (min bedrooms, max budget) — not the full `FilterPanel` component,
  to avoid coupling a combined-mode search page to that component's
  rent/buy-specific field logic. Extend it directly in
  `app/ai-search/page.tsx` if more filters are needed.

### Verification performed

`tsc --noEmit`, `npm run lint`, `npm run build` all clean (23/23 routes).
Live-tested in-browser: homepage chat panel (exact canned reply
verified), `/ai-search` example query (budget parsing bug caught and
fixed live), full `/list-with-ai` flow including the new chat facts step
through to a published draft, and the resulting `/property/[id]` page
(location intelligence section, AI chat anchor).

---

## 17. Motion/interaction pass — "feel alive" (2026-07-13, later same day)

Follow-up brief: keep the AI-first structure from §16, but make it feel
like an OpenAI/Linear/Apple-grade product — cursor reacts, cards move,
AI visibly thinks and types, buttons glow — rather than a static page
with AI copy. This was an enhancement pass over existing components, not
a rebuild.

**New primitives** (`components/motion/`):
- `thinking-dots.tsx` — three-dot pulse, used everywhere Zouza is
  composing a reply.
- `typewriter-text.tsx` — character-by-character reveal for AI replies.
  Respects `prefers-reduced-motion` (renders instantly). Caller passes
  `onDone`; internally the callback is stashed in a ref **updated inside
  its own effect** (not during render) so the typing effect only
  restarts when `text` itself changes, not on every parent re-render.
- `cursor-glow.tsx` — a soft radial light following the pointer, mounted
  once in `app/layout.tsx`. Desktop-with-precise-pointer only, disabled
  under reduced motion, `pointer-events-none`.

**Wired into every AI chat surface:** the homepage hero panel
(`components/home/hero.tsx`), the homepage property-AI demo
(`components/home/agent-demo.tsx`), the real property-page chat
(`components/listing/agent-chat.tsx`), and the `/list-with-ai` chat facts
step (`components/wizard/step-chat-facts.tsx`) — each now shows
`ThinkingDots` while "thinking" and types out the reply via
`TypewriterText`. The hero panel also gets a subtle gold ring/glow while
active (thinking or typing).

**`app/globals.css` gained a `glow-cta` utility** — a slow pulsing radial
glow reserved for the primary "Start with AI" buttons only (header, hero,
three-steps section, final CTA, mobile sticky CTA). Not applied to
buttons generally — design.md's border-led depth rule still holds
everywhere else.

**Live AI demo rebuilt** (`components/home/live-demo.tsx`): expanded from
11 to 20 stages matching the brief's exact checklist (uploading →
per-image "Analysing image N of 3…" → 7 feature-detection checkmarks →
generation pipeline → publish), added a top progress bar, and a scanning
overlay (an animated gradient sweep + gold ring) on whichever photo is
currently "being analysed".

**AI-creates-everything cards** (`app/page.tsx`) now reveal a one-line
example on hover (e.g. Property title → "Sea-view villa with private
pool in Marbella") via `group-hover:opacity-100` — the example text is
always in the DOM (reserving its layout space) so hover never reflows
the grid.

**AI search gained real scoring structure.** `SearchMatch` (`lib/types.ts`)
now carries `match_percent: number` and `reasons: SearchMatchReason[]`
(structured `{label, detail}` pairs — Location / Lifestyle fit / Beach
distance / Budget fit) alongside the original prose `match_reason`.
`interpretSearchQuery` in `lib/ai/service.ts` computes the percentage
**relative to which criteria the query actually mentioned** (so a query
with no budget doesn't cap every result's score) and now surfaces both a
"X% match" badge and the structured breakdown on the homepage demo
(`components/home/nl-search-demo.tsx`); `/ai-search`'s card-based results
show the percentage inlined into the existing `match_reason` string
rather than duplicating the structured breakdown UI.

**New:** `components/home/mini-ai-prompt.tsx` — a compact single-turn
version of the hero panel, added to the homepage's final CTA section so
it echoes the hero's "talk to Zouza" affordance at the bottom of the page
too.

**Property card interactions** (`components/listing-card.tsx`): hover now
lifts the card (`-translate-y-1`), adds a gold glow ring
(`hover:shadow-[...]`), and pulses the "Talk to AI" message icon
(`group-hover:animate-pulse`).

### Two real bugs caught and fixed during this pass

1. **`chatRespond` keyword scoring false-positive.** The homepage/mini
   chat panel matched canned examples by raw word overlap with no
   stopword filtering — a query like *"I want to sell my house"* tied
   with *"I want to buy a villa in Marbella"* purely on the shared filler
   word "want", and (since ties keep the first-found example) always
   answered with the Marbella villa reply regardless of what was
   actually asked. Fixed by adding a `CHAT_STOPWORDS` set (want, need,
   help, find, with, from, have, this, that, will, are, the, for, and,
   your) that both the query and every example prompt are filtered
   through before scoring. **If you add new `MOCK_AI_CHAT_EXAMPLES`,
   sanity-check a clearly-unrelated query still falls through to the
   generic fallback** rather than tying on connective words.
2. **Two lint errors from the new `react-hooks/set-state-in-effect` rule**
   in the new motion primitives (same rule category documented in §11):
   `cursor-glow.tsx`'s capability-detection state was rewritten with
   `useClientSnapshot` (the existing hook from `lib/use-client-snapshot.ts`
   — a perfect fit, since it's literally "read a browser-only capability
   once"). `typewriter-text.tsx` needed the initial `setShown("")` reset
   removed entirely (relying on the `useState("")` default, since in
   every real usage a fresh `TypewriterText` is mounted per message
   rather than reusing one instance across different `text` values) and
   the reduced-motion instant-set wrapped in a zero-delay `setTimeout` so
   the state update happens inside a callback, not the effect's
   synchronous top level.

### Verification performed

`tsc --noEmit`, `npm run lint`, `npm run build` all clean (23/23 routes).
Live-tested in-browser: confirmed the hero panel's reply renders
progressively (4 → 17 → 37 → 63 → 96 → 149 characters over ~2.5s, not
instantly), the live AI demo's expanded stage list plays through, the
`/ai-search` match-percent badges render, `/property/[id]`'s AI chat and
verification badge render — and caught + fixed the `chatRespond` scoring
bug live by deliberately testing an adversarial query ("sell my house"
against a chat panel whose only canned examples start with "buy").

---

## 18. Suzi rebrand + global AI avatar assistant (2026-07-17)

Two-part brief, same day: (1) rename the AI persona from generic
"Zouza AI" to a named partner, **Suzi**, across the homepage and chat
surfaces, with a redesigned Suzi-first hero; (2) build a **global
floating Suzi avatar widget** — a site-wide, page-aware guide distinct
from the per-property chat, available on every route via `app/layout.tsx`.

### Part 1 — Suzi persona + hero rebuild

**Brand rule enforced throughout:** never label the AI "AI Assistant",
"Bot", or "Chat" as the primary label — always "Suzi" / "Talk to Suzi" /
"Ask Suzi" / "List with Suzi". Zouza remains the platform name; Suzi is
the AI persona ("Powered by AI. Guided by Suzi.").

**New components** (`components/home/`):
- `suzi-prompt-input.tsx` — the shared conversational input row (not a
  search bar): typing plus native browser speech-to-text, no server, no
  API key. `micFirst` prop shifts visual emphasis — larger, filled mic
  button on touch devices, compact secondary mic on desktop with
  pointer/mouse — computed once via `lib/use-speech-recognition.ts`
  (wraps `SpeechRecognition`/`webkitSpeechRecognition`, `supported` read
  through the existing `useClientSnapshot` pattern so it never causes a
  hydration mismatch or an SSR/client capability flash).
- `suzi-intro-card.tsx` — the personality/trust panel ("Hi, I'm Suzi. 👋
  Your AI Real Estate Partner. I'm here to help you: …").
- `value-strip.tsx` — the 4-item "Just talk to Suzi / AI that
  understands you / Saves you time / You're in control" row.
- `conversation-showcase.tsx` — tabbed (Buy/Rent/Sell/List/Invest)
  scripted exchange demo, alternating voice/type mode icons per example.
  Each tab remounts a fresh `ExchangeBubble` child keyed by the active
  tab (not manual `setState` resets in an effect) so thinking/typing
  state resets for free on tab switch — the same "remount instead of
  reset" pattern used by `TypewriterText` elsewhere in this codebase.
- `components/motion/voice-waveform.tsx` — small animated bar waveform
  shown in the mic button while actively listening.

**Hero rebuilt** (`components/home/hero.tsx`): new headline "Just tell
Suzi what you need. She'll do the rest.", left column now holds the
conversation (starter prompts + transcript + `SuziPromptInput`) instead
of a boxed panel, right column holds `SuziIntroCard` + a small trust
strip (verified owners, no agency markup) + List with Suzi / Explore
homes buttons. Device-aware mic emphasis computed via
`window.matchMedia("(pointer: coarse)")` through `useClientSnapshot`.

**Homepage restructured** (`app/page.tsx`) to the brief's order: Hero →
ValueStrip → How it works (Tell Suzi / Suzi understands / Get matches /
Make it happen, 4 steps not 3) → ConversationShowcase → Featured
properties → **Why Suzi is different** (new capability grid — finds
homes, estimates prices, writes exposés, organises viewings, recommends
schools, calculates beach distance, explains financing, reviews
documents — deliberately distinct content from the pre-existing
"Everything Suzi creates from your photos" grid below, which stayed
where it was as part of the seller flow rather than being merged, since
the two lists answer different questions) → property-AI demo → List
with Suzi seller flow (existing `LiveDemo` + 3-step + creates-grid,
copy updated to Suzi) → NL search → testimonials → final CTA.

**Renamed everywhere** (site-header/footer nav + CTAs, listing card,
contact-actions success copy, nl-search-demo, live-demo, step-chat-facts,
agent-demo, agent-chat headers, mock testimonials/messages): "Zouza is
thinking/typing" → "Suzi is …", "Property AI Agent" → "Ask Suzi about
this home", "Talk to AI" → "Talk to Suzi", "List with AI" nav label →
"List with Suzi" (route itself unchanged: `/list-with-ai`).

### Part 2 — Global Suzi avatar assistant

**`lib/ai/suzi-assistant.ts`** — a second, distinct mock AI service from
`lib/ai/service.ts` (reuses `answerAgentQuestion` / `chatRespond` rather
than duplicating logic). Exports `getSuziResponse`, `getPageSuggestions`,
`getQuickActions`, `detectNavigationIntent`, `getPropertyAnswer`,
`getGreetingForPage` — all deterministic keyword routing, no API key.
`getSuziResponse` checks for legal/tax/financial-advice-seeking phrasing
first (refuses per the same business-boundary rule as the rest of the
product), then answers from listing data if a property is in context,
then tries navigation-intent detection ("sell my property" →
`/list-with-ai`), then falls back to the general `chatRespond` reply.

**`components/suzi/`** — the widget itself: `suzi-avatar-button.tsx`
(pulsing collapsed orb trigger, pulse disabled under
`prefers-reduced-motion`), `suzi-greeting-bubble.tsx` (one proactive
nudge, dismissible), `suzi-panel.tsx` (expanded shell,
`role="dialog"`, `tabIndex={-1}` so it can receive programmatic focus),
`suzi-message-list.tsx`, `suzi-quick-actions.tsx`,
`suzi-property-context-card.tsx`, `suzi-thinking-indicator.tsx`. The
input row reuses `SuziPromptInput` from Part 1 rather than a duplicate
`SuziInput` component — same mic/type/device-aware behaviour, one
implementation.

**`suzi-avatar-assistant.tsx`** — the orchestrator, mounted once in
`app/layout.tsx` after `<SiteFooter />`. Page-aware via `usePathname()`:
different greeting, suggestion chips, and quick actions per route
(home/explore/ai-search/list-with-ai/pricing/contact vs. a generic
fallback). Property-aware on `/property/[id]` routes: parses the id from
the pathname and looks it up via the existing `getMockListing` (the same
canonical mock data source the property page itself renders from — no
separate/parallel data layer to keep in sync), swapping the greeting,
context card, and Q&A routing to that listing's real facts.
**localStorage** (read via `useClientSnapshot`, written directly in
event handlers — never inside an effect body) remembers whether the
greeting bubble was dismissed and whether the panel was ever opened, so
the proactive 5-second greeting only nudges once per browser.
Navigation intents auto-route after a short delay
(`router.push` ~900ms after the reply renders, giving the user time to
read "I can help with that — tap below and I'll take you there." first).

**Accessibility:** ESC closes the panel (`window` `keydown` listener,
attached only while `open`), the panel receives focus on open
(`panelRef.current?.focus()` inside the open-effect, not during render —
compliant with the `react-hooks/refs` rule), Enter submits via the
input's native `<form>`, the avatar's pulse animation is skipped under
`prefers-reduced-motion`, and the fixed container adds
`env(safe-area-inset-bottom)` padding for notched phones. Positioned at
`bottom-24` on mobile / `bottom-6` on `sm:` and up specifically to clear
the homepage's separate mobile sticky "Talk to Suzi" CTA bar.

**Legal/business boundaries preserved:** the panel always shows a
one-line footer disclaimer ("Suzi guides you, but doesn't give legal,
tax, or financial advice — and doesn't handle payments."), and
`getSuziResponse` intercepts advice-seeking phrasing before any other
routing. Legal pages (`app/legal/*`, `/trust`) were **not** touched in
this pass — they were already reviewed/edited by the user in a prior
session.

### One real bug caught and fixed during this pass

**`AnimatePresence` exit never actually unmounted the panel.** The
initial implementation wrapped the panel/greeting-bubble ternary in
`<AnimatePresence>` for a fade-out-on-close transition. Live-testing
(clicking Close, pressing Escape, clicking the avatar to toggle) showed
the panel's `role="dialog"` node staying in the DOM indefinitely —
`getComputedStyle` showed the exit animation *had* run
(`opacity: 0`, but `display: flex` / `visibility: visible`, node still
present with all its children), meaning React's state update and
Framer Motion's exit-animation-target both fired correctly, but
`AnimatePresence` never called through to actually remove the old
child and swap in the new one — the widget was effectively impossible
to close once opened. This is the first use of `AnimatePresence` in
this codebase (every other `motion.div` here only does mount
animations via `initial`/`animate`, never exit). Fixed by dropping
`AnimatePresence` entirely and switching to a plain conditional render
(`{open ? <SuziPanel>… : showGreeting ? <SuziGreetingBubble /> : null}`)
— loses the fade-out-on-close transition but is provably correct
(verified: Close button, Escape key, and re-opening all confirmed via
`document.querySelectorAll('[role="dialog"]').length` before/after each
action). **If exit animations are wanted later, treat `AnimatePresence`
here as unverified/risky in this Next 16 + React 19 + Framer Motion
combination and test the unmount path explicitly before relying on it
anywhere else in the app.**

### Verification performed

`tsc --noEmit`, `npm run lint`, `npm run build` all clean (23/23 routes,
unchanged route count — this pass added no new routes, only components).
Live-tested in-browser: homepage renders the full new Suzi structure
(confirmed via page-text extraction, not just visual inspection);
floating avatar opens with page-aware greeting/suggestions on `/`;
navigating to `/property/l-marbella-villa` and opening the avatar shows
the property context card and a listing-specific greeting; asking "How
far is it from the beach?" inside the avatar correctly answered from
that listing's real `distance_to_beach_min` data (not a generic
fallback); typing "I want to sell my property" into the avatar on the
homepage correctly detected the sell intent and auto-navigated to
`/list-with-ai`; Close button, Escape key, and re-open all confirmed
working after the `AnimatePresence` fix above.
