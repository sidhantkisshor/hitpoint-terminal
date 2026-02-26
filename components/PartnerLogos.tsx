'use client';

import { partners } from '@/data/partners';

export function PartnerLogos() {
  if (partners.length === 0) return null;

  return (
    <div className="bento-item col-span-12 md:col-span-6 lg:col-span-3 scroll-fade-in">
      <div className="item-header">
        <span className="item-title">PLATFORM PARTNERS</span>
      </div>

      <div className="flex flex-col gap-3 sm:gap-4 justify-center h-[320px] sm:h-[380px]">
        {partners.map((partner) => (
          <a
            key={partner.name}
            href={partner.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border border-white/[0.04] hover:border-[#c4f82e]/20 bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-300 group"
          >
            <img
              src={partner.logo}
              alt={partner.name}
              className="h-9 w-9 sm:h-10 sm:w-10 object-contain rounded-lg"
              loading="lazy"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-semibold text-white group-hover:text-[#c4f82e] transition-colors truncate">{partner.name}</p>
              <p className="text-[10px] sm:text-xs text-[#5a5a5a] truncate">{partner.description}</p>
            </div>
            <span className="text-[#5a5a5a] group-hover:text-[#c4f82e] transition-colors text-sm">&rarr;</span>
          </a>
        ))}
        <p className="text-[9px] sm:text-[10px] text-[#3a3a3a] text-center mt-1 sm:mt-2">
          We only allow access via platforms that meet our execution and liquidity standards.
        </p>
      </div>
    </div>
  );
}
