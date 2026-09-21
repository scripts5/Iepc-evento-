import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Calendar,
  Clock,
  MapPin,
  Ticket,
  CheckCircle2,
  Users,
  Sparkles,
  ChevronDown,
  ArrowRight,
  AlertCircle,
  HelpCircle,
  MessageCircle,
  Mail,
  ShieldCheck,
  Building2,
  Info
} from 'lucide-react';
import { useEvent } from '../context/EventContext.tsx';

interface HomePageProps {
  onNavigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { event, loading } = useEvent();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-500">Carregando informações do evento...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
        <h2 className="text-xl font-bold text-slate-900">Evento temporariamente indisponível</h2>
        <p className="text-sm text-slate-500 max-w-md mt-1">
          Não foi possível carregar as informações do evento. Por favor, tente novamente mais tarde.
        </p>
      </div>
    );
  }

  const isClosed = !event.isRegistrationOpen || event.isCapacityFull;
  const registeredCount = event.registeredCount || 0;
  const maxCap = event.maxCapacity || 500;
  const pctFilled = Math.min(100, Math.round((registeredCount / maxCap) * 100));

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Mês de Novembro / 2026 (Dia a definir)';
    if (dateStr.includes('2026-11')) {
      return 'Mês de Novembro / 2026 (Dia a definir)';
    }
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  return (
    <div className="space-y-24 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-200/80 bg-gradient-to-b from-white via-indigo-50/30 to-slate-50">
        {/* Ambient Glows */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-0 w-80 h-80 bg-violet-200/30 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-7 space-y-6"
            >
              {/* Event Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-xs font-bold text-indigo-700 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Inscrições Oficiais Abertas • Edição Presencial</span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
                {event.name}
              </h1>

              {/* Tagline */}
              <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-normal">
                {event.tagline}
              </p>

              {/* Event Key Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                  <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Data
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-800">
                      {formatDate(event.startDate)}
                      {event.endDate && event.endDate !== event.startDate ? ` a ${formatDate(event.endDate)}` : ''}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                  <div className="p-2.5 rounded-xl bg-violet-50 text-violet-600 shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Horário
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-800">
                      {event.time}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Local
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-800 truncate block" title={event.locationName}>
                      {event.locationName}
                    </span>
                  </div>
                </div>
              </div>

              {/* Capacity Progress Bar */}
              <div className="bg-white/80 backdrop-blur-xs p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <Users className="w-4 h-4 text-indigo-600" />
                    Lotação do Auditório:
                  </span>
                  <span className={pctFilled >= 90 ? 'text-amber-600 font-bold' : 'text-slate-600'}>
                    {registeredCount} de {maxCap} vagas ({pctFilled}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      pctFilled >= 100
                        ? 'bg-rose-500'
                        : pctFilled >= 80
                        ? 'bg-amber-500'
                        : 'bg-indigo-600'
                    }`}
                    style={{ width: `${pctFilled}%` }}
                  />
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                {isClosed ? (
                  <div className="px-6 py-3.5 rounded-2xl bg-slate-200 text-slate-600 font-bold text-base flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-slate-500" />
                    Inscrições Encerradas
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => onNavigate('/inscricao')}
                    className="px-8 py-4 rounded-2xl text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-3"
                  >
                    <Ticket className="w-5 h-5" />
                    Garantir Minha Vaga
                    <ArrowRight className="w-5 h-5" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onNavigate('/consultar-inscricao')}
                  className="px-6 py-4 rounded-2xl text-base font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300/90 shadow-xs hover:border-slate-400 transition-all flex items-center gap-2.5"
                >
                  <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                  Já estou inscrito
                </button>
              </div>
            </motion.div>

            {/* Right Card / Visual Banner */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-5"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 bg-slate-900 group">
                <img
                  src={event.bannerUrl}
                  alt={event.name}
                  className="w-full h-80 sm:h-96 object-cover opacity-85 group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-6 sm:p-8 flex flex-col justify-end text-white">
                  <span className="text-xs font-bold uppercase tracking-widest text-indigo-300">
                    Credenciamento Digital
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold mt-1 text-white">
                    Check-in Ágil com QR Code
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                    Sem filas e burocracia. Receba seu voucher com QR Code no smartphone imediatamente após a inscrição e retire seu crachá em segundos.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. SOBRE O EVENTO & INFORMAÇÕES IMPORTANTES */}
      <section id="sobre" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-widest">
              Sobre o Encontro
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Uma experiência imersiva e transformadora
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              {event.description}
            </p>

            {/* Ticket Types Cards */}
            <div className="pt-4 space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Categorias de Inscrição Disponíveis
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {event.ticketTypes.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-indigo-300 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-slate-900">{ticket.name}</span>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {ticket.price === 0 ? 'Gratuito' : `R$ ${ticket.price}`}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                      {ticket.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Important Information Box */}
          <div id="informacoes" className="lg:col-span-5">
            <div className="bg-amber-50/80 border border-amber-200/90 rounded-3xl p-6 sm:p-7 space-y-4 shadow-xs">
              <div className="flex items-center gap-3 text-amber-900">
                <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700 shrink-0">
                  <Info className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold">Informações Importantes</h3>
              </div>

              <div className="text-xs sm:text-sm text-amber-900/90 leading-relaxed whitespace-pre-line space-y-3">
                <p>{event.importantInfo}</p>
                <div className="pt-3 border-t border-amber-200/80 space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Apresentação de documento com foto obrigatória</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Certificado de 16h após confirmação do check-in</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Ambiente com acessibilidade e rampas de acesso</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PROGRAMAÇÃO / CRONOGRAMA */}
      <section id="programacao" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
            Cronograma Oficial
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Programação do Evento
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Confira as palestras, painéis temáticos e intervalos programados para os dias do evento.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {event.schedule.map((item, index) => (
            <div
              key={item.id || index}
              className="bg-white border border-slate-200/80 hover:border-indigo-300 rounded-2xl p-5 sm:p-6 transition-all shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6"
            >
              <div className="shrink-0">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                  <Clock className="w-3.5 h-3.5" />
                  {item.time}
                </span>
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {item.title}
                </h3>
                {item.speaker && (
                  <p className="text-xs font-semibold text-indigo-600">
                    {item.speaker}
                  </p>
                )}
                {item.description && (
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>

              {item.location && (
                <div className="shrink-0 text-xs font-medium text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                  {item.location}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 4. PERGUNTAS FREQUENTES (FAQ) */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-10">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
            Tire Suas Dúvidas
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Perguntas Frequentes
          </h2>
          <p className="text-sm text-slate-600">
            Respostas para as principais dúvidas sobre inscrições, credenciamento e certificado.
          </p>
        </div>

        <div className="space-y-3">
          {(event.faq || event.faqs || []).map((item, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={item.id || index}
                className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-slate-900 text-sm sm:text-base hover:text-indigo-600 transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-indigo-500 shrink-0" />
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-indigo-600' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. CONTATO & LOCALIZAÇÃO */}
      <section id="contato" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
                Fale com a Organização
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Estamos à disposição para ajudar você
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Precisa de suporte com sua inscrição, solicitação de acessibilidade especial ou dúvidas sobre caravanas? Entre em contato pelos nossos canais oficiais.
              </p>

              <div className="space-y-3 text-sm">
                {event.contact.email && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-slate-800 text-indigo-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <span>{event.contact.email}</span>
                  </div>
                )}
                {event.contact.phone && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-slate-800 text-indigo-400">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <span>Telefone da Igreja: {event.contact.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-slate-800 text-indigo-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span>{event.locationAddress}</span>
                </div>
              </div>
            </div>

            {/* Quick Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/15 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-600 rounded-xl text-white">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{event.locationName}</h3>
                  <p className="text-xs text-slate-300">Local de realização oficial</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                O local conta com estacionamento, praça de alimentação, estações de recarga de celular e fácil acesso por metrô e transporte público.
              </p>
              <div className="pt-2">
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(event.locationAddress || event.locationName || 'Evento')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  <MapPin className="w-4 h-4 text-indigo-600" />
                  Abrir no Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. BOTTOM BANNER */}
      {!isClosed && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-3xl p-8 sm:p-10 text-white shadow-xl space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold">
              Não deixe para a última hora. Vagas limitadas!
            </h2>
            <p className="text-sm text-indigo-100 max-w-xl mx-auto">
              Garanta sua credencial oficial antecipada para agilizar sua entrada no dia do evento.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => onNavigate('/inscricao')}
                className="px-8 py-3.5 rounded-2xl text-sm font-bold bg-white text-indigo-700 hover:bg-indigo-50 shadow-lg transition-transform hover:scale-105 active:scale-100"
              >
                Preencher Formulário de Inscrição
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
