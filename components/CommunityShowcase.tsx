'use client';

import { testimonials } from '@/data/testimonials';

export function CommunityShowcase() {
  return (
    <div className="bento-item col-span-12 scroll-fade-in">
      <div className="item-header mb-6">
        <span className="item-title">WHAT YOU ACTUALLY GET</span>
        <span className="text-[10px] sm:text-xs text-[#5a5a5a] hidden sm:inline">
          Designed to reduce decision fatigue, not increase screen time.
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {testimonials.map((t, i) => (
          <div
            key={i}
            className="group relative p-4 sm:p-5 rounded-xl border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.03] hover:border-[#c4f82e]/15 transition-all duration-300"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-[#c4f82e]/8 border border-[#c4f82e]/12 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[11px] font-mono font-bold text-[#c4f82e]">{t.number}</span>
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-display font-semibold text-white mb-1.5 leading-snug">
                  {t.title}
                </h3>
                <p className="text-xs text-[#707070] leading-relaxed">
                  {t.caption}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
