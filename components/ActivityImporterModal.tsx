
import React, { useState, useEffect } from 'react';
import { SavedWorksheet, CollectionItem, ActivityType } from '../types';
import { worksheetService } from '../services/worksheetService';
import { useAuth } from '../context/AuthContext';

interface ActivityImporterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (items: CollectionItem[]) => void;
}

export const ActivityImporterModal: React.FC<ActivityImporterModalProps> = ({ isOpen, onClose, onImport }) => {
    const { user } = useAuth();
    const [worksheets, setWorksheets] = useState<SavedWorksheet[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [filterCategory, setFilterCategory] = useState<string>('all');

    useEffect(() => {
        if (isOpen && user) {
            loadWorksheets();
        }
    }, [isOpen, user]);

    const loadWorksheets = async () => {
        setLoading(true);
        try {
            const res = await worksheetService.getUserWorksheets(user!.id, 1, 100);

            // Kitapçık olanları hariç tut, döngü olmasın (bir kitapçığın içine başka kitapçık içeriğini ham olarak çekebiliriz ama şimdilik sadece tekil etkinlikleri çekelim veya onları da çözelim).
            // SingleWorksheetData içerenleri çekelim
            const filtered = res.items.filter(w => w.activityType !== ActivityType.WORKBOOK);
            setWorksheets(filtered);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const handleToggle = (id: string) => {
        const next = new Set(selectedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedIds(next);
    };

    const handleImport = () => {
        const selectedWorksheets = worksheets.filter(w => selectedIds.has(w.id));
        const newItems: CollectionItem[] = [];

        selectedWorksheets.forEach(ws => {
            if (Array.isArray(ws.worksheetData)) {
                ws.worksheetData.forEach((data, index) => {
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

    const filteredWorksheets = worksheets.filter(w => {
        if (filterCategory === 'all') return true;
        // Basitçe kategori ID veya ismine göre filtreleme
        return w.category?.id === filterCategory || w.activityType === filterCategory;
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-4xl max-h-[85vh] rounded-[2rem] shadow-2xl flex flex-col border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 z-10">
                    <div>
                        <h2 className="text-xl font-black text-zinc-800 dark:text-zinc-100 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center">
                                <i className="fa-solid fa-cloud-arrow-down"></i>
                            </div>
                            Kütüphaneden Etkinlik Çek
                        </h2>
                        <p className="text-xs text-zinc-500 font-bold mt-1 ml-14">Diğer modüllerde hazırladığınız etkinlik sayfalarını kitapçığınıza aktarın.</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-700 transition-colors">
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col bg-zinc-50 dark:bg-zinc-900/50">
                    {/* Filtreler */}
                    <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex gap-2 overflow-x-auto">
                        <button onClick={() => setFilterCategory('all')} className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${filterCategory === 'all' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white dark:bg-zinc-800 text-zinc-600 border border-zinc-200 dark:border-zinc-700'}`}>Tüm Etkinlikler</button>
                        <button onClick={() => setFilterCategory('math')} className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${filterCategory === 'math' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white dark:bg-zinc-800 text-zinc-600 border border-zinc-200 dark:border-zinc-700'}`}>Matematik</button>
                        <button onClick={() => setFilterCategory('reading')} className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${filterCategory === 'reading' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white dark:bg-zinc-800 text-zinc-600 border border-zinc-200 dark:border-zinc-700'}`}>Okuma</button>
                        <button onClick={() => setFilterCategory('dyslexia')} className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${filterCategory === 'dyslexia' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white dark:bg-zinc-800 text-zinc-600 border border-zinc-200 dark:border-zinc-700'}`}>Disleksi/DEHB</button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 md:p-6">
                        {loading ? (
                            <div className="h-full flex items-center justify-center">
                                <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                            </div>
                        ) : filteredWorksheets.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-zinc-400">
                                <i className="fa-regular fa-folder-open text-5xl mb-4 opacity-50"></i>
                                <p className="font-bold">Bu kategoride kaydedilmiş etkinlik bulunamadı.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredWorksheets.map((ws) => {
                                    const isSelected = selectedIds.has(ws.id);
                                    const pageCount = Array.isArray(ws.worksheetData) ? ws.worksheetData.length : 1;
                                    return (
                                        <div
                                            key={ws.id}
                                            onClick={() => handleToggle(ws.id)}
                                            className={`relative group cursor-pointer rounded-2xl border-2 transition-all p-4 flex flex-col gap-3 ${isSelected ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20 shadow-md' : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-indigo-300'}`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-indigo-600 text-white' : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-500 group-hover:bg-indigo-100 group-hover:text-indigo-600'}`}>
                                                    <i className={ws.icon || 'fa-solid fa-file-lines'}></i>
                                                </div>
                                                <div className="flex-1 min-w-0 pr-6">
                                                    <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 truncate">{ws.name}</h3>
                                                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1 font-black">{ws.category?.title || 'Kategorisiz'}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between mt-auto pt-2 border-t border-zinc-100 dark:border-zinc-700">
                                                <span className="text-[10px] font-bold text-zinc-400">
                                                    <i className="fa-regular fa-calendar mr-1"></i>
                                                    {new Date(ws.createdAt).toLocaleDateString('tr-TR')}
                                                </span>
                                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${isSelected ? 'bg-indigo-100 text-indigo-700' : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400'}`}>
                                                    {pageCount} Sayfa
                                                </span>
                                            </div>

                                            <div className={`absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-zinc-300 dark:border-zinc-600 bg-transparent'}`}>
                                                {isSelected && <i className="fa-solid fa-check text-[10px] text-white"></i>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-5 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between">
                    <p className="text-xs font-bold text-zinc-500">
                        Seçilen Etkinlik: <span className="text-indigo-600 text-sm ml-1">{selectedIds.size}</span>
                        {selectedIds.size > 0 && <span className="ml-2 opacity-60">({Array.from(selectedIds).reduce((acc, id) => {
                            const ws = worksheets.find(w => w.id === id);
                            return acc + (ws && Array.isArray(ws.worksheetData) ? ws.worksheetData.length : 0);
                        }, 0)} Sayfa)</span>}
                    </p>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-bold text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">Vazgeç</button>
                        <button
                            onClick={handleImport}
                            disabled={selectedIds.size === 0}
                            className={`px-6 py-2.5 rounded-xl text-sm font-black text-white transition-all flex items-center gap-2 ${selectedIds.size > 0 ? 'bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:-translate-y-0.5' : 'bg-zinc-300 dark:bg-zinc-700 cursor-not-allowed'}`}
                        >
                            <i className="fa-solid fa-plus"></i>
                            Kitapçığa Ekle
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
