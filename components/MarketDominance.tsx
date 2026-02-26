'use client';

import { useEffect } from 'react';
import { useMarketStore } from '@/store/useMarketStore';
import { logger } from '@/lib/logger';

export function MarketDominance() {
  const dominance = useMarketStore((state) => state.dominance);
  const setDominance = useMarketStore((state) => state.setDominance);

  useEffect(() => {
    const fetchDominance = async () => {
      try {
        const response = await fetch('/api/coingecko/global');
        if (!response.ok) throw new Error('Failed to fetch dominance data');

        const data = await response.json();

        if (data?.data?.market_cap_percentage?.btc && data?.data?.market_cap_percentage?.eth) {
          const btcDom = data.data.market_cap_percentage.btc;
          const ethDom = data.data.market_cap_percentage.eth;
          const others = 100 - btcDom - ethDom;
          setDominance(btcDom, ethDom, others);
        }
      } catch (error) {
        logger.error('Error fetching dominance:', error);
      }
    };

    fetchDominance();
    const interval = setInterval(fetchDominance, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [setDominance]);

  return (
    <div className="bento-item col-span-12 md:col-span-6 lg:col-span-4 row-span-1">
      <div className="item-header">
        <span className="item-title">DOMINANCE</span>
        <div className="live-indicator">
          <span className="live-dot"></span>
          <span>LIVE</span>
        </div>
      </div>

      {!dominance ? (
        <div className="space-y-5">
          <div className="flex justify-around text-center">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="skeleton h-10 w-16 mx-auto" />
                <div className="skeleton h-4 w-10 mx-auto" />
              </div>
            ))}
          </div>
          <div className="skeleton h-3 w-full rounded-full" />
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex justify-around text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-bold font-mono text-[#c4f82e]">
                {dominance.btc.toFixed(1)}%
              </div>
              <div className="text-xs text-[#5a5a5a] mt-2 font-display font-semibold tracking-wide">BTC</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold font-mono text-[#5b9dff]">
                {dominance.eth.toFixed(1)}%
              </div>
              <div className="text-xs text-[#5a5a5a] mt-2 font-display font-semibold tracking-wide">ETH</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold font-mono text-gray-500">
                {dominance.others.toFixed(1)}%
              </div>
              <div className="text-xs text-[#5a5a5a] mt-2 font-display font-semibold tracking-wide">OTHERS</div>
            </div>
          </div>

          <div className="relative h-3 bg-white/[0.03] rounded-full overflow-hidden">
            <div className="absolute inset-0 flex">
              <div
                className="bg-gradient-to-r from-[#c4f82e] to-[#a8e024] transition-all duration-700 ease-out relative"
                style={{ width: `${dominance.btc}%`, boxShadow: '0 0 16px rgba(196, 248, 46, 0.4)' }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/15"></div>
              </div>
              <div
                className="bg-gradient-to-r from-[#5b9dff] to-[#3a7be0] transition-all duration-700 ease-out relative"
                style={{ width: `${dominance.eth}%`, boxShadow: '0 0 12px rgba(90, 157, 255, 0.3)' }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/15"></div>
              </div>
              <div
                className="bg-gradient-to-r from-gray-600 to-gray-500 transition-all duration-700 ease-out relative"
                style={{ width: `${dominance.others}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
