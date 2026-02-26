'use client';

import { useSimulatorStore, type AccountSize, type ChallengeType } from '@/store/useSimulatorStore';

const ACCOUNT_SIZES: { value: AccountSize; label: string }[] = [
  { value: 10000, label: '$10K' },
  { value: 25000, label: '$25K' },
  { value: 50000, label: '$50K' },
  { value: 100000, label: '$100K' },
];

const CHALLENGE_TYPES: { value: ChallengeType; label: string; days: number }[] = [
  { value: '10-day', label: 'Sprint', days: 10 },
  { value: '30-day', label: 'Standard', days: 30 },
];

export function SimulatorSetup() {
  const config = useSimulatorStore((s) => s.config);
  const updateConfig = useSimulatorStore((s) => s.updateConfig);
  const startChallenge = useSimulatorStore((s) => s.startChallenge);

  return (
    <div className="max-w-[900px] mx-auto px-8 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-white mb-4">
          Funded Account Challenge
        </h1>
        <p className="text-lg text-white/50 max-w-[600px] mx-auto">
          Are you ready to pass a prop firm challenge? Trade with real market prices under real evaluation rules. No money at risk.
        </p>
      </div>

      <div className="mb-12">
        <h2 className="text-xs font-semibold uppercase tracking-[2px] text-white/40 mb-4">Account Size</h2>
        <div className="grid grid-cols-4 gap-3">
          {ACCOUNT_SIZES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => updateConfig({ accountSize: value })}
              className={`py-4 rounded-2xl text-center font-bold text-lg transition-all duration-300 border ${
                config.accountSize === value
                  ? 'bg-[#c4f82e]/10 border-[#c4f82e]/40 text-[#c4f82e] shadow-lg shadow-[#c4f82e]/10'
                  : 'bg-white/[0.03] border-white/[0.06] text-white/60 hover:border-white/15 hover:text-white/80'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-xs font-semibold uppercase tracking-[2px] text-white/40 mb-4">Challenge Duration</h2>
        <div className="grid grid-cols-2 gap-3">
          {CHALLENGE_TYPES.map(({ value, label, days }) => (
            <button
              key={value}
              onClick={() => updateConfig({ challengeType: value })}
              className={`py-5 rounded-2xl text-center transition-all duration-300 border ${
                config.challengeType === value
                  ? 'bg-[#c4f82e]/10 border-[#c4f82e]/40 shadow-lg shadow-[#c4f82e]/10'
                  : 'bg-white/[0.03] border-white/[0.06] hover:border-white/15'
              }`}
            >
              <span className={`block text-lg font-bold ${config.challengeType === value ? 'text-[#c4f82e]' : 'text-white/60'}`}>
                {label}
              </span>
              <span className="block text-sm text-white/30 mt-1">{days} days</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bento-item mb-12">
        <div className="item-header">
          <span className="item-title">Challenge Rules</span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between items-center py-2 border-b border-white/5">
            <span className="text-white/50">Profit Target</span>
            <span className="font-mono font-bold text-[#c4f82e]">+{(config.profitTarget * 100).toFixed(0)}%</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-white/5">
            <span className="text-white/50">Daily Loss Limit</span>
            <span className="font-mono font-bold text-[#ff4757]">-{(config.dailyLossLimit * 100).toFixed(0)}%</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-white/5">
            <span className="text-white/50">Max Drawdown</span>
            <span className="font-mono font-bold text-[#ff4757]">-{(config.totalLossLimit * 100).toFixed(0)}%</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-white/5">
            <span className="text-white/50">Max Risk/Trade</span>
            <span className="font-mono font-bold text-white/80">{(config.maxRiskPerTrade * 100).toFixed(0)}%</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-white/5">
            <span className="text-white/50">Min Trading Days</span>
            <span className="font-mono font-bold text-white/80">{config.minTradingDays}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-white/5">
            <span className="text-white/50">Max Trading Days</span>
            <span className="font-mono font-bold text-white/80">{config.maxTradingDays}</span>
          </div>
        </div>
      </div>

      <button
        onClick={startChallenge}
        className="w-full py-5 rounded-2xl bg-[#c4f82e] text-black font-bold text-lg tracking-wide hover:bg-[#d4ff4e] transition-all duration-300 shadow-lg shadow-[#c4f82e]/25 hover:shadow-xl hover:shadow-[#c4f82e]/35 hover:scale-[1.02] active:scale-[0.98]"
      >
        Start Challenge
      </button>
    </div>
  );
}
