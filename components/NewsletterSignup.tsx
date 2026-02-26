'use client';

import { useState } from 'react';

export function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

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
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="bento-item col-span-12 md:col-span-6 lg:col-span-3 scroll-fade-in">
      <div className="item-header">
        <span className="item-title">THE BITCOIN HITPOINT CLUB</span>
      </div>

      <div className="flex flex-col justify-center h-[260px] sm:h-[300px]">
        {status === 'success' ? (
          <div className="text-center">
            <div className="text-4xl mb-3">&#10003;</div>
            <p className="text-[#c4f82e] font-display font-bold text-xl">You&apos;re in!</p>
            <p className="text-[#a0a0a0] text-sm mt-2">Check your inbox for weekly market insights.</p>
          </div>
        ) : (
          <>
            <p className="text-[#a0a0a0] text-xs sm:text-sm mb-5 sm:mb-6 leading-relaxed">
              A private, referral-verified intelligence community for serious Bitcoin futures traders. Subscribe for market structure updates and Club announcements.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full bg-white/[0.03] border border-white/[0.07] rounded-xl px-4 py-3 text-sm text-white placeholder-[#5a5a5a] focus:outline-none focus:border-[#c4f82e]/30 transition-colors"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-[#c4f82e] text-black font-display font-bold py-3 rounded-xl hover:bg-[#a8e024] transition-colors text-xs sm:text-sm uppercase tracking-wider disabled:opacity-50"
              >
                {status === 'loading' ? 'Subscribing...' : 'Get Updates'}
              </button>
            </form>

            {status === 'error' && (
              <p className="text-red-400 text-xs mt-2 text-center">Something went wrong. Try again.</p>
            )}

            <p className="text-[#3a3a3a] text-[10px] sm:text-xs mt-3 sm:mt-4 text-center">
              No spam. Unsubscribe anytime.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
