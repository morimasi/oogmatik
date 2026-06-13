
import React, { useState, useEffect } from 'react';
import { curriculumService } from '../services/curriculumService';
import { Curriculum, CurriculumDay, Student } from '../types';
import { printService } from '../utils/printService';
import { useAuthStore } from '../store/useAuthStore';
import { useStudentStore } from '../store/useStudentStore';
import { ShareModal } from './ShareModal';
import { logError } from '../utils/logger.js';
import { AppError } from '../utils/AppError';
import { Difficulty } from '../types/common';
import { ACTIVITIES } from '../constants';
import { useToastStore } from '../store/useToastStore';
import { profileShareService } from '../services/profileShareService';

interface CurriculumViewProps {
    onBack: () => void;
    onSelectActivity: (id: string) => void;
    onStartCurriculumActivity: (planId: string, day: number, activityId: string, activityType: string, studentName: string, title: string, difficulty: Difficulty, goal: string, studentId?: string) => void;
    initialPlan?: Curriculum | null;
    preFillData?: { name: string; age: number; weaknesses: string[], diagnosisContext?: string } | null;
}

const DayCard: React.FC<{
    day: CurriculumDay,
    isActiveDay: boolean,
    isSaved: boolean,
    onToggleActivity: (day: number, actId: string) => void,
    onStartActivity: (actId: string, actType: string, title: string, difficulty: Difficulty, goal: string) => void,
    onSaveNote: (day: number, note: string) => void,
    editingDay?: number | null,
    tempFocus?: string,
    onEditDayFocus?: (day: number, focus: string) => void,
    onSaveDayFocus?: (day: number) => void,
    onTempFocusChange?: (v: string) => void,
    changingActivityDay?: number | null,
    onSetChangingDay?: (d: number | null) => void,
    onReplaceActivity?: (day: number, actId: string) => void
}> = ({ day, isActiveDay, isSaved, onToggleActivity, onStartActivity, onSaveNote, editingDay, tempFocus, onEditDayFocus, onSaveDayFocus, onTempFocusChange, changingActivityDay, onSetChangingDay, onReplaceActivity }) => {
    const isAllCompleted = day.activities.every(a => a.status === 'completed');
    const isEditing = editingDay === day.day;
    const isChanging = changingActivityDay === day.day;

    return (
        <div className={`group relative bg-white dark:bg-zinc-800 rounded-3xl border-2 transition-all duration-500 hover:shadow-2xl ${isActiveDay ? 'ring-4 ring-indigo-500/20 border-indigo-500 scale-[1.02] z-10 shadow-xl' : 'border-zinc-100 dark:border-zinc-700'} ${isAllCompleted ? 'opacity-80 grayscale-[0.3]' : ''} break-inside-avoid page-break-inside-avoid print:border-zinc-300 print:shadow-none`}>
            {isActiveDay && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg animate-bounce z-20">
                    ŞU AN BURADAYIZ
                </div>
            )}

            <div className={`p-5 rounded-t-[1.3rem] flex justify-between items-center ${isActiveDay ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'bg-zinc-50 dark:bg-zinc-900/50'} border-b border-zinc-100 dark:border-zinc-700`}>
                <div className="flex-1 min-w-0">
                    <h4 className="font-black text-xl text-zinc-800 dark:text-white flex items-center gap-2">
                        {day.day}. Gün
                        {isAllCompleted && <i className="fa-solid fa-circle-check text-emerald-500"></i>}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-1 group/focus">
                        {isEditing ? (
                            <div className="flex gap-1 items-center">
                                <input
                                    type="text"
                                    value={tempFocus || ''}
                                    onChange={e => onTempFocusChange?.(e.target.value)}
                                    onBlur={() => onSaveDayFocus?.(day.day)}
                                    onKeyDown={e => { if (e.key === 'Enter') onSaveDayFocus?.(day.day); }}
                                    className="px-2 py-0.5 text-xs font-bold bg-white dark:bg-zinc-700 border border-indigo-400 rounded-lg outline-none w-40"
                                    autoFocus
                                />
                            </div>
                        ) : (
                            <>
                                <p className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider line-clamp-1">{day.focus}</p>
                                {isSaved && onEditDayFocus && (
                                    <button
                                        onClick={() => onEditDayFocus(day.day, day.focus)}
                                        className="opacity-0 group-hover/focus:opacity-100 text-zinc-400 hover:text-indigo-500 transition-all shrink-0"
                                    >
                                        <i className="fa-solid fa-pen text-[8px]"></i>
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm border ${isActiveDay ? 'bg-white dark:bg-zinc-700 border-indigo-200' : 'bg-white dark:bg-zinc-700 border-zinc-100'}`}>
                    <i className={`fa-solid ${isAllCompleted ? 'fa-star text-amber-500' : 'fa-calendar-day text-zinc-400'}`}></i>
                </div>
            </div>

            <div className="p-5 space-y-4">
                {day.activities.map((act) => (
                    <div key={act.id} className={`relative pl-4 border-l-4 transition-all ${act.status === 'completed' ? 'border-emerald-400' : 'border-zinc-200 dark:border-zinc-700 hover:border-indigo-400'}`}>
                        <div className="flex justify-between items-start gap-4">
                            <div className="flex-1 min-w-0">
                                <h5 className={`font-bold text-sm truncate ${act.status === 'completed' ? 'line-through text-zinc-400' : 'text-zinc-800 dark:text-zinc-200'}`}>{act.title}</h5>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[9px] bg-zinc-100 dark:bg-zinc-700 px-1.5 py-0.5 rounded text-zinc-500 dark:text-zinc-400 font-mono">{act.duration} dk</span>
                                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase ${act.difficultyLevel === 'Zor' ? 'text-rose-600 bg-rose-50' : act.difficultyLevel === 'Orta' ? 'text-amber-600 bg-amber-50' : 'text-emerald-600 bg-emerald-50'}`}>
                                        {act.difficultyLevel}
                                    </span>
                                </div>
                                <p className="text-[10px] text-zinc-500 mt-1 italic line-clamp-2 leading-tight">{act.goal}</p>
                            </div>
                            <div className="flex flex-col gap-2 shrink-0">
                                <button
                                    onClick={() => onToggleActivity(day.day, act.id)}
                                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${act.status === 'completed' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-zinc-200 dark:border-zinc-600 hover:border-emerald-500 text-transparent hover:text-emerald-500'}`}
                                >
                                    <i className="fa-solid fa-check text-xs"></i>
                                </button>
                                {act.status !== 'completed' && (
                                    <button
                                        onClick={() => onStartActivity(act.activityId, act.activityId, act.title, act.difficultyLevel, act.goal)}
                                        className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-90"
                                        title="Uygulamayı Başlat"
                                    >
                                        <i className="fa-solid fa-wand-magic-sparkles text-[10px]"></i>
                                    </button>
                                )}
                                {isSaved && onReplaceActivity && (
                                    <button
                                        onClick={() => onSetChangingDay?.(isChanging ? null : day.day)}
                                        className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-700 text-zinc-500 hover:text-indigo-600 flex items-center justify-center border border-zinc-200 dark:border-zinc-600 transition-all"
                                        title="Aktiviteyi Değiştir"
                                    >
                                        <i className="fa-solid fa-sliders-up text-[10px]"></i>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {isChanging && (
                    <div className="p-3 bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800 rounded-2xl animate-in slide-in-from-top-2 duration-200">
                        <label className="text-[8px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block mb-1.5">Aktiviteyi Değiştir</label>
                        <select
                            onChange={(e) => { if (e.target.value) onReplaceActivity?.(day.day, e.target.value); }}
                            defaultValue={day.activities[0]?.activityId || ""}
                            className="w-full px-2.5 py-1.5 text-[9px] bg-white dark:bg-zinc-800 border border-indigo-200 dark:border-indigo-700 rounded-lg text-zinc-700 dark:text-zinc-300 outline-none focus:border-indigo-500"
                        >
                            <option value="" disabled>-- Aktivite Seçin --</option>
                            {ACTIVITIES.map(a => (
                                <option key={a.id} value={a.id}>{a.title}</option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="pt-4 mt-2 border-t border-dashed border-zinc-100 dark:border-zinc-700 print:hidden">
                    <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block">Gözlem Notu</label>
                    <textarea
                        className="w-full p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-700 rounded-xl text-[11px] resize-none focus:border-indigo-300 outline-none transition-all placeholder:text-zinc-300"
                        placeholder="Öğrencinin bugünkü tepkisi, odak süresi..."
                        rows={2}
                        defaultValue={day.focus === day.focus ? day.focus : ''}
                        onBlur={(e) => onSaveNote(day.day, e.target.value)}
                    ></textarea>
                </div>
            </div>
        </div>
    );
};

export const CurriculumView: React.FC<CurriculumViewProps> = ({ onBack, onStartCurriculumActivity, initialPlan, preFillData }) => {
    const { user } = useAuthStore();
    const { students, setActiveStudent, addStudent } = useStudentStore();
    const toast = useToastStore();

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
    const [diagnosisContext, setDiagnosisContext] = useState<string>('');
    const [existingPlans, setExistingPlans] = useState<Curriculum[]>([]);
    const [isLoadingPlans, setIsLoadingPlans] = useState(false);
    const [editingGoal, setEditingGoal] = useState<number | null>(null);
    const [tempGoal, setTempGoal] = useState('');
    const [isAddingGoal, setIsAddingGoal] = useState(false);
    const [newGoalText, setNewGoalText] = useState('');
    const [isEditingNote, setIsEditingNote] = useState(false);
    const [tempNote, setTempNote] = useState('');
    const [editingDay, setEditingDay] = useState<number | null>(null);
    const [tempFocus, setTempFocus] = useState('');
    const [changingActivityDay, setChangingActivityDay] = useState<number | null>(null);

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
        } else if (preFillData) {
            // TARAMADAN GELEN VERİ
            setFormData({
                name: preFillData.name,
                age: preFillData.age,
                grade: '1. Sınıf', // Varsayılan veya taramadan gelebilir
                weaknesses: preFillData.weaknesses,
                interests: [] // Kullanıcıya tamamlat
            });
            if (preFillData.diagnosisContext) {
                setDiagnosisContext(preFillData.diagnosisContext);
            }
            setStep(1); // Doğrudan detay ekranına git
        }
    }, [initialPlan, preFillData]);

    useEffect(() => {
        if (user) {
            setIsLoadingPlans(true);
            curriculumService.getUserCurriculums(user.id)
                .then(setExistingPlans)
                .finally(() => setIsLoadingPlans(false));
        }
    }, [user]);

    const handleStudentSelect = (sid: string) => {
        if (sid === 'new') {
            setFormData({ name: '', age: 8, grade: '2. Sınıf', diagnosis: [], interests: [], weaknesses: [] });
            setActiveStudent(null);
        } else {
            const student = students.find((s: Student) => s.id === sid);
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
            // Context varsa onu da gönderiyoruz
            const studentData = { ...formData };
            if (diagnosisContext) {
                studentData.notes = `KLİNİK TANI BAĞLAMI:\n${diagnosisContext}\n\n${studentData.notes || ''}`;
            }

            const plan = await curriculumService.generatePlan(studentData, planDuration);
            setCurriculum(plan);
            setStep(4);
            setIsSaved(false);
        } catch (_e) {
            alert("Plan oluşturulurken bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!user || !curriculum) return;
        setIsSaving(true);
        try {
            const isExisting = !!curriculum.id && existingPlans.some(p => p.id === curriculum.id);

            if (isExisting) {
                await curriculumService.updateCurriculum(curriculum.id, {
                    studentName: curriculum.studentName,
                    grade: curriculum.grade,
                    startDate: curriculum.startDate,
                    durationDays: curriculum.durationDays,
                    goals: curriculum.goals,
                    schedule: curriculum.schedule,
                    note: curriculum.note,
                    interests: curriculum.interests,
                    weaknesses: curriculum.weaknesses
                });
            } else {
                let sId = curriculum.studentId;
                if (!sId) {
                    const existing = students.find(s => s.name.trim().toLowerCase() === curriculum.studentName.trim().toLowerCase());
                    if (existing) {
                        sId = existing.id;
                        curriculum.studentId = existing.id;
                    } else {
                        const newStudentId = await addStudent(user.id, {
                            name: curriculum.studentName,
                            age: formData.age || 8,
                            grade: curriculum.grade || formData.grade || '1. Sınıf',
                            interests: formData.interests || [],
                            weaknesses: formData.weaknesses || []
                        });
                        sId = newStudentId;
                        curriculum.studentId = newStudentId;
                    }
                }
                const id = await curriculumService.saveCurriculum(user.id, curriculum);
                setCurriculum({ ...curriculum, id });
            }
            setIsSaved(true);
            const updated = await curriculumService.getUserCurriculums(user.id);
            setExistingPlans(updated);
            toast.success(isExisting ? 'Plan güncellendi.' : 'Plan kaydedildi.');
        } catch (_e) {
            toast.error('Kaydetme hatası.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleShareCurriculum = async (receiverIds: string[], permission?: 'view' | 'edit', message?: string) => {
        if (!user || !curriculum) {
            toast.error('Paylaşım için önce planı kaydedin.');
            return;
        }
        if (!isSaved && !curriculum.id) {
            await handleSave();
        }
        const planId = curriculum.id;
        if (!planId) {
            toast.error('Plan kaydedilemedi, paylaşım yapılamıyor.');
            return;
        }
        try {
            await Promise.all(
                receiverIds.map((recipientId) =>
                    profileShareService.shareModule({
                        ownerId: user.id,
                        ownerName: user.name,
                        recipientId,
                        moduleType: 'plans',
                        contentId: planId,
                        permission: permission || 'view',
                        message,
                    })
                )
            );
            toast.success('Eğitim planı paylaşıldı.');
            setIsShareModalOpen(false);
        } catch {
            toast.error('Paylaşım sırasında hata oluştu.');
        }
    };

    const handleDeletePlan = async () => {
        if (!curriculum?.id || !isSaved) return;
        if (confirm("Bu eğitim planını kalıcı olarak silmek istediğinize emin misiniz?")) {
            setLoading(true);
            try {
                await curriculumService.deleteCurriculum(curriculum.id);
                setCurriculum(null);
                setStep(0);
                alert("Plan silindi.");
            } catch (_e) {
                alert("Silme hatası.");
            } finally {
                setLoading(false);
            }
        }
    };

    const handlePrint = async (action: 'print' | 'download') => {
        setIsPrinting(true);
        try {
            // Allow React to render the loading state before blocking the thread
            await new Promise(resolve => setTimeout(resolve, 50));
            await printService.generatePdf('.curriculum-plan-content', `${formData.name}-EgitimPlani`, { action });
        } catch (e: unknown) {
            logError(e as unknown as AppError);
        } finally {
            setIsPrinting(false);
        }
    };

    const handleToggleActivity = async (day: number, actId: string) => {
        if (!curriculum) return;
        const dayData = curriculum.schedule.find(d => d.day === day);
        const currentStatus = dayData?.activities.find(a => a.id === actId)?.status;
        const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';

        try {
            if (isSaved) await curriculumService.updateActivityStatus(curriculum.id, day, actId, newStatus as unknown as any);
            setCurriculum(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    schedule: prev.schedule.map(d => {
                        if (d.day === day) {
                            const newActs = d.activities.map(a => a.id === actId ? { ...a, status: newStatus as unknown as any } : a);
                            return { ...d, activities: newActs, isCompleted: newActs.every(a => a.status === 'completed') };
                        }
                        return d;
                    })
                };
            });
        } catch (_e) { alert("Durum güncellenemedi."); }
    };

    const handleSaveDayNote = async (dayNum: number, note: string) => {
        if (!curriculum || !isSaved) return;
        const newSchedule = curriculum.schedule.map(d => d.day === dayNum ? { ...d, focus: note } : d);
        setCurriculum({ ...curriculum, schedule: newSchedule });
        await curriculumService.updateCurriculum(curriculum.id, { schedule: newSchedule });
    };

    const handleLoadPlan = (plan: Curriculum) => {
        setCurriculum(plan);
        setIsSaved(true);
        setStep(4);
        setFormData({
            id: plan.studentId || '',
            name: plan.studentName,
            grade: plan.grade,
            interests: plan.interests,
            weaknesses: plan.weaknesses
        });
        setPlanDuration(plan.durationDays);
    };

    const handleSaveGoal = async (idx: number) => {
        if (!curriculum || !curriculum.id) return;
        const updatedGoals = [...curriculum.goals];
        updatedGoals[idx] = tempGoal;
        setCurriculum({ ...curriculum, goals: updatedGoals });
        setEditingGoal(null);
        if (isSaved) {
            await curriculumService.updateCurriculum(curriculum.id, { goals: updatedGoals });
            const updated = await curriculumService.getUserCurriculums(user!.id);
            setExistingPlans(updated);
        }
    };

    const handleStartEditingGoal = (idx: number, goal: string) => {
        setEditingGoal(idx);
        setTempGoal(goal);
    };

    const handleAddGoal = async () => {
        if (!curriculum || !newGoalText.trim() || !curriculum.id) return;
        const updatedGoals = [...(curriculum.goals || []), newGoalText.trim()];
        setCurriculum({ ...curriculum, goals: updatedGoals });
        setNewGoalText('');
        setIsAddingGoal(false);
        if (isSaved) {
            await curriculumService.updateCurriculum(curriculum.id, { goals: updatedGoals });
            const updated = await curriculumService.getUserCurriculums(user!.id);
            setExistingPlans(updated);
        }
    };

    const handleDeleteGoal = async (idx: number) => {
        if (!curriculum || !curriculum.id) return;
        const updatedGoals = curriculum.goals.filter((_, i) => i !== idx);
        setCurriculum({ ...curriculum, goals: updatedGoals });
        if (isSaved) {
            await curriculumService.updateCurriculum(curriculum.id, { goals: updatedGoals });
            const updated = await curriculumService.getUserCurriculums(user!.id);
            setExistingPlans(updated);
        }
    };

    const handleSaveNoteEdit = async () => {
        if (!curriculum || !curriculum.id) return;
        setCurriculum({ ...curriculum, note: tempNote });
        setIsEditingNote(false);
        if (isSaved) {
            await curriculumService.updateCurriculum(curriculum.id, { note: tempNote });
            const updated = await curriculumService.getUserCurriculums(user!.id);
            setExistingPlans(updated);
        }
    };

    const handleSaveDayFocusEdit = async (dayNum: number) => {
        if (!curriculum || !curriculum.id) return;
        const newSchedule = curriculum.schedule.map(d => d.day === dayNum ? { ...d, focus: tempFocus } : d);
        setCurriculum({ ...curriculum, schedule: newSchedule });
        setEditingDay(null);
        if (isSaved) {
            await curriculumService.updateCurriculum(curriculum.id, { schedule: newSchedule });
            const updated = await curriculumService.getUserCurriculums(user!.id);
            setExistingPlans(updated);
        }
    };

    const handleReplaceActivity = async (dayNum: number, activityId: string) => {
        if (!curriculum || !curriculum.id) return;
        const act = ACTIVITIES.find(a => a.id === activityId);
        if (!act) return;
        const newSchedule = curriculum.schedule.map(d => {
            if (d.day === dayNum) {
                return {
                    ...d,
                    focus: `${act.title} Çalışması`,
                    activities: [{
                        ...d.activities[0],
                        id: d.activities[0]?.id || Math.random().toString(36).substr(2, 9),
                        activityId: act.id,
                        title: act.title,
                        status: 'pending' as const,
                        goal: `${act.title} aktivitesi ile gelişim hedeflenmektedir.`
                    }],
                    isCompleted: false
                };
            }
            return d;
        });
        setCurriculum({ ...curriculum, schedule: newSchedule });
        setChangingActivityDay(null);
        if (isSaved) {
            await curriculumService.updateCurriculum(curriculum.id, { schedule: newSchedule });
            toast.success(`Gün ${dayNum} aktivitesi "${act.title}" olarak değiştirildi.`);
            const updated = await curriculumService.getUserCurriculums(user!.id);
            setExistingPlans(updated);
        }
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
                    <h3 className="text-2xl font-black text-zinc-800 dark:text-white mb-2 text-center">Nöro-Pedagogik Analiz Yapılıyor...</h3>
                    <p className="text-zinc-500 text-center max-w-sm">AI, öğrencinin zayıf yönlerini sarmal öğrenme modeliyle {planDuration} günlük bir rotaya dönüştürüyor.</p>
                </div>
            );
        }

        switch (step) {
            case 0:
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
            case 1:
                return (
                    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
                        <div className="text-center">
                            <h2 className="text-3xl font-black text-zinc-900 dark:text-white">Akademik Profil Özeti</h2>
                            <p className="text-zinc-500">Bu veriler AI'nın her güne özel zorluk seviyesi belirlemesi için kullanılacaktır.</p>
                        </div>

                        {/* DIAGNOSIS CONTEXT DISPLAY */}
                        {diagnosisContext && (
                            <div className="bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                                <h4 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <i className="fa-solid fa-clipboard-check"></i> KLİNİK TARAMA BULGULARI
                                </h4>
                                <p className="text-sm text-zinc-700 dark:text-zinc-300 italic leading-relaxed whitespace-pre-line">
                                    {diagnosisContext}
                                </p>
                            </div>
                        )}

                        <div className="bg-white dark:bg-zinc-800 p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-700 shadow-xl space-y-6">
                            <div>
                                <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-3">Öğrencinin İlgi Alanları (AI Teması)</label>
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
                                <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-3">Klinik Hedefler (Zayıf Yönler)</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {/* Pre-fill logic might already populate some, allow user to add more */}
                                    {[
                                        'Harf Karıştırma', 'Yavaş Okuma', 'Sayı Hissi', 'Dikkat Dağınıklığı', 'Sıralama Sorunları', 'Ters Yazma',
                                        // Dynamic entries from screening if not in static list
                                        ...(formData.weaknesses || []).filter(w => !['Harf Karıştırma', 'Yavaş Okuma', 'Sayı Hissi', 'Dikkat Dağınıklığı', 'Sıralama Sorunları', 'Ters Yazma'].includes(w))
                                    ].map(item => (
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
                                <button onClick={handleGenerate} className="px-10 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:scale-105 transition-all">PROGRAMI İNŞA ET <i className="fa-solid fa-wand-magic-sparkles ml-2"></i></button>
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
                                        <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-6">
                                            <div className="flex gap-6 items-center">
                                                <div className="w-20 h-20 rounded-[2rem] bg-indigo-600 text-white flex items-center justify-center text-3xl shadow-xl border-4 border-white dark:border-zinc-700">
                                                    <i className="fa-solid fa-graduation-cap"></i>
                                                </div>
                                                <div>
                                                    <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-200 dark:border-indigo-800">Bireysel Gelişim Rotası</span>
                                                    <h1 className="text-4xl font-black text-zinc-900 dark:text-white mt-2 tracking-tight">{curriculum.studentName}</h1>
                                                    <p className="text-zinc-500 font-bold mt-1 uppercase text-xs tracking-widest">{curriculum.grade} • {curriculum.durationDays} GÜNLÜK AKIŞ</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-3">
                                                <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 flex flex-col items-center">
                                                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">GENEL İLERLEME</p>
                                                    <span className="text-2xl font-black text-indigo-600">%{Math.round((curriculum.schedule.filter(d => d.isCompleted || d.activities?.every((a: any) => a.status === 'completed')).length / curriculum.schedule.length) * 100)}</span>
                                                </div>
                                                {isSaved && (
                                                    <button onClick={handleDeletePlan} className="text-xs font-bold text-red-400 hover:text-red-500 transition-colors uppercase tracking-widest flex items-center gap-2 px-2">
                                                        <i className="fa-solid fa-trash-can"></i> Planı Sil
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Editable Goals + Note Section */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {/* Goals */}
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-700 pb-2">
                                                    <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Plan Hedefleri</h4>
                                                    {isSaved && !isAddingGoal && (
                                                        <button
                                                            onClick={() => { setIsAddingGoal(true); setNewGoalText(''); }}
                                                            className="text-[8px] font-black text-indigo-500 uppercase hover:underline flex items-center gap-1"
                                                        >
                                                            <i className="fa-solid fa-plus-circle"></i> Ekle
                                                        </button>
                                                    )}
                                                </div>

                                                {isAddingGoal && (
                                                    <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-700 space-y-2">
                                                        <div className="flex gap-1.5">
                                                            <input
                                                                type="text"
                                                                placeholder="Yeni hedef..."
                                                                value={newGoalText}
                                                                onChange={e => setNewGoalText(e.target.value)}
                                                                onKeyDown={e => { if (e.key === 'Enter') handleAddGoal(); }}
                                                                className="flex-1 px-3 py-1.5 text-[11px] bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-600 rounded-lg outline-none focus:border-indigo-500"
                                                                autoFocus
                                                            />
                                                            <button onClick={handleAddGoal} className="px-3 py-1.5 bg-indigo-600 text-white text-[9px] font-black uppercase rounded-lg hover:bg-indigo-700">Kaydet</button>
                                                            <button onClick={() => setIsAddingGoal(false)} className="px-2 py-1.5 bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 text-[9px] font-black uppercase rounded-lg">İptal</button>
                                                        </div>
                                                        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-700">
                                                            <label className="text-[7px] font-black text-zinc-400 uppercase tracking-wider block mb-1">Aktivite Havuzundan Hedef Ekle</label>
                                                            <select
                                                                onChange={(e) => { if (e.target.value) { const goalText = `"${ACTIVITIES.find(a => a.id === e.target.value)?.title}" eğitimi ile bilişsel becerilerin desteklenmesi`; setNewGoalText(goalText); } }}
                                                                defaultValue=""
                                                                className="w-full px-2 py-1.5 text-[9px] bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-600 rounded-lg outline-none focus:border-indigo-500"
                                                            >
                                                                <option value="">-- Aktivite Seçin --</option>
                                                                {ACTIVITIES.map(a => (
                                                                    <option key={a.id} value={a.id}>{a.title}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="space-y-1.5">
                                                    {curriculum.goals.map((g, i) => {
                                                        const completedDays = curriculum.schedule.filter(d => d.isCompleted || d.activities?.every((a: any) => a.status === 'completed')).length;
                                                        const isAchieved = i < completedDays;
                                                        const isEditingThis = editingGoal === i;
                                                        return (
                                                            <div key={i} className={`flex items-center justify-between p-3 rounded-xl border ${isAchieved ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200/50 dark:border-emerald-800/30' : 'bg-zinc-50/50 dark:bg-zinc-900/30 border-zinc-100 dark:border-zinc-800'} hover:border-indigo-200 dark:hover:border-indigo-800 transition-all group`}>
                                                                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                                                    <i className={`fa-solid ${isAchieved ? 'fa-circle-check text-emerald-500' : 'fa-circle text-zinc-300 dark:text-zinc-600'} text-[10px] shrink-0`}></i>
                                                                    {isEditingThis ? (
                                                                        <input
                                                                            type="text"
                                                                            value={tempGoal}
                                                                            onChange={e => setTempGoal(e.target.value)}
                                                                            onBlur={() => handleSaveGoal(i)}
                                                                            onKeyDown={e => { if (e.key === 'Enter') handleSaveGoal(i); }}
                                                                            className="flex-1 px-2 py-1 text-[11px] bg-white dark:bg-zinc-800 border border-indigo-400 rounded-lg outline-none"
                                                                            autoFocus
                                                                        />
                                                                    ) : (
                                                                        <span className={`text-sm font-bold ${isAchieved ? 'text-emerald-700 dark:text-emerald-300 line-through' : 'text-zinc-700 dark:text-zinc-300'}`}>{g}</span>
                                                                    )}
                                                                </div>
                                                                {!isEditingThis && isSaved && (
                                                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0">
                                                                        <button onClick={() => handleStartEditingGoal(i, g)} className="text-zinc-400 hover:text-indigo-500"><i className="fa-solid fa-pen text-[9px]"></i></button>
                                                                        <button onClick={() => handleDeleteGoal(i)} className="text-zinc-400 hover:text-rose-500"><i className="fa-solid fa-trash text-[9px]"></i></button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Note */}
                                            <div>
                                                <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-700 pb-2 mb-3">Öğretmen Notu & Pedagojik Stratejiler</h4>
                                                <div className="p-5 bg-amber-50/50 dark:bg-amber-900/10 rounded-3xl border border-amber-100 dark:border-amber-800/30 relative group/note">
                                                    {isEditingNote ? (
                                                        <div className="space-y-2">
                                                            <textarea
                                                                value={tempNote}
                                                                onChange={e => setTempNote(e.target.value)}
                                                                className="w-full p-3 text-sm bg-white dark:bg-zinc-800 border border-amber-300 dark:border-amber-700 rounded-xl outline-none focus:border-amber-500 h-24 resize-none"
                                                                autoFocus
                                                            />
                                                            <div className="flex gap-2">
                                                                <button onClick={handleSaveNoteEdit} className="px-4 py-2 bg-amber-600 text-white text-[9px] font-black uppercase rounded-xl hover:bg-amber-700">Kaydet</button>
                                                                <button onClick={() => setIsEditingNote(false)} className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 text-[9px] font-black uppercase rounded-xl">İptal</button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <i className="fa-solid fa-quote-left text-amber-300 dark:text-amber-700 mb-2 block text-lg"></i>
                                                            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed italic font-medium">
                                                                {curriculum.note ? `"${curriculum.note}"` : 'Henüz bir not eklenmemiş.'}
                                                            </p>
                                                            {isSaved && (
                                                                <button
                                                                    onClick={() => { setIsEditingNote(true); setTempNote(curriculum.note || ''); }}
                                                                    className="absolute top-3 right-3 text-amber-500 hover:text-amber-600 opacity-0 group-hover/note:opacity-100 transition-opacity"
                                                                >
                                                                    <i className="fa-solid fa-pen text-xs"></i>
                                                                </button>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Day Cards with inline editing */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {curriculum.schedule.map((day, idx) => {
                                        const isFirstIncomplete = !day.isCompleted && (idx === 0 || curriculum.schedule[idx - 1].isCompleted);
                                        return (
                                            <DayCard
                                                key={day.day}
                                                day={day}
                                                isActiveDay={isFirstIncomplete}
                                                isSaved={isSaved}
                                                onToggleActivity={handleToggleActivity}
                                                onStartActivity={(id, type, title, diff, goal) => onStartCurriculumActivity(curriculum.id, day.day, id, type, curriculum.studentName, title, diff, goal, curriculum.studentId || undefined)}
                                                onSaveNote={handleSaveDayNote}
                                                editingDay={editingDay}
                                                tempFocus={tempFocus}
                                                onEditDayFocus={(d, focus) => { setEditingDay(d); setTempFocus(focus); }}
                                                onSaveDayFocus={handleSaveDayFocusEdit}
                                                onTempFocusChange={setTempFocus}
                                                changingActivityDay={changingActivityDay}
                                                onSetChangingDay={setChangingActivityDay}
                                                onReplaceActivity={handleReplaceActivity}
                                            />
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="h-full bg-[var(--bg-primary)] flex flex-col overflow-hidden relative absolute inset-0 z-50 font-lexend">
            <div className="h-16 border-b border-[var(--border-color)] bg-[var(--bg-paper)] flex justify-between items-center px-6 shadow-sm shrink-0 z-20 print:hidden">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="w-10 h-10 rounded-xl hover:bg-[var(--bg-secondary)] flex items-center justify-center transition-colors text-[var(--text-muted)] border border-[var(--border-color)]" title="Çıkış">
                        <i className="fa-solid fa-arrow-left"></i>
                    </button>
                    {step >= 1 && (
                        <button onClick={() => setStep(0)} className="px-3 h-10 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-secondary)]/80 flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all text-xs font-bold uppercase tracking-wider border border-[var(--border-color)]">
                            <i className="fa-solid fa-map-location-dot"></i> Plan Listesi
                        </button>
                    )}
                    <h2 className="text-lg font-black text-[var(--text-primary)] flex items-center gap-2 italic uppercase tracking-tighter">
                        <i className="fa-solid fa-calendar-check text-[var(--accent-color)]"></i> Akıllı Müfredat Stüdyosu
                    </h2>
                </div>
                <div className="flex gap-3">
                    {step === 4 && curriculum && (
                        <>
                            <button onClick={() => setIsShareModalOpen(true)} className="w-10 h-10 rounded-xl hover:bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)] transition-colors border border-[var(--border-color)]" title="Paylaş"><i className="fa-solid fa-share-nodes"></i></button>
                            <button onClick={() => handlePrint('download')} disabled={isPrinting} className="w-10 h-10 rounded-xl bg-[var(--text-primary)] text-[var(--bg-paper)] hover:opacity-90 flex items-center justify-center transition-colors">{isPrinting ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-file-pdf"></i>}</button>
                            <button onClick={() => handlePrint('print')} disabled={isPrinting} className="w-10 h-10 rounded-xl bg-[var(--text-primary)] text-[var(--bg-paper)] hover:opacity-90 flex items-center justify-center transition-colors"><i className="fa-solid fa-print"></i></button>
                            <button onClick={handleSave} disabled={isSaved || isSaving} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg ${isSaved ? 'bg-emerald-600 text-white cursor-default' : 'bg-[var(--accent-color)] text-white hover:bg-[var(--accent-hover)]'}`}>
                                {isSaving ? <i className="fa-solid fa-circle-notch fa-spin"></i> : isSaved ? <><i className="fa-solid fa-check"></i> Plan Kaydedildi</> : <><i className="fa-solid fa-save"></i> Planı Arşivle</>}
                            </button>
                        </>
                    )}
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar print:overflow-visible print:h-auto print:bg-white">
                <div className="w-full mx-auto">
                    {renderWizard()}
                </div>
            </div>
            <ShareModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                onShare={handleShareCurriculum}
                worksheetTitle={curriculum?.studentName ? `${curriculum.studentName} — Eğitim Planı` : 'Eğitim Planı'}
                showPermissionSelector
            />
        </div>
    );
};
