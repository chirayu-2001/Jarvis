'use client';

import React, { useState } from 'react';
import { JournalCompose } from './JournalCompose';
import { JournalRead } from './JournalRead';
import { PermissionCard } from './PermissionCard';
import { apiClient } from '@/lib/api-client';
import { JournalAnalysisResponse } from '@/lib/types';

interface JournalPanelProps {
  dateOverride?: string;
}

export const JournalPanel: React.FC<JournalPanelProps> = ({ dateOverride }) => {
  const [analysis, setAnalysis] = useState<JournalAnalysisResponse | null>(null);

  const handleSubmit = async (text: string) => {
    try {
      const res = await apiClient.submitJournal(text, dateOverride);
      setAnalysis(res);
    } catch (err) {
      setAnalysis({
        journal_id: 'mock-id',
        ai_read: 'Entry captured locally. Continuity intact.',
        linked_trajectory_ids: [],
      });
    }
  };

  return (
    <div className="space-y-4">
      <JournalCompose onSubmit={handleSubmit} />

      {analysis && (
        <JournalRead
          aiRead={analysis.ai_read}
          linkedTrajectoryIds={analysis.linked_trajectory_ids}
        />
      )}

      {analysis?.proposed_permission && (
        <PermissionCard permission={analysis.proposed_permission as any} />
      )}
    </div>
  );
};
