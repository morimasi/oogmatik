import { useState, useEffect, useMemo } from 'react';
import { curriculumService, getActivityDomain } from '../../services/curriculumService';
import { Curriculum, Student, CurriculumActivityStatus, CurriculumActivity, CurriculumDay } from '../../types';
import { printService } from '../../utils/printService';
import { useAuthStore } from '../../store/useAuthStore';
import { useStudentStore } from '../../store/useStudentStore';
import { logError } from '../../utils/logger.js';
import { AppError } from '../../utils/AppError';
import { useToastStore } from '../../store/useToastStore';
import { ACTIVITIES } from '../../constants';
import { profileShareService } from '../../services/profileShareService';

interface UseCurriculumStateParams {
    initialPlan?: Curriculum | null;
    preFillData?: { name: string; age: number; weaknesses: string[], diagnosisContext?: string } | null;
}

export type CurriculumViewMode = 'cards' | 'timeline' | 'meb-matrix' | 'analytics';

export function useCurriculumState({ initialPlan, preFillData }: UseCurriculumStateParams) {
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
    const [planType, setPlanType] = useState<'clinical' | 'meb' | 'hybrid'>('hybrid');
    const [selectedSubject, setSelectedSubject] = useState<string>('Matematik');
    const [selectedKazanimlar, setSelectedKazanimlar] = useState<string[]>([]);
    const [diagnosisContext, setDiagnosisContext] = useState<string>('');
    const [existingPlans, setExistingPlans] = useState<Curriculum[]>([]);
    const [isLoadingPlans, setIsLoadingPlans] = useState(false);
    
    // UI Görünüm ve Filtre State'leri
    const [viewMode, setViewMode] = useState<CurriculumViewMode>('cards');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
    const [domainFilter, setDomainFilter] = useState<'all' | 'math' | 'reading' | 'visual' | 'attention'>('all');

    // Düzenleme state'leri
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
            if (initialPlan.planType) setPlanType(initialPlan.planType);
            if (initialPlan.selectedKazanimlar) setSelectedKazanimlar(initialPlan.selectedKazanimlar);
            if (initialPlan.subject) setSelectedSubject(initialPlan.subject);
        } else if (preFillData) {
            setFormData({
                name: preFillData.name,
                age: preFillData.age,
                grade: '1. Sınıf',
                weaknesses: preFillData.weaknesses,
                interests: []
            });
            if (preFillData.diagnosisContext) {
                setDiagnosisContext(preFillData.diagnosisContext);
            }
            setStep(1);
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
            const studentData = { ...formData };
            if (diagnosisContext) {
                studentData.notes = `KLİNİK TANI BAĞLAMI:\n${diagnosisContext}\n\n${studentData.notes || ''}`;
            }
            const plan = await curriculumService.generatePlan(studentData, planDuration, {
                planType,
                selectedKazanimlar,
                subject: selectedSubject
            });
            setCurriculum(plan);
            setStep(4);
            setIsSaved(false);
            toast.success('Akıllı Müfredat Planı başarıyla oluşturuldu!');
        } catch {
            toast.error('Plan oluşturulurken bir hata oluştu.');
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
                    weaknesses: curriculum.weaknesses,
                    planType: curriculum.planType,
                    selectedKazanimlar: curriculum.selectedKazanimlar,
                    subject: curriculum.subject
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
            toast.success(isExisting ? 'Plan güncellendi.' : 'Plan başarıyla arşive kaydedildi.');
        } catch {
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
                toast.success('Plan silindi.');
            } catch {
                toast.error('Silme hatası.');
            } finally {
                setLoading(false);
            }
        }
    };

    const handlePrint = async (action: 'print' | 'download') => {
        setIsPrinting(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 100));
            await printService.generatePdf('.curriculum-plan-content', `${formData.name || 'Ogrenci'}-Akilli-Mufredat-Plani`, { action });
        } catch (e: unknown) {
            logError(e as AppError);
            toast.error('PDF üretilirken bir sorun oluştu.');
        } finally {
            setIsPrinting(false);
        }
    };

    const handleToggleActivity = async (day: number, actId: string) => {
        if (!curriculum) return;
        const dayData = curriculum.schedule.find(d => d.day === day);
        const currentStatus = dayData?.activities.find(a => a.id === actId)?.status;
        const newStatus: CurriculumActivityStatus = currentStatus === 'completed' ? 'pending' : 'completed';

        try {
            if (isSaved && curriculum.id) {
                await curriculumService.updateActivityStatus(curriculum.id, day, actId, newStatus);
            }
            setCurriculum(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    schedule: prev.schedule.map(d => {
                        if (d.day === day) {
                            const newActs = d.activities.map(a => a.id === actId ? { ...a, status: newStatus } : a);
                            return { ...d, activities: newActs, isCompleted: newActs.every(a => a.status === 'completed') };
                        }
                        return d;
                    })
                };
            });
        } catch {
            toast.error('Durum güncellenemedi.');
        }
    };

    // Günlük Öğretmen Gözlem Notunu Kaydet (day.notes alanına kaydedilir, day.focus'u BOZMAZ!)
    const handleSaveDayNote = async (dayNum: number, note: string) => {
        if (!curriculum) return;
        const newSchedule = curriculum.schedule.map(d => d.day === dayNum ? { ...d, notes: note } : d);
        setCurriculum({ ...curriculum, schedule: newSchedule });
        if (isSaved && curriculum.id) {
            await curriculumService.updateDayNote(curriculum.id, dayNum, note);
        }
    };

    // Günün Başlığını / Odak Konusunu Kaydet (day.focus alanına kaydedilir)
    const handleSaveDayFocusEdit = async (dayNum: number) => {
        if (!curriculum) return;
        const newSchedule = curriculum.schedule.map(d => d.day === dayNum ? { ...d, focus: tempFocus } : d);
        setCurriculum({ ...curriculum, schedule: newSchedule });
        setEditingDay(null);
        if (isSaved && curriculum.id) {
            await curriculumService.updateDayFocus(curriculum.id, dayNum, tempFocus);
        }
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
        if (plan.planType) setPlanType(plan.planType);
        if (plan.selectedKazanimlar) setSelectedKazanimlar(plan.selectedKazanimlar);
        if (plan.subject) setSelectedSubject(plan.subject);
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
        if (!curriculum || !newGoalText.trim()) return;
        const updatedGoals = [...(curriculum.goals || []), newGoalText.trim()];
        setCurriculum({ ...curriculum, goals: updatedGoals });
        setNewGoalText('');
        setIsAddingGoal(false);
        if (isSaved && curriculum.id && user) {
            await curriculumService.updateCurriculum(curriculum.id, { goals: updatedGoals });
            const updated = await curriculumService.getUserCurriculums(user.id);
            setExistingPlans(updated);
        }
    };

    const handleDeleteGoal = async (idx: number) => {
        if (!curriculum) return;
        const updatedGoals = curriculum.goals.filter((_, i) => i !== idx);
        setCurriculum({ ...curriculum, goals: updatedGoals });
        if (isSaved && curriculum.id && user) {
            await curriculumService.updateCurriculum(curriculum.id, { goals: updatedGoals });
            const updated = await curriculumService.getUserCurriculums(user.id);
            setExistingPlans(updated);
        }
    };

    const handleSaveNoteEdit = async () => {
        if (!curriculum) return;
        setCurriculum({ ...curriculum, note: tempNote });
        setIsEditingNote(false);
        if (isSaved && curriculum.id && user) {
            await curriculumService.updateCurriculum(curriculum.id, { note: tempNote });
            const updated = await curriculumService.getUserCurriculums(user.id);
            setExistingPlans(updated);
        }
    };

    const handleReplaceActivity = async (dayNum: number, activityId: string) => {
        if (!curriculum) return;
        const act = ACTIVITIES.find(a => a.id === activityId);
        if (!act) return;
        const newSchedule = curriculum.schedule.map(d => {
            if (d.day === dayNum) {
                return {
                    ...d,
                    focus: `${act.title} Çalışması`,
                    activities: [{
                        ...d.activities[0],
                        id: d.activities[0]?.id || Math.random().toString(36).substring(2, 9),
                        activityId: act.id,
                        title: act.title,
                        status: 'pending' as const,
                        goal: `${act.title} aktivitesi ile bireysel bilişsel becerilerin güçlendirilmesi.`,
                        difficultyLevel: d.activities[0]?.difficultyLevel || 'Orta',
                        domain: getActivityDomain(act.id)
                    }],
                    isCompleted: false
                };
            }
            return d;
        });
        setCurriculum({ ...curriculum, schedule: newSchedule });
        setChangingActivityDay(null);
        if (isSaved && curriculum.id && user) {
            await curriculumService.updateCurriculum(curriculum.id, { schedule: newSchedule });
            toast.success(`Gün ${dayNum} aktivitesi "${act.title}" olarak güncellendi.`);
            const updated = await curriculumService.getUserCurriculums(user.id);
            setExistingPlans(updated);
        }
    };

    // Filtrelenmiş Günler
    const filteredSchedule = useMemo(() => {
        if (!curriculum) return [];
        return curriculum.schedule.filter((day: CurriculumDay) => {
            // Durum Filtresi
            if (statusFilter === 'completed' && !day.isCompleted && !day.activities.every(a => a.status === 'completed')) return false;
            if (statusFilter === 'pending' && (day.isCompleted || (day.activities.length > 0 && day.activities.every(a => a.status === 'completed')))) return false;

            // Alan Filtresi
            if (domainFilter !== 'all') {
                const hasDomain = day.activities.some(a => a.domain === domainFilter);
                if (!hasDomain) return false;
            }

            // Arama Sorgusu
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const matchFocus = day.focus.toLowerCase().includes(q);
                const matchAct = day.activities.some(a => a.title.toLowerCase().includes(q) || a.goal.toLowerCase().includes(q));
                const matchKazanim = day.kazanimKod?.toLowerCase().includes(q) || day.activities.some(a => a.kazanimKod?.toLowerCase().includes(q));
                if (!matchFocus && !matchAct && !matchKazanim) return false;
            }

            return true;
        });
    }, [curriculum, statusFilter, domainFilter, searchQuery]);

    // Bilişsel İstatistikler ve Dağılım
    const analytics = useMemo(() => {
        if (!curriculum) return null;
        let totalActivities = 0;
        let completedActivities = 0;
        let totalMinutes = 0;
        let completedMinutes = 0;
        const domainCounts = { math: 0, reading: 0, visual: 0, attention: 0, general: 0 };
        const difficultyCounts = { Kolay: 0, Orta: 0, Zor: 0 };

        for (const day of curriculum.schedule) {
            for (const act of day.activities) {
                totalActivities++;
                totalMinutes += act.duration || 15;
                if (act.status === 'completed') {
                    completedActivities++;
                    completedMinutes += act.duration || 15;
                }
                const dom = act.domain || getActivityDomain(act.activityId);
                domainCounts[dom] = (domainCounts[dom] || 0) + 1;
                difficultyCounts[act.difficultyLevel || 'Orta'] = (difficultyCounts[act.difficultyLevel || 'Orta'] || 0) + 1;
            }
        }

        const progressPercent = totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0;

        return {
            totalActivities,
            completedActivities,
            totalMinutes,
            completedMinutes,
            progressPercent,
            domainCounts,
            difficultyCounts
        };
    }, [curriculum]);

    return {
        user, students,
        step, loading, isSaving, curriculum, isSaved, isShareModalOpen, isPrinting,
        formData, planDuration, planType, selectedSubject, selectedKazanimlar,
        diagnosisContext, existingPlans, isLoadingPlans,
        viewMode, setViewMode, searchQuery, setSearchQuery, statusFilter, setStatusFilter, domainFilter, setDomainFilter,
        filteredSchedule, analytics,
        editingGoal, tempGoal, isAddingGoal, newGoalText, isEditingNote, tempNote,
        editingDay, tempFocus, changingActivityDay,
        setStep, setFormData, setPlanDuration, setPlanType, setSelectedSubject, setSelectedKazanimlar,
        setDiagnosisContext, setExistingPlans,
        setEditingDay, setTempFocus, setEditingGoal, setTempGoal, setIsAddingGoal, setNewGoalText,
        setIsEditingNote, setTempNote, setChangingActivityDay, setIsShareModalOpen,
        handleStudentSelect, handleGenerate, handleSave, handleShareCurriculum,
        handleDeletePlan, handlePrint, handleToggleActivity, handleSaveDayNote,
        handleLoadPlan, handleSaveGoal, handleStartEditingGoal, handleAddGoal,
        handleDeleteGoal, handleSaveNoteEdit, handleSaveDayFocusEdit, handleReplaceActivity,
    };
}
