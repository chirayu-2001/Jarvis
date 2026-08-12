'use client';

import React, { useState } from 'react';
import { Send, Feather } from 'lucide-react';

interface JournalComposeProps {
  onSubmit: (text: string) => Promise<void>;
}

export const JournalCompose: React.FC<JournalComposeProps> = ({ onSubmit }) => {
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || submitting) return;

    setSubmitting(true);
    try {
      await onSubmit(text);
      setText('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="panel">
      <div className="section-title compact-title" style={{ marginBottom: '0.75rem', marginTop: 0 }}>
        <div>
          <span className="kicker" style={{ margin: 0 }}>DAILY REFLECTION</span>
          <h2>Journal Entry</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.75rem' }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What's on your mind today? (Jarvis extracts patterns & connects trajectories without judging)..."
          rows={4}
          style={{
            width: '100%',
            background: '#0d0d0d',
            border: '1px solid #3d2e1e',
            color: '#f0e6d3',
            padding: '0.75rem',
            fontSize: '0.85rem',
            lineHeight: 1.5,
            resize: 'none'
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.75rem', color: '#b89b6a', fontFamily: 'monospace' }}>
            Zero shame. Curiosity {'>'} compliance.
          </span>
          <button
            type="submit"
            disabled={submitting || !text.trim()}
            style={{ opacity: submitting || !text.trim() ? 0.5 : 1 }}
          >
            <Send style={{ width: '0.85rem', height: '0.85rem' }} />
            <span>{submitting ? 'Analyzing...' : 'Submit Entry'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
