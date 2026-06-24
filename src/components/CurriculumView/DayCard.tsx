import React from 'react';
import { CurriculumDay, Difficulty } from '../../types';
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

export const DayCard: React.FC<DayCardProps> = ({ day, isActiveDay, isSaved, onToggleActivity, onStartActivity, onSaveNote, editingDay, tempFocus, onEditDayFocus, onSaveDayFocus, onTempFocusChange, changingActivityDay, onSetChangingDay, onReplaceActivity }) => {
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
