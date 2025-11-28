
import React, { useState, useEffect } from 'react';
import { User, FeedbackItem, Message, ActivityStats, UserRole, ActivityType } from '../types';
import { authService } from '../services/authService';
import { messagingService } from '../services/messagingService';
import { statsService } from '../services/statsService';
import { useAuth } from '../context/AuthContext';
import { ProfileView } from './ProfileView';
import { SavedWorksheetsView } from './SavedWorksheetsView';
import { FavoritesSection } from './FavoritesSection';

interface AdminDashboardProps {
    onBack: () => void;
}

const PAGE_SIZE = 15;

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'users' | 'feedbacks' | 'messages' | 'stats'>('users');
    
    // Data States
    const [users, setUsers] = useState<User[]>([]);
    const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
    const [stats, setStats] = useState<ActivityStats[]>([]);
    const [loading, setLoading] = useState({ users: true, feedbacks: true, stats: true });

    // Pagination States
    const [usersPage, setUsersPage] = useState(0);
    const [feedbacksPage, setFeedbacksPage] = useState(0);
    const [usersCount, setUsersCount] = useState(0);
    const [feedbacksCount, setFeedbacksCount] = useState(0);

    // Inspector Mode State
    const [inspectingUser, setInspectingUser] = useState<User | null>(null);
    const [inspectView, setInspectView] = useState<'profile' | 'archive' | 'favorites'>('profile');

    // Stats Tab States
    const [sortConfig, setSortConfig] = useState<{ key: keyof ActivityStats; direction: 'asc' | 'desc' }>({ key: 'generationCount', direction: 'desc' });
    
    // Load data based on active tab and pagination
    const loadData = async (tab = activeTab, page = 0) => {
        setLoading(prev => ({...prev, [tab]: true}));
        try {
            if (tab === 'users') {
                const { users: usersData, count } = await authService.getAllUsers(usersPage, PAGE_SIZE);
                setUsers(usersData);
                setUsersCount(count || 0);
            }
            if (tab === 'feedbacks') {
                 const { feedbacks: feedbacksData, count } = await messagingService.getAllFeedbacks(feedbacksPage, PAGE_SIZE);
                setFeedbacks(feedbacksData);
                setFeedbacksCount(count || 0);
            }
            if (tab === 'stats') {
                const statsData = await statsService.getAllStats();
                setStats(statsData);
            }
        } catch (error) {
            console.error(`Admin data load error for tab ${tab}:`, error);
        } finally {
            setLoading(prev => ({...prev, [tab]: false}));
        }
    };
    
    // Initial load and tab change effect
    useEffect(() => {
        if (!inspectingUser) {
            loadData(activeTab);
        }
    }, [activeTab, inspectingUser]);

    // Pagination change effect
    useEffect(() => {
        if(activeTab === 'users' && !inspectingUser) loadData('users');
    }, [usersPage]);

    useEffect(() => {
        if(activeTab === 'feedbacks' && !inspectingUser) loadData('feedbacks');
    }, [feedbacksPage]);

    // --- USER ACTIONS ---
    const handleDeleteUser = async (id: string) => {
        if (confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
            await authService.deleteUser(id);
            loadData();
        }
    };

    const handleToggleStatus = async (id: string, currentStatus: string) => {
        await authService.toggleUserStatus(id, currentStatus);
        loadData();
    };

    const handleSetRole = async (id: string, currentRole: UserRole) => {
        const newRole: UserRole = currentRole === 'admin' ? 'user' : 'admin';
        const actionText = newRole === 'admin' ? 'yönetici yapmak istediğinizden' : 'kullanıcı yetkilerine düşürmek istediğinizden';
        if (confirm(`Bu kullanıcıyı ${actionText} emin misiniz?`)) {
            try {
                await authService.updateUserRole(id, newRole);
                loadData();
            } catch (error: any) {
                console.error("Role change failed:", error);
                alert("Rol güncellenirken bir hata oluştu: " + error.message);
            }
        }
    };

    // --- STATS SORTING ---
    const handleSort = (key: keyof ActivityStats) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedStats = React.useMemo(() => {
        let sortableItems = [...stats];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [stats, sortConfig]);

    // Safely calculate aggregate stats
    const totalGenerations = stats.reduce((acc, curr) => acc + (curr.generationCount || 0), 0);
    const mostPopular = stats.length > 0 ? stats.reduce((prev, current) => ((prev.generationCount || 0) > (current.generationCount || 0)) ? prev : current) : null;
    const top5 = [...stats].sort((a, b) => (b.generationCount || 0) - (a.generationCount || 0)).slice(0, 5);
    const avgTime = stats.length > 0 ? Math.round(stats.reduce((a,b) => a + (b.avgCompletionTime || 0), 0) / stats.length) : 0;
    
    const usersTotalPages = Math.ceil(usersCount / PAGE_SIZE);
    const feedbacksTotalPages = Math.ceil(feedbacksCount / PAGE_SIZE);

    if (!user || user.role !== 'admin') return <div className="p-8 text-center text-red-600">Yetkisiz Erişim</div>;

    // --- INSPECTOR MODE RENDER ---
    if (inspectingUser) {
        return (
            <div className="h-full flex flex-col bg-zinc-50 dark:bg-zinc-900">
                <div className="bg-zinc-800 text-white p-4 flex justify-between items-center shadow-md">
                    <div className="flex items-center gap-4">
                        <button onClick={() => { setInspectingUser(null); setInspectView('profile'); }} className="hover:bg-zinc-700 p-2 rounded-lg transition-colors">
                            <i className="fa-solid fa-arrow-left"></i> Geri
                        </button>
                        <div className="flex items-center gap-3 border-l border-zinc-600 pl-4">
                            <img src={inspectingUser.avatar} className="w-10 h-10 rounded-full border-2 border-zinc-500" />
                            <div>
                                <h3 className="font-bold text-sm">{inspectingUser.name}</h3>
                                <p className="text-xs text-zinc-400">Yönetici İncelemesi</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setInspectView('profile')} className={`px-4 py-2 rounded-lg text-sm font-bold ${inspectView === 'profile' ? 'bg-indigo-600 text-white' : 'bg-zinc-700 text-zinc-300'}`}>Profil</button>
                        <button onClick={() => setInspectView('archive')} className={`px-4 py-2 rounded-lg text-sm font-bold ${inspectView === 'archive' ? 'bg-indigo-600 text-white' : 'bg-zinc-700 text-zinc-300'}`}>Arşiv</button>
                        <button onClick={() => setInspectView('favorites')} className={`px-4 py-2 rounded-lg text-sm font-bold ${inspectView === 'favorites' ? 'bg-indigo-600 text-white' : 'bg-zinc-700 text-zinc-300'}`}>Favoriler</button>
                    </div>
                </div>
                
                <div className="flex-1 overflow-hidden">
                    {inspectView === 'profile' && (
                        <ProfileView 
                            onBack={() => { setInspectingUser(null); }} 
                            onSelectActivity={() => {}} 
                            targetUser={inspectingUser}
                        />
                    )}
                    {inspectView === 'archive' && (
                        <div className="h-full p-4 overflow-y-auto">
                            <SavedWorksheetsView 
                                onLoad={() => {}} 
                                onBack={() => setInspectView('profile')} 
                                targetUserId={inspectingUser.id}
                            />
                        </div>
                    )}
                    {inspectView === 'favorites' && (
                        <div className="h-full p-4 overflow-y-auto">
                            <FavoritesSection 
                                onSelectActivity={() => {}} 
                                targetUserId={inspectingUser.id}
                            />
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-zinc-50 dark:bg-zinc-900">
            <header className="bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 p-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="text-zinc-500 hover:text-zinc-800"><i className="fa-solid fa-arrow-left"></i></button>
                    <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">Yönetici Paneli</h2>
                </div>
                <div className="flex gap-2 overflow-x-auto">
                    <button onClick={() => setActiveTab('users')} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap ${activeTab === 'users' ? 'bg-indigo-100 text-indigo-700' : 'text-zinc-500'}`}>Kullanıcılar</button>
                    <button onClick={() => setActiveTab('feedbacks')} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap ${activeTab === 'feedbacks' ? 'bg-indigo-100 text-indigo-700' : 'text-zinc-500'}`}>Geri Bildirimler</button>
                    <button onClick={() => setActiveTab('stats')} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap ${activeTab === 'stats' ? 'bg-indigo-100 text-indigo-700' : 'text-zinc-500'}`}>İstatistikler</button>
                </div>
            </header>

            <div className="flex-1 overflow-hidden p-4 md:p-8">
                {/* USERS TAB */}
                {activeTab === 'users' && (
                    <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 overflow-hidden flex flex-col h-full">
                        <div className="p-4 border-b border-zinc-200 dark:border-zinc-700 flex justify-between items-center">
                            <h3 className="font-bold">Toplam {usersCount} Kullanıcı</h3>
                            <button onClick={() => loadData('users')} className="text-sm text-indigo-600 font-bold flex items-center gap-2"><i className="fa-solid fa-sync"></i> Yenile</button>
                        </div>
                        <div className="overflow-x-auto flex-1">
                            {loading.users ? <div className="h-full flex items-center justify-center"><i className="fa-solid fa-spinner fa-spin text-2xl text-indigo-500"></i></div> : (
                            <table className="w-full text-left text-sm">
                                <thead className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-700 sticky top-0">
                                    <tr>
                                        <th className="p-4 font-semibold text-zinc-600 dark:text-zinc-400">Kullanıcı</th>
                                        <th className="p-4 font-semibold text-zinc-600 dark:text-zinc-400">Üretim</th>
                                        <th className="p-4 font-semibold text-zinc-600 dark:text-zinc-400">Son Etkinlik</th>
                                        <th className="p-4 font-semibold text-zinc-600 dark:text-zinc-400">Plan</th>
                                        <th className="p-4 font-semibold text-zinc-600 dark:text-zinc-400">Durum</th>
                                        <th className="p-4 font-semibold text-zinc-600 dark:text-zinc-400 text-right">İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700">
                                    {users.map(u => (
                                        <tr key={u.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-700/30">
                                            <td className="p-4 flex items-center gap-3">
                                                <img src={u.avatar} alt="" className="w-8 h-8 rounded-full bg-zinc-200" />
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                                        {u.name}
                                                        {u.role === 'admin' && <span className="bg-purple-100 text-purple-700 text-[10px] px-1 rounded">ADMIN</span>}
                                                    </span>
                                                    <span className="text-xs text-zinc-500">{u.email}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">{u.worksheetCount}</span>
                                            </td>
                                            <td className="p-4">
                                                {u.lastActiveActivity ? (
                                                    <div className="flex flex-col">
                                                        <span className="text-zinc-700 dark:text-zinc-300 font-medium">{u.lastActiveActivity.title}</span>
                                                        <span className="text-xs text-zinc-500">{new Date(u.lastActiveActivity.date).toLocaleDateString()}</span>
                                                    </div>
                                                ) : <span className="text-zinc-400">-</span>}
                                            </td>
                                            <td className="p-4 text-zinc-600 dark:text-zinc-400 capitalize">{u.subscriptionPlan}</td>
                                            <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold ${u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{u.status}</span></td>
                                            <td className="p-4 text-right space-x-2">
                                                {u.id !== user.id && (
                                                    <>
                                                        <button onClick={() => setInspectingUser(u)} className="text-blue-600 hover:text-blue-800 bg-blue-50 p-2 rounded-lg" title="Detaylı İncele"><i className="fa-solid fa-eye"></i></button>
                                                        <button onClick={() => handleSetRole(u.id, u.role)} className="text-purple-600 hover:text-purple-800 p-2 rounded-lg hover:bg-purple-50" title={u.role === 'admin' ? 'Yönetici Yetkisini Al' : 'Yönetici Yap'}><i className={`fa-solid ${u.role === 'admin' ? 'fa-user-slash' : 'fa-user-shield'}`}></i></button>
                                                        <button onClick={() => handleToggleStatus(u.id, u.status)} className="text-amber-600 hover:text-amber-800 p-2 rounded-lg hover:bg-amber-50" title={u.status === 'active' ? 'Askıya Al' : 'Aktifleştir'}><i className={`fa-solid ${u.status === 'active' ? 'fa-ban' : 'fa-check'}`}></i></button>
                                                        <button onClick={() => handleDeleteUser(u.id)} className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50" title="Sil"><i className="fa-solid fa-trash"></i></button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            )}
                        </div>
                         {usersTotalPages > 1 && (
                            <div className="p-4 border-t border-zinc-200 dark:border-zinc-700 flex justify-between items-center">
                                <button onClick={() => setUsersPage(p => Math.max(0, p - 1))} disabled={usersPage === 0} className="px-3 py-1 border rounded text-sm disabled:opacity-50">Önceki</button>
                                <span>Sayfa {usersPage + 1} / {usersTotalPages}</span>
                                <button onClick={() => setUsersPage(p => p + 1)} disabled={usersPage >= usersTotalPages - 1} className="px-3 py-1 border rounded text-sm disabled:opacity-50">Sonraki</button>
                            </div>
                        )}
                    </div>
                )}

                {/* FEEDBACKS TAB */}
                {activeTab === 'feedbacks' && (
                     <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 overflow-hidden flex flex-col h-full">
                        <div className="p-4 border-b border-zinc-200 dark:border-zinc-700 flex justify-between items-center">
                            <h3 className="font-bold">Toplam {feedbacksCount} Geri Bildirim</h3>
                            <button onClick={() => loadData('feedbacks')} className="text-sm text-indigo-600 font-bold flex items-center gap-2"><i className="fa-solid fa-sync"></i> Yenile</button>
                        </div>
                        <div className="overflow-y-auto flex-1 p-4 space-y-4">
                            {loading.feedbacks ? <div className="h-full flex items-center justify-center"><i className="fa-solid fa-spinner fa-spin text-2xl text-indigo-500"></i></div> : feedbacks.length === 0 ? <div className="text-center p-8 text-zinc-400">Henüz geri bildirim yok.</div> :
                            feedbacks.map(fb => (
                                <div key={fb.id} className={`p-6 rounded-xl border ${fb.status === 'new' ? 'border-indigo-500 shadow-md' : 'border-zinc-200 dark:border-zinc-700 shadow-sm'}`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <span className="font-bold text-zinc-900 dark:text-zinc-100">{fb.userName || 'Anonim'}</span>
                                            <span className="text-xs text-zinc-500"> ({fb.userEmail})</span>
                                            {fb.status === 'new' && <span className="ml-2 bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full">YENİ</span>}
                                        </div>
                                        <div className="flex text-yellow-400 text-sm">{Array.from({length: 5}).map((_, i) => (<i key={i} className={`${i < fb.rating ? 'fa-solid' : 'fa-regular'} fa-star`}></i>))}</div>
                                    </div>
                                    <div className="mb-4">
                                        <span className="inline-block px-2 py-1 bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 text-xs rounded mb-2">{fb.activityTitle || 'Genel'}</span>
                                        <p className="text-zinc-700 dark:text-zinc-200">{fb.message}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                         {feedbacksTotalPages > 1 && (
                            <div className="p-4 border-t border-zinc-200 dark:border-zinc-700 flex justify-between items-center">
                                <button onClick={() => setFeedbacksPage(p => Math.max(0, p - 1))} disabled={feedbacksPage === 0} className="px-3 py-1 border rounded text-sm disabled:opacity-50">Önceki</button>
                                <span>Sayfa {feedbacksPage + 1} / {feedbacksTotalPages}</span>
                                <button onClick={() => setFeedbacksPage(p => p + 1)} disabled={feedbacksPage >= feedbacksTotalPages - 1} className="px-3 py-1 border rounded text-sm disabled:opacity-50">Sonraki</button>
                            </div>
                        )}
                    </div>
                )}
               
                {/* STATS TAB */}
                {activeTab === 'stats' && (
                    <div className="flex flex-col h-full gap-6 overflow-y-auto pb-20">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm flex items-center gap-4"><div className="w-12 h-12 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-2xl"><i className="fa-solid fa-bolt"></i></div><div><p className="text-sm text-zinc-500 dark:text-zinc-400 font-bold uppercase">Toplam Üretim</p><p className="text-3xl font-black text-zinc-800 dark:text-zinc-100">{totalGenerations}</p></div></div>
                            <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm flex items-center gap-4"><div className="w-12 h-12 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl"><i className="fa-solid fa-trophy"></i></div><div><p className="text-sm text-zinc-500 dark:text-zinc-400 font-bold uppercase">En Popüler</p><p className="text-xl font-bold text-zinc-800 dark:text-zinc-100 line-clamp-1" title={mostPopular?.title || '-'}>{mostPopular?.title || '-'}</p></div></div>
                            <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm flex items-center gap-4"><div className="w-12 h-12 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center text-2xl"><i className="fa-solid fa-clock"></i></div><div><p className="text-sm text-zinc-500 dark:text-zinc-400 font-bold uppercase">Ort. Tamamlama</p><p className="text-3xl font-black text-zinc-800 dark:text-zinc-100">{avgTime} dk</p></div></div>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-1 bg-white dark:bg-zinc-800 p-6 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm"><h3 className="text-lg font-bold mb-6 text-zinc-800 dark:text-zinc-100">En Çok Kullanılan 5 Etkinlik</h3><div className="flex flex-col justify-end h-64 gap-3">{top5.map((item, index) => {const maxVal = top5[0].generationCount || 1; const widthPercent = ((item.generationCount || 0) / maxVal) * 100; return (<div key={item.activityId} className="w-full"><div className="flex justify-between text-xs mb-1"><span className="font-medium truncate w-3/4" title={item.title}>{item.title}</span><span className="font-bold">{item.generationCount}</span></div><div className="w-full bg-zinc-100 dark:bg-zinc-700 rounded-full h-3 overflow-hidden"><div className="h-full rounded-full bg-indigo-500" style={{ width: `${widthPercent}%`, opacity: 1 - (index * 0.15) }}></div></div></div>);})}</div></div>
                            <div className="lg:col-span-2 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm overflow-hidden flex flex-col"><div className="p-4 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 flex justify-between items-center"><h3 className="font-bold text-zinc-800 dark:text-zinc-100">Tüm Etkinlik Detayları</h3></div><div className="overflow-x-auto flex-1"><table className="w-full text-left text-sm"><thead className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 uppercase font-bold text-xs sticky top-0"><tr><th className="p-4 cursor-pointer hover:text-indigo-600" onClick={() => handleSort('title')}>Etkinlik Adı <i className="fa-solid fa-sort ml-1"></i></th><th className="p-4 text-center cursor-pointer hover:text-indigo-600" onClick={() => handleSort('generationCount')}>Üretim <i className="fa-solid fa-sort ml-1"></i></th><th className="p-4 text-center cursor-pointer hover:text-indigo-600" onClick={() => handleSort('avgCompletionTime')}>Ort. Süre (dk) <i className="fa-solid fa-sort ml-1"></i></th><th className="p-4 text-right cursor-pointer hover:text-indigo-600" onClick={() => handleSort('lastGenerated')}>Son İşlem <i className="fa-solid fa-sort ml-1"></i></th></tr></thead><tbody className="divide-y divide-zinc-100 dark:divide-zinc-700">{sortedStats.map((item) => (<tr key={item.activityId} className="hover:bg-zinc-50 dark:hover:bg-zinc-700/30 transition-colors"><td className="p-4 font-medium text-zinc-800 dark:text-zinc-200">{item.title}</td><td className="p-4 text-center"><span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded font-bold text-xs">{item.generationCount}</span></td><td className="p-4 text-center text-zinc-600 dark:text-zinc-400">{item.avgCompletionTime}</td><td className="p-4 text-right text-zinc-500 text-xs">{new Date(item.lastGenerated).toLocaleDateString('tr-TR')}</td></tr>))}</tbody></table></div></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
