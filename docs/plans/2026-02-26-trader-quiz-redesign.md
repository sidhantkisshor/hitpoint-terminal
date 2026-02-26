# Trader Quiz Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the simple archetype quiz with a multi-dimension psychological trading profile system in a full-screen modal overlay.

**Architecture:** Rewrite `data/quiz.ts` with new scoring data structures (8 questions, 4 dimensions, 4 profiles with matcher functions). Rewrite `components/TraderQuiz.tsx` as a teaser card + full-screen modal with 4 screens (intro, questions, email gate, result). All state is local useState — no Zustand needed.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS

**No test framework configured** — skip TDD steps, verify manually with `npm run build`.

---

### Task 1: Rewrite Quiz Data Model

**Files:**
- Rewrite: `data/quiz.ts` (currently 82 lines — full replacement)

**Step 1: Write the new interfaces and types**

Replace the entire contents of `data/quiz.ts` with:

```ts
export interface Scores {
  bias: number;
  risk: number;
  discipline: number;
  emotion: number;
}

export interface QuizOption {
  label: string;
  scores: Scores;
}

export interface QuizQuestion {
  question: string;
  category: 'bias' | 'risk' | 'discipline' | 'emotion';
  options: [QuizOption, QuizOption, QuizOption];
}

export interface TraderProfile {
  key: string;
  name: string;
  icon: string;
  description: string;
  traits: string[];
  recommendedTools: { name: string; anchor: string }[];
  matcher: (scores: Scores) => number;
}
```

**Step 2: Add the 8 quiz questions**

Add below the interfaces. 2 questions per category, 3 options each. Every option scores across all 4 dimensions:

```ts
export const quizQuestions: QuizQuestion[] = [
  // === MARKET BIAS (2 questions) ===
  {
    question: "What's your default market outlook?",
    category: 'bias',
    options: [
      { label: 'I look for bullish setups and buy dips', scores: { bias: 3, risk: 0, discipline: 1, emotion: 0 } },
      { label: 'I follow whatever direction the trend is moving', scores: { bias: 1, risk: 0, discipline: 2, emotion: 0 } },
      { label: 'I prefer shorting overextended moves', scores: { bias: -2, risk: 1, discipline: 1, emotion: 0 } },
    ],
  },
  {
    question: 'Bitcoin just hit a new all-time high. What do you do?',
    category: 'bias',
    options: [
      { label: 'Go long — momentum is everything', scores: { bias: 3, risk: 1, discipline: 0, emotion: 1 } },
      { label: 'Wait for a pullback to enter', scores: { bias: 1, risk: 0, discipline: 2, emotion: 0 } },
      { label: 'Start looking for a short entry', scores: { bias: -3, risk: 1, discipline: 1, emotion: 0 } },
    ],
  },
  // === RISK TOLERANCE (2 questions) ===
  {
    question: 'How much of your portfolio do you risk on a single trade?',
    category: 'risk',
    options: [
      { label: '1-2% with a strict stop loss', scores: { bias: 0, risk: -2, discipline: 3, emotion: 0 } },
      { label: '5-10% if the setup looks good', scores: { bias: 0, risk: 1, discipline: 1, emotion: 0 } },
      { label: '25%+ when I\'m feeling confident', scores: { bias: 0, risk: 3, discipline: -1, emotion: 2 } },
    ],
  },
  {
    question: 'Pick your ideal leverage:',
    category: 'risk',
    options: [
      { label: '1x — spot only, no leverage', scores: { bias: 0, risk: -3, discipline: 2, emotion: -1 } },
      { label: '3-5x with proper stop losses', scores: { bias: 0, risk: 1, discipline: 2, emotion: 0 } },
      { label: '20x+ — high conviction plays', scores: { bias: 0, risk: 3, discipline: -1, emotion: 2 } },
    ],
  },
  // === DISCIPLINE (2 questions) ===
  {
    question: 'How do you decide when to enter a trade?',
    category: 'discipline',
    options: [
      { label: 'I follow a checklist of indicators and confirmations', scores: { bias: 0, risk: -1, discipline: 3, emotion: -1 } },
      { label: 'I watch the chart and go with my gut feeling', scores: { bias: 0, risk: 1, discipline: -1, emotion: 2 } },
      { label: 'I use a mix of analysis and intuition', scores: { bias: 0, risk: 0, discipline: 1, emotion: 1 } },
    ],
  },
  {
    question: 'Your trade hits your stop loss. What happens next?',
    category: 'discipline',
    options: [
      { label: 'I accept the loss and move on to the next setup', scores: { bias: 0, risk: 0, discipline: 3, emotion: -2 } },
      { label: 'I re-enter if the setup still looks valid', scores: { bias: 0, risk: 1, discipline: 1, emotion: 1 } },
      { label: 'I remove the stop and give it more room', scores: { bias: 0, risk: 2, discipline: -2, emotion: 3 } },
    ],
  },
  // === EMOTIONAL BEHAVIOR (2 questions) ===
  {
    question: 'The market crashes 30% in a day. How do you feel?',
    category: 'emotion',
    options: [
      { label: 'Excited — volatility means opportunity', scores: { bias: 0, risk: 1, discipline: 0, emotion: -1 } },
      { label: 'Nervous but I stick to my plan', scores: { bias: 0, risk: 0, discipline: 2, emotion: 1 } },
      { label: 'Panicked — I close everything immediately', scores: { bias: 0, risk: -1, discipline: -2, emotion: 3 } },
    ],
  },
  {
    question: 'Everyone on Twitter is buying a coin you\'ve never heard of. What do you do?',
    category: 'emotion',
    options: [
      { label: 'Ignore it — if I didn\'t research it, I don\'t trade it', scores: { bias: 0, risk: -1, discipline: 3, emotion: -2 } },
      { label: 'Research it quickly and decide based on the chart', scores: { bias: 0, risk: 0, discipline: 1, emotion: 1 } },
      { label: 'Ape in before I miss the pump', scores: { bias: 0, risk: 2, discipline: -2, emotion: 3 } },
    ],
  },
];
```

**Step 3: Add the 4 trader profiles with matcher functions**

```ts
export const traderProfiles: TraderProfile[] = [
  {
    key: 'analyst',
    name: 'The Analyst',
    icon: '\uD83E\uDDD0', // 🧐
    description:
      'Methodical and data-driven. You never enter a trade without checking multiple confirmations. Risk management is your religion, and you let the numbers speak for themselves.',
    traits: ['Disciplined', 'Low Risk', 'Data-Driven'],
    recommendedTools: [
      { name: 'Funding Rates', anchor: 'dashboard' },
      { name: 'Long/Short Ratio', anchor: 'dashboard' },
      { name: 'Economic Calendar', anchor: 'dashboard' },
    ],
    matcher: (s) => s.discipline * 2 + (20 - s.risk) + (15 - s.emotion),
  },
  {
    key: 'trend-follower',
    name: 'The Trend Follower',
    icon: '\uD83C\uDFAF', // 🎯
    description:
      'You ride the wave and let winners run. Bullish by nature, you trust momentum and follow the market\'s direction. Patience is your edge — you wait for the trend to confirm before entering.',
    traits: ['Bullish Bias', 'Trend Rider', 'Patient'],
    recommendedTools: [
      { name: 'Interactive Charts', anchor: 'charts' },
      { name: 'Market Dominance', anchor: 'dashboard' },
      { name: 'Market Heatmap', anchor: 'dashboard' },
    ],
    matcher: (s) => s.bias * 2 + s.discipline + 10,
  },
  {
    key: 'contrarian',
    name: 'The Contrarian',
    icon: '\uD83D\uDD04', // 🔄
    description:
      'You go against the crowd and profit from extremes. When everyone is euphoric, you\'re looking for shorts. When panic hits, you\'re accumulating. Discipline keeps you ahead of the herd.',
    traits: ['Bearish Bias', 'Counter-Trend', 'Disciplined'],
    recommendedTools: [
      { name: 'Liquidation Bubbles', anchor: 'dashboard' },
      { name: 'Fear & Greed Index', anchor: 'dashboard' },
      { name: 'Funding Rates', anchor: 'dashboard' },
    ],
    matcher: (s) => -s.bias * 2 + s.discipline + 10,
  },
  {
    key: 'high-risk',
    name: 'The High-Risk Trader',
    icon: '\uD83D\uDD25', // 🔥
    description:
      'You thrive on adrenaline and big moves. High leverage, quick decisions, and bold conviction define your style. You know the risks — and you take them anyway.',
    traits: ['High Leverage', 'Emotional', 'Bold'],
    recommendedTools: [
      { name: 'BTC Price Ticker', anchor: 'dashboard' },
      { name: 'Liquidation Bubbles', anchor: 'dashboard' },
      { name: 'Long/Short Ratio', anchor: 'dashboard' },
    ],
    matcher: (s) => s.risk * 2 + s.emotion * 2 + (10 - s.discipline),
  },
];

/** Normalize raw scores to 0-100 range for display */
export function normalizeScores(raw: Scores): Scores {
  // Theoretical range per dimension across 8 questions is roughly -6 to +6 for bias, -8 to +12 for others
  // We map to 0-100 using a simple min-max approach centered around 0
  const normalize = (val: number, min: number, max: number) =>
    Math.round(Math.max(0, Math.min(100, ((val - min) / (max - min)) * 100)));

  return {
    bias: normalize(raw.bias, -6, 8),
    risk: normalize(raw.risk, -8, 12),
    discipline: normalize(raw.discipline, -8, 16),
    emotion: normalize(raw.emotion, -6, 12),
  };
}

/** Determine the best-fit profile from raw scores */
export function getProfile(scores: Scores): TraderProfile {
  let best = traderProfiles[0];
  let bestScore = -Infinity;

  for (const profile of traderProfiles) {
    const fit = profile.matcher(scores);
    if (fit > bestScore) {
      bestScore = fit;
      best = profile;
    }
  }

  return best;
}
```

**Step 4: Verify build**

Run: `npm run build`
Expected: Build succeeds (the old component imports will temporarily break — that's OK, we fix it in Task 2)

**Step 5: Commit**

```bash
git add data/quiz.ts
git commit -m "feat: rewrite quiz data with multi-dimension scoring model"
```

---

### Task 2: Build the TraderQuiz Teaser Card

**Files:**
- Rewrite: `components/TraderQuiz.tsx` (currently 138 lines — full replacement)

This task creates just the teaser card shell and the modal open/close mechanism. The modal content screens are added in subsequent tasks.

**Step 1: Write the teaser card + empty modal shell**

Replace the entire contents of `components/TraderQuiz.tsx`:

```tsx
'use client';

import { useState, useCallback } from 'react';
import {
  quizQuestions,
  traderProfiles,
  normalizeScores,
  getProfile,
  type Scores,
  type TraderProfile,
} from '@/data/quiz';

type Screen = 'intro' | 'quiz' | 'email' | 'result';

const INITIAL_SCORES: Scores = { bias: 0, risk: 0, discipline: 0, emotion: 0 };

export function TraderQuiz() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bento-item col-span-12 lg:col-span-3 scroll-fade-in">
      <div className="item-header">
        <span className="item-title">TRADER QUIZ</span>
      </div>

      <div className="flex flex-col items-center justify-center h-[300px] text-center">
        <div className="text-5xl mb-4">{'\uD83E\uDDD0'}</div>
        <p className="text-white font-bold text-lg mb-2">
          What Type of Trader Are You?
        </p>
        <p className="text-gray-400 text-sm mb-6 leading-relaxed max-w-[220px]">
          Discover your trading personality and get personalized tool recommendations.
        </p>
        <button
          onClick={() => setIsOpen(true)}
          className="bg-[#c4f82e] text-black font-bold py-3 px-8 rounded-xl hover:bg-[#a8e024] transition-colors text-sm"
        >
          Take the Quiz
        </button>
      </div>

      {isOpen && <QuizModal onClose={() => setIsOpen(false)} />}
    </div>
  );
}

function QuizModal({ onClose }: { onClose: () => void }) {
  const [screen, setScreen] = useState<Screen>('intro');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [scores, setScores] = useState<Scores>(INITIAL_SCORES);
  const [profile, setProfile] = useState<TraderProfile | null>(null);
  const [normalized, setNormalized] = useState<Scores>(INITIAL_SCORES);

  const handleAnswer = useCallback(
    (optionScores: Scores) => {
      const newScores: Scores = {
        bias: scores.bias + optionScores.bias,
        risk: scores.risk + optionScores.risk,
        discipline: scores.discipline + optionScores.discipline,
        emotion: scores.emotion + optionScores.emotion,
      };
      setScores(newScores);

      if (currentQuestion < quizQuestions.length - 1) {
        setCurrentQuestion((q) => q + 1);
      } else {
        setProfile(getProfile(newScores));
        setNormalized(normalizeScores(newScores));
        setScreen('email');
      }
    },
    [scores, currentQuestion]
  );

  const reset = useCallback(() => {
    setScreen('intro');
    setCurrentQuestion(0);
    setScores(INITIAL_SCORES);
    setProfile(null);
    setNormalized(INITIAL_SCORES);
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(12px)' }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors text-2xl"
        aria-label="Close quiz"
      >
        ✕
      </button>

      {/* Modal card */}
      <div className="w-full max-w-[600px] bg-gradient-to-b from-[#121212] to-[#0a0a0a] border border-white/10 rounded-3xl p-8 relative overflow-hidden">
        {/* Top glow line */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(196,248,46,0.3) 50%, transparent 100%)',
          }}
        />

        {screen === 'intro' && (
          <QuizIntro onStart={() => setScreen('quiz')} />
        )}

        {screen === 'quiz' && (
          <QuizQuestionScreen
            questionIndex={currentQuestion}
            onAnswer={handleAnswer}
          />
        )}

        {screen === 'email' && (
          <QuizEmailGate
            profile={profile!}
            onReveal={() => setScreen('result')}
          />
        )}

        {screen === 'result' && profile && (
          <QuizResult
            profile={profile}
            normalized={normalized}
            onRetake={reset}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
}

// ── Intro Screen ──────────────────────────────────────────────

function QuizIntro({ onStart }: { onStart: () => void }) {
  return (
    <div className="text-center py-8">
      <div className="text-6xl mb-6">{'\uD83E\uDDD0'}</div>
      <h2 className="text-white text-2xl font-bold mb-3">
        Trader Profile Quiz
      </h2>
      <p className="text-gray-400 text-sm mb-2 max-w-[400px] mx-auto leading-relaxed">
        8 questions. 4 dimensions. Discover your trading personality and
        find out which tools match your style.
      </p>
      <p className="text-gray-600 text-xs mb-8">Takes about 1 minute</p>
      <button
        onClick={onStart}
        className="bg-[#c4f82e] text-black font-bold py-3 px-10 rounded-xl hover:bg-[#a8e024] transition-colors text-sm"
      >
        Start Quiz
      </button>
      <div className="mt-6 flex justify-center gap-1.5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-white/10"
          />
        ))}
      </div>
    </div>
  );
}

// ── Question Screen ───────────────────────────────────────────

function QuizQuestionScreen({
  questionIndex,
  onAnswer,
}: {
  questionIndex: number;
  onAnswer: (scores: Scores) => void;
}) {
  const q = quizQuestions[questionIndex];
  const categoryLabels: Record<string, string> = {
    bias: 'Market Bias',
    risk: 'Risk Tolerance',
    discipline: 'Discipline',
    emotion: 'Emotional Behavior',
  };

  return (
    <div>
      {/* Progress bar */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-xs text-gray-500 font-mono">
          {questionIndex + 1} / {quizQuestions.length}
        </span>
        <span className="text-xs text-[#c4f82e]/60 uppercase tracking-wider">
          {categoryLabels[q.category]}
        </span>
      </div>
      <div className="w-full h-1 bg-white/5 rounded-full mb-8">
        <div
          className="h-full bg-[#c4f82e] rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${((questionIndex + 1) / quizQuestions.length) * 100}%`,
          }}
        />
      </div>

      {/* Question */}
      <p className="text-white text-lg font-semibold mb-6">{q.question}</p>

      {/* Answer options */}
      <div className="space-y-3">
        {q.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => onAnswer(opt.scores)}
            className="w-full text-left px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-sm text-gray-300 hover:border-[#c4f82e]/40 hover:text-white hover:bg-white/10 transition-all duration-200"
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Email Gate Screen ─────────────────────────────────────────

function QuizEmailGate({
  profile,
  onReveal,
}: {
  profile: TraderProfile;
  onReveal: () => void;
}) {
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
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

    onReveal();
  };

  return (
    <div className="text-center py-8">
      <div className="text-5xl mb-4">{profile.icon}</div>
      <p className="text-white font-bold text-xl mb-1">Your result is ready!</p>
      <p className="text-gray-400 text-sm mb-6">
        Enter your email to reveal your trader profile.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3 max-w-[360px] mx-auto">
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
          Reveal My Profile
        </button>
      </form>
      <button
        onClick={onReveal}
        className="text-gray-600 text-xs mt-4 hover:text-gray-400 transition-colors"
      >
        Skip
      </button>
    </div>
  );
}

// ── Result Screen ─────────────────────────────────────────────

const DIMENSION_LABELS: { key: keyof Scores; label: string }[] = [
  { key: 'bias', label: 'Market Bias' },
  { key: 'risk', label: 'Risk Tolerance' },
  { key: 'discipline', label: 'Discipline' },
  { key: 'emotion', label: 'Emotional Control' },
];

function QuizResult({
  profile,
  normalized,
  onRetake,
  onClose,
}: {
  profile: TraderProfile;
  normalized: Scores;
  onRetake: () => void;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const text = `I'm ${profile.name}! ${profile.traits.join(' · ')}\n\nDiscover your trading personality at hitpointterminal.com`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard not available
    }
  };

  const handleToolClick = (anchor: string) => {
    onClose();
    setTimeout(() => {
      document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="text-center">
      {/* Profile header */}
      <div className="text-5xl mb-3">{profile.icon}</div>
      <h3 className="text-[#c4f82e] font-bold text-2xl mb-1">{profile.name}</h3>

      {/* Trait badges */}
      <div className="flex justify-center gap-2 mb-4">
        {profile.traits.map((trait) => (
          <span
            key={trait}
            className="text-xs px-3 py-1 rounded-full bg-[#c4f82e]/10 text-[#c4f82e] border border-[#c4f82e]/20"
          >
            {trait}
          </span>
        ))}
      </div>

      <p className="text-gray-400 text-sm leading-relaxed max-w-[440px] mx-auto mb-6">
        {profile.description}
      </p>

      {/* Dimension breakdown */}
      <div className="space-y-3 mb-6 text-left max-w-[400px] mx-auto">
        {DIMENSION_LABELS.map(({ key, label }) => (
          <div key={key}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-500">{label}</span>
              <span className="text-gray-400 font-mono">{normalized[key]}%</span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#c4f82e] rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${normalized[key]}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Recommended tools */}
      <div className="mb-6">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
          Recommended for you
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {profile.recommendedTools.map((tool) => (
            <button
              key={tool.name}
              onClick={() => handleToolClick(tool.anchor)}
              className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:border-[#c4f82e]/40 hover:text-white transition-all"
            >
              {tool.name} →
            </button>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-center gap-3">
        <button
          onClick={handleShare}
          className="px-6 py-2.5 rounded-xl bg-[#c4f82e] text-black font-bold text-sm hover:bg-[#a8e024] transition-colors"
        >
          {copied ? 'Copied!' : 'Share Result'}
        </button>
        <button
          onClick={onRetake}
          className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm hover:border-white/20 hover:text-white transition-all"
        >
          Retake Quiz
        </button>
      </div>
    </div>
  );
}
```

**Step 2: Verify build passes**

Run: `npm run build`
Expected: Build succeeds with no errors.

**Step 3: Commit**

```bash
git add data/quiz.ts components/TraderQuiz.tsx
git commit -m "feat: rebuild TraderQuiz with multi-dimension scoring and full-screen modal"
```

---

### Task 3: Manual Visual QA & Polish

**Files:**
- May modify: `components/TraderQuiz.tsx` (minor tweaks)
- May modify: `app/globals.css` (if animations needed)

**Step 1: Start dev server and test**

Run: `npm run dev`

Test the following flows manually:
1. Teaser card renders in the Signals section at correct grid position
2. "Take the Quiz" opens the full-screen modal with backdrop blur
3. Intro screen shows, "Start Quiz" advances to questions
4. Progress bar advances with each question (1/8 through 8/8)
5. Category labels change correctly (Market Bias → Risk Tolerance → Discipline → Emotional Behavior)
6. After question 8, email gate appears with profile icon preview
7. "Skip" goes directly to result; email submit also goes to result
8. Result shows: profile name, icon, traits, description, 4 dimension bars, recommended tools
9. "Share Result" copies text to clipboard
10. Tool recommendation buttons close modal and scroll to correct section
11. "Retake Quiz" resets to intro screen
12. Close button (✕) closes modal
13. Mobile responsive — modal works on small screens

**Step 2: Fix any visual issues found**

Apply fixes to `components/TraderQuiz.tsx` or `app/globals.css` as needed.

**Step 3: Final build check**

Run: `npm run build`
Expected: Build succeeds.

**Step 4: Commit any polish changes**

```bash
git add components/TraderQuiz.tsx app/globals.css
git commit -m "fix: polish quiz modal visuals and responsive layout"
```

---

## Summary

| Task | Description | Files |
|------|------------|-------|
| 1 | Rewrite quiz data model (interfaces, 8 questions, 4 profiles, scoring functions) | `data/quiz.ts` |
| 2 | Build TraderQuiz teaser card + full-screen modal with all 4 screens | `components/TraderQuiz.tsx` |
| 3 | Manual visual QA, responsive testing, polish | `components/TraderQuiz.tsx`, `app/globals.css` |
