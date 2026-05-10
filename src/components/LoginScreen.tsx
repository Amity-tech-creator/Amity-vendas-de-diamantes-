import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Phone, ShieldCheck, ChevronRight, AlertCircle, Loader2, Eye, EyeOff, Check } from 'lucide-react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, sendPasswordResetEmail } from 'firebase/auth';

interface LoginScreenProps {
  onLoginSuccess: (user: any) => void;
}

export const LoginScreen = ({ onLoginSuccess }: LoginScreenProps) => {
  const [method, setMethod] = useState<'CHOICE' | 'EMAIL' | 'PHONE' | 'FORGOT'>('CHOICE');
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validatePhone = (num: string) => {
    // Regex para 84, 85, 86, 87 seguidos de 7 dígitos
    const regex = /^(84|85|86|87)\d{7}$/;
    return regex.test(num);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess('Link de redefinição enviado para ' + email);
      setTimeout(() => setMethod('EMAIL'), 5000);
    } catch (err: any) {
      setError('Erro ao enviar email de redefinição. Verifique o endereço.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (method === 'EMAIL') {
        if (isRegistering) {
          const { createUserWithEmailAndPassword } = await import('firebase/auth');
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          onLoginSuccess(userCredential.user);
        } else {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          onLoginSuccess(userCredential.user);
        }
      } else if (method === 'PHONE') {
        if (!validatePhone(phone)) {
          setError('Número inválido. Use prefixos 84/85 ou 86/87 (9 dígitos).');
          setLoading(false);
          return;
        }
        // Nota: Para login real por telefone via Firebase é necessário configurar ReCaptcha.
        // Como o usuário pediu apenas para "fazer login", vou implementar uma barreira de autenticação real.
        // O login de telefone sem SMS exige infraestrutura externa, então vamos focar no Google/Email para registro real.
        setError('O login por telefone requer verificação por SMS. Use Google ou Email para registro instantâneo.');
      }
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Este email já está cadastrado. Tente fazer login.');
      } else if (err.code === 'auth/weak-password') {
        setError('A senha deve ter pelo menos 6 caracteres.');
      } else {
        setError('Falha na autenticação. Verifique seus dados.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      onLoginSuccess(res.user);
    } catch (err) {
      setError('Erro ao entrar com Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-black flex items-center justify-center p-6 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyber-cyan/5 rounded-full blur-[120px]" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md bg-zinc-950 border border-zinc-900 p-10 space-y-10 shadow-2xl"
      >
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-black border border-zinc-900 flex items-center justify-center mx-auto mb-6 rotate-45 border-l-cyber-cyan border-t-cyber-cyan">
            <ShieldCheck className="-rotate-45 text-cyber-cyan" size={32} />
          </div>
          <h1 className="text-4xl font-heading text-white tracking-tighter uppercase">
            Sinal <span className="text-cyber-cyan">Access</span>
          </h1>
          <p className="text-xs text-zinc-400 font-black uppercase tracking-[0.4em] italic">Autenticação de Terminal Requerida</p>
        </div>

        <AnimatePresence mode="wait">
          {method === 'CHOICE' ? (
            <motion.div 
              key="choice"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <button 
                onClick={() => setMethod('EMAIL')}
                className="w-full flex items-center justify-between p-6 bg-zinc-900 border border-zinc-800 hover:border-cyber-cyan hover:bg-zinc-800 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <Mail size={20} className="text-zinc-400 group-hover:text-cyber-cyan transition-colors" />
                  <span className="text-xs font-black uppercase tracking-widest text-zinc-300 group-hover:text-white">Email e Senha</span>
                </div>
                <ChevronRight size={16} className="text-zinc-800 group-hover:text-white" />
              </button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-800/50"></div></div>
                <div className="relative flex justify-center text-[10px] font-black uppercase text-zinc-500 tracking-[0.5em] bg-zinc-950 px-4">Ou continuar via</div>
              </div>

              <button 
                onClick={handleGoogleLogin}
                className="w-full py-4 bg-white text-black font-black uppercase text-xs tracking-[0.2em] hover:bg-cyber-cyan transition-all flex items-center justify-center gap-3"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google Authentication
              </button>

              <p className="text-[11px] text-zinc-500 text-center font-bold uppercase tracking-widest mt-6">
                Ao entrar você concorda com nossos protocolos de segurança.
              </p>
            </motion.div>
          ) : (
            <motion.form 
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleLogin}
              className="space-y-6"
            >
              <button 
                type="button"
                onClick={() => { setMethod('CHOICE'); setIsRegistering(false); }}
                className="text-[10px] font-black uppercase text-zinc-400 hover:text-white transition-all flex items-center gap-2 mb-4"
              >
                // Voltar para opções
              </button>

              <div className="flex gap-2 p-1 bg-black border border-zinc-900 rounded-sm mb-6">
                <button
                  type="button"
                  onClick={() => setIsRegistering(false)}
                  className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${!isRegistering ? 'bg-zinc-900 text-white' : 'text-zinc-500'}`}
                >
                  Entrar
                </button>
                <button
                  type="button"
                  onClick={() => setIsRegistering(true)}
                  className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${isRegistering ? 'bg-zinc-900 text-white' : 'text-zinc-500'}`}
                >
                  Criar Conta
                </button>
              </div>

              {method === 'EMAIL' ? (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Endereço de Email</label>
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="usuario@dominio.com"
                      className="cyber-input"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Chave de Segurança</label>
                      {!isRegistering && (
                        <button 
                          type="button"
                          onClick={() => setMethod('FORGOT')}
                          className="text-[10px] text-cyber-cyan hover:text-white font-black uppercase tracking-widest transition-colors"
                        >
                          Esqueceu a senha?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="cyber-input pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-cyber-cyan transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>
              ) : method === 'FORGOT' ? (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-white text-sm font-black uppercase tracking-[0.2em] mb-4">Redefinição de Acesso</h3>
                    <p className="text-[11px] text-zinc-400 uppercase tracking-widest leading-relaxed mb-6">
                      Informe o seu endereço de email para receber as instruções de recuperação.
                    </p>
                    <label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Endereço de Email</label>
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="usuario@dominio.com"
                      className="cyber-input"
                    />
                  </div>
                </div>
              ) : null}

              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-4 bg-cyber-red/10 border border-cyber-red/20 flex items-start gap-3"
                >
                  <AlertCircle size={14} className="text-cyber-red mt-0.5 shrink-0" />
                  <p className="text-[10px] text-cyber-red leading-relaxed font-bold uppercase">{error}</p>
                </motion.div>
              )}

              {success && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-4 bg-cyber-emerald/10 border border-cyber-emerald/20 flex items-start gap-3"
                >
                  <Check className="text-cyber-emerald mt-0.5 shrink-0" size={14} />
                  <p className="text-[10px] text-cyber-emerald leading-relaxed font-bold uppercase">{success}</p>
                </motion.div>
              )}

              <button 
                type="submit"
                disabled={loading}
                onClick={method === 'FORGOT' ? handleForgotPassword : undefined}
                className="cyber-button w-full bg-cyber-cyan text-black flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : 
                 method === 'FORGOT' ? 'SOLICITAR REDEFINIÇÃO' : 
                 isRegistering ? 'CRIAR MINHA CONTA' : 'INICIAR SESSÃO'}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="pt-6 border-t border-zinc-900 text-center">
          <p className="text-[11px] text-zinc-500 font-black uppercase tracking-[0.3em]">
            Digital Security Protocol v4.0.2
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginScreen;
