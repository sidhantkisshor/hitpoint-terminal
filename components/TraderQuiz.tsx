'use client';

import { useState } from 'react';
import { quizQuestions, normalizeScores, getProfile, type Scores, type TraderProfile } from '@/data/quiz';

export function TraderQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [rawScores, setRawScores] = useState<Scores>({ bias: 0, risk: 0, discipline: 0, emotion: 0 });
  const [profile, setProfile] = useState<TraderProfile | null>(null);
  const [email, setEmail] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (optionScores: Scores) => {
    const newScores: Scores = {
      bias: rawScores.bias + optionScores.bias,
      risk: rawScores.risk + optionScores.risk,
      discipline: rawScores.discipline + optionScores.discipline,
      emotion: rawScores.emotion + optionScores.emotion,
    };
    setRawScores(newScores);

    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion((q) => q + 1);
    } else {
      setProfile(getProfile(newScores));
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
    setRawScores({ bias: 0, risk: 0, discipline: 0, emotion: 0 });
    setProfile(null);
    setEmail('');
    setEmailSubmitted(false);
    setShowResult(false);
  };

  return (
    <div className="bento-item col-span-12 lg:col-span-3 scroll-fade-in">
      <div className="item-header">
        <span className="item-title">TRADER QUIZ</span>
      </div>

      <div className="flex flex-col justify-center h-[300px]">
        {/* Quiz in progress */}
        {!profile && (
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
                  onClick={() => handleAnswer(opt.scores)}
                  className="w-full text-left px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-300 hover:border-[#c4f82e]/40 hover:text-white hover:bg-white/10 transition-all duration-200"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Email gate */}
        {profile && !showResult && (
          <div className="text-center">
            <div className="text-3xl mb-2">{profile.icon}</div>
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
        {showResult && profile && (
          <div className="text-center">
            <div className="text-4xl mb-3">{profile.icon}</div>
            <p className="text-[#c4f82e] font-bold text-lg">{profile.name}</p>
            <p className="text-gray-400 text-sm mt-2 leading-relaxed">{profile.description}</p>
            <div className="flex flex-wrap justify-center gap-2 mt-3">
              {profile.traits.map((trait) => (
                <span key={trait} className="text-[10px] px-2 py-1 rounded-full bg-[#c4f82e]/10 text-[#c4f82e] border border-[#c4f82e]/20">
                  {trait}
                </span>
              ))}
            </div>
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
