'use client';

import { useSimulatorStore } from '@/store/useSimulatorStore';
import { SimulatorSetup } from './SimulatorSetup';
import { SimulatorDashboard } from './SimulatorDashboard';
import { EvaluationReport } from './EvaluationReport';
import Link from 'next/link';

export function SimulatorPage() {
  const status = useSimulatorStore((s) => s.status);

  return (
    <main className="min-h-screen bg-black">
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-black" />
        <div className="absolute top-1/5 left-1/5 w-[700px] h-[700px] bg-[#c4f82e]/4 rounded-full blur-[180px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/5 w-[600px] h-[600px] bg-[#c4f82e]/3 rounded-full blur-[160px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-black/85 border-b border-white/10 shadow-2xl">
        <div className="max-w-[1900px] mx-auto px-8 py-5 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <img src="/logo.png" alt="Hitpoint Terminal Logo" className="w-10 h-10 object-contain" />
              <span className="text-2xl font-bold tracking-tight text-white">Hitpoint Terminal</span>
            </Link>
            <span className="text-white/20 text-2xl font-light">/</span>
            <span className="text-lg font-semibold text-[#c4f82e]">Challenge Simulator</span>
          </div>
          <div className="flex items-center gap-2 bg-[#c4f82e]/15 px-4 py-2 rounded-full border border-[#c4f82e]/30 shadow-lg shadow-[#c4f82e]/20">
            <div className="w-2 h-2 bg-[#c4f82e] rounded-full shadow-lg shadow-[#c4f82e]/70 animate-pulse" />
            <span className="text-xs text-[#c4f82e] font-bold tracking-wider">LIVE</span>
          </div>
        </div>
      </header>

      <div className="relative z-10">
        {status === 'setup' && <SimulatorSetup />}
        {status === 'active' && <SimulatorDashboard />}
        {(status === 'passed' || status === 'failed') && <EvaluationReport />}
      </div>
    </main>
  );
}
