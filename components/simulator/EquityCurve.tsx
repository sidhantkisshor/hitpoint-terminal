'use client';

import { useSimulatorStore } from '@/store/useSimulatorStore';

export function EquityCurve() {
  const equityCurve = useSimulatorStore((s) => s.equityCurve);
  const startingBalance = useSimulatorStore((s) => s.startingBalance);

  if (equityCurve.length < 2) {
    return (
      <div className="bento-item col-span-12 lg:col-span-6 flex items-center justify-center">
        <p className="text-white/20 text-sm">Equity curve will appear after your first trade</p>
      </div>
    );
  }

  const balances = equityCurve.map((p) => p.balance);
  const minBal = Math.min(...balances) * 0.995;
  const maxBal = Math.max(...balances) * 1.005;
  const range = maxBal - minBal || 1;

  const width = 600;
  const height = 200;
  const padding = 10;

  const points = equityCurve.map((point, i) => {
    const x = padding + (i / (equityCurve.length - 1)) * (width - padding * 2);
    const y = padding + (1 - (point.balance - minBal) / range) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  const lastBalance = balances[balances.length - 1];
  const isProfit = lastBalance >= startingBalance;

  const areaPoints = `${padding},${height - padding} ${points} ${width - padding},${height - padding}`;

  return (
    <div className="bento-item col-span-12 lg:col-span-6">
      <div className="item-header">
        <span className="item-title">Equity Curve</span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        <defs>
          <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isProfit ? '#c4f82e' : '#ff4757'} stopOpacity="0.3" />
            <stop offset="100%" stopColor={isProfit ? '#c4f82e' : '#ff4757'} stopOpacity="0" />
          </linearGradient>
        </defs>
        <line
          x1={padding} y1={padding + (1 - (startingBalance - minBal) / range) * (height - padding * 2)}
          x2={width - padding} y2={padding + (1 - (startingBalance - minBal) / range) * (height - padding * 2)}
          stroke="white" strokeOpacity="0.1" strokeDasharray="4,4"
        />
        <polygon points={areaPoints} fill="url(#equityGradient)" />
        <polyline
          points={points}
          fill="none"
          stroke={isProfit ? '#c4f82e' : '#ff4757'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}