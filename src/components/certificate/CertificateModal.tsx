import React, { useRef, useState } from 'react';
import {
  X,
  Download,
  Printer,
  Award,
  CheckCircle2,
  Copy,
  Calendar,
  MapPin,
  Clock,
  ShieldCheck,
  CreditCard,
  Building,
  UserCheck,
  FileText,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Registration, CertificateConfig, EventConfig } from '../../types/index.ts';
import { useToast } from '../../context/ToastContext.tsx';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  registration: Registration;
  event?: Partial<EventConfig> | null;
  certificateConfig?: CertificateConfig;
  defaultView?: 'certificate' | 'badge';
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  registration,
  event,
  certificateConfig,
  defaultView = 'badge',
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'certificate' | 'badge'>(defaultView);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [showConfirmDownload, setShowConfirmDownload] = useState(false);

  const certificateRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // Calculate age if not directly provided
  const getDisplayAge = () => {
    if (registration.age) return `${registration.age} anos`;
    if (registration.birthDate) {
      const birth = new Date(registration.birthDate);
      if (!isNaN(birth.getTime())) {
        const now = new Date();
        let diff = now.getFullYear() - birth.getFullYear();
        const m = now.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) diff--;
        if (diff > 0) return `${diff} anos`;
      }
    }
    return 'Idade confirmada';
  };

  // Fallback configuration if not provided
  const config: CertificateConfig = certificateConfig || {
    title: 'CERTIFICADO DE PARTICIPAÇÃO',
    subtitle: 'A Igreja Evangélica Pentecostal Cristã (IEPC) certifica que',
    textTemplate:
      'participou com louvor e dedicação da Conferência de Jovens da Igreja IEPC ({evento}), realizada em {data}, sediada em {local}, cumprindo a programação de comunhão, adoração e ministração com carga horária de {carga_horaria}.',
    workloadHours: '8 horas',
    signatoryName1: 'Pastor Presidente da IEPC',
    signatoryRole1: 'Liderança Pastoral Geral',
    signatoryName2: 'Coordenação de Jovens IEPC',
    signatoryRole2: 'Líder do Departamento da Juventude',
    themeColor: '#4f46e5',
    borderStyle: 'gold',
    showQrCode: true,
    institutionName: 'Igreja Evangélica Pentecostal Cristã (IEPC) - Departamento de Jovens',
  };

  const safeEvent = event || {};
  const certCode = registration.certificateCode || `CERT-${registration.code.replace('EVT-', '')}`;
  const eventName = safeEvent.name || 'Conferência de Jovens IEPC 2026';
  
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Mês de Novembro / 2026 (Dia a definir)';
    if (dateStr.includes('2026-11')) return 'Mês de Novembro / 2026 (Dia a definir)';
    const parts = dateStr.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dateStr;
  };

  const eventDateFormatted = safeEvent.startDate
    ? safeEvent.endDate && safeEvent.endDate !== safeEvent.startDate
      ? `${formatDate(safeEvent.startDate)} a ${formatDate(safeEvent.endDate)}`
      : formatDate(safeEvent.startDate)
    : '24 e 25 de Outubro de 2026';

  const eventLocation = safeEvent.locationName || 'Centro de Convenções Oscar Niemeyer';
  const issueDate = registration.checkedInAt
    ? new Date(registration.checkedInAt).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });

  // Interpolate body text
  const interpolatedText = config.textTemplate
    .replace(/{evento}/g, eventName)
    .replace(/{data}/g, eventDateFormatted)
    .replace(/{local}/g, eventLocation)
    .replace(/{carga_horaria}/g, config.workloadHours || '16 horas');

  const copyCode = () => {
    navigator.clipboard.writeText(certCode);
    showToast('Código copiado para a área de transferência!', 'info');
  };

  const downloadCertificatePdf = async () => {
    if (!certificateRef.current) return;
    try {
      setIsGeneratingPdf(true);
      showToast('Gerando certificado em alta resolução...', 'info');

      const element = certificateRef.current;
      let imgData = '';
      try {
        const canvas = await html2canvas(element, {
          scale: 1.5,
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: '#ffffff',
          imageTimeout: 6000,
        });
        imgData = canvas.toDataURL('image/jpeg', 0.95);
      } catch (canvasErr) {
        console.warn('Fallback para escala 1x no html2canvas:', canvasErr);
        const canvas = await html2canvas(element, {
          scale: 1,
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: '#ffffff',
        });
        imgData = canvas.toDataURL('image/jpeg', 0.90);
      }

      if (!imgData) throw new Error('Não foi possível gerar imagem.');

      // A4 Landscape is 297mm x 210mm
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      pdf.addImage(imgData, 'JPEG', 0, 0, 297, 210);
      const safeName = (registration.name || 'participante').toLowerCase().replace(/[^a-z0-9]/g, '-');
      pdf.save(`certificado-${safeName}-${certCode}.pdf`);
      showToast('Certificado baixado com sucesso!', 'success');
    } catch (err) {
      console.error('Error generating PDF:', err);
      showToast('Abrindo diálogo de impressão direta para salvar em PDF...', 'info');
      setTimeout(() => window.print(), 300);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const downloadBadgePdf = async () => {
    if (!badgeRef.current) return;
    try {
      setIsGeneratingPdf(true);
      showToast('Gerando crachá em alta resolução...', 'info');

      const element = badgeRef.current;
      let imgData = '';
      try {
        const canvas = await html2canvas(element, {
          scale: 1.5,
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: '#ffffff',
          imageTimeout: 6000,
        });
        imgData = canvas.toDataURL('image/jpeg', 0.95);
      } catch (canvasErr) {
        console.warn('Fallback escala 1x para crachá:', canvasErr);
        const canvas = await html2canvas(element, {
          scale: 1,
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: '#ffffff',
        });
        imgData = canvas.toDataURL('image/jpeg', 0.90);
      }

      if (!imgData) throw new Error('Não foi possível gerar imagem do crachá.');

      // Badge portrait size 100mm x 150mm
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [100, 150],
      });

      pdf.addImage(imgData, 'JPEG', 0, 0, 100, 150);
      const safeName = (registration.name || 'participante').toLowerCase().replace(/[^a-z0-9]/g, '-');
      pdf.save(`cracha-${safeName}-${registration.code}.pdf`);
      showToast('Mini crachá baixado com sucesso!', 'success');
    } catch (err) {
      console.error('Error generating badge PDF:', err);
      showToast('Abrindo diálogo de impressão para salvar em PDF...', 'info');
      setTimeout(() => window.print(), 300);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      id="certificate-modal-overlay"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4"
    >
      <div className="bg-slate-900 text-slate-100 rounded-2xl w-full max-w-5xl shadow-2xl border border-slate-700/80 flex flex-col max-h-[94vh] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base sm:text-lg flex items-center gap-2">
                Documentação do Participante
                <span className="text-xs bg-emerald-500/20 text-emerald-300 font-medium px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Presença Confirmada
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {registration.name} • {registration.code}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="close-cert-modal"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selector & Action Bar */}
        <div className="px-5 py-3 bg-slate-800/60 border-b border-slate-700/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 bg-slate-900/80 p-1 rounded-xl border border-slate-700/60">
            <button
              id="tab-certificate"
              onClick={() => setActiveTab('certificate')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                activeTab === 'certificate'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Award className="w-4 h-4" />
              Certificado Digital (A4)
            </button>
            <button
              id="tab-badge"
              onClick={() => setActiveTab('badge')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                activeTab === 'badge'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              Mini Crachá do Participante
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="copy-auth-code"
              onClick={copyCode}
              title="Copiar código de validação"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              Código: <span className="font-mono text-indigo-300 font-semibold">{certCode}</span>
            </button>

            <button
              id="print-document"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>

            {activeTab === 'certificate' ? (
              <button
                id="btn-download-certificate-pdf"
                onClick={() => setShowConfirmDownload(true)}
                disabled={isGeneratingPdf}
                className="inline-flex items-center gap-2 px-4 py-1.5 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                {isGeneratingPdf ? 'Gerando PDF...' : 'Baixar Certificado (PDF)'}
              </button>
            ) : (
              <button
                id="btn-download-badge-pdf"
                onClick={downloadBadgePdf}
                disabled={isGeneratingPdf}
                className="inline-flex items-center gap-2 px-4 py-1.5 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                {isGeneratingPdf ? 'Gerando...' : 'Baixar Crachá (PDF)'}
              </button>
            )}
          </div>
        </div>

        {/* Content Viewer */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 flex justify-center bg-slate-950/70">
          {activeTab === 'certificate' ? (
            /* ============================================================
               CERTIFICADO DIGITAL (A4 Paisagem ~1.41 Ratio)
               ============================================================ */
            <div className="w-full flex justify-center overflow-x-auto pb-4">
              <div
                id="printable-certificate"
                ref={certificateRef}
                style={{
                  width: '900px',
                  minWidth: '900px',
                  height: '636px',
                  minHeight: '636px',
                }}
                className="relative bg-white text-slate-900 shadow-2xl p-8 flex flex-col justify-between select-none"
              >
                {/* Decorative Borders */}
                <div
                  className="absolute inset-4 pointer-events-none"
                  style={{
                    border: '3px solid #b45309',
                    padding: '6px',
                  }}
                >
                  <div
                    className="w-full h-full"
                    style={{
                      border: '1px solid #d97706',
                    }}
                  />
                </div>

                {/* Corner Accents */}
                <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-amber-600 pointer-events-none" />
                <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-amber-600 pointer-events-none" />
                <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-amber-600 pointer-events-none" />
                <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-amber-600 pointer-events-none" />

                {/* Top Section */}
                <div className="relative z-10 text-center pt-3">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-900 text-amber-400 flex items-center justify-center font-bold text-sm shadow-sm">
                      ★
                    </div>
                    <span className="text-xs tracking-[0.25em] font-semibold text-amber-800 uppercase">
                      {config.institutionName || 'Igreja Evangélica Pentecostal Cristã (IEPC) - Departamento de Jovens'}
                    </span>
                  </div>

                  <h1
                    className="text-3xl font-serif font-black tracking-wider uppercase"
                    style={{ color: config.themeColor || '#1e1b4b' }}
                  >
                    {config.title}
                  </h1>
                  <p className="text-xs text-slate-500 tracking-wider uppercase mt-1">
                    {config.subtitle}
                  </p>
                </div>

                {/* Middle: Attendee Name & Body */}
                <div className="relative z-10 text-center px-12 my-auto">
                  <div className="mb-2">
                    <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 border-b-2 border-slate-200 inline-block px-8 pb-1 tracking-tight">
                      {registration.name}
                    </h2>
                  </div>

                  {registration.organization && (
                    <p className="text-xs text-indigo-950 font-medium mb-3">
                      {registration.organization}
                    </p>
                  )}

                  <p className="text-sm leading-relaxed text-slate-700 max-w-2xl mx-auto font-sans">
                    {interpolatedText}
                  </p>
                </div>

                {/* Bottom: Signatures and QR Code Seal */}
                <div className="relative z-10 pt-4 border-t border-slate-200">
                  <div className="flex items-end justify-between px-8">
                    {/* Signatory 1 */}
                    <div className="text-center w-56">
                      <div className="border-b border-slate-400 pb-1 mb-1 font-serif italic text-base text-slate-800">
                        {config.signatoryName1}
                      </div>
                      <p className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                        {config.signatoryRole1}
                      </p>
                    </div>

                    {/* Authenticity Badge & QR */}
                    <div className="flex flex-col items-center">
                      {config.showQrCode && registration.qrCodeDataUrl ? (
                        <div className="p-1 bg-white border border-slate-300 rounded shadow-sm mb-1">
                          <img
                            src={registration.qrCodeDataUrl}
                            alt="QR de Autenticidade"
                            className="w-14 h-14 object-contain"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-full border-2 border-amber-600/60 flex items-center justify-center text-amber-700 mb-1">
                          <ShieldCheck className="w-6 h-6" />
                        </div>
                      )}
                      <span className="text-[9px] font-mono tracking-wider text-slate-500 font-bold">
                        {certCode}
                      </span>
                      <span className="text-[8px] text-slate-400 tracking-tight">
                        VALIDADO EM {issueDate.toUpperCase()}
                      </span>
                    </div>

                    {/* Signatory 2 */}
                    <div className="text-center w-56">
                      <div className="border-b border-slate-400 pb-1 mb-1 font-serif italic text-base text-slate-800">
                        {config.signatoryName2 || 'Direção Geral do Evento'}
                      </div>
                      <p className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                        {config.signatoryRole2 || 'Diretor Executivo do Evento'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ============================================================
               MINI CRACHÁ DO PARTICIPANTE (Badge Vertical)
               ============================================================ */
            <div className="w-full flex flex-col items-center justify-center pb-4">
              <div
                id="printable-badge"
                ref={badgeRef}
                style={{
                  width: '360px',
                  minWidth: '360px',
                  height: '540px',
                  minHeight: '540px',
                }}
                className="relative bg-white text-slate-900 rounded-2xl shadow-2xl border-4 border-slate-200 overflow-hidden flex flex-col justify-between select-none"
              >
                {/* Lanyard Slot Simulation */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-2 bg-slate-300 rounded-full shadow-inner z-20" />

                {/* Top Banner */}
                <div
                  className="p-5 pt-7 text-center relative overflow-hidden text-white"
                  style={{ backgroundColor: config.themeColor || '#4f46e5' }}
                >
                  <div className="absolute -right-8 -top-8 w-24 h-24 bg-white/10 rounded-full blur-sm pointer-events-none" />
                  <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-indigo-200">
                    Credencial Oficial
                  </p>
                  <h3 className="font-black text-lg leading-tight tracking-tight uppercase mt-0.5">
                    {eventName}
                  </h3>
                  <p className="text-[10px] text-indigo-100/90 font-medium mt-1">
                    {eventDateFormatted}
                  </p>
                </div>

                {/* Middle Identity Section */}
                <div className="px-5 py-2.5 text-center flex flex-col items-center flex-1 justify-center space-y-2">
                  {/* Photo / Avatar Placeholder */}
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white font-bold text-xl flex items-center justify-center shadow-md border-2 border-white ring-4 ring-indigo-50">
                      {registration.name
                        .split(' ')
                        .filter(Boolean)
                        .slice(0, 2)
                        .map(n => n[0])
                        .join('')
                        .toUpperCase()}
                    </div>
                    <div
                      title="Check-in Realizado"
                      className="absolute bottom-0 right-0 p-1 bg-emerald-500 text-white rounded-full border-2 border-white shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Nome Completo */}
                  <div>
                    <h4 className="font-extrabold text-lg text-slate-900 leading-tight">
                      {registration.name}
                    </h4>
                    <p className="text-xs font-semibold text-indigo-600 truncate max-w-[320px]">
                      {registration.email}
                    </p>
                  </div>

                  {/* Age & Organization Badges */}
                  <div className="flex flex-wrap items-center justify-center gap-1.5 pt-0.5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                      🎂 Idade: {getDisplayAge()}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                      <Building className="w-3 h-3" />
                      {registration.organization || 'IEPC Templo Sede'}
                    </span>
                  </div>

                  {/* Quem irá levar e quantas pessoas */}
                  <div className="w-full bg-slate-50 border border-slate-200/90 rounded-xl p-2.5 text-left text-[11px] space-y-1">
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="font-bold text-slate-500">Quantas pessoas vai levar:</span>
                      <span className="font-extrabold text-indigo-700 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                        {registration.accompanyingCount ?? registration.guestsCount ?? 0} pessoa(s)
                      </span>
                    </div>

                    <div className="text-slate-700 pt-0.5">
                      <span className="font-bold text-slate-500 block text-[10px] uppercase tracking-wider">
                        Quem irá levar:
                      </span>
                      <span className="font-medium text-slate-900 block truncate">
                        {registration.accompanyingNames || registration.guestsNames || 'Apenas o próprio jovem'}
                      </span>
                    </div>
                  </div>

                  {/* Category Pill */}
                  <div>
                    <span className="inline-block px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-900 text-amber-300 shadow-xs">
                      {registration.ticketType === 'vip'
                        ? '★ LIDERANÇA / VIP'
                        : registration.ticketType === 'estudante'
                        ? 'ESTUDANTE / ACADÊMICO'
                        : 'JOVEM IEPC 2026'}
                    </span>
                  </div>
                </div>

                {/* Bottom Section: QR Code & Verification Data */}
                <div className="p-4 bg-slate-50 border-t border-slate-200/80">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 text-left">
                      <div className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                        Código de Acesso
                      </div>
                      <div className="font-mono font-black text-sm text-slate-900">
                        {registration.code}
                      </div>

                      <div className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mt-1.5">
                        Certificado
                      </div>
                      <div className="font-mono font-bold text-xs text-indigo-600">
                        {certCode}
                      </div>

                      <div className="text-[9px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                        <UserCheck className="w-3 h-3 text-emerald-600" />
                        Check-in presencial OK
                      </div>
                    </div>

                    {/* QR Code */}
                    {registration.qrCodeDataUrl && (
                      <div className="p-1.5 bg-white rounded-lg border border-slate-300 shadow-sm flex flex-col items-center">
                        <img
                          src={registration.qrCodeDataUrl}
                          alt="QR Code"
                          className="w-16 h-16 object-contain"
                          referrerPolicy="no-referrer"
                        />
                        <span className="text-[8px] font-mono text-slate-500 font-medium">
                          SCAN ME
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-200/60 text-center">
                    <p className="text-[9px] text-slate-400 font-medium">
                      IEPC Eventos • Credencial Pessoal e Intransferível
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal for Certificate PDF Download */}
      {showConfirmDownload && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-slate-900 space-y-5">
            <div className="flex items-start justify-between">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
                <Award className="w-6 h-6" />
              </div>
              <button
                type="button"
                onClick={() => setShowConfirmDownload(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900">
                Confirmar Emissão do Certificado
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Por favor, confirme os dados abaixo antes de gerar o documento oficial em alta resolução (PDF):
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs space-y-2.5">
              <div>
                <span className="text-slate-400 font-semibold uppercase text-[10px] block">Nome do Titular</span>
                <span className="font-bold text-slate-900 text-sm">{registration.name}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold uppercase text-[10px] block">Instituição Emissora</span>
                <span className="font-medium text-slate-800">Igreja Evangélica Pentecostal Cristã (IEPC)</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold uppercase text-[10px] block">Evento</span>
                <span className="font-medium text-slate-800">{eventName}</span>
              </div>
              <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/60">
                <div>
                  <span className="text-slate-400 font-semibold uppercase text-[10px] block">Carga Horária</span>
                  <span className="font-semibold text-indigo-600">{config.workloadHours || '8 horas'}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 font-semibold uppercase text-[10px] block">Código de Autenticidade</span>
                  <span className="font-mono font-bold text-slate-800">{certCode}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmDownload(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmDownload(false);
                  downloadCertificatePdf();
                }}
                disabled={isGeneratingPdf}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-200 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                Confirmar e Baixar PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
