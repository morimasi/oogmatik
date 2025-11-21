
import React, { useState } from 'react';
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

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (mode === 'login') {
                await login(email, password);
            } else {
                if (!name) throw new Error('İsim alanı zorunludur.');
                await register(email, password, name);
            }
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="flex border-b border-zinc-200 dark:border-zinc-700">
                    <button
                        className={`flex-1 py-4 text-sm font-bold transition-colors ${mode === 'login' ? 'bg-white dark:bg-zinc-800 text-indigo-600 border-b-2 border-indigo-600' : 'bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500'}`}
                        onClick={() => setMode('login')}
                    >
                        Giriş Yap
                    </button>
                    <button
                        className={`flex-1 py-4 text-sm font-bold transition-colors ${mode === 'register' ? 'bg-white dark:bg-zinc-800 text-indigo-600 border-b-2 border-indigo-600' : 'bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500'}`}
                        onClick={() => setMode('register')}
                    >
                        Kayıt Ol
                    </button>
                </div>

                <div className="p-8">
                    <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-6 text-center">
                        {mode === 'login' ? 'Hoş Geldiniz!' : 'Hesap Oluştur'}
                    </h2>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-sm rounded-lg">
                            {error}
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
                                    className="w-full p-3 border border-zinc-300 dark:border-zinc-600 rounded-xl bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="Adınız"
                                />
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">E-posta</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-3 border border-zinc-300 dark:border-zinc-600 rounded-xl bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="ornek@email.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Şifre</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-3 border border-zinc-300 dark:border-zinc-600 rounded-xl bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 mt-4"
                        >
                            {isLoading ? 'İşleniyor...' : (mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol')}
                        </button>
                    </form>
                    
                    <button onClick={onClose} className="w-full mt-4 text-zinc-400 text-sm hover:text-zinc-600">Vazgeç</button>
                </div>
            </div>
        </div>
    );
};
