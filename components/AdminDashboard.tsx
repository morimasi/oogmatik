
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { User } from '../types';

export const AdminDashboard: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { user } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [activeTab, setActiveTab] = useState<'overview' | 'users'>('overview');

    useEffect(() => {
        if (user?.role === 'admin') {
            setUsers(authService.getAllUsers());
        }
    }, [user]);

    if (user?.role !== 'admin') return <div className="p-8 text-center text-red-500">Yetkisiz Erişim</div>;

    return (
        <div className="flex h-full bg-zinc-100 dark:bg-zinc-900">
            {/* Sidebar */}
            <div className="w-64 bg-white dark:bg-zinc-800 border-r border-zinc-200 dark:border-zinc-700 flex flex-col">
                <div className="p-6 border-b border-zinc-200 dark:border-zinc-700">
                    <h2 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">Yönetici Paneli</h2>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <button 
                        onClick={() => setActiveTab('overview')}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${activeTab === 'overview' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-bold' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700'}`}
                    >
                        <i className="fa-solid fa-chart-pie w-6"></i> Genel Bakış
                    </button>
                    <button 
                        onClick={() => setActiveTab('users')}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${activeTab === 'users' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-bold' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700'}`}
                    >
                        <i className="fa-solid fa-users w-6"></i> Üyeler
                    </button>
                </nav>
                <div className="p-4 border-t border-zinc-200 dark:border-zinc-700">
                    <button onClick={onBack} className="w-full py-2 text-sm text-zinc-500 hover:text-zinc-800 flex items-center gap-2">
                        <i className="fa-solid fa-arrow-left"></i> Uygulamaya Dön
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8">
                {activeTab === 'overview' && (
                    <div>
                        <h3 className="text-2xl font-bold mb-6 text-zinc-800 dark:text-zinc-200">Sistem Durumu</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-sm border-l-4 border-indigo-500">
                                <p className="text-sm text-zinc-500">Toplam Üye</p>
                                <p className="text-4xl font-bold text-zinc-800 dark:text-zinc-100">{users.length}</p>
                            </div>
                            <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-sm border-l-4 border-emerald-500">
                                <p className="text-sm text-zinc-500">Toplam Etkinlik</p>
                                <p className="text-4xl font-bold text-zinc-800 dark:text-zinc-100">{users.reduce((acc, u) => acc + (u.worksheetCount || 0), 0)}</p>
                            </div>
                            <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-sm border-l-4 border-amber-500">
                                <p className="text-sm text-zinc-500">Sunucu Durumu</p>
                                <p className="text-xl font-bold text-emerald-500 flex items-center gap-2"><i className="fa-solid fa-check-circle"></i> Aktif</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div>
                        <h3 className="text-2xl font-bold mb-6 text-zinc-800 dark:text-zinc-200">Üye Yönetimi</h3>
                        <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm overflow-hidden border border-zinc-200 dark:border-zinc-700">
                            <table className="w-full text-left">
                                <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-700">
                                    <tr>
                                        <th className="p-4 text-sm font-semibold text-zinc-500">Kullanıcı</th>
                                        <th className="p-4 text-sm font-semibold text-zinc-500">Rol</th>
                                        <th className="p-4 text-sm font-semibold text-zinc-500">Kayıt Tarihi</th>
                                        <th className="p-4 text-right text-sm font-semibold text-zinc-500">İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                                    {users.map(u => (
                                        <tr key={u.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-700/50">
                                            <td className="p-4 flex items-center gap-3">
                                                <img src={u.avatar} className="w-10 h-10 rounded-full bg-zinc-200" alt="" />
                                                <div>
                                                    <p className="font-bold text-zinc-800 dark:text-zinc-200">{u.name}</p>
                                                    <p className="text-xs text-zinc-500">{u.email}</p>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-zinc-100 text-zinc-600'}`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm text-zinc-500">
                                                {new Date(u.createdAt).toLocaleDateString('tr-TR')}
                                            </td>
                                            <td className="p-4 text-right">
                                                {u.role !== 'admin' && (
                                                    <button 
                                                        onClick={() => {
                                                            if(confirm(`${u.name} kullanıcısını silmek istiyor musunuz?`)) {
                                                                authService.deleteUser(u.id);
                                                                setUsers(authService.getAllUsers());
                                                            }
                                                        }}
                                                        className="text-red-500 hover:text-red-700 p-2"
                                                    >
                                                        <i className="fa-solid fa-trash"></i>
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
