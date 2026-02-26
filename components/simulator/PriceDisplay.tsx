'use client';

import { useEffect, useRef } from 'react';
import { useMarketStore } from '@/store/useMarketStore';

export function PriceDisplay() {
  const btcTicker = useMarketStore((s) => s.btcTicker);
  const prevPriceRef = useRef<string | null>(null);
  const flashRef = useRef<HTMLSpanElement>(null);

  const price = btcTicker?.price ?? null;
  const isPositive = btcTicker ? parseFloat(btcTicker.priceChangePercent) >= 0 : true;

  useEffect(() => {
    if (price && prevPriceRef.current && price !== prevPriceRef.current) {
      const el = flashRef.current;
      if (el) {
        const isUp = parseFloat(price) > parseFloat(prevPriceRef.current);
        el.style.color = isUp ? '#c4f82e' : '#ff4757';
        setTimeout(() => { el.style.color = ''; }, 300);
      }
    }
    prevPriceRef.current = price;
  }, [price]);

  return (
    <div className="bento-item col-span-12 md:col-span-6 lg:col-span-4">
      <div className="item-header">
        <span className="item-title">BTC / USDT</span>
        <div className="live-indicator">
          <span className="live-dot" />
          <span>LIVE</span>
        </div>
      </div>
      <div className="flex flex-col justify-center h-full gap-3">
        <span
          ref={flashRef}
          className="text-5xl font-bold font-mono tracking-tight text-white transition-colors duration-300"
        >
          ${price ?? '---'}
        </span>
        {btcTicker && (
          <div className="flex items-center gap-3">
            <span className={`text-sm font-bold font-mono px-3 py-1.5 rounded-full border ${
              isPositive
                ? 'text-[#c4f82e] bg-[#c4f82e]/10 border-[#c4f82e]/30'
                : 'text-[#ff4757] bg-[#ff4757]/10 border-[#ff4757]/30'
            }`}>
              {isPositive ? '+' : ''}{btcTicker.priceChangePercent}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}