'use client';

import { useEffect, useRef } from 'react';
import { useMarketStore } from '@/store/useMarketStore';
import { useSimulatorStore } from '@/store/useSimulatorStore';
import {
  calculateUnrealizedPnl,
  checkTpSlHit,
  checkDailyLoss,
  checkTotalDrawdown,
  checkMaxTradingDays,
  checkProfitTarget,
  evaluateChallenge,
  calculateConsistencyScore,
  calculateEmotionalScore,
} from '@/lib/simulator-evaluation';

import { ChallengeHeader } from './ChallengeHeader';
import { PriceDisplay } from './PriceDisplay';
import { TradePanel } from './TradePanel';
import { PositionCard } from './PositionCard';
import { EquityCurve } from './EquityCurve';
import { EvaluationMetrics } from './EvaluationMetrics';
import { TradeHistory } from './TradeHistory';
import { ViolationsLog } from './ViolationsLog';

export function SimulatorDashboard() {
  const btcTicker = useMarketStore((s) => s.btcTicker);
  const lastEquityPointRef = useRef<number>(0);

  // Only subscribe to status for conditional rendering of the daily reset interval
  const status = useSimulatorStore((s) => s.status);
  const checkDailyReset = useSimulatorStore((s) => s.checkDailyReset);

  // Price tick loop — reads ALL state from getState() to avoid stale closures
  useEffect(() => {
    if (!btcTicker) return;

    const state = useSimulatorStore.getState();
    if (state.status !== 'active') return;

    const currentPrice = parseFloat(btcTicker.price);
    if (isNaN(currentPrice) || currentPrice <= 0) return;

    state.checkDailyReset();

    if (state.activePosition) {
      const pos = state.activePosition;
      const pnl = calculateUnrealizedPnl(pos.direction, pos.entryPrice, currentPrice, pos.size);
      state.updateUnrealizedPnl(pnl);

      // Check TP/SL hit
      const tpSlResult = checkTpSlHit(pos.direction, currentPrice, pos.takeProfit, pos.stopLoss);
      if (tpSlResult) {
        state.closePosition(currentPrice, tpSlResult);
        // SL hits are normal trading — not logged as violations
        return;
      }

      // Check daily loss / total drawdown with effective balance
      const effectiveBalance = state.currentBalance + pnl;
      const dailyLoss = checkDailyLoss(state.dailyStartBalance, effectiveBalance, state.config.dailyLossLimit);
      const totalDD = checkTotalDrawdown(state.startingBalance, effectiveBalance, state.config.totalLossLimit);

      if (dailyLoss.breached) {
        state.closePosition(currentPrice, 'rule-violation');
        state.addViolation('Daily Loss Limit', `Daily loss of ${(dailyLoss.currentLoss * 100).toFixed(1)}% exceeded ${(state.config.dailyLossLimit * 100)}% limit`);
        state.failChallenge('Daily loss limit breached');
        return;
      }

      if (totalDD.breached) {
        state.closePosition(currentPrice, 'rule-violation');
        state.addViolation('Total Drawdown', `Drawdown of ${(totalDD.currentDrawdown * 100).toFixed(1)}% exceeded ${(state.config.totalLossLimit * 100)}% limit`);
        state.failChallenge('Total drawdown limit breached');
        return;
      }
    }

    // Equity curve (throttled: 1 point per 30 seconds)
    const now = Date.now();
    if (now - lastEquityPointRef.current > 30000) {
      // Re-read state after potential position close above
      const fresh = useSimulatorStore.getState();
      const effectiveBalance = fresh.currentBalance + (fresh.activePosition?.unrealizedPnl ?? 0);
      fresh.addEquityPoint(effectiveBalance);
      lastEquityPointRef.current = now;
    }

    // Check max trading days
    if (state.startDate) {
      const daysCheck = checkMaxTradingDays(state.startDate, state.config.maxTradingDays);
      if (daysCheck.exceeded) {
        const s = useSimulatorStore.getState();
        if (s.activePosition) {
          s.closePosition(currentPrice, 'rule-violation');
        }
        s.addViolation('Max Trading Days', `Challenge exceeded ${state.config.maxTradingDays} day limit`);
        s.failChallenge('Maximum trading days exceeded');
        return;
      }
    }

    // Check if challenge can be passed (re-read fresh state after any closes)
    const latest = useSimulatorStore.getState();
    if (!latest.activePosition && latest.trades.length > 0 && latest.status === 'active') {
      const profitCheck = checkProfitTarget(latest.currentBalance, latest.startingBalance, latest.config.profitTarget);
      if (profitCheck.reached) {
        const consistency = calculateConsistencyScore(latest.trades);
        const emotional = calculateEmotionalScore(latest.trades);
        const evaluation = evaluateChallenge(
          latest.currentBalance,
          latest.startingBalance,
          latest.tradingDays.length,
          latest.config,
          consistency,
          emotional
        );
        if (evaluation.canPass) {
          latest.passChallenge();
        }
      }
    }
  }, [btcTicker]);

  // Daily reset interval
  useEffect(() => {
    if (status !== 'active') return;
    const interval = setInterval(checkDailyReset, 60000);
    return () => clearInterval(interval);
  }, [status, checkDailyReset]);

  return (
    <div className="max-w-[1900px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      <div className="grid grid-cols-12 gap-3 sm:gap-4 lg:gap-5">
        <ChallengeHeader />
        <PriceDisplay />
        <TradePanel />
        <PositionCard />
        <EquityCurve />
        <EvaluationMetrics />
        <TradeHistory />
        <ViolationsLog />
      </div>
    </div>
  );
}
