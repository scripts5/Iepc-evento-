import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  QrCode,
  FileBarChart,
  Settings,
  ShieldAlert,
  ExternalLink,
  LogOut,
  Menu,
  X,
  KeyRound,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Award,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import { useEvent } from '../../context/EventContext.tsx';
import { api } from '../../services/api.ts';
import { ConfirmationModal } from '../common/ConfirmationModal.tsx';

interface AdminLayoutProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ currentPath, onNavigate, children }) => {
  const { user, logout, isAdmin } = useAuth();
  const { event, refreshEvent } = useEvent();
  const { showToast } = useToast();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Reset demo modal
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Lista de Inscritos', path: '/admin/inscritos', icon: Users },
    { label: 'Check-in (Credenciamento)', path: '/admin/checkin', icon: QrCode },
    { label: 'Certificados & Crachás', path: '/admin/certificados', icon: Award },
    { label: 'Relatórios & Exportação', path: '/admin/relatorios', icon: FileBarChart },
    ...(isAdmin
      ? [
          { label: 'Configurações do Evento', path: '/admin/configuracoes', icon: Settings },
          { label: 'Usuários & Permissões', path: '/admin/usuarios', icon: ShieldAlert },
        ]
      : []),
  ];

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      showToast('A nova senha deve possuir no mínimo 6 caracteres.', 'warning');
      return;
    }

    try {
      setPasswordLoading(true);
      await api.changePassword(currentPassword, newPassword);
      showToast('Senha alterada com sucesso!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setIsPasswordModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Erro ao alterar senha.', 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleResetDemo = async () => {
    try {
      setResetLoading(true);
      await api.resetDemoData();
      showToast('Dados de demonstração restaurados com sucesso!', 'success');
      setIsResetModalOpen(false);
      refreshEvent();
      onNavigate('/admin/dashboard');
    } catch (err: any) {
      showToast(err.message || 'Erro ao restaurar dados.', 'error');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between sticky top-0 z-40 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-sm">
            EP
          </div>
          <span className="font-bold text-sm truncate max-w-[200px]">
            {event?.name || 'Painel Admin'}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-950 text-slate-300 flex flex-col border-r border-slate-900 transition-transform md:translate-x-0 md:static md:inset-auto ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Area */}
        <div className="p-6 border-b border-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-md shadow-indigo-600/30">
              EP
            </div>
            <div>
              <span className="font-bold text-white text-sm block leading-tight">
                EventPass Admin
              </span>
              <span className="text-[11px] text-indigo-400 font-medium block">
                Gestão de Inscrições
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden text-slate-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="p-4 mx-3 my-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white truncate max-w-[130px]">
              {user?.name || 'Administrador'}
            </span>
            <span
              className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                user?.role === 'ADMIN'
                  ? 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              }`}
            >
              {user?.role || 'STAFF'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 truncate">
            {user?.email && !user.email.includes('admin@iepc.com') ? user.email : 'Gmail Administrativo'}
          </p>

          <button
            type="button"
            onClick={() => setIsPasswordModalOpen(true)}
            className="w-full text-left text-[11px] font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 pt-1"
          >
            <KeyRound className="w-3 h-3" />
            Alterar Senha
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = currentPath === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate(item.path);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-900 space-y-2">
          {isAdmin && (
            <button
              type="button"
              onClick={() => setIsResetModalOpen(true)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-amber-400 hover:bg-slate-900 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restaurar Dados Demo
            </button>
          )}

          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" />
              Ver Site Público
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              logout();
              showToast('Você saiu do painel.', 'info');
              onNavigate('/admin/login');
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sair da Conta
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Desktop Header */}
        <header className="hidden md:flex bg-white border-b border-slate-200/80 px-8 py-4 items-center justify-between sticky top-0 z-30 shadow-2xs">
          <div>
            <h1 className="text-lg font-bold text-slate-900">
              {navItems.find((i) => i.path === currentPath)?.label || 'Painel de Gestão'}
            </h1>
            <p className="text-xs text-slate-500">{event?.name}</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('/admin/checkin')}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <QrCode className="w-3.5 h-3.5" />
              Check-in Rápido
            </button>

            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Ver Site
            </button>
          </div>
        </header>

        {/* Page Content Body */}
        <div className="p-4 sm:p-6 lg:p-8 flex-1">{children}</div>
      </main>

      {/* Password Change Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Alterar Minha Senha</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Senha Atual *</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Sua senha atual"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nova Senha (Mínimo 6 caracteres) *
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nova senha segura"
                  required
                  minLength={6}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-4 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center gap-1.5"
                >
                  {passwordLoading ? 'Salvando...' : 'Salvar Nova Senha'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Demo Modal */}
      <ConfirmationModal
        isOpen={isResetModalOpen}
        title="Restaurar dados de demonstração?"
        message="Esta ação irá resetar as inscrições para a lista inicial de teste do evento e restaurar os logins padrão (admin@evento.com e staff@evento.com). Deseja continuar?"
        confirmText="Sim, Restaurar Demo"
        cancelText="Cancelar"
        isDanger={true}
        isLoading={resetLoading}
        onConfirm={handleResetDemo}
        onCancel={() => setIsResetModalOpen(false)}
      />
    </div>
  );
};
