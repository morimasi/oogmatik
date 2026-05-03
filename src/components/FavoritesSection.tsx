import React, { useEffect, useState, useMemo } from 'react';
import { Activity, ActivityStats, ActivityType } from '../types';
import { statsService } from '../services/statsService';
import { ACTIVITIES, ACTIVITY_CATEGORIES } from '../constants';
import { useAuthStore } from '../store/useAuthStore';
import { authService } from '../services/authService';

import { logInfo, logError, logWarn } from '../utils/logger.js';
interface FavoritesSectionProps {
    onSelectActivity: (id: ActivityType) => void;
    onBack?: () => void;
    targetUserId?: string;
}

interface FavoriteCardProps {
    activity: Activity;
    stats?: ActivityStats;
    onSelect: () => void;
    onRemove?: () => void;
    isReadOnly: boolean;
    rank?: number;
    usageCount?: number;
}

// --- UI COMPONENTS ---

const CategoryPill: React.FC<{ id: string, active: boolean, onClick: () => void }> = ({ id, active, onClick }) => {
    const category = ACTIVITY_CATEGORIES.find(c => c.id === id);
    if (!category && id !== 'all') return null;

    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 border whitespace-nowrap shadow-sm hover:shadow-md active:scale-95 uppercase tracking-widest ${active
                    ? 'bg-[var(--accent-color)] text-white border-[var(--accent-color)] shadow-lg shadow-[var(--accent-muted)]'
                    : 'bg-[var(--bg-paper)] text-[var(--text-muted)] border-[var(--border-color)] hover:border-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
                }`}
        >
            {id !== 'all' && <i className={`${category?.icon} opacity-70`}></i>}
            {id === 'all' ? 'Tümü' : category?.title}
        </button>
    );
};

const FavoriteCard: React.FC<FavoriteCardProps> = ({
    activity,
    onSelect,
    onRemove,
    isReadOnly,
    usageCount = 0
}) => {
    const category = ACTIVITY_CATEGORIES.find(cat => cat.activities.includes(activity.id));

    // Dynamic Gradient based on Category ID for quick visual id
    const getGradient = () => {
        if (category?.id === 'math-logic') return 'from-blue-500 to-indigo-600 shadow-indigo-200 dark:shadow-none';
        if (category?.id === 'reading-verbal') return 'from-emerald-500 to-teal-600 shadow-emerald-200 dark:shadow-none';
        if (category?.id === 'visual-perception') return 'from-violet-500 to-purple-600 shadow-purple-200 dark:shadow-none';
        if (category?.id === 'attention-memory') return 'from-amber-400 to-orange-500 shadow-orange-200 dark:shadow-none';
        return 'from-zinc-700 to-zinc-900 shadow-zinc-200 dark:shadow-none';
    };

    return (
        <div className="group relative flex flex-col h-full">
            <div
                onClick={onSelect}
                className={`relative overflow-hidden rounded-3xl p-6 text-white bg-gradient-to-br ${getGradient()} shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer h-full border border-white/10`}
            >
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
                    <i className={`${activity.icon} text-9xl`}></i>
                </div>

                {/* Header */}
                <div className="relative z-10 flex justify-between items-start mb-6">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-white/20">
                        <i className={activity.icon}></i>
                    </div>
                    {usageCount > 0 && (
                        <span className="bg-black/20 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-lg border border-white/10">
                            {usageCount} Kez
                        </span>
                    )}
                </div>

                {/* Content */}
                <div className="relative z-10 flex-1">
                    <div className="flex items-center gap-2 mb-2 opacity-80">
                        <span className="text-[10px] font-bold uppercase tracking-widest">{category?.title}</span>
                    </div>
                    <h3 className="text-xl font-black leading-tight mb-2 text-white drop-shadow-md">{activity.title}</h3>
                    <p className="text-xs text-white/80 font-medium line-clamp-2 leading-relaxed">{activity.description}</p>
                </div>

                {/* Action Footer */}
                <div className="relative z-10 mt-6 pt-4 border-t border-white/20 flex items-center justify-between">
                    <button className="text-[10px] font-bold uppercase tracking-wider hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2">
                        <i className="fa-solid fa-play"></i> Hızlı Başlat
                    </button>
                    {!isReadOnly && onRemove && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onRemove(); }}
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-500/80 text-white/70 hover:text-white transition-colors"
                            title="Favorilerden Çıkar"
                        >
                            <i className="fa-solid fa-heart-crack"></i>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export const FavoritesSection: React.FC<FavoritesSectionProps> = ({ onSelectActivity, onBack, targetUserId }) => {
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState<'favorites' | 'popular'>('favorites');
    const [topActivities, setTopActivities] = useState<(Activity & { stats: ActivityStats })[]>([]);
    const [manualFavorites, setManualFavorites] = useState<Activity[]>([]);
    const [userStats, setUserStats] = useState<ActivityStats[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchQuery, _setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const isReadOnly = !!targetUserId && targetUserId !== user?.id;

    useEffect(() => {
        loadData();
    }, [targetUserId, user]);

    const loadData = async () => {
        setLoading(true);
        try {
            // 1. Load User Specific Favorites
            let favIds: ActivityType[] = [];
            if (targetUserId) {
                const targetUser = await authService.getContacts(targetUserId).then(users => users.find(u => u.id === targetUserId)) || (user?.id === targetUserId ? user : null);
                if (targetUser && targetUser.favorites) {
                    favIds = targetUser.favorites;
                }
            } else {
                favIds = statsService.getFavorites();
            }
            const favActivities = ACTIVITIES.filter(a => favIds.includes(a.id));
            setManualFavorites(favActivities);

            // 2. Load Global Stats & Top Activities
            const allStats = await statsService.getAllStats();
            setUserStats(allStats);

            if (!isReadOnly) {
                statsService.getTopActivities(8).then(data => {
                    setTopActivities(data);
                });
            }
        } catch (e) {
            logError("Favorites load error", e);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFavorite = (id: ActivityType) => {
        if (isReadOnly) return;
        if (confirm("Favorilerden çıkarmak istediğinize emin misiniz?")) {
            statsService.toggleFavorite(id);
            setManualFavorites(prev => prev.filter(a => a.id !== id));
        }
    };

    const filteredItems = useMemo(() => {
        const source = activeTab === 'favorites' ? manualFavorites : topActivities;

        const items = source.filter(item => {
            const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description.toLowerCase().includes(searchQuery.toLowerCase());

            const category = ACTIVITY_CATEGORIES.find(cat => cat.activities.includes(item.id));
            const matchesCategory = selectedCategory === 'all' || category?.id === selectedCategory;

            return matchesSearch && matchesCategory;
        });

        // Add stats to manual favorites for sorting
        const itemsWithStats = items.map(item => {
            const stat = userStats.find(s => s.activityId === item.id) || { generationCount: 0, lastGenerated: '', activityId: item.id, title: item.title, avgCompletionTime: 0 };
            return { ...item, stats: stat };
        });

        // Sort by usage count (Most used first)
        return itemsWithStats.sort((a, b) => b.stats.generationCount - a.stats.generationCount);

    }, [activeTab, manualFavorites, topActivities, searchQuery, selectedCategory, userStats]);

    const mostUsedFavorite = useMemo(() => {
        if (activeTab !== 'favorites' || filteredItems.length === 0) return null;
        return filteredItems[0];
    }, [filteredItems, activeTab]);

    return (
        <div className="bg-transparent h-full flex flex-col overflow-hidden font-lexend">
            {/* Header Area */}
            <div className="px-6 py-8 bg-[var(--bg-paper)]/50 backdrop-blur-md border-b border-[var(--border-color)] shrink-0 z-10 sticky top-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                    <div className="flex items-center gap-4">
                        {onBack && (
                            <button onClick={onBack} className="w-10 h-10 rounded-xl bg-[var(--bg-paper)] border border-[var(--border-color)] hover:scale-105 flex items-center justify-center transition-all shadow-sm">
                                <i className="fa-solid fa-arrow-left text-[var(--text-muted)]"></i>
                            </button>
                        )}
                        <div>
                            <h2 className="text-2xl font-black text-[var(--text-primary)] flex items-center gap-3 italic uppercase tracking-tighter">
                                {isReadOnly ? 'Kullanıcı Koleksiyonu' : 'Atölyem'}
                                <span className="text-xs bg-[var(--bg-secondary)] px-2 py-0.5 rounded-full text-[var(--text-muted)] font-black">{filteredItems.length}</span>
                            </h2>
                        </div>
                    </div>

                    {!isReadOnly && (
                        <div className="bg-[var(--bg-secondary)] p-1 rounded-xl flex gap-1 shadow-inner border border-[var(--border-color)]">
                            <button
                                onClick={() => setActiveTab('favorites')}
                                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'favorites' ? 'bg-[var(--bg-paper)] text-[var(--accent-color)] shadow-sm border border-[var(--border-color)]' : 'text-[var(--text-muted)]'}`}
                            >
                                <i className="fa-solid fa-bookmark"></i> Koleksiyon
                            </button>
                            <button
                                onClick={() => setActiveTab('popular')}
                                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'popular' ? 'bg-[var(--bg-paper)] text-[var(--accent-color)] shadow-sm border border-[var(--border-color)]' : 'text-[var(--text-muted)]'}`}
                            >
                                <i className="fa-solid fa-fire text-orange-500"></i> Trendler
                            </button>
                        </div>
                    )}
                </div>

                {/* Filters */}
                <div className="flex flex-col lg:flex-row gap-4 items-end lg:items-center justify-between">
                    <div className="flex gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 custom-scrollbar mask-linear-fade">
                        <CategoryPill id="all" active={selectedCategory === 'all'} onClick={() => setSelectedCategory('all')} />
                        {ACTIVITY_CATEGORIES.map(cat => (
                            <CategoryPill key={cat.id} id={cat.id} active={selectedCategory === cat.id} onClick={() => setSelectedCategory(cat.id)} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 animate-pulse">
                        <div className="w-12 h-12 bg-[var(--bg-secondary)] rounded-full mb-4"></div>
                        <div className="h-4 w-32 bg-[var(--bg-secondary)] rounded"></div>
                    </div>
                ) : (
                    <div className="w-full mx-auto space-y-8">

                        {/* HERO CARD (Most Used) */}
                        {activeTab === 'favorites' && mostUsedFavorite && searchQuery === '' && selectedCategory === 'all' && (
                            <div className="animate-in fade-in slide-in-from-top-4 duration-500 mb-8">
                                <h4 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-4 ml-1 flex items-center gap-2">
                                    <i className="fa-solid fa-star text-yellow-400"></i> En Çok Kullandığın
                                </h4>
                                <div
                                    onClick={() => onSelectActivity(mostUsedFavorite.id)}
                                    className="bg-[var(--text-primary)] text-[var(--bg-paper)] rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group cursor-pointer border-4 border-transparent hover:border-[var(--accent-color)] transition-colors"
                                >
                                    {/* Abstract shapes */}
                                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--accent-color)] rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
                                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 rounded-full blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2"></div>

                                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                                        <div className="flex items-center gap-8">
                                            <div className="w-28 h-28 bg-[var(--bg-paper)]/10 backdrop-blur-xl rounded-3xl flex items-center justify-center text-6xl shadow-inner border border-[var(--bg-paper)]/10">
                                                <i className={`${mostUsedFavorite.icon}`}></i>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-3">
                                                    <span className="bg-[var(--accent-color)] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-lg shadow-[var(--accent-muted)]">
                                                        Favori #1
                                                    </span>
                                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                                                        {mostUsedFavorite.stats.generationCount} Kez Üretildi
                                                    </span>
                                                </div>
                                                <h3 className="text-4xl md:text-5xl font-black tracking-tighter mb-2 uppercase italic">{mostUsedFavorite.title}</h3>
                                                <p className="opacity-70 max-w-xl text-lg font-medium leading-tight">{mostUsedFavorite.description}</p>
                                            </div>
                                        </div>
                                        <button className="px-10 py-5 bg-[var(--bg-paper)] text-[var(--text-primary)] rounded-2xl font-black shadow-xl hover:scale-105 transition-transform flex items-center gap-3 text-xs uppercase tracking-[0.2em]">
                                            <i className="fa-solid fa-play"></i> Hemen Üret
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {filteredItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                                <i className="fa-solid fa-box-open text-6xl mb-4 text-[var(--text-muted)]"></i>
                                <p className="font-black uppercase tracking-widest text-[var(--text-muted)]">Henüz favori eklenmedi.</p>
                            </div>
                        ) : (
                            <div>
                                {activeTab === 'favorites' && mostUsedFavorite && searchQuery === '' && selectedCategory === 'all' && (
                                    <h4 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-6 ml-1">Koleksiyonun</h4>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
                                    {filteredItems.map((item, idx) => {
                                        if (activeTab === 'favorites' && mostUsedFavorite && item.id === mostUsedFavorite.id && searchQuery === '' && selectedCategory === 'all') return null;
                                        return (
                                            <FavoriteCard
                                                key={item.id}
                                                activity={item}
                                                usageCount={item.stats.generationCount}
                                                onSelect={() => onSelectActivity(item.id)}
                                                onRemove={activeTab === 'favorites' ? () => handleRemoveFavorite(item.id) : undefined}
                                                isReadOnly={isReadOnly}
                                                rank={idx + 1}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};