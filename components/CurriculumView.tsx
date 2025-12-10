
import React, { useState } from 'react';
import { curriculumService } from '../services/curriculumService';
import { Curriculum } from '../types';
import { ACTIVITIES } from '../constants';

interface CurriculumViewProps {
    onBack: () => void;
    onSelectActivity: (id: string) => void;
}

export const CurriculumView: React.FC<CurriculumViewProps> = ({ onBack, onSelectActivity }) => {
    const [step, setStep] = useState<'form' | 'plan'>('form');
    const [loading, setLoading] = useState(false);
    const [curriculum, setCurriculum] = useState<Curriculum | null>(null);

    // Form State
    const [name, setName] = useState('');
    const [age, setAge] = useState(8);
    const [grade, setGrade] = useState('2. Sınıf');
    const [diagnosis, setDiagnosis] = useState('Disleksi (Okuma Güçlüğü)');
    const [duration, setDuration] = useState(7);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await curriculumService.generatePlan(name, age, grade, diagnosis, duration);
            setCurriculum(result);
            setStep('plan');
        } catch (error) {
            console.error(error);
            alert("Müfredat oluşturulamadı.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full bg-zinc-50 dark:bg-zinc-900 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 flex justify-between items-center shadow-sm shrink-0">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="w-8 h-8 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center justify-center transition-colors">
                        <i className="fa-solid fa-arrow-left text-zinc-500"></i>
                    </button>
                    <h2 className="text-xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
                        <i className="fa-solid fa-calendar-check text-indigo-500"></i>
                        AI Müfredat Sihirbazı
                    </h2>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                {step === 'form' ? (
                    <div className="max-w-2xl mx-auto bg-white dark:bg-zinc-800 rounded-3xl p-8 shadow-xl border border-zinc-200 dark:border-zinc-700">
                        <h3 className="text-2xl font-bold mb-2 text-zinc-800 dark:text-white">Yeni Plan Oluştur</h3>
                        <p className="text-zinc-500 mb-8">Öğrencinin ihtiyaçlarına göre kişiselleştirilmiş bir çalışma takvimi hazırlayın.</p>
                        
                        <form onSubmit={handleGenerate} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-zinc-500 mb-2">Öğrenci Adı</label>
                                    <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-zinc-500 mb-2">Yaş</label>
                                    <input required type="number" value={age} onChange={e => setAge(Number(e.target.value))} className="w-full p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold uppercase text-zinc-500 mb-2">Sınıf Seviyesi</label>
                                <select value={grade} onChange={e => setGrade(e.target.value)} className="w-full p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                                    <option>Okul Öncesi</option>
                                    <option>1. Sınıf</option>
                                    <option>2. Sınıf</option>
                                    <option>3. Sınıf</option>
                                    <option>4. Sınıf</option>
                                    <option>5. Sınıf</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-zinc-500 mb-2">Odak / Tanı</label>
                                <select value={diagnosis} onChange={e => setDiagnosis(e.target.value)} className="w-full p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                                    <option>Disleksi (Okuma Güçlüğü)</option>
                                    <option>Diskalkuli (Matematik Güçlüğü)</option>
                                    <option>DEHB (Dikkat Eksikliği)</option>
                                    <option>Disgrafi (Yazma Güçlüğü)</option>
                                    <option>Genel Akademik Destek</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-zinc-500 mb-2">Plan Süresi</label>
                                <div className="flex gap-4">
                                    {[7, 14, 21].map(d => (
                                        <button 
                                            key={d}
                                            type="button" 
                                            onClick={() => setDuration(d)}
                                            className={`flex-1 py-3 rounded-xl font-bold border-2 transition-all ${duration === d ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-zinc-200 text-zinc-500 hover:border-zinc-300'}`}
                                        >
                                            {d} Gün
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full py-4 bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black font-black rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {loading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
                                {loading ? 'Plan Hazırlanıyor...' : 'Müfredat Oluştur'}
                            </button>
                        </form>
                    </div>
                ) : curriculum ? (
                    <div className="max-w-4xl mx-auto space-y-8">
                        {/* Summary Card */}
                        <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                            <h3 className="text-3xl font-black mb-2">{curriculum.studentName} İçin Eğitim Planı</h3>
                            <p className="opacity-80 text-lg mb-6">{curriculum.durationDays} Günlük • {curriculum.grade}</p>
                            
                            <div className="flex flex-wrap gap-3">
                                {curriculum.goals.map((goal, i) => (
                                    <span key={i} className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold backdrop-blur-sm border border-white/20">
                                        <i className="fa-solid fa-check mr-2"></i>{goal}
                                    </span>
                                ))}
                            </div>
                            
                            <div className="mt-6 p-4 bg-black/20 rounded-xl text-sm italic border-l-4 border-white/50">
                                "{curriculum.note}"
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="relative border-l-4 border-zinc-200 dark:border-zinc-700 ml-4 md:ml-8 space-y-8 pl-8 md:pl-12 py-4">
                            {curriculum.schedule.map((dayPlan, i) => (
                                <div key={i} className="relative">
                                    {/* Timeline Node */}
                                    <div className="absolute -left-[45px] md:-left-[61px] top-0 w-8 h-8 rounded-full bg-indigo-500 border-4 border-white dark:border-zinc-900 flex items-center justify-center text-white text-xs font-bold shadow-md z-10">
                                        {dayPlan.day}
                                    </div>
                                    
                                    <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-700 shadow-sm hover:shadow-md transition-shadow">
                                        <h4 className="font-bold text-lg text-zinc-800 dark:text-white mb-1">
                                            {dayPlan.day}. Gün: <span className="text-indigo-600 dark:text-indigo-400">{dayPlan.focus}</span>
                                        </h4>
                                        <div className="w-full h-px bg-zinc-100 dark:bg-zinc-700 my-4"></div>
                                        
                                        <div className="space-y-3">
                                            {dayPlan.activities.map((act, j) => (
                                                <div key={j} className="flex items-center gap-4 p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-700/50 group">
                                                    <div className="w-10 h-10 rounded-lg bg-white dark:bg-zinc-800 shadow-sm flex items-center justify-center text-indigo-500">
                                                        <i className={ACTIVITIES.find(a=>a.id === act.activityId)?.icon || 'fa-solid fa-star'}></i>
                                                    </div>
                                                    <div className="flex-1">
                                                        <h5 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{act.title}</h5>
                                                        <p className="text-xs text-zinc-500">{act.goal}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-xs font-bold text-zinc-400 block mb-1">{act.duration} dk</span>
                                                        <button 
                                                            onClick={() => onSelectActivity(act.activityId)}
                                                            className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            Başlat
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
};
