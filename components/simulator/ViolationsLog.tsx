'use client';

import { useSimulatorStore } from '@/store/useSimulatorStore';

export function ViolationsLog() {
  const violations = useSimulatorStore((s) => s.violations);

  return (
    <div className="bento-item col-span-12 lg:col-span-4">
      <div className="item-header">
        <span className="item-title">Violations</span>
        {violations.length > 0 && (
          <span className="text-xs font-bold text-[#ff4757] bg-[#ff4757]/10 px-2 py-1 rounded-full">
            {violations.length}
          </span>
        )}
      </div>
      {violations.length === 0 ? (
        <p className="text-white/20 text-sm text-center py-8">Clean record</p>
      ) : (
        <div className="flex flex-col gap-2 max-h-[250px] overflow-y-auto">
          {violations.map((v, i) => (
            <div key={i} className="bg-[#ff4757]/5 border border-[#ff4757]/10 rounded-lg px-3 py-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-[#ff4757]">{v.type}</span>
                <span className="text-[10px] text-white/20 font-mono">
                  {new Date(v.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-xs text-white/40 mt-1">{v.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}