'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { QuizModal } from '@/components/TraderQuiz';

export function HeaderQuizCTA() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Desktop */}
      <button
        onClick={() => setIsOpen(true)}
        className="hidden sm:flex items-center gap-2 bg-[#c4f82e] text-black font-display font-bold text-[11px] uppercase tracking-wider px-4 py-2 rounded-full hover:bg-[#a8e024] transition-all duration-200 hover:shadow-[0_0_20px_rgba(196,248,46,0.2)]"
      >
        <span>Trader Quiz</span>
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="opacity-60">
          <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Mobile */}
      <button
        onClick={() => setIsOpen(true)}
        className="sm:hidden flex items-center justify-center bg-[#c4f82e] text-black font-display font-bold text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-full hover:bg-[#a8e024] transition-colors"
        aria-label="Take the Trader Quiz"
      >
        Quiz
      </button>

      {isOpen && createPortal(
        <QuizModal onClose={() => setIsOpen(false)} />,
        document.body
      )}
    </>
  );
}
