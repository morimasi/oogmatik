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
    canEdit?: boolean;
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
    handleDeleteGoal,
    canEdit = true
}) => {
    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-2">
                <h4 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-2">
                    <i className="fa-solid fa-bullseye text-[var(--accent-color)]"></i> Bireysel Plan Hedefleri (BEP & SMART)
                </h4>
                {isSaved && canEdit && !isAddingGoal && (
                    <button
                        onClick={() => { setIsAddingGoal(true); setNewGoalText(''); }}
                        className="text-[9px] font-black text-[var(--accent-color)] uppercase tracking-wider hover:underline flex items-center gap-1.5 transition-colors"
                    >
                        <i className="fa-solid fa-plus-circle"></i> Yeni Hedef Ekle
                    </button>
                )}
            </div>

            {isAddingGoal && canEdit && (
                <div className="p-3.5 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] space-y-2.5 animate-in fade-in duration-200">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Yeni SMART hedef girin..."
                            value={newGoalText}
                            onChange={e => setNewGoalText(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleAddGoal(); }}
                            className="flex-1 px-3 py-2 text-xs bg-[var(--bg-inset)] border border-[var(--border-color)] rounded-xl outline-none focus:ring-2 focus:ring-[var(--accent-color)]/30 font-bold text-[var(--text-primary)]"
                            autoFocus
                        />
                        <button
                            onClick={handleAddGoal}
                            disabled={!newGoalText.trim()}
                            className="px-4 py-2 bg-[var(--accent-color)] disabled:opacity-50 text-white text-[10px] font-black uppercase rounded-xl hover:bg-[var(--accent-hover)] transition-all shadow-md shadow-[var(--accent-color)]/20"
                        >
                            Kaydet
                        </button>
                        <button
                            onClick={() => setIsAddingGoal(false)}
                            className="px-3 py-2 bg-[var(--bg-paper)] text-[var(--text-secondary)] text-[10px] font-black uppercase rounded-xl hover:text-[var(--text-primary)] border border-[var(--border-color)] transition-all"
                        >
                            İptal
                        </button>
                    </div>
                    <div className="pt-2 border-t border-[var(--border-color)]">
                        <label className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-wider block mb-1">
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
                            className="w-full px-3 py-1.5 text-xs bg-[var(--bg-inset)] border border-[var(--border-color)] rounded-xl outline-none focus:ring-2 focus:ring-[var(--accent-color)]/30 text-[var(--text-primary)] font-medium"
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
                        d.isCompleted || (d.activities && d.activities.length > 0 && d.activities.every((a: CurriculumActivity) => a.status === 'completed'))
                    ).length;
                    const isAchieved = i < completedDays;
                    const isEditingThis = editingGoal === i;
                    return (
                        <div
                            key={i}
                            className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                                isAchieved
                                    ? 'bg-emerald-500/10 border-emerald-500/30'
                                    : 'bg-[var(--bg-secondary)] border-[var(--border-color)]'
                            } hover:border-[var(--accent-color)]/50 group`}
                        >
                            <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
                                <span className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                                    isAchieved
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-[var(--bg-inset)] text-[var(--text-muted)] border border-[var(--border-color)]'
                                } text-[10px]`}>
                                    <i className={`fa-solid ${isAchieved ? 'fa-check' : 'fa-crosshairs'}`}></i>
                                </span>
                                {isEditingThis && canEdit ? (
                                    <input
                                        type="text"
                                        value={tempGoal}
                                        onChange={e => setTempGoal(e.target.value)}
                                        onBlur={() => handleSaveGoal(i)}
                                        onKeyDown={e => { if (e.key === 'Enter') handleSaveGoal(i); }}
                                        className="flex-1 px-3 py-1.5 text-xs font-bold bg-[var(--bg-inset)] border-2 border-[var(--accent-color)] rounded-xl outline-none text-[var(--text-primary)]"
                                        autoFocus
                                    />
                                ) : (
                                    <span className={`text-xs font-bold leading-relaxed ${
                                        isAchieved
                                            ? 'text-emerald-400 line-through'
                                            : 'text-[var(--text-primary)]'
                                    }`}>
                                        {g}
                                    </span>
                                )}
                            </div>
                            {!isEditingThis && isSaved && canEdit && (
                                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0">
                                    <button
                                        onClick={() => handleStartEditingGoal(i, g)}
                                        className="w-7 h-7 rounded-lg bg-[var(--bg-paper)] text-[var(--text-muted)] hover:text-[var(--accent-color)] border border-[var(--border-color)] flex items-center justify-center transition-colors"
                                        title="Hedefi Düzenle"
                                    >
                                        <i className="fa-solid fa-pen text-[9px]"></i>
                                    </button>
                                    <button
                                        onClick={() => handleDeleteGoal(i)}
                                        className="w-7 h-7 rounded-lg bg-[var(--bg-paper)] text-[var(--text-muted)] hover:text-rose-400 border border-[var(--border-color)] flex items-center justify-center transition-colors"
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
