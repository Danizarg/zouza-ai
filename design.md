# Design — Zouza (v2, 2026-10-16)

A locked design system for this app. Every page redesign reads this file before
emitting code. Do not regenerate per page — extend or amend this file when the
system needs to grow.

v1 (2026-07-13) was the Mediterranean navy/gold/terracotta system chosen from
the `editorial` vs `minimal` bake-off. **v2 keeps the genre, structure,
typography, radius, depth and motion rules of v1 and replaces the palette with
the violet brand system**, adds the Z mark as the brand mark, and sanctions one
motion exception for the landing. Owner decision 2026-10-16. The v1 → v2 token
mapping is at the end of this file.

## Genre
modern-minimal — Stripe/Linear school, kept calm by a cool, violet-tinted
neutral system. Serious, engineered, quiet. Ink leads; violet is the single
accent and is used for action and brand, never as paint.

## Macrostructure family
- Landing (`/` above the fold): a full-viewport statement — the Z mark and
  wordmark, the lead line "Just tell Suzi what you need." / "She'll do the
  rest.", the support line "No fees. One simple subscription.", two equal
  doors ("Talk to Suzi", "List with Suzi") and the night-sea tide at the
  bottom. ≤25 visible words. The tide is the page's one brand-900 band.
- Marketing pages (/, /how-it-works, /about, /trust, /pricing, /pro,
  /contact): statement head → bordered content sections separated by
  hairlines (`border-border`) and alternating paper / paper-2 / brand-900
  bands. Section heads: Fraunces display heading ≤6 words, optional one-line
  support text ≤14 words; eyebrows quiet (muted), never violet on paper.
  ≤150 visible words per page; `/` ≤140 excluding listing-card data.
- App pages (/ai-search, /explore, /dashboard*, /list-with-ai,
  /property/[id]): function carries the page. `bg-surface` cards with 1px
  `border-border`, `rounded-xl`, minimal shadow. Keep every control, lose
  explanatory paragraphs.
- Content pages (/legal/*): typography only. Their text is never edited by a
  redesign — class names only.

## Theme
Tokens live in `app/globals.css` `@theme` and are mirrored hex-for-hex in
`design/tokens.json` (the mobile app reads that file). Both are canonical;
change them together. No `tailwind.config.js`; no ad-hoc hex in components
except the Suzi orb gradient, which is built from brand-300 / brand-500 /
brand-950.

Brand scale (from #7255F0):

| token | hex | role |
|---|---|---|
| brand-50 | #F4F1FE | selected-row tint, soft chips |
| brand-100 | #EEEAFE | accent-soft: badges, selection, hover tint |
| brand-200 | #DCD4FC | body text on brand-900; badge borders; tide foam |
| brand-300 | #C1B3F9 | eyebrows and icons on brand-900 (6.98:1) |
| brand-400 | #9C86F5 | glow-cta radial, listening state |
| brand-500 | #7255F0 | **primary**: buttons, focus ring, selected borders, links |
| brand-600 | #5E3FE0 | primary hover; tertiary link text (6.44:1 on white) |
| brand-700 | #4B2FC4 | badge text on brand-100 (7.13:1); borders inside dark bands |
| brand-800 | #3B259C | dark-surface hover (close buttons, icon buttons on brand-900) |
| brand-900 | #2D1F7A | **dark**: bands, chat headers, user bubbles, mode tags, tide water |
| brand-950 | #231760 | ink variant on dark; orb gradient edge |

Neutrals (cool, violet-tinted):

| token | hex | role |
|---|---|---|
| paper | #FAF9FC | page background; text on brand-900 (12.60:1) |
| paper-2 | #F2F0F7 | alternating band, AI bubbles, neutral chips |
| surface | #FFFFFF | cards, inputs, outline buttons |
| border | #E6E3EF | decorative hairlines and card edges only |
| border-strong | #8F8AA6 | **input and checkbox boundaries** (3.17:1 — the only tone that clears 1.4.11) |
| ink | #24223A | headings, primary text (14.67:1) |
| ink-2 | #3A3850 | labels, card titles, body in chat bubbles |
| muted | #6A6880 | secondary body text, eyebrows, nav links (5.13:1) |
| muted-2 | #747286 | placeholders and captions ≥18px only (4.46:1) |
| faint | #9896A8 | decorative icons and dividers only — **never text** (2.76:1) |
| success | #2E7D5B | verified / confirmed |
| danger | #B4453D | errors, cancelled / declined |

Rules:
- One accent. Violet appears on a viewport only as actions, focus, selected
  states, badges and the brand mark. Decorative violet washes are out.
- `faint` is never applied to text. `muted-2` is only for placeholders and
  large captions. Body copy is `muted` or darker.
- Inside a `bg-brand-900` band: text is `paper` / `brand-200` / `brand-300`;
  borders are `border-brand-700` or `border-paper/25`; eyebrows are
  `text-brand-300`; icon buttons hover to `bg-brand-800`. Never `ink`,
  `muted` or `faint` on dark.
- Paid placement, when it exists, is marked with a visible `brand` badge and
  never changes Suzi's answers (CLAUDE.md §3.4).

## Brand mark — Z mark B ("Voice")
A rounded-stroke Z that ends in a listening dot. It is the mark for both
Zouza and Suzi and replaces the lucide Sparkles badge wherever the brand or
Suzi is represented (header, footer, Suzi orb, chat headers, "Talk to Suzi"
CTAs). Component: `components/brand/z-mark.tsx`. Geometry: viewBox 0 0 64 64,
`fill="none" stroke="currentColor" stroke-width="9"`, round caps and joins;
paths `M14 14h32`, `M50 14 14 50`, `M14 50h22`; dot `cx=50 cy=50 r=5.5`
filled with currentColor. Stroke-based and `currentColor`, so it works mono:
paper or brand-300 on brand-900, ink on paper, white on brand-500. Minimum
rendered size 16px. Sparkles remains available as a *feature* icon (e.g. "AI
questions answered" stat) but never as the brand. Not trademark-cleared.

## Typography
- Display: Fraunces (var --font-display), weight 600, style normal — h1/h2
  and prices only. Never italic.
- Body/UI: Inter (var --font-sans), 400/500/600. Card titles and h3s are
  Inter 600, NOT Fraunces — serif is for page-level statements.
- Hero scale: text-4xl → sm:text-5xl (~3rem–3.75rem). No oversized marquee
  type.
- Eyebrows: 0.75rem, 600, tracking 0.14em, uppercase, **muted** (the
  `eyebrow` utility). On brand-900 bands add `text-brand-300`.
- Copy budgets: section heading ≤6 words; support line ≤14 words or none;
  CTA verb-first ≤3 words; every door says what happens next.

## Radius
- Buttons + inputs + chips: `rounded-lg`
- Cards + panels: `rounded-xl`
- Full circles only for genuine dots/avatars/count bubbles; NO pill buttons.
- Badges (small status tags) may stay pill — they read as tags, not buttons.

## Depth
Border-led, not shadow-led. Cards: `border border-border bg-surface`, hover
= `border-border-strong` (not a bigger shadow). `shadow-card` /
`shadow-lift` (ink-tinted rgba) only on the hero product panel,
sticky/floating elements, and overlays. `::selection` is brand-100 / ink.

## Spacing
Tailwind default 4-pt scale. Section rhythm: `py-16 md:py-20` (marketing),
`py-8 md:py-10` (app). Page gutter: `container-page` (max-w-76rem). Hit
targets ≥44px on touch: `Button` md/lg carry `min-h-11` / `min-h-12`, inputs
`min-h-11`; `sm` buttons are for pointer-first, desktop-only chrome.

## Motion
framer-motion, entrance-only: fade + ≤14px translate, 0.5–0.7s ease-out,
staggered ≤0.2s. No scroll-jacking, no loops except the wizard's generation
spinner and the Suzi orb's slow pulse. `<MotionConfig reducedMotion="user">`
wraps the app at the root, and the `Reveal` component respects
prefers-reduced-motion. `AnimatePresence` is unverified in this Next 16 /
React 19 / Framer Motion 12 combination — use conditional rendering.
Viewport-height layouts use `svh` / `dvh`, never bare `100vh`.

### Landing motion exception
Continuous ambient motion is allowed **only inside `#landing` on `/`** — the
night-sea tide at the foot of the landing — and only as follows:
- cycles between 14s and 30s (drift 23–29s, swell 14–19s qualify); nothing
  faster; drift amplitude under 8% of the band width;
- `transform` and `opacity` are the only animated properties — no colour,
  size, position or filter interpolation, no ripples or droplets;
- every animated element is a small compositor layer (`will-change` on
  exactly those elements, `contain: strict` on the band); the band is
  `aria-hidden` and `pointer-events: none`;
- paused when the landing is off-screen (`data-paused` set by an
  IntersectionObserver that touches the DOM attribute only — no React state);
- fully static under `prefers-reduced-motion: reduce`, authored so the still
  frame reads as a printed illustration.
The water is stacked SOLID wave fills — shoreline brand-200 → brand-300 at
.55 → brand-900 water, glints brand-300 at low opacity, ground paper — not a
gradient wash, and it counts as the page's one brand-900 band. The rest of
the site stays entrance-only.

## Microinteractions stance
- Silent success (inline confirmation notes, no toasts)
- Hover states: color/border shifts only; arrow icons may translate 0.5px
- Focus: the global `:focus-visible` ring — 2px brand-500, offset 2, never
  animated. **No component overrides it with `outline-none`.** Inputs add
  `focus:border-brand-500` on top of the ring, never instead of it.
- Dialogs (the Suzi panel): `role="dialog" aria-modal="true"`, focus trapped,
  focus returned to the trigger on close, ESC closes. Suzi replies land in an
  `aria-live="polite"` region.

## CTA voice
- Primary: `bg-brand-500 text-white`, rounded-lg, hover `bg-brand-600`,
  active `bg-brand-700`. Copy: verb-first, ≤3 words ("Talk to Suzi", "List
  with Suzi", "Request viewing").
- Secondary (outline): `bg-surface border-border text-ink`, hover
  `border-border-strong`.
- Dark ("ink" variant): `bg-brand-900 text-paper`, hover `bg-brand-800` —
  for chat composers and mode toggles on paper. Never placed on a brand-900
  band; there, use primary or the `border-paper/25` outline.
- Tertiary/inline: `text-brand-600` link with arrow, hover `text-brand-700`.
- The landing's two doors are a sanctioned variant: two equal primaries side
  by side, because seekers and owners are equal audiences; hierarchy comes
  from the labels and the one-line notes beneath them, not from colour.
- `.glow-cta` is reserved for the primary "Talk to Suzi" CTA.

## What pages MUST share
- The wordmark: "Zouza" Fraunces 600 beside a `bg-brand-900 text-brand-300`
  rounded-lg tile holding the Z mark — header and footer.
- Nav: h-14 sticky, `bg-paper/95 backdrop-blur`, `border-b border-border`,
  links Inter 14px `text-muted` (active `text-ink`), "Sign in" ghost + "Talk
  to Suzi" primary.
- Footer: slim two-row (brand + link row, then hairline + legal microtext).
  "Powered by AI. Guided by Suzi." lives here, not in the hero.
- CTA voice, radius scale, eyebrow treatment, border-led depth.
- Every Suzi chat surface (homepage hero, property chat, list-with-ai chat
  facts, global panel) uses the same bubble language: `bg-brand-900
  text-paper` user bubbles (`rounded-br-md`), `bg-paper-2 text-ink-2` Suzi
  bubbles (`rounded-bl-md`), rounded-lg composer with the global focus ring,
  and a one-line disclaimer footer (CLAUDE.md §1).
- The AI is always "Suzi" — "Talk to Suzi", "Ask Suzi", "List with Suzi".
  Disclosure sublines ("Your AI real estate partner") are wanted; "AI
  Assistant", "Bot" or "Chat" as the primary label are not.

## What pages MAY differ on
- Marketing pages may use one paper-2 band and one brand-900 band per page
  (on `/` the tide is that band).
- The Suzi hero module appears only on /.
- App pages may use denser spacing.

## Honest-copy rules
- No invented metrics, testimonials, ratings, logos, fabricated availability
  or ungrounded property claims. Mock listing data is fine where it is
  clearly product demo content.
- No claim that listings are translated — the feature does not exist.
- Never name competitors.
- Zouza takes no transaction fees; owners pay a flat €20/month to keep a
  listing live (create and preview free); buyers and tenants pay nothing.
  Pure intermediary: no payments, escrow, guarantees or legal/tax/financial
  advice in code or copy.
- Legal disclaimers (pure intermediary, non-affiliation) must survive every
  redesign of footer/legal surfaces.

## v1 → v2 mapping

| v1 | v2 |
|---|---|
| ivory | paper |
| parchment, sand | paper-2 |
| sand-deep | brand-200 |
| line | border |
| bg-navy-950 / 900 | bg-brand-900 |
| bg-navy-800 / 700 | bg-brand-800 / 700 |
| border-navy-700 | border-brand-700 |
| border-navy-950 (selected) | border-brand-500 |
| text-navy-950 / 900 | text-ink |
| text-navy-800 / 700 | text-ink-2 |
| text-navy-600 / 500 / 400 | text-muted |
| text-navy-300 | text-faint (icons) / text-brand-300 (on dark) |
| text-ivory | text-paper |
| hover:border-navy-300 | hover:border-border-strong |
| placeholder:text-navy-400 | placeholder:text-muted-2 |
| gold-700 / 600 / 500 / 400 / 300 | brand-700 / 600 / 500 / 400 / 300 |
| gold-200 / 100 | brand-100 / 50 |
| terra-700 / 600 / 500 / 200 / 100 | brand-700 / 600 / 500 / 200 / 100 |
| olive-600 / 100 | success / brand-50 |
| primary button navy-950 → navy-800 | brand-500 → brand-600 |
| tertiary link terra-600 → 700 | brand-600 → 700 |
| eyebrow gold-600 (3.59:1) | muted (5.13:1) |
| focus ring gold-600 | brand-500 |
| ::selection gold-200 / navy-950 | brand-100 / ink |
| glow-cta gold-500 | brand-400 |
| Sparkles brand badge | Z mark B |
| shadows navy rgba | ink rgba (36 34 58) |
