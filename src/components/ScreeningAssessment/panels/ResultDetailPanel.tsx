import React, { useEffect, useState } from 'react';
import { useScreeningAssessment } from '../hooks/useScreeningAssessment';
import { CategoryScoreCard } from '../components/shared/CategoryScoreCard';
import { RiskBadge } from '../components/shared/RiskBadge';
import { ReportActions } from '../components/shared/ReportActions';
import { RadarChart } from '../../RadarChart';
import { CATEGORY_LABELS } from '../../../data/screeningQuestions';
import { assessmentEngineService, RecommendedActivityItem } from '../services/assessmentEngineService';
import { screeningDataService } from '../services/screeningDataService';
import { generateWithSchema, MODEL_PRO_REASONING } from '../../../services/geminiClient';
import type { AIAnalysisResult } from '../services/assessmentEngineService';
import type { EvaluationCategory } from '../../../types/screening';
import { ShareModal } from '../../ShareModal';
import { BrandedLoadingAnimation } from '../../shared/BrandedLoadingAnimation';
import {
  buildProfessionalAssessmentPrompt,
  buildProfessionalAssessmentReport,
  buildStudentProfileContext,
} from '../services/professionalAssessmentService';
import { logError } from '../../../utils/logger';
import { useStudentStore } from '../../../store/useStudentStore';
import { useToastStore } from '../../../store/useToastStore';
import { useAuthStore } from '../../../store/useAuthStore';
import { UserCheck, BookOpen, Layers, Sparkles, HeartHandshake, Stethoscope } from 'lucide-react';

interface ResultDetailPanelProps {
  onGeneratePlan?: (studentName: string, age: number, weaknesses: string[], diagnosisContext?: string) => void;
  onSelectActivity?: (activityId: string) => void;
  onOpenStudio?: (studioId: string) => void;
  userRole?: 'teacher' | 'admin' | 'parent';
  onCloseModal?: () => void;
}

export const ResultDetailPanel: React.FC<ResultDetailPanelProps> = ({
  onGeneratePlan,
  onSelectActivity,
  onOpenStudio,
  userRole = 'teacher',
  onCloseModal,
}) => {
  const {
    currentScreening,
    setCurrentScreening,
    screeningData,
    setScreeningData,
    setActiveView,
    handleSaveScreening,
    handleDownloadReport,
    handlePrintReport,
    handleShareResults,
    handleShareScreeningResult,
    isSaving,
    getScoreColor,
  } = useScreeningAssessment();

  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiError, setAiError] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSynced, setIsSynced] = useState(false);
  const [viewMode, setViewMode] = useState<'specialist' | 'parent'>(userRole === 'parent' ? 'parent' : 'specialist');
  const [professionalReport, setProfessionalReport] = useState<ReturnType<typeof buildProfessionalAssessmentReport> | null>(null);

  const { students, updateStudent, addStudent } = useStudentStore();
  const toast = useToastStore();

  useEffect(() => {
    if (!currentScreening) return;
    generateAiAdvice();
  }, [currentScreening?.id]);

  const generateAiAdvice = async () => {
    if (!currentScreening) return;

    if (currentScreening.aiAdvice && currentScreening.professionalReportData) {
      setAiAnalysis(currentScreening.aiAdvice);
      setProfessionalReport(currentScreening.professionalReportData);
      setLoadingAi(false);
      setAiError(false);
      return;
    }

    setLoadingAi(true);
    setAiError(false);

    const studentContext = {
      studentName: currentScreening.studentName,
      age: currentScreening.age,
      grade: currentScreening.grade,
      strengths: currentScreening.strengths ?? [],
      concerns: Object.entries(currentScreening.categoryScores || {})
        .filter(([, value]) => value?.riskLevel === 'high' || value?.riskLevel === 'moderate')
        .map(([key]) => key),
      supportContext: 'sessiz ve yapılandırılmış çalışma alanı, kısa ve tekrarlı oturumlar',
    };

    const fallbackProfReport = buildProfessionalAssessmentReport(currentScreening, studentContext);
    const fallbackLetter = `${currentScreening.studentName} öğrencimize ait bilişsel gelişim envanteri tamamlanmıştır. Çocuğumuzun bireysel güçlü yönleri temel alınarak gelişim alanlarına yönelik destek stratejileri hazırlanmıştır.`;
    const fallbackAdvice: AIAnalysisResult = {
      letter: fallbackLetter,
      actionSteps: fallbackProfReport.recommendations,
    };

    try {
      let finalAiAnalysis: AIAnalysisResult = currentScreening.aiAdvice || fallbackAdvice;
      let finalProfReport = currentScreening.professionalReportData || fallbackProfReport;

      // Primary AI Generation
      try {
        const prompt = assessmentEngineService.buildAnalysisPrompt(currentScreening);
        const schema = assessmentEngineService.getAIAnalysisSchema();
        const response = (await generateWithSchema(prompt, schema, { model: MODEL_PRO_REASONING, taskType: 'pro' })) as unknown as AIAnalysisResult;

        if (response && response.letter) {
          finalAiAnalysis = {
            letter: typeof response.letter === 'string' ? response.letter : String(response.letter),
            actionSteps: assessmentEngineService.normalizeActionSteps(response.actionSteps),
            pedagogicalNote: response.pedagogicalNote,
          };
        }
      } catch (err) {
        logError('[ResultDetailPanel] Primary AI Generation Fallback Used', { error: String(err) });
      }

      // Professional AI Generation
      try {
        const professionalPrompt = buildProfessionalAssessmentPrompt(currentScreening, studentContext);
        if (typeof professionalPrompt === 'string' && professionalPrompt.length > 0) {
          const aiProResult = (await generateWithSchema(professionalPrompt, {
            type: 'OBJECT',
            properties: {
              summary: { type: 'STRING' },
              recommendations: { type: 'ARRAY', items: { type: 'STRING' } },
              cautions: { type: 'ARRAY', items: { type: 'STRING' } },
              strengths: { type: 'ARRAY', items: { type: 'STRING' } },
              bePGoals: { type: 'ARRAY', items: { type: 'STRING' } },
            },
            required: ['summary', 'recommendations', 'cautions', 'strengths', 'bePGoals'],
          })) as {
            summary?: string;
            recommendations?: string[];
            cautions?: string[];
            strengths?: string[];
            bePGoals?: string[];
          };

          if (aiProResult && Array.isArray(aiProResult.bePGoals) && aiProResult.bePGoals.length > 0) {
            finalProfReport = {
              summary: aiProResult.summary || fallbackProfReport.summary,
              recommendations: aiProResult.recommendations || fallbackProfReport.recommendations,
              cautions: aiProResult.cautions || fallbackProfReport.cautions,
              strengths: aiProResult.strengths || fallbackProfReport.strengths,
              bePGoals: aiProResult.bePGoals || fallbackProfReport.bePGoals,
            };
          }
        }
      } catch (err) {
        logError('[ResultDetailPanel] Professional AI Generation Fallback Used', { error: String(err) });
      }

      setAiAnalysis(finalAiAnalysis);
      setProfessionalReport(finalProfReport);

      const updates = {
        aiAnalysis: finalAiAnalysis.letter,
        aiAdvice: finalAiAnalysis,
        professionalReportData: finalProfReport,
      };
      await screeningDataService.updateScreeningInFirestore(currentScreening.id, updates);

      const updatedScreening = {
        ...currentScreening,
        ...updates,
      };

      setCurrentScreening(updatedScreening);
      setScreeningData(
        screeningData.map((s) => (s.id === currentScreening.id ? updatedScreening : s))
      );
    } catch (e) {
      logError('[ResultDetailPanel] Critical AI Advice Exception', { error: String(e) });
      setAiAnalysis(fallbackAdvice);
      setProfessionalReport(fallbackProfReport);
    } finally {
      setLoadingAi(false);
    }
  };

  const handleSyncStudentProfile = async () => {
    if (!currentScreening) return;
    try {
      const existing = students.find(
        (s: any) =>
          (currentScreening.studentId && s.id === currentScreening.studentId) ||
          s.name?.trim().toLowerCase() === currentScreening.studentName?.trim().toLowerCase()
      );

      const weaknesses = currentScreening.weaknesses || [];
      const strengths = currentScreening.strengths || [];
      const bepGoals = professionalReport?.bePGoals || [];
      const teacherId = useAuthStore.getState().user?.id || 'teacher-default';
      const bepSummary = bepGoals.length > 0 ? `BEP Hedefleri:\n${bepGoals.map((g) => `- ${g}`).join('\n')}` : '';
      const notes = existing?.notes ? `${existing.notes}\n\n${bepSummary}` : bepSummary;

      if (existing) {
        await updateStudent(existing.id, {
          strengths: Array.from(new Set([...(existing.strengths || []), ...strengths])),
          weaknesses: Array.from(new Set([...(existing.weaknesses || []), ...weaknesses])),
          notes: notes.trim() || undefined,
        });
        toast.success(`${currentScreening.studentName} profil kartı ve BEP hedefleri güncellendi.`);
      } else {
        await addStudent(teacherId, {
          name: currentScreening.studentName,
          age: currentScreening.age || 7,
          grade: currentScreening.grade || '1. Sınıf',
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(currentScreening.studentName)}`,
          diagnosis: [],
          interests: [],
          strengths,
          weaknesses,
          learningStyle: 'Karma',
          notes: bepSummary || undefined,
          createdAt: new Date().toISOString(),
        });
        toast.success(`${currentScreening.studentName} yeni öğrenci olarak kaydedildi ve BEP hedefleri işlendi.`);
      }
      setIsSynced(true);
    } catch (e) {
      logError('Öğrenci senkronizasyonu hatası', { error: String(e) });
      toast.error('Öğrenci profili güncellenirken hata oluştu.');
    }
  };

  if (!currentScreening) {
    return (
      <div className="flex items-center justify-center h-48 text-[var(--text-muted)] text-sm font-medium">
        Sonuç bulunamadı.
      </div>
    );
  }

  const chartData = (Object.keys(currentScreening?.categoryScores || {}) as EvaluationCategory[]).map(
    (key) => ({
      label: CATEGORY_LABELS[key] || key,
      value: currentScreening.categoryScores?.[key]?.score ?? 0,
    })
  );

  const recommendedActivities: RecommendedActivityItem[] = assessmentEngineService.getRecommendedActivities(currentScreening);

  const handleSave = () => {
    handleSaveScreening();
    setIsSaved(true);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Sticky Top Header */}
      <div className="bg-[var(--bg-paper)] p-4 rounded-2xl border border-[var(--border-color)] flex items-center justify-between sticky top-0 z-10 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <RiskBadge level={currentScreening.riskLevel} size="sm" />
              <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                {new Date(currentScreening.generatedAt || currentScreening.date).toLocaleDateString('tr-TR')}
              </span>
            </div>
            <h2 className="text-base font-black text-[var(--text-primary)]">
              {currentScreening.studentName}
            </h2>
          </div>
        </div>

        {/* View Mode Switcher (Specialist / Parent) */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex bg-[var(--bg-secondary)] p-1 rounded-xl border border-[var(--border-color)]">
            <button
              onClick={() => setViewMode('specialist')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'specialist'
                  ? 'bg-[var(--bg-paper)] text-[var(--accent-color)] shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              Uzman & BEP
            </button>
            <button
              onClick={() => setViewMode('parent')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'parent'
                  ? 'bg-[var(--bg-paper)] text-[var(--accent-color)] shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              Veli Görünümü
            </button>
          </div>

          <span className={`text-lg font-black italic ${getScoreColor(currentScreening.overallScore)} mr-2`}>
            %{currentScreening.overallScore}
          </span>

          <ReportActions
            showBack
            onBack={() => setActiveView('history')}
            onSave={handleSave}
            onDownload={() => handleDownloadReport(currentScreening)}
            onPrint={handlePrintReport}
            onShare={() => setIsSharing(true)}
            isSaving={isSaving}
            isSaved={isSaved}
          />
        </div>
      </div>

      {/* Specialist View: Radar Chart + Category Cards */}
      {viewMode === 'specialist' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-[var(--bg-paper)] p-6 rounded-2xl border border-[var(--border-color)] flex flex-col items-center justify-center min-h-[320px]">
            <h4 className="font-bold text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-4">
              Bilişsel Risk & Gelişim Haritası
            </h4>
            <div className="w-[280px] h-[280px]">
              <RadarChart data={chartData} />
            </div>
          </div>

          <div className="space-y-2.5">
            {(Object.keys(currentScreening?.categoryScores || {}) as EvaluationCategory[]).map(
              (cat, i) => {
                const data = currentScreening.categoryScores[cat];
                if (!data) return null;
                return (
                  <CategoryScoreCard
                    key={cat}
                    category={cat}
                    score={data.score}
                    riskLabel={data.riskLabel}
                    findings={data.findings}
                    index={i}
                  />
                );
              }
            )}
          </div>
        </div>
      )}

      {/* AI Professional Analysis Card */}
      <div className="bg-[var(--surface-glass)] p-6 rounded-2xl border border-[var(--border-color)] relative overflow-hidden backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-black text-[var(--accent-color)] flex items-center gap-2 uppercase tracking-tight italic">
            <Sparkles className="w-4 h-4 text-[var(--accent-color)]" />
            {viewMode === 'specialist' ? 'Pedagojik Durum Özeti & AI Uzman Raporu' : 'Aile Bilgilendirme ve Destek Rehberi'}
          </h3>

          {/* Sync to Student Profile Button */}
          <button
            onClick={handleSyncStudentProfile}
            disabled={isSynced}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
              isSynced
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                : 'bg-[var(--bg-paper)] text-[var(--text-primary)] hover:border-[var(--accent-color)] border-[var(--border-color)]'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            {isSynced ? 'Öğrenciye Eşlendi' : 'Öğrenci Kartına Senkronize Et'}
          </button>
        </div>

        {professionalReport && viewMode === 'specialist' && (
          <div className="mb-5 space-y-3 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-paper)]/70 p-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-color)]">Öğrenci Profili</p>
              <p className="mt-2 text-sm text-[var(--text-primary)] leading-relaxed">{buildStudentProfileContext({
                studentName: currentScreening.studentName,
                age: currentScreening.age,
                grade: currentScreening.grade,
                strengths: professionalReport.strengths,
                concerns: Object.entries(currentScreening.categoryScores || {})
                  .filter(([, value]) => value?.riskLevel === 'high' || value?.riskLevel === 'moderate')
                  .map(([key]) => key),
                supportContext: 'sessiz çalışma alanı, kısa ve odaklı oturumlar',
              })}</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-emerald-200/60 dark:border-emerald-800/40 bg-emerald-50/70 dark:bg-emerald-950/30 p-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-300">Güçlü Yönler</p>
                <ul className="mt-2 space-y-1 text-sm text-emerald-900 dark:text-emerald-200">
                  {(professionalReport.strengths.length > 0 ? professionalReport.strengths : ['Genel katılım ve öğrenme isteği yüksek.']).map((item, index) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-amber-200/60 dark:border-amber-800/40 bg-amber-50/70 dark:bg-amber-950/30 p-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-300">Desteklenecek Gelişim Alanları</p>
                <ul className="mt-2 space-y-1 text-sm text-amber-900 dark:text-amber-200">
                  {(professionalReport.cautions.length > 0 ? professionalReport.cautions : ['Temel alanlarda yaşa uygun gelişim devam etmektedir.']).map((item, index) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-indigo-200/60 dark:border-indigo-800/40 bg-indigo-50/70 dark:bg-indigo-950/30 p-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-700 dark:text-indigo-300">Öneriler</p>
                <ul className="mt-2 space-y-1 text-sm text-indigo-900 dark:text-indigo-200">
                  {professionalReport.recommendations.map((item, index) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-fuchsia-200/60 dark:border-fuchsia-800/40 bg-fuchsia-50/70 dark:bg-fuchsia-950/30 p-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-fuchsia-700 dark:text-fuchsia-300">MEB BEP Hedefleri (SMART)</p>
                <ul className="mt-2 space-y-1 text-sm text-fuchsia-900 dark:text-fuchsia-200">
                  {professionalReport.bePGoals.map((item, index) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {loadingAi ? (
          <BrandedLoadingAnimation
            size="small"
            title="Bilişsel Veriler Analiz Ediliyor"
            messages={[
              'AI pedagojik analiz yapıyor...',
              'Bilişsel profil haritası çıkarılıyor...',
              'Gelişim tavsiyeleri yapılandırılıyor...',
            ]}
          />
        ) : aiError ? (
          <div className="text-center py-6">
            <p className="text-rose-500 text-xs font-bold mb-3">Analiz oluşturulamadı.</p>
            <button
              onClick={generateAiAdvice}
              className="px-4 py-2 bg-[var(--accent-color)] text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all active:scale-95"
            >
              Tekrar Dene
            </button>
          </div>
        ) : aiAnalysis ? (
          <div className="space-y-4 relative z-10">
            <div className="text-sm text-[var(--text-primary)] leading-relaxed bg-[var(--bg-paper)]/70 p-4 rounded-xl border border-[var(--border-color)]">
              {aiAnalysis.letter}
            </div>
            {aiAnalysis.actionSteps.length > 0 && (
              <>
                <h4 className="font-black text-[10px] text-[var(--accent-color)] uppercase tracking-widest">
                  {viewMode === 'parent' ? 'Evde Uygulanabilecek Pratik Adımlar' : 'Pedagojik Eylem Planı'}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {aiAnalysis.actionSteps.map((step, i) => (
                    <div
                      key={i}
                      className="bg-[var(--bg-paper)] p-3 rounded-xl border border-[var(--border-color)] flex gap-2.5 shadow-sm"
                    >
                      <div className="w-5 h-5 bg-[var(--accent-color)] text-white rounded-full flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <p className="text-[11px] font-bold text-[var(--text-primary)] leading-snug">
                        {assessmentEngineService.renderActionStep(step)}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : null}
      </div>

      {/* Recommended Activities Grid (Activity Studio Bridge) */}
      {recommendedActivities.length > 0 && (
        <div className="bg-[var(--bg-paper)] p-6 rounded-2xl border border-[var(--border-color)] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight italic flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[var(--accent-color)]" />
                Önerilen Çalışma Kâğıtları & Etkinlikler
              </h3>
              <p className="text-[10px] text-[var(--text-muted)] font-medium mt-0.5">
                Öğrencinin tarama sonuçlarına göre doğrudan ilgili jeneratörleri başlatın
              </p>
            </div>
            {onOpenStudio && (
              <button
                onClick={() => {
                  onOpenStudio('fascicle-studio');
                  onCloseModal?.();
                }}
                className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                <Layers className="w-3.5 h-3.5" />
                Bilişsel Destek Fasikülü Başlat
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recommendedActivities.map((act) => (
              <div
                key={act.activityId}
                className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] hover:border-[var(--accent-color)]/50 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-md bg-[var(--accent-color)]/10 text-[var(--accent-color)]">
                      {act.targetSkill}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-[var(--text-primary)] group-hover:text-[var(--accent-color)] transition-colors">
                    {act.title}
                  </h4>
                  <p className="text-[10px] text-[var(--text-secondary)] mt-1 line-clamp-2 leading-relaxed">
                    {act.description}
                  </p>
                </div>

                <button
                  onClick={() => {
                    if (onSelectActivity) {
                      onSelectActivity(act.activityId);
                      onCloseModal?.();
                    }
                  }}
                  className="mt-3 w-full py-2 bg-[var(--surface-elevated)] hover:bg-[var(--accent-color)] hover:text-white text-[var(--text-primary)] border border-[var(--border-color)] text-[10px] font-black uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Sparkles className="w-3 h-3" />
                  Bu Alıştırmayı Üret
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Curriculum Plan Action (Curriculum Studio Bridge) */}
      {onGeneratePlan && (
        <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 p-6 rounded-2xl border border-indigo-200/50 dark:border-indigo-800/30 text-center">
          <h3 className="text-base font-black text-[var(--text-primary)] mb-2 uppercase tracking-tight italic">
            <i className="fa-solid fa-wand-magic-sparkles text-indigo-500 mr-2"></i>
            Bu Analizden Bireyselleştirilmiş Eğitim Planı Oluştur
          </h3>
          <p className="text-xs text-[var(--text-muted)] mb-4 max-w-lg mx-auto">
            AI, tarama sonuçlarına göre öğrenciye özel haftalık çalışma takvimi, somut BEP hedefleri ve ölçme metrikleri içeren kişiselleştirilmiş bir müfredat planı hazırlayacak.
          </p>
          <button
            onClick={() => {
              const weaknesses: string[] = [];
              const diagnosisDetails: string[] = [];
              Object.entries(currentScreening.categoryScores || {}).forEach(([key, val]: [string, any]) => {
                if (val?.riskLevel === 'high' || val?.riskLevel === 'moderate') {
                  weaknesses.push(key);
                  if (val.findings && val.findings.length > 0) {
                    diagnosisDetails.push(`${key}: ${val.findings.join(', ')}`);
                    weaknesses.push(...val.findings);
                  }
                }
              });
              const diagnosisContext = diagnosisDetails.join('\n');
              onGeneratePlan(
                currentScreening.studentName,
                currentScreening.age || 7,
                [...new Set(weaknesses)],
                diagnosisContext
              );
            }}
            className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-500/20 transition-all active:scale-95"
          >
            <i className="fa-solid fa-graduation-cap mr-2"></i>
            Kişisel Eğitim Planı Oluştur
          </button>
        </div>
      )}

      <ShareModal
        isOpen={isSharing}
        onClose={() => setIsSharing(false)}
        onShare={async (receiverIds, permission, message) => {
          await handleShareScreeningResult(currentScreening.id, receiverIds, permission, message);
          setIsSharing(false);
        }}
        worksheetTitle={`Tarama Raporu: ${currentScreening.studentName}`}
      />
    </div>
  );
};
