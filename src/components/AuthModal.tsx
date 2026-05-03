import { AppError } from '../utils/AppError';
import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/useAuthStore';

import { logError } from '../utils/logger.js';
interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }: AuthModalProps) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, register, loginWithGoogle } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Bağlanıyor...');
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    } else {
      // Force close if loading (user wants to abort)
      setIsLoading(false);
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setLoadingText('Sunucuya bağlanılıyor...');

    // Check Connection first
    if (!navigator.onLine) {
      setError('İnternet bağlantınız yok. Lütfen kontrol edin.');
      setIsLoading(false);
      return;
    }

    // UX: Uzun süren bağlantılar için bilgilendirme mesajları
    const longWaitTimer = setTimeout(() => {
      if (isMounted.current && isLoading) {
        setLoadingText('Sunucu hazırlanıyor, lütfen bekleyin (Soğuk Başlatma)...');
      }
    }, 4000);

    const veryLongWaitTimer = setTimeout(() => {
      if (isMounted.current && isLoading) {
        setLoadingText('Hala yanıt bekleniyor, işlem devam ediyor...');
      }
    }, 15000);

    try {
      // Yapay zaman aşımı (Promise.race) kaldırıldı.
      // Supabase istemcisinin kendi doğal zaman aşımını veya sunucu yanıtını bekliyoruz.
      if (mode === 'login') {
        await login(email, password);
      } else {
        if (!name) throw new AppError('İsim alanı zorunludur.', 'INTERNAL_ERROR', 500);
        await register(email, password, name);
      }

      if (isMounted.current) {
        onClose();
      }
    } catch (err: any) {
      logError('Auth operation failed:', err);
      if (isMounted.current) {
        const errorMessage = err?.message || 'Bilinmeyen bir hata oluştu.';
        // Translate common Firebase/Supabase errors
        if (
          errorMessage.includes('Invalid login credentials') ||
          errorMessage.includes('auth/invalid-credential')
        ) {
          setError('Hatalı e-posta veya şifre.');
        } else if (errorMessage.includes('Email not confirmed')) {
          setError('Lütfen e-posta adresinizi doğrulayın.');
        } else if (errorMessage.includes('fetch failed') || errorMessage.includes('network')) {
          setError('Ağ hatası. Sunucuya ulaşılamıyor, lütfen internetinizi kontrol edin.');
        } else if (
          errorMessage.includes('identity-toolkit-api-has-not-been-used') ||
          errorMessage.includes('auth/api-key-not-valid') ||
          errorMessage.includes('auth/operation-not-allowed')
        ) {
          setError(
            'Sistem Hatası: Email/Şifre girişi aktif değil veya Firebase Identity Toolkit servisi kapalı. Lütfen Firebase Console üzerinden "Email/Password" sağlayıcısını etkinleştirin.'
          );
        } else if (errorMessage.includes('auth/unauthorized-domain')) {
          setError(
            'Bu alan adı (domain) henüz yetkilendirilmemiş. Lütfen Firebase Console üzerinden "oogmatik.vercel.app" adresini yetkilendirilmiş alan adlarına ekleyin.'
          );
        } else {
          setError(errorMessage);
        }
      }
    } finally {
      clearTimeout(longWaitTimer);
      clearTimeout(veryLongWaitTimer);
      if (isMounted.current) {
        setIsLoading(false);
        setLoadingText('');
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);
    setLoadingText('Google ile bağlanılıyor...');
    try {
      await loginWithGoogle();
      if (isMounted.current) {
        onClose();
      }
    } catch (err: any) {
      logError('Google login failed:', err);
      if (isMounted.current) {
        setError(err?.message || 'Google ile giriş yapılırken bir hata oluştu.');
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
        setLoadingText('');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[110] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden flex flex-col relative">
        {/* Shimmer Effect */}
        <div className="absolute inset-0 pointer-events-none shimmer-effect opacity-5 z-0"></div>

        <div className="flex border-b border-[var(--border-color)] relative z-10">
          <button
            className={`flex-1 py-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${mode === 'login' ? 'bg-[var(--bg-paper)] text-[var(--accent-color)] border-b-2 border-[var(--accent-color)] shadow-sm' : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'}`}
            onClick={() => {
              if (!isLoading) {
                setMode('login');
                setError('');
              }
            }}
            disabled={isLoading}
          >
            Giriş Yap
          </button>
          <button
            className={`flex-1 py-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${mode === 'register' ? 'bg-[var(--bg-paper)] text-[var(--accent-color)] border-b-2 border-[var(--accent-color)] shadow-sm' : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'}`}
            onClick={() => {
              if (!isLoading) {
                setMode('register');
                setError('');
              }
            }}
            disabled={isLoading}
          >
            Kayıt Ol
          </button>
        </div>

        <div className="p-10 relative z-10">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-black text-[var(--text-primary)] tracking-tighter italic uppercase mb-2">
              {mode === 'login' ? 'Hoş Geldiniz!' : 'Hesap Oluştur'}
            </h2>
            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
              Oogmatik Eğitim Ekosistemi
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-2xl border border-red-500/20 flex items-start gap-3 animate-in slide-in-from-top-2">
              <i className="fa-solid fa-circle-exclamation mt-0.5"></i>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'register' && (
              <div className="space-y-1.5">
                <label
                  htmlFor="auth-name"
                  className="block text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1"
                >
                  Ad Soyad
                </label>
                <input
                  id="auth-name"
                  type="text"
                  value={name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                  className="w-full p-4 border border-[var(--border-color)] rounded-2xl bg-[var(--bg-secondary)] focus:ring-2 focus:ring-[var(--accent-color)]/20 focus:border-[var(--accent-color)] outline-none text-[var(--text-primary)] font-bold transition-all placeholder:text-[var(--text-muted)]/30"
                  placeholder="Adınız"
                  autoComplete="name"
                  required={mode === 'register'}
                  disabled={isLoading}
                />
              </div>
            )}
            <div className="space-y-1.5">
              <label
                htmlFor="auth-email"
                className="block text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1"
              >
                E-posta
              </label>
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                className="w-full p-4 border border-[var(--border-color)] rounded-2xl bg-[var(--bg-secondary)] focus:ring-2 focus:ring-[var(--accent-color)]/20 focus:border-[var(--accent-color)] outline-none text-[var(--text-primary)] font-bold transition-all placeholder:text-[var(--text-muted)]/30"
                placeholder="ornek@email.com"
                autoComplete="email"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="auth-password"
                className="block text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1"
              >
                Şifre
              </label>
              <div className="relative">
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  className="w-full p-4 border border-[var(--border-color)] rounded-2xl bg-[var(--bg-secondary)] focus:ring-2 focus:ring-[var(--accent-color)]/20 focus:border-[var(--accent-color)] outline-none text-[var(--text-primary)] font-bold transition-all pr-14 placeholder:text-[var(--text-muted)]/30"
                  placeholder="••••••"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  required
                  minLength={6}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                  title={showPassword ? 'Gizle' : 'Göster'}
                  disabled={isLoading}
                >
                  <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white font-black py-4 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6 flex items-center justify-center gap-3 shadow-lg shadow-[var(--accent-muted)] hover:scale-[1.02] active:scale-[0.98] text-[10px] uppercase tracking-[0.2em]"
            >
              {isLoading ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin"></i>
                  <span>{loadingText}</span>
                </>
              ) : mode === 'login' ? (
                'Sisteme Giriş Yap'
              ) : (
                'Yeni Hesap Oluştur'
              )}
            </button>
          </form>

          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border-color)]"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[var(--bg-paper)] px-4 text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">Veya</span>
            </div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full mt-8 bg-[var(--bg-paper)] border border-[var(--border-color)] hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-[10px] uppercase tracking-[0.2em]"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/smartlock/google.svg" alt="" className="w-5 h-5" />
            Google ile Devam Et
          </button>
        </div>
        
        <button 
          onClick={handleClose}
          className="absolute top-6 right-6 w-10 h-10 rounded-xl flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all z-20"
        >
          <i className="fa-solid fa-xmark text-lg"></i>
        </button>
      </div>
    </div>
  );
};
