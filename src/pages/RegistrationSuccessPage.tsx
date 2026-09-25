import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  CheckCircle2,
  Copy,
  Printer,
  Download,
  Calendar,
  MapPin,
  Ticket,
  ArrowRight,
  Share2,
  Check,
} from 'lucide-react';
import { Registration } from '../types/index.ts';
import { useEvent } from '../context/EventContext.tsx';
import { VoucherModal } from '../components/public/VoucherModal.tsx';
import { useToast } from '../context/ToastContext.tsx';

interface RegistrationSuccessPageProps {
  registration: Registration | null;
  onNavigate: (path: string) => void;
}

export const RegistrationSuccessPage: React.FC<RegistrationSuccessPageProps> = ({
  registration,
  onNavigate,
}) => {
  const { event } = useEvent();
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);

  if (!registration) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">Nenhuma inscrição recente ativa</h2>
        <p className="text-sm text-slate-500 mt-2">
          Você pode consultar uma inscrição existente com seu e-mail ou código.
        </p>
        <button
          type="button"
          onClick={() => onNavigate('/consultar-inscricao')}
          className="mt-4 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl"
        >
          Consultar Inscrição
        </button>
      </div>
    );
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(registration.code);
    setCopied(true);
    showToast('Código copiado para a área de transferência!', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQr = () => {
    if (!registration.qrCodeDataUrl) return;
    const a = document.createElement('a');
    a.href = registration.qrCodeDataUrl;
    a.download = `ingresso-${registration.code}.png`;
    a.click();
    showToast('Download do QR Code iniciado!', 'success');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-xl space-y-8"
      >
        {/* Success Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-xs border border-emerald-100">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full">
            Login Concluído com Sucesso
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Seu login foi concluído!
          </h1>
          <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            Sua vaga no <strong>{event?.name || 'Conferência de Jovens IEPC 2026'}</strong> está confirmada no sistema. Guarde seu código de identificação e QR Code abaixo.
          </p>
        </div>

        {/* Big Code and QR Card */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-6 sm:p-8 flex flex-col items-center text-center space-y-4">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Seu Código de Confirmação
          </span>

          <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xl sm:text-2xl font-mono font-extrabold text-slate-900 tracking-wider">
              {registration.code}
            </span>
            <button
              type="button"
              onClick={handleCopyCode}
              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors"
              title="Copiar código"
            >
              {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>

          {/* QR Code */}
          {registration.qrCodeDataUrl && (
            <div className="pt-2 flex flex-col items-center">
              <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-200">
                <img
                  src={registration.qrCodeDataUrl}
                  alt={`QR Code ${registration.code}`}
                  className="w-44 h-44 sm:w-52 sm:h-52 object-contain"
                />
              </div>
              <p className="text-xs text-slate-500 mt-3 max-w-xs">
                Apresente este QR Code no credenciamento da portaria para retirar seu crachá.
              </p>
            </div>
          )}
        </div>

        {/* Participant & Event Summary Details */}
        <div className="border border-slate-200 rounded-2xl p-5 space-y-3.5 text-xs sm:text-sm bg-slate-50/50">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/70">
            <span className="font-semibold text-slate-500">Participante:</span>
            <span className="font-bold text-slate-900">{registration.name}</span>
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-slate-200/70">
            <span className="font-semibold text-slate-500">Gmail / E-mail:</span>
            <span className="font-medium text-slate-800">{registration.email}</span>
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-slate-200/70">
            <span className="font-semibold text-slate-500">Idade:</span>
            <span className="font-bold text-slate-800">
              {registration.age ? `${registration.age} anos` : 'Informada no cadastro'}
            </span>
          </div>

          {registration.ticketType && (
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/70">
              <span className="font-semibold text-slate-500">Denominação:</span>
              <span className="font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md text-xs sm:text-sm capitalize">
                {registration.ticketType}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between pb-3 border-b border-slate-200/70">
            <span className="font-semibold text-slate-500">Quantas pessoas vai levar:</span>
            <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
              {registration.accompanyingCount ?? registration.guestsCount ?? 0} pessoa(s) acompanhando
            </span>
          </div>

          {(registration.accompanyingNames || registration.guestsNames) && (
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/70">
              <span className="font-semibold text-slate-500">Quem irá levar:</span>
              <span className="font-medium text-slate-800 text-right max-w-[60%]">
                {registration.accompanyingNames || registration.guestsNames}
              </span>
            </div>
          )}

          {registration.organization && (
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/70">
              <span className="font-semibold text-slate-500">Congregação / Igreja:</span>
              <span className="font-medium text-slate-800">{registration.organization}</span>
            </div>
          )}

          <div className="flex items-center justify-between pb-3 border-b border-slate-200/70">
            <span className="font-semibold text-slate-500">Data e Local:</span>
            <span className="font-medium text-slate-800 text-right">
              {event?.startDate?.includes('2026-11')
                ? 'Novembro / 2026'
                : (event?.startDate ? event.startDate.split('-').reverse().join('/') : 'Novembro / 2026')} • {event?.locationName || 'Templo Sede IEPC'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-500">Status no Sistema:</span>
            <span className="font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-full text-xs flex items-center gap-1.5 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Autorizado e Confirmado
            </span>
          </div>
        </div>

        {/* Informative banner about ADM badge */}
        <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-100 text-indigo-900 text-xs space-y-1">
          <p className="font-bold flex items-center gap-1.5">
            <span>ℹ️</span> Mini Crachá e Credencial de Entrada:
          </p>
          <p className="text-indigo-800/90 leading-relaxed">
            Seu mini crachá oficial personalizado (com nome, Gmail, idade e convidados) será impresso e disponibilizado pelos <strong>Administradores da IEPC</strong> na recepção durante o check-in presencial no evento.
          </p>
        </div>

        {/* Actions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={() => setIsVoucherModalOpen(true)}
            className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Visualizar / Imprimir Comprovante
          </button>

          <button
            type="button"
            onClick={handleDownloadQr}
            className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 flex items-center justify-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            Salvar Imagem do QR Code
          </button>
        </div>

        {/* Navigation back */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="text-xs font-semibold text-indigo-600 hover:underline inline-flex items-center gap-1"
          >
            Voltar para a página principal do evento
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>

      {/* Voucher Modal */}
      <VoucherModal
        isOpen={isVoucherModalOpen}
        onClose={() => setIsVoucherModalOpen(false)}
        registration={registration}
        event={event}
      />
    </div>
  );
};
