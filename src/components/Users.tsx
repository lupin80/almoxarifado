import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  Search, 
  User, 
  Mail, 
  Shield, 
  Trash2, 
  Edit2, 
  X, 
  Check, 
  AlertCircle,
  MoreVertical,
  Camera
} from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../config/supabase';
import { listUsers, createOrUpdateUser, deleteUser } from '../services/userService';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'operador' | 'usuario';
  image?: string;
  created_at?: string;
}

export function Users() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    senha: '',
    role: 'usuario' as const
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await listUsers();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      await createOrUpdateUser({
        id: editingUser?.id,
        name: formData.name,
        email: formData.email,
        senha: formData.senha || undefined,
        role: formData.role
      });
      
      setSuccess(editingUser ? 'Usuário atualizado com sucesso!' : 'Usuário criado com sucesso!');
      setIsModalOpen(false);
      setEditingUser(null);
      setFormData({ name: '', email: '', senha: '', role: 'usuario' });
      fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar usuário.');
    }
  };

  const handleEdit = (user: UserData) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      senha: '',
      role: user.role
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este usuário?')) return;
    
    try {
      await deleteUser(id);
      setUsers(users.filter(u => u.id !== id));
      setSuccess('Usuário excluído com sucesso!');
    } catch (err: any) {
      setError(err.message || 'Erro ao excluir usuário.');
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-secondary/10 text-secondary border border-secondary/20">ADMIN</span>;
      case 'operador':
        return <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">OPERADOR</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-surface-container-highest text-on-surface-variant border border-outline-variant/10">USUÁRIO</span>;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-on-surface tracking-tight font-headline">GERENCIAMENTO DE USUÁRIOS</h1>
          <p className="text-on-surface-variant mt-1">Controle de acessos e permissões do sistema.</p>
        </div>
        <button
          onClick={() => {
            setEditingUser(null);
            setFormData({ name: '', email: '', senha: '', role: 'usuario' });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-secondary text-on-secondary px-6 py-3 rounded-xl font-bold hover:brightness-110 transition-all shadow-lg shadow-secondary/20 shrink-0"
        >
          <UserPlus className="w-5 h-5" />
          NOVO USUÁRIO
        </button>
      </div>

      {/* Stats & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Pesquisar por nome ou email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container-low border border-outline-variant/10 rounded-2xl py-4 pl-12 pr-4 text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all shadow-inner"
          />
        </div>
        <div className="bg-surface-container rounded-2xl p-4 flex items-center justify-between border border-outline-variant/10">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Total de Usuários</p>
            <p className="text-2xl font-black text-secondary">{users.length}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
            <User className="w-6 h-6 text-secondary" />
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 px-4 py-3 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2">
          <Check className="w-5 h-5" />
          <p className="text-sm font-medium">{success}</p>
          <button onClick={() => setSuccess(null)} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}
      {error && (
        <div className="bg-tertiary/10 border border-tertiary/20 text-tertiary px-4 py-3 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-medium">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-surface-container-low h-64 rounded-3xl animate-pulse border border-outline-variant/10" />
          ))
        ) : filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <div 
              key={user.id}
              className="group bg-surface-container-low rounded-3xl border border-outline-variant/10 p-6 hover:border-secondary/30 transition-all duration-300 hover:shadow-2xl hover:shadow-black/20 relative overflow-hidden"
            >
              {/* Background Accent */}
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-secondary/5 rounded-full blur-2xl group-hover:bg-secondary/10 transition-all" />
              
              <div className="flex items-start justify-between mb-6">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-surface-container-highest overflow-hidden ring-2 ring-outline-variant/10 shadow-lg">
                    {user.image ? (
                      <img 
                        src={user.image.startsWith('http') ? `${user.image}?t=${Date.now()}` : user.image} 
                        alt={user.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${user.email}/100/100`;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-secondary/5 text-secondary font-black text-xl">
                        {user.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-surface p-1 rounded-lg shadow-md border border-outline-variant/10">
                    {user.role === 'admin' ? <Shield className="w-4 h-4 text-secondary" /> : <User className="w-4 h-4 text-on-surface-variant" />}
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleEdit(user)}
                    className="p-2 bg-surface hover:bg-secondary/10 text-on-surface-variant hover:text-secondary rounded-xl border border-outline-variant/10 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(user.id)}
                    className="p-2 bg-surface hover:bg-tertiary/10 text-on-surface-variant hover:text-tertiary rounded-xl border border-outline-variant/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="font-black text-lg text-on-surface tracking-tight truncate">{user.name}</h3>
                <div className="flex items-center gap-2 text-on-surface-variant text-sm">
                  <Mail className="w-3.5 h-3.5" />
                  <span className="truncate">{user.email}</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-outline-variant/5 flex items-center justify-between">
                {getRoleBadge(user.role)}
                <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-tighter">
                  Criado em: {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mx-auto border border-outline-variant/10">
              <Search className="w-8 h-8 text-on-surface-variant" />
            </div>
            <div>
              <p className="text-on-surface font-bold text-xl">Nenhum usuário encontrado</p>
              <p className="text-on-surface-variant">Tente mudar os termos da sua pesquisa.</p>
            </div>
          </div>
        )}
      </div>

      {/* Modal User Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="bg-surface-container-high rounded-[2rem] w-full max-w-lg relative z-10 border border-white/10 shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
            <div className="p-8 border-b border-outline-variant/10 flex items-center justify-between bg-surface-container-low/50">
              <div>
                <h2 className="text-2xl font-black text-on-surface tracking-tight font-headline uppercase">
                  {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
                </h2>
                <p className="text-on-surface-variant text-sm mt-1">Preencha as informações abaixo.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-surface rounded-xl transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-on-surface-variant uppercase tracking-widest ml-1">Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl py-3 px-4 text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-on-surface-variant uppercase tracking-widest ml-1">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl py-3 px-4 text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-on-surface-variant uppercase tracking-widest ml-1">
                    {editingUser ? 'Nova Senha (opcional)' : 'Senha'}
                  </label>
                  <input
                    type="password"
                    required={!editingUser}
                    value={formData.senha}
                    onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                    className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl py-3 px-4 text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-on-surface-variant uppercase tracking-widest ml-1">Nível de Acesso</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl py-3 px-4 text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all appearance-none"
                  >
                    <option value="usuario">Usuário Comum</option>
                    <option value="operador">Operador</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-4 rounded-2xl font-bold bg-surface-container hover:bg-surface transition-all border border-outline-variant/10"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-4 rounded-2xl font-bold bg-secondary text-on-secondary hover:brightness-110 transition-all shadow-lg shadow-secondary/20"
                >
                  {editingUser ? 'SALVAR ALTERAÇÕES' : 'CRIAR USUÁRIO'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
