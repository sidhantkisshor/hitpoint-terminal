export interface Scores {
  conviction: number;
  risk: number;
  discipline: number;
  independence: number;
}

export interface QuizOption {
  label: string;
  scores: Scores;
}

export interface QuizQuestion {
  question: string;
  category: 'conviction' | 'risk' | 'discipline' | 'independence';
  options: [QuizOption, QuizOption, QuizOption];
}

export interface TraderProfile {
  key: string;
  name: string;
  icon: string;
  description: string;
  traits: string[];
  rarity: number;
  recommendedTools: { name: string; anchor: string }[];
  matcher: (scores: Scores) => number;
}

// --- Profiles (array order = tie-break priority) ---

export const traderProfiles: TraderProfile[] = [
  {
    key: 'diamond-hands',
    name: 'The Diamond Hands',
    icon: '\uD83D\uDC8E',
    description:
      'You bought the dip and never looked back. When the market dumps 40%, you zoom out and add more. Paper hands fold — you frame your unrealized losses as "conviction." Your portfolio is a time capsule.',
    traits: ['Patient', 'High Conviction', 'Unshakeable'],
    rarity: 12,
    recommendedTools: [
      { name: 'Interactive Charts', anchor: 'charts' },
      { name: 'Fear & Greed Index', anchor: 'dashboard' },
      { name: 'Market Dominance', anchor: 'dashboard' },
    ],
    matcher: (s) => s.conviction * 2 + s.discipline - s.risk,
  },
  {
    key: 'ape',
    name: 'The Ape',
    icon: '\uD83E\uDD8D',
    description:
      'Someone on CT posted a ticker with a rocket emoji and you already market-bought. Due diligence? That\'s what the reply guys are for. You\'ve been rugged more times than you can count, but that one 50x made it all worth it.',
    traits: ['FOMO King', 'High Risk', 'Impulsive'],
    rarity: 18,
    recommendedTools: [
      { name: 'BTC Price Ticker', anchor: 'dashboard' },
      { name: 'Market Heatmap', anchor: 'dashboard' },
      { name: 'Liquidation Bubbles', anchor: 'dashboard' },
    ],
    matcher: (s) => s.risk * 2 - s.independence - s.discipline,
  },
  {
    key: 'sniper',
    name: 'The Sniper',
    icon: '\uD83C\uDFAF',
    description:
      'You wait. And wait. And wait. Then you take one perfect trade while everyone else is overtrading into chop. Your win rate is disgusting. You have a checklist, a journal, and absolutely zero chill about your process.',
    traits: ['Precise', 'Disciplined', 'Patient'],
    rarity: 5,
    recommendedTools: [
      { name: 'Funding Rates', anchor: 'dashboard' },
      { name: 'Long/Short Ratio', anchor: 'dashboard' },
      { name: 'Interactive Charts', anchor: 'charts' },
    ],
    matcher: (s) => s.discipline * 2 - s.risk - s.conviction,
  },
  {
    key: 'whale-watcher',
    name: 'The Whale Watcher',
    icon: '\uD83D\uDC0B',
    description:
      'You don\'t trade the chart — you trade the people trading the chart. Funding rates, open interest, whale wallets, exchange flows. You know where the smart money is going before CT does. Data is your alpha.',
    traits: ['Data-Driven', 'Analytical', 'Cautious'],
    rarity: 8,
    recommendedTools: [
      { name: 'Funding Rates', anchor: 'dashboard' },
      { name: 'Liquidation Bubbles', anchor: 'dashboard' },
      { name: 'Long/Short Ratio', anchor: 'dashboard' },
    ],
    matcher: (s) => s.discipline + s.independence - s.risk * 2,
  },
  {
    key: 'narrative-trader',
    name: 'The Narrative Trader',
    icon: '\uD83D\uDCE1',
    description:
      'AI season? You\'re already in. RWA rotation? Loaded up last week. Meme coin summer? You\'re three narratives ahead. You don\'t trade charts — you trade attention. The meta is your edge, and you ride it until CT catches on.',
    traits: ['Trend-Aware', 'Social', 'Adaptive'],
    rarity: 14,
    recommendedTools: [
      { name: 'Market Heatmap', anchor: 'dashboard' },
      { name: 'Market Dominance', anchor: 'dashboard' },
      { name: 'Economic Calendar', anchor: 'dashboard' },
    ],
    matcher: (s) => s.conviction * 2 + s.risk - s.discipline,
  },
  {
    key: 'liquidation-magnet',
    name: 'The Liquidation Magnet',
    icon: '\uD83D\uDC80',
    description:
      'You opened a 50x long at the local top. Again. Your liquidation history reads like a horror novel. You know you should use stops. You know you should lower leverage. But where\'s the fun in that? Next trade is the one.',
    traits: ['Max Leverage', 'Emotional', 'Reckless'],
    rarity: 22,
    recommendedTools: [
      { name: 'Liquidation Bubbles', anchor: 'dashboard' },
      { name: 'BTC Price Ticker', anchor: 'dashboard' },
      { name: 'Funding Rates', anchor: 'dashboard' },
    ],
    matcher: (s) => s.risk * 2 - s.independence * 2 + s.conviction,
  },
  {
    key: 'copy-trader',
    name: 'The Copy Trader',
    icon: '\uD83E\uDE9E',
    description:
      'Why think when someone else already did? You follow the top traders, mirror their positions, and ride their conviction. Your alpha is knowing who to follow. Sometimes you\'re early. Usually you\'re late. But you\'re never alone.',
    traits: ['Follower', 'Risk-Averse', 'Reactive'],
    rarity: 16,
    recommendedTools: [
      { name: 'Fear & Greed Index', anchor: 'dashboard' },
      { name: 'Market Heatmap', anchor: 'dashboard' },
      { name: 'Long/Short Ratio', anchor: 'dashboard' },
    ],
    matcher: (s) => -s.independence * 2 - s.discipline - s.risk,
  },
  {
    key: 'og',
    name: 'The OG',
    icon: '\uD83D\uDC74',
    description:
      'Three cycles deep. You bought BTC under $1k, survived Mt. Gox, and laughed through the 2022 crash. CT drama doesn\'t faze you. When everyone\'s euphoric, you\'re taking profits. When everyone\'s capitulating, you\'re accumulating. You\'ve seen this movie before.',
    traits: ['Experienced', 'Contrarian', 'Independent'],
    rarity: 5,
    recommendedTools: [
      { name: 'Fear & Greed Index', anchor: 'dashboard' },
      { name: 'Interactive Charts', anchor: 'charts' },
      { name: 'Economic Calendar', anchor: 'dashboard' },
    ],
    matcher: (s) => s.independence * 2 + s.discipline - s.conviction,
  },
];

// --- Questions (24 total, 6 per category) ---

export const quizQuestions: QuizQuestion[] = [
  // === CONVICTION (6 questions) ===
  {
    question: "CT is screaming that BTC is going to $10k. You're in profit on your long. What do you do?",
    category: 'conviction',
    options: [
      { label: "Close the position — CT is usually wrong", scores: { conviction: -2, risk: -1, discipline: 1, independence: 2 } },
      { label: "Trim half and hold the rest", scores: { conviction: 1, risk: 0, discipline: 2, independence: 1 } },
      { label: "Add to the position, they're all ngmi", scores: { conviction: 3, risk: 1, discipline: 0, independence: 2 } },
    ],
  },
  {
    question: "Your biggest bag is down 60% from your entry. What now?",
    category: 'conviction',
    options: [
      { label: "Cut it. Opportunity cost is real", scores: { conviction: -2, risk: -1, discipline: 2, independence: 1 } },
      { label: "Hold and wait for the narrative to come back", scores: { conviction: 2, risk: 0, discipline: 0, independence: 0 } },
      { label: "Average down — this is the discount I wanted", scores: { conviction: 3, risk: 2, discipline: -1, independence: 1 } },
    ],
  },
  {
    question: "You find a project with insane fundamentals but zero hype. What do you do?",
    category: 'conviction',
    options: [
      { label: "Skip it — no hype means no pump", scores: { conviction: -1, risk: -1, discipline: 0, independence: -2 } },
      { label: "Small position, see if it catches on", scores: { conviction: 1, risk: 0, discipline: 1, independence: 1 } },
      { label: "Load a bag before CT finds out", scores: { conviction: 3, risk: 1, discipline: 1, independence: 3 } },
    ],
  },
  {
    question: "Bitcoin just hit a new all-time high. Your move?",
    category: 'conviction',
    options: [
      { label: "Take profits — ATH is where smart money sells", scores: { conviction: -2, risk: -1, discipline: 2, independence: 2 } },
      { label: "Hold what I have, don't add", scores: { conviction: 1, risk: 0, discipline: 1, independence: 0 } },
      { label: "Go long — momentum is everything, price discovery mode", scores: { conviction: 3, risk: 2, discipline: -1, independence: 0 } },
    ],
  },
  {
    question: "Your thesis played out perfectly — 3x gain. Now what?",
    category: 'conviction',
    options: [
      { label: "Take it all off. A win is a win", scores: { conviction: -1, risk: -2, discipline: 2, independence: 1 } },
      { label: "Take the initial out, let the rest ride", scores: { conviction: 1, risk: 0, discipline: 2, independence: 1 } },
      { label: "Hold everything — 3x is just the beginning", scores: { conviction: 3, risk: 2, discipline: -1, independence: 1 } },
    ],
  },
  {
    question: "A coin you're bullish on just got FUD'd hard on CT. How do you react?",
    category: 'conviction',
    options: [
      { label: "Sell first, ask questions later", scores: { conviction: -2, risk: -1, discipline: -1, independence: -2 } },
      { label: "Research the FUD, then decide", scores: { conviction: 0, risk: 0, discipline: 2, independence: 1 } },
      { label: "Buy the FUD. The crowd is always wrong at extremes", scores: { conviction: 3, risk: 1, discipline: 0, independence: 3 } },
    ],
  },

  // === RISK (6 questions) ===
  {
    question: "You just 3x'd on a memecoin. Next move?",
    category: 'risk',
    options: [
      { label: "Take profits, move to stables", scores: { conviction: 0, risk: -3, discipline: 2, independence: 0 } },
      { label: "Take some off, let the rest ride", scores: { conviction: 0, risk: 0, discipline: 1, independence: 0 } },
      { label: "Roll it all into the next play", scores: { conviction: 1, risk: 3, discipline: -2, independence: 0 } },
    ],
  },
  {
    question: "Pick your ideal leverage:",
    category: 'risk',
    options: [
      { label: "1x — spot only, leverage is for degens", scores: { conviction: 0, risk: -3, discipline: 2, independence: 1 } },
      { label: "3-5x with tight stops", scores: { conviction: 0, risk: 1, discipline: 2, independence: 0 } },
      { label: "20x+ — go big or go home", scores: { conviction: 0, risk: 3, discipline: -2, independence: 0 } },
    ],
  },
  {
    question: "How much of your portfolio do you risk on a single trade?",
    category: 'risk',
    options: [
      { label: "1-2% max. Always", scores: { conviction: 0, risk: -2, discipline: 3, independence: 0 } },
      { label: "5-10% if the setup is clean", scores: { conviction: 0, risk: 1, discipline: 1, independence: 0 } },
      { label: "25%+ when I'm feeling it", scores: { conviction: 1, risk: 3, discipline: -2, independence: 0 } },
    ],
  },
  {
    question: "A new L1 just launched with massive VC backing. Allocation?",
    category: 'risk',
    options: [
      { label: "Wait for price discovery, buy later", scores: { conviction: 0, risk: -2, discipline: 2, independence: 1 } },
      { label: "Small bag — 2-3% of portfolio", scores: { conviction: 0, risk: 0, discipline: 1, independence: 0 } },
      { label: "Heavy bag — this is the next SOL", scores: { conviction: 2, risk: 3, discipline: -1, independence: 0 } },
    ],
  },
  {
    question: "Your stop loss just got hit. The price immediately bounces back. What do you learn?",
    category: 'risk',
    options: [
      { label: "Stop was right. Protecting capital is the priority", scores: { conviction: 0, risk: -2, discipline: 3, independence: 1 } },
      { label: "Maybe I should use wider stops", scores: { conviction: 0, risk: 1, discipline: 0, independence: 0 } },
      { label: "Stop losses are a scam. I'm done using them", scores: { conviction: 1, risk: 3, discipline: -3, independence: 0 } },
    ],
  },
  {
    question: "Your portfolio is 50% BTC, 30% ETH, 20% alts. How do you feel?",
    category: 'risk',
    options: [
      { label: "Too risky. I want more BTC", scores: { conviction: 0, risk: -3, discipline: 1, independence: 0 } },
      { label: "Balanced. Good mix", scores: { conviction: 0, risk: 0, discipline: 1, independence: 0 } },
      { label: "Too safe. Flip the alts to 60%+", scores: { conviction: 1, risk: 3, discipline: -1, independence: 1 } },
    ],
  },

  // === DISCIPLINE (6 questions) ===
  {
    question: "How do you decide when to enter a trade?",
    category: 'discipline',
    options: [
      { label: "Checklist of indicators + confirmations. Every time", scores: { conviction: 0, risk: -1, discipline: 3, independence: 1 } },
      { label: "Mix of analysis and vibes", scores: { conviction: 0, risk: 0, discipline: 1, independence: 0 } },
      { label: "Chart looks good, I send it", scores: { conviction: 0, risk: 1, discipline: -2, independence: 0 } },
    ],
  },
  {
    question: "Do you keep a trading journal?",
    category: 'discipline',
    options: [
      { label: "Yes — every trade, entry/exit, lessons learned", scores: { conviction: 0, risk: 0, discipline: 3, independence: 1 } },
      { label: "Sometimes, when I remember", scores: { conviction: 0, risk: 0, discipline: 0, independence: 0 } },
      { label: "My PnL is my journal", scores: { conviction: 0, risk: 1, discipline: -2, independence: 0 } },
    ],
  },
  {
    question: "You're in a losing streak — 5 losses in a row. What do you do?",
    category: 'discipline',
    options: [
      { label: "Stop trading. Review what went wrong. Reset", scores: { conviction: 0, risk: -1, discipline: 3, independence: 1 } },
      { label: "Lower position size and keep going", scores: { conviction: 0, risk: 0, discipline: 1, independence: 0 } },
      { label: "Double down — I'm due for a win", scores: { conviction: 1, risk: 2, discipline: -3, independence: 0 } },
    ],
  },
  {
    question: "It's 3 AM and you see a setup forming. What do you do?",
    category: 'discipline',
    options: [
      { label: "Set an alert and go to sleep. It'll be there tomorrow", scores: { conviction: 0, risk: -1, discipline: 3, independence: 1 } },
      { label: "Set a limit order and go to bed", scores: { conviction: 0, risk: 0, discipline: 2, independence: 0 } },
      { label: "Trade it now. Sleep is for people without positions", scores: { conviction: 1, risk: 1, discipline: -2, independence: 0 } },
    ],
  },
  {
    question: "Your trade is up 20% but hasn't hit your target yet. What do you do?",
    category: 'discipline',
    options: [
      { label: "Stick to the plan. Target or stop, nothing in between", scores: { conviction: 1, risk: 0, discipline: 3, independence: 1 } },
      { label: "Move stop to breakeven and let it play out", scores: { conviction: 0, risk: -1, discipline: 2, independence: 0 } },
      { label: "Close it. Profit is profit. I'll find another trade", scores: { conviction: -1, risk: -1, discipline: -1, independence: 0 } },
    ],
  },
  {
    question: "How many trades do you take per week?",
    category: 'discipline',
    options: [
      { label: "1-3 high-conviction setups only", scores: { conviction: 1, risk: -1, discipline: 3, independence: 1 } },
      { label: "5-10, depends on the market", scores: { conviction: 0, risk: 0, discipline: 0, independence: 0 } },
      { label: "I lost count. If it moves, I trade it", scores: { conviction: 0, risk: 2, discipline: -3, independence: 0 } },
    ],
  },

  // === INDEPENDENCE (6 questions) ===
  {
    question: "Your favorite CT trader just posted a bearish thread. You're currently long. What do you do?",
    category: 'independence',
    options: [
      { label: "Close my long and go short", scores: { conviction: -1, risk: 0, discipline: -1, independence: -3 } },
      { label: "Read it, check my own charts, then decide", scores: { conviction: 0, risk: 0, discipline: 1, independence: 1 } },
      { label: "Ignore it. My thesis hasn't changed", scores: { conviction: 1, risk: 0, discipline: 1, independence: 3 } },
    ],
  },
  {
    question: "Everyone on CT is buying a coin you've never heard of. What do you do?",
    category: 'independence',
    options: [
      { label: "Ape in before I miss the pump", scores: { conviction: 0, risk: 2, discipline: -2, independence: -3 } },
      { label: "Research it quickly and decide based on the chart", scores: { conviction: 0, risk: 0, discipline: 1, independence: 0 } },
      { label: "If I didn't find it myself, I don't trade it", scores: { conviction: 0, risk: -1, discipline: 2, independence: 3 } },
    ],
  },
  {
    question: "A popular influencer says your biggest holding is a scam. Your reaction?",
    category: 'independence',
    options: [
      { label: "Panic sell. They probably know something I don't", scores: { conviction: -2, risk: -1, discipline: -2, independence: -3 } },
      { label: "Look into their claims objectively", scores: { conviction: 0, risk: 0, discipline: 2, independence: 1 } },
      { label: "They're probably short. I'll buy more", scores: { conviction: 2, risk: 1, discipline: 0, independence: 3 } },
    ],
  },
  {
    question: "How do you find new trades?",
    category: 'independence',
    options: [
      { label: "Follow top traders and mirror their calls", scores: { conviction: 0, risk: 0, discipline: 0, independence: -3 } },
      { label: "Scan CT for ideas, then do my own analysis", scores: { conviction: 0, risk: 0, discipline: 1, independence: 1 } },
      { label: "My own research. Charts, on-chain, fundamentals", scores: { conviction: 1, risk: 0, discipline: 2, independence: 3 } },
    ],
  },
  {
    question: "The Fear & Greed Index is at 95 (Extreme Greed). Everyone is euphoric. What do you do?",
    category: 'independence',
    options: [
      { label: "Stay long — the trend is your friend", scores: { conviction: 1, risk: 1, discipline: -1, independence: -2 } },
      { label: "Start taking some profits", scores: { conviction: 0, risk: -1, discipline: 1, independence: 1 } },
      { label: "Heavy sell. Maximum greed = maximum danger", scores: { conviction: -1, risk: -1, discipline: 2, independence: 3 } },
    ],
  },
  {
    question: "You're at a crypto event. Someone with a big following tells you about a 'sure thing.' Your move?",
    category: 'independence',
    options: [
      { label: "Get the ticker and buy it tonight", scores: { conviction: 0, risk: 1, discipline: -2, independence: -3 } },
      { label: "Note it down, research later", scores: { conviction: 0, risk: 0, discipline: 2, independence: 1 } },
      { label: "Smile and nod. There are no sure things", scores: { conviction: 0, risk: -1, discipline: 1, independence: 3 } },
    ],
  },
];

// --- Randomizer: pick 2 questions per category ---

export function pickQuestions(): QuizQuestion[] {
  const categories: QuizQuestion['category'][] = ['conviction', 'risk', 'discipline', 'independence'];
  const picked: QuizQuestion[] = [];

  for (const cat of categories) {
    const pool = quizQuestions.filter((q) => q.category === cat);
    // Fisher-Yates shuffle
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    picked.push(pool[0], pool[1]);
  }

  // Shuffle the final 8 so categories aren't always grouped
  for (let i = picked.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [picked[i], picked[j]] = [picked[j], picked[i]];
  }

  return picked;
}

// --- Score normalization (derives ranges from full pool) ---

const SCORE_RANGES = (() => {
  const dims: (keyof Scores)[] = ['conviction', 'risk', 'discipline', 'independence'];
  const ranges = Object.fromEntries(dims.map((d) => [d, { min: 0, max: 0 }])) as Record<
    keyof Scores,
    { min: number; max: number }
  >;

  for (const cat of ['conviction', 'risk', 'discipline', 'independence'] as const) {
    const catQuestions = quizQuestions.filter((q) => q.category === cat);
    for (const dim of dims) {
      const questionMins = catQuestions.map((q) => Math.min(...q.options.map((o) => o.scores[dim])));
      const questionMaxs = catQuestions.map((q) => Math.max(...q.options.map((o) => o.scores[dim])));
      questionMins.sort((a, b) => a - b);
      questionMaxs.sort((a, b) => b - a);
      ranges[dim].min += (questionMins[0] ?? 0) + (questionMins[1] ?? 0);
      ranges[dim].max += (questionMaxs[0] ?? 0) + (questionMaxs[1] ?? 0);
    }
  }
  return ranges;
})();

export function normalizeScores(raw: Scores): Scores {
  const normalize = (val: number, min: number, max: number) =>
    max === min ? 50 : Math.round(Math.max(0, Math.min(100, ((val - min) / (max - min)) * 100)));

  return {
    conviction: normalize(raw.conviction, SCORE_RANGES.conviction.min, SCORE_RANGES.conviction.max),
    risk: normalize(raw.risk, SCORE_RANGES.risk.min, SCORE_RANGES.risk.max),
    discipline: normalize(raw.discipline, SCORE_RANGES.discipline.min, SCORE_RANGES.discipline.max),
    independence: normalize(raw.independence, SCORE_RANGES.independence.min, SCORE_RANGES.independence.max),
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

export function getProfileByKey(key: string): TraderProfile | undefined {
  return traderProfiles.find((p) => p.key === key);
}
