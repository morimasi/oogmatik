
import React, { useState, useEffect, useMemo } from 'react';
import { DynamicActivity, PromptTemplate } from '../types/admin';
import { adminService } from '../services/adminService';
import { ACTIVITY_CATEGORIES } from '../constants';

const ICON_LIST = [
    'fa-star', 'fa-heart', 'fa-bolt', 'fa-brain', 'fa-puzzle-piece', 'fa-book-open', 'fa-calculator', 
    'fa-eye', 'fa-ear-listen', 'fa-pen-nib', 'fa-palette', 'fa-shapes', 'fa-stopwatch', 'fa-lightbulb',
    'fa-trophy', 'fa-medal', 'fa-crown', 'fa-rocket', 'fa-flask', 'fa-microscope', 'fa-earth-americas',
    'fa-map-location-dot', 'fa-user-doctor', 'fa-music', 'fa-video', 'fa-gamepad', 'fa-ghost', 'fa-robot',
    'fa-layer-group', 'fa-cubes', 'fa-fingerprint', 'fa-wand-magic-sparkles', 'fa-shapes', 'fa-code-fork'
];

const THEME_COLORS = [
    { name: 'Indigo', hex: '#6366f1' },
    { name: 'Emerald', hex: '#10b981' },
    { name: 'Amber', hex: '#f59e0b' },
    { name: 'Rose', hex: '#f43f5e' },
    { name: 'Violet', hex: '#8b5cf6' },
    { name: 'Sky', hex: '#0ea5e9' },
    { name: 'Zinc', hex: '#3f3f46' }
];

export const AdminActivityManager: React.FC = () => {
    const [activities, setActivities] = useState<DynamicActivity[]>([]);
    const [prompts, setPrompts] = useState<PromptTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [editingActivity, setEditingActivity] = useState<DynamicActivity | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [acts, prms] = await Promise.all([
                adminService.getAllActivities(),
                adminService.getAllPrompts()
            ]);
            setActivities(acts.sort((a, b) => (a.order || 0) - (b.order || 0)));
            setPrompts(prms);
        } finally { setLoading(false); }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingActivity) return;
        setIsSaving(true);
        try {
            const payload = { ...editingActivity, updatedAt: new Date().toISOString() };
            await adminService.saveActivity(payload);
            setActivities(prev => {
                const exists = prev.find(a => a.id === payload.id);
                if (exists) return prev.map(a => a.id === payload.id ? payload : a).sort((a,b)=>a.order - b.order);
                return [...prev, payload].sort((a,b)=>a.order - b.order);
            });
            setEditingActivity(null);
        } finally { setIsSaving(false); }
    };

    const toggleStatus = async (act: DynamicActivity, e: React.MouseEvent) => {
        e.stopPropagation();
        const updated = { ...act, isActive: !act.isActive };
        setActivities(prev => prev.map(a => a.id === act.id ? updated : a));
        await adminService.saveActivity(updated);
    };

    const filtered = useMemo(() => {
        return activities.filter(a => {
            const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) || a.id.toLowerCase().includes(search.toLowerCase());
            const matchCategory = categoryFilter === 'all' || a.category === categoryFilter;
            return matchSearch && matchCategory;
        });
    }, [activities, search, categoryFilter]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* 1. MASTER TOOLBAR */}
            <div className="flex flex-col lg:flex-row gap-6 justify-between items-center bg-white dark:bg-zinc-900 p-6 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-xl">
                <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                    <div className="relative flex-1 md:w-80">
                        <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"></i>
                        <input 
                            type="text" 
                            placeholder="Aktivite mimarisinde ara..." 
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-zinc-50 dark:bg-black/40 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-zinc-400"
                        />
                    </div>
                    
                    <select 
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="px-6 py-3.5 bg-zinc-50 dark:bg-black/40 rounded-2xl text-sm font-black text-zinc-600 dark:text-zinc-300 border-none focus:ring-2 focus:ring-indigo-500 cursor-pointer appearance-none min-w-[180px] text-center"
                    >
                        <option value="all">TÜM KATEGORİLER</option>
                        {ACTIVITY_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.title.toUpperCase()}</option>)}
                    </select>
                </div>

                <button 
                    onClick={() => setEditingActivity({
                        id: `ACTIVITY_${Date.now()}`,
                        title: 'Yeni Akademik Aktivite',
                        description: 'Öğrenci gelişimini hedefleyen açıklama metni.',
                        icon: 'fa-star',
                        category: 'math-logic',
                        isActive: true,
                        isPremium: false,
                        order: activities.length + 1,
                        themeColor: '#6366f1',
                        targetSkills: [],
                        updatedAt: new Date().toISOString()
                    })}
                    className="w-full lg:w-auto px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-2xl transition-all shadow-2xl shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest"
                >
                    <i className="fa-solid fa-plus-circle text-lg"></i> MİMARİYE EKLE
                </button>
            </div>

            {/* 2. ACTIVITY GRID */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {Array.from({length: 8}).map((_, i) => (
                        <div key={i} className="h-64 bg-zinc-200 dark:bg-zinc-800 rounded-[2.5rem] animate-pulse"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 pb-20">
                    {filtered.map(act => (
                        <div 
                            key={act.id}
                            onClick={() => setEditingActivity(act)}
                            className={`group bg-white dark:bg-zinc-900 rounded-[2.5rem] p-6 border-2 transition-all duration-500 cursor-pointer hover:shadow-2xl hover:-translate-y-2 ${act.isActive ? 'border-zinc-100 dark:border-zinc-800' : 'border-dashed border-zinc-200 dark:border-zinc-800 opacity-50 grayscale'}`}
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div 
                                    className="w-16 h-16 rounded-3xl flex items-center justify-center text-3xl shadow-2xl transition-transform group-hover:scale-110 duration-500"
                                    style={{ backgroundColor: `${act.themeColor || '#6366f1'}15`, color: act.themeColor || '#6366f1' }}
                                >
                                    <i className={act.icon}></i>
                                </div>
                                <button 
                                    onClick={(e) => toggleStatus(act, e)}
                                    className={`w-10 h-6 rounded-full relative transition-colors ${act.isActive ? 'bg-emerald-500' : 'bg-zinc-300'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${act.isActive ? 'left-5' : 'left-1'}`}></div>
                                </button>
                            </div>
                            
                            <div className="space-y-2">
                                <h4 className="font-black text-lg text-zinc-800 dark:text-white leading-tight group-hover:text-indigo-500 transition-colors">{act.title}</h4>
                                <span className="inline-block px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-[9px] font-black text-zinc-500 uppercase tracking-widest border border-zinc-200 dark:border-zinc-700">
                                    {act.category}
                                </span>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 font-medium leading-relaxed">{act.description}</p>
                            </div>

                            <div className="mt-6 pt-5 border-t border-zinc-50 dark:border-zinc-800 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-black text-zinc-400">#{act.order}</span>
                                    {act.isPremium && <i className="fa-solid fa-crown text-amber-500 text-xs" title="Premium"></i>}
                                </div>
                                <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-600 bg-zinc-50 dark:bg-black px-2 py-0.5 rounded italic">{act.id}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 3. ADVANCED EDITOR MODAL */}
            {editingActivity && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 md:p-8 animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-zinc-950 w-full max-w-6xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-white/10">
                        {/* Modal Header */}
                        <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/50">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-3xl shadow-xl" style={{ backgroundColor: editingActivity.themeColor, color: '#fff' }}>
                                    <i className={editingActivity.icon}></i>
                                </div>
                                <div>
                                    <h3 className="font-black text-3xl text-zinc-900 dark:text-white tracking-tight">{editingActivity.title}</h3>
                                    <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-[0.3em]">Aktivite Mimari Editörü</p>
                                </div>
                            </div>
                            <button onClick={() => setEditingActivity(null)} className="w-12 h-12 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-500 transition-all transform hover:rotate-90"><i className="fa-solid fa-times text-xl"></i></button>
                        </div>

                        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                            {/* Editor Form */}
                            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                                <form onSubmit={handleSave} className="space-y-10">
                                    {/* Section 1: Basic Identity */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Eşsiz Kimlik (ID)</label>
                                            <input type="text" value={editingActivity.id} onChange={e => setEditingActivity({...editingActivity, id: e.target.value.toUpperCase()})} className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-2xl text-sm font-black focus:border-indigo-500 outline-none transition-all font-mono" placeholder="ÖRN: MATH_PUZZLE" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Görünen Başlık</label>
                                            <input type="text" value={editingActivity.title} onChange={e => setEditingActivity({...editingActivity, title: e.target.value})} className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-2xl text-sm font-black focus:border-indigo-500 outline-none transition-all" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Pedagojik Açıklama</label>
                                        <textarea value={editingActivity.description} onChange={e => setEditingActivity({...editingActivity, description: e.target.value})} className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-2xl text-sm font-medium focus:border-indigo-500 outline-none transition-all h-24 resize-none" />
                                    </div>

                                    {/* Section 2: Visual Config */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">İkon Seçimi</label>
                                            <div className="grid grid-cols-6 gap-2 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 max-h-40 overflow-y-auto custom-scrollbar">
                                                {ICON_LIST.map(icon => (
                                                    <button 
                                                        key={icon} type="button" onClick={() => setEditingActivity({...editingActivity, icon})}
                                                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${editingActivity.icon === icon ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white dark:bg-zinc-800 text-zinc-400 hover:text-indigo-500'}`}
                                                    ><i className={`fa-solid ${icon}`}></i></button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Kategori Taksonomisi</label>
                                            <div className="space-y-3">
                                                {ACTIVITY_CATEGORIES.map(cat => (
                                                    <button 
                                                        key={cat.id} type="button" onClick={() => setEditingActivity({...editingActivity, category: cat.id})}
                                                        className={`w-full p-3 rounded-xl border-2 text-left flex items-center justify-between transition-all ${editingActivity.category === cat.id ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : 'border-zinc-100 dark:border-zinc-800 text-zinc-500'}`}
                                                    >
                                                        <span className="text-[10px] font-black uppercase tracking-wider">{cat.title}</span>
                                                        <i className={`fa-solid ${cat.icon} text-xs opacity-50`}></i>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Renk Paleti</label>
                                            <div className="grid grid-cols-4 gap-3">
                                                {THEME_COLORS.map(color => (
                                                    <button 
                                                        key={color.hex} type="button" onClick={() => setEditingActivity({...editingActivity, themeColor: color.hex})}
                                                        className={`w-10 h-10 rounded-full border-4 transition-all ${editingActivity.themeColor === color.hex ? 'border-zinc-900 dark:border-white scale-110 shadow-lg' : 'border-transparent'}`}
                                                        style={{ backgroundColor: color.hex }}
                                                        title={color.name}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 3: AI & System */}
                                    <div className="bg-zinc-900 dark:bg-black p-8 rounded-[2.5rem] border border-white/10 shadow-inner">
                                        <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-6 flex items-center gap-2"><i className="fa-solid fa-microchip"></i> Sistem & AI Entegrasyonu</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-zinc-500 uppercase">Bağlı Prompt Şablonu</label>
                                                <select value={editingActivity.promptId} onChange={e => setEditingActivity({...editingActivity, promptId: e.target.value})} className="w-full p-4 bg-zinc-800 border border-zinc-700 rounded-2xl text-xs font-black text-white outline-none focus:ring-2 ring-indigo-500">
                                                    <option value="">Prompt Seçilmedi</option>
                                                    {prompts.map(p => <option key={p.id} value={p.id}>{p.name} (v{p.version})</option>)}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-zinc-500 uppercase">Sıralama Önceliği (Order)</label>
                                                <input type="number" value={editingActivity.order} onChange={e => setEditingActivity({...editingActivity, order: Number(e.target.value)})} className="w-full p-4 bg-zinc-800 border border-zinc-700 rounded-2xl text-sm font-black text-white outline-none focus:ring-2 ring-indigo-500" />
                                            </div>
                                        </div>
                                        
                                        <div className="mt-8 flex flex-wrap gap-6">
                                            <label className="flex items-center gap-3 cursor-pointer group bg-zinc-800 p-4 rounded-2xl border border-zinc-700">
                                                <input type="checkbox" checked={editingActivity.isPremium} onChange={e => setEditingActivity({...editingActivity, isPremium: e.target.checked})} className="w-6 h-6 rounded-lg text-amber-500 focus:ring-amber-500 bg-black border-zinc-600" />
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-white uppercase tracking-widest">PRO Üyelik</span>
                                                    <span className="text-[10px] text-zinc-500 font-bold">Sadece abonelere göster.</span>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                </form>
                            </div>

                            {/* Live Card Preview */}
                            <div className="w-full md:w-[380px] bg-zinc-100 dark:bg-zinc-900/50 p-10 flex flex-col items-center justify-center border-l border-zinc-200 dark:border-zinc-800">
                                <h4 className="text-[10px] font-black text-zinc-400 uppercase mb-8 tracking-[0.3em]">Canlı Önizleme</h4>
                                
                                <div className="bg-white dark:bg-black rounded-[3rem] p-8 border-4 border-white dark:border-zinc-800 shadow-2xl w-full relative overflow-hidden transform hover:scale-105 transition-all duration-500">
                                    <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12" style={{ color: editingActivity.themeColor }}>
                                        <i className={`${editingActivity.icon} text-9xl`}></i>
                                    </div>
                                    <div className="relative z-10">
                                        <div 
                                            className="w-20 h-20 rounded-[1.8rem] flex items-center justify-center text-4xl shadow-xl mb-8 border-4 border-white dark:border-zinc-900"
                                            style={{ backgroundColor: editingActivity.themeColor, color: '#fff' }}
                                        >
                                            <i className={editingActivity.icon}></i>
                                        </div>
                                        <div className="flex items-center gap-2 mb-4">
                                            <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-[9px] font-black uppercase tracking-widest border border-zinc-200 dark:border-zinc-700">
                                                {editingActivity.category}
                                            </span>
                                            {editingActivity.isPremium && <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter shadow-sm"><i className="fa-solid fa-crown mr-1"></i> PRO</span>}
                                        </div>
                                        <h3 className="text-2xl font-black text-zinc-900 dark:text-white leading-tight mb-4">{editingActivity.title}</h3>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed italic line-clamp-3">"{editingActivity.description}"</p>
                                        <div className="mt-10 h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                            <div className="h-full transition-all duration-1000" style={{ width: '65%', backgroundColor: editingActivity.themeColor }}></div>
                                        </div>
                                    </div>
                                </div>
                                
                                <p className="mt-8 text-center text-zinc-500 text-[10px] leading-relaxed max-w-[240px]">
                                    <i className="fa-solid fa-circle-info mr-1"></i>
                                    Bu görünüm, öğrenci paneli ve kütüphanede görünecek olan kartın birebir kopyasıdır.
                                </p>
                            </div>
                        </div>

                        {/* Modal Actions */}
                        <div className="p-8 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-zinc-950">
                            <p className="text-xs text-zinc-500 font-bold italic">Son düzenleme: {new Date(editingActivity.updatedAt).toLocaleString()}</p>
                            <div className="flex gap-4">
                                <button onClick={() => setEditingActivity(null)} className="px-8 py-3.5 text-zinc-500 font-black text-xs uppercase tracking-widest hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-2xl transition-colors">Vazgeç</button>
                                <button 
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="px-12 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-2xl shadow-emerald-500/20 transition-all transform active:scale-95 disabled:opacity-50"
                                >
                                    {isSaving ? <i className="fa-solid fa-circle-notch fa-spin mr-2"></i> : <i className="fa-solid fa-check-circle mr-2"></i>}
                                    MİMARİYİ YAYINLA
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
