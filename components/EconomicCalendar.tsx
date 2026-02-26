'use client';

import { useEffect, useRef } from 'react';

export function EconomicCalendar() {
  const containerRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current || loadedRef.current) return;
    loadedRef.current = true;

    const iframe = document.createElement('iframe');
    iframe.src = 'https://s.tradingview.com/embed-widget/events/?locale=en#%7B%22colorTheme%22%3A%22dark%22%2C%22isTransparent%22%3Atrue%2C%22width%22%3A%22100%25%22%2C%22height%22%3A%22100%25%22%2C%22importanceFilter%22%3A%22-1%2C0%2C1%22%2C%22countryFilter%22%3A%22us%22%7D';
    iframe.className = 'w-full h-full';
    iframe.style.border = 'none';
    iframe.title = 'Economic Calendar';
    iframe.loading = 'lazy';
    iframe.sandbox.add('allow-scripts', 'allow-same-origin', 'allow-popups');
    containerRef.current.appendChild(iframe);
  }, []);

  return (
    <div className="bento-item col-span-12 md:col-span-6 lg:col-span-4 row-span-1">
      <div className="item-header">
        <span className="item-title">ECONOMIC CALENDAR</span>
        <div className="live-indicator">
          <span className="live-dot"></span>
          <span>LIVE</span>
        </div>
      </div>
      <div ref={containerRef} className="min-h-[250px]" style={{ height: 'calc(100% - 3rem)' }} />
    </div>
  );
}
