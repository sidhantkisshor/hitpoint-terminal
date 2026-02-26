import { NextResponse } from 'next/server';
import { NewsletterSchema } from '@/lib/validation';
import { checkRateLimit } from '@/lib/ratelimit';
import { logger } from '@/lib/logger';
import { promises as fs } from 'fs';
import path from 'path';

const SUBSCRIBERS_FILE = path.join(process.cwd(), 'data', 'subscribers.json');

async function getSubscribers(): Promise<string[]> {
  try {
    const data = await fs.readFile(SUBSCRIBERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveSubscribers(subscribers: string[]): Promise<void> {
  await fs.mkdir(path.dirname(SUBSCRIBERS_FILE), { recursive: true });
  await fs.writeFile(SUBSCRIBERS_FILE, JSON.stringify(subscribers, null, 2));
}

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

    // Append to subscribers file
    const subscribers = await getSubscribers();
    if (!subscribers.includes(email)) {
      subscribers.push(email);
      await saveSubscribers(subscribers);
    }

    logger.info('New newsletter subscriber');
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
