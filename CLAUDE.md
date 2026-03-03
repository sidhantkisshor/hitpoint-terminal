# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Hitpoint Terminal is a real-time crypto analytics dashboard (Bloomberg Terminal-style) built with Next.js 15 App Router, TypeScript, Zustand, and Tailwind CSS. It displays live market data via WebSockets and REST APIs in a glassmorphic bento-grid layout. Deployed on Vercel.

## Commands

```bash
npm run dev      # Start dev server at localhost:3000
npm run build    # Production build
npm start        # Start production server
npm run lint     # ESLint
```

No test framework is configured. Use `npx tsc --noEmit` for type checking.

## Architecture

### Data Flow

External APIs → API routes (`app/api/`) with rate limiting + Zod validation → Client components → Zustand store → UI

WebSocket connections (Binance, Bybit) connect directly from client components, validated with Zod before hitting the store.

### Key Directories

- **`app/`** — Next.js App Router pages and API routes
- **`app/api/coingecko/`** — Server-side proxy routes for CoinGecko (rate-limited via Upstash Redis, with hardcoded fallback data)
- **`app/api/og/quiz/`** — Dynamic OG image generation for quiz results (uses `next/og` ImageResponse)
- **`app/api/quiz/results/`** — Quiz result data collection endpoint (Zod-validated, rate-limited, logs only — storage TBD)
- **`components/`** — All client components (`'use client'`), each self-contained with its own data fetching via `useEffect` + `setInterval`
- **`data/`** — Static content data files (testimonials, partners, signals, quiz questions/profiles)
- **`store/useMarketStore.ts`** — Zustand store with `subscribeWithSelector` middleware; holds all market state (BTC price, fear/greed, long/short, funding rates, market data, dominance)
- **`store/useSimulatorStore.ts`** — Zustand store with `persist` middleware for trading simulator/challenge state (infrastructure — not yet integrated in UI)
- **`lib/validation.ts`** — Zod schemas for every external API response
- **`lib/ratelimit.ts`** — Upstash Redis sliding-window rate limiter (gracefully falls back if Redis not configured or unreachable)
- **`lib/logger.ts`** — Environment-aware logger (silent in production)
- **`lib/simulator-evaluation.ts`** — Trading simulator evaluation helpers (drawdown checks, risk validation)

### Component Pattern

Data-fetching components follow this pattern:
1. Subscribe to specific Zustand slice: `useMarketStore((s) => s.specificField)`
2. `useEffect` sets up polling interval or WebSocket connection
3. Fetch → Zod validate → update store
4. Cleanup interval/WebSocket on unmount
5. Fallback data on API failure (never crashes)

### Quiz System

`TraderQuiz` (`components/TraderQuiz.tsx`) is a self-contained modal quiz with its own data layer:
- **8 trader profiles** with matcher functions, rarity percentages, traits, and recommended tools (`data/quiz.ts`)
- **24 questions** (6 per dimension: conviction, risk, discipline, independence); 2 random per category = 8 per quiz
- Score normalization via `SCORE_RANGES` computed from extreme answers
- Profile matching via `matcher` closures on raw (unnormalized) scores
- `QuizAutoOpen` component reads URL params (`?quiz=...&c=...&r=...&d=...&i=...`) to restore shared results
- Results are submitted fire-and-forget to `/api/quiz/results`
- OG image generation at `/api/og/quiz` renders a shareable card (1200×630) with profile + score bars
- `generateMetadata` in `app/page.tsx` sets dynamic OG tags when quiz params are present
- OG route has its own static copy of profile data (avoids importing matcher closures into edge runtime)

### External Data Sources

| Source | Transport | Components |
|--------|-----------|------------|
| Binance `wss://stream.binance.com` | WebSocket (REST fallback) | BTCPriceTicker |
| Bybit REST v5 | Polling 5min | MarketHeatmap (Long/Short Ratio) |
| Binance Futures REST | Polling 8h | FundingRates |
| CoinGecko (via `/api/coingecko/*`) | Polling 1-5min | MarketHeatmap, MarketDominance |
| Alternative.me | Polling 5min | FearGreedIndex |
| TradingView | iframes | LiquidationBubbles, InteractiveCharts, EconomicCalendar |
| CoinGlass | iframe | LiquidationBubbles |
| Twitter/X | embed script | TwitterFeed |

### Styling

- Dark theme only with CSS variables defined in `globals.css` (e.g., `--green-primary: #c4f82e`)
- Tailwind custom colors: `neon-green`, `accent-cyan`, `accent-purple` (defined in `tailwind.config.ts`)
- Glassmorphism: backdrop-blur, gradient borders, neon glow hover effects on `.bento-item`
- 12-column responsive grid with `col-span-*` breakpoints
- Use standard Tailwind opacity syntax (`bg-white/[0.08]`) not shorthand (`bg-white/8`)

### Security Headers

`next.config.ts` sets CSP, HSTS, X-Frame-Options, and other security headers. CSP uses `unsafe-inline` for Next.js compatibility. Image/connect sources are allowlisted for Binance, Bybit, CoinGecko, TradingView, CoinGlass, Alternative.me, and Twitter/X.

### Page Structure

Single scrollable page with 4 sections, navigated via sticky `SectionNav`:
- **Dashboard** — BTC ticker, Fear & Greed, Market Dominance, Market Heatmap (with Long/Short Ratio), Economic Calendar, Liquidation Bubbles, Funding Rates
- **Charts** — 4 TradingView embeds (BTC, ETH, Gold, S&P 500)
- **Community** — CommunityShowcase carousel, TwitterFeed, PartnerLogos
- **Signals** — SignalsGallery, NewsletterSignup, TraderQuiz

`HeaderQuizCTA` renders a quiz launch button in the site header. `NewsletterPopup` renders as a global overlay (bottom-right, 30s delay or 50% scroll).

## Environment Variables

Only needed for production rate limiting (optional — falls back to allowing all requests):
```
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

`metadataBase` uses `VERCEL_PROJECT_PRODUCTION_URL` if set, otherwise defaults to `https://hitpointterminal.com`.

All external APIs are public and require no auth keys.

## Conventions

- Path alias: `@/*` maps to project root
- All components are client components (`'use client'`)
- Every API response is validated with Zod (`lib/validation.ts`) before use
- API routes return fallback data on failure rather than error responses
- Fonts: Plus Jakarta Sans (sans), Outfit (display), JetBrains Mono (mono)
- OG images use `next/og` (built-in), not `@vercel/og` standalone package
