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
import { SignalsGallery } from '@/components/SignalsGallery';
import { NewsletterSignup } from '@/components/NewsletterSignup';
import { TraderQuiz } from '@/components/TraderQuiz';
import { HeaderQuizCTA } from '@/components/HeaderQuizCTA';

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      {/* Ambient Background */}
      <div className="fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-black"></div>
        <div
          className="absolute top-[15%] left-[10%] w-[600px] h-[600px] rounded-full blur-[200px]"
          style={{ background: 'radial-gradient(circle, rgba(196,248,46,0.04) 0%, transparent 70%)', animation: 'ambient-drift 20s ease-in-out infinite' }}
        />
        <div
          className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] rounded-full blur-[180px]"
          style={{ background: 'radial-gradient(circle, rgba(196,248,46,0.03) 0%, transparent 70%)', animation: 'ambient-drift 25s ease-in-out infinite reverse' }}
        />
        <div
          className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[220px] opacity-30"
          style={{ background: 'radial-gradient(circle, rgba(196,248,46,0.02) 0%, transparent 60%)' }}
        />
      </div>

      <ScrollAnimator />

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-black/80 border-b border-white/[0.06]">
        <div className="max-w-[1900px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Hitpoint Terminal Logo"
              className="w-9 h-9 sm:w-10 sm:h-10 object-contain"
            />
            <span className="text-lg sm:text-xl font-display font-bold tracking-tight text-white">
              Hitpoint Terminal
            </span>
          </div>

          <div className="flex items-center gap-3">
            <HeaderQuizCTA />
            <div className="flex items-center gap-2 bg-[#c4f82e]/8 px-3 py-1.5 rounded-full border border-[#c4f82e]/15" role="status" aria-live="polite">
              <div className="live-dot" aria-hidden="true"></div>
              <span className="text-[10px] text-[#c4f82e] font-mono font-medium tracking-widest">LIVE</span>
            </div>
          </div>
        </div>
      </header>

      {/* Section Navigation */}
      <SectionNav />

      {/* Dashboard Section */}
      <section id="dashboard" className="relative z-10 px-4 sm:px-6 lg:px-8 py-6 lg:py-8" aria-label="Cryptocurrency market dashboard">
        <div className="max-w-[1900px] mx-auto">
          <div className="grid grid-cols-12 gap-3 sm:gap-4 lg:gap-5 auto-rows-[minmax(260px,auto)] sm:auto-rows-[minmax(280px,auto)] lg:auto-rows-[minmax(300px,auto)]" role="region" aria-label="Market data widgets">
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
      <section id="charts" className="relative z-10 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="max-w-[1900px] mx-auto">
          <div className="section-header">
            <span className="section-title">Interactive Charts</span>
            <div className="section-divider"></div>
          </div>
          <InteractiveCharts />
        </div>
      </section>

      {/* Community Section */}
      <section id="community" className="relative z-10 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="max-w-[1900px] mx-auto">
          <div className="section-header">
            <span className="section-title">Community</span>
            <div className="section-divider"></div>
          </div>
          <CommunityShowcase />
          <div className="grid grid-cols-12 gap-3 sm:gap-4 lg:gap-5 mt-3 sm:mt-4 lg:mt-5">
            <TwitterFeed />
            <PartnerLogos />
          </div>
        </div>
      </section>

      {/* Signals Section */}
      <section id="signals" className="relative z-10 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="max-w-[1900px] mx-auto">
          <div className="section-header">
            <span className="section-title">Signals</span>
            <div className="section-divider"></div>
          </div>
          <div className="grid grid-cols-12 gap-3 sm:gap-4 lg:gap-5">
            <SignalsGallery />
            <NewsletterSignup />
            <TraderQuiz />
          </div>
        </div>
      </section>
      <NewsletterPopup />
    </main>
  );
}
