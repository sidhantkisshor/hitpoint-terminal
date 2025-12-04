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

        if (!response.ok) {
          throw new Error('Failed to fetch Fear & Greed Index');
        }

        const rawData = await response.json();

        // Validate API response
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

      <div className="flex items-center justify-between h-full gap-6">
        <div className="relative w-32 h-32 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke="#1a1a1a"
              strokeWidth="12"
            />
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke={getColor(fearGreedIndex)}
              strokeWidth="12"
              strokeDasharray={`${((fearGreedIndex || 0) / 100) * 439.82} 439.82`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="text-4xl font-bold font-mono"
              style={{ color: getColor(fearGreedIndex) }}
            >
              {fearGreedIndex || '--'}
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="text-2xl font-bold uppercase tracking-wide mb-2" style={{ color: getColor(fearGreedIndex) }}>
            {fearGreedValue || 'Loading...'}
          </div>
          <div className="text-sm text-gray-500">Market Sentiment</div>
        </div>
      </div>
    </div>
  );
}
