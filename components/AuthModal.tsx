
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const { login, register } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [loadingText, setLoadingText] = useState('Bağlanıyor...');
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
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
            setError("İnternet bağlantınız yok. Lütfen kontrol edin.");
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
                if (!name) throw new Error('İsim alanı zorunludur.');
                await register(email, password, name);
            }
            
            if (isMounted.current) {
                onClose();
            }
        } catch (err: any) {
            console.error("Auth operation failed:", err);
            if (isMounted.current) {
                const errorMessage = err?.message || "Bilinmeyen bir hata oluştu.";
                // Translate common Firebase/Supabase errors
                if (errorMessage.includes("Invalid login credentials") || errorMessage.includes("auth/invalid-credential")) {
                    setError("Hatalı e-posta veya şifre.");
                } else if (errorMessage.includes("Email not confirmed")) {
                    setError("Lütfen e-posta adresinizi doğrulayın.");
                } else if (errorMessage.includes("fetch failed") || errorMessage.includes("network")) {
                    setError("Ağ hatası. Sunucuya ulaşılamıyor, lütfen internetinizi kontrol edin.");
                } else if (errorMessage.includes("identity-toolkit-api-has-not-been-used") || errorMessage.includes("auth/api-key-not-valid")) {
                    setError("Sistem Hatası: Firebase API Anahtarı geçersiz veya Identity Toolkit servisi aktif değil. Lütfen yönetici ile iletişime geçin.");
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

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
                <div className="flex border-b border-zinc-200 dark:border-zinc-700">
                    <button
                        className={`flex-1 py-4 text-sm font-bold transition-colors ${mode === 'login' ? 'bg-white dark:bg-zinc-800 text-indigo-600 border-b-2 border-indigo-600' : 'bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500'}`}
                        onClick={() => { if(!isLoading) { setMode('login'); setError(''); } }}
                        disabled={isLoading}
                    >
                        Giriş Yap
                    </button>
                    <button
                        className={`flex-1 py-4 text-sm font-bold transition-colors ${mode === 'register' ? 'bg-white dark:bg-zinc-800 text-indigo-600 border-b-2 border-indigo-600' : 'bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500'}`}
                        onClick={() => { if(!isLoading) { setMode('register'); setError(''); } }}
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
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Ad Soyad</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full p-3 border border-zinc-300 dark:border-zinc-600 rounded-xl bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                                    placeholder="Adınız"
                                    required={mode === 'register'}
                                    disabled={isLoading}
                                />
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">E-posta</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-3 border border-zinc-300 dark:border-zinc-600 rounded-xl bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                                placeholder="ornek@email.com"
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Şifre</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-3 border border-zinc-300 dark:border-zinc-600 rounded-xl bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                                placeholder="••••••"
                                required
                                minLength={6}
                                disabled={isLoading}
                            />
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
                            ) : (mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol')}
                        </button>
                    </form>
                    
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
