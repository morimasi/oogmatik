import React, { useState } from 'react';
import { curriculumService } from '../../../services/curriculumService';
import { useToastStore } from '../../../store/useToastStore';
import { ACTIVITIES } from '../../../constants';

interface PlanEditModalProps {
  plan: Record<string, unknown>;
  onClose: () => void;
  onSaved: () => void;
}

export const PlanEditModal: React.FC<PlanEditModalProps> = ({ plan, onClose, onSaved }) => {
  const { success, error } = useToastStore();
  const [saving, setSaving] = useState(false);
  const planId = plan.id as string;

  const [studentName, setStudentName] = useState((plan.studentName as string) || '');
  const [grade, setGrade] = useState((plan.grade as string) || '');
  const [durationDays, setDurationDays] = useState((plan.durationDays as number) || 7);

  const [goals, setGoals] = useState<string[]>((plan.goals as string[]) || []);
  const [note, setNote] = useState((plan.note as string) || '');

  const [schedule, setSchedule] = useState<Record<string, unknown>[]>((plan.schedule as Record<string, unknown>[]) || []);

  const [editingGoalIdx, setEditingGoalIdx] = useState<number | null>(null);
  const [tempGoal, setTempGoal] = useState('');
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [newGoalText, setNewGoalText] = useState('');

  const [editingDayFocus, setEditingDayFocus] = useState<number | null>(null);
  const [tempFocus, setTempFocus] = useState('');

  const [changingDay, setChangingDay] = useState<number | null>(null);

  const handleSaveGoal = (idx: number) => {
    const updated = [...goals];
    updated[idx] = tempGoal;
    setGoals(updated);
    setEditingGoalIdx(null);
  };

  const handleAddGoal = () => {
    if (!newGoalText.trim()) return;
    setGoals([...goals, newGoalText.trim()]);
    setNewGoalText('');
    setIsAddingGoal(false);
  };

  const handleDeleteGoal = (idx: number) => {
    setGoals(goals.filter((_, i) => i !== idx));
  };

  const handleSaveDayFocus = (dayNum: number) => {
    setSchedule(schedule.map(d => d.day === dayNum ? { ...d, focus: tempFocus } : d));
    setEditingDayFocus(null);
  };

  const handleReplaceActivity = (dayNum: number, activityId: string) => {
    const act = ACTIVITIES.find(a => a.id === activityId);
    if (!act) return;
    setSchedule(schedule.map(d => {
      if (d.day === dayNum) {
        return {
          ...d,
          activities: [{
            ...((d.activities as Record<string, unknown>[])?.[0] || {}),
            activityId: act.id,
            title: act.title,
          }]
        };
      }
      return d;
    }));
    setChangingDay(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        studentName,
        grade,
        durationDays,
        goals,
        note,
        schedule,
      };
      await curriculumService.updateCurriculum(planId, payload);
      success('Plan güncellendi.');
      onSaved();
      onClose();
    } catch {
      error('Güncelleme başarısız.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4 animate-in zoom-in-95 duration-200">
      <div className="bg-[var(--bg-paper)] dark:bg-zinc-800 rounded-[2.5rem] shadow-2xl w-full max-w-3xl flex flex-col border border-[var(--border-color)] overflow-hidden max-h-[90vh]">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-6 flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-white font-black text-lg flex items-center gap-2">
              <i className="fa-solid fa-pen-to-square" /> Planı Düzenle
            </h3>
            <p className="text-indigo-200 text-[10px] font-bold mt-0.5">{studentName || 'Müfredat Planı'}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-white transition-all">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Temel Bilgiler */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">Öğrenci</label>
              <input type="text" value={studentName} onChange={e => setStudentName(e.target.value)} className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[11px] font-bold outline-none focus:ring-2 focus:ring-indigo-500/20" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">Sınıf</label>
              <input type="text" value={grade} onChange={e => setGrade(e.target.value)} className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[11px] font-bold outline-none focus:ring-2 focus:ring-indigo-500/20" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">Süre (Gün)</label>
              <input type="number" min={1} max={90} value={durationDays} onChange={e => setDurationDays(Number(e.target.value))} className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[11px] font-bold outline-none focus:ring-2 focus:ring-indigo-500/20" />
            </div>
          </div>

          {/* Hedefler */}
          <div className="bg-[var(--bg-secondary)] rounded-[2rem] border border-[var(--border-color)] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-[0.15em] flex items-center gap-2">
                <i className="fa-solid fa-bullseye text-indigo-500" /> Eğitim Hedefleri
              </h4>
              <button onClick={() => setIsAddingGoal(true)} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-[8px] font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-1">
                <i className="fa-solid fa-plus" /> Ekle
              </button>
            </div>
            <div className="space-y-1.5">
              {goals.map((goal, idx) => (
                <div key={idx} className="group flex items-start gap-2 p-2.5 bg-[var(--bg-paper)] rounded-xl border border-[var(--border-color)]">
                  {editingGoalIdx === idx ? (
                    <div className="flex-1 flex gap-1.5">
                      <input type="text" value={tempGoal} onChange={e => setTempGoal(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleSaveGoal(idx); }} className="flex-1 px-2 py-1 bg-[var(--bg-secondary)] border border-indigo-400 rounded-lg text-[10px] font-bold outline-none" autoFocus />
                      <button onClick={() => handleSaveGoal(idx)} className="px-2 py-1 bg-indigo-600 text-white rounded-lg text-[8px] font-black">Kaydet</button>
                      <button onClick={() => setEditingGoalIdx(null)} className="px-2 py-1 text-[8px] font-black text-zinc-400">İptal</button>
                    </div>
                  ) : (
                    <>
                      <i className="fa-solid fa-circle-dot text-[9px] text-indigo-500 mt-0.5 shrink-0" />
                      <span className="flex-1 text-[10px] font-bold text-[var(--text-primary)] leading-relaxed">{goal}</span>
                      <button onClick={() => { setEditingGoalIdx(idx); setTempGoal(goal); }} className="w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                        <i className="fa-solid fa-pen text-[8px]" />
                      </button>
                      <button onClick={() => handleDeleteGoal(idx)} className="w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                        <i className="fa-solid fa-trash-can text-[8px]" />
                      </button>
                    </>
                  )}
                </div>
              ))}
              {isAddingGoal && (
                <div className="flex gap-1.5 p-2.5 bg-[var(--bg-paper)] rounded-xl border border-dashed border-indigo-300">
                  <input type="text" value={newGoalText} onChange={e => setNewGoalText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleAddGoal(); }} placeholder="Yeni hedef..." className="flex-1 px-2 py-1 bg-[var(--bg-secondary)] border border-indigo-400 rounded-lg text-[10px] font-bold outline-none" autoFocus />
                  <button onClick={handleAddGoal} disabled={!newGoalText.trim()} className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-[8px] font-black disabled:opacity-50">Ekle</button>
                  <button onClick={() => setIsAddingGoal(false)} className="px-2 py-1 text-[8px] font-black text-zinc-400">İptal</button>
                </div>
              )}
            </div>
          </div>

          {/* Öğretmen Notu */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-[0.15em] flex items-center gap-2">
              <i className="fa-solid fa-note-sticky text-amber-500" /> Öğretmen Notu
            </h4>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl text-[11px] font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
              placeholder="Plan ile ilgili gözlem ve notlar..."
            />
          </div>

          {/* Günlük Program */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-[0.15em] flex items-center gap-2">
              <i className="fa-solid fa-calendar-days text-emerald-500" /> Günlük Program
            </h4>
            <div className="grid grid-cols-1 gap-3">
              {schedule.map((day: Record<string, unknown>) => {
                const dayNum = day.day as number;
                const focus = day.focus as string;
                const activities = (day.activities as Record<string, unknown>[]) || [];
                return (
                  <div key={dayNum} className="bg-[var(--bg-secondary)] rounded-[1.5rem] border border-[var(--border-color)] overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-b border-[var(--border-color)]">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-[9px] font-black">{dayNum}</span>
                        {editingDayFocus === dayNum ? (
                          <div className="flex gap-1">
                            <input type="text" value={tempFocus} onChange={e => setTempFocus(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleSaveDayFocus(dayNum); }} className="px-2 py-0.5 bg-white dark:bg-zinc-700 border border-indigo-400 rounded-lg text-[10px] font-bold outline-none w-32" autoFocus />
                            <button onClick={() => handleSaveDayFocus(dayNum)} className="px-2 py-0.5 bg-indigo-600 text-white rounded text-[7px] font-black">Kaydet</button>
                            <button onClick={() => setEditingDayFocus(null)} className="px-1 py-0.5 text-[7px] font-black text-zinc-400">İptal</button>
                          </div>
                        ) : (
                          <>
                            <span className="text-[10px] font-bold text-[var(--text-muted)]">{focus}</span>
                            <button onClick={() => { setEditingDayFocus(dayNum); setTempFocus(focus); }} className="text-zinc-400 hover:text-indigo-600 transition-colors">
                              <i className="fa-solid fa-pen text-[7px]" />
                            </button>
                          </>
                        )}
                      </div>
                      <button onClick={() => setChangingDay(changingDay === dayNum ? null : dayNum)} className="px-2 py-1 rounded-lg bg-[var(--bg-paper)] text-[var(--text-muted)] hover:text-indigo-600 text-[8px] font-black border border-[var(--border-color)] transition-all">
                        <i className="fa-solid fa-sliders-up mr-1" /> Aktivite
                      </button>
                    </div>
                    {changingDay === dayNum && (
                      <div className="px-4 py-2 border-b border-[var(--border-color)] bg-indigo-500/5">
                        <select
                          onChange={e => { if (e.target.value) handleReplaceActivity(dayNum, e.target.value); }}
                          defaultValue=""
                          className="w-full px-2 py-1.5 bg-[var(--bg-paper)] border border-indigo-300 rounded-lg text-[9px] font-bold outline-none"
                        >
                          <option value="" disabled>Aktivite Seçin</option>
                          {ACTIVITIES.map(a => (
                            <option key={a.id} value={a.id}>{a.title}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div className="px-4 py-2.5 space-y-1.5">
                      {activities.map((act: Record<string, unknown>, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-[10px]">
                          <i className="fa-solid fa-circle-check text-emerald-500 text-[8px]" />
                          <span className="font-bold text-[var(--text-primary)]">{act.title as string}</span>
                          <span className="text-[var(--text-muted)] text-[8px]">· {act.duration as number}dk</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[var(--border-color)] p-4 flex justify-between items-center bg-[var(--bg-secondary)] shrink-0">
          <button onClick={onClose} className="px-5 py-2.5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest hover:text-[var(--text-primary)] transition-colors">
            İptal
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.15em] shadow-lg shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <i className="fa-solid fa-spinner animate-spin" /> : <i className="fa-solid fa-floppy-disk" />}
            {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
          </button>
        </div>
      </div>
    </div>
  );
};
