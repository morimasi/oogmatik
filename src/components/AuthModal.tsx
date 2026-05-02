import { AppError } from '../utils/AppError';
import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/useAuthStore';

import { logInfo, logError, logWarn } from '../utils/logger.js';
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="flex border-b border-zinc-200 dark:border-zinc-700">
          <button
            className={`flex-1 py-4 text-sm font-bold transition-colors ${mode === 'login' ? 'bg-white dark:bg-zinc-800 text-indigo-600 border-b-2 border-indigo-600' : 'bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500'}`}
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
            className={`flex-1 py-4 text-sm font-bold transition-colors ${mode === 'register' ? 'bg-white dark:bg-zinc-800 text-indigo-600 border-b-2 border-indigo-600' : 'bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500'}`}
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

        <div className="p-8">
          <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-6 text-center">
            {mode === 'login' ? 'Hoş Geldiniz!' : 'Hesap Oluştur'}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-sm rounded-lg border border-red-200 dark:border-red-800 flex items-start gap-2 animate-pulse">
              <i className="fa-solid fa-circle-exclamation mt-0.5"></i>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label
                  htmlFor="auth-name"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
                >
                  Ad Soyad{' '}
                  <span className="text-red-500" aria-hidden="true">
                    *
                  </span>
                </label>
                <input
                  id="auth-name"
                  type="text"
                  value={name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                  className="w-full p-3 border border-zinc-300 dark:border-zinc-600 rounded-xl bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                  placeholder="Adınız"
                  autoComplete="name"
                  required={mode === 'register'}
                  disabled={isLoading}
                />
              </div>
            )}
            <div>
              <label
                htmlFor="auth-email"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
              >
                E-posta{' '}
                <span className="text-red-500" aria-hidden="true">
                  *
                </span>
              </label>
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                className="w-full p-3 border border-zinc-300 dark:border-zinc-600 rounded-xl bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                placeholder="ornek@email.com"
                autoComplete="email"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label
                htmlFor="auth-password"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
              >
                Şifre{' '}
                <span className="text-red-500" aria-hidden="true">
                  *
                </span>
              </label>
              <div className="relative">
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  className="w-full p-3 border border-zinc-300 dark:border-zinc-600 rounded-xl bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white pr-12"
                  placeholder="••••••"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  required
                  minLength={6}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
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
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-4 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              {isLoading ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin"></i>
                  <span>{loadingText}</span>
                </>
              ) : mode === 'login' ? (
                'Giriş Yap'
              ) : (
                'Kayıt Ol'
              )}
            </button>
          </form>

          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200 dark:border-zinc-700"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-zinc-800 px-2 text-zinc-400 font-bold">Veya</span>
            </div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full mt-6 bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-100 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-3 shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
              <path fill="none" d="M0 0h24v24H0z" />
            </svg>
            <span>Google ile Giriş Yap</span>
          </button>

          {/* Vazgeç butonu */}
          <button
            onClick={handleClose}
            type="button"
            className="w-full mt-4 text-zinc-400 text-sm hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors py-2"
          >
            Vazgeç
          </button>
        </div>
      </div>
    </div>
  );
};
