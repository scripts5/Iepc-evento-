import React, { useState } from 'react';
import {
  Settings,
  Save,
  CheckCircle2,
  Calendar,
  MapPin,
  Users,
  Image as ImageIcon,
  Mail,
  Phone,
  Globe,
  Instagram,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { useEvent } from '../context/EventContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { api } from '../services/api.ts';
import { EventConfig } from '../types/index.ts';

export const AdminSettingsPage: React.FC = () => {
  const { event, updateEvent } = useEvent();
  const { showToast } = useToast();

  const [formData, setFormData] = useState<EventConfig>(
    event || {
      id: 'default-event',
      name: '',
      slogan: '',
      description: '',
      startDate: '',
      endDate: '',
      timeSchedule: '',
      locationName: '',
      address: '',
      city: '',
      state: 'SP',
      bannerUrl: '',
      logoUrl: '',
      maxCapacity: 500,
      isRegistrationOpen: true,
      ticketTypes: [],
      schedule: [],
      faqs: [],
      contact: {
        email: '',
        phone: '',
      },
    }
  );

  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (event) {
      setFormData(event);
    }
  }, [event]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateEvent({
        ...formData,
        tagline: formData.tagline || formData.slogan || '',
        slogan: formData.slogan || formData.tagline || '',
        time: formData.time || formData.timeSchedule || '',
        timeSchedule: formData.timeSchedule || formData.time || '',
        locationAddress: formData.locationAddress || formData.address || '',
        address: formData.address || formData.locationAddress || '',
      });
      showToast('Configurações do evento atualizadas com sucesso!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Erro ao salvar configurações.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Configurações do Evento
        </h2>
        <p className="text-xs text-slate-500">
          Personalize as informações públicas exibidas na landing page e os limites de credenciamento.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Registration Availability Status Box */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-sm font-bold text-slate-900 block">Status das Inscrições</span>
            <p className="text-xs text-slate-500">
              Controle se o público em geral pode se inscrever no formulário.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setFormData({ ...formData, isRegistrationOpen: !formData.isRegistrationOpen })
            }
            className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ${
              formData.isRegistrationOpen
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-600/20'
                : 'bg-rose-600 text-white hover:bg-rose-700 shadow-sm shadow-rose-600/20'
            }`}
          >
            {formData.isRegistrationOpen ? (
              <>
                <ToggleRight className="w-4 h-4" />
                Inscrições ABERTAS
              </>
            ) : (
              <>
                <ToggleLeft className="w-4 h-4" />
                Inscrições ENCERRADAS
              </>
            )}
          </button>
        </div>

        {/* General Details */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            Informações Gerais
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Nome do Evento *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-hidden focus:border-indigo-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Slogan / Chamada Principal</label>
              <input
                type="text"
                value={formData.tagline || formData.slogan || ''}
                onChange={(e) => setFormData({ ...formData, slogan: e.target.value, tagline: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-hidden focus:border-indigo-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Descrição Completa</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-3 rounded-xl border border-slate-200 text-sm outline-hidden focus:border-indigo-500 resize-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Informações Importantes (Avisos de gratuidade, bíblia, etc.)</label>
              <textarea
                rows={2}
                value={formData.importantInfo || ''}
                onChange={(e) => setFormData({ ...formData, importantInfo: e.target.value })}
                placeholder="Ex: Inscrições 100% gratuitas! Não é necessário ter WhatsApp para se inscrever..."
                className="w-full p-3 rounded-xl border border-slate-200 text-sm outline-hidden focus:border-indigo-500 resize-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Capacidade Máxima de Pessoas</label>
              <input
                type="number"
                value={formData.maxCapacity}
                onChange={(e) => setFormData({ ...formData, maxCapacity: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">URL da Imagem de Banner</label>
              <input
                type="url"
                value={formData.bannerUrl}
                onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Date and Location */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            Data, Horário e Local
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Data de Início *</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Data de Término</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Horário do Evento</label>
              <input
                type="text"
                value={formData.time || formData.timeSchedule || ''}
                onChange={(e) => setFormData({ ...formData, time: e.target.value, timeSchedule: e.target.value })}
                placeholder="Ex: Horário não definido"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-hidden focus:border-indigo-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Nome do Local / Centro de Convenções</label>
              <input
                type="text"
                value={formData.locationName}
                onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Cidade / UF</label>
              <input
                type="text"
                value={`${formData.city} - ${formData.state}`}
                onChange={(e) => {
                  const parts = e.target.value.split('-');
                  setFormData({
                    ...formData,
                    city: parts[0]?.trim() || '',
                    state: parts[1]?.trim() || 'SP',
                  });
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-hidden focus:border-indigo-500"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block font-semibold text-slate-700 mb-1">Endereço Completo</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            Canais de Atendimento e Suporte
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">E-mail Oficial</label>
              <input
                type="email"
                value={formData.contact?.email || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contact: { ...formData.contact, email: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Telefone da Igreja / Secretaria</label>
              <input
                type="text"
                value={formData.contact?.phone || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contact: { ...formData.contact, phone: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3.5 rounded-2xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/25 flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Salvando alterações...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Salvar Configurações
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
