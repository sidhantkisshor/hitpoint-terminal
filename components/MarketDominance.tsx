'use client';

import { useEffect } from 'react';
import { useMarketStore } from '@/store/useMarketStore';

export function MarketDominance() {
  const dominance = useMarketStore((state) => state.dominance);
  const setDominance = useMarketStore((state) => state.setDominance);

  useEffect(() => {
    const fetchDominance = async () => {
      try {
        const response = await fetch('/api/coingecko/global');

        if (!response.ok) {
          throw new Error('Failed to fetch dominance data');
        }

        const data = await response.json();

        if (data?.data?.market_cap_percentage?.btc && data?.data?.market_cap_percentage?.eth) {
          const btcDom = data.data.market_cap_percentage.btc;
          const ethDom = data.data.market_cap_percentage.eth;
          const others = 100 - btcDom - ethDom;

          setDominance(btcDom, ethDom, others);
        }
      } catch (error) {
        console.error('Error fetching dominance:', error);
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

      <div className="space-y-5">
        <div className="flex justify-around text-center">
          <div>
            <div className="text-4xl font-bold font-mono text-[#c4f82e]">
              {dominance?.btc.toFixed(1) || '--'}%
            </div>
            <div className="text-sm text-gray-500 mt-2 font-medium">BTC</div>
          </div>
          <div>
            <div className="text-4xl font-bold font-mono text-[#5b9dff]">
              {dominance?.eth.toFixed(1) || '--'}%
            </div>
            <div className="text-sm text-gray-500 mt-2 font-medium">ETH</div>
          </div>
          <div>
            <div className="text-4xl font-bold font-mono text-gray-400">
              {dominance?.others.toFixed(1) || '--'}%
            </div>
            <div className="text-sm text-gray-500 mt-2 font-medium">OTHERS</div>
          </div>
        </div>

        <div className="relative h-4 bg-black/60 rounded-full overflow-hidden">
          <div className="absolute inset-0 flex">
            <div
              className="bg-gradient-to-r from-[#c4f82e] to-[#a8e024] transition-all duration-700 ease-out relative"
              style={{
                width: `${dominance?.btc || 0}%`,
                boxShadow: '0 0 20px rgba(196, 248, 46, 0.6), inset 0 0 10px rgba(196, 248, 46, 0.3)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20"></div>
            </div>
            <div
              className="bg-gradient-to-r from-[#5b9dff] to-[#3a7be0] transition-all duration-700 ease-out relative"
              style={{
                width: `${dominance?.eth || 0}%`,
                boxShadow: '0 0 16px rgba(90, 157, 255, 0.4), inset 0 0 8px rgba(90, 157, 255, 0.3)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20"></div>
            </div>
            <div
              className="bg-gradient-to-r from-gray-600 to-gray-500 transition-all duration-700 ease-out relative"
              style={{
                width: `${dominance?.others || 0}%`,
                boxShadow: '0 0 12px rgba(120, 120, 120, 0.3), inset 0 0 6px rgba(120, 120, 120, 0.2)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/15"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
