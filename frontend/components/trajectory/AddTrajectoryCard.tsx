'use client';

import React, { useState } from 'react';
import { Plus, Check, X, Compass, Briefcase, DollarSign, MapPin, Target, Sparkles, BookOpen, HeartPulse, Tag } from 'lucide-react';
import { TrajectoryKind } from '@/lib/types';

interface AddTrajectoryCardProps {
  onAdd: (data: { title: string; kind: TrajectoryKind; goal?: string }) => Promise<void>;
}

const kindOptions: { kind: string; label: string; icon: React.ReactNode; desc: string }[] = [
  { kind: 'interest', label: 'Interest', icon: <Compass style={{ width: '1rem', height: '1rem', color: '#f0a500' }} />, desc: 'Curiosity & workflow' },
  { kind: 'career', label: 'Career Move', icon: <Briefcase style={{ width: '1rem', height: '1rem', color: '#ff8f00' }} />, desc: 'Job change & leverage' },
  { kind: 'money', label: 'Money System', icon: <DollarSign style={{ width: '1rem', height: '1rem', color: '#4fc3f7' }} />, desc: 'Investment & assets' },
  { kind: 'travel', label: 'Trip Plan', icon: <MapPin style={{ width: '1rem', height: '1rem', color: '#4fc3f7' }} />, desc: 'Solo travel & map' },
  { kind: 'personal', label: 'Personal Plan', icon: <Target style={{ width: '1rem', height: '1rem', color: '#4fc3f7' }} />, desc: 'Life operating rule' },
  { kind: 'creative', label: 'Creative', icon: <Sparkles style={{ width: '1rem', height: '1rem', color: '#e63946' }} />, desc: 'Artifacts & shipping' },
  { kind: 'learning', label: 'Learning', icon: <BookOpen style={{ width: '1rem', height: '1rem', color: '#4fc3f7' }} />, desc: 'Notes & compounding' },
  { kind: 'health', label: 'Health', icon: <HeartPulse style={{ width: '1rem', height: '1rem', color: '#e63946' }} />, desc: 'Energy floor & routine' },
  { kind: 'custom', label: '+ Custom Category', icon: <Tag style={{ width: '1rem', height: '1rem', color: '#4fc3f7' }} />, desc: 'Define your own category' },
];

export const AddTrajectoryCard: React.FC<AddTrajectoryCardProps> = ({ onAdd }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [selectedKind, setSelectedKind] = useState<string>('interest');
  const [customKind, setCustomKind] = useState('');
  const [goal, setGoal] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || submitting) return;

    const finalKind = selectedKind === 'custom'
      ? (customKind.trim() || 'custom')
      : selectedKind;

    setSubmitting(true);
    try {
      await onAdd({ title, kind: finalKind, goal });
      setTitle('');
      setGoal('');
      setCustomKind('');
      setSelectedKind('interest');
      setIsOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* ─── Grid Card Trigger ─── */}
      <button
        onClick={() => setIsOpen(true)}
        className="add-interest"
        style={{
          border: '1px dashed #3d2e1e',
          background: 'rgba(17, 20, 29, 0.5)',
          minHeight: '24rem',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          textAlign: 'center',
          cursor: 'pointer',
          borderRadius: '4px',
          transition: 'all 200ms ease'
        }}
      >
        <div style={{
          width: '3.5rem',
          height: '3.5rem',
          border: '1px solid #3d2e1e',
          background: '#2a2118',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem'
        }}>
          <Plus style={{ width: '1.75rem', height: '1.75rem', color: '#f0a500' }} />
        </div>
        <strong style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f0e6d3' }}>
          Add a new trajectory
        </strong>
        <em style={{ fontSize: '0.8rem', color: '#b89b6a', fontStyle: 'normal', marginTop: '0.5rem', maxWidth: '15rem', lineHeight: 1.4 }}>
          It can stay curious, become a plan, or quietly disappear.
        </em>
      </button>

      {/* ─── Modal Dialog Overlay ─── */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            background: 'rgba(13, 13, 13, 0.88)',
            backdropFilter: 'blur(12px)'
          }}
        >
          <div
            style={{
              background: '#1e1812',
              border: '1px solid #3d2e1e',
              borderRadius: '8px',
              maxWidth: '34rem',
              width: '100%',
              padding: '1.5rem',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              textAlign: 'left',
              position: 'relative'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #3d2e1e', paddingBottom: '0.85rem' }}>
              <div>
                <span className="kicker" style={{ margin: 0 }}>NEW TRAJECTORY</span>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#f0e6d3' }}>Add Trajectory to Your World</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  padding: '0.4rem',
                  border: '1px solid #3d2e1e',
                  background: '#2a2118',
                  color: '#b89b6a',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                <X style={{ width: '1rem', height: '1rem' }} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              {/* Title Input */}
              <div>
                <label style={{ fontSize: '0.72rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#b89b6a', display: 'block', marginBottom: '0.4rem' }}>
                  Trajectory Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. AI Agents, Job Change, or Solo Trip"
                  required
                  autoFocus
                  style={{
                    width: '100%',
                    background: '#0d0d0d',
                    border: '1px solid #3d2e1e',
                    color: '#f0e6d3',
                    padding: '0.75rem',
                    fontSize: '0.9rem',
                    borderRadius: '4px',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Kind Options Pill Grid */}
              <div>
                <label style={{ fontSize: '0.72rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#b89b6a', display: 'block', marginBottom: '0.5rem' }}>
                  Select Category / Kind
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '0.5rem' }}>
                  {kindOptions.map((opt) => (
                    <button
                      key={opt.kind}
                      type="button"
                      onClick={() => setSelectedKind(opt.kind)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.6rem',
                        borderRadius: '4px',
                        border: selectedKind === opt.kind ? '1px solid #f0a500' : '1px solid #3d2e1e',
                        background: selectedKind === opt.kind ? 'rgba(79, 195, 247, 0.15)' : '#2a2118',
                        color: selectedKind === opt.kind ? '#f0e6d3' : '#dbb97a',
                        textAlign: 'left',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ padding: '0.3rem', background: '#0d0d0d', borderRadius: '4px', border: '1px solid #3d2e1e', display: 'flex', alignItems: 'center' }}>
                        {opt.icon}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 600 }}>{opt.label}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Category Text Field (Visible if Custom Selected) */}
              {selectedKind === 'custom' && (
                <div style={{ background: '#2a2118', padding: '0.85rem', border: '1px solid #f0a500', borderRadius: '4px' }}>
                  <label style={{ fontSize: '0.72rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#f0a500', display: 'block', marginBottom: '0.4rem' }}>
                    Custom Category Name *
                  </label>
                  <input
                    type="text"
                    value={customKind}
                    onChange={(e) => setCustomKind(e.target.value)}
                    placeholder="e.g. Startup, Gaming, Photography, Philosophy..."
                    required
                    style={{
                      width: '100%',
                      background: '#0d0d0d',
                      border: '1px solid #3d2e1e',
                      color: '#f0e6d3',
                      padding: '0.75rem',
                      fontSize: '0.9rem',
                      borderRadius: '4px',
                      outline: 'none'
                    }}
                  />
                </div>
              )}

              {/* Goal Input */}
              <div>
                <label style={{ fontSize: '0.72rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#b89b6a', display: 'block', marginBottom: '0.4rem' }}>
                  Initial End Goal (Optional)
                </label>
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="e.g. Build personal MVP or plan 7-day Japan itinerary"
                  style={{
                    width: '100%',
                    background: '#0d0d0d',
                    border: '1px solid #3d2e1e',
                    color: '#f0e6d3',
                    padding: '0.75rem',
                    fontSize: '0.9rem',
                    borderRadius: '4px',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  style={{
                    flex: 1,
                    background: '#2a2118',
                    color: '#dbb97a',
                    padding: '0.75rem',
                    fontSize: '0.75rem',
                    fontFamily: 'monospace',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    fontWeight: 600,
                    borderRadius: '4px',
                    border: '1px solid #3d2e1e',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !title.trim() || (selectedKind === 'custom' && !customKind.trim())}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #f0a500, #4fc3f7)',
                    color: '#0d0d0d',
                    padding: '0.75rem',
                    fontSize: '0.75rem',
                    fontFamily: 'monospace',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    fontWeight: 700,
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem',
                    opacity: submitting || !title.trim() || (selectedKind === 'custom' && !customKind.trim()) ? 0.4 : 1
                  }}
                >
                  <Check style={{ width: '1rem', height: '1rem' }} />
                  <span>{submitting ? 'Creating...' : 'Save Trajectory'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
