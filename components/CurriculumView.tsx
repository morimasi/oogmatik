
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

const DayCard: React.FC<{ day: CurriculumDay, onRegenerate: () => void, onToggleActivity: (day: number, actId: string) => void, onStartActivity: (actId: string, actType: string, title: string) => void }> = ({ day, onRegenerate, onToggleActivity, onStartActivity }) => {
    const isAllCompleted = day.activities.every(a => a.status === 'completed');
    
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
                <button onClick={onRegenerate} className="w-8 h-8 rounded-full bg-white dark:bg-zinc-700 text-zinc-400 hover:text-indigo-500 hover:rotate-180 transition-all shadow-sm flex items-center justify-center print:hidden border border-zinc-200 dark:border-zinc-600" title="Bu günü yeniden oluştur">
                    <i className="fa-solid fa-arrows-rotate"></i>
                </button>
            </div>

            <div className="p-5 space-y-4">
                {day.activities.map((act, i) => (
                    <div key={act.id} className={`relative pl-4 border-l-2 transition-all ${act.status === 'completed' ? 'border-emerald-400 opacity-60' : 'border-zinc-200 dark:border-zinc-700 hover:border-indigo-400'} print:border-l-4 print:border-gray-300 print:opacity-100`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <h5 className={`font-bold text-sm ${act.status === 'completed' ? 'line-through text-zinc-400' : 'text-zinc-800 dark:text-zinc-200'} print:text-black print:no-underline`}>{act.title}</h5>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] bg-zinc-100 dark:bg-zinc-700 px-2 py-0.5 rounded text-zinc-500 dark:text-zinc-400 font-mono print:border print:border-gray-300">{act.duration} dk</span>
                                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${act.difficultyLevel === 'Hard' ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400' : act.difficultyLevel === 'Medium' ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400'} print:border print:border-gray-300 print:bg-white print:text-black`}>
                                        {act.difficultyLevel === 'Hard' ? 'Zor' : act.difficultyLevel === 'Medium' ? 'Orta' : 'Kolay'}
                                    </span>
                                </div>
                                <p className="text-[10px] text-zinc-500 mt-1 italic print:text-gray-600 leading-tight">{act.goal}</p>
                            </div>
                            <button 
                                onClick={() => onToggleActivity(day.day, act.id)}
                                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all print:hidden ml-2 ${act.status === 'completed' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-zinc-200 dark:border-zinc-600 hover:border-indigo-500 text-transparent hover:text-indigo-500'}`}
                            >
                                <i className="fa-solid fa-check text-xs"></i>
                            </button>
                        </div>
                        
                        {act.status !== 'completed' && (
                            <button 
                                onClick={() => onStartActivity(act.id, act.activityId, act.title)}
                                className="mt-3 w-full py-2 bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black rounded-xl text-xs font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 transform active:scale-95 print:hidden"
                            >
                                <i className="fa-solid fa-play"></i> Hemen Üret
                            </button>
                        )}
                    </div>
                ))}
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

    const [formData, setFormData] = useState({
        name: '', age: 8, grade: '2. Sınıf', diagnosis: 'Disleksi (Okuma Güçlüğü)',
        weaknesses: [] as string[], interests: [] as string[], duration: 7, studentId: undefined as string | undefined
    });

    useEffect(() => {
        if (initialPlan) {
            setCurriculum(initialPlan);
            setStep(4);
            setIsSaved(true);
            setFormData({
                name: initialPlan.studentName,
                grade: initialPlan.grade,
                age: 8,
                diagnosis: '',
                weaknesses: initialPlan.weaknesses,
                interests: initialPlan.interests,
                duration: initialPlan.durationDays,
                studentId: initialPlan.studentId
            });
        }
    }, [initialPlan]);

    const handleStudentSelect = (sid: string) => {
        if (sid === 'new') {
            setFormData({
                name: '', age: 8, grade: '2. Sınıf', diagnosis: 'Disleksi (Okuma Güçlüğü)',
                weaknesses: [], interests: [], duration: 7, studentId: undefined
            });
            setActiveStudent(null);
        } else {
            const student = students.find(s => s.id === sid);
            if (student) {
                setFormData({
                    name: student.name,
                    age: student.age,
                    grade: student.grade,
                    diagnosis: student.diagnosis?.[0] || 'Genel Destek',
                    weaknesses: student.weaknesses || [],
                    interests: student.interests || [],
                    duration: 7,
                    studentId: student.id
                });
                setActiveStudent(student);
            }
        }
    };

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const plan = await curriculumService.generatePlan(
                formData.name, formData.age, formData.grade, formData.diagnosis,
                formData.duration, formData.interests, formData.weaknesses
            );
            // Formdaki studentId'yi plana ekle
            const finalizedPlan = { ...plan, studentId: formData.studentId };
            setCurriculum(finalizedPlan);
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
            const id = await curriculumService.saveCurriculum(user.id, curriculum, formData.studentId);
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

    const handleStartActivity = (actId: string, actType: string, title: string) => {
        if (!curriculum) return;
        onStartCurriculumActivity(curriculum.id, curriculum.schedule.find(d => d.activities.some(a => a.id === actId))?.day || 1, actId, actType, curriculum.studentName, title, curriculum.studentId);
    };

    const handleRegenerateDay = async (dayNum: number) => {
        if (!curriculum || !user) return;
        setLoading(true);
        try {
            const currentDay = curriculum.schedule.find(d => d.day === dayNum);
            if (!currentDay) return;
            const newDay = await curriculumService.regenerateDay(currentDay, { name: curriculum.studentName, grade: curriculum.grade, interests: curriculum.interests });
            const newSchedule = curriculum.schedule.map(d => d.day === dayNum ? newDay : d);
            setCurriculum({ ...curriculum, schedule: newSchedule });
            if (isSaved) await curriculumService.updateCurriculum(curriculum.id, { schedule: newSchedule });
        } catch (e) { alert("Hata."); } finally { setLoading(false); }
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
                    <p className="text-zinc-500 text-center max-w-sm">Yapay zeka öğrencinin ihtiyaçlarını analiz ediyor ve en uygun spiral eğitim rotasını oluşturuyor.</p>
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
                            <p className="text-zinc-500">Öğrencinize özel, hedefe odaklı haftalık çalışma programları oluşturun.</p>
                        </div>
                        <div className="bg-white dark:bg-zinc-800 p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-700 shadow-xl space-y-6">
                            
                            {/* Student Selection */}
                            {students.length > 0 && (
                                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                                    <label className="block text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-2">Kayıtlı Öğrenci Seç</label>
                                    <select 
                                        value={formData.studentId || 'new'} 
                                        onChange={e => handleStudentSelect(e.target.value)}
                                        className="w-full p-3 bg-white dark:bg-zinc-900 border border-indigo-200 dark:border-indigo-700 rounded-xl font-bold text-sm outline-none cursor-pointer"
                                    >
                                        <option value="new">-- Yeni Öğrenci Girişi --</option>
                                        {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>)}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-2">Öğrenci Adı</label>
                                <input 
                                    type="text" 
                                    value={formData.name} 
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                    className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none" 
                                    placeholder="Öğrenci Adı Soyadı"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-2">Sınıf</label>
                                    <select value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})} className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none">
                                        {['Okul Öncesi', '1. Sınıf', '2. Sınıf', '3. Sınıf', '4. Sınıf'].map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-2">Süre</label>
                                    <select value={formData.duration} onChange={e => setFormData({...formData, duration: Number(e.target.value)})} className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none">
                                        <option value={7}>7 Günlük</option>
                                        <option value={15}>15 Günlük</option>
                                        <option value={30}>30 Günlük</option>
                                    </select>
                                </div>
                            </div>
                            <button onClick={() => setStep(1)} disabled={!formData.name} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-lg transition-all active:scale-95 disabled:opacity-50">DEVAM ET <i className="fa-solid fa-arrow-right ml-2"></i></button>
                        </div>
                    </div>
                );
            case 1:
                return (
                    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
                        <div className="text-center"><h2 className="text-3xl font-black text-zinc-900 dark:text-white">Odak Noktası</h2><p className="text-zinc-500">Program hangi alanda yoğunlaşmalı?</p></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { id: 'reading', title: 'Okuma & Dil', icon: 'fa-book-open', desc: 'Disleksi desteği odaklı.' },
                                { id: 'math', title: 'Matematik & Mantık', icon: 'fa-calculator', desc: 'Diskalkuli ve sayı hissi.' },
                                { id: 'attention', title: 'Dikkat & Bellek', icon: 'fa-brain', desc: 'DEHB ve odaklanma.' },
                                { id: 'visual', title: 'Görsel Algı', icon: 'fa-eye', desc: 'Mekansal farkındalık.' }
                            ].map(item => (
                                <button 
                                    key={item.id} 
                                    onClick={() => { setFormData({...formData, diagnosis: item.title}); setStep(2); }}
                                    className={`p-6 bg-white dark:bg-zinc-800 border-2 rounded-[2rem] transition-all text-left flex items-start gap-4 group ${formData.diagnosis === item.title ? 'border-indigo-500 ring-4 ring-indigo-50' : 'border-zinc-100 dark:border-zinc-700 hover:border-indigo-300'}`}
                                >
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-colors ${formData.diagnosis === item.title ? 'bg-indigo-600 text-white' : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-400 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}><i className={`fa-solid ${item.icon}`}></i></div>
                                    <div><h4 className="font-bold text-zinc-800 dark:text-zinc-100">{item.title}</h4><p className="text-xs text-zinc-500 mt-1">{item.desc}</p></div>
                                </button>
                            ))}
                        </div>
                        <div className="flex justify-between items-center pt-4">
                            <button onClick={() => setStep(0)} className="text-sm font-bold text-zinc-400 hover:text-zinc-600"><i className="fa-solid fa-arrow-left mr-2"></i> Geri Dön</button>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
                        <div className="text-center"><h2 className="text-3xl font-black text-zinc-900 dark:text-white">İlgi Alanları</h2><p className="text-zinc-500">Metin ve alıştırma temaları öğrencinin sevdikleriyle uyumlu olsun.</p></div>
                        <div className="flex flex-wrap justify-center gap-3">
                            {['Uzay', 'Dinozorlar', 'Hayvanlar', 'Doğa', 'Spor', 'Müzik', 'Oyunlar', 'Robotlar', 'Arkeoloji', 'Denizler'].map(tag => (
                                <button 
                                    key={tag}
                                    onClick={() => setFormData(prev => ({ ...prev, interests: prev.interests.includes(tag) ? prev.interests.filter(t => t !== tag) : [...prev.interests, tag] }))}
                                    className={`px-6 py-3 rounded-2xl font-bold text-sm border-2 transition-all ${formData.interests.includes(tag) ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-white dark:bg-zinc-800 text-zinc-500 border-zinc-100 dark:border-zinc-700 hover:border-zinc-300'}`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                        <div className="flex justify-between items-center pt-8">
                            <button onClick={() => setStep(1)} className="text-sm font-bold text-zinc-400 hover:text-zinc-600"><i className="fa-solid fa-arrow-left mr-2"></i> Geri Dön</button>
                            <button onClick={() => setStep(3)} className="px-12 py-4 bg-zinc-900 text-white dark:bg-white dark:text-black font-black rounded-2xl shadow-xl transition-all active:scale-95">SON ADIM <i className="fa-solid fa-arrow-right ml-2"></i></button>
                        </div>
                    </div>
                );
            case 3:
                 return (
                    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
                        <div className="text-center"><h2 className="text-3xl font-black text-zinc-900 dark:text-white">Zayıf Yönler</h2><p className="text-zinc-500">Hangi alanlarda en çok zorlanıyor? (AI bu noktaları güçlendirecek)</p></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {[
                                'Harf Karıştırma (b/d)', 'Heceleme Hataları', 'Yavaş Okuma', 'Ters Yazma', 'Sıralama Sorunları', 'Sayı Karıştırma', 'İşlem Hataları', 'Dikkat Dağınıklığı'
                            ].map(item => (
                                <label key={item} className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${formData.weaknesses.includes(item) ? 'bg-rose-50 border-rose-400 dark:bg-rose-900/20' : 'bg-white dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700'}`}>
                                    <input type="checkbox" checked={formData.weaknesses.includes(item)} onChange={() => setFormData(prev => ({ ...prev, weaknesses: prev.weaknesses.includes(item) ? prev.weaknesses.filter(t => t !== item) : [...prev.weaknesses, item] }))} className="hidden" />
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.weaknesses.includes(item) ? 'bg-rose-500 border-rose-500 text-white' : 'border-zinc-300'}`}><i className="fa-solid fa-check text-[10px]"></i></div>
                                    <span className="font-bold text-sm">{item}</span>
                                </label>
                            ))}
                        </div>
                        <div className="flex justify-between items-center pt-8 gap-4">
                            <button onClick={() => setStep(2)} className="text-sm font-bold text-zinc-400 hover:text-zinc-600 shrink-0"><i className="fa-solid fa-arrow-left mr-2"></i> Geri</button>
                            <button onClick={handleGenerate} className="flex-1 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black rounded-2xl shadow-2xl transition-all transform hover:scale-[1.02] active:scale-95">
                                PROGRAMI OLUŞTUR <i className="fa-solid fa-wand-magic-sparkles ml-2"></i>
                            </button>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="curriculum-plan-content max-w-4xl mx-auto space-y-10 pb-20">
                        {curriculum && (
                            <>
                                <div className="bg-white dark:bg-zinc-800 rounded-[2.5rem] p-10 border border-zinc-200 dark:border-zinc-700 shadow-xl relative overflow-hidden print:border-none print:shadow-none">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 print:hidden"></div>
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-8">
                                            <div>
                                                <span className="px-4 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-black uppercase tracking-widest border border-indigo-200 dark:border-indigo-800">Bireysel Gelişim Planı</span>
                                                <h1 className="text-4xl font-black text-zinc-900 dark:text-white mt-4 tracking-tight">{curriculum.studentName}</h1>
                                                <p className="text-zinc-500 font-bold mt-1 uppercase text-xs tracking-widest">{curriculum.grade} • {curriculum.durationDays} GÜNLÜK PROGRAM</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Başlangıç</p>
                                                <p className="text-lg font-black text-zinc-800 dark:text-zinc-200 font-mono">{new Date(curriculum.startDate).toLocaleDateString('tr-TR')}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b pb-2">Temel Hedefler</h4>
                                                <div className="space-y-2">
                                                    {curriculum.goals.map((g, i) => (
                                                        <div key={i} className="flex gap-3 items-center text-sm font-bold text-zinc-700 dark:text-zinc-300">
                                                            <i className="fa-solid fa-bullseye text-indigo-500 text-xs"></i> {g}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="p-5 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border border-zinc-100 dark:border-zinc-800 italic text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed print:bg-gray-100">
                                                <i className="fa-solid fa-quote-left text-indigo-300 dark:text-indigo-700 mb-2 block"></i> "{curriculum.note}"
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {curriculum.schedule.map((day) => (
                                        <DayCard key={day.day} day={day} onRegenerate={() => handleRegenerateDay(day.day)} onToggleActivity={handleToggleActivity} onStartActivity={handleStartActivity} />
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
                        <i className="fa-solid fa-graduation-cap text-indigo-500"></i> AI Eğitim Koçu
                    </h2>
                </div>
                <div className="flex gap-3">
                    {step === 4 && curriculum && (
                        <>
                            <button onClick={() => setIsShareModalOpen(true)} className="w-10 h-10 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center justify-center text-zinc-500 transition-colors" title="Paylaş"><i className="fa-solid fa-share-nodes"></i></button>
                            <button onClick={() => handlePrint('download')} disabled={isPrinting} className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-500 transition-colors">{isPrinting ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-file-pdf"></i>}</button>
                            <button onClick={() => handlePrint('print')} disabled={isPrinting} className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-500 transition-colors"><i className="fa-solid fa-print"></i></button>
                            <button onClick={handleSave} disabled={isSaved || isSaving} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-sm ${isSaved ? 'bg-green-100 text-green-700 cursor-default border border-green-200' : 'bg-zinc-900 text-white hover:bg-black dark:bg-white dark:text-black dark:hover:bg-zinc-200'}`}>
                                {isSaving ? <i className="fa-solid fa-circle-notch fa-spin"></i> : isSaved ? <><i className="fa-solid fa-check"></i> Kaydedildi</> : <><i className="fa-solid fa-save"></i> Kaydet</>}
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
