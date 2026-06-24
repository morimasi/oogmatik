import React from 'react';
import { Curriculum } from '../../types';
import { ACTIVITIES } from '../../constants';

interface CurriculumGoalsEditorProps {
    curriculum: Curriculum;
    isSaved: boolean;
    editingGoal: number | null;
    tempGoal: string;
    isAddingGoal: boolean;
    newGoalText: string;
    setEditingGoal: (v: number | null) => void;
    setTempGoal: (v: string) => void;
    setIsAddingGoal: (v: boolean) => void;
    setNewGoalText: (v: string) => void;
    handleSaveGoal: (idx: number) => Promise<void>;
    handleStartEditingGoal: (idx: number, goal: string) => void;
    handleAddGoal: () => Promise<void>;
    handleDeleteGoal: (idx: number) => Promise<void>;
}

export const CurriculumGoalsEditor: React.FC<CurriculumGoalsEditorProps> = ({ curriculum, isSaved, editingGoal, tempGoal, isAddingGoal, newGoalText, setEditingGoal, setTempGoal, setIsAddingGoal, setNewGoalText, handleSaveGoal, handleStartEditingGoal, handleAddGoal, handleDeleteGoal }) => {
    return (
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
    );
};
