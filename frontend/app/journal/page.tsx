'use client';

import React, { useEffect, useState } from 'react';
import { JournalEntry } from '@/lib/types';
import { apiClient } from '@/lib/api-client';
import { BookOpen, Sparkles } from 'lucide-react';

export default function JournalArchivePage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiClient.getJournalEntries();
        setEntries(data);
      } catch (err) {
        console.warn('Journal archive load fallback:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="border-b border-[#252525] pb-4">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-4 h-4 text-[#f7f7f7]" />
          <h1 className="text-xl font-bold text-[#f7f7f7] tracking-tight">Journal Reflection Archive</h1>
        </div>
        <p className="text-xs text-[#9a9a9a] mt-1">
          Chronological stream of daily thoughts and Jarvis pattern extractions.
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs font-mono text-[#666666] border border-[#252525]">
          Loading journal entries...
        </div>
      ) : entries.length === 0 ? (
        <div className="p-8 text-center text-xs font-mono text-[#666666] border border-[#252525]">
          No past journal entries yet. Write your first entry on the Discovery dashboard.
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <div key={entry.id} className="bg-[#0c0c0c] border border-[#252525] p-5 space-y-3">
              <div className="flex items-center justify-between text-[10px] font-mono text-[#666666]">
                <span>{new Date(entry.created_at).toLocaleString()}</span>
                <span>ENTRY ID: {entry.id.substring(0, 8)}</span>
              </div>
              <p className="text-xs text-[#f7f7f7] font-sans leading-relaxed whitespace-pre-wrap">
                {entry.text}
              </p>
              {entry.ai_read && (
                <div className="pt-3 border-t border-[#1a1a1a] flex items-start space-x-2 text-xs text-[#cfcfcf] italic bg-[#050505] p-3 border border-[#1f1f1f]">
                  <Sparkles className="w-3.5 h-3.5 text-[#f7f7f7] mt-0.5 shrink-0" />
                  <span>Jarvis Read: "{entry.ai_read}"</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
