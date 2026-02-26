'use client';

import { useEffect, useRef } from 'react';

export function TwitterFeed() {
  const containerRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current || loadedRef.current) return;
    loadedRef.current = true;

    // Create the Twitter timeline embed
    const anchor = document.createElement('a');
    anchor.className = 'twitter-timeline';
    anchor.setAttribute('data-theme', 'dark');
    anchor.setAttribute('data-chrome', 'noheader nofooter noborders transparent');
    anchor.setAttribute('data-height', '480');
    anchor.href = 'https://twitter.com/HitpointTerminal'; // Replace with actual handle
    anchor.textContent = 'Loading tweets...';
    containerRef.current.appendChild(anchor);

    // Load Twitter widget script
    const script = document.createElement('script');
    script.src = 'https://platform.twitter.com/widgets.js';
    script.async = true;
    script.charset = 'utf-8';
    containerRef.current.appendChild(script);
  }, []);

  return (
    <div className="bento-item col-span-12 lg:col-span-4 scroll-fade-in">
      <div className="item-header">
        <span className="item-title">LATEST UPDATES</span>
      </div>
      <div
        ref={containerRef}
        className="overflow-hidden rounded-xl"
        style={{ height: '480px' }}
      />
    </div>
  );
}
