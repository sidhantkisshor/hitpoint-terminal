'use client';

import { useSimulatorStore } from '@/store/useSimulatorStore';
import {
  calculateConsistencyScore,
  calculateEmotionalScore,
  calculateRiskScore,
  calculateDisciplineScore,
} from '@/lib/simulator-evaluation';

function MetricCard({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4">
      <span className="text-xs text-white/40 uppercase tracking-wider">{label}</span>
      <div className="mt-2 flex items-end gap-2">
        <span className="text-2xl font-bold font-mono" style={{ color }}>{score}</span>
        <span className="text-xs text-white/30 mb-1">/ 100</span>
      </div>
      <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export function EvaluationMetrics() {
  const trades = useSimulatorStore((s) => s.trades);
  const config = useSimulatorStore((s) => s.config);
  const tradingDays = useSimulatorStore((s) => s.tradingDays);
  const status = useSimulatorStore((s) => s.status);

  const consistency = calculateConsistencyScore(trades);
  const emotional = calculateEmotionalScore(trades);
  const risk = calculateRiskScore(trades, config);
  const discipline = calculateDisciplineScore(
    trades,
    0,
    false,
    tradingDays.length,
    config.minTradingDays,
    status === 'failed'
  );

  const getColor = (score: number) => {
    if (score >= 80) return '#c4f82e';
    if (score >= 60) return '#00F0FF';
    if (score >= 40) return '#FFA500';
    return '#ff4757';
  };

  return (
    <div className="bento-item col-span-12 lg:col-span-6">
      <div className="item-header">
        <span className="item-title">Evaluation Scores</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <MetricCard label="Consistency" score={consistency} color={getColor(consistency)} />
        <MetricCard label="Emotional" score={emotional} color={getColor(emotional)} />
        <MetricCard label="Risk Mgmt" score={risk} color={getColor(risk)} />
        <MetricCard label="Discipline" score={discipline} color={getColor(discipline)} />
      </div>
    </div>
  );
}