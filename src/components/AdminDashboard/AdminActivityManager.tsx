import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { DynamicActivity } from '../../types/admin';

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
            console.error('Failed to load activities', e);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = async (activityId: string, currentState: boolean) => {
        try {
            await adminService.updateActivity(activityId, { isActive: !currentState });
            setActivities(prev => prev.map(a => a.id === activityId ? { ...a, isActive: !currentState } : a));
        } catch (e) {
            console.error('Update failed', e);
        }
    };

    if (loading) return <div className="p-8 text-center"><i className="fa-solid fa-spinner fa-spin text-2xl text-indigo-500"></i></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white dark:bg-zinc-800 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm relative z-10">
                <h2 className="text-xl font-bold">Aktivite Yöneticisi</h2>
                <button 
                  onClick={loadActivities}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors"
                >
                  Yenile
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activities.map(activity => (
                    <div 
                        key={activity.id}
                        className={`p-4 rounded-2xl border bg-white dark:bg-zinc-800 transition-all ${activity.isActive ? 'border-zinc-200 dark:border-zinc-700' : 'border-red-200 bg-red-50/30 dark:border-red-900/30 dark:bg-red-900/10'}`}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm`} style={{ backgroundColor: activity.themeColor }}>
                                <i className={`fa-solid ${activity.icon}`}></i>
                            </div>
                            <div className="flex items-center gap-2">
                                {activity.isPremium && (
                                    <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-black uppercase">PRO</span>
                                )}
                                <button 
                                    onClick={() => handleToggleActive(activity.id, activity.isActive)}
                                    className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-colors ${activity.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                                >
                                    {activity.isActive ? 'Aktif' : 'Pasif'}
                                </button>
                            </div>
                        </div>
                        <h3 className="font-bold text-sm mb-1">{activity.title}</h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 h-8">{activity.description}</p>
                        
                        <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-700 flex justify-between items-center">
                            <span className="text-[10px] text-zinc-400 font-mono italic">ID: {activity.id}</span>
                            <button className="text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:underline">Düzenle</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
