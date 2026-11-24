import React, { useState, useMemo } from 'react';
import { HistoryItem, ActivityType } from '../types';
import { ACTIVITY_CATEGORIES, ACTIVITIES } from '../constants';
import { useRBAC } from '../hooks/useRBAC';
import { useFascicleStore } from '../store/useFascicleStore';
import { useToastStore } from '../store/useToastStore';

interface HistoryViewProps {
    historyItems: HistoryItem[];
    onRestore: (item: HistoryItem) => void;
    onSaveToArchive: (item: HistoryItem) => void;
    onDelete: (id: string) => void;
    onClearAll: () => void;
    onClose: () => void;
}

const getRelativeDateGroup = (dateStr: string): string => {
    if (!dateStr) return 'Tarihsiz';
    const date = new Date(dateStr);
    const now = new Date();
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
    onClose,
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [confirmClearAll, setConfirmClearAll] = useState(false);

    const { hasPermission } = useRBAC();
    const toast = useToastStore();
    const canArchive = hasPermission('archive', 'create');

    const stats = useMemo(() => {
        const validItems = historyItems.filter(i => i && i.timestamp);
        return {
            total: validItems.length,
            todayCount: validItems.filter(i => new Date(i.timestamp).toDateString() === new Date().toDateString()).length,
            lastActivity: validItems.length > 0 ? validItems[0].activityType : null,
        };
    }, [historyItems]);

    const groupedHistory = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        const filtered = historyItems.filter(item => {
            if (!item || !item.id || !item.timestamp) return false;
            const titleMatch =
                (item.title || '').toLowerCase().includes(q) ||
                (item.studentName || '').toLowerCase().includes(q);
            const cat = ACTIVITY_CATEGORIES.find(c => c.activities.includes(item.activityType));
            const matchesCategory = selectedCategory === 'all' || cat?.id === selectedCategory;
            return titleMatch && matchesCategory;
        });

        const groups: Record<string, HistoryItem[]> = {};
        const order = ['Bugün', 'Dün', 'Bu Hafta', 'Bu Ay', 'Daha Eski', 'Tarihsiz'];

        filtered.forEach(item => {
            const group = getRelativeDateGroup(item.timestamp);
            if (!groups[group]) groups[group] = [];
            groups[group].push(item);
        });

        return order
            .filter(key => groups[key] && groups[key].length > 0)
            .map(key => ({ title: key, items: groups[key] }));
    }, [historyItems, searchQuery, selectedCategory]);

    const getActivityIcon = (type: ActivityType) => {
        return ACTIVITIES.find(a => a.id === type)?.icon || 'fa-solid fa-file';
    };

    const handleAddToFascicle = (item: HistoryItem) => {
        const { addItem, items } = useFascicleStore.getState();
        addItem({
            id: crypto.randomUUID(),
            type: item.activityType,
            difficulty: 'Orta',
            pageCount: Array.isArray(item.data) ? item.data.length : 1,
            order: items.length,
            content: item.data,
        });
        toast.success(`"${item.title}" Fasikül & Kitapçık stüdyosuna eklendi!`);
    };

    return (
        <div className="flex flex-col h-full bg-[var(--bg-primary)] text-[var(--text-primary)] rounded-2xl overflow-hidden font-lexend">
            {/* HEADER & STATS */}
            <div className="p-6 bg-[var(--bg-paper)] border-b border-[var(--border-color)] shadow-sm shrink-0">
                <div className="flex justify-between items-center mb-5">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] flex items-center gap-2.5">
                            <i className="fa-solid fa-clock-rotate-left text-[var(--accent-color)]"></i>
                            İşlem Geçmişi
                        </h2>
                        <p className="text-xs text-[var(--text-muted)] mt-0.5">
                            Son yapılan çalışmalarınız hesabınıza özel olarak yerel hafızada saklanır.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Kapat"
                        className="w-9 h-9 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[var(--accent-color)]/40 flex items-center justify-center transition-colors"
                    >
                        <i className="fa-solid fa-times text-[var(--text-muted)]"></i>
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[var(--accent-muted)] p-3 rounded-xl border border-[var(--accent-color)]/20 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--accent-color)]/15 text-[var(--accent-color)] flex items-center justify-center text-lg font-black">
                            {stats.total}
                        </div>
                        <div>
                            <p className="text-[11px] font-black text-[var(--text-primary)] uppercase">Toplam Kayıt</p>
                            <p className="text-[10px] text-[var(--text-muted)]">Son 100 çalışma</p>
                        </div>
                    </div>
                    <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center text-lg font-black">
                            {stats.todayCount}
                        </div>
                        <div>
                            <p className="text-[11px] font-black text-[var(--text-primary)] uppercase">Bugün</p>
                            <p className="text-[10px] text-[var(--text-muted)]">Yeni üretim</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* FILTERS */}
            <div className="p-4 flex flex-col sm:flex-row gap-3 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/60 backdrop-blur-sm shrink-0">
                <div className="relative flex-1">
                    <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-xs"></i>
                    <input
                        type="search"
                        placeholder="Başlık veya öğrenci ara..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-xl text-xs font-medium text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-color)] outline-none"
                    />
                </div>
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-xl text-xs font-bold text-[var(--text-primary)] focus:border-[var(--accent-color)] outline-none cursor-pointer"
                >
                    <option value="all">Tüm Kategoriler</option>
                    {ACTIVITY_CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.title}</option>
                    ))}
                </select>
                {historyItems.length > 0 && (
                    confirmClearAll ? (
                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                onClick={() => {
                                    onClearAll();
                                    setConfirmClearAll(false);
                                    toast.info('İşlem geçmişi temizlendi.');
                                }}
                                className="px-3 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-colors whitespace-nowrap"
                            >
                                Onayla
                            </button>
                            <button
                                type="button"
                                onClick={() => setConfirmClearAll(false)}
                                className="px-3 py-2 bg-[var(--bg-paper)] border border-[var(--border-color)] text-[var(--text-muted)] rounded-xl text-xs font-bold"
                            >
                                İptal
                            </button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setConfirmClearAll(true)}
                            className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-xl text-xs font-bold border border-rose-500/20 transition-colors whitespace-nowrap"
                        >
                            <i className="fa-solid fa-trash-can mr-1.5"></i> Temizle
                        </button>
                    )
                )}
            </div>

            {/* TIMELINE CONTENT */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-[var(--bg-primary)]">
                {groupedHistory.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)] py-12">
                        <i className="fa-regular fa-calendar-xmark text-5xl mb-3 opacity-40"></i>
                        <p className="font-bold text-sm text-[var(--text-primary)]">Kayıt bulunamadı.</p>
                        <p className="text-xs mt-1">Ürettiğiniz etkinlikler otomatik olarak burada listelenir.</p>
                    </div>
                ) : (
                    <div className="space-y-8 max-w-3xl mx-auto">
                        {groupedHistory.map((group, gIdx) => (
                            <div key={gIdx} className="relative">
                                <div className="sticky top-0 z-10 bg-[var(--bg-primary)]/95 backdrop-blur py-2 mb-4 flex items-center gap-4">
                                    <h3 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest bg-[var(--bg-secondary)] border border-[var(--border-color)] px-3 py-1 rounded-full">
                                        {group.title}
                                    </h3>
                                    <div className="h-px bg-[var(--border-color)] flex-1"></div>
                                </div>

                                <div className="space-y-0 ml-4 border-l-2 border-[var(--border-color)] pl-6 pb-2">
                                    {group.items.map((item) => (
                                        <div key={item.id} className="relative mb-5 group last:mb-0">
                                            <div className="absolute -left-[31px] top-4 w-4 h-4 rounded-full bg-[var(--bg-paper)] border-2 border-[var(--accent-color)] shadow-sm z-10 group-hover:scale-125 transition-transform"></div>

                                            <div className="bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-2xl p-4 shadow-sm hover:shadow-md transition-all group-hover:border-[var(--accent-color)]/40">
                                                <div className="flex justify-between items-start gap-4">
                                                    {/* Content Info */}
                                                    <div className="flex items-start gap-3.5 min-w-0">
                                                        <div className="w-11 h-11 bg-[var(--accent-muted)] border border-[var(--accent-color)]/20 rounded-xl flex items-center justify-center text-lg text-[var(--accent-color)] shrink-0">
                                                            <i className={getActivityIcon(item.activityType)}></i>
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h4 className="font-bold text-[var(--text-primary)] text-sm truncate">{item.title}</h4>
                                                            <div className="text-[11px] text-[var(--text-muted)] mt-1 flex flex-wrap items-center gap-2">
                                                                <span className="font-mono">
                                                                    {new Date(item.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                                <span>•</span>
                                                                <span className="bg-[var(--bg-secondary)] border border-[var(--border-color)] px-2 py-0.5 rounded-md font-semibold">
                                                                    {Array.isArray(item.data) ? item.data.length : 1} Sayfa
                                                                </span>
                                                                {item.category?.title && (
                                                                    <span className="text-[10px] font-bold text-[var(--accent-color)]">
                                                                        {item.category.title}
                                                                    </span>
                                                                )}
                                                                {item.studentName && (
                                                                    <span className="bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded-md text-[10px] font-bold">
                                                                        {item.studentName}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex flex-col gap-2 shrink-0">
                                                        <button
                                                            type="button"
                                                            onClick={() => onRestore(item)}
                                                            className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[var(--accent-color)] hover:opacity-90 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                                                        >
                                                            <i className="fa-solid fa-arrow-rotate-left"></i> Aç
                                                        </button>
                                                        <div className="flex gap-1 justify-end">
                                                            {canArchive && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => onSaveToArchive(item)}
                                                                    className="w-7 h-7 rounded-lg bg-[var(--bg-secondary)] hover:bg-blue-500/15 hover:text-blue-500 text-[var(--text-muted)] flex items-center justify-center transition-colors"
                                                                    title="Dijital Arşive Kaydet"
                                                                >
                                                                    <i className="fa-solid fa-floppy-disk text-xs"></i>
                                                                </button>
                                                            )}
                                                            <button
                                                                type="button"
                                                                onClick={() => handleAddToFascicle(item)}
                                                                className="w-7 h-7 rounded-lg bg-[var(--bg-secondary)] hover:bg-purple-500/15 hover:text-purple-500 text-[var(--text-muted)] flex items-center justify-center transition-colors"
                                                                title="Fasiküle Ekle"
                                                            >
                                                                <i className="fa-solid fa-book-medical text-xs"></i>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => onDelete(item.id)}
                                                                className="w-7 h-7 rounded-lg bg-[var(--bg-secondary)] hover:bg-rose-500/15 hover:text-rose-500 text-[var(--text-muted)] flex items-center justify-center transition-colors"
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
