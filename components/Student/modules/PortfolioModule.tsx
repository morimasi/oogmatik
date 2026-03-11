import React, { useState } from 'react';
import { AdvancedStudent, PortfolioItem } from '../../../types/student-advanced';

interface PortfolioModuleProps {
    student: AdvancedStudent;
}

export const PortfolioModule: React.FC<PortfolioModuleProps> = ({ student }) => {
    const [filter, setFilter] = useState<'all' | 'image' | 'video' | 'document'>('all');

    const filteredItems = student.portfolio?.filter(
        item => filter === 'all' || item.type === filter
    ) || [];

    const PortfolioCard = ({ item }: { item: PortfolioItem }) => (
        <div className="group relative break-inside-avoid mb-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:shadow-xl transition-shadow duration-300">
            {/* Image/Thumbnail */}
            <div className="aspect-[4/3] bg-zinc-100 dark:bg-zinc-800 relative overflow-hidden">
                {item.type === 'image' ? (
                    <img src={item.url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-400">
                        <i className={`fa-solid text-4xl 
                            ${item.type === 'video' ? 'fa-play-circle' : 'fa-file-lines'}`}></i>
                    </div>
                )}
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-colors">
                        <i className="fa-solid fa-eye"></i>
                    </button>
                    <button className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-colors">
                        <i className="fa-solid fa-download"></i>
                    </button>
                </div>

                <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md px-2 py-1 rounded-lg text-white text-[10px] font-bold uppercase tracking-wider">
                    {item.type}
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-zinc-900 dark:text-white line-clamp-1">{item.title}</h3>
                    <span className="text-[10px] text-zinc-400 shrink-0">{new Date(item.date).toLocaleDateString('tr-TR')}</span>
                </div>
                <p className="text-xs text-zinc-500 line-clamp-2 mb-3">
                    {item.description}
                </p>
                <div className="flex flex-wrap gap-1">
                    {item.tags.map(tag => (
                        <span key={tag} className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded-full">
                            #{tag}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col">
            {/* Header / Filter */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex gap-2">
                    {['all', 'image', 'video', 'document'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors
                                ${filter === f 
                                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900' 
                                    : 'bg-white dark:bg-zinc-900 text-zinc-500 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'}`}
                        >
                            {f === 'all' ? 'Tümü' : f === 'image' ? 'Görseller' : f === 'video' ? 'Videolar' : 'Belgeler'}
                        </button>
                    ))}
                </div>
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors flex items-center gap-2">
                    <i className="fa-solid fa-cloud-arrow-up"></i>
                    Yükle
                </button>
            </div>

            {/* Masonry Grid (Simulated with columns) */}
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6 pb-6">
                {filteredItems.map(item => (
                    <PortfolioCard key={item.id} item={item} />
                ))}
                
                {filteredItems.length === 0 && (
                    <div className="col-span-full text-center py-20">
                        <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-300">
                            <i className="fa-regular fa-folder-open text-3xl"></i>
                        </div>
                        <h3 className="text-zinc-400 font-bold">Öğe Bulunamadı</h3>
                    </div>
                )}
            </div>
        </div>
    );
};
