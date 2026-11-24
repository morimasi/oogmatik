import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Activity, ActivityStats, ActivityType } from '../types';
import { statsService } from '../services/statsService';
import { ACTIVITIES, ACTIVITY_CATEGORIES } from '../constants';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';
import { useRBAC } from '../hooks/useRBAC';
import { authService } from '../services/authService';
import { logError } from '../utils/logger.js';

interface FavoritesSectionProps {
    onSelectActivity: (id: ActivityType) => void;
    onBack?: () => void;
    targetUserId?: string;
}

interface FavoriteCardProps {
    activity: Activity;
    isFavorited: boolean;
    onSelect: () => void;
    onToggleFavorite?: () => void;
    isReadOnly: boolean;
    usageCount?: number;
}

const CategoryPill: React.FC<{ id: string; active: boolean; onClick: () => void }> = ({ id, active, onClick }) => {
    const category = ACTIVITY_CATEGORIES.find(c => c.id === id);
    if (!category && id !== 'all') return null;

    return (
        <button
            type="button"
            onClick={onClick}
            className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 border whitespace-nowrap shadow-sm hover:shadow-md active:scale-95 uppercase tracking-widest ${
                active
                    ? 'bg-[var(--accent-color)] text-white border-[var(--accent-color)] shadow-lg shadow-[var(--accent-muted)]'
                    : 'bg-[var(--bg-paper)] text-[var(--text-muted)] border-[var(--border-color)] hover:border-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
            }`}
        >
            {id !== 'all' && <i className={`${category?.icon} opacity-70`}></i>}
            {id === 'all' ? 'Tümü' : category?.title}
        </button>
    );
};

const getCategoryGradient = (categoryId?: string): string => {
    switch (categoryId) {
        case 'math-logic':
            return 'from-blue-500 to-indigo-600';
        case 'reading-verbal':
            return 'from-sky-500 to-cyan-600';
        case 'reading-comprehension':
            return 'from-emerald-500 to-teal-600';
        case 'visual-perception':
            return 'from-violet-500 to-purple-600';
        case 'social-history':
            return 'from-amber-500 to-orange-600';
        case 'spld-premium':
            return 'from-rose-500 to-fuchsia-600';
        default:
            return 'from-indigo-600 to-slate-800';
    }
};

const FavoriteCard: React.FC<FavoriteCardProps> = ({
    activity,
    isFavorited,
    onSelect,
    onToggleFavorite,
    isReadOnly,
    usageCount = 0,
}) => {
    const category = ACTIVITY_CATEGORIES.find(cat => cat.activities.includes(activity.id));

    return (
        <div className="group relative flex flex-col h-full">
            <div
                onClick={onSelect}
                className={`relative overflow-hidden rounded-3xl p-6 text-white bg-gradient-to-br ${getCategoryGradient(category?.id)} shadow-xl transition-all duration-300 hover:-translate-y-1.5 cursor-pointer h-full border border-white/15 flex flex-col`}
            >
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500 pointer-events-none">
                    <i className={`${activity.icon} text-8xl`}></i>
                </div>

                {/* Header */}
                <div className="relative z-10 flex justify-between items-start mb-5">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-white/25">
                        <i className={activity.icon}></i>
                    </div>
                    <div className="flex items-center gap-2">
                        {usageCount > 0 && (
                            <span className="bg-black/25 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-lg border border-white/15">
                                {usageCount} Kez
                            </span>
                        )}
                        {!isReadOnly && onToggleFavorite && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleFavorite();
                                }}
                                className={`w-8 h-8 flex items-center justify-center rounded-xl backdrop-blur-md border transition-all ${
                                    isFavorited
                                        ? 'bg-amber-400/90 text-slate-900 border-amber-300 hover:bg-rose-500 hover:text-white hover:border-rose-400'
                                        : 'bg-white/15 text-white/80 border-white/20 hover:bg-white/30 hover:text-white'
                                }`}
                                title={isFavorited ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                                aria-label={isFavorited ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                            >
                                <i className={`fa-${isFavorited ? 'solid' : 'regular'} fa-star text-xs`}></i>
                            </button>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="relative z-10 flex-1">
                    <div className="flex items-center gap-2 mb-1.5 opacity-85">
                        <span className="text-[10px] font-black uppercase tracking-widest">
                            {category?.title || 'Etkinlik'}
                        </span>
                    </div>
                    <h3 className="text-lg font-black leading-tight mb-2 text-white drop-shadow-sm">
                        {activity.title}
                    </h3>
                    <p className="text-xs text-white/85 font-medium line-clamp-2 leading-relaxed">
                        {activity.description}
                    </p>
                </div>

                {/* Action Footer */}
                <div className="relative z-10 mt-5 pt-3.5 border-t border-white/20 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-white/15 group-hover:bg-white/25 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2">
                        <i className="fa-solid fa-play text-[9px]"></i> Hemen Üret
                    </span>
                    <span className="text-[10px] font-bold text-white/75 flex items-center gap-1">
                        <i className="fa-solid fa-universal-access text-[10px]"></i> ZPD Uyumlu
                    </span>
                </div>
            </div>
        </div>
    );
};

export const FavoritesSection: React.FC<FavoritesSectionProps> = ({ onSelectActivity, onBack, targetUserId }) => {
    const { user } = useAuthStore();
    const toast = useToastStore();
    const { canAccessCategory, canAccessActivity } = useRBAC();

    const [activeTab, setActiveTab] = useState<'favorites' | 'popular' | 'discover'>('favorites');
    const [topActivities, setTopActivities] = useState<(Activity & { stats: ActivityStats })[]>([]);
    const [favoriteIds, setFavoriteIds] = useState<ActivityType[]>([]);
    const [userStats, setUserStats] = useState<ActivityStats[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const isReadOnly = !!targetUserId && targetUserId !== user?.id;

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            let favIds: ActivityType[] = [];
            if (targetUserId) {
                const targetUser =
                    (await authService.getContacts(targetUserId).then(users => users.find(u => u.id === targetUserId))) ||
                    (user?.id === targetUserId ? user : null);
                if (targetUser && targetUser.favorites) {
                    favIds = targetUser.favorites as ActivityType[];
                }
            } else {
                const remoteFavs = user?.favorites as ActivityType[] | undefined;
                favIds = statsService.syncFavorites(remoteFavs);
            }
            setFavoriteIds(favIds);

            const allStats = await statsService.getAllStats();
            setUserStats(allStats);

            if (!isReadOnly) {
                const top = await statsService.getTopActivities(12);
                setTopActivities(top);
            }
        } catch (e) {
            logError(e instanceof Error ? e : String(e));
        } finally {
            setLoading(false);
        }
    }, [targetUserId, user, isReadOnly]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleToggleFavorite = (activity: Activity) => {
        if (isReadOnly) return;
        const wasFav = favoriteIds.includes(activity.id);
        const updated = statsService.toggleFavorite(activity.id);
        setFavoriteIds(updated);
        if (wasFav) {
            toast.info(`"${activity.title}" favorilerden çıkarıldı.`);
        } else {
            toast.success(`"${activity.title}" favorilerinize eklendi!`);
        }
    };

    const allowedCategories = useMemo(
        () => ACTIVITY_CATEGORIES.filter(cat => isReadOnly || canAccessCategory(cat.id)),
        [isReadOnly, canAccessCategory]
    );

    const filteredItems = useMemo(() => {
        let source: Activity[] = [];
        if (activeTab === 'favorites') {
            source = ACTIVITIES.filter(a => favoriteIds.includes(a.id));
        } else if (activeTab === 'popular') {
            source = topActivities;
        } else {
            source = ACTIVITIES;
        }

        const q = searchQuery.trim().toLowerCase();

        const items = source.filter(item => {
            if (!isReadOnly && !canAccessActivity(item.id)) return false;
            const category = ACTIVITY_CATEGORIES.find(cat => cat.activities.includes(item.id));
            if (!isReadOnly && category && !canAccessCategory(category.id)) return false;

            const matchesSearch =
                !q ||
                item.title.toLowerCase().includes(q) ||
                item.description.toLowerCase().includes(q) ||
                (category?.title.toLowerCase().includes(q) ?? false);

            const matchesCategory = selectedCategory === 'all' || category?.id === selectedCategory;
            return matchesSearch && matchesCategory;
        });

        const itemsWithStats = items.map(item => {
            const stat = userStats.find(s => s.activityId === item.id) || {
                generationCount: 0,
                lastGenerated: '',
                activityId: item.id,
                title: item.title,
                avgCompletionTime: 0,
            };
            return { ...item, stats: stat };
        });

        return itemsWithStats.sort((a, b) => b.stats.generationCount - a.stats.generationCount);
    }, [activeTab, favoriteIds, topActivities, searchQuery, selectedCategory, userStats, isReadOnly, canAccessActivity, canAccessCategory]);

    const mostUsedFavorite = useMemo(() => {
        if (activeTab !== 'favorites' || filteredItems.length === 0) return null;
        return filteredItems[0];
    }, [filteredItems, activeTab]);

    return (
        <div className="bg-[var(--bg-primary)] h-full flex flex-col overflow-hidden font-lexend text-[var(--text-primary)]">
            {/* Header Area */}
            <div className="px-6 py-6 bg-[var(--bg-paper)]/80 backdrop-blur-xl border-b border-[var(--border-color)] shrink-0 z-10 sticky top-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
                    <div className="flex items-center gap-4">
                        {onBack && (
                            <button
                                type="button"
                                onClick={onBack}
                                className="w-10 h-10 rounded-xl bg-[var(--bg-paper)] border border-[var(--border-color)] hover:border-[var(--accent-color)]/40 flex items-center justify-center transition-all shadow-sm"
                                aria-label="Geri Dön"
                            >
                                <i className="fa-solid fa-arrow-left text-[var(--text-muted)]"></i>
                            </button>
                        )}
                        <div>
                            <h2 className="text-2xl font-black text-[var(--text-primary)] flex items-center gap-3 tracking-tight">
                                <i className="fa-solid fa-star text-amber-400"></i>
                                {isReadOnly ? 'Kullanıcı Koleksiyonu' : 'Favori Etkinliklerim'}
                                <span className="text-xs bg-[var(--bg-secondary)] px-2.5 py-0.5 rounded-full text-[var(--text-muted)] font-black border border-[var(--border-color)]">
                                    {filteredItems.length}
                                </span>
                            </h2>
                            <p className="text-xs text-[var(--text-muted)] mt-0.5">
                                Sık kullandığınız etkinliklere tek tıkla ulaşın veya yenilerini koleksiyona ekleyin.
                            </p>
                        </div>
                    </div>

                    {!isReadOnly && (
                        <div className="bg-[var(--bg-secondary)] p-1 rounded-xl flex gap-1 shadow-inner border border-[var(--border-color)]">
                            <button
                                type="button"
                                onClick={() => setActiveTab('favorites')}
                                className={`px-3.5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                                    activeTab === 'favorites'
                                        ? 'bg-[var(--bg-paper)] text-[var(--accent-color)] shadow-sm border border-[var(--border-color)]'
                                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                                }`}
                            >
                                <i className="fa-solid fa-bookmark"></i> Koleksiyon ({favoriteIds.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('popular')}
                                className={`px-3.5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                                    activeTab === 'popular'
                                        ? 'bg-[var(--bg-paper)] text-[var(--accent-color)] shadow-sm border border-[var(--border-color)]'
                                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                                }`}
                            >
                                <i className="fa-solid fa-fire text-orange-500"></i> Trendler
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('discover')}
                                className={`px-3.5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                                    activeTab === 'discover'
                                        ? 'bg-[var(--bg-paper)] text-[var(--accent-color)] shadow-sm border border-[var(--border-color)]'
                                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                                }`}
                            >
                                <i className="fa-solid fa-compass text-[var(--accent-color)]"></i> Keşfet
                            </button>
                        </div>
                    )}
                </div>

                {/* Search + Category Filters */}
                <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
                    <div className="relative w-full lg:w-80 shrink-0">
                        <i className="fa-solid fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-xs"></i>
                        <input
                            type="search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Etkinlik veya kategori ara..."
                            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs font-medium text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-color)]"
                        />
                    </div>

                    <div className="flex gap-2 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0 custom-scrollbar">
                        <CategoryPill id="all" active={selectedCategory === 'all'} onClick={() => setSelectedCategory('all')} />
                        {allowedCategories.map(cat => (
                            <CategoryPill
                                key={cat.id}
                                id={cat.id}
                                active={selectedCategory === cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                            />
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
                        {/* HERO CARD (Most Used Favorite) */}
                        {activeTab === 'favorites' && mostUsedFavorite && searchQuery === '' && selectedCategory === 'all' && (
                            <div className="animate-in fade-in slide-in-from-top-4 duration-500 mb-6">
                                <h4 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-3 ml-1 flex items-center gap-2">
                                    <i className="fa-solid fa-crown text-amber-400"></i> En Çok Kullandığın Favori
                                </h4>
                                <div
                                    onClick={() => onSelectActivity(mostUsedFavorite.id)}
                                    className="bg-gradient-to-br from-[var(--accent-color)] to-indigo-700 text-white rounded-[2rem] p-7 md:p-10 shadow-2xl relative overflow-hidden group cursor-pointer border border-white/15 hover:scale-[1.005] transition-transform"
                                >
                                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                        <div className="flex items-center gap-6">
                                            <div className="w-20 h-20 md:w-24 md:h-24 bg-white/15 backdrop-blur-xl rounded-3xl flex items-center justify-center text-4xl md:text-5xl shadow-inner border border-white/20 shrink-0">
                                                <i className={mostUsedFavorite.icon}></i>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="bg-amber-400 text-slate-900 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow">
                                                        Favori #1
                                                    </span>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/80">
                                                        {mostUsedFavorite.stats.generationCount} Kez Üretildi
                                                    </span>
                                                </div>
                                                <h3 className="text-2xl md:text-4xl font-black tracking-tight mb-1.5">
                                                    {mostUsedFavorite.title}
                                                </h3>
                                                <p className="text-white/80 max-w-xl text-sm md:text-base font-medium leading-snug">
                                                    {mostUsedFavorite.description}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black shadow-xl group-hover:scale-105 transition-transform flex items-center gap-3 text-xs uppercase tracking-widest shrink-0">
                                            <i className="fa-solid fa-play"></i> Hemen Üret
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {filteredItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="w-20 h-20 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center mb-4">
                                    <i className="fa-solid fa-star text-3xl text-[var(--text-muted)] opacity-50"></i>
                                </div>
                                <p className="font-black uppercase tracking-widest text-sm text-[var(--text-primary)] mb-2">
                                    {activeTab === 'favorites' && !searchQuery
                                        ? 'Henüz favori eklenmedi'
                                        : 'Eşleşen etkinlik bulunamadı'}
                                </p>
                                <p className="text-xs text-[var(--text-muted)] max-w-sm mb-5">
                                    {activeTab === 'favorites'
                                        ? 'Trendler veya Keşfet sekmesinden yıldız simgesine tıklayarak sık kullandığınız etkinlikleri buraya ekleyebilirsiniz.'
                                        : 'Arama kriterinizi veya kategori filtresini değiştirmeyi deneyin.'}
                                </p>
                                {!isReadOnly && activeTab === 'favorites' && (
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('discover')}
                                        className="px-5 py-2.5 rounded-xl bg-[var(--accent-color)] text-white text-xs font-bold shadow-md hover:opacity-90 transition-opacity"
                                    >
                                        <i className="fa-solid fa-compass mr-2"></i> Etkinlikleri Keşfet
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div>
                                {activeTab === 'favorites' && mostUsedFavorite && searchQuery === '' && selectedCategory === 'all' && (
                                    <h4 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-5 ml-1">
                                        Koleksiyonun ({filteredItems.length - 1} Diğer)
                                    </h4>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-20">
                                    {filteredItems.map(item => {
                                        if (
                                            activeTab === 'favorites' &&
                                            mostUsedFavorite &&
                                            item.id === mostUsedFavorite.id &&
                                            searchQuery === '' &&
                                            selectedCategory === 'all'
                                        ) {
                                            return null;
                                        }
                                        return (
                                            <FavoriteCard
                                                key={item.id}
                                                activity={item}
                                                isFavorited={favoriteIds.includes(item.id)}
                                                usageCount={item.stats.generationCount}
                                                onSelect={() => onSelectActivity(item.id)}
                                                onToggleFavorite={() => handleToggleFavorite(item)}
                                                isReadOnly={isReadOnly}
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
