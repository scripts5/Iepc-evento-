import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import {
  CalendarDays,
  UserCheck,
  UserPlus,
  TrendingUp,
  BarChart3,
  LineChart as LineChartIcon,
  Download,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { DailyRegistrationCheckinStat } from '../../types/index.ts';

interface DailyAttendanceComparisonCardProps {
  data: DailyRegistrationCheckinStat[];
  totalRegistrations: number;
  totalCheckins: number;
}

export const DailyAttendanceComparisonCard: React.FC<DailyAttendanceComparisonCardProps> = ({
  data = [],
  totalRegistrations,
  totalCheckins,
}) => {
  const [viewMode, setViewMode] = useState<'daily' | 'cumulative'>('daily');
  const [showTable, setShowTable] = useState(false);

  // If data is empty, construct a safe fallback from recent days
  const chartData = data && data.length > 0 ? data : [];

  // Calculate totals and peak days
  const peakRegistration = chartData.reduce(
    (max, item) => (item.inscritos > max.inscritos ? item : max),
    { date: '-', inscritos: 0, fullDate: '' }
  );

  const peakCheckin = chartData.reduce(
    (max, item) => (item.checkins > max.checkins ? item : max),
    { date: '-', checkins: 0, fullDate: '' }
  );

  const handleExportCSV = () => {
    if (!chartData.length) return;
    const headers = 'Data,Dia da Semana,Novos Inscritos,Check-ins Realizados,Total Acumulado Inscritos,Total Acumulado Check-ins\n';
    const rows = chartData
      .map(
        (d) =>
          `"${d.fullDate}","${d.dayOfWeek}",${d.inscritos},${d.checkins},${d.acumuladoInscritos},${d.acumuladoCheckins}`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `relatorio-diario-inscritos-checkins-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <CalendarDays className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                Inscritos vs. Check-ins Realizados por Dia
              </h3>
              <p className="text-xs text-slate-500">
                Histórico comparativo diário e contínuo • Todos os dias registrados na base oficial
              </p>
            </div>
          </div>
        </div>

        {/* View Switchers & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Mode toggle */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('daily')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'daily'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Por Dia</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cumulative')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'cumulative'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LineChartIcon className="w-3.5 h-3.5" />
              <span>Acumulado</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowTable(!showTable)}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span>{showTable ? 'Ocultar Tabela' : 'Ver Todos os Dias em Tabela'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
            title="Baixar dados diários em CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Mini KPI Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
            <UserPlus className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block">Total Geral Inscritos</span>
            <span className="text-lg font-extrabold text-indigo-950">{totalRegistrations}</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block">Total Check-ins</span>
            <span className="text-lg font-extrabold text-emerald-950">{totalCheckins}</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block">Pico de Inscrições</span>
            <span className="text-sm font-bold text-slate-900">
              {peakRegistration.inscritos > 0 ? `${peakRegistration.inscritos} em ${peakRegistration.date}` : '0'}
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block">Pico de Check-ins</span>
            <span className="text-sm font-bold text-slate-900">
              {peakCheckin.checkins > 0 ? `${peakCheckin.checkins} em ${peakCheckin.date}` : '0'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Chart Graphic */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'daily' ? (
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -15, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                interval={0}
                angle={chartData.length > 10 ? -35 : 0}
                textAnchor={chartData.length > 10 ? 'end' : 'middle'}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '14px',
                  color: '#fff',
                  border: 'none',
                  fontSize: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
                }}
                formatter={(val: any, name: any) => [
                  `${val} participante(s)`,
                  name === 'inscritos' ? 'Novos Inscritos no Dia' : 'Check-ins Realizados no Dia',
                ]}
                labelFormatter={(label: any) => {
                  const item = chartData.find((d) => d.date === label);
                  return item ? `${item.fullDate} (${item.dayOfWeek})` : label;
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: '12px', fontSize: '12px' }}
                formatter={(val) =>
                  val === 'inscritos' ? 'Inscritos no Dia' : 'Check-ins no Dia'
                }
              />
              <Bar
                dataKey="inscritos"
                name="inscritos"
                fill="#4f46e5"
                radius={[6, 6, 0, 0]}
                maxBarSize={32}
              />
              <Bar
                dataKey="checkins"
                name="checkins"
                fill="#10b981"
                radius={[6, 6, 0, 0]}
                maxBarSize={32}
              />
            </BarChart>
          ) : (
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -15, bottom: 25 }}
            >
              <defs>
                <linearGradient id="colorInscritos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorCheckins" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                interval={0}
                angle={chartData.length > 10 ? -35 : 0}
                textAnchor={chartData.length > 10 ? 'end' : 'middle'}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '14px',
                  color: '#fff',
                  border: 'none',
                  fontSize: '12px',
                }}
                formatter={(val: any, name: any) => [
                  `${val} participante(s)`,
                  name === 'acumuladoInscritos' ? 'Total Acumulado de Inscritos' : 'Total Acumulado de Check-ins',
                ]}
                labelFormatter={(label: any) => {
                  const item = chartData.find((d) => d.date === label);
                  return item ? `${item.fullDate} (${item.dayOfWeek})` : label;
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: '12px', fontSize: '12px' }}
                formatter={(val) =>
                  val === 'acumuladoInscritos' ? 'Acumulado Inscritos' : 'Acumulado Check-ins'
                }
              />
              <Area
                type="monotone"
                dataKey="acumuladoInscritos"
                name="acumuladoInscritos"
                stroke="#4f46e5"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorInscritos)"
              />
              <Area
                type="monotone"
                dataKey="acumuladoCheckins"
                name="acumuladoCheckins"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorCheckins)"
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Complete Historical Breakdown Table (Every single day listed without omiting any) */}
      {showTable && (
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Tabela Completa de Todos os Dias Registrados ({chartData.length} dias)
            </span>
            <span className="text-[11px] text-slate-400">Nenhum dia substituído ou removido</span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Data</th>
                  <th className="py-2.5 px-3">Dia da Semana</th>
                  <th className="py-2.5 px-3 text-center">Inscritos no Dia</th>
                  <th className="py-2.5 px-3 text-center">Check-ins no Dia</th>
                  <th className="py-2.5 px-3 text-center">Inscritos Acumulado</th>
                  <th className="py-2.5 px-3 text-center">Check-ins Acumulado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {chartData.map((row) => (
                  <tr key={row.fullDate} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2 px-3 font-semibold text-slate-900">{row.fullDate}</td>
                    <td className="py-2 px-3 text-slate-500">{row.dayOfWeek}</td>
                    <td className="py-2 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full font-bold ${
                        row.inscritos > 0 ? 'bg-indigo-50 text-indigo-700' : 'text-slate-400'
                      }`}>
                        {row.inscritos}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full font-bold ${
                        row.checkins > 0 ? 'bg-emerald-50 text-emerald-700' : 'text-slate-400'
                      }`}>
                        {row.checkins}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center font-medium text-slate-700">
                      {row.acumuladoInscritos}
                    </td>
                    <td className="py-2 px-3 text-center font-medium text-slate-700">
                      {row.acumuladoCheckins}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
