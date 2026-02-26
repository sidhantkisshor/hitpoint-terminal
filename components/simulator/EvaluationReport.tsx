'use client';

import { useSimulatorStore } from '@/store/useSimulatorStore';
import {
  calculateConsistencyScore,
  calculateEmotionalScore,
  calculateRiskScore,
  calculateDisciplineScore,
} from '@/lib/simulator-evaluation';
import { EquityCurve } from './EquityCurve';
import Link from 'next/link';

function ScoreCard({ label, score, description }: { label: string; score: number; description: string }) {
  const getColor = (s: number) => {
    if (s >= 80) return '#c4f82e';
    if (s >= 60) return '#00F0FF';
    if (s >= 40) return '#FFA500';
    return '#ff4757';
  };
  const color = getColor(score);

  return (
    <div className="bento-item col-span-6 lg:col-span-3">
      <span className="text-xs text-white/40 uppercase tracking-wider">{label}</span>
      <div className="flex items-end gap-2 mt-3">
        <span className="text-4xl font-bold font-mono" style={{ color }}>{score}</span>
        <span className="text-sm text-white/20 mb-1">/ 100</span>
      </div>
      <div className="mt-3 h-2 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
      <p className="text-xs text-white/30 mt-3">{description}</p>
    </div>
  );
}

export function EvaluationReport() {
  const status = useSimulatorStore((s) => s.status);
  const config = useSimulatorStore((s) => s.config);
  const startDate = useSimulatorStore((s) => s.startDate);
  const startingBalance = useSimulatorStore((s) => s.startingBalance);
  const currentBalance = useSimulatorStore((s) => s.currentBalance);
  const trades = useSimulatorStore((s) => s.trades);
  const tradingDays = useSimulatorStore((s) => s.tradingDays);
  const violations = useSimulatorStore((s) => s.violations);
  const failReason = useSimulatorStore((s) => s.failReason);
  const resetChallenge = useSimulatorStore((s) => s.resetChallenge);

  const passed = status === 'passed';
  const pnl = currentBalance - startingBalance;
  const pnlPercent = (pnl / startingBalance) * 100;

  const consistency = calculateConsistencyScore(trades);
  const emotional = calculateEmotionalScore(trades);
  const risk = calculateRiskScore(trades, config);
  const discipline = calculateDisciplineScore(trades, 0, false, tradingDays.length, config.minTradingDays, !passed);
  const overallScore = Math.round((consistency + emotional + risk + discipline) / 4);

  const winningTrades = trades.filter((t) => t.pnl > 0);
  const losingTrades = trades.filter((t) => t.pnl < 0);
  const winRate = trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0;
  const avgWin = winningTrades.length > 0 ? winningTrades.reduce((s, t) => s + t.pnl, 0) / winningTrades.length : 0;
  const avgLoss = losingTrades.length > 0 ? Math.abs(losingTrades.reduce((s, t) => s + t.pnl, 0) / losingTrades.length) : 0;
  const avgRR = avgLoss > 0 ? avgWin / avgLoss : 0;
  const bestTrade = trades.length > 0 ? Math.max(...trades.map((t) => t.pnl)) : 0;
  const worstTrade = trades.length > 0 ? Math.min(...trades.map((t) => t.pnl)) : 0;

  const durationDays = startDate
    ? Math.ceil((Date.now() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="max-w-[1200px] mx-auto px-8 py-16">
      {/* Hero */}
      <div className="text-center mb-16">
        <div className={`inline-block text-7xl font-bold mb-4 ${
          passed
            ? 'text-[#c4f82e] drop-shadow-[0_0_40px_rgba(196,248,46,0.4)]'
            : 'text-[#ff4757] drop-shadow-[0_0_40px_rgba(255,71,87,0.4)]'
        }`}>
          {passed ? 'PASSED' : 'FAILED'}
        </div>
        <p className="text-white/40 text-sm">
          ${(config.accountSize / 1000).toFixed(0)}K Account &middot; {config.challengeType} Challenge &middot; {config.tradingStyle}
        </p>
        <p className="text-white/30 text-xs mt-2">
          {passed ? `Completed in ${durationDays} days` : `Failed on day ${durationDays}`}
          {failReason && ` \u2014 ${failReason}`}
        </p>
      </div>

      {/* Overall Score */}
      <div className="text-center mb-12">
        <div className="inline-flex flex-col items-center">
          <svg width="160" height="160" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
            <circle
              cx="80" cy="80" r="70" fill="none"
              stroke={passed ? '#c4f82e' : '#ff4757'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${overallScore * 4.4} ${440 - overallScore * 4.4}`}
              strokeDashoffset="110"
              className="transition-all duration-1000"
            />
            <text x="80" y="75" textAnchor="middle" fill="white" fontSize="36" fontWeight="bold" fontFamily="monospace">
              {overallScore}
            </text>
            <text x="80" y="100" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="12">
              OVERALL
            </text>
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5">
        {/* Score Cards */}
        <ScoreCard label="Risk Management" score={risk} description="Position sizing discipline and SL usage" />
        <ScoreCard label="Discipline" score={discipline} description="Adherence to challenge rules" />
        <ScoreCard label="Emotional Stability" score={emotional} description="Revenge trading and overtrading control" />
        <ScoreCard label="Consistency" score={consistency} description="Profit distribution and daily P&L stability" />

        {/* Equity Curve - full width */}
        <div className="col-span-12">
          <EquityCurve />
        </div>

        {/* Stats Summary */}
        <div className="bento-item col-span-12 lg:col-span-6">
          <div className="item-header">
            <span className="item-title">Performance Summary</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              ['Total P&L', `${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}`, pnl >= 0],
              ['Return', `${pnlPercent >= 0 ? '+' : ''}${pnlPercent.toFixed(2)}%`, pnlPercent >= 0],
              ['Total Trades', `${trades.length}`, true],
              ['Win Rate', `${winRate.toFixed(1)}%`, winRate >= 50],
              ['Avg R:R', `${avgRR.toFixed(2)}`, avgRR >= 1],
              ['Best Trade', `${bestTrade >= 0 ? '+' : ''}$${bestTrade.toFixed(2)}`, bestTrade >= 0],
              ['Worst Trade', `${worstTrade >= 0 ? '+' : ''}$${worstTrade.toFixed(2)}`, worstTrade >= 0],
              ['Trading Days', `${tradingDays.length}`, true],
            ].map(([label, value, positive]) => (
              <div key={label as string} className="flex justify-between py-2 border-b border-white/5">
                <span className="text-white/40">{label}</span>
                <span className={`font-mono font-bold ${positive ? 'text-[#c4f82e]' : 'text-[#ff4757]'}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Violations */}
        {violations.length > 0 && (
          <div className="bento-item col-span-12 lg:col-span-6">
            <div className="item-header">
              <span className="item-title">Violations Log</span>
              <span className="text-xs font-bold text-[#ff4757] bg-[#ff4757]/10 px-2 py-1 rounded-full">{violations.length}</span>
            </div>
            <div className="flex flex-col gap-2">
              {violations.map((v, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-white/[0.03]">
                  <div>
                    <span className="text-xs font-bold text-[#ff4757]">{v.type}</span>
                    <p className="text-xs text-white/40">{v.message}</p>
                  </div>
                  <span className="text-[10px] text-white/20 font-mono">{new Date(v.timestamp).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trade History */}
        <div className="bento-item col-span-12">
          <div className="item-header">
            <span className="item-title">All Trades</span>
          </div>
          {trades.length === 0 ? (
            <p className="text-white/20 text-sm text-center py-4">No trades recorded</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-white/30 uppercase tracking-wider border-b border-white/5">
                    <th className="py-2 text-left">#</th>
                    <th className="py-2 text-left">Direction</th>
                    <th className="py-2 text-right">Entry</th>
                    <th className="py-2 text-right">Exit</th>
                    <th className="py-2 text-right">Size</th>
                    <th className="py-2 text-right">P&L</th>
                    <th className="py-2 text-right">P&L%</th>
                    <th className="py-2 text-left">Close Reason</th>
                    <th className="py-2 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.map((trade, i) => (
                    <tr key={trade.id} className="border-b border-white/[0.03]">
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
                      <td className="py-2 text-white/30 font-mono">{new Date(trade.closedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4 mt-12 justify-center">
        <button
          onClick={resetChallenge}
          className="px-8 py-4 rounded-2xl bg-[#c4f82e] text-black font-bold text-sm hover:bg-[#d4ff4e] transition-all shadow-lg shadow-[#c4f82e]/20 active:scale-[0.98]"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="px-8 py-4 rounded-2xl bg-white/[0.05] border border-white/[0.1] text-white/60 font-bold text-sm hover:text-white hover:border-white/20 transition-all active:scale-[0.98]"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
