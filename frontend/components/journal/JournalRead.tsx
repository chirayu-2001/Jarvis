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
    <div className="bg-[#0c0c0c] border border-[#252525] p-5 animate-fade-in">
      <div className="flex items-center space-x-2 pb-3 mb-3 border-b border-[#1a1a1a]">
        <Sparkles className="w-4 h-4 text-[#f7f7f7]" />
        <h3 className="text-xs uppercase font-mono tracking-widest text-[#f7f7f7] font-semibold">
          Jarvis AI Pattern Synthesis
        </h3>
      </div>

      <p className="text-xs text-[#cfcfcf] leading-relaxed font-sans italic">
        "{aiRead}"
      </p>

      {linkedTrajectoryIds.length > 0 && (
        <div className="mt-4 pt-3 border-t border-[#1a1a1a] flex items-center space-x-2 text-[10px] font-mono text-[#9a9a9a]">
          <Link2 className="w-3 h-3 text-[#f7f7f7]" />
          <span>Linked Trajectories: {linkedTrajectoryIds.length} active focus items</span>
        </div>
      )}
    </div>
  );
};
