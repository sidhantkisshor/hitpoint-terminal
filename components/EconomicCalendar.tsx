'use client';

import { useState, useEffect } from 'react';

interface EconomicEvent {
  date: string;
  event: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
}

export function EconomicCalendar() {
  const [events] = useState<EconomicEvent[]>([
    { date: 'Dec 6', event: 'NFP', impact: 'HIGH' },
    { date: 'Dec 11', event: 'CPI', impact: 'HIGH' },
    { date: 'Dec 18', event: 'FOMC', impact: 'HIGH' },
    { date: 'Dec 22', event: 'GDP', impact: 'MEDIUM' },
    { date: 'Dec 27', event: 'PCE', impact: 'MEDIUM' },
  ]);

  const [timeUntilNext, setTimeUntilNext] = useState('');

  useEffect(() => {
    const updateCountdown = () => {
      const nextEvent = new Date('2025-12-06T00:00:00');
      const now = new Date();
      const diff = nextEvent.getTime() - now.getTime();

      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        setTimeUntilNext(`${days}d ${hours}h`);
      } else {
        setTimeUntilNext('LIVE');
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);

    return () => clearInterval(interval);
  }, []);

  const getImpactColor = (impact: string) => {
    if (impact === 'HIGH') return 'text-red-500';
    if (impact === 'MEDIUM') return 'text-yellow-600';
    return 'text-gray-500';
  };

  return (
    <div className="bento-item col-span-12 lg:col-span-4 row-span-1">
      <div className="item-header">
        <span className="item-title">ECONOMIC EVENTS</span>
        <div className="live-indicator">
          <span className="live-dot"></span>
          <span>LIVE</span>
        </div>
      </div>

      <div className="flex flex-col justify-between" style={{ height: 'calc(100% - 3rem)' }}>
        <div className="overflow-auto flex-shrink-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left py-2 text-xs text-gray-500 font-medium uppercase tracking-wide">Date</th>
                <th className="text-left py-2 text-xs text-gray-500 font-medium uppercase tracking-wide">Event</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event, index) => (
                <tr key={index} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3 font-mono text-sm">{event.date}</td>
                  <td className="py-3">
                    <span className={`font-semibold text-base ${getImpactColor(event.impact)}`}>
                      {event.event}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 p-3 bg-[#c4f82e]/5 border border-[#c4f82e]/10 rounded-xl text-center flex-shrink-0">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Next Event</div>
          <div className="text-2xl font-bold font-mono text-[#c4f82e]">{timeUntilNext}</div>
        </div>
      </div>
    </div>
  );
}
