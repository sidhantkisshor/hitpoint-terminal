export interface Scores {
  bias: number;
  risk: number;
  discipline: number;
  emotion: number;
}

export interface QuizOption {
  label: string;
  scores: Scores;
}

export interface QuizQuestion {
  question: string;
  category: 'bias' | 'risk' | 'discipline' | 'emotion';
  options: [QuizOption, QuizOption, QuizOption];
}

export interface TraderProfile {
  key: string;
  name: string;
  icon: string;
  description: string;
  traits: string[];
  recommendedTools: { name: string; anchor: string }[];
  matcher: (scores: Scores) => number;
}

export const quizQuestions: QuizQuestion[] = [
  // === MARKET BIAS (2 questions) ===
  {
    question: "What's your default market outlook?",
    category: 'bias',
    options: [
      { label: 'I look for bullish setups and buy dips', scores: { bias: 3, risk: 0, discipline: 1, emotion: 0 } },
      { label: 'I follow whatever direction the trend is moving', scores: { bias: 1, risk: 0, discipline: 2, emotion: 0 } },
      { label: 'I prefer shorting overextended moves', scores: { bias: -2, risk: 1, discipline: 1, emotion: 0 } },
    ],
  },
  {
    question: 'Bitcoin just hit a new all-time high. What do you do?',
    category: 'bias',
    options: [
      { label: 'Go long — momentum is everything', scores: { bias: 3, risk: 1, discipline: 0, emotion: 1 } },
      { label: 'Wait for a pullback to enter', scores: { bias: 1, risk: 0, discipline: 2, emotion: 0 } },
      { label: 'Start looking for a short entry', scores: { bias: -3, risk: 1, discipline: 1, emotion: 0 } },
    ],
  },
  // === RISK TOLERANCE (2 questions) ===
  {
    question: 'How much of your portfolio do you risk on a single trade?',
    category: 'risk',
    options: [
      { label: '1-2% with a strict stop loss', scores: { bias: 0, risk: -2, discipline: 3, emotion: 0 } },
      { label: '5-10% if the setup looks good', scores: { bias: 0, risk: 1, discipline: 1, emotion: 0 } },
      { label: '25%+ when I\'m feeling confident', scores: { bias: 0, risk: 3, discipline: -1, emotion: 2 } },
    ],
  },
  {
    question: 'Pick your ideal leverage:',
    category: 'risk',
    options: [
      { label: '1x — spot only, no leverage', scores: { bias: 0, risk: -3, discipline: 2, emotion: -1 } },
      { label: '3-5x with proper stop losses', scores: { bias: 0, risk: 1, discipline: 2, emotion: 0 } },
      { label: '20x+ — high conviction plays', scores: { bias: 0, risk: 3, discipline: -1, emotion: 2 } },
    ],
  },
  // === DISCIPLINE (2 questions) ===
  {
    question: 'How do you decide when to enter a trade?',
    category: 'discipline',
    options: [
      { label: 'I follow a checklist of indicators and confirmations', scores: { bias: 0, risk: -1, discipline: 3, emotion: -1 } },
      { label: 'I watch the chart and go with my gut feeling', scores: { bias: 0, risk: 1, discipline: -1, emotion: 2 } },
      { label: 'I use a mix of analysis and intuition', scores: { bias: 0, risk: 0, discipline: 1, emotion: 1 } },
    ],
  },
  {
    question: 'Your trade hits your stop loss. What happens next?',
    category: 'discipline',
    options: [
      { label: 'I accept the loss and move on to the next setup', scores: { bias: 0, risk: 0, discipline: 3, emotion: -2 } },
      { label: 'I re-enter if the setup still looks valid', scores: { bias: 0, risk: 1, discipline: 1, emotion: 1 } },
      { label: 'I remove the stop and give it more room', scores: { bias: 0, risk: 2, discipline: -2, emotion: 3 } },
    ],
  },
  // === EMOTIONAL BEHAVIOR (2 questions) ===
  {
    question: 'The market crashes 30% in a day. How do you feel?',
    category: 'emotion',
    options: [
      { label: 'Excited — volatility means opportunity', scores: { bias: 0, risk: 1, discipline: 0, emotion: -1 } },
      { label: 'Nervous but I stick to my plan', scores: { bias: 0, risk: 0, discipline: 2, emotion: 1 } },
      { label: 'Panicked — I close everything immediately', scores: { bias: 0, risk: -1, discipline: -2, emotion: 3 } },
    ],
  },
  {
    question: 'Everyone on Twitter is buying a coin you\'ve never heard of. What do you do?',
    category: 'emotion',
    options: [
      { label: 'Ignore it — if I didn\'t research it, I don\'t trade it', scores: { bias: 0, risk: -1, discipline: 3, emotion: -2 } },
      { label: 'Research it quickly and decide based on the chart', scores: { bias: 0, risk: 0, discipline: 1, emotion: 1 } },
      { label: 'Ape in before I miss the pump', scores: { bias: 0, risk: 2, discipline: -2, emotion: 3 } },
    ],
  },
];

export const traderProfiles: TraderProfile[] = [
  {
    key: 'analyst',
    name: 'The Analyst',
    icon: '\uD83E\uDDD0',
    description:
      'Methodical and data-driven. You never enter a trade without checking multiple confirmations. Risk management is your religion, and you let the numbers speak for themselves.',
    traits: ['Disciplined', 'Low Risk', 'Data-Driven'],
    recommendedTools: [
      { name: 'Funding Rates', anchor: 'dashboard' },
      { name: 'Long/Short Ratio', anchor: 'dashboard' },
      { name: 'Economic Calendar', anchor: 'dashboard' },
    ],
    matcher: (s) => s.discipline * 2 + (20 - s.risk) + (15 - s.emotion),
  },
  {
    key: 'trend-follower',
    name: 'The Trend Follower',
    icon: '\uD83C\uDFAF',
    description:
      'You ride the wave and let winners run. Bullish by nature, you trust momentum and follow the market\'s direction. Patience is your edge — you wait for the trend to confirm before entering.',
    traits: ['Bullish Bias', 'Trend Rider', 'Patient'],
    recommendedTools: [
      { name: 'Interactive Charts', anchor: 'charts' },
      { name: 'Market Dominance', anchor: 'dashboard' },
      { name: 'Market Heatmap', anchor: 'dashboard' },
    ],
    matcher: (s) => s.bias * 2 + s.discipline + 10,
  },
  {
    key: 'contrarian',
    name: 'The Contrarian',
    icon: '\uD83D\uDD04',
    description:
      'You go against the crowd and profit from extremes. When everyone is euphoric, you\'re looking for shorts. When panic hits, you\'re accumulating. Discipline keeps you ahead of the herd.',
    traits: ['Bearish Bias', 'Counter-Trend', 'Disciplined'],
    recommendedTools: [
      { name: 'Liquidation Bubbles', anchor: 'dashboard' },
      { name: 'Fear & Greed Index', anchor: 'dashboard' },
      { name: 'Funding Rates', anchor: 'dashboard' },
    ],
    matcher: (s) => -s.bias * 2 + s.discipline + 10,
  },
  {
    key: 'high-risk',
    name: 'The High-Risk Trader',
    icon: '\uD83D\uDD25',
    description:
      'You thrive on adrenaline and big moves. High leverage, quick decisions, and bold conviction define your style. You know the risks — and you take them anyway.',
    traits: ['High Leverage', 'Emotional', 'Bold'],
    recommendedTools: [
      { name: 'BTC Price Ticker', anchor: 'dashboard' },
      { name: 'Liquidation Bubbles', anchor: 'dashboard' },
      { name: 'Long/Short Ratio', anchor: 'dashboard' },
    ],
    matcher: (s) => s.risk * 2 + s.emotion * 2 + (10 - s.discipline),
  },
];

export function normalizeScores(raw: Scores): Scores {
  const normalize = (val: number, min: number, max: number) =>
    Math.round(Math.max(0, Math.min(100, ((val - min) / (max - min)) * 100)));

  return {
    bias: normalize(raw.bias, -6, 8),
    risk: normalize(raw.risk, -8, 12),
    discipline: normalize(raw.discipline, -8, 16),
    emotion: normalize(raw.emotion, -6, 12),
  };
}

export function getProfile(scores: Scores): TraderProfile {
  let best = traderProfiles[0];
  let bestScore = -Infinity;

  for (const profile of traderProfiles) {
    const fit = profile.matcher(scores);
    if (fit > bestScore) {
      bestScore = fit;
      best = profile;
    }
  }

  return best;
}
