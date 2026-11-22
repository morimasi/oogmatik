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
    onReplaceActivity
}) => {
    const isAllCompleted = day.activities.length > 0 && day.activities.every(a => a.status === 'completed');
    const isEditing = editingDay === day.day;
    const isChanging = changingActivityDay === day.day;

    const getDomainBadge = (domain?: string) => {
        switch (domain) {
            case 'math':
                return { label: 'Matematik & Mantık', icon: 'fa-calculator', color: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800' };
            case 'reading':
                return { label: 'Okuma & Dil', icon: 'fa-book-open', color: 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800' };
            case 'visual':
                return { label: 'Görsel & Mekansal', icon: 'fa-eye', color: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800' };
            case 'attention':
                return { label: 'Dikkat & Hafıza', icon: 'fa-brain', color: 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800' };
            default:
                return { label: 'Bilişsel Gelişim', icon: 'fa-shapes', color: 'bg-zinc-50 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700' };
        }
    };

    return (
        <div className={`group relative bg-white/90 dark:bg-zinc-800/90 backdrop-blur-xl rounded-[2rem] border-2 transition-all duration-300 hover:shadow-2xl ${
            isActiveDay
                ? 'ring-4 ring-indigo-500/25 border-indigo-500 shadow-xl'
                : 'border-zinc-200/70 dark:border-zinc-700/60'
        } ${isAllCompleted ? 'opacity-85' : ''} break-inside-avoid print:border-zinc-300 print:shadow-none`}>
            {isActiveDay && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/30 flex items-center gap-1.5 z-20">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                    ŞU ANKİ AŞAMA
                </div>
            )}

            {/* Header */}
            <div className={`p-5 rounded-t-[1.8rem] flex justify-between items-center ${
                isActiveDay
                    ? 'bg-gradient-to-r from-indigo-50/80 to-purple-50/80 dark:from-indigo-950/30 dark:to-purple-950/30'
                    : 'bg-zinc-50/70 dark:bg-zinc-900/40'
            } border-b border-zinc-100 dark:border-zinc-700/60`}>
                <div className="flex-1 min-w-0 pr-3">
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-lg bg-indigo-600 text-white text-[10px] font-black tracking-wider uppercase">
                            {day.day}. GÜN
                        </span>
                        {day.kazanimKod && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-mono text-[9px] font-bold border border-amber-200 dark:border-amber-800">
                                {day.kazanimKod}
                            </span>
                        )}
                        {isAllCompleted && (
                            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                                <i className="fa-solid fa-circle-check"></i>
                                <span className="text-[10px] uppercase font-black">Tamam</span>
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-2 group/focus">
                        {isEditing ? (
                            <div className="flex gap-1 items-center w-full">
                                <input
                                    type="text"
                                    value={tempFocus || ''}
                                    onChange={e => onTempFocusChange?.(e.target.value)}
                                    onBlur={() => onSaveDayFocus?.(day.day)}
                                    onKeyDown={e => { if (e.key === 'Enter') onSaveDayFocus?.(day.day); }}
                                    className="px-2.5 py-1 text-xs font-bold bg-white dark:bg-zinc-700 border-2 border-indigo-500 rounded-xl outline-none w-full shadow-inner"
                                    autoFocus
                                    placeholder="Günün odak konusu..."
                                />
                            </div>
                        ) : (
                            <div className="flex items-center justify-between w-full">
                                <p className="text-sm font-extrabold text-zinc-800 dark:text-zinc-100 line-clamp-1">
                                    {day.focus}
                                </p>
                                {isSaved && onEditDayFocus && (
                                    <button
                                        onClick={() => onEditDayFocus(day.day, day.focus)}
                                        className="opacity-0 group-hover/focus:opacity-100 text-zinc-400 hover:text-indigo-600 transition-all p-1"
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
                            ? 'bg-white dark:bg-zinc-700 text-indigo-600 border-indigo-200'
                            : 'bg-white dark:bg-zinc-700 text-zinc-400 border-zinc-200 dark:border-zinc-600'
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
                            className={`relative pl-4 border-l-4 rounded-r-2xl p-3 bg-zinc-50/60 dark:bg-zinc-900/30 transition-all ${
                                act.status === 'completed'
                                    ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10'
                                    : 'border-indigo-400 hover:border-indigo-600'
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
                                                ? 'text-rose-600 bg-rose-100/70 dark:bg-rose-950/40 dark:text-rose-400'
                                                : act.difficultyLevel === 'Orta'
                                                    ? 'text-amber-700 bg-amber-100/70 dark:bg-amber-950/40 dark:text-amber-400'
                                                    : 'text-emerald-700 bg-emerald-100/70 dark:bg-emerald-950/40 dark:text-emerald-400'
                                        }`}>
                                            {act.difficultyLevel}
                                        </span>
                                        <span className="text-[8px] bg-zinc-200/70 dark:bg-zinc-700 px-1.5 py-0.5 rounded text-zinc-600 dark:text-zinc-300 font-mono font-bold">
                                            {act.duration} dk
                                        </span>
                                    </div>
                                    <h5 className={`font-black text-sm leading-snug ${act.status === 'completed' ? 'line-through text-zinc-400 dark:text-zinc-500' : 'text-zinc-800 dark:text-zinc-100'}`}>
                                        {act.title}
                                    </h5>
                                    {act.kazanimKod && (
                                        <span className="text-[9px] text-amber-600 dark:text-amber-400 font-mono font-bold mt-0.5 block">
                                            Kazanım: {act.kazanimKod}
                                        </span>
                                    )}
                                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 italic line-clamp-2 leading-relaxed">
                                        {act.goal}
                                    </p>
                                </div>
                                <div className="flex flex-col gap-2 shrink-0">
                                    <button
                                        onClick={() => onToggleActivity(day.day, act.id)}
                                        className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${
                                            act.status === 'completed'
                                                ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20'
                                                : 'border-zinc-300 dark:border-zinc-600 hover:border-emerald-500 text-transparent hover:text-emerald-500 bg-white dark:bg-zinc-800'
                                        }`}
                                        title={act.status === 'completed' ? 'Tamamlandı olarak işaretlendi (tıklayarak geri al)' : 'Tamamlandı olarak işaretle'}
                                    >
                                        <i className="fa-solid fa-check text-xs"></i>
                                    </button>
                                    {act.status !== 'completed' && (
                                        <button
                                            onClick={() => onStartActivity(act.activityId, act.activityId, act.title, act.difficultyLevel, act.goal)}
                                            className="w-8 h-8 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-center hover:shadow-lg hover:shadow-indigo-500/30 transition-all active:scale-95"
                                            title="Çalışma Kâğıdı Üret ve Başlat"
                                        >
                                            <i className="fa-solid fa-wand-magic-sparkles text-[10px]"></i>
                                        </button>
                                    )}
                                    {isSaved && onReplaceActivity && (
                                        <button
                                            onClick={() => onSetChangingDay?.(isChanging ? null : day.day)}
                                            className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-700 text-zinc-500 hover:text-indigo-600 flex items-center justify-center border border-zinc-200 dark:border-zinc-600 transition-all"
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

                {isChanging && (
                    <div className="p-3.5 bg-indigo-50/70 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-2xl animate-in slide-in-from-top-2 duration-200">
                        <label className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block mb-1.5 flex items-center gap-1.5">
                            <i className="fa-solid fa-shuffle"></i> Aktiviteyi Değiştir
                        </label>
                        <select
                            onChange={(e) => { if (e.target.value) onReplaceActivity?.(day.day, e.target.value); }}
                            defaultValue={day.activities[0]?.activityId || ""}
                            className="w-full px-3 py-2 text-xs font-bold bg-white dark:bg-zinc-800 border border-indigo-300 dark:border-indigo-700 rounded-xl text-zinc-800 dark:text-zinc-200 outline-none focus:ring-2 focus:ring-indigo-500/30"
                        >
                            <option value="" disabled>-- Aktivite Seçin --</option>
                            {ACTIVITIES.map(a => (
                                <option key={a.id} value={a.id}>{a.title}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Day Observation Note (saved in day.notes, not overwriting day.focus!) */}
                <div className="pt-3 border-t border-dashed border-zinc-200 dark:border-zinc-700 print:hidden">
                    <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                        <i className="fa-solid fa-comment-dots text-indigo-500"></i> Öğretmen Gözlem Notu
                    </label>
                    <textarea
                        className="w-full p-2.5 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs resize-none focus:border-indigo-400 focus:bg-white dark:focus:bg-zinc-900 outline-none transition-all placeholder:text-zinc-400 font-medium text-zinc-700 dark:text-zinc-300"
                        placeholder="Öğrencinin bugünkü performansı, dikkat düzeyi..."
                        rows={2}
                        defaultValue={day.notes || ''}
                        onBlur={(e) => onSaveNote(day.day, e.target.value)}
                    ></textarea>
                </div>
            </div>
        </div>
    );
};
