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

export const CheckRegistrationPage: React.FC<CheckRegistrationPageProps> = ({ onNavigate }) => {
  const { event } = useEvent();
  const { showToast } = useToast();

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [notFoundError, setNotFoundError] = useState<string | null>(null);

  // Modals
  const [isVoucherOpen, setIsVoucherOpen] = useState(false);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [certModalView, setCertModalView] = useState<'certificate' | 'badge'>('certificate');
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotFoundError(null);
    setRegistration(null);

    const clean = query.trim();
    if (!clean) {
      showToast('Por favor, informe seu código ou e-mail cadastrado.', 'warning');
      return;
    }

    try {
      setLoading(true);
      const res = await api.checkRegistration(clean);
      setRegistration(res);
      showToast('Inscrição localizada!', 'success');
    } catch (err: any) {
      setNotFoundError(err.message || 'Nenhuma inscrição localizada com os dados fornecidos.');
    } finally {
      setLoading(false);
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
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para a página inicial
      </button>

      {/* Main Search Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-xl space-y-6">
        <div className="space-y-2">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">
            Consulta de Credencial
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Consultar Inscrição
          </h1>
          <p className="text-sm text-slate-600">
            Digite seu <strong>e-mail cadastrado</strong> ou o <strong>código de inscrição</strong> (ex: EVT-26-XXXX) para visualizar seus dados, status ou obter a 2ª via do QR Code.
          </p>
        </div>

        {/* Search Input Form */}
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Digite seu e-mail ou código EVT-..."
              className="w-full pl-11 pr-4 py-3.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-hidden"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-6 py-3.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-60"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Buscando...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Localizar Inscrição
              </>
            )}
          </button>
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Status Atual da Inscrição
                </span>
                <div className="flex items-center gap-2.5 mt-1">
                  <h3 className="text-lg font-bold text-slate-900">{registration.name}</h3>
                  <StatusBadge status={registration.status} />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg">
                  {registration.code}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyCode(registration.code)}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200"
                  title="Copiar código"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* QR Code and Key Details */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
              {/* QR Code */}
              <div className="sm:col-span-4 flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
                {registration.qrCodeDataUrl ? (
                  <img
                    src={registration.qrCodeDataUrl}
                    alt={registration.code}
                    className="w-36 h-36 object-contain"
                  />
                ) : (
                  <div className="w-36 h-36 flex items-center justify-center text-xs text-slate-400">
                    QR Code Indisponível
                  </div>
                )}
                <span className="text-[11px] font-medium text-slate-500 mt-2">
                  Apresentar na recepção
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
                    <span className="text-slate-400 text-xs font-semibold uppercase block">Telefone</span>
                    <span className="text-slate-800 font-medium">{registration.phone || 'Não informado'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-slate-400 text-xs font-semibold uppercase block">Denominação</span>
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

                {registration.checkedInAt && (
                  <div className="p-2.5 rounded-xl bg-purple-50 text-purple-900 text-xs border border-purple-100 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>
                      Presença registrada em: {new Date(registration.checkedInAt).toLocaleString('pt-BR')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Certificate & Mini Badge Section */}
            {registration.status === 'Presente' ? (
              <div className="p-4 bg-gradient-to-r from-indigo-50/90 via-purple-50/70 to-amber-50/60 rounded-2xl border border-indigo-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-xs shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                      Certificado de Participação Liberado!
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                        Presença OK
                      </span>
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Sua presença foi confirmada. Acesse seu Certificado em PDF com código de autenticidade ou seu Mini Crachá.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setCertModalView('badge');
                      setIsCertModalOpen(true);
                    }}
                    className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
                    Mini Crachá
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCertModalView('certificate');
                      setIsCertModalOpen(true);
                    }}
                    className="px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <Award className="w-3.5 h-3.5" />
                    Baixar Certificado (PDF)
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-500 flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                <span>
                  O <strong>Certificado Digital de Participação (PDF)</strong> com código único e o Mini Crachá oficial serão liberados imediatamente após o registro presencial do seu check-in.
                </span>
              </div>
            )}

            {/* Action buttons */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              {registration.status !== 'Cancelado' && registration.status !== 'Presente' && (
                <button
                  type="button"
                  onClick={() => setIsCancelModalOpen(true)}
                  className="text-xs font-medium text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1.5"
                >
                  <ShieldAlert className="w-4 h-4" />
                  Solicitar cancelamento da vaga (LGPD)
                </button>
              )}

              <div className="flex items-center gap-3 ml-auto">
                <button
                  type="button"
                  onClick={() => setIsVoucherOpen(true)}
                  className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs flex items-center gap-2 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  Abrir Comprovante Oficial
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

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
        title="Deseja realmente cancelar sua inscrição?"
        message="Ao cancelar sua inscrição, sua vaga será liberada imediatamente para outro participante. Esta ação é definitiva e não poderá ser desfeita."
        confirmText="Sim, Cancelar Inscrição"
        cancelText="Voltar"
        isDanger={true}
        isLoading={cancelling}
        onConfirm={handleConfirmCancel}
        onCancel={() => setIsCancelModalOpen(false)}
      />

      {/* Certificate & Mini Badge Modal */}
      {registration && (
        <CertificateModal
          isOpen={isCertModalOpen}
          onClose={() => setIsCertModalOpen(false)}
          registration={registration}
          event={event}
          certificateConfig={event?.certificateConfig}
          defaultView={certModalView}
        />
      )}
    </div>
  );
};
