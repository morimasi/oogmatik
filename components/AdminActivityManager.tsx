
import React, { useState, useEffect, useMemo } from 'react';
import { DynamicActivity, PromptTemplate } from '../types/admin';
import { adminService } from '../services/adminService';
import { ACTIVITY_CATEGORIES } from '../constants';

const ICON_LIST = [
    'fa-star', 'fa-brain', 'fa-puzzle-piece', 'fa-book-open', 'fa-calculator', 
    'fa-eye', 'fa-pen-nib', 'fa-palette', 'fa-shapes', 'fa-stopwatch', 'fa-lightbulb',
    'fa-rocket', 'fa-flask', 'fa-microscope', 'fa-gamepad', 'fa-wand-magic-sparkles',
    'fa-diagram-project', 'fa-code-merge', 'fa-dna', 'fa-fingerprint', 'fa-shield-halved'
];

const THEME_PRESETS = [
    { name: 'Classic Indigo', primary: '#6366f1', secondary: '#4f46e5' },
    { name: 'Deep Emerald', primary: '#10b981', secondary: '#059669' },
    { name: 'Warm Amber', primary: '#f59e0b', secondary: '#d97706' },
    { name: 'Rose Clinic', primary: '#f43f5e', secondary: '#e11d48' },
    { name: 'Cyber Violet', primary: '#8b5cf6', secondary: '#7c3aed' },
    { name: 'Sky Focus', primary: '#0ea5e9', secondary: '#0284c7' },
    { name: 'Zinc Pro', primary: '#3f3f46', secondary: '#18181b' }
];

export const AdminActivityManager: React.FC = () => {
    const [activities, setActivities] = useState<DynamicActivity[]>([]);
    const [prompts, setPrompts] = useState<PromptTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
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

    const filtered = useMemo(() => {
        return activities.filter(a => {
            const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) || a.id.toLowerCase().includes(search.toLowerCase());
            const matchCategory = activeCategory === 'all' || a.category === activeCategory;
            return matchSearch && matchCategory;
        });
    }, [activities, search, activeCategory]);

    return (
        <div className="h-full flex flex-col gap-6 animate-in fade-in duration-500 font-lexend">
            {/* TOOLBAR */}
            <div className="flex flex-col lg:flex-row gap-4 justify-between items-center bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-xl">
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"></i>
                        <input 
                            type="text" placeholder="Aktivite ara..." value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-zinc-50 dark:bg-black/40 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all"
                        />
                    </div>
                    <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
                        <button onClick={() => setActiveCategory('all')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${activeCategory==='all' ? 'bg-white dark:bg-zinc-700 text-black dark:text-white shadow-sm' : 'text-zinc-500'}`}>Tümü</button>
                        {ACTIVITY_CATEGORIES.map(c => (
                            <button key={c.id} onClick={() => setActiveCategory(c.id)} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${activeCategory===c.id ? 'bg-white dark:bg-zinc-700 text-black dark:text-white shadow-sm' : 'text-zinc-500'}`}>{c.title.split(' ')[0]}</button>
                        ))}
                    </div>
                </div>

                <button 
                    onClick={() => setEditingActivity({
                        id: `NEW_ACT_${Date.now()}`, title: 'Yeni Aktivite', description: 'Pedagojik hedef açıklaması...',
                        icon: 'fa-star', category: 'math-logic', isActive: true, isPremium: false, order: activities.length + 1,
                        themeColor: '#6366f1', secondaryColor: '#4f46e5', targetSkills: [], updatedAt: new Date().toISOString()
                    })}
                    className="w-full lg:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl transition-all shadow-xl shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-2"
                >
                    <i className="fa-solid fa-plus-circle"></i> YENİ ÜRETİM
                </button>
            </div>

            {/* BENTO GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 pb-24">
                {filtered.map(act => (
                    <div 
                        key={act.id} onClick={() => setEditingActivity(act)}
                        className={`group bg-white dark:bg-zinc-900 rounded-[2.5rem] p-6 border-2 transition-all duration-500 cursor-pointer hover:shadow-2xl hover:-translate-y-1 ${act.isActive ? 'border-zinc-100 dark:border-zinc-800' : 'border-dashed border-zinc-200 dark:border-zinc-800 opacity-60 grayscale'}`}
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div 
                                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-xl transition-all group-hover:scale-110 group-hover:rotate-6"
                                style={{ background: `linear-gradient(135deg, ${act.themeColor}, ${act.secondaryColor || act.themeColor})`, color: '#fff' }}
                            >
                                <i className={`fa-solid ${act.icon}`}></i>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <span className={`w-3 h-3 rounded-full ${act.isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-zinc-300'}`}></span>
                                {act.isPremium && <i className="fa-solid fa-crown text-amber-500 text-[10px]"></i>}
                            </div>
                        </div>
                        <h4 className="font-black text-lg text-zinc-800 dark:text-white leading-tight mb-2 truncate">{act.title}</h4>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 font-medium mb-4">{act.description}</p>
                        <div className="pt-4 border-t border-zinc-50 dark:border-zinc-800 flex justify-between items-center">
                            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{act.category}</span>
                            <span className="text-[10px] font-mono font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded">#{act.order}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* FULLSCREEN EDITOR MODAL */}
            {editingActivity && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/90 backdrop-blur-xl p-4 md:p-8 animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-[#0d0d0f] w-full max-w-7xl h-full rounded-[3rem] shadow-2xl flex flex-col border border-white/5 overflow-hidden">
                        <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-2xl" style={{ background: `linear-gradient(135deg, ${editingActivity.themeColor}, ${editingActivity.secondaryColor || editingActivity.themeColor})`, color: '#fff' }}>
                                    <i className={`fa-solid ${editingActivity.icon}`}></i>
                                </div>
                                <div>
                                    <h3 className="font-black text-3xl text-zinc-900 dark:text-white tracking-tighter">{editingActivity.title}</h3>
                                    <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-[0.4em]">Sistem Mimari Editörü</p>
                                </div>
                            </div>
                            <button onClick={() => setEditingActivity(null)} className="w-12 h-12 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-500 transition-all transform hover:rotate-90"><i className="fa-solid fa-times text-xl"></i></button>
                        </div>

                        <div className="flex-1 flex overflow-hidden">
                            {/* Editor Panel */}
                            <div className="flex-1 p-10 overflow-y-auto custom-scrollbar bg-zinc-50/50 dark:bg-black/20">
                                <form onSubmit={handleSave} className="space-y-12">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Eşsiz Kimlik (ID)</label>
                                            <input type="text" value={editingActivity.id} onChange={e => setEditingActivity({...editingActivity, id: e.target.value.toUpperCase()})} className="w-full p-4 bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-2xl text-sm font-black focus:border-indigo-500 outline-none transition-all font-mono" />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Görünen Başlık</label>
                                            <input type="text" value={editingActivity.title} onChange={e => setEditingActivity({...editingActivity, title: e.target.value})} className="w-full p-4 bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-2xl text-sm font-black focus:border-indigo-500 outline-none transition-all" />
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h4 className="text-xs font-black text-zinc-800 dark:text-zinc-200 uppercase border-b pb-2 flex items-center gap-2"><i className="fa-solid fa-palette text-indigo-500"></i> Görsel Kimlik ve Tema</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">İkon</label>
                                                <div className="grid grid-cols-5 gap-2 p-4 bg-white dark:bg-zinc-900 rounded-2xl border dark:border-zinc-800 h-48 overflow-y-auto custom-scrollbar">
                                                    {ICON_LIST.map(icon => (
                                                        <button 
                                                            key={icon} type="button" onClick={() => setEditingActivity({...editingActivity, icon})}
                                                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${editingActivity.icon === icon ? 'bg-indigo-600 text-white shadow-lg' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-indigo-500'}`}
                                                        ><i className={`fa-solid ${icon}`}></i></button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Renk Paleti</label>
                                                <div className="space-y-4">
                                                    <div className="grid grid-cols-4 gap-2">
                                                        {THEME_PRESETS.map(theme => (
                                                            <button 
                                                                key={theme.name} type="button" 
                                                                onClick={() => setEditingActivity({...editingActivity, themeColor: theme.primary, secondaryColor: theme.secondary})}
                                                                className={`w-10 h-10 rounded-full border-4 transition-all ${editingActivity.themeColor === theme.primary ? 'border-zinc-900 dark:border-white scale-110 shadow-lg' : 'border-transparent'}`}
                                                                style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }}
                                                                title={theme.name}
                                                            />
                                                        ))}
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-1">
                                                            <span className="text-[8px] font-bold text-zinc-500">PRİMER</span>
                                                            <input type="color" value={editingActivity.themeColor} onChange={e => setEditingActivity({...editingActivity, themeColor: e.target.value})} className="w-full h-10 p-0 border-0 rounded-lg bg-transparent cursor-pointer" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <span className="text-[8px] font-bold text-zinc-500">SEKONDER</span>
                                                            <input type="color" value={editingActivity.secondaryColor || editingActivity.themeColor} onChange={e => setEditingActivity({...editingActivity, secondaryColor: e.target.value})} className="w-full h-10 p-0 border-0 rounded-lg bg-transparent cursor-pointer" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Sistem Ayarları</label>
                                                <div className="space-y-3">
                                                    <label className="flex items-center justify-between p-3 bg-white dark:bg-zinc-900 rounded-xl border dark:border-zinc-800 cursor-pointer transition-all hover:border-indigo-500">
                                                        <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300 uppercase">Aktif Durum</span>
                                                        <div className={`w-10 h-6 rounded-full relative transition-colors ${editingActivity.isActive ? 'bg-emerald-500' : 'bg-zinc-300'}`} onClick={() => setEditingActivity({...editingActivity, isActive: !editingActivity.isActive})}>
                                                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${editingActivity.isActive ? 'left-5' : 'left-1'}`}></div>
                                                        </div>
                                                    </label>
                                                    <label className="flex items-center justify-between p-3 bg-white dark:bg-zinc-900 rounded-xl border dark:border-zinc-800 cursor-pointer transition-all hover:border-amber-500">
                                                        <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300 uppercase">Premium (Pro)</span>
                                                        <div className={`w-10 h-6 rounded-full relative transition-colors ${editingActivity.isPremium ? 'bg-amber-500' : 'bg-zinc-300'}`} onClick={() => setEditingActivity({...editingActivity, isPremium: !editingActivity.isPremium})}>
                                                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${editingActivity.isPremium ? 'left-5' : 'left-1'}`}></div>
                                                        </div>
                                                    </label>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[10px] font-bold text-zinc-500 uppercase flex-1">Sıralama Ağırlığı</span>
                                                        <input type="number" value={editingActivity.order} onChange={e => setEditingActivity({...editingActivity, order: Number(e.target.value)})} className="w-20 p-2 bg-white dark:bg-zinc-900 border rounded-lg text-xs font-black text-center" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-zinc-900 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
                                         <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-6 flex items-center gap-2"><i className="fa-solid fa-microchip"></i> AI & Motor Entegrasyonu</h4>
                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-bold text-zinc-500 uppercase">Bağlı Prompt Şablonu</label>
                                                <select 
                                                    value={editingActivity.promptId || ''} 
                                                    onChange={e => setEditingActivity({...editingActivity, promptId: e.target.value})}
                                                    className="w-full p-4 bg-zinc-800 border border-zinc-700 rounded-2xl text-xs font-black text-white outline-none focus:ring-2 ring-indigo-500"
                                                >
                                                    <option value="">Prompt Seçilmedi</option>
                                                    {prompts.map(p => <option key={p.id} value={p.id}>{p.name} (v{p.version})</option>)}
                                                </select>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-bold text-zinc-500 uppercase">Kategori Ataması</label>
                                                <select 
                                                    value={editingActivity.category} 
                                                    onChange={e => setEditingActivity({...editingActivity, category: e.target.value})}
                                                    className="w-full p-4 bg-zinc-800 border border-zinc-700 rounded-2xl text-xs font-black text-white outline-none focus:ring-2 ring-indigo-500"
                                                >
                                                    {ACTIVITY_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                                                </select>
                                            </div>
                                         </div>
                                    </div>
                                </form>
                            </div>

                            {/* Live Preview Panel */}
                            <div className="w-[450px] border-l border-zinc-100 dark:border-zinc-800 bg-white dark:bg-[#09090b] flex flex-col items-center justify-center p-12 shrink-0">
                                <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em] mb-12">Canlı Kart Önizlemesi</h4>
                                
                                <div className="w-full max-w-[320px] aspect-[3/4] bg-white dark:bg-black rounded-[3.5rem] p-8 border-[6px] border-white dark:border-zinc-800 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] relative overflow-hidden transform hover:scale-105 transition-all duration-700">
                                    <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12" style={{ color: editingActivity.themeColor }}>
                                        <i className={`fa-solid ${editingActivity.icon} text-9xl`}></i>
                                    </div>
                                    <div className="relative z-10 h-full flex flex-col">
                                        <div 
                                            className="w-20 h-20 rounded-[1.8rem] flex items-center justify-center text-4xl shadow-2xl mb-8 border-4 border-white dark:border-zinc-900"
                                            style={{ background: `linear-gradient(135deg, ${editingActivity.themeColor}, ${editingActivity.secondaryColor || editingActivity.themeColor})`, color: '#fff' }}
                                        >
                                            <i className={`fa-solid ${editingActivity.icon}`}></i>
                                        </div>
                                        <div className="flex gap-2 mb-4">
                                            <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-[8px] font-black uppercase tracking-widest border border-zinc-200 dark:border-zinc-700">{editingActivity.category}</span>
                                            {editingActivity.isPremium && <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[8px] font-black uppercase tracking-widest shadow-sm"><i className="fa-solid fa-crown mr-1"></i> PRO</span>}
                                        </div>
                                        <h3 className="text-2xl font-black text-zinc-900 dark:text-white leading-tight mb-4 tracking-tighter">{editingActivity.title}</h3>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed italic line-clamp-3">"{editingActivity.description}"</p>
                                        <div className="mt-auto h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                            <div className="h-full transition-all duration-1000" style={{ width: '75%', background: `linear-gradient(90deg, ${editingActivity.themeColor}, ${editingActivity.secondaryColor || editingActivity.themeColor})` }}></div>
                                        </div>
                                    </div>
                                </div>
                                <p className="mt-10 text-center text-[10px] text-zinc-400 leading-relaxed max-w-[280px]">Bu tasarım, sistem genelinde tüm platformlarda (Öğrenci Dashboard, Raporlar, Kütüphane) geçerli olacaktır.</p>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-8 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-4 shrink-0 bg-white dark:bg-[#0d0d0f]">
                            <button onClick={() => setEditingActivity(null)} className="px-8 py-3 text-zinc-500 font-black text-xs uppercase tracking-widest hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all">Vazgeç</button>
                            <button 
                                onClick={handleSave} disabled={isSaving}
                                className="px-12 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-2xl shadow-emerald-500/20 transition-all transform active:scale-95 disabled:opacity-50"
                            >
                                {isSaving ? <i className="fa-solid fa-circle-notch fa-spin mr-2"></i> : <i className="fa-solid fa-cloud-arrow-up mr-2"></i>}
                                MİMARİYİ GÜNCELLE VE YAYINLA
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
