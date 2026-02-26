'use client';

import { useState } from 'react';
import { useSimulatorStore } from '@/store/useSimulatorStore';
import { useMarketStore } from '@/store/useMarketStore';
import { checkRiskPerTrade } from '@/lib/simulator-evaluation';
import type { TradeDirection } from '@/store/useSimulatorStore';

export function TradePanel() {
  const currentBalance = useSimulatorStore((s) => s.currentBalance);
  const config = useSimulatorStore((s) => s.config);
  const activePosition = useSimulatorStore((s) => s.activePosition);
  const openPosition = useSimulatorStore((s) => s.openPosition);

  const btcTicker = useMarketStore((s) => s.btcTicker);
  const currentPrice = btcTicker ? parseFloat(btcTicker.price) : null;

  const [direction, setDirection] = useState<TradeDirection>('long');
  const [sizeInput, setSizeInput] = useState('');
  const [slInput, setSlInput] = useState('');
  const [tpInput, setTpInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const size = parseFloat(sizeInput) || 0;
  const sl = parseFloat(slInput) || 0;
  const tp = tpInput ? parseFloat(tpInput) : null;

  const riskCheck = currentPrice && sl > 0 && size > 0
    ? checkRiskPerTrade(currentPrice, sl, size, currentBalance, config.maxRiskPerTrade)
    : null;

  const handleExecute = () => {
    setError(null);

    if (!currentPrice) { setError('Waiting for price data...'); return; }
    if (activePosition) { setError('Close your current position first'); return; }
    if (size <= 0) { setError('Enter a valid position size'); return; }
    if (size > currentBalance) { setError('Size exceeds available balance'); return; }
    if (sl <= 0) { setError('Stop-loss is required'); return; }

    if (direction === 'long' && sl >= currentPrice) {
      setError('Stop-loss must be below entry price for longs');
      return;
    }
    if (direction === 'short' && sl <= currentPrice) {
      setError('Stop-loss must be above entry price for shorts');
      return;
    }

    if (tp !== null) {
      if (direction === 'long' && tp <= currentPrice) {
        setError('Take-profit must be above entry price for longs');
        return;
      }
      if (direction === 'short' && tp >= currentPrice) {
        setError('Take-profit must be below entry price for shorts');
        return;
      }
    }

    const risk = checkRiskPerTrade(currentPrice, sl, size, currentBalance, config.maxRiskPerTrade);
    if (!risk.allowed) {
      setError(`Risk per trade exceeds ${(config.maxRiskPerTrade * 100).toFixed(0)}% limit (${(risk.riskPercent * 100).toFixed(1)}%)`);
      return;
    }

    openPosition({
      id: crypto.randomUUID(),
      direction,
      entryPrice: currentPrice,
      size,
      stopLoss: sl,
      takeProfit: tp,
      openedAt: new Date().toISOString(),
    });

    setSizeInput('');
    setSlInput('');
    setTpInput('');
    setError(null);
  };

  const isDisabled = !!activePosition || !currentPrice;

  return (
    <div className="bento-item col-span-12 md:col-span-6 lg:col-span-4">
      <div className="item-header">
        <span className="item-title">Trade</span>
      </div>

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setDirection('long')}
            disabled={isDisabled}
            className={`py-3 rounded-xl font-bold text-sm transition-all ${
              direction === 'long'
                ? 'bg-[#c4f82e]/15 text-[#c4f82e] border border-[#c4f82e]/40'
                : 'bg-white/[0.03] text-white/40 border border-white/[0.06] hover:text-white/60'
            } disabled:opacity-30`}
          >
            LONG
          </button>
          <button
            onClick={() => setDirection('short')}
            disabled={isDisabled}
            className={`py-3 rounded-xl font-bold text-sm transition-all ${
              direction === 'short'
                ? 'bg-[#ff4757]/15 text-[#ff4757] border border-[#ff4757]/40'
                : 'bg-white/[0.03] text-white/40 border border-white/[0.06] hover:text-white/60'
            } disabled:opacity-30`}
          >
            SHORT
          </button>
        </div>

        <div>
          <label className="text-xs text-white/40 uppercase tracking-wider block mb-1">Size (USD)</label>
          <input
            type="number"
            value={sizeInput}
            onChange={(e) => setSizeInput(e.target.value)}
            placeholder={`Max: $${currentBalance.toLocaleString()}`}
            disabled={isDisabled}
            className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-[#c4f82e]/40 transition-colors disabled:opacity-30"
          />
        </div>

        <div>
          <label className="text-xs text-white/40 uppercase tracking-wider block mb-1">Stop-Loss Price *</label>
          <input
            type="number"
            value={slInput}
            onChange={(e) => setSlInput(e.target.value)}
            placeholder="Required"
            disabled={isDisabled}
            className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-[#ff4757]/40 transition-colors disabled:opacity-30"
          />
        </div>

        <div>
          <label className="text-xs text-white/40 uppercase tracking-wider block mb-1">Take-Profit Price</label>
          <input
            type="number"
            value={tpInput}
            onChange={(e) => setTpInput(e.target.value)}
            placeholder="Optional"
            disabled={isDisabled}
            className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-[#c4f82e]/40 transition-colors disabled:opacity-30"
          />
        </div>

        {riskCheck && (
          <div className={`text-xs font-mono px-3 py-2 rounded-lg ${
            riskCheck.allowed
              ? 'text-[#c4f82e]/70 bg-[#c4f82e]/5'
              : 'text-[#ff4757] bg-[#ff4757]/5'
          }`}>
            Risk: {(riskCheck.riskPercent * 100).toFixed(2)}% of account
          </div>
        )}

        {error && (
          <div className="text-xs text-[#ff4757] bg-[#ff4757]/5 px-3 py-2 rounded-lg">
            {error}
          </div>
        )}

        <button
          onClick={handleExecute}
          disabled={isDisabled}
          className={`w-full py-4 rounded-xl font-bold text-sm transition-all ${
            direction === 'long'
              ? 'bg-[#c4f82e] text-black hover:bg-[#d4ff4e] shadow-lg shadow-[#c4f82e]/20'
              : 'bg-[#ff4757] text-white hover:bg-[#ff5a68] shadow-lg shadow-[#ff4757]/20'
          } disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98]`}
        >
          {activePosition ? 'Position Open' : `Open ${direction === 'long' ? 'Long' : 'Short'}`}
        </button>
      </div>
    </div>
  );
}