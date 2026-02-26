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
    <div className="bento-item col-span-12 lg:col-span-3 scroll-fade-in">
      <div className="item-header">
        <span className="item-title">WEEKLY INSIGHTS</span>
      </div>

      <div className="flex flex-col justify-center h-[300px]">
        {status === 'success' ? (
          <div className="text-center">
            <div className="text-4xl mb-3">&#10003;</div>
            <p className="text-[#c4f82e] font-bold text-xl">You&apos;re in!</p>
            <p className="text-gray-400 text-sm mt-2">Check your inbox for weekly market insights.</p>
          </div>
        ) : (
          <>
            <p className="text-gray-300 text-sm mb-6 leading-relaxed">
              Get weekly market analysis, trading insights, and early access to new features delivered to your inbox.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#c4f82e]/40 transition-colors"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-[#c4f82e] text-black font-bold py-3 rounded-xl hover:bg-[#a8e024] transition-colors text-sm uppercase tracking-wider disabled:opacity-50"
              >
                {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>

            {status === 'error' && (
              <p className="text-red-400 text-xs mt-2 text-center">Something went wrong. Try again.</p>
            )}

            <p className="text-gray-600 text-xs mt-4 text-center">
              No spam. Unsubscribe anytime.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
