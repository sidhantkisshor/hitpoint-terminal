'use client';

import { useState, useEffect } from 'react';

const SECTIONS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'charts', label: 'Charts' },
  { id: 'community', label: 'Community' },
  { id: 'signals', label: 'Signals' },
];

export function SectionNav() {
  const [activeSection, setActiveSection] = useState('dashboard');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );

    for (const section of SECTIONS) {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav className="sticky top-[65px] sm:top-[69px] z-40 backdrop-blur-2xl bg-black/70 border-b border-white/[0.04]">
      <div className="max-w-[1900px] mx-auto relative">
        {/* Fade edges for mobile scroll */}
        <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-black/70 to-transparent z-10 pointer-events-none sm:hidden" />
        <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-black/70 to-transparent z-10 pointer-events-none sm:hidden" />

        <div className="px-4 sm:px-6 lg:px-8 py-2.5 flex gap-1.5 overflow-x-auto scrollbar-hide">
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollTo(section.id)}
              className={`px-4 sm:px-5 py-2 rounded-full text-[11px] font-display font-semibold uppercase tracking-wider whitespace-nowrap transition-all duration-300 ${
                activeSection === section.id
                  ? 'bg-[#c4f82e]/10 text-[#c4f82e] border border-[#c4f82e]/20'
                  : 'text-[#5a5a5a] hover:text-[#a0a0a0] border border-transparent hover:border-white/[0.06]'
              }`}
            >
              {section.label}
            </button>
          ))}
          <a
            href="/simulator"
            className="px-4 sm:px-5 py-2 rounded-full text-[11px] font-display font-semibold uppercase tracking-wider whitespace-nowrap transition-all duration-300 text-[#c4f82e] border border-[#c4f82e]/20 hover:bg-[#c4f82e]/10 hover:border-[#c4f82e]/40 ml-auto"
          >
            Challenge Simulator
          </a>
        </div>
      </div>
    </nav>
  );
}
