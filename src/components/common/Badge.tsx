import React from 'react';
import { RegistrationStatus } from '../../types/index.ts';

interface BadgeProps {
  status: RegistrationStatus | string;
  className?: string;
}

export const StatusBadge: React.FC<BadgeProps> = ({ status, className = '' }) => {
  const isConfirmed = status === 'Confirmado' || status === 'Inscrito';
  const isPresent = status === 'Presente';
  const isCancelled = status === 'Cancelado';

  let displayLabel: string = status;
  let currentStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let dotColor = 'bg-emerald-500';

  if (isConfirmed) {
    displayLabel = 'Autorizado & Confirmado';
    currentStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    dotColor = 'bg-emerald-500';
  } else if (isPresent) {
    displayLabel = 'Presente (Check-in)';
    currentStyle = 'bg-purple-50 text-purple-700 border-purple-200';
    dotColor = 'bg-purple-500';
  } else if (isCancelled) {
    displayLabel = 'Cancelado';
    currentStyle = 'bg-rose-50 text-rose-700 border-rose-200';
    dotColor = 'bg-rose-500';
  } else {
    displayLabel = String(status);
    currentStyle = 'bg-slate-100 text-slate-700 border-slate-200';
    dotColor = 'bg-slate-400';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${currentStyle} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      {displayLabel}
    </span>
  );
};
