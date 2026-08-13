'use client';

import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { TaskStatus, Trajectory } from '@/lib/types';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskAdded: () => void;
  defaultDate?: string;
  defaultTrajectoryId?: string;
  lockTrajectory?: boolean;
}

const STATUS_OPTIONS: { id: TaskStatus; label: string }[] = [
  { id: 'todo', label: 'To Do' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'done', label: 'Done' },
  { id: 'backlog', label: 'Backlog' },
];

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isOpen,
  onClose,
  onTaskAdded,
  defaultDate,
  defaultTrajectoryId,
  lockTrajectory,
}) => {
  const [trajectories, setTrajectories] = useState<Trajectory[]>([]);
  
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDetail, setNewTaskDetail] = useState('');
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>('todo');
  const [newTaskTrajectory, setNewTaskTrajectory] = useState<string>('none');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [recurrenceMode, setRecurrenceMode] = useState<'just_today'|'daily'|'custom'>('just_today');
  const [customDays, setCustomDays] = useState<Set<number>>(new Set());
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reset state on open
      setNewTaskTitle('');
      setNewTaskDetail('');
      setNewTaskStatus('todo');
      setNewTaskTrajectory(defaultTrajectoryId || 'none');
      setStartTime('');
      setEndTime('');
      setRecurrenceMode(defaultDate ? 'just_today' : 'custom'); // default custom if no date
      setCustomDays(new Set());
      setSubmitting(false);

      // Fetch trajectories for the dropdown if not locked
      if (!lockTrajectory) {
        apiClient.getTrajectories().then((data) => {
          setTrajectories(data || []);
        }).catch(err => console.error(err));
      } else if (defaultTrajectoryId) {
        // If locked, we still might want to show the title of the trajectory
        apiClient.getTrajectoryDetail(defaultTrajectoryId).then((data) => {
          setTrajectories([data]);
        }).catch(err => console.error(err));
      }
    }
  }, [isOpen, defaultTrajectoryId, lockTrajectory, defaultDate]);

  if (!isOpen) return null;

  const toggleCustomDay = (dayIndex: number) => {
    setCustomDays(prev => {
      const next = new Set(prev);
      if (next.has(dayIndex)) {
        next.delete(dayIndex);
      } else {
        next.add(dayIndex);
      }
      return next;
    });
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || submitting) return;
    
    let recurrence_rule = undefined;
    if (recurrenceMode === 'daily') {
      recurrence_rule = 'DAILY';
    } else if (recurrenceMode === 'custom' && customDays.size > 0) {
      recurrence_rule = `WEEKLY:${Array.from(customDays).join(',')}`;
    }

    setSubmitting(true);
    try {
      await apiClient.createPlanStep({
        trajectory_id: newTaskTrajectory === 'none' ? undefined : newTaskTrajectory,
        title: newTaskTitle,
        detail: newTaskDetail,
        status: newTaskStatus,
        scheduled_date: recurrence_rule ? undefined : defaultDate,
        recurrence_rule,
        start_time: startTime || undefined,
        end_time: endTime || undefined
      });
      onTaskAdded();
      onClose();
    } catch (err) {
      console.error('Failed to create task', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem', background: 'rgba(13, 13, 13, 0.88)', backdropFilter: 'blur(12px)'
      }}
    >
      <div style={{
        background: '#1e1812', border: '1px solid #3d2e1e', borderRadius: '10px',
        maxWidth: '38rem', width: '100%', padding: '1.5rem',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 40px rgba(230,57,70,0.05)',
        display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'left',
      }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #3d2e1e', paddingBottom: '0.85rem' }}>
          <div>
            <span className="kicker" style={{ margin: 0 }}>NEW TASK</span>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#f0e6d3' }}>Schedule an Activity</h3>
          </div>
          <button type="button" onClick={onClose} style={{ padding: '0.4rem', border: '1px solid #3d2e1e', background: '#2a2118', color: '#b89b6a', borderRadius: '4px', cursor: 'pointer' }}>
            <X style={{ width: '1rem', height: '1rem' }} />
          </button>
        </div>

        <form onSubmit={handleAddTask} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          <div>
            <label style={{ fontSize: '0.72rem', fontFamily: "'Orbitron', monospace", textTransform: 'uppercase', letterSpacing: '0.1em', color: '#b89b6a', display: 'block', marginBottom: '0.4rem' }}>Task Title *</label>
            <input type="text" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} placeholder="e.g. Go to the Gym" required autoFocus
              style={{ width: '100%', background: '#0d0d0d', border: '1px solid #3d2e1e', color: '#f0e6d3', padding: '0.75rem', fontSize: '0.9rem', borderRadius: '6px', outline: 'none' }} />
          </div>

          <div>
            <label style={{ fontSize: '0.72rem', fontFamily: "'Orbitron', monospace", textTransform: 'uppercase', letterSpacing: '0.1em', color: '#b89b6a', display: 'block', marginBottom: '0.4rem' }}>Description (Optional)</label>
            <textarea value={newTaskDetail} onChange={(e) => setNewTaskDetail(e.target.value)} placeholder="Additional context or sub-steps..." rows={2}
              style={{ width: '100%', background: '#0d0d0d', border: '1px solid #3d2e1e', color: '#f0e6d3', padding: '0.75rem', fontSize: '0.9rem', borderRadius: '6px', outline: 'none', resize: 'none' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.72rem', fontFamily: "'Orbitron', monospace", textTransform: 'uppercase', letterSpacing: '0.1em', color: '#b89b6a', display: 'block', marginBottom: '0.4rem' }}>Linked Trajectory</label>
              <select 
                value={newTaskTrajectory} 
                onChange={(e) => setNewTaskTrajectory(e.target.value)}
                disabled={lockTrajectory}
                style={{ width: '100%', background: '#0d0d0d', border: '1px solid #3d2e1e', color: lockTrajectory ? '#b89b6a' : '#f0e6d3', padding: '0.75rem', fontSize: '0.9rem', borderRadius: '6px', outline: 'none', opacity: lockTrajectory ? 0.7 : 1 }}>
                {!lockTrajectory && <option value="none">-- None (Unlinked Task) --</option>}
                {trajectories.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.72rem', fontFamily: "'Orbitron', monospace", textTransform: 'uppercase', letterSpacing: '0.1em', color: '#b89b6a', display: 'block', marginBottom: '0.4rem' }}>Status</label>
              <select value={newTaskStatus} onChange={(e) => setNewTaskStatus(e.target.value as TaskStatus)}
                style={{ width: '100%', background: '#0d0d0d', border: '1px solid #3d2e1e', color: '#f0e6d3', padding: '0.75rem', fontSize: '0.9rem', borderRadius: '6px', outline: 'none' }}>
                {STATUS_OPTIONS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
          </div>

          <div style={{ background: '#2a2118', padding: '1rem', border: '1px solid #3d2e1e', borderRadius: '8px' }}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.72rem', fontFamily: "'Orbitron', monospace", textTransform: 'uppercase', letterSpacing: '0.1em', color: '#f0a500', display: 'block', marginBottom: '0.5rem' }}>Recurrence</label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                {(['just_today', 'daily', 'custom'] as const).map(mode => (
                  <button key={mode} type="button" onClick={() => setRecurrenceMode(mode)}
                    style={{
                      flex: '1', padding: '0.6rem', fontSize: '0.8rem', borderRadius: '6px',
                      border: recurrenceMode === mode ? '1px solid #f0a500' : '1px solid #3d2e1e',
                      background: recurrenceMode === mode ? 'rgba(240,165,0,0.12)' : '#0d0d0d',
                      color: recurrenceMode === mode ? '#f0e6d3' : '#b89b6a',
                      textTransform: 'capitalize',
                    }}>
                    {mode === 'just_today' ? (defaultDate ? 'Just This Day' : 'Just Once') : mode}
                  </button>
                ))}
              </div>
              {recurrenceMode === 'custom' && (
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((dayChar, i) => {
                    const dayIndex = i;
                    const isSelected = customDays.has(dayIndex);
                    return (
                      <button key={dayIndex} type="button" onClick={() => toggleCustomDay(dayIndex)}
                        style={{
                          flex: '1', minWidth: '35px', padding: '0.45rem', textAlign: 'center', borderRadius: '6px',
                          border: isSelected ? '1px solid #f0a500' : '1px solid #3d2e1e',
                          background: isSelected ? 'rgba(240,165,0,0.12)' : '#0d0d0d',
                          color: isSelected ? '#f0e6d3' : '#b89b6a', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem'
                        }}>
                        {dayChar}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.72rem', fontFamily: "'Orbitron', monospace", textTransform: 'uppercase', letterSpacing: '0.1em', color: '#b89b6a', display: 'block', marginBottom: '0.4rem' }}>Start Time</label>
                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)}
                  style={{ width: '100%', background: '#0d0d0d', border: '1px solid #3d2e1e', color: '#f0e6d3', padding: '0.6rem', fontSize: '0.85rem', borderRadius: '6px', outline: 'none', colorScheme: 'dark' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', fontFamily: "'Orbitron', monospace", textTransform: 'uppercase', letterSpacing: '0.1em', color: '#b89b6a', display: 'block', marginBottom: '0.4rem' }}>End Time</label>
                <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)}
                  style={{ width: '100%', background: '#0d0d0d', border: '1px solid #3d2e1e', color: '#f0e6d3', padding: '0.6rem', fontSize: '0.85rem', borderRadius: '6px', outline: 'none', colorScheme: 'dark' }} />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingTop: '0.5rem' }}>
            <button type="button" onClick={onClose}
              style={{ flex: 1, background: '#2a2118', color: '#dbb97a', padding: '0.75rem', fontSize: '0.75rem', fontFamily: "'Orbitron', monospace", textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, borderRadius: '6px', border: '1px solid #3d2e1e', cursor: 'pointer' }}>
              Cancel
            </button>
            <button type="submit" disabled={submitting || !newTaskTitle.trim() || (recurrenceMode === 'custom' && customDays.size === 0)}
              style={{
                flex: 2, background: 'linear-gradient(135deg, #e63946, #f0a500)', color: '#0d0d0d', padding: '0.75rem',
                fontSize: '0.75rem', fontFamily: "'Orbitron', monospace", textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, borderRadius: '6px',
                border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
                opacity: submitting || !newTaskTitle.trim() || (recurrenceMode === 'custom' && customDays.size === 0) ? 0.4 : 1
              }}>
              <Check style={{ width: '1rem', height: '1rem' }} />
              <span>{submitting ? 'Scheduling...' : 'Schedule Task'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
