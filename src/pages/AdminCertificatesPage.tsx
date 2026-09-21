import React, { useState, useEffect, useMemo } from 'react';
import {
  Award,
  CreditCard,
  Search,
  Filter,
  Save,
  Palette,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  FileCheck,
  UserCheck,
  HelpCircle,
  Eye,
  Download,
  Building,
  RefreshCw,
} from 'lucide-react';
import { api } from '../services/api.ts';
import { Registration, CertificateConfig, EventConfig } from '../types/index.ts';
import { useEvent } from '../context/EventContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { CertificateModal } from '../components/certificate/CertificateModal.tsx';

export const AdminCertificatesPage: React.FC = () => {
  const { event, refreshEvent } = useEvent();
  const { showToast } = useToast();
  const { isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<'attendees' | 'template'>('attendees');
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [presenceFilter, setPresenceFilter] = useState<'all' | 'present' | 'pending'>('all');

  // Selected participant for modal
  const [selectedAttendee, setSelectedAttendee] = useState<Registration | null>(null);
  const [modalDefaultView, setModalDefaultView] = useState<'certificate' | 'badge'>('certificate');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Template Form State
  const [templateForm, setTemplateForm] = useState<CertificateConfig>({
    title: 'CERTIFICADO DE PARTICIPAÇÃO',
    subtitle: 'Certificamos para os devidos fins legais e acadêmicos que',
    textTemplate:
      'participou ativamente do evento {evento}, realizado em {data}, sediado em {local}, totalizando uma carga horária complementar de {carga_horaria}, cumprindo todas as exigências de presença e credenciamento.',
    workloadHours: '16 horas',
    signatoryName1: 'Dra. Camila Vasconcelos',
    signatoryRole1: 'Coordenação Científica & Acadêmica',
    signatoryName2: 'Henrique Castilho',
    signatoryRole2: 'Diretor Executivo do Evento',
    themeColor: '#4f46e5',
    borderStyle: 'gold',
    showQrCode: true,
    institutionName: 'Instituto de Educação & Inovação Tecnológica (IEPC)',
  });
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);

  // Load attendees and sync template config
  const fetchAttendees = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminRegistrations({ limit: 500 });
      setRegistrations(res.items);
    } catch (err: any) {
      showToast('Erro ao carregar lista de participantes.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendees();
    if (event?.certificateConfig) {
      setTemplateForm(prev => ({
        ...prev,
        ...event.certificateConfig,
      }));
    }
  }, [event]);

  // Filtered attendees
  const filteredRegistrations = useMemo(() => {
    return registrations.filter(r => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          r.name.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          r.code.toLowerCase().includes(q) ||
          (r.certificateCode && r.certificateCode.toLowerCase().includes(q)) ||
          (r.organization && r.organization.toLowerCase().includes(q));
        if (!matches) return false;
      }

      // Presence filter
      if (presenceFilter === 'present') {
        return r.status === 'Presente';
      }
      if (presenceFilter === 'pending') {
        return r.status !== 'Presente';
      }

      return true;
    });
  }, [registrations, searchQuery, presenceFilter]);

  const presentCount = useMemo(() => {
    return registrations.filter(r => r.status === 'Presente').length;
  }, [registrations]);

  const handleOpenCertificate = (attendee: Registration) => {
    setSelectedAttendee(attendee);
    setModalDefaultView('certificate');
    setIsModalOpen(true);
  };

  const handleOpenBadge = (attendee: Registration) => {
    setSelectedAttendee(attendee);
    setModalDefaultView('badge');
    setIsModalOpen(true);
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      showToast('Apenas administradores podem modificar o template oficial.', 'warning');
      return;
    }

    try {
      setIsSavingTemplate(true);
      const res = await api.updateCertificateTemplate(templateForm);
      showToast('Template de certificado atualizado com sucesso!', 'success');
      refreshEvent();
    } catch (err: any) {
      showToast(err.message || 'Erro ao salvar configurações do template.', 'error');
    } finally {
      setIsSavingTemplate(false);
    }
  };

  const colorPresets = [
    { name: 'Índigo Real', value: '#4f46e5' },
    { name: 'Dourado Prestígio', value: '#b45309' },
    { name: 'Azul Meia-Noite', value: '#1e3a8a' },
    { name: 'Esmeralda Nobre', value: '#047857' },
    { name: 'Bordô / Vinho', value: '#831843' },
    { name: 'Ardósia / Grafite', value: '#0f172a' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Certificados Digitais & Crachás
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Gerencie a emissão de certificados com código único e visualize os mini crachás de credenciamento.
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 self-start sm:self-auto">
          <button
            id="admin-tab-attendees-cert"
            onClick={() => setActiveTab('attendees')}
            className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'attendees'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Crachás & Certificados ({presentCount} Presentes)
          </button>

          {isAdmin && (
            <button
              id="admin-tab-template-config"
              onClick={() => setActiveTab('template')}
              className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'template'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Palette className="w-4 h-4" />
              Configurar Modelo (Template)
            </button>
          )}
        </div>
      </div>

      {/* View 1: Attendees List with Badges & Certificates */}
      {activeTab === 'attendees' && (
        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Check-ins Realizados
                </p>
                <h3 className="text-2xl font-bold text-emerald-600 mt-1">
                  {presentCount}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Aptos para emissão imediata
                </p>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <UserCheck className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Check-ins Pendentes
                </p>
                <h3 className="text-2xl font-bold text-amber-600 mt-1">
                  {registrations.length - presentCount}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Certificado liberado após entrada
                </p>
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total de Inscritos
                </p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">
                  {registrations.length}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Base geral de credenciamento
                </p>
              </div>
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <FileCheck className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="search-cert-attendee"
                type="text"
                placeholder="Buscar por nome, código, e-mail ou organização..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                id="filter-presence-status"
                value={presenceFilter}
                onChange={e => setPresenceFilter(e.target.value as any)}
                className="px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
              >
                <option value="all">Todos os Inscritos ({registrations.length})</option>
                <option value="present">Apenas Presentes com Certificado ({presentCount})</option>
                <option value="pending">Apenas Pendentes ({registrations.length - presentCount})</option>
              </select>

              <button
                onClick={fetchAttendees}
                title="Atualizar lista"
                className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Attendees Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="py-16 text-center text-slate-400">
                <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs">Carregando dados dos participantes...</p>
              </div>
            ) : filteredRegistrations.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <CreditCard className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-600">Nenhum participante encontrado.</p>
                <p className="text-xs text-slate-400 mt-1">Tente ajustar seus termos de busca ou filtros.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5">Participante</th>
                      <th className="px-4 py-3.5">Ingresso</th>
                      <th className="px-4 py-3.5">Status Check-in</th>
                      <th className="px-4 py-3.5">Cód. Certificado</th>
                      <th className="px-5 py-3.5 text-right">Ações Rápidas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRegistrations.map(attendee => {
                      const isPresent = attendee.status === 'Presente';
                      const certCode =
                        attendee.certificateCode ||
                        (isPresent ? `CERT-${attendee.code.replace('EVT-', '')}` : null);

                      return (
                        <tr
                          key={attendee.id}
                          className="hover:bg-slate-50/80 transition-colors"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-slate-800 to-indigo-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                                {attendee.name
                                  .split(' ')
                                  .filter(Boolean)
                                  .slice(0, 2)
                                  .map(n => n[0])
                                  .join('')}
                              </div>
                              <div>
                                <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                                  {attendee.name}
                                </div>
                                <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                                  <span>{attendee.email}</span>
                                  {attendee.organization && (
                                    <>
                                      <span>•</span>
                                      <span className="text-slate-500 font-medium">
                                        {attendee.organization}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                              {attendee.ticketType.toUpperCase()}
                            </span>
                          </td>

                          <td className="px-4 py-4">
                            {isPresent ? (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                Presente
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                <Clock className="w-3.5 h-3.5 text-amber-600" />
                                Aguardando Check-in
                              </div>
                            )}
                          </td>

                          <td className="px-4 py-4">
                            {certCode ? (
                              <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                                {certCode}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400 italic">
                                Gerado no check-in
                              </span>
                            )}
                          </td>

                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* View Mini Crachá */}
                              <button
                                id={`btn-view-badge-${attendee.code}`}
                                onClick={() => handleOpenBadge(attendee)}
                                title="Ver Mini Crachá de Identificação"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 bg-white hover:bg-indigo-50 border border-slate-200 rounded-xl transition-all shadow-sm"
                              >
                                <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                                <span>Mini Crachá</span>
                              </button>

                              {/* View / Download Certificate */}
                              <button
                                id={`btn-view-cert-${attendee.code}`}
                                onClick={() => handleOpenCertificate(attendee)}
                                disabled={!isPresent}
                                title={
                                  isPresent
                                    ? 'Gerar e baixar Certificado Digital (PDF)'
                                    : 'Disponível após confirmação do check-in'
                                }
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all shadow-sm ${
                                  isPresent
                                    ? 'text-white bg-indigo-600 hover:bg-indigo-500 shadow-indigo-100'
                                    : 'text-slate-400 bg-slate-100 cursor-not-allowed border border-slate-200 opacity-60'
                                }`}
                              >
                                <Award className="w-3.5 h-3.5" />
                                <span>Certificado (PDF)</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* View 2: Certificate Template Customizer */}
      {activeTab === 'template' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Settings Form */}
          <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Palette className="w-5 h-5 text-indigo-600" />
                Personalizar Template do Certificado
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Defina os textos, signatários, carga horária e identidade visual do documento digital em PDF.
              </p>
            </div>

            <form onSubmit={handleSaveTemplate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Instituição Emissora
                </label>
                <input
                  type="text"
                  value={templateForm.institutionName}
                  onChange={e => setTemplateForm({ ...templateForm, institutionName: e.target.value })}
                  placeholder="Ex: Instituto de Educação & Inovação Tecnológica (IEPC)"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Título do Certificado
                  </label>
                  <input
                    type="text"
                    value={templateForm.title}
                    onChange={e => setTemplateForm({ ...templateForm, title: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Carga Horária
                  </label>
                  <input
                    type="text"
                    value={templateForm.workloadHours}
                    onChange={e => setTemplateForm({ ...templateForm, workloadHours: e.target.value })}
                    placeholder="Ex: 16 horas"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Subtítulo / Introdução
                </label>
                <input
                  type="text"
                  value={templateForm.subtitle}
                  onChange={e => setTemplateForm({ ...templateForm, subtitle: e.target.value })}
                  placeholder="Ex: Certificamos para os devidos fins legais e acadêmicos que"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Texto do Modelo (Corpo do Certificado)
                  </label>
                  <span className="text-[11px] text-indigo-600 font-medium">
                    Variáveis: {'{evento}'}, {'{data}'}, {'{local}'}, {'{carga_horaria}'}
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={templateForm.textTemplate}
                  onChange={e => setTemplateForm({ ...templateForm, textTemplate: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white font-sans"
                />
              </div>

              {/* Signatories */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Assinaturas Oficiais
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Assinatura 1 - Nome
                    </label>
                    <input
                      type="text"
                      value={templateForm.signatoryName1}
                      onChange={e => setTemplateForm({ ...templateForm, signatoryName1: e.target.value })}
                      className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Assinatura 1 - Cargo
                    </label>
                    <input
                      type="text"
                      value={templateForm.signatoryRole1}
                      onChange={e => setTemplateForm({ ...templateForm, signatoryRole1: e.target.value })}
                      className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Assinatura 2 - Nome
                    </label>
                    <input
                      type="text"
                      value={templateForm.signatoryName2 || ''}
                      onChange={e => setTemplateForm({ ...templateForm, signatoryName2: e.target.value })}
                      className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Assinatura 2 - Cargo
                    </label>
                    <input
                      type="text"
                      value={templateForm.signatoryRole2 || ''}
                      onChange={e => setTemplateForm({ ...templateForm, signatoryRole2: e.target.value })}
                      className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Theme Color */}
              <div className="border-t border-slate-100 pt-4">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Cor Temática do Cabeçalho
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {colorPresets.map(c => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setTemplateForm({ ...templateForm, themeColor: c.value })}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        templateForm.themeColor === c.value
                          ? 'border-indigo-600 ring-2 ring-indigo-200 text-slate-900 font-semibold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full shadow-inner"
                        style={{ backgroundColor: c.value }}
                      />
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  id="btn-save-cert-template"
                  type="submit"
                  disabled={isSavingTemplate}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md shadow-indigo-100 transition-all disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSavingTemplate ? 'Salvando Alterações...' : 'Salvar Template do Certificado'}
                </button>
              </div>
            </form>
          </div>

          {/* Live Preview Column */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
                <Eye className="w-4 h-4 text-indigo-600" />
                Pré-visualização em Tempo Real (Demonstração)
              </div>
              <span className="text-xs bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full font-medium">
                Atualização instantânea
              </span>
            </div>

            {/* Mini scaled certificate preview */}
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center justify-center overflow-hidden">
              <div
                className="w-full bg-white text-slate-900 rounded-lg p-6 shadow-2xl relative select-none flex flex-col justify-between"
                style={{
                  aspectRatio: '1.41 / 1',
                  border: '8px double #b45309',
                }}
              >
                {/* Header */}
                <div className="text-center">
                  <p className="text-[9px] font-bold text-amber-800 tracking-widest uppercase">
                    {templateForm.institutionName}
                  </p>
                  <h3
                    className="text-lg sm:text-xl font-serif font-black uppercase mt-0.5"
                    style={{ color: templateForm.themeColor }}
                  >
                    {templateForm.title}
                  </h3>
                  <p className="text-[9px] text-slate-500 uppercase mt-0.5">
                    {templateForm.subtitle}
                  </p>
                </div>

                {/* Attendee Demo */}
                <div className="text-center my-auto px-4">
                  <h4 className="text-base sm:text-lg font-serif font-bold text-slate-900 border-b border-slate-300 inline-block px-4 pb-0.5">
                    Lucas Gabriel Silveira
                  </h4>
                  <p className="text-[10px] text-slate-600 mt-2 font-sans line-clamp-3 leading-relaxed">
                    {templateForm.textTemplate
                      .replace(/{evento}/g, event?.name || 'Evento')
                      .replace(/{data}/g, event?.startDate || '24/10/2026')
                      .replace(/{local}/g, event?.locationName || 'Oscar Niemeyer')
                      .replace(/{carga_horaria}/g, templateForm.workloadHours)}
                  </p>
                </div>

                {/* Signatures & Seal */}
                <div className="flex items-end justify-between border-t border-slate-200 pt-2 text-center text-[8px]">
                  <div className="w-28">
                    <div className="border-b border-slate-400 pb-0.5 font-serif italic text-slate-700">
                      {templateForm.signatoryName1}
                    </div>
                    <span className="font-semibold text-slate-500 uppercase">
                      {templateForm.signatoryRole1}
                    </span>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full border border-amber-600 flex items-center justify-center text-amber-700 text-[10px] font-bold">
                      ★
                    </div>
                    <span className="font-mono text-[7px] text-slate-400 mt-0.5">
                      CERT-26-DEMO
                    </span>
                  </div>

                  <div className="w-28">
                    <div className="border-b border-slate-400 pb-0.5 font-serif italic text-slate-700">
                      {templateForm.signatoryName2}
                    </div>
                    <span className="font-semibold text-slate-500 uppercase">
                      {templateForm.signatoryRole2}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Certificate / Mini Badge Modal */}
      {selectedAttendee && (
        <CertificateModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedAttendee(null);
          }}
          registration={selectedAttendee}
          event={event}
          certificateConfig={event?.certificateConfig || templateForm}
          defaultView={modalDefaultView}
        />
      )}
    </div>
  );
};
