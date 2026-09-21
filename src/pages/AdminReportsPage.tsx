import React, { useState, useEffect } from 'react';
import {
  FileBarChart,
  Download,
  Printer,
  FileSpreadsheet,
  Users,
  CheckCircle2,
  Calendar,
  Filter,
} from 'lucide-react';
import { api } from '../services/api.ts';
import { Registration, DashboardStats } from '../types/index.ts';
import { useEvent } from '../context/EventContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { StatusBadge } from '../components/common/Badge.tsx';

export const AdminReportsPage: React.FC = () => {
  const { event } = useEvent();
  const { showToast } = useToast();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter for printable attendance list
  const [reportStatus, setReportStatus] = useState<string>('todos');
  const [reportTicket, setReportTicket] = useState<string>('todos');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, regsData] = await Promise.all([
        api.getAdminStats(),
        api.getAdminRegistrations({ limit: 500, sortBy: 'name', sortOrder: 'asc' }),
      ]);
      setStats(statsData);
      setRegistrations(regsData.items);
    } catch (err: any) {
      showToast(err.message || 'Erro ao carregar dados do relatório.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCsv = (status?: string) => {
    const url = api.getExportCsvUrl({
      status: status || reportStatus,
      ticketType: reportTicket,
    });
    window.open(url, '_blank');
  };

  const filteredForPrint = registrations.filter((r) => {
    if (reportStatus !== 'todos' && r.status !== reportStatus) return false;
    if (reportTicket !== 'todos' && r.ticketType !== reportTicket) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Page Header (Hidden on Print) */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Relatórios e Listas de Presença
          </h2>
          <p className="text-xs text-slate-500">
            Exporte planilhas completas em formato CSV ou imprima a lista física de credenciamento oficial.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-xs flex items-center gap-2 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Imprimir Lista Física
          </button>
          <button
            type="button"
            onClick={() => handleDownloadCsv()}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            Baixar Planilha CSV
          </button>
        </div>
      </div>

      {/* Quick Export Cards (Hidden on Print) */}
      <div className="print:hidden grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Base Geral Completa</span>
            <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-xs text-slate-600">Todos os inscritos, incluindo cancelados e presentes.</p>
          <button
            type="button"
            onClick={() => handleDownloadCsv('todos')}
            className="w-full py-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
          >
            Exportar Todos (.CSV)
          </button>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Apenas Confirmados</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xs text-slate-600">Participantes ativos aguardando credenciamento.</p>
          <button
            type="button"
            onClick={() => handleDownloadCsv('Confirmado')}
            className="w-full py-2 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors"
          >
            Exportar Confirmados (.CSV)
          </button>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Apenas Presentes (Check-in)</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-xs text-slate-600">Lista oficial para emissão de certificados pós-evento.</p>
          <button
            type="button"
            onClick={() => handleDownloadCsv('Presente')}
            className="w-full py-2 text-xs font-bold text-purple-700 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors"
          >
            Exportar Presentes (.CSV)
          </button>
        </div>
      </div>

      {/* Filter bar for the printable preview (Hidden on Print) */}
      <div className="print:hidden bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-indigo-600" />
            Filtrar Lista Abaixo:
          </span>

          <select
            value={reportStatus}
            onChange={(e) => setReportStatus(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 outline-hidden font-medium"
          >
            <option value="todos">Status: Todos</option>
            <option value="Inscrito">Inscrito</option>
            <option value="Confirmado">Confirmado</option>
            <option value="Presente">Presente</option>
            <option value="Cancelado">Cancelado</option>
          </select>

          <select
            value={reportTicket}
            onChange={(e) => setReportTicket(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 outline-hidden font-medium"
          >
            <option value="todos">Categoria: Todas</option>
            {event?.ticketTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs text-slate-500">
          Mostrando <strong>{filteredForPrint.length}</strong> de {registrations.length} registros
        </span>
      </div>

      {/* Printable Sheet View */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xs space-y-6 print:border-none print:shadow-none print:p-0">
        {/* Printable Header */}
        <div className="border-b border-slate-200 pb-4 flex items-start justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{event?.name}</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Lista Oficial de Presença e Credenciamento • Gerado em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}
            </p>
          </div>
          <div className="text-right text-xs text-slate-500">
            <p className="font-semibold text-slate-700">{event?.locationName}</p>
            <p>{event?.startDate.split('-').reverse().join('/')}</p>
          </div>
        </div>

        {/* Printable Attendees Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-300 bg-slate-50 print:bg-slate-100 text-slate-700 font-bold">
                <th className="py-2 px-3 w-12 text-center">Nº</th>
                <th className="py-2 px-3">Código</th>
                <th className="py-2 px-3">Nome do Participante</th>
                <th className="py-2 px-3">E-mail / Telefone</th>
                <th className="py-2 px-3">Categoria</th>
                <th className="py-2 px-3 text-center">Status</th>
                <th className="py-2 px-3 w-48 text-center border-l border-slate-200">
                  Assinatura do Participante
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredForPrint.map((r, idx) => (
                <tr key={r.id} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{r.code}</td>
                  <td className="py-2.5 px-3">
                    <span className="font-bold text-slate-900 block">{r.name}</span>
                    {r.organization && (
                      <span className="text-[10px] text-slate-400 block">{r.organization}</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    <span className="block truncate max-w-[150px]">{r.email}</span>
                    <span className="text-[10px] text-slate-400">{r.phone}</span>
                  </td>
                  <td className="py-2.5 px-3 capitalize font-semibold text-slate-700">
                    {r.ticketType}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="py-2.5 px-3 border-l border-slate-200">
                    <div className="h-6 border-b border-dashed border-slate-300 w-full" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Printable Footer */}
        <div className="pt-6 border-t border-slate-200 flex justify-between text-[11px] text-slate-500">
          <span>Sistema de Gestão de Inscrições em Eventos • EventPass</span>
          <span>Página 1 de 1</span>
        </div>
      </div>
    </div>
  );
};
