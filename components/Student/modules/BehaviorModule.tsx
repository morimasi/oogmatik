import React from 'react';
import { AdvancedStudent, BehaviorIncident } from '../../../types/student-advanced';

interface BehaviorModuleProps {
    student: AdvancedStudent;
}

export const BehaviorModule: React.FC<BehaviorModuleProps> = ({ student }) => {
    // Group incidents by date
    const groupedIncidents = student.behavior?.incidents?.reduce((acc, incident) => {
        const date = new Date(incident.date).toLocaleDateString('tr-TR');
        if (!acc[date]) acc[date] = [];
        acc[date].push(incident);
        return acc;
    }, {} as Record<string, BehaviorIncident[]>) || {};

    const sortedDates = Object.keys(groupedIncidents).sort((a, b) => 
        new Date(b.split('.').reverse().join('-')).getTime() - new Date(a.split('.').reverse().join('-')).getTime()
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* Timeline Column */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-zinc-900 dark:text-white text-lg">Davranış Günlüğü</h3>
                        <button className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-2 rounded-lg text-sm font-bold shadow-lg hover:scale-105 transition-transform">
                            <i className="fa-solid fa-plus mr-2"></i>
                            Kayıt Ekle
                        </button>
                    </div>

                    <div className="relative border-l-2 border-zinc-100 dark:border-zinc-800 ml-3 space-y-8">
                        {sortedDates.map((date) => (
                            <div key={date} className="relative pl-8">
                                <span className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-zinc-200 dark:bg-zinc-700 border-4 border-white dark:border-zinc-900"></span>
                                <h4 className="font-bold text-zinc-500 text-sm mb-4">{date}</h4>
                                
                                <div className="space-y-4">
                                    {groupedIncidents[date].map((incident) => (
                                        <div key={incident.id} className="group bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 border border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 transition-colors relative overflow-hidden">
                                            <div className={`absolute top-0 left-0 bottom-0 w-1 
                                                ${incident.type === 'positive' ? 'bg-emerald-500' : 
                                                  incident.type === 'negative' ? 'bg-rose-500' : 'bg-zinc-400'}`}>
                                            </div>
                                            
                                            <div className="flex justify-between items-start mb-2 pl-2">
                                                <div>
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md mb-2 inline-block
                                                        ${incident.type === 'positive' ? 'bg-emerald-100 text-emerald-700' : 
                                                          incident.type === 'negative' ? 'bg-rose-100 text-rose-700' : 'bg-zinc-200 text-zinc-600'}`}>
                                                        {incident.category === 'participation' ? 'Katılım' : 
                                                         incident.category === 'respect' ? 'Saygı' : 
                                                         incident.category === 'responsibility' ? 'Sorumluluk' : incident.category}
                                                    </span>
                                                    <h5 className="font-bold text-zinc-900 dark:text-white">{incident.title}</h5>
                                                </div>
                                                <span className={`text-lg font-black 
                                                    ${incident.points > 0 ? 'text-emerald-500' : 
                                                      incident.points < 0 ? 'text-rose-500' : 'text-zinc-400'}`}>
                                                    {incident.points > 0 ? '+' : ''}{incident.points}
                                                </span>
                                            </div>
                                            
                                            <p className="text-sm text-zinc-600 dark:text-zinc-400 pl-2 leading-relaxed">
                                                {incident.description}
                                            </p>

                                            {incident.actionTaken && (
                                                <div className="mt-3 ml-2 p-2 bg-white dark:bg-zinc-900 rounded-lg text-xs border border-zinc-200 dark:border-zinc-700">
                                                    <span className="font-bold text-zinc-500">Alınan Aksiyon:</span> {incident.actionTaken}
                                                </div>
                                            )}

                                            <div className="mt-3 ml-2 flex justify-between items-center">
                                                <span className="text-[10px] text-zinc-400 italic">Raporlayan: {incident.reportedBy}</span>
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                                    <button className="text-zinc-400 hover:text-indigo-500"><i className="fa-solid fa-pen"></i></button>
                                                    <button className="text-zinc-400 hover:text-rose-500"><i className="fa-solid fa-trash"></i></button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Scoreboard Column */}
            <div className="space-y-6">
                <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 text-white text-center relative overflow-hidden shadow-xl shadow-indigo-900/20">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                    <div className="relative z-10">
                        <p className="text-indigo-200 font-bold text-sm uppercase tracking-widest mb-2">Davranış Puanı</p>
                        <div className="text-6xl font-black mb-4 flex items-center justify-center gap-2">
                            {student.behavior?.score || 0}
                            <i className="fa-solid fa-star text-3xl text-yellow-400 animate-pulse"></i>
                        </div>
                        <div className="w-full bg-black/20 rounded-full h-2 overflow-hidden mb-4">
                            <div className="h-full bg-white/30 w-[75%] rounded-full"></div>
                        </div>
                        <p className="text-xs text-indigo-100">
                            Geçen haftaya göre <span className="font-bold text-white">+12 puan</span> artış!
                        </p>
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6">
                    <h3 className="font-bold text-zinc-900 dark:text-white mb-4">Rozetler & Başarılar</h3>
                    <div className="grid grid-cols-3 gap-3">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="aspect-square rounded-xl bg-zinc-50 dark:bg-zinc-800 flex flex-col items-center justify-center p-2 text-center group cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl mb-1 transition-transform group-hover:scale-110
                                    ${i <= 3 ? 'bg-amber-100 text-amber-500' : 'bg-zinc-200 text-zinc-400 grayscale'}`}>
                                    <i className={`fa-solid ${i === 1 ? 'fa-medal' : i === 2 ? 'fa-crown' : i === 3 ? 'fa-star' : 'fa-lock'}`}></i>
                                </div>
                                <span className={`text-[10px] font-bold leading-tight ${i <= 3 ? 'text-zinc-700 dark:text-zinc-300' : 'text-zinc-400'}`}>
                                    {i === 1 ? 'Haftanın Yıldızı' : i === 2 ? 'Yardımsever' : i === 3 ? 'Kitap Kurdu' : 'Kilitli'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6">
                    <h3 className="font-bold text-zinc-900 dark:text-white mb-4">Analiz</h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-xs font-bold mb-1">
                                <span className="text-zinc-500">Olumlu Davranışlar</span>
                                <span className="text-emerald-500">85%</span>
                            </div>
                            <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 w-[85%] rounded-full"></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs font-bold mb-1">
                                <span className="text-zinc-500">Olumsuz Davranışlar</span>
                                <span className="text-rose-500">15%</span>
                            </div>
                            <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                <div className="h-full bg-rose-500 w-[15%] rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
