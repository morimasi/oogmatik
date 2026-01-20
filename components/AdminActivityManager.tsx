
import React, { useState, useEffect } from 'react';
import { DynamicActivity, PromptTemplate } from '../types/admin';
import { adminService } from '../services/adminService';

const ICON_LIST = [
    'fa-star', 'fa-heart', 'fa-bolt', 'fa-brain', 'fa-puzzle-piece', 'fa-book-open', 'fa-calculator', 
    'fa-eye', 'fa-ear-listen', 'fa-pen-nib', 'fa-palette', 'fa-shapes', 'fa-stopwatch', 'fa-lightbulb',
    'fa-trophy', 'fa-medal', 'fa-crown', 'fa-rocket', 'fa-flask', 'fa-microscope', 'fa-earth-americas',
    'fa-map-location-dot', 'fa-user-doctor', 'fa-music', 'fa-video', 'fa-gamepad', 'fa-ghost', 'fa-robot',
    'fa-layer-group', 'fa-cubes', 'fa-fingerprint', 'fa-wand-magic-sparkles'
];

interface ActivityCardProps {
    act: DynamicActivity;
    onEdit: (act: DynamicActivity) => void;
    onToggleStatus: (id: string, currentStatus: boolean, e: React.MouseEvent) => void;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ act, onEdit, onToggleStatus }) => (
    <div 
        onClick={() => onEdit(act)}
        className={`group bg-white dark:bg-zinc-800 rounded-2xl p-5 border shadow-sm cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${act.isActive ? 'border-zinc-200 dark:border-zinc-700' : 'border-zinc-200 dark:border-zinc-700 opacity-60 grayscale'}`}
    >
        <div className="flex justify-between items-start mb-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-inner bg-zinc-50 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 group-hover:bg-indigo-600 group-hover:text-white transition-colors`}>
                <i className={act.icon}></i>
            </div>
            <button 
                onClick={(e) => onToggleStatus(act.id, act.isActive, e)}
                className={`w-8 h-5 rounded-full relative transition-colors ${act.isActive ? 'bg-green-500' : 'bg-zinc-300'}`}
            >
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform ${act.isActive ? 'left-4' : 'left-1'}`}></div>
            </button>
        </div>
        
        <div>
            <h4 className="font-bold text-zinc-800 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">{act.title}</h4>
            <div className="flex items-center gap-2 mt-1 mb-1">
                 <span className="text-[10px] bg-zinc-100 dark:bg-zinc-700 px-1.5 rounded text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-600 truncate max-w-[120px]">
                     {act.category}
                 </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">{act.description}</p>
        </div>

        <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-700 flex items-center justify-between text-xs">
            <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-700 rounded text-zinc-500 dark:text-zinc-400 font-mono truncate max-w-[80px]">{act.id}</span>
            {act.isPremium && <span className="text-amber-500 font-bold flex items-center gap-1"><i className="fa-solid fa-crown"></i> PRO</span>}
        </div>
    </div>
);

export const AdminActivityManager: React.FC = () => {
    const [activities, setActivities] = useState<DynamicActivity[]>([]);
    const [prompts, setPrompts] = useState<PromptTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    
    // Edit State
    const [editingActivity, setEditingActivity] = useState<DynamicActivity | null>(null);
    const [showIconPicker, setShowIconPicker] = useState(false);
    const [jsonMode, setJsonMode] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const [acts, prms] = await Promise.all([
            adminService.getAllActivities(),
            adminService.getAllPrompts()
        ]);
        setActivities(acts);
        setPrompts(prms);
        setLoading(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingActivity) return;
        
        const updated = { ...editingActivity };
        
        // Optimistic update
        setActivities(prev => prev.map(a => a.id === updated.id ? updated : a));
        if (!activities.find(a => a.id === updated.id)) {
            setActivities([...activities, updated]);
        }
        
        setEditingActivity(null);
        await adminService.saveActivity(updated);
    };

    const toggleStatus = async (id: string, currentStatus: boolean, e: React.MouseEvent) => {
        e.stopPropagation();
        const activity = activities.find(a => a.id === id);
        if (activity) {
            const updated = { ...activity, isActive: !currentStatus };
            setActivities(prev => prev.map(a => a.id === id ? updated : a));
            await adminService.saveActivity(updated);
        }
    };

    // Dynamically get all unique categories from loaded activities
    const categories = Array.from(new Set(activities.map(a => a.category))).sort();
    
    const filtered = activities.filter(a => {
        const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase()) || a.id.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || a.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-zinc-800 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-sm">
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"></i>
                        <input 
                            type="text" 
                            placeholder="Etkinlik ara..." 
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2.5 bg-zinc-100 dark:bg-zinc-700/50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                        />
                    </div>
                    
                    <select 
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="px-4 py-2.5 bg-zinc-100 dark:bg-zinc-700/50 rounded-xl text-sm font-bold text-zinc-600 dark:text-zinc-300 border-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    >
                        <option value="all">Tüm Kategoriler</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                <button 
                    onClick={() => {
                        setEditingActivity({
                            id: `NEW_ACTIVITY_${Date.now()}`,
                            title: 'Yeni Etkinlik',
                            description: 'Açıklama giriniz.',
                            icon: 'fa-star',
                            category: 'visual-perception', // Changed default from 'general' to 'visual-perception' for better UX
                            isActive: false,
                            isPremium: false
                        });
                    }}
                    className="w-full md:w-auto px-6 py-2.5 bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black text-sm font-bold rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                >
                    <i className="fa-solid fa-plus"></i> Yeni Ekle
                </button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
                    {Array.from({length: 8}).map((_, i) => (
                        <div key={i} className="h-40 bg-zinc-200 dark:bg-zinc-700 rounded-2xl"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filtered.map(act => (
                        <ActivityCard 
                            key={act.id} 
                            act={act} 
                            onEdit={setEditingActivity}
                            onToggleStatus={toggleStatus}
                        />
                    ))}
                </div>
            )}

            {/* EDIT MODAL */}
            {editingActivity && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in zoom-in-95 duration-200">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-zinc-200 dark:border-zinc-800">
                        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50">
                            <h3 className="font-black text-2xl text-zinc-800 dark:text-zinc-100 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-lg"><i className={editingActivity.icon}></i></div>
                                {editingActivity.title}
                            </h3>
                            <button onClick={() => setEditingActivity(null)} className="w-10 h-10 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-500 transition-colors"><i className="fa-solid fa-times text-lg"></i></button>
                        </div>
                        
                        <div className="flex flex-col md:flex-row h-full overflow-hidden">
                            {/* Form Side */}
                            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar border-r border-zinc-200 dark:border-zinc-800">
                                <form id="edit-form" onSubmit={handleSave} className="space-y-6">
                                    <div className="flex justify-end">
                                        <button 
                                            type="button" 
                                            onClick={() => setJsonMode(!jsonMode)}
                                            className="text-xs font-bold text-indigo-600 hover:underline"
                                        >
                                            {jsonMode ? 'Form Görünümü' : 'Gelişmiş JSON Editörü'}
                                        </button>
                                    </div>

                                    {jsonMode ? (
                                        <textarea 
                                            className="w-full h-96 p-4 font-mono text-sm bg-zinc-900 text-green-400 rounded-xl"
                                            value={JSON.stringify(editingActivity, null, 2)}
                                            onChange={(e) => {
                                                try {
                                                    setEditingActivity(JSON.parse(e.target.value));
                                                } catch(err) {/* ignore */}
                                            }}
                                        />
                                    ) : (
                                        <>
                                            <div className="grid grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">ID (Eşsiz)</label>
                                                    <input type="text" value={editingActivity.id} onChange={e => setEditingActivity({...editingActivity, id: e.target.value})} className="w-full p-3 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl bg-transparent focus:border-indigo-500 outline-none font-mono text-sm" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Başlık</label>
                                                    <input type="text" value={editingActivity.title} onChange={e => setEditingActivity({...editingActivity, title: e.target.value})} className="w-full p-3 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl bg-transparent focus:border-indigo-500 outline-none font-bold" />
                                                </div>
                                            </div>
                                            
                                            <div>
                                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Açıklama</label>
                                                <textarea value={editingActivity.description} onChange={e => setEditingActivity({...editingActivity, description: e.target.value})} className="w-full p-3 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl bg-transparent focus:border-indigo-500 outline-none h-24 resize-none" />
                                            </div>

                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="relative">
                                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">İkon</label>
                                                    <button 
                                                        type="button" 
                                                        onClick={() => setShowIconPicker(!showIconPicker)}
                                                        className="w-full p-3 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl bg-transparent flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                                                    >
                                                        <span className="flex items-center gap-2"><i className={`${editingActivity.icon} text-indigo-500`}></i> {editingActivity.icon}</span>
                                                        <i className="fa-solid fa-chevron-down text-xs"></i>
                                                    </button>
                                                    
                                                    {showIconPicker && (
                                                        <div className="absolute top-full left-0 w-full bg-white dark:bg-zinc-800 border rounded-xl shadow-xl p-3 grid grid-cols-6 gap-2 mt-2 z-50 h-48 overflow-y-auto custom-scrollbar">
                                                            {ICON_LIST.map(icon => (
                                                                <button 
                                                                    key={icon} 
                                                                    type="button"
                                                                    onClick={() => { setEditingActivity({...editingActivity, icon}); setShowIconPicker(false); }}
                                                                    className={`w-10 h-10 rounded-lg flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 transition-colors text-lg ${editingActivity.icon === icon ? 'bg-indigo-100 text-indigo-700' : 'text-zinc-500'}`}
                                                                >
                                                                    <i className={`fa-solid ${icon}`}></i>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Kategori (Mevcut veya Yeni)</label>
                                                    <input 
                                                        type="text" 
                                                        list="cat-suggestions" 
                                                        value={editingActivity.category} 
                                                        onChange={e => setEditingActivity({...editingActivity, category: e.target.value})} 
                                                        className="w-full p-3 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl bg-transparent focus:border-indigo-500 outline-none"
                                                        placeholder="Örn: uzay-matematigi"
                                                    />
                                                    <datalist id="cat-suggestions">
                                                        {categories.map(c => <option key={c} value={c} />)}
                                                    </datalist>
                                                </div>
                                            </div>

                                            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
                                                <label className="block text-xs font-bold text-indigo-600 mb-2 uppercase">AI Bağlantısı</label>
                                                <select 
                                                    value={editingActivity.promptId || ''} 
                                                    onChange={e => setEditingActivity({...editingActivity, promptId: e.target.value})}
                                                    className="w-full p-3 border border-indigo-200 dark:border-indigo-800 rounded-xl bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
                                                >
                                                    <option value="">-- Prompt Şablonu Seçin --</option>
                                                    {prompts.map(p => (
                                                        <option key={p.id} value={p.id}>{p.name} (v{p.version})</option>
                                                    ))}
                                                </select>
                                                <p className="text-[10px] text-indigo-400 mt-2">
                                                    <i className="fa-solid fa-circle-info mr-1"></i>
                                                    Bu prompt, içerik üretim motoru tarafından kullanılacaktır.
                                                </p>
                                            </div>

                                            <div className="flex gap-4">
                                                <label className="flex items-center gap-3 p-4 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl flex-1 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                                                    <input type="checkbox" checked={editingActivity.isActive} onChange={e => setEditingActivity({...editingActivity, isActive: e.target.checked})} className="w-5 h-5 rounded text-green-600 focus:ring-green-500" />
                                                    <span className="font-bold text-sm">Aktif Durum</span>
                                                </label>
                                                <label className="flex items-center gap-3 p-4 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl flex-1 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                                                    <input type="checkbox" checked={editingActivity.isPremium} onChange={e => setEditingActivity({...editingActivity, isPremium: e.target.checked})} className="w-5 h-5 rounded text-amber-600 focus:ring-amber-500" />
                                                    <span className="font-bold text-sm">Premium İçerik</span>
                                                </label>
                                            </div>
                                        </>
                                    )}
                                </form>
                            </div>

                            {/* Preview Side */}
                            <div className="w-full md:w-80 bg-zinc-100 dark:bg-black p-8 flex flex-col items-center justify-center border-l border-zinc-200 dark:border-zinc-800">
                                <h4 className="text-[10px] font-black text-zinc-400 uppercase mb-6 tracking-[0.2em]">Önizleme Kartı</h4>
                                
                                <div className="bg-white dark:bg-zinc-800 rounded-3xl p-6 border-2 border-zinc-200 dark:border-zinc-700 shadow-xl w-full max-w-sm relative overflow-hidden group transform hover:scale-105 transition-all duration-300">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner bg-indigo-50 text-indigo-600 dark:bg-zinc-700 dark:text-indigo-400`}>
                                            <i className={editingActivity.icon}></i>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider bg-zinc-100 text-zinc-600 border-zinc-200">
                                                {editingActivity.category}
                                            </span>
                                            {editingActivity.isPremium && (
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-700 flex items-center gap-1">
                                                    <i className="fa-solid fa-crown"></i> PRO
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="font-black text-xl text-zinc-900 dark:text-zinc-100 leading-tight mb-2">
                                            {editingActivity.title}
                                        </h3>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                            {editingActivity.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3 bg-zinc-50 dark:bg-zinc-900/50">
                            <button onClick={() => setEditingActivity(null)} className="px-6 py-3 text-zinc-500 font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl transition-colors">Vazgeç</button>
                            <button type="submit" form="edit-form" className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg hover:shadow-indigo-500/30 transition-all transform active:scale-95">Değişiklikleri Kaydet</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
