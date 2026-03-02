'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { z } from 'zod';
import {
  pickQuestions,
  normalizeScores,
  getProfile,
  getProfileByKey,
  type Scores,
  type QuizQuestion,
  type TraderProfile,
} from '@/data/quiz';

type Screen = 'intro' | 'quiz' | 'result';

const INITIAL_SCORES: Scores = { conviction: 0, risk: 0, discipline: 0, independence: 0 };
const QUESTIONS_PER_QUIZ = 8;

// --- URL helpers ---

function buildQuizResultUrl(profile: TraderProfile, normalized: Scores, name?: string): string {
  const base = typeof window !== 'undefined' ? window.location.origin : 'https://hitpointterminal.com';
  const params = new URLSearchParams({
    quiz: profile.key,
    c: normalized.conviction.toString(),
    r: normalized.risk.toString(),
    d: normalized.discipline.toString(),
    i: normalized.independence.toString(),
  });
  if (name) params.set('name', name);
  return `${base}/?${params.toString()}`;
}

function generateRid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID().slice(0, 8);
  }
  return Math.random().toString(36).slice(2, 10);
}

function submitQuizResult(rid: string, profile: TraderProfile, normalized: Scores, name?: string) {
  fetch('/api/quiz/results', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      rid,
      name: name || undefined,
      profile: profile.key,
      scores: {
        c: normalized.conviction,
        r: normalized.risk,
        d: normalized.discipline,
        i: normalized.independence,
      },
      timestamp: new Date().toISOString(),
    }),
  }).catch(() => { /* fire-and-forget */ });
}

const QuizParamsSchema = z.object({
  quiz: z.string().min(1),
  c: z.coerce.number().int().min(0).max(100),
  r: z.coerce.number().int().min(0).max(100),
  d: z.coerce.number().int().min(0).max(100),
  i: z.coerce.number().int().min(0).max(100),
  name: z.string().max(30).optional(),
  rid: z.string().max(64).optional(),
});

function parseQuizParams(params: URLSearchParams): { profile: TraderProfile; normalized: Scores; name?: string; rid?: string } | null {
  const raw = {
    quiz: params.get('quiz'),
    c: params.get('c'),
    r: params.get('r'),
    d: params.get('d'),
    i: params.get('i'),
    name: params.get('name') ?? undefined,
    rid: params.get('rid') ?? undefined,
  };
  const parsed = QuizParamsSchema.safeParse(raw);
  if (!parsed.success) return null;
  const profile = getProfileByKey(parsed.data.quiz);
  if (!profile) return null;
  return {
    profile,
    normalized: {
      conviction: parsed.data.c,
      risk: parsed.data.r,
      discipline: parsed.data.d,
      independence: parsed.data.i,
    },
    name: parsed.data.name,
    rid: parsed.data.rid,
  };
}

function clearQuizUrlParams() {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  url.searchParams.delete('quiz');
  url.searchParams.delete('c');
  url.searchParams.delete('r');
  url.searchParams.delete('d');
  url.searchParams.delete('i');
  url.searchParams.delete('name');
  url.searchParams.delete('rid');
  window.history.replaceState({}, '', url.pathname);
}

// --- Bento card entry point ---

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

// --- Auto-open from URL params (rendered in page.tsx) ---

export function QuizAutoOpen() {
  const [result, setResult] = useState<{ profile: TraderProfile; normalized: Scores; name?: string; rid?: string } | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const parsed = parseQuizParams(params);
    if (parsed) {
      setResult(parsed);
      setIsOpen(true);
    }
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    clearQuizUrlParams();
  }, []);

  if (!isOpen || !result) return null;

  return createPortal(
    <QuizModal onClose={handleClose} initialResult={result} />,
    document.body
  );
}

// --- Quiz modal ---

interface QuizModalProps {
  onClose: () => void;
  initialResult?: { profile: TraderProfile; normalized: Scores; name?: string; rid?: string };
}

export function QuizModal({ onClose, initialResult }: QuizModalProps) {
  const [screen, setScreen] = useState<Screen>(initialResult ? 'result' : 'intro');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const questionRef = useRef(0);
  const [scores, setScores] = useState<Scores>(INITIAL_SCORES);
  const [userName, setUserName] = useState(initialResult?.name ?? '');
  const ridRef = useRef(initialResult?.rid ?? '');

  const profile = useMemo(() => {
    if (screen === 'result' && initialResult) return initialResult.profile;
    return screen === 'result' ? getProfile(scores) : null;
  }, [screen, scores, initialResult]);

  const normalized = useMemo(() => {
    if (screen === 'result' && initialResult) return initialResult.normalized;
    return normalizeScores(scores);
  }, [screen, scores, initialResult]);

  // Push result into URL when quiz completes organically + submit data
  const submitted = useRef(false);
  useEffect(() => {
    if (screen === 'result' && profile && !initialResult) {
      const rid = ridRef.current || generateRid();
      ridRef.current = rid;
      const url = new URL(window.location.href);
      url.searchParams.set('quiz', profile.key);
      url.searchParams.set('c', normalized.conviction.toString());
      url.searchParams.set('r', normalized.risk.toString());
      url.searchParams.set('d', normalized.discipline.toString());
      url.searchParams.set('i', normalized.independence.toString());
      url.searchParams.set('rid', rid);
      window.history.replaceState({}, '', url.toString());
      if (!submitted.current) {
        submitQuizResult(rid, profile, normalized);
        submitted.current = true;
      }
    }
  }, [screen, profile, normalized, initialResult]);

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
    clearQuizUrlParams();
    setScreen('intro');
    setQuestions([]);
    questionRef.current = 0;
    setCurrentQuestion(0);
    setScores(INITIAL_SCORES);
    setUserName('');
    ridRef.current = '';
    submitted.current = false;
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
        {screen === 'result' && profile && <QuizResult profile={profile} normalized={normalized} onRetake={reset} onClose={onClose} userName={userName} onNameChange={setUserName} rid={ridRef.current} />}
      </div>
    </div>
  );
}

// --- Sub-components ---

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

const SHARE_BTN = 'w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-[#a0a0a0] hover:border-[#c4f82e]/30 hover:text-white transition-all';

// --- Result screen ---

function QuizResult({
  profile,
  normalized,
  onRetake,
  onClose,
  userName,
  onNameChange,
  rid,
}: {
  profile: TraderProfile;
  normalized: Scores;
  onRetake: () => void;
  onClose: () => void;
  userName: string;
  onNameChange: (name: string) => void;
  rid: string;
}) {
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle');
  const [webShareSupported, setWebShareSupported] = useState(false);

  useEffect(() => {
    setWebShareSupported(typeof navigator.share === 'function');
  }, []);

  const trimmedName = userName.trim();
  const resultUrl = useMemo(() => buildQuizResultUrl(profile, normalized, trimmedName || undefined), [profile, normalized, trimmedName]);

  const shareText = trimmedName
    ? `${trimmedName} is ${profile.name}! ${profile.icon}\nOnly ${profile.rarity}% of traders get this result.\nConviction: ${normalized.conviction}% | Risk: ${normalized.risk}% | Discipline: ${normalized.discipline}% | Independence: ${normalized.independence}%\n\nWhat trader are you? Take the quiz:`
    : `I'm ${profile.name}! ${profile.icon}\nOnly ${profile.rarity}% of traders get this result.\nConviction: ${normalized.conviction}% | Risk: ${normalized.risk}% | Discipline: ${normalized.discipline}% | Independence: ${normalized.independence}%\n\nWhat trader are you? Take the quiz:`;

  // Update URL and re-submit when name changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (!url.searchParams.has('quiz')) return; // only update if quiz params exist
    if (trimmedName) {
      url.searchParams.set('name', trimmedName);
    } else {
      url.searchParams.delete('name');
    }
    window.history.replaceState({}, '', url.toString());
  }, [trimmedName]);

  const handleNameSubmit = () => {
    if (trimmedName && rid) {
      submitQuizResult(rid, profile, normalized, trimmedName);
    }
  };

  const handleTwitterShare = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(resultUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer,width=550,height=420');
  };

  const handleWhatsAppShare = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText + '\n' + resultUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleTelegramShare = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(resultUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleWebShare = async () => {
    try {
      await navigator.share({ title: 'My Trader Profile', text: shareText, url: resultUrl });
    } catch { /* user cancelled */ }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${resultUrl}`);
      setCopyState('copied');
      setTimeout(() => setCopyState('idle'), 2000);
    } catch { /* silent */ }
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

      <p className="text-xs sm:text-sm text-[#a0a0a0] mb-3">
        Only <span className="text-[#c4f82e] font-mono font-bold">{profile.rarity}%</span> of traders get this result
      </p>

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

      {/* Name input */}
      <div className="mb-5 sm:mb-6 max-w-[320px] mx-auto">
        <p className="text-[10px] sm:text-xs text-[#5a5a5a] font-display uppercase tracking-wider mb-2">
          Personalize your card
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={userName}
            onChange={(e) => onNameChange(e.target.value.slice(0, 30))}
            onBlur={handleNameSubmit}
            onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
            placeholder="Enter your name"
            className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs sm:text-sm text-white placeholder-[#5a5a5a] outline-none focus:border-[#c4f82e]/30 transition-colors"
            maxLength={30}
          />
        </div>
      </div>

      {/* Social share row */}
      <p className="text-[10px] sm:text-xs text-[#5a5a5a] font-display uppercase tracking-wider mb-2">
        Challenge a Friend
      </p>
      <div className="flex justify-center gap-2 sm:gap-2.5 mb-4">
        {/* X / Twitter */}
        <button onClick={handleTwitterShare} className={SHARE_BTN} aria-label="Share on X" title="Share on X">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </button>

        {/* Telegram */}
        <button onClick={handleTelegramShare} className={`${SHARE_BTN} hover:!border-[#26A5E4]/30 hover:!text-[#26A5E4]`} aria-label="Share on Telegram" title="Share on Telegram">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
          </svg>
        </button>

        {/* WhatsApp */}
        <button onClick={handleWhatsAppShare} className={`${SHARE_BTN} hover:!border-[#25D366]/30 hover:!text-[#25D366]`} aria-label="Share on WhatsApp" title="Share on WhatsApp">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </button>

        {/* Web Share (mobile) */}
        {webShareSupported && (
          <button onClick={handleWebShare} className={SHARE_BTN} aria-label="Share via device" title="Share">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
          </button>
        )}

        {/* Copy to clipboard */}
        <button onClick={handleCopy} className={SHARE_BTN} aria-label={copyState === 'copied' ? 'Copied!' : 'Copy to clipboard'} title={copyState === 'copied' ? 'Copied!' : 'Copy link'}>
          {copyState === 'copied' ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c4f82e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          )}
        </button>
      </div>

      <button
        onClick={onRetake}
        className="px-5 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.07] text-[#a0a0a0] text-xs sm:text-sm hover:border-white/15 hover:text-white transition-all"
      >
        Retake Quiz
      </button>
    </div>
  );
}
