'use client';

import React, { useState } from 'react';
import { Check, ChevronRight, Calendar } from 'lucide-react';
import { PlanStep } from '@/lib/types';

interface PlanStepItemProps {
  step: PlanStep;
  onToggle: (stepId: string) => Promise<void>;
}

export const PlanStepItem: React.FC<PlanStepItemProps> = ({ step, onToggle }) => {
  const [isDone, setIsDone] = useState(step.is_done);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (loading) return;
    const nextState = !isDone;
    setIsDone(nextState);
    setLoading(true);
    try {
      await onToggle(step.id);
    } catch (err) {
      setIsDone(!nextState);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={handleToggle}
      className={`plan-step cursor-pointer p-4 border rounded transition-all flex items-start space-x-3.5 select-none ${
        isDone
          ? 'bg-[#2a2118]/40 border-[#3d2e1e] opacity-60'
          : 'bg-[#1e1812] border-[#3d2e1e] hover:border-[#f0a500]'
      }`}
    >
      <div
        className={`w-5 h-5 rounded border flex items-center justify-center mt-0.5 transition-colors ${
          isDone
            ? 'bg-[#f0a500] border-[#f0a500] text-[#0d0d0d]'
            : 'bg-[#0d0d0d] border-[#3d2e1e] text-transparent'
        }`}
      >
        <Check className="w-3.5 h-3.5" />
      </div>

      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <h4
            className={`text-sm font-semibold tracking-tight ${
              isDone ? 'line-through text-[#b89b6a]' : 'text-[#f0e6d3]'
            }`}
          >
            {step.title}
          </h4>
          {step.week_label && (
            <span className="text-[10px] font-mono uppercase text-[#f0a500] bg-[#f0a500]/10 px-2 py-0.5 rounded border border-[#f0a500]/30 flex items-center space-x-1">
              <Calendar className="w-2.5 h-2.5" />
              <span>{step.week_label}</span>
            </span>
          )}
        </div>
        {step.detail && (
          <p className="text-xs text-[#dbb97a] leading-relaxed font-sans">
            {step.detail}
          </p>
        )}
      </div>
    </div>
  );
};
