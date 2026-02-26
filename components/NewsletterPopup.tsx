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
    <div className="fixed bottom-6 right-6 z-50 w-[340px] animate-slide-up">
      <div className="relative rounded-2xl border border-white/10 bg-black/90 backdrop-blur-2xl p-6 shadow-2xl shadow-black/50">
        {/* Close button */}
        <button
          onClick={() => dismiss(false)}
          className="absolute top-3 right-3 text-gray-500 hover:text-white transition-colors"
          aria-label="Close"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
          </svg>
        </button>

        {status === 'success' ? (
          <div className="text-center py-4">
            <div className="text-2xl mb-2">&#10003;</div>
            <p className="text-[#c4f82e] font-bold text-lg">You&apos;re in!</p>
            <p className="text-gray-400 text-sm mt-1">Watch your inbox for weekly insights.</p>
          </div>
        ) : (
          <>
            <h3 className="text-white font-bold text-lg mb-1">Weekly Crypto Insights</h3>
            <p className="text-gray-400 text-sm mb-4">
              Get market analysis and trading signals delivered weekly.
            </p>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#c4f82e]/40 transition-colors"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="bg-[#c4f82e] text-black font-bold px-4 py-2 rounded-lg text-sm hover:bg-[#a8e024] transition-colors disabled:opacity-50"
              >
                {status === 'loading' ? '...' : 'Join'}
              </button>
            </form>
            {status === 'error' && (
              <p className="text-red-400 text-xs mt-2">Something went wrong. Try again.</p>
            )}
            <button
              onClick={() => dismiss(true)}
              className="text-gray-600 text-xs mt-3 hover:text-gray-400 transition-colors"
            >
              Don&apos;t show again
            </button>
          </>
        )}
      </div>
    </div>
  );
}
