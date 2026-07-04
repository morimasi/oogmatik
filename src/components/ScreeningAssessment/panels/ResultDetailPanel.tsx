import { useEffect, useState } from 'react';
import { useScreeningAssessment } from '../hooks/useScreeningAssessment';
import { CategoryScoreCard } from '../components/shared/CategoryScoreCard';
import { RiskBadge } from '../components/shared/RiskBadge';
import { ReportActions } from '../components/shared/ReportActions';
import { RadarChart } from '../../RadarChart';
import { CATEGORY_LABELS } from '../../../data/screeningQuestions';
import { assessmentEngineService } from '../services/assessmentEngineService';
import { generateWithSchema } from '../../../services/geminiClient';
import type { AIAnalysisResult } from '../services/assessmentEngineService';
import type { EvaluationCategory, ScreeningResult } from '../../../types/screening';
import { ShareModal } from '../../ShareModal';
import { BrandedLoadingAnimation } from '../../shared/BrandedLoadingAnimation';
import {
  buildProfessionalAssessmentPrompt,
  buildProfessionalAssessmentReport,
  buildStudentProfileContext,
} from '../services/professionalAssessmentService';

interface ResultDetailPanelProps {
  onGeneratePlan?: (studentName: string, age: number, weaknesses: string[], diagnosisContext?: string) => void;
}

export const ResultDetailPanel: React.FC<ResultDetailPanelProps> = ({ onGeneratePlan }) => {
  const {
    currentScreening,
    setActiveView,
    handleSaveScreening,
    handleDownloadReport,
    handlePrintReport,
    handleShareResults,
    handleShareScreeningResult,
    isSaving,
    getScoreColor,
  } = useScreeningAssessment({});

  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiError, setAiError] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [professionalReport, setProfessionalReport] = useState<ReturnType<typeof buildProfessionalAssessmentReport> | null>(null);

  useEffect(() => {
    if (!currentScreening) return;
    generateAiAdvice();
  }, [currentScreening?.id]);

  const generateAiAdvice = async () => {
    if (!currentScreening) return;
    setLoadingAi(true);
    setAiError(false);
    try {
      const prompt = assessmentEngineService.buildAnalysisPrompt(currentScreening);
      const schema = assessmentEngineService.getAIAnalysisSchema();
      const response = (await generateWithSchema(prompt, schema)) as unknown as AIAnalysisResult;
      setAiAnalysis({
        letter: typeof response?.letter === 'string' ? response.letter : String(response?.letter ?? ''),
        actionSteps: assessmentEngineService.normalizeActionSteps(response?.actionSteps),
      });

      const studentContext = {
        studentName: currentScreening.studentName,
        age: currentScreening.age,
        grade: currentScreening.grade,
        strengths: currentScreening.strengths ?? [],
        concerns: Object.entries(currentScreening.categoryScores)
          .filter(([, value]) => value.riskLevel === 'high' || value.riskLevel === 'moderate')
          .map(([key]) => key),
        supportContext: 'sessiz çalışma alanı ve kısa, tekrarlı destek oturumları',
      };

      const professionalPrompt = buildProfessionalAssessmentPrompt(currentScreening, studentContext);
      const professionalReportData = buildProfessionalAssessmentReport(currentScreening, studentContext);
      setProfessionalReport(professionalReportData);

      if (typeof professionalPrompt === 'string' && professionalPrompt.length > 0) {
        void generateWithSchema(professionalPrompt, {
          type: 'OBJECT',
          properties: {
            summary: { type: 'STRING' },
            recommendations: { type: 'ARRAY', items: { type: 'STRING' } },
            cautions: { type: 'ARRAY', items: { type: 'STRING' } },
            strengths: { type: 'ARRAY', items: { type: 'STRING' } },
            bePGoals: { type: 'ARRAY', items: { type: 'STRING' } },
          },
          required: ['summary', 'recommendations', 'cautions', 'strengths', 'bePGoals'],
        });
      }
    } catch {
      setAiError(true);
    } finally {
      setLoadingAi(false);
    }
  };

  if (!currentScreening) {
    return (
      <div className="flex items-center justify-center h-48 text-[var(--text-muted)] text-sm font-medium">
        Sonuç bulunamadı.
      </div>
    );
  }

  const chartData = (Object.keys(currentScreening.categoryScores) as EvaluationCategory[]).map(
    (key) => ({
      label: CATEGORY_LABELS[key] || key,
      value: currentScreening.categoryScores[key]?.score ?? 0,
    })
  );

  const handleSave = () => {
    handleSaveScreening();
    setIsSaved(true);
  };

  return (
    <div className="space-y-4 pb-20">
      <div className="bg-[var(--bg-paper)] p-4 rounded-xl border border-[var(--border-color)] flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <RiskBadge level={currentScreening.riskLevel} size="sm" />
              <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                {new Date(currentScreening.generatedAt).toLocaleDateString('tr-TR')}
              </span>
            </div>
            <h2 className="text-base font-black text-[var(--text-primary)]">
              {currentScreening.studentName}
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`text-lg font-black italic ${getScoreColor(currentScreening.overallScore)} mr-3`}>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[var(--bg-paper)] p-6 rounded-2xl border border-[var(--border-color)] flex flex-col items-center justify-center min-h-[320px]">
          <h4 className="font-bold text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-4">
            Bilişsel Risk Haritası
          </h4>
          <div className="w-[280px] h-[280px]">
            <RadarChart data={chartData} />
          </div>
        </div>

        <div className="space-y-2.5">
          {(Object.keys(currentScreening.categoryScores) as EvaluationCategory[]).map(
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

      <div className="bg-[var(--accent-muted)] p-6 rounded-2xl border border-[var(--accent-color)]/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12 pointer-events-none">
          <div className="w-24 h-24 rounded-full bg-[var(--accent-color)] blur-2xl" />
        </div>
        <h3 className="text-sm font-black text-[var(--accent-color)] mb-4 flex items-center gap-2 uppercase tracking-tight italic">
          AI Uzman Görüşü
        </h3>

        {professionalReport && (
          <div className="mb-5 space-y-3 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-paper)]/70 p-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-color)]">Öğrenci Profili</p>
              <p className="mt-2 text-sm text-[var(--text-primary)] leading-relaxed">{buildStudentProfileContext({
                studentName: currentScreening.studentName,
                age: currentScreening.age,
                grade: currentScreening.grade,
                strengths: professionalReport.strengths,
                concerns: Object.entries(currentScreening.categoryScores)
                  .filter(([, value]) => value.riskLevel === 'high' || value.riskLevel === 'moderate')
                  .map(([key]) => key),
                supportContext: 'sessiz çalışma alanı ve kısa, tekrarlı destek oturumları',
              })}</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/70 p-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Güçlü Yönler</p>
                <ul className="mt-2 space-y-1 text-sm text-emerald-900">
                  {(professionalReport.strengths.length > 0 ? professionalReport.strengths : ['Henüz net güçlü yön belirtilmedi.']).map((item, index) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-amber-200/60 bg-amber-50/70 p-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">Dikkat Edilecek Alanlar</p>
                <ul className="mt-2 space-y-1 text-sm text-amber-900">
                  {(professionalReport.cautions.length > 0 ? professionalReport.cautions : ['Dikkat alanı henüz belirlenmedi.']).map((item, index) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-indigo-200/60 bg-indigo-50/70 p-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-700">Öneriler</p>
                <ul className="mt-2 space-y-1 text-sm text-indigo-900">
                  {professionalReport.recommendations.map((item, index) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-fuchsia-200/60 bg-fuchsia-50/70 p-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-fuchsia-700">BEP Hedefleri</p>
                <ul className="mt-2 space-y-1 text-sm text-fuchsia-900">
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
            title="Veriler Analiz Ediliyor"
            messages={[
              'AI analiz yapıyor...',
              'Rapor hazırlanıyor...',
              'Öneriler oluşturuluyor...',
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
            <div className="text-sm text-[var(--text-primary)] leading-relaxed bg-[var(--bg-paper)]/50 p-4 rounded-xl border border-[var(--border-color)]">
              {aiAnalysis.letter}
            </div>
            {aiAnalysis.actionSteps.length > 0 && (
              <>
                <h4 className="font-black text-[10px] text-[var(--accent-color)] uppercase tracking-widest">
                  Öneriler
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {aiAnalysis.actionSteps.map((step, i) => (
                    <div
                      key={i}
                      className="bg-[var(--bg-paper)] p-3 rounded-xl border border-[var(--border-color)] flex gap-2.5"
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

      {onGeneratePlan && (
        <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 p-6 rounded-2xl border border-indigo-200/50 dark:border-indigo-800/30 text-center">
          <h3 className="text-base font-black text-[var(--text-primary)] mb-2 uppercase tracking-tight italic">
            <i className="fa-solid fa-wand-magic-sparkles text-indigo-500 mr-2"></i>
            Bu Analizden Eğitim Planı Oluştur
          </h3>
          <p className="text-xs text-[var(--text-muted)] mb-4 max-w-lg mx-auto">
            AI, analiz sonuçlarına göre öğrenciye özel günlük aktiviteler, hedefler ve ölçme metrikleri içeren kişiselleştirilmiş bir müfredat planı oluşturacak.
          </p>
          <button
            onClick={() => {
              const weaknesses: string[] = [];
              const diagnosisDetails: string[] = [];
              Object.entries(currentScreening.categoryScores).forEach(([key, val]: [string, any]) => {
                if (val.riskLevel === 'high' || val.riskLevel === 'moderate') {
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

      <div id="printable-report" className="hidden" aria-hidden="true">
        <div className="print-page bg-white text-black p-8 font-sans" style={{ width: '210mm', minHeight: '297mm' }}>
          <header className="mb-8">
            <h1 className="text-3xl font-black uppercase">Tarama Sonuç Raporu</h1>
            <p className="text-sm text-zinc-500 mt-2">{currentScreening.studentName} · {new Date(currentScreening.generatedAt).toLocaleDateString('tr-TR')}</p>
          </header>
          <section className="mb-6">
            <h2 className="text-lg font-bold mb-2">Genel Değerlendirme</h2>
            <p className="text-sm leading-relaxed text-zinc-700">Bu rapor, öğrenciye ait tarama sonuçlarının özetini ve önerileri içerir. Klinik tanı yerine geçmez.</p>
          </section>
          <section className="mb-6">
            <h3 className="text-base font-bold mb-3">Özet Skorlar</h3>
            <table className="w-full text-sm border-collapse border border-zinc-300">
              <thead>
                <tr className="bg-zinc-100">
                  <th className="p-3 text-left">Alan</th>
                  <th className="p-3 text-right">Risk</th>
                  <th className="p-3 text-right">Skor</th>
                </tr>
              </thead>
              <tbody>
                {(Object.keys(currentScreening.categoryScores) as EvaluationCategory[]).map((category) => {
                  const score = currentScreening.categoryScores[category];
                  return (
                    <tr key={category} className="border-t border-zinc-200">
                      <td className="p-3 text-left font-bold">{CATEGORY_LABELS[category] || category}</td>
                      <td className="p-3 text-right">{score.riskLabel}</td>
                      <td className="p-3 text-right">%{score.score}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
          <section>
            <h3 className="text-base font-bold mb-3">AI Analiz Özeti</h3>
            <p className="text-sm leading-relaxed text-zinc-700">{aiAnalysis?.letter || 'AI analizi henüz hazır değil.'}</p>
          </section>
        </div>
      </div>
    </div>
  );
};
