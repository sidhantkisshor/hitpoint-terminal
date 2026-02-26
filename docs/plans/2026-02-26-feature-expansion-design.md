# Hitpoint Terminal — Feature Expansion Design

**Date:** 2026-02-26
**Approach:** Progressive Enhancement (3 phases)
**Priority:** Data completeness first, then engagement features

---

## Decisions

| Decision | Choice |
|----------|--------|
| Build priority | Data completeness first |
| Interactive Charts | Dedicated full-width bento row, 4 TradingView embeds |
| Economic Calendar | TradingView widget (no reliable free API exists) |
| Email collection | Simple backend (JSON file/DB), no external provider yet |
| Signals page | Screenshot gallery with CTA |
| Community content | Ready — just needs display components |
| Twitter feed | Official X embedded timeline |
| Page structure | Single page with sticky section nav |
| Frontend redesign | Polish & animation upgrades across the board |

---

## Architecture: Page Structure

```
[Header — Logo + Live Indicator]              (existing, stays fixed)
[Sticky Nav — Dashboard | Charts | Community | Signals]
──────────────────────────────────────────────
[DASHBOARD section]    ← existing bento grid, all current components
[CHARTS section]       ← new Interactive Charts row (4 TradingView embeds)
[COMMUNITY section]    ← Community Showcase + Twitter Feed + Partner Logos
[SIGNALS section]      ← Signals Gallery + Newsletter Signup + Trader Quiz
```

Each section has an `id` for scroll targeting. Sticky nav highlights active section via Intersection Observer. Clicking a tab smooth-scrolls to that section.

---

## Phase 1: Data Layer

### 1.1 Sticky Section Navigation

**Component:** `SectionNav.tsx` (client component)

- Horizontal pill/tab buttons: Dashboard | Charts | Community | Signals
- Sticky below header on scroll
- Active state driven by Intersection Observer on section elements
- Glassmorphic style: backdrop-blur, subtle border, matching existing design
- Mobile: horizontally scrollable

**Page changes (`page.tsx`):**
- Wrap component groups in `<section id="dashboard">`, `<section id="charts">`, etc.
- Import and render `SectionNav` between header and main content

### 1.2 Interactive Charts

**Component:** `InteractiveCharts.tsx`

- Section header: "Interactive Charts" with gradient divider
- 2x2 grid on desktop (`grid-cols-2`), 1-column on mobile
- Each chart is a TradingView Advanced Chart iframe in a `bento-item`

| Chart | Symbol |
|-------|--------|
| Bitcoin | BINANCE:BTCUSDT |
| Ethereum | BINANCE:ETHUSDT |
| Gold | TVC:GOLD |
| S&P 500 | SP:SPX |

**Config:** Dark theme, 1D default interval, toolbar enabled, ~400px height, lazy loaded.

**CSP:** No changes needed — `frame-src` already allows `*.tradingview.com`.

### 1.3 Economic Calendar Upgrade

**Component:** `EconomicCalendar.tsx` (rewrite internals)

- Replace hardcoded events with TradingView Economic Calendar widget iframe
- Keep same grid position: `col-span-12 lg:col-span-4`
- Keep same `bento-item` container styling
- Dark theme, lazy loaded
- Loses custom countdown timer and impact color-coding (TradingView handles this)

### 1.4 Cleanup

- Remove duplicate `LongShortRatio` component (data already shown in `MarketHeatmap`)
- Reclaim freed grid space

---

## Phase 2: Engagement Layer

### 2.1 Community Showcase

**Component:** `CommunityShowcase.tsx`
**Grid:** `col-span-12 lg:col-span-5` (within Community section)

- Auto-rotating carousel or scrollable vertical card stack
- Each card: screenshot image + caption + author attribution
- Glassmorphic card styling
- Data source: `data/testimonials.ts` — array of `{ image, caption, author }`
- Mobile: single column, swipeable

### 2.2 Twitter/X Feed

**Component:** `TwitterFeed.tsx`
**Grid:** `col-span-12 lg:col-span-4` (within Community section)

- Official X embedded timeline widget
- Dark theme, ~500px fixed height with internal scroll
- Wrapped in `bento-item` container
- Uses `platform.twitter.com/widgets.js` script

**CSP update:** Add `platform.twitter.com` and `syndication.twitter.com` to `script-src` and `frame-src`.

### 2.3 Partner Logos

**Component:** `PartnerLogos.tsx`
**Grid:** `col-span-12 lg:col-span-3` (within Community section)

- Vertical strip of logos
- Grayscale default, full color on hover
- Data source: `data/partners.ts` — array of `{ name, logo, url? }`
- Graceful empty state if no partners provided

### 2.4 Newsletter Signup Popup

**Component:** `NewsletterPopup.tsx`

- Glassmorphic modal with backdrop blur
- Slides up from bottom-right corner
- Triggers: 30s delay OR scroll past 50%, once per session
- "Don't show again" option stored in localStorage
- Close button

---

## Phase 3: Social Proof

### 3.1 Signals Screenshot Gallery

**Component:** `SignalsGallery.tsx`
**Grid:** `col-span-12 lg:col-span-6` (within Signals section)

- Header: "VIP Signals Preview"
- 2-3 column grid of screenshot cards
- Each card: screenshot image with glassmorphic overlay
- Click to expand (lightbox)
- Bottom CTA button: "Join VIP"
- Data source: `data/signals.ts` — array of `{ image, caption?, date? }`

### 3.2 Newsletter Signup (Inline)

**Component:** `NewsletterSignup.tsx`
**Grid:** `col-span-12 lg:col-span-3` (within Signals section)

- Header: "Weekly Insights"
- Email input + neon green submit button
- Success state: "You're in!" message
- Backend: POST to `/api/newsletter` — appends email to JSON file or SQLite
- Shares backend with popup variant

### 3.3 Trader Quiz

**Component:** `TraderQuiz.tsx`
**Grid:** `col-span-12 lg:col-span-3` (within Signals section)

- Header: "What Type of Trader Are You?"
- 4-5 multiple choice questions, one at a time with transitions
- Archetypes: Scalper, Swing Trader, HODLer, Degen
- Result card with archetype name, description, icon
- Email gate: "Enter email to see full results" (feeds newsletter collection)
- All client-side logic, questions from `data/quiz.ts`

---

## New API Route

### `/api/newsletter` (POST)

- Accepts `{ email: string }`
- Validates email format with Zod
- Appends to a local JSON file (`data/subscribers.json`) or SQLite
- Returns `{ success: true }` or error
- Rate limited (same Upstash pattern)
- No external email service integration yet

---

## Data Files

| File | Purpose |
|------|---------|
| `data/testimonials.ts` | Community showcase content |
| `data/partners.ts` | Partner logos and links |
| `data/signals.ts` | Signal screenshot references |
| `data/quiz.ts` | Quiz questions, answers, and archetypes |

---

## CSP Changes

Add to `next.config.ts`:
- `script-src`: `platform.twitter.com`
- `frame-src`: `platform.twitter.com`, `syndication.twitter.com`

---

## Frontend Design Upgrades (Applied Across All Phases)

**Header:** Slightly larger logo, subtle bottom border glow on scroll.

**Section dividers:** Thin gradient line (neon green to transparent), uppercase letter-spaced section titles in muted color.

**Scroll animations:** Staggered fade-in on scroll for bento items via Intersection Observer + CSS transitions. Charts slide up on viewport entry.

**Community carousel:** Smooth auto-scroll with pause on hover.

**Newsletter popup:** Bottom-right slide-up, glassmorphic, non-intrusive.

**Mobile:** All sections stack single column. Sticky nav becomes horizontally scrollable pill bar. Charts go from 2x2 to 1-column. Touch-friendly card sizes.

**Cleanup:** Remove duplicate LongShortRatio component.

---

## New Components Summary

| Component | Phase | Section |
|-----------|-------|---------|
| `SectionNav.tsx` | 1 | Global |
| `InteractiveCharts.tsx` | 1 | Charts |
| `CommunityShowcase.tsx` | 2 | Community |
| `TwitterFeed.tsx` | 2 | Community |
| `PartnerLogos.tsx` | 2 | Community |
| `NewsletterPopup.tsx` | 2 | Global (overlay) |
| `SignalsGallery.tsx` | 3 | Signals |
| `NewsletterSignup.tsx` | 3 | Signals |
| `TraderQuiz.tsx` | 3 | Signals |

---

## Dependencies

No new npm packages required. All features use:
- TradingView free embeddable widgets (iframes)
- Twitter/X embed script (external script tag)
- Intersection Observer API (browser native)
- Existing Zustand, Zod, Tailwind stack
