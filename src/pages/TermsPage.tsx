import React from 'react';
import { FileText, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useEvent } from '../context/EventContext.tsx';

export const TermsPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { event } = useEvent();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <button
        type="button"
        onClick={() => onNavigate('/')}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para o evento
      </button>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-xl space-y-8">
        <div className="border-b border-slate-100 pb-6 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold">
            <FileText className="w-4 h-4 text-indigo-600" />
            Regulamento Oficial
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Termos de Uso e Condições Gerais
          </h1>
          <p className="text-sm text-slate-600">
            Normas de participação e conduta no <strong>{event?.name}</strong>.
          </p>
        </div>

        <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">1. Credenciamento e Entrada</h2>
            <p>
              O ingresso é pessoal e intransferível no momento da realização do check-in presencial. É obrigatória a apresentação do voucher com QR Code (em smartphone ou impresso) e documento oficial com foto para liberação do acesso e entrega do crachá.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">2. Cessão de Uso de Imagem</h2>
            <p>
              O evento poderá ser filmado e fotografado para fins de divulgação institucional em redes sociais, imprensa e site oficial. Ao participar, você autoriza o uso gratuito da sua imagem e voz para tais finalidades exclusivamente promocionais do evento.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">3. Código de Conduta e Convivência</h2>
            <p>
              Prezamos por um ambiente seguro, inclusivo e respeitoso para todos os participantes, palestrantes e organizadores. Não será tolerado qualquer comportamento discriminatório, ofensivo ou perturbador da ordem.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">4. Emissão de Certificados</h2>
            <p>
              Os certificados serão emitidos e enviados por e-mail unicamente aos participantes que tiverem sua presença confirmada pelo sistema de credenciamento (check-in) na portaria do evento.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
