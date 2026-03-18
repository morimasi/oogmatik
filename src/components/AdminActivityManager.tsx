
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

const CURRICULUM_NODES = [
    { id: 'phonology.awareness', label: 'Fonolojik Farkındalık' },
    { id: 'visual.perception', label: 'Görsel Algı' },
    { id: 'working.memory', label: 'Çalışma Belleği' },
    { id: 'executive.function', label: 'Yönetici İşlevler' },
    { id: 'math.logic', label: 'Matematik & Mantık' }
];

export const AdminActivityManager = () => {
    const [activities, setActivities] = useState<DynamicActivity[]>([]);
    const [prompts, setPrompts] = useState<PromptTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [editingActivity, setEditingActivity] = useState<DynamicActivity | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

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

    const handleSave = async (e?: any) => {
        if (e) e.preventDefault();
        if (!editingActivity || !editingActivity.id) return;
        setIsSaving(true);
        try {
            const payload = { ...editingActivity, updatedAt: new Date().toISOString() };
            await adminService.saveActivity(payload);
            setActivities((prev: DynamicActivity[]) => {
                const filteredPrev = prev.filter((a: DynamicActivity) => !!a && !!a.id);
                const exists = filteredPrev.find((a: DynamicActivity) => a.id === payload.id);
                const updated = exists ? filteredPrev.map((a: DynamicActivity) => a.id === payload.id ? payload : a) : [...filteredPrev, payload];
                return updated.sort((a: DynamicActivity, b: DynamicActivity) => (a.order || 0) - (b.order || 0));
            });
            setEditingActivity(null);
        } finally { setIsSaving(false); }
    };

    // Drag and Drop Logic
    const handleDragStart = (index: number) => setDraggedIndex(index);
    const handleDragOver = (e: any, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        const newActivities = [...activities];
        const item = newActivities.splice(draggedIndex, 1)[0];
        newActivities.splice(index, 0, item);

        // Re-calculate orders
        const reOrdered = newActivities.map((act, i) => ({ ...act, order: i + 1 }));
        setActivities(reOrdered);
        setDraggedIndex(index);
    };

    const handleDragEnd = async () => {
        setDraggedIndex(null);
        setIsSaving(true);
        try {
            await adminService.saveActivitiesBulk(activities);
        } finally {
            setIsSaving(false);
        }
    };

    const filtered = useMemo(() => {
        return activities.filter((a: DynamicActivity) => {
            if (!a || !a.id || !a.title) return false;
            const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) || a.id.toLowerCase().includes(search.toLowerCase());
            const matchCategory = activeCategory === 'all' || a.category === activeCategory;
            return matchSearch && matchCategory;
        });
    }, [activities, search, activeCategory]);

    return (
        <div className="h-full flex flex-col gap-6 animate-in fade-in duration-500 font-lexend">
            {/* TOOLBAR */}
            <div className="flex flex-col lg:flex-row gap-4 justify-between items-center bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-6 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl">
                <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                    <div className="relative flex-1 md:w-80 group">
                        <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-500 transition-colors"></i>
                        <input
                            type="text" placeholder="Aktivite veya Kimlik Ara..." value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-11 pr-4 py-3.5 bg-zinc-100/50 dark:bg-black/40 border border-transparent focus:border-indigo-500/30 rounded-2xl text-sm font-bold outline-none transition-all"
                        />
                    </div>
                    <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-2xl border dark:border-zinc-700">
                        <button onClick={() => setActiveCategory('all')} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${activeCategory === 'all' ? 'bg-white dark:bg-zinc-700 text-black dark:text-white shadow-lg scale-105' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>Tümü</button>
                        {ACTIVITY_CATEGORIES.map(c => (
                            <button key={c.id} onClick={() => setActiveCategory(c.id)} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${activeCategory === c.id ? 'bg-white dark:bg-zinc-700 text-black dark:text-white shadow-lg scale-105' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>{c.title.split(' ')[0]}</button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {isSaving && <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 animate-pulse"><i className="fa-solid fa-cloud-arrow-up"></i> SENKRONİZE EDİLİYOR...</div>}
                    <button
                        onClick={() => setEditingActivity({
                            id: `NEW_ACT_${Date.now()}`, title: 'Yeni Mimari Yapı', description: 'Pedagojik hedef ve kurgu açıklaması...',
                            icon: 'fa-star', category: 'math-logic', isActive: true, isPremium: false, order: activities.length + 1,
                            themeColor: '#6366f1', secondaryColor: '#4f46e5', targetSkills: [], updatedAt: new Date().toISOString(),
                            learningObjectives: [], curriculumNode: '',
                            engineConfig: { mode: 'ai_only', parameters: { allowDifficulty: true, allowDistraction: true, allowFontSize: true } }
                        })}
                        className="px-8 py-3.5 bg-indigo-600 hover:bg-emerald-600 text-white text-xs font-black rounded-2xl transition-all shadow-xl shadow-indigo-500/20 active:scale-95 flex items-center gap-2 group"
                    >
                        <i className="fa-solid fa-plus-circle group-hover:rotate-90 transition-transform"></i> YENİ ÜRETİM
                    </button>
                </div>
            </div>

            {/* BENTO GRID WITH DRAG & DROP */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-32">
                {filtered.map((act: DynamicActivity, idx: number) => (
                    <div
                        key={act.id}
                        draggable
                        onDragStart={() => handleDragStart(idx)}
                        onDragOver={(e) => handleDragOver(e, idx)}
                        onDragEnd={handleDragEnd}
                        onClick={() => setEditingActivity(act)}
                        className={`group relative bg-white dark:bg-zinc-900 rounded-[2.5rem] p-7 border-2 transition-all duration-500 cursor-grab active:cursor-grabbing hover:shadow-2xl hover:-translate-y-2 ${act.isActive ? 'border-zinc-100 dark:border-zinc-800' : 'border-dashed border-zinc-200 dark:border-zinc-800 opacity-60 grayscale'} ${draggedIndex === idx ? 'opacity-20 scale-95 border-indigo-500 border-dashed' : ''}`}
                    >
                        {/* Drag Handle Overlay */}
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-300 dark:text-zinc-700">
                            <i className="fa-solid fa-grip-vertical text-lg"></i>
                        </div>

                        <div className="flex justify-between items-start mb-8">
                            <div
                                className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-3xl shadow-2xl transition-all group-hover:scale-110 group-hover:rotate-6 border-4 border-white dark:border-zinc-900"
                                style={{ background: `linear-gradient(135deg, ${act.themeColor}, ${act.secondaryColor || act.themeColor})`, color: '#fff' }}
                            >
                                <i className={`fa-solid ${act.icon}`}></i>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <span className={`w-3.5 h-3.5 rounded-full ${act.isActive ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)]' : 'bg-zinc-300'}`}></span>
                                {act.isPremium && <i className="fa-solid fa-crown text-amber-500 text-xs drop-shadow-md"></i>}
                            </div>
                        </div>

                        <div className="mb-4">
                            <span className="text-[9px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-[0.2em] mb-1 block">{act.category}</span>
                            <h4 className="font-black text-xl text-zinc-900 dark:text-white leading-tight mb-2 truncate group-hover:text-indigo-600 transition-colors uppercase">{act.title}</h4>
                        </div>

                        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 font-medium leading-relaxed mb-6">{act.description}</p>

                        <div className="pt-5 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center group/meta">
                            <div className="flex gap-2">
                                {act.targetSkills?.slice(0, 2).map((skill: string) => (
                                    <span key={skill} className="text-[8px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-md">{skill}</span>
                                ))}
                            </div>
                            <div className="text-[11px] font-black text-zinc-300 dark:text-zinc-700 group-hover/meta:text-indigo-500 transition-colors">#{act.order}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* FULLSCREEN EDITOR MODAL (OZEL PROTOKOL) */}
            {editingActivity && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/95 backdrop-blur-3xl p-4 md:p-8 animate-in fade-in zoom-in duration-300">
                    <div className="bg-white dark:bg-[#070708] w-full max-w-7xl h-full rounded-[3.5rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col border border-white/5 overflow-hidden">
                        {/* Header */}
                        <div className="p-8 border-b border-zinc-100 dark:border-white/5 flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-8">
                                <div className="w-16 h-16 rounded-[1.8rem] flex items-center justify-center text-3xl shadow-[0_20px_40px_rgba(0,0,0,0.3)] border-4 border-white dark:border-zinc-900" style={{ background: `linear-gradient(135deg, ${editingActivity.themeColor}, ${editingActivity.secondaryColor || editingActivity.themeColor})`, color: '#fff' }}>
                                    <i className={`fa-solid ${editingActivity.icon}`}></i>
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="font-black text-3xl text-zinc-900 dark:text-white tracking-tighter uppercase">{editingActivity.title}</h3>
                                        <span className="px-3 py-1 bg-indigo-500/10 text-indigo-500 rounded-full text-[9px] font-black tracking-widest">{editingActivity.id}</span>
                                    </div>
                                    <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-[0.4em] flex items-center gap-2">
                                        <i className="fa-solid fa-dna text-indigo-500"></i> Mimari Çekirdek Editörü
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setEditingActivity(null)} className="w-14 h-14 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-500 transition-all transform hover:rotate-90 hover:scale-110"><i className="fa-solid fa-times text-2xl"></i></button>
                        </div>

                        <div className="flex-1 flex overflow-hidden">
                            {/* Editor Body */}
                            <div className="flex-1 p-10 overflow-y-auto custom-scrollbar-minimal bg-zinc-50/30 dark:bg-black/40">
                                <div className="max-w-4xl mx-auto space-y-16">
                                    {/* Kimlik Bölümü */}
                                    <section className="space-y-8">
                                        <h4 className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.3em] flex items-center gap-2"><div className="w-8 h-[1px] bg-zinc-400 opacity-20"></div> TEMEL KİMLİK</h4>
                                        <div className="grid grid-cols-2 gap-8 text-lexend">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Görünür Başlık</label>
                                                <input type="text" value={editingActivity.title} onChange={e => setEditingActivity({ ...editingActivity, title: e.target.value })} className="w-full p-5 bg-white dark:bg-zinc-900/50 border-2 border-zinc-100 dark:border-zinc-800 rounded-2xl text-base font-black focus:border-indigo-500 outline-none transition-all shadow-sm" />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Kategori Ataması</label>
                                                <select value={editingActivity.category} onChange={e => setEditingActivity({ ...editingActivity, category: e.target.value })} className="w-full p-5 bg-white dark:bg-zinc-900/50 border-2 border-zinc-100 dark:border-zinc-800 rounded-2xl text-base font-black focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer">
                                                    {ACTIVITY_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Görev Açıklaması (Pedagojik)</label>
                                            <textarea value={editingActivity.description} onChange={e => setEditingActivity({ ...editingActivity, description: e.target.value })} className="w-full p-5 bg-white dark:bg-zinc-900/50 border-2 border-zinc-100 dark:border-zinc-800 rounded-2xl text-sm font-medium focus:border-indigo-500 outline-none transition-all h-24 resize-none leading-relaxed" />
                                        </div>
                                    </section>

                                    {/* Müfredat Haritalama (YENİ) */}
                                    <section className="space-y-8">
                                        <h4 className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.3em] flex items-center gap-2"><div className="w-8 h-[1px] bg-indigo-400 opacity-20"></div> MÜFREDAT HARİTALAMA</h4>
                                        <div className="bg-indigo-50/30 dark:bg-indigo-900/10 p-8 rounded-[2.5rem] border border-indigo-100 dark:border-indigo-900/30">
                                            <div className="grid grid-cols-2 gap-8">
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Eğitim Node'u</label>
                                                    <select value={editingActivity.curriculumNode || ''} onChange={e => setEditingActivity({ ...editingActivity, curriculumNode: e.target.value })} className="w-full p-5 bg-white dark:bg-zinc-900 border-2 border-indigo-500/20 rounded-2xl text-sm font-black focus:border-indigo-500 outline-none transition-all cursor-pointer">
                                                        <option value="">Seçilmedi</option>
                                                        {CURRICULUM_NODES.map(node => <option key={node.id} value={node.id}>{node.label}</option>)}
                                                    </select>
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Öğrenme Hedefleri</label>
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            placeholder="Hedef ekle ve Enter..."
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    const val = (e.currentTarget.value).trim();
                                                                    if (val) {
                                                                        setEditingActivity({ ...editingActivity, learningObjectives: [...(editingActivity.learningObjectives || []), val] });
                                                                        e.currentTarget.value = '';
                                                                    }
                                                                }
                                                            }}
                                                            className="w-full p-4 bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-2xl text-sm font-bold outline-none focus:border-indigo-500"
                                                        />
                                                    </div>
                                                    <div className="flex flex-wrap gap-2 mt-3">
                                                        {(editingActivity.learningObjectives || []).map((obj: string, i: number) => (
                                                            <span key={i} className="px-3 py-1.5 bg-white dark:bg-zinc-800 border dark:border-zinc-700 rounded-xl text-[10px] font-bold text-zinc-600 dark:text-zinc-300 flex items-center gap-2 shadow-sm">
                                                                {obj}
                                                                <button onClick={() => setEditingActivity({ ...editingActivity, learningObjectives: editingActivity.learningObjectives?.filter((_: any, idx: number) => idx !== i) })} className="hover:text-red-500"><i className="fa-solid fa-times"></i></button>
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Görsel Stil */}
                                    <section className="space-y-8">
                                        <h4 className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.3em] flex items-center gap-2"><div className="w-8 h-[1px] bg-zinc-400 opacity-20"></div> GÖRSEL KİMLİK</h4>
                                        <div className="grid grid-cols-2 gap-10">
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">SİMGE SEÇİMİ</label>
                                                <div className="grid grid-cols-6 gap-3 p-6 bg-white dark:bg-zinc-900/50 rounded-3xl border dark:border-zinc-800 h-64 overflow-y-auto custom-scrollbar-minimal">
                                                    {ICON_LIST.map(icon => (
                                                        <button key={icon} type="button" onClick={() => setEditingActivity({ ...editingActivity, icon })} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${editingActivity.icon === icon ? 'bg-indigo-600 text-white shadow-xl scale-110 rotate-3' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-indigo-500 hover:bg-zinc-200'}`}><i className={`fa-solid ${icon} text-lg`}></i></button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">TEMA GRADYANI</label>
                                                <div className="p-8 bg-white dark:bg-zinc-900/50 rounded-3xl border dark:border-zinc-800 flex flex-col items-center justify-center gap-8 h-64">
                                                    <div className="flex gap-6">
                                                        <div className="flex flex-col items-center gap-3">
                                                            <div className="w-16 h-16 rounded-3xl shadow-xl transition-transform hover:scale-105 cursor-pointer relative overflow-hidden group" style={{ backgroundColor: editingActivity.themeColor }}>
                                                                <input type="color" value={editingActivity.themeColor} onChange={e => setEditingActivity({ ...editingActivity, themeColor: e.target.value })} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><i className="fa-solid fa-eyedropper text-white text-xl"></i></div>
                                                            </div>
                                                            <span className="text-[9px] font-black text-zinc-400">PRİMER</span>
                                                        </div>
                                                        <div className="w-12 h-[2px] bg-zinc-400 opacity-10 mt-8"></div>
                                                        <div className="flex flex-col items-center gap-3">
                                                            <div className="w-16 h-16 rounded-3xl shadow-xl transition-transform hover:scale-105 cursor-pointer relative overflow-hidden group" style={{ backgroundColor: editingActivity.secondaryColor || editingActivity.themeColor }}>
                                                                <input type="color" value={editingActivity.secondaryColor || editingActivity.themeColor} onChange={e => setEditingActivity({ ...editingActivity, secondaryColor: e.target.value })} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><i className="fa-solid fa-eyedropper text-white text-xl"></i></div>
                                                            </div>
                                                            <span className="text-[9px] font-black text-zinc-400">SEKONDER</span>
                                                        </div>
                                                    </div>
                                                    <div className="w-full h-4 rounded-full shadow-inner opacity-40" style={{ background: `linear-gradient(90deg, ${editingActivity.themeColor}, ${editingActivity.secondaryColor || editingActivity.themeColor})` }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                </div>
                            </div>

                            {/* Actions Right Sidebar */}
                            <div className="w-96 border-l border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-black/80 p-10 flex flex-col gap-10">
                                <section className="space-y-6">
                                    <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">SİSTEM KONTROLÜ</h4>
                                    <div className="space-y-3">
                                        <button onClick={() => setEditingActivity({ ...editingActivity, isActive: !editingActivity.isActive })} className={`w-full p-4 rounded-2xl flex items-center justify-between border-2 transition-all group ${editingActivity.isActive ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-600' : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-400'}`}>
                                            <span className="text-xs font-black uppercase">Aktif Yayın</span>
                                            <i className={`fa-solid ${editingActivity.isActive ? 'fa-toggle-on text-2xl text-emerald-500' : 'fa-toggle-off text-2xl text-zinc-300'}`}></i>
                                        </button>
                                        <button onClick={() => setEditingActivity({ ...editingActivity, isPremium: !editingActivity.isPremium })} className={`w-full p-4 rounded-2xl flex items-center justify-between border-2 transition-all group ${editingActivity.isPremium ? 'border-amber-500/30 bg-amber-500/5 text-amber-600' : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-400'}`}>
                                            <span className="text-xs font-black uppercase">Premium Erişim</span>
                                            <i className={`fa-solid fa-crown ${editingActivity.isPremium ? 'text-amber-500 scale-125' : 'text-zinc-300'}`}></i>
                                        </button>
                                    </div>
                                </section>

                                <section className="space-y-6">
                                    <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">AI MOTORU (PROMPT)</h4>
                                    <div className="space-y-4">
                                        <select value={editingActivity.promptId || ''} onChange={e => setEditingActivity({ ...editingActivity, promptId: e.target.value })} className="w-full p-4 bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-2xl text-xs font-black text-zinc-700 dark:text-zinc-200 outline-none focus:border-indigo-500 transition-all">
                                            <option value="">Prompt Seçilmedi</option>
                                            {prompts.map((p: PromptTemplate) => <option key={p.id} value={p.id}>{p.name} (v{p.version})</option>)}
                                        </select>
                                        <div className="p-5 bg-white dark:bg-zinc-900 rounded-[2rem] border dark:border-zinc-800 text-center space-y-3 shadow-xl">
                                            <div className="w-12 h-12 bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto text-xl"><i className="fa-solid fa-microchip"></i></div>
                                            <p className="text-[10px] font-medium text-zinc-500 leading-relaxed">Seçilen prompt, aktivite üretilirken "Sistem Talimatı" olarak kullanılacaktır.</p>
                                        </div>
                                    </div>
                                </section>

                                <div className="mt-auto space-y-4">
                                    <button onClick={() => setEditingActivity(null)} className="w-full py-4 text-zinc-400 font-black text-xs uppercase tracking-widest hover:text-zinc-900 dark:hover:text-white transition-all">DEĞİŞİKLİKLERİ İPTAL ET</button>
                                    <button onClick={() => handleSave()} disabled={isSaving} className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-emerald-500/30 transition-all transform active:scale-95 flex items-center justify-center gap-3">
                                        {isSaving ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-cloud-arrow-up"></i>}
                                        MİMARİYİ YAYINLA
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
