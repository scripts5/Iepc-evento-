import React, { useState } from 'react';
import { Shield, Lock, ArrowLeft, AlertCircle, KeyRound, Sparkles, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';

interface AdminLoginPageProps {
  onNavigate: (path: string) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onNavigate }) => {
  const { login } = useAuth();
  const { showToast } = useToast();

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanPass = password.trim();
    if (!cleanPass) {
      setError('Coloque a senha para acessar (a senha é cpei).');
      return;
    }

    const lower = cleanPass.toLowerCase();
    if (lower !== 'cpei' && lower !== 'iepc' && lower !== 'admin') {
      setError('Senha incorreta. A senha para acessar é cpei.');
      return;
    }

    try {
      setLoading(true);
      await login('admin@iepc.com.br', cleanPass);
      showToast('Acesso autorizado! Bem-vindo(a) ao painel administrativo.', 'success');
      onNavigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Senha incorreta. A senha para acessar é cpei.');
      showToast(err.message || 'Senha incorreta.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background visual accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <button
          type="button"
          onClick={() => onNavigate('/')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-6 mx-auto block text-center"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para o site do evento
        </button>

        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/25">
            <Shield className="w-8 h-8" />
          </div>
        </div>

        <h2 className="mt-4 text-center text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Painel Administrativo
        </h2>
        <p className="mt-2 text-center text-xs sm:text-sm text-slate-400">
          Acesso à gestão, credenciamento e relatórios dos Jovens IEPC.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-900 border border-slate-800 py-8 px-6 sm:px-10 rounded-3xl shadow-2xl space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="admin-password" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Coloque a senha para acessar
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  autoFocus
                  placeholder="Digite a senha (cpei)"
                  className="w-full pl-10 pr-10 py-3.5 text-sm rounded-xl border border-slate-700 bg-slate-800/80 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-hidden font-medium"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-4" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-200 absolute right-3.5 top-3.5 p-1"
                  title={showPassword ? 'Ocultar senha' : 'Ver senha'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-1">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Acessando...
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    Entrar no Painel
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Atalho com a senha cpei */}
          <div className="pt-4 border-t border-slate-800/80 text-center space-y-2">
            <button
              type="button"
              onClick={() => {
                setPassword('cpei');
                setError(null);
              }}
              className="text-xs text-slate-400 hover:text-indigo-400 transition-colors inline-flex items-center gap-1.5 p-1 rounded-lg hover:bg-slate-800/60"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Senha de acesso: <strong className="text-indigo-300 font-mono font-bold">cpei</strong> (clique para preencher)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
