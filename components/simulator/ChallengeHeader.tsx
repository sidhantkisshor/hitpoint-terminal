'use client';

import { useSimulatorStore } from '@/store/useSimulatorStore';
import { checkDailyLoss, checkTotalDrawdown, checkMaxTradingDays, checkProfitTarget } from '@/lib/simulator-evaluation';

export function ChallengeHeader() {
  const currentBalance = useSimulatorStore((s) => s.currentBalance);
  const startingBalance = useSimulatorStore((s) => s.startingBalance);
  const dailyStartBalance = useSimulatorStore((s) => s.dailyStartBalance);
  const startDate = useSimulatorStore((s) => s.startDate);
  const config = useSimulatorStore((s) => s.config);
  const tradingDays = useSimulatorStore((s) => s.tradingDays);
  const activePosition = useSimulatorStore((s) => s.activePosition);

  const effectiveBalance = currentBalance + (activePosition?.unrealizedPnl ?? 0);
  const pnlPercent = ((effectiveBalance - startingBalance) / startingBalance) * 100;
  const dailyLoss = checkDailyLoss(dailyStartBalance, effectiveBalance, config.dailyLossLimit);
  const totalDrawdown = checkTotalDrawdown(startingBalance, effectiveBalance, config.totalLossLimit);
  const profit = checkProfitTarget(effectiveBalance, startingBalance, config.profitTarget);
  const days = startDate ? checkMaxTradingDays(startDate, config.maxTradingDays) : { daysElapsed: 0, exceeded: false };
  const progressPercent = Math.min(100, Math.max(0, (profit.currentProfit / config.profitTarget) * 100));

  return (
    <div className="bento-item col-span-12 !py-4">
      <div className="flex items-center justify-between gap-6 flex-wrap">
        <div>
          <span className="text-xs text-white/40 uppercase tracking-wider">Balance</span>
          <p className="text-2xl font-bold font-mono text-white">
            ${effectiveBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div>
          <span className="text-xs text-white/40 uppercase tracking-wider">P&L</span>
          <p className={`text-xl font-bold font-mono ${pnlPercent >= 0 ? 'text-[#c4f82e]' : 'text-[#ff4757]'}`}>
            {pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
          </p>
        </div>

        <div className="flex-1 min-w-[200px] max-w-[300px]">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-white/40 uppercase tracking-wider">Profit Target</span>
            <span className="font-mono text-[#c4f82e]">{(profit.currentProfit * 100).toFixed(1)}% / {(config.profitTarget * 100).toFixed(0)}%</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#c4f82e] rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div>
          <span className="text-xs text-white/40 uppercase tracking-wider">Daily Loss Left</span>
          <p className={`text-lg font-bold font-mono ${dailyLoss.currentLoss > config.dailyLossLimit * 0.7 ? 'text-[#ff4757]' : 'text-white/80'}`}>
            {((config.dailyLossLimit - dailyLoss.currentLoss) * 100).toFixed(1)}%
          </p>
        </div>

        <div>
          <span className="text-xs text-white/40 uppercase tracking-wider">Max DD Left</span>
          <p className={`text-lg font-bold font-mono ${totalDrawdown.currentDrawdown > config.totalLossLimit * 0.7 ? 'text-[#ff4757]' : 'text-white/80'}`}>
            {((config.totalLossLimit - totalDrawdown.currentDrawdown) * 100).toFixed(1)}%
          </p>
        </div>

        <div>
          <span className="text-xs text-white/40 uppercase tracking-wider">Days</span>
          <p className="text-lg font-bold font-mono text-white/80">
            {days.daysElapsed} / {config.maxTradingDays}
          </p>
        </div>

        <div>
          <span className="text-xs text-white/40 uppercase tracking-wider">Trading Days</span>
          <p className="text-lg font-bold font-mono text-white/80">
            {tradingDays.length} / {config.minTradingDays}
          </p>
        </div>
      </div>
    </div>
  );
}