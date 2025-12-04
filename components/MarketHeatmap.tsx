'use client';

import { useEffect, useState } from 'react';
import { useMarketStore } from '@/store/useMarketStore';
import { BybitRatioSchema, safeValidate } from '@/lib/validation';
import { logger } from '@/lib/logger';

export function MarketHeatmap() {
  const marketData = useMarketStore((state) => state.marketData);
  const setMarketData = useMarketStore((state) => state.setMarketData);
  const longShortRatio = useMarketStore((state) => state.longShortRatio);
  const setLongShortRatio = useMarketStore((state) => state.setLongShortRatio);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setError(null);
        const response = await fetch('/api/coingecko/markets');

        if (!response.ok) {
          throw new Error(`Failed to fetch market data: ${response.status}`);
        }

        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
          setMarketData(data);
        } else {
          throw new Error('Invalid market data format');
        }
      } catch (error) {
        logger.error('Error fetching market data:', error);
        setError('Unable to load market data');
      }
    };

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 60 * 1000);

    return () => clearInterval(interval);
  }, [setMarketData]);

  useEffect(() => {
    const fetchRatio = async () => {
      try {
        const response = await fetch(
          'https://api.bybit.com/v5/market/account-ratio?category=linear&symbol=BTCUSDT&period=5min',
          {
            headers: {
              'Accept': 'application/json',
            },
          }
        );

        if (!response.ok) {
          logger.warn(`Bybit API returned ${response.status}`);
          return;
        }

        const rawData = await response.json();

        // Validate Bybit API response
        const validation = safeValidate(BybitRatioSchema, rawData);
        if (!validation.success) {
          logger.error('Invalid Bybit ratio data:', validation.error);
          return;
        }

        const data = validation.data;
        if (data.retCode === 0 && data.result.list.length > 0) {
          const latest = data.result.list[0];
          const buyRatio = parseFloat(latest.buyRatio) * 100;
          const sellRatio = parseFloat(latest.sellRatio) * 100;

          if (!isNaN(buyRatio) && !isNaN(sellRatio)) {
            setLongShortRatio(buyRatio, sellRatio);
          }
        }
      } catch (error) {
        logger.error('Error fetching Long/Short Ratio:', error);
      }
    };

    fetchRatio();
    const interval = setInterval(fetchRatio, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [setLongShortRatio]);

  const longPercent = longShortRatio?.long || 50;
  const shortPercent = longShortRatio?.short || 50;

  const getColorClass = (change: number) => {
    if (change > 5) return 'bg-[#c4f82e]/12 border-[#c4f82e]/25 text-[#c4f82e] shadow-lg shadow-[#c4f82e]/15';
    if (change > 2) return 'bg-[#c4f82e]/8 border-[#c4f82e]/20 text-[#c4f82e]';
    if (change > 0) return 'bg-[#c4f82e]/5 border-[#c4f82e]/12 text-[#a8e024]';
    if (change > -2) return 'bg-[#ff4757]/5 border-[#ff4757]/12 text-[#ff4757]/90';
    if (change > -5) return 'bg-[#ff4757]/8 border-[#ff4757]/20 text-[#ff4757]';
    return 'bg-[#ff4757]/12 border-[#ff4757]/25 text-[#ff4757] shadow-lg shadow-[#ff4757]/15';
  };

  return (
    <div className="bento-item col-span-12 lg:col-span-8 row-span-1">
      <div className="item-header">
        <span className="item-title">MARKET OVERVIEW</span>
        <div className="live-indicator">
          <span className="live-dot"></span>
          <span>LIVE</span>
        </div>
      </div>

      <div className="space-y-4">
        {error && (
          <div className="text-center text-red-400 text-sm py-4 bg-red-500/10 rounded-lg border border-red-500/20">
            {error}
          </div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {marketData.length > 0 ? (
            marketData.map((coin) => (
              <div
                key={coin.id}
                className={`border rounded-xl p-4 hover:bg-white/5 transition-all duration-300 ${getColorClass(
                  coin.price_change_percentage_24h
                )}`}
              >
                <div className="text-xs font-semibold uppercase mb-2 tracking-wide opacity-70">
                  {coin.symbol}
                </div>
                <div className="text-2xl font-bold font-mono mb-2">
                  {coin.price_change_percentage_24h >= 0 ? '+' : ''}
                  {coin.price_change_percentage_24h.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500 font-mono">
                  ${coin.current_price > 1 ? coin.current_price.toLocaleString(undefined, {maximumFractionDigits: 0}) : coin.current_price.toFixed(4)}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-5 text-center text-gray-600 py-12">Loading...</div>
          )}
        </div>

        {/* Long/Short Ratio Section */}
        <div className="border-t border-white/5 pt-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Long/Short Ratio</span>
            <div className="flex gap-4 text-sm font-mono font-bold">
              <span className="text-[#c4f82e]">{longPercent.toFixed(1)}% L</span>
              <span className="text-[#ff4757]">{shortPercent.toFixed(1)}% S</span>
            </div>
          </div>

          <div className="relative h-3 bg-black/60 rounded-full overflow-hidden">
            <div className="absolute inset-0 flex">
              <div
                className="bg-gradient-to-r from-[#c4f82e] to-[#a8e024] transition-all duration-700 ease-out relative"
                style={{
                  width: `${longPercent}%`,
                  boxShadow: '0 0 15px rgba(196, 248, 46, 0.5), inset 0 0 8px rgba(196, 248, 46, 0.3)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20"></div>
              </div>
              <div
                className="bg-gradient-to-r from-[#ff6b7a] to-[#ff4757] transition-all duration-700 ease-out relative"
                style={{
                  width: `${shortPercent}%`,
                  boxShadow: '0 0 15px rgba(255, 71, 87, 0.4), inset 0 0 8px rgba(255, 71, 87, 0.3)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20"></div>
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-400 font-medium mt-2">
            {longPercent > 60 ? 'Strong bullish sentiment' : shortPercent > 60 ? 'Strong bearish sentiment' : 'Balanced market sentiment'}
          </div>
        </div>
      </div>
    </div>
  );
}
