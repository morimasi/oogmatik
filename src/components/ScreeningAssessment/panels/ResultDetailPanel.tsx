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
import type { EvaluationCategory } from '../../../types/screening';
import { ShareModal } from '../../ShareModal';

export const ResultDetailPanel: React.FC = () => {
  const {
    currentScreening,
    setActiveView,
    handleSaveScreening,
    handleDownloadReport,
    handlePrintReport,
    handleShareResults,
    handleAddToWorkbook,
    isSaving,
    getScoreColor,
  } = useScreeningAssessment();

  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiError, setAiError] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

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
            onAddToWorkbook={() => handleAddToWorkbook(currentScreening)}
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

        {loadingAi ? (
          <div className="flex flex-col items-center py-8 text-[var(--accent-color)]">
            <div className="w-6 h-6 border-2 border-[var(--accent-color)] border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs font-bold animate-pulse">Veriler analiz ediliyor...</p>
          </div>
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

      <ShareModal
        isOpen={isSharing}
        onClose={() => setIsSharing(false)}
        onShare={(receiverIds: string[]) => {
          handleShareResults(currentScreening.id);
          setIsSharing(false);
        }}
        worksheetTitle={`Tarama Raporu: ${currentScreening.studentName}`}
      />
    </div>
  );
};
