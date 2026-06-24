import { useState, useEffect } from 'react';
import { curriculumService } from '../../services/curriculumService';
import { Curriculum, CurriculumDay, Student } from '../../types';
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
            const plan = await curriculumService.generatePlan(studentData, planDuration);
            setCurriculum(plan);
            setStep(4);
            setIsSaved(false);
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
            await new Promise(resolve => setTimeout(resolve, 50));
            await printService.generatePdf('.curriculum-plan-content', `${formData.name}-EgitimPlani`, { action });
        } catch (e: unknown) {
            logError(e as AppError);
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
            if (isSaved) await curriculumService.updateActivityStatus(curriculum.id, day, actId, newStatus);
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
        } catch { toast.error('Durum güncellenemedi.'); }
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

    return {
        user, students,
        step, loading, isSaving, curriculum, isSaved, isShareModalOpen, isPrinting,
        formData, planDuration, diagnosisContext, existingPlans, isLoadingPlans,
        editingGoal, tempGoal, isAddingGoal, newGoalText, isEditingNote, tempNote,
        editingDay, tempFocus, changingActivityDay,
        setStep, setFormData, setPlanDuration, setDiagnosisContext, setExistingPlans,
        setEditingDay, setTempFocus, setEditingGoal, setTempGoal, setIsAddingGoal, setNewGoalText,
        setIsEditingNote, setTempNote, setChangingActivityDay,
        handleStudentSelect, handleGenerate, handleSave, handleShareCurriculum,
        handleDeletePlan, handlePrint, handleToggleActivity, handleSaveDayNote,
        handleLoadPlan, handleSaveGoal, handleStartEditingGoal, handleAddGoal,
        handleDeleteGoal, handleSaveNoteEdit, handleSaveDayFocusEdit, handleReplaceActivity,
    };
}
