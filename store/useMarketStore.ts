import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface BTCTicker {
  price: string;
  priceChange: string;
  priceChangePercent: string;
  prevPrice: string;
}

interface Liquidation {
  id: string;
  symbol: string;
  side: string;
  price: string;
  qty: string;
  time: number;
  value: number;
}

interface MarketStore {
  // BTC Price
  btcTicker: BTCTicker | null;
  setBtcTicker: (ticker: BTCTicker | ((prev: BTCTicker | null) => BTCTicker)) => void;

  // Liquidations
  liquidations: Liquidation[];
  addLiquidation: (liquidation: Liquidation) => void;
  removeLiquidation: (id: string) => void;

  // Fear & Greed
  fearGreedIndex: number | null;
  fearGreedValue: string | null;
  setFearGreed: (index: number, value: string) => void;

  // Long/Short Ratio
  longShortRatio: { long: number; short: number } | null;
  setLongShortRatio: (long: number, short: number) => void;

  // Funding Rates
  fundingRates: Array<{
    symbol: string;
    rate: string;
    bias: string;
  }>;
  setFundingRates: (rates: Array<{ symbol: string; rate: string; bias: string }>) => void;

  // Market Data
  marketData: Array<{
    id: string;
    symbol: string;
    name?: string;
    current_price: number;
    price_change_percentage_24h: number;
    market_cap?: number;
  }>;
  setMarketData: (data: Array<{
    id: string;
    symbol: string;
    name?: string;
    current_price: number;
    price_change_percentage_24h: number;
    market_cap?: number;
  }>) => void;

  // Dominance
  dominance: { btc: number; eth: number; others: number } | null;
  setDominance: (btc: number, eth: number, others: number) => void;
}

export const useMarketStore = create<MarketStore>()(
  subscribeWithSelector((set) => ({
    // BTC Price
    btcTicker: null,
    setBtcTicker: (ticker) => set((state) => ({
      btcTicker: typeof ticker === 'function' ? ticker(state.btcTicker) : ticker
    })),

    // Liquidations
    liquidations: [],
    addLiquidation: (liquidation) =>
      set((state) => ({
        liquidations: [...state.liquidations, liquidation].slice(-50), // Keep last 50
      })),
    removeLiquidation: (id) =>
      set((state) => ({
        liquidations: state.liquidations.filter((l) => l.id !== id),
      })),

    // Fear & Greed
    fearGreedIndex: null,
    fearGreedValue: null,
    setFearGreed: (index, value) =>
      set({ fearGreedIndex: index, fearGreedValue: value }),

    // Long/Short Ratio
    longShortRatio: null,
    setLongShortRatio: (long, short) =>
      set({ longShortRatio: { long, short } }),

    // Funding Rates
    fundingRates: [],
    setFundingRates: (rates) => set({ fundingRates: rates }),

    // Market Data
    marketData: [],
    setMarketData: (data) => set({ marketData: data }),

    // Dominance
    dominance: null,
    setDominance: (btc, eth, others) =>
      set({ dominance: { btc, eth, others } }),
  }))
);
