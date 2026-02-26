export interface QuizQuestion {
  question: string;
  options: { label: string; archetype: string }[];
}

export interface Archetype {
  name: string;
  icon: string;
  description: string;
}

export const quizQuestions: QuizQuestion[] = [
  {
    question: 'How long do you typically hold a trade?',
    options: [
      { label: 'Seconds to minutes', archetype: 'scalper' },
      { label: 'Hours to days', archetype: 'swing' },
      { label: 'Weeks to months', archetype: 'hodler' },
      { label: 'Until it moons or zeros', archetype: 'degen' },
    ],
  },
  {
    question: 'What do you check first in the morning?',
    options: [
      { label: 'Order book depth and volume', archetype: 'scalper' },
      { label: 'Daily chart patterns and RSI', archetype: 'swing' },
      { label: 'Total market cap and dominance', archetype: 'hodler' },
      { label: 'Twitter/X for the latest alpha', archetype: 'degen' },
    ],
  },
  {
    question: 'A coin drops 20% overnight. What do you do?',
    options: [
      { label: 'Look for a scalp bounce', archetype: 'scalper' },
      { label: 'Wait for support confirmation', archetype: 'swing' },
      { label: 'DCA if fundamentals are strong', archetype: 'hodler' },
      { label: 'Ape into the dip immediately', archetype: 'degen' },
    ],
  },
  {
    question: 'What matters most to you?',
    options: [
      { label: 'Tight spreads and execution speed', archetype: 'scalper' },
      { label: 'Risk/reward ratio and clean setups', archetype: 'swing' },
      { label: 'Long-term adoption and utility', archetype: 'hodler' },
      { label: 'Vibes and community sentiment', archetype: 'degen' },
    ],
  },
  {
    question: 'Pick your ideal leverage:',
    options: [
      { label: '10-20x on small positions', archetype: 'scalper' },
      { label: '3-5x with proper stops', archetype: 'swing' },
      { label: '1x — spot only', archetype: 'hodler' },
      { label: '50-125x — go big or go home', archetype: 'degen' },
    ],
  },
];

export const archetypes: Record<string, Archetype> = {
  scalper: {
    name: 'The Scalper',
    icon: '\u26A1',
    description: 'Lightning-fast reflexes. You live in the 1-minute chart, thrive on volatility, and take profits quickly. Speed is your edge.',
  },
  swing: {
    name: 'The Swing Trader',
    icon: '\uD83C\uDFAF',
    description: 'Patient and precise. You wait for high-probability setups, manage risk carefully, and let winners run. The daily chart is your playground.',
  },
  hodler: {
    name: 'The HODLer',
    icon: '\uD83D\uDC8E',
    description: 'Diamond hands forged in bear markets. You believe in the long game, accumulate on dips, and never panic sell. Time in the market beats timing.',
  },
  degen: {
    name: 'The Degen',
    icon: '\uD83D\uDE80',
    description: 'High risk, high reward. You chase the next 100x, ape into new launches, and live for the thrill. Fortune favors the bold.',
  },
};
