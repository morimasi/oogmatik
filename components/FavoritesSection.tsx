
import React, { useEffect, useState } from 'react';
import { Activity, ActivityStats, ActivityType } from '../types';
import { statsService } from '../services/statsService';

interface FavoritesSectionProps {
    onSelectActivity: (id: ActivityType) => void;
    onBack?: () => void;
}

export const FavoritesSection: React.FC<FavoritesSectionProps> = ({ onSelectActivity, onBack }) => {
    const [favorites, setFavorites] = useState<(Activity & { stats: ActivityStats })[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadFavorites = async () => {
            try {
                const data = await statsService.getTopActivities(9); // Load more items for a full page
                setFavorites(data);
            } catch (e) {
                console.error("Favorites load error", e);
            } finally {
                setLoading(false);
            }
        };
        loadFavorites();
    }, []);

    if (loading) return (
        <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center">
                <i className="fa-solid fa-circle-notch fa-spin text-indigo-500 text-4xl mb-4"></i>
                <p className="text-zinc-500">Favoriler yükleniyor...</p>
            </div>
        </div>
    );

    return (
        <div className="bg-white dark:bg-zinc-800/50 rounded-xl shadow-sm p-4 sm:p-6 md:p-8 h-full overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-zinc-200 dark:border-zinc-700">
                <div>
                    <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                        <i className="fa-solid fa-fire text-orange-500"></i> 
                        Sık Kullanılanlar & Favoriler
                    </h2>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">Platformda en çok tercih edilen etkinlikler.</p>
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
            
            {favorites.length === 0 ? (
                <div className="text-center py-12 text-zinc-400">
                    <i className="fa-regular fa-star text-4xl mb-3 opacity-50"></i>
                    <p>Henüz yeterli veri yok.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favorites.map((fav, index) => (
                        <button 
                            key={fav.id}
                            onClick={() => onSelectActivity(fav.id)}
                            className="group relative flex flex-col p-6 bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-sm hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-300 text-left overflow-hidden"
                        >
                            <div className="flex justify-between items-start w-full mb-4">
                                <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/40 transition-all duration-300 shadow-inner">
                                    <i className={`${fav.icon} text-3xl text-indigo-600 dark:text-indigo-400`}></i>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${index < 3 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400'}`}>
                                    #{index + 1}
                                </div>
                            </div>
                            
                            <div className="flex-1 min-w-0 w-full">
                                <h4 className="font-bold text-lg text-zinc-800 dark:text-zinc-100 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                    {fav.title}
                                </h4>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-4 opacity-90">
                                    {fav.description}
                                </p>
                                
                                <div className="flex items-center gap-2 text-xs font-medium text-zinc-400 mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-700/50 w-full">
                                    <i className="fa-solid fa-bolt text-amber-500"></i> 
                                    <span>{fav.stats.generationCount > 0 ? `${fav.stats.generationCount} kez üretildi` : 'Yeni'}</span>
                                </div>
                            </div>
                            
                            <div className="absolute bottom-0 left-0 w-full h-1.5 bg-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
