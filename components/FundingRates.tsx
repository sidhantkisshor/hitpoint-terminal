'use client';

import { useEffect } from 'react';
import { useMarketStore } from '@/store/useMarketStore';
import { BinanceFundingRateSchema, safeValidate } from '@/lib/validation';
import { logger } from '@/lib/logger';

export function FundingRates() {
  const fundingRates = useMarketStore((state) => state.fundingRates);
  const setFundingRates = useMarketStore((state) => state.setFundingRates);

  useEffect(() => {
    const fetchFundingRates = async () => {
      const symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'XRPUSDT'];

      try {
        const promises = symbols.map(async (symbol) => {
          try {
            const response = await fetch(
              `https://fapi.binance.com/fapi/v1/fundingRate?symbol=${symbol}&limit=1`
            );
            if (!response.ok) throw new Error(`Failed to fetch funding rate for ${symbol}`);

            const rawData = await response.json();
            const validation = safeValidate(BinanceFundingRateSchema, rawData);
            if (!validation.success) {
              logger.error(`Invalid funding rate data for ${symbol}:`, validation.error);
              return null;
            }

            const data = validation.data;
            if (data.length > 0) {
              const rate = parseFloat(data[0].fundingRate) * 100;
              if (!isNaN(rate)) {
                const bias = rate > 0.01 ? 'BULLISH' : rate < 0 ? 'BEARISH' : 'NEUTRAL';
                return { symbol: symbol.replace('USDT', ''), rate: rate.toFixed(4) + '%', bias };
              }
            }
            return null;
          } catch (error) {
            logger.error(`Error fetching funding rate for ${symbol}:`, error);
            return null;
          }
        });

        const results = await Promise.all(promises);
        const validRates = results.filter((rate): rate is { symbol: string; rate: string; bias: string } => rate !== null);
        if (validRates.length > 0) setFundingRates(validRates);
      } catch (error) {
        logger.error('Error fetching funding rates:', error);
      }
    };

    fetchFundingRates();
    const interval = setInterval(fetchFundingRates, 8 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [setFundingRates]);

  return (
    <div className="bento-item col-span-12 md:col-span-6 lg:col-span-3 row-span-1">
      <div className="item-header">
        <span className="item-title">FUNDING RATES</span>
        <div className="live-indicator">
          <span className="live-dot"></span>
          <span>LIVE</span>
        </div>
      </div>

      <div className="overflow-x-auto h-full flex flex-col">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.04]">
              <th className="text-left py-2.5 text-[10px] sm:text-xs text-[#5a5a5a] font-display font-semibold uppercase tracking-wide">Asset</th>
              <th className="text-right py-2.5 text-[10px] sm:text-xs text-[#5a5a5a] font-display font-semibold uppercase tracking-wide">Rate</th>
              <th className="text-right py-2.5 text-[10px] sm:text-xs text-[#5a5a5a] font-display font-semibold uppercase tracking-wide">Bias</th>
            </tr>
          </thead>
          <tbody>
            {fundingRates.length > 0 ? (
              fundingRates.map((item, index) => (
                <tr key={index} className="border-t border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 font-medium text-sm sm:text-base">{item.symbol}</td>
                  <td
                    className={`py-4 font-mono text-right font-semibold text-sm sm:text-base ${
                      item.bias === 'BULLISH' ? 'text-[#c4f82e]' : item.bias === 'BEARISH' ? 'text-[#ff4757]' : 'text-gray-400'
                    }`}
                  >
                    {item.rate}
                  </td>
                  <td
                    className={`py-4 text-right text-xs sm:text-sm font-semibold ${
                      item.bias === 'BULLISH' ? 'text-[#c4f82e]' : item.bias === 'BEARISH' ? 'text-[#ff4757]' : 'text-gray-400'
                    }`}
                  >
                    {item.bias}
                  </td>
                </tr>
              ))
            ) : (
              <>
                {[1, 2, 3, 4].map((i) => (
                  <tr key={i} className="border-t border-white/[0.03]">
                    <td className="py-4"><div className="skeleton h-5 w-12" /></td>
                    <td className="py-4"><div className="skeleton h-5 w-16 ml-auto" /></td>
                    <td className="py-4"><div className="skeleton h-5 w-14 ml-auto" /></td>
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
