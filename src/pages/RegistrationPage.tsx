import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Ticket,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Building2,
  FileText,
  ShieldCheck,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
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
  const { event, loading, refreshEvent } = useEvent();
  const activeEvent = event || defaultEventData;
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    birthDate: '',
    age: '',
    bringingGuests: false,
    guestsCount: 1,
    guestsNames: '',
    city: '',
    state: 'SP',
    organization: '',
    ticketType: activeEvent.ticketTypes[0]?.id || 'jovem-iepc',
    notes: '',
    termsAccepted: false,
  });

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

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Sync ticketType whenever event finishes loading
  useEffect(() => {
    if (activeEvent?.ticketTypes && activeEvent.ticketTypes.length > 0) {
      setFormData(prev => {
        const hasMatch = activeEvent.ticketTypes.some(t => t.id === prev.ticketType);
        if (!hasMatch) {
          return { ...prev, ticketType: activeEvent.ticketTypes[0].id };
        }
        return prev;
      });
    }
  }, [activeEvent]);

  const isClosed = !activeEvent.isRegistrationOpen || activeEvent.isCapacityFull;

  // Phone auto mask helper (optional field)
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

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!formData.name.trim() || formData.name.trim().length < 3) {
      errs.name = 'Nome completo é obrigatório (mínimo 3 letras).';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      errs.email = 'Informe um e-mail válido para receber o comprovante.';
    }

    // Phone / WhatsApp is strictly optional as requested by the user

    if (!formData.birthDate) {
      errs.birthDate = 'Data de nascimento é obrigatória.';
    }

    if (!formData.city.trim()) {
      errs.city = 'Informe sua cidade.';
    }

    if (!formData.state) {
      errs.state = 'Selecione o estado.';
    }

    if (!formData.ticketType) {
      errs.ticketType = 'Selecione a categoria de inscrição.';
    }

    if (!formData.termsAccepted) {
      errs.termsAccepted = 'Você deve concordar com os termos de participação.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (isClosed) {
      showToast('As inscrições estão encerradas para este evento.', 'error');
      return;
    }

    if (!validate()) {
      showToast('Por favor, corrija os erros no formulário antes de continuar.', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.submitRegistration(formData);
      showToast('Inscrição realizada com sucesso!', 'success');
      refreshEvent();
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
            As inscrições para a <strong>{event?.name || 'Conferência de Jovens IEPC'}</strong> atingiram o limite máximo de participantes ou foram finalizadas pela coordenação.
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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      {/* Back button */}
      <button
        type="button"
        onClick={() => onNavigate('/')}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para a página inicial
      </button>

      {/* Header Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-xl">
        <div className="space-y-2 border-b border-slate-100 pb-6 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold">
            <Ticket className="w-3.5 h-3.5" />
            Inscrição Oficial - Jovens IEPC
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Formulário de Inscrição dos Jovens
          </h1>
          <p className="text-sm text-slate-600">
            Garanta sua vaga na <strong>{event?.name || 'Conferência de Jovens IEPC 2026'}</strong>. Inscrição 100% gratuita! Seu mini crachá e QR Code de entrada são gerados imediatamente.
          </p>
        </div>

        {serverError && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block">Atenção ao realizar inscrição:</strong>
              {serverError}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section: Dados Pessoais */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              1. Dados do Jovem / Participante
            </h3>

            {/* Nome Completo */}
            <div>
              <label htmlFor="name" className="block text-xs font-semibold text-slate-700 mb-1">
                Nome Completo *
              </label>
              <div className="relative">
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: '' });
                  }}
                  placeholder="Ex: Gabriel Santos Oliveira"
                  className={`w-full pl-10 pr-4 py-3 text-sm rounded-xl border bg-slate-50/50 focus:bg-white transition-all outline-hidden ${
                    errors.name ? 'border-rose-400 focus:ring-2 focus:ring-rose-200' : 'border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                  }`}
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
              {errors.name && <p className="text-xs text-rose-600 mt-1">{errors.name}</p>}
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-1">
                  E-mail *
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (errors.email) setErrors({ ...errors, email: '' });
                    }}
                    placeholder="seu.email@exemplo.com"
                    className={`w-full pl-10 pr-4 py-3 text-sm rounded-xl border bg-slate-50/50 focus:bg-white transition-all outline-hidden ${
                      errors.email ? 'border-rose-400 focus:ring-2 focus:ring-rose-200' : 'border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                    }`}
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                </div>
                {errors.email && <p className="text-xs text-rose-600 mt-1">{errors.email}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="phone" className="block text-xs font-semibold text-slate-700">
                    Telefone de Contato (Opcional)
                  </label>
                  <span className="text-[11px] text-slate-400">WhatsApp não obrigatório</span>
                </div>
                <div className="relative">
                  <input
                    id="phone"
                    type="text"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    placeholder="(Opcional) Ex: (11) 98765-4321"
                    className={`w-full pl-10 pr-4 py-3 text-sm rounded-xl border bg-slate-50/50 focus:bg-white transition-all outline-hidden ${
                      errors.phone ? 'border-rose-400 focus:ring-2 focus:ring-rose-200' : 'border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                    }`}
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                </div>
                {errors.phone && <p className="text-xs text-rose-600 mt-1">{errors.phone}</p>}
              </div>
            </div>

            {/* BirthDate, Age & Organization */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="birthDate" className="block text-xs font-semibold text-slate-700 mb-1">
                  Data de Nascimento *
                </label>
                <div className="relative">
                  <input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => {
                      const val = e.target.value;
                      let calculatedAge = formData.age;
                      if (val) {
                        const birth = new Date(val);
                        if (!isNaN(birth.getTime())) {
                          const now = new Date();
                          let diff = now.getFullYear() - birth.getFullYear();
                          const m = now.getMonth() - birth.getMonth();
                          if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) diff--;
                          if (diff > 0) calculatedAge = String(diff);
                        }
                      }
                      setFormData({ ...formData, birthDate: val, age: calculatedAge });
                      if (errors.birthDate) setErrors({ ...errors, birthDate: '' });
                    }}
                    className={`w-full pl-10 pr-4 py-3 text-sm rounded-xl border bg-slate-50/50 focus:bg-white transition-all outline-hidden ${
                      errors.birthDate ? 'border-rose-400 focus:ring-2 focus:ring-rose-200' : 'border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                    }`}
                  />
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                </div>
                {errors.birthDate && <p className="text-xs text-rose-600 mt-1">{errors.birthDate}</p>}
              </div>

              <div>
                <label htmlFor="age" className="block text-xs font-semibold text-slate-700 mb-1">
                  Idade (Anos)
                </label>
                <input
                  id="age"
                  type="number"
                  min="5"
                  max="120"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  placeholder="Ex: 19"
                  className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-hidden font-semibold text-slate-800"
                />
              </div>

              <div>
                <label htmlFor="organization" className="block text-xs font-semibold text-slate-700 mb-1">
                  Congregação / Igreja (Opcional)
                </label>
                <div className="relative">
                  <input
                    id="organization"
                    type="text"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    placeholder="Ex: IEPC Templo Sede"
                    className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-hidden"
                  />
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Acompanhantes / Convidados */}
            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Quem você irá levar? (Amigos e Convidados)
                </span>
                <span className="text-[11px] font-medium text-indigo-600">Traga amigos para o evento!</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label htmlFor="guestsCount" className="block text-xs font-semibold text-slate-700 mb-1">
                    Quantas pessoas vai levar?
                  </label>
                  <input
                    id="guestsCount"
                    type="number"
                    min="0"
                    max="50"
                    value={formData.guestsCount}
                    onChange={(e) => {
                      const count = Math.max(0, parseInt(e.target.value, 10) || 0);
                      setFormData({ ...formData, guestsCount: count, bringingGuests: count > 0 });
                    }}
                    placeholder="0"
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-hidden font-bold text-slate-800"
                  />
                  <p className="text-[11px] text-slate-400 mt-0.5">0 se for apenas você</p>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="guestsNames" className="block text-xs font-semibold text-slate-700 mb-1">
                    Quem irá levar? (Nome dos convidados)
                  </label>
                  <input
                    id="guestsNames"
                    type="text"
                    value={formData.guestsNames}
                    onChange={(e) => setFormData({ ...formData, guestsNames: e.target.value })}
                    placeholder="Ex: Matheus Lima, Lucas Pereira e Daniel..."
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-hidden"
                  />
                  <p className="text-[11px] text-slate-400 mt-0.5">Separe os nomes por vírgula se for mais de um</p>
                </div>
              </div>
            </div>

            {/* City and State */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label htmlFor="city" className="block text-xs font-semibold text-slate-700 mb-1">
                  Cidade *
                </label>
                <div className="relative">
                  <input
                    id="city"
                    type="text"
                    value={formData.city}
                    onChange={(e) => {
                      setFormData({ ...formData, city: e.target.value });
                      if (errors.city) setErrors({ ...errors, city: '' });
                    }}
                    placeholder="Ex: São Paulo"
                    className={`w-full pl-10 pr-4 py-3 text-sm rounded-xl border bg-slate-50/50 focus:bg-white transition-all outline-hidden ${
                      errors.city ? 'border-rose-400 focus:ring-2 focus:ring-rose-200' : 'border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                    }`}
                  />
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                </div>
                {errors.city && <p className="text-xs text-rose-600 mt-1">{errors.city}</p>}
              </div>

              <div>
                <label htmlFor="state" className="block text-xs font-semibold text-slate-700 mb-1">
                  Estado (UF) *
                </label>
                <select
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-3 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-hidden font-medium"
                >
                  {BRAZILIAN_STATES.map((uf) => (
                    <option key={uf} value={uf}>
                      {uf}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section: Categoria de Inscrição */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              2. Categoria de Inscrição *
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeEvent.ticketTypes.map((ticket) => {
                const isSelected = formData.ticketType === ticket.id;
                return (
                  <label
                    key={ticket.id}
                    className={`cursor-pointer p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="ticketType"
                          value={ticket.id}
                          checked={isSelected}
                          onChange={() => setFormData({ ...formData, ticketType: ticket.id })}
                          className="text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm font-bold text-slate-900">{ticket.name}</span>
                      </div>
                      <p className="text-xs text-slate-500 pl-5 leading-relaxed">{ticket.description}</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md shrink-0">
                      {ticket.price === 0 ? 'Grátis' : `R$ ${ticket.price}`}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Section: Observações */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <label htmlFor="notes" className="block text-xs font-semibold text-slate-700">
              Observações ou Necessidades Especiais (Opcional)
            </label>
            <textarea
              id="notes"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Ex: Necessidade de intérprete de Libras, acessibilidade motora, restrições alimentares..."
              className="w-full p-3.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-hidden resize-none"
            />
          </div>

          {/* Section: LGPD & Termos */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-600 leading-relaxed space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                Consentimento e Proteção de Dados (LGPD)
              </div>
              <p>
                Os dados fornecidos serão armazenados em ambiente protegido e utilizados exclusivamente pela organização para emissão da credencial, controle de acesso, envio de orientações do evento e certificado oficial.
              </p>
            </div>

            <label className="flex items-start gap-3 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={formData.termsAccepted}
                onChange={(e) => {
                  setFormData({ ...formData, termsAccepted: e.target.checked });
                  if (errors.termsAccepted) setErrors({ ...errors, termsAccepted: '' });
                }}
                className="mt-1 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <span className="text-xs text-slate-700 leading-relaxed">
                Declaro que li e concordo com os{' '}
                <button
                  type="button"
                  onClick={() => onNavigate('/termos')}
                  className="text-indigo-600 font-semibold hover:underline"
                >
                  Termos do Evento
                </button>{' '}
                e com a{' '}
                <button
                  type="button"
                  onClick={() => onNavigate('/privacidade')}
                  className="text-indigo-600 font-semibold hover:underline"
                >
                  Política de Privacidade
                </button>
                . *
              </span>
            </label>
            {errors.termsAccepted && (
              <p className="text-xs text-rose-600 font-medium">{errors.termsAccepted}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-2xl text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-600/25 hover:shadow-indigo-600/35 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Processando inscrição...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Confirmar e Gerar Credencial
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
