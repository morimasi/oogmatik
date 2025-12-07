
import React from 'react';
import { ActivityStats } from '../types';
import { AdminStatCard } from '../types/admin';

interface AdminAnalyticsProps {
    stats: ActivityStats[];
    totalUsers: number;
}

const StatCard = ({ item }: { item: AdminStatCard }) => (
    <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-sm flex items-center justify-between">
        <div>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider mb-1">{item.label}</p>
            <h3 className="text-3xl font-black text-zinc-900 dark:text-white">{item.value}</h3>
            {item.trend && (
                <div className={`flex items-center gap-1 text-xs font-bold mt-2 ${item.trendUp ? 'text-green-600 bg-green-50 px-2 py-0.5 rounded-full w-fit' : 'text-red-600 bg-red-50 px-2 py-0.5 rounded-full w-fit'}`}>
                    <i className={`fa-solid ${item.trendUp ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'}`}></i>
                    {item.trend}
                </div>
            )}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${item.color}`}>
            <i className={item.icon}></i>
        </div>
    </div>
);

export const AdminAnalytics: React.FC<AdminAnalyticsProps> = ({ stats, totalUsers }) => {
    const totalGenerations = stats.reduce((acc, curr) => acc + (curr.generationCount || 0), 0);
    const avgTime = stats.length > 0 ? Math.round(stats.reduce((a,b) => a + (b.avgCompletionTime || 0), 0) / stats.length) : 0;
    
    // Mock Trend Data (In real app, compare with last month)
    const metrics: AdminStatCard[] = [
        { label: 'Toplam Kullanıcı', value: totalUsers, trend: '%12 Artış', trendUp: true, icon: 'fa-users', color: 'bg-blue-100 text-blue-600' },
        { label: 'Üretilen İçerik', value: totalGenerations, trend: '%24 Artış', trendUp: true, icon: 'fa-wand-magic-sparkles', color: 'bg-purple-100 text-purple-600' },
        { label: 'Ortalama Süre', value: `${avgTime}sn`, trend: '%5 İyileşme', trendUp: true, icon: 'fa-clock', color: 'bg-amber-100 text-amber-600' },
        { label: 'Aktif Oturum', value: '42', trend: 'Canlı', trendUp: true, icon: 'fa-signal', color: 'bg-emerald-100 text-emerald-600' },
    ];

    const topActivities = [...stats].sort((a, b) => b.generationCount - a.generationCount).slice(0, 5);

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((m, i) => <StatCard key={i} item={m} />)}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Popularity Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-zinc-800 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-sm">
                    <h3 className="font-bold text-zinc-800 dark:text-zinc-100 mb-6">En Popüler Etkinlikler</h3>
                    <div className="space-y-4">
                        {topActivities.map((act, i) => {
                            const percent = (act.generationCount / (topActivities[0]?.generationCount || 1)) * 100;
                            return (
                                <div key={i}>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="font-bold text-zinc-700 dark:text-zinc-300">{act.title}</span>
                                        <span className="text-zinc-500">{act.generationCount} üretim</span>
                                    </div>
                                    <div className="w-full bg-zinc-100 dark:bg-zinc-700 rounded-full h-3">
                                        <div className="bg-indigo-500 h-3 rounded-full transition-all duration-1000" style={{ width: `${percent}%` }}></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Live Feed (Mock) */}
                <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-sm">
                    <h3 className="font-bold text-zinc-800 dark:text-zinc-100 mb-6 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        Canlı Akış
                    </h3>
                    <div className="space-y-4">
                        {[
                            { user: 'Ahmet Y.', action: 'Matematik Bulmacası üretti', time: '2 dk önce' },
                            { user: 'Elif K.', action: 'Yeni kayıt oldu', time: '5 dk önce' },
                            { user: 'Mehmet T.', action: 'Değerlendirme raporu aldı', time: '12 dk önce' },
                            { user: 'Zeynep S.', action: 'Hikaye oluşturdu', time: '20 dk önce' },
                        ].map((log, i) => (
                            <div key={i} className="flex gap-3 items-start border-b border-zinc-50 dark:border-zinc-700/50 pb-3 last:border-0 last:pb-0">
                                <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-500">
                                    {log.user[0]}
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{log.user}</p>
                                    <p className="text-[10px] text-zinc-500">{log.action}</p>
                                </div>
                                <span className="ml-auto text-[10px] text-zinc-400">{log.time}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
