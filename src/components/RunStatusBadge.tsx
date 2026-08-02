import React from 'react';
import { Loader2, CheckCircle2, XCircle, CircleDashed } from 'lucide-react';

export const RunStatusBadge: React.FC<{ status: string; conclusion: string | null }> = ({ status, conclusion }) => {
  if (status !== 'completed') {
    return (
      <span className="flex items-center gap-1.5 text-xs text-amber-300">
        <Loader2 size={14} className="animate-spin" />
        {status === 'queued' ? 'Queued' : 'Running'}
      </span>
    );
  }
  if (conclusion === 'success') {
    return (
      <span className="flex items-center gap-1.5 text-xs text-green-300">
        <CheckCircle2 size={14} />
        Success
      </span>
    );
  }
  if (conclusion === 'failure') {
    return (
      <span className="flex items-center gap-1.5 text-xs text-red-300">
        <XCircle size={14} />
        Failed
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 text-xs text-gray-400">
      <CircleDashed size={14} />
      {conclusion ?? 'Unknown'}
    </span>
  );
};
