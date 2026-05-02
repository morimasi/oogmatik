import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { DynamicActivity } from '../../types/admin';

import { logInfo, logError, logWarn } from '../../utils/logger.js';
export const AdminActivityManager: React.FC = () => {
    const [activities, setActivities] = useState<DynamicActivity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadActivities();
    }, []);

    const loadActivities = async () => {
        setLoading(true);
        try {
            const data = await adminService.getAllActivities();
            setActivities(data);
        } catch (e) {
            logError('Failed to load activities', e);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = async (activityId: string, currentState: boolean) => {
        try {
            await adminService.updateActivity(activityId, { isActive: !currentState });
            setActivities(prev => prev.map(a => a.id === activityId ? { ...a, isActive: !currentState } : a));
        } catch (e) {
            logError('Update failed', e);
        }
    };

    const handleBulkSave = async () => {
        try {
            await adminService.saveActivitiesBulk(activities);
            alert('Tüm değişiklikler başarıyla kaydedildi.');
        } catch (e) {
            logError('Bulk save failed', e);
        }
    };

    if (loading) return <div className="p-12 text-center"><i className="fa-solid fa-circle-notch fa-spin text-4xl text-indigo-500"></i></div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 font-lexend">
            <div className="flex justify-between items-center bg-white/40 dark:bg-black/20 backdrop-blur-xl p-8 rounded-[2rem] border border-zinc-200 dark:border-white/5 shadow-2xl relative z-10">
                <div>
                    <h2 className="text-3xl font-black tracking-tighter uppercase">Aktivite Merkezi</h2>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Sprint 5 — Dinamik İçerik Yönetimi</p>
                </div>
                <div className="flex gap-3">
                    <button 
                      onClick={loadActivities}
                      className="px-6 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-zinc-200 transition-all active:scale-95"
                    >
                      Yenile
                    </button>
                    <button 
                      onClick={handleBulkSave}
                      className="px-8 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
                    >
                      Toplu Kaydet
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {activities.map(activity => (
                    <div 
                        key={activity.id}
                        className={`p-6 rounded-[2rem] border-2 transition-all duration-300 group hover:scale-[1.02] hover:shadow-2xl ${activity.isActive ? 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-white/5' : 'bg-red-50/20 dark:bg-red-900/10 border-red-200/50 dark:border-red-900/30 grayscale-[0.5]'}`}
                    >
                        <div className="flex items-start justify-between mb-6">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl transition-transform group-hover:rotate-12" style={{ backgroundColor: activity.themeColor }}>
                                <i className={`fa-solid ${activity.icon} text-xl`}></i>
                            </div>
                            <div className="flex items-center gap-2">
                                {activity.isPremium && (
                                    <span className="text-[9px] bg-amber-500 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">PREMIUM</span>
                                )}
                                <button 
                                    onClick={() => handleToggleActive(activity.id, activity.isActive)}
                                    className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activity.isActive ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}
                                >
                                    {activity.isActive ? 'Aktif' : 'Pasif'}
                                </button>
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <h3 className="font-black text-lg text-zinc-900 dark:text-white uppercase tracking-tight">{activity.title}</h3>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed font-medium">{activity.description}</p>
                        </div>
                        
                        <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-white/5 flex justify-between items-center">
                            <span className="text-[9px] text-zinc-400 font-mono tracking-tighter opacity-50">#{activity.id.toUpperCase()}</span>
                            <div className="flex gap-2">
                                <button className="p-2 w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-zinc-500 hover:text-indigo-500 transition-colors">
                                    <i className="fa-solid fa-pen-to-square"></i>
                                </button>
                                <button className="p-2 w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-zinc-500 hover:text-red-500 transition-colors">
                                    <i className="fa-solid fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
