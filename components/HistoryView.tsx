
import React, { useState, useMemo } from 'react';
import { HistoryItem, ActivityType } from '../types';
import { ACTIVITY_CATEGORIES, ACTIVITIES } from '../constants';

interface HistoryViewProps {
    historyItems: HistoryItem[];
    onRestore: (item: HistoryItem) => void;
    onSaveToArchive: (item: HistoryItem) => void;
    onDelete: (id: string) => void;
    onClearAll: () => void;
    onClose: () => void;
}

// Helper to group dates
const getRelativeDateGroup = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    // Fix: Explicitly use getTime() to resolve arithmetic operation type error
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (date.toDateString() === now.toDateString()) return 'Bugün';
    
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return 'Dün';

    if (diffDays < 7) return 'Bu Hafta';
    if (diffDays < 30) return 'Bu Ay';
    return 'Daha Eski';
};

export const HistoryView: React.FC<HistoryViewProps> = ({ 
    historyItems, 
    onRestore, 
    onSaveToArchive, 
    onDelete, 
    onClearAll,
    onClose 
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    // --- STATISTICS ---
    const stats = useMemo(() => {
        return {
            total: historyItems.length,
            todayCount: historyItems.filter(i => new Date(i.timestamp).toDateString() === new Date().toDateString()).length,
            lastActivity: historyItems.length > 0 ? historyItems[0].activityType : null
        };
    }, [historyItems]);

    // --- FILTERING & GROUPING ---
    const groupedHistory = useMemo(() => {
        // 1. Filter
        const filtered = historyItems.filter(item => {
            const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
            
            // Find category ID for the item
            const cat = ACTIVITY_CATEGORIES.find(c => c.activities.includes(item.activityType));
            const matchesCategory = selectedCategory === 'all' || cat?.id === selectedCategory;

            return matchesSearch && matchesCategory;
        });

        // 2. Group
        const groups: Record<string, HistoryItem[]> = {};
        const order = ['Bugün', 'Dün', 'Bu Hafta', 'Bu Ay', 'Daha Eski'];

        filtered.forEach(item => {
            const group = getRelativeDateGroup(item.timestamp);
            if (!groups[group]) groups[group] = [];
            groups[group].push(item);
        });

        // Sort groups based on predefined order
        return order
            .filter(key => groups[key] && groups[key].length > 0)
            .map(key => ({ title: key, items: groups[key] }));

    }, [historyItems, searchQuery, selectedCategory]);

    const getActivityIcon = (type: ActivityType) => {
        return ACTIVITIES.find(a => a.id === type)?.icon || 'fa-file';
    };

    return (
        <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-900 rounded-lg overflow-hidden">
            
            {/* HEADER & STATS */}
            <div className="p-6 bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 shadow-sm shrink-0">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
                            <i className="fa-solid fa-clock-rotate-left text-indigo-500"></i>
                            İşlem Geçmişi
                        </h2>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Son yapılan çalışmalarınız yerel olarak saklanır.</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 flex items-center justify-center transition-colors">
                        <i className="fa-solid fa-times text-zinc-500 dark:text-zinc-300"></i>
                    </button>
                </div>

                <div className="flex gap-4">
                    <div className="flex-1 bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-xl border border-indigo-100 dark:border-indigo-800 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-lg font-bold">
                            {stats.total}
                        </div>
                        <div>
                            <p className="text-xs font-bold text-indigo-800 dark:text-indigo-300 uppercase">Toplam Kayıt</p>
                            <p className="text-[10px] text-indigo-600 dark:text-indigo-400 opacity-80">Cihaz hafızasında</p>
                        </div>
                    </div>
                    <div className="flex-1 bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-xl border border-emerald-100 dark:border-emerald-800 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-lg font-bold">
                            {stats.todayCount}
                        </div>
                        <div>
                            <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase">Bugün</p>
                            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 opacity-80">Yeni üretim</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* FILTERS */}
            <div className="p-4 flex flex-col sm:flex-row gap-3 border-b border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm shrink-0">
                <div className="relative flex-1">
                    <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"></i>
                    <input 
                        type="text" 
                        placeholder="Başlık veya aktivite ara..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>
                <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                >
                    <option value="all">Tüm Kategoriler</option>
                    {ACTIVITY_CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.title}</option>
                    ))}
                </select>
                {historyItems.length > 0 && (
                    <button 
                        onClick={() => { if(confirm('Tüm geçmiş silinecek. Emin misiniz?')) onClearAll(); }}
                        className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold border border-red-200 transition-colors whitespace-nowrap"
                    >
                        <i className="fa-solid fa-trash-can mr-1"></i> Temizle
                    </button>
                )}
            </div>

            {/* TIMELINE CONTENT */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-zinc-50 dark:bg-black/20">
                {groupedHistory.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-400 opacity-60">
                        <i className="fa-regular fa-calendar-xmark text-5xl mb-4"></i>
                        <p className="font-bold">Kayıt bulunamadı.</p>
                    </div>
                ) : (
                    <div className="space-y-8 max-w-3xl mx-auto">
                        {groupedHistory.map((group, gIdx) => (
                            <div key={gIdx} className="relative">
                                {/* Group Title */}
                                <div className="sticky top-0 z-10 bg-zinc-50/95 dark:bg-zinc-900/95 backdrop-blur py-2 mb-4 flex items-center gap-4">
                                    <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest bg-zinc-200 dark:bg-zinc-800 px-3 py-1 rounded-full">
                                        {group.title}
                                    </h3>
                                    <div className="h-px bg-zinc-200 dark:bg-zinc-700 flex-1"></div>
                                </div>

                                {/* Timeline Items */}
                                <div className="space-y-0 ml-4 border-l-2 border-zinc-200 dark:border-zinc-700 pl-6 pb-2">
                                    {group.items.map((item, iIdx) => (
                                        <div key={item.id} className="relative mb-6 group last:mb-0">
                                            {/* Timeline Dot */}
                                            <div className="absolute -left-[31px] top-4 w-4 h-4 rounded-full bg-white dark:bg-zinc-800 border-2 border-indigo-500 shadow-sm z-10 group-hover:scale-125 transition-transform"></div>

                                            <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 shadow-sm hover:shadow-md transition-all group-hover:border-indigo-300 dark:group-hover:border-indigo-700">
                                                <div className="flex justify-between items-start gap-4">
                                                    
                                                    {/* Content Info */}
                                                    <div className="flex items-start gap-4">
                                                        <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-700 rounded-lg flex items-center justify-center text-xl text-zinc-500 dark:text-zinc-400 shrink-0">
                                                            <i className={getActivityIcon(item.activityType)}></i>
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-zinc-800 dark:text-zinc-100 text-sm">{item.title}</h4>
                                                            <p className="text-xs text-zinc-500 mt-1 flex items-center gap-2">
                                                                <span className="font-mono">{new Date(item.timestamp).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}</span>
                                                                <span>•</span>
                                                                <span className="bg-zinc-100 dark:bg-zinc-700 px-1.5 rounded">{item.data.length} Sayfa</span>
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex flex-col gap-2 shrink-0">
                                                        <button 
                                                            onClick={() => onRestore(item)}
                                                            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
                                                        >
                                                            <i className="fa-solid fa-arrow-rotate-left"></i> Aç
                                                        </button>
                                                        <div className="flex gap-1 justify-end">
                                                            <button 
                                                                onClick={() => onSaveToArchive(item)}
                                                                className="w-7 h-7 rounded bg-zinc-100 dark:bg-zinc-700 hover:bg-blue-100 hover:text-blue-600 text-zinc-500 flex items-center justify-center transition-colors"
                                                                title="Arşive Kaydet"
                                                            >
                                                                <i className="fa-solid fa-floppy-disk text-xs"></i>
                                                            </button>
                                                            <button 
                                                                onClick={() => onDelete(item.id)}
                                                                className="w-7 h-7 rounded bg-zinc-100 dark:bg-zinc-700 hover:bg-red-100 hover:text-red-600 text-zinc-500 flex items-center justify-center transition-colors"
                                                                title="Sil"
                                                            >
                                                                <i className="fa-solid fa-trash text-xs"></i>
                                                            </button>
                                                        </div>
                                                    </div>

                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
