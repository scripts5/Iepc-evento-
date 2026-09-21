import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  UserPlus,
  Trash2,
  Lock,
  Mail,
  User,
  ShieldCheck,
  CheckCircle2,
  X,
} from 'lucide-react';
import { api } from '../services/api.ts';
import { AdminUser, AdminRole } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { ConfirmationModal } from '../components/common/ConfirmationModal.tsx';

export const AdminUsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  // New user modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STAFF' as AdminRole,
  });
  const [addLoading, setAddLoading] = useState(false);

  // Delete modal
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminUsers();
      setUsers(data);
    } catch (err: any) {
      showToast(err.message || 'Erro ao carregar lista de usuários.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserData.name || !newUserData.email || !newUserData.password) {
      showToast('Preencha todos os campos obrigatórios.', 'warning');
      return;
    }

    try {
      setAddLoading(true);
      const res = await api.createAdminUser(newUserData);
      showToast(res.message, 'success');
      setIsAddModalOpen(false);
      setNewUserData({ name: '', email: '', password: '', role: 'STAFF' });
      loadUsers();
    } catch (err: any) {
      showToast(err.message || 'Erro ao criar usuário.', 'error');
    } finally {
      setAddLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      setDeleteLoading(true);
      const res = await api.deleteAdminUser(userToDelete.id);
      showToast(res.message, 'success');
      setUserToDelete(null);
      loadUsers();
    } catch (err: any) {
      showToast(err.message || 'Erro ao remover usuário.', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Usuários e Níveis de Acesso
          </h2>
          <p className="text-xs text-slate-500">
            Gerencie os administradores gerais e membros da equipe de credenciamento (STAFF).
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-colors self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          Novo Usuário
        </button>
      </div>

      {/* Permission Summary info banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-xs text-indigo-700">
            <ShieldCheck className="w-4 h-4" />
            Nível ADMIN (Administrador Geral)
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Acesso total: visualiza, edita e exclui participantes, altera configurações gerais do evento, gera relatórios CSV, gerencia equipe e executa check-in.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-xs text-emerald-700">
            <ShieldAlert className="w-4 h-4" />
            Nível STAFF (Equipe de Portaria / Recepção)
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Acesso operacional focado: realiza leitura de QR Code, busca manual de participantes na portaria e consulta status de inscrição. Sem acesso a exclusões ou configurações.
          </p>
        </div>
      </div>

      {/* Users Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200/70">
              <tr>
                <th className="py-3.5 px-4">Nome</th>
                <th className="py-3.5 px-4">E-mail</th>
                <th className="py-3.5 px-4">Perfil</th>
                <th className="py-3.5 px-4">Criado em</th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900 block">{u.name}</span>
                    {currentUser?.id === u.id && (
                      <span className="text-[10px] text-indigo-600 font-semibold">(Você)</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">{u.email}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                        u.role === 'ADMIN'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {new Date(u.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {currentUser?.id !== u.id && (
                      <button
                        type="button"
                        onClick={() => setUserToDelete(u)}
                        title="Remover acesso"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Novo Usuário do Sistema</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  value={newUserData.name}
                  onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                  placeholder="Ex: Carlos Oliveira"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">E-mail de Login *</label>
                <input
                  type="email"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  placeholder="carlos@evento.com"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Senha Inicial (Mínimo 6 caracteres) *
                </label>
                <input
                  type="password"
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nível de Permissão *</label>
                <select
                  value={newUserData.role}
                  onChange={(e) =>
                    setNewUserData({ ...newUserData, role: e.target.value as AdminRole })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-hidden focus:border-indigo-500 font-semibold"
                >
                  <option value="STAFF">STAFF (Recepção e Check-in)</option>
                  <option value="ADMIN">ADMIN (Administrador Completo)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="px-4 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center gap-1.5"
                >
                  {addLoading ? 'Cadastrando...' : 'Cadastrar Usuário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      <ConfirmationModal
        isOpen={!!userToDelete}
        title="Revogar acesso de usuário?"
        message={`Deseja realmente remover o acesso de "${userToDelete?.name}" (${userToDelete?.email})? Este usuário não poderá mais efetuar login no painel.`}
        confirmText="Sim, Revogar Acesso"
        cancelText="Cancelar"
        isDanger={true}
        isLoading={deleteLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setUserToDelete(null)}
      />
    </div>
  );
};
