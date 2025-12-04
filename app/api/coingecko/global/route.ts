import { NextResponse } from 'next/server';

// Fallback data in case API fails
const FALLBACK_DATA = {
  data: {
    market_cap_percentage: {
      btc: 56.8,
      eth: 12.4,
    },
  },
};

export async function GET() {
  try {
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
      console.warn(`CoinGecko API returned ${response.status}, using fallback data`);
      return NextResponse.json(FALLBACK_DATA);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.warn('CoinGecko API returned non-JSON response, using fallback data');
      return NextResponse.json(FALLBACK_DATA);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching global data:', error);
    return NextResponse.json(FALLBACK_DATA);
  }
}
