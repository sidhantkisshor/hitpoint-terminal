'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  quizQuestions,
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
      setScores((prev) => {
        const newScores: Scores = {
          bias: prev.bias + optionScores.bias,
          risk: prev.risk + optionScores.risk,
          discipline: prev.discipline + optionScores.discipline,
          emotion: prev.emotion + optionScores.emotion,
        };

        if (currentQuestion < quizQuestions.length - 1) {
          setCurrentQuestion((q) => q + 1);
        } else {
          setProfile(getProfile(newScores));
          setNormalized(normalizeScores(newScores));
          setScreen('email');
        }

        return newScores;
      });
    },
    [currentQuestion]
  );

  const reset = useCallback(() => {
    setScreen('intro');
    setCurrentQuestion(0);
    setScores(INITIAL_SCORES);
    setProfile(null);
    setNormalized(INITIAL_SCORES);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(12px)' }}
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors text-2xl"
        aria-label="Close quiz"
      >
        ✕
      </button>

      <div className="w-full max-w-[600px] bg-gradient-to-b from-[#121212] to-[#0a0a0a] border border-white/10 rounded-3xl p-8 relative overflow-hidden">
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

        {screen === 'email' && profile && (
          <QuizEmailGate
            profile={profile}
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
        {Array.from({ length: quizQuestions.length }).map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-white/10"
          />
        ))}
      </div>
    </div>
  );
}

function QuizQuestionScreen({
  questionIndex,
  onAnswer,
}: {
  questionIndex: number;
  onAnswer: (scores: Scores) => void;
}) {
  const q = quizQuestions[questionIndex];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <span className="text-xs text-gray-500 font-mono">
          {questionIndex + 1} / {quizQuestions.length}
        </span>
        <span className="text-xs text-[#c4f82e]/60 uppercase tracking-wider">
          {CATEGORY_LABELS[q.category]}
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

      <p className="text-white text-lg font-semibold mb-6">{q.question}</p>

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

const CATEGORY_LABELS: Record<string, string> = {
  bias: 'Market Bias',
  risk: 'Risk Tolerance',
  discipline: 'Discipline',
  emotion: 'Emotional Behavior',
};

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
    const text = `I'm ${profile.name}! ${profile.traits.join(' \u00B7 ')}\n\nDiscover your trading personality at hitpointterminal.com`;
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
      <div className="text-5xl mb-3">{profile.icon}</div>
      <h3 className="text-[#c4f82e] font-bold text-2xl mb-1">{profile.name}</h3>

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
