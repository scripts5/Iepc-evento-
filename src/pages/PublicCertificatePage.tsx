import React, { useState, useEffect } from 'react';
import {
  Award,
  Search,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Printer,
  Download,
  AlertCircle,
  Building,
  Calendar,
  Clock,
  MapPin,
  ArrowLeft,
  Share2,
} from 'lucide-react';
import { api } from '../services/api.ts';
import { Registration, CertificateConfig, EventConfig } from '../types/index.ts';
import { useToast } from '../context/ToastContext.tsx';
import { useEvent } from '../context/EventContext.tsx';
import { CertificateModal } from '../components/certificate/CertificateModal.tsx';

interface PublicCertificatePageProps {
  onNavigate: (path: string) => void;
}

export const PublicCertificatePage: React.FC<PublicCertificatePageProps> = ({ onNavigate }) => {
  const { event } = useEvent();
  const { showToast } = useToast();

  const [inputCode, setInputCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    eligible: boolean;
    message?: string;
    registration: Registration;
    certificateConfig: CertificateConfig;
    event: Partial<EventConfig>;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal view
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalView, setModalView] = useState<'certificate' | 'badge'>('certificate');

  // Check URL pathname for direct code (e.g., /certificado/CERT-26-XXXX)
  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/\/certificado\/([A-Za-z0-9-_]+)/);
    if (match && match[1]) {
      const initialCode = match[1];
      setInputCode(initialCode);
      lookupCertificate(initialCode);
    }
  }, []);

  const lookupCertificate = async (codeToSearch: string) => {
    const clean = codeToSearch.trim();
    if (!clean) {
      showToast('Por favor, informe o código do certificado ou da inscrição.', 'warning');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      setResult(null);
      const data = await api.getCertificate(clean);
      setResult(data as any);
      showToast('Certificado localizado e verificado com sucesso!', 'success');
    } catch (err: any) {
      setErrorMessage(err.message || 'Certificado não localizado ou credenciamento não confirmado.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    lookupCertificate(inputCode);
  };

  const openDocument = (view: 'certificate' | 'badge') => {
    setModalView(view);
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-8">
      {/* Back button */}
      <button
        type="button"
        onClick={() => onNavigate('/')}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para a página inicial
      </button>

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100 shadow-sm">
          <Award className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Portal de Certificados & Mini Crachás
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          Consulte, emita e comprove a autenticidade do seu Certificado Digital de Participação e credencial oficial informando seu código único.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              id="search-cert-input"
              type="text"
              placeholder="Digite o código (ex: CERT-26-XXXX ou EVT-26-XXXX)"
              value={inputCode}
              onChange={e => setInputCode(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 text-sm sm:text-base bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white font-mono uppercase transition-all"
            />
          </div>
          <button
            id="btn-search-cert"
            type="submit"
            disabled={loading}
            className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm sm:text-base rounded-2xl shadow-md shadow-indigo-100 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Verificando...</span>
              </>
            ) : (
              <>
                <Award className="w-4 h-4" />
                <span>Validar / Emitir</span>
              </>
            )}
          </button>
        </form>

        <p className="text-xs text-slate-400 mt-2 text-center sm:text-left">
          Dica: O código de certificado é gerado automaticamente para todos os inscritos que confirmarem presença na recepção do evento.
        </p>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-800 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-rose-900">Não foi possível validar este certificado</h4>
            <p className="mt-0.5 text-rose-700">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Result Display Card */}
      {result && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
          {/* Authenticity Banner */}
          <div className="p-6 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border-b border-emerald-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-sm">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    Certificado Autêntico & Verificado
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    {result.registration.certificateCode}
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  Presença Presencial Confirmada
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-view-badge-public"
                onClick={() => openDocument('badge')}
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
              >
                <CreditCard className="w-4 h-4 text-indigo-600" />
                Ver Mini Crachá
              </button>
              <button
                id="btn-view-cert-public"
                onClick={() => openDocument('certificate')}
                className="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <Award className="w-4 h-4" />
                Baixar Certificado (PDF)
              </button>
            </div>
          </div>

          {/* Attendee & Event Metadata */}
          <div className="p-6 sm:p-8 space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Participante Titular
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                {result.registration.name}
              </h2>
              {result.registration.organization && (
                <p className="text-sm font-semibold text-indigo-600 flex items-center gap-1.5 mt-1">
                  <Building className="w-4 h-4" />
                  {result.registration.organization}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                  Evento Realizado
                </span>
                <span className="text-sm font-bold text-slate-900 block truncate">
                  {result.event.name}
                </span>
                <span className="text-xs text-slate-500 mt-0.5 block">
                  {result.event.startDate}
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" />
                  Carga Horária
                </span>
                <span className="text-sm font-bold text-slate-900 block">
                  {result.certificateConfig.workloadHours || '16 horas'}
                </span>
                <span className="text-xs text-slate-500 mt-0.5 block">
                  Atividades complementares
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                  Sede do Evento
                </span>
                <span className="text-sm font-bold text-slate-900 block truncate">
                  {result.event.locationName}
                </span>
                <span className="text-xs text-slate-500 mt-0.5 block">
                  {result.registration.city}/{result.registration.state}
                </span>
              </div>
            </div>

            {/* Verification Footer text */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800">Emissão Oficial:</span>{' '}
                {result.certificateConfig.institutionName || 'Igreja Evangélica Pentecostal Cristã (IEPC) - Departamento de Jovens'}
              </div>
              <div className="font-mono text-slate-500">
                Código: {result.registration.certificateCode}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Modal */}
      {result && (
        <CertificateModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          registration={result.registration}
          event={result.event}
          certificateConfig={result.certificateConfig}
          defaultView={modalView}
        />
      )}
    </div>
  );
};
