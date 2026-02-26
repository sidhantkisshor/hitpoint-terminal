import { BTCPriceTicker } from '@/components/BTCPriceTicker';
import { FearGreedIndex } from '@/components/FearGreedIndex';
import { LiquidationBubbles } from '@/components/LiquidationBubbles';
import { FundingRates } from '@/components/FundingRates';
import { MarketDominance } from '@/components/MarketDominance';
import { MarketHeatmap } from '@/components/MarketHeatmap';
import { EconomicCalendar } from '@/components/EconomicCalendar';
import { SectionNav } from '@/components/SectionNav';
import { InteractiveCharts } from '@/components/InteractiveCharts';
import { ScrollAnimator } from '@/components/ScrollAnimator';
import { CommunityShowcase } from '@/components/CommunityShowcase';
import { TwitterFeed } from '@/components/TwitterFeed';
import { PartnerLogos } from '@/components/PartnerLogos';
import { NewsletterPopup } from '@/components/NewsletterPopup';

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

      <ScrollAnimator />

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-black/85 border-b border-white/10 shadow-2xl">
        <div className="max-w-[1900px] mx-auto px-8 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Hitpoint Terminal Logo"
              className="w-10 h-10 object-contain"
            />
            <span className="text-2xl font-bold tracking-tight text-white">Hitpoint Terminal</span>
          </div>

          <div className="flex items-center gap-2 bg-[#c4f82e]/15 px-4 py-2 rounded-full border border-[#c4f82e]/30 shadow-lg shadow-[#c4f82e]/20" role="status" aria-live="polite">
            <div className="w-2 h-2 bg-[#c4f82e] rounded-full shadow-lg shadow-[#c4f82e]/70 animate-pulse" aria-hidden="true"></div>
            <span className="text-xs text-[#c4f82e] font-bold tracking-wider">LIVE</span>
          </div>
        </div>
      </header>

      {/* Section Navigation */}
      <SectionNav />

      {/* Dashboard Section */}
      <section id="dashboard" className="relative z-10 px-8 py-8" aria-label="Cryptocurrency market dashboard">
        <div className="max-w-[1900px] mx-auto">
          <div className="grid grid-cols-12 gap-5 auto-rows-[minmax(300px,auto)]" role="region" aria-label="Market data widgets">
            <BTCPriceTicker />
            <FearGreedIndex />
            <MarketDominance />
            <MarketHeatmap />
            <EconomicCalendar />
            <LiquidationBubbles />
            <FundingRates />
          </div>
        </div>
      </section>

      {/* Charts Section */}
      <section id="charts" className="relative z-10 px-8 py-8">
        <div className="max-w-[1900px] mx-auto">
          <div className="section-header">
            <span className="section-title">Interactive Charts</span>
            <div className="section-divider"></div>
          </div>
          <InteractiveCharts />
        </div>
      </section>

      {/* Community Section */}
      <section id="community" className="relative z-10 px-8 py-8">
        <div className="max-w-[1900px] mx-auto">
          <div className="section-header">
            <span className="section-title">Community</span>
            <div className="section-divider"></div>
          </div>
          <div className="grid grid-cols-12 gap-5">
            <CommunityShowcase />
            <TwitterFeed />
            <PartnerLogos />
          </div>
        </div>
      </section>

      {/* Signals Section */}
      <section id="signals" className="relative z-10 px-8 py-8">
        <div className="max-w-[1900px] mx-auto">
          <div className="section-header">
            <span className="section-title">Signals</span>
            <div className="section-divider"></div>
          </div>
          <div className="text-gray-600 text-center py-20">Signals coming soon</div>
        </div>
      </section>
      <NewsletterPopup />
    </main>
  );
}
