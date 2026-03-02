import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/ratelimit';
import { logger } from '@/lib/logger';

const QuizResultSchema = z.object({
  rid: z.string().min(1).max(64),
  name: z.string().max(30).optional(),
  profile: z.string().min(1).max(32),
  scores: z.object({
    c: z.number().int().min(0).max(100),
    r: z.number().int().min(0).max(100),
    d: z.number().int().min(0).max(100),
    i: z.number().int().min(0).max(100),
  }),
  timestamp: z.string(),
});

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'anonymous';
  const { success } = await checkRateLimit(`quiz-result:${ip}`);
  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const body = await request.json();
    const parsed = QuizResultSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data', details: parsed.error.flatten() }, { status: 400 });
    }

    // Log the result — wire up storage (Supabase, DB, etc.) here later
    logger.info('Quiz result submitted', parsed.data);

    return NextResponse.json({ success: true, rid: parsed.data.rid });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
