'use client';

import React, { useEffect, useState } from 'react';
import { Trajectory, TrajectoryKind, PermissionLog } from '@/lib/types';
import { apiClient } from '@/lib/api-client';
import { TrajectoryGrid } from '@/components/trajectory/TrajectoryGrid';
import { WorldCalendar } from '@/components/timeline/WorldCalendar';
import { SocialRadar } from '@/components/radar/SocialRadar';
import { JournalPanel } from '@/components/journal/JournalPanel';
import { PermissionCard } from '@/components/journal/PermissionCard';
import { ShieldCheck } from 'lucide-react';

export default function DiscoveryPage() {
  const [trajectories, setTrajectories] = useState<Trajectory[]>([]);
  const [permissions, setPermissions] = useState<PermissionLog[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const trajs = await apiClient.getTrajectories();
      setTrajectories(trajs || []);
      const perms = await apiClient.getPendingPermissions();
      setPermissions(perms || []);
    } catch (err) {
      console.warn('API connection fallback active:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddTrajectory = async (data: { title: string; kind: TrajectoryKind; goal?: string }) => {
    try {
      const newTraj = await apiClient.createTrajectory(data);
      setTrajectories((prev) => [newTraj, ...prev]);
    } catch (err) {
      console.warn('API creation failed, using local optimistic trajectory:', err);
      const uuid = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'a328ba79-83c0-43bd-9c5f-aed3ed06e89a';
      const fallbackTraj: Trajectory = {
        id: uuid,
        user_id: 'a328ba79-83c0-43bd-9c5f-aed3ed06e89a',
        kind: data.kind,
        status: 'new',
        title: data.title,
        subtitle: 'Fresh signal, uncommitted',
        standing: `Fresh signal: ${data.title}`,
        goal: data.goal,
        momentum: 0.5,
        last_touched: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setTrajectories((prev) => [fallbackTraj, ...prev]);
    }
  };

  const totalSteps = trajectories.reduce((sum, t) => sum + (t.active_plan?.steps?.length || 0), 0);
  const completedSteps = trajectories.reduce(
    (sum, t) => sum + (t.active_plan?.steps?.filter((s) => s.is_done)?.length || 0),
    0
  );

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* ─── Hero Header & Now Card ─── */}
      <section className="world-hero">
        <div>
          <div className="kicker">SYSTEM OVERVIEW / CONTINUITY ENGINE</div>
          <h1>JARVIS</h1>
          <p className="hero-copy">
            Interests reappear across years. The problem is not lack of ambition — it is lost context, missing reason for stopping, and high friction to restart. Jarvis makes returning easier than restarting.
          </p>
        </div>

        <div className="now-card">
          <div>
            <div className="kicker">STAND / WHERE YOU STAND TODAY</div>
            <strong>
              {trajectories.length > 0
                ? `${trajectories.slice(0, 3).map((t) => t.title).join(', ')} active across your world.`
                : 'No active trajectories created yet. Click "+ Add a new trajectory" below to track your first project.'}
            </strong>
          </div>

          <div className="mini-stats">
            <small>Active</small>
            <b>{trajectories.length}</b>
            <small>Steps</small>
            <b>{completedSteps}/{totalSteps}</b>
          </div>
        </div>
      </section>

      {/* ─── Pending AI Boundaries / Permission Proposals ─── */}
      {permissions.length > 0 && (
        <section className="space-y-3 pt-2">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-[#fbbf24]" />
            <h2 className="text-xs uppercase font-mono tracking-widest text-[#f3f4f8] font-semibold">
              Pending AI Refactor Proposals ({permissions.length})
            </h2>
          </div>
          <div className="space-y-3">
            {permissions.map((perm) => (
              <PermissionCard key={perm.id} permission={perm} onResolved={loadData} />
            ))}
          </div>
        </section>
      )}

      {/* ─── Trajectory Grid Section ─── */}
      <section className="interest-section">
        <div className="section-title">
          <div>
            <span className="kicker">TRAJECTORIES / ALL SIGNAL, NO CLASS</span>
            <h2>Your world, in parallel</h2>
          </div>
          <span>Trajectories evolve dynamically: Curiosity → Experiment → Plan → Refactor → Pause.</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs font-mono text-[#8b94a8] border border-[#202534]">
            Loading continuity trajectories...
          </div>
        ) : (
          <TrajectoryGrid trajectories={trajectories} onAddTrajectory={handleAddTrajectory} />
        )}
      </section>

      {/* ─── 7-Day Horizon Calendar ─── */}
      <WorldCalendar />

      {/* ─── Lower Section: Information Diet & Journal ─── */}
      <div className="home-lower">
        <SocialRadar />
        <JournalPanel />
      </div>
    </div>
  );
}
