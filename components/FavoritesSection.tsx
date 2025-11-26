
import React, { useEffect, useState } from 'react';
import { Activity, ActivityStats, ActivityType } from '../types';
import { statsService } from '../services/statsService';

interface FavoritesSectionProps {
    onSelectActivity: (id: ActivityType) => void;
}

export const FavoritesSection: React.FC<FavoritesSectionProps> = ({ onSelectActivity }) => {
    const [favorites, setFavorites] = useState<(Activity & { stats: ActivityStats })[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadFavorites = async () => {
            try {
                const data = await statsService.getTopActivities(6);
                setFavorites(data);
            } catch (e) {
                console.error("Favorites load error", e);
            } finally {
                setLoading(false);
            }
        };
        loadFavorites();
    }, []);

    if (loading) return null; // Or a mini skeleton
    if (favorites.length === 0) return null;

    return (
        <div className="mt-12 w-full max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center justify-between mb-6 px-4">
                <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                    <i className="fa-solid fa-fire text-orange-500"></i> 
                    Sık Kullanılanlar & Favoriler
                </h3>
                <span className="text-xs text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-full">
                    Otomatik Sıralama
                </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-2">
                {favorites.map((fav, index) => (
                    <button 
                        key={fav.id}
                        onClick={() => onSelectActivity(fav.id)}
                        className="group relative flex items-start p-4 bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-sm hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-300 text-left overflow-hidden"
                    >
                        {/* Rank Badge */}
                        <div className="absolute top-0 right-0 bg-zinc-100 dark:bg-zinc-700 px-3 py-1 rounded-bl-xl text-[10px] font-bold text-zinc-500 dark:text-zinc-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            #{index + 1}
                        </div>

                        <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mr-4 shrink-0 group-hover:scale-110 transition-transform duration-300">
                            <i className={`${fav.icon} text-xl text-indigo-600 dark:text-indigo-400`}></i>
                        </div>
                        
                        <div className="flex-1 min-w-0 pr-6">
                            <h4 className="font-bold text-zinc-800 dark:text-zinc-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {fav.title}
                            </h4>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1">
                                {fav.description}
                            </p>
                            
                            <div className="flex items-center gap-3 mt-3 text-[10px] font-medium text-zinc-400">
                                <span className="flex items-center gap-1">
                                    <i className="fa-solid fa-bolt text-amber-500"></i> {fav.stats.generationCount} üretim
                                </span>
                                <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-600"></span>
                                <span className="flex items-center gap-1 text-indigo-500 group-hover:underline">
                                    Hemen Oluştur <i className="fa-solid fa-arrow-right"></i>
                                </span>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};
