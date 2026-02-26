import type { CompletedTrade, ChallengeConfig } from '@/store/useSimulatorStore';

// --- Real-time checks (called on every price tick) ---

export function checkDailyLoss(
  dailyStartBalance: number,
  currentBalance: number,
  limit: number
): { breached: boolean; currentLoss: number } {
  const currentLoss = (dailyStartBalance - currentBalance) / dailyStartBalance;
  return { breached: currentLoss >= limit, currentLoss };
}

export function checkTotalDrawdown(
  startingBalance: number,
  currentBalance: number,
  limit: number
): { breached: boolean; currentDrawdown: number } {
  const currentDrawdown = (startingBalance - currentBalance) / startingBalance;
  return { breached: currentDrawdown >= limit, currentDrawdown };
}

export function checkRiskPerTrade(
  entryPrice: number,
  stopLoss: number,
  positionSize: number,
  currentBalance: number,
  maxRisk: number
): { allowed: boolean; riskPercent: number } {
  const riskAmount = positionSize * (Math.abs(entryPrice - stopLoss) / entryPrice);
  const riskPercent = riskAmount / currentBalance;
  return { allowed: riskPercent <= maxRisk, riskPercent };
}

export function checkMaxTradingDays(
  startDate: string,
  maxDays: number
): { exceeded: boolean; daysElapsed: number } {
  const start = new Date(startDate);
  const now = new Date();
  const daysElapsed = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return { exceeded: daysElapsed > maxDays, daysElapsed };
}

// --- Position P&L calculation ---

export function calculateUnrealizedPnl(
  direction: 'long' | 'short',
  entryPrice: number,
  currentPrice: number,
  size: number
): number {
  return direction === 'long'
    ? size * (currentPrice - entryPrice) / entryPrice
    : size * (entryPrice - currentPrice) / entryPrice;
}

export function checkTpSlHit(
  direction: 'long' | 'short',
  currentPrice: number,
  takeProfit: number | null,
  stopLoss: number
): 'tp' | 'sl' | null {
  if (direction === 'long') {
    if (currentPrice <= stopLoss) return 'sl';
    if (takeProfit !== null && currentPrice >= takeProfit) return 'tp';
  } else {
    if (currentPrice >= stopLoss) return 'sl';
    if (takeProfit !== null && currentPrice <= takeProfit) return 'tp';
  }
  return null;
}

// --- Post-trade scoring (computed from trades array) ---

export function checkProfitTarget(
  currentBalance: number,
  startingBalance: number,
  target: number
): { reached: boolean; currentProfit: number } {
  const currentProfit = (currentBalance - startingBalance) / startingBalance;
  return { reached: currentProfit >= target, currentProfit };
}

export function calculateConsistencyScore(trades: CompletedTrade[]): number {
  if (trades.length < 2) return 100;

  const profitTrades = trades.filter((t) => t.pnl > 0);
  const totalProfit = profitTrades.reduce((sum, t) => sum + t.pnl, 0);

  if (totalProfit <= 0) return 50;

  // Part 1: Profit distribution evenness (50%)
  let distributionScore = 100;
  for (const trade of profitTrades) {
    const contribution = trade.pnl / totalProfit;
    if (contribution > 0.4) {
      distributionScore -= (contribution - 0.4) * 200;
    }
  }
  distributionScore = Math.max(0, distributionScore);

  // Part 2: Daily P&L stability (50%)
  const dailyPnl: Record<string, number> = {};
  for (const trade of trades) {
    const day = trade.closedAt.split('T')[0];
    dailyPnl[day] = (dailyPnl[day] || 0) + trade.pnl;
  }

  const dailyValues = Object.values(dailyPnl);
  const mean = dailyValues.reduce((a, b) => a + b, 0) / dailyValues.length;
  const variance = dailyValues.reduce((sum, v) => sum + (v - mean) ** 2, 0) / dailyValues.length;
  const stddev = Math.sqrt(variance);
  const cv = mean !== 0 ? stddev / Math.abs(mean) : 0;

  const stabilityScore = Math.max(0, Math.min(100, 100 - (cv - 0.5) * (100 / 1.5)));

  return Math.round(distributionScore * 0.5 + stabilityScore * 0.5);
}

export function calculateEmotionalScore(trades: CompletedTrade[]): number {
  if (trades.length === 0) return 100;

  let score = 100;

  for (let i = 1; i < trades.length; i++) {
    const prevTrade = trades[i - 1];
    const currTrade = trades[i];

    const timeDiff = new Date(currTrade.openedAt).getTime() - new Date(prevTrade.closedAt).getTime();

    // Revenge trading: new trade within 2 minutes of a losing trade
    if (prevTrade.pnl < 0 && timeDiff < 2 * 60 * 1000) {
      score -= 15;
    }

    // Size escalation: >50% size increase after a loss
    if (prevTrade.pnl < 0 && currTrade.size > prevTrade.size * 1.5) {
      score -= 20;
    }
  }

  // Overtrading: >5 trades in any 1-hour window
  for (let i = 0; i < trades.length; i++) {
    const windowStart = new Date(trades[i].openedAt).getTime();
    let count = 0;
    for (let j = i; j < trades.length; j++) {
      if (new Date(trades[j].openedAt).getTime() - windowStart <= 60 * 60 * 1000) {
        count++;
      }
    }
    if (count > 5) {
      score -= 10;
      break;
    }
  }

  return Math.max(0, score);
}

export function calculateRiskScore(
  trades: CompletedTrade[],
  _config: ChallengeConfig
): number {
  if (trades.length === 0) return 100;

  let score = 100;
  let noTpCount = 0;

  for (const trade of trades) {
    const riskAmount = trade.size * (Math.abs(trade.entryPrice - trade.stopLoss) / trade.entryPrice);
    const approxBalance = trade.size + trade.pnl; // rough approximation
    const riskOfAccount = approxBalance > 0 ? riskAmount / approxBalance : 0;

    if (riskOfAccount > 0.015) {
      score -= 5;
    }

    if (trade.takeProfit === null) {
      noTpCount++;
    }
  }

  // Cap TP penalty at -20
  score -= Math.min(noTpCount * 5, 20);

  return Math.max(0, Math.min(100, score));
}

export function calculateDisciplineScore(
  _trades: CompletedTrade[],
  dailyLossNearMisses: number,
  totalDrawdownNearMiss: boolean,
  tradingDaysCount: number,
  minTradingDays: number,
  failed: boolean
): number {
  if (failed) return 0;

  let score = 100;

  score -= dailyLossNearMisses * 10;
  if (totalDrawdownNearMiss) score -= 15;
  if (tradingDaysCount < minTradingDays + 2) score -= 10;

  return Math.max(0, score);
}

// --- Overall pass/fail check ---

export function evaluateChallenge(
  currentBalance: number,
  startingBalance: number,
  tradingDaysCount: number,
  config: ChallengeConfig,
  consistencyScore: number,
  emotionalScore: number
): { canPass: boolean; reasons: string[] } {
  const reasons: string[] = [];
  const profitPercent = (currentBalance - startingBalance) / startingBalance;

  if (profitPercent < config.profitTarget) {
    reasons.push(`Profit target not reached (${(profitPercent * 100).toFixed(1)}% / ${(config.profitTarget * 100).toFixed(0)}%)`);
  }
  if (tradingDaysCount < config.minTradingDays) {
    reasons.push(`Minimum trading days not met (${tradingDaysCount} / ${config.minTradingDays})`);
  }
  if (consistencyScore < 60) {
    reasons.push(`Consistency score too low (${consistencyScore} / 60 required)`);
  }
  if (emotionalScore < 50) {
    reasons.push(`Emotional stability score too low (${emotionalScore} / 50 required)`);
  }

  return { canPass: reasons.length === 0, reasons };
}
