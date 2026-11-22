import React from 'react';
import { CurriculumDay, CurriculumActivity, Difficulty } from '../../types';
import { ACTIVITIES } from '../../constants';

interface DayCardProps {
    day: CurriculumDay;
    isActiveDay: boolean;
    isSaved: boolean;
    onToggleActivity: (day: number, actId: string) => void;
    onStartActivity: (actId: string, actType: string, title: string, difficulty: Difficulty, goal: string) => void;
    onSaveNote: (day: number, note: string) => void;
    editingDay?: number | null;
    tempFocus?: string;
    onEditDayFocus?: (day: number, focus: string) => void;
    onSaveDayFocus?: (day: number) => void;
    onTempFocusChange?: (v: string) => void;
    changingActivityDay?: number | null;
    onSetChangingDay?: (d: number | null) => void;
    onReplaceActivity?: (day: number, actId: string) => void;
    canEdit?: boolean;
}

export const DayCard: React.FC<DayCardProps> = ({
    day,
    isActiveDay,
    isSaved,
    onToggleActivity,
    onStartActivity,
    onSaveNote,
    editingDay,
    tempFocus,
    onEditDayFocus,
    onSaveDayFocus,
    onTempFocusChange,
    changingActivityDay,
    onSetChangingDay,
    onReplaceActivity,
    canEdit = true
}) => {
    const isAllCompleted = day.activities.length > 0 && day.activities.every(a => a.status === 'completed');
    const isEditing = editingDay === day.day;
    const isChanging = changingActivityDay === day.day;

    const getDomainBadge = (domain?: string) => {
        switch (domain) {
            case 'math':
                return { label: 'Matematik & Mantık', icon: 'fa-calculator', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
            case 'reading':
                return { label: 'Okuma & Dil', icon: 'fa-book-open', color: 'bg-[var(--accent-color)]/15 text-[var(--accent-color)] border-[var(--accent-color)]/30' };
            case 'visual':
                return { label: 'Görsel & Mekansal', icon: 'fa-eye', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' };
            case 'attention':
                return { label: 'Dikkat & Hafıza', icon: 'fa-brain', color: 'bg-purple-500/15 text-purple-400 border-purple-500/30' };
            default:
                return { label: 'Bilişsel Gelişim', icon: 'fa-shapes', color: 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-color)]' };
        }
    };

    return (
        <div className={`group relative bg-[var(--bg-paper)]/85 backdrop-blur-xl rounded-[2rem] border transition-all duration-300 hover:shadow-2xl ${
            isActiveDay
                ? 'ring-4 ring-[var(--accent-color)]/25 border-[var(--accent-color)] shadow-xl'
                : 'border-[var(--border-color)]'
        } ${isAllCompleted ? 'opacity-90' : ''} break-inside-avoid print:border-zinc-300 print:shadow-none`}>
            {isActiveDay && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[var(--accent-color)] to-purple-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[var(--accent-color)]/30 flex items-center gap-1.5 z-20">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                    ŞU ANKİ AŞAMA
                </div>
            )}

            {/* Header */}
            <div className={`p-5 rounded-t-[1.8rem] flex justify-between items-center ${
                isActiveDay
                    ? 'bg-gradient-to-r from-[var(--accent-color)]/15 to-purple-500/10'
                    : 'bg-[var(--bg-secondary)]/70'
            } border-b border-[var(--border-color)]`}>
                <div className="flex-1 min-w-0 pr-3">
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-lg bg-[var(--accent-color)] text-white text-[10px] font-black tracking-wider uppercase">
                            {day.day}. GÜN
                        </span>
                        {day.kazanimKod && (
                            <span className="px-2 py-0.5 rounded-md bg-[var(--bg-inset)] text-[var(--accent-color)] font-mono text-[9px] font-bold border border-[var(--border-color)]">
                                {day.kazanimKod}
                            </span>
                        )}
                        {isAllCompleted && (
                            <span className="flex items-center gap-1 text-emerald-400 text-xs font-bold">
                                <i className="fa-solid fa-circle-check"></i>
                                <span className="text-[10px] uppercase font-black">Tamam</span>
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-2 group/focus">
                        {isEditing && canEdit ? (
                            <div className="flex gap-1 items-center w-full">
                                <input
                                    type="text"
                                    value={tempFocus || ''}
                                    onChange={e => onTempFocusChange?.(e.target.value)}
                                    onBlur={() => onSaveDayFocus?.(day.day)}
                                    onKeyDown={e => { if (e.key === 'Enter') onSaveDayFocus?.(day.day); }}
                                    className="px-2.5 py-1 text-xs font-bold bg-[var(--bg-inset)] border-2 border-[var(--accent-color)] rounded-xl outline-none w-full shadow-inner text-[var(--text-primary)]"
                                    autoFocus
                                    placeholder="Günün odak konusu..."
                                />
                            </div>
                        ) : (
                            <div className="flex items-center justify-between w-full">
                                <p className="text-sm font-extrabold text-[var(--text-primary)] line-clamp-1">
                                    {day.focus}
                                </p>
                                {isSaved && canEdit && onEditDayFocus && (
                                    <button
                                        onClick={() => onEditDayFocus(day.day, day.focus)}
                                        className="opacity-0 group-hover/focus:opacity-100 text-[var(--text-muted)] hover:text-[var(--accent-color)] transition-all p-1"
                                        title="Günün başlığını düzenle"
                                    >
                                        <i className="fa-solid fa-pen text-[9px]"></i>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm border shrink-0 ${
                    isAllCompleted
                        ? 'bg-emerald-500 text-white border-emerald-400'
                        : isActiveDay
                            ? 'bg-[var(--bg-paper)] text-[var(--accent-color)] border-[var(--accent-color)]/30'
                            : 'bg-[var(--bg-paper)] text-[var(--text-muted)] border-[var(--border-color)]'
                }`}>
                    <i className={`fa-solid ${isAllCompleted ? 'fa-star' : 'fa-calendar-day'} text-sm`}></i>
                </div>
            </div>

            {/* Activities list */}
            <div className="p-5 space-y-4">
                {day.activities.map((act: CurriculumActivity) => {
                    const domainBadge = getDomainBadge(act.domain);
                    return (
                        <div
                            key={act.id}
                            className={`relative pl-4 border-l-4 rounded-r-2xl p-3 bg-[var(--bg-secondary)]/50 transition-all ${
                                act.status === 'completed'
                                    ? 'border-emerald-500 bg-emerald-500/10'
                                    : 'border-[var(--accent-color)] hover:border-[var(--accent-hover)]'
                            }`}
                        >
                            <div className="flex justify-between items-start gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[8px] font-black uppercase border ${domainBadge.color}`}>
                                            <i className={`fa-solid ${domainBadge.icon}`}></i> {domainBadge.label}
                                        </span>
                                        <span className={`text-[8px] px-2 py-0.5 rounded-md font-black uppercase ${
                                            act.difficultyLevel === 'Zor'
                                                ? 'text-rose-400 bg-rose-500/15'
                                                : act.difficultyLevel === 'Orta'
                                                    ? 'text-amber-400 bg-amber-500/15'
                                                    : 'text-emerald-400 bg-emerald-500/15'
                                        }`}>
                                            {act.difficultyLevel}
                                        </span>
                                        <span className="text-[8px] bg-[var(--bg-inset)] px-1.5 py-0.5 rounded text-[var(--text-secondary)] font-mono font-bold border border-[var(--border-color)]">
                                            {act.duration} dk
                                        </span>
                                    </div>
                                    <h5 className={`font-black text-sm leading-snug ${act.status === 'completed' ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-primary)]'}`}>
                                        {act.title}
                                    </h5>
                                    {act.kazanimKod && (
                                        <span className="text-[9px] text-[var(--accent-color)] font-mono font-bold mt-0.5 block">
                                            Kazanım: {act.kazanimKod}
                                        </span>
                                    )}
                                    <p className="text-[10px] text-[var(--text-secondary)] mt-1 italic line-clamp-2 leading-relaxed">
                                        {act.goal}
                                    </p>
                                </div>
                                <div className="flex flex-col gap-2 shrink-0">
                                    <button
                                        onClick={() => onToggleActivity(day.day, act.id)}
                                        className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all ${
                                            act.status === 'completed'
                                                ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20'
                                                : 'border-[var(--border-color)] hover:border-emerald-500 text-transparent hover:text-emerald-500 bg-[var(--bg-paper)]'
                                        }`}
                                        title={act.status === 'completed' ? 'Tamamlandı olarak işaretlendi (tıklayarak geri al)' : 'Tamamlandı olarak işaretle'}
                                    >
                                        <i className="fa-solid fa-check text-xs"></i>
                                    </button>
                                    {act.status !== 'completed' && (
                                        <button
                                            onClick={() => onStartActivity(act.activityId, act.activityId, act.title, act.difficultyLevel, act.goal)}
                                            className="w-8 h-8 rounded-xl bg-gradient-to-r from-[var(--accent-color)] to-purple-600 text-white flex items-center justify-center hover:shadow-lg hover:shadow-[var(--accent-color)]/30 transition-all active:scale-95"
                                            title="Çalışma Kâğıdı Üret ve Başlat"
                                        >
                                            <i className="fa-solid fa-wand-magic-sparkles text-[10px]"></i>
                                        </button>
                                    )}
                                    {isSaved && canEdit && onReplaceActivity && (
                                        <button
                                            onClick={() => onSetChangingDay?.(isChanging ? null : day.day)}
                                            className="w-8 h-8 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--accent-color)] flex items-center justify-center border border-[var(--border-color)] transition-all"
                                            title="Farklı Aktiviteyle Değiştir"
                                        >
                                            <i className="fa-solid fa-sliders text-[10px]"></i>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {isChanging && canEdit && (
                    <div className="p-3.5 bg-[var(--bg-secondary)] border border-[var(--accent-color)] rounded-2xl animate-in slide-in-from-top-2 duration-200">
                        <label className="text-[9px] font-black text-[var(--accent-color)] uppercase tracking-widest block mb-1.5 flex items-center gap-1.5">
                            <i className="fa-solid fa-shuffle"></i> Aktiviteyi Değiştir
                        </label>
                        <select
                            onChange={(e) => { if (e.target.value) onReplaceActivity?.(day.day, e.target.value); }}
                            defaultValue={day.activities[0]?.activityId || ""}
                            className="w-full px-3 py-2 text-xs font-bold bg-[var(--bg-inset)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-[var(--accent-color)]/30"
                        >
                            <option value="" disabled>-- Aktivite Seçin --</option>
                            {ACTIVITIES.map(a => (
                                <option key={a.id} value={a.id}>{a.title}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Day Observation Note (saved in day.notes, not overwriting day.focus!) */}
                <div className="pt-3 border-t border-dashed border-[var(--border-color)] print:hidden">
                    <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                        <i className="fa-solid fa-comment-dots text-[var(--accent-color)]"></i> Öğretmen Gözlem Notu
                    </label>
                    <textarea
                        className="w-full p-2.5 bg-[var(--bg-inset)] border border-[var(--border-color)] rounded-xl text-xs resize-none focus:border-[var(--accent-color)] outline-none transition-all placeholder:text-[var(--text-muted)] font-medium text-[var(--text-primary)]"
                        placeholder="Öğrencinin bugünkü performansı, dikkat düzeyi..."
                        rows={2}
                        defaultValue={day.notes || ''}
                        disabled={!canEdit}
                        onBlur={(e) => onSaveNote(day.day, e.target.value)}
                    ></textarea>
                </div>
            </div>
        </div>
    );
};
