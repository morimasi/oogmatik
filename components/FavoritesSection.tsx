import React, { useEffect, useState } from 'react';
import { Activity, ActivityStats, ActivityType } from '../types';
import { statsService } from '../services/statsService';
import { ACTIVITIES, ACTIVITY_CATEGORIES } from '../constants';

interface FavoritesSectionProps {
    onSelectActivity: (id: ActivityType) => void;
    onBack?: () => void;
}

export const FavoritesSection: React.FC<FavoritesSectionProps> = ({ onSelectActivity, onBack }) => {
    const [topActivities, setTopActivities] = useState<(Activity & { stats: ActivityStats })[]>([]);
    const [manualFavorites, setManualFavorites] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                // 1. Load Manual Favorites from LocalStorage
                const favIds = statsService.getFavorites();
                const favActivities = ACTIVITIES.filter(a => favIds.includes(a.id));
                setManualFavorites(favActivities);

                // 2. Load Top Stats
                const dataPromise = statsService.getTopActivities(10);
                const timeoutPromise = new Promise<(Activity & { stats: ActivityStats })[]>((resolve) => {
                    setTimeout(async () => {
                        resolve(await statsService.getTopActivities(10, true)); // Force defaults
                    }, 3000);
                });

                const statsData = await Promise.race([dataPromise, timeoutPromise]);
                setTopActivities(statsData);
            } catch (e) {
                console.error("Favorites load error", e);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const getCategoryTitle = (activityId: ActivityType) => {
        const category = ACTIVITY_CATEGORIES.find(cat => cat.activities.includes(activityId));
        return category ? category.title : 'Genel';
    };

    const getCategoryColor = (activityId: ActivityType) => {
        const category = ACTIVITY_CATEGORIES.find(cat => cat.activities.includes(activityId));
        switch (category?.id) {
            case 'math-logic': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
            case 'word-games': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
            case 'visual-perception': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
            case 'attention-memory': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
            case 'reading-comprehension': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300';
            default: return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300';
        }
    };

    if (loading) return (
        <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center">
                <i className="fa-solid fa-circle-notch fa-spin text-indigo-500 text-4xl mb-4"></i>
                <p className="text-zinc-500">Favoriler hazırlanıyor...</p>
            </div>
        </div>
    );

    return (
        <div className="bg-white dark:bg-zinc-800/50 rounded-xl shadow-sm p-4 sm:p-6 md:p-8 h-full overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-700">
                <div>
                    <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                        <i className="fa-solid fa-star text-yellow-500"></i> 
                        Favoriler
                    </h2>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">Hızlı erişim ve en çok tercih edilenler.</p>
                </div>
                
                {onBack && (
                    <button 
                      onClick={onBack}
                      className="text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 text-sm font-semibold flex items-center gap-2 transition-colors px-4 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700"
                    >
                      <i className="fa-solid fa-arrow-left"></i> Geri Dön
                    </button>
                )}
            </div>
            
            {/* MANUAL FAVORITES */}
            {manualFavorites.length > 0 && (
                <div className="mb-10">
                    <h3 className="text-lg font-bold text-zinc-700 dark:text-zinc-300 mb-4 flex items-center gap-2">
                        <i className="fa-solid fa-heart text-rose-500"></i> Favorilerim
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {manualFavorites.map((fav) => (
                            <div 
                                key={fav.id}
                                onClick={() => onSelectActivity(fav.id)}
                                className="group p-4 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer relative"
                            >
                                <div className="absolute top-3 right-3 text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <i className="fa-solid fa-heart"></i>
                                </div>
                                <div className="flex items-center gap-4 mb-3">
                                    <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/40 transition-colors shrink-0">
                                        <i className={`${fav.icon} text-lg text-indigo-600 dark:text-indigo-400`}></i>
                                    </div>
                                    <div className="overflow-hidden">
                                        <h4 className="font-bold text-sm text-zinc-800 dark:text-zinc-100 truncate">{fav.title}</h4>
                                        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${getCategoryColor(fav.id)}`}>{getCategoryTitle(fav.id)}</span>
                                    </div>
                                </div>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">{fav.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* POPULAR ACTIVITIES */}
            <div>
                <h3 className="text-lg font-bold text-zinc-700 dark:text-zinc-300 mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-fire text-orange-500"></i> En Çok Kullanılanlar
                </h3>
                {topActivities.length === 0 ? (
                    <p className="text-zinc-400 text-sm">Henüz yeterli veri yok.</p>
                ) : (
                    <div className="flex flex-col gap-3">
                        {topActivities.map((fav, index) => (
                            <div 
                                key={fav.id}
                                className="group flex flex-col sm:flex-row items-start sm:items-center p-4 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-200"
                            >
                                {/* Sıra ve İkon */}
                                <div className="flex items-center gap-4 w-full sm:w-auto mb-3 sm:mb-0">
                                    <span className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold ${index < 3 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400'}`}>
                                        #{index + 1}
                                    </span>
                                    <div className="w-12 h-12 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/40 transition-colors">
                                        <i className={`${fav.icon} text-2xl text-indigo-600 dark:text-indigo-400`}></i>
                                    </div>
                                </div>

                                {/* İçerik */}
                                <div className="flex-1 ml-0 sm:ml-4 min-w-0 w-full">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <h4 className="font-bold text-base text-zinc-800 dark:text-zinc-100 truncate">
                                            {fav.title}
                                        </h4>
                                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${getCategoryColor(fav.id)}`}>
                                            {getCategoryTitle(fav.id)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-1">
                                        {fav.description}
                                    </p>
                                </div>

                                {/* İstatistik ve Aksiyon */}
                                <div className="flex items-center justify-between w-full sm:w-auto mt-3 sm:mt-0 sm:ml-6 gap-4 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-700 pt-3 sm:pt-0">
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 whitespace-nowrap">
                                        <i className="fa-solid fa-bolt text-amber-500"></i>
                                        <span>{fav.stats.generationCount > 0 ? `${fav.stats.generationCount} Üretim` : 'Yeni'}</span>
                                    </div>
                                    
                                    <button 
                                        onClick={() => onSelectActivity(fav.id)}
                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg shadow-sm transition-all flex items-center gap-2 whitespace-nowrap"
                                    >
                                        <i className="fa-solid fa-play"></i> Aç
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};