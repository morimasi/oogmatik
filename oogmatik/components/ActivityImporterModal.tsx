
import React, { useState, useEffect, useMemo } from 'react';
import { SavedWorksheet, CollectionItem, ActivityType } from '../types';
import { worksheetService } from '../services/worksheetService';
import { useAuthStore } from '../store/useAuthStore';

interface ActivityImporterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (items: CollectionItem[]) => void;
}

const CATEGORIES = [
    { id: 'all', title: 'Tümü', icon: 'fa-layer-group', color: 'bg-zinc-500' },
    { id: 'math', title: 'Matematik', icon: 'fa-calculator', color: 'bg-blue-500' },
    { id: 'reading', title: 'Okuma-Yazma', icon: 'fa-book-open', color: 'bg-emerald-500' },
    { id: 'dyslexia', title: 'Disleksi/DEHB', icon: 'fa-brain', color: 'bg-indigo-500' },
    { id: 'logic', title: 'Mantık/Görsel', icon: 'fa-puzzle-piece', color: 'bg-amber-500' }
];

export const ActivityImporterModal: React.FC<ActivityImporterModalProps> = ({ isOpen, onClose, onImport }) => {
    const { user } = useAuthStore();
    const [worksheets, setWorksheets] = useState<SavedWorksheet[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (isOpen && user) {
            loadWorksheets();
        }
    }, [isOpen, user]);

    const loadWorksheets = async () => {
        setLoading(true);
        try {
            const res = await worksheetService.getUserWorksheets(user!.id, 1, 100);
            // SingleWorksheetData içerenleri çek (Kitapçık içi ham veriler)
            const filtered = res.items.filter(w => w.activityType !== ActivityType.WORKBOOK);
            setWorksheets(filtered);
        } catch (error) {
            console.error("[ActivityImporter] Yukleme hatasi:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredWorksheets = useMemo(() => {
        return worksheets.filter(w => {
            const matchesCategory = filterCategory === 'all' || w.category?.id === filterCategory || w.activityType === filterCategory;
            const matchesSearch = w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                w.activityType.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [worksheets, filterCategory, searchTerm]);

    if (!isOpen) return null;

    const handleToggle = (id: string) => {
        const next = new Set(selectedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedIds(next);
    };

    const handleSelectAll = () => {
        if (selectedIds.size === filteredWorksheets.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredWorksheets.map(w => w.id)));
        }
    };

    const handleImport = () => {
        const selectedWorksheets = worksheets.filter(w => selectedIds.has(w.id));
        const newItems: CollectionItem[] = [];

        selectedWorksheets.forEach(ws => {
            if (Array.isArray(ws.worksheetData)) {
                ws.worksheetData.forEach((data) => {
                    newItems.push({
                        id: crypto.randomUUID(),
                        itemType: 'activity',
                        title: ws.name || 'İçe Aktarılan Sayfa',
                        activityType: ws.activityType,
                        data: data,
                        styleSettings: ws.styleSettings as any,
                        settings: ws.styleSettings || {},
                        originalWorksheetId: ws.id
                    } as unknown as CollectionItem);
                });
            }
        });

        onImport(newItems);
        setSelectedIds(new Set());
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-5xl max-h-[90vh] rounded-[2.5rem] shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] flex flex-col border border-white/10 overflow-hidden relative">

                {/* Header Section */}
                <div className="p-8 pb-4 border-b border-zinc-100 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl sticky top-0 z-20">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                <i className="fa-solid fa-wand-magic-sparkles text-xl"></i>
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-zinc-800 dark:text-zinc-100 tracking-tight">Etkinlik Kaşifi</h2>
                                <p className="text-xs text-zinc-500 font-bold tracking-wide uppercase opacity-70">Hazırlanmış Materyallerini Kitapçığa Aktar</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800/50 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-100 transition-all active:scale-90"
                        >
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>

                    {/* Controls: Search & Select All */}
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <div className="relative flex-1 group w-full">
                            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-500 transition-colors"></i>
                            <input
                                type="text"
                                placeholder="Etkinlik adı veya türü ile ara..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 bg-zinc-100/50 dark:bg-zinc-800/50 border border-transparent focus:border-indigo-500/50 focus:bg-white dark:focus:bg-zinc-800 rounded-2xl text-sm font-bold outline-none transition-all shadow-inner"
                            />
                            {searchTerm && (
                                <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                                    <i className="fa-solid fa-circle-xmark"></i>
                                </button>
                            )}
                        </div>

                        <div className="flex gap-2 w-full md:w-auto">
                            <button
                                onClick={handleSelectAll}
                                className="flex-1 md:flex-none px-6 py-3.5 bg-white dark:bg-zinc-800 border-2 border-zinc-100 dark:border-zinc-700 rounded-2xl text-xs font-black text-zinc-700 dark:text-zinc-300 hover:border-indigo-500/30 transition-all flex items-center justify-center gap-2 active:scale-95"
                            >
                                <i className={`fa-solid ${selectedIds.size === filteredWorksheets.length && filteredWorksheets.length > 0 ? 'fa-square-minus text-red-500' : 'fa-square-check text-indigo-500'}`}></i>
                                {selectedIds.size === filteredWorksheets.length && filteredWorksheets.length > 0 ? 'Seçimi Kaldır' : 'Tümünü Seç'}
                            </button>
                        </div>
                    </div>

                    {/* Category Chips */}
                    <div className="flex gap-2 overflow-x-auto pb-4 pt-4 no-scrollbar">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setFilterCategory(cat.id)}
                                className={`px-5 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-2 border-2 ${filterCategory === cat.id ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20 translate-y-[-2px]' : 'bg-white/50 dark:bg-zinc-800/50 border-zinc-100 dark:border-zinc-800 text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-600'}`}
                            >
                                <i className={`fa-solid ${cat.icon}`}></i>
                                {cat.title}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-gradient-to-b from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950/50">
                    {loading ? (
                        <div className="h-64 flex flex-col items-center justify-center gap-4 text-zinc-400">
                            <div className="w-12 h-12 border-[5px] border-zinc-200 dark:border-zinc-800 border-t-indigo-600 rounded-full animate-spin"></div>
                            <p className="text-sm font-bold animate-pulse">Kütüphane taranıyor...</p>
                        </div>
                    ) : filteredWorksheets.length === 0 ? (
                        <div className="h-64 flex flex-col items-center justify-center text-zinc-400 opacity-60">
                            <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6">
                                <i className="fa-regular fa-folder-open text-4xl"></i>
                            </div>
                            <p className="font-black text-lg">Sonuç Bulunamadı</p>
                            <p className="text-xs font-bold mt-2">Arama kriterlerinizi veya filtrenizi değiştirmeyi deneyin.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
                            {filteredWorksheets.map((ws) => {
                                const isSelected = selectedIds.has(ws.id);
                                const pageCount = Array.isArray(ws.worksheetData) ? ws.worksheetData.length : 1;
                                return (
                                    <div
                                        key={ws.id}
                                        onClick={() => handleToggle(ws.id)}
                                        className={`group relative flex flex-col p-5 rounded-[2rem] border-2 transition-all cursor-pointer ${isSelected ? 'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-900/10 shadow-xl' : 'border-zinc-100 dark:border-zinc-800/50 bg-white/50 dark:bg-zinc-800/30 hover:border-indigo-300 dark:hover:border-indigo-900/50 hover:shadow-lg'}`}
                                    >
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all duration-500 ${isSelected ? 'bg-indigo-600 text-white rotate-6 scale-110' : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 group-hover:-rotate-3'}`}>
                                                <i className={ws.icon || 'fa-solid fa-file-signature'}></i>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-base font-black text-zinc-800 dark:text-zinc-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight">{ws.name}</h3>
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-700/50 text-[9px] font-black text-zinc-500 rounded uppercase tracking-tighter">
                                                        {ws.category?.title || 'Genel'}
                                                    </span>
                                                    <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-[9px] font-black text-indigo-600 dark:text-indigo-400 rounded uppercase tracking-tighter">
                                                        {ws.activityType.replace(/_/g, ' ')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-800/50 flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-zinc-400 flex items-center gap-1">
                                                    <i className="fa-regular fa-clock"></i>
                                                    {new Date(ws.createdAt).toLocaleDateString('tr-TR')}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-800 px-3 py-1.5 rounded-xl border border-zinc-100 dark:border-zinc-700 shadow-sm">
                                                <span className="text-[11px] font-black text-zinc-800 dark:text-zinc-200">{pageCount}</span>
                                                <span className="text-[9px] font-bold text-zinc-400 uppercase">Sayfa</span>
                                            </div>
                                        </div>

                                        {/* Selection Pill */}
                                        <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full border-4 border-white dark:border-zinc-900 flex items-center justify-center transition-all duration-300 transform ${isSelected ? 'bg-indigo-600 scale-100 opacity-100' : 'bg-zinc-200 dark:bg-zinc-700 scale-50 opacity-0 group-hover:opacity-40'}`}>
                                            <i className="fa-solid fa-check text-xs text-white"></i>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer Section */}
                <div className="p-8 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col md:flex-row items-center justify-between gap-6 z-20">
                    <div className="flex items-center gap-4 bg-zinc-50 dark:bg-zinc-800/50 px-6 py-3 rounded-[1.5rem] border border-zinc-100 dark:border-zinc-800">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Seçilen</span>
                            <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">{selectedIds.size} <span className="text-xs text-zinc-400 font-bold">Dosya</span></span>
                        </div>
                        <div className="w-px h-8 bg-zinc-200 dark:bg-zinc-700"></div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Toplam</span>
                            <span className="text-xl font-black text-zinc-800 dark:text-zinc-200">
                                {Array.from(selectedIds).reduce((acc, id) => {
                                    const ws = worksheets.find(w => w.id === id);
                                    return acc + (ws && Array.isArray(ws.worksheetData) ? ws.worksheetData.length : 0);
                                }, 0)}
                                <span className="text-xs text-zinc-400 font-bold ml-1">Sayfa</span>
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                        <button
                            onClick={onClose}
                            className="flex-1 md:flex-none px-8 py-4 rounded-2xl text-sm font-black text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all active:scale-95"
                        >
                            İptal
                        </button>
                        <button
                            onClick={handleImport}
                            disabled={selectedIds.size === 0}
                            className={`flex-1 md:flex-none px-10 py-4 rounded-2xl text-sm font-black text-white transition-all flex items-center justify-center gap-3 active:scale-95 ${selectedIds.size > 0 ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed'}`}
                        >
                            <i className="fa-solid fa-cloud-arrow-down"></i>
                            Kitapçığa Ekle
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
