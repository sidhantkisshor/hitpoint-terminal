import { BTCPriceTicker } from '@/components/BTCPriceTicker';
import { FearGreedIndex } from '@/components/FearGreedIndex';
import { LiquidationBubbles } from '@/components/LiquidationBubbles';
import { LongShortRatio } from '@/components/LongShortRatio';
import { FundingRates } from '@/components/FundingRates';
import { MarketDominance } from '@/components/MarketDominance';
import { MarketHeatmap } from '@/components/MarketHeatmap';
import { EconomicCalendar } from '@/components/EconomicCalendar';

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      {/* Pitch Black Background with Subtle Glow */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-black"></div>
        <div className="absolute top-1/5 left-1/5 w-[700px] h-[700px] bg-[#c4f82e]/4 rounded-full blur-[180px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/5 w-[600px] h-[600px] bg-[#c4f82e]/3 rounded-full blur-[160px] animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-[#c4f82e]/2 rounded-full blur-[200px] opacity-20"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-black/85 border-b border-white/10 shadow-2xl">
        <div className="max-w-[1900px] mx-auto px-8 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#c4f82e] to-[#a8e024] rounded-xl shadow-2xl shadow-[#c4f82e]/40 flex items-center justify-center">
              <div className="w-3 h-3 bg-black rounded-full"></div>
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">Hitpoint Terminal</span>
          </div>

          <nav className="hidden md:flex gap-8 text-sm text-gray-400 font-medium" aria-label="Main navigation">
            <a href="#markets" className="hover:text-[#c4f82e] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#c4f82e] rounded-md px-3 py-1.5" aria-label="Navigate to Markets section">Markets</a>
            <a href="#analytics" className="hover:text-[#c4f82e] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#c4f82e] rounded-md px-3 py-1.5" aria-label="Navigate to Analytics section">Analytics</a>
            <a href="#data" className="hover:text-[#c4f82e] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#c4f82e] rounded-md px-3 py-1.5" aria-label="Navigate to Data section">Data</a>
          </nav>

          <div className="flex items-center gap-2 bg-[#c4f82e]/15 px-4 py-2 rounded-full border border-[#c4f82e]/30 shadow-lg shadow-[#c4f82e]/20" role="status" aria-live="polite">
            <div className="w-2 h-2 bg-[#c4f82e] rounded-full shadow-lg shadow-[#c4f82e]/70 animate-pulse" aria-hidden="true"></div>
            <span className="text-xs text-[#c4f82e] font-bold tracking-wider">LIVE</span>
          </div>
        </div>
      </header>

      {/* Terminal Dashboard - Full Width */}
      <section className="relative z-10 px-8 py-8" aria-label="Cryptocurrency market dashboard">
        <div className="max-w-[1900px] mx-auto">
          {/* Bento Grid - Cleaner Layout */}
          <div className="grid grid-cols-12 gap-5 auto-rows-[minmax(300px,auto)]" role="region" aria-label="Market data widgets">
            {/* Row 1: Primary Metrics */}
            <BTCPriceTicker />
            <FearGreedIndex />
            <MarketDominance />

            {/* Row 2: Market Overview */}
            <MarketHeatmap />
            <EconomicCalendar />

            {/* Row 3: Trading Metrics */}
            <LiquidationBubbles />
            <FundingRates />
          </div>
        </div>
      </section>
    </main>
  );
}
