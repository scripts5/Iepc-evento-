import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  QrCode,
  Camera,
  CameraOff,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  UserCheck,
  Upload,
  RefreshCw,
  Sparkles,
  Award,
  CreditCard,
} from 'lucide-react';
import jsQR from 'jsqr';
import { api } from '../services/api.ts';
import { Registration } from '../types/index.ts';
import { useToast } from '../context/ToastContext.tsx';
import { useEvent } from '../context/EventContext.tsx';
import { StatusBadge } from '../components/common/Badge.tsx';
import { CertificateModal } from '../components/certificate/CertificateModal.tsx';

// Sound synthesized using Web Audio API
const playSound = (type: 'success' | 'warning' | 'error') => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === 'success') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === 'warning') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(440, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch {
    // Audio context not allowed without prior interaction or unsupported
  }
};

export const AdminCheckinPage: React.FC = () => {
  const { event } = useEvent();
  const { showToast } = useToast();

  const [manualCode, setManualCode] = useState('');
  const [processing, setProcessing] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Modal for Certificate and Badge
  const [certModalAttendee, setCertModalAttendee] = useState<Registration | null>(null);
  const [certModalView, setCertModalView] = useState<'certificate' | 'badge'>('badge');

  // Check-in response state
  const [lastCheckinResult, setLastCheckinResult] = useState<{
    type: 'success' | 'already' | 'error';
    message: string;
    registration?: Registration;
  } | null>(null);

  // Recent check-ins list
  const [recentCheckins, setRecentCheckins] = useState<Registration[]>([]);

  // Video and Canvas refs for continuous scanning
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastScannedCodeRef = useRef<string | null>(null);
  const scanCooldownRef = useRef<number>(0);

  // Load present attendees on mount
  useEffect(() => {
    loadRecentCheckins();
    return () => {
      stopCamera();
    };
  }, []);

  const loadRecentCheckins = async () => {
    try {
      const res = await api.getAdminRegistrations({
        status: 'Presente',
        sortBy: 'date',
        sortOrder: 'desc',
        limit: 8,
      });
      setRecentCheckins(res.items);
    } catch {
      // benign
    }
  };

  const handleProcessCode = async (rawCode: string) => {
    // Clean string in case it is a URL or JSON
    let cleanCode = rawCode.trim();
    if (cleanCode.includes('codigo=')) {
      cleanCode = cleanCode.split('codigo=')[1].split('&')[0];
    } else if (cleanCode.includes('/')) {
      const parts = cleanCode.split('/');
      cleanCode = parts[parts.length - 1];
    }

    if (!cleanCode) return;

    try {
      setProcessing(true);
      const res = await api.performCheckIn(cleanCode);

      if (res.alreadyCheckedIn) {
        playSound('warning');
        setLastCheckinResult({
          type: 'already',
          message: res.message,
          registration: res.registration,
        });
      } else if (res.registration) {
        playSound('success');
        const reg = res.registration;
        setLastCheckinResult({
          type: 'success',
          message: res.message,
          registration: reg,
        });
        showToast(`Check-in de ${reg.name} realizado!`, 'success');
        setRecentCheckins((prev) => [
          reg,
          ...prev.filter((i) => i.id !== reg.id),
        ]);
      } else {
        setLastCheckinResult({
          type: 'error',
          message: res.message || 'Erro ao processar check-in.',
        });
      }
      setManualCode('');
    } catch (err: any) {
      playSound('error');
      setLastCheckinResult({
        type: 'error',
        message: err.message || 'Código não localizado ou inscrição inválida.',
      });
    } finally {
      setProcessing(false);
    }
  };

  // Start Camera Stream
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.play();
        setIsCameraActive(true);
        requestAnimationFrame(tickScan);
      }
    } catch (err: any) {
      setCameraError('Permissão para câmera negada ou câmera indisponível.');
      setIsCameraActive(false);
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Scan frame loop
  const tickScan = () => {
    if (
      videoRef.current &&
      videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA &&
      canvasRef.current
    ) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.height = videoRef.current.videoHeight;
        canvas.width = videoRef.current.videoWidth;
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        const now = Date.now();
        if (code && code.data && now > scanCooldownRef.current) {
          if (code.data !== lastScannedCodeRef.current || now - scanCooldownRef.current > 4000) {
            lastScannedCodeRef.current = code.data;
            scanCooldownRef.current = now + 2500; // 2.5s cooldown
            handleProcessCode(code.data);
          }
        }
      }
    }

    if (streamRef.current) {
      animationFrameRef.current = requestAnimationFrame(tickScan);
    }
  };

  // QR Upload file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const qr = jsQR(imageData.data, imageData.width, imageData.height);
          if (qr && qr.data) {
            handleProcessCode(qr.data);
          } else {
            showToast('Nenhum QR Code válido foi identificado na imagem.', 'warning');
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Credenciamento & Check-in
          </h2>
          <p className="text-xs text-slate-500">
            Escaneie o QR Code do voucher ou digite o código de inscrição para validar o acesso do participante.
          </p>
        </div>

        <button
          type="button"
          onClick={loadRecentCheckins}
          className="self-start sm:self-auto px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/70 border border-slate-200 flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Atualizar Lista
        </button>
      </div>

      {/* Main Working Area: Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col: Scanner & Input (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* QR Scanner Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                <Camera className="w-4 h-4 text-indigo-600" />
                Leitor de QR Code ao Vivo
              </div>

              {isCameraActive ? (
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 flex items-center gap-1.5 transition-colors"
                >
                  <CameraOff className="w-3.5 h-3.5" />
                  Desligar Câmera
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Camera className="w-3.5 h-3.5" />
                  Ativar Câmera
                </button>
              )}
            </div>

            {/* Camera Viewport */}
            <div className="relative aspect-video sm:aspect-16/10 bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-800">
              <video
                ref={videoRef}
                className={`w-full h-full object-cover ${isCameraActive ? 'block' : 'hidden'}`}
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Scanning visual reticle */}
              {isCameraActive && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-56 h-56 border-2 border-indigo-400/80 rounded-2xl relative">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-indigo-400 -mt-1 -ml-1" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-indigo-400 -mt-1 -mr-1" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-indigo-400 -mb-1 -ml-1" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-indigo-400 -mb-1 -mr-1" />
                    <div className="w-full h-0.5 bg-indigo-400/80 absolute top-1/2 -translate-y-1/2 animate-pulse shadow-sm shadow-indigo-400" />
                  </div>
                </div>
              )}

              {!isCameraActive && (
                <div className="text-center p-6 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                    <QrCode className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-300">Câmera desativada</p>
                    <p className="text-[11px] text-slate-500">
                      Clique em "Ativar Câmera" ou utilize a busca manual logo abaixo.
                    </p>
                  </div>
                  {cameraError && (
                    <p className="text-xs text-rose-400 font-medium">{cameraError}</p>
                  )}
                </div>
              )}
            </div>

            {/* Alternative: Upload QR image file */}
            <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
              <span>Também é possível ler imagem/print de QR Code:</span>
              <label className="cursor-pointer font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 rounded-xl">
                <Upload className="w-3.5 h-3.5" />
                Carregar Arquivo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Manual Entry Form */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Check-in Manual por Código ou E-mail</h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleProcessCode(manualCode);
              }}
              className="flex items-center gap-3"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="Ex: EVT-26-8A4F10 ou mariana@email.com"
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-500 outline-hidden font-mono"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>

              <button
                type="submit"
                disabled={processing || !manualCode.trim()}
                className="px-6 py-3 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {processing ? 'Validando...' : 'Confirmar Presença'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Col: Instant Feedback & Recent Stream (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Dynamic Result Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 min-h-[220px]">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Resultado do Credenciamento
            </span>

            {lastCheckinResult ? (
              <motion.div
                key={lastCheckinResult.message + Date.now()}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-5 rounded-2xl border ${
                  lastCheckinResult.type === 'success'
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                    : lastCheckinResult.type === 'already'
                    ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                    : 'bg-rose-50/80 border-rose-200 text-rose-950'
                }`}
              >
                <div className="flex items-start gap-3">
                  {lastCheckinResult.type === 'success' && (
                    <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0 mt-0.5" />
                  )}
                  {lastCheckinResult.type === 'already' && (
                    <AlertTriangle className="w-7 h-7 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  {lastCheckinResult.type === 'error' && (
                    <XCircle className="w-7 h-7 text-rose-600 shrink-0 mt-0.5" />
                  )}

                  <div className="space-y-2 flex-1">
                    <h4 className="font-extrabold text-base leading-tight">
                      {lastCheckinResult.type === 'success' && 'PRESENÇA CONFIRMADA!'}
                      {lastCheckinResult.type === 'already' && 'ATENÇÃO: JÁ CREDENCIADO!'}
                      {lastCheckinResult.type === 'error' && 'ERRO NO CREDENCIAMENTO'}
                    </h4>

                    <p className="text-xs">{lastCheckinResult.message}</p>

                    {lastCheckinResult.registration && (
                      <div className="pt-3 border-t border-black/10 space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="font-semibold opacity-70">Participante:</span>
                          <span className="font-bold">{lastCheckinResult.registration.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold opacity-70">Código:</span>
                          <span className="font-mono font-bold">{lastCheckinResult.registration.code}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold opacity-70">Categoria:</span>
                          <span className="capitalize font-bold">
                            {lastCheckinResult.registration.ticketType}
                          </span>
                        </div>
                        {lastCheckinResult.registration.organization && (
                          <div className="flex justify-between">
                            <span className="font-semibold opacity-70">Organização:</span>
                            <span>{lastCheckinResult.registration.organization}</span>
                          </div>
                        )}
                        {lastCheckinResult.registration.checkedInAt && (
                          <div className="flex justify-between">
                            <span className="font-semibold opacity-70">Horário Check-in:</span>
                            <span>
                              {new Date(lastCheckinResult.registration.checkedInAt).toLocaleTimeString(
                                'pt-BR'
                              )}
                            </span>
                          </div>
                        )}

                        {/* Quick Badge / Certificate actions */}
                        <div className="pt-3 mt-2 border-t border-black/10 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setCertModalAttendee(lastCheckinResult.registration!);
                              setCertModalView('badge');
                            }}
                            className="flex-1 py-1.5 px-2.5 bg-white text-indigo-700 font-bold rounded-lg border border-indigo-200 shadow-xs hover:bg-indigo-50 flex items-center justify-center gap-1.5 text-xs transition-colors"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            Mini Crachá
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setCertModalAttendee(lastCheckinResult.registration!);
                              setCertModalView('certificate');
                            }}
                            className="flex-1 py-1.5 px-2.5 bg-indigo-600 text-white font-bold rounded-lg shadow-xs hover:bg-indigo-700 flex items-center justify-center gap-1.5 text-xs transition-colors"
                          >
                            <Award className="w-3.5 h-3.5" />
                            Certificado PDF
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-40 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-200 rounded-2xl text-slate-400">
                <UserCheck className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-xs font-medium">Aguardando leitura de QR Code...</p>
                <p className="text-[11px] opacity-70">Aponte o crachá ou digite o código ao lado.</p>
              </div>
            )}
          </div>

          {/* Recent Check-ins Stream */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Últimos Credenciados</h3>
              <span className="text-[11px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full font-bold">
                {recentCheckins.length} registros
              </span>
            </div>

            <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1">
              {recentCheckins.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">
                  Nenhum participante credenciado nesta sessão ainda.
                </p>
              ) : (
                recentCheckins.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-800 block">{item.name}</span>
                      <span className="text-[11px] font-mono text-slate-400">{item.code}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded block">
                          {item.checkedInAt
                            ? new Date(item.checkedInAt).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'Hoje'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setCertModalAttendee(item);
                          setCertModalView('badge');
                        }}
                        title="Ver Crachá / Certificado"
                        className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Certificate / Mini Badge Modal */}
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
