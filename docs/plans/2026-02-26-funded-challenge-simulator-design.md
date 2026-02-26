# Funded Account Challenge Simulator — Design Document

**Date:** 2026-02-26
**Status:** Approved

## Purpose

Test whether a trader has the discipline and skill to pass a funded account challenge before they risk real money buying one. Not a teaching tool or market simulator — a structured evaluation system that replicates real prop firm rules (FTMO, FundedNext, etc.).

Users trade under funded account conditions with strict rules and get a professional evaluation report: PASS or FAIL with detailed scoring.

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Price data | Real-time (existing Binance WebSocket + CoinGecko) | Leverages existing infrastructure, feels authentic |
| Page location | Dedicated route at `/simulator` | Complex feature needs its own page; keeps main landing clean |
| Persistence | localStorage via Zustand `persist` middleware | No backend needed, fits no-database architecture |
| Trade UX | Simple order panel (market orders, mandatory SL) | Focused on evaluation, not exchange simulation |
| Architecture | New Zustand store (`useSimulatorStore`) | Matches existing codebase patterns exactly |
| Positions | One at a time | Keeps evaluation clean, beginner-friendly |

## Data Model

### ChallengeConfig

```
accountSize: 10000 | 25000 | 50000 | 100000
tradingStyle: 'crypto' | 'forex' | 'indices'  (cosmetic — all use real-time crypto prices)
challengeType: '10-day' | '30-day'
profitTarget: 0.08 (8%)
dailyLossLimit: 0.05 (5%)
totalLossLimit: 0.10 (10%)
maxRiskPerTrade: 0.02 (2%)
minTradingDays: 5
maxTradingDays: 10 | 30
```

### ChallengeState

```
status: 'setup' | 'active' | 'paused' | 'passed' | 'failed'
config: ChallengeConfig
startDate, startingBalance, currentBalance, highWaterMark, dailyStartBalance
tradingDays: Set<string> (unique dates with trades)
activePosition: Position | null
trades: CompletedTrade[]
equityCurve: { timestamp, balance }[]
violations: { type, message, timestamp }[]
failReason: string | null
```

### Position

```
id, direction ('long'|'short'), entryPrice, size (USD), leverage (display only)
stopLoss, takeProfit, openedAt, unrealizedPnl
```

### CompletedTrade

```
...Position fields + exitPrice, closedAt, pnl (USD), pnlPercent, closeReason
closeReason: 'manual' | 'tp' | 'sl' | 'liquidation' | 'rule-violation'
```

## Evaluation Engine

Pure functions in `lib/simulator-evaluation.ts`. Run on every price tick and after every trade close.

### Real-Time Checks (instant FAIL triggers)

1. **Daily Loss Limit (-5%):** `(dailyStartBalance - currentBalance) / dailyStartBalance >= 0.05` → FAIL + force-close
2. **Total Drawdown (-10%):** `(startingBalance - currentBalance) / startingBalance >= 0.10` → FAIL + force-close
3. **Risk Per Trade (max 2%):** Soft gate — blocks trade from opening, doesn't fail challenge. Stop-loss is mandatory.
4. **Max Trading Days:** If days elapsed > max and target not reached → FAIL

### Post-Trade Metrics (computed from trades[])

5. **Profit Target (+8%):** `(currentBalance - startingBalance) / startingBalance >= 0.08` — required to pass
6. **Consistency Score (0–100):** Profit distribution evenness (50%) + daily P&L stability (50%). Must score >= 60.
7. **Minimum Trading Days:** `tradingDays.size >= minTradingDays` — required to pass
8. **Emotional Stability Score (0–100):** Base 100, penalties for: revenge trading (-15), size escalation after loss (-20), overtrading >5/hr (-10), no-SL trades (-10). Must score >= 50.

### Pass/Fail Logic

**PASS:** Profit target reached AND no violations AND min days met AND within max days AND consistency >= 60 AND emotional >= 50.

**FAIL (instant):** Daily loss breached OR total drawdown breached OR max days exceeded.

## Trade Execution Flow

### Opening a Trade

1. Validate: size > 0, size <= balance, no active position, SL is set, risk <= 2%
2. Snapshot price from `useMarketStore.btcTicker.price`
3. Create Position, store in `activePosition`
4. Add today to `tradingDays`

### Live P&L (price tick loop)

1. On every btcTicker update, recalculate unrealized P&L
2. Check TP/SL hit → auto-close
3. Check if closing would breach daily/total loss → force-close with 'rule-violation'
4. Update equity curve (throttled to 1 point per 30s)

### Closing a Trade

1. Snapshot exit price, calculate realized P&L
2. Create CompletedTrade, push to trades[]
3. Update balance, highWaterMark
4. Clear activePosition
5. Run all evaluation checks
6. Auto-persist via Zustand persist middleware

### Daily Reset

1-minute interval checks UTC date change. New day → reset dailyStartBalance, check max days.

### Edge Cases

- Browser closed with open position: recalculates P&L from current price on reload
- WebSocket disconnect: REST fallback (same as main site), position stays open
- Price gaps past SL/TP: accept actual tick price (realistic slippage)

## UI Layout

### Page: `/simulator` (app/simulator/page.tsx)

Dedicated page with own header. Link from main site's SectionNav.

### States

**Setup** (`status === 'setup'`): Full-page SimulatorSetup — account size cards, style selector, challenge type toggle, rules preview, "Start Challenge" CTA.

**Active** (`status === 'active'`): Bento grid dashboard:
- Row 1: ChallengeHeader — sticky stats strip (balance, P&L%, days remaining, daily loss remaining, profit target progress bar)
- Row 2: PriceDisplay (col-4) + TradePanel (col-4) + PositionCard (col-4)
- Row 3: EquityCurve (col-6) + EvaluationMetrics (col-6)
- Row 4: TradeHistory (col-8) + ViolationsLog (col-4)

**Completed** (`status === 'passed' | 'failed'`): Full-page EvaluationReport.

### Components (7 new)

| Component | Path | Purpose |
|-----------|------|---------|
| SimulatorSetup | components/simulator/SimulatorSetup.tsx | Challenge config wizard |
| ChallengeHeader | components/simulator/ChallengeHeader.tsx | Sticky stats strip with progress |
| PriceDisplay | components/simulator/PriceDisplay.tsx | Live BTC price from existing store |
| TradePanel | components/simulator/TradePanel.tsx | Order entry with risk validation |
| PositionCard | components/simulator/PositionCard.tsx | Active position with live P&L |
| EvaluationMetrics | components/simulator/EvaluationMetrics.tsx | 8 metric cards with live scores |
| EvaluationReport | components/simulator/EvaluationReport.tsx | Final PASS/FAIL report with scores |

### Styling

- All cards use `.bento-item`, headers use `.item-header` + `.item-title`
- Green `#c4f82e` for profit/pass, Red `#ff4757` for loss/fail, Cyan `#00F0FF` for neutral
- Numbers in `font-mono`
- Same glassmorphism, gradient borders, neon glow as main site

## Evaluation Report

### Hero: Big PASS/FAIL badge + challenge summary + duration

### Overall Score: Circular progress ring (0–100)
Weights: Risk 25% + Discipline 25% + Emotional 25% + Consistency 25%

### Four Score Cards

- **Risk Management (0–100):** Avg risk per trade, max risk, SL consistency. Start 100, -5 per trade >1.5% risk, -15 if avg >1.5%, -5 per trade without TP (max -20).
- **Discipline (0–100):** Rule compliance. Start 100, -10 per near-daily-limit occurrence, -15 for near-total-drawdown, -10 for few trading days. Auto 0 if failed.
- **Emotional Stability (0–100):** Behavioral analysis from trades array.
- **Consistency (0–100):** Profit distribution + daily P&L stability.

### Additional Report Sections
- Equity curve (SVG line chart with violation markers)
- Stats summary (win rate, avg R:R, best/worst trade, max drawdown, etc.)
- Trade history table (every trade with full details)
- Violations log (timestamped breaches)
- Actions: "Try Again" (reset) + "Back to Dashboard" (main site link)

## Out of Scope (future enhancements)

- Historical price replay mode
- Multiple simultaneous positions
- Social sharing / image export of results
- Server-side persistence / cross-device sync
- Limit orders / order book
- Multiple asset trading (currently BTC only via live feed)
