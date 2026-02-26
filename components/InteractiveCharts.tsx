'use client';

import { useEffect, useRef } from 'react';

const CHARTS = [
  { symbol: 'BINANCE:BTCUSDT', label: 'Bitcoin' },
  { symbol: 'BINANCE:ETHUSDT', label: 'Ethereum' },
  { symbol: 'TVC:GOLD', label: 'Gold' },
  { symbol: 'AMEX:SPY', label: 'S&P 500 (SPY)' },
];

function TradingViewChart({ symbol, label }: { symbol: string; label: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loadedRef.current) {
          loadedRef.current = true;
          const iframe = document.createElement('iframe');
          iframe.src = `https://s.tradingview.com/widgetembed/?frameElementId=tv_chart_${symbol}&symbol=${encodeURIComponent(symbol)}&interval=D&hidesidetoolbar=0&symboledit=1&saveimage=0&toolbarbg=f1f3f6&studies=[]&theme=dark&style=1&timezone=Etc%2FUTC&withdateranges=1&showpopupbutton=0&studies_overrides={}&overrides={}&enabled_features=[]&disabled_features=[]&locale=en&utm_source=localhost&utm_medium=widget_new&utm_campaign=chart`;
          iframe.className = 'w-full h-full rounded-xl';
          iframe.style.border = 'none';
          iframe.title = `${label} Chart`;
          iframe.loading = 'lazy';
          iframe.allow = 'encrypted-media';
          containerRef.current?.appendChild(iframe);
          observerRef.current?.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    observerRef.current.observe(containerRef.current);
    return () => observerRef.current?.disconnect();
  }, [symbol, label]);

  return (
    <div className="bento-item scroll-fade-in p-0 overflow-hidden">
      <div className="px-4 sm:px-5 pt-3 sm:pt-4 pb-2">
        <span className="item-title">{label}</span>
      </div>
      <div ref={containerRef} className="w-full h-[280px] sm:h-[340px] lg:h-[380px]" />
    </div>
  );
}

export function InteractiveCharts() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 lg:gap-5">
      {CHARTS.map((chart) => (
        <TradingViewChart key={chart.symbol} symbol={chart.symbol} label={chart.label} />
      ))}
    </div>
  );
}
