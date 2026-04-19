# Les Apéros Filles

A mobile app that reunites women around small-group events — apéros,
ateliers, sport, talks, wellness, outings — in five French cities
(Lyon, Marseille, Toulouse, Montpellier, Rennes).

Built with **Expo / React Native** and a single codebase targeting
**iOS, Android and web**. Editorial direction inspired by Amalfi coast
colours (terracotta, cream, warm brown) + magazine typography
(Playfair Display + Inter).

> ⚠️  **Prototype status.** The mobile app, design system, recommendation
> engine and onboarding flows are wired end-to-end on mock data. The
> back-end, CMS, payment integrations and three environments are scoped
> but not yet implemented. See
> [`docs/proposition-marguerite.md`](docs/proposition-marguerite.md)
> (French) for the detailed product proposal, sprint planning and pricing.

---

## Table of contents

1. [Quick start](#quick-start)
2. [Tech stack](#tech-stack)
3. [Project structure](#project-structure)
4. [Design system](#design-system)
5. [Navigation & pages](#navigation--pages)
6. [User flows](#user-flows)
7. [Subscription model](#subscription-model)
8. [Recommendation engine](#recommendation-engine)
9. [State management](#state-management)
10. [Profile editing pattern](#profile-editing-pattern)
11. [Notifications & privacy](#notifications--privacy)
12. [Photo handling](#photo-handling)
13. [Accessibility & UX choices](#accessibility--ux-choices)
14. [Roadmap](#roadmap)
15. [Scripts](#scripts)

---

## Quick start

```bash
# Install deps
npm install

# Start the Metro bundler + Expo dev server
npm run start

# Or target a specific platform directly
npm run ios      # iOS simulator
npm run android  # Android emulator
npm run web      # localhost:8081 in a browser

# Type-check the whole codebase
npm run typecheck
```

The web preview renders inside a `PhoneFrame` component that locks the
viewport to an iPhone 14 aspect ratio (390 × 844) regardless of the
browser window — the prototype always reads as a phone.

---

## Tech stack

| Area | Choice |
|---|---|
| Framework | **Expo SDK 51** + **React Native 0.74** |
| Routing | **Expo Router** (file-based, typed) |
| Language | **TypeScript strict** + `noUncheckedIndexedAccess` |
| State | **Zustand** (single-store-per-domain) |
| Animations | **Reanimated v3** (UI thread, worklets) |
| Gestures | `react-native-gesture-handler` (pan, pinch) |
| Visuals | `react-native-svg`, `expo-blur`, `expo-linear-gradient` |
| Video | `expo-av` (onboarding welcome loop) |
| Photos | `expo-image-picker` + `expo-image-manipulator` |
| Icons | `lucide-react-native` |
| Typography | `@expo-google-fonts/playfair-display`, `/inter` |
| QR | `react-native-qrcode-svg` |
| Hosting (web) | Vercel (static SPA export) |

No styling library — styles live inline via `StyleSheet.create` and
resolve to design tokens from `constants/`.

---

## Project structure

```
app/                        Expo Router screens
├─ _layout.tsx              Root stack, auth gate, font loading, PhoneFrame
├─ (auth)/
│  └─ onboarding.tsx        Welcome → auth → name → photo → city → age → interests
├─ (tabs)/
│  ├─ _layout.tsx           Bottom tab bar + tab routes
│  ├─ index.tsx             Home feed (recommender output)
│  ├─ discover.tsx          Catalog by city, filters, search
│  ├─ wallet.tsx            Bons plans partenaires
│  ├─ filles.tsx            Members directory (gated)
│  └─ profile.tsx           Identity, settings, editable fields
├─ event/[id].tsx           Event detail (poster, map, attendees, payment)
├─ fille/[id].tsx           Individual member profile
├─ saved.tsx                Saved events grid
└─ subscribe.tsx            Paywall (three named formulas + freemium)

components/
├─ onboarding/              AuthStep, NameStep, PhotoStep, CityStep, AgeStep, InterestsStep
├─ events/                  FeedCard, FomoPill, EventMapCard, PaymentSheet, TicketSheet, SavedGridCard…
├─ filles/                  FilleCard, FilleProfile
├─ home/                    NotificationsSheet
├─ profile/                 EditBioSheet, EditFieldSheet, EditInterestsSheet,
│                            PrivacySheet, NotificationSettingsSheet,
│                            SubscriptionSheet, PhotoCropperSheet, LoyaltyCard
├─ wallet/                  WalletCard, FeaturedDealCard, DealCategoryScroll, WalletDetailSheet
├─ subscription/            ClubUpsellCard
├─ discover/                CategoryScroll
├─ layout/                  PhoneFrame, PageHero, TabBar
└─ ui/                      Avatar, AvatarStack, Button, IconButton, PillTag,
                            SearchBar, SegmentedControl, BottomSheet, PlatformModal,
                            QRCode, SpotlightCard, CityPicker

constants/
├─ colors.ts                Amalfi palette + avatar tints + legacy aliases
├─ typography.ts            Playfair / Inter families + Typography scale
├─ spacing.ts               Spacing, Radius, IconSize, TouchTarget, PhoneViewport
└─ categories.ts            EventCategory → icon mapping

data/
├─ mock.ts                  Users (20), events (15), partners (12)
└─ photos.ts                Unsplash URIs (users, events, partners, cities, interests)

hooks/
└─ useEventActions.ts       Central registration/paywall/bookmark logic

stores/
├─ useAuthStore.ts          User, tier, onboarding draft, privacy, notifications
└─ useEventsStore.ts        Catalog, bookmarks, registrations, viewed, tickets

types/
├─ user.ts                  User, City, Interest, MembershipTier
├─ event.ts                 Event, EventCategory
├─ partner.ts               Partner (wallet deals)
└─ wallet.ts                Deal, Ticket

utils/
├─ date.ts                  Intl-based FR formatters + formatMonthYear
├─ fomo.ts                  Countdown badge (En cours / Dans Xh / Demain / Dans N jours)
├─ recommendations.ts       Content-based scoring engine (docs/recommendations.md)
├─ price.ts                 Member / full price resolution
├─ wallet.ts                Deal aggregation helpers
├─ image.ts                 pickAvatarImage (cross-platform picker)
├─ maps.ts                  Native maps app picker (iOS/Android)
├─ weather.ts               Deterministic mock weather per event
├─ loyalty.ts               5-tier fidelity ladder
└─ share.ts                 Native share-sheet wrapper

docs/
├─ recommendations.md       Technical doc for the recommender
├─ proposition-marguerite.md French product + pricing proposal
└─ proposition-marguerite.docx  Same, exported via pandoc
```

---

## Design system

### Colours

Warm Mediterranean palette — never pure black / pure gray.

- **Background** `#FBF6EE` (cream canvas)
- **Text** `#2A1810` (deep warm brown, the "black" of the app)
- **Accent** `#C2410C` (terracotta signature)
- **Surface** `#FFFFFF`, `#F7EDDD` (muted cream), `#EDE1CB` (sunken)
- **Brand soft** `#F5DFC8` (peach tint for upsells)
- **Tier rings** `tierFree: #C6B8A8`, `tierMember: accent`,
  `tierFaithful: text`

Every colour, border and opacity is centralised in
[`constants/colors.ts`](constants/colors.ts).

### Typography

- **Playfair Display** (700, 600) — display titles, editorial accents.
  Used for: all `h1/h2`, card titles, `italic + accent` emphasis on
  keywords (`événements`, `copines`, `bons plans`, `club`…).
- **Inter** (400, 500, 600, 700) — all UI, body, captions, labels.
- **Typography scale** is exposed via `constants/typography.ts`
  (`h1`, `h2`, `h3`, `body`, `bodyBold`, `caption`, `small`, `label`).

### Rhythm

- **Spacing** powers of 4 (`xs: 4`, `sm: 8`, `md: 12`, `lg: 16`, `xl: 20`,
  `xxl: 24`, `xxxl: 32`).
- **Radius** tuned to Luma / Apple (`md: 12`, `lg: 14`, `xl: 18`,
  `full: 9999`).
- **Hairlines** at `rgba(42, 24, 16, 0.1)` — one pixel, everywhere
  separators are needed.

### Tone of voice

- French throughout. Sentence case for labels, capitalised only for
  proper nouns and acronyms.
- Editorial italic terracotta on one or two keywords per screen title
  (never more).
- No emojis in UI copy except in the subscription tier names (✨🧡👯).

---

## Navigation & pages

Five bottom tabs, each owned by a single screen under `app/(tabs)/`.

| Tab | Route | Purpose |
|---|---|---|
| **Accueil** | `index.tsx` | Personalised feed, countdown pills, tab-aware subtitle |
| **Discover** | `discover.tsx` | Catalogue complet par ville, filtres catégorie, recherche |
| **Bons Plans** | `wallet.tsx` | Partner deals (featured card + list, category chips) |
| **Filles** | `filles.tsx` | Annuaire des membres (gated for free tier) |
| **Profil** | `profile.tsx` | Identity, stats, settings, editable everywhere |

### Stack-level routes (outside tabs)

- `event/[id]` — full-bleed event page with swipe-down-to-dismiss,
  poster, host row, date / time, address + weather, map card,
  attendees, "à propos", registration CTA.
- `fille/[id]` — individual member profile (gated).
- `saved` — 2-column grid of bookmarked events (future, present, past,
  sorted by date).
- `subscribe` — dark-canvas paywall with the three named formulas and a
  free "Découverte" tile.

### Auth gate

Every non-auth route is guarded by `_layout.tsx`'s `AuthGate`. If the
user isn't authenticated or hasn't completed onboarding, they are
redirected to `(auth)/onboarding`.

---

## User flows

### Onboarding (5 profile steps)

`welcome` → `auth` → **`name`** → **`photo`** → **`city`** →
**`age`** → **`interests`** → `(tabs)`

1. **Welcome** — looping mp4 (`assets/videos/onboarding.mp4`) with a
   warm tagline and a single CTA.
2. **Auth (smart, Tinder-style)** — three providers stacked (Google /
   Apple / Email, real SVG brand glyphs). For email the app checks in
   the background whether the address already has an account and
   branches copy accordingly (`Ravie de te revoir, …` vs `Crée ton
   mot de passe.`).
3. **Name** (step 1/5) — first name (required, 2 chars min), last name,
   Instagram, phone — the last three optional, each with a helper
   explaining who sees it.
4. **Photo** (step 2/5) — Tinder-style tall card, tap to open the
   picker, then our custom `PhotoCropperSheet` (pan + pinch + square
   frame with rule-of-thirds grid). CTA is a grey `Plus tard` until a
   photo is added, at which point it flips to the terracotta
   `Continuer`.
5. **City** (step 3/5) — five editorial cards (Lyon, Marseille,
   Toulouse, Montpellier, Rennes).
6. **Age** (step 4/5).
7. **Interests** (step 5/5) — seven big photo cards, multi-select,
   min 2.

### Event registration

```
tap card → event detail → S'inscris → paywall check →
  - over monthly limit (free) → subscribe screen
  - sold out → button reads "Complet"
  - ok → PaymentSheet (mocked Stripe form, pre-filled test card)
        → 1.4s spinner → 0.9s success → register() + close
→ event page shows "Tu es inscrite" badge + ticket QR
```

### Subscription

- Any surface a free user hits a limit, a `ClubUpsellCard` is rendered
  (Home bottom, Discover, Wallet).
- From the profile, **Gérer mon abonnement** opens `SubscriptionSheet`:
  - Free: title `Rejoins le club`, 4-benefit list with check icons,
    primary `Passe au niveau supérieur`.
  - Subscribed: `Membre du club` + `ACTIF` chip, `Depuis MM/YYYY`,
    `Prochain paiement JJ mois YYYY · 12,50 €`, `Voir les formules`
    primary + `Résilier mon abonnement` link (two-stage : warning
    screen with losses list → confirmation drops back to free).
- Paywall screen `/subscribe` — dark warm-brown canvas, horizontal
  snap carousel of four cards: **Découverte** (free, grey badge),
  **L'Étincelle** (1 mois, 18,90 €), **Le Lien** (3 mois, 15,50 €/mo,
  −18 %), **La Bande** (6 mois, 12,50 €/mo, −34 %, `POPULAIRE` badge).
  Selecting `Découverte` keeps the user free, any other selection sets
  tier to `member` (mocked; in prod goes through Stripe Checkout).

---

## Subscription model

Three paid formulas built around a commitment ladder, plus a freemium
tier. The business rationale is [documented in the proposal](docs/proposition-marguerite.md#3-bis--modèle-dabonnement-revisité-suggestion).

| Formula | Commitment | Price / month | Total billed | Saving |
|---|---|---|---|---|
| **Découverte** ✨ | — | 0 € | — | n/a |
| **L'Étincelle** ✨ | Monthly | 18,90 € | 18,90 € / month | — |
| **Le Lien** 🧡 | 3 months | 15,50 € | 46,50 € every 3 months | **−18 %** |
| **La Bande** 👯 | 6 months | 12,50 € | 75 € every 6 months | **−34 %** |

Benefits unlocked by any paid formula:

- Unlimited event attendance at the **member price** (−30 to −50 %
  versus the full price depending on the event)
- All **partner QR codes** unlocked (cafés, yoga, ateliers, restaurants,
  florists, bookshops)
- **Full directory** access (annuaire des filles de ta ville)
- **Priority registration** window on popular events

Members are automatically flagged **Fidèle** after 6 cumulative months
(badge + exclusive quarterly events in the roadmap).

---

## Recommendation engine

The home feed isn't a chronological list — it's a curated selection
produced by `utils/recommendations.ts`. See
[`docs/recommendations.md`](docs/recommendations.md) for the full
technical doc.

**Content-based linear combination** (pattern documented in
Ricci / Rokach / Shapira, *Recommender Systems Handbook*, ch. 3).
Zero ML dependency — starts working on day one with declared interests
+ city, and gets sharper as the user interacts.

### Signals & weights

| Signal | Weight |
|---|---|
| Declared interest (from onboarding) | **3** |
| Past attended event (same category) | **2** |
| Bookmarked event (same category) | **1.5** |
| Event viewed on Discover | **0.5** |
| City match | **+2** |
| Friend attending (from shared events) | **+0.8** |
| Within next 14 days | **+1** |
| < 30 % spots remaining | **+0.5** |
| Already committed (registered/bookmarked) | **+100** (always on top) |

Exposed as `RECO_WEIGHTS` — one import, one knob to re-tune the feed.

### Pipeline

1. `buildTasteProfile(ctx)` stacks every interaction into a
   `Map<EventCategory, number>`.
2. `scoreEvent(event, taste, ctx)` combines the taste score with
   contextual bonuses (city, friends, recency, urgency, commitment).
3. `rankEvents(candidates, ctx)` sorts descending, tie-break by
   earliest date.

All three functions are pure, deterministic (accepts `now?: number`),
and unit-testable.

### Implicit signals

- `viewedEvents` is populated by `markViewed(id)`, fired from
  `app/event/[id].tsx` in a `useEffect` on mount. Idempotent on the
  store side.
- The "friend circle" is derived on the fly from past + bookmarked
  events via `buildFriendIds`.

---

## State management

Two Zustand stores, each owning a clearly-scoped domain. No
context-based prop drilling.

### `useAuthStore`

- `isAuthenticated`, `hasCompletedOnboarding`, `user`, `tier` (`free` /
  `member` / `faithful`).
- `onboardingDraft` — all fields captured during onboarding, merged
  into the final `User` by `completeOnboarding`.
- `privacy` — the master switch + per-field toggles used by the
  `PrivacySheet`.
- `notifications` — `{ push, email }` toggles.
- Generic **`updateUser(patch: Partial<User>)`** — the single
  write-through action every editable row on the profile funnels
  through. One clean target for the future `PATCH /me` endpoint on the
  backend.
- Dev helper `cycleTier` (wired to a long-press on the version row at
  the bottom of the profile).

### `useEventsStore`

- `events` (catalog, from mock), `bookmarks` (Set<id>),
  `registrations` (Map<id, ISO>), `viewed` (Set<id>).
- `toggleBookmark`, `register`, `unregister`, `markViewed`.
- Derived selectors for tickets (`getTickets`, `getTicketForEvent`)
  and per-user event partitions (`getUpcomingForUser`,
  `getPastForUser`).
- Monthly-limit helpers for the free-tier guardrail
  (`countRegistrationsInMonth`).

Both stores stay **membership-agnostic**. The free-tier limit, paywall
detection and priority rules live in [`hooks/useEventActions.ts`](hooks/useEventActions.ts).

---

## Profile editing pattern

Every editable surface on the profile follows the same loop:

```
tap row                  ← clean Pressable, small pencil icon or chevron
  → edit sheet opens     ← bottom sheet with a focused form
  → validate + save      ← dispatches updateUser({ field: newValue })
  → store updates        ← UI reacts via Zustand subscription
```

Three reusable sheets handle 95 % of the profile:

- **`EditBioSheet`** — textarea with a live `N / 200` counter, clamped
  on save.
- **`EditFieldSheet`** — generic single-line text (name, Instagram,
  email). Accepts `title`, `subtitle`, `validate`, `inputProps`,
  `maxLength`.
- **`EditInterestsSheet`** — chip multi-select, blocking below 2
  selections with a live `Sélectionne-en N de plus` CTA label.

Specialised sheets for the remaining cases:

- **`CityPicker`** (reused from onboarding) for the `Ville` row.
- **`NotificationSettingsSheet`** — channel toggles (push, email).
- **`PrivacySheet`** — profile visibility + per-field toggles.
- **`SubscriptionSheet`** — status + management + cancellation flow
  (two stages, with a "what you'll lose" warning before downgrade).
- **`PhotoCropperSheet`** — see [Photo handling](#photo-handling).

Adding a new editable field = three lines :

```tsx
// types/user.ts              → add the field
// app/(tabs)/profile.tsx     → add an <EditableRow> + wire the sheet
// (nothing else — updateUser already takes a Partial<User>)
```

---

## Notifications & privacy

### Privacy (`PrivacySheet`)

- **Master switch** — `Rendre mon profil visible`. When off, the
  profile disappears from the directory and from shared event pages,
  regardless of the field-level toggles.
- **Field toggles** grouped in three sections:
  - *Identité* — first name, last name, age, city
  - *À propos* — bio, interests, Instagram
  - *Statistiques* — events count, filles rencontrées
- Sensible defaults: last name, Instagram and `filles rencontrées` are
  **off by default** (data minimisation).
- State lives in `useAuthStore.privacy` with
  `setProfileVisible` + `togglePrivacyField` actions.

### Notifications (`NotificationSettingsSheet`)

- Two channels: **push** (on by default) and **email** (on by default).
- No SMS — `email + push` covers every current transactional need.
- A human-readable summary (`Push et email`, `Push uniquement`, `Tout
  désactivé`) is shown as the value of the `Notifications` row in the
  Paramètres card, and updates live as the user toggles.

Both settings hooks point to tomorrow's `PATCH /me/privacy` and
`PATCH /me/notifications` endpoints.

---

## Photo handling

### Picker

[`utils/image.ts`](utils/image.ts) exposes a single
`pickAvatarImage(): Promise<string | null>` that:

- Requests the photo-library permission on native only (the browser
  picker doesn't need it).
- Launches `expo-image-picker`'s system picker with
  `allowsEditing: false` — we always run our own cropper for a
  consistent cross-platform UX.
- Returns the raw URI (`file://` on native, `blob:` / data URL on
  web) or `null` if the user cancels.

### Cropper (`PhotoCropperSheet`)

Custom Tinder-style cropper built on top of `react-native-gesture-handler`
and `reanimated` :

- Full-screen black modal, square **300 × 300** frame centred via
  flexbox (no screen-dimension math — works inside the `PhoneFrame`).
- **Pan + pinch** gestures, composed with `Gesture.Simultaneous`.
- The image always covers the frame (`baseScale = max(FRAME/w,
  FRAME/h)`); user scale is clamped to `[1, 3]` so empty space can
  never appear.
- Clamp-on-release animates back into bounds with `withTiming`, so the
  frame can never be let outside the image.
- On save: computes the crop rect in source-image coordinates from the
  shared values, then calls `ImageManipulator.manipulateAsync` (which
  falls back to the Canvas API on web). Outputs a JPEG at quality 85.

The cropper is reused verbatim by the onboarding `PhotoStep` and the
profile cover's avatar tap — single source of truth for the crop UX.

---

## Accessibility & UX choices

- Every interactive element has an `accessibilityRole` and a French
  `accessibilityLabel`. Toggles also expose `accessibilityState`.
- `hitSlop` on small icons (bookmark heart, close buttons) to meet the
  44-pt target without inflating the visual footprint.
- No bouncy animations. `Pressable` feedback is an `opacity` dim only —
  feels Apple-like rather than toy-like.
- No stacked colour blocks. Never an icon inside a coloured circle
  unless semantically earned (Club badge, active chip).
- Editorial italic accents are intentionally one keyword per screen —
  *your event, your favourites, your club*.

---

## Roadmap

Listed in the order they make sense once the V1 is in the hands of
real users. None of these impact the current public API.

- Backend: PostgreSQL + Fastify/NestJS API, auth (Clerk or custom JWT),
  RBAC with 3 roles (propriétaire / manageuse de ville / modérateur),
  audit log on sensitive actions.
- Stripe Subscriptions for the three formulas + Stripe Customer Portal
  for self-service billing.
- Sanity CMS with three workspaces for content management.
- Brevo for transactional emails, drip onboarding automations and the
  editorial newsletter.
- Mapbox for editorial-looking static maps.
- Sentry + Plausible for errors + product analytics.
- Three environments (dev / staging / prod) wired via GitHub Actions.
- Recommender upgrades: diversity re-rank, temporal decay of old
  signals, collaborative filtering once we have enough traces,
  user-facing `Pour toi parce que …` explanations.

Details, sprint planning and pricing in
[`docs/proposition-marguerite.md`](docs/proposition-marguerite.md).

---

## Scripts

```jsonc
"start":     "expo start",
"ios":       "expo start --ios",
"android":   "expo start --android",
"web":       "expo start --web",
"typecheck": "tsc --noEmit"
```

Builds for the web SPA are produced by `npx expo export --platform web`
(see `vercel.json` for the static export + SPA rewrite config).

---

## License

Proprietary — all rights reserved. Contact the repository owner for
licensing terms.
