import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  Users,
  UserCheck,
  Building2,
  CheckCircle2,
  TrendingUp,
  Info,
} from 'lucide-react';
import { DashboardStats } from '../../types/index.ts';

interface AdminDataVisualizationProps {
  stats: DashboardStats;
}

const CHECKIN_COLORS = ['#10b981', '#cbd5e1']; // Presente (Emerald), Pendente (Slate)
const DENOMINATION_COLORS = [
  '#4f46e5', // Indigo
  '#06b6d4', // Cyan
  '#8b5cf6', // Purple
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#10b981', // Emerald
  '#64748b', // Slate
];

export const AdminDataVisualization: React.FC<AdminDataVisualizationProps> = ({ stats }) => {
  const total = stats.totalRegistrations || 0;
  const present = stats.presentRegistrations || 0;
  const pending = Math.max(0, total - present);
  const maxCap = stats.maxCapacity || 600;
  const presenceRate = stats.presenceRate || 0;
  const capacityRate = maxCap > 0 ? Math.min(100, Math.round((total / maxCap) * 100)) : 0;
  const availableSeats = Math.max(0, maxCap - total);

  // Data for Check-in Donut (using real data)
  const checkinData = total === 0
    ? [{ name: 'Sem cadastros', value: 1, color: '#e2e8f0' }]
    : [
        { name: 'Presentes (Check-in)', value: present, color: '#10b981' },
        { name: 'Aguardando Entrada', value: pending, color: '#e2e8f0' },
      ];

  // Data for Capacity Donut
  const capacityData = [
    { name: 'Inscritos', value: total, color: '#4f46e5' },
    { name: 'Vagas Livres', value: availableSeats, color: '#f1f5f9' },
  ];

  // Data for Denominations (real data only)
  const denominations = (stats.byDenomination || []).filter((d) => d.count > 0);
  const hasDenominations = denominations.length > 0;

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              Visualização Gráfica de Dados (Recharts)
            </h3>
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Dados 100% Reais
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitoramento em tempo real de capacidade, presença e distribuição por congregação.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/70">
          <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          <span>Estado atual da base: <strong>{total} inscritos</strong></span>
        </div>
      </div>

      {/* 3 Graphical Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 1. Total de Inscritos & Lotação */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Capacidade</span>
              <h4 className="text-base font-extrabold text-slate-900">Total de Inscritos</h4>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <Users className="w-5 h-5" />
            </div>
          </div>

          {/* Chart Display */}
          <div className="relative h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={capacityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={72}
                  paddingAngle={total > 0 ? 3 : 0}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill="#4f46e5" />
                  <Cell fill="#e2e8f0" />
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`${val} pessoas`, '']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Inner Ring Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {total}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                de {maxCap} vagas
              </span>
            </div>
          </div>

          {/* Breakdown Badges */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Ocupação do Auditório:</span>
              <span className="font-bold text-slate-900">{capacityRate}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${capacityRate}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>{availableSeats} vagas livres</span>
              <span>Lotação Máx: {maxCap}</span>
            </div>
          </div>
        </div>

        {/* 2. Taxa de Check-in */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Credenciamento</span>
              <h4 className="text-base font-extrabold text-slate-900">Taxa de Check-in</h4>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>

          {/* Chart Display */}
          <div className="relative h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={checkinData}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={72}
                  paddingAngle={total > 0 && present > 0 ? 3 : 0}
                  dataKey="value"
                  stroke="none"
                >
                  {checkinData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, name: any) => [`${total === 0 ? 0 : val} participante(s)`, name]}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Inner Ring Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {presenceRate}%
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Presença Real
              </span>
            </div>
          </div>

          {/* Breakdown Badges */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
            <div className="bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-100 text-center">
              <span className="text-[10px] font-bold text-emerald-800 uppercase block">Presentes</span>
              <span className="text-base font-black text-emerald-900">{present}</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 text-center">
              <span className="text-[10px] font-bold text-slate-600 uppercase block">Aguardando</span>
              <span className="text-base font-black text-slate-800">{pending}</span>
            </div>
          </div>
        </div>

        {/* 3. Distribuição por Denominação */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4 md:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Origem & Igrejas</span>
              <h4 className="text-base font-extrabold text-slate-900">Por Denominação</h4>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
              <Building2 className="w-5 h-5" />
            </div>
          </div>

          {/* Chart or Clean Real Zero-State */}
          <div className="h-44 w-full flex items-center justify-center">
            {hasDenominations ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={denominations.slice(0, 5)}
                  layout="vertical"
                  margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 10, fill: '#334155' }}
                    width={90}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '12px',
                      color: '#fff',
                      border: 'none',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" name="Inscritos" radius={[0, 6, 6, 0]}>
                    {denominations.map((_, index) => (
                      <Cell key={`denom-cell-${index}`} fill={DENOMINATION_COLORS[index % DENOMINATION_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center p-4 space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Building2 className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-700">Nenhuma denominação registrada</p>
                <p className="text-[11px] text-slate-400 max-w-[220px] mx-auto leading-relaxed">
                  Total atual: 0 cadastros. O gráfico traçará as congregações automaticamente conforme chegarem os cadastros.
                </p>
              </div>
            )}
          </div>

          {/* Denomination Footer info */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Denominações ativas:</span>
            <span className="font-bold text-slate-800">{denominations.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
