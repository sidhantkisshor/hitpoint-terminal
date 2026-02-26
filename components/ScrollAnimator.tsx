'use client';

import { useEffect } from 'react';

export function ScrollAnimator() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        }
      },
      { rootMargin: '0px 0px -50px 0px' }
    );

    const elements = document.querySelectorAll('.scroll-fade-in');
    elements.forEach((el) => {
      el.classList.add('animate-on-scroll');
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
