'use client';

import { useState, useEffect, useCallback } from 'react';
import { testimonials } from '@/data/testimonials';

export function CommunityShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const next = useCallback(() => {
    setActiveIndex((i) => (i + 1) % testimonials.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(next, 5000);
    return () => clearInterval(interval);
  }, [isPaused, next]);

  return (
    <div className="bento-item col-span-12 lg:col-span-5 scroll-fade-in">
      <div className="item-header">
        <span className="item-title">WHAT OUR TRADERS SAY</span>
      </div>

      <div
        className="relative overflow-hidden"
        style={{ height: '380px' }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {testimonials.map((t, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-all duration-500 ease-in-out ${
              i === activeIndex
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-4 pointer-events-none'
            }`}
          >
            <div className="h-full flex flex-col">
              <div className="flex-1 rounded-xl overflow-hidden bg-black/40 border border-white/5 flex items-center justify-center">
                <img
                  src={t.image}
                  alt={`Testimonial from ${t.author}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-300 italic leading-relaxed">&ldquo;{t.caption}&rdquo;</p>
                <p className="text-xs text-[#c4f82e] font-semibold mt-2">{t.author}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dots indicator */}
      <div className="flex justify-center gap-2 mt-4">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === activeIndex
                ? 'bg-[#c4f82e] shadow-lg shadow-[#c4f82e]/40'
                : 'bg-white/20 hover:bg-white/40'
            }`}
            aria-label={`Show testimonial ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
