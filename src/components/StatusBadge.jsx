import React from 'react';
import { STATUS_TYPES } from '../types';
import { CheckCircle2, Clock, AlertTriangle, PlayCircle } from 'lucide-react';

export default function StatusBadge({ status }) {
  const s = STATUS_TYPES[status] || STATUS_TYPES.PENDING;

  const getIcon = () => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
      case 'IN_PROGRESS':
        return <PlayCircle className="w-3.5 h-3.5 text-amber-600" />;
      case 'ACKNOWLEDGED':
        return <Clock className="w-3.5 h-3.5 text-blue-600" />;
      case 'REOPENED':
        return <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${s.badgeClass}`}>
      {getIcon()}
      <span>{s.label}</span>
    </span>
  );
}
