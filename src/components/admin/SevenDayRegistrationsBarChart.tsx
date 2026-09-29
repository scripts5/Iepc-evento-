import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  LabelList,
} from 'recharts';
import { BarChart3, TrendingUp, Calendar, Sparkles } from 'lucide-react';

interface SevenDayDataPoint {
  date: string;
  label?: string;
  dayOfWeek?: string;
  fullDate?: string;
  count: number;
}

interface SevenDayRegistrationsBarChartProps {
  data: SevenDayDataPoint[];
}

export const SevenDayRegistrationsBarChart: React.FC<SevenDayRegistrationsBarChartProps> = ({
  data = [],
}) => {
  const chartData = data && data.length > 0 ? data : [];
  const totalLast7Days = chartData.reduce((sum, item) => sum + (item.count || 0), 0);
  const averageDaily = (totalLast7Days / (chartData.length || 7)).toFixed(1);

  const maxItem = chartData.reduce(
    (max, item) => (item.count > max.count ? item : max),
    { date: '-', count: 0, dayOfWeek: '' }
  );

  return (
    <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs space-y-5">
      {/* Header and Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <BarChart3 className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                Inscrições nos Últimos 7 Dias
              </h3>
              <p className="text-xs text-slate-500">
                Gráfico de barras diário • Contagem individual por dia da semana
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-indigo-50/70 border border-indigo-100 px-3.5 py-1.5 rounded-xl text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block">
              Total 7 Dias
            </span>
            <span className="text-base font-extrabold text-indigo-950">
              {totalLast7Days}
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 px-3.5 py-1.5 rounded-xl text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Média / Dia
            </span>
            <span className="text-base font-extrabold text-slate-800">
              {averageDaily}
            </span>
          </div>

          {maxItem.count > 0 && (
            <div className="hidden md:block bg-emerald-50/70 border border-emerald-100 px-3.5 py-1.5 rounded-xl text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                Pico ({maxItem.date})
              </span>
              <span className="text-base font-extrabold text-emerald-950">
                {maxItem.count}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Bar Chart Container */}
      <div className="h-64 sm:h-72 w-full pt-3">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 10, left: -20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
              interval={0}
              tickFormatter={(val, idx) => {
                const item = chartData[idx];
                return item?.dayOfWeek ? `${val} (${item.dayOfWeek})` : val;
              }}
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
              formatter={(val: any) => [`${val} novos inscritos`, 'Total do Dia']}
              labelFormatter={(label: any) => {
                const item = chartData.find((d) => d.date === label);
                return item?.fullDate
                  ? `${item.fullDate} (${item.dayOfWeek || ''})`
                  : label;
              }}
            />
            <Bar
              dataKey="count"
              name="Inscrições"
              radius={[8, 8, 0, 0]}
              maxBarSize={48}
            >
              {chartData.map((entry, index) => {
                const isMax = entry.count > 0 && entry.count === maxItem.count;
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={isMax ? '#4338ca' : '#6366f1'}
                    className="transition-opacity hover:opacity-80"
                  />
                );
              })}
              <LabelList
                dataKey="count"
                position="top"
                formatter={(val: any) => (val > 0 ? val : '')}
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  fill: '#334155',
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Info Legend */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block" />
          <span>Contagem diária apurada em tempo real</span>
        </div>
        <span className="font-semibold text-slate-700">
          Últimos 7 dias móveis
        </span>
      </div>
    </div>
  );
};
