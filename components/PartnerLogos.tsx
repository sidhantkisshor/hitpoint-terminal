'use client';

import { partners } from '@/data/partners';

export function PartnerLogos() {
  if (partners.length === 0) return null;

  return (
    <div className="bento-item col-span-12 lg:col-span-3 scroll-fade-in">
      <div className="item-header">
        <span className="item-title">PARTNERS</span>
      </div>

      <div className="flex flex-col gap-6 items-center justify-center h-[380px]">
        {partners.map((partner) => {
          const img = (
            <img
              key={partner.name}
              src={partner.logo}
              alt={partner.name}
              className="h-10 w-auto object-contain grayscale hover:grayscale-0 opacity-50 hover:opacity-100 transition-all duration-300"
              loading="lazy"
            />
          );

          return partner.url ? (
            <a
              key={partner.name}
              href={partner.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              {img}
            </a>
          ) : (
            img
          );
        })}
      </div>
    </div>
  );
}
