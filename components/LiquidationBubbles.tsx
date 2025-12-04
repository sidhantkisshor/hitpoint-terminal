'use client';

import { useEffect, useState } from 'react';

type DisplayMode = 'chart' | 'coinglass';

export function LiquidationBubbles() {
  const [displayMode, setDisplayMode] = useState<DisplayMode>('chart');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="bento-item col-span-12 md:col-span-12 lg:col-span-5 row-span-1">
      <div className="item-header">
        <div className="flex items-center gap-3">
          <span className="item-title">LIQUIDATIONS</span>
          <div className="flex gap-1 bg-white/5 p-0.5 rounded-full">
            <button
              onClick={() => setDisplayMode('chart')}
              className={`text-[10px] px-2 py-0.5 rounded-full transition-all ${
                displayMode === 'chart'
                  ? 'bg-[#7ee787] text-black font-semibold'
                  : 'text-gray-500 hover:text-gray-400'
              }`}
            >
              CHART
            </button>
            <button
              onClick={() => setDisplayMode('coinglass')}
              className={`text-[10px] px-2 py-0.5 rounded-full transition-all ${
                displayMode === 'coinglass'
                  ? 'bg-[#7ee787] text-black font-semibold'
                  : 'text-gray-500 hover:text-gray-400'
              }`}
            >
              HEATMAP
            </button>
          </div>
        </div>
        <div className="live-indicator">
          <span className="live-dot"></span>
          <span>LIVE</span>
        </div>
      </div>

      <div className="relative h-full min-h-[400px] rounded-lg overflow-hidden">
        {mounted && displayMode === 'chart' && (
          <iframe
            src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview_chart&symbol=BINANCE%3ABTCUSDT&interval=15&hidesidetoolbar=1&saveimage=0&toolbarbg=0a0a0a&studies=%5B%5D&theme=dark&style=1&timezone=Etc%2FUTC&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%22use_localstorage_for_settings%22%2C%22header_symbol_search%22%2C%22symbol_search_hot_key%22%5D&locale=en&utm_source=localhost&utm_medium=widget&utm_campaign=chart&utm_term=BINANCE%3ABTCUSDT"
            className="w-full h-full border-0 bg-transparent"
            style={{ minHeight: '400px' }}
            title="TradingView BTC/USDT Chart"
            sandbox="allow-scripts allow-same-origin"
            loading="lazy"
          />
        )}

        {mounted && displayMode === 'coinglass' && (
          <div className="w-full h-full flex flex-col">
            <iframe
              src="https://www.coinglass.com/pro/futures/LiquidationHeatMap?e=Binance&coin=BTC"
              className="w-full flex-1 border-0 rounded-lg bg-transparent"
              style={{ minHeight: '400px' }}
              title="CoinGlass Liquidation Heatmap"
              sandbox="allow-scripts allow-same-origin"
              loading="lazy"
            />
            <div className="mt-2 p-2 bg-white/5 rounded-lg text-center">
              <a
                href="https://www.coinglass.com/LiquidationData"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-500 hover:text-[#7ee787] transition-colors"
              >
                Data powered by CoinGlass →
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
