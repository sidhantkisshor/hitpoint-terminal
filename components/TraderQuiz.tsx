'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  pickQuestions,
  normalizeScores,
  getProfile,
  type Scores,
  type QuizQuestion,
  type TraderProfile,
} from '@/data/quiz';

type Screen = 'intro' | 'quiz' | 'result';

const INITIAL_SCORES: Scores = { conviction: 0, risk: 0, discipline: 0, independence: 0 };
const QUESTIONS_PER_QUIZ = 8;

export function TraderQuiz() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bento-item col-span-12 md:col-span-6 lg:col-span-3 scroll-fade-in">
      <div className="item-header">
        <span className="item-title">TRADER QUIZ</span>
      </div>

      <div className="flex flex-col items-center justify-center h-[260px] sm:h-[300px] text-center">
        <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">{'\uD83E\uDDD0'}</div>
        <p className="text-white font-display font-bold text-base sm:text-lg mb-2">
          What Type of Trader Are You?
        </p>
        <p className="text-[#a0a0a0] text-xs sm:text-sm mb-5 sm:mb-6 leading-relaxed max-w-[220px]">
          Discover your trading personality and get personalized tool recommendations.
        </p>
        <button
          onClick={() => setIsOpen(true)}
          className="bg-[#c4f82e] text-black font-display font-bold py-3 px-8 rounded-xl hover:bg-[#a8e024] transition-colors text-xs sm:text-sm"
        >
          Take the Quiz
        </button>
      </div>

      {isOpen && createPortal(
        <QuizModal onClose={() => setIsOpen(false)} />,
        document.body
      )}
    </div>
  );
}

export function QuizModal({ onClose }: { onClose: () => void }) {
  const [screen, setScreen] = useState<Screen>('intro');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const questionRef = useRef(0);
  const [scores, setScores] = useState<Scores>(INITIAL_SCORES);
  const profile = useMemo(() => (screen === 'result' ? getProfile(scores) : null), [screen, scores]);
  const normalized = useMemo(() => normalizeScores(scores), [scores]);

  const handleAnswer = useCallback(
    (optionScores: Scores) => {
      const q = questionRef.current;

      setScores((prev) => ({
        conviction: prev.conviction + optionScores.conviction,
        risk: prev.risk + optionScores.risk,
        discipline: prev.discipline + optionScores.discipline,
        independence: prev.independence + optionScores.independence,
      }));

      if (q < questions.length - 1) {
        questionRef.current = q + 1;
        setCurrentQuestion(q + 1);
      } else {
        setScreen('result');
      }
    },
    [questions]
  );

  const reset = useCallback(() => {
    setScreen('intro');
    setQuestions([]);
    questionRef.current = 0;
    setCurrentQuestion(0);
    setScores(INITIAL_SCORES);
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.88)', backdropFilter: 'blur(16px)' }}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 text-[#5a5a5a] hover:text-white transition-colors text-xl sm:text-2xl"
        aria-label="Close quiz"
      >
        ✕
      </button>

      <div className="w-full max-w-[600px] bg-gradient-to-b from-[#111] to-[#080808] border border-white/[0.07] rounded-2xl sm:rounded-3xl p-5 sm:p-8 relative overflow-hidden max-h-[90vh] overflow-y-auto">
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(196,248,46,0.25) 50%, transparent 100%)' }}
        />

        {screen === 'intro' && <QuizIntro onStart={() => { setQuestions(pickQuestions()); setScreen('quiz'); }} />}
        {screen === 'quiz' && questions.length > 0 && <QuizQuestionScreen questions={questions} questionIndex={currentQuestion} onAnswer={handleAnswer} />}
        {screen === 'result' && profile && <QuizResult profile={profile} normalized={normalized} onRetake={reset} onClose={onClose} />}
      </div>
    </div>
  );
}

function QuizIntro({ onStart }: { onStart: () => void }) {
  return (
    <div className="text-center py-4 sm:py-8">
      <div className="text-5xl sm:text-6xl mb-4 sm:mb-6">{'\uD83E\uDDD0'}</div>
      <h2 className="text-white text-xl sm:text-2xl font-display font-bold mb-3">
        Trader Profile Quiz
      </h2>
      <p className="text-[#a0a0a0] text-xs sm:text-sm mb-2 max-w-[400px] mx-auto leading-relaxed">
        8 questions. Randomized every time. Discover your crypto trading personality.
      </p>
      <p className="text-[#5a5a5a] text-[10px] sm:text-xs mb-6 sm:mb-8">Takes about 1 minute</p>
      <button
        onClick={onStart}
        className="bg-[#c4f82e] text-black font-display font-bold py-3 px-10 rounded-xl hover:bg-[#a8e024] transition-colors text-xs sm:text-sm"
      >
        Start Quiz
      </button>
      <div className="mt-5 sm:mt-6 flex justify-center gap-1.5">
        {Array.from({ length: QUESTIONS_PER_QUIZ }).map((_, i) => (
          <div key={i} className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white/[0.07]" />
        ))}
      </div>
    </div>
  );
}

function QuizQuestionScreen({
  questions,
  questionIndex,
  onAnswer,
}: {
  questions: QuizQuestion[];
  questionIndex: number;
  onAnswer: (scores: Scores) => void;
}) {
  const q = questions[questionIndex];

  return (
    <div>
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <span className="text-[10px] sm:text-xs text-[#5a5a5a] font-mono">
          {questionIndex + 1} / {questions.length}
        </span>
        <span className="text-[10px] sm:text-xs text-[#c4f82e]/50 font-display uppercase tracking-wider">
          {CATEGORY_LABELS[q.category]}
        </span>
      </div>
      <div className="w-full h-0.5 sm:h-1 bg-white/[0.04] rounded-full mb-6 sm:mb-8">
        <div
          className="h-full bg-[#c4f82e] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${((questionIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      <p className="text-white text-base sm:text-lg font-semibold mb-4 sm:mb-6">{q.question}</p>

      <div className="space-y-2 sm:space-y-3">
        {q.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => onAnswer(opt.scores)}
            className="w-full text-left px-4 sm:px-5 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-white/[0.03] border border-white/[0.06] text-xs sm:text-sm text-[#a0a0a0] hover:border-[#c4f82e]/30 hover:text-white hover:bg-white/[0.06] transition-all duration-200"
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

const CATEGORY_LABELS: Record<string, string> = {
  conviction: 'Conviction',
  risk: 'Risk Appetite',
  discipline: 'Discipline',
  independence: 'Independence',
};

const DIMENSION_LABELS: { key: keyof Scores; label: string }[] = [
  { key: 'conviction', label: 'Conviction' },
  { key: 'risk', label: 'Risk Appetite' },
  { key: 'discipline', label: 'Discipline' },
  { key: 'independence', label: 'Independence' },
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
  const [shareState, setShareState] = useState<'idle' | 'copied' | 'failed'>('idle');

  const handleShare = async () => {
    const text = `I'm ${profile.name}! ${profile.icon}\nConviction: ${normalized.conviction}% \u00B7 Risk: ${normalized.risk}% \u00B7 Discipline: ${normalized.discipline}% \u00B7 Independence: ${normalized.independence}%\n\nWhat trader are you? Find out at hitpointterminal.com`;
    try {
      await navigator.clipboard.writeText(text);
      setShareState('copied');
      setTimeout(() => setShareState('idle'), 2000);
    } catch {
      setShareState('failed');
      setTimeout(() => setShareState('idle'), 2000);
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
      <div className="text-4xl sm:text-5xl mb-3">{profile.icon}</div>
      <h3 className="text-[#c4f82e] font-display font-bold text-xl sm:text-2xl mb-1">{profile.name}</h3>

      <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mb-4">
        {profile.traits.map((trait) => (
          <span
            key={trait}
            className="text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-[#c4f82e]/[0.08] text-[#c4f82e] border border-[#c4f82e]/[0.15]"
          >
            {trait}
          </span>
        ))}
      </div>

      <p className="text-[#a0a0a0] text-xs sm:text-sm leading-relaxed max-w-[440px] mx-auto mb-5 sm:mb-6">
        {profile.description}
      </p>

      <div className="space-y-2.5 sm:space-y-3 mb-5 sm:mb-6 text-left max-w-[400px] mx-auto">
        {DIMENSION_LABELS.map(({ key, label }) => (
          <div key={key}>
            <div className="flex justify-between text-[10px] sm:text-xs mb-1">
              <span className="text-[#5a5a5a]">{label}</span>
              <span className="text-[#a0a0a0] font-mono">{normalized[key]}%</span>
            </div>
            <div className="w-full h-1 sm:h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#c4f82e] rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${normalized[key]}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mb-5 sm:mb-6">
        <p className="text-[10px] sm:text-xs text-[#5a5a5a] font-display uppercase tracking-wider mb-2 sm:mb-3">
          Recommended for you
        </p>
        <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
          {profile.recommendedTools.map((tool) => (
            <button
              key={tool.name}
              onClick={() => handleToolClick(tool.anchor)}
              className="text-[10px] sm:text-xs px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[#a0a0a0] hover:border-[#c4f82e]/30 hover:text-white transition-all"
            >
              {tool.name} →
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-center gap-2 sm:gap-3">
        <button
          onClick={handleShare}
          className="px-5 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-[#c4f82e] text-black font-display font-bold text-xs sm:text-sm hover:bg-[#a8e024] transition-colors"
        >
          {shareState === 'copied' ? 'Copied!' : shareState === 'failed' ? 'Copy failed' : 'Share Result'}
        </button>
        <button
          onClick={onRetake}
          className="px-5 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.07] text-[#a0a0a0] text-xs sm:text-sm hover:border-white/15 hover:text-white transition-all"
        >
          Retake Quiz
        </button>
      </div>
    </div>
  );
}
