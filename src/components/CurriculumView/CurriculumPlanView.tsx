import React from 'react';
import { Curriculum, Difficulty } from '../../types';
import { DayCard } from './DayCard';
import { CurriculumGoalsEditor } from './CurriculumGoalsEditor';

interface CurriculumPlanViewProps {
    curriculum: Curriculum;
    isSaved: boolean;
    onStartCurriculumActivity: (planId: string, day: number, activityId: string, activityType: string, studentName: string, title: string, difficulty: Difficulty, goal: string, studentId?: string) => void;
    handleToggleActivity: (day: number, actId: string) => Promise<void>;
    handleSaveDayNote: (day: number, note: string) => Promise<void>;
    handleSaveDayFocusEdit: (day: number) => Promise<void>;
    handleReplaceActivity: (day: number, actId: string) => Promise<void>;
    handleSaveGoal: (idx: number) => Promise<void>;
    handleStartEditingGoal: (idx: number, goal: string) => void;
    handleAddGoal: () => Promise<void>;
    handleDeleteGoal: (idx: number) => Promise<void>;
    handleSaveNoteEdit: () => Promise<void>;
    handleDeletePlan: () => Promise<void>;
    editingDay: number | null;
    setEditingDay: (d: number | null) => void;
    tempFocus: string;
    setTempFocus: (v: string) => void;
    editingGoal: number | null;
    setEditingGoal: (v: number | null) => void;
    tempGoal: string;
    setTempGoal: (v: string) => void;
    isAddingGoal: boolean;
    setIsAddingGoal: (v: boolean) => void;
    newGoalText: string;
    setNewGoalText: (v: string) => void;
    isEditingNote: boolean;
    setIsEditingNote: (v: boolean) => void;
    tempNote: string;
    setTempNote: (v: string) => void;
    changingActivityDay: number | null;
    setChangingActivityDay: (v: number | null) => void;
}

export const CurriculumPlanView: React.FC<CurriculumPlanViewProps> = ({
    curriculum, isSaved, onStartCurriculumActivity,
    handleToggleActivity, handleSaveDayNote, handleSaveDayFocusEdit, handleReplaceActivity,
    handleSaveGoal, handleStartEditingGoal, handleAddGoal, handleDeleteGoal,
    handleSaveNoteEdit, handleDeletePlan,
    editingDay, setEditingDay, tempFocus, setTempFocus,
    editingGoal, setEditingGoal, tempGoal, setTempGoal,
    isAddingGoal, setIsAddingGoal, newGoalText, setNewGoalText,
    isEditingNote, setIsEditingNote, tempNote, setTempNote,
    changingActivityDay, setChangingActivityDay
}) => {
    const progress = Math.round((curriculum.schedule.filter(d => d.isCompleted || d.activities?.every((a: any) => a.status === 'completed')).length / curriculum.schedule.length) * 100);

    return (
        <div className="curriculum-plan-content max-w-5xl mx-auto space-y-10 pb-20">
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
                                <span className="text-2xl font-black text-indigo-600">%{progress}</span>
                            </div>
                            {isSaved && (
                                <button onClick={handleDeletePlan} className="text-xs font-bold text-red-400 hover:text-red-500 transition-colors uppercase tracking-widest flex items-center gap-2 px-2">
                                    <i className="fa-solid fa-trash-can"></i> Planı Sil
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <CurriculumGoalsEditor
                            curriculum={curriculum}
                            isSaved={isSaved}
                            editingGoal={editingGoal}
                            tempGoal={tempGoal}
                            isAddingGoal={isAddingGoal}
                            newGoalText={newGoalText}
                            setEditingGoal={setEditingGoal}
                            setTempGoal={setTempGoal}
                            setIsAddingGoal={setIsAddingGoal}
                            setNewGoalText={setNewGoalText}
                            handleSaveGoal={handleSaveGoal}
                            handleStartEditingGoal={handleStartEditingGoal}
                            handleAddGoal={handleAddGoal}
                            handleDeleteGoal={handleDeleteGoal}
                        />

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
        </div>
    );
};
