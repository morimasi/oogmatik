
import React, { useState, useEffect } from 'react';
import { ActivityDraft } from '../types/admin';
import { adminService } from '../services/adminService';
import { ACTIVITY_CATEGORIES } from '../constants';

const ICON_LIST = [
    'fa-wand-magic-sparkles', 'fa-book', 'fa-calculator', 'fa-puzzle-piece', 
    'fa-eye', 'fa-ear-listen', 'fa-pen-nib', 'fa-robot', 'fa-rocket',
    'fa-star', 'fa-heart', 'fa-bolt', 'fa-brain', 'fa-layer-group', 
    'fa-cube', 'fa-flask', 'fa-music', 'fa-earth-americas', 'fa-gamepad'
];

export const AdminDraftReview: React.FC = () => {
    const [drafts, setDrafts] = useState<ActivityDraft[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDraft, setSelectedDraft] = useState<ActivityDraft | null>(null);
    
    // Publication Config
    const [pubConfig, setPubConfig] = useState({
        title: '',
        description: '',
        icon: 'fa-wand-magic-sparkles',
        category: 'visual-perception', // Changed default from 'others'
        isNewCategory: false,
        newCategoryName: '',
        newCategoryIcon: 'fa-folder-open'
    });
    const [isPublishing, setIsPublishing] = useState(false);

    useEffect(() => {
        loadDrafts();
    }, []);

    const loadDrafts = async () => {
        setLoading(true);
        const data = await adminService.getAllDrafts();
        setDrafts(data);
        setLoading(false);
    };

    const handleSelectDraft = (draft: ActivityDraft) => {
        setSelectedDraft(draft);
        setPubConfig({
            title: draft.title,
            description: draft.description,
            icon: 'fa-wand-magic-sparkles',
            category: 'visual-perception', // Default fallback
            isNewCategory: false,
            newCategoryName: '',
            newCategoryIcon: 'fa-folder-open'
        });
    };

    const handlePublish = async () => {
        if (!selectedDraft) return;
        
        if (pubConfig.isNewCategory && !pubConfig.newCategoryName) {
            alert("Lütfen yeni kategori adını giriniz.");
            return;
        }

        setIsPublishing(true);
        
        try {
            // Finalize category ID
            const finalCategory = pubConfig.isNewCategory 
                ? pubConfig.newCategoryName.toLowerCase().replace(/\s+/g, '-') 
                : pubConfig.category;

            await adminService.publishDraft(selectedDraft, {
                title: pubConfig.title,
                description: pubConfig.description,
                icon: pubConfig.icon,
                category: finalCategory
            });

            setDrafts(prev => prev.filter(d => d.id !== selectedDraft.id));
            setSelectedDraft(null);
            alert(`Etkinlik başarıyla '${pubConfig.isNewCategory ? pubConfig.newCategoryName : pubConfig.category}' kategorisinde yayınlandı!`);
        } catch (e) {
            console.error("Publish error", e);
            alert("Yayınlama sırasında hata oluştu.");
        } finally {
            setIsPublishing(false);
        }
    };
    
    const handleDelete = async (id: string) => {
        if(!confirm("Bu taslağı silmek istediğinize emin misiniz?")) return;
        await adminService.deleteDraft(id);
        setDrafts(prev => prev.filter(d => d.id !== id));
        if (selectedDraft?.id === id) setSelectedDraft(null);
    }

    return (
        <div className="h-[calc(100vh-140px)] flex bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            {/* Sidebar List */}
            <div className="w-80 border-r border-zinc-200 dark:border-zinc-800 flex flex-col bg-zinc-50 dark:bg-black/20">
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
                    <h3 className="font-bold text-zinc-800 dark:text-zinc-100">OCR Taslakları</h3>
                    <p className="text-xs text-zinc-500">Kullanıcı tarafından önerilen aktiviteler.</p>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                    {loading ? <div className="p-4 text-center text-zinc-400">Yükleniyor...</div> : (
                        drafts.length === 0 ? <div className="p-8 text-center text-zinc-400">Taslak yok.</div> :
                        drafts.map(item => (
                            <div 
                                key={item.id}
                                onClick={() => handleSelectDraft(item)}
                                className={`p-4 border-b border-zinc-100 dark:border-zinc-800 cursor-pointer transition-colors hover:bg-white dark:hover:bg-zinc-800 group ${selectedDraft?.id === item.id ? 'bg-white dark:bg-zinc-800 border-l-4 border-l-indigo-500 shadow-sm' : 'border-l-4 border-l-transparent'}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-amber-100 text-amber-700">Taslak</span>
                                    <span className="text-[10px] text-zinc-400">{new Date(item.createdAt).toLocaleDateString()}</span>
                                </div>
                                <h4 className="text-sm font-bold mb-1 truncate text-zinc-800 dark:text-zinc-200">{item.title}</h4>
                                <p className="text-xs text-zinc-500 truncate">Ekleyen: {item.createdBy}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Detail View */}
            <div className="flex-1 flex flex-col bg-white dark:bg-zinc-900 overflow-y-auto">
                {selectedDraft ? (
                    <div className="p-8 max-w-3xl mx-auto w-full">
                        <h2 className="text-2xl font-black text-zinc-900 dark:text-white mb-6">Yayınlama Sihirbazı</h2>
                        
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800 mb-8">
                            <h4 className="font-bold text-indigo-800 dark:text-indigo-200 mb-4 border-b border-indigo-200 dark:border-indigo-700 pb-2">OCR Analizi</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="block text-xs font-bold text-indigo-400 uppercase">Taban Tip</span>
                                    <span className="text-zinc-700 dark:text-zinc-300 font-mono">{selectedDraft.baseType}</span>
                                </div>
                                <div>
                                    <span className="block text-xs font-bold text-indigo-400 uppercase">Ekleyen</span>
                                    <span className="text-zinc-700 dark:text-zinc-300">{selectedDraft.createdBy}</span>
                                </div>
                            </div>
                            <div className="mt-4">
                                <span className="block text-xs font-bold text-indigo-400 uppercase mb-1">Yapay Zeka Talimatları</span>
                                <p className="text-xs text-zinc-600 dark:text-zinc-400 bg-white dark:bg-black p-3 rounded border border-indigo-100 dark:border-indigo-900 max-h-32 overflow-y-auto custom-scrollbar">{selectedDraft.customInstructions}</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Aktivite Başlığı</label>
                                <input type="text" value={pubConfig.title} onChange={e => setPubConfig({...pubConfig, title: e.target.value})} className="w-full p-3 border rounded-xl bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 focus:ring-2 focus:ring-indigo-500 outline-none font-bold" />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Açıklama</label>
                                <textarea value={pubConfig.description} onChange={e => setPubConfig({...pubConfig, description: e.target.value})} className="w-full p-3 border rounded-xl bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-24" />
                            </div>

                            {/* Category Selection Logic */}
                            <div className="p-4 bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-zinc-700 rounded-xl">
                                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-3">Modül Kategorisi</label>
                                
                                <div className="flex gap-4 mb-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input 
                                            type="radio" 
                                            name="catType" 
                                            checked={!pubConfig.isNewCategory} 
                                            onChange={() => setPubConfig({...pubConfig, isNewCategory: false})}
                                            className="text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="text-sm font-medium">Mevcut Kategori</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input 
                                            type="radio" 
                                            name="catType" 
                                            checked={pubConfig.isNewCategory} 
                                            onChange={() => setPubConfig({...pubConfig, isNewCategory: true})}
                                            className="text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="text-sm font-medium text-indigo-600">Yeni Kategori Oluştur</span>
                                    </label>
                                </div>

                                {!pubConfig.isNewCategory ? (
                                    <select value={pubConfig.category} onChange={e => setPubConfig({...pubConfig, category: e.target.value})} className="w-full p-3 border rounded-xl bg-white dark:bg-zinc-800 dark:border-zinc-700 focus:ring-2 focus:ring-indigo-500 outline-none">
                                        {ACTIVITY_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                                    </select>
                                ) : (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                        <div>
                                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Yeni Kategori Adı</label>
                                            <input 
                                                type="text" 
                                                value={pubConfig.newCategoryName} 
                                                onChange={e => setPubConfig({...pubConfig, newCategoryName: e.target.value})}
                                                placeholder="Örn: Uzay Matematiği"
                                                className="w-full p-3 border rounded-xl bg-white dark:bg-zinc-800 dark:border-zinc-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Kategori İkonu</label>
                                            <div className="flex gap-2 flex-wrap bg-white dark:bg-zinc-800 p-2 rounded-xl border dark:border-zinc-700 max-h-32 overflow-y-auto custom-scrollbar">
                                                {ICON_LIST.map(icon => (
                                                    <button 
                                                        key={icon}
                                                        onClick={() => setPubConfig({...pubConfig, newCategoryIcon: icon})}
                                                        className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${pubConfig.newCategoryIcon === icon ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700'}`}
                                                    >
                                                        <i className={`fa-solid ${icon}`}></i>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Aktivite İkonu</label>
                                <div className="flex gap-2 flex-wrap bg-zinc-50 dark:bg-zinc-800 p-2 rounded-xl border dark:border-zinc-700 max-h-32 overflow-y-auto custom-scrollbar">
                                    {ICON_LIST.map(icon => (
                                        <button 
                                            key={icon}
                                            onClick={() => setPubConfig({...pubConfig, icon})}
                                            className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${pubConfig.icon === icon ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}
                                        >
                                            <i className={`fa-solid ${icon}`}></i>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                                <button onClick={() => handleDelete(selectedDraft.id)} className="px-6 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-bold transition-colors">
                                    Reddet & Sil
                                </button>
                                <button onClick={handlePublish} disabled={isPublishing} className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50">
                                    {isPublishing ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-rocket mr-2"></i>}
                                    YAYINLA
                                </button>
                            </div>
                        </div>

                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-zinc-400">
                        <i className="fa-solid fa-clipboard-question text-6xl mb-4 opacity-20"></i>
                        <p>İşlem yapmak için bir taslak seçin.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
