
import React, { useState, useEffect } from 'react';
import { DynamicActivity, PromptTemplate } from '../types/admin';
import { adminService } from '../services/adminService';

const ICON_LIST = [
    'fa-star', 'fa-heart', 'fa-bolt', 'fa-brain', 'fa-puzzle-piece', 'fa-book-open', 'fa-calculator', 
    'fa-eye', 'fa-ear-listen', 'fa-pen-nib', 'fa-palette', 'fa-shapes', 'fa-stopwatch', 'fa-lightbulb',
    'fa-trophy', 'fa-medal', 'fa-crown', 'fa-rocket', 'fa-flask', 'fa-microscope', 'fa-earth-americas',
    'fa-map-location-dot', 'fa-user-doctor', 'fa-music', 'fa-video', 'fa-gamepad', 'fa-ghost', 'fa-robot'
];

export const AdminActivityManager: React.FC = () => {
    const [activities, setActivities] = useState<DynamicActivity[]>([]);
    const [prompts, setPrompts] = useState<PromptTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [editingActivity, setEditingActivity] = useState<DynamicActivity | null>(null);
    const [showIconPicker, setShowIconPicker] = useState(false);

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
        
        // Optimistic update
        setActivities(prev => prev.map(a => a.id === editingActivity.id ? editingActivity : a));
        setEditingActivity(null);
        
        await adminService.saveActivity(editingActivity);
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        const activity = activities.find(a => a.id === id);
        if (activity) {
            const updated = { ...activity, isActive: !currentStatus };
            setActivities(prev => prev.map(a => a.id === id ? updated : a));
            await adminService.saveActivity(updated);
        }
    };

    const filtered = activities.filter(a => a.title.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white dark:bg-zinc-800 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm">
                <div className="relative w-64">
                    <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"></i>
                    <input 
                        type="text" 
                        placeholder="Etkinlik ara..." 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-zinc-100 dark:bg-zinc-700/50 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2">
                    <i className="fa-solid fa-plus"></i> Yeni Ekle
                </button>
            </div>

            {loading ? <div className="text-center p-12"><i className="fa-solid fa-spinner fa-spin text-2xl text-indigo-500"></i></div> : (
                <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden shadow-sm">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-zinc-50 dark:bg-zinc-700/30 text-zinc-500 uppercase text-xs font-bold">
                            <tr>
                                <th className="p-4">Etkinlik</th>
                                <th className="p-4">Kategori</th>
                                <th className="p-4">Prompt</th>
                                <th className="p-4">Durum</th>
                                <th className="p-4 text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700">
                            {filtered.map(act => (
                                <tr key={act.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-700/20 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl">
                                                <i className={act.icon}></i>
                                            </div>
                                            <div>
                                                <p className="font-bold text-zinc-900 dark:text-zinc-100">{act.title}</p>
                                                <p className="text-xs text-zinc-500 truncate max-w-[200px]">{act.description}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-zinc-600 dark:text-zinc-400 capitalize">{act.category}</td>
                                    <td className="p-4">
                                        {act.promptId ? (
                                            <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-1 rounded border border-indigo-200">
                                                {prompts.find(p => p.id === act.promptId)?.name || act.promptId}
                                            </span>
                                        ) : <span className="text-zinc-300 text-xs">-</span>}
                                    </td>
                                    <td className="p-4">
                                        <button 
                                            onClick={() => toggleStatus(act.id, act.isActive)}
                                            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${act.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-zinc-200 text-zinc-600 hover:bg-zinc-300'}`}
                                        >
                                            {act.isActive ? 'Aktif' : 'Pasif'}
                                        </button>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button 
                                            onClick={() => setEditingActivity(act)}
                                            className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg transition-colors" 
                                            title="Düzenle"
                                        >
                                            <i className="fa-solid fa-pen-to-square"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* EDIT MODAL */}
            {editingActivity && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-zinc-800 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-5 border-b border-zinc-200 dark:border-zinc-700 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900">
                            <h3 className="font-bold text-xl text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                                <i className="fa-solid fa-pen-nib text-indigo-500"></i> Etkinlik Düzenle
                            </h3>
                            <button onClick={() => setEditingActivity(null)} className="w-8 h-8 rounded-full hover:bg-zinc-200 flex items-center justify-center text-zinc-500"><i className="fa-solid fa-times"></i></button>
                        </div>
                        
                        <div className="flex flex-col md:flex-row h-full overflow-hidden">
                            {/* Form Side */}
                            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar border-r border-zinc-200 dark:border-zinc-700">
                                <form id="edit-form" onSubmit={handleSave} className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Başlık</label>
                                        <input type="text" value={editingActivity.title} onChange={e => setEditingActivity({...editingActivity, title: e.target.value})} className="w-full p-3 border rounded-xl bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Açıklama</label>
                                        <textarea value={editingActivity.description} onChange={e => setEditingActivity({...editingActivity, description: e.target.value})} className="w-full p-3 border rounded-xl bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="relative">
                                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">İkon</label>
                                            <button 
                                                type="button" 
                                                onClick={() => setShowIconPicker(!showIconPicker)}
                                                className="w-full p-3 border rounded-xl bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-700 dark:text-white flex items-center justify-between hover:bg-zinc-100"
                                            >
                                                <span><i className={`${editingActivity.icon} mr-2`}></i> {editingActivity.icon}</span>
                                                <i className="fa-solid fa-chevron-down text-xs"></i>
                                            </button>
                                            
                                            {showIconPicker && (
                                                <div className="absolute top-full left-0 w-full bg-white dark:bg-zinc-800 border rounded-xl shadow-xl p-2 grid grid-cols-6 gap-2 mt-2 z-50 h-40 overflow-y-auto">
                                                    {ICON_LIST.map(icon => (
                                                        <button 
                                                            key={icon} 
                                                            type="button"
                                                            onClick={() => { setEditingActivity({...editingActivity, icon}); setShowIconPicker(false); }}
                                                            className={`w-8 h-8 rounded flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 transition-colors ${editingActivity.icon === icon ? 'bg-indigo-100 text-indigo-700' : 'text-zinc-500'}`}
                                                        >
                                                            <i className={`fa-solid ${icon}`}></i>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Kategori ID</label>
                                            <input type="text" value={editingActivity.category} onChange={e => setEditingActivity({...editingActivity, category: e.target.value})} className="w-full p-3 border rounded-xl bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-700 dark:text-white outline-none" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Bağlı AI Prompt Şablonu</label>
                                        <select 
                                            value={editingActivity.promptId || ''} 
                                            onChange={e => setEditingActivity({...editingActivity, promptId: e.target.value})}
                                            className="w-full p-3 border rounded-xl bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                        >
                                            <option value="">-- Prompt Seçiniz --</option>
                                            {prompts.map(p => (
                                                <option key={p.id} value={p.id}>{p.name} (v{p.version})</option>
                                            ))}
                                        </select>
                                        <p className="text-xs text-zinc-400 mt-1">Bu aktivite seçildiğinde hangi AI mantığının çalışacağını belirler.</p>
                                    </div>

                                    <div className="flex items-center gap-3 pt-2 bg-zinc-50 dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700">
                                        <input type="checkbox" id="isPremium" checked={editingActivity.isPremium} onChange={e => setEditingActivity({...editingActivity, isPremium: e.target.checked})} className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500" />
                                        <label htmlFor="isPremium" className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Premium İçerik</label>
                                    </div>
                                </form>
                            </div>

                            {/* Preview Side */}
                            <div className="w-80 bg-zinc-100 dark:bg-zinc-950 p-8 flex flex-col items-center justify-center border-l border-zinc-200 dark:border-zinc-700">
                                <h4 className="text-xs font-bold text-zinc-400 uppercase mb-4 tracking-widest">Kullanıcı Görünümü</h4>
                                
                                {/* Card Preview */}
                                <div className="bg-white dark:bg-zinc-800 rounded-3xl p-5 border border-zinc-200 dark:border-zinc-700 shadow-lg w-full relative overflow-hidden group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner bg-indigo-100 text-indigo-700 dark:bg-zinc-700 dark:text-white`}>
                                            <i className={editingActivity.icon}></i>
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider bg-zinc-100 text-zinc-700 border-zinc-200">
                                                {editingActivity.category}
                                            </span>
                                            {editingActivity.isPremium && (
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 flex items-center gap-1">
                                                    <i className="fa-solid fa-crown"></i>
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 leading-tight mb-2">
                                            {editingActivity.title}
                                        </h3>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                                            {editingActivity.description}
                                        </p>
                                    </div>
                                    <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-700/50 flex items-center justify-between">
                                        <span className="text-xs font-bold text-zinc-400">Oluştur</span>
                                        <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center">
                                            <i className="fa-solid fa-arrow-up-right"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 border-t border-zinc-200 dark:border-zinc-700 flex justify-end gap-3 bg-zinc-50 dark:bg-zinc-900">
                            <button onClick={() => setEditingActivity(null)} className="px-6 py-3 text-zinc-500 font-bold hover:bg-zinc-200 rounded-xl transition-colors">Vazgeç</button>
                            <button type="submit" form="edit-form" className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg transition-transform active:scale-95">Değişiklikleri Kaydet</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
