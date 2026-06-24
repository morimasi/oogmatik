import React from 'react';
import { Curriculum, Difficulty } from '../types';
import { ShareModal } from './ShareModal';
import { useCurriculumState } from './CurriculumView/useCurriculumState';
import { CurriculumHeader } from './CurriculumView/CurriculumHeader';
import { CurriculumWizardStep0 } from './CurriculumView/CurriculumWizardStep0';
import { CurriculumWizardStep1 } from './CurriculumView/CurriculumWizardStep1';
import { CurriculumPlanView } from './CurriculumView/CurriculumPlanView';

interface CurriculumViewProps {
    onBack: () => void;
    onSelectActivity: (id: string) => void;
    onStartCurriculumActivity: (planId: string, day: number, activityId: string, activityType: string, studentName: string, title: string, difficulty: Difficulty, goal: string, studentId?: string) => void;
    initialPlan?: Curriculum | null;
    preFillData?: { name: string; age: number; weaknesses: string[], diagnosisContext?: string } | null;
}

export const CurriculumView: React.FC<CurriculumViewProps> = ({ onBack, onStartCurriculumActivity, initialPlan, preFillData }) => {
    const {
        step, loading, isSaving, curriculum, isSaved, isShareModalOpen, isPrinting,
        formData, planDuration, diagnosisContext, existingPlans, isLoadingPlans,
        editingGoal, tempGoal, isAddingGoal, newGoalText, isEditingNote, tempNote,
        editingDay, tempFocus, changingActivityDay, students,
        setStep, setFormData, setPlanDuration,
        setEditingDay, setTempFocus, setEditingGoal, setTempGoal, setIsAddingGoal, setNewGoalText,
        setIsEditingNote, setTempNote, setChangingActivityDay, setIsShareModalOpen,
        handleStudentSelect, handleGenerate, handleSave, handleShareCurriculum,
        handleDeletePlan, handlePrint, handleToggleActivity, handleSaveDayNote,
        handleLoadPlan, handleSaveGoal, handleStartEditingGoal, handleAddGoal,
        handleDeleteGoal, handleSaveNoteEdit, handleSaveDayFocusEdit, handleReplaceActivity,
    } = useCurriculumState({ initialPlan, preFillData });

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
                    <CurriculumWizardStep0
                        formData={formData}
                        setFormData={setFormData}
                        planDuration={planDuration}
                        setPlanDuration={setPlanDuration}
                        setStep={setStep}
                        students={students}
                        existingPlans={existingPlans}
                        isLoadingPlans={isLoadingPlans}
                        handleLoadPlan={handleLoadPlan}
                        handleStudentSelect={handleStudentSelect}
                    />
                );
            case 1:
                return (
                    <CurriculumWizardStep1
                        formData={formData}
                        setFormData={setFormData}
                        diagnosisContext={diagnosisContext}
                        setStep={setStep}
                        handleGenerate={handleGenerate}
                    />
                );
            case 4:
                return curriculum ? (
                    <CurriculumPlanView
                        curriculum={curriculum}
                        isSaved={isSaved}
                        onStartCurriculumActivity={onStartCurriculumActivity}
                        handleToggleActivity={handleToggleActivity}
                        handleSaveDayNote={handleSaveDayNote}
                        handleSaveDayFocusEdit={handleSaveDayFocusEdit}
                        handleReplaceActivity={handleReplaceActivity}
                        handleSaveGoal={handleSaveGoal}
                        handleStartEditingGoal={handleStartEditingGoal}
                        handleAddGoal={handleAddGoal}
                        handleDeleteGoal={handleDeleteGoal}
                        handleSaveNoteEdit={handleSaveNoteEdit}
                        handleDeletePlan={handleDeletePlan}
                        editingDay={editingDay}
                        setEditingDay={setEditingDay}
                        tempFocus={tempFocus}
                        setTempFocus={setTempFocus}
                        editingGoal={editingGoal}
                        setEditingGoal={setEditingGoal}
                        tempGoal={tempGoal}
                        setTempGoal={setTempGoal}
                        isAddingGoal={isAddingGoal}
                        setIsAddingGoal={setIsAddingGoal}
                        newGoalText={newGoalText}
                        setNewGoalText={setNewGoalText}
                        isEditingNote={isEditingNote}
                        setIsEditingNote={setIsEditingNote}
                        tempNote={tempNote}
                        setTempNote={setTempNote}
                        changingActivityDay={changingActivityDay}
                        setChangingActivityDay={setChangingActivityDay}
                    />
                ) : null;
            default: return null;
        }
    };

    return (
        <div className="h-full bg-[var(--bg-primary)] flex flex-col overflow-hidden relative absolute inset-0 z-50 font-lexend">
            <CurriculumHeader
                onBack={onBack}
                step={step}
                setStep={setStep}
                curriculum={curriculum}
                isSaved={isSaved}
                isSaving={isSaving}
                isPrinting={isPrinting}
                handleSave={handleSave}
                handlePrint={handlePrint}
                onOpenShareModal={() => setIsShareModalOpen(true)}
            />
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
