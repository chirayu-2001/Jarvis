'use client';

import React, { useMemo } from 'react';
import { Plan, PlanMode } from '@/lib/types';
import { PlanActions } from './PlanActions';
import { Layers, Bot } from 'lucide-react';
import { ReactFlow, Background, Controls, Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

interface PlanViewProps {
  plan?: Plan | null;
  onToggleStep: (stepId: string) => Promise<void>;
  onRefactorPlan: (mode: PlanMode) => Promise<void>;
}

export const PlanView: React.FC<PlanViewProps> = ({ plan, onToggleStep, onRefactorPlan }) => {
  if (!plan || !plan.steps || plan.steps.length === 0) {
    return (
      <div className="panel text-center py-12 space-y-3">
        <div className="w-12 h-12 rounded-full bg-[#161a26] border border-[#202534] flex items-center justify-center mx-auto">
          <Bot className="w-6 h-6 text-[#818cf8]" />
        </div>
        <strong className="text-base text-[#f3f4f8] block">No execution plan generated yet</strong>
        <p className="text-xs text-[#8b94a8] max-w-md mx-auto leading-relaxed">
          Set an end goal above and ask Jarvis to construct a trajectory you can work, track, and refactor.
        </p>
        <button
          onClick={() => {
            window.dispatchEvent(new CustomEvent('jarvis:open', {
              detail: { message: "Jarvis, let's build a plan. What do you need to know?" }
            }));
          }}
          style={{
             background: 'linear-gradient(135deg, #818cf8, #38bdf8)',
             color: '#090a0f',
             padding: '0.65rem 1.25rem',
             borderRadius: '4px',
             fontWeight: 600,
             fontSize: '0.8rem',
             marginTop: '1rem',
             cursor: 'pointer',
             border: 'none',
          }}
        >
          Build Plan with Jarvis
        </button>
      </div>
    );
  }

  const completedCount = plan.steps.filter((s) => s.is_done).length;
  const progressPercent = Math.round((completedCount / plan.steps.length) * 100);

  const nodes: Node[] = useMemo(() => plan.steps.map((step, index) => ({
    id: step.id,
    position: { x: 50, y: index * 180 + 50 },
    data: { 
      label: (
        <div style={{ 
          padding: '12px', 
          background: step.is_done ? 'rgba(52, 211, 153, 0.1)' : '#161a26', 
          border: `1px solid ${step.is_done ? '#34d399' : '#202534'}`,
          color: '#fff', 
          borderRadius: '6px', 
          width: '280px',
          textAlign: 'left'
        }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <span style={{ fontSize: '10px', color: '#818cf8', fontWeight: 600, fontFamily: 'monospace' }}>{step.week_label}</span>
             <button 
                onClick={(e) => { e.stopPropagation(); onToggleStep(step.id); }}
                style={{
                  background: step.is_done ? '#34d399' : 'transparent',
                  border: `1px solid ${step.is_done ? '#34d399' : '#8b94a8'}`,
                  width: '16px', height: '16px', borderRadius: '50%', cursor: 'pointer'
                }}
             />
           </div>
           <div style={{ fontWeight: 'bold', fontSize: '13px', margin: '8px 0 4px', color: '#f3f4f8' }}>{step.title}</div>
           <div style={{ fontSize: '11px', color: '#8b94a8', lineHeight: 1.4 }}>{step.detail}</div>
        </div>
      )
    },
    type: 'default',
    style: { border: 'none', background: 'transparent', width: 280, padding: 0 }
  })), [plan.steps, onToggleStep]);

  const edges: Edge[] = useMemo(() => plan.steps.slice(0, -1).map((step, index) => ({
    id: `e-${step.id}-${plan.steps[index+1].id}`,
    source: step.id,
    target: plan.steps[index+1].id,
    animated: !step.is_done,
    style: { stroke: step.is_done ? '#34d399' : '#818cf8', strokeWidth: 2 }
  })), [plan.steps]);

  return (
    <div className="panel space-y-5">
      {/* Plan Header & Progress Bar */}
      <div className="space-y-3 border-b border-[#202534] pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-[#818cf8]" />
            <h3 className="text-xs uppercase font-mono tracking-wider text-[#f3f4f8] font-bold">
              Dynamic Node Execution Plan ({plan.mode} pace)
            </h3>
          </div>
          <span className="text-xs font-mono text-[#8b94a8]">
            {completedCount} / {plan.steps.length} Steps Completed ({progressPercent}%)
          </span>
        </div>

        {/* Progress Bar Track */}
        <div className="progress-track">
          <i style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {/* Node Graph Area */}
      <div style={{ height: '600px', width: '100%', background: '#090a0f', borderRadius: '6px', border: '1px solid #202534' }}>
        <ReactFlow nodes={nodes} edges={edges} fitView>
          <Background color="#202534" gap={16} />
          <Controls style={{ button: { background: '#161a26', border: '1px solid #202534', fill: '#f3f4f8' } }} />
        </ReactFlow>
      </div>

      {/* Actions */}
      <div className="pt-2 border-t border-[#202534]">
        <PlanActions currentMode={plan.mode} onRefactor={onRefactorPlan} />
      </div>
    </div>
  );
};
