'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { DayRead, PlanStepWithTrajectory, TaskStatus, Trajectory } from '@/lib/types';
import { ChevronLeft, Calendar, Clock, Inbox, Plus, X, Check, BookOpen, AlertCircle, ArrowRightCircle, CheckCircle2, Zap, Flame } from 'lucide-react';
import { JournalPanel } from '@/components/journal/JournalPanel';
import { AddTaskModal } from '@/components/task/AddTaskModal';

const SECTIONS: { id: TaskStatus; label: string; icon: React.ReactNode; color: string; accentHex: string; borderClass: string; bgClass: string }[] = [
  { id: 'todo', label: 'To Do', icon: <Clock className="w-4 h-4" />, color: 'text-amber-400', accentHex: '#f0a500', borderClass: 'border-amber-500/30', bgClass: 'bg-amber-500/5' },
  { id: 'in_progress', label: 'In Progress', icon: <Zap className="w-4 h-4" />, color: 'text-cyan-400', accentHex: '#4fc3f7', borderClass: 'border-cyan-500/30', bgClass: 'bg-cyan-500/5' },
  { id: 'done', label: 'Done', icon: <CheckCircle2 className="w-4 h-4" />, color: 'text-green-400', accentHex: '#4caf50', borderClass: 'border-green-500/30', bgClass: 'bg-green-500/5' },
  { id: 'backlog', label: 'Backlog', icon: <ArrowRightCircle className="w-4 h-4" />, color: 'text-red-400', accentHex: '#e63946', borderClass: 'border-red-500/30', bgClass: 'bg-red-500/5' },
];

export default function DayPage() {
  const params = useParams();
  const router = useRouter();
  const dateStr = params.date as string;
  
  const [data, setData] = useState<DayRead | null>(null);
  const [trajectories, setTrajectories] = useState<Trajectory[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (dateStr) {
      loadData();
    }
  }, [dateStr]);

  const loadData = async () => {
    try {
      const summary = await apiClient.getDaySummary(dateStr);
      setData(summary);
      const trajs = await apiClient.getTrajectories();
      setTrajectories(trajs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        tasks: prev.tasks.map(t => t.id === taskId ? { ...t, status: newStatus, is_done: newStatus === 'done' } : t)
      };
    });

    try {
      await apiClient.updatePlanStep(taskId, { status: newStatus });
    } catch (err) {
      console.error('Failed to update status', err);
      loadData();
    }
  };

  const handleReschedule = async (taskId: string, newDate: string) => {
    try {
      await apiClient.updatePlanStep(taskId, { scheduled_date: newDate });
      loadData();
    } catch (err) {
      console.error('Failed to reschedule', err);
    }
  };

  if (loading) return <div className="p-12 text-center text-[#b89b6a]">Loading day view...</div>;
  if (!data) return <div className="p-12 text-center"><p className="text-[#b89b6a] mb-4">Failed to load day.</p><button onClick={loadData} className="px-4 py-2 bg-[#3d2e1e] rounded text-white">Retry</button></div>;

  const totalTasks = data.tasks.length;
  const doneTasks = data.tasks.filter(t => t.is_done).length;

  return (
    <div className="w-full animate-fade-in pb-12 relative">

      {/* ═══ HERO HEADER BAR ═══ */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(230,57,70,0.08) 0%, rgba(13,13,13,0) 40%, rgba(79,195,247,0.05) 100%)',
        borderBottom: '1px solid #3d2e1e',
        padding: '1.5rem 0',
        marginBottom: '2rem'
      }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={() => router.push('/')} className="p-2 hover:bg-[#3d2e1e] rounded-lg transition-colors text-[#b89b6a] hover:text-[#f0a500]">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <span className="kicker">DAILY AGENDA</span>
              <h1 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Calendar className="w-6 h-6 text-[#e63946]" />
                <span style={{ background: 'linear-gradient(90deg, #f0a500, #ffd54f)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' })}
                </span>
              </h1>
            </div>
          </div>

          {/* Stats Pills */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs" style={{ fontFamily: "'Orbitron', monospace", letterSpacing: '0.08em' }}>
              <span className="text-[#b89b6a]">TASKS</span>
              <span className="text-[#f0a500] font-bold text-lg">{totalTasks}</span>
            </div>
            <div style={{ width: '1px', height: '1.5rem', background: '#3d2e1e' }} />
            <div className="flex items-center gap-2 text-xs" style={{ fontFamily: "'Orbitron', monospace", letterSpacing: '0.08em' }}>
              <span className="text-[#b89b6a]">DONE</span>
              <span className="text-green-400 font-bold text-lg">{doneTasks}</span>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              style={{
                background: 'linear-gradient(135deg, #e63946, #f0a500)',
                color: '#0d0d0d',
                border: 'none',
                padding: '0.55rem 1.2rem',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.8rem',
                fontFamily: "'Orbitron', monospace",
                letterSpacing: '0.06em',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                cursor: 'pointer',
                textTransform: 'uppercase',
              }}
            >
              <Plus style={{ width: '0.9rem', height: '0.9rem' }} />
              Add Task
            </button>
          </div>
        </div>
      </div>

      {/* ═══ MAIN CONTENT: TASK SECTIONS ═══ */}
      <div className="space-y-8">
        {SECTIONS.map(section => {
          const sectionTasks = data.tasks.filter(t => t.status === section.id);
          if (sectionTasks.length === 0 && section.id !== 'todo') return null;

          return (
            <section key={section.id}>
              {/* Section Header */}
              <div className="flex items-center gap-3 mb-4">
                <div style={{
                  background: section.accentHex,
                  width: '4px',
                  height: '1.6rem',
                  borderRadius: '2px',
                  boxShadow: `0 0 8px ${section.accentHex}40`
                }} />
                <div className={section.color}>{section.icon}</div>
                <h2 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0, color: '#f0e6d3' }}>
                  {section.label}
                </h2>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full" style={{ background: `${section.accentHex}15`, color: section.accentHex, border: `1px solid ${section.accentHex}30` }}>
                  {sectionTasks.length}
                </span>
              </div>

              {/* Task Row — Compact Horizontal Cards */}
              <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                {/* Add Task inline card (only in todo) */}
                {section.id === 'todo' && sectionTasks.length === 0 && (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="group"
                    style={{
                      border: '1px dashed #3d2e1e',
                      background: 'transparent',
                      padding: '1.2rem',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      cursor: 'pointer',
                      transition: 'all 200ms ease',
                      minHeight: '4rem',
                    }}
                  >
                    <div style={{
                      width: '2.2rem', height: '2.2rem', borderRadius: '50%',
                      border: '1px solid #3d2e1e', background: '#1e1812',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'border-color 200ms ease'
                    }} className="group-hover:border-[#f0a500]">
                      <Plus style={{ width: '1rem', height: '1rem', color: '#f0a500' }} />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: 600, color: '#f0e6d3', fontSize: '0.9rem' }}>Add a new task</div>
                      <div style={{ color: '#b89b6a', fontSize: '0.75rem' }}>Schedule an activity for today</div>
                    </div>
                  </button>
                )}

                {/* Compact Task Cards */}
                {sectionTasks.map(task => (
                  <div
                    key={task.id}
                    style={{
                      background: '#1e1812',
                      border: `1px solid ${task.is_done ? '#4caf5040' : '#3d2e1e'}`,
                      borderRadius: '8px',
                      padding: '1rem 1.2rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.6rem',
                      transition: 'all 200ms ease',
                      borderLeft: `3px solid ${section.accentHex}`,
                      cursor: 'default',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                    className="hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(240,165,0,0.12)] hover:border-[#f0a500]/50"
                  >
                    {/* Top Row: Trajectory badge + Time */}
                    <div className="flex items-center justify-between">
                      <span style={{ fontSize: '0.68rem', fontFamily: "'Orbitron', monospace", color: '#f0a500', textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.8 }}>
                        {task.trajectory_title || 'Unlinked'}
                      </span>
                      {(task.start_time || task.end_time) && (
                        <span className="flex items-center gap-1" style={{ fontSize: '0.7rem', fontFamily: 'monospace', color: '#ff8f00' }}>
                          <Clock style={{ width: '0.65rem', height: '0.65rem' }} />
                          {task.start_time || '?'} – {task.end_time || '?'}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h4 style={{
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      color: task.is_done ? '#b89b6a' : '#f0e6d3',
                      textDecoration: task.is_done ? 'line-through' : 'none',
                      margin: 0,
                      lineHeight: 1.3,
                    }}>
                      {task.title}
                    </h4>

                    {/* Detail (truncated) */}
                    {task.detail && (
                      <p style={{
                        fontSize: '0.8rem', color: '#b89b6a', lineHeight: 1.4, margin: 0,
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden',
                      }}>
                        {task.detail}
                      </p>
                    )}

                    {/* Bottom Controls */}
                    <div className="flex items-center justify-between mt-auto pt-2" style={{ borderTop: '1px solid #3d2e1e' }}>
                      <select
                        style={{
                          fontSize: '0.75rem', background: '#0d0d0d', color: task.is_done ? '#4caf50' : '#dbb97a',
                          border: '1px solid #3d2e1e', borderRadius: '4px', padding: '0.3rem 0.5rem', outline: 'none',
                        }}
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                      >
                        {SECTIONS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                      </select>
                      <input
                        type="date"
                        className="text-xs bg-transparent text-[#b89b6a] focus:outline-none cursor-pointer text-right hover:text-[#f0a500] transition-colors"
                        value={task.scheduled_date || ''}
                        onChange={(e) => handleReschedule(task.id, e.target.value)}
                        title="Reschedule task"
                        style={{ width: '7rem' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* ═══ JOURNAL SECTION — Full Width Below Tasks ═══ */}
      <div style={{ marginTop: '3rem', borderTop: '1px solid #3d2e1e', paddingTop: '2rem' }}>
        <div className="flex items-center gap-3 mb-5">
          <div style={{ background: '#e63946', width: '4px', height: '1.6rem', borderRadius: '2px', boxShadow: '0 0 8px rgba(230,57,70,0.3)' }} />
          <BookOpen className="w-4 h-4 text-[#e63946]" />
          <h2 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0, color: '#f0e6d3' }}>
            Journal & Logs
          </h2>
        </div>

        {/* Journal Compose */}
        <div style={{ marginBottom: '1.5rem' }}>
          <JournalPanel dateOverride={dateStr} />
        </div>

        {/* Journal Entries — Horizontal Row Layout */}
        {data.journal_entries.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
            {data.journal_entries.map(entry => (
              <div
                key={entry.id}
                style={{
                  background: '#1e1812',
                  border: '1px solid #3d2e1e',
                  borderLeft: '3px solid #e63946',
                  borderRadius: '8px',
                  padding: '1rem 1.2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  transition: 'all 200ms ease',
                }}
                className="hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(230,57,70,0.12)] hover:border-[#e63946]/50"
              >
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: '0.7rem', fontFamily: "'Orbitron', monospace", color: '#e63946', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    <Flame style={{ width: '0.7rem', height: '0.7rem', display: 'inline', marginRight: '0.3rem', verticalAlign: 'middle' }} />
                    Journal Entry
                  </span>
                  <span style={{ fontSize: '0.7rem', fontFamily: 'monospace', color: '#b89b6a' }}>
                    {new Date(entry.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p style={{ fontSize: '0.88rem', color: '#dbb97a', lineHeight: 1.5, margin: 0, whiteSpace: 'pre-wrap' }}>
                  {entry.text}
                </p>
                {entry.ai_read && (
                  <div style={{
                    marginTop: '0.25rem', fontSize: '0.75rem', color: '#4fc3f7',
                    background: 'rgba(79,195,247,0.06)', border: '1px solid rgba(79,195,247,0.15)',
                    padding: '0.6rem 0.8rem', borderRadius: '6px', lineHeight: 1.4,
                    display: 'flex', alignItems: 'flex-start', gap: '0.4rem',
                  }}>
                    <AlertCircle style={{ width: '0.8rem', height: '0.8rem', marginTop: '0.1rem', flexShrink: 0 }} />
                    <span>{entry.ai_read}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ═══ ADD TASK MODAL ═══ */}
      <AddTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTaskAdded={loadData}
        defaultDate={dateStr}
      />
    </div>
  );
}
