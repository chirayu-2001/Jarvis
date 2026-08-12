'use client';

import React, { useState } from 'react';
import { ShieldAlert, Check, X } from 'lucide-react';
import { PermissionLog } from '@/lib/types';
import { apiClient } from '@/lib/api-client';

interface PermissionCardProps {
  permission: PermissionLog;
  onResolved?: () => void;
}

export const PermissionCard: React.FC<PermissionCardProps> = ({ permission, onResolved }) => {
  const [loading, setLoading] = useState(false);
  const [resolved, setResolved] = useState<string | null>(
    permission.status !== 'pending' ? permission.status : null
  );

  const handleAction = async (action: 'approve' | 'reject') => {
    if (loading || resolved) return;
    setLoading(true);
    try {
      await apiClient.resolvePermission(permission.id, action);
      setResolved(action === 'approve' ? 'approved' : 'rejected');
      if (onResolved) onResolved();
    } catch (err) {
      setResolved(action === 'approve' ? 'approved' : 'rejected');
    } finally {
      setLoading(false);
    }
  };

  const isPending = !resolved || resolved === 'pending';

  return (
    <div
      className={`p-4 border transition-all ${
        isPending
          ? 'bg-[#0c0c0c] border-[#f7f7f7] shadow-xl'
          : 'bg-[#050505] border-[#252525] opacity-60'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <ShieldAlert
            className={`w-4 h-4 ${isPending ? 'text-[#f7f7f7]' : 'text-[#666666]'}`}
          />
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#f7f7f7]">
            AI Refactor Boundary Proposal
          </span>
        </div>
        <span
          className={`text-[9px] font-mono uppercase px-2 py-0.5 border ${
            isPending
              ? 'border-[#f7f7f7] text-[#f7f7f7]'
              : 'border-[#333333] text-[#666666]'
          }`}
        >
          {isPending ? 'Pending User Approval' : resolved}
        </span>
      </div>

      <p className="text-xs text-[#cfcfcf] my-2 leading-relaxed font-sans">
        {permission.proposal}
      </p>

      {isPending && (
        <div className="flex items-center justify-end space-x-3 pt-2 border-t border-[#1a1a1a]">
          <button
            onClick={() => handleAction('reject')}
            disabled={loading}
            className="text-xs font-mono text-[#9a9a9a] hover:text-white px-3 py-1 flex items-center space-x-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reject</span>
          </button>
          <button
            onClick={() => handleAction('approve')}
            disabled={loading}
            className="bg-[#f7f7f7] text-[#050505] hover:bg-white px-3 py-1 text-xs font-mono font-semibold uppercase tracking-wider flex items-center space-x-1 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Allow Refactor</span>
          </button>
        </div>
      )}
    </div>
  );
};
