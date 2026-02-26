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
    <nav className="sticky top-[73px] z-40 backdrop-blur-2xl bg-black/70 border-b border-white/5">
      <div className="max-w-[1900px] mx-auto px-8 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
        {SECTIONS.map((section) => (
          <button
            key={section.id}
            onClick={() => scrollTo(section.id)}
            className={`px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all duration-300 ${
              activeSection === section.id
                ? 'bg-[#c4f82e]/15 text-[#c4f82e] border border-[#c4f82e]/30 shadow-lg shadow-[#c4f82e]/10'
                : 'text-gray-500 hover:text-gray-300 border border-transparent hover:border-white/10'
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
