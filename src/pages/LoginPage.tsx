import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { AppError } from '../utils/AppError';
import { logError } from '../utils/logger';

export const LoginPage: React.FC = () => {
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [localLoading, setLocalLoading] = useState(false);
    const [loadingText, setLoadingText] = useState('Bağlanıyor...');
    
    const { login, register, loginWithGoogle } = useAuthStore();
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLocalLoading(true);
        setLoadingText('Sunucuya bağlanılıyor...');

        if (!navigator.onLine) {
            setError('İnternet bağlantınız yok. Lütfen kontrol edin.');
            setLocalLoading(false);
            return;
        }

        const longWaitTimer = setTimeout(() => {
            if (isMounted.current && localLoading) {
                setLoadingText('Güvenli bağlantı sağlanıyor, lütfen bekleyin...');
            }
        }, 4000);

        try {
            if (mode === 'login') {
                await login(email, password);
            } else {
                if (!name) throw new AppError('İsim alanı zorunludur.', 'INTERNAL_ERROR', 500);
                await register(email, password, name);
            }
            // Başarılı olursa useAuthStore'daki user state dolacak ve sistem içeri alacak.
        } catch (err: any) {
            logError('Auth operation failed:', err);
            if (isMounted.current) {
                const errorMessage = err?.message || 'Bilinmeyen bir hata oluştu.';
                if (errorMessage.includes('Invalid login credentials') || errorMessage.includes('auth/invalid-credential')) {
                    setError('Hatalı e-posta veya şifre.');
                } else if (errorMessage.includes('Email not confirmed')) {
                    setError('Lütfen e-posta adresinizi doğrulayın.');
                } else if (errorMessage.includes('fetch failed') || errorMessage.includes('network')) {
                    setError('Ağ hatası. Sunucuya ulaşılamıyor, lütfen internetinizi kontrol edin.');
                } else {
                    setError(errorMessage);
                }
            }
        } finally {
            clearTimeout(longWaitTimer);
            if (isMounted.current) {
                setLocalLoading(false);
                setLoadingText('');
            }
        }
    };

    const handleGoogleSignIn = async () => {
        setError('');
        setLocalLoading(true);
        setLoadingText('Google ile bağlanılıyor...');
        try {
            await loginWithGoogle();
        } catch (err: any) {
            logError('Google login failed:', err);
            if (isMounted.current) {
                setError(err?.message || 'Google ile giriş yapılırken bir hata oluştu.');
            }
        } finally {
            if (isMounted.current) {
                setLocalLoading(false);
                setLoadingText('');
            }
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
    };

    return (
        <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center p-4 relative overflow-hidden font-lexend dark">
            {/* Ambient Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full mix-blend-screen" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full mix-blend-screen" />
                <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] bg-blue-600/10 blur-[100px] rounded-full mix-blend-screen" />
            </div>

            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="w-full max-w-[440px] z-10 relative"
            >
                {/* Logo & Brand Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mb-6 backdrop-blur-md shadow-2xl relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-2xl" />
                        <i className="fa-solid fa-brain text-4xl bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent transform hover:scale-110 transition-transform duration-500 relative z-10"></i>
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic mb-2">
                        Oogmatik <span className="text-indigo-400">Premium</span>
                    </h1>
                    <p className="text-[11px] font-black text-white/40 uppercase tracking-[0.3em]">
                        Nöro-Pedagojik Yönetim Sistemi
                    </p>
                </div>

                {/* Main Auth Card */}
                <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden relative">
                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 pointer-events-none shimmer-effect opacity-10 z-0"></div>

                    {/* Mode Tabs */}
                    <div className="flex border-b border-white/10 relative z-10">
                        <button
                            className={`flex-[1] py-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${mode === 'login' ? 'bg-indigo-500/10 text-indigo-400 border-b-2 border-indigo-500' : 'text-white/40 hover:text-white/60 hover:bg-white/5'}`}
                            onClick={() => {
                                if (!localLoading) { setMode('login'); setError(''); }
                            }}
                            disabled={localLoading}
                        >
                            Sisteme Giriş
                        </button>
                        <button
                            className={`flex-[1] py-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${mode === 'register' ? 'bg-indigo-500/10 text-indigo-400 border-b-2 border-indigo-500' : 'text-white/40 hover:text-white/60 hover:bg-white/5'}`}
                            onClick={() => {
                                if (!localLoading) { setMode('register'); setError(''); }
                            }}
                            disabled={localLoading}
                        >
                            Kayıt Ol
                        </button>
                    </div>

                    <div className="p-8 sm:p-10 relative z-10">
                        <AnimatePresence mode="wait">
                            {error && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="mb-8 p-4 bg-red-500/10 text-red-400 text-[10px] font-black uppercase tracking-widest rounded-2xl border border-red-500/20 flex items-start gap-3"
                                >
                                    <i className="fa-solid fa-circle-exclamation mt-0.5"></i>
                                    <span>{error}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {mode === 'register' && (
                                <div className="space-y-2">
                                    <label htmlFor="auth-name" className="block text-[9px] font-black text-white/40 uppercase tracking-widest ml-1">
                                        Ad Soyad
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/30">
                                            <i className="fa-solid fa-user"></i>
                                        </div>
                                        <input
                                            id="auth-name"
                                            type="text"
                                            value={name}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                                            className="w-full pl-11 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 outline-none text-white font-medium transition-all placeholder:text-white/20"
                                            placeholder="Görünmesini istediğiniz ad"
                                            autoComplete="name"
                                            required={mode === 'register'}
                                            disabled={localLoading}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label htmlFor="auth-email" className="block text-[9px] font-black text-white/40 uppercase tracking-widest ml-1">
                                    E-posta Adresi
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/30">
                                        <i className="fa-solid fa-envelope"></i>
                                    </div>
                                    <input
                                        id="auth-email"
                                        type="email"
                                        value={email}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                                        className="w-full pl-11 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 outline-none text-white font-medium transition-all placeholder:text-white/20"
                                        placeholder="ornek@email.com"
                                        autoComplete="email"
                                        required
                                        disabled={localLoading}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between ml-1">
                                    <label htmlFor="auth-password" className="block text-[9px] font-black text-white/40 uppercase tracking-widest">
                                        Parola
                                    </label>
                                    {mode === 'login' && (
                                        <button type="button" className="text-[9px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest transition-colors">
                                            Şifremi Unuttum
                                        </button>
                                    )}
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/30">
                                        <i className="fa-solid fa-lock"></i>
                                    </div>
                                    <input
                                        id="auth-password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                                        className="w-full pl-11 pr-12 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 outline-none text-white font-medium transition-all placeholder:text-white/20"
                                        placeholder="••••••••"
                                        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                                        required
                                        minLength={6}
                                        disabled={localLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-white/30 hover:text-white/60 transition-colors"
                                        disabled={localLoading}
                                    >
                                        <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={localLoading}
                                className="w-full relative group overflow-hidden bg-indigo-600 text-white font-black py-4 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] text-[11px] uppercase tracking-[0.2em] border border-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)]"
                            >
                                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                                {localLoading ? (
                                    <>
                                        <i className="fa-solid fa-circle-notch fa-spin"></i>
                                        <span>{loadingText}</span>
                                    </>
                                ) : mode === 'login' ? (
                                    <>
                                        <span>Giriş Yap</span>
                                        <i className="fa-solid fa-arrow-right leading-none"></i>
                                    </>
                                ) : (
                                    <>
                                        <span>Hesabımı Oluştur</span>
                                        <i className="fa-solid fa-check leading-none"></i>
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 mb-6 relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/10"></div>
                            </div>
                            <div className="relative flex justify-center">
                                <span className="bg-[#0e0e11] px-4 text-[9px] font-black text-white/30 uppercase tracking-widest">veya</span>
                            </div>
                        </div>

                        <button
                            onClick={handleGoogleSignIn}
                            disabled={localLoading}
                            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed text-[10px] uppercase tracking-[0.2em]"
                        >
                            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/smartlock/google.svg" alt="" className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            Google İle Güvenli Giriş
                        </button>
                    </div>
                </div>

                <div className="mt-8 text-center text-[9px] font-black text-white/30 uppercase tracking-widest px-4 leading-relaxed">
                    Bu sisteme giriş yaparak Bursa Disleksi KVKK ve Gizlilik Politikalarını kabul etmiş sayılırsınız. Yalnızca yetkili personelin erişimine açıktır.
                </div>
            </motion.div>
        </div>
    );
};
