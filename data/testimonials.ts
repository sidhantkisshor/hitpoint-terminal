export interface Testimonial {
  image: string;
  caption: string;
  author: string;
}

export const testimonials: Testimonial[] = [
  {
    image: '/testimonials/placeholder-1.png',
    caption: 'Turned my trading around completely. The signals are incredibly accurate.',
    author: '@trader_mike',
  },
  {
    image: '/testimonials/placeholder-2.png',
    caption: 'Best community I\'ve been part of. The insights are next level.',
    author: '@crypto_sarah',
  },
  {
    image: '/testimonials/placeholder-3.png',
    caption: 'The funding rate dashboard alone saved me from multiple bad entries.',
    author: '@defi_dave',
  },
  {
    image: '/testimonials/placeholder-4.png',
    caption: 'From losing trader to consistent profits. This changed everything.',
    author: '@whale_watcher',
  },
  {
    image: '/testimonials/placeholder-5.png',
    caption: 'The economic calendar alerts helped me avoid so many liquidations.',
    author: '@moon_maven',
  },
];
