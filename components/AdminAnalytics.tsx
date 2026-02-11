
import React, { useMemo } from 'react';
import { ActivityStats } from '../types';
import { AdminStatCard } from '../types/admin';

interface AdminAnalyticsProps {
    stats: ActivityStats[];
    totalUsers: number;
}

// --- MICRO COMPONENTS ---

const Sparkline = ({ data, color }: { data: number[], color: string }) => {
    if (!data || data.length < 2) return null;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    
    // SVG Dimensions
    const width = 120;
    const height = 40;
    const step = width / (data.length - 1);
    
    const points = data.map((val, i) => {
        const x = i * step;
        const y = height - ((val - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg width={width} height={height} className="overflow-visible">
            <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={(data.length-1)*step} cy={height - ((data[data.length-1] - min) / range) * height} r="3" fill={color} />
        </svg>
    );
};

const StatCard: React.FC<{ item: AdminStatCard }> = ({ item }) => (
    <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
                <p className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-1">{item.label}</p>
                <h3 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">{item.value}</h3>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${item.color}`}>
                <i className={item.icon}></i>
            </div>
        </div>
        
        <div className="flex items-end justify-between relative z-10">
            {item.trend && (
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${item.trendUp ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : 'text-rose-600 bg-rose-50 dark:bg-rose-900/20'}`}>
                    <i className={`fa-solid ${item.trendUp ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'}`}></i>
                    {item.trend}
                </div>
            )}
            {item.chartData && (
                <div className="opacity-50 group-hover:opacity-100 transition-opacity">
                    <Sparkline data={item.chartData} color={item.trendUp ? '#10b981' : '#f43f5e'} />
                </div>
            )}
        </div>
        
        {/* Background Decoration */}
        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-zinc-100 to-transparent dark:from-zinc-700/30 rounded-full opacity-50 z-0 pointer-events-none"></div>
    </div>
);

const UsageBarChart = ({ data }: { data: { label: string, value: number, color: string }[] }) => {
    const maxVal = Math.max(...data.map(d => d.value), 1);
    
    return (
        <div className="w-full h-64 flex items-end justify-between gap-2 md:gap-4 mt-6">
            {data.map((item, i) => (
                <div key={i} className="flex-1 flex flex-col items-center group relative">
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 bg-zinc-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        {item.value} Üretim
                    </div>
                    
                    <div 
                        className="w-full bg-indigo-50 dark:bg-zinc-700/50 rounded-t-lg relative overflow-hidden transition-all duration-500 hover:opacity-80"
                        style={{ height: `${(item.value / maxVal) * 100}%` }}
                    >
                        <div className={`absolute bottom-0 left-0 w-full h-1 ${item.color}`}></div>
                        <div className={`w-full h-full opacity-20 ${item.color.replace('bg-', 'bg-opacity-20 ')}`}></div>
                    </div>
                    <span className="text-[10px] font-bold text-zinc-400 mt-2 uppercase tracking-wide truncate w-full text-center">
                        {item.label.substring(0, 3)}
                    </span>
                </div>
            ))}
        </div>
    );
};

export const AdminAnalytics: React.FC<AdminAnalyticsProps> = ({ stats, totalUsers }) => {
    const totalGenerations = stats.reduce((acc, curr) => acc + (curr.generationCount || 0), 0);
    const avgTime = stats.length > 0 ? Math.round(stats.reduce((a,b) => a + (b.avgCompletionTime || 0), 0) / stats.length) : 0;
    
    // Simulated Time Series Data
    const generateTimeSeries = (points: number, min: number, max: number) => 
        Array.from({length: points}, () => Math.floor(Math.random() * (max - min + 1) + min));

    const metrics: AdminStatCard[] = [
        { 
            label: 'Toplam Kullanıcı', value: totalUsers, 
            trend: '%12', trendUp: true, icon: 'fa-users', color: 'bg-blue-100 text-blue-600',
            chartData: generateTimeSeries(10, 80, 120)
        },
        { 
            label: 'Üretilen İçerik', value: totalGenerations, 
            trend: '%24', trendUp: true, icon: 'fa-wand-magic-sparkles', color: 'bg-purple-100 text-purple-600',
            chartData: generateTimeSeries(10, 200, 500)
        },
        { 
            label: 'Ort. Süre (sn)', value: avgTime, 
            trend: '%5', trendUp: true, icon: 'fa-clock', color: 'bg-amber-100 text-amber-600',
            chartData: generateTimeSeries(10, 8, 15)
        },
        { 
            label: 'Başarı Oranı', value: '%98', 
            trend: '%1', trendUp: true, icon: 'fa-check-circle', color: 'bg-emerald-100 text-emerald-600',
            chartData: [90, 92, 91, 94, 95, 96, 95, 97, 98, 98]
        },
    ];

    const topActivities = useMemo(() => 
        [...stats].sort((a, b) => b.generationCount - a.generationCount).slice(0, 7)
    , [stats]);

    const chartData = topActivities.map((act, i) => ({
        label: act.title,
        value: act.generationCount,
        color: i % 2 === 0 ? 'bg-indigo-500' : 'bg-purple-500'
    }));

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h2 className="text-2xl font-black text-zinc-900 dark:text-white">Platform Özeti</h2>
                    <p className="text-zinc-500 text-sm">Son 30 günlük performans verileri.</p>
                </div>
                <div className="flex bg-white dark:bg-zinc-800 p-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
                    <button className="px-3 py-1 text-xs font-bold bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded shadow-sm">30 Gün</button>
                    <button className="px-3 py-1 text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300">90 Gün</button>
                    <button className="px-3 py-1 text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300">Yıl</button>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((m, i) => <StatCard key={i} item={m} />)}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Usage Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-zinc-800 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-700 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-zinc-800 dark:text-zinc-100">En Popüler İçerikler</h3>
                        <button className="text-indigo-600 text-xs font-bold hover:underline">Raporu İndir</button>
                    </div>
                    
                    <UsageBarChart data={chartData} />
                </div>

                {/* System Health / Logs */}
                <div className="bg-white dark:bg-zinc-800 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-700 shadow-sm flex flex-col">
                    <h3 className="font-bold text-zinc-800 dark:text-zinc-100 mb-6 flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        Sistem Durumu
                    </h3>
                    
                    <div className="flex-1 space-y-6">
                        <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-700/30 rounded-xl border border-zinc-100 dark:border-zinc-700">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center text-sm">
                                    <i className="fa-solid fa-server"></i>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-zinc-700 dark:text-zinc-200">API Latency</p>
                                    <p className="text-[10px] text-zinc-500">Google Gemini</p>
                                </div>
                            </div>
                            <span className="text-sm font-mono font-bold text-green-600">120ms</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-700/30 rounded-xl border border-zinc-100 dark:border-zinc-700">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-sm">
                                    <i className="fa-solid fa-database"></i>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-zinc-700 dark:text-zinc-200">Veritabanı</p>
                                    <p className="text-[10px] text-zinc-500">Firebase Firestore</p>
                                </div>
                            </div>
                            <span className="text-sm font-mono font-bold text-blue-600">Aktif</span>
                        </div>

                        <div className="border-t border-zinc-100 dark:border-zinc-700 pt-4">
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Son Aktiviteler</p>
                            <div className="space-y-3">
                                {[
                                    { user: 'Ahmet Y.', action: 'Matematik Bulmacası', time: '2 dk' },
                                    { user: 'Elif K.', action: 'Kayıt Oldu', time: '5 dk' },
                                    { user: 'Mehmet T.', action: 'Rapor Oluşturdu', time: '12 dk' },
                                ].map((log, i) => (
                                    <div key={i} className="flex gap-2 items-center text-xs">
                                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-300"></div>
                                        <span className="font-bold text-zinc-700 dark:text-zinc-300">{log.user}</span>
                                        <span className="text-zinc-500 truncate flex-1">{log.action}</span>
                                        <span className="text-zinc-400 font-mono text-[10px]">{log.time}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
