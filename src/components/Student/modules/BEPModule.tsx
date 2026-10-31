import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AdvancedStudent, IEPGoal, IEPPlan } from '../../../types/student-advanced';
import {
  BepComplianceReport,
  completeSmartGoal,
  createSmartGoal,
  evaluateSmartGoal,
  validateBEPCompliance,
  withGoalProgress,
} from '../../../services/smartGoalGenerator';
import { buildCognitiveProfile, summarizeCognitiveProfile } from '../../../services/cognitiveProfileService';
import {
  AcademicReport,
  downloadReport,
  exportReportToHtml,
  generateAcademicReport,
} from '../../../services/academicReportService';

type BepTab = 'goals' | 'cognitive' | 'academic' | 'export';

interface BEPModuleProps {
  student: AdvancedStudent;
  onUpdate?: (updatedIep: IEPPlan) => void;
}

interface GoalDraft {
  title: string;
  category: IEPGoal['category'];
  priority: IEPGoal['priority'];
  baselineValue: number;
  targetValue: number;
}

const EMPTY_DRAFT: GoalDraft = {
  title: '',
  category: 'academic',
  priority: 'medium',
  baselineValue: 40,
  targetValue: 70,
};

const TABS: { id: BepTab; label: string; icon: string }[] = [
  { id: 'goals', label: 'SMART Hedefler', icon: 'fa-bullseye' },
  { id: 'cognitive', label: 'Bilişsel Göstergeler', icon: 'fa-brain' },
  { id: 'academic', label: 'Akademik Rapor', icon: 'fa-chart-line' },
  { id: 'export', label: 'Uyum & Dışa Aktar', icon: 'fa-file-export' },
];

const CATEGORY_LABELS: Record<IEPGoal['category'], string> = {
  academic: 'Akademik',
  behavioral: 'Davranışsal',
  social: 'Sosyal',
  motor: 'Motor',
  speech: 'Dil / Konuşma',
};

const PRIORITY_LABELS: Record<IEPGoal['priority'], string> = {
  high: 'Yüksek',
  medium: 'Orta',
  low: 'Düşük',
};

const STATUS_LABELS: Record<IEPGoal['status'], string> = {
  not_started: 'Başlanmadı',
  in_progress: 'Devam ediyor',
  achieved: 'Tamamlandı',
  deferred: 'Ertelendi',
  needs_revision: 'Revizyon gerekli',
};

const SEVERITY_STYLES: Record<'error' | 'warning', string> = {
  error: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-800',
  warning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800',
};

const ProgressBar: React.FC<{ value: number; tone?: string }> = ({ value, tone = 'bg-indigo-500' }) => (
  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
    <div
      className={`h-full rounded-full transition-all duration-500 ${tone}`}
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);

export const BEPModule: React.FC<BEPModuleProps> = ({ student, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<BepTab>('goals');
  const [goals, setGoals] = useState<IEPGoal[]>(student.iep?.goals ?? []);
  const [draft, setDraft] = useState<GoalDraft>(EMPTY_DRAFT);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const plan: IEPPlan = student.iep;

  useEffect(() => {
    setGoals(student.iep?.goals ?? []);
  }, [student.id, student.iep]);

  const persistGoals = useCallback(
    (nextGoals: IEPGoal[]) => {
      setGoals(nextGoals);
      if (onUpdate && plan) {
        onUpdate({ ...plan, goals: nextGoals, lastUpdated: new Date().toISOString() });
      }
    },
    [onUpdate, plan]
  );

  const compliance: BepComplianceReport = useMemo(
    () => validateBEPCompliance({ ...plan, goals }),
    [plan, goals]
  );

  const cognitive = useMemo(() => buildCognitiveProfile(student), [student]);
  const report: AcademicReport = useMemo(() => generateAcademicReport(student), [student]);

  const planSmartScore = useMemo(() => {
    if (goals.length === 0) return 0;
    const total = goals.reduce((sum, goal) => sum + evaluateSmartGoal(goal).score, 0);
    return Math.round(total / goals.length);
  }, [goals]);

  const handleAddGoal = useCallback(() => {
    if (draft.title.trim().length < 8) {
      setStatusMessage('Hedef başlığı en az 8 karakter olmalı.');
      return;
    }
    const nextGoal = createSmartGoal({
      title: draft.title,
      category: draft.category,
      priority: draft.priority,
      baselineValue: draft.baselineValue,
      targetValue: draft.targetValue,
    });
    persistGoals([...goals, nextGoal]);
    setDraft(EMPTY_DRAFT);
    setStatusMessage('Hedef eklendi ve SMART alanları otomatik dolduruldu.');
  }, [draft, goals, persistGoals]);

  const handleDeleteGoal = useCallback(
    (goalId: string) => {
      persistGoals(goals.filter((goal) => goal.id !== goalId));
      setStatusMessage('Hedef kaldırıldı.');
    },
    [goals, persistGoals]
  );

  const handleProgressChange = useCallback(
    (goalId: string, progress: number) => {
      persistGoals(goals.map((goal) => (goal.id === goalId ? withGoalProgress(goal, progress) : goal)));
    },
    [goals, persistGoals]
  );

  const handleCompleteSmartFields = useCallback(() => {
    persistGoals(goals.map(completeSmartGoal));
    setStatusMessage('Eksik SMART alanları pedagojik varsayılanlarla tamamlandı.');
  }, [goals, persistGoals]);

  const handleDownload = useCallback(
    (format: 'json' | 'html') => {
      const success = downloadReport(report, format);
      setStatusMessage(
        success
          ? `${format === 'json' ? 'JSON' : 'HTML'} raporu indirildi.`
          : 'İndirme bu ortamda desteklenmiyor.'
      );
    },
    [report]
  );

  const handlePrint = useCallback(() => {
    if (typeof window === 'undefined') return;
    const printWindow = window.open('', '_blank', 'width=900,height=1200');
    if (!printWindow) {
      setStatusMessage('Yazdırma penceresi açılamadı; lütfen tarayıcı izinlerini kontrol edin.');
      return;
    }
    printWindow.document.write(exportReportToHtml(report));
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    setStatusMessage('Yazdırma penceresi açıldı.');
  }, [report]);

  const studentRef = report.studentRef;

  return (
    <div className="space-y-6 font-['Lexend']">
      <header className="rounded-[2.5rem] border border-slate-200 bg-white/80 p-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/70">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300">
              <i className="fa-solid fa-clipboard-user" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-slate-100">
                BEP Paneli
              </h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {studentRef} &middot; Sınıf {student.grade || '-'} &middot; Tanı koyucu dil kullanılmaz
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-widest">
            <span className="rounded-xl border border-slate-200 px-3 py-2 text-slate-600 dark:border-slate-700 dark:text-slate-300">
              SMART {planSmartScore}/100
            </span>
            <span
              className={`rounded-xl border px-3 py-2 ${
                compliance.compliant
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300'
                  : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-300'
              }`}
            >
              {compliance.compliant ? 'Uyumlu' : `${compliance.issues.length} uyarı`}
            </span>
          </div>
        </div>
      </header>

      <nav className="no-scrollbar flex gap-2 overflow-x-auto">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex shrink-0 items-center gap-2 rounded-2xl border px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
                isActive
                  ? 'border-slate-900 bg-slate-900 text-white shadow-lg dark:border-white dark:bg-white dark:text-slate-900'
                  : 'border-slate-200 bg-white text-slate-500 hover:text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400'
              }`}
              aria-pressed={isActive}
            >
              <i className={`fa-solid ${tab.icon}`} aria-hidden="true" />
              {tab.label}
            </button>
          );
        })}
      </nav>

      {statusMessage && (
        <p
          role="status"
          className="rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-xs font-bold text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-300"
        >
          {statusMessage}
        </p>
      )}

      {activeTab === 'goals' && (
        <section className="space-y-4">
          <div className="rounded-[2.5rem] border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-slate-500">
              Yeni SMART Hedef
            </h3>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="md:col-span-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                Hedef başlığı
                <input
                  value={draft.title}
                  onChange={(event) => setDraft({ ...draft, title: event.target.value })}
                  placeholder="Örn. Dakikada okunan doğru kelime sayısını artırma"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </label>

              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Alan
                <select
                  value={draft.category}
                  onChange={(event) =>
                    setDraft({ ...draft, category: event.target.value as IEPGoal['category'] })
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                >
                  {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Öncelik
                <select
                  value={draft.priority}
                  onChange={(event) =>
                    setDraft({ ...draft, priority: event.target.value as IEPGoal['priority'] })
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                >
                  {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Başlangıç düzeyi ({draft.baselineValue})
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={draft.baselineValue}
                  onChange={(event) => setDraft({ ...draft, baselineValue: Number(event.target.value) })}
                  className="mt-2 w-full accent-indigo-600"
                />
              </label>

              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Hedef düzey ({draft.targetValue})
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={draft.targetValue}
                  onChange={(event) => setDraft({ ...draft, targetValue: Number(event.target.value) })}
                  className="mt-2 w-full accent-emerald-600"
                />
              </label>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleAddGoal}
                className="rounded-xl bg-indigo-600 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-indigo-700"
              >
                Hedef Ekle
              </button>
              <button
                type="button"
                onClick={handleCompleteSmartFields}
                disabled={goals.length === 0}
                className="rounded-xl border border-slate-200 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Eksik SMART Alanlarını Tamamla
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {goals.length === 0 && (
              <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-xs font-bold text-slate-400 dark:border-slate-700">
                Henüz hedef eklenmedi.
              </p>
            )}

            {goals.map((goal) => {
              const evaluation = evaluateSmartGoal(goal);
              return (
                <article
                  key={goal.id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-black text-slate-900 dark:text-slate-100">{goal.title}</h4>
                      <p className="mt-1 text-[11px] font-semibold text-slate-500">{goal.successCriteria}</p>
                      <div className="mt-2 flex flex-wrap gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400">
                        <span className="rounded-lg bg-slate-100 px-2 py-1 dark:bg-slate-800">
                          {CATEGORY_LABELS[goal.category]}
                        </span>
                        <span className="rounded-lg bg-slate-100 px-2 py-1 dark:bg-slate-800">
                          {PRIORITY_LABELS[goal.priority]}
                        </span>
                        <span className="rounded-lg bg-slate-100 px-2 py-1 dark:bg-slate-800">
                          {STATUS_LABELS[goal.status]}
                        </span>
                        <span
                          className={`rounded-lg px-2 py-1 ${
                            evaluation.score >= 80
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                          }`}
                        >
                          SMART {evaluation.score}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteGoal(goal.id)}
                      aria-label={`${goal.title} hedefini sil`}
                      className="self-start rounded-xl p-2 text-rose-500 transition hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                      <i className="fa-solid fa-trash" aria-hidden="true" />
                    </button>
                  </div>

                  <div className="mt-4">
                    <div className="mb-1 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <span>İlerleme</span>
                      <span>%{goal.progress}</span>
                    </div>
                    <ProgressBar value={goal.progress} />
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={goal.progress}
                      aria-label={`${goal.title} ilerleme oranı`}
                      onChange={(event) => handleProgressChange(goal.id, Number(event.target.value))}
                      className="mt-2 w-full accent-indigo-600"
                    />
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {activeTab === 'cognitive' && (
        <section className="rounded-[2.5rem] border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Bilişsel Göstergeler</h3>
          <p className="mt-2 text-[11px] font-semibold text-slate-500">{summarizeCognitiveProfile(cognitive)}</p>

          <div className="mt-5 space-y-4">
            {cognitive.indicators.map((indicator) => (
              <div key={indicator.key}>
                <div className="mb-1 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <span>{indicator.label}</span>
                  <span>%{indicator.value}</span>
                </div>
                <ProgressBar
                  value={indicator.value}
                  tone={indicator.value >= 70 ? 'bg-emerald-500' : indicator.value >= 50 ? 'bg-indigo-500' : 'bg-rose-500'}
                />
                <p className="mt-1 text-[10px] font-semibold text-slate-400">{indicator.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/20">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-300">
                Güçlü Alanlar
              </h4>
              <ul className="mt-2 space-y-1 text-[11px] font-semibold text-emerald-800 dark:text-emerald-200">
                {cognitive.strengths.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/20">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-300">
                Destek Planlanacak Alanlar
              </h4>
              <ul className="mt-2 space-y-1 text-[11px] font-semibold text-amber-800 dark:text-amber-200">
                {cognitive.areasForImprovement.length > 0 ? (
                  cognitive.areasForImprovement.map((item) => <li key={item}>{item}</li>)
                ) : (
                  <li>Belirgin bir destek alanı öne çıkmıyor.</li>
                )}
              </ul>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Önerilen Müdahaleler</h4>
            <ul className="mt-2 space-y-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
              {cognitive.recommendedInterventions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Veri doluluğu %{cognitive.dataCompleteness} &middot; Bu çıktı klinik değerlendirme veya tanı değildir.
          </p>
        </section>
      )}

      {activeTab === 'academic' && (
        <section className="rounded-[2.5rem] border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Akademik Rapor</h3>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{studentRef}</span>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Genel Ortalama', value: report.gpa },
              { label: 'Devam Oranı', value: `%${report.attendanceRate}` },
              { label: 'BEP İlerlemesi', value: `%${report.iepGoalsProgress}` },
              { label: 'SMART Puanı', value: report.smartScore },
            ].map((card) => (
              <div
                key={card.label}
                className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700"
              >
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{card.label}</p>
                <p className="mt-1 text-xl font-black text-slate-900 dark:text-slate-100">{card.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left text-[11px]">
              <thead>
                <tr className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                  <th className="py-2">Ders</th>
                  <th className="py-2">Ortalama</th>
                  <th className="py-2">Kayıt</th>
                  <th className="py-2">Eğilim</th>
                  <th className="py-2">Değerlendirme</th>
                </tr>
              </thead>
              <tbody className="font-semibold text-slate-600 dark:text-slate-300">
                {report.subjects.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-slate-400">
                      Not kaydı bulunmuyor.
                    </td>
                  </tr>
                )}
                {report.subjects.map((subject) => (
                  <tr key={subject.subject} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="py-2 font-black text-slate-800 dark:text-slate-100">{subject.subject}</td>
                    <td className="py-2">{subject.average}</td>
                    <td className="py-2">{subject.entryCount}</td>
                    <td className="py-2">
                      {subject.trend === 'up' ? 'Yükseliyor' : subject.trend === 'down' ? 'Düşüyor' : 'Sabit'}
                    </td>
                    <td className="py-2">{subject.comment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {report.recommendations.length > 0 && (
            <div className="mt-4 rounded-2xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-800 dark:bg-indigo-950/20">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-700 dark:text-indigo-300">
                Öneriler
              </h4>
              <ul className="mt-2 space-y-1 text-[11px] font-semibold text-indigo-800 dark:text-indigo-200">
                {report.recommendations.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {activeTab === 'export' && (
        <section className="space-y-4">
          <div className="rounded-[2.5rem] border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">
              Mevzuat ve Dil Uyumu
            </h3>
            <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-widest">
              <span className="rounded-xl border border-slate-200 px-3 py-2 text-slate-600 dark:border-slate-700 dark:text-slate-300">
                Uyum Puanı {compliance.score}/100
              </span>
              <span className="rounded-xl border border-slate-200 px-3 py-2 text-slate-600 dark:border-slate-700 dark:text-slate-300">
                {compliance.issues.length} bulgu
              </span>
            </div>

            <ul className="mt-4 space-y-2">
              {compliance.issues.length === 0 && (
                <li className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[11px] font-bold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300">
                  Plan mevzuat ve dil kurallarına uygun görünüyor.
                </li>
              )}
              {compliance.issues.map((issue) => (
                <li
                  key={`${issue.code}-${issue.message}`}
                  className={`rounded-xl border px-4 py-3 text-[11px] font-bold ${SEVERITY_STYLES[issue.severity]}`}
                >
                  {issue.message}
                </li>
              ))}
            </ul>

            {compliance.recommendations.length > 0 && (
              <ul className="mt-4 list-disc space-y-1 pl-5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                {compliance.recommendations.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-[2.5rem] border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Raporu Dışa Aktar</h3>
            <p className="mt-2 text-[11px] font-semibold text-slate-500">
              Rapor anonim referansla üretilir: {report.kvkk.excludedFields.join(', ')} alanları dışa aktarılmaz.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleDownload('json')}
                className="rounded-xl bg-indigo-600 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-indigo-700"
              >
                JSON İndir
              </button>
              <button
                type="button"
                onClick={() => handleDownload('html')}
                className="rounded-xl bg-emerald-600 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-emerald-700"
              >
                HTML İndir
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="rounded-xl border border-slate-200 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Yazdır / PDF
              </button>
            </div>
            <ul className="mt-4 list-disc space-y-1 pl-5 text-[10px] font-semibold text-slate-400">
              {report.kvkk.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
};

export default BEPModule;
