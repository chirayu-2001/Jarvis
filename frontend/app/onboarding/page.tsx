'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TrajectoryKind } from '@/lib/types';
import { apiClient } from '@/lib/api-client';
import { Compass, Check, ArrowRight } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [kind, setKind] = useState<TrajectoryKind>('interest');
  const [goal, setGoal] = useState('');
  const [journalFirst, setJournalFirst] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleFinish = async () => {
    if (!title.trim() || submitting) return;
    setSubmitting(true);
    try {
      await apiClient.createTrajectory({ title, kind, goal });
      if (journalFirst.trim()) {
        await apiClient.submitJournal(journalFirst);
      }
      router.push('/');
    } catch (err) {
      router.push('/');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-12 space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 text-xs font-mono text-[#b89b6a] uppercase tracking-widest border border-[#3d2e1e] px-3 py-1 bg-[#1e1812]">
          <Compass className="w-3.5 h-3.5 text-[#f0e6d3]" />
          <span>Zero-Seed Onboarding Wizard</span>
        </div>
        <h1 className="text-2xl font-bold text-[#f0e6d3]">Welcome to Jarvis Personal OS</h1>
        <p className="text-xs text-[#b89b6a]">
          Let’s set up your first trajectory. No bloated templates or seed mock data.
        </p>
      </div>

      {step === 1 && (
        <div className="bg-[#1e1812] border border-[#3d2e1e] p-6 space-y-4">
          <span className="text-[10px] font-mono uppercase text-[#b89b6a]">Step 1 of 2</span>
          <h2 className="text-sm font-semibold text-[#f0e6d3]">What focus area or interest is active right now?</h2>

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title (e.g. Learning Rust & WebAssembly)"
            required
            className="w-full bg-[#0d0d0d] border border-[#3d2e1e] focus:border-[#f0e6d3] text-[#f0e6d3] p-3 text-xs focus:outline-none"
          />

          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as TrajectoryKind)}
            className="w-full bg-[#0d0d0d] border border-[#3d2e1e] focus:border-[#f0e6d3] text-[#f0e6d3] p-3 text-xs focus:outline-none uppercase font-mono"
          >
            <option value="interest">Interest</option>
            <option value="learning">Learning</option>
            <option value="creative">Creative</option>
            <option value="career">Career</option>
            <option value="money">Money</option>
            <option value="health">Health</option>
          </select>

          <input
            type="text"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="Goal snapshot (optional)"
            className="w-full bg-[#0d0d0d] border border-[#3d2e1e] focus:border-[#f0e6d3] text-[#f0e6d3] p-3 text-xs focus:outline-none"
          />

          <button
            onClick={() => setStep(2)}
            disabled={!title.trim()}
            className="w-full bg-[#f0e6d3] text-[#0d0d0d] hover:bg-white p-3 text-xs font-mono font-semibold uppercase tracking-wider flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-40"
          >
            <span>Next Step</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="bg-[#1e1812] border border-[#3d2e1e] p-6 space-y-4">
          <span className="text-[10px] font-mono uppercase text-[#b89b6a]">Step 2 of 2</span>
          <h2 className="text-sm font-semibold text-[#f0e6d3]">Write your first reflection</h2>
          <p className="text-xs text-[#b89b6a]">What context or thoughts are on your mind regarding this trajectory?</p>

          <textarea
            value={journalFirst}
            onChange={(e) => setJournalFirst(e.target.value)}
            placeholder="Today I want to get started with..."
            rows={4}
            className="w-full bg-[#0d0d0d] border border-[#3d2e1e] focus:border-[#f0e6d3] text-[#f0e6d3] p-3 text-xs focus:outline-none resize-none font-sans"
          />

          <button
            onClick={handleFinish}
            disabled={submitting}
            className="w-full bg-[#f0e6d3] text-[#0d0d0d] hover:bg-white p-3 text-xs font-mono font-semibold uppercase tracking-wider flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-40"
          >
            <Check className="w-4 h-4" />
            <span>{submitting ? 'Initializing Jarvis OS...' : 'Complete Onboarding'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
