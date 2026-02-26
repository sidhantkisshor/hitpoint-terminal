export interface Partner {
  name: string;
  logo: string;
  description: string;
  url: string;
}

export const partners: Partner[] = [
  {
    name: 'Delta Exchange',
    logo: '/partners/delta-exchange.png',
    description: 'Pro-grade derivatives · FIU Registered · INR',
    url: 'https://tws.bio/dx',
  },
  {
    name: 'BitBaby',
    logo: '/partners/bitbaby.png',
    description: 'Beginner-friendly · On-chain deposits',
    url: 'https://tws.bio/bitbaby',
  },
];
