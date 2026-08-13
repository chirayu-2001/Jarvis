'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trajectory, PlanMode } from '@/lib/types';
import { apiClient } from '@/lib/api-client';
import { PlanView } from '@/components/plan/PlanView';
import { DynamicWidgetLoader } from '@/components/dynamic/DynamicWidgetLoader';
import { AddTaskModal } from '@/components/task/AddTaskModal';
import { ArrowLeft, Compass, Target, Clock3, Sparkles, Activity, ArrowRight, Loader2, X, Check } from 'lucide-react';

const defaultPhotos: Record<string, string> = {
  ai: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
  software: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
  finance: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
  psychology: "https://images.unsplash.com/photo-1493836512294-502baa1986e2?auto=format&fit=crop&w=1200&q=80",
  books: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80",
  fitness: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80",
  career: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
  money: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=80",
  travel: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
};

export default function TrajectoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const trajectoryId = resolvedParams.id;
  const router = useRouter();

  const [trajectory, setTrajectory] = useState<Trajectory | null>(null);
  const [goalDraft, setGoalDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [goalSubmitting, setGoalSubmitting] = useState(false);

  // Add Task Modal State
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);

  const loadDetail = async () => {
    try {
      const data = await apiClient.getTrajectoryDetail(trajectoryId);
      setTrajectory(data);
      if (data?.goal) setGoalDraft(data.goal);
    } catch (err) {
      console.warn('Trajectory load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
    
    const handlePlanRefreshed = () => {
      loadDetail();
    };
    window.addEventListener('plan:refreshed', handlePlanRefreshed);
    return () => window.removeEventListener('plan:refreshed', handlePlanRefreshed);
  }, [trajectoryId]);

  const handleToggleStep = async (stepId: string) => {
    try {
      await apiClient.togglePlanStep(stepId);
      loadDetail();
    } catch (err) {
      console.error('Toggle step error:', err);
    }
  };

  const handleRefactorPlan = async (mode: PlanMode) => {
    try {
      await apiClient.refactorPlan(trajectoryId, mode);
      loadDetail();
    } catch (err) {
      console.error('Refactor plan error:', err);
    }
  };

  const handleUpdateGoal = async () => {
    if (!goalDraft.trim() || goalSubmitting) return;
    setGoalSubmitting(true);
    try {
      try {
        await apiClient.updateTrajectory(trajectoryId, { goal: goalDraft.trim() });
      } catch (e) {
        console.warn('Backend patch trajectory error:', e);
      }
      const event = new CustomEvent('jarvis:open', {
        detail: { message: `Jarvis, help me build a comprehensive plan for my goal: "${goalDraft.trim()}". What do you need to know first?` }
      });
      window.dispatchEvent(event);
      await loadDetail();
    } finally {
      setGoalSubmitting(false);
    }
  };

  const handleDeleteTrajectory = async () => {
    if (window.confirm("Are you sure you want to completely delete this trajectory? This action cannot be undone.")) {
      try {
        await apiClient.deleteTrajectory(trajectoryId);
        router.push('/');
      } catch (err) {
        console.error("Failed to delete trajectory", err);
      }
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-xs font-mono text-[#b89b6a] border border-[#3d2e1e] bg-[#1e1812] rounded">
        Loading trajectory context...
      </div>
    );
  }

  if (!trajectory) {
    return (
      <div className="p-16 text-center text-xs font-mono text-[#b89b6a] border border-[#3d2e1e] bg-[#1e1812] rounded space-y-4">
        <div>Trajectory not found.</div>
        <Link href="/" className="inline-block bg-[#f0a500] text-[#0d0d0d] px-4 py-2 font-bold uppercase tracking-wider rounded text-xs">
          Return to Discovery
        </Link>
      </div>
    );
  }

  const photoUrl =
    trajectory.photo_url ||
    defaultPhotos[trajectory.title.toLowerCase()] ||
    defaultPhotos[trajectory.kind] ||
    defaultPhotos.ai;

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* ─── Hero Banner ─── */}
      <section className="interest-hero">
        <img src={photoUrl} alt={trajectory.title} />
        <span className="photo-wash" />

        <div style={{ position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontSize: '0.78rem',
              fontFamily: 'monospace',
              fontWeight: 600,
              background: 'rgba(17, 20, 29, 0.88)',
              color: '#f0e6d3',
              padding: '0.5rem 0.9rem',
              border: '1px solid #3d2e1e',
              borderRadius: '4px',
              backdropFilter: 'blur(8px)',
              textDecoration: 'none'
            }}
          >
            <ArrowLeft style={{ width: '1rem', height: '1rem', color: '#f0a500' }} />
            <span>Return to Discovery</span>
          </Link>
          
          <button
            onClick={handleDeleteTrajectory}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              fontSize: '0.78rem',
              fontFamily: 'monospace',
              fontWeight: 600,
              background: 'rgba(220, 38, 38, 0.2)',
              color: '#e63946',
              padding: '0.5rem 0.9rem',
              border: '1px solid rgba(220, 38, 38, 0.5)',
              borderRadius: '4px',
              backdropFilter: 'blur(8px)',
              cursor: 'pointer'
            }}
          >
            Delete Trajectory
          </button>
        </div>

        <div className="interest-hero-copy">
          <span className="kicker" style={{ margin: 0 }}>
            {trajectory.kind}
          </span>
          <h1>{trajectory.title}</h1>
          <p>{trajectory.subtitle || trajectory.standing}</p>
        </div>
      </section>

      {/* ─── Grid Panels ─── */}
      <div className="interest-layout">
        {/* Standing Overview Panel */}
        <div className="panel">
          <div className="section-title compact-title" style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <div>
              <span className="kicker">STANDING OVERVIEW</span>
              <h2>Where you stand today</h2>
            </div>
            <Compass className="w-5 h-5 text-[#f0a500]" />
          </div>

          <p className="text-sm text-[#dbb97a] leading-relaxed">
            {trajectory.current_state || trajectory.standing}
          </p>

          <div className="standing-facts">
            <span>
              <Clock3 className="w-3.5 h-3.5 text-[#4fc3f7]" />
              {new Date(trajectory.last_touched).toLocaleDateString()}
            </span>
            <span>
              <Sparkles className="w-3.5 h-3.5 text-[#f0a500]" />
              {Math.round(trajectory.momentum * 100)}% Momentum
            </span>
            <span>
              <Activity className="w-3.5 h-3.5 text-[#4fc3f7]" />
              {trajectory.status}
            </span>
          </div>
        </div>

        {/* Goal Setting Panel */}
        <div className="panel">
          <div className="section-title compact-title" style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <div>
              <span className="kicker">FIRST QUESTION</span>
              <h2>What's your end goal for now?</h2>
            </div>
            <Target className="w-5 h-5 text-[#4fc3f7]" />
          </div>

          <div className="space-y-3" style={{ marginTop: '0.75rem' }}>
            <input
              type="text"
              value={goalDraft}
              onChange={(e) => setGoalDraft(e.target.value)}
              placeholder={`Example: Build ${trajectory.title} MVP or master core concepts`}
              style={{
                width: '100%',
                background: '#0d0d0d',
                border: '1px solid #3d2e1e',
                color: '#f0e6d3',
                padding: '0.75rem',
                fontSize: '0.85rem',
                borderRadius: '4px',
                outline: 'none'
              }}
            />
            <button
              onClick={handleUpdateGoal}
              disabled={goalSubmitting || !goalDraft.trim()}
              style={{
                width: '100%',
                background: goalSubmitting || !goalDraft.trim() ? '#3d2e1e' : 'linear-gradient(135deg, #f0a500, #4fc3f7)',
                color: goalSubmitting || !goalDraft.trim() ? '#b89b6a' : '#0d0d0d',
                padding: '0.75rem',
                fontFamily: 'monospace',
                fontWeight: 700,
                fontSize: '0.78rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                borderRadius: '4px',
                border: 'none',
                cursor: goalSubmitting || !goalDraft.trim() ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              {goalSubmitting ? (
                <>
                  <Loader2 style={{ width: '1rem', height: '1rem' }} className="animate-spin" />
                  <span>Building Plan...</span>
                </>
              ) : (
                <>
                  <span>Build Plan with Jarvis</span>
                  <ArrowRight style={{ width: '1rem', height: '1rem' }} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ─── Dynamic Widgets ─── */}
      {trajectory.extra_metadata?.dynamic_widgets && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
          {trajectory.extra_metadata.dynamic_widgets.map((widgetName: string) => (
            <DynamicWidgetLoader key={widgetName} widgetName={widgetName} />
          ))}
        </div>
      )}

      {/* ─── Execution Plan Panel ─── */}
      <PlanView
        plan={trajectory.active_plan}
        onToggleStep={handleToggleStep}
        onRefactorPlan={handleRefactorPlan}
        onOpenAddStep={() => setIsAddTaskModalOpen(true)}
      />

      {/* ─── ADD TASK MODAL ─── */}
      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        onTaskAdded={loadDetail}
        defaultTrajectoryId={trajectoryId}
        lockTrajectory={true}
      />
    </div>
  );
}
