'use client';

import { useState, useEffect } from 'react';

const WHATSAPP_URL = 'https://wa.aisensy.com/+918062963333';

export function NewsletterPopup() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('newsletter-dismissed');
    if (dismissed) return;

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 30000);

    const handleScroll = () => {
      const scrollPercent = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      if (scrollPercent > 0.5) {
        setIsVisible(true);
        window.removeEventListener('scroll', handleScroll);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const dismiss = (permanent: boolean) => {
    setIsVisible(false);
    if (permanent) {
      localStorage.setItem('newsletter-dismissed', 'true');
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100%-2rem)] sm:w-[340px] animate-slide-up">
      <div className="relative rounded-2xl border border-white/[0.07] bg-black/92 backdrop-blur-2xl p-5 sm:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <button
          onClick={() => dismiss(false)}
          className="absolute top-3 right-3 text-[#5a5a5a] hover:text-white transition-colors"
          aria-label="Close"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
          </svg>
        </button>

        <h3 className="text-white font-display font-bold text-base sm:text-lg mb-1">The Bitcoin Hitpoint Club</h3>
        <p className="text-[#a0a0a0] text-xs sm:text-sm mb-4">
          Join our WhatsApp community for market structure analysis and Club updates.
        </p>
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => dismiss(true)}
          className="block w-full bg-[#25D366] text-white font-display font-bold px-4 py-2.5 rounded-lg text-xs sm:text-sm hover:bg-[#1da851] transition-colors text-center"
        >
          Join on WhatsApp
        </a>
        <button
          onClick={() => dismiss(true)}
          className="text-[#3a3a3a] text-[10px] sm:text-xs mt-3 hover:text-[#5a5a5a] transition-colors"
        >
          Don&apos;t show again
        </button>
      </div>
    </div>
  );
}
