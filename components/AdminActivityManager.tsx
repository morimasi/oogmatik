
import React, { useState, useEffect } from 'react';
import { DynamicActivity } from '../types/admin';
import { adminService } from '../services/adminService';

export const AdminActivityManager: React.FC = () => {
    const [activities, setActivities] = useState<DynamicActivity[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [editingActivity, setEditingActivity] = useState<DynamicActivity | null>(null);

    useEffect(() => {
        loadActivities();
    }, []);

    const loadActivities = async () => {
        setLoading(true);
        const data = await adminService.getAllActivities();
        setActivities(data);
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-zinc-800 w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-4 border-b border-zinc-200 dark:border-zinc-700 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900">
                            <h3 className="font-bold text-lg text-zinc-800 dark:text-zinc-100">Etkinlik Düzenle</h3>
                            <button onClick={() => setEditingActivity(null)}><i className="fa-solid fa-times text-zinc-500"></i></button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <form id="edit-form" onSubmit={handleSave} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Başlık</label>
                                    <input type="text" value={editingActivity.title} onChange={e => setEditingActivity({...editingActivity, title: e.target.value})} className="w-full p-2 border rounded-lg bg-transparent dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Açıklama</label>
                                    <textarea value={editingActivity.description} onChange={e => setEditingActivity({...editingActivity, description: e.target.value})} className="w-full p-2 border rounded-lg bg-transparent dark:text-white h-24 resize-none" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">İkon (FontAwesome)</label>
                                        <input type="text" value={editingActivity.icon} onChange={e => setEditingActivity({...editingActivity, icon: e.target.value})} className="w-full p-2 border rounded-lg bg-transparent dark:text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Kategori ID</label>
                                        <input type="text" value={editingActivity.category} onChange={e => setEditingActivity({...editingActivity, category: e.target.value})} className="w-full p-2 border rounded-lg bg-transparent dark:text-white" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 pt-2">
                                    <input type="checkbox" id="isPremium" checked={editingActivity.isPremium} onChange={e => setEditingActivity({...editingActivity, isPremium: e.target.checked})} />
                                    <label htmlFor="isPremium" className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Premium İçerik</label>
                                </div>
                            </form>
                        </div>
                        <div className="p-4 border-t border-zinc-200 dark:border-zinc-700 flex justify-end gap-3 bg-zinc-50 dark:bg-zinc-900">
                            <button onClick={() => setEditingActivity(null)} className="px-4 py-2 text-zinc-500 font-bold hover:bg-zinc-200 rounded-lg">İptal</button>
                            <button type="submit" form="edit-form" className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700">Kaydet</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
