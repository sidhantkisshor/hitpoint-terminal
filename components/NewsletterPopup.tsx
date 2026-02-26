'use client';

import { useState, useEffect } from 'react';

export function NewsletterPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStatus('success');
        localStorage.setItem('newsletter-dismissed', 'true');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
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

        {status === 'success' ? (
          <div className="text-center py-3 sm:py-4">
            <div className="text-2xl mb-2">&#10003;</div>
            <p className="text-[#c4f82e] font-display font-bold text-lg">You&apos;re in!</p>
            <p className="text-[#a0a0a0] text-xs sm:text-sm mt-1">Watch your inbox for weekly insights.</p>
          </div>
        ) : (
          <>
            <h3 className="text-white font-display font-bold text-base sm:text-lg mb-1">The Bitcoin Hitpoint Club</h3>
            <p className="text-[#a0a0a0] text-xs sm:text-sm mb-4">
              Get market structure analysis and Club updates delivered weekly.
            </p>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 min-w-0 bg-white/[0.03] border border-white/[0.07] rounded-lg px-3 py-2 text-sm text-white placeholder-[#5a5a5a] focus:outline-none focus:border-[#c4f82e]/30 transition-colors"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="bg-[#c4f82e] text-black font-display font-bold px-4 py-2 rounded-lg text-xs sm:text-sm hover:bg-[#a8e024] transition-colors disabled:opacity-50 shrink-0"
              >
                {status === 'loading' ? '...' : 'Join'}
              </button>
            </form>
            {status === 'error' && (
              <p className="text-red-400 text-[10px] sm:text-xs mt-2">Something went wrong. Try again.</p>
            )}
            <button
              onClick={() => dismiss(true)}
              className="text-[#3a3a3a] text-[10px] sm:text-xs mt-3 hover:text-[#5a5a5a] transition-colors"
            >
              Don&apos;t show again
            </button>
          </>
        )}
      </div>
    </div>
  );
}
