import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Printer, Download, CheckCircle, Calendar, MapPin, Ticket, User, Mail, ShieldAlert } from 'lucide-react';
import { Registration, EventConfig } from '../../types/index.ts';
import { StatusBadge } from '../common/Badge.tsx';

interface VoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  registration: Registration | null;
  event: EventConfig | null;
  onCancelRegistration?: () => void;
}

export const VoucherModal: React.FC<VoucherModalProps> = ({
  isOpen,
  onClose,
  registration,
  event,
  onCancelRegistration,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !registration) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadQr = () => {
    if (!registration.qrCodeDataUrl) return;
    const a = document.createElement('a');
    a.href = registration.qrCodeDataUrl;
    a.download = `qrcode-${registration.code}.png`;
    a.click();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-8"
        >
          {/* Header Action */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                Comprovante de Inscrição
              </span>
              <StatusBadge status={registration.status} />
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Printable Ticket Area */}
          <div ref={printRef} className="print:p-0 py-6 space-y-6">
            {/* Event Header Banner */}
            <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl relative overflow-hidden shadow-lg">
              <div className="absolute right-0 top-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
              <p className="text-xs font-semibold text-indigo-300 uppercase tracking-widest">
                Ingresso Oficial
              </p>
              <h3 className="text-xl font-bold mt-1 text-white leading-snug">
                {event?.name || 'Conferência de Jovens IEPC 2026'}
              </h3>

              <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-3 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>
                    {event?.startDate?.includes('2026-11')
                      ? 'Novembro / 2026 (Dia a definir)'
                      : (event ? `${event.startDate.split('-').reverse().join('/')} • ${event.time}` : 'Novembro / 2026')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="truncate">{event?.locationName || 'Templo Sede IEPC'}</span>
                </div>
              </div>
            </div>

            {/* QR Code and Participant Card */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-6">
              {/* QR Code Display */}
              <div className="flex flex-col items-center shrink-0">
                <div className="p-3 bg-white rounded-xl shadow-xs border border-slate-200">
                  {registration.qrCodeDataUrl ? (
                    <img
                      src={registration.qrCodeDataUrl}
                      alt={`QR Code ${registration.code}`}
                      className="w-36 h-36 object-contain"
                    />
                  ) : (
                    <div className="w-36 h-36 flex items-center justify-center bg-slate-100 text-slate-400 text-xs text-center p-2">
                      Código: {registration.code}
                    </div>
                  )}
                </div>
                <span className="mt-2 text-xs font-mono font-bold tracking-widest text-slate-800 bg-slate-200/80 px-2.5 py-0.5 rounded-md">
                  {registration.code}
                </span>
              </div>

              {/* Details */}
              <div className="flex-1 w-full space-y-3 text-sm">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Participante
                  </label>
                  <p className="text-base font-bold text-slate-900 leading-snug">
                    {registration.name}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      E-mail
                    </label>
                    <p className="text-xs text-slate-700 font-medium truncate">{registration.email}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      Telefone
                    </label>
                    <p className="text-xs text-slate-700 font-medium">{registration.phone}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-200/60">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      Tipo de Ingresso
                    </label>
                    <span className="inline-block mt-0.5 px-2 py-0.5 bg-indigo-100/70 text-indigo-800 rounded font-semibold text-xs capitalize">
                      {registration.ticketType}
                    </span>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      Origem
                    </label>
                    <p className="text-xs text-slate-700 font-medium">
                      {registration.city}/{registration.state}
                    </p>
                  </div>
                </div>

                {registration.organization && (
                  <div className="pt-1">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      Instituição / Empresa
                    </label>
                    <p className="text-xs text-slate-700 font-medium">{registration.organization}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Verification Instructions */}
            <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3.5 text-xs text-indigo-900 flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block">Apresente este QR Code na portaria:</strong>
                Você pode exibir este comprovante diretamente na tela do seu smartphone ou trazê-lo impresso. Apresente também um documento de identificação oficial com foto.
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div>
              {onCancelRegistration && registration.status !== 'Cancelado' && registration.status !== 'Presente' && (
                <button
                  type="button"
                  onClick={onCancelRegistration}
                  className="text-xs font-medium text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Cancelar Inscrição (LGPD)
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {registration.qrCodeDataUrl && (
                <button
                  type="button"
                  onClick={handleDownloadQr}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Baixar QR
                </button>
              )}
              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                Imprimir Comprovante
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
