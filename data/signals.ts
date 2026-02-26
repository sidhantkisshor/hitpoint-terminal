export interface Signal {
  roe: string;
  label: string;
  platform: string;
  image: string;
  alt: string;
}

export const signals: Signal[] = [
  {
    roe: '+2645%',
    label: 'ETH PUT',
    platform: 'Delta Exchange',
    image: '/results/eth-put-delta.jpg',
    alt: 'Delta Exchange profit screenshot',
  },
  {
    roe: '+3122%',
    label: 'Gold Long · 200X',
    platform: 'Gold',
    image: '/results/gold-long-3122.jpeg',
    alt: 'Gold trade profit screenshot',
  },
  {
    roe: '+2010%',
    label: 'Gold Long · 200X',
    platform: 'Gold',
    image: '/results/gold-long-2010.jpg',
    alt: 'Gold trade profit screenshot',
  },
];
