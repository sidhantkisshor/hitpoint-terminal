# Funded Challenge Simulator — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a demo trading simulator at `/simulator` that evaluates whether a trader can pass a funded account challenge (FTMO-style) using real-time BTC prices.

**Architecture:** New Zustand store with `persist` middleware for challenge state. Pure evaluation functions in a dedicated module. 7 new components in `components/simulator/`. Dedicated Next.js page at `app/simulator/page.tsx`. Subscribes to existing `useMarketStore.btcTicker` for live price data.

**Tech Stack:** Next.js 15 App Router, TypeScript, Zustand (persist middleware), Zod, Tailwind CSS, SVG for equity chart.

---

### Task 1: Simulator Zustand Store

**Files:**
- Create: `store/useSimulatorStore.ts`

**Step 1: Create the store with types, state, and actions**

All types are co-located in the store file. Uses `persist` middleware wrapping `subscribeWithSelector` (same pattern as `useMarketStore` but with persistence).

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { subscribeWithSelector } from 'zustand/middleware';

// --- Types ---

export type AccountSize = 10000 | 25000 | 50000 | 100000;
export type TradingStyle = 'crypto' | 'forex' | 'indices';
export type ChallengeType = '10-day' | '30-day';
export type ChallengeStatus = 'setup' | 'active' | 'passed' | 'failed';
export type TradeDirection = 'long' | 'short';
export type CloseReason = 'manual' | 'tp' | 'sl' | 'rule-violation';

export interface ChallengeConfig {
  accountSize: AccountSize;
  tradingStyle: TradingStyle;
  challengeType: ChallengeType;
  profitTarget: number;      // 0.08
  dailyLossLimit: number;    // 0.05
  totalLossLimit: number;    // 0.10
  maxRiskPerTrade: number;   // 0.02
  minTradingDays: number;    // 5
  maxTradingDays: number;    // 10 or 30
}

export interface Position {
  id: string;
  direction: TradeDirection;
  entryPrice: number;
  size: number;
  stopLoss: number;
  takeProfit: number | null;
  openedAt: string;
  unrealizedPnl: number;
}

export interface CompletedTrade {
  id: string;
  direction: TradeDirection;
  entryPrice: number;
  exitPrice: number;
  size: number;
  stopLoss: number;
  takeProfit: number | null;
  openedAt: string;
  closedAt: string;
  pnl: number;
  pnlPercent: number;
  closeReason: CloseReason;
}

export interface Violation {
  type: string;
  message: string;
  timestamp: string;
}

export interface EquityPoint {
  timestamp: number;
  balance: number;
}

interface SimulatorStore {
  // State
  status: ChallengeStatus;
  config: ChallengeConfig;
  startDate: string | null;
  startingBalance: number;
  currentBalance: number;
  highWaterMark: number;
  dailyStartBalance: number;
  lastCheckedDate: string | null;
  tradingDays: string[];         // ISO date strings (Set not serializable)
  activePosition: Position | null;
  trades: CompletedTrade[];
  equityCurve: EquityPoint[];
  violations: Violation[];
  failReason: string | null;

  // Actions
  updateConfig: (partial: Partial<ChallengeConfig>) => void;
  startChallenge: () => void;
  openPosition: (position: Omit<Position, 'unrealizedPnl'>) => void;
  updateUnrealizedPnl: (pnl: number) => void;
  closePosition: (exitPrice: number, closeReason: CloseReason) => void;
  addEquityPoint: (balance: number) => void;
  addViolation: (type: string, message: string) => void;
  failChallenge: (reason: string) => void;
  passChallenge: () => void;
  checkDailyReset: () => void;
  resetChallenge: () => void;
}

const DEFAULT_CONFIG: ChallengeConfig = {
  accountSize: 50000,
  tradingStyle: 'crypto',
  challengeType: '30-day',
  profitTarget: 0.08,
  dailyLossLimit: 0.05,
  totalLossLimit: 0.10,
  maxRiskPerTrade: 0.02,
  minTradingDays: 5,
  maxTradingDays: 30,
};

export const useSimulatorStore = create<SimulatorStore>()(
  persist(
    subscribeWithSelector((set, get) => ({
      // Initial state
      status: 'setup',
      config: DEFAULT_CONFIG,
      startDate: null,
      startingBalance: DEFAULT_CONFIG.accountSize,
      currentBalance: DEFAULT_CONFIG.accountSize,
      highWaterMark: DEFAULT_CONFIG.accountSize,
      dailyStartBalance: DEFAULT_CONFIG.accountSize,
      lastCheckedDate: null,
      tradingDays: [],
      activePosition: null,
      trades: [],
      equityCurve: [],
      violations: [],
      failReason: null,

      updateConfig: (partial) => set((state) => {
        const newConfig = { ...state.config, ...partial };
        // Sync maxTradingDays with challengeType
        if (partial.challengeType) {
          newConfig.maxTradingDays = partial.challengeType === '10-day' ? 10 : 30;
        }
        return {
          config: newConfig,
          startingBalance: newConfig.accountSize,
          currentBalance: newConfig.accountSize,
          highWaterMark: newConfig.accountSize,
          dailyStartBalance: newConfig.accountSize,
        };
      }),

      startChallenge: () => {
        const { config } = get();
        const now = new Date().toISOString();
        set({
          status: 'active',
          startDate: now,
          startingBalance: config.accountSize,
          currentBalance: config.accountSize,
          highWaterMark: config.accountSize,
          dailyStartBalance: config.accountSize,
          lastCheckedDate: now.split('T')[0],
          tradingDays: [],
          activePosition: null,
          trades: [],
          equityCurve: [{ timestamp: Date.now(), balance: config.accountSize }],
          violations: [],
          failReason: null,
        });
      },

      openPosition: (position) => {
        const today = new Date().toISOString().split('T')[0];
        const { tradingDays } = get();
        const newDays = tradingDays.includes(today) ? tradingDays : [...tradingDays, today];
        set({
          activePosition: { ...position, unrealizedPnl: 0 },
          tradingDays: newDays,
        });
      },

      updateUnrealizedPnl: (pnl) => set((state) => ({
        activePosition: state.activePosition
          ? { ...state.activePosition, unrealizedPnl: pnl }
          : null,
      })),

      closePosition: (exitPrice, closeReason) => {
        const { activePosition, trades, currentBalance, highWaterMark, startingBalance } = get();
        if (!activePosition) return;

        const pnl = activePosition.direction === 'long'
          ? activePosition.size * (exitPrice - activePosition.entryPrice) / activePosition.entryPrice
          : activePosition.size * (activePosition.entryPrice - exitPrice) / activePosition.entryPrice;

        const pnlPercent = pnl / currentBalance;
        const newBalance = currentBalance + pnl;

        const completedTrade: CompletedTrade = {
          id: activePosition.id,
          direction: activePosition.direction,
          entryPrice: activePosition.entryPrice,
          exitPrice,
          size: activePosition.size,
          stopLoss: activePosition.stopLoss,
          takeProfit: activePosition.takeProfit,
          openedAt: activePosition.openedAt,
          closedAt: new Date().toISOString(),
          pnl,
          pnlPercent,
          closeReason,
        };

        set({
          activePosition: null,
          trades: [...trades, completedTrade],
          currentBalance: newBalance,
          highWaterMark: Math.max(highWaterMark, newBalance),
        });
      },

      addEquityPoint: (balance) => set((state) => ({
        equityCurve: [...state.equityCurve, { timestamp: Date.now(), balance }],
      })),

      addViolation: (type, message) => set((state) => ({
        violations: [...state.violations, { type, message, timestamp: new Date().toISOString() }],
      })),

      failChallenge: (reason) => set({
        status: 'failed',
        failReason: reason,
      }),

      passChallenge: () => set({ status: 'passed' }),

      checkDailyReset: () => {
        const today = new Date().toISOString().split('T')[0];
        const { lastCheckedDate, currentBalance } = get();
        if (lastCheckedDate !== today) {
          set({
            dailyStartBalance: currentBalance,
            lastCheckedDate: today,
          });
        }
      },

      resetChallenge: () => set({
        status: 'setup',
        config: DEFAULT_CONFIG,
        startDate: null,
        startingBalance: DEFAULT_CONFIG.accountSize,
        currentBalance: DEFAULT_CONFIG.accountSize,
        highWaterMark: DEFAULT_CONFIG.accountSize,
        dailyStartBalance: DEFAULT_CONFIG.accountSize,
        lastCheckedDate: null,
        tradingDays: [],
        activePosition: null,
        trades: [],
        equityCurve: [],
        violations: [],
        failReason: null,
      }),
    })),
    {
      name: 'hitpoint-simulator',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
```

**Step 2: Verify it compiles**

Run: `npx tsc --noEmit store/useSimulatorStore.ts` (or just `npm run build` at the end)

**Step 3: Commit**

```bash
git add store/useSimulatorStore.ts
git commit -m "feat(simulator): add useSimulatorStore with persist middleware"
```

---

### Task 2: Evaluation Engine

**Files:**
- Create: `lib/simulator-evaluation.ts`

**Step 1: Create pure evaluation functions**

These functions take the store state and return scores/checks. They never mutate state.

```typescript
import type { CompletedTrade, ChallengeConfig } from '@/store/useSimulatorStore';

// --- Real-time checks (called on every price tick) ---

export function checkDailyLoss(
  dailyStartBalance: number,
  currentBalance: number,
  limit: number
): { breached: boolean; currentLoss: number } {
  const currentLoss = (dailyStartBalance - currentBalance) / dailyStartBalance;
  return { breached: currentLoss >= limit, currentLoss };
}

export function checkTotalDrawdown(
  startingBalance: number,
  currentBalance: number,
  limit: number
): { breached: boolean; currentDrawdown: number } {
  const currentDrawdown = (startingBalance - currentBalance) / startingBalance;
  return { breached: currentDrawdown >= limit, currentDrawdown };
}

export function checkRiskPerTrade(
  entryPrice: number,
  stopLoss: number,
  positionSize: number,
  currentBalance: number,
  maxRisk: number
): { allowed: boolean; riskPercent: number } {
  const riskAmount = positionSize * (Math.abs(entryPrice - stopLoss) / entryPrice);
  const riskPercent = riskAmount / currentBalance;
  return { allowed: riskPercent <= maxRisk, riskPercent };
}

export function checkMaxTradingDays(
  startDate: string,
  maxDays: number
): { exceeded: boolean; daysElapsed: number } {
  const start = new Date(startDate);
  const now = new Date();
  const daysElapsed = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return { exceeded: daysElapsed > maxDays, daysElapsed };
}

// --- Position P&L calculation ---

export function calculateUnrealizedPnl(
  direction: 'long' | 'short',
  entryPrice: number,
  currentPrice: number,
  size: number
): number {
  return direction === 'long'
    ? size * (currentPrice - entryPrice) / entryPrice
    : size * (entryPrice - currentPrice) / entryPrice;
}

export function checkTpSlHit(
  direction: 'long' | 'short',
  currentPrice: number,
  takeProfit: number | null,
  stopLoss: number
): 'tp' | 'sl' | null {
  if (direction === 'long') {
    if (currentPrice <= stopLoss) return 'sl';
    if (takeProfit !== null && currentPrice >= takeProfit) return 'tp';
  } else {
    if (currentPrice >= stopLoss) return 'sl';
    if (takeProfit !== null && currentPrice <= takeProfit) return 'tp';
  }
  return null;
}

// --- Post-trade scoring (computed from trades array) ---

export function checkProfitTarget(
  currentBalance: number,
  startingBalance: number,
  target: number
): { reached: boolean; currentProfit: number } {
  const currentProfit = (currentBalance - startingBalance) / startingBalance;
  return { reached: currentProfit >= target, currentProfit };
}

export function calculateConsistencyScore(trades: CompletedTrade[]): number {
  if (trades.length < 2) return 100;

  const profitTrades = trades.filter((t) => t.pnl > 0);
  const totalProfit = profitTrades.reduce((sum, t) => sum + t.pnl, 0);

  if (totalProfit <= 0) return 50; // No profit = neutral score

  // Part 1: Profit distribution evenness (50%)
  // Penalize if any single trade accounts for >40% of total profit
  let distributionScore = 100;
  for (const trade of profitTrades) {
    const contribution = trade.pnl / totalProfit;
    if (contribution > 0.4) {
      distributionScore -= (contribution - 0.4) * 200; // Heavy penalty
    }
  }
  distributionScore = Math.max(0, distributionScore);

  // Part 2: Daily P&L stability (50%)
  // Group trades by day, compute stddev of daily P&L
  const dailyPnl: Record<string, number> = {};
  for (const trade of trades) {
    const day = trade.closedAt.split('T')[0];
    dailyPnl[day] = (dailyPnl[day] || 0) + trade.pnl;
  }

  const dailyValues = Object.values(dailyPnl);
  const mean = dailyValues.reduce((a, b) => a + b, 0) / dailyValues.length;
  const variance = dailyValues.reduce((sum, v) => sum + (v - mean) ** 2, 0) / dailyValues.length;
  const stddev = Math.sqrt(variance);
  const cv = mean !== 0 ? stddev / Math.abs(mean) : 0; // coefficient of variation

  // CV < 0.5 = very consistent (100), CV > 2 = inconsistent (0)
  const stabilityScore = Math.max(0, Math.min(100, 100 - (cv - 0.5) * (100 / 1.5)));

  return Math.round(distributionScore * 0.5 + stabilityScore * 0.5);
}

export function calculateEmotionalScore(trades: CompletedTrade[]): number {
  if (trades.length === 0) return 100;

  let score = 100;

  for (let i = 1; i < trades.length; i++) {
    const prevTrade = trades[i - 1];
    const currTrade = trades[i];

    const timeDiff = new Date(currTrade.openedAt).getTime() - new Date(prevTrade.closedAt).getTime();

    // Revenge trading: new trade within 2 minutes of a losing trade
    if (prevTrade.pnl < 0 && timeDiff < 2 * 60 * 1000) {
      score -= 15;
    }

    // Size escalation: >50% size increase after a loss
    if (prevTrade.pnl < 0 && currTrade.size > prevTrade.size * 1.5) {
      score -= 20;
    }
  }

  // Overtrading: >5 trades in any 1-hour window
  for (let i = 0; i < trades.length; i++) {
    const windowStart = new Date(trades[i].openedAt).getTime();
    let count = 0;
    for (let j = i; j < trades.length; j++) {
      if (new Date(trades[j].openedAt).getTime() - windowStart <= 60 * 60 * 1000) {
        count++;
      }
    }
    if (count > 5) {
      score -= 10;
      break; // Only penalize once
    }
  }

  return Math.max(0, score);
}

export function calculateRiskScore(
  trades: CompletedTrade[],
  config: ChallengeConfig
): number {
  if (trades.length === 0) return 100;

  let score = 100;

  for (const trade of trades) {
    // Risk per trade based on SL distance
    const riskPercent = trade.size * (Math.abs(trade.entryPrice - trade.stopLoss) / trade.entryPrice);
    const riskOfAccount = riskPercent / (trade.pnl + trade.size); // approximate balance at entry

    if (riskOfAccount > 0.015) {
      score -= 5; // Above 1.5% but below 2% max
    }

    if (trade.takeProfit === null) {
      score -= 5; // No TP set
    }
  }

  // Cap TP penalty at -20
  const tpPenalty = trades.filter((t) => t.takeProfit === null).length * 5;
  if (tpPenalty > 20) {
    score += tpPenalty - 20; // refund excess
  }

  return Math.max(0, Math.min(100, score));
}

export function calculateDisciplineScore(
  trades: CompletedTrade[],
  dailyLossNearMisses: number,
  totalDrawdownNearMiss: boolean,
  tradingDaysCount: number,
  minTradingDays: number,
  failed: boolean
): number {
  if (failed) return 0;

  let score = 100;

  score -= dailyLossNearMisses * 10;    // -10 per day that came within 1% of daily limit
  if (totalDrawdownNearMiss) score -= 15; // Came within 2% of total drawdown limit
  if (tradingDaysCount < minTradingDays + 2) score -= 10; // Barely met min days

  return Math.max(0, score);
}

// --- Overall pass/fail check ---

export function evaluateChallenge(
  currentBalance: number,
  startingBalance: number,
  tradingDaysCount: number,
  config: ChallengeConfig,
  consistencyScore: number,
  emotionalScore: number
): { canPass: boolean; reasons: string[] } {
  const reasons: string[] = [];
  const profitPercent = (currentBalance - startingBalance) / startingBalance;

  if (profitPercent < config.profitTarget) {
    reasons.push(`Profit target not reached (${(profitPercent * 100).toFixed(1)}% / ${(config.profitTarget * 100).toFixed(0)}%)`);
  }
  if (tradingDaysCount < config.minTradingDays) {
    reasons.push(`Minimum trading days not met (${tradingDaysCount} / ${config.minTradingDays})`);
  }
  if (consistencyScore < 60) {
    reasons.push(`Consistency score too low (${consistencyScore} / 60 required)`);
  }
  if (emotionalScore < 50) {
    reasons.push(`Emotional stability score too low (${emotionalScore} / 50 required)`);
  }

  return { canPass: reasons.length === 0, reasons };
}
```

**Step 2: Commit**

```bash
git add lib/simulator-evaluation.ts
git commit -m "feat(simulator): add pure evaluation engine with 8 metrics"
```

---

### Task 3: Simulator Page Layout + Setup Screen

**Files:**
- Create: `app/simulator/page.tsx`
- Create: `components/simulator/SimulatorSetup.tsx`

**Step 1: Create the page shell**

The page imports the store and conditionally renders setup, active dashboard, or report based on `status`.

```typescript
// app/simulator/page.tsx
import { SimulatorPage } from '@/components/simulator/SimulatorPage';

export const metadata = {
  title: 'Funded Challenge Simulator - Hitpoint Terminal',
  description: 'Test if you can pass a funded account challenge before risking real money',
};

export default function Simulator() {
  return <SimulatorPage />;
}
```

Create `components/simulator/SimulatorPage.tsx` as the client wrapper:

```typescript
'use client';

import { useSimulatorStore } from '@/store/useSimulatorStore';
import { SimulatorSetup } from './SimulatorSetup';
import { SimulatorDashboard } from './SimulatorDashboard';
import { EvaluationReport } from './EvaluationReport';
import Link from 'next/link';

export function SimulatorPage() {
  const status = useSimulatorStore((s) => s.status);

  return (
    <main className="min-h-screen bg-black">
      {/* Background glow — same as main site */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-black" />
        <div className="absolute top-1/5 left-1/5 w-[700px] h-[700px] bg-[#c4f82e]/4 rounded-full blur-[180px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/5 w-[600px] h-[600px] bg-[#c4f82e]/3 rounded-full blur-[160px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-black/85 border-b border-white/10 shadow-2xl">
        <div className="max-w-[1900px] mx-auto px-8 py-5 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <img src="/logo.png" alt="Hitpoint Terminal Logo" className="w-10 h-10 object-contain" />
              <span className="text-2xl font-bold tracking-tight text-white">Hitpoint Terminal</span>
            </Link>
            <span className="text-white/20 text-2xl font-light">/</span>
            <span className="text-lg font-semibold text-[#c4f82e]">Challenge Simulator</span>
          </div>
          <div className="flex items-center gap-2 bg-[#c4f82e]/15 px-4 py-2 rounded-full border border-[#c4f82e]/30 shadow-lg shadow-[#c4f82e]/20">
            <div className="w-2 h-2 bg-[#c4f82e] rounded-full shadow-lg shadow-[#c4f82e]/70 animate-pulse" />
            <span className="text-xs text-[#c4f82e] font-bold tracking-wider">LIVE</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="relative z-10">
        {status === 'setup' && <SimulatorSetup />}
        {status === 'active' && <SimulatorDashboard />}
        {(status === 'passed' || status === 'failed') && <EvaluationReport />}
      </div>
    </main>
  );
}
```

**Step 2: Create SimulatorSetup**

The setup screen where users configure their challenge. Cards for account size, toggles for challenge type, rules preview.

```typescript
// components/simulator/SimulatorSetup.tsx
'use client';

import { useSimulatorStore, type AccountSize, type ChallengeType } from '@/store/useSimulatorStore';

const ACCOUNT_SIZES: { value: AccountSize; label: string }[] = [
  { value: 10000, label: '$10K' },
  { value: 25000, label: '$25K' },
  { value: 50000, label: '$50K' },
  { value: 100000, label: '$100K' },
];

const CHALLENGE_TYPES: { value: ChallengeType; label: string; days: number }[] = [
  { value: '10-day', label: 'Sprint', days: 10 },
  { value: '30-day', label: 'Standard', days: 30 },
];

export function SimulatorSetup() {
  const config = useSimulatorStore((s) => s.config);
  const updateConfig = useSimulatorStore((s) => s.updateConfig);
  const startChallenge = useSimulatorStore((s) => s.startChallenge);

  return (
    <div className="max-w-[900px] mx-auto px-8 py-16">
      {/* Hero */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-white mb-4">
          Funded Account Challenge
        </h1>
        <p className="text-lg text-white/50 max-w-[600px] mx-auto">
          Are you ready to pass a prop firm challenge? Trade with real market prices under real evaluation rules. No money at risk.
        </p>
      </div>

      {/* Account Size */}
      <div className="mb-12">
        <h2 className="text-xs font-semibold uppercase tracking-[2px] text-white/40 mb-4">Account Size</h2>
        <div className="grid grid-cols-4 gap-3">
          {ACCOUNT_SIZES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => updateConfig({ accountSize: value })}
              className={`py-4 rounded-2xl text-center font-bold text-lg transition-all duration-300 border ${
                config.accountSize === value
                  ? 'bg-[#c4f82e]/10 border-[#c4f82e]/40 text-[#c4f82e] shadow-lg shadow-[#c4f82e]/10'
                  : 'bg-white/[0.03] border-white/[0.06] text-white/60 hover:border-white/15 hover:text-white/80'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Challenge Type */}
      <div className="mb-12">
        <h2 className="text-xs font-semibold uppercase tracking-[2px] text-white/40 mb-4">Challenge Duration</h2>
        <div className="grid grid-cols-2 gap-3">
          {CHALLENGE_TYPES.map(({ value, label, days }) => (
            <button
              key={value}
              onClick={() => updateConfig({ challengeType: value })}
              className={`py-5 rounded-2xl text-center transition-all duration-300 border ${
                config.challengeType === value
                  ? 'bg-[#c4f82e]/10 border-[#c4f82e]/40 shadow-lg shadow-[#c4f82e]/10'
                  : 'bg-white/[0.03] border-white/[0.06] hover:border-white/15'
              }`}
            >
              <span className={`block text-lg font-bold ${config.challengeType === value ? 'text-[#c4f82e]' : 'text-white/60'}`}>
                {label}
              </span>
              <span className="block text-sm text-white/30 mt-1">{days} days</span>
            </button>
          ))}
        </div>
      </div>

      {/* Rules Preview */}
      <div className="bento-item mb-12">
        <div className="item-header">
          <span className="item-title">Challenge Rules</span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between items-center py-2 border-b border-white/5">
            <span className="text-white/50">Profit Target</span>
            <span className="font-mono font-bold text-[#c4f82e]">+{(config.profitTarget * 100).toFixed(0)}%</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-white/5">
            <span className="text-white/50">Daily Loss Limit</span>
            <span className="font-mono font-bold text-[#ff4757]">-{(config.dailyLossLimit * 100).toFixed(0)}%</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-white/5">
            <span className="text-white/50">Max Drawdown</span>
            <span className="font-mono font-bold text-[#ff4757]">-{(config.totalLossLimit * 100).toFixed(0)}%</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-white/5">
            <span className="text-white/50">Max Risk/Trade</span>
            <span className="font-mono font-bold text-white/80">{(config.maxRiskPerTrade * 100).toFixed(0)}%</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-white/5">
            <span className="text-white/50">Min Trading Days</span>
            <span className="font-mono font-bold text-white/80">{config.minTradingDays}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-white/5">
            <span className="text-white/50">Max Trading Days</span>
            <span className="font-mono font-bold text-white/80">{config.maxTradingDays}</span>
          </div>
        </div>
      </div>

      {/* Start Button */}
      <button
        onClick={startChallenge}
        className="w-full py-5 rounded-2xl bg-[#c4f82e] text-black font-bold text-lg tracking-wide hover:bg-[#d4ff4e] transition-all duration-300 shadow-lg shadow-[#c4f82e]/25 hover:shadow-xl hover:shadow-[#c4f82e]/35 hover:scale-[1.02] active:scale-[0.98]"
      >
        Start Challenge
      </button>
    </div>
  );
}
```

**Step 3: Create placeholder SimulatorDashboard and EvaluationReport**

Minimal placeholders so the page compiles. We'll fill these in subsequent tasks.

```typescript
// components/simulator/SimulatorDashboard.tsx
'use client';

export function SimulatorDashboard() {
  return (
    <div className="max-w-[1900px] mx-auto px-8 py-8">
      <p className="text-white/50">Dashboard — coming next</p>
    </div>
  );
}
```

```typescript
// components/simulator/EvaluationReport.tsx
'use client';

export function EvaluationReport() {
  return (
    <div className="max-w-[1900px] mx-auto px-8 py-8">
      <p className="text-white/50">Report — coming later</p>
    </div>
  );
}
```

**Step 4: Verify the page loads**

Run: `npm run dev` — navigate to `http://localhost:3000/simulator`. Should see the setup screen.

**Step 5: Commit**

```bash
git add app/simulator/ components/simulator/
git commit -m "feat(simulator): add /simulator page with setup screen"
```

---

### Task 4: ChallengeHeader Component

**Files:**
- Create: `components/simulator/ChallengeHeader.tsx`

**Step 1: Build the sticky stats strip**

Shows balance, P&L%, profit target progress bar, daily loss remaining, days remaining.

```typescript
'use client';

import { useSimulatorStore } from '@/store/useSimulatorStore';
import { checkDailyLoss, checkTotalDrawdown, checkMaxTradingDays, checkProfitTarget } from '@/lib/simulator-evaluation';

export function ChallengeHeader() {
  const currentBalance = useSimulatorStore((s) => s.currentBalance);
  const startingBalance = useSimulatorStore((s) => s.startingBalance);
  const dailyStartBalance = useSimulatorStore((s) => s.dailyStartBalance);
  const startDate = useSimulatorStore((s) => s.startDate);
  const config = useSimulatorStore((s) => s.config);
  const tradingDays = useSimulatorStore((s) => s.tradingDays);
  const activePosition = useSimulatorStore((s) => s.activePosition);

  const effectiveBalance = currentBalance + (activePosition?.unrealizedPnl ?? 0);
  const pnlPercent = ((effectiveBalance - startingBalance) / startingBalance) * 100;
  const dailyLoss = checkDailyLoss(dailyStartBalance, effectiveBalance, config.dailyLossLimit);
  const totalDrawdown = checkTotalDrawdown(startingBalance, effectiveBalance, config.totalLossLimit);
  const profit = checkProfitTarget(effectiveBalance, startingBalance, config.profitTarget);
  const days = startDate ? checkMaxTradingDays(startDate, config.maxTradingDays) : { daysElapsed: 0, exceeded: false };
  const progressPercent = Math.min(100, Math.max(0, (profit.currentProfit / config.profitTarget) * 100));

  return (
    <div className="bento-item col-span-12 !py-4">
      <div className="flex items-center justify-between gap-6 flex-wrap">
        {/* Balance */}
        <div>
          <span className="text-xs text-white/40 uppercase tracking-wider">Balance</span>
          <p className="text-2xl font-bold font-mono text-white">
            ${effectiveBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        {/* P&L */}
        <div>
          <span className="text-xs text-white/40 uppercase tracking-wider">P&L</span>
          <p className={`text-xl font-bold font-mono ${pnlPercent >= 0 ? 'text-[#c4f82e]' : 'text-[#ff4757]'}`}>
            {pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
          </p>
        </div>

        {/* Profit Target Progress */}
        <div className="flex-1 min-w-[200px] max-w-[300px]">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-white/40 uppercase tracking-wider">Profit Target</span>
            <span className="font-mono text-[#c4f82e]">{(profit.currentProfit * 100).toFixed(1)}% / {(config.profitTarget * 100).toFixed(0)}%</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#c4f82e] rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Daily Loss Remaining */}
        <div>
          <span className="text-xs text-white/40 uppercase tracking-wider">Daily Loss Left</span>
          <p className={`text-lg font-bold font-mono ${dailyLoss.currentLoss > config.dailyLossLimit * 0.7 ? 'text-[#ff4757]' : 'text-white/80'}`}>
            {((config.dailyLossLimit - dailyLoss.currentLoss) * 100).toFixed(1)}%
          </p>
        </div>

        {/* Total Drawdown Remaining */}
        <div>
          <span className="text-xs text-white/40 uppercase tracking-wider">Max DD Left</span>
          <p className={`text-lg font-bold font-mono ${totalDrawdown.currentDrawdown > config.totalLossLimit * 0.7 ? 'text-[#ff4757]' : 'text-white/80'}`}>
            {((config.totalLossLimit - totalDrawdown.currentDrawdown) * 100).toFixed(1)}%
          </p>
        </div>

        {/* Days */}
        <div>
          <span className="text-xs text-white/40 uppercase tracking-wider">Days</span>
          <p className="text-lg font-bold font-mono text-white/80">
            {days.daysElapsed} / {config.maxTradingDays}
          </p>
        </div>

        {/* Trading Days */}
        <div>
          <span className="text-xs text-white/40 uppercase tracking-wider">Trading Days</span>
          <p className="text-lg font-bold font-mono text-white/80">
            {tradingDays.length} / {config.minTradingDays}
          </p>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add components/simulator/ChallengeHeader.tsx
git commit -m "feat(simulator): add ChallengeHeader stats strip"
```

---

### Task 5: PriceDisplay Component

**Files:**
- Create: `components/simulator/PriceDisplay.tsx`

**Step 1: Build PriceDisplay**

Subscribes to `useMarketStore.btcTicker` for live price. Shows price with flash animation on change.

```typescript
'use client';

import { useEffect, useRef } from 'react';
import { useMarketStore } from '@/store/useMarketStore';

export function PriceDisplay() {
  const btcTicker = useMarketStore((s) => s.btcTicker);
  const prevPriceRef = useRef<string | null>(null);
  const flashRef = useRef<HTMLSpanElement>(null);

  const price = btcTicker?.price ?? null;
  const isPositive = btcTicker ? parseFloat(btcTicker.priceChangePercent) >= 0 : true;

  // Flash animation on price change
  useEffect(() => {
    if (price && prevPriceRef.current && price !== prevPriceRef.current) {
      const el = flashRef.current;
      if (el) {
        const isUp = parseFloat(price) > parseFloat(prevPriceRef.current);
        el.style.color = isUp ? '#c4f82e' : '#ff4757';
        setTimeout(() => { el.style.color = ''; }, 300);
      }
    }
    prevPriceRef.current = price;
  }, [price]);

  return (
    <div className="bento-item col-span-12 md:col-span-6 lg:col-span-4">
      <div className="item-header">
        <span className="item-title">BTC / USDT</span>
        <div className="live-indicator">
          <span className="live-dot" />
          <span>LIVE</span>
        </div>
      </div>
      <div className="flex flex-col justify-center h-full gap-3">
        <span
          ref={flashRef}
          className="text-5xl font-bold font-mono tracking-tight text-white transition-colors duration-300"
        >
          ${price ?? '---'}
        </span>
        {btcTicker && (
          <div className="flex items-center gap-3">
            <span className={`text-sm font-bold font-mono px-3 py-1.5 rounded-full border ${
              isPositive
                ? 'text-[#c4f82e] bg-[#c4f82e]/10 border-[#c4f82e]/30'
                : 'text-[#ff4757] bg-[#ff4757]/10 border-[#ff4757]/30'
            }`}>
              {isPositive ? '+' : ''}{btcTicker.priceChangePercent}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add components/simulator/PriceDisplay.tsx
git commit -m "feat(simulator): add PriceDisplay with live BTC price"
```

---

### Task 6: TradePanel Component

**Files:**
- Create: `components/simulator/TradePanel.tsx`

**Step 1: Build the order entry panel**

Long/Short toggle, size input (USD), TP/SL fields, risk preview, execute button. Validates risk before allowing trade.

```typescript
'use client';

import { useState } from 'react';
import { useSimulatorStore } from '@/store/useSimulatorStore';
import { useMarketStore } from '@/store/useMarketStore';
import { checkRiskPerTrade } from '@/lib/simulator-evaluation';
import type { TradeDirection } from '@/store/useSimulatorStore';

export function TradePanel() {
  const currentBalance = useSimulatorStore((s) => s.currentBalance);
  const config = useSimulatorStore((s) => s.config);
  const activePosition = useSimulatorStore((s) => s.activePosition);
  const openPosition = useSimulatorStore((s) => s.openPosition);

  const btcTicker = useMarketStore((s) => s.btcTicker);
  const currentPrice = btcTicker ? parseFloat(btcTicker.price) : null;

  const [direction, setDirection] = useState<TradeDirection>('long');
  const [sizeInput, setSizeInput] = useState('');
  const [slInput, setSlInput] = useState('');
  const [tpInput, setTpInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const size = parseFloat(sizeInput) || 0;
  const sl = parseFloat(slInput) || 0;
  const tp = tpInput ? parseFloat(tpInput) : null;

  // Live risk preview
  const riskCheck = currentPrice && sl > 0 && size > 0
    ? checkRiskPerTrade(currentPrice, sl, size, currentBalance, config.maxRiskPerTrade)
    : null;

  const handleExecute = () => {
    setError(null);

    if (!currentPrice) { setError('Waiting for price data...'); return; }
    if (activePosition) { setError('Close your current position first'); return; }
    if (size <= 0) { setError('Enter a valid position size'); return; }
    if (size > currentBalance) { setError('Size exceeds available balance'); return; }
    if (sl <= 0) { setError('Stop-loss is required'); return; }

    // Validate SL direction
    if (direction === 'long' && sl >= currentPrice) {
      setError('Stop-loss must be below entry price for longs');
      return;
    }
    if (direction === 'short' && sl <= currentPrice) {
      setError('Stop-loss must be above entry price for shorts');
      return;
    }

    // Validate TP direction
    if (tp !== null) {
      if (direction === 'long' && tp <= currentPrice) {
        setError('Take-profit must be above entry price for longs');
        return;
      }
      if (direction === 'short' && tp >= currentPrice) {
        setError('Take-profit must be below entry price for shorts');
        return;
      }
    }

    // Risk check
    const risk = checkRiskPerTrade(currentPrice, sl, size, currentBalance, config.maxRiskPerTrade);
    if (!risk.allowed) {
      setError(`Risk per trade exceeds ${(config.maxRiskPerTrade * 100).toFixed(0)}% limit (${(risk.riskPercent * 100).toFixed(1)}%)`);
      return;
    }

    openPosition({
      id: crypto.randomUUID(),
      direction,
      entryPrice: currentPrice,
      size,
      stopLoss: sl,
      takeProfit: tp,
      openedAt: new Date().toISOString(),
    });

    // Reset form
    setSizeInput('');
    setSlInput('');
    setTpInput('');
    setError(null);
  };

  const isDisabled = !!activePosition || !currentPrice;

  return (
    <div className="bento-item col-span-12 md:col-span-6 lg:col-span-4">
      <div className="item-header">
        <span className="item-title">Trade</span>
      </div>

      <div className="flex flex-col gap-4">
        {/* Direction Toggle */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setDirection('long')}
            disabled={isDisabled}
            className={`py-3 rounded-xl font-bold text-sm transition-all ${
              direction === 'long'
                ? 'bg-[#c4f82e]/15 text-[#c4f82e] border border-[#c4f82e]/40'
                : 'bg-white/[0.03] text-white/40 border border-white/[0.06] hover:text-white/60'
            } disabled:opacity-30`}
          >
            LONG
          </button>
          <button
            onClick={() => setDirection('short')}
            disabled={isDisabled}
            className={`py-3 rounded-xl font-bold text-sm transition-all ${
              direction === 'short'
                ? 'bg-[#ff4757]/15 text-[#ff4757] border border-[#ff4757]/40'
                : 'bg-white/[0.03] text-white/40 border border-white/[0.06] hover:text-white/60'
            } disabled:opacity-30`}
          >
            SHORT
          </button>
        </div>

        {/* Size Input */}
        <div>
          <label className="text-xs text-white/40 uppercase tracking-wider block mb-1">Size (USD)</label>
          <input
            type="number"
            value={sizeInput}
            onChange={(e) => setSizeInput(e.target.value)}
            placeholder={`Max: $${currentBalance.toLocaleString()}`}
            disabled={isDisabled}
            className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-[#c4f82e]/40 transition-colors disabled:opacity-30"
          />
        </div>

        {/* SL Input */}
        <div>
          <label className="text-xs text-white/40 uppercase tracking-wider block mb-1">Stop-Loss Price *</label>
          <input
            type="number"
            value={slInput}
            onChange={(e) => setSlInput(e.target.value)}
            placeholder="Required"
            disabled={isDisabled}
            className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-[#ff4757]/40 transition-colors disabled:opacity-30"
          />
        </div>

        {/* TP Input */}
        <div>
          <label className="text-xs text-white/40 uppercase tracking-wider block mb-1">Take-Profit Price</label>
          <input
            type="number"
            value={tpInput}
            onChange={(e) => setTpInput(e.target.value)}
            placeholder="Optional"
            disabled={isDisabled}
            className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-[#c4f82e]/40 transition-colors disabled:opacity-30"
          />
        </div>

        {/* Risk Preview */}
        {riskCheck && (
          <div className={`text-xs font-mono px-3 py-2 rounded-lg ${
            riskCheck.allowed
              ? 'text-[#c4f82e]/70 bg-[#c4f82e]/5'
              : 'text-[#ff4757] bg-[#ff4757]/5'
          }`}>
            Risk: {(riskCheck.riskPercent * 100).toFixed(2)}% of account
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-xs text-[#ff4757] bg-[#ff4757]/5 px-3 py-2 rounded-lg">
            {error}
          </div>
        )}

        {/* Execute Button */}
        <button
          onClick={handleExecute}
          disabled={isDisabled}
          className={`w-full py-4 rounded-xl font-bold text-sm transition-all ${
            direction === 'long'
              ? 'bg-[#c4f82e] text-black hover:bg-[#d4ff4e] shadow-lg shadow-[#c4f82e]/20'
              : 'bg-[#ff4757] text-white hover:bg-[#ff5a68] shadow-lg shadow-[#ff4757]/20'
          } disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98]`}
        >
          {activePosition ? 'Position Open' : `Open ${direction === 'long' ? 'Long' : 'Short'}`}
        </button>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add components/simulator/TradePanel.tsx
git commit -m "feat(simulator): add TradePanel with risk validation"
```

---

### Task 7: PositionCard Component

**Files:**
- Create: `components/simulator/PositionCard.tsx`

**Step 1: Build PositionCard with live P&L**

Shows active position details and a close button. When no position is open, shows empty state.

```typescript
'use client';

import { useSimulatorStore } from '@/store/useSimulatorStore';

export function PositionCard() {
  const activePosition = useSimulatorStore((s) => s.activePosition);
  const closePosition = useSimulatorStore((s) => s.closePosition);
  const currentBalance = useSimulatorStore((s) => s.currentBalance);

  // We'll read btcTicker in the dashboard's tick loop, not here.
  // This component just reads unrealizedPnl from the position (updated by the tick loop).

  if (!activePosition) {
    return (
      <div className="bento-item col-span-12 md:col-span-6 lg:col-span-4 flex items-center justify-center">
        <p className="text-white/20 text-sm">No open position</p>
      </div>
    );
  }

  const pnl = activePosition.unrealizedPnl;
  const pnlPercent = (pnl / currentBalance) * 100;
  const isProfit = pnl >= 0;

  return (
    <div className="bento-item col-span-12 md:col-span-6 lg:col-span-4">
      <div className="item-header">
        <span className="item-title">Open Position</span>
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
          activePosition.direction === 'long'
            ? 'text-[#c4f82e] bg-[#c4f82e]/10'
            : 'text-[#ff4757] bg-[#ff4757]/10'
        }`}>
          {activePosition.direction.toUpperCase()}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {/* Unrealized P&L */}
        <div className="text-center py-3">
          <p className={`text-3xl font-bold font-mono ${isProfit ? 'text-[#c4f82e]' : 'text-[#ff4757]'}`}>
            {isProfit ? '+' : ''}{pnl.toFixed(2)} USD
          </p>
          <p className={`text-sm font-mono ${isProfit ? 'text-[#c4f82e]/60' : 'text-[#ff4757]/60'}`}>
            {isProfit ? '+' : ''}{pnlPercent.toFixed(2)}%
          </p>
        </div>

        {/* Position details */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex justify-between py-1.5 border-b border-white/5">
            <span className="text-white/40">Entry</span>
            <span className="font-mono text-white/80">${activePosition.entryPrice.toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-white/5">
            <span className="text-white/40">Size</span>
            <span className="font-mono text-white/80">${activePosition.size.toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-white/5">
            <span className="text-white/40">Stop-Loss</span>
            <span className="font-mono text-[#ff4757]/80">${activePosition.stopLoss.toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-white/5">
            <span className="text-white/40">Take-Profit</span>
            <span className="font-mono text-[#c4f82e]/80">
              {activePosition.takeProfit ? `$${activePosition.takeProfit.toLocaleString()}` : '—'}
            </span>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={() => {
            // We'll use the current unrealized P&L to derive an approximate exit price.
            // The actual exit price comes from the tick loop — but for manual close,
            // we calculate it back from the P&L.
            const exitPrice = activePosition.direction === 'long'
              ? activePosition.entryPrice * (1 + pnl / activePosition.size)
              : activePosition.entryPrice * (1 - pnl / activePosition.size);
            closePosition(exitPrice, 'manual');
          }}
          className="w-full py-3 rounded-xl font-bold text-sm bg-white/[0.05] border border-white/[0.1] text-white/60 hover:text-white hover:border-white/20 transition-all active:scale-[0.98]"
        >
          Close Position
        </button>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add components/simulator/PositionCard.tsx
git commit -m "feat(simulator): add PositionCard with live P&L display"
```

---

### Task 8: EvaluationMetrics Component

**Files:**
- Create: `components/simulator/EvaluationMetrics.tsx`

**Step 1: Build 4 live metric cards**

Shows consistency, emotional stability, risk, and discipline scores — all computed live from trades array.

```typescript
'use client';

import { useSimulatorStore } from '@/store/useSimulatorStore';
import {
  calculateConsistencyScore,
  calculateEmotionalScore,
  calculateRiskScore,
  calculateDisciplineScore,
} from '@/lib/simulator-evaluation';

function MetricCard({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4">
      <span className="text-xs text-white/40 uppercase tracking-wider">{label}</span>
      <div className="mt-2 flex items-end gap-2">
        <span className="text-2xl font-bold font-mono" style={{ color }}>{score}</span>
        <span className="text-xs text-white/30 mb-1">/ 100</span>
      </div>
      <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export function EvaluationMetrics() {
  const trades = useSimulatorStore((s) => s.trades);
  const config = useSimulatorStore((s) => s.config);
  const tradingDays = useSimulatorStore((s) => s.tradingDays);
  const status = useSimulatorStore((s) => s.status);

  const consistency = calculateConsistencyScore(trades);
  const emotional = calculateEmotionalScore(trades);
  const risk = calculateRiskScore(trades, config);
  const discipline = calculateDisciplineScore(
    trades,
    0, // dailyLossNearMisses — simplified: 0 for now, can track in store later
    false, // totalDrawdownNearMiss
    tradingDays.length,
    config.minTradingDays,
    status === 'failed'
  );

  const getColor = (score: number) => {
    if (score >= 80) return '#c4f82e';
    if (score >= 60) return '#00F0FF';
    if (score >= 40) return '#FFA500';
    return '#ff4757';
  };

  return (
    <div className="bento-item col-span-12 lg:col-span-6">
      <div className="item-header">
        <span className="item-title">Evaluation Scores</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <MetricCard label="Consistency" score={consistency} color={getColor(consistency)} />
        <MetricCard label="Emotional" score={emotional} color={getColor(emotional)} />
        <MetricCard label="Risk Mgmt" score={risk} color={getColor(risk)} />
        <MetricCard label="Discipline" score={discipline} color={getColor(discipline)} />
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add components/simulator/EvaluationMetrics.tsx
git commit -m "feat(simulator): add EvaluationMetrics with live scoring"
```

---

### Task 9: EquityCurve + TradeHistory + ViolationsLog

**Files:**
- Create: `components/simulator/EquityCurve.tsx`
- Create: `components/simulator/TradeHistory.tsx`
- Create: `components/simulator/ViolationsLog.tsx`

**Step 1: EquityCurve — SVG line chart**

```typescript
'use client';

import { useSimulatorStore } from '@/store/useSimulatorStore';

export function EquityCurve() {
  const equityCurve = useSimulatorStore((s) => s.equityCurve);
  const startingBalance = useSimulatorStore((s) => s.startingBalance);

  if (equityCurve.length < 2) {
    return (
      <div className="bento-item col-span-12 lg:col-span-6 flex items-center justify-center">
        <p className="text-white/20 text-sm">Equity curve will appear after your first trade</p>
      </div>
    );
  }

  const balances = equityCurve.map((p) => p.balance);
  const minBal = Math.min(...balances) * 0.995;
  const maxBal = Math.max(...balances) * 1.005;
  const range = maxBal - minBal || 1;

  const width = 600;
  const height = 200;
  const padding = 10;

  const points = equityCurve.map((point, i) => {
    const x = padding + (i / (equityCurve.length - 1)) * (width - padding * 2);
    const y = padding + (1 - (point.balance - minBal) / range) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  const lastBalance = balances[balances.length - 1];
  const isProfit = lastBalance >= startingBalance;

  // Gradient area
  const areaPoints = `${padding},${height - padding} ${points} ${width - padding},${height - padding}`;

  return (
    <div className="bento-item col-span-12 lg:col-span-6">
      <div className="item-header">
        <span className="item-title">Equity Curve</span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        <defs>
          <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isProfit ? '#c4f82e' : '#ff4757'} stopOpacity="0.3" />
            <stop offset="100%" stopColor={isProfit ? '#c4f82e' : '#ff4757'} stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Starting balance line */}
        <line
          x1={padding} y1={padding + (1 - (startingBalance - minBal) / range) * (height - padding * 2)}
          x2={width - padding} y2={padding + (1 - (startingBalance - minBal) / range) * (height - padding * 2)}
          stroke="white" strokeOpacity="0.1" strokeDasharray="4,4"
        />
        {/* Area fill */}
        <polygon points={areaPoints} fill="url(#equityGradient)" />
        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke={isProfit ? '#c4f82e' : '#ff4757'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
```

**Step 2: TradeHistory table**

```typescript
'use client';

import { useSimulatorStore } from '@/store/useSimulatorStore';

export function TradeHistory() {
  const trades = useSimulatorStore((s) => s.trades);

  return (
    <div className="bento-item col-span-12 lg:col-span-8">
      <div className="item-header">
        <span className="item-title">Trade History</span>
        <span className="text-xs text-white/30 font-mono">{trades.length} trades</span>
      </div>
      {trades.length === 0 ? (
        <p className="text-white/20 text-sm text-center py-8">No trades yet</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-white/30 uppercase tracking-wider border-b border-white/5">
                <th className="py-2 text-left">#</th>
                <th className="py-2 text-left">Dir</th>
                <th className="py-2 text-right">Entry</th>
                <th className="py-2 text-right">Exit</th>
                <th className="py-2 text-right">Size</th>
                <th className="py-2 text-right">P&L</th>
                <th className="py-2 text-right">P&L%</th>
                <th className="py-2 text-left">Reason</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((trade, i) => (
                <tr key={trade.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                  <td className="py-2 font-mono text-white/40">{i + 1}</td>
                  <td className={`py-2 font-bold ${trade.direction === 'long' ? 'text-[#c4f82e]' : 'text-[#ff4757]'}`}>
                    {trade.direction.toUpperCase()}
                  </td>
                  <td className="py-2 text-right font-mono text-white/70">${trade.entryPrice.toLocaleString()}</td>
                  <td className="py-2 text-right font-mono text-white/70">${trade.exitPrice.toLocaleString()}</td>
                  <td className="py-2 text-right font-mono text-white/70">${trade.size.toLocaleString()}</td>
                  <td className={`py-2 text-right font-mono font-bold ${trade.pnl >= 0 ? 'text-[#c4f82e]' : 'text-[#ff4757]'}`}>
                    {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)}
                  </td>
                  <td className={`py-2 text-right font-mono ${trade.pnlPercent >= 0 ? 'text-[#c4f82e]/70' : 'text-[#ff4757]/70'}`}>
                    {(trade.pnlPercent * 100).toFixed(2)}%
                  </td>
                  <td className="py-2 text-white/40">{trade.closeReason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
```

**Step 3: ViolationsLog**

```typescript
'use client';

import { useSimulatorStore } from '@/store/useSimulatorStore';

export function ViolationsLog() {
  const violations = useSimulatorStore((s) => s.violations);

  return (
    <div className="bento-item col-span-12 lg:col-span-4">
      <div className="item-header">
        <span className="item-title">Violations</span>
        {violations.length > 0 && (
          <span className="text-xs font-bold text-[#ff4757] bg-[#ff4757]/10 px-2 py-1 rounded-full">
            {violations.length}
          </span>
        )}
      </div>
      {violations.length === 0 ? (
        <p className="text-white/20 text-sm text-center py-8">Clean record</p>
      ) : (
        <div className="flex flex-col gap-2 max-h-[250px] overflow-y-auto">
          {violations.map((v, i) => (
            <div key={i} className="bg-[#ff4757]/5 border border-[#ff4757]/10 rounded-lg px-3 py-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-[#ff4757]">{v.type}</span>
                <span className="text-[10px] text-white/20 font-mono">
                  {new Date(v.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-xs text-white/40 mt-1">{v.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Step 4: Commit**

```bash
git add components/simulator/EquityCurve.tsx components/simulator/TradeHistory.tsx components/simulator/ViolationsLog.tsx
git commit -m "feat(simulator): add EquityCurve, TradeHistory, and ViolationsLog"
```

---

### Task 10: SimulatorDashboard — Wire Everything Together with Tick Loop

**Files:**
- Modify: `components/simulator/SimulatorDashboard.tsx` (replace placeholder)

**Step 1: Build the full dashboard with the price tick loop**

This is the main orchestrator. It subscribes to `btcTicker`, runs P&L updates, checks TP/SL, checks daily loss/drawdown limits, and manages the equity curve throttle.

```typescript
'use client';

import { useEffect, useRef } from 'react';
import { useMarketStore } from '@/store/useMarketStore';
import { useSimulatorStore } from '@/store/useSimulatorStore';
import {
  calculateUnrealizedPnl,
  checkTpSlHit,
  checkDailyLoss,
  checkTotalDrawdown,
  checkMaxTradingDays,
  checkProfitTarget,
  evaluateChallenge,
  calculateConsistencyScore,
  calculateEmotionalScore,
} from '@/lib/simulator-evaluation';

import { ChallengeHeader } from './ChallengeHeader';
import { PriceDisplay } from './PriceDisplay';
import { TradePanel } from './TradePanel';
import { PositionCard } from './PositionCard';
import { EquityCurve } from './EquityCurve';
import { EvaluationMetrics } from './EvaluationMetrics';
import { TradeHistory } from './TradeHistory';
import { ViolationsLog } from './ViolationsLog';

export function SimulatorDashboard() {
  const btcTicker = useMarketStore((s) => s.btcTicker);
  const lastEquityPointRef = useRef<number>(0);

  const activePosition = useSimulatorStore((s) => s.activePosition);
  const status = useSimulatorStore((s) => s.status);
  const config = useSimulatorStore((s) => s.config);
  const currentBalance = useSimulatorStore((s) => s.currentBalance);
  const startingBalance = useSimulatorStore((s) => s.startingBalance);
  const dailyStartBalance = useSimulatorStore((s) => s.dailyStartBalance);
  const startDate = useSimulatorStore((s) => s.startDate);
  const tradingDays = useSimulatorStore((s) => s.tradingDays);
  const trades = useSimulatorStore((s) => s.trades);

  const updateUnrealizedPnl = useSimulatorStore((s) => s.updateUnrealizedPnl);
  const closePosition = useSimulatorStore((s) => s.closePosition);
  const addEquityPoint = useSimulatorStore((s) => s.addEquityPoint);
  const addViolation = useSimulatorStore((s) => s.addViolation);
  const failChallenge = useSimulatorStore((s) => s.failChallenge);
  const passChallenge = useSimulatorStore((s) => s.passChallenge);
  const checkDailyReset = useSimulatorStore((s) => s.checkDailyReset);

  // Price tick loop — runs on every btcTicker update
  useEffect(() => {
    if (status !== 'active' || !btcTicker) return;

    const currentPrice = parseFloat(btcTicker.price);
    if (isNaN(currentPrice) || currentPrice <= 0) return;

    // 1. Daily reset check
    checkDailyReset();

    // 2. Update unrealized P&L for active position
    if (activePosition) {
      const pnl = calculateUnrealizedPnl(
        activePosition.direction,
        activePosition.entryPrice,
        currentPrice,
        activePosition.size
      );
      updateUnrealizedPnl(pnl);

      // 3. Check TP/SL hit
      const tpSlResult = checkTpSlHit(
        activePosition.direction,
        currentPrice,
        activePosition.takeProfit,
        activePosition.stopLoss
      );

      if (tpSlResult) {
        closePosition(currentPrice, tpSlResult);
        if (tpSlResult === 'sl') {
          addViolation('Stop-Loss Hit', `Position closed at $${currentPrice.toLocaleString()}`);
        }
        return; // Position closed, skip further checks this tick
      }

      // 4. Check if closing would breach daily/total loss limits
      const effectiveBalance = currentBalance + pnl;
      const dailyLoss = checkDailyLoss(dailyStartBalance, effectiveBalance, config.dailyLossLimit);
      const totalDD = checkTotalDrawdown(startingBalance, effectiveBalance, config.totalLossLimit);

      if (dailyLoss.breached) {
        closePosition(currentPrice, 'rule-violation');
        addViolation('Daily Loss Limit', `Daily loss of ${(dailyLoss.currentLoss * 100).toFixed(1)}% exceeded ${(config.dailyLossLimit * 100)}% limit`);
        failChallenge('Daily loss limit breached');
        return;
      }

      if (totalDD.breached) {
        closePosition(currentPrice, 'rule-violation');
        addViolation('Total Drawdown', `Drawdown of ${(totalDD.currentDrawdown * 100).toFixed(1)}% exceeded ${(config.totalLossLimit * 100)}% limit`);
        failChallenge('Total drawdown limit breached');
        return;
      }
    }

    // 5. Equity curve (throttled: 1 point per 30 seconds)
    const now = Date.now();
    if (now - lastEquityPointRef.current > 30000) {
      const effectiveBalance = currentBalance + (activePosition?.unrealizedPnl ?? 0);
      addEquityPoint(effectiveBalance);
      lastEquityPointRef.current = now;
    }

    // 6. Check max trading days
    if (startDate) {
      const daysCheck = checkMaxTradingDays(startDate, config.maxTradingDays);
      if (daysCheck.exceeded) {
        if (activePosition) {
          closePosition(currentPrice, 'rule-violation');
        }
        addViolation('Max Trading Days', `Challenge exceeded ${config.maxTradingDays} day limit`);
        failChallenge('Maximum trading days exceeded');
        return;
      }
    }

    // 7. Check if challenge can be passed (only after trades exist and no position open)
    if (!activePosition && trades.length > 0) {
      const consistency = calculateConsistencyScore(trades);
      const emotional = calculateEmotionalScore(trades);
      const evaluation = evaluateChallenge(
        currentBalance,
        startingBalance,
        tradingDays.length,
        config,
        consistency,
        emotional
      );
      if (evaluation.canPass) {
        passChallenge();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [btcTicker]);

  // Daily reset interval (check every 60 seconds)
  useEffect(() => {
    if (status !== 'active') return;
    const interval = setInterval(checkDailyReset, 60000);
    return () => clearInterval(interval);
  }, [status, checkDailyReset]);

  return (
    <div className="max-w-[1900px] mx-auto px-8 py-8">
      <div className="grid grid-cols-12 gap-5">
        {/* Row 1: Challenge Header */}
        <ChallengeHeader />

        {/* Row 2: Price + Trade + Position */}
        <PriceDisplay />
        <TradePanel />
        <PositionCard />

        {/* Row 3: Equity + Evaluation */}
        <EquityCurve />
        <EvaluationMetrics />

        {/* Row 4: History + Violations */}
        <TradeHistory />
        <ViolationsLog />
      </div>
    </div>
  );
}
```

**Step 2: Verify dashboard loads when challenge is started**

Run: `npm run dev`, navigate to `/simulator`, click Start Challenge. Verify all panels render and live price appears.

**Step 3: Commit**

```bash
git add components/simulator/SimulatorDashboard.tsx
git commit -m "feat(simulator): wire SimulatorDashboard with tick loop and all panels"
```

---

### Task 11: EvaluationReport — Full PASS/FAIL Report

**Files:**
- Modify: `components/simulator/EvaluationReport.tsx` (replace placeholder)

**Step 1: Build the full report**

```typescript
'use client';

import { useSimulatorStore } from '@/store/useSimulatorStore';
import {
  calculateConsistencyScore,
  calculateEmotionalScore,
  calculateRiskScore,
  calculateDisciplineScore,
} from '@/lib/simulator-evaluation';
import { EquityCurve } from './EquityCurve';
import Link from 'next/link';

function ScoreCard({ label, score, description }: { label: string; score: number; description: string }) {
  const getColor = (s: number) => {
    if (s >= 80) return '#c4f82e';
    if (s >= 60) return '#00F0FF';
    if (s >= 40) return '#FFA500';
    return '#ff4757';
  };
  const color = getColor(score);

  return (
    <div className="bento-item col-span-6 lg:col-span-3">
      <span className="text-xs text-white/40 uppercase tracking-wider">{label}</span>
      <div className="flex items-end gap-2 mt-3">
        <span className="text-4xl font-bold font-mono" style={{ color }}>{score}</span>
        <span className="text-sm text-white/20 mb-1">/ 100</span>
      </div>
      <div className="mt-3 h-2 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
      <p className="text-xs text-white/30 mt-3">{description}</p>
    </div>
  );
}

export function EvaluationReport() {
  const status = useSimulatorStore((s) => s.status);
  const config = useSimulatorStore((s) => s.config);
  const startDate = useSimulatorStore((s) => s.startDate);
  const startingBalance = useSimulatorStore((s) => s.startingBalance);
  const currentBalance = useSimulatorStore((s) => s.currentBalance);
  const trades = useSimulatorStore((s) => s.trades);
  const tradingDays = useSimulatorStore((s) => s.tradingDays);
  const violations = useSimulatorStore((s) => s.violations);
  const failReason = useSimulatorStore((s) => s.failReason);
  const resetChallenge = useSimulatorStore((s) => s.resetChallenge);

  const passed = status === 'passed';
  const pnl = currentBalance - startingBalance;
  const pnlPercent = (pnl / startingBalance) * 100;

  // Scores
  const consistency = calculateConsistencyScore(trades);
  const emotional = calculateEmotionalScore(trades);
  const risk = calculateRiskScore(trades, config);
  const discipline = calculateDisciplineScore(trades, 0, false, tradingDays.length, config.minTradingDays, !passed);
  const overallScore = Math.round((consistency + emotional + risk + discipline) / 4);

  // Stats
  const winningTrades = trades.filter((t) => t.pnl > 0);
  const losingTrades = trades.filter((t) => t.pnl < 0);
  const winRate = trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0;
  const avgWin = winningTrades.length > 0 ? winningTrades.reduce((s, t) => s + t.pnl, 0) / winningTrades.length : 0;
  const avgLoss = losingTrades.length > 0 ? Math.abs(losingTrades.reduce((s, t) => s + t.pnl, 0) / losingTrades.length) : 0;
  const avgRR = avgLoss > 0 ? avgWin / avgLoss : 0;
  const bestTrade = trades.length > 0 ? Math.max(...trades.map((t) => t.pnl)) : 0;
  const worstTrade = trades.length > 0 ? Math.min(...trades.map((t) => t.pnl)) : 0;

  // Duration
  const durationDays = startDate
    ? Math.ceil((Date.now() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="max-w-[1200px] mx-auto px-8 py-16">
      {/* Hero */}
      <div className="text-center mb-16">
        <div className={`inline-block text-7xl font-bold mb-4 ${
          passed
            ? 'text-[#c4f82e] drop-shadow-[0_0_40px_rgba(196,248,46,0.4)]'
            : 'text-[#ff4757] drop-shadow-[0_0_40px_rgba(255,71,87,0.4)]'
        }`}>
          {passed ? 'PASSED' : 'FAILED'}
        </div>
        <p className="text-white/40 text-sm">
          ${(config.accountSize / 1000).toFixed(0)}K Account · {config.challengeType} Challenge · {config.tradingStyle}
        </p>
        <p className="text-white/30 text-xs mt-2">
          {passed ? `Completed in ${durationDays} days` : `Failed on day ${durationDays}`}
          {failReason && ` — ${failReason}`}
        </p>
      </div>

      {/* Overall Score */}
      <div className="text-center mb-12">
        <div className="inline-flex flex-col items-center">
          <svg width="160" height="160" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
            <circle
              cx="80" cy="80" r="70" fill="none"
              stroke={passed ? '#c4f82e' : '#ff4757'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${overallScore * 4.4} ${440 - overallScore * 4.4}`}
              strokeDashoffset="110"
              className="transition-all duration-1000"
            />
            <text x="80" y="75" textAnchor="middle" fill="white" fontSize="36" fontWeight="bold" fontFamily="monospace">
              {overallScore}
            </text>
            <text x="80" y="100" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="12">
              OVERALL
            </text>
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5">
        {/* Score Cards */}
        <ScoreCard label="Risk Management" score={risk} description="Position sizing discipline and SL usage" />
        <ScoreCard label="Discipline" score={discipline} description="Adherence to challenge rules" />
        <ScoreCard label="Emotional Stability" score={emotional} description="Revenge trading and overtrading control" />
        <ScoreCard label="Consistency" score={consistency} description="Profit distribution and daily P&L stability" />

        {/* Equity Curve */}
        <EquityCurve />
        {/* Note: EquityCurve is col-span-12 lg:col-span-6, we need it full-width here */}

        {/* Stats Summary */}
        <div className="bento-item col-span-12 lg:col-span-6">
          <div className="item-header">
            <span className="item-title">Performance Summary</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              ['Total P&L', `${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}`, pnl >= 0],
              ['Return', `${pnlPercent >= 0 ? '+' : ''}${pnlPercent.toFixed(2)}%`, pnlPercent >= 0],
              ['Total Trades', `${trades.length}`, true],
              ['Win Rate', `${winRate.toFixed(1)}%`, winRate >= 50],
              ['Avg R:R', `${avgRR.toFixed(2)}`, avgRR >= 1],
              ['Best Trade', `+$${bestTrade.toFixed(2)}`, true],
              ['Worst Trade', `-$${Math.abs(worstTrade).toFixed(2)}`, false],
              ['Trading Days', `${tradingDays.length}`, true],
            ].map(([label, value, positive]) => (
              <div key={label as string} className="flex justify-between py-2 border-b border-white/5">
                <span className="text-white/40">{label}</span>
                <span className={`font-mono font-bold ${positive ? 'text-[#c4f82e]' : 'text-[#ff4757]'}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Trade History */}
        <div className="bento-item col-span-12">
          <div className="item-header">
            <span className="item-title">All Trades</span>
          </div>
          {trades.length === 0 ? (
            <p className="text-white/20 text-sm text-center py-4">No trades recorded</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-white/30 uppercase tracking-wider border-b border-white/5">
                    <th className="py-2 text-left">#</th>
                    <th className="py-2 text-left">Direction</th>
                    <th className="py-2 text-right">Entry</th>
                    <th className="py-2 text-right">Exit</th>
                    <th className="py-2 text-right">Size</th>
                    <th className="py-2 text-right">P&L</th>
                    <th className="py-2 text-right">P&L%</th>
                    <th className="py-2 text-left">Close Reason</th>
                    <th className="py-2 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.map((trade, i) => (
                    <tr key={trade.id} className="border-b border-white/[0.03]">
                      <td className="py-2 font-mono text-white/40">{i + 1}</td>
                      <td className={`py-2 font-bold ${trade.direction === 'long' ? 'text-[#c4f82e]' : 'text-[#ff4757]'}`}>
                        {trade.direction.toUpperCase()}
                      </td>
                      <td className="py-2 text-right font-mono text-white/70">${trade.entryPrice.toLocaleString()}</td>
                      <td className="py-2 text-right font-mono text-white/70">${trade.exitPrice.toLocaleString()}</td>
                      <td className="py-2 text-right font-mono text-white/70">${trade.size.toLocaleString()}</td>
                      <td className={`py-2 text-right font-mono font-bold ${trade.pnl >= 0 ? 'text-[#c4f82e]' : 'text-[#ff4757]'}`}>
                        {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)}
                      </td>
                      <td className={`py-2 text-right font-mono ${trade.pnlPercent >= 0 ? 'text-[#c4f82e]/70' : 'text-[#ff4757]/70'}`}>
                        {(trade.pnlPercent * 100).toFixed(2)}%
                      </td>
                      <td className="py-2 text-white/40">{trade.closeReason}</td>
                      <td className="py-2 text-white/30 font-mono">{new Date(trade.closedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Violations */}
        {violations.length > 0 && (
          <div className="bento-item col-span-12">
            <div className="item-header">
              <span className="item-title">Violations Log</span>
              <span className="text-xs font-bold text-[#ff4757] bg-[#ff4757]/10 px-2 py-1 rounded-full">{violations.length}</span>
            </div>
            <div className="flex flex-col gap-2">
              {violations.map((v, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-white/[0.03]">
                  <div>
                    <span className="text-xs font-bold text-[#ff4757]">{v.type}</span>
                    <p className="text-xs text-white/40">{v.message}</p>
                  </div>
                  <span className="text-[10px] text-white/20 font-mono">{new Date(v.timestamp).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-4 mt-12 justify-center">
        <button
          onClick={resetChallenge}
          className="px-8 py-4 rounded-2xl bg-[#c4f82e] text-black font-bold text-sm hover:bg-[#d4ff4e] transition-all shadow-lg shadow-[#c4f82e]/20 active:scale-[0.98]"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="px-8 py-4 rounded-2xl bg-white/[0.05] border border-white/[0.1] text-white/60 font-bold text-sm hover:text-white hover:border-white/20 transition-all active:scale-[0.98]"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add components/simulator/EvaluationReport.tsx
git commit -m "feat(simulator): build full EvaluationReport with scores and trade breakdown"
```

---

### Task 12: Add Simulator Link to Main Site

**Files:**
- Modify: `components/SectionNav.tsx`

**Step 1: Add Simulator link to SectionNav**

Add a special "Simulator" entry that navigates to `/simulator` instead of scrolling.

In `SectionNav.tsx`, add after the existing SECTIONS array and update the render to include a link:

After the `{SECTIONS.map(...)}` block, before the closing `</div>`, add:

```typescript
<a
  href="/simulator"
  className="px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all duration-300 text-[#c4f82e] border border-[#c4f82e]/20 hover:bg-[#c4f82e]/10 hover:border-[#c4f82e]/40 ml-auto"
>
  Challenge Simulator
</a>
```

**Step 2: Commit**

```bash
git add components/SectionNav.tsx
git commit -m "feat(simulator): add Challenge Simulator link to SectionNav"
```

---

### Task 13: Final Build Verification

**Step 1: Run the linter**

Run: `npm run lint`
Fix any issues.

**Step 2: Run production build**

Run: `npm run build`
Fix any type errors or build issues.

**Step 3: Manual smoke test**

1. Navigate to `http://localhost:3000` — verify SectionNav has "Challenge Simulator" link
2. Click it — should go to `/simulator` with setup screen
3. Select account size, challenge type, click "Start Challenge"
4. Verify live BTC price appears in PriceDisplay
5. Open a Long trade with SL and size — verify risk check works
6. Verify position appears in PositionCard with live P&L
7. Close position — verify it appears in TradeHistory
8. Verify evaluation scores update

**Step 4: Commit any fixes**

```bash
git add -A
git commit -m "fix(simulator): resolve build and lint issues"
```
