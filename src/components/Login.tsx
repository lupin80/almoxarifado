import React, { useState } from 'react';
import { LogIn, Package, Shield, AlertCircle, KeyRound, ArrowLeft, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { changePassword, resetPassword } from '../services/authService';

type View = 'login' | 'change-password' | 'forgot-password';


export function Login() {
  const { login } = useAuth();

  // --- Login state ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // --- View ---
  const [view, setView] = useState<View>('login');

  // --- Change password state ---
  const [cpEmail, setCpEmail] = useState('');
  const [cpCurrent, setCpCurrent] = useState('');
  const [cpNew, setCpNew] = useState('');
  const [cpConfirm, setCpConfirm] = useState('');
  const [showCpCurrent, setShowCpCurrent] = useState(false);
  const [showCpNew, setShowCpNew] = useState(false);
  const [showCpConfirm, setShowCpConfirm] = useState(false);
  const [cpError, setCpError] = useState('');
  const [cpSuccess, setCpSuccess] = useState(false);
  const [cpLoading, setCpLoading] = useState(false);

  // --- Forgot password state ---
  const [fpEmail, setFpEmail] = useState('');
  const [fpNew, setFpNew] = useState('');
  const [fpConfirm, setFpConfirm] = useState('');
  const [showFpNew, setShowFpNew] = useState(false);
  const [showFpConfirm, setShowFpConfirm] = useState(false);
  const [fpError, setFpError] = useState('');
  const [fpSuccess, setFpSuccess] = useState(false);
  const [fpLoading, setFpLoading] = useState(false);

  // --- Login submit ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ username: email, password });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Servidor indisponível no momento';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // --- Change password submit ---
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setCpError('');
    if (cpNew !== cpConfirm) { setCpError('As novas senhas não coincidem.'); return; }
    if (cpNew.length < 6) { setCpError('A nova senha deve ter pelo menos 6 caracteres.'); return; }
    setCpLoading(true);
    try {
      await changePassword({ email: cpEmail, currentPassword: cpCurrent, newPassword: cpNew });
      setCpSuccess(true);
    } catch (err) {
      setCpError(err instanceof Error ? err.message : 'Erro ao conectar ao servidor.');
    } finally {
      setCpLoading(false);
    }
  };

  // --- Forgot password submit ---
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setFpError('');
    if (fpNew !== fpConfirm) { setFpError('As senhas não coincidem.'); return; }
    if (fpNew.length < 6) { setFpError('A nova senha deve ter pelo menos 6 caracteres.'); return; }
    setFpLoading(true);
    try {
      await resetPassword({ email: fpEmail, newPassword: fpNew });
      setFpSuccess(true);
    } catch (err) {
      setFpError(err instanceof Error ? err.message : 'Erro ao conectar ao servidor.');
    } finally {
      setFpLoading(false);
    }
  };

  const goToLogin = () => {
    setView('login');
    setCpEmail(''); setCpCurrent(''); setCpNew(''); setCpConfirm('');
    setCpError(''); setCpSuccess(false);
    setFpEmail(''); setFpNew(''); setFpConfirm('');
    setFpError(''); setFpSuccess(false);
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-surface-container-low rounded-2xl border border-outline-variant/10 p-8 shadow-2xl animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center text-center space-y-6">

          {/* Logo */}
          <div className="w-20 h-20 rounded-2xl bg-secondary/10 flex items-center justify-center relative">
            <Package className="w-12 h-12 text-secondary" />
            <div className="absolute -bottom-1 -right-1 p-1.5 bg-surface rounded-lg border border-outline-variant/10">
              <Shield className="w-4 h-4 text-secondary" />
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-black text-on-surface tracking-tight font-headline uppercase">
              Vault Inventory
            </h1>
            <p className="text-on-surface-variant text-sm mt-2 font-medium">
              Controle de Ativos de Alta Precisão
            </p>
          </div>

          {/* ───────── LOGIN ───────── */}
          {view === 'login' && (
            <form onSubmit={handleSubmit} className="w-full space-y-4 pt-4">
              {error && (
                <div className="bg-tertiary/10 border border-tertiary/20 p-3 rounded-lg flex items-center gap-2 text-tertiary text-xs font-bold uppercase tracking-widest">
                  <AlertCircle className="w-4 h-4 shrink-0" />{error}
                </div>
              )}
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Email</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface-container-highest border-none rounded-xl px-4 py-3 text-sm text-on-surface focus:ring-1 focus:ring-secondary/40"
                  placeholder="admin@vault.com" autoComplete="email" />
              </div>
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Chave de Acesso</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-surface-container-highest border-none rounded-xl px-4 py-3 pr-11 text-sm text-on-surface focus:ring-1 focus:ring-secondary/40"
                    placeholder="••••••••" autoComplete="current-password" />
                  <button type="button" onClick={() => setShowPassword(v => !v)} tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-4 bg-secondary text-on-secondary rounded-xl font-black tracking-widest hover:scale-[0.98] active:scale-95 transition-all shadow-lg shadow-secondary/20 disabled:opacity-50">
                {loading ? 'AUTENTICANDO...' : 'ENTRAR NO COFRE'}
                {!loading && <LogIn className="w-5 h-5" />}
              </button>

              {/* Links */}
              <div className="flex items-center justify-between pt-1">
                <button type="button" onClick={() => setView('forgot-password')}
                  className="text-[11px] font-bold text-on-surface-variant/60 hover:text-secondary uppercase tracking-widest transition-colors">
                  Esqueci minha senha
                </button>
                <button type="button" onClick={() => setView('change-password')}
                  className="flex items-center gap-1.5 text-[11px] font-bold text-on-surface-variant/60 hover:text-secondary uppercase tracking-widest transition-colors">
                  <KeyRound className="w-3.5 h-3.5" />Alterar Senha
                </button>
              </div>
            </form>
          )}

          {/* ───────── ALTERAR SENHA ───────── */}
          {view === 'change-password' && (
            <div className="w-full pt-2">
              <div className="flex items-center gap-2 mb-6">
                <button onClick={goToLogin} className="p-1.5 rounded-lg hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="text-left">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Segurança</p>
                  <p className="text-sm font-black text-on-surface">Alterar Chave de Acesso</p>
                </div>
              </div>
              {cpSuccess ? (
                <div className="flex flex-col items-center gap-4 py-6">
                  <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-secondary" />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="font-black text-on-surface">Senha Alterada!</p>
                    <p className="text-xs text-on-surface-variant">Sua chave de acesso foi atualizada com sucesso.</p>
                  </div>
                  <button onClick={goToLogin}
                    className="mt-2 flex items-center gap-2 px-6 py-3 bg-secondary text-on-secondary rounded-xl font-black tracking-widest text-sm hover:scale-[0.98] active:scale-95 transition-all shadow-lg shadow-secondary/20">
                    <LogIn className="w-4 h-4" />IR PARA LOGIN
                  </button>
                </div>
              ) : (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  {cpError && (
                    <div className="bg-tertiary/10 border border-tertiary/20 p-3 rounded-lg flex items-center gap-2 text-tertiary text-xs font-bold uppercase tracking-widest">
                      <AlertCircle className="w-4 h-4 shrink-0" />{cpError}
                    </div>
                  )}
                  <div className="space-y-2 text-left">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Email</label>
                    <input type="email" required value={cpEmail} onChange={(e) => setCpEmail(e.target.value)}
                      className="w-full bg-surface-container-highest border-none rounded-xl px-4 py-3 text-sm text-on-surface focus:ring-1 focus:ring-secondary/40"
                      placeholder="admin@vault.com" />
                  </div>
                  <div className="space-y-2 text-left">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Senha Atual</label>
                    <div className="relative">
                      <input type={showCpCurrent ? 'text' : 'password'} required value={cpCurrent} onChange={(e) => setCpCurrent(e.target.value)}
                        className="w-full bg-surface-container-highest border-none rounded-xl px-4 py-3 pr-11 text-sm text-on-surface focus:ring-1 focus:ring-secondary/40" placeholder="••••••••" />
                      <button type="button" onClick={() => setShowCpCurrent(v => !v)} tabIndex={-1}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors">
                        {showCpCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2 text-left">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Nova Senha</label>
                    <div className="relative">
                      <input type={showCpNew ? 'text' : 'password'} required value={cpNew} onChange={(e) => setCpNew(e.target.value)}
                        className="w-full bg-surface-container-highest border-none rounded-xl px-4 py-3 pr-11 text-sm text-on-surface focus:ring-1 focus:ring-secondary/40" placeholder="••••••••" />
                      <button type="button" onClick={() => setShowCpNew(v => !v)} tabIndex={-1}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors">
                        {showCpNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2 text-left">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Confirmar Nova Senha</label>
                    <div className="relative">
                      <input type={showCpConfirm ? 'text' : 'password'} required value={cpConfirm} onChange={(e) => setCpConfirm(e.target.value)}
                        className="w-full bg-surface-container-highest border-none rounded-xl px-4 py-3 pr-11 text-sm text-on-surface focus:ring-1 focus:ring-secondary/40" placeholder="••••••••" />
                      <button type="button" onClick={() => setShowCpConfirm(v => !v)} tabIndex={-1}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors">
                        {showCpConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" disabled={cpLoading}
                    className="w-full flex items-center justify-center gap-3 py-4 bg-secondary text-on-secondary rounded-xl font-black tracking-widest hover:scale-[0.98] active:scale-95 transition-all shadow-lg shadow-secondary/20 disabled:opacity-50 mt-2">
                    {cpLoading ? 'SALVANDO...' : 'SALVAR NOVA SENHA'}
                    {!cpLoading && <KeyRound className="w-5 h-5" />}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ───────── ESQUECI MINHA SENHA ───────── */}
          {view === 'forgot-password' && (
            <div className="w-full pt-2">
              <div className="flex items-center gap-2 mb-6">
                <button onClick={goToLogin} className="p-1.5 rounded-lg hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="text-left">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Recuperação</p>
                  <p className="text-sm font-black text-on-surface">Redefinir Chave de Acesso</p>
                </div>
              </div>

              {fpSuccess ? (
                <div className="flex flex-col items-center gap-4 py-6">
                  <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-secondary" />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="font-black text-on-surface">Senha Redefinida!</p>
                    <p className="text-xs text-on-surface-variant">Você já pode entrar com sua nova chave de acesso.</p>
                  </div>
                  <button onClick={goToLogin}
                    className="mt-2 flex items-center gap-2 px-6 py-3 bg-secondary text-on-secondary rounded-xl font-black tracking-widest text-sm hover:scale-[0.98] active:scale-95 transition-all shadow-lg shadow-secondary/20">
                    <LogIn className="w-4 h-4" />IR PARA LOGIN
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  {fpError && (
                    <div className="bg-tertiary/10 border border-tertiary/20 p-3 rounded-lg flex items-center gap-2 text-tertiary text-xs font-bold uppercase tracking-widest">
                      <AlertCircle className="w-4 h-4 shrink-0" />{fpError}
                    </div>
                  )}

                  <div className="bg-secondary/5 border border-secondary/20 p-3 rounded-lg text-left">
                    <p className="text-[11px] text-on-surface-variant leading-relaxed">
                      Informe seu e-mail cadastrado e defina uma nova senha diretamente. O sistema verificará se o e-mail existe antes de redefinir.
                    </p>
                  </div>

                  <div className="space-y-2 text-left">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Email Cadastrado</label>
                    <input type="email" required value={fpEmail} onChange={(e) => setFpEmail(e.target.value)}
                      className="w-full bg-surface-container-highest border-none rounded-xl px-4 py-3 text-sm text-on-surface focus:ring-1 focus:ring-secondary/40"
                      placeholder="admin@vault.com" />
                  </div>
                  <div className="space-y-2 text-left">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Nova Senha</label>
                    <div className="relative">
                      <input type={showFpNew ? 'text' : 'password'} required value={fpNew} onChange={(e) => setFpNew(e.target.value)}
                        className="w-full bg-surface-container-highest border-none rounded-xl px-4 py-3 pr-11 text-sm text-on-surface focus:ring-1 focus:ring-secondary/40" placeholder="••••••••" />
                      <button type="button" onClick={() => setShowFpNew(v => !v)} tabIndex={-1}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors">
                        {showFpNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2 text-left">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Confirmar Nova Senha</label>
                    <div className="relative">
                      <input type={showFpConfirm ? 'text' : 'password'} required value={fpConfirm} onChange={(e) => setFpConfirm(e.target.value)}
                        className="w-full bg-surface-container-highest border-none rounded-xl px-4 py-3 pr-11 text-sm text-on-surface focus:ring-1 focus:ring-secondary/40" placeholder="••••••••" />
                      <button type="button" onClick={() => setShowFpConfirm(v => !v)} tabIndex={-1}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors">
                        {showFpConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" disabled={fpLoading}
                    className="w-full flex items-center justify-center gap-3 py-4 bg-secondary text-on-secondary rounded-xl font-black tracking-widest hover:scale-[0.98] active:scale-95 transition-all shadow-lg shadow-secondary/20 disabled:opacity-50 mt-2">
                    {fpLoading ? 'REDEFININDO...' : 'REDEFINIR SENHA'}
                    {!fpLoading && <KeyRound className="w-5 h-5" />}
                  </button>
                </form>
              )}
            </div>
          )}

          <p className="text-[10px] text-on-surface-variant/50 uppercase tracking-[0.2em] font-bold">
            Ambiente Seguro & Criptografado
          </p>
        </div>
      </div>
    </div>
  );
}