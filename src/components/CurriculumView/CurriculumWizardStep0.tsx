import React from 'react';
import { Student, Curriculum, CurriculumActivity } from '../../types';

interface CurriculumWizardStep0Props {
    formData: Partial<Student>;
    setFormData: React.Dispatch<React.SetStateAction<Partial<Student>>>;
    planDuration: number;
    setPlanDuration: (d: number) => void;
    planType?: 'clinical' | 'meb' | 'hybrid';
    setPlanType?: (t: 'clinical' | 'meb' | 'hybrid') => void;
    setStep: (s: number) => void;
    students: Student[];
    existingPlans: Curriculum[];
    isLoadingPlans: boolean;
    handleLoadPlan: (plan: Curriculum) => void;
    handleStudentSelect: (sid: string) => void;
}

export const CurriculumWizardStep0: React.FC<CurriculumWizardStep0Props> = ({
    formData,
    setFormData,
    planDuration,
    setPlanDuration,
    planType = 'hybrid',
    setPlanType,
    setStep,
    students,
    existingPlans,
    isLoadingPlans,
    handleLoadPlan,
    handleStudentSelect
}) => {
    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

                {/* LEFT: New Plan Form */}
                <div className="lg:col-span-2">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 text-white rounded-3xl flex items-center justify-center text-2xl mx-auto mb-4 shadow-xl shadow-indigo-500/25">
                            <i className="fa-solid fa-graduation-cap"></i>
                        </div>
                        <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                            Yeni Akıllı Müfredat
                        </h2>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                            MEB 2024-2025 müfredatı ve öğrenci profili ile sarmal rota oluşturun.
                        </p>
                    </div>

                    <div className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-xl p-6 rounded-[2.5rem] border border-zinc-200/60 dark:border-zinc-700/60 shadow-xl space-y-5">
                        
                        {/* Student select */}
                        <div className="p-4 bg-amber-50/70 dark:bg-amber-950/20 rounded-2xl border border-amber-200/60 dark:border-amber-800/40">
                            <label className="block text-[9px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <i className="fa-solid fa-user-check"></i> Mevcut Öğrenci Seçimi
                            </label>
                            <select
                                value={formData.id || 'new'}
                                onChange={e => handleStudentSelect(e.target.value)}
                                className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-amber-300/80 dark:border-amber-700 rounded-xl font-bold text-xs outline-none cursor-pointer focus:ring-2 ring-amber-500/30 text-zinc-800 dark:text-zinc-200"
                            >
                                <option value="new">-- Yeni Profil Oluştur --</option>
                                {students.map((s: Student) => (
                                    <option key={s.id} value={s.id}>{s.name} ({s.grade || 'Sınıf Belirtilmedi'})</option>
                                ))}
                            </select>
                        </div>

                        {/* Name and Grade */}
                        <div className="grid grid-cols-1 gap-3">
                            <div>
                                <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5">
                                    Öğrenci Adı
                                </label>
                                <input
                                    type="text"
                                    value={formData.name || ''}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl font-bold text-xs focus:ring-2 focus:ring-indigo-500 outline-none text-zinc-800 dark:text-zinc-200"
                                    placeholder="Ad Soyad"
                                />
                            </div>
                            <div>
                                <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5">
                                    Sınıf Düzeyi (MEB Seviyesi)
                                </label>
                                <select
                                    value={formData.grade || '2. Sınıf'}
                                    onChange={e => setFormData({ ...formData, grade: e.target.value })}
                                    className="w-full p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl font-bold text-xs outline-none text-zinc-800 dark:text-zinc-200"
                                >
                                    {['Okul Öncesi', '1. Sınıf', '2. Sınıf', '3. Sınıf', '4. Sınıf', '5. Sınıf', '6. Sınıf', '7. Sınıf', '8. Sınıf'].map(g => (
                                        <option key={g} value={g}>{g}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Plan Type Selector */}
                        {setPlanType && (
                            <div>
                                <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5">
                                    Müfredat Tasarım Modeli
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { id: 'hybrid', label: 'Hibrit', sub: 'MEB + BEP', icon: 'fa-wand-magic-sparkles' },
                                        { id: 'meb', label: 'MEB', sub: 'Kazanım', icon: 'fa-landmark' },
                                        { id: 'clinical', label: 'Klinik', sub: 'Destek', icon: 'fa-brain' }
                                    ].map(item => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => setPlanType(item.id as 'clinical' | 'meb' | 'hybrid')}
                                            className={`p-2.5 rounded-2xl font-black text-center transition-all border-2 flex flex-col items-center justify-center gap-1 ${
                                                planType === item.id
                                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                                                    : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-500 border-zinc-200/80 dark:border-zinc-700 hover:border-indigo-300'
                                            }`}
                                        >
                                            <i className={`fa-solid ${item.icon} text-xs`}></i>
                                            <span className="text-[10px] uppercase">{item.label}</span>
                                            <span className={`text-[8px] font-medium ${planType === item.id ? 'text-indigo-200' : 'text-zinc-400'}`}>
                                                {item.sub}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Plan Duration */}
                        <div>
                            <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5">
                                Plan Süresi (Gün Sayısı)
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                                {[3, 7, 15, 30].map(d => (
                                    <button
                                        key={d}
                                        type="button"
                                        onClick={() => setPlanDuration(d)}
                                        className={`py-2.5 rounded-xl font-black text-xs transition-all border-2 ${
                                            planDuration === d
                                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                                                : 'bg-white dark:bg-zinc-900 text-zinc-500 border-zinc-200 dark:border-zinc-700 hover:border-indigo-300'
                                        }`}
                                    >
                                        {d} GÜN
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Next Step */}
                        <button
                            onClick={() => setStep(1)}
                            disabled={!formData.name}
                            className="w-full py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/25 hover:shadow-2xl hover:scale-[1.01] transition-all active:scale-[0.98] disabled:opacity-40 uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                        >
                            <span>HEDEFLERİ BELİRLE</span>
                            <i className="fa-solid fa-arrow-right"></i>
                        </button>
                    </div>
                </div>

                {/* RIGHT: Existing Plans Library */}
                <div className="lg:col-span-3">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-3">
                                <i className="fa-solid fa-map-location-dot text-indigo-500"></i> Plan Kütüphanesi
                            </h2>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                {existingPlans.length} kayıtlı plan • Tıklayarak inceleyebilir ve yönetebilirsiniz
                            </p>
                        </div>
                        {isLoadingPlans && <i className="fa-solid fa-circle-notch fa-spin text-indigo-500 text-lg"></i>}
                    </div>

                    {existingPlans.length === 0 && !isLoadingPlans ? (
                        <div className="bg-white/40 dark:bg-zinc-800/40 backdrop-blur-sm rounded-[2.5rem] border border-dashed border-zinc-300 dark:border-zinc-700 p-12 text-center">
                            <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center text-2xl mx-auto mb-4">
                                <i className="fa-solid fa-map-location-dot"></i>
                            </div>
                            <p className="text-zinc-600 dark:text-zinc-300 font-black uppercase tracking-wider text-sm">
                                Henüz Kayıtlı Plan Bulunmuyor
                            </p>
                            <p className="text-zinc-400 text-xs mt-2 max-w-md mx-auto">
                                Sol taraftaki sihirbazı doldurarak MEB ve özel eğitim kazanımlarını birleştiren ilk akıllı planınızı oluşturun.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[68vh] overflow-y-auto custom-scrollbar pr-2">
                            {existingPlans.map((plan) => {
                                const completedCount = plan.schedule.filter(d =>
                                    d.isCompleted || (d.activities.length > 0 && d.activities.every((a: CurriculumActivity) => a.status === 'completed'))
                                ).length;
                                const progress = plan.schedule.length > 0
                                    ? Math.round((completedCount / plan.schedule.length) * 100)
                                    : 0;
                                const initials = plan.studentName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
                                
                                return (
                                    <div
                                        key={plan.id}
                                        onClick={() => handleLoadPlan(plan)}
                                        className="group relative bg-white/80 dark:bg-zinc-800/80 backdrop-blur-xl rounded-[2rem] border border-zinc-200/60 dark:border-zinc-700/60 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden cursor-pointer"
                                    >
                                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        <div className="p-5 space-y-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-xs font-black shadow-md shadow-indigo-500/20">
                                                        {initials || <i className="fa-solid fa-user"></i>}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-sm text-zinc-900 dark:text-white leading-tight">
                                                            {plan.studentName}
                                                        </h4>
                                                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">
                                                            {plan.grade} • {plan.durationDays} Gün
                                                        </p>
                                                    </div>
                                                </div>
                                                {progress === 100 ? (
                                                    <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full text-[8px] font-black uppercase border border-emerald-200 dark:border-emerald-800">
                                                        Tamamlandı
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-full text-[8px] font-black uppercase border border-indigo-200 dark:border-indigo-800">
                                                        %{progress}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="space-y-1.5">
                                                <div className="w-full bg-zinc-100 dark:bg-zinc-700/60 rounded-full h-1.5 overflow-hidden">
                                                    <div
                                                        className="bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                                                        style={{ width: `${progress}%` }}
                                                    ></div>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-1.5 pt-1">
                                                <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-[9px] font-bold">
                                                    {plan.goals?.length || 0} Hedef
                                                </span>
                                                <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 rounded-lg text-[9px] font-bold">
                                                    {plan.schedule.length} Gün
                                                </span>
                                                {plan.planType && (
                                                    <span className="px-2 py-0.5 bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 rounded-lg text-[9px] font-bold uppercase">
                                                        {plan.planType}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-700/60 text-[10px] text-zinc-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                <span className="font-medium">
                                                    {new Date(plan.startDate).toLocaleDateString('tr-TR')}
                                                </span>
                                                <span className="font-black uppercase tracking-wider flex items-center gap-1">
                                                    Aç ve Yönet <i className="fa-solid fa-arrow-right"></i>
                                                </span>
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
