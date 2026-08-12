'use client';

import React, { useState } from 'react';
import { PlanMode } from '@/lib/types';
import { Zap, Feather, Compass } from 'lucide-react';

interface PlanActionsProps {
  currentMode: PlanMode;
  onRefactor: (mode: PlanMode) => Promise<void>;
}

export const PlanActions: React.FC<PlanActionsProps> = ({ currentMode, onRefactor }) => {
  const [loadingMode, setLoadingMode] = useState<PlanMode | null>(null);

  const handleRefactor = async (mode: PlanMode) => {
    if (loadingMode) return;
    setLoadingMode(mode);
    try {
      await onRefactor(mode);
    } finally {
      setLoadingMode(null);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 pt-2">
      <span className="text-[10px] font-mono uppercase text-[#b89b6a] mr-2">
        Refactor Execution Pace:
      </span>

      <button
        type="button"
        onClick={() => handleRefactor('lighter')}
        disabled={loadingMode !== null}
        className={`px-3 py-1.5 text-xs font-mono uppercase border transition cursor-pointer flex items-center space-x-1.5 rounded ${
          currentMode === 'lighter'
            ? 'bg-[#f0a500] text-[#0d0d0d] border-[#f0a500] font-bold'
            : 'bg-[#2a2118] text-[#dbb97a] border-[#3d2e1e] hover:border-[#f0a500]'
        }`}
      >
        <Feather className="w-3.5 h-3.5" />
        <span>Lighter (1-Wk)</span>
      </button>

      <button
        type="button"
        onClick={() => handleRefactor('balanced')}
        disabled={loadingMode !== null}
        className={`px-3 py-1.5 text-xs font-mono uppercase border transition cursor-pointer flex items-center space-x-1.5 rounded ${
          currentMode === 'balanced'
            ? 'bg-[#f0a500] text-[#0d0d0d] border-[#f0a500] font-bold'
            : 'bg-[#2a2118] text-[#dbb97a] border-[#3d2e1e] hover:border-[#f0a500]'
        }`}
      >
        <Compass className="w-3.5 h-3.5" />
        <span>Balanced</span>
      </button>

      <button
        type="button"
        onClick={() => handleRefactor('intense')}
        disabled={loadingMode !== null}
        className={`px-3 py-1.5 text-xs font-mono uppercase border transition cursor-pointer flex items-center space-x-1.5 rounded ${
          currentMode === 'intense'
            ? 'bg-[#f0a500] text-[#0d0d0d] border-[#f0a500] font-bold'
            : 'bg-[#2a2118] text-[#dbb97a] border-[#3d2e1e] hover:border-[#f0a500]'
        }`}
      >
        <Zap className="w-3.5 h-3.5" />
        <span>Intense Sprint</span>
      </button>
    </div>
  );
};
