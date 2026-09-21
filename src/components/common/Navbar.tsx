import React, { useState } from 'react';
import { Calendar, CheckCircle, Ticket, Menu, X, Shield, ArrowRight, Award } from 'lucide-react';
import { useEvent } from '../../context/EventContext.tsx';
import { defaultEventData } from '../../data/defaultEvent.ts';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate }) => {
  const { event } = useEvent();
  const activeEvent = event || defaultEventData;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isRegistrationClosed = !activeEvent.isRegistrationOpen || activeEvent.isCapacityFull;

  const handleNav = (target: string) => {
    setMobileMenuOpen(false);
    if (target.startsWith('#')) {
      if (currentPath !== '/') {
        onNavigate('/');
        setTimeout(() => {
          const el = document.querySelector(target);
          el?.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      } else {
        const el = document.querySelector(target);
        el?.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      onNavigate(target);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo / Brand */}
          <button
            type="button"
            onClick={() => handleNav('/')}
            className="flex items-center gap-3 text-left group"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-bold text-slate-900 leading-tight block line-clamp-1 group-hover:text-indigo-600 transition-colors">
                {activeEvent.name}
              </span>
              <span className="text-xs font-medium text-slate-500 block">
                {`${activeEvent.startDate.split('-').reverse().join('/')} • ${activeEvent.locationName.split(' ')[0]}`}
              </span>
            </div>
          </button>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-6">
            <button
              type="button"
              onClick={() => handleNav('#sobre')}
              className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
            >
              Sobre o Evento
            </button>
            <button
              type="button"
              onClick={() => handleNav('#programacao')}
              className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
            >
              Programação
            </button>
            <button
              type="button"
              onClick={() => handleNav('#informacoes')}
              className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
            >
              Informações
            </button>
            <button
              type="button"
              onClick={() => handleNav('#faq')}
              className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
            >
              Dúvidas (FAQ)
            </button>
            <button
              type="button"
              onClick={() => handleNav('#contato')}
              className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
            >
              Contato
            </button>
            <button
              type="button"
              onClick={() => handleNav('/certificado')}
              className={`text-sm font-medium flex items-center gap-1.5 transition-colors ${
                currentPath.startsWith('/certificado')
                  ? 'text-indigo-600 font-semibold'
                  : 'text-slate-600 hover:text-indigo-600'
              }`}
            >
              <Award className="w-4 h-4 text-indigo-500" />
              Certificados
            </button>
          </nav>

          {/* Actions */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleNav('/consultar-inscricao')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                currentPath === '/consultar-inscricao'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <CheckCircle className="w-4 h-4 text-indigo-600" />
              Já estou inscrito
            </button>

            {isRegistrationClosed ? (
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                Inscrições Encerradas
              </span>
            ) : (
              <button
                type="button"
                onClick={() => handleNav('/inscricao')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/25 hover:shadow-indigo-600/35 hover:-translate-y-0.5 active:translate-y-0 transition-all"
              >
                <Ticket className="w-4 h-4" />
                Inscreva-se
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={() => handleNav('/admin')}
              title="Área do Administrador"
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <Shield className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => handleNav('/consultar-inscricao')}
              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl"
              title="Consultar Inscrição"
            >
              <CheckCircle className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl"
              aria-label="Abrir menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-xl">
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => handleNav('#sobre')}
              className="w-full text-left px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              Sobre o Evento
            </button>
            <button
              type="button"
              onClick={() => handleNav('#programacao')}
              className="w-full text-left px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              Programação
            </button>
            <button
              type="button"
              onClick={() => handleNav('#informacoes')}
              className="w-full text-left px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              Informações Importantes
            </button>
            <button
              type="button"
              onClick={() => handleNav('#faq')}
              className="w-full text-left px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              Perguntas Frequentes
            </button>
            <button
              type="button"
              onClick={() => handleNav('#contato')}
              className="w-full text-left px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              Contato
            </button>
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2">
            <button
              type="button"
              onClick={() => handleNav('/consultar-inscricao')}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-300 text-slate-700 bg-slate-50"
            >
              <CheckCircle className="w-4 h-4 text-indigo-600" />
              Já estou inscrito
            </button>

            <button
              type="button"
              onClick={() => handleNav('/certificado')}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-300 text-slate-700 bg-slate-50"
            >
              <Award className="w-4 h-4 text-indigo-600" />
              Certificados & Mini Crachás
            </button>

            {isRegistrationClosed ? (
              <div className="w-full text-center py-2.5 rounded-xl text-sm font-medium bg-slate-100 text-slate-500">
                Inscrições Encerradas
              </div>
            ) : (
              <button
                type="button"
                onClick={() => handleNav('/inscricao')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20"
              >
                <Ticket className="w-4 h-4" />
                Inscreva-se Agora
              </button>
            )}

            <button
              type="button"
              onClick={() => handleNav('/admin')}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              <Shield className="w-4 h-4" />
              Acessar Painel do Administrador
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
