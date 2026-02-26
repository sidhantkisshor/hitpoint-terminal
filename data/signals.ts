export interface Signal {
  image: string;
  caption?: string;
  date?: string;
}

export const signals: Signal[] = [
  { image: '/signals/placeholder-1.png', caption: 'BTC Long — +12.4% gain', date: '2026-02-20' },
  { image: '/signals/placeholder-2.png', caption: 'ETH Short — +8.7% gain', date: '2026-02-18' },
  { image: '/signals/placeholder-3.png', caption: 'SOL Long — +15.2% gain', date: '2026-02-15' },
  { image: '/signals/placeholder-4.png', caption: 'BTC Short — +6.3% gain', date: '2026-02-12' },
  { image: '/signals/placeholder-5.png', caption: 'ETH Long — +10.1% gain', date: '2026-02-10' },
  { image: '/signals/placeholder-6.png', caption: 'XRP Long — +22.5% gain', date: '2026-02-08' },
];
