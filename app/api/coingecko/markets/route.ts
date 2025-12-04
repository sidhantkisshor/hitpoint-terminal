import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/ratelimit';
import { CoinGeckoMarketsSchema, safeValidate } from '@/lib/validation';
import { logger } from '@/lib/logger';

// Fallback data in case API fails
const FALLBACK_DATA = [
  { id: 'bitcoin', symbol: 'btc', current_price: 98234, price_change_percentage_24h: 2.4 },
  { id: 'ethereum', symbol: 'eth', current_price: 3821, price_change_percentage_24h: 1.8 },
  { id: 'tether', symbol: 'usdt', current_price: 1.00, price_change_percentage_24h: 0.01 },
  { id: 'solana', symbol: 'sol', current_price: 234, price_change_percentage_24h: 5.2 },
  { id: 'binancecoin', symbol: 'bnb', current_price: 712, price_change_percentage_24h: 1.3 },
  { id: 'ripple', symbol: 'xrp', current_price: 2.42, price_change_percentage_24h: 3.1 },
  { id: 'usd-coin', symbol: 'usdc', current_price: 1.00, price_change_percentage_24h: 0.0 },
  { id: 'cardano', symbol: 'ada', current_price: 1.08, price_change_percentage_24h: 2.7 },
  { id: 'dogecoin', symbol: 'doge', current_price: 0.42, price_change_percentage_24h: 4.2 },
  { id: 'avalanche-2', symbol: 'avax', current_price: 51.2, price_change_percentage_24h: -1.2 },
];

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'anonymous';
    const rateLimit = await checkRateLimit(`coingecko-markets:${ip}`);

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
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false',
      {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 60 }, // Cache for 60 seconds
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
    const validation = safeValidate(CoinGeckoMarketsSchema, data);
    if (!validation.success) {
      logger.error('CoinGecko market data validation failed:', validation.error);
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
    logger.error('Error fetching market data:', error);
    return NextResponse.json(FALLBACK_DATA);
  }
}
