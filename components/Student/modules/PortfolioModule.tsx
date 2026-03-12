import React, { useState } from 'react';
import { AdvancedStudent, PortfolioItem } from '../../../types/student-advanced';

interface PortfolioModuleProps {
    student: AdvancedStudent;
}

export const PortfolioModule: React.FC<PortfolioModuleProps> = ({ student }) => {
    const [filter, setFilter] = useState<'all' | 'image' | 'video' | 'document'>('all');

    const portfolioItems = student.portfolio || [];
    const filteredItems = portfolioItems.filter(
        item => filter === 'all' || item.type === filter
    );

    const stats = {
        total: portfolioItems.length,
        images: portfolioItems.filter(i => i.type === 'image').length,
        videos: portfolioItems.filter(i => i.type === 'video').length,
        docs: portfolioItems.filter(i => i.type === 'document').length
    };

    const PortfolioCard = ({ item }: { item: PortfolioItem }) => (
        <div className="group relative break-inside-avoid mb-8 rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
            {/* Medya Alanı */}
            <div className="aspect-[4/3] bg-zinc-50 dark:bg-zinc-800/50 relative overflow-hidden">
                {item.type === 'image' ? (
                    <img src={item.url} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-300 dark:text-zinc-600">
                        <i className={`fa-solid text-5xl 
                            ${item.type === 'video' ? 'fa-play-circle text-indigo-500/50' : 'fa-file-lines text-rose-500/50'}`}></i>
                    </div>
                )}

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-zinc-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 backdrop-blur-sm">
                    <button className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl text-white hover:bg-indigo-600 transition-all flex items-center justify-center shadow-lg">
                        <i className="fa-solid fa-expand"></i>
                    </button>
                    <button className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl text-white hover:bg-emerald-600 transition-all flex items-center justify-center shadow-lg">
                        <i className="fa-solid fa-arrow-down-to-bracket"></i>
                    </button>
                    <button className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl text-white hover:bg-rose-600 transition-all flex items-center justify-center shadow-lg">
                        <i className="fa-solid fa-trash-can"></i>
                    </button>
                </div>

                <div className="absolute top-4 left-4 inline-flex items-center gap-2 px-3 py-1 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-widest text-zinc-900 dark:text-white shadow-sm">
                    <span className={`w-1.5 h-1.5 rounded-full ${item.type === 'image' ? 'bg-indigo-500' : item.type === 'video' ? 'bg-amber-500' : 'bg-rose-500'}`}></span>
                    {item.type === 'image' ? 'Görüntü' : item.type === 'video' ? 'Görüntü' : 'Belge'}
                </div>
            </div>

            {/* İçerik */}
            <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                    <h3 className="font-black text-zinc-900 dark:text-white uppercase tracking-tight line-clamp-1">{item.title}</h3>
                    <span className="text-[10px] font-black text-zinc-400 shrink-0 uppercase tracking-widest">{new Date(item.date).toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' })}</span>
                </div>
                <p className="text-xs font-medium text-zinc-500 line-clamp-2 mb-6 leading-relaxed">
                    {item.description || "Bu materyal için açıklama girilmemiş."}
                </p>
                <div className="flex flex-wrap gap-2">
                    {item.tags?.map(tag => (
                        <span key={tag} className="text-[9px] font-black uppercase tracking-widest bg-zinc-50 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 px-3 py-1 rounded-lg border border-zinc-100 dark:border-zinc-700/50">
                            #{tag}
                        </span>
                    ))}
                    {(!item.tags || item.tags.length === 0) && (
                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-300">Etiket Yok</span>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="p-8 h-full flex flex-col space-y-8 animate-in fade-in duration-700">
            {/* Üst: Portfolyo İstatistikleri */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Tümü', value: stats.total, color: 'zinc', icon: 'fa-layer-group' },
                    { label: 'Görseller', value: stats.images, color: 'indigo', icon: 'fa-image' },
                    { label: 'Videolar', value: stats.videos, color: 'amber', icon: 'fa-play' },
                    { label: 'Belgeler', value: stats.docs, color: 'rose', icon: 'fa-file-pdf' }
                ].map((s) => (
                    <div key={s.label} className="bg-white dark:bg-zinc-900 p-6 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl bg-${s.color}-50 dark:bg-${s.color}-900/20 text-${s.color}-600 flex items-center justify-center text-xl`}>
                            <i className={`fa-solid ${s.icon}`}></i>
                        </div>
                        <div>
                            <span className="text-2xl font-black text-zinc-900 dark:text-white block leading-none">{s.value}</span>
                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{s.label}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Orta: Filtreleme ve Aksiyonlar */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-zinc-900 p-4 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-sm gap-4">
                <div className="flex gap-2 p-1 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl w-full md:w-auto">
                    {['all', 'image', 'video', 'document'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                                ${filter === f
                                    ? 'bg-white dark:bg-zinc-700 text-indigo-600 shadow-sm'
                                    : 'text-zinc-400 hover:text-zinc-600'}`}
                        >
                            {f === 'all' ? 'Tümü' : f === 'image' ? 'Görsel' : f === 'video' ? 'Video' : 'Belge'}
                        </button>
                    ))}
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button className="flex-1 md:flex-none px-8 py-3 bg-zinc-900 text-white dark:bg-white dark:text-black rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2">
                        <i className="fa-solid fa-plus-circle"></i>
                        Yeni Materyal
                    </button>
                </div>
            </div>

            {/* Alt: Masonry Grid */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8 pb-10">
                    {filteredItems.map(item => (
                        <PortfolioCard key={item.id} item={item} />
                    ))}

                    {filteredItems.length === 0 && (
                        <div className="col-span-full py-32 flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-800/20 rounded-[4rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                            <div className="w-24 h-24 bg-white dark:bg-zinc-900 rounded-[2rem] flex items-center justify-center mb-6 shadow-xl text-zinc-200 animate-bounce">
                                <i className="fa-regular fa-folder-open text-4xl"></i>
                            </div>
                            <h3 className="text-zinc-400 font-black uppercase tracking-[0.2em]">Bu kategoride henüz öğe yok</h3>
                            <p className="text-zinc-300 dark:text-zinc-600 text-xs mt-2 uppercase font-bold tracking-widest">İlk materyalinizi yükleyerek başlayın</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
