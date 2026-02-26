'use client';

import { useEffect } from 'react';
import { useMarketStore } from '@/store/useMarketStore';
import { FearGreedSchema, safeValidate } from '@/lib/validation';
import { logger } from '@/lib/logger';

export function FearGreedIndex() {
  const fearGreedIndex = useMarketStore((state) => state.fearGreedIndex);
  const fearGreedValue = useMarketStore((state) => state.fearGreedValue);
  const setFearGreed = useMarketStore((state) => state.setFearGreed);

  useEffect(() => {
    const fetchFearGreed = async () => {
      try {
        const response = await fetch('https://api.alternative.me/fng/');
        if (!response.ok) throw new Error('Failed to fetch Fear & Greed Index');

        const rawData = await response.json();
        const validation = safeValidate(FearGreedSchema, rawData);
        if (!validation.success) {
          logger.error('Invalid Fear & Greed data:', validation.error);
          return;
        }

        const data = validation.data;
        const index = parseInt(data.data[0].value);
        const classification = data.data[0].value_classification;

        if (!isNaN(index) && index >= 0 && index <= 100) {
          setFearGreed(index, classification);
        }
      } catch (error) {
        logger.error('Error fetching Fear & Greed Index:', error);
      }
    };

    fetchFearGreed();
    const interval = setInterval(fetchFearGreed, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [setFearGreed]);

  const getColor = (index: number | null) => {
    if (!index) return '#71717a';
    if (index <= 25) return '#ef4444';
    if (index <= 45) return '#f97316';
    if (index <= 55) return '#eab308';
    if (index <= 75) return '#22c55e';
    return '#8b5cf6';
  };

  return (
    <div className="bento-item col-span-12 md:col-span-6 lg:col-span-4 row-span-1">
      <div className="item-header">
        <span className="item-title">FEAR & GREED</span>
        <div className="live-indicator">
          <span className="live-dot"></span>
          <span>LIVE</span>
        </div>
      </div>

      <div className="flex items-center justify-between h-full gap-4 sm:gap-6">
        {fearGreedIndex === null ? (
          <>
            <div className="skeleton w-28 h-28 sm:w-32 sm:h-32 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="skeleton h-7 w-32" />
              <div className="skeleton h-4 w-24" />
            </div>
          </>
        ) : (
          <>
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex-shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="10" />
                <circle
                  cx="80" cy="80" r="70" fill="none"
                  stroke={getColor(fearGreedIndex)}
                  strokeWidth="10"
                  strokeDasharray={`${((fearGreedIndex || 0) / 100) * 439.82} 439.82`}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dasharray 1s cubic-bezier(0.19, 1, 0.22, 1)' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-3xl sm:text-4xl font-bold font-mono" style={{ color: getColor(fearGreedIndex) }}>
                  {fearGreedIndex}
                </div>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-xl sm:text-2xl font-display font-bold uppercase tracking-wide mb-1" style={{ color: getColor(fearGreedIndex) }}>
                {fearGreedValue || 'Loading...'}
              </div>
              <div className="text-xs sm:text-sm text-[#5a5a5a]">Market Sentiment</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
