import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';
import { Mail, Lock, User, Sparkles, ArrowRight, Loader2, Github, Chrome } from 'lucide-react';
import DyslexiaLogo from '../components/DyslexiaLogo';

const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register, loginWithGoogle } = useAuthStore();
  const toast = useToastStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
        toast.success('Başarıyla giriş yapıldı.');
      } else {
        await register(email, password, name);
        toast.success('Hesabınız başarıyla oluşturuldu.');
      }
    } catch (error: any) {
      toast.error(error.message || 'Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error: any) {
      toast.error(error.message || 'Google ile giriş başarısız.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center p-4 relative overflow-hidden font-lexend">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse delay-700"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2.5rem] bg-gradient-to-br from-indigo-500 to-purple-600 mb-6 shadow-2xl shadow-indigo-500/20">
            <Sparkles className="text-white w-10 h-10" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-2 italic">
            OOGMATİK <span className="text-indigo-500">PREMIUM</span>
          </h1>
          <p className="text-zinc-500 text-xs font-black uppercase tracking-[0.3em] opacity-60">
            Nöro-Pedagojik Eğitim İşletim Sistemi
          </p>
        </div>

        <div className="bg-zinc-900/40 backdrop-blur-3xl border border-white/5 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          
          <div className="flex bg-zinc-950/50 p-1.5 rounded-2xl mb-8 relative z-10">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                isLogin ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Giriş Yap
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                !isLogin ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Kayıt Ol
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Tam İsim</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-indigo-400 transition-colors" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Adınız Soyadınız"
                    className="w-full bg-zinc-950/50 border border-white/5 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-zinc-700 outline-none focus:border-indigo-500/50 transition-all"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">E-Posta</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@oogmatik.com"
                  className="w-full bg-zinc-950/50 border border-white/5 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-zinc-700 outline-none focus:border-indigo-500/50 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Şifre</label>
                {isLogin && (
                  <button type="button" className="text-[9px] font-black text-indigo-400 uppercase tracking-tighter hover:text-indigo-300">
                    Şifremi Unuttum?
                  </button>
                )}
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-950/50 border border-white/5 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-zinc-700 outline-none focus:border-indigo-500/50 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white rounded-2xl py-4 text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sisteme Bağlan' : 'Hesabı Oluştur'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 relative z-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px flex-1 bg-white/5"></div>
              <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">veya bunlarla devam et</span>
              <div className="h-px flex-1 bg-white/5"></div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={handleGoogleLogin}
                className="flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl py-3.5 transition-all active:scale-[0.98]"
              >
                <Chrome className="w-4 h-4 text-zinc-300" />
                <span className="text-[11px] font-black text-zinc-300 uppercase tracking-wider">Google ile Giriş</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-6 opacity-30 hover:opacity-100 transition-opacity">
          <DyslexiaLogo className="h-6 grayscale" />
          <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.4em] text-center">
            Bursa Disleksi Edu-Tech Solutions &middot; EST 2004
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
