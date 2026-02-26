import { NextResponse } from 'next/server';
import { NewsletterSchema } from '@/lib/validation';
import { checkRateLimit } from '@/lib/ratelimit';
import { logger } from '@/lib/logger';

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

    // Log the subscription (serverless-compatible)
    // In production, integrate with an email service (Mailchimp, Resend, etc.)
    logger.info('New newsletter subscriber:', email);

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
