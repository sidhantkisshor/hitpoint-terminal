'use client';

import { useState } from 'react';
import { signals } from '@/data/signals';

export function SignalsGallery() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <>
      <div className="bento-item col-span-12 lg:col-span-6 scroll-fade-in">
        <div className="item-header">
          <span className="item-title">VIP SIGNALS PREVIEW</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          {signals.map((signal, i) => (
            <button
              key={i}
              onClick={() => setLightboxIndex(i)}
              className="relative group rounded-xl overflow-hidden border border-white/5 hover:border-[#c4f82e]/30 transition-all duration-300 aspect-[4/3]"
            >
              <img
                src={signal.image}
                alt={signal.caption || `Signal ${i + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-2 left-2 right-2">
                  {signal.caption && (
                    <p className="text-xs text-white font-medium truncate">{signal.caption}</p>
                  )}
                  {signal.date && (
                    <p className="text-xs text-gray-400">{signal.date}</p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        <a
          href="#"
          className="block w-full text-center bg-[#c4f82e] text-black font-bold py-3 rounded-xl hover:bg-[#a8e024] transition-colors text-sm uppercase tracking-wider"
        >
          Join VIP
        </a>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-8"
          onClick={() => setLightboxIndex(null)}
        >
          <div className="relative max-w-4xl max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
            <img
              src={signals[lightboxIndex].image}
              alt={signals[lightboxIndex].caption || 'Signal'}
              className="max-w-full max-h-[85vh] object-contain rounded-xl"
            />
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              aria-label="Close"
            >
              &times;
            </button>
            {signals[lightboxIndex].caption && (
              <p className="text-white text-sm mt-3 text-center">{signals[lightboxIndex].caption}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
