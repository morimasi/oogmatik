import React, { useState, useEffect } from 'react';
import { Curriculum, CurriculumDay } from '../../../types';
import { EnrichedCurriculum, PlanRevision } from './studentDashboardData';
import { curriculumService } from '../../../services/curriculumService';
import { useToastStore } from '../../../store/useToastStore';
import { ACTIVITIES } from '../../../constants';
import { logError } from '../../../utils/logger';
import { toAppError } from '../../../utils/AppError';

interface AcademicPlanModuleProps {
  studentId: string;
  curriculums: Curriculum[];
  onRefresh?: () => void;
  onStartCurriculumActivity?: (...args: unknown[]) => void;
}

export const AcademicPlanModule: React.FC<AcademicPlanModuleProps> = ({
  studentId,
  curriculums,
  onRefresh,
  onStartCurriculumActivity,
}) => {
  const toast = useToastStore();
  const [localPlans, setLocalPlans] = useState<any[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [activePlanTab, setActivePlanTab] = useState<'overview' | 'schedule' | 'revisions'>(() => {
    const defaultTab = (window as any).academicPlanDefaultTab;
    if (defaultTab) {
      delete (window as any).academicPlanDefaultTab;
      return defaultTab;
    }
    return 'overview';
  });

  // Inline editing states
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [tempFocus, setTempFocus] = useState('');
  const [editingGoal, setEditingGoal] = useState<number | null>(null);
  const [tempGoal, setTempGoal] = useState('');
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [newGoalText, setNewGoalText] = useState('');
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [tempNote, setTempNote] = useState('');
  const [changingActivityDay, setChangingActivityDay] = useState<number | null>(null);

  const handleStartEditingGoal = (idx: number, goal: string) => {
    setEditingGoal(idx);
    setTempGoal(goal);
  };

  useEffect(() => {
    if (curriculums && curriculums.length > 0) {
      const enriched = curriculums.map(c => ({
        ...c,
        revisions: (c as any).revisions || [],
        lastReviewed: (c as any).lastReviewed || c.startDate || c.createdAt || new Date().toISOString(),
        nextReview: (c as any).nextReview || '',
        note: c.note || '',
        goals: c.goals || []
      }));
      setLocalPlans(enriched);
      if (!selectedPlanId) {
        setSelectedPlanId(enriched[0].id || null);
      }
    } else {
      setLocalPlans([]);
      setSelectedPlanId(null);
    }
  }, [curriculums]);

  const activePlan = localPlans.find(p => p.id === selectedPlanId) || localPlans[0];

  const activeProgress = activePlan
    ? Math.round((activePlan.schedule.filter((d: CurriculumDay) => d.isCompleted || d.activities?.every((a: any) => a.status === 'completed')).length / activePlan.schedule.length) * 100)
    : 0;

  const handlePrint = () => { window.print(); };

  const handleDownload = (plan: EnrichedCurriculum) => {
    const data = {
      id: plan.id,
      studentName: plan.studentName,
      startDate: plan.startDate,
      goals: plan.goals,
      schedule: plan.schedule,
      revisions: plan.revisions,
      note: plan.note,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const el = document.createElement('a');
    el.href = url;
    el.download = `plan_${plan.id || 'export'}.json`;
    el.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = () => {
    if (navigator.clipboard && activePlan) {
      navigator.clipboard.writeText(`Akademik Plan - ${activePlan.studentName} - ${new Date(activePlan.startDate).toLocaleDateString('tr-TR')}`);
      toast.success('Paylaşım linki panoya kopyalandı.');
    }
  };

  // Launch Activity inside Platform
  const handleLaunchActivity = (dayNum: number, activity: any) => {
    if (onStartCurriculumActivity && activePlan) {
      onStartCurriculumActivity(
        activePlan.id,
        dayNum,
        activity.id,
        activity.activityId,
        activePlan.studentName,
        activity.title,
        activity.difficultyLevel || 'Medium',
        activity.goal || '',
        activePlan.studentId || undefined
      );
      toast.success(`${activity.title} Aktivitesi Başlatılıyor...`);
    } else {
      toast.error('Aktivite başlatma işlevi bulunamadı. Lütfen daha sonra tekrar deneyin.');
    }
  };

  // Replace Activity on Day
  const handleReplaceActivity = async (dayNum: number, selectedActivityId: string) => {
    if (!activePlan?.id) return;

    const matchedActivity = ACTIVITIES.find(a => a.id === selectedActivityId);
    if (!matchedActivity) return;

    const updatedSchedule = activePlan.schedule.map((day: any) => {
      if (day.day === dayNum) {
        return {
          ...day,
          focus: `${matchedActivity.title} Çalışması`,
          activities: [
            {
              id: day.activities[0]?.id || Math.random().toString(36).substr(2, 9),
              activityId: matchedActivity.id,
              title: matchedActivity.title,
              duration: day.activities[0]?.duration || 15,
              status: 'pending',
              goal: matchedActivity.title + ' aktivitesi ile gelişim hedeflenmektedir.',
              difficultyLevel: day.activities[0]?.difficultyLevel || 'Medium'
            }
          ],
          isCompleted: false
        };
      }
      return day;
    });

    setLocalPlans(prev => prev.map(p => p.id === activePlan.id ? { ...p, schedule: updatedSchedule } : p));
    setChangingActivityDay(null);

    try {
      await curriculumService.updateCurriculum(activePlan.id, { schedule: updatedSchedule });
      toast.success(`Gün ${dayNum} aktivitesi "${matchedActivity.title}" olarak değiştirildi.`);
      if (onRefresh) onRefresh();
    } catch (e) {
      logError(toAppError(e), { context: 'AcademicPlanModule güncelleme işlemi' });
      toast.error('Kaydedilirken hata oluştu.');
    }
  };

  // Toggle Day Completion
  const handleToggleDay = async (dayNum: number) => {
    if (!activePlan?.id) return;

    const updatedSchedule = activePlan.schedule.map((day: any) => {
      if (day.day === dayNum) {
        const nextCompleted = !day.isCompleted;
        return {
          ...day,
          isCompleted: nextCompleted,
          activities: day.activities.map((act: any, idx: number) => {
            if (idx === 0) {
              return { ...act, status: nextCompleted ? 'completed' : 'pending' };
            }
            return act;
          })
        };
      }
      return day;
    });

    // Update local UI immediately
    setLocalPlans(prev => prev.map(p => p.id === activePlan.id ? { ...p, schedule: updatedSchedule } : p));

    try {
      // Auto-save to Firestore
      await curriculumService.updateCurriculum(activePlan.id, { schedule: updatedSchedule });
      toast.success(`Gün ${dayNum} tamamlanma durumu güncellendi.`);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Plan güncelleme hatası:', error);
      toast.error('Kaydedilirken hata oluştu.');
    }
  };

  // Edit Day Focus Inline
  const handleSaveDayFocus = async (dayNum: number) => {
    if (!activePlan?.id) return;

    const updatedSchedule = activePlan.schedule.map((day: any) => {
      if (day.day === dayNum) {
        return { ...day, focus: tempFocus };
      }
      return day;
    });

    setLocalPlans(prev => prev.map(p => p.id === activePlan.id ? { ...p, schedule: updatedSchedule } : p));
    setEditingDay(null);

    try {
      await curriculumService.updateCurriculum(activePlan.id, { schedule: updatedSchedule });
      toast.success(`Gün ${dayNum} içeriği kaydedildi.`);
      if (onRefresh) onRefresh();
    } catch (e) {
      console.error(e);
      toast.error('Güncellenirken hata oluştu.');
    }
  };

  // Edit general note inline
  const handleSaveNote = async () => {
    if (!activePlan?.id) return;

    setLocalPlans(prev => prev.map(p => p.id === activePlan.id ? { ...p, note: tempNote } : p));
    setIsEditingNote(false);

    try {
      await curriculumService.updateCurriculum(activePlan.id, { note: tempNote });
      toast.success('Not kaydedildi.');
      if (onRefresh) onRefresh();
    } catch (e) {
      console.error(e);
      toast.error('Kaydedilirken hata oluştu.');
    }
  };

  // Edit goal inline
  const handleSaveGoal = async (idx: number) => {
    if (!activePlan?.id) return;

    const updatedGoals = [...activePlan.goals];
    updatedGoals[idx] = tempGoal;

    setLocalPlans(prev => prev.map(p => p.id === activePlan.id ? { ...p, goals: updatedGoals } : p));
    setEditingGoal(null);

    try {
      await curriculumService.updateCurriculum(activePlan.id, { goals: updatedGoals });
      toast.success('Hedef kaydedildi.');
      if (onRefresh) onRefresh();
    } catch (e) {
      console.error(e);
      toast.error('Hedef güncellenemedi.');
    }
  };

  // Add new goal
  const handleAddGoal = async () => {
    if (!activePlan?.id || !newGoalText.trim()) return;

    const updatedGoals = [...(activePlan.goals || []), newGoalText.trim()];

    setLocalPlans(prev => prev.map(p => p.id === activePlan.id ? { ...p, goals: updatedGoals } : p));
    setNewGoalText('');
    setIsAddingGoal(false);

    try {
      await curriculumService.updateCurriculum(activePlan.id, { goals: updatedGoals });
      toast.success('Yeni hedef kaydedildi.');
      if (onRefresh) onRefresh();
    } catch (e) {
      console.error(e);
      toast.error('Hedef eklenemedi.');
    }
  };

  // Add activity directly as goal
  const handleAddActivityAsGoal = async (actId: string) => {
    if (!activePlan?.id) return;

    const act = ACTIVITIES.find(a => a.id === actId);
    if (!act) return;

    const goalText = `"${act.title}" eğitimi ile bilişsel becerilerin ve okuma akıcılığının desteklenmesi`;
    const updatedGoals = [...(activePlan.goals || []), goalText];

    setLocalPlans(prev => prev.map(p => p.id === activePlan.id ? { ...p, goals: updatedGoals } : p));
    setIsAddingGoal(false);

    try {
      await curriculumService.updateCurriculum(activePlan.id, { goals: updatedGoals });
      toast.success(`"${act.title}" aktivitesi hedeflere eklendi.`);
      if (onRefresh) onRefresh();
    } catch (e) {
      console.error(e);
      toast.error('Hedef eklenemedi.');
    }
  };

  // Delete goal
  const handleDeleteGoal = async (idx: number) => {
    if (!activePlan?.id) return;

    const updatedGoals = activePlan.goals.filter((_: any, i: number) => i !== idx);

    setLocalPlans(prev => prev.map(p => p.id === activePlan.id ? { ...p, goals: updatedGoals } : p));

    try {
      await curriculumService.updateCurriculum(activePlan.id, { goals: updatedGoals });
      toast.success('Hedef kaldırıldı.');
      if (onRefresh) onRefresh();
    } catch (e) {
      console.error(e);
      toast.error('Hedef silinemedi.');
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'in_progress': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'pending': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20';
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Tamamlandı';
      case 'in_progress': return 'Devam Ediyor';
      case 'pending': return 'Bekliyor';
      default: return status;
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300 font-lexend">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm tracking-tight text-[var(--text-primary)] uppercase">Öğrenci Eğitim Planı</h3>
          <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider mt-0.5">
            {localPlans.length} Toplam Plan • Her işlem otomatik kaydedilir
          </p>
        </div>
        <div className="flex gap-1.5">
          <button onClick={handlePrint} className="w-7 h-7 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent-color)] transition-all" title="Yazdır">
            <i className="fa-solid fa-print text-[9px]"></i>
          </button>
          <button onClick={() => activePlan && handleDownload(activePlan)} className="w-7 h-7 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent-color)] transition-all" title="İndir">
            <i className="fa-solid fa-download text-[9px]"></i>
          </button>
          <button onClick={handleShare} className="w-7 h-7 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent-color)] transition-all" title="Paylaş">
            <i className="fa-solid fa-share-nodes text-[9px]"></i>
          </button>
        </div>
      </div>

      {/* Active Plan Card */}
      {activePlan ? (
        <div className="bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-xl overflow-hidden shadow-sm">
          {/* Plan Header */}
          <div className="p-4 bg-gradient-to-r from-[var(--accent-color)]/5 to-transparent border-b border-[var(--border-color)]">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 bg-[var(--accent-color)] text-white rounded-lg flex items-center justify-center shadow-md shadow-[var(--accent-color)]/10">
                    <i className="fa-solid fa-map-location-dot text-sm animate-pulse"></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-[11px] text-[var(--text-primary)] uppercase">
                      {new Date(activePlan.startDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })} Dönemi
                    </h4>
                    <p className="text-[9px] text-[var(--text-muted)] font-medium uppercase tracking-wider">{activePlan.durationDays} Günlük Akış • {activePlan.goals?.length || 0} Hedef</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-[var(--accent-color)]">%{activeProgress}</span>
                <p className="text-[9px] text-[var(--text-muted)] font-medium uppercase">Tamamlandı</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-[var(--bg-secondary)] rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[var(--accent-color)] to-emerald-500 h-full rounded-full transition-all duration-700"
                style={{ width: `${activeProgress}%` }}
              ></div>
            </div>
          </div>

          {/* Plan Tabs */}
          <div className="flex border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/50">
            {(['overview', 'schedule', 'revisions'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActivePlanTab(tab)}
                className={`flex-1 py-2 text-[10px] font-semibold uppercase tracking-wider transition-all ${activePlanTab === tab ? 'bg-[var(--bg-paper)] text-[var(--accent-color)] border-b-2 border-[var(--accent-color)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
              >
                {tab === 'overview' ? 'Hedefler & Notlar' : tab === 'schedule' ? 'Takvim Akışı' : 'Revizyonlar'}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-4">
            {activePlanTab === 'overview' && (
              <div className="space-y-4">
                {/* Goals */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h5 className="font-bold text-[11px] text-[var(--text-primary)] uppercase flex items-center gap-1.5">
                      <i className="fa-solid fa-bullseye text-[var(--accent-color)] text-[10px]"></i> Bireysel Öğrenme Hedefleri
                    </h5>
                    {!isAddingGoal && (
                      <button
                        onClick={() => { setIsAddingGoal(true); setNewGoalText(''); }}
                        className="text-[10px] font-semibold text-[var(--accent-color)] uppercase flex items-center gap-1 hover:underline animate-bounce"
                      >
                        <i className="fa-solid fa-plus-circle"></i> Yeni Hedef Ekle
                      </button>
                    )}
                  </div>

                  {/* Add Goal Input Area with Activities select */}
                  {isAddingGoal && (
                    <div className="p-3 bg-[var(--bg-secondary)] rounded-2xl mb-3 border border-[var(--border-color)] space-y-2">
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          placeholder="Örn: Akıcı okuma becerisinin geliştirilmesi"
                          value={newGoalText}
                          onChange={e => setNewGoalText(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') handleAddGoal(); }}
                          className="flex-1 px-3 py-1.5 text-[11px] font-medium bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-lg outline-none focus:border-[var(--accent-color)]"
                          autoFocus
                        />
                        <button onClick={handleAddGoal} className="px-3 py-1.5 bg-[var(--accent-color)] hover:bg-[var(--accent-color)]/90 text-white text-[10px] font-semibold uppercase rounded-lg">Kaydet</button>
                        <button onClick={() => setIsAddingGoal(false)} className="px-2 py-1.5 bg-zinc-200 dark:bg-zinc-700 text-[var(--text-primary)] text-[10px] font-semibold uppercase rounded-lg">İptal</button>
                      </div>
                      
                      {/* Activities pool select */}
                      <div className="pt-2 border-t border-[var(--border-color)]">
                        <label className="text-[9px] font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-1.5">Aktivite Havuzundan Hedef Ekle</label>
                        <select
                          onChange={(e) => { if (e.target.value) handleAddActivityAsGoal(e.target.value); }}
                          defaultValue=""
                          className="w-full px-2.5 py-1.5 text-[10px] bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-lg text-[var(--text-secondary)] outline-none focus:border-[var(--accent-color)]"
                        >
                          <option value="">-- Tüm Sistemdeki Dijital İçerik Havuzu ({ACTIVITIES.length} Aktivite) --</option>
                          {ACTIVITIES.map(a => (
                            <option key={a.id} value={a.id}>{a.title}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Goals List */}
                  <div className="space-y-1.5">
                    {activePlan.goals && activePlan.goals.length > 0 ? (
                      activePlan.goals.map((g: string, i: number) => {
                        const completedDays = activePlan.schedule.filter((d: CurriculumDay) => d.isCompleted || d.activities?.every((a: any) => a.status === 'completed')).length;
                        const isAchieved = i < completedDays;
                        const isEditingThis = editingGoal === i;

                        return (
                          <div key={i} className="flex items-center justify-between p-2.5 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] hover:border-[var(--accent-color)]/20 transition-all group">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <i className={`fa-solid ${isAchieved ? 'fa-circle-check text-emerald-500' : 'fa-circle text-[var(--text-muted)]'} text-[11px] mt-0.5 shrink-0`}></i>
                              {isEditingThis ? (
                                <input
                                  type="text"
                                  value={tempGoal}
                                  onChange={e => setTempGoal(e.target.value)}
                                  onBlur={() => handleSaveGoal(i)}
                                  onKeyDown={e => { if (e.key === 'Enter') handleSaveGoal(i); }}
                                  className="flex-1 px-2 py-0.5 text-[11px] bg-[var(--bg-paper)] border border-[var(--accent-color)] rounded outline-none"
                                  autoFocus
                                />
                              ) : (
                                <span className="text-[11px] font-medium text-[var(--text-secondary)] truncate">{g}</span>
                              )}
                            </div>
                            {!isEditingThis && (
                              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0">
                                <button
                                  onClick={() => handleStartEditingGoal(i, g)}
                                  className="text-zinc-400 hover:text-[var(--accent-color)]"
                                >
                                  <i className="fa-solid fa-pen text-[10px]"></i>
                                </button>
                                <button
                                  onClick={() => handleDeleteGoal(i)}
                                  className="text-zinc-400 hover:text-rose-500"
                                >
                                  <i className="fa-solid fa-trash text-[10px]"></i>
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-[10px] text-[var(--text-muted)] text-center py-2">Hedef tanımlanmamış. Yeni hedef ekleyin.</p>
                    )}
                  </div>
                </div>

                {/* General Note */}
                <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl relative group">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-semibold text-amber-600 uppercase">Öğretmen Notu & Pedagojik Stratejiler</span>
                    {!isEditingNote ? (
                      <button
                        onClick={() => { setIsEditingNote(true); setTempNote(activePlan.note); }}
                        className="text-[9px] font-semibold text-amber-600 uppercase opacity-0 group-hover:opacity-100 transition-opacity hover:underline"
                      >
                        Notu Düzenle
                      </button>
                    ) : (
                      <div className="flex gap-1.5">
                        <button onClick={handleSaveNote} className="text-[9px] font-semibold text-emerald-600 uppercase">Kaydet</button>
                        <button onClick={() => setIsEditingNote(false)} className="text-[9px] font-semibold text-zinc-500 uppercase">İptal</button>
                      </div>
                    )}
                  </div>
                  {isEditingNote ? (
                    <textarea
                      value={tempNote}
                      onChange={e => setTempNote(e.target.value)}
                      className="w-full p-2 text-[11px] font-medium bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-lg outline-none focus:border-amber-500 h-16 resize-none mt-1"
                      autoFocus
                    />
                  ) : (
                    <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed italic mt-0.5 font-medium">
                      {activePlan.note ? `"${activePlan.note}"` : 'Eğitim planına özel not eklemek için düzenle butonuna basın.'}
                    </p>
                  )}
                </div>

                {/* Plan Metadata */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)]">
                    <span className="text-[9px] font-medium text-[var(--text-muted)] uppercase">Başlangıç Tarihi</span>
                    <p className="text-[11px] font-bold text-[var(--text-primary)] mt-1">
                      {new Date(activePlan.startDate).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                  <div className="p-3 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)]">
                    <span className="text-[9px] font-medium text-[var(--text-muted)] uppercase">Son İnceleme</span>
                    <p className="text-[11px] font-bold text-[var(--text-primary)] mt-1">
                      {new Date(activePlan.lastReviewed).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activePlanTab === 'schedule' && (
              <div className="space-y-2 max-h-[380px] overflow-y-auto custom-scrollbar pr-1">
                {activePlan.schedule.map((day: CurriculumDay, i: number) => {
                  const isEditingThis = editingDay === day.day;
                  const isChangingActivity = changingActivityDay === day.day;
                  const isDayDone = day.isCompleted || day.activities?.every((a: any) => a.status === 'completed');
                  return (
                    <div
                      key={i}
                      className="space-y-1.5"
                    >
                      <div
                        className={`flex items-center gap-3 p-2.5 rounded-2xl border transition-all duration-300 group/day ${
                          isDayDone
                            ? 'bg-emerald-500/5 border-emerald-500/10 shadow-sm'
                            : 'bg-[var(--bg-secondary)] border-[var(--border-color)] hover:border-[var(--accent-color)]/20'
                        }`}
                      >
                        {/* Left Toggle / Index Badge */}
                        <button
                          onClick={() => handleToggleDay(day.day)}
                          className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-300 shadow-sm ${
                            isDayDone
                              ? 'bg-emerald-500 text-white border-transparent'
                              : 'bg-[var(--bg-paper)] text-[var(--text-muted)] border-[var(--border-color)] hover:border-[var(--accent-color)] hover:text-[var(--accent-color)] hover:scale-105'
                          }`}
                          title={isDayDone ? "Yapılmadı olarak işaretle" : "Yapıldı olarak işaretle"}
                        >
                          {isDayDone ? (
                            <i className="fa-solid fa-check text-[10px]"></i>
                          ) : (
                            <span className="text-[10px] font-bold">{day.day}</span>
                          )}
                        </button>

                        {/* Middle Text / Inline Edit */}
                        <div className="flex-1 min-w-0">
                          {isEditingThis ? (
                            <div className="flex gap-1">
                              <input
                                type="text"
                                value={tempFocus}
                                onChange={e => setTempFocus(e.target.value)}
                                onBlur={() => handleSaveDayFocus(day.day)}
                                onKeyDown={e => { if (e.key === 'Enter') handleSaveDayFocus(day.day); }}
                                className="flex-1 px-2 py-0.5 text-[11px] bg-[var(--bg-paper)] border border-[var(--accent-color)] rounded outline-none"
                                autoFocus
                              />
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <p className="text-[11px] font-medium text-[var(--text-primary)]">{day.focus}</p>
                              <button
                                onClick={() => handleStartEditingGoal(i, day.focus)}
                                className="opacity-0 group-hover/day:opacity-100 text-zinc-400 hover:text-[var(--accent-color)] transition-all"
                              >
                                <i className="fa-solid fa-pen text-[9px]"></i>
                              </button>
                            </div>
                          )}
                          {day.activities[0] && (
                            <div 
                              onClick={() => handleLaunchActivity(day.day, day.activities[0])}
                              className="flex items-center gap-1 text-[9px] text-[var(--text-muted)] font-semibold uppercase mt-1 cursor-pointer hover:text-[var(--accent-color)] select-none transition-colors duration-200"
                              title="Tıkla ve Öğrenci İçin Aktiviteyi Başlat"
                            >
                              <i className="fa-solid fa-wand-magic-sparkles text-[9px] text-[var(--accent-color)] animate-pulse"></i>
                              <span className="underline tracking-tight">{day.activities[0].title}</span>
                              <span className="text-[9px] font-normal lowercase tracking-normal">({day.activities[0].duration}dk • tıkla başlat)</span>
                            </div>
                          )}
                        </div>

                        {/* Right Status Toggle & Action buttons */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => {
                              if (isChangingActivity) setChangingActivityDay(null);
                              else setChangingActivityDay(day.day);
                            }}
                            className="w-6 h-6 rounded-lg bg-[var(--bg-paper)] hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-zinc-400 hover:text-[var(--accent-color)] flex items-center justify-center border border-[var(--border-color)] transition-all"
                            title="Görevi/Aktiviteyi Değiştir"
                          >
                            <i className="fa-solid fa-sliders-up text-[10px]"></i>
                          </button>
                          
                          <button
                            onClick={() => handleToggleDay(day.day)}
                            className={`text-[9px] font-semibold uppercase px-2.5 py-1 rounded-lg border transition-all duration-300 hover:scale-105 shadow-sm ${statusColor(day.activities[0]?.status || 'pending')}`}
                          >
                            {statusLabel(day.activities[0]?.status || 'pending')}
                          </button>
                        </div>
                      </div>

                      {/* Change Activity dropdown panel */}
                      {isChangingActivity && (
                        <div className="p-2 bg-[var(--bg-paper)] border border-[var(--accent-color)]/30 rounded-xl mx-2 shadow-sm animate-in slide-in-from-top-2 duration-200">
                          <label className="text-[9px] font-semibold text-[var(--accent-color)] uppercase tracking-wider block mb-1.5">Görevi / Aktiviteyi Değiştir</label>
                          <select
                            onChange={(e) => { if (e.target.value) handleReplaceActivity(day.day, e.target.value); }}
                            defaultValue={day.activities[0]?.activityId || ""}
                            className="w-full px-2.5 py-1 text-[10px] bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-secondary)] outline-none focus:border-[var(--accent-color)]"
                          >
                            <option value="" disabled>-- Aktivite Seçin --</option>
                            {ACTIVITIES.map(a => (
                              <option key={a.id} value={a.id}>{a.title}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {activePlanTab === 'revisions' && (
              <div className="space-y-2">
                {activePlan.revisions.length > 0 ? (
                  activePlan.revisions.map((rev: PlanRevision) => (
                    <div key={rev.id} className="p-3 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-medium text-[var(--text-primary)]">{new Date(rev.date).toLocaleDateString('tr-TR')}</span>
                        <span className="text-[9px] text-[var(--text-muted)]">{rev.author}</span>
                      </div>
                      <p className="text-[10px] text-[var(--text-secondary)] mb-2">{rev.changeDescription}</p>
                      <div className="flex gap-2">
                        <span className="text-[9px] font-medium text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded line-through">{rev.previousValue}</span>
                        <i className="fa-solid fa-arrow-right text-[8px] text-[var(--text-muted)] self-center"></i>
                        <span className="text-[9px] font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">{rev.newValue}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-[var(--text-muted)] text-center py-4">Bu plana ait herhangi bir revizyon kaydı bulunmuyor.</p>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-8 bg-[var(--bg-secondary)] rounded-2xl text-center border border-[var(--border-color)]">
          <i className="fa-solid fa-map-location-dot text-3xl text-[var(--text-muted)] opacity-30 mb-3 block"></i>
          <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Henüz atanmış bir eğitim planı yok</p>
          <p className="text-[11px] text-[var(--text-muted)] mt-1">Bu öğrenci için ana menüden 'Plan & Müfredat' modülüne giderek yeni bir eğitim planı üretebilir ve atayabilirsiniz.</p>
        </div>
      )}

      {/* All Plans List */}
      {localPlans.length > 1 && (
        <div className="space-y-2">
          <h4 className="font-bold text-xs text-[var(--text-primary)] uppercase tracking-tight">Geçmiş Planlar</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {localPlans.map(plan => {
              const progress = Math.round((plan.schedule.filter((d: CurriculumDay) => d.isCompleted || d.activities?.every((a: any) => a.status === 'completed')).length / plan.schedule.length) * 100);
              const isCurrentActive = plan.id === selectedPlanId;
              return (
                <div
                  key={plan.id}
                  className={`bg-[var(--bg-paper)] border rounded-xl p-3 transition-all hover:border-[var(--accent-color)]/30 cursor-pointer ${isCurrentActive ? 'border-[var(--accent-color)]' : 'border-[var(--border-color)]'}`}
                  onClick={() => { setSelectedPlanId(plan.id); setActivePlanTab('overview'); }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-[var(--accent-muted)] text-[var(--accent-color)] rounded-lg flex items-center justify-center">
                        <i className="fa-solid fa-calendar-lines-pen text-[11px]"></i>
                      </div>
                      <div>
                        <h4 className="font-bold text-[11px] text-[var(--text-primary)] uppercase">
                          {new Date(plan.startDate).toLocaleDateString('tr-TR')} Dönemi
                        </h4>
                        <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider">{plan.goals?.length || 0} hedef • {plan.durationDays} gün</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[var(--accent-color)]">%{progress}</span>
                  </div>
                  <div className="w-full bg-[var(--bg-secondary)] rounded-full h-1 mt-1 overflow-hidden">
                    <div className="bg-gradient-to-r from-[var(--accent-color)] to-emerald-500 h-full rounded-full transition-all" style={{ width: `${progress}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
