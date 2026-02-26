'use client';

import { signals } from '@/data/signals';

export function SignalsGallery() {
  return (
    <div className="bento-item col-span-12 lg:col-span-6 scroll-fade-in">
      <div className="item-header">
        <span className="item-title">REAL RESULTS</span>
        <span className="text-[10px] sm:text-xs text-[#5a5a5a] hidden sm:inline">Verified profit screenshots from Club members</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-4">
        {signals.map((signal, i) => (
          <div
            key={i}
            className="relative group rounded-xl overflow-hidden border border-white/[0.04] hover:border-[#c4f82e]/20 transition-all duration-300 bg-gradient-to-br from-black/60 to-black/40"
          >
            <div className="aspect-[3/4] overflow-hidden">
              <img
                src={signal.image}
                alt={signal.alt}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            </div>
            <div className="absolute top-2 right-2 bg-[#c4f82e] text-black text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg shadow-lg">
              {signal.roe} ROE
            </div>
            <div className="p-2 sm:p-3">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/[0.06] flex items-center justify-center text-[9px] sm:text-[10px] font-bold text-[#5a5a5a]">
                  {signal.label.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-[#a0a0a0] truncate">Club Member</p>
                  <p className="text-[9px] sm:text-xs text-[#5a5a5a] truncate">{signal.label} · {signal.platform}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-[9px] sm:text-[10px] text-[#3a3a3a] text-center mb-3">
        Past performance does not guarantee future results.
      </p>

      <a
        href="https://t.me/TheBitcoinHitpointClubBot"
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full text-center bg-[#c4f82e] text-black font-display font-bold py-3 rounded-xl hover:bg-[#a8e024] transition-colors text-xs sm:text-sm uppercase tracking-wider"
      >
        Get Access
      </a>
    </div>
  );
}
