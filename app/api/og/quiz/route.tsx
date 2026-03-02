import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

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

  const rawName = searchParams.get('name');
  const displayName = rawName ? rawName.slice(0, 30).replace(/[<>"'&]/g, '') : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(160deg, #111111 0%, #0a0a0a 50%, #080808 100%)',
          fontFamily: 'sans-serif',
          color: '#f0f0f0',
          position: 'relative',
        }}
      >
        {/* Top neon line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: 'linear-gradient(90deg, transparent 0%, #c4f82e 50%, transparent 100%)',
          }}
        />

        {/* Profile icon */}
        <div style={{ fontSize: 72, marginBottom: 8 }}>{profile.icon}</div>

        {/* Profile name (with optional user name) */}
        {displayName && (
          <div style={{ fontSize: 24, color: '#a0a0a0', fontWeight: 600, marginBottom: 4 }}>
            {displayName} is
          </div>
        )}
        <div style={{ fontSize: displayName ? 38 : 42, fontWeight: 800, color: '#c4f82e', marginBottom: 4 }}>
          {profile.name}
        </div>

        {/* Rarity */}
        <div style={{ fontSize: 16, color: '#a0a0a0', marginBottom: 24 }}>
          Only {profile.rarity}% of traders get this result
        </div>

        {/* Trait badges */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
          {profile.traits.map((trait) => (
            <div
              key={trait}
              style={{
                fontSize: 14,
                padding: '6px 16px',
                borderRadius: 20,
                background: 'rgba(196, 248, 46, 0.08)',
                color: '#c4f82e',
                border: '1px solid rgba(196, 248, 46, 0.15)',
              }}
            >
              {trait}
            </div>
          ))}
        </div>

        {/* Score bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 500 }}>
          {SCORE_LABELS.map(({ key, label }) => (
            <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#5a5a5a' }}>{label}</span>
                <span style={{ color: '#a0a0a0' }}>{scores[key]}%</span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: 6,
                  background: 'rgba(255, 255, 255, 0.04)',
                  borderRadius: 3,
                  overflow: 'hidden',
                  display: 'flex',
                }}
              >
                <div
                  style={{
                    width: `${scores[key]}%`,
                    height: '100%',
                    background: '#c4f82e',
                    borderRadius: 3,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Footer branding */}
        <div
          style={{
            position: 'absolute',
            bottom: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <span style={{ fontSize: 14, color: '#5a5a5a', fontWeight: 600 }}>
            hitpointterminal.com
          </span>
          <span style={{ color: '#3a3a3a' }}>|</span>
          <span style={{ fontSize: 14, color: '#c4f82e', fontWeight: 600 }}>
            What trader are you?
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
