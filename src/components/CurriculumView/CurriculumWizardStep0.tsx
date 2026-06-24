import React from 'react';
import { Student, Curriculum } from '../../types';

interface CurriculumWizardStep0Props {
    formData: Partial<Student>;
    setFormData: React.Dispatch<React.SetStateAction<Partial<Student>>>;
    planDuration: number;
    setPlanDuration: (d: number) => void;
    setStep: (s: number) => void;
    students: Student[];
    existingPlans: Curriculum[];
    isLoadingPlans: boolean;
    handleLoadPlan: (plan: Curriculum) => void;
    handleStudentSelect: (sid: string) => void;
}

export const CurriculumWizardStep0: React.FC<CurriculumWizardStep0Props> = ({ formData, setFormData, planDuration, setPlanDuration, setStep, students, existingPlans, isLoadingPlans, handleLoadPlan, handleStudentSelect }) => {
    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

                {/* LEFT: New Plan Form */}
                <div className="lg:col-span-2">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-3xl flex items-center justify-center text-2xl mx-auto mb-4 shadow-xl shadow-indigo-500/20">
                            <i className="fa-solid fa-graduation-cap"></i>
                        </div>
                        <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">Yeni Plan</h2>
                        <p className="text-sm text-zinc-500 mt-1">Öğrenci bilgilerini girerek AI destekli plan oluşturun.</p>
                    </div>
                    <div className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-xl p-6 rounded-[2.5rem] border border-zinc-200/50 dark:border-zinc-700/50 shadow-xl space-y-5">
                        <div className="p-4 bg-amber-50/80 dark:bg-amber-900/10 rounded-2xl border border-amber-100/50 dark:border-amber-800/30">
                            <label className="block text-[9px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <i className="fa-solid fa-user-check"></i> Mevcut Öğrenci Atama
                            </label>
                            <select
                                value={formData.id || 'new'}
                                onChange={e => handleStudentSelect(e.target.value)}
                                className="w-full p-3 bg-white dark:bg-zinc-900 border border-amber-200 dark:border-amber-700 rounded-xl font-bold text-sm outline-none cursor-pointer focus:ring-2 ring-amber-500/20"
                            >
                                <option value="new">-- Yeni Profil Oluştur --</option>
                                {students.map((s: Student) => <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            <div>
                                <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5">Öğrenci Adı</label>
                                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Ad Soyad" />
                            </div>
                            <div>
                                <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5">Sınıf</label>
                                <select value={formData.grade} onChange={e => setFormData({ ...formData, grade: e.target.value })} className="w-full p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl font-bold text-sm outline-none">
                                    {['Okul Öncesi', '1. Sınıf', '2. Sınıf', '3. Sınıf', '4. Sınıf', '5. Sınıf', '6. Sınıf', '7. Sınıf', '8. Sınıf'].map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5">Plan Süresi</label>
                            <div className="grid grid-cols-3 gap-2">
                                {[7, 15, 30].map(d => (
                                    <button key={d} onClick={() => setPlanDuration(d)} className={`py-2.5 rounded-xl font-bold text-xs transition-all border-2 ${planDuration === d ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white dark:bg-zinc-700 text-zinc-500 border-zinc-100 dark:border-zinc-600'}`}>{d} GÜN</button>
                                ))}
                            </div>
                        </div>
                        <button onClick={() => setStep(1)} disabled={!formData.name} className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-[0.97] disabled:opacity-50 uppercase tracking-widest text-sm">YENİ PLAN OLUŞTUR <i className="fa-solid fa-wand-magic-sparkles ml-2"></i></button>
                    </div>
                </div>

                {/* RIGHT: Existing Plans */}
                <div className="lg:col-span-3">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-3">
                                <i className="fa-solid fa-map-location-dot text-emerald-500"></i> Plan Kütüphanesi
                            </h2>
                            <p className="text-sm text-zinc-500 mt-1">{existingPlans.length} plan • tıklayınca düzenleyebilirsiniz</p>
                        </div>
                        {isLoadingPlans && <i className="fa-solid fa-circle-notch fa-spin text-zinc-400"></i>}
                    </div>

                    {existingPlans.length === 0 && !isLoadingPlans ? (
                        <div className="bg-white/40 dark:bg-zinc-800/40 backdrop-blur-sm rounded-[2.5rem] border border-dashed border-zinc-200 dark:border-zinc-700 p-12 text-center">
                            <i className="fa-solid fa-map-location-dot text-4xl text-zinc-300 dark:text-zinc-600 mb-4 block"></i>
                            <p className="text-zinc-400 font-bold uppercase tracking-wider text-sm">Henüz hiç plan oluşturulmamış</p>
                            <p className="text-zinc-400 text-xs mt-2">Sol taraftaki formu doldurup AI ile ilk planını oluşturun.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[65vh] overflow-y-auto custom-scrollbar pr-2">
                            {existingPlans.map((plan) => {
                                const progress = Math.round((plan.schedule.filter(d => d.isCompleted || d.activities?.every((a: any) => a.status === 'completed')).length / plan.schedule.length) * 100);
                                const initials = plan.studentName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
                                return (
                                    <div
                                        key={plan.id}
                                        onClick={() => handleLoadPlan(plan)}
                                        className="group relative bg-white/80 dark:bg-zinc-800/80 backdrop-blur-xl rounded-[2rem] border border-zinc-200/50 dark:border-zinc-700/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 overflow-hidden cursor-pointer"
                                    >
                                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                        <div className="p-5 space-y-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-sm font-black shadow-lg">
                                                        {initials || <i className="fa-solid fa-user text-xs"></i>}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-sm text-zinc-800 dark:text-white leading-tight">{plan.studentName}</h4>
                                                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{plan.grade} • {plan.durationDays} gün</p>
                                                    </div>
                                                </div>
                                                {progress === 100 && (
                                                    <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-[8px] font-black uppercase">Tamamlandı</span>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-[10px]">
                                                    <span className="text-zinc-400 font-medium">{new Date(plan.startDate).toLocaleDateString('tr-TR')}</span>
                                                    <span className="font-black text-indigo-600 dark:text-indigo-400">%{progress}</span>
                                                </div>
                                                <div className="w-full bg-zinc-100 dark:bg-zinc-700 rounded-full h-1.5 overflow-hidden">
                                                    <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-full rounded-full transition-all duration-700" style={{ width: `${progress}%` }}></div>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-2 pt-1">
                                                <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 dark:text-indigo-400 rounded-lg text-[9px] font-bold">{plan.goals?.length || 0} hedef</span>
                                                <span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-500 dark:text-amber-400 rounded-lg text-[9px] font-bold">{plan.schedule.length} gün</span>
                                                {plan.interests?.slice(0, 2).map((i: string) => (
                                                    <span key={i} className="px-2.5 py-1 bg-zinc-50 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 rounded-lg text-[9px] font-bold">{i}</span>
                                                ))}
                                            </div>
                                            <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider flex items-center gap-1">
                                                    <i className="fa-solid fa-pen-to-square"></i> Düzenle
                                                </span>
                                                <i className="fa-solid fa-arrow-right text-indigo-400 group-hover:translate-x-1 transition-transform"></i>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
