import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Building2,
  FileText,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Lock,
  Sparkles,
  Ticket,
  ChevronRight,
} from 'lucide-react';
import { useEvent } from '../context/EventContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { api } from '../services/api.ts';
import { Registration } from '../types/index.ts';
import { defaultEventData } from '../data/defaultEvent.ts';

interface RegistrationPageProps {
  onNavigate: (path: string) => void;
  onSuccess: (reg: Registration) => void;
}

const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

export const RegistrationPage: React.FC<RegistrationPageProps> = ({ onNavigate, onSuccess }) => {
  const { event, refreshEvent } = useEvent();
  const activeEvent = event || defaultEventData;
  const { showToast } = useToast();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    birthDate: '',
    age: '',
    city: '',
    state: 'SP',
    organization: '',
    ticketType: '',
    notes: '',
    termsAccepted: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const isClosed = !activeEvent.isRegistrationOpen || activeEvent.isCapacityFull;

  const calculateAge = (dateStr: string) => {
    if (!dateStr) return '';
    const birth = new Date(dateStr);
    if (isNaN(birth.getTime())) return '';
    const now = new Date();
    let diff = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
      diff--;
    }
    return diff >= 0 ? diff.toString() : '';
  };

  // Phone auto mask (optional WhatsApp/Phone)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 11) val = val.substring(0, 11);

    let formatted = val;
    if (val.length > 6) {
      formatted = `(${val.substring(0, 2)}) ${val.substring(2, 7)}-${val.substring(7)}`;
    } else if (val.length > 2) {
      formatted = `(${val.substring(0, 2)}) ${val.substring(2)}`;
    } else if (val.length > 0) {
      formatted = `(${val}`;
    }

    setFormData((prev) => ({ ...prev, phone: formatted }));
    if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
  };

  const validateStep1 = (): boolean => {
    const errs: Record<string, string> = {};

    if (!formData.name.trim() || formData.name.trim().length < 3) {
      errs.name = 'Nome completo é obrigatório (mínimo 3 letras).';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      errs.email = 'Informe um e-mail válido para receber seu comprovante e credencial.';
    }

    if (!formData.birthDate) {
      errs.birthDate = 'Data de nascimento é obrigatória.';
    }

    if (!formData.city.trim()) {
      errs.city = 'Informe sua cidade.';
    }

    if (!formData.state) {
      errs.state = 'Selecione o estado (UF).';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = (): boolean => {
    const errs: Record<string, string> = {};

    if (!formData.ticketType || !formData.ticketType.trim()) {
      errs.ticketType = 'Por favor, escreva qual é a sua denominação ou igreja.';
    }

    if (!formData.termsAccepted) {
      errs.termsAccepted = 'Você deve concordar com os termos de participação no evento.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (step === 1) {
      if (validateStep1()) {
        setStep(2);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        showToast('Por favor, preencha os dados pessoais corretamente.', 'warning');
      }
    } else if (step === 2) {
      if (validateStep2()) {
        setStep(3);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        showToast('Por favor, aceite os termos e confirme sua denominação.', 'warning');
      }
    }
  };

  const handleFinalSubmit = async () => {
    setServerError(null);

    if (isClosed) {
      showToast('As inscrições estão encerradas para este evento.', 'error');
      return;
    }

    if (!validateStep1() || !validateStep2()) {
      showToast('Existem campos pendentes no cadastro.', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.submitRegistration({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        birthDate: formData.birthDate,
        age: formData.age ? Number(formData.age) : undefined,
        city: formData.city.trim(),
        state: formData.state.trim().toUpperCase(),
        organization: formData.organization.trim() || undefined,
        ticketType: formData.ticketType.trim(),
        notes: formData.notes.trim() || undefined,
        termsAccepted: true,
      });

      showToast('Inscrição confirmada com sucesso!', 'success');
      await refreshEvent();
      onSuccess(res.registration);
      onNavigate('/inscricao/sucesso');
    } catch (err: any) {
      setServerError(err.message || 'Erro ao realizar inscrição.');
      showToast(err.message || 'Erro ao realizar inscrição.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (isClosed) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-xl space-y-6">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Inscrições Encerradas</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            As inscrições para o <strong>{activeEvent.name}</strong> atingiram a capacidade máxima ou foram finalizadas pela coordenação.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('/consultar-inscricao')}
              className="px-6 py-3 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Consultar Minha Inscrição
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="px-6 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Voltar ao Início
            </button>
          </div>
        </div>
      </div>
    );
  }

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

      {/* Main Multi-step Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-xl space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">
              Inscrição Gratuita • Confirmação Automática
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Etapa {step} de 4
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Ficha de Inscrição Oficial
          </h1>
          <p className="text-sm text-slate-600">
            Preencha seus dados para garantir sua vaga e seu Mini Crachá oficial com QR Code.
          </p>
        </div>

        {/* Step Progress Indicator: Dados pessoais → informações → revisão → confirmação */}
        <div className="grid grid-cols-4 gap-2 pt-2">
          <div className="space-y-1.5">
            <div className={`h-2 rounded-full transition-all ${
              step >= 1 ? 'bg-indigo-600' : 'bg-slate-200'
            }`} />
            <span className={`text-[11px] font-bold block ${
              step === 1 ? 'text-indigo-600' : 'text-slate-400'
            }`}>
              1. Dados Pessoais
            </span>
          </div>

          <div className="space-y-1.5">
            <div className={`h-2 rounded-full transition-all ${
              step >= 2 ? 'bg-indigo-600' : 'bg-slate-200'
            }`} />
            <span className={`text-[11px] font-bold block ${
              step === 2 ? 'text-indigo-600' : 'text-slate-400'
            }`}>
              2. Informações
            </span>
          </div>

          <div className="space-y-1.5">
            <div className={`h-2 rounded-full transition-all ${
              step >= 3 ? 'bg-indigo-600' : 'bg-slate-200'
            }`} />
            <span className={`text-[11px] font-bold block ${
              step === 3 ? 'text-indigo-600' : 'text-slate-400'
            }`}>
              3. Revisão
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="h-2 rounded-full transition-all bg-slate-200" />
            <span className="text-[11px] font-bold block text-slate-400">
              4. Confirmação
            </span>
          </div>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block">Não foi possível concluir a inscrição:</strong>
              {serverError}
            </div>
          </div>
        )}

        {/* Step 1: Dados Pessoais */}
        {step === 1 && (
          <motion.form
            key="step1"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            onSubmit={handleNextStep}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Nome Completo *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (errors.name) setErrors({ ...errors, name: '' });
                    }}
                    placeholder="Digite seu nome completo"
                    className={`w-full pl-10 pr-4 py-3 text-sm rounded-xl border ${
                      errors.name ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                    } outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all`}
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                </div>
                {errors.name && <p className="text-xs text-rose-600 font-medium">{errors.name}</p>}
              </div>

              {/* Email / Gmail */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  E-mail ou Gmail *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (errors.email) setErrors({ ...errors, email: '' });
                    }}
                    placeholder="seu.email@gmail.com"
                    className={`w-full pl-10 pr-4 py-3 text-sm rounded-xl border ${
                      errors.email ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                    } outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all`}
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                </div>
                <p className="text-[11px] text-slate-400">
                  Você receberá seu comprovante oficial e QR Code neste endereço.
                </p>
                {errors.email && <p className="text-xs text-rose-600 font-medium">{errors.email}</p>}
              </div>

              {/* BirthDate */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Data de Nascimento *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => {
                      const bDate = e.target.value;
                      const ageCalculated = calculateAge(bDate);
                      setFormData({
                        ...formData,
                        birthDate: bDate,
                        age: ageCalculated,
                      });
                      if (errors.birthDate) setErrors({ ...errors, birthDate: '' });
                    }}
                    className={`w-full pl-10 pr-4 py-3 text-sm rounded-xl border ${
                      errors.birthDate ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                    } outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all`}
                  />
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                </div>
                {errors.birthDate && <p className="text-xs text-rose-600 font-medium">{errors.birthDate}</p>}
              </div>

              {/* Phone / WhatsApp (Optional) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    WhatsApp / Telefone
                  </label>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">Opcional</span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    placeholder="(11) 99999-9999"
                    className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-slate-200 outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>

              {/* City */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Cidade *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => {
                      setFormData({ ...formData, city: e.target.value });
                      if (errors.city) setErrors({ ...errors, city: '' });
                    }}
                    placeholder="Sua cidade"
                    className={`w-full pl-10 pr-4 py-3 text-sm rounded-xl border ${
                      errors.city ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                    } outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all`}
                  />
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                </div>
                {errors.city && <p className="text-xs text-rose-600 font-medium">{errors.city}</p>}
              </div>

              {/* State */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Estado (UF) *
                </label>
                <select
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all bg-white"
                >
                  {BRAZILIAN_STATES.map((uf) => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end">
              <button
                type="submit"
                className="px-6 py-3.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Avançar para Informações</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.form>
        )}

        {/* Step 2: Informações */}
        {step === 2 && (
          <motion.form
            key="step2"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            onSubmit={handleNextStep}
            className="space-y-6"
          >
            {/* Denomination / Church input box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Denominação / Igreja que congrega *
                </label>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  100% Gratuito
                </span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={formData.ticketType}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({ ...formData, ticketType: val, organization: val });
                    if (errors.ticketType) setErrors({ ...errors, ticketType: '' });
                  }}
                  placeholder="Escreva qual é a sua denominação ou congregação (ex: IEPC, Batista, Assembleia de Deus, Visitante...)"
                  className={`w-full pl-10 pr-4 py-3 text-sm rounded-xl border ${
                    errors.ticketType ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                  } outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all bg-white`}
                />
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
              {errors.ticketType && <p className="text-xs text-rose-600 font-medium">{errors.ticketType}</p>}

              {/* Sugestões rápidas para facilitar o preenchimento com 1 clique */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] text-slate-400 font-medium">Exemplos rápidos:</span>
                {['IEPC (Templo Sede)', 'IEPC (Congregação)', 'Assembleia de Deus', 'Batista', 'Presbiteriana', 'Visitante'].map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, ticketType: sug, organization: sug });
                      if (errors.ticketType) setErrors({ ...errors, ticketType: '' });
                    }}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                      formData.ticketType === sug
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-semibold'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                    }`}
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes / Special Requests */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Observações ou Pedido de Oração
                </label>
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Opcional</span>
              </div>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Ex: Pedido de oração pela família, necessidade de acessibilidade..."
                className="w-full p-3 text-sm rounded-xl border border-slate-200 outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all resize-none"
              />
            </div>

            {/* Terms of Service Acceptance */}
            <div className={`p-4 rounded-2xl border ${
              errors.termsAccepted ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 bg-slate-50/50'
            }`}>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.termsAccepted}
                  onChange={(e) => {
                    setFormData({ ...formData, termsAccepted: e.target.checked });
                    if (errors.termsAccepted) setErrors({ ...errors, termsAccepted: '' });
                  }}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 mt-1 cursor-pointer"
                />
                <div className="text-xs text-slate-600 space-y-1 leading-relaxed">
                  <span className="font-bold text-slate-800 block">
                    Aceite dos Termos de Participação & Privacidade *
                  </span>
                  <p>
                    Concordo em participar do Encontro de Jovens da IEPC, autorizo o envio do comprovante digital para meu e-mail e declaro que os dados fornecidos são verdadeiros. Minha inscrição será automaticamente confirmada no sistema.
                  </p>
                </div>
              </label>
              {errors.termsAccepted && (
                <p className="text-xs text-rose-600 font-medium mt-2">{errors.termsAccepted}</p>
              )}
            </div>

            <div className="pt-4 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Voltar
              </button>

              <button
                type="submit"
                className="px-6 py-3.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Avançar para Revisão</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.form>
        )}

        {/* Step 3: Revisão & Confirmação */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-6"
          >
            <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-3">
              <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                <span>Confira os dados antes de finalizar:</span>
              </div>
              <p className="text-xs text-indigo-800/90 leading-relaxed">
                Todas as inscrições são <strong>automaticamente confirmadas</strong> e salvas no banco de dados oficial da IEPC. Não há aprovação manual do ADM.
              </p>
            </div>

            {/* Review Card */}
            <div className="rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100 text-xs sm:text-sm">
              <div className="p-4 bg-slate-50 flex items-center justify-between font-semibold">
                <span className="text-slate-500">Evento:</span>
                <span className="text-slate-900 font-bold">{activeEvent.name}</span>
              </div>

              <div className="p-4 flex items-center justify-between">
                <span className="text-slate-500">Nome:</span>
                <span className="font-bold text-slate-900">{formData.name}</span>
              </div>

              <div className="p-4 flex items-center justify-between">
                <span className="text-slate-500">Gmail / E-mail:</span>
                <span className="font-semibold text-slate-800">{formData.email}</span>
              </div>

              <div className="p-4 flex items-center justify-between">
                <span className="text-slate-500">Data de Nascimento:</span>
                <span className="text-slate-800">
                  {formData.birthDate ? formData.birthDate.split('-').reverse().join('/') : ''}
                  {formData.age ? ` (${formData.age} anos)` : ''}
                </span>
              </div>

              <div className="p-4 flex items-center justify-between">
                <span className="text-slate-500">Cidade / UF:</span>
                <span className="text-slate-800">{formData.city} - {formData.state}</span>
              </div>

              <div className="p-4 flex items-center justify-between">
                <span className="text-slate-500">Telefone:</span>
                <span className="text-slate-800">{formData.phone || 'Não informado'}</span>
              </div>

              <div className="p-4 flex items-center justify-between">
                <span className="text-slate-500">Denominação / Igreja:</span>
                <span className="font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full text-xs">
                  {formData.ticketType || 'IEPC'}
                </span>
              </div>

              <div className="p-4 flex items-center justify-between">
                <span className="text-slate-500">Status após envio:</span>
                <span className="font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full text-xs">
                  Confirmado Automaticamente
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 flex items-center justify-between gap-3">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setStep(2)}
                className="px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                Voltar e Corrigir
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={handleFinalSubmit}
                className="px-8 py-3.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Salvando no Banco & Confirmando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Concluir e Confirmar Inscrição</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
