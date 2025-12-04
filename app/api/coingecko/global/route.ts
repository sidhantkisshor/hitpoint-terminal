import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/ratelimit';
import { CoinGeckoGlobalSchema, safeValidate } from '@/lib/validation';
import { logger } from '@/lib/logger';

// Fallback data in case API fails
const FALLBACK_DATA = {
  data: {
    market_cap_percentage: {
      btc: 56.8,
      eth: 12.4,
    },
  },
};

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'anonymous';
    const rateLimit = await checkRateLimit(`coingecko-global:${ip}`);

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimit.limit.toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.reset.toString(),
          }
        }
      );
    }

    const response = await fetch(
      'https://api.coingecko.com/api/v3/global',
      {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    );

    if (!response.ok) {
      logger.warn(`CoinGecko API returned ${response.status}, using fallback data`);
      return NextResponse.json(FALLBACK_DATA);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      logger.warn('CoinGecko API returned non-JSON response, using fallback data');
      return NextResponse.json(FALLBACK_DATA);
    }

    const data = await response.json();

    // Validate response data
    const validation = safeValidate(CoinGeckoGlobalSchema, data);
    if (!validation.success) {
      logger.error('CoinGecko global data validation failed:', validation.error);
      return NextResponse.json(FALLBACK_DATA);
    }

    return NextResponse.json(validation.data, {
      headers: {
        'X-RateLimit-Limit': rateLimit.limit.toString(),
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': rateLimit.reset.toString(),
      }
    });
  } catch (error) {
    logger.error('Error fetching global data:', error);
    return NextResponse.json(FALLBACK_DATA);
  }
}
