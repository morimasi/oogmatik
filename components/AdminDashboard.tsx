
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

// Reusing BentoCard locally or import if shared (assuming local definition for simplicity in this file scope)
const BentoCard: React.FC<{ 
    children: React.ReactNode; 
    className?: string; 
    title?: string; 
    icon?: string; 
    iconColor?: string;
    action?: React.ReactNode;
}> = ({ children, className = "", title, icon, iconColor = "bg-zinc-100 text-zinc-500", action }) => (
    <div className={`bg-white dark:bg-zinc-800 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-700 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col ${className}`}>
        {(title || icon || action) && (
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    {icon && (
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg shadow-sm ${iconColor}`}>
                            <i className={icon}></i>
                        </div>
                    )}
                    {title && <h3 className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{title}</h3>}
                </div>
                {action && <div>{action}</div>}
            </div>
        )}
        <div className="flex-1 flex flex-col">
            {children}
        </div>
    </div>
);

const StatBigValue: React.FC<{ value: string | number; label: string; trend?: string }> = ({ value, label, trend }) => (
    <div>
        <div className="text-4xl font-black text-zinc-800 dark:text-zinc-100 tracking-tight">{value}</div>
        <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-zinc-500 font-medium">{label}</span>
            {trend && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-full">{trend}</span>}
        </div>
    </div>
);

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
        <div className="h-full flex flex-col bg-zinc-100 dark:bg-zinc-900">
            <header className="bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 px-6 py-4 flex justify-between items-center shadow-sm z-10">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="text-zinc-500 hover:text-zinc-800"><i className="fa-solid fa-arrow-left"></i></button>
                    <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">Yönetici Paneli</h2>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setActiveTab('users')} className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'users' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}>Kullanıcılar</button>
                    <button onClick={() => setActiveTab('feedbacks')} className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'feedbacks' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}>Mesajlar</button>
                    <button onClick={() => setActiveTab('stats')} className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'stats' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}>Analiz</button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                <div className="max-w-7xl mx-auto">
                    
                    {/* USERS TAB - WRAPPED IN BENTO */}
                    {activeTab === 'users' && (
                        <BentoCard className="min-h-[600px] p-0 overflow-hidden" title="Kullanıcı Listesi" icon="fa-solid fa-users" iconColor="bg-blue-100 text-blue-600">
                            <div className="flex justify-between items-center px-6 mb-4">
                                <p className="text-sm text-zinc-500 font-bold">{usersCount} Kayıt</p>
                                <button onClick={() => loadData('users')} className="text-indigo-600 text-sm font-bold hover:underline">Yenile</button>
                            </div>
                            
                            <div className="overflow-x-auto flex-1">
                                {loading.users ? <div className="h-full flex items-center justify-center min-h-[300px]"><i className="fa-solid fa-spinner fa-spin text-2xl text-indigo-500"></i></div> : (
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-zinc-50 dark:bg-zinc-700/30 border-y border-zinc-200 dark:border-zinc-700">
                                        <tr>
                                            <th className="px-6 py-3 font-bold text-zinc-500 uppercase text-xs">Kullanıcı</th>
                                            <th className="px-6 py-3 font-bold text-zinc-500 uppercase text-xs">Aktivite</th>
                                            <th className="px-6 py-3 font-bold text-zinc-500 uppercase text-xs">Rol</th>
                                            <th className="px-6 py-3 font-bold text-zinc-500 uppercase text-xs">Durum</th>
                                            <th className="px-6 py-3 font-bold text-zinc-500 uppercase text-xs text-right">İşlem</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700">
                                        {users.map(u => (
                                            <tr key={u.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-700/20 transition-colors">
                                                <td className="px-6 py-4 flex items-center gap-3">
                                                    <img src={u.avatar} className="w-8 h-8 rounded-full bg-zinc-200" />
                                                    <div>
                                                        <div className="font-bold text-zinc-800 dark:text-zinc-200">{u.name}</div>
                                                        <div className="text-xs text-zinc-500">{u.email}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-zinc-700">{u.worksheetCount}</span>
                                                        <span className="text-xs text-zinc-400">üretim</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {u.role === 'admin' 
                                                        ? <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-bold">Yönetici</span> 
                                                        : <span className="bg-zinc-100 text-zinc-600 px-2 py-1 rounded text-xs font-bold">Kullanıcı</span>}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`w-2 h-2 rounded-full inline-block mr-2 ${u.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                    <span className="text-xs font-bold uppercase text-zinc-500">{u.status}</span>
                                                </td>
                                                <td className="px-6 py-4 text-right space-x-2">
                                                    {u.id !== user.id && (
                                                        <>
                                                            <button onClick={() => setInspectingUser(u)} className="p-2 hover:bg-zinc-100 rounded text-zinc-500 hover:text-indigo-600" title="İncele"><i className="fa-solid fa-eye"></i></button>
                                                            <button onClick={() => handleSetRole(u.id, u.role)} className="p-2 hover:bg-zinc-100 rounded text-zinc-500 hover:text-purple-600" title="Yetki Değiştir"><i className="fa-solid fa-user-shield"></i></button>
                                                            <button onClick={() => handleDeleteUser(u.id)} className="p-2 hover:bg-zinc-100 rounded text-zinc-500 hover:text-red-600" title="Sil"><i className="fa-solid fa-trash"></i></button>
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
                                <div className="p-4 border-t border-zinc-200 flex justify-between items-center">
                                    <button onClick={() => setUsersPage(p => Math.max(0, p - 1))} disabled={usersPage === 0} className="px-3 py-1 border rounded text-xs font-bold disabled:opacity-50">Önceki</button>
                                    <span className="text-xs text-zinc-500 font-bold">{usersPage + 1} / {usersTotalPages}</span>
                                    <button onClick={() => setUsersPage(p => p + 1)} disabled={usersPage >= usersTotalPages - 1} className="px-3 py-1 border rounded text-xs font-bold disabled:opacity-50">Sonraki</button>
                                </div>
                            )}
                        </BentoCard>
                    )}

                    {/* FEEDBACKS TAB - WRAPPED IN BENTO */}
                    {activeTab === 'feedbacks' && (
                         <BentoCard className="min-h-[600px] p-0" title="Gelen Kutusu" icon="fa-solid fa-inbox" iconColor="bg-orange-100 text-orange-600">
                            <div className="flex justify-between items-center px-6 mb-4">
                                <p className="text-sm text-zinc-500 font-bold">{feedbacksCount} Mesaj</p>
                                <button onClick={() => loadData('feedbacks')} className="text-indigo-600 text-sm font-bold hover:underline">Yenile</button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto px-6 space-y-4 pb-6">
                                {loading.feedbacks ? <div className="flex justify-center p-12"><i className="fa-solid fa-spinner fa-spin text-2xl text-indigo-500"></i></div> : feedbacks.length === 0 ? <div className="text-center text-zinc-400 p-12">Mesaj yok.</div> :
                                feedbacks.map(fb => (
                                    <div key={fb.id} className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-700/30 border border-zinc-200 dark:border-zinc-700 flex gap-4">
                                        <div className={`w-2 h-auto rounded-full ${fb.status === 'new' ? 'bg-blue-500' : 'bg-zinc-300'}`}></div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold text-zinc-900 dark:text-zinc-100">{fb.activityTitle || 'Genel'}</h4>
                                                <div className="flex text-yellow-400 text-xs">{Array.from({length:5}).map((_,i) => <i key={i} className={`${i<fb.rating?'fa-solid':'fa-regular'} fa-star`}></i>)}</div>
                                            </div>
                                            <p className="text-zinc-600 dark:text-zinc-300 text-sm mb-3">{fb.message}</p>
                                            <div className="flex justify-between items-center text-xs text-zinc-400 font-medium">
                                                <span>{fb.userName} ({fb.userEmail})</span>
                                                <span>{new Date(fb.timestamp).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </BentoCard>
                    )}
                   
                    {/* STATS TAB - FULL BENTO GRID LAYOUT */}
                    {activeTab === 'stats' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            
                            {/* Summary Cards */}
                            <BentoCard title="Toplam Üretim" icon="fa-solid fa-bolt" iconColor="bg-indigo-100 text-indigo-600">
                                <div className="mt-auto">
                                    <StatBigValue value={totalGenerations} label="Materyal Oluşturuldu" />
                                </div>
                            </BentoCard>

                            <BentoCard title="Popüler" icon="fa-solid fa-fire" iconColor="bg-orange-100 text-orange-600">
                                <div className="mt-auto">
                                    <div className="text-xl font-bold text-zinc-800 line-clamp-2 leading-tight mb-1">{mostPopular?.title || '-'}</div>
                                    <div className="text-xs text-zinc-500 font-bold bg-zinc-100 inline-block px-2 py-1 rounded">{mostPopular?.generationCount} kez</div>
                                </div>
                            </BentoCard>

                            <BentoCard title="Ortalama Süre" icon="fa-solid fa-clock" iconColor="bg-blue-100 text-blue-600">
                                <div className="mt-auto">
                                    <StatBigValue value={`${avgTime} sn`} label="Üretim Süresi" />
                                </div>
                            </BentoCard>

                            <BentoCard title="Aktif Kullanıcılar" icon="fa-solid fa-users" iconColor="bg-emerald-100 text-emerald-600">
                                <div className="mt-auto">
                                    <StatBigValue value={usersCount} label="Kayıtlı Hesap" />
                                </div>
                            </BentoCard>

                            {/* Top 5 Activities Bar Chart (Span 2x2) */}
                            <BentoCard className="md:col-span-2 lg:row-span-2" title="En Çok Kullanılan 5 Etkinlik" icon="fa-solid fa-chart-simple" iconColor="bg-violet-100 text-violet-600">
                                <div className="flex flex-col justify-end h-full gap-4 mt-4">
                                    {top5.map((item, index) => {
                                        const maxVal = top5[0].generationCount || 1;
                                        const widthPercent = ((item.generationCount || 0) / maxVal) * 100;
                                        return (
                                            <div key={item.activityId} className="w-full">
                                                <div className="flex justify-between text-xs font-bold text-zinc-600 mb-1">
                                                    <span className="truncate w-3/4">{item.title}</span>
                                                    <span>{item.generationCount}</span>
                                                </div>
                                                <div className="w-full bg-zinc-100 dark:bg-zinc-700 rounded-full h-3 overflow-hidden">
                                                    <div 
                                                        className="h-full rounded-full bg-indigo-500 transition-all duration-1000" 
                                                        style={{ width: `${widthPercent}%`, opacity: 1 - (index * 0.1) }}
                                                    ></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </BentoCard>

                            {/* Detailed Stats Table (Span 2x2) */}
                            <BentoCard className="md:col-span-2 lg:row-span-2 p-0 overflow-hidden" title="Tüm Etkinlik Verileri" icon="fa-solid fa-table" iconColor="bg-zinc-100 text-zinc-600">
                                <div className="overflow-auto flex-1 max-h-[400px]">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-zinc-50 dark:bg-zinc-800 border-b sticky top-0 z-10">
                                            <tr>
                                                <th className="p-4 cursor-pointer hover:text-indigo-600 text-xs uppercase text-zinc-500" onClick={() => handleSort('title')}>Etkinlik</th>
                                                <th className="p-4 text-center cursor-pointer hover:text-indigo-600 text-xs uppercase text-zinc-500" onClick={() => handleSort('generationCount')}>Sayı</th>
                                                <th className="p-4 text-right cursor-pointer hover:text-indigo-600 text-xs uppercase text-zinc-500" onClick={() => handleSort('lastGenerated')}>Son</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700">
                                            {sortedStats.map((item) => (
                                                <tr key={item.activityId} className="hover:bg-zinc-50 transition-colors">
                                                    <td className="p-4 font-bold text-zinc-700 text-xs">{item.title}</td>
                                                    <td className="p-4 text-center"><span className="bg-zinc-100 text-zinc-700 px-2 py-1 rounded text-xs font-bold">{item.generationCount}</span></td>
                                                    <td className="p-4 text-right text-zinc-400 text-xs font-mono">{new Date(item.lastGenerated).toLocaleDateString('tr-TR')}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </BentoCard>

                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
