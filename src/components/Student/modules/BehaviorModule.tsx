import React from 'react';
import { AdvancedStudent, BehaviorIncident } from '../../../types/student-advanced';

interface BehaviorModuleProps {
    student: AdvancedStudent;
    onUpdate?: (data: Partial<AdvancedStudent>) => void;
}

export const BehaviorModule: React.FC<BehaviorModuleProps> = ({ student, onUpdate }) => {
    const handleAddFakeIncident = () => {
        if (!onUpdate) return;
        const newIncident: BehaviorIncident = {
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            title: "Olumlu Pekiştireç Alındı",
            description: "Derste verilen ekstra görevi başarıyla tamamladı.",
            type: "positive",
            category: "responsibility",
            points: 10,
            reportedBy: "Sistem AI"
        };
        const currentScore = student.behavior?.score || 0;
        const currentIncidents = student.behavior?.incidents || [];
        onUpdate({
            ...student,
            behavior: {
                ...student.behavior,
                score: currentScore + 10,
                incidents: [newIncident, ...currentIncidents]
            }
        });
    };

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
        <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 h-full animate-in fade-in duration-700">
            {/* Timeline Column (Bento Card Tall) */}
            <div className="lg:col-span-2 space-y-8">
                <div className="bg-white dark:bg-zinc-900 rounded-[3.5rem] border border-zinc-200 dark:border-zinc-800 p-10 shadow-sm flex flex-col h-full">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h3 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter">Klinik Gözlem Günlüğü</h3>
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">Davranışsal Veri Akışı</p>
                        </div>
                        <button onClick={handleAddFakeIncident} className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all">
                            <i className="fa-solid fa-plus-circle mr-2"></i>
                            Yeni Kayıt
                        </button>
                    </div>

                    <div className="relative pl-12 space-y-12 before:absolute before:left-5 before:top-2 before:bottom-2 before:w-px before:bg-gradient-to-b before:from-indigo-500 before:via-zinc-200 before:to-transparent dark:before:via-zinc-800 flex-1 overflow-y-auto custom-scrollbar pr-4">
                        {sortedDates.map((date) => (
                            <div key={date} className="relative group/date">
                                <div className="absolute -left-[38px] top-1 w-6 h-6 rounded-full bg-white dark:bg-zinc-900 border-4 border-indigo-500 shadow-xl z-10 group-hover/date:scale-125 transition-transform"></div>
                                <h4 className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-6">{date}</h4>

                                <div className="grid gap-6">
                                    {groupedIncidents[date].map((incident) => (
                                        <div key={incident.id} className="group/item relative bg-zinc-50 dark:bg-zinc-800/50 rounded-[2.5rem] p-8 border border-zinc-100 dark:border-zinc-800 hover:border-indigo-500/30 transition-all hover:shadow-2xl">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner
                                                        ${incident.type === 'positive' ? 'bg-emerald-50 text-emerald-600' :
                                                            incident.type === 'negative' ? 'bg-rose-50 text-rose-600' : 'bg-zinc-100 text-zinc-400'}`}>
                                                        <i className={`fa-solid ${incident.category === 'participation' ? 'fa-puzzle-piece' :
                                                            incident.category === 'respect' ? 'fa-handshake' :
                                                                incident.category === 'responsibility' ? 'fa-clipboard-check' : 'fa-bolt-lightning'
                                                            }`}></i>
                                                    </div>
                                                    <div>
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block mb-1">
                                                            {incident.category === 'participation' ? 'Derse Katılım' :
                                                                incident.category === 'respect' ? 'Sosyal Uyum' :
                                                                    incident.category === 'responsibility' ? 'Sorumluluk Bilinci' : incident.category}
                                                        </span>
                                                        <h5 className="text-lg font-black text-zinc-900 dark:text-white leading-tight uppercase tracking-tight">{incident.title}</h5>
                                                    </div>
                                                </div>
                                                <div className={`px-4 py-2 rounded-2xl font-black text-xl shadow-sm
                                                    ${incident.points > 0 ? 'bg-emerald-500/10 text-emerald-500' :
                                                        incident.points < 0 ? 'bg-rose-500/10 text-rose-500' : 'bg-zinc-100 text-zinc-400'}`}>
                                                    {incident.points > 0 ? '+' : ''}{incident.points}
                                                </div>
                                            </div>

                                            <p className="text-sm text-zinc-500 font-medium leading-relaxed italic border-l-2 border-zinc-200 dark:border-zinc-700 pl-4 py-1">
                                                "{incident.description}"
                                            </p>

                                            {incident.actionTaken && (
                                                <div className="mt-6 p-4 bg-white dark:bg-zinc-900 rounded-2xl text-[10px] font-bold border border-zinc-100 dark:border-zinc-800 text-zinc-400 flex items-center gap-3">
                                                    <i className="fa-solid fa-reply-all text-indigo-500"></i>
                                                    <span className="font-black text-indigo-600 uppercase tracking-widest">Müdahale:</span> {incident.actionTaken}
                                                </div>
                                            )}

                                            <div className="mt-6 flex justify-between items-center opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-zinc-200"></div>
                                                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{incident.reportedBy}</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button className="w-8 h-8 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-indigo-500"><i className="fa-solid fa-pen-nib"></i></button>
                                                    <button className="w-8 h-8 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center justify-center text-rose-400"><i className="fa-solid fa-trash-alt"></i></button>
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

            {/* Scoreboard Column (Contextual Modules) */}
            <div className="space-y-8 h-full">
                {/* Score Card (Bento Premium) */}
                <div className="bg-gradient-to-br from-indigo-900 via-zinc-950 to-black rounded-[3.5rem] p-10 text-white shadow-2xl relative overflow-hidden group border border-white/5">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full -mr-40 -mt-40 blur-3xl animate-pulse"></div>
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/10 mb-8">
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-300">Kümülatif Davranış Skoru</span>
                        </div>

                        <div className="flex items-baseline gap-2 mb-2">
                            <span className="text-8xl font-black tracking-tighter">{student.behavior?.score || 0}</span>
                            <span className="text-2xl font-black text-indigo-500">pts</span>
                        </div>

                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-6 mt-4">
                            <div className="h-full bg-gradient-to-r from-indigo-500 to-indigo-300 w-[75%] rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
                        </div>

                        <div className="flex items-center gap-3 py-3 px-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                            <i className="fa-solid fa-arrow-trend-up text-emerald-500"></i>
                            <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">Haftalık Artış: +12</span>
                        </div>
                    </div>
                </div>

                {/* Badges Module (Bento Card High Intensity) */}
                <div className="bg-white dark:bg-zinc-900 rounded-[3.5rem] border border-zinc-200 dark:border-zinc-800 p-10 shadow-sm overflow-hidden">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tighter">Dijital Rozetler</h3>
                        <i className="fa-solid fa-award text-zinc-200 text-2xl"></i>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { icon: 'fa-medal', label: 'Haftanın Yıldızı', active: true, color: 'amber' },
                            { icon: 'fa-crown', label: 'Lider Ruh', active: true, color: 'indigo' },
                            { icon: 'fa-heart', label: 'Duyarlı', active: true, color: 'rose' },
                            { icon: 'fa-shield-halved', label: 'Korumacı', active: false, color: 'zinc' },
                            { icon: 'fa-star', label: 'Kaşif', active: false, color: 'zinc' },
                            { icon: 'fa-bolt', label: 'Hızlı', active: false, color: 'zinc' }
                        ].map((badge, i) => (
                            <div key={i} className={`aspect-square rounded-[2rem] flex flex-col items-center justify-center p-3 text-center group cursor-pointer transition-all border
                                ${badge.active
                                    ? 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-100 dark:border-zinc-800 hover:scale-105'
                                    : 'bg-zinc-50/30 dark:bg-black/10 border-dashed border-zinc-200 dark:border-zinc-800 opacity-40'}`}>
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-2 
                                    ${badge.active ? `bg-${badge.color}-50 dark:bg-${badge.color}-900/20 text-${badge.color}-500` : 'bg-transparent text-zinc-300'}`}>
                                    <i className={`fa-solid ${badge.active ? badge.icon : 'fa-lock'}`}></i>
                                </div>
                                <span className="text-[8px] font-black uppercase leading-tight tracking-tighter text-zinc-400">
                                    {badge.active ? badge.label : 'Kilitli'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Analysis Module (Bento Card Contextual) */}
                <div className="bg-white dark:bg-zinc-900 rounded-[3.5rem] border border-zinc-200 dark:border-zinc-800 p-10 shadow-sm">
                    <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tighter mb-8">Davranış Spektrumu</h3>
                    <div className="space-y-8">
                        <div>
                            <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-widest mb-3">
                                <span className="text-zinc-400">Adaptif Uyum</span>
                                <span className="text-emerald-500">%85</span>
                            </div>
                            <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden shadow-inner">
                                <div className="h-full bg-emerald-500 w-[85%] rounded-full"></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-widest mb-3">
                                <span className="text-zinc-400">Reaktif Tepki</span>
                                <span className="text-rose-500">%15</span>
                            </div>
                            <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden shadow-inner">
                                <div className="h-full bg-rose-500 w-[15%] rounded-full"></div>
                            </div>
                        </div>
                        <div className="p-6 bg-indigo-50 dark:bg-indigo-900/10 rounded-[2rem] border border-indigo-100 dark:border-indigo-800/30 mt-4">
                            <p className="text-[10px] font-bold text-indigo-600 leading-relaxed italic">
                                "Öğrencinin olumlu pekiştireçlere yanıtı son 14 günde %30 artış gösterdi. Ödül mekanizması etkili çalışıyor."
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
