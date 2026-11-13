import React from 'react';
import { PRIORITY_TYPES } from '../types';
import { Sparkles, AlertCircle } from 'lucide-react';

export default function PriorityBadge({ priority, reason, source, showReason = false }) {
  const p = PRIORITY_TYPES[priority] || PRIORITY_TYPES.MEDIUM;

  return (
    <div className="inline-flex flex-col gap-1">
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${p.bgClass} ${p.textClass} ${p.borderClass}`}
        title={reason || `Priority: ${priority}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${p.dotClass} animate-pulse`} />
        <span>{p.label}</span>
        {source && (
          <Sparkles className="w-3 h-3 opacity-70 ml-0.5" />
        )}
      </span>
      {showReason && reason && (
        <p className="text-[11px] text-slate-500 italic max-w-xs leading-tight">
          "{reason}"
        </p>
      )}
    </div>
  );
}
