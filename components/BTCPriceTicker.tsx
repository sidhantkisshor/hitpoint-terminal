'use client';

import { useEffect, useRef, useState } from 'react';
import { useMarketStore } from '@/store/useMarketStore';
import { BTCTickerSchema, BinanceTickerSchema, safeValidate } from '@/lib/validation';
import { logger } from '@/lib/logger';

export function BTCPriceTicker() {
  const btcTicker = useMarketStore((state) => state.btcTicker);
  const setBtcTicker = useMarketStore((state) => state.setBtcTicker);
  const wsRef = useRef<WebSocket | null>(null);
  const [useRestApi, setUseRestApi] = useState(false);

  // WebSocket connection
  useEffect(() => {
    if (useRestApi) return;

    let reconnectTimeout: NodeJS.Timeout;
    let failureCount = 0;

    const connectWebSocket = () => {
      try {
        const ws = new WebSocket('wss://stream.binance.com/ws/btcusdt@ticker');
        wsRef.current = ws;

        ws.onopen = () => {
          logger.log('✅ BTC WebSocket connected');
          failureCount = 0;
        };

        ws.onmessage = (event) => {
          try {
            const rawData = JSON.parse(event.data);

            // Validate WebSocket data
            const validation = safeValidate(BTCTickerSchema, rawData);
            if (!validation.success) {
              logger.error('Invalid WebSocket data:', validation.error);
              return;
            }

            const data = validation.data;
            setBtcTicker((prev) => ({
              price: parseFloat(data.c).toFixed(2),
              priceChange: parseFloat(data.p).toFixed(2),
              priceChangePercent: parseFloat(data.P).toFixed(2),
              prevPrice: prev?.price || data.c,
            }));
          } catch (error) {
            logger.error('Error parsing WebSocket data:', error);
          }
        };

        ws.onerror = () => {
          failureCount++;
          logger.error(`WebSocket error (attempt ${failureCount}/3). ${failureCount >= 3 ? 'Switching to REST API.' : 'Retrying...'}`);
          if (failureCount >= 3) {
            setUseRestApi(true);
          }
        };

        ws.onclose = () => {
          logger.log('WebSocket closed.');
          wsRef.current = null;
          if (failureCount < 3) {
            reconnectTimeout = setTimeout(connectWebSocket, 5000);
          }
        };
      } catch (error) {
        logger.error('Failed to create WebSocket:', error);
        failureCount++;
        if (failureCount >= 3) {
          setUseRestApi(true);
        } else {
          reconnectTimeout = setTimeout(connectWebSocket, 5000);
        }
      }
    };

    connectWebSocket();

    return () => {
      clearTimeout(reconnectTimeout);
      if (wsRef.current) {
        const ws = wsRef.current;
        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
          ws.close();
        }
      }
    };
  }, [setBtcTicker, useRestApi]);

  // REST API fallback
  useEffect(() => {
    if (!useRestApi) return;

    logger.log('📡 Using REST API fallback for BTC price');

    const fetchPrice = async () => {
      try {
        const response = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT');

        if (!response.ok) {
          throw new Error('Failed to fetch BTC price');
        }

        const rawData = await response.json();

        // Validate REST API data
        const validation = safeValidate(BinanceTickerSchema, rawData);
        if (!validation.success) {
          logger.error('Invalid Binance API data:', validation.error);
          return;
        }

        const data = validation.data;
        setBtcTicker((prev) => ({
          price: parseFloat(data.lastPrice).toFixed(2),
          priceChange: parseFloat(data.priceChange).toFixed(2),
          priceChangePercent: parseFloat(data.priceChangePercent).toFixed(2),
          prevPrice: prev?.price || data.lastPrice,
        }));
      } catch (error) {
        logger.error('Error fetching BTC price:', error);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, [useRestApi, setBtcTicker]);

  const isPositive = btcTicker && parseFloat(btcTicker.priceChangePercent) >= 0;

  return (
    <div className="bento-item col-span-12 md:col-span-6 lg:col-span-4 row-span-1">
      <div className="item-header">
        <span className="item-title">BTC/USDT</span>
        <div className="live-indicator">
          <span className="live-dot"></span>
          <span>LIVE</span>
        </div>
      </div>

      <div className="flex flex-col justify-center h-full space-y-4">
        <div className="flex items-baseline gap-3">
          <span className="text-5xl font-bold font-mono tracking-tight text-gray-100">
            ${btcTicker?.price || '---'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`text-sm font-bold font-mono px-3 py-1.5 rounded-full border ${
              isPositive
                ? 'text-[#c4f82e] bg-[#c4f82e]/10 border-[#c4f82e]/30 shadow-lg shadow-[#c4f82e]/20'
                : 'text-[#ff4757] bg-[#ff4757]/10 border-[#ff4757]/30 shadow-lg shadow-[#ff4757]/15'
            }`}
          >
            {isPositive ? '+' : ''}
            {btcTicker?.priceChangePercent || '0.00'}%
          </div>
          <div className={`text-lg font-mono font-semibold ${isPositive ? 'text-[#c4f82e]' : 'text-[#ff4757]'}`}>
            {isPositive ? '+' : ''}${btcTicker?.priceChange || '0.00'}
          </div>
        </div>
      </div>
    </div>
  );
}
