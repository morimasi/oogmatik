
import React, { useState, useEffect } from 'react';
import { curriculumService } from '../services/curriculumService';
import { Curriculum, CurriculumDay, CurriculumActivity, Student } from '../types';
import { ACTIVITIES } from '../constants';
import { printService } from '../utils/printService';
import { useAuth } from '../context/AuthContext';
import { useStudent } from '../context/StudentContext';
import { ShareModal } from './ShareModal';

interface CurriculumViewProps {
    onBack: () => void;
    onSelectActivity: (id: string) => void;
    onStartCurriculumActivity: (planId: string, day: number, activityId: string, activityType: string, studentName: string, title: string, studentId?: string) => void;
    initialPlan?: Curriculum | null;
}

const DayCard: React.FC<{ 
    day: CurriculumDay, 
    onToggleActivity: (day: number, actId: string) => void, 
    onStartActivity: (actId: string, actType: string, title: string) => void,
    onSaveNote: (day: number, note: string) => void
}> = ({ day, onToggleActivity, onStartActivity, onSaveNote }) => {
    const isAllCompleted = day.activities.every(a => a.status === 'completed');
    const [note, setNote] = useState(day.focus || '');
    
    return (
        <div className={`group relative bg-white dark:bg-zinc-800 rounded-3xl border-2 transition-all duration-300 hover:shadow-xl ${isAllCompleted ? 'border-emerald-400 dark:border-emerald-600 ring-4 ring-emerald-50 dark:ring-emerald-900/20' : 'border-zinc-100 dark:border-zinc-700'} break-inside-avoid page-break-inside-avoid print:border-zinc-300 print:shadow-none`}>
            <div className={`p-5 rounded-t-[1.3rem] flex justify-between items-center ${isAllCompleted ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-zinc-50 dark:bg-zinc-900/50'} print:bg-gray-100 border-b border-zinc-100 dark:border-zinc-700`}>
                <div>
                    <h4 className="font-black text-xl text-zinc-800 dark:text-white flex items-center gap-2 print:text-black">
                        {day.day}. Gün
                        {isAllCompleted && <i className="fa-solid fa-check-circle text-emerald-500 print:hidden"></i>}
                    </h4>
                    <p className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider mt-1 print:text-black">{day.focus}</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-white dark:bg-zinc-700 flex items-center justify-center shadow-sm border border-zinc-100 dark:border-zinc-600">
                    <i className="fa-solid fa-calendar-day text-zinc-400"></i>
                </div>
            </div>

            <div className="p-5 space-y-4">
                {day.activities.map((act) => (
                    <div key={act.id} className={`relative pl-4 border-l-2 transition-all ${act.status === 'completed' ? 'border-emerald-400 opacity-60' : 'border-zinc-200 dark:border-zinc-700 hover:border-indigo-400'} print:border-l-4 print:border-gray-300 print:opacity-100`}>
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <h5 className={`font-bold text-sm ${act.status === 'completed' ? 'line-through text-zinc-400' : 'text-zinc-800 dark:text-zinc-200'} print:text-black print:no-underline`}>{act.title}</h5>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] bg-zinc-100 dark:bg-zinc-700 px-2 py-0.5 rounded text-zinc-500 dark:text-zinc-400 font-mono print:border print:border-gray-300">{act.duration} dk</span>
                                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${act.difficultyLevel === 'Hard' ? 'bg-red-50 text-red-600' : act.difficultyLevel === 'Medium' ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'}`}>
                                        {act.difficultyLevel === 'Hard' ? 'Zor' : act.difficultyLevel === 'Medium' ? 'Orta' : 'Kolay'}
                                    </span>
                                </div>
                                <p className="text-[10px] text-zinc-500 mt-1 italic print:text-gray-600 leading-tight">{act.goal}</p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <button 
                                    onClick={() => onToggleActivity(day.day, act.id)}
                                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all print:hidden ${act.status === 'completed' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-zinc-200 dark:border-zinc-600 hover:border-indigo-500 text-transparent hover:text-indigo-500'}`}
                                >
                                    <i className="fa-solid fa-check text-xs"></i>
                                </button>
                                {act.status !== 'completed' && (
                                    <button 
                                        onClick={() => onStartActivity(act.activityId, act.activityId, act.title)}
                                        className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-colors shadow-sm"
                                        title="Uygulamayı Başlat"
                                    >
                                        <i className="fa-solid fa-play text-[10px]"></i>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                
                {/* Daily Note Area */}
                <div className="pt-4 mt-2 border-t border-dashed border-zinc-100 dark:border-zinc-700 print:hidden">
                    <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1 block">Gözlem Notu</label>
                    <textarea 
                        className="w-full p-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-700 rounded-xl text-[11px] resize-none focus:border-indigo-300 outline-none transition-all"
                        placeholder="Öğrencinin bugünkü tepkisi..."
                        rows={2}
                        onBlur={(e) => onSaveNote(day.day, e.target.value)}
                    ></textarea>
                </div>
            </div>
        </div>
    );
};

export const CurriculumView: React.FC<CurriculumViewProps> = ({ onBack, onSelectActivity, onStartCurriculumActivity, initialPlan }) => {
    const { user } = useAuth();
    const { students, activeStudent, setActiveStudent } = useStudent();
    
    const [step, setStep] = useState(0); 
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
    const [isSaved, setIsSaved] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);

    const [formData, setFormData] = useState<Partial<Student>>({
        name: '', age: 8, grade: '2. Sınıf', diagnosis: [], interests: [], weaknesses: []
    });
    const [planDuration, setPlanDuration] = useState(7);

    useEffect(() => {
        if (initialPlan) {
            setCurriculum(initialPlan);
            setStep(4);
            setIsSaved(true);
            setFormData({
                id: initialPlan.studentId || '',
                name: initialPlan.studentName,
                grade: initialPlan.grade,
                interests: initialPlan.interests,
                weaknesses: initialPlan.weaknesses
            });
            setPlanDuration(initialPlan.durationDays);
        }
    }, [initialPlan]);

    const handleStudentSelect = (sid: string) => {
        if (sid === 'new') {
            setFormData({ name: '', age: 8, grade: '2. Sınıf', diagnosis: [], interests: [], weaknesses: [] });
            setActiveStudent(null);
        } else {
            const student = students.find(s => s.id === sid);
            if (student) {
                setFormData(student);
                setActiveStudent(student);
            }
        }
    };

    const handleGenerate = async () => {
        if (!formData.name) return;
        setLoading(true);
        try {
            const plan = await curriculumService.generatePlan(formData, planDuration);
            setCurriculum(plan);
            setStep(4);
            setIsSaved(false);
        } catch (e) {
            alert("Plan oluşturulurken bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!user || !curriculum) return;
        setIsSaving(true);
        try {
            const id = await curriculumService.saveCurriculum(user.id, curriculum);
            setCurriculum({ ...curriculum, id });
            setIsSaved(true);
        } catch (e) {
            alert("Kaydetme hatası.");
        } finally {
            setIsSaving(false);
        }
    };

    const handlePrint = async (action: 'print' | 'download') => {
        setIsPrinting(true);
        setTimeout(async () => {
            try {
                await printService.generatePdf('.curriculum-plan-content', `${formData.name}-EgitimPlani`, { action });
            } catch (e) {
                console.error(e);
            } finally {
                setIsPrinting(false);
            }
        }, 100);
    };

    const handleToggleActivity = async (day: number, actId: string) => {
        if (!curriculum) return;
        const currentStatus = curriculum.schedule.find(d => d.day === day)?.activities.find(a => a.id === actId)?.status;
        const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
        
        try {
            if (isSaved) await curriculumService.updateActivityStatus(curriculum.id, day, actId, newStatus as any);
            setCurriculum(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    schedule: prev.schedule.map(d => {
                        if (d.day === day) {
                            const newActs = d.activities.map(a => a.id === actId ? { ...a, status: newStatus as any } : a);
                            return { ...d, activities: newActs, isCompleted: newActs.every(a => a.status === 'completed') };
                        }
                        return d;
                    })
                };
            });
        } catch (e) { alert("Güncellenemedi."); }
    };

    const handleSaveDayNote = async (dayNum: number, note: string) => {
        if (!curriculum || !isSaved) return;
        const newSchedule = curriculum.schedule.map(d => d.day === dayNum ? { ...d, focus: note } : d);
        setCurriculum({ ...curriculum, schedule: newSchedule });
        await curriculumService.updateCurriculum(curriculum.id, { schedule: newSchedule });
    };

    const renderWizard = () => {
        if (loading) {
            return (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-24 h-24 relative mb-8">
                        <div className="absolute inset-0 border-8 border-indigo-100 rounded-full"></div>
                        <div className="absolute inset-0 border-8 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center text-indigo-600">
                            <i className="fa-solid fa-wand-magic-sparkles text-3xl"></i>
                        </div>
                    </div>
                    <h3 className="text-2xl font-black text-zinc-800 dark:text-white mb-2">Program Hazırlanıyor...</h3>
                    <p className="text-zinc-500 text-center max-w-sm">Yapay zeka öğrencinin akademik ve klinik profilini analiz ederek haftalık rotayı oluşturuyor.</p>
                </div>
            );
        }

        switch(step) {
            case 0:
                return (
                    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-6 shadow-lg shadow-indigo-500/20">
                                <i className="fa-solid fa-graduation-cap"></i>
                            </div>
                            <h2 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight mb-4">Eğitim Planlayıcı</h2>
                            <p className="text-zinc-500">Mevcut bir öğrenciyi atayın veya yeni bir profil ile başlayın.</p>
                        </div>
                        <div className="bg-white dark:bg-zinc-800 p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-700 shadow-xl space-y-6">
                            
                            <div className="p-5 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-800/30">
                                <label className="block text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <i className="fa-solid fa-user-check"></i> Mevcut Öğrenci Atama
                                </label>
                                <select 
                                    value={formData.id || 'new'} 
                                    onChange={e => handleStudentSelect(e.target.value)}
                                    className="w-full p-3 bg-white dark:bg-zinc-900 border border-amber-200 dark:border-amber-700 rounded-xl font-bold text-sm outline-none cursor-pointer focus:ring-2 ring-amber-500/20"
                                >
                                    <option value="new">-- Yeni Profil Oluştur --</option>
                                    {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-2">Öğrenci Adı</label>
                                    <input 
                                        type="text" 
                                        value={formData.name} 
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                        className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none" 
                                        placeholder="Ad Soyad"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-2">Sınıf</label>
                                    <select value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})} className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl font-bold outline-none">
                                        {['Okul Öncesi', '1. Sınıf', '2. Sınıf', '3. Sınıf', '4. Sınıf', '5. Sınıf', '6. Sınıf', '7. Sınıf', '8. Sınıf'].map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-2">Plan Süresi</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {[7, 15, 30].map(d => (
                                        <button 
                                            key={d}
                                            onClick={() => setPlanDuration(d)}
                                            className={`py-3 rounded-xl font-bold text-sm transition-all border-2 ${planDuration === d ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white dark:bg-zinc-700 text-zinc-500 border-zinc-100 dark:border-zinc-600'}`}
                                        >
                                            {d} GÜN
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button onClick={() => setStep(1)} disabled={!formData.name} className="w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-black font-black rounded-2xl shadow-lg transition-all active:scale-95 disabled:opacity-50">PROFİLİ ONAYLA <i className="fa-solid fa-arrow-right ml-2"></i></button>
                        </div>
                    </div>
                );
            case 1:
                return (
                    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
                        <div className="text-center">
                            <h2 className="text-3xl font-black text-zinc-900 dark:text-white">Akademik Profil Özeti</h2>
                            <p className="text-zinc-500">Öğrencinin kayıtlı verileri aşağıdadır. Plan için özelleştirebilirsiniz.</p>
                        </div>
                        
                        <div className="bg-white dark:bg-zinc-800 p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-700 shadow-xl space-y-6">
                            <div>
                                <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-3">İlgi Alanları</label>
                                <div className="flex flex-wrap gap-2">
                                    {['Uzay', 'Dinozorlar', 'Hayvanlar', 'Doğa', 'Spor', 'Müzik', 'Robotlar', 'Denizler'].map(tag => (
                                        <button 
                                            key={tag}
                                            onClick={() => setFormData(prev => ({ ...prev, interests: prev.interests?.includes(tag) ? prev.interests.filter(t => t !== tag) : [...(prev.interests || []), tag] }))}
                                            className={`px-4 py-2 rounded-xl font-bold text-xs border-2 transition-all ${formData.interests?.includes(tag) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-zinc-700 text-zinc-500 border-zinc-100 dark:border-zinc-600'}`}
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-3">Klinik Öncelikler (Zayıf Yönler)</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {['Harf Karıştırma', 'Yavaş Okuma', 'Sayı Hissi', 'Dikkat Dağınıklığı', 'Sıralama Sorunları', 'Ters Yazma'].map(item => (
                                        <label key={item} className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${formData.weaknesses?.includes(item) ? 'bg-rose-50 border-rose-400 dark:bg-rose-900/20' : 'bg-white dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700'}`}>
                                            <input type="checkbox" checked={formData.weaknesses?.includes(item)} onChange={() => setFormData(prev => ({ ...prev, weaknesses: prev.weaknesses?.includes(item) ? prev.weaknesses.filter(t => t !== item) : [...(prev.weaknesses || []), item] }))} className="hidden" />
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.weaknesses?.includes(item) ? 'bg-rose-500 border-rose-500 text-white' : 'border-zinc-300'}`}><i className="fa-solid fa-check text-[10px]"></i></div>
                                            <span className="font-bold text-sm">{item}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-4">
                                <button onClick={() => setStep(0)} className="text-sm font-bold text-zinc-400 hover:text-zinc-600"><i className="fa-solid fa-arrow-left mr-2"></i> Geri Dön</button>
                                <button onClick={handleGenerate} className="px-10 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:scale-105 transition-all">PROGRAMI OLUŞTUR <i className="fa-solid fa-wand-magic-sparkles ml-2"></i></button>
                            </div>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="curriculum-plan-content max-w-5xl mx-auto space-y-10 pb-20">
                        {curriculum && (
                            <>
                                <div className="bg-white dark:bg-zinc-800 rounded-[2.5rem] p-10 border border-zinc-200 dark:border-zinc-700 shadow-xl relative overflow-hidden print:border-none print:shadow-none">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 print:hidden"></div>
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-8">
                                            <div className="flex gap-6 items-center">
                                                <div className="w-20 h-20 rounded-[2rem] bg-indigo-600 text-white flex items-center justify-center text-3xl shadow-xl border-4 border-white dark:border-zinc-700">
                                                    <i className="fa-solid fa-graduation-cap"></i>
                                                </div>
                                                <div>
                                                    <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-200 dark:border-indigo-800">Kişiselleştirilmiş Eğitim Rotası</span>
                                                    <h1 className="text-4xl font-black text-zinc-900 dark:text-white mt-2 tracking-tight">{curriculum.studentName}</h1>
                                                    <p className="text-zinc-500 font-bold mt-1 uppercase text-xs tracking-widest">{curriculum.grade} • {curriculum.durationDays} GÜNLÜK AKIŞ</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Başlangıç</p>
                                                <p className="text-lg font-black text-zinc-800 dark:text-zinc-200 font-mono">{new Date(curriculum.startDate).toLocaleDateString('tr-TR')}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b pb-2">Plan Hedefleri</h4>
                                                <div className="space-y-2">
                                                    {curriculum.goals.map((g, i) => (
                                                        <div key={i} className="flex gap-3 items-center text-sm font-bold text-zinc-700 dark:text-zinc-300">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> {g}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border border-zinc-100 dark:border-zinc-800 italic text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed shadow-inner">
                                                <i className="fa-solid fa-quote-left text-indigo-300 dark:text-indigo-700 mb-2 block"></i> "{curriculum.note}"
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {curriculum.schedule.map((day) => (
                                        <DayCard 
                                            key={day.day} 
                                            day={day} 
                                            onToggleActivity={handleToggleActivity} 
                                            onStartActivity={(id, type, title) => onStartCurriculumActivity(curriculum.id, day.day, id, type, curriculum.studentName, title, curriculum.studentId || undefined)} 
                                            onSaveNote={handleSaveDayNote}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="h-full bg-zinc-50 dark:bg-zinc-900 flex flex-col overflow-hidden relative absolute inset-0 z-50">
            <div className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 flex justify-between items-center px-6 shadow-sm shrink-0 z-20 print:hidden">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="w-10 h-10 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center justify-center transition-colors text-zinc-500">
                        <i className="fa-solid fa-arrow-left"></i>
                    </button>
                    <h2 className="text-lg font-black text-zinc-800 dark:text-white flex items-center gap-2">
                        <i className="fa-solid fa-calendar-check text-indigo-500"></i> Akıllı Müfredat Stüdyosu
                    </h2>
                </div>
                <div className="flex gap-3">
                    {step === 4 && curriculum && (
                        <>
                            <button onClick={() => setIsShareModalOpen(true)} className="w-10 h-10 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center justify-center text-zinc-500 transition-colors" title="Paylaş"><i className="fa-solid fa-share-nodes"></i></button>
                            <button onClick={() => handlePrint('download')} disabled={isPrinting} className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-500 transition-colors">{isPrinting ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-file-pdf"></i>}</button>
                            <button onClick={() => handlePrint('print')} disabled={isPrinting} className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-500 transition-colors"><i className="fa-solid fa-print"></i></button>
                            <button onClick={handleSave} disabled={isSaved || isSaving} className={`px-6 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-lg ${isSaved ? 'bg-emerald-600 text-white cursor-default' : 'bg-zinc-900 text-white hover:bg-black dark:bg-white dark:text-black dark:hover:bg-zinc-200'}`}>
                                {isSaving ? <i className="fa-solid fa-circle-notch fa-spin"></i> : isSaved ? <><i className="fa-solid fa-check"></i> Plan Kaydedildi</> : <><i className="fa-solid fa-save"></i> Planı Arşivle</>}
                            </button>
                        </>
                    )}
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar print:overflow-visible print:h-auto print:bg-white">
                {renderWizard()}
            </div>
            <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} onShare={() => {}} />
        </div>
    );
};
