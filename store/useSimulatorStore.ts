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
  profitTarget: number;
  dailyLossLimit: number;
  totalLossLimit: number;
  maxRiskPerTrade: number;
  minTradingDays: number;
  maxTradingDays: number;
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
  tradingDays: string[];
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

        const pnlPercent = pnl / startingBalance;
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
