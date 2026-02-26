'use client';

import { useSimulatorStore } from '@/store/useSimulatorStore';

export function PositionCard() {
  const activePosition = useSimulatorStore((s) => s.activePosition);
  const closePosition = useSimulatorStore((s) => s.closePosition);
  const currentBalance = useSimulatorStore((s) => s.currentBalance);

  if (!activePosition) {
    return (
      <div className="bento-item col-span-12 md:col-span-6 lg:col-span-4 flex items-center justify-center">
        <p className="text-white/20 text-sm">No open position</p>
      </div>
    );
  }

  const pnl = activePosition.unrealizedPnl;
  const pnlPercent = (pnl / currentBalance) * 100;
  const isProfit = pnl >= 0;

  return (
    <div className="bento-item col-span-12 md:col-span-6 lg:col-span-4">
      <div className="item-header">
        <span className="item-title">Open Position</span>
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
          activePosition.direction === 'long'
            ? 'text-[#c4f82e] bg-[#c4f82e]/10'
            : 'text-[#ff4757] bg-[#ff4757]/10'
        }`}>
          {activePosition.direction.toUpperCase()}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <div className="text-center py-3">
          <p className={`text-3xl font-bold font-mono ${isProfit ? 'text-[#c4f82e]' : 'text-[#ff4757]'}`}>
            {isProfit ? '+' : ''}{pnl.toFixed(2)} USD
          </p>
          <p className={`text-sm font-mono ${isProfit ? 'text-[#c4f82e]/60' : 'text-[#ff4757]/60'}`}>
            {isProfit ? '+' : ''}{pnlPercent.toFixed(2)}%
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex justify-between py-1.5 border-b border-white/5">
            <span className="text-white/40">Entry</span>
            <span className="font-mono text-white/80">${activePosition.entryPrice.toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-white/5">
            <span className="text-white/40">Size</span>
            <span className="font-mono text-white/80">${activePosition.size.toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-white/5">
            <span className="text-white/40">Stop-Loss</span>
            <span className="font-mono text-[#ff4757]/80">${activePosition.stopLoss.toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-white/5">
            <span className="text-white/40">Take-Profit</span>
            <span className="font-mono text-[#c4f82e]/80">
              {activePosition.takeProfit ? `$${activePosition.takeProfit.toLocaleString()}` : '—'}
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            const exitPrice = activePosition.direction === 'long'
              ? activePosition.entryPrice * (1 + pnl / activePosition.size)
              : activePosition.entryPrice * (1 - pnl / activePosition.size);
            closePosition(exitPrice, 'manual');
          }}
          className="w-full py-3 rounded-xl font-bold text-sm bg-white/[0.05] border border-white/[0.1] text-white/60 hover:text-white hover:border-white/20 transition-all active:scale-[0.98]"
        >
          Close Position
        </button>
      </div>
    </div>
  );
}