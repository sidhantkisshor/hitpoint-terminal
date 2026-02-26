# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Hitpoint Terminal is a real-time crypto analytics dashboard (Bloomberg Terminal-style) built with Next.js 15 App Router, TypeScript, Zustand, and Tailwind CSS. It displays live market data via WebSockets and REST APIs in a glassmorphic bento-grid layout.

## Commands

```bash
npm run dev      # Start dev server at localhost:3000
npm run build    # Production build
npm start        # Start production server
npm run lint     # ESLint
```

No test framework is configured.

## Architecture

### Data Flow

External APIs → API routes (`app/api/`) with rate limiting + Zod validation → Client components → Zustand store → UI

WebSocket connections (Binance, Bybit) connect directly from client components, validated with Zod before hitting the store.

### Key Directories

- **`app/`** — Next.js App Router pages and API routes
- **`app/api/coingecko/`** — Server-side proxy routes for CoinGecko (rate-limited via Upstash Redis, with hardcoded fallback data)
- **`app/api/newsletter/`** — Email collection endpoint (Zod-validated, rate-limited, file-based storage)
- **`components/`** — All client components (`'use client'`), each self-contained with its own data fetching via `useEffect` + `setInterval`
- **`data/`** — Static content data files (testimonials, partners, signals, quiz questions)
- **`store/useMarketStore.ts`** — Single Zustand store with `subscribeWithSelector` middleware; holds all market state (BTC price, fear/greed, long/short, funding rates, market data, dominance)
- **`lib/validation.ts`** — Zod schemas for every external API response + newsletter
- **`lib/ratelimit.ts`** — Upstash Redis sliding-window rate limiter (gracefully falls back if Redis not configured)
- **`lib/logger.ts`** — Environment-aware logger (silent in production)

### Component Pattern

Every component follows the same pattern:
1. Subscribe to specific Zustand slice: `useMarketStore((s) => s.specificField)`
2. `useEffect` sets up polling interval or WebSocket connection
3. Fetch → Zod validate → update store
4. Cleanup interval/WebSocket on unmount
5. Fallback data on API failure (never crashes)

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

### Security Headers

`next.config.ts` sets CSP, HSTS, X-Frame-Options, and other security headers. CSP uses `unsafe-inline` for Next.js compatibility. Image/connect sources are allowlisted for Binance, Bybit, CoinGecko, TradingView, CoinGlass, Alternative.me, and Twitter/X.

### Page Structure

Single scrollable page with 4 sections, navigated via sticky `SectionNav`:
- **Dashboard** — BTC ticker, Fear & Greed, Market Dominance, Market Heatmap (with Long/Short Ratio), Economic Calendar, Liquidation Bubbles, Funding Rates
- **Charts** — 4 TradingView embeds (BTC, ETH, Gold, S&P 500)
- **Community** — CommunityShowcase carousel, TwitterFeed, PartnerLogos
- **Signals** — SignalsGallery, NewsletterSignup, TraderQuiz

`NewsletterPopup` renders as a global overlay (bottom-right, 30s delay or 50% scroll).

## Environment Variables

Only needed for production rate limiting (optional — falls back to in-memory):
```
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

All external APIs are public and require no auth keys.

## Conventions

- Path alias: `@/*` maps to project root
- All components are client components (`'use client'`)
- Every API response is validated with Zod (`lib/validation.ts`) before use
- API routes return fallback data on failure rather than error responses
- Fonts: Inter (sans), JetBrains Mono (mono)
