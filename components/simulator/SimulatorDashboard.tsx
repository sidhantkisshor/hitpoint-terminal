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

  const activePosition = useSimulatorStore((s) => s.activePosition);
  const status = useSimulatorStore((s) => s.status);
  const config = useSimulatorStore((s) => s.config);
  const currentBalance = useSimulatorStore((s) => s.currentBalance);
  const startingBalance = useSimulatorStore((s) => s.startingBalance);
  const dailyStartBalance = useSimulatorStore((s) => s.dailyStartBalance);
  const startDate = useSimulatorStore((s) => s.startDate);
  const tradingDays = useSimulatorStore((s) => s.tradingDays);
  const trades = useSimulatorStore((s) => s.trades);

  const updateUnrealizedPnl = useSimulatorStore((s) => s.updateUnrealizedPnl);
  const closePosition = useSimulatorStore((s) => s.closePosition);
  const addEquityPoint = useSimulatorStore((s) => s.addEquityPoint);
  const addViolation = useSimulatorStore((s) => s.addViolation);
  const failChallenge = useSimulatorStore((s) => s.failChallenge);
  const passChallenge = useSimulatorStore((s) => s.passChallenge);
  const checkDailyReset = useSimulatorStore((s) => s.checkDailyReset);

  // Price tick loop
  useEffect(() => {
    if (status !== 'active' || !btcTicker) return;

    const currentPrice = parseFloat(btcTicker.price);
    if (isNaN(currentPrice) || currentPrice <= 0) return;

    checkDailyReset();

    if (activePosition) {
      const pnl = calculateUnrealizedPnl(
        activePosition.direction,
        activePosition.entryPrice,
        currentPrice,
        activePosition.size
      );
      updateUnrealizedPnl(pnl);

      const tpSlResult = checkTpSlHit(
        activePosition.direction,
        currentPrice,
        activePosition.takeProfit,
        activePosition.stopLoss
      );

      if (tpSlResult) {
        closePosition(currentPrice, tpSlResult);
        if (tpSlResult === 'sl') {
          addViolation('Stop-Loss Hit', `Position closed at $${currentPrice.toLocaleString()}`);
        }
        return;
      }

      const effectiveBalance = currentBalance + pnl;
      const dailyLoss = checkDailyLoss(dailyStartBalance, effectiveBalance, config.dailyLossLimit);
      const totalDD = checkTotalDrawdown(startingBalance, effectiveBalance, config.totalLossLimit);

      if (dailyLoss.breached) {
        closePosition(currentPrice, 'rule-violation');
        addViolation('Daily Loss Limit', `Daily loss of ${(dailyLoss.currentLoss * 100).toFixed(1)}% exceeded ${(config.dailyLossLimit * 100)}% limit`);
        failChallenge('Daily loss limit breached');
        return;
      }

      if (totalDD.breached) {
        closePosition(currentPrice, 'rule-violation');
        addViolation('Total Drawdown', `Drawdown of ${(totalDD.currentDrawdown * 100).toFixed(1)}% exceeded ${(config.totalLossLimit * 100)}% limit`);
        failChallenge('Total drawdown limit breached');
        return;
      }
    }

    // Equity curve (throttled: 1 point per 30 seconds)
    const now = Date.now();
    if (now - lastEquityPointRef.current > 30000) {
      const effectiveBalance = currentBalance + (activePosition?.unrealizedPnl ?? 0);
      addEquityPoint(effectiveBalance);
      lastEquityPointRef.current = now;
    }

    // Check max trading days
    if (startDate) {
      const daysCheck = checkMaxTradingDays(startDate, config.maxTradingDays);
      if (daysCheck.exceeded) {
        if (activePosition) {
          closePosition(parseFloat(btcTicker.price), 'rule-violation');
        }
        addViolation('Max Trading Days', `Challenge exceeded ${config.maxTradingDays} day limit`);
        failChallenge('Maximum trading days exceeded');
        return;
      }
    }

    // Check if challenge can be passed
    if (!activePosition && trades.length > 0) {
      const profitCheck = checkProfitTarget(currentBalance, startingBalance, config.profitTarget);
      if (profitCheck.reached) {
        const consistency = calculateConsistencyScore(trades);
        const emotional = calculateEmotionalScore(trades);
        const evaluation = evaluateChallenge(
          currentBalance,
          startingBalance,
          tradingDays.length,
          config,
          consistency,
          emotional
        );
        if (evaluation.canPass) {
          passChallenge();
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [btcTicker]);

  // Daily reset interval
  useEffect(() => {
    if (status !== 'active') return;
    const interval = setInterval(checkDailyReset, 60000);
    return () => clearInterval(interval);
  }, [status, checkDailyReset]);

  return (
    <div className="max-w-[1900px] mx-auto px-8 py-8">
      <div className="grid grid-cols-12 gap-5">
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
