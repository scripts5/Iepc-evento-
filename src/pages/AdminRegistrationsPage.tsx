import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Download,
  Eye,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  QrCode,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  UserX,
  Phone,
  Mail,
  MapPin,
  Building2,
  FileText,
  X,
  Award,
  CreditCard,
  Users,
} from 'lucide-react';
import { api } from '../services/api.ts';
import { Registration, RegistrationStatus } from '../types/index.ts';
import { useToast } from '../context/ToastContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useEvent } from '../context/EventContext.tsx';
import { StatusBadge } from '../components/common/Badge.tsx';
import { ConfirmationModal } from '../components/common/ConfirmationModal.tsx';
import { VoucherModal } from '../components/public/VoucherModal.tsx';
import { CertificateModal } from '../components/certificate/CertificateModal.tsx';

export const AdminRegistrationsPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const { event } = useEvent();
  const { showToast } = useToast();

  const [items, setItems] = useState<Registration[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters and Query
  const [search, setSearch] = useState('');
  const [onlyCheckedIn, setOnlyCheckedIn] = useState(false);
  const [statusFilter, setStatusFilter] = useState('todos');
  const [ticketFilter, setTicketFilter] = useState('todos');
  const [stateFilter, setStateFilter] = useState('todos');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const limit = 50;

  // Selected for View / Edit / Delete
  const [selectedAttendee, setSelectedAttendee] = useState<Registration | null>(null);
  const [certModalAttendee, setCertModalAttendee] = useState<Registration | null>(null);
  const [certModalView, setCertModalView] = useState<'certificate' | 'badge'>('badge');
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Registration>>({});
  const [editLoading, setEditLoading] = useState(false);

  // Delete confirmation
  const [attendeeToDelete, setAttendeeToDelete] = useState<Registration | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadRegistrations = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminRegistrations({
        search,
        status: statusFilter,
        ticketType: ticketFilter,
        state: stateFilter,
        sortBy,
        sortOrder,
        page,
        limit,
        onlyCheckedIn: onlyCheckedIn ? true : undefined,
      });
      setItems(res.items);
      setTotalItems(res.pagination.totalItems);
      setTotalPages(res.pagination.totalPages);
    } catch (err: any) {
      showToast(err.message || 'Erro ao carregar participantes.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRegistrations();
  }, [search, statusFilter, ticketFilter, stateFilter, sortBy, sortOrder, page, onlyCheckedIn]);

  // Status changer helper
  const handleStatusChange = async (id: string, newStatus: RegistrationStatus) => {
    try {
      const res = await api.updateRegistrationStatus(id, newStatus);
      showToast(res.message, 'success');
      setItems((prev) => prev.map((item) => (item.id === id ? res.registration : item)));
      if (selectedAttendee?.id === id) {
        setSelectedAttendee(res.registration);
      }
    } catch (err: any) {
      showToast(err.message || 'Erro ao alterar status.', 'error');
    }
  };

  // Open Edit Modal
  const openEdit = (att: Registration) => {
    setSelectedAttendee(att);
    setEditFormData({
      name: att.name,
      email: att.email,
      phone: att.phone,
      birthDate: att.birthDate,
      city: att.city,
      state: att.state,
      organization: att.organization || '',
      ticketType: att.ticketType,
      notes: att.notes || '',
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAttendee) return;
    try {
      setEditLoading(true);
      const res = await api.updateRegistration(selectedAttendee.id, editFormData);
      showToast('Dados da inscrição atualizados!', 'success');
      setItems((prev) => prev.map((item) => (item.id === selectedAttendee.id ? res.registration : item)));
      setIsEditModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Erro ao salvar alterações.', 'error');
    } finally {
      setEditLoading(false);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!attendeeToDelete) return;
    try {
      setDeleteLoading(true);
      const res = await api.deleteRegistration(attendeeToDelete.id);
      showToast(res.message, 'success');
      setAttendeeToDelete(null);
      loadRegistrations();
    } catch (err: any) {
      showToast(err.message || 'Erro ao excluir inscrição.', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    const url = api.getExportCsvUrl({
      status: statusFilter,
      ticketType: ticketFilter,
      search,
    });
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {onlyCheckedIn ? 'Participantes com Check-in Realizado' : 'Todos os Cadastros e Inscrições'}
            </h2>
            <span
              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                onlyCheckedIn
                  ? 'bg-purple-100 text-purple-800 border-purple-200'
                  : 'bg-emerald-100 text-emerald-800 border-emerald-200'
              }`}
            >
              {onlyCheckedIn ? 'Filtro Check-in Ativo' : 'Histórico Completo (Todo o Período)'}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Total de <strong>{totalItems}</strong> participantes cadastrados {onlyCheckedIn ? '(apenas presentes)' : '(todos os períodos e cadastros)'}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Toggle: Only Checked-in vs All */}
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setOnlyCheckedIn(true);
                setPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                onlyCheckedIn
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              Somente com Check-in
            </button>
            <button
              type="button"
              onClick={() => {
                setOnlyCheckedIn(false);
                setPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                !onlyCheckedIn
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Todos os Inscritos
            </button>
          </div>

          <button
            type="button"
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative sm:col-span-2">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Buscar por nome, e-mail, código ou telefone..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:border-indigo-500 transition-all outline-hidden"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          </div>

          {/* Filter: Status */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white outline-hidden"
            >
              <option value="todos">Status: Todos</option>
              <option value="Inscrito">Inscrito</option>
              <option value="Confirmado">Confirmado</option>
              <option value="Presente">Presente</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>

          {/* Filter: Ticket Type */}
          <div>
            <select
              value={ticketFilter}
              onChange={(e) => {
                setTicketFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white outline-hidden"
            >
              <option value="todos">Categoria: Todas</option>
              {event?.ticketTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('-');
                setSortBy(sb);
                setSortOrder(so);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white outline-hidden"
            >
              <option value="date-desc">Data (Mais recentes)</option>
              <option value="date-asc">Data (Mais antigos)</option>
              <option value="name-asc">Nome (A - Z)</option>
              <option value="name-desc">Nome (Z - A)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Desktop Table & Mobile Cards */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500 font-medium">Buscando participantes...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <p className="text-sm font-bold text-slate-700">Nenhum participante encontrado</p>
            <p className="text-xs text-slate-400">
              Tente redefinir os filtros ou alterar o termo de pesquisa.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200/70">
                  <tr>
                    <th className="py-3 px-4">Código</th>
                    <th className="py-3 px-4">Participante & Idade</th>
                    <th className="py-3 px-4">Gmail / Telefone</th>
                    <th className="py-3 px-4">Quem Leva (Convidados)</th>
                    <th className="py-3 px-4">Congregação / Cidade</th>
                    <th className="py-3 px-4">Check-in / Status</th>
                    <th className="py-3 px-4 text-right">Crachá & Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((r) => {
                    const guestCount = r.accompanyingCount ?? r.guestsCount ?? 0;
                    const guestNames = r.accompanyingNames || r.guestsNames;

                    return (
                      <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-700">{r.code}</td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900 block">{r.name}</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {r.age ? (
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200/60 px-1.5 py-0.2 rounded">
                                {r.age} anos
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400">Idade ñ inf.</span>
                            )}
                            <span className="capitalize font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded text-[10px]">
                              {r.ticketType}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-slate-800 font-medium block truncate max-w-[180px]">
                            {r.email}
                          </span>
                          <span className="text-[11px] text-slate-400">{r.phone}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          {guestCount > 0 ? (
                            <div>
                              <span className="font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded text-[11px] inline-block mb-0.5">
                                Leva {guestCount} pessoa(s)
                              </span>
                              {guestNames && (
                                <p className="text-[11px] text-slate-600 truncate max-w-[170px]" title={guestNames}>
                                  {guestNames}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">
                              Apenas o participante
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          <span className="text-slate-900 font-semibold block">{r.city}/{r.state}</span>
                          <span className="text-[11px] text-slate-400 block truncate max-w-[150px]">
                            {r.organization || 'IEPC Templo Sede'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={r.status} />
                          {r.checkedInAt && (
                            <span className="text-[10px] text-emerald-600 block mt-1 font-medium">
                              ✓ {new Date(r.checkedInAt).toLocaleDateString('pt-BR')} às {new Date(r.checkedInAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Proeminent Mini Badge Button */}
                            <button
                              type="button"
                              onClick={() => {
                                setCertModalAttendee(r);
                                setCertModalView('badge');
                              }}
                              title="Gerar / Imprimir Mini Crachá (PDF)"
                              className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs flex items-center gap-1 transition-all"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>Mini Crachá</span>
                            </button>

                            {/* Quick Mark Present */}
                            {r.status !== 'Presente' && r.status !== 'Cancelado' && (
                              <button
                                type="button"
                                onClick={() => handleStatusChange(r.id, 'Presente')}
                                title="Fazer Check-in Presencial"
                                className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors border border-purple-200"
                              >
                                <UserCheck className="w-4 h-4" />
                              </button>
                            )}

                            {/* View details */}
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedAttendee(r);
                                setIsViewModalOpen(true);
                              }}
                              title="Visualizar Comprovante / QR Code"
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Edit details */}
                            <button
                              type="button"
                              onClick={() => openEdit(r)}
                              title="Editar Dados"
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            {/* Delete (Admin only) */}
                            {isAdmin && (
                              <button
                                type="button"
                                onClick={() => setAttendeeToDelete(r)}
                                title="Excluir Inscrição"
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="lg:hidden divide-y divide-slate-100">
              {items.map((r) => {
                const guestCount = r.accompanyingCount ?? r.guestsCount ?? 0;
                const guestNames = r.accompanyingNames || r.guestsNames;

                return (
                  <div key={r.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {r.code}
                          </span>
                          {r.age && (
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                              {r.age} anos
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mt-1">{r.name}</h4>
                        <p className="text-xs text-slate-600 font-medium">{r.email}</p>
                        <p className="text-[11px] text-slate-400">{r.phone} • {r.city}/{r.state}</p>
                      </div>
                      <StatusBadge status={r.status} />
                    </div>

                    {guestCount > 0 && (
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 text-xs">
                        <span className="font-bold text-indigo-700 block">
                          Leva {guestCount} pessoa(s)
                        </span>
                        {guestNames && (
                          <span className="text-slate-600 text-[11px] block mt-0.5">
                            {guestNames}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setCertModalAttendee(r);
                          setCertModalView('badge');
                        }}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 rounded-lg flex items-center gap-1.5 shadow-xs"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        Mini Crachá (PDF)
                      </button>

                      <div className="flex items-center gap-1">
                        {r.status !== 'Presente' && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(r.id, 'Presente')}
                            className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg border border-purple-200"
                            title="Check-in"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedAttendee(r);
                            setIsViewModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-slate-700"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(r)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Página {page} de {totalPages} ({totalItems} registros)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Voucher Modal */}
      <VoucherModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        registration={selectedAttendee}
        event={event}
      />

      {/* Edit Attendee Modal */}
      {isEditModalOpen && selectedAttendee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Editar Inscrição</h3>
                <p className="text-xs text-slate-500 font-mono">Código: {selectedAttendee.code}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  value={editFormData.name || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">E-mail *</label>
                  <input
                    type="email"
                    value={editFormData.email || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Telefone *</label>
                  <input
                    type="text"
                    value={editFormData.phone || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cidade</label>
                  <input
                    type="text"
                    value={editFormData.city || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estado (UF)</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={editFormData.state || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, state: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-hidden uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Organização / Empresa</label>
                <input
                  type="text"
                  value={editFormData.organization || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, organization: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tipo de Ingresso</label>
                <select
                  value={editFormData.ticketType || 'geral'}
                  onChange={(e) => setEditFormData({ ...editFormData, ticketType: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-hidden"
                >
                  {event?.ticketTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Observações</label>
                <textarea
                  rows={2}
                  value={editFormData.notes || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm outline-hidden resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-4 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl"
                >
                  {editLoading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!attendeeToDelete}
        title="Confirmar exclusão de inscrição?"
        message={`Deseja realmente remover a inscrição de "${attendeeToDelete?.name}" (${attendeeToDelete?.code})? Esta ação é irreversível e excluirá o registro permanentemente.`}
        confirmText="Sim, Excluir Registro"
        cancelText="Cancelar"
        isDanger={true}
        isLoading={deleteLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setAttendeeToDelete(null)}
      />

      {/* Certificate & Mini Badge Modal */}
      {certModalAttendee && (
        <CertificateModal
          isOpen={!!certModalAttendee}
          onClose={() => setCertModalAttendee(null)}
          registration={certModalAttendee}
          event={event}
          certificateConfig={event?.certificateConfig}
          defaultView={certModalView}
        />
      )}
    </div>
  );
};
