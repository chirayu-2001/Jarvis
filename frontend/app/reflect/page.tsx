'use client';

import React from 'react';
import { UserCheck, Sparkles, Compass, CheckCircle2, PauseCircle, XCircle } from 'lucide-react';

export default function ReflectPage() {
  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="border-b border-[#3d2e1e] pb-4">
        <div className="flex items-center space-x-2">
          <UserCheck className="w-4 h-4 text-[#f0e6d3]" />
          <h1 className="text-xl font-bold text-[#f0e6d3] tracking-tight">Weekly Synthesis & Decision Cockpit</h1>
        </div>
        <p className="text-xs text-[#b89b6a] mt-1">
          Review momentum, evaluate patterns, and make explicit decisions (Continue / Shrink / Pause / Kill).
        </p>
      </div>

      <div className="bg-[#1e1812] border border-[#3d2e1e] p-6 space-y-4">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-[#f0e6d3]" />
          <h2 className="text-xs uppercase font-mono tracking-widest text-[#f0e6d3]">Weekly Momentum Audit</h2>
        </div>

        <p className="text-xs text-[#dbb97a] leading-relaxed">
          Your continuity score across active trajectories is <strong className="text-[#f0e6d3]">78%</strong>. Momentum remains high on creative and technical focus areas.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="bg-[#0d0d0d] border border-[#3d2e1e] p-4 text-xs space-y-2">
            <div className="flex items-center space-x-2 text-[#f0e6d3] font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Active Trajectories</span>
            </div>
            <p className="text-[11px] text-[#b89b6a]">Building Jarvis AI OS, Quantum Computing Study</p>
          </div>

          <div className="bg-[#0d0d0d] border border-[#3d2e1e] p-4 text-xs space-y-2">
            <div className="flex items-center space-x-2 text-[#f0e6d3] font-semibold">
              <PauseCircle className="w-4 h-4 text-amber-400" />
              <span>Dormant Signals</span>
            </div>
            <p className="text-[11px] text-[#b89b6a]">No stale trajectories older than 7 days</p>
          </div>

          <div className="bg-[#0d0d0d] border border-[#3d2e1e] p-4 text-xs space-y-2">
            <div className="flex items-center space-x-2 text-[#f0e6d3] font-semibold">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>Recommended Action</span>
            </div>
            <p className="text-[11px] text-[#b89b6a]">Maintain current momentum, log daily journal reflections</p>
          </div>
        </div>
      </div>
    </div>
  );
}
