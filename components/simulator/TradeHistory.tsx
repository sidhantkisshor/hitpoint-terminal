'use client';

import { useSimulatorStore } from '@/store/useSimulatorStore';

export function TradeHistory() {
  const trades = useSimulatorStore((s) => s.trades);

  return (
    <div className="bento-item col-span-12 lg:col-span-8">
      <div className="item-header">
        <span className="item-title">Trade History</span>
        <span className="text-xs text-white/30 font-mono">{trades.length} trades</span>
      </div>
      {trades.length === 0 ? (
        <p className="text-white/20 text-sm text-center py-8">No trades yet</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-white/30 uppercase tracking-wider border-b border-white/5">
                <th className="py-2 text-left">#</th>
                <th className="py-2 text-left">Dir</th>
                <th className="py-2 text-right">Entry</th>
                <th className="py-2 text-right">Exit</th>
                <th className="py-2 text-right">Size</th>
                <th className="py-2 text-right">P&L</th>
                <th className="py-2 text-right">P&L%</th>
                <th className="py-2 text-left">Reason</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((trade, i) => (
                <tr key={trade.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                  <td className="py-2 font-mono text-white/40">{i + 1}</td>
                  <td className={`py-2 font-bold ${trade.direction === 'long' ? 'text-[#c4f82e]' : 'text-[#ff4757]'}`}>
                    {trade.direction.toUpperCase()}
                  </td>
                  <td className="py-2 text-right font-mono text-white/70">${trade.entryPrice.toLocaleString()}</td>
                  <td className="py-2 text-right font-mono text-white/70">${trade.exitPrice.toLocaleString()}</td>
                  <td className="py-2 text-right font-mono text-white/70">${trade.size.toLocaleString()}</td>
                  <td className={`py-2 text-right font-mono font-bold ${trade.pnl >= 0 ? 'text-[#c4f82e]' : 'text-[#ff4757]'}`}>
                    {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)}
                  </td>
                  <td className={`py-2 text-right font-mono ${trade.pnlPercent >= 0 ? 'text-[#c4f82e]/70' : 'text-[#ff4757]/70'}`}>
                    {(trade.pnlPercent * 100).toFixed(2)}%
                  </td>
                  <td className="py-2 text-white/40">{trade.closeReason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}