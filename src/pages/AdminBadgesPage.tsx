import React, { useState, useEffect, useMemo } from 'react';
import {
  CreditCard,
  Search,
  Filter,
  Printer,
  Download,
  CheckCircle2,
  Clock,
  UserCheck,
  Building,
  MapPin,
  Users,
  QrCode,
  Sparkles,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { api } from '../services/api.ts';
import { Registration, EventConfig } from '../types/index.ts';
import { useEvent } from '../context/EventContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { StatusBadge } from '../components/common/Badge.tsx';
import { CertificateModal } from '../components/certificate/CertificateModal.tsx';

export const AdminBadgesPage: React.FC = () => {
  const { event } = useEvent();
  const { showToast } = useToast();

  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [ticketFilter, setTicketFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State for Selected Badge
  const [selectedAttendee, setSelectedAttendee] = useState<Registration | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminRegistrations({ limit: 500 });
      setRegistrations(res.items);
    } catch (err: any) {
      showToast(err.message || 'Erro ao carregar lista para crachás.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handlePrintAll = () => {
    window.print();
  };

  const filteredRegistrations = useMemo(() => {
    return registrations.filter((r) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          r.name.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          r.code.toLowerCase().includes(q) ||
          (r.city && r.city.toLowerCase().includes(q)) ||
          (r.organization && r.organization.toLowerCase().includes(q));
        if (!matches) return false;
      }

      if (ticketFilter !== 'all' && r.ticketType !== ticketFilter) {
        return false;
      }

      if (statusFilter !== 'all' && r.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [registrations, searchQuery, ticketFilter, statusFilter]);

  const handleMarkPresent = async (id: string) => {
    try {
      await api.updateRegistrationStatus(id, 'Presente');
      showToast('Check-in realizado com sucesso!', 'success');
      fetchRegistrations();
    } catch (err: any) {
      showToast(err.message || 'Erro ao atualizar status.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
            <CreditCard className="w-3.5 h-3.5" />
            Credenciamento & Identificação
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Crachás de Identificação dos Membros
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Visualize, imprima em alta definição e gere os mini crachás individuais ou em lote para todos os inscritos e membros do evento com QR Code de acesso rápido.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={fetchRegistrations}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center gap-2 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
          <button
            type="button"
            onClick={handlePrintAll}
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all"
          >
            <Printer className="w-4 h-4" />
            Imprimir Crachás Filtrados
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block">Total de Inscritos</span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 block mt-1">
            {registrations.length}
          </span>
          <span className="text-[11px] text-indigo-600 font-semibold">Crachás disponíveis</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block">Presença Confirmada</span>
          <span className="text-xl sm:text-2xl font-black text-emerald-600 block mt-1">
            {registrations.filter((r) => r.status === 'Presente').length}
          </span>
          <span className="text-[11px] text-emerald-600 font-semibold">Crachás entregues</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block">Pendentes de Check-in</span>
          <span className="text-xl sm:text-2xl font-black text-amber-600 block mt-1">
            {registrations.filter((r) => r.status !== 'Presente' && r.status !== 'Cancelado').length}
          </span>
          <span className="text-[11px] text-amber-600 font-semibold">Aguardando na portaria</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block">Filtro Atual</span>
          <span className="text-xl sm:text-2xl font-black text-indigo-600 block mt-1">
            {filteredRegistrations.length}
          </span>
          <span className="text-[11px] text-slate-500 font-semibold">Exibidos na tela</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome, código, e-mail..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-semibold text-slate-500">Tipo:</span>
            <select
              value={ticketFilter}
              onChange={(e) => setTicketFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-xl px-2.5 py-1.5 bg-white text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Todos os Tipos</option>
              <option value="jovem-iepc">Jovem IEPC</option>
              <option value="jovem-convidado">Jovem Convidado</option>
              <option value="lideranca-apoio">Liderança & Apoio</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-xl px-2.5 py-1.5 bg-white text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Todos os Status</option>
              <option value="Inscrito">Inscrito</option>
              <option value="Confirmado">Confirmado</option>
              <option value="Presente">Presente (Check-in)</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Mini Crachás */}
      {loading ? (
        <div className="min-h-[300px] flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-200">
          <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-semibold text-slate-500">Carregando mini crachás...</p>
        </div>
      ) : filteredRegistrations.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
          <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-800">Nenhum crachá encontrado</h4>
          <p className="text-xs text-slate-500 mt-1">
            Não há participantes que correspondam aos filtros de pesquisa aplicados.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRegistrations.map((attendee) => {
            const isGuest = attendee.ticketType === 'jovem-convidado' || attendee.ticketType?.toLowerCase().includes('convidado');
            const isLeader = attendee.ticketType === 'lideranca-apoio' || attendee.ticketType?.toLowerCase().includes('lider') || attendee.ticketType?.toLowerCase().includes('volunt');

            return (
              <div
                key={attendee.id}
                className="bg-white rounded-2xl border-2 border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden relative group"
              >
                {/* Lanyard punch hole visual */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-2 bg-slate-200 rounded-full z-10 border border-slate-300 shadow-inner" />

                {/* Badge Header Ribbon */}
                <div
                  className={`p-4 pt-6 text-white text-center relative ${
                    isLeader
                      ? 'bg-gradient-to-r from-amber-600 to-amber-700'
                      : isGuest
                      ? 'bg-gradient-to-r from-sky-600 to-indigo-700'
                      : 'bg-gradient-to-r from-indigo-700 to-purple-800'
                  }`}
                >
                  <span className="text-[10px] font-extrabold uppercase tracking-widest block opacity-90">
                    {event?.name || 'CONFERÊNCIA DE JOVENS IEPC 2026'}
                  </span>
                  <span className="text-xs font-black tracking-wide block mt-0.5">
                    MINI CRACHÁ OFICIAL
                  </span>
                </div>

                {/* Badge Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="text-center space-y-1.5">
                    {/* Role / Category Pill */}
                    <div className="flex justify-center">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                          isLeader
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : isGuest
                            ? 'bg-sky-100 text-sky-800 border-sky-300'
                            : 'bg-indigo-100 text-indigo-800 border-indigo-300'
                        }`}
                      >
                        {attendee.ticketType === 'jovem-iepc'
                          ? 'Membro IEPC'
                          : attendee.ticketType === 'jovem-convidado'
                          ? 'Convidado'
                          : attendee.ticketType === 'lideranca-apoio'
                          ? 'Liderança & Apoio'
                          : (attendee.ticketType || 'Participante')}
                      </span>
                    </div>

                    {/* Attendee Name */}
                    <h3 className="text-lg font-black text-slate-900 tracking-tight leading-snug">
                      {attendee.name}
                    </h3>

                    {/* Email / Details */}
                    <p className="text-xs text-slate-500 truncate">{attendee.email}</p>

                    <div className="flex items-center justify-center gap-2 text-[11px] text-slate-600 font-medium pt-1">
                      <span>{attendee.city}/{attendee.state}</span>
                      {attendee.age && (
                        <>
                          <span>•</span>
                          <span>{attendee.age} anos</span>
                        </>
                      )}
                    </div>

                    {attendee.organization && (
                      <p className="text-[11px] font-semibold text-indigo-600 truncate">
                        {attendee.organization}
                      </p>
                    )}

                    {(attendee.guestsCount || 0) > 0 && (
                      <span className="inline-block text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full mt-1">
                        +{attendee.guestsCount} convidado(s) acompanhante(s)
                      </span>
                    )}
                  </div>

                  {/* QR Code and Code Box */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between gap-3">
                    <div className="text-left">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                        CÓDIGO DE ACESSO
                      </span>
                      <span className="font-mono text-xs font-black text-slate-800 tracking-wider">
                        {attendee.code}
                      </span>
                      <div className="mt-1">
                        <StatusBadge status={attendee.status} />
                      </div>
                    </div>

                    <div className="w-12 h-12 bg-white p-1 rounded-lg border border-slate-200 flex items-center justify-center shrink-0 shadow-xs">
                      <QrCode className="w-10 h-10 text-slate-800" />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAttendee(attendee);
                        setIsModalOpen(true);
                      }}
                      className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Imprimir / PDF
                    </button>

                    {attendee.status !== 'Presente' && attendee.status !== 'Cancelado' && (
                      <button
                        type="button"
                        onClick={() => handleMarkPresent(attendee.id)}
                        title="Registrar Check-in na Portaria"
                        className="p-2 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center transition-colors"
                      >
                        <UserCheck className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Resolution Badge Modal */}
      {selectedAttendee && (
        <CertificateModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedAttendee(null);
          }}
          registration={selectedAttendee}
          event={event}
          defaultView="badge"
        />
      )}
    </div>
  );
};
