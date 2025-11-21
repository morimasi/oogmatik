

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { User } from '../types';

// --- UI COMPONENTS ---

const StatCard: React.FC<{ title: string; value: string | number; change: string; icon: string; color: string; trend: 'up' | 'down' }> = ({ title, value, change, icon, color, trend }) => (
    <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 flex items-start justify-between hover:shadow-md transition-shadow">
        <div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-zinc-800 dark:text-zinc-100">{value}</h3>
            <div className={`flex items-center gap-1 mt-2 text-xs font-bold ${trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                <i className={`fa-solid fa-arrow-${trend}`}></i>
                <span>{change}</span>
                <span className="text-zinc-400 font-normal ml-1">geçen haftaya göre</span>
            </div>
        </div>
        <div className={`p-3 rounded-lg ${color} bg-opacity-10 text-opacity-100 flex items-center justify-center`}>
            <i className={`${icon} text-xl`}></i>
        </div>
    </div>
);

const ActivityChart = () => {
    // Mock chart bars using CSS
    const data = [40, 65, 45, 80, 55, 90, 70];
    return (
        <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 h-full">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-zinc-800 dark:text-zinc-100">Haftalık Aktivite</h3>
                <button className="text-zinc-400 hover:text-indigo-500"><i className="fa-solid fa-ellipsis"></i></button>
            </div>
            <div className="flex items-end justify-between gap-2 h-40">
                {data.map((h, i) => (
                    <div key={i} className="w-full bg-zinc-100 dark:bg-zinc-700 rounded-t-md relative group overflow-hidden">
                        <div 
                            className="absolute bottom-0 left-0 right-0 bg-indigo-500 group-hover:bg-indigo-600 transition-all duration-500 rounded-t-md" 
                            style={{ height: `${h}%` }}
                        ></div>
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            {h}
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-zinc-400 font-medium">
                <span>Pzt</span><span>Sal</span><span>Çar</span><span>Per</span><span>Cum</span><span>Cmt</span><span>Paz</span>
            </div>
        </div>
    );
}

export const AdminDashboard: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { user } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'settings'>('overview');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (user?.role === 'admin') {
            setUsers(authService.getAllUsers());
        }
    }, [user]);

    if (user?.role !== 'admin') return <div className="flex items-center justify-center h-screen bg-zinc-100 text-red-500 font-bold">Yetkisiz Erişim</div>;

    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex h-screen bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-zinc-800 border-r border-zinc-200 dark:border-zinc-700 flex flex-col z-10 shadow-sm">
                <div className="p-6 border-b border-zinc-200 dark:border-zinc-700 flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">A</div>
                    <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">Admin Paneli</h2>
                </div>
                
                <nav className="flex-1 p-4 space-y-1">
                    <button 
                        onClick={() => setActiveTab('overview')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'overview' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700/50'}`}
                    >
                        <i className="fa-solid fa-gauge-high w-5 text-center"></i> Genel Bakış
                    </button>
                    <button 
                        onClick={() => setActiveTab('users')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'users' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700/50'}`}
                    >
                        <i className="fa-solid fa-users w-5 text-center"></i> Kullanıcılar
                    </button>
                    <button 
                        onClick={() => setActiveTab('settings')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'settings' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700/50'}`}
                    >
                        <i className="fa-solid fa-gear w-5 text-center"></i> Ayarlar
                    </button>
                </nav>

                <div className="p-4 border-t border-zinc-200 dark:border-zinc-700">
                    <button onClick={onBack} className="w-full py-2 px-4 rounded-lg border border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2 text-sm font-bold">
                        <i className="fa-solid fa-arrow-right-from-bracket"></i> Çıkış
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <header className="bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 p-4 md:px-8 md:py-4 flex justify-between items-center sticky top-0 z-20">
                    <h1 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 capitalize">{activeTab === 'overview' ? 'Gösterge Paneli' : activeTab === 'users' ? 'Kullanıcı Yönetimi' : 'Sistem Ayarları'}</h1>
                    <div className="flex items-center gap-4">
                        <div className="relative hidden md:block">
                            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"></i>
                            <input type="text" placeholder="Ara..." className="pl-10 pr-4 py-2 bg-zinc-100 dark:bg-zinc-700 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64" />
                        </div>
                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold">
                            Y
                        </div>
                    </div>
                </header>

                <div className="p-4 md:p-8 max-w-7xl mx-auto">
                    {activeTab === 'overview' && (
                        <div className="space-y-6 fade-in">
                            {/* KPI Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <StatCard title="Toplam Kullanıcı" value={users.length} change="+12%" icon="fa-solid fa-users" color="bg-indigo-500 text-indigo-500" trend="up" />
                                <StatCard title="Aktif Oturumlar" value="24" change="+5%" icon="fa-solid fa-signal" color="bg-emerald-500 text-emerald-500" trend="up" />
                                <StatCard title="Üretilen İçerik" value={users.reduce((a,b)=>a+b.worksheetCount, 0)} change="+18%" icon="fa-solid fa-file-pen" color="bg-blue-500 text-blue-500" trend="up" />
                                <StatCard title="Sunucu Yükü" value="32%" change="-2%" icon="fa-solid fa-server" color="bg-amber-500 text-amber-500" trend="down" />
                            </div>

                            {/* Charts Section */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 h-80">
                                    <ActivityChart />
                                </div>
                                <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700">
                                    <h3 className="font-bold text-lg mb-4 text-zinc-800 dark:text-zinc-100">Depolama Kullanımı</h3>
                                    <div className="flex items-center justify-center h-48 relative">
                                        <svg viewBox="0 0 36 36" className="w-40 h-40 transform -rotate-90">
                                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e4e4e7" strokeWidth="3.8" className="dark:stroke-zinc-700" />
                                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#6366f1" strokeWidth="3.8" strokeDasharray="75, 100" className="drop-shadow-md" />
                                        </svg>
                                        <div className="absolute text-center">
                                            <span className="text-3xl font-bold text-zinc-800 dark:text-zinc-100">75%</span>
                                            <p className="text-xs text-zinc-500">Dolu</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 space-y-2">
                                        <div className="flex justify-between text-sm"><span className="text-zinc-500">İmajlar</span><span className="font-bold">45 GB</span></div>
                                        <div className="flex justify-between text-sm"><span className="text-zinc-500">Veritabanı</span><span className="font-bold">12 GB</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 overflow-hidden fade-in">
                            <div className="p-4 border-b border-zinc-200 dark:border-zinc-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="relative">
                                    <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"></i>
                                    <input 
                                        type="text" 
                                        placeholder="Kullanıcı Ara..." 
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 pr-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-zinc-50 dark:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 w-full sm:w-64"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button className="px-3 py-2 bg-zinc-100 dark:bg-zinc-700 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200"><i className="fa-solid fa-filter"></i> Filtrele</button>
                                    <button className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"><i className="fa-solid fa-user-plus"></i> Yeni Ekle</button>
                                </div>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-zinc-50 dark:bg-zinc-900 text-xs uppercase text-zinc-500 font-semibold">
                                        <tr>
                                            <th className="p-4">Kullanıcı</th>
                                            <th className="p-4">Rol</th>
                                            <th className="p-4">Durum</th>
                                            <th className="p-4">Plan</th>
                                            <th className="p-4">Son Giriş</th>
                                            <th className="p-4 text-right">İşlemler</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700 text-sm">
                                        {filteredUsers.map(u => (
                                            <tr key={u.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors group">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <img src={u.avatar} alt="" className="w-10 h-10 rounded-full bg-zinc-200 object-cover" />
                                                        <div>
                                                            <p className="font-bold text-zinc-800 dark:text-zinc-200">{u.name}</p>
                                                            <p className="text-xs text-zinc-500">{u.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold uppercase ${u.role === 'admin' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-zinc-100 text-zinc-600 border border-zinc-200'}`}>
                                                        {u.role === 'admin' && <i className="fa-solid fa-shield-halved mr-1"></i>}
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {u.status === 'active' ? 'Aktif' : 'Askıda'}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    {u.subscriptionPlan === 'pro' && <span className="text-amber-600 font-bold"><i className="fa-solid fa-star mr-1"></i>Pro</span>}
                                                    {u.subscriptionPlan === 'free' && <span className="text-zinc-500">Ücretsiz</span>}
                                                    {u.subscriptionPlan === 'enterprise' && <span className="text-blue-600 font-bold"><i className="fa-solid fa-building mr-1"></i>Kurumsal</span>}
                                                </td>
                                                <td className="p-4 text-zinc-500">
                                                    {new Date(u.lastLogin).toLocaleDateString('tr-TR')}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {u.role !== 'admin' && (
                                                            <>
                                                                <button 
                                                                    onClick={() => {authService.toggleUserStatus(u.id); setUsers(authService.getAllUsers())}}
                                                                    className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center"
                                                                    title={u.status === 'active' ? 'Askıya Al' : 'Aktifleştir'}
                                                                >
                                                                    <i className={`fa-solid ${u.status === 'active' ? 'fa-ban' : 'fa-check'}`}></i>
                                                                </button>
                                                                <button 
                                                                    onClick={() => { if(confirm("Silmek istediğine emin misin?")) { authService.deleteUser(u.id); setUsers(authService.getAllUsers()) }}}
                                                                    className="w-8 h-8 rounded-full bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center"
                                                                    title="Sil"
                                                                >
                                                                    <i className="fa-solid fa-trash"></i>
                                                                </button>
                                                            </>
                                                        )}
                                                        <button className="w-8 h-8 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                                            <i className="fa-solid fa-pen"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-4 border-t border-zinc-200 dark:border-zinc-700 flex justify-between items-center text-sm text-zinc-500">
                                <span>Toplam {filteredUsers.length} kayıt gösteriliyor</span>
                                <div className="flex gap-2">
                                    <button className="px-3 py-1 border rounded hover:bg-zinc-50 disabled:opacity-50" disabled>Önceki</button>
                                    <button className="px-3 py-1 border rounded hover:bg-zinc-50">Sonraki</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};
