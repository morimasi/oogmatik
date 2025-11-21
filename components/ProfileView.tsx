
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const ProfileView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { user, updateUser, logout } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [isEditing, setIsEditing] = useState(false);

    if (!user) return null;

    const handleSave = async () => {
        await updateUser({ name });
        setIsEditing(false);
    };

    return (
        <div className="max-w-2xl mx-auto mt-8 p-6 bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-700">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold">Profilim</h2>
                <button onClick={onBack} className="text-zinc-500 hover:text-zinc-800"><i className="fa-solid fa-times"></i></button>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
                <div className="relative group">
                    <img src={user.avatar} alt={user.name} className="w-32 h-32 rounded-full bg-indigo-100 border-4 border-white shadow-lg" />
                    <button className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full shadow-md hover:bg-indigo-700" title="Avatarı Değiştir">
                        <i className="fa-solid fa-camera"></i>
                    </button>
                </div>
                
                <div className="flex-1 text-center md:text-left">
                    {isEditing ? (
                        <div className="flex gap-2 items-center">
                            <input 
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
                                className="text-2xl font-bold bg-zinc-100 dark:bg-zinc-700 p-2 rounded border border-zinc-300"
                            />
                            <button onClick={handleSave} className="text-green-600 p-2"><i className="fa-solid fa-check"></i></button>
                        </div>
                    ) : (
                        <h3 className="text-3xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center justify-center md:justify-start gap-3">
                            {user.name}
                            <button onClick={() => setIsEditing(true)} className="text-sm text-zinc-400 hover:text-indigo-500"><i className="fa-solid fa-pen"></i></button>
                        </h3>
                    )}
                    <p className="text-zinc-500 dark:text-zinc-400">{user.email}</p>
                    <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider">
                        {user.role === 'admin' ? 'Yönetici' : 'Üye'}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-700">
                    <p className="text-sm text-zinc-500">Kayıt Tarihi</p>
                    <p className="font-medium">{new Date(user.createdAt).toLocaleDateString('tr-TR')}</p>
                </div>
                <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-700">
                    <p className="text-sm text-zinc-500">Toplam Etkinlik</p>
                    <p className="font-medium text-2xl">{user.worksheetCount}</p>
                </div>
            </div>

            <div className="border-t border-zinc-200 dark:border-zinc-700 pt-6">
                <button 
                    onClick={logout} 
                    className="w-full py-3 text-red-600 dark:text-red-400 font-bold hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                    <i className="fa-solid fa-sign-out-alt"></i> Çıkış Yap
                </button>
            </div>
        </div>
    );
};
