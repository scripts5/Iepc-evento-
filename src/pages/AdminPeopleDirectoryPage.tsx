import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Search,
  Building2,
  MapPin,
  CheckCircle2,
  QrCode,
  CreditCard,
  Download,
  Filter,
  Layers,
  LayoutGrid,
  List,
  Sparkles,
  ArrowUpDown,
  UserCheck,
  Eye,
  EyeOff,
  Ticket,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../services/api.ts';
import { Registration } from '../types/index.ts';
import { useToast } from '../context/ToastContext.tsx';
import { useEvent } from '../context/EventContext.tsx';
import { StatusBadge } from '../components/common/Badge.tsx';
import { VoucherModal } from '../components/public/VoucherModal.tsx';
import { CertificateModal } from '../components/certificate/CertificateModal.tsx';

export const AdminPeopleDirectoryPage: React.FC = () => {
  const { showToast } = useToast();
  const { event } = useEvent();
  const [attendees, setAttendees] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'Confirmado' | 'Presente' | 'Cancelado'>('todos');
  const [orgFilter, setOrgFilter] = useState<string>('todos');
  const [sortBy, setSortBy] = useState<'slot' | 'date' | 'org'>('slot');
  const [viewMode, setViewMode] = useState<'table' | 'cards' | 'grouped'>('table');

  // Privacy: By default, DO NOT show names as requested ("não mostre o nomes só mostre quantas vagas já foram ocupadas")
  const [showNames, setShowNames] = useState(false);

  // Modals
  const [selectedVoucher, setSelectedVoucher] = useState<Registration | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<Registration | null>(null);

  const maxCapacity = event?.maxCapacity || 600;

  const loadAllAttendees = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminRegistrations({
        limit: 1000,
        sortBy: 'date',
        sortOrder: 'asc',
      });
      setAttendees(res.items || []);
    } catch (err: any) {
      showToast(err.message || 'Erro ao carregar lista de vagas.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAttendees();
  }, []);

  // Distinct organizations list for filter
  const organizationsList = useMemo(() => {
    const orgs = new Set<string>();
    attendees.forEach((a) => {
      const org = (a.organization || '').trim() || (a.ticketType || '').trim();
      if (org) orgs.add(org);
    });
    return Array.from(orgs).sort();
  }, [attendees]);

  // Dynamic filter as the administrator types in the quick search bar
  const filteredAttendees = useMemo(() => {
    return attendees
      .filter((person) => {
        // Status filter
        if (statusFilter !== 'todos' && person.status !== statusFilter) {
          return false;
        }

        // Organization filter
        if (orgFilter !== 'todos') {
          const personOrg = (person.organization || '').trim() || (person.ticketType || '').trim();
          if (personOrg !== orgFilter) return false;
        }

        // Instant text search (filters dynamically while typing)
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const matchCode = person.code.toLowerCase().includes(term);
          const matchCity = person.city.toLowerCase().includes(term);
          const matchState = person.state.toLowerCase().includes(term);
          const matchOrg = (person.organization || '').toLowerCase().includes(term);
          const matchTicket = person.ticketType.toLowerCase().includes(term);
          const matchStatus = person.status.toLowerCase().includes(term);
          const matchName = showNames && person.name.toLowerCase().includes(term);
          return matchCode || matchCity || matchState || matchOrg || matchTicket || matchStatus || matchName;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'org') {
          const orgA = a.organization || a.ticketType || '';
          const orgB = b.organization || b.ticketType || '';
          return orgA.localeCompare(orgB, 'pt-BR');
        }
        return 0;
      });
  }, [attendees, searchTerm, statusFilter, orgFilter, sortBy, showNames]);

  // Grouped by organization
  const groupedByOrg = useMemo(() => {
    const map = new Map<string, Registration[]>();
    filteredAttendees.forEach((person) => {
      const key = (person.organization || '').trim() || (person.ticketType || '').trim() || 'Geral / Outros';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(person);
    });
    return Array.from(map.entries()).sort((a, b) => b[1].length - a[1].length);
  }, [filteredAttendees]);

  // Occupancy metrics
  const totalOccupied = attendees.filter((a) => a.status !== 'Cancelado').length;
  const filteredOccupiedCount = filteredAttendees.filter((a) => a.status !== 'Cancelado').length;
  const remainingCapacity = Math.max(0, maxCapacity - totalOccupied);
  const occupancyPercentage = maxCapacity > 0 ? Math.round((totalOccupied / maxCapacity) * 100) : 0;
  const presentOccupied = attendees.filter((a) => a.status === 'Presente').length;

  const handleExportCSV = () => {
    if (!filteredAttendees.length) {
      showToast('Nenhuma vaga ocupada para exportar.', 'warning');
      return;
    }

    const headers = showNames
      ? 'Vaga,Código,Nome,Categoria,Denominação/Igreja,Cidade,UF,Status,Data de Cadastro\n'
      : 'Vaga,Código,Ocupação,Categoria,Denominação/Igreja,Cidade,UF,Status,Data de Cadastro\n';

    const rows = filteredAttendees
      .map((p, idx) => {
        const slot = `Vaga #${idx + 1}`;
        if (showNames) {
          return `"${slot}","${p.code}","${p.name.replace(/"/g, '""')}","${p.ticketType}","${(p.organization || '').replace(/"/g, '""')}","${p.city}","${p.state}","${p.status}","${p.createdAt}"`;
        }
        return `"${slot}","${p.code}","Ocupada","${p.ticketType}","${(p.organization || '').replace(/"/g, '""')}","${p.city}","${p.state}","${p.status}","${p.createdAt}"`;
      })
      .join('\n');

    const bom = '\uFEFF';
    const blob = new Blob([bom + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ocupacao-vagas-iepc-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold text-slate-500">Contabilizando ocupação de vagas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dynamic Occupancy Header */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider">
              <Ticket className="w-4 h-4" />
              Painel de Ocupação do Evento
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <span>Vagas Ocupadas</span>
              <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                {totalOccupied} de {maxCapacity} preenchidas
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Contagem oficial de vagas preenchidas no sistema • Nomes individuais ocultos por privacidade
            </p>
          </div>

          {/* Quick Counter Blocks */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-indigo-50 border border-indigo-100 px-4 py-2.5 rounded-2xl text-center min-w-[110px]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block">
                Vagas Ocupadas
              </span>
              <span className="text-xl font-black text-indigo-950">{totalOccupied}</span>
            </div>

            <div className="bg-emerald-50 border border-emerald-100 px-4 py-2.5 rounded-2xl text-center min-w-[110px]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                Presenças (Check-in)
              </span>
              <span className="text-xl font-black text-emerald-950">{presentOccupied}</span>
            </div>

            <div className="bg-amber-50 border border-amber-100 px-4 py-2.5 rounded-2xl text-center min-w-[110px]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
                Vagas Restantes
              </span>
              <span className="text-xl font-black text-amber-950">{remainingCapacity}</span>
            </div>

            <button
              type="button"
              onClick={handleExportCSV}
              className="px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 flex items-center gap-2 transition-colors cursor-pointer shadow-2xs"
              title="Exportar contagem de vagas para CSV/Excel"
            >
              <Download className="w-4 h-4 text-indigo-600" />
              <span>Exportar Vagas</span>
            </button>
          </div>
        </div>

        {/* Visual Occupancy Bar */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-slate-600">
              Progresso de Lotação: <strong className="text-indigo-600">{occupancyPercentage}%</strong> do auditório preenchido
            </span>
            <span className="text-slate-500 font-normal">
              Capacidade máxima: <strong>{maxCapacity} lugares</strong>
            </span>
          </div>
          <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/80">
            <div
              className="h-full bg-linear-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.min(100, occupancyPercentage)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Dynamic Quick Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Quick search input (dynamic on typing) */}
          <div className="relative flex-1">
            <Search className="w-4.5 h-4.5 text-indigo-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Busca rápida dinâmica: digite código (EVT-...), congregação, categoria, cidade ou status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all font-medium"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 bg-slate-200/80 hover:bg-slate-300 w-5 h-5 rounded-full flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Privacy mode toggle button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowNames(!showNames)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                showNames
                  ? 'bg-slate-100 text-slate-700 border-slate-300'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200 shadow-2xs'
              }`}
              title={showNames ? 'Ocultar nomes individuais' : 'Mostrar nomes'}
            >
              {showNames ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showNames ? 'Ocultar Nomes' : 'Modo Vagas (Nomes Ocultos)'}</span>
            </button>

            {/* View mode toggle */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'table'
                    ? 'bg-white text-indigo-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Tabela</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'cards'
                    ? 'bg-white text-indigo-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Cards</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('grouped')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'grouped'
                    ? 'bg-white text-indigo-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Por Igreja</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Filter Indicator Message */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
              {filteredOccupiedCount} vaga(s) ocupada(s) encontrada(s)
            </span>
            {searchTerm && (
              <span className="text-slate-500">
                filtrando dinamicamente por: <strong className="text-slate-800">"{searchTerm}"</strong>
              </span>
            )}
          </div>

          {/* Quick status filters */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Status:
            </span>
            {(['todos', 'Confirmado', 'Presente', 'Cancelado'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  statusFilter === st
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {st === 'todos' ? 'Todos' : st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredAttendees.length === 0 && (
        <div className="bg-white p-12 rounded-3xl border border-slate-200/90 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Ticket className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Nenhuma vaga ocupada encontrada</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchTerm || statusFilter !== 'todos' || orgFilter !== 'todos'
              ? 'Nenhuma vaga corresponde aos termos da busca digitada.'
              : 'Nenhuma vaga ocupada no momento. As vagas serão contabilizadas assim que os participantes se cadastrarem.'}
          </p>
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Limpar Busca
            </button>
          )}
        </div>
      )}

      {/* VIEW MODE 1: ORGANIZED TABLE (Names hidden, showing occupied slots) */}
      {viewMode === 'table' && filteredAttendees.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 w-28">Nº da Vaga</th>
                  <th className="py-3.5 px-4">Código Oficial</th>
                  {showNames && <th className="py-3.5 px-4">Nome do Participante</th>}
                  <th className="py-3.5 px-4">Ocupação / Categoria</th>
                  <th className="py-3.5 px-4">Denominação / Igreja</th>
                  <th className="py-3.5 px-4">Cidade / UF</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAttendees.map((p, index) => {
                  const isCheckedIn = p.status === 'Presente';
                  return (
                    <tr
                      key={p.code}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isCheckedIn ? 'bg-emerald-50/20' : ''
                      }`}
                    >
                      {/* Vaga Number */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                          Vaga #{index + 1}
                        </span>
                      </td>

                      {/* Code */}
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">
                        {p.code}
                      </td>

                      {/* Optional Name (Hidden by default) */}
                      {showNames && (
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          {p.name}
                        </td>
                      )}

                      {/* Occupancy Badge & Category (Without Name) */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-[11px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Vaga Ocupada
                          </span>
                          <span className="text-slate-600 font-medium">
                            {p.ticketType}
                          </span>
                        </div>
                      </td>

                      {/* Church / Congregation */}
                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        {p.organization || p.ticketType || 'IEPC Geral'}
                      </td>

                      {/* City / State */}
                      <td className="py-3.5 px-4 text-slate-500">
                        {p.city} - {p.state}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <StatusBadge status={p.status} />
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedVoucher(p)}
                            className="p-1 rounded-lg hover:bg-indigo-50 text-indigo-600 border border-slate-200 transition-colors cursor-pointer"
                            title="Ver Comprovante QR Code"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedBadge(p)}
                            className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors cursor-pointer"
                            title="Ver Crachá"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: ORGANIZED CARDS (Showing occupied slots) */}
      {viewMode === 'cards' && filteredAttendees.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAttendees.map((p, index) => {
            const isCheckedIn = p.status === 'Presente';
            return (
              <div
                key={p.code}
                className={`bg-white rounded-2xl border p-5 transition-all shadow-xs hover:shadow-md flex flex-col justify-between space-y-4 ${
                  isCheckedIn ? 'border-emerald-200 bg-emerald-50/10' : 'border-slate-200/90'
                }`}
              >
                {/* Header: Slot Badge & Code (No personal names) */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-extrabold flex items-center justify-center text-xs shadow-xs">
                      #{index + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-sm text-slate-900">
                          {showNames ? p.name : `Vaga #${index + 1} (Ocupada)`}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md inline-block mt-0.5">
                        {p.code}
                      </span>
                    </div>
                  </div>

                  <StatusBadge status={p.status} />
                </div>

                {/* Details */}
                <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span className="truncate font-semibold text-slate-800">
                      {p.organization || p.ticketType || 'IEPC Geral'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">
                      {p.city} - {p.state}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-500">
                    <Ticket className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">Modalidade: {p.ticketType}</span>
                  </div>

                  {isCheckedIn && p.checkedInAt && (
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium pt-1 border-t border-slate-200/60">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>
                        Presente no Evento • Entrada às{' '}
                        {new Date(p.checkedInAt).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setSelectedVoucher(p)}
                    className="flex-1 py-1.5 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Comprovante</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedBadge(p)}
                    className="flex-1 py-1.5 px-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                    <span>Crachá</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW MODE 3: GROUPED BY ORGANIZATION (Counting occupied slots per church) */}
      {viewMode === 'grouped' && filteredAttendees.length > 0 && (
        <div className="space-y-6">
          {groupedByOrg.map(([orgName, groupPeople]) => (
            <div
              key={orgName}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden"
            >
              {/* Group Header */}
              <div className="bg-slate-50/80 p-4 sm:p-5 border-b border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">{orgName}</h3>
                    <p className="text-xs text-slate-500">
                      {groupPeople.length} vaga(s) ocupada(s) •{' '}
                      {groupPeople.filter((p) => p.status === 'Presente').length} presenças confirmadas
                    </p>
                  </div>
                </div>

                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {groupPeople.length} {groupPeople.length === 1 ? 'vaga ocupada' : 'vagas ocupadas'}
                </span>
              </div>

              {/* Group items grid */}
              <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {groupPeople.map((p, idx) => (
                  <div
                    key={p.code}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 bg-slate-50/50 hover:bg-white transition-all flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-900 truncate">
                          {showNames ? p.name : `Vaga Ocupada #${idx + 1}`}
                        </span>
                        {p.status === 'Presente' && (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span className="font-mono text-indigo-700 font-semibold">{p.code}</span>
                        <span>•</span>
                        <span>
                          {p.city} ({p.state})
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedVoucher(p)}
                      className="p-1.5 rounded-lg bg-white hover:bg-indigo-50 text-indigo-600 border border-slate-200 hover:border-indigo-200 transition-colors cursor-pointer shrink-0"
                      title="Ver Comprovante QR Code"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Voucher Modal */}
      {selectedVoucher && (
        <VoucherModal
          isOpen={Boolean(selectedVoucher)}
          onClose={() => setSelectedVoucher(null)}
          registration={selectedVoucher}
          event={event}
        />
      )}

      {/* Badge Modal */}
      {selectedBadge && (
        <CertificateModal
          isOpen={Boolean(selectedBadge)}
          onClose={() => setSelectedBadge(null)}
          registration={selectedBadge}
          event={event}
          certificateConfig={event?.certificateConfig}
          defaultView="badge"
        />
      )}
    </div>
  );
};
