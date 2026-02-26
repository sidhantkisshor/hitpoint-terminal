# Hitpoint Terminal Feature Expansion — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Expand the Hitpoint Terminal dashboard with interactive charts, upgraded economic calendar, engagement features (community showcase, Twitter feed, partner logos, newsletter, quiz), and signals gallery — organized as a single scrollable page with sticky section navigation.

**Architecture:** Single-page app with 4 scroll-targeted sections (Dashboard, Charts, Community, Signals). New components are all client-side (`'use client'`). Data for engagement features lives in local `data/` files. One new API route (`/api/newsletter`) for email collection. No new npm dependencies.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, Zustand, Zod, TradingView embeds, Twitter/X embed widget.

**Note:** No test framework is configured. Verify each task with `npm run build` (type-check + compile) and `npm run dev` (visual check).

---

## Phase 1: Data Layer

---

### Task 1: Add CSS utilities for section dividers and scroll animations

**Files:**
- Modify: `app/globals.css`

**Step 1: Add section header and animation styles to globals.css**

Add the following after the existing `.live-dot` animation block (after line 161):

```css
/* Section Headers */
.section-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.section-title {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 3px;
  color: var(--text-muted);
  white-space: nowrap;
}

.section-divider {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, rgba(196, 248, 46, 0.3) 0%, transparent 100%);
}

/* Scroll Animations */
.scroll-fade-in {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}

.scroll-fade-in.visible {
  opacity: 1;
  transform: translateY(0);
}

/* Stagger children */
.scroll-fade-in.visible:nth-child(1) { transition-delay: 0ms; }
.scroll-fade-in.visible:nth-child(2) { transition-delay: 100ms; }
.scroll-fade-in.visible:nth-child(3) { transition-delay: 200ms; }
.scroll-fade-in.visible:nth-child(4) { transition-delay: 300ms; }
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Compiles successfully with no errors.

**Step 3: Commit**

```bash
git add app/globals.css
git commit -m "feat: add CSS utilities for section headers and scroll animations"
```

---

### Task 2: Create SectionNav component

**Files:**
- Create: `components/SectionNav.tsx`

**Step 1: Create the SectionNav component**

```tsx
'use client';

import { useState, useEffect } from 'react';

const SECTIONS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'charts', label: 'Charts' },
  { id: 'community', label: 'Community' },
  { id: 'signals', label: 'Signals' },
];

export function SectionNav() {
  const [activeSection, setActiveSection] = useState('dashboard');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );

    for (const section of SECTIONS) {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav className="sticky top-[73px] z-40 backdrop-blur-2xl bg-black/70 border-b border-white/5">
      <div className="max-w-[1900px] mx-auto px-8 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
        {SECTIONS.map((section) => (
          <button
            key={section.id}
            onClick={() => scrollTo(section.id)}
            className={`px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all duration-300 ${
              activeSection === section.id
                ? 'bg-[#c4f82e]/15 text-[#c4f82e] border border-[#c4f82e]/30 shadow-lg shadow-[#c4f82e]/10'
                : 'text-gray-500 hover:text-gray-300 border border-transparent hover:border-white/10'
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Compiles successfully.

**Step 3: Commit**

```bash
git add components/SectionNav.tsx
git commit -m "feat: add SectionNav component with sticky nav and scroll tracking"
```

---

### Task 3: Restructure page.tsx with sections and SectionNav

**Files:**
- Modify: `app/page.tsx`

**Step 1: Remove LongShortRatio import and add SectionNav**

In `app/page.tsx`, make these changes:

1. Remove the `LongShortRatio` import (line 4):
   ```
   // DELETE: import { LongShortRatio } from '@/components/LongShortRatio';
   ```

2. Add SectionNav import:
   ```tsx
   import { SectionNav } from '@/components/SectionNav';
   ```

3. Replace the entire `{/* Terminal Dashboard - Full Width */}` section (lines 40-59) with:

```tsx
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
          {/* InteractiveCharts component will go here */}
          <div className="text-gray-600 text-center py-20">Charts coming soon</div>
        </div>
      </section>

      {/* Community Section */}
      <section id="community" className="relative z-10 px-8 py-8">
        <div className="max-w-[1900px] mx-auto">
          <div className="section-header">
            <span className="section-title">Community</span>
            <div className="section-divider"></div>
          </div>
          {/* Community components will go here */}
          <div className="text-gray-600 text-center py-20">Community coming soon</div>
        </div>
      </section>

      {/* Signals Section */}
      <section id="signals" className="relative z-10 px-8 py-8">
        <div className="max-w-[1900px] mx-auto">
          <div className="section-header">
            <span className="section-title">Signals</span>
            <div className="section-divider"></div>
          </div>
          {/* Signals components will go here */}
          <div className="text-gray-600 text-center py-20">Signals coming soon</div>
        </div>
      </section>
```

**Step 2: Verify build and dev**

Run: `npm run build`
Expected: Compiles successfully. LongShortRatio is no longer imported.

Run: `npm run dev` — visually confirm:
- Sticky nav appears below header
- All 4 sections are present and scrollable
- Dashboard section has all existing components (minus standalone LongShortRatio)
- Active nav pill highlights on scroll

**Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: restructure page with section nav, remove duplicate LongShortRatio"
```

---

### Task 4: Create InteractiveCharts component

**Files:**
- Create: `components/InteractiveCharts.tsx`

**Step 1: Create the component**

```tsx
'use client';

import { useEffect, useRef } from 'react';

const CHARTS = [
  { symbol: 'BINANCE:BTCUSDT', label: 'Bitcoin' },
  { symbol: 'BINANCE:ETHUSDT', label: 'Ethereum' },
  { symbol: 'TVC:GOLD', label: 'Gold' },
  { symbol: 'SP:SPX', label: 'S&P 500' },
];

function TradingViewChart({ symbol, label }: { symbol: string; label: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loadedRef.current) {
          loadedRef.current = true;
          const iframe = document.createElement('iframe');
          iframe.src = `https://s.tradingview.com/widgetembed/?frameElementId=tv_chart_${symbol}&symbol=${encodeURIComponent(symbol)}&interval=D&hidesidetoolbar=0&symboledit=1&saveimage=0&toolbarbg=f1f3f6&studies=[]&theme=dark&style=1&timezone=Etc%2FUTC&withdateranges=1&showpopupbutton=0&studies_overrides={}&overrides={}&enabled_features=[]&disabled_features=[]&locale=en&utm_source=localhost&utm_medium=widget_new&utm_campaign=chart`;
          iframe.className = 'w-full h-full rounded-xl';
          iframe.style.border = 'none';
          iframe.title = `${label} Chart`;
          iframe.loading = 'lazy';
          iframe.sandbox.add('allow-scripts', 'allow-same-origin', 'allow-popups');
          containerRef.current?.appendChild(iframe);
          observerRef.current?.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    observerRef.current.observe(containerRef.current);

    return () => observerRef.current?.disconnect();
  }, [symbol, label]);

  return (
    <div className="bento-item scroll-fade-in p-0 overflow-hidden">
      <div className="px-5 pt-4 pb-2">
        <span className="item-title">{label}</span>
      </div>
      <div ref={containerRef} className="w-full" style={{ height: '380px' }} />
    </div>
  );
}

export function InteractiveCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {CHARTS.map((chart) => (
        <TradingViewChart key={chart.symbol} symbol={chart.symbol} label={chart.label} />
      ))}
    </div>
  );
}
```

**Step 2: Wire into page.tsx**

In `app/page.tsx`:

1. Add import:
   ```tsx
   import { InteractiveCharts } from '@/components/InteractiveCharts';
   ```

2. Replace the `{/* InteractiveCharts component will go here */}` placeholder and the "Charts coming soon" div in the charts section with:
   ```tsx
   <InteractiveCharts />
   ```

**Step 3: Verify build and dev**

Run: `npm run build`
Expected: Compiles successfully.

Run: `npm run dev` — visually confirm:
- 4 charts in 2x2 grid on desktop
- Each chart lazy-loads when scrolled into view
- Dark theme TradingView charts
- On mobile, charts stack to single column

**Step 4: Commit**

```bash
git add components/InteractiveCharts.tsx app/page.tsx
git commit -m "feat: add InteractiveCharts component with 4 TradingView embeds"
```

---

### Task 5: Upgrade EconomicCalendar to TradingView widget

**Files:**
- Modify: `components/EconomicCalendar.tsx`

**Step 1: Rewrite EconomicCalendar.tsx**

Replace the entire file contents with:

```tsx
'use client';

import { useEffect, useRef } from 'react';

export function EconomicCalendar() {
  const containerRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current || loadedRef.current) return;
    loadedRef.current = true;

    const iframe = document.createElement('iframe');
    iframe.src = 'https://s.tradingview.com/embed-widget/events/?locale=en#%7B%22colorTheme%22%3A%22dark%22%2C%22isTransparent%22%3Atrue%2C%22width%22%3A%22100%25%22%2C%22height%22%3A%22100%25%22%2C%22importanceFilter%22%3A%22-1%2C0%2C1%22%2C%22countryFilter%22%3A%22us%22%7D';
    iframe.className = 'w-full h-full';
    iframe.style.border = 'none';
    iframe.title = 'Economic Calendar';
    iframe.loading = 'lazy';
    iframe.sandbox.add('allow-scripts', 'allow-same-origin', 'allow-popups');
    containerRef.current.appendChild(iframe);
  }, []);

  return (
    <div className="bento-item col-span-12 lg:col-span-4 row-span-1">
      <div className="item-header">
        <span className="item-title">ECONOMIC CALENDAR</span>
        <div className="live-indicator">
          <span className="live-dot"></span>
          <span>LIVE</span>
        </div>
      </div>
      <div ref={containerRef} style={{ height: 'calc(100% - 3rem)' }} />
    </div>
  );
}
```

**Step 2: Verify build and dev**

Run: `npm run build`
Expected: Compiles successfully.

Run: `npm run dev` — visually confirm:
- Economic calendar shows live TradingView events widget
- Dark theme, transparent background
- US events with all importance levels
- Same grid position as before

**Step 3: Commit**

```bash
git add components/EconomicCalendar.tsx
git commit -m "feat: upgrade EconomicCalendar from hardcoded events to TradingView widget"
```

---

### Task 6: Delete standalone LongShortRatio component

**Files:**
- Delete: `components/LongShortRatio.tsx`

**Step 1: Delete the file**

```bash
rm components/LongShortRatio.tsx
```

**Step 2: Verify no remaining imports**

Search for any remaining `LongShortRatio` imports across the codebase. The import was already removed from `page.tsx` in Task 3. Confirm no other files import it.

Run: `npm run build`
Expected: Compiles successfully with no missing import errors.

**Step 3: Commit**

```bash
git add components/LongShortRatio.tsx
git commit -m "chore: remove duplicate LongShortRatio component (data shown in MarketHeatmap)"
```

---

### Task 7: Add scroll animation observer to page

**Files:**
- Create: `components/ScrollAnimator.tsx`

**Step 1: Create a reusable scroll animation component**

```tsx
'use client';

import { useEffect } from 'react';

export function ScrollAnimator() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        }
      },
      { rootMargin: '0px 0px -50px 0px' }
    );

    const elements = document.querySelectorAll('.scroll-fade-in');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return null;
}
```

**Step 2: Add to page.tsx**

In `app/page.tsx`, import and render it once inside `<main>`, right after the background div:

```tsx
import { ScrollAnimator } from '@/components/ScrollAnimator';
```

Place `<ScrollAnimator />` right after the closing `</div>` of the background section (after line 19 in original).

**Step 3: Verify build**

Run: `npm run build`
Expected: Compiles successfully.

**Step 4: Commit**

```bash
git add components/ScrollAnimator.tsx app/page.tsx
git commit -m "feat: add ScrollAnimator for fade-in-on-scroll animations"
```

---

### Task 8: Phase 1 verification

**Step 1: Full build check**

Run: `npm run build`
Expected: Compiles with no errors.

**Step 2: Visual verification with dev server**

Run: `npm run dev`

Verify:
- [ ] Sticky nav renders below header, highlights active section on scroll
- [ ] Clicking nav pills smooth-scrolls to correct section
- [ ] Dashboard section has all original components (BTCPriceTicker, FearGreedIndex, MarketDominance, MarketHeatmap, EconomicCalendar, LiquidationBubbles, FundingRates)
- [ ] No standalone LongShortRatio (long/short data still shows in MarketHeatmap)
- [ ] Charts section has 4 TradingView embeds in 2x2 grid
- [ ] Economic Calendar shows live TradingView widget
- [ ] Community and Signals sections show placeholder text
- [ ] Section dividers render with gradient lines
- [ ] Scroll animations fire as elements enter viewport
- [ ] Mobile: nav is horizontally scrollable, charts stack single-column

**Step 3: Commit checkpoint**

```bash
git commit --allow-empty -m "milestone: Phase 1 (Data Layer) complete"
```

---

## Phase 2: Engagement Layer

---

### Task 9: Create testimonials data file

**Files:**
- Create: `data/testimonials.ts`

**Step 1: Create the data file**

```tsx
export interface Testimonial {
  image: string;
  caption: string;
  author: string;
}

export const testimonials: Testimonial[] = [
  {
    image: '/testimonials/placeholder-1.png',
    caption: 'Turned my trading around completely. The signals are incredibly accurate.',
    author: '@trader_mike',
  },
  {
    image: '/testimonials/placeholder-2.png',
    caption: 'Best community I\'ve been part of. The insights are next level.',
    author: '@crypto_sarah',
  },
  {
    image: '/testimonials/placeholder-3.png',
    caption: 'The funding rate dashboard alone saved me from multiple bad entries.',
    author: '@defi_dave',
  },
  {
    image: '/testimonials/placeholder-4.png',
    caption: 'From losing trader to consistent profits. This changed everything.',
    author: '@whale_watcher',
  },
  {
    image: '/testimonials/placeholder-5.png',
    caption: 'The economic calendar alerts helped me avoid so many liquidations.',
    author: '@moon_maven',
  },
];
```

Note: The user will replace placeholder images with real screenshots in `public/testimonials/`.

**Step 2: Create the public directory**

```bash
mkdir -p public/testimonials
```

**Step 3: Commit**

```bash
git add data/testimonials.ts
git commit -m "feat: add testimonials data file for community showcase"
```

---

### Task 10: Create CommunityShowcase component

**Files:**
- Create: `components/CommunityShowcase.tsx`

**Step 1: Create the component**

```tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { testimonials } from '@/data/testimonials';

export function CommunityShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const next = useCallback(() => {
    setActiveIndex((i) => (i + 1) % testimonials.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(next, 5000);
    return () => clearInterval(interval);
  }, [isPaused, next]);

  return (
    <div className="bento-item col-span-12 lg:col-span-5 scroll-fade-in">
      <div className="item-header">
        <span className="item-title">WHAT OUR TRADERS SAY</span>
      </div>

      <div
        className="relative overflow-hidden"
        style={{ height: '380px' }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {testimonials.map((t, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-all duration-500 ease-in-out ${
              i === activeIndex
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-4 pointer-events-none'
            }`}
          >
            <div className="h-full flex flex-col">
              <div className="flex-1 rounded-xl overflow-hidden bg-black/40 border border-white/5">
                <img
                  src={t.image}
                  alt={`Testimonial from ${t.author}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-300 italic leading-relaxed">&ldquo;{t.caption}&rdquo;</p>
                <p className="text-xs text-[#c4f82e] font-semibold mt-2">{t.author}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dots indicator */}
      <div className="flex justify-center gap-2 mt-4">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === activeIndex
                ? 'bg-[#c4f82e] shadow-lg shadow-[#c4f82e]/40'
                : 'bg-white/20 hover:bg-white/40'
            }`}
            aria-label={`Show testimonial ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Compiles successfully.

**Step 3: Commit**

```bash
git add components/CommunityShowcase.tsx
git commit -m "feat: add CommunityShowcase carousel component"
```

---

### Task 11: Create TwitterFeed component and update CSP

**Files:**
- Create: `components/TwitterFeed.tsx`
- Modify: `next.config.ts`

**Step 1: Create the TwitterFeed component**

```tsx
'use client';

import { useEffect, useRef } from 'react';

export function TwitterFeed() {
  const containerRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current || loadedRef.current) return;
    loadedRef.current = true;

    // Create the Twitter timeline embed
    const anchor = document.createElement('a');
    anchor.className = 'twitter-timeline';
    anchor.setAttribute('data-theme', 'dark');
    anchor.setAttribute('data-chrome', 'noheader nofooter noborders transparent');
    anchor.setAttribute('data-height', '480');
    anchor.href = 'https://twitter.com/HitpointTerminal'; // Replace with actual handle
    anchor.textContent = 'Loading tweets...';
    containerRef.current.appendChild(anchor);

    // Load Twitter widget script
    const script = document.createElement('script');
    script.src = 'https://platform.twitter.com/widgets.js';
    script.async = true;
    script.charset = 'utf-8';
    containerRef.current.appendChild(script);
  }, []);

  return (
    <div className="bento-item col-span-12 lg:col-span-4 scroll-fade-in">
      <div className="item-header">
        <span className="item-title">LATEST UPDATES</span>
      </div>
      <div
        ref={containerRef}
        className="overflow-hidden rounded-xl"
        style={{ height: '480px' }}
      />
    </div>
  );
}
```

**Step 2: Update CSP in next.config.ts**

In `next.config.ts`, modify the Content-Security-Policy header value. Update these directives:

- `script-src` line: add `https://platform.twitter.com` after `'unsafe-inline'`
- `frame-src` line: add `https://platform.twitter.com https://syndication.twitter.com` after existing values
- `img-src` line: add `https://pbs.twimg.com https://abs.twimg.com` after existing values
- `connect-src` line: add `https://syndication.twitter.com` after existing values

The updated CSP value lines should become:

```typescript
"script-src 'self' 'unsafe-inline' https://platform.twitter.com",
"img-src 'self' data: https://api.coingecko.com https://s.tradingview.com https://www.coinglass.com https://pbs.twimg.com https://abs.twimg.com",
"connect-src 'self' wss://stream.binance.com:9443 wss://stream.binance.com https://api.binance.com https://api.coingecko.com https://api.alternative.me https://fapi.binance.com https://api.bybit.com https://syndication.twitter.com",
"frame-src https://s.tradingview.com https://www.coinglass.com https://platform.twitter.com https://syndication.twitter.com",
```

**Step 3: Verify build**

Run: `npm run build`
Expected: Compiles successfully.

**Step 4: Commit**

```bash
git add components/TwitterFeed.tsx next.config.ts
git commit -m "feat: add TwitterFeed component and update CSP for Twitter embeds"
```

---

### Task 12: Create partners data file and PartnerLogos component

**Files:**
- Create: `data/partners.ts`
- Create: `components/PartnerLogos.tsx`

**Step 1: Create the data file**

```tsx
export interface Partner {
  name: string;
  logo: string;
  url?: string;
}

export const partners: Partner[] = [
  // Replace with actual partner logos in public/partners/
  // { name: 'Binance', logo: '/partners/binance.png', url: 'https://binance.com' },
  // { name: 'Bybit', logo: '/partners/bybit.png', url: 'https://bybit.com' },
];
```

**Step 2: Create the public directory**

```bash
mkdir -p public/partners
```

**Step 3: Create the PartnerLogos component**

```tsx
'use client';

import { partners } from '@/data/partners';

export function PartnerLogos() {
  if (partners.length === 0) return null;

  return (
    <div className="bento-item col-span-12 lg:col-span-3 scroll-fade-in">
      <div className="item-header">
        <span className="item-title">PARTNERS</span>
      </div>

      <div className="flex flex-col gap-6 items-center justify-center h-[380px]">
        {partners.map((partner) => {
          const img = (
            <img
              key={partner.name}
              src={partner.logo}
              alt={partner.name}
              className="h-10 w-auto object-contain grayscale hover:grayscale-0 opacity-50 hover:opacity-100 transition-all duration-300"
              loading="lazy"
            />
          );

          return partner.url ? (
            <a
              key={partner.name}
              href={partner.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              {img}
            </a>
          ) : (
            img
          );
        })}
      </div>
    </div>
  );
}
```

**Step 4: Verify build**

Run: `npm run build`
Expected: Compiles successfully.

**Step 5: Commit**

```bash
git add data/partners.ts components/PartnerLogos.tsx
git commit -m "feat: add PartnerLogos component with graceful empty state"
```

---

### Task 13: Wire Community section into page.tsx

**Files:**
- Modify: `app/page.tsx`

**Step 1: Add imports**

Add these imports at the top of `app/page.tsx`:

```tsx
import { CommunityShowcase } from '@/components/CommunityShowcase';
import { TwitterFeed } from '@/components/TwitterFeed';
import { PartnerLogos } from '@/components/PartnerLogos';
```

**Step 2: Replace Community section placeholder**

Replace the `{/* Community components will go here */}` comment and the "Community coming soon" placeholder div with:

```tsx
          <div className="grid grid-cols-12 gap-5">
            <CommunityShowcase />
            <TwitterFeed />
            <PartnerLogos />
          </div>
```

**Step 3: Verify build and dev**

Run: `npm run build`
Expected: Compiles successfully.

Run: `npm run dev` — visually confirm:
- Community section shows carousel, Twitter feed, and partner logos (or nothing if partners array empty)
- Carousel auto-rotates, pauses on hover
- Twitter embed loads (may need actual handle)

**Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "feat: wire Community section with showcase, Twitter feed, and partner logos"
```

---

### Task 14: Create NewsletterPopup component

**Files:**
- Create: `components/NewsletterPopup.tsx`

**Step 1: Create the component**

```tsx
'use client';

import { useState, useEffect } from 'react';

export function NewsletterPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    const dismissed = localStorage.getItem('newsletter-dismissed');
    if (dismissed) return;

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 30000);

    const handleScroll = () => {
      const scrollPercent = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      if (scrollPercent > 0.5) {
        setIsVisible(true);
        window.removeEventListener('scroll', handleScroll);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const dismiss = (permanent: boolean) => {
    setIsVisible(false);
    if (permanent) {
      localStorage.setItem('newsletter-dismissed', 'true');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStatus('success');
        localStorage.setItem('newsletter-dismissed', 'true');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[340px] animate-slide-up">
      <div className="relative rounded-2xl border border-white/10 bg-black/90 backdrop-blur-2xl p-6 shadow-2xl shadow-black/50">
        {/* Close button */}
        <button
          onClick={() => dismiss(false)}
          className="absolute top-3 right-3 text-gray-500 hover:text-white transition-colors"
          aria-label="Close"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
          </svg>
        </button>

        {status === 'success' ? (
          <div className="text-center py-4">
            <div className="text-2xl mb-2">&#10003;</div>
            <p className="text-[#c4f82e] font-bold text-lg">You&apos;re in!</p>
            <p className="text-gray-400 text-sm mt-1">Watch your inbox for weekly insights.</p>
          </div>
        ) : (
          <>
            <h3 className="text-white font-bold text-lg mb-1">Weekly Crypto Insights</h3>
            <p className="text-gray-400 text-sm mb-4">
              Get market analysis and trading signals delivered weekly.
            </p>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#c4f82e]/40 transition-colors"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="bg-[#c4f82e] text-black font-bold px-4 py-2 rounded-lg text-sm hover:bg-[#a8e024] transition-colors disabled:opacity-50"
              >
                {status === 'loading' ? '...' : 'Join'}
              </button>
            </form>
            {status === 'error' && (
              <p className="text-red-400 text-xs mt-2">Something went wrong. Try again.</p>
            )}
            <button
              onClick={() => dismiss(true)}
              className="text-gray-600 text-xs mt-3 hover:text-gray-400 transition-colors"
            >
              Don&apos;t show again
            </button>
          </>
        )}
      </div>
    </div>
  );
}
```

**Step 2: Add slide-up animation to globals.css**

Add after the scroll animation block:

```css
/* Popup slide-up animation */
@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slide-up 0.4s ease-out;
}
```

**Step 3: Add NewsletterPopup to page.tsx**

Import and render at the end of `<main>`, after the last section:

```tsx
import { NewsletterPopup } from '@/components/NewsletterPopup';
```

```tsx
      <NewsletterPopup />
    </main>
```

**Step 4: Verify build**

Run: `npm run build`
Expected: Compiles successfully. (Popup won't work fully until `/api/newsletter` route exists in Phase 3, but the UI renders.)

**Step 5: Commit**

```bash
git add components/NewsletterPopup.tsx app/globals.css app/page.tsx
git commit -m "feat: add NewsletterPopup with timer/scroll trigger and localStorage dismissal"
```

---

### Task 15: Phase 2 verification

**Step 1: Full build check**

Run: `npm run build`
Expected: Compiles with no errors.

**Step 2: Visual verification**

Run: `npm run dev`

Verify:
- [ ] Community section renders with 3-column layout
- [ ] CommunityShowcase carousel auto-rotates, pauses on hover, dot indicators work
- [ ] TwitterFeed loads embedded timeline (placeholder if no real handle)
- [ ] PartnerLogos renders nothing (empty array) or logos if populated
- [ ] Newsletter popup appears after 30s or 50% scroll
- [ ] "Don't show again" persists across page refreshes (localStorage)
- [ ] Mobile: community cards stack to single column

**Step 3: Commit checkpoint**

```bash
git commit --allow-empty -m "milestone: Phase 2 (Engagement Layer) complete"
```

---

## Phase 3: Social Proof

---

### Task 16: Create signals data file

**Files:**
- Create: `data/signals.ts`

**Step 1: Create the data file**

```tsx
export interface Signal {
  image: string;
  caption?: string;
  date?: string;
}

export const signals: Signal[] = [
  // Replace with actual signal screenshots in public/signals/
  { image: '/signals/placeholder-1.png', caption: 'BTC Long — +12.4% gain', date: '2026-02-20' },
  { image: '/signals/placeholder-2.png', caption: 'ETH Short — +8.7% gain', date: '2026-02-18' },
  { image: '/signals/placeholder-3.png', caption: 'SOL Long — +15.2% gain', date: '2026-02-15' },
  { image: '/signals/placeholder-4.png', caption: 'BTC Short — +6.3% gain', date: '2026-02-12' },
  { image: '/signals/placeholder-5.png', caption: 'ETH Long — +10.1% gain', date: '2026-02-10' },
  { image: '/signals/placeholder-6.png', caption: 'XRP Long — +22.5% gain', date: '2026-02-08' },
];
```

**Step 2: Create public directory**

```bash
mkdir -p public/signals
```

**Step 3: Commit**

```bash
git add data/signals.ts
git commit -m "feat: add signals data file for screenshot gallery"
```

---

### Task 17: Create SignalsGallery component

**Files:**
- Create: `components/SignalsGallery.tsx`

**Step 1: Create the component**

```tsx
'use client';

import { useState } from 'react';
import { signals } from '@/data/signals';

export function SignalsGallery() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <>
      <div className="bento-item col-span-12 lg:col-span-6 scroll-fade-in">
        <div className="item-header">
          <span className="item-title">VIP SIGNALS PREVIEW</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          {signals.map((signal, i) => (
            <button
              key={i}
              onClick={() => setLightboxIndex(i)}
              className="relative group rounded-xl overflow-hidden border border-white/5 hover:border-[#c4f82e]/30 transition-all duration-300 aspect-[4/3]"
            >
              <img
                src={signal.image}
                alt={signal.caption || `Signal ${i + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-2 left-2 right-2">
                  {signal.caption && (
                    <p className="text-xs text-white font-medium truncate">{signal.caption}</p>
                  )}
                  {signal.date && (
                    <p className="text-xs text-gray-400">{signal.date}</p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        <a
          href="#"
          className="block w-full text-center bg-[#c4f82e] text-black font-bold py-3 rounded-xl hover:bg-[#a8e024] transition-colors text-sm uppercase tracking-wider"
        >
          Join VIP
        </a>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-8"
          onClick={() => setLightboxIndex(null)}
        >
          <div className="relative max-w-4xl max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
            <img
              src={signals[lightboxIndex].image}
              alt={signals[lightboxIndex].caption || 'Signal'}
              className="max-w-full max-h-[85vh] object-contain rounded-xl"
            />
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              aria-label="Close"
            >
              &times;
            </button>
            {signals[lightboxIndex].caption && (
              <p className="text-white text-sm mt-3 text-center">{signals[lightboxIndex].caption}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Compiles successfully.

**Step 3: Commit**

```bash
git add components/SignalsGallery.tsx
git commit -m "feat: add SignalsGallery component with lightbox"
```

---

### Task 18: Create newsletter API route

**Files:**
- Create: `app/api/newsletter/route.ts`
- Modify: `lib/validation.ts`

**Step 1: Add newsletter Zod schema to validation.ts**

Add at the end of `lib/validation.ts`:

```tsx
// Newsletter subscription validation
export const NewsletterSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export type NewsletterData = z.infer<typeof NewsletterSchema>;
```

**Step 2: Create the API route**

```tsx
import { NextResponse } from 'next/server';
import { NewsletterSchema } from '@/lib/validation';
import { checkRateLimit } from '@/lib/ratelimit';
import { logger } from '@/lib/logger';
import { promises as fs } from 'fs';
import path from 'path';

const SUBSCRIBERS_FILE = path.join(process.cwd(), 'data', 'subscribers.json');

async function getSubscribers(): Promise<string[]> {
  try {
    const data = await fs.readFile(SUBSCRIBERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveSubscribers(subscribers: string[]): Promise<void> {
  await fs.mkdir(path.dirname(SUBSCRIBERS_FILE), { recursive: true });
  await fs.writeFile(SUBSCRIBERS_FILE, JSON.stringify(subscribers, null, 2));
}

export async function POST(request: Request) {
  try {
    // Rate limit
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    const { success, limit, remaining, reset } = await checkRateLimit(`newsletter_${ip}`);

    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          },
        }
      );
    }

    // Validate body
    const body = await request.json();
    const result = NewsletterSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    const { email } = result.data;

    // Append to subscribers file
    const subscribers = await getSubscribers();
    if (!subscribers.includes(email)) {
      subscribers.push(email);
      await saveSubscribers(subscribers);
    }

    logger.info('New newsletter subscriber');
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Step 3: Create initial subscribers file**

```bash
echo "[]" > data/subscribers.json
```

**Step 4: Add subscribers.json to .gitignore**

Append to `.gitignore`:
```
data/subscribers.json
```

**Step 5: Verify build**

Run: `npm run build`
Expected: Compiles successfully.

**Step 6: Commit**

```bash
git add lib/validation.ts app/api/newsletter/route.ts .gitignore
git commit -m "feat: add /api/newsletter route with email validation and file-based storage"
```

---

### Task 19: Create NewsletterSignup inline component

**Files:**
- Create: `components/NewsletterSignup.tsx`

**Step 1: Create the component**

```tsx
'use client';

import { useState } from 'react';

export function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="bento-item col-span-12 lg:col-span-3 scroll-fade-in">
      <div className="item-header">
        <span className="item-title">WEEKLY INSIGHTS</span>
      </div>

      <div className="flex flex-col justify-center h-[300px]">
        {status === 'success' ? (
          <div className="text-center">
            <div className="text-4xl mb-3">&#10003;</div>
            <p className="text-[#c4f82e] font-bold text-xl">You&apos;re in!</p>
            <p className="text-gray-400 text-sm mt-2">Check your inbox for weekly market insights.</p>
          </div>
        ) : (
          <>
            <p className="text-gray-300 text-sm mb-6 leading-relaxed">
              Get weekly market analysis, trading insights, and early access to new features delivered to your inbox.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#c4f82e]/40 transition-colors"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-[#c4f82e] text-black font-bold py-3 rounded-xl hover:bg-[#a8e024] transition-colors text-sm uppercase tracking-wider disabled:opacity-50"
              >
                {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>

            {status === 'error' && (
              <p className="text-red-400 text-xs mt-2 text-center">Something went wrong. Try again.</p>
            )}

            <p className="text-gray-600 text-xs mt-4 text-center">
              No spam. Unsubscribe anytime.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Compiles successfully.

**Step 3: Commit**

```bash
git add components/NewsletterSignup.tsx
git commit -m "feat: add NewsletterSignup inline component"
```

---

### Task 20: Create quiz data file

**Files:**
- Create: `data/quiz.ts`

**Step 1: Create the data file**

```tsx
export interface QuizQuestion {
  question: string;
  options: { label: string; archetype: string }[];
}

export interface Archetype {
  name: string;
  icon: string;
  description: string;
}

export const quizQuestions: QuizQuestion[] = [
  {
    question: 'How long do you typically hold a trade?',
    options: [
      { label: 'Seconds to minutes', archetype: 'scalper' },
      { label: 'Hours to days', archetype: 'swing' },
      { label: 'Weeks to months', archetype: 'hodler' },
      { label: 'Until it moons or zeros', archetype: 'degen' },
    ],
  },
  {
    question: 'What do you check first in the morning?',
    options: [
      { label: 'Order book depth and volume', archetype: 'scalper' },
      { label: 'Daily chart patterns and RSI', archetype: 'swing' },
      { label: 'Total market cap and dominance', archetype: 'hodler' },
      { label: 'Twitter/X for the latest alpha', archetype: 'degen' },
    ],
  },
  {
    question: 'A coin drops 20% overnight. What do you do?',
    options: [
      { label: 'Look for a scalp bounce', archetype: 'scalper' },
      { label: 'Wait for support confirmation', archetype: 'swing' },
      { label: 'DCA if fundamentals are strong', archetype: 'hodler' },
      { label: 'Ape into the dip immediately', archetype: 'degen' },
    ],
  },
  {
    question: 'What matters most to you?',
    options: [
      { label: 'Tight spreads and execution speed', archetype: 'scalper' },
      { label: 'Risk/reward ratio and clean setups', archetype: 'swing' },
      { label: 'Long-term adoption and utility', archetype: 'hodler' },
      { label: 'Vibes and community sentiment', archetype: 'degen' },
    ],
  },
  {
    question: 'Pick your ideal leverage:',
    options: [
      { label: '10-20x on small positions', archetype: 'scalper' },
      { label: '3-5x with proper stops', archetype: 'swing' },
      { label: '1x — spot only', archetype: 'hodler' },
      { label: '50-125x — go big or go home', archetype: 'degen' },
    ],
  },
];

export const archetypes: Record<string, Archetype> = {
  scalper: {
    name: 'The Scalper',
    icon: '\u26A1',
    description: 'Lightning-fast reflexes. You live in the 1-minute chart, thrive on volatility, and take profits quickly. Speed is your edge.',
  },
  swing: {
    name: 'The Swing Trader',
    icon: '\uD83C\uDFAF',
    description: 'Patient and precise. You wait for high-probability setups, manage risk carefully, and let winners run. The daily chart is your playground.',
  },
  hodler: {
    name: 'The HODLer',
    icon: '\uD83D\uDC8E',
    description: 'Diamond hands forged in bear markets. You believe in the long game, accumulate on dips, and never panic sell. Time in the market beats timing.',
  },
  degen: {
    name: 'The Degen',
    icon: '\uD83D\uDE80',
    description: 'High risk, high reward. You chase the next 100x, ape into new launches, and live for the thrill. Fortune favors the bold.',
  },
};
```

**Step 2: Commit**

```bash
git add data/quiz.ts
git commit -m "feat: add quiz questions and trader archetype data"
```

---

### Task 21: Create TraderQuiz component

**Files:**
- Create: `components/TraderQuiz.tsx`

**Step 1: Create the component**

```tsx
'use client';

import { useState } from 'react';
import { quizQuestions, archetypes } from '@/data/quiz';

export function TraderQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [result, setResult] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (archetype: string) => {
    const newAnswers = [...answers, archetype];
    setAnswers(newAnswers);

    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion((q) => q + 1);
    } else {
      // Calculate result
      const counts: Record<string, number> = {};
      for (const a of newAnswers) {
        counts[a] = (counts[a] || 0) + 1;
      }
      const winner = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
      setResult(winner);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
    } catch {
      // Best effort
    }

    setEmailSubmitted(true);
    setShowResult(true);
  };

  const reset = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setResult(null);
    setEmail('');
    setEmailSubmitted(false);
    setShowResult(false);
  };

  const archetype = result ? archetypes[result] : null;

  return (
    <div className="bento-item col-span-12 lg:col-span-3 scroll-fade-in">
      <div className="item-header">
        <span className="item-title">TRADER QUIZ</span>
      </div>

      <div className="flex flex-col justify-center h-[300px]">
        {/* Quiz in progress */}
        {!result && (
          <div>
            <div className="text-xs text-gray-500 mb-3">
              {currentQuestion + 1} / {quizQuestions.length}
            </div>
            <p className="text-white text-sm font-semibold mb-4">
              {quizQuestions[currentQuestion].question}
            </p>
            <div className="space-y-2">
              {quizQuestions[currentQuestion].options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(opt.archetype)}
                  className="w-full text-left px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-300 hover:border-[#c4f82e]/40 hover:text-white hover:bg-white/10 transition-all duration-200"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Email gate */}
        {result && !showResult && (
          <div className="text-center">
            <div className="text-3xl mb-2">{archetype?.icon}</div>
            <p className="text-white font-bold mb-1">Your result is ready!</p>
            <p className="text-gray-400 text-sm mb-4">Enter your email to see your trader type.</p>
            <form onSubmit={handleEmailSubmit} className="space-y-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#c4f82e]/40 transition-colors"
              />
              <button
                type="submit"
                className="w-full bg-[#c4f82e] text-black font-bold py-3 rounded-xl hover:bg-[#a8e024] transition-colors text-sm"
              >
                Reveal My Type
              </button>
            </form>
            <button
              onClick={() => setShowResult(true)}
              className="text-gray-600 text-xs mt-3 hover:text-gray-400 transition-colors"
            >
              Skip
            </button>
          </div>
        )}

        {/* Result */}
        {showResult && archetype && (
          <div className="text-center">
            <div className="text-4xl mb-3">{archetype.icon}</div>
            <p className="text-[#c4f82e] font-bold text-lg">{archetype.name}</p>
            <p className="text-gray-400 text-sm mt-2 leading-relaxed">{archetype.description}</p>
            <button
              onClick={reset}
              className="mt-4 text-xs text-gray-500 hover:text-gray-300 transition-colors underline"
            >
              Retake Quiz
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Compiles successfully.

**Step 3: Commit**

```bash
git add components/TraderQuiz.tsx
git commit -m "feat: add TraderQuiz component with email gate and archetypes"
```

---

### Task 22: Wire Signals section into page.tsx

**Files:**
- Modify: `app/page.tsx`

**Step 1: Add imports**

```tsx
import { SignalsGallery } from '@/components/SignalsGallery';
import { NewsletterSignup } from '@/components/NewsletterSignup';
import { TraderQuiz } from '@/components/TraderQuiz';
```

**Step 2: Replace Signals section placeholder**

Replace the `{/* Signals components will go here */}` comment and the "Signals coming soon" placeholder div with:

```tsx
          <div className="grid grid-cols-12 gap-5">
            <SignalsGallery />
            <NewsletterSignup />
            <TraderQuiz />
          </div>
```

**Step 3: Verify build and dev**

Run: `npm run build`
Expected: Compiles successfully.

Run: `npm run dev` — visually confirm:
- Signals section shows gallery, newsletter signup, and quiz
- Gallery lightbox works on click
- Newsletter form submits to `/api/newsletter`
- Quiz flows through questions, shows email gate, reveals result

**Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "feat: wire Signals section with gallery, newsletter, and quiz"
```

---

### Task 23: Final verification and cleanup

**Step 1: Run lint**

Run: `npm run lint`
Expected: No errors. Fix any warnings if present.

**Step 2: Full production build**

Run: `npm run build`
Expected: Compiles with no errors.

**Step 3: Full visual verification**

Run: `npm run dev`

Verify everything end-to-end:
- [ ] Sticky nav with 4 sections, smooth scroll, active highlighting
- [ ] Dashboard: BTCPriceTicker, FearGreedIndex, MarketDominance, MarketHeatmap (with L/S ratio built-in), EconomicCalendar (TradingView widget), LiquidationBubbles, FundingRates
- [ ] Charts: 4 TradingView embeds (BTC, ETH, Gold, SPX) in 2x2 grid, lazy loaded
- [ ] Community: Testimonial carousel, Twitter feed embed, Partner logos (empty state OK)
- [ ] Signals: Screenshot gallery with lightbox, Newsletter signup form, Trader quiz with email gate
- [ ] Newsletter popup appears after 30s or 50% scroll, dismissible
- [ ] Scroll animations fire on all new sections
- [ ] Mobile responsive: single column stacking, scrollable nav
- [ ] No console errors

**Step 4: Final commit**

```bash
git commit --allow-empty -m "milestone: Phase 3 (Social Proof) complete — all features implemented"
```

---

## File Summary

### New Files (15)

| File | Task | Purpose |
|------|------|---------|
| `components/SectionNav.tsx` | 2 | Sticky section navigation |
| `components/InteractiveCharts.tsx` | 4 | 4 TradingView chart embeds |
| `components/ScrollAnimator.tsx` | 7 | Global scroll animation observer |
| `components/CommunityShowcase.tsx` | 10 | Testimonial carousel |
| `components/TwitterFeed.tsx` | 11 | X/Twitter embedded timeline |
| `components/PartnerLogos.tsx` | 12 | Partner logo strip |
| `components/NewsletterPopup.tsx` | 14 | Slide-up newsletter popup |
| `components/SignalsGallery.tsx` | 17 | Signal screenshot gallery + lightbox |
| `components/NewsletterSignup.tsx` | 19 | Inline newsletter signup form |
| `components/TraderQuiz.tsx` | 21 | Trader archetype quiz |
| `data/testimonials.ts` | 9 | Testimonial content |
| `data/partners.ts` | 12 | Partner logos data |
| `data/signals.ts` | 16 | Signal screenshots data |
| `data/quiz.ts` | 20 | Quiz questions & archetypes |
| `app/api/newsletter/route.ts` | 18 | Email collection endpoint |

### Modified Files (4)

| File | Tasks | Changes |
|------|-------|---------|
| `app/globals.css` | 1, 14 | Section header styles, scroll animations, popup animation |
| `app/page.tsx` | 3, 4, 7, 13, 14, 22 | Section structure, all new component imports |
| `next.config.ts` | 11 | CSP updates for Twitter embeds |
| `lib/validation.ts` | 18 | Newsletter email Zod schema |

### Deleted Files (1)

| File | Task | Reason |
|------|------|--------|
| `components/LongShortRatio.tsx` | 6 | Duplicate — data already in MarketHeatmap |

### User Action Required

After implementation, the user needs to:
1. Add real testimonial screenshots to `public/testimonials/`
2. Add real signal screenshots to `public/signals/`
3. Add partner logos to `public/partners/` and update `data/partners.ts`
4. Update the Twitter handle in `components/TwitterFeed.tsx`
5. Update the "Join VIP" link in `components/SignalsGallery.tsx`
