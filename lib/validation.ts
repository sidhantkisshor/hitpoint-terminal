import { z } from 'zod';

// WebSocket BTC Ticker validation
export const BTCTickerSchema = z.object({
  c: z.string(), // Current price
  p: z.string(), // Price change
  P: z.string(), // Price change percent
});

export type BTCTickerData = z.infer<typeof BTCTickerSchema>;

// Binance REST API validation
export const BinanceTickerSchema = z.object({
  lastPrice: z.string(),
  priceChange: z.string(),
  priceChangePercent: z.string(),
});

export type BinanceTickerData = z.infer<typeof BinanceTickerSchema>;

// Fear & Greed Index validation
export const FearGreedSchema = z.object({
  data: z.array(
    z.object({
      value: z.string(),
      value_classification: z.string(),
    })
  ).min(1),
});

export type FearGreedData = z.infer<typeof FearGreedSchema>;

// CoinGecko Market Data validation
export const CoinGeckoMarketSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  name: z.string().optional(),
  current_price: z.number(),
  price_change_percentage_24h: z.number(),
  market_cap: z.number().optional(),
});

export const CoinGeckoMarketsSchema = z.array(CoinGeckoMarketSchema);

export type CoinGeckoMarketData = z.infer<typeof CoinGeckoMarketSchema>;

// CoinGecko Global Data validation
export const CoinGeckoGlobalSchema = z.object({
  data: z.object({
    market_cap_percentage: z.object({
      btc: z.number(),
      eth: z.number(),
    }),
  }),
});

export type CoinGeckoGlobalData = z.infer<typeof CoinGeckoGlobalSchema>;

// Bybit Long/Short Ratio validation
export const BybitRatioSchema = z.object({
  retCode: z.number(),
  result: z.object({
    list: z.array(
      z.object({
        buyRatio: z.string(),
        sellRatio: z.string(),
      })
    ),
  }),
});

export type BybitRatioData = z.infer<typeof BybitRatioSchema>;

// Binance Funding Rate validation
export const BinanceFundingRateSchema = z.array(
  z.object({
    fundingRate: z.string(),
  })
);

export type BinanceFundingRateData = z.infer<typeof BinanceFundingRateSchema>;

// Helper function to safely parse and validate data
export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Unknown validation error' };
  }
}
