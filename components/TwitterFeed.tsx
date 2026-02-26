'use client';

import { useEffect, useRef, useState } from 'react';

export function TwitterFeed() {
  const containerRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  useEffect(() => {
    if (!containerRef.current || loadedRef.current) return;
    loadedRef.current = true;

    const anchor = document.createElement('a');
    anchor.className = 'twitter-timeline';
    anchor.setAttribute('data-theme', 'dark');
    anchor.setAttribute('data-chrome', 'noheader nofooter noborders transparent');
    anchor.setAttribute('data-height', '480');
    anchor.href = 'https://twitter.com/tradingwsidhant';
    anchor.textContent = '';
    containerRef.current.appendChild(anchor);

    const script = document.createElement('script');
    script.src = 'https://platform.twitter.com/widgets.js';
    script.async = true;
    script.charset = 'utf-8';
    script.onload = () => {
      setTimeout(() => {
        if (containerRef.current?.querySelector('iframe')) {
          setStatus('loaded');
        } else {
          setStatus('error');
        }
      }, 3000);
    };
    script.onerror = () => setStatus('error');
    containerRef.current.appendChild(script);
  }, []);

  return (
    <div className="bento-item col-span-12 md:col-span-6 lg:col-span-4 scroll-fade-in">
      <div className="item-header">
        <span className="item-title">LATEST UPDATES</span>
      </div>
      <div className="relative overflow-hidden rounded-xl h-[400px] sm:h-[480px]">
        {status === 'loading' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <div className="space-y-3 w-full px-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full skeleton" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-3 w-24 rounded skeleton" />
                      <div className="h-2 w-16 rounded skeleton" />
                    </div>
                  </div>
                  <div className="space-y-1.5 mt-2">
                    <div className="h-2.5 w-full rounded skeleton" />
                    <div className="h-2.5 w-3/4 rounded skeleton" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {status === 'error' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
            <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5a5a5a" strokeWidth="1.5">
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="text-[#5a5a5a] text-xs font-display mb-1">Feed unavailable</p>
            <p className="text-[#3a3a3a] text-[10px] leading-relaxed max-w-[200px]">
              Follow @tradingwsidhant on X for the latest updates.
            </p>
          </div>
        )}
        <div ref={containerRef} className={status === 'loading' ? 'opacity-0' : ''} />
      </div>
    </div>
  );
}
