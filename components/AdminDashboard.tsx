
import React, { useState, useEffect } from 'react';
import { User, FeedbackItem, ActivityStats } from '../types';
import { authService } from '../services/authService';
import { statsService } from '../services/statsService';
import { useAuth } from '../context/AuthContext';
import { ProfileView } from './ProfileView';
import { SavedWorksheetsView } from './SavedWorksheetsView';
import { FavoritesSection } from './FavoritesSection';
// New Imports
import { AdminAnalytics } from './AdminAnalytics';
import { AdminActivityManager } from './AdminActivityManager';
import { AdminPromptStudio } from './AdminPromptStudio';
import { AdminFeedback } from './AdminFeedback';
import { AdminStaticContent } from './AdminStaticContent';

interface AdminDashboardProps {
    onBack: () => void;
}

const PAGE_SIZE = 15;

const NavButton = ({ active, label, icon, onClick, count }: any) => (
    <button 
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm mb-1 ${active ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none' : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800'}`}
    >
        <i className={`fa-solid ${icon} w-5 text-center`}></i>
        <span className="flex-1 text-left">{label}</span>
        {count && <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full">{count}</span>}
    </button>
);

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'activities' | 'prompts' | 'static_content' | 'feedbacks'>('dashboard');
    
    // Data States
    const [users, setUsers] = useState<User[]>([]);
    const [stats, setStats] = useState<ActivityStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [usersCount, setUsersCount] = useState(0);

    // Inspector Mode
    const [inspectingUser, setInspectingUser] = useState<User | null>(null);
    const [inspectView, setInspectView] = useState<'profile' | 'archive' | 'favorites'>('profile');

    useEffect(() => {
        loadBaseData();
    }, []);

    const loadBaseData = async () => {
        setLoading(true);
        try {
            const [usersData, statsData] = await Promise.all([
                authService.getAllUsers(0, PAGE_SIZE),
                statsService.getAllStats()
            ]);
            setUsers(usersData.users);
            setUsersCount(usersData.count || 0);
            setStats(statsData);
        } catch (e) {
            console.error("Admin load error", e);
        } finally {
            setLoading(false);
        }
    };

    if (!user || user.role !== 'admin') return <div className="p-8 text-center text-red-600 font-bold text-xl mt-20">403 - Yetkisiz Erişim</div>;

    if (inspectingUser) {
        return (
            <div className="h-screen flex flex-col bg-zinc-50 dark:bg-black">
                <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-4 flex justify-between items-center shadow-sm z-50">
                    <div className="flex items-center gap-4">
                        <button onClick={() => { setInspectingUser(null); setInspectView('profile'); }} className="hover:bg-zinc-100 dark:hover:bg-zinc-800 p-2 rounded-lg transition-colors text-zinc-500">
                            <i className="fa-solid fa-arrow-left"></i> Geri
                        </button>
                        <div className="flex items-center gap-3 border-l border-zinc-200 dark:border-zinc-700 pl-4">
                            <img src={inspectingUser.avatar} className="w-8 h-8 rounded-full border border-zinc-200" />
                            <div>
                                <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-100">{inspectingUser.name}</h3>
                                <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Kullanıcı İnceleme Modu</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
                        <button onClick={() => setInspectView('profile')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${inspectView === 'profile' ? 'bg-white dark:bg-zinc-700 shadow-sm text-black dark:text-white' : 'text-zinc-500'}`}>Profil</button>
                        <button onClick={() => setInspectView('archive')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${inspectView === 'archive' ? 'bg-white dark:bg-zinc-700 shadow-sm text-black dark:text-white' : 'text-zinc-500'}`}>Arşiv</button>
                        <button onClick={() => setInspectView('favorites')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${inspectView === 'favorites' ? 'bg-white dark:bg-zinc-700 shadow-sm text-black dark:text-white' : 'text-zinc-500'}`}>Koleksiyon</button>
                    </div>
                </div>
                <div className="flex-1 overflow-hidden relative">
                    {inspectView === 'profile' && <ProfileView onBack={() => setInspectingUser(null)} onSelectActivity={() => {}} targetUser={inspectingUser} />}
                    {inspectView === 'archive' && <div className="h-full p-4 overflow-y-auto"><SavedWorksheetsView onLoad={() => {}} onBack={() => setInspectView('profile')} targetUserId={inspectingUser.id} /></div>}
                    {inspectView === 'favorites' && <div className="h-full p-4 overflow-y-auto"><FavoritesSection onSelectActivity={() => {}} targetUserId={inspectingUser.id} /></div>}
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex bg-zinc-50 dark:bg-black overflow-hidden font-sans">
            {/* Sidebar Navigation */}
            <aside className="w-72 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col shrink-0 z-20">
                <div className="p-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                        <i className="fa-solid fa-shield-halved text-xl"></i>
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-zinc-900 dark:text-white leading-none">Yönetim</h2>
                        <span className="text-[10px] text-zinc-400 font-bold tracking-widest uppercase">Kontrol Merkezi</span>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-4 overflow-y-auto custom-scrollbar">
                    <p className="px-4 mb-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Analiz & Kullanıcı</p>
                    <NavButton active={activeTab === 'dashboard'} label="Genel Bakış" icon="fa-chart-pie" onClick={() => setActiveTab('dashboard')} />
                    <NavButton active={activeTab === 'users'} label="Kullanıcılar" icon="fa-users" onClick={() => setActiveTab('users')} />
                    
                    <p className="px-4 mt-6 mb-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest">İçerik Motoru</p>
                    <NavButton active={activeTab === 'activities'} label="Aktiviteler" icon="fa-layer-group" onClick={() => setActiveTab('activities')} />
                    <NavButton active={activeTab === 'prompts'} label="Prompt Stüdyosu" icon="fa-terminal" onClick={() => setActiveTab('prompts')} />
                    <NavButton active={activeTab === 'static_content'} label="Veri Kaynakları" icon="fa-database" onClick={() => setActiveTab('static_content')} />
                    
                    <p className="px-4 mt-6 mb-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Destek</p>
                    <NavButton active={activeTab === 'feedbacks'} label="Gelen Kutusu" icon="fa-inbox" onClick={() => setActiveTab('feedbacks')} count={3} />
                </nav>

                <div className="p-4 border-t border-zinc-100 dark:border-zinc-800">
                    <button onClick={onBack} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors font-bold text-sm border border-zinc-200 dark:border-zinc-700">
                        <i className="fa-solid fa-arrow-right-from-bracket"></i>
                        Uygulamaya Dön
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 relative">
                {/* Top Header */}
                <header className="h-16 bg-white/80 dark:bg-zinc-900/80 backdrop-blur border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-8 shrink-0 z-10">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
                            {activeTab === 'dashboard' && 'Kontrol Paneli'}
                            {activeTab === 'users' && 'Kullanıcı Yönetimi'}
                            {activeTab === 'activities' && 'Aktivite Yöneticisi'}
                            {activeTab === 'prompts' && 'AI Prompt Laboratuvarı'}
                            {activeTab === 'static_content' && 'Veri Kaynakları (CMS)'}
                            {activeTab === 'feedbacks' && 'Geri Bildirimler'}
                        </h1>
                        <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] font-mono text-zinc-500 border border-zinc-200 dark:border-zinc-700">v1.2.0</span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-xs font-bold border border-green-100 dark:border-green-800">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            Sistem Aktif
                        </div>
                        <img src={user.avatar} className="w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-700" />
                    </div>
                </header>

                {/* Scrollable Workspace */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
                    <div className="max-w-[1600px] mx-auto pb-20">
                        {activeTab === 'dashboard' && <AdminAnalytics stats={stats} totalUsers={usersCount} />}
                        {activeTab === 'activities' && <AdminActivityManager />}
                        {activeTab === 'prompts' && <AdminPromptStudio />}
                        {activeTab === 'static_content' && <AdminStaticContent />}
                        {activeTab === 'feedbacks' && <AdminFeedback />}
                        
                        {/* Users Table (Inline for simplicity, but polished) */}
                        {activeTab === 'users' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                <div className="flex justify-between items-center bg-white dark:bg-zinc-800 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm">
                                    <div className="relative w-72">
                                        <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"></i>
                                        <input type="text" placeholder="Kullanıcı ara..." className="w-full pl-9 pr-3 py-2 bg-zinc-100 dark:bg-zinc-700/50 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="px-4 py-2 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded-lg text-sm font-bold text-zinc-600 dark:text-zinc-200 hover:bg-zinc-50"><i className="fa-solid fa-filter mr-2"></i>Filtrele</button>
                                        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none"><i className="fa-solid fa-user-plus mr-2"></i>Davet Et</button>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden shadow-sm">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 uppercase text-xs font-bold border-b border-zinc-200 dark:border-zinc-700">
                                            <tr>
                                                <th className="p-4 pl-6">Kullanıcı</th>
                                                <th className="p-4">Durum</th>
                                                <th className="p-4">Rol</th>
                                                <th className="p-4">Son Görülme</th>
                                                <th className="p-4 text-right pr-6">İşlem</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700/50">
                                            {users.map(u => (
                                                <tr key={u.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-700/20 transition-colors">
                                                    <td className="p-4 pl-6">
                                                        <div className="flex items-center gap-3">
                                                            <img src={u.avatar} className="w-10 h-10 rounded-full border border-zinc-100 dark:border-zinc-700" />
                                                            <div>
                                                                <p className="font-bold text-zinc-900 dark:text-zinc-100">{u.name}</p>
                                                                <p className="text-xs text-zinc-500">{u.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${u.status === 'active' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                            {u.status === 'active' ? 'Aktif' : 'Askıda'}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`px-2 py-1 rounded text-xs font-bold border ${u.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-zinc-100 text-zinc-600 border-zinc-200'}`}>
                                                            {u.role === 'admin' ? 'Yönetici' : 'Kullanıcı'}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-zinc-500 font-mono text-xs">
                                                        {new Date(u.lastLogin).toLocaleDateString()}
                                                    </td>
                                                    <td className="p-4 pr-6 text-right">
                                                        <button 
                                                            onClick={() => setInspectingUser(u)}
                                                            className="text-indigo-600 hover:text-indigo-800 dark:hover:text-indigo-400 font-bold text-xs hover:bg-indigo-50 dark:hover:bg-indigo-900/30 px-3 py-1.5 rounded-lg transition-colors"
                                                        >
                                                            İncele
                                                        </button>
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
            </main>
        </div>
    );
};
