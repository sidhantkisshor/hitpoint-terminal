import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

// Static profile data for Edge runtime (avoids importing matcher closures from data/quiz.ts)
const PROFILES: Record<string, { name: string; icon: string; traits: string[]; rarity: number }> = {
  'diamond-hands': { name: 'The Diamond Hands', icon: '\uD83D\uDC8E', traits: ['Patient', 'High Conviction', 'Unshakeable'], rarity: 12 },
  'ape': { name: 'The Ape', icon: '\uD83E\uDD8D', traits: ['FOMO King', 'High Risk', 'Impulsive'], rarity: 18 },
  'sniper': { name: 'The Sniper', icon: '\uD83C\uDFAF', traits: ['Precise', 'Disciplined', 'Patient'], rarity: 5 },
  'whale-watcher': { name: 'The Whale Watcher', icon: '\uD83D\uDC0B', traits: ['Data-Driven', 'Analytical', 'Cautious'], rarity: 8 },
  'narrative-trader': { name: 'The Narrative Trader', icon: '\uD83D\uDCE1', traits: ['Trend-Aware', 'Social', 'Adaptive'], rarity: 14 },
  'liquidation-magnet': { name: 'The Liquidation Magnet', icon: '\uD83D\uDC80', traits: ['Max Leverage', 'Emotional', 'Reckless'], rarity: 22 },
  'copy-trader': { name: 'The Copy Trader', icon: '\uD83E\uDE9E', traits: ['Follower', 'Risk-Averse', 'Reactive'], rarity: 16 },
  'og': { name: 'The OG', icon: '\uD83D\uDC74', traits: ['Experienced', 'Contrarian', 'Independent'], rarity: 5 },
};

const SCORE_LABELS = [
  { key: 'c', label: 'Conviction' },
  { key: 'r', label: 'Risk Appetite' },
  { key: 'd', label: 'Discipline' },
  { key: 'i', label: 'Independence' },
] as const;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const profileKey = searchParams.get('profile');

  const profile = profileKey ? PROFILES[profileKey] : null;
  if (!profile) {
    return new Response('Invalid profile', { status: 400 });
  }

  const scores = {
    c: Math.max(0, Math.min(100, Number(searchParams.get('c') ?? 50))),
    r: Math.max(0, Math.min(100, Number(searchParams.get('r') ?? 50))),
    d: Math.max(0, Math.min(100, Number(searchParams.get('d') ?? 50))),
    i: Math.max(0, Math.min(100, Number(searchParams.get('i') ?? 50))),
  };

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: 'flex',
          flexDirection: 'row',
          background: '#080808',
          fontFamily: 'sans-serif',
          color: '#f0f0f0',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background subtle grid pattern */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(196,248,46,0.03) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(196,248,46,0.02) 0%, transparent 50%)',
          }}
        />

        {/* Top neon line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: 'linear-gradient(90deg, transparent 5%, #c4f82e 50%, transparent 95%)',
          }}
        />

        {/* Left side — Profile info */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '50%',
            padding: '48px 40px',
            position: 'relative',
          }}
        >
          {/* Profile icon with glow */}
          <div
            style={{
              fontSize: 80,
              marginBottom: 16,
              filter: 'drop-shadow(0 0 30px rgba(196,248,46,0.15))',
            }}
          >
            {profile.icon}
          </div>

          {/* Profile name */}
          <div
            style={{
              fontSize: 40,
              fontWeight: 800,
              color: '#c4f82e',
              marginBottom: 8,
              textAlign: 'center',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}
          >
            {profile.name}
          </div>

          {/* Rarity badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 16px',
              borderRadius: 99,
              background: 'rgba(196, 248, 46, 0.06)',
              border: '1px solid rgba(196, 248, 46, 0.12)',
              marginBottom: 24,
            }}
          >
            <span style={{ fontSize: 13, color: '#c4f82e', fontWeight: 700 }}>{profile.rarity}%</span>
            <span style={{ fontSize: 13, color: '#777' }}>of traders</span>
          </div>

          {/* Trait badges */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            {profile.traits.map((trait) => (
              <div
                key={trait}
                style={{
                  fontSize: 13,
                  padding: '5px 14px',
                  borderRadius: 8,
                  background: 'rgba(255, 255, 255, 0.04)',
                  color: '#aaa',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  fontWeight: 500,
                }}
              >
                {trait}
              </div>
            ))}
          </div>
        </div>

        {/* Vertical separator */}
        <div
          style={{
            width: 1,
            alignSelf: 'stretch',
            margin: '48px 0',
            background: 'linear-gradient(180deg, transparent, rgba(196,248,46,0.15), transparent)',
          }}
        />

        {/* Right side — Score bars */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            width: '50%',
            padding: '48px 48px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {SCORE_LABELS.map(({ key, label }) => (
              <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: 14, color: '#777', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</span>
                  <span style={{ fontSize: 22, color: '#f0f0f0', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{scores[key]}%</span>
                </div>
                <div
                  style={{
                    width: '100%',
                    height: 8,
                    background: 'rgba(255, 255, 255, 0.04)',
                    borderRadius: 4,
                    overflow: 'hidden',
                    display: 'flex',
                  }}
                >
                  <div
                    style={{
                      width: `${scores[key]}%`,
                      height: '100%',
                      background: scores[key] > 70 ? '#c4f82e' : scores[key] > 40 ? 'rgba(196,248,46,0.6)' : 'rgba(196,248,46,0.35)',
                      borderRadius: 4,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 48px',
            borderTop: '1px solid rgba(255,255,255,0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14, color: '#555', fontWeight: 600, letterSpacing: '0.02em' }}>
              hitpointterminal.com
            </span>
          </div>
          <span style={{ fontSize: 14, color: '#c4f82e', fontWeight: 600 }}>
            What trader are you?  Take the quiz &rarr;
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
