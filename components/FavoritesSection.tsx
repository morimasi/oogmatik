
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

const FilterButton = ({ active, label, onClick, icon }: { active: boolean, label: string, onClick: () => void, icon: string }) => (
    <button 
        onClick={onClick}
        className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 border ${
            active 
            ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-black dark:border-white shadow-md' 
            : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700'
        }`}
    >
        <i className={icon}></i> {label}
    </button>
);

interface ActivityCardProps {
    activity: Activity;
    stats?: ActivityStats;
    onSelect: () => void;
    onRemove?: () => void;
    isReadOnly: boolean;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ 
    activity, 
    stats, 
    onSelect, 
    onRemove, 
    isReadOnly 
}) => {
    const category = ACTIVITY_CATEGORIES.find(cat => cat.activities.includes(activity.id));
    
    const getCategoryColor = (catId?: string) => {
        switch (catId) {
            case 'math-logic': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'word-games': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'visual-perception': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'attention-memory': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'reading-comprehension': return 'bg-rose-100 text-rose-700 border-rose-200';
            default: return 'bg-zinc-100 text-zinc-700 border-zinc-200';
        }
    };

    return (
        <div 
            onClick={onSelect}
            className="group relative bg-white dark:bg-zinc-800 rounded-3xl p-5 border border-zinc-200 dark:border-zinc-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full"
        >
            <div className="flex justify-between items-start mb-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner transition-colors ${getCategoryColor(category?.id).split(' ')[0]} dark:bg-zinc-700`}>
                    <i className={`${activity.icon} ${getCategoryColor(category?.id).split(' ')[1]} dark:text-white`}></i>
                </div>
                {!isReadOnly && onRemove && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); onRemove(); }}
                        className="w-8 h-8 rounded-full bg-zinc-50 dark:bg-zinc-700 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 flex items-center justify-center transition-colors"
                        title="Favorilerden Çıkar"
                    >
                        <i className="fa-solid fa-heart-crack"></i>
                    </button>
                )}
            </div>

            <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${getCategoryColor(category?.id)} bg-opacity-50`}>
                        {category?.title || 'Genel'}
                    </span>
                    {stats && stats.generationCount > 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-700 text-zinc-500 flex items-center gap-1">
                            <i className="fa-solid fa-bolt text-amber-500"></i> {stats.generationCount}
                        </span>
                    )}
                </div>
                <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 leading-tight mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {activity.title}
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                    {activity.description}
                </p>
            </div>

            <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-700/50 flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">Oluştur</span>
                <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-700 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center transition-all transform group-hover:rotate-45">
                    <i className="fa-solid fa-arrow-up-right"></i>
                </div>
            </div>
        </div>
    );
};

export const FavoritesSection: React.FC<FavoritesSectionProps> = ({ onSelectActivity, onBack, targetUserId }) => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'favorites' | 'popular'>('favorites');
    const [topActivities, setTopActivities] = useState<(Activity & { stats: ActivityStats })[]>([]);
    const [manualFavorites, setManualFavorites] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');
    const [sortOption, setSortOption] = useState<'az' | 'newest'>('az');

    const isReadOnly = !!targetUserId && targetUserId !== user?.id;

    useEffect(() => {
        loadData();
    }, [targetUserId, user]);

    const loadData = async () => {
        setLoading(true);
        try {
            // 1. Load Favorites
            let favIds: ActivityType[] = [];
            if (targetUserId) {
                // If inspecting, fetch user profile to get favorites
                const targetUser = await authService.getContacts(targetUserId).then(users => users.find(u => u.id === targetUserId)) || (user?.id === targetUserId ? user : null);
                if (targetUser && targetUser.favorites) {
                    favIds = targetUser.favorites;
                }
            } else {
                favIds = statsService.getFavorites();
            }
            const favActivities = ACTIVITIES.filter(a => favIds.includes(a.id));
            setManualFavorites(favActivities);

            // 2. Load Popular (Async)
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
        
        return source.filter(item => {
            const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                  item.description.toLowerCase().includes(searchQuery.toLowerCase());
            
            const category = ACTIVITY_CATEGORIES.find(cat => cat.activities.includes(item.id));
            const matchesCategory = selectedCategory === 'all' || category?.id === selectedCategory;

            return matchesSearch && matchesCategory;
        }).sort((a, b) => {
            if (sortOption === 'az') return a.title.localeCompare(b.title);
            // Newest logic can be approximated by ID or list order for now as we don't store 'addedDate' for favorites locally
            return 0; 
        });
    }, [activeTab, manualFavorites, topActivities, searchQuery, selectedCategory, sortOption]);

    return (
        <div className="bg-zinc-50 dark:bg-zinc-900 h-full flex flex-col overflow-hidden">
            {/* Header Area */}
            <div className="px-6 py-6 bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 shrink-0 shadow-sm z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                    <div className="flex items-center gap-4">
                        {onBack && (
                            <button onClick={onBack} className="w-10 h-10 rounded-full border border-zinc-200 hover:bg-zinc-100 flex items-center justify-center transition-colors">
                                <i className="fa-solid fa-arrow-left text-zinc-500"></i>
                            </button>
                        )}
                        <div>
                            <h2 className="text-2xl font-black text-zinc-800 dark:text-zinc-100 flex items-center gap-3">
                                <i className="fa-solid fa-bookmark text-indigo-500"></i>
                                {isReadOnly ? 'Kullanıcı Koleksiyonu' : 'Kütüphanem'}
                            </h2>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                                {isReadOnly ? 'Bu kullanıcının favori etkinlikleri.' : 'En sevdiğin araçlar ve popüler öneriler.'}
                            </p>
                        </div>
                    </div>

                    {!isReadOnly && (
                        <div className="flex bg-zinc-100 dark:bg-zinc-700/50 p-1 rounded-xl">
                            <button 
                                onClick={() => setActiveTab('favorites')}
                                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'favorites' ? 'bg-white dark:bg-zinc-600 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400'}`}
                            >
                                Koleksiyonum
                            </button>
                            <button 
                                onClick={() => setActiveTab('popular')}
                                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'popular' ? 'bg-white dark:bg-zinc-600 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400'}`}
                            >
                                <i className="fa-solid fa-fire text-orange-500 mr-2"></i>Trendler
                            </button>
                        </div>
                    )}
                </div>

                {/* Controls Toolbar */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"></i>
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={activeTab === 'favorites' ? "Favorilerimde ara..." : "Popüler etkinliklerde ara..."}
                            className="w-full pl-12 pr-4 py-3 bg-zinc-100 dark:bg-zinc-700/30 border-2 border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-800 rounded-xl text-sm font-bold transition-all outline-none"
                        />
                    </div>
                    
                    <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 custom-scrollbar">
                        <FilterButton active={selectedCategory === 'all'} label="Tümü" onClick={() => setSelectedCategory('all')} icon="fa-solid fa-layer-group" />
                        <FilterButton active={selectedCategory === 'reading-verbal'} label="Okuma" onClick={() => setSelectedCategory('reading-verbal')} icon="fa-solid fa-book-open" />
                        <FilterButton active={selectedCategory === 'math-logic'} label="Matematik" onClick={() => setSelectedCategory('math-logic')} icon="fa-solid fa-calculator" />
                        <FilterButton active={selectedCategory === 'visual-perception'} label="Görsel" onClick={() => setSelectedCategory('visual-perception')} icon="fa-solid fa-eye" />
                    </div>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64">
                        <i className="fa-solid fa-circle-notch fa-spin text-4xl text-indigo-500 mb-4"></i>
                        <p className="text-zinc-400 font-medium">Yükleniyor...</p>
                    </div>
                ) : (
                    <>
                        {filteredItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto opacity-70">
                                <div className="w-32 h-32 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6">
                                    <i className={`fa-solid ${activeTab === 'favorites' ? 'fa-heart-crack' : 'fa-magnifying-glass'} text-4xl text-zinc-300`}></i>
                                </div>
                                <h3 className="text-xl font-bold text-zinc-700 dark:text-zinc-200 mb-2">
                                    {activeTab === 'favorites' ? 'Henüz favorin yok.' : 'Sonuç bulunamadı.'}
                                </h3>
                                <p className="text-zinc-500 dark:text-zinc-400">
                                    {activeTab === 'favorites' 
                                        ? 'Beğendiğin etkinlikleri kalp ikonuna tıklayarak buraya ekleyebilirsin.' 
                                        : 'Arama kriterlerini değiştirerek tekrar dene.'}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {filteredItems.map((item) => (
                                    <ActivityCard 
                                        key={item.id} 
                                        activity={item} 
                                        stats={(item as any).stats}
                                        onSelect={() => onSelectActivity(item.id)}
                                        onRemove={activeTab === 'favorites' ? () => handleRemoveFavorite(item.id) : undefined}
                                        isReadOnly={isReadOnly}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
