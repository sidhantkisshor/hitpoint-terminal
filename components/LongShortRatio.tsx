'use client';

import { useEffect } from 'react';
import { useMarketStore } from '@/store/useMarketStore';

export function LongShortRatio() {
  const longShortRatio = useMarketStore((state) => state.longShortRatio);
  const setLongShortRatio = useMarketStore((state) => state.setLongShortRatio);

  useEffect(() => {
    const fetchRatio = async () => {
      try {
        const response = await fetch(
          'https://api.bybit.com/v5/market/account-ratio?category=linear&symbol=BTCUSDT&period=5min'
        );

        if (!response.ok) {
          throw new Error('Failed to fetch Long/Short Ratio');
        }

        const data = await response.json();

        if (data?.retCode === 0 && data?.result?.list?.length > 0) {
          const latest = data.result.list[0];

          if (latest?.buyRatio && latest?.sellRatio) {
            const buyRatio = parseFloat(latest.buyRatio) * 100;
            const sellRatio = parseFloat(latest.sellRatio) * 100;

            if (!isNaN(buyRatio) && !isNaN(sellRatio)) {
              setLongShortRatio(buyRatio, sellRatio);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching Long/Short Ratio:', error);
      }
    };

    fetchRatio();
    const interval = setInterval(fetchRatio, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [setLongShortRatio]);

  const longPercent = longShortRatio?.long || 50;
  const shortPercent = longShortRatio?.short || 50;

  return (
    <div className="bento-item col-span-12 md:col-span-6 lg:col-span-4 row-span-1">
      <div className="item-header">
        <span className="item-title">LONG/SHORT RATIO</span>
        <div className="live-indicator">
          <span className="live-dot"></span>
          <span>LIVE</span>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between text-base font-mono font-bold">
          <span className="text-[#c4f82e]">{longPercent.toFixed(1)}% Long</span>
          <span className="text-[#ff4757]">{shortPercent.toFixed(1)}% Short</span>
        </div>

        <div className="relative h-4 bg-black/60 rounded-full overflow-hidden">
          <div className="absolute inset-0 flex">
            <div
              className="bg-gradient-to-r from-[#c4f82e] to-[#a8e024] transition-all duration-700 ease-out relative"
              style={{
                width: `${longPercent}%`,
                boxShadow: '0 0 20px rgba(196, 248, 46, 0.6), inset 0 0 10px rgba(196, 248, 46, 0.3)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20"></div>
            </div>
            <div
              className="bg-gradient-to-r from-[#ff6b7a] to-[#ff4757] transition-all duration-700 ease-out relative"
              style={{
                width: `${shortPercent}%`,
                boxShadow: '0 0 20px rgba(255, 71, 87, 0.5), inset 0 0 10px rgba(255, 71, 87, 0.3)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20"></div>
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-400 font-medium">
          {longPercent > 60 ? 'Strong bullish sentiment' : shortPercent > 60 ? 'Strong bearish sentiment' : 'Balanced market sentiment'}
        </div>
      </div>
    </div>
  );
}
