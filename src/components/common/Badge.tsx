import React from 'react';
import { RegistrationStatus } from '../../types/index.ts';

interface BadgeProps {
  status: RegistrationStatus | string;
  className?: string;
}

export const StatusBadge: React.FC<BadgeProps> = ({ status, className = '' }) => {
  const styles: Record<string, string> = {
    Inscrito: 'bg-blue-50 text-blue-700 border-blue-200',
    Confirmado: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Presente: 'bg-purple-50 text-purple-700 border-purple-200',
    Cancelado: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  const currentStyle = styles[status] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${currentStyle} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${
        status === 'Inscrito' ? 'bg-blue-500' :
        status === 'Confirmado' ? 'bg-emerald-500' :
        status === 'Presente' ? 'bg-purple-500' :
        status === 'Cancelado' ? 'bg-rose-500' : 'bg-slate-400'
      }`} />
      {status}
    </span>
  );
};
