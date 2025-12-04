import { NextResponse } from 'next/server';

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

export async function GET() {
  try {
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
    console.error('Error fetching market data:', error);
    return NextResponse.json(FALLBACK_DATA);
  }
}
