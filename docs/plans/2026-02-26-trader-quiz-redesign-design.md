# Trader Quiz Redesign — Design Document

**Date:** 2026-02-26
**Status:** Approved

## Purpose

Replace the existing simple archetype quiz with a psychological trading profile test. The quiz measures four behavioral dimensions, produces a nuanced trader profile, and recommends specific website tools based on the result. Goals: educate traders, increase engagement, and connect results to dashboard features.

## Decisions

- **Format:** Full-screen modal overlay (opened from a teaser card in the Signals section)
- **Questions:** 8 total, 2 per category, 3 answer options each
- **Scoring:** Multi-dimension — each answer scores across all 4 dimensions
- **Results:** Profile name + 4-dimension breakdown (progress bars) + recommended tools
- **Sharing:** Copy-to-clipboard text summary
- **Email gate:** Retained between quiz completion and result reveal

## Data Model

### Scoring Dimensions

| Dimension | Measures |
|-----------|----------|
| `bias` | Market Bias — bullish vs bearish tendency |
| `risk` | Risk Tolerance — conservative vs aggressive |
| `discipline` | Strategy Discipline — systematic vs impulsive |
| `emotion` | Emotional Control — calm vs reactive |

### Question Structure

```ts
interface QuizOption {
  label: string;
  scores: { bias: number; risk: number; discipline: number; emotion: number };
}

interface QuizQuestion {
  question: string;
  category: 'bias' | 'risk' | 'discipline' | 'emotion';
  options: QuizOption[]; // 3 options each
}
```

### Profile Structure

```ts
interface TraderProfile {
  key: string;
  name: string;
  icon: string;
  description: string;
  traits: string[];
  recommendedTools: { name: string; anchor: string }[];
  matcher: (scores: Scores) => number;
}
```

## Profiles

| Profile | Key Dimensions | Recommended Tools |
|---------|---------------|-------------------|
| The Analyst | High discipline, low risk, low emotion | Funding Rates, Long/Short Ratio, Economic Calendar |
| The Trend Follower | Bullish bias, medium risk, medium discipline | Interactive Charts, Market Dominance, Market Heatmap |
| The Contrarian | Bearish bias, medium risk, high discipline | Liquidation Bubbles, Fear & Greed Index, Funding Rates |
| The High-Risk Trader | High risk, high emotion, low discipline | BTC Price Ticker, Liquidation Bubbles, Long/Short Ratio |

Profile matching uses a fit-score function per profile. Highest fit wins. Ties broken by priority order (Analyst > Trend Follower > Contrarian > High-Risk).

## UI Flow

### Entry Point

Existing `TraderQuiz` card in Signals section becomes a teaser card with quiz title, hook text, and "Take the Quiz" CTA button.

### Modal Screens (4 screens)

1. **Intro** — Title, description, animated icon, "Start Quiz" button, progress indicator (0/8)
2. **Questions (×8)** — Progress bar, category label, question text, 3 glassmorphic answer cards, auto-advance on click, slide/fade transitions
3. **Email Gate** — "Your result is ready!" teaser, email input, "Reveal My Profile" CTA, "Skip" link, posts to `/api/newsletter`
4. **Result Card** — Profile icon + name, description, trait badges, 4 dimension progress bars (0-100%), recommended tools with scroll-to-anchor links, "Share Result" (clipboard) button, "Retake Quiz" button

### Styling

- Full-screen modal with `backdrop-blur` background
- Dark glassmorphic card, max-width ~600px, centered
- Neon green accents consistent with existing theme (`--green-primary`)

## Component Architecture

### Files Changed

| File | Action |
|------|--------|
| `data/quiz.ts` | Rewrite with new data structures |
| `components/TraderQuiz.tsx` | Rewrite as teaser card + modal |

### Sub-Components (all within TraderQuiz.tsx)

- `TraderQuiz` — Outer wrapper, teaser card, modal open/close state
- `QuizModal` — Full-screen overlay, quiz state machine
- `QuizProgress` — Progress bar
- `QuizQuestion` — Single question with 3 answer cards
- `QuizEmailGate` — Email collection screen
- `QuizResult` — Result card with profile, dimension bars, recommendations, share

### State (local useState, no Zustand)

- `isOpen: boolean`
- `screen: 'intro' | 'quiz' | 'email' | 'result'`
- `currentQuestion: number`
- `scores: { bias: number; risk: number; discipline: number; emotion: number }`
- `profile: TraderProfile | null`

## Scoring Example

For a Market Bias question like "What's your default market outlook?":

| Answer | bias | risk | discipline | emotion |
|--------|------|------|------------|---------|
| "I look for bullish setups" | +3 | 0 | +1 | 0 |
| "I follow the trend direction" | +1 | 0 | +2 | 0 |
| "I prefer shorting overextended moves" | -2 | +1 | +1 | 0 |

Raw scores are totaled across all 8 questions, then normalized to 0-100% for display.
