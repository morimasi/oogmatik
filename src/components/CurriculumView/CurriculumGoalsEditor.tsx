import React from 'react';
import { Curriculum, CurriculumActivity } from '../../types';
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

export const CurriculumGoalsEditor: React.FC<CurriculumGoalsEditorProps> = ({
    curriculum,
    isSaved,
    editingGoal,
    tempGoal,
    isAddingGoal,
    newGoalText,
    setEditingGoal,
    setTempGoal,
    setIsAddingGoal,
    setNewGoalText,
    handleSaveGoal,
    handleStartEditingGoal,
    handleAddGoal,
    handleDeleteGoal
}) => {
    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-zinc-200/60 dark:border-zinc-700 pb-2">
                <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                    <i className="fa-solid fa-bullseye text-indigo-500"></i> Bireysel Plan Hedefleri (BEP & SMART)
                </h4>
                {isSaved && !isAddingGoal && (
                    <button
                        onClick={() => { setIsAddingGoal(true); setNewGoalText(''); }}
                        className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider hover:underline flex items-center gap-1.5 transition-colors"
                    >
                        <i className="fa-solid fa-plus-circle"></i> Yeni Hedef Ekle
                    </button>
                )}
            </div>

            {isAddingGoal && (
                <div className="p-3.5 bg-indigo-50/50 dark:bg-zinc-900/60 rounded-2xl border border-indigo-200 dark:border-zinc-700 space-y-2.5 animate-in fade-in duration-200">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Yeni SMART hedef girin..."
                            value={newGoalText}
                            onChange={e => setNewGoalText(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleAddGoal(); }}
                            className="flex-1 px-3 py-2 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-600 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/30 font-bold"
                            autoFocus
                        />
                        <button
                            onClick={handleAddGoal}
                            disabled={!newGoalText.trim()}
                            className="px-4 py-2 bg-indigo-600 disabled:opacity-50 text-white text-[10px] font-black uppercase rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/20"
                        >
                            Kaydet
                        </button>
                        <button
                            onClick={() => setIsAddingGoal(false)}
                            className="px-3 py-2 bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 text-[10px] font-black uppercase rounded-xl hover:bg-zinc-300 transition-all"
                        >
                            İptal
                        </button>
                    </div>
                    <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-700">
                        <label className="text-[8px] font-black text-zinc-400 uppercase tracking-wider block mb-1">
                            Aktivite Havuzundan Hızlı Hedef Şablonu Seç
                        </label>
                        <select
                            onChange={(e) => {
                                if (e.target.value) {
                                    const act = ACTIVITIES.find(a => a.id === e.target.value);
                                    if (act) {
                                        setNewGoalText(`"${act.title}" ile bilişsel becerilerini geliştirecek ve bağımsız tamamlama eşiğine ulaşacak.`);
                                    }
                                }
                            }}
                            defaultValue=""
                            className="w-full px-3 py-1.5 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/30 text-zinc-700 dark:text-zinc-200 font-medium"
                        >
                            <option value="">-- Aktivite Seçerek Hedef Üret --</option>
                            {ACTIVITIES.map(a => (
                                <option key={a.id} value={a.id}>{a.title}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            <div className="space-y-2">
                {curriculum.goals.map((g, i) => {
                    const completedDays = curriculum.schedule.filter(d =>
                        d.isCompleted || (d.activities.length > 0 && d.activities.every((a: CurriculumActivity) => a.status === 'completed'))
                    ).length;
                    const isAchieved = i < completedDays;
                    const isEditingThis = editingGoal === i;
                    return (
                        <div
                            key={i}
                            className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                                isAchieved
                                    ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40'
                                    : 'bg-zinc-50/70 dark:bg-zinc-900/40 border-zinc-200/70 dark:border-zinc-800'
                            } hover:border-indigo-300 dark:hover:border-indigo-700 group`}
                        >
                            <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
                                <span className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                                    isAchieved
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400'
                                } text-[10px]`}>
                                    <i className={`fa-solid ${isAchieved ? 'fa-check' : 'fa-crosshairs'}`}></i>
                                </span>
                                {isEditingThis ? (
                                    <input
                                        type="text"
                                        value={tempGoal}
                                        onChange={e => setTempGoal(e.target.value)}
                                        onBlur={() => handleSaveGoal(i)}
                                        onKeyDown={e => { if (e.key === 'Enter') handleSaveGoal(i); }}
                                        className="flex-1 px-3 py-1.5 text-xs font-bold bg-white dark:bg-zinc-800 border-2 border-indigo-500 rounded-xl outline-none"
                                        autoFocus
                                    />
                                ) : (
                                    <span className={`text-xs font-bold leading-relaxed ${
                                        isAchieved
                                            ? 'text-emerald-700 dark:text-emerald-300 line-through'
                                            : 'text-zinc-800 dark:text-zinc-200'
                                    }`}>
                                        {g}
                                    </span>
                                )}
                            </div>
                            {!isEditingThis && isSaved && (
                                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0">
                                    <button
                                        onClick={() => handleStartEditingGoal(i, g)}
                                        className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-700 text-zinc-500 hover:text-indigo-600 flex items-center justify-center transition-colors"
                                        title="Hedefi Düzenle"
                                    >
                                        <i className="fa-solid fa-pen text-[9px]"></i>
                                    </button>
                                    <button
                                        onClick={() => handleDeleteGoal(i)}
                                        className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-700 text-zinc-500 hover:text-rose-600 flex items-center justify-center transition-colors"
                                        title="Hedefi Sil"
                                    >
                                        <i className="fa-solid fa-trash text-[9px]"></i>
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
