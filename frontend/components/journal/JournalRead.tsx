'use client';

import React from 'react';
import { Sparkles, Link2 } from 'lucide-react';

interface JournalReadProps {
  aiRead?: string | null;
  linkedTrajectoryIds?: string[];
}

export const JournalRead: React.FC<JournalReadProps> = ({ aiRead, linkedTrajectoryIds = [] }) => {
  if (!aiRead) return null;

  return (
    <div className="bg-[#1e1812] border border-[#3d2e1e] p-5 animate-fade-in">
      <div className="flex items-center space-x-2 pb-3 mb-3 border-b border-[#3d2e1e]">
        <Sparkles className="w-4 h-4 text-[#f0e6d3]" />
        <h3 className="text-xs uppercase font-mono tracking-widest text-[#f0e6d3] font-semibold">
          Jarvis AI Pattern Synthesis
        </h3>
      </div>

      <p className="text-xs text-[#dbb97a] leading-relaxed font-sans italic">
        "{aiRead}"
      </p>

      {linkedTrajectoryIds.length > 0 && (
        <div className="mt-4 pt-3 border-t border-[#3d2e1e] flex items-center space-x-2 text-[10px] font-mono text-[#b89b6a]">
          <Link2 className="w-3 h-3 text-[#f0e6d3]" />
          <span>Linked Trajectories: {linkedTrajectoryIds.length} active focus items</span>
        </div>
      )}
    </div>
  );
};
