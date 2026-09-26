import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Search,
  CheckCircle2,
  Calendar,
  MapPin,
  Ticket,
  Printer,
  ShieldAlert,
  ArrowLeft,
  AlertCircle,
  Copy,
  Check,
  Award,
  CreditCard,
  Clock,
  Edit3,
  X,
  Save,
  Building2,
  User,
  Phone,
} from 'lucide-react';
import { api } from '../services/api.ts';
import { Registration } from '../types/index.ts';
import { useEvent } from '../context/EventContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { StatusBadge } from '../components/common/Badge.tsx';
import { VoucherModal } from '../components/public/VoucherModal.tsx';
import { ConfirmationModal } from '../components/common/ConfirmationModal.tsx';
import { CertificateModal } from '../components/certificate/CertificateModal.tsx';

interface CheckRegistrationPageProps {
  onNavigate: (path: string) => void;
}

const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

export const CheckRegistrationPage: React.FC<CheckRegistrationPageProps> = ({ onNavigate }) => {
  const { event } = useEvent();
  const { showToast } = useToast();

  const [inputCode, setInputCode] = useState('');
  const [inputEmail, setInputEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [notFoundError, setNotFoundError] = useState<string | null>(null);

  // Modals
  const [isVoucherOpen, setIsVoucherOpen] = useState(false);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [certModalView, setCertModalView] = useState<'certificate' | 'badge'>('badge');
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [copied, setCopied] = useState(false);

  // Edit personal data modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    phone: '',
    city: '',
    state: 'SP',
    organization: '',
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotFoundError(null);
    setRegistration(null);

    const cleanCode = inputCode.trim();
    const cleanEmail = inputEmail.trim().toLowerCase();

    if (!cleanCode && !cleanEmail) {
      showToast('Por favor, informe seu código de inscrição ou e-mail.', 'warning');
      return;
    }

    try {
      setLoading(true);
      // Query with code first, fallback to email
      const queryToUse = cleanCode || cleanEmail;
      const res = await api.checkRegistration(queryToUse);

      // If both were provided, verify they match
      if (cleanEmail && res.email.toLowerCase() !== cleanEmail && !cleanCode) {
        throw new Error('E-mail não corresponde à inscrição informada.');
      }

      setRegistration(res);
      showToast('Inscrição confirmada e localizada!', 'success');
    } catch (err: any) {
      setNotFoundError(err.message || 'Nenhuma inscrição localizada com os dados fornecidos.');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = () => {
    if (!registration) return;
    setEditFormData({
      name: registration.name || '',
      phone: registration.phone || '',
      city: registration.city || '',
      state: registration.state || 'SP',
      organization: registration.organization || '',
    });
    setEditError(null);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registration) return;

    if (!editFormData.name.trim() || editFormData.name.trim().length < 3) {
      setEditError('Nome completo deve ter pelo menos 3 caracteres.');
      return;
    }
    if (!editFormData.city.trim()) {
      setEditError('Cidade é obrigatória.');
      return;
    }

    try {
      setSavingEdit(true);
      setEditError(null);
      const res = await api.updateParticipantData(registration.code, {
        name: editFormData.name.trim(),
        phone: editFormData.phone.trim(),
        city: editFormData.city.trim(),
        state: editFormData.state.trim().toUpperCase(),
        organization: editFormData.organization.trim(),
      });

      setRegistration(res.registration);
      setIsEditModalOpen(false);
      showToast('Seus dados pessoais foram atualizados com sucesso!', 'success');
    } catch (err: any) {
      setEditError(err.message || 'Erro ao atualizar dados pessoais.');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!registration) return;
    try {
      setCancelling(true);
      await api.cancelRegistration(registration.code, registration.email, cancelReason);
      showToast('Inscrição cancelada com sucesso. Sua vaga foi liberada.', 'success');
      setRegistration({ ...registration, status: 'Cancelado' });
      setIsCancelModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Erro ao cancelar inscrição.', 'error');
    } finally {
      setCancelling(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    showToast('Código copiado!', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-8">
      {/* Back button */}
      <button
        type="button"
        onClick={() => onNavigate('/')}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para a página inicial
      </button>

      {/* Main Search Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-xl space-y-6">
        <div className="space-y-2">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">
            Consulta de Inscrição Oficial
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Já sou Inscrito
          </h1>
          <p className="text-sm text-slate-600">
            Consulte sua inscrição usando seu <strong>Código</strong> e/ou <strong>E-mail</strong> para acessar seu QR Code, mini crachá, certificado ou atualizar seus dados.
          </p>
        </div>

        {/* Search Input Form (Código + E-mail) */}
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Código de Inscrição
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  placeholder="Ex: EVT-26-XXXX"
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-hidden font-mono uppercase"
                />
                <Ticket className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                E-mail Cadastrado
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={inputEmail}
                  onChange={(e) => setInputEmail(e.target.value)}
                  placeholder="seu.email@gmail.com"
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-hidden"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Consultando...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Consultar Inscrição
                </>
              )}
            </button>
          </div>
        </form>

        {/* Not Found Error */}
        {notFoundError && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block">Nenhum registro localizado:</strong>
              {notFoundError}
            </div>
          </div>
        )}

        {/* Found Registration Card */}
        {registration && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 pt-6 border-t border-slate-100 space-y-6"
          >
            {/* Header info with status CONFIRMADO */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Status da Inscrição
                </span>
                <div className="flex items-center gap-2.5 mt-1">
                  <h3 className="text-lg font-bold text-slate-900">{registration.name}</h3>
                  {registration.status === 'Presente' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                      Presente (Check-in OK)
                    </span>
                  ) : registration.status === 'Cancelado' ? (
                    <StatusBadge status="Cancelado" />
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Confirmado
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg">
                  {registration.code}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyCode(registration.code)}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200 cursor-pointer"
                  title="Copiar código"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>

                {/* Edit personal data button */}
                <button
                  type="button"
                  onClick={openEditModal}
                  className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Editar dados pessoais"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar Dados</span>
                </button>
              </div>
            </div>

            {/* QR Code and Key Details */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
              {/* QR Code */}
              <div className="sm:col-span-4 flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-2xl shadow-xs text-center">
                {registration.qrCodeDataUrl ? (
                  <img
                    src={registration.qrCodeDataUrl}
                    alt={registration.code}
                    className="w-36 h-36 object-contain"
                  />
                ) : (
                  <div className="w-36 h-36 flex items-center justify-center text-xs text-slate-400">
                    QR Code Gerado
                  </div>
                )}
                <span className="text-[11px] font-bold text-indigo-600 mt-2">
                  Apresentar na Portaria
                </span>
              </div>

              {/* Data fields */}
              <div className="sm:col-span-8 space-y-3 text-xs sm:text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400 text-xs font-semibold uppercase block">E-mail</span>
                    <span className="text-slate-800 font-medium truncate block">{registration.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs font-semibold uppercase block">WhatsApp / Telefone</span>
                    <span className="text-slate-800 font-medium">{registration.phone || 'Não informado'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-slate-400 text-xs font-semibold uppercase block">Categoria</span>
                    <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-xs capitalize inline-block mt-0.5">
                      {registration.ticketType}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs font-semibold uppercase block">Cidade / UF</span>
                    <span className="text-slate-800 font-medium">
                      {registration.city}/{registration.state}
                    </span>
                  </div>
                </div>

                {registration.organization && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-slate-400 text-xs font-semibold uppercase block">Igreja / Congregação</span>
                    <span className="text-slate-800 font-medium">{registration.organization}</span>
                  </div>
                )}

                {/* Check-in Status Display */}
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-slate-400 text-xs font-semibold uppercase block mb-1">Status do Check-in</span>
                  {registration.checkedInAt ? (
                    <div className="p-2.5 rounded-xl bg-purple-50 text-purple-900 text-xs border border-purple-100 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                      <span>
                        <strong>Presença Registrada!</strong> Check-in realizado em {new Date(registration.checkedInAt).toLocaleString('pt-BR')} na recepção.
                      </span>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-slate-50 text-slate-600 text-xs border border-slate-200/80 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>
                        <strong>Aguardando Check-in:</strong> Apresente seu QR Code na entrada do evento para confirmar presença e retirar seu crachá.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Crachá & Certificado Row */}
            <div className="p-4 bg-gradient-to-r from-indigo-50 via-slate-50 to-purple-50 rounded-2xl border border-indigo-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs">
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-indigo-600" />
                  Mini Crachá & Certificado Digital
                </h4>
                <p className="text-xs text-slate-600">
                  {registration.status === 'Presente'
                    ? 'Presença confirmada! Seu certificado digital está liberado para emissão com código único.'
                    : 'Acesse seu Mini Crachá oficial. O Certificado em PDF é liberado automaticamente após o check-in na portaria.'}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setCertModalView('badge');
                    setIsCertModalOpen(true);
                  }}
                  className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
                  Visualizar Crachá
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCertModalView('certificate');
                    setIsCertModalOpen(true);
                  }}
                  className={`px-3.5 py-2 text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer ${
                    registration.status === 'Presente'
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  {registration.status === 'Presente' ? 'Baixar Certificado' : 'Ver Certificado'}
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              {registration.status !== 'Cancelado' && registration.status !== 'Presente' && (
                <button
                  type="button"
                  onClick={() => setIsCancelModalOpen(true)}
                  className="text-xs font-medium text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1.5 cursor-pointer"
                >
                  <ShieldAlert className="w-4 h-4" />
                  Solicitar cancelamento da vaga (LGPD)
                </button>
              )}

              <div className="flex items-center gap-3 ml-auto">
                <button
                  type="button"
                  onClick={() => setIsVoucherOpen(true)}
                  className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  Abrir Comprovante Oficial
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Modal para Editar Dados Pessoais Autorizados */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 border border-slate-200 shadow-2xl relative"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Editar Dados Pessoais</h3>
                <p className="text-xs text-slate-500">Alterações são sincronizadas diretamente no banco</p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl">
                {editError}
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Nome Completo *</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">WhatsApp / Telefone</label>
                <input
                  type="text"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  placeholder="(11) 99999-9999"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2 space-y-1">
                  <label className="font-semibold text-slate-700 block">Cidade *</label>
                  <input
                    type="text"
                    value={editFormData.city}
                    onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-hidden focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Estado *</label>
                  <select
                    value={editFormData.state}
                    onChange={(e) => setEditFormData({ ...editFormData, state: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-hidden focus:border-indigo-500 bg-white"
                  >
                    {BRAZILIAN_STATES.map((uf) => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Congregação / Igreja de Origem</label>
                <input
                  type="text"
                  value={editFormData.organization}
                  onChange={(e) => setEditFormData({ ...editFormData, organization: e.target.value })}
                  placeholder="Ex: Templo Sede IEPC"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {savingEdit ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Salvar Alterações</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Voucher Full Screen Modal */}
      <VoucherModal
        isOpen={isVoucherOpen}
        onClose={() => setIsVoucherOpen(false)}
        registration={registration}
        event={event}
        onCancelRegistration={() => {
          setIsVoucherOpen(false);
          setIsCancelModalOpen(true);
        }}
      />

      {/* Cancel Confirmation Modal */}
      <ConfirmationModal
        isOpen={isCancelModalOpen}
        onCancel={() => setIsCancelModalOpen(false)}
        onConfirm={handleConfirmCancel}
        title="Cancelar Inscrição?"
        message="Tem certeza que deseja cancelar sua inscrição no evento? Esta ação liberará sua vaga para outro jovem e cancelará seu código de credenciamento."
        confirmText="Sim, Cancelar Minha Inscrição"
        cancelText="Voltar e Manter Vaga"
        isDanger={true}
        isLoading={cancelling}
      />

      {/* Certificate / Badge Full Modal */}
      {registration && (
        <CertificateModal
          isOpen={isCertModalOpen}
          onClose={() => setIsCertModalOpen(false)}
          registration={registration}
          event={event}
          defaultView={certModalView}
        />
      )}
    </div>
  );
};
