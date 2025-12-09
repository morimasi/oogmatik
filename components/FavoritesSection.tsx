
import React, { useEffect, useState, useMemo } from 'react';
import { Activity, ActivityStats, ActivityType } from '../types';
import { statsService } from '../services/statsService';
import { ACTIVITIES, ACTIVITY_CATEGORIES } from '../constants';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

interface FavoritesSectionProps {
    onSelectActivity: (id: ActivityType) => void;
    onBack?: () => void;
    targetUserId?: string;
}

// --- UI COMPONENTS ---

const CategoryPill = ({ id, active, onClick }: { id: string, active: boolean, onClick: () => void }) => {
    const category = ACTIVITY_CATEGORIES.find(c => c.id === id);
    if (!category && id !== 'all') return null;

    return (
        <button 
            onClick={onClick}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 border whitespace-nowrap ${
                active 
                ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-black dark:border-white shadow-lg transform scale-105' 
                : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700 hover:bg-zinc-50'
            }`}
        >
            {id !== 'all' && <i className={`${category?.icon} opacity-70`}></i>}
            {id === 'all' ? 'Tümü' : category?.title}
        </button>
    );
};

interface FavoriteCardProps {
    activity: Activity;
    stats?: ActivityStats;
    onSelect: () => void;
    onRemove?: () => void;
    isReadOnly: boolean;
    rank?: number;
}

const FavoriteCard: React.FC<FavoriteCardProps> = ({ 
    activity, 
    stats, 
    onSelect, 
    onRemove, 
    isReadOnly,
    rank
}) => {
    const category = ACTIVITY_CATEGORIES.find(cat => cat.activities.includes(activity.id));
    
    // Generate a subtle gradient based on category
    const getGradient = () => {
        switch (category?.id) {
            case 'math-logic': return 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800';
            case 'word-games': return 'from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200 dark:border-emerald-800';
            case 'visual-perception': return 'from-purple-50 to-fuchsia-50 dark:from-purple-900/20 dark:to-fuchsia-900/20 border-purple-200 dark:border-purple-800';
            case 'attention-memory': return 'from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800';
            default: return 'from-zinc-50 to-zinc-100 dark:from-zinc-800 dark:to-zinc-900 border-zinc-200 dark:border-zinc-700';
        }
    };

    return (
        <div 
            onClick={onSelect}
            className={`group relative bg-gradient-to-br ${getGradient()} rounded-3xl p-6 border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full overflow-hidden`}
        >
            {/* Rank Badge for Top Items */}
            {rank && rank <= 3 && (
                <div className="absolute top-0 right-0 p-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${
                        rank === 1 ? 'bg-yellow-400 text-yellow-900' : 
                        rank === 2 ? 'bg-zinc-300 text-zinc-800' : 
                        'bg-amber-700 text-amber-100'
                    }`}>
                        #{rank}
                    </div>
                </div>
            )}

            <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 bg-white dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform duration-300">
                    <i className={`${activity.icon} text-zinc-700 dark:text-zinc-200`}></i>
                </div>
                {!isReadOnly && onRemove && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); onRemove(); }}
                        className="w-8 h-8 rounded-full bg-white/50 dark:bg-black/20 hover:bg-red-500 hover:text-white text-zinc-400 transition-colors flex items-center justify-center z-10"
                        title="Favorilerden Çıkar"
                    >
                        <i className="fa-solid fa-heart-crack text-xs"></i>
                    </button>
                )}
            </div>

            <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider bg-white/60 dark:bg-black/20 px-2 py-0.5 rounded-md">
                        {category?.title}
                    </span>
                </div>
                <h3 className="font-black text-lg text-zinc-800 dark:text-zinc-100 leading-tight mb-2">
                    {activity.title}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 font-medium">
                    {activity.description}
                </p>
            </div>

            {/* Stats Footer */}
            <div className="mt-6 pt-4 border-t border-zinc-200/50 dark:border-zinc-700/50 flex items-center justify-between">
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">Kullanım</span>
                    <span className="text-sm font-black text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                        <i className="fa-solid fa-bolt text-amber-500 text-xs"></i>
                        {stats?.generationCount || 0}
                    </span>
                </div>
                
                <button className="w-10 h-10 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-black flex items-center justify-center shadow-lg group-hover:bg-indigo-600 dark:group-hover:bg-indigo-400 group-hover:scale-110 transition-all">
                    <i className="fa-solid fa-play ml-0.5"></i>
                </button>
            </div>
        </div>
    );
};

export const FavoritesSection: React.FC<FavoritesSectionProps> = ({ onSelectActivity, onBack, targetUserId }) => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'favorites' | 'popular'>('favorites');
    const [topActivities, setTopActivities] = useState<(Activity & { stats: ActivityStats })[]>([]);
    const [manualFavorites, setManualFavorites] = useState<Activity[]>([]);
    const [userStats, setUserStats] = useState<ActivityStats[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Filters
    const [searchQuery, setSearchQuery] = useState('');
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
            console.error("Favorites load error", e);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFavorite = (id: ActivityType) => {
        if (isReadOnly) return;
        if(confirm("Favorilerden çıkarmak istediğinize emin misiniz?")) {
            statsService.toggleFavorite(id);
            setManualFavorites(prev => prev.filter(a => a.id !== id));
        }
    };

    const filteredItems = useMemo(() => {
        const source = activeTab === 'favorites' ? manualFavorites : topActivities;
        
        let items = source.filter(item => {
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
        <div className="bg-zinc-50 dark:bg-zinc-900 h-full flex flex-col overflow-hidden">
            {/* Header Area */}
            <div className="px-6 py-8 bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 shrink-0 shadow-sm z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-4">
                        {onBack && (
                            <button onClick={onBack} className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 flex items-center justify-center transition-colors">
                                <i className="fa-solid fa-arrow-left text-zinc-500 dark:text-zinc-300"></i>
                            </button>
                        )}
                        <div>
                            <h2 className="text-3xl font-black text-zinc-900 dark:text-white flex items-center gap-3">
                                <i className="fa-solid fa-heart text-rose-500"></i>
                                {isReadOnly ? 'Kullanıcı Koleksiyonu' : 'Kişisel Atölyem'}
                            </h2>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium mt-1">
                                {isReadOnly ? 'Kullanıcının favori araçları.' : 'En sık kullandığınız araçlara ve popüler içeriklere hızlıca ulaşın.'}
                            </p>
                        </div>
                    </div>

                    {!isReadOnly && (
                        <div className="bg-zinc-100 dark:bg-zinc-700/50 p-1.5 rounded-xl flex gap-1">
                            <button 
                                onClick={() => setActiveTab('favorites')}
                                className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'favorites' ? 'bg-white dark:bg-zinc-600 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400'}`}
                            >
                                <i className="fa-solid fa-bookmark"></i> Koleksiyonum
                            </button>
                            <button 
                                onClick={() => setActiveTab('popular')}
                                className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'popular' ? 'bg-white dark:bg-zinc-600 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400'}`}
                            >
                                <i className="fa-solid fa-fire text-orange-500"></i> Trendler
                            </button>
                        </div>
                    )}
                </div>

                {/* Filters */}
                <div className="flex flex-col lg:flex-row gap-6 items-end lg:items-center justify-between">
                    <div className="flex gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 custom-scrollbar mask-linear-fade">
                        <CategoryPill id="all" active={selectedCategory === 'all'} onClick={() => setSelectedCategory('all')} />
                        {ACTIVITY_CATEGORIES.map(cat => (
                            <CategoryPill key={cat.id} id={cat.id} active={selectedCategory === cat.id} onClick={() => setSelectedCategory(cat.id)} />
                        ))}
                    </div>

                    <div className="relative w-full lg:w-80">
                        <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"></i>
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Etkinlik ara..."
                            className="w-full pl-12 pr-4 py-3 bg-zinc-100 dark:bg-zinc-700/30 border-2 border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-800 rounded-2xl text-sm font-bold transition-all outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 animate-pulse">
                        <div className="w-16 h-16 bg-zinc-200 dark:bg-zinc-700 rounded-full mb-4"></div>
                        <div className="h-4 w-48 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
                    </div>
                ) : (
                    <div className="max-w-[1600px] mx-auto space-y-8">
                        
                        {/* Hero Card for Most Used (Only in Favorites tab) */}
                        {activeTab === 'favorites' && mostUsedFavorite && searchQuery === '' && selectedCategory === 'all' && (
                            <div className="animate-in fade-in slide-in-from-top-4 duration-500 mb-8">
                                <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-4 ml-1">En Çok Kullandığın</h4>
                                <div 
                                    onClick={() => onSelectActivity(mostUsedFavorite.id)}
                                    className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-[2rem] p-8 md:p-10 shadow-xl text-white relative overflow-hidden group cursor-pointer"
                                >
                                    {/* Background Decor */}
                                    <div className="absolute right-0 top-0 h-full w-1/2 bg-white/10 skew-x-12 translate-x-20"></div>
                                    <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-indigo-500/30 rounded-full blur-3xl"></div>
                                    
                                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                        <div className="flex items-center gap-6">
                                            <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-5xl shadow-inner border border-white/30">
                                                <i className={`${mostUsedFavorite.icon}`}></i>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="bg-amber-400 text-amber-900 text-xs font-black px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm">
                                                        <i className="fa-solid fa-trophy mr-1"></i> Favori #1
                                                    </span>
                                                    <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-md">
                                                        {mostUsedFavorite.stats.generationCount} Üretim
                                                    </span>
                                                </div>
                                                <h3 className="text-3xl md:text-4xl font-black tracking-tight mb-2">{mostUsedFavorite.title}</h3>
                                                <p className="text-indigo-100 max-w-xl text-lg font-medium opacity-90">{mostUsedFavorite.description}</p>
                                            </div>
                                        </div>
                                        <button className="px-8 py-4 bg-white text-indigo-700 rounded-2xl font-black shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-3 group-hover:ring-4 ring-white/30">
                                            <i className="fa-solid fa-play"></i> Hızlı Başlat
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {filteredItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto opacity-60">
                                <div className="w-40 h-40 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6">
                                    <i className={`fa-solid ${activeTab === 'favorites' ? 'fa-heart-crack' : 'fa-magnifying-glass'} text-5xl text-zinc-300 dark:text-zinc-600`}></i>
                                </div>
                                <h3 className="text-2xl font-bold text-zinc-700 dark:text-zinc-200 mb-2">
                                    {activeTab === 'favorites' ? 'Koleksiyonun Boş' : 'Sonuç Bulunamadı'}
                                </h3>
                                <p className="text-zinc-500 dark:text-zinc-400 text-lg">
                                    {activeTab === 'favorites' 
                                        ? 'Beğendiğin etkinlikleri kalp ikonuna tıklayarak buraya ekleyebilirsin.' 
                                        : 'Arama kriterlerini değiştirerek tekrar dene.'}
                                </p>
                            </div>
                        ) : (
                            <div>
                                {activeTab === 'favorites' && mostUsedFavorite && searchQuery === '' && selectedCategory === 'all' && (
                                    <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-4 ml-1">Diğer Favoriler</h4>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                                    {filteredItems.map((item, idx) => {
                                        // Skip the hero item in the grid if showing hero
                                        if (activeTab === 'favorites' && mostUsedFavorite && item.id === mostUsedFavorite.id && searchQuery === '' && selectedCategory === 'all') return null;

                                        return (
                                            <FavoriteCard 
                                                key={item.id} 
                                                activity={item} 
                                                stats={item.stats}
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
