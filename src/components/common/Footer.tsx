import React from 'react';
import { Calendar, ShieldCheck, Mail, Phone, MapPin, ExternalLink } from 'lucide-react';
import { useEvent } from '../../context/EventContext.tsx';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { event } = useEvent();

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800/80">
          {/* Brand & Mission */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
                <Calendar className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                {event?.name || 'Gestão de Eventos'}
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Plataforma oficial de credenciamento e gestão de participantes. Inscrição rápida, segura e com emissão instantânea de voucher com QR Code.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              Conforme LGPD (Lei nº 13.709/2018)
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-4">
              Navegação Rápida
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/')}
                  className="hover:text-white transition-colors"
                >
                  Página Inicial
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/inscricao')}
                  className="hover:text-white transition-colors"
                >
                  Formulário de Inscrição
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/consultar-inscricao')}
                  className="hover:text-white transition-colors"
                >
                  Consultar Inscrição / 2ª Via
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/certificado')}
                  className="hover:text-white transition-colors"
                >
                  Certificados & Mini Crachás
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/privacidade')}
                  className="hover:text-white transition-colors"
                >
                  Política de Privacidade (LGPD)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/termos')}
                  className="hover:text-white transition-colors"
                >
                  Termos de Uso
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-4">
              Contato & Local
            </h4>
            <ul className="space-y-3 text-sm">
              {event?.contact?.email && (
                <li className="flex items-start gap-2.5">
                  <Mail className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300 break-all">{event.contact.email}</span>
                </li>
              )}
              {event?.contact?.phone && (
                <li className="flex items-start gap-2.5">
                  <Phone className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300">{event.contact.phone}</span>
                </li>
              )}
              {event?.locationAddress && (
                <li className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300">{event.locationAddress}</span>
                </li>
              )}
            </ul>
          </div>

          {/* Restricted Area */}
          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Área Restrita
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Acesso exclusivo para administradores, equipe de credenciamento e recepção (check-in).
            </p>
            <button
              type="button"
              onClick={() => onNavigate('/admin')}
              className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors"
            >
              Acessar Painel Administrativo
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {event?.name || 'Evento'}. Todos os direitos reservados.</p>
          <div className="flex items-center gap-6">
            <button type="button" onClick={() => onNavigate('/privacidade')} className="hover:text-slate-400">
              Privacidade
            </button>
            <button type="button" onClick={() => onNavigate('/termos')} className="hover:text-slate-400">
              Termos de Uso
            </button>
            <button type="button" onClick={() => onNavigate('/admin/login')} className="hover:text-slate-400">
              Login Staff
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
