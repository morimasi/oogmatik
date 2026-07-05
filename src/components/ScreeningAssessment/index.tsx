import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';
import { useScreeningStore } from './store/useScreeningStore';
import { useScreeningAssessment } from './hooks/useScreeningAssessment';
import { DashboardPanel } from './panels/DashboardPanel';
import { NewScreeningPanel } from './panels/NewScreeningPanel';
import { HistoryPanel } from './panels/HistoryPanel';
import { AnalyticsPanel } from './panels/AnalyticsPanel';
import { ResultDetailPanel } from './panels/ResultDetailPanel';
import { SCREENING_TABS } from './constants';
import { ReportActions } from './components/shared/ReportActions';
import { screeningDataService } from './services/screeningDataService';
import { CognitiveTestPanel } from './components/CognitiveTests/CognitiveTestPanel';
import { useToastStore } from '../../store/useToastStore';
import type { ScreeningResult } from '../../types/screening';

interface ScreeningAssessmentProps {
  onClose: () => void;
  userRole: 'teacher' | 'admin' | 'parent';
  studentId?: string;
  onGeneratePlan?: (studentName: string, age: number, weaknesses: string[], diagnosisContext?: string) => void;
}

export const ScreeningAssessment: React.FC<ScreeningAssessmentProps> = ({
  onClose,
  userRole,
  onGeneratePlan,
}) => {
  const {
    activeView,
    setActiveView,
    setIsAdvancedScreeningOpen,
    setScreeningData,
    setCurrentScreening,
    selectedStudentName,
    selectedStudentAge,
    selectedStudentGrade,
  } = useScreeningStore();
  const toast = useToastStore();
  const { currentScreening, handleSaveScreening, handleDownloadReport, handlePrintReport, handleShareResults, handleShareScreeningResult } =
    useScreeningAssessment();

  useEffect(() => {
    setIsAdvancedScreeningOpen(true);
    return () => setIsAdvancedScreeningOpen(false);
  }, []);

  const panelVariants = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
  };

  const assessmentFlow = activeView === 'assessment' || activeView === 'cognitive-battery';
  const tabbedView = !assessmentFlow;

  const handleResultReady = async (result: ScreeningResult) => {
    const savedId = await screeningDataService.saveResultToFirestore(result);
    if (savedId) {
      const saved = { ...result, id: savedId };
      setCurrentScreening(saved);
      const updated = await screeningDataService.getUserScreeningsFromFirestore();
      setScreeningData(updated);
    }
    setActiveView('result-detail');
  };

  const handleGeneratePlanWithAutoSave = async (studentName: string, age: number, weaknesses: string[], diagnosisContext?: string) => {
    if (onGeneratePlan) {
      onGeneratePlan(studentName, age, weaknesses, diagnosisContext);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[var(--bg-paper)] border border-[var(--border-color)] shadow-2xl backdrop-blur-md rounded-2xl w-full max-w-6xl max-h-[92vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-[var(--surface-glass)] border-b border-[var(--border-color)] backdrop-blur-xl flex items-center justify-between px-4 py-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--text-primary)]">Tarama & Analiz Modülü</h2>
              <p className="text-[9px] font-medium text-[var(--text-secondary)]">Bilişsel değerlendirme ve analiz merkezi</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {currentScreening && !assessmentFlow && (
              <ReportActions
                onSave={handleSaveScreening}
                onDownload={() => handleDownloadReport(currentScreening)}
                onPrint={handlePrintReport}
                onShare={() => handleShareResults(currentScreening.id)}
                onClose={onClose}
              />
            )}
            {!currentScreening && (
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-lg bg-[var(--surface-elevated)] hover:bg-[var(--surface-glass)] text-[var(--text-primary)] border border-[var(--border-color)] flex items-center justify-center transition-all duration-200 hover:scale-105"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            )}
          </div>
        </div>

        {tabbedView && (
          <>
            {/* Navigation Tabs */}
            <div className="flex border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
              {SCREENING_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeView === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveView(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-[10px] font-bold transition-all duration-200 ${isActive
                        ? 'bg-[var(--bg-paper)] text-[var(--text-primary)] border-b-2 border-[var(--accent-color)] shadow-sm'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface-glass)]'
                      }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto bg-[var(--bg-primary)]">
              <div className="p-4">
                <motion.div
                  key={activeView}
                  variants={panelVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.2 }}
                >
                  {activeView === 'dashboard' && <DashboardPanel />}
                  {activeView === 'new-screening' && <NewScreeningPanel />}
                  {activeView === 'history' && <HistoryPanel />}
                  {activeView === 'analytics' && <AnalyticsPanel />}
                  {activeView === 'result-detail' && (
                    <ResultDetailPanel
                      onGeneratePlan={handleGeneratePlanWithAutoSave}
                    />
                  )}
                </motion.div>
              </div>
            </div>
          </>
        )}

        {/* Assessment Flow - Full height when active */}
        {assessmentFlow && (
          <div className="flex-1 flex flex-col bg-[var(--bg-primary)] overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              {activeView === 'cognitive-battery' ? (
                <CognitiveTestPanel
                  studentName={selectedStudentName || 'Öğrenci'}
                  studentAge={selectedStudentAge}
                  studentGrade={selectedStudentGrade}
                  studentConcerns={[]}
                  onBack={() => setActiveView('new-screening')}
                  onComplete={() => {
                    toast.success('İnteraktif bilişsel batarya tamamlandı.');
                    setActiveView('dashboard');
                  }}
                />
              ) : (
                <ScreeningFormWrapper
                  onComplete={() => setActiveView('dashboard')}
                  onBack={() => setActiveView('new-screening')}
                  onResult={handleResultReady}
                  onGeneratePlan={handleGeneratePlanWithAutoSave}
                />
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-[var(--border-color)] bg-[var(--bg-secondary)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[9px] font-bold text-[var(--text-muted)]">Sistem Aktif</span>
            </div>
            <span className="text-[9px] text-[var(--text-muted)]">AI Destekli Analiz</span>
          </div>
          <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
            {userRole === 'admin' ? 'Yönetici' : userRole === 'teacher' ? 'Öğretmen' : 'Veli'}
          </span>
        </div>
      </motion.div>
    </div>
  );
};

// Screening Form Wrapper - Maintains backward compatibility with existing ScreeningModule
const ScreeningFormWrapper: React.FC<{
  onComplete: () => void;
  onBack: () => void;
  onResult?: (result: ScreeningResult) => void;
  onGeneratePlan?: (studentName: string, age: number, weaknesses: string[], diagnosisContext?: string) => void;
}> = ({ onComplete, onBack, onResult, onGeneratePlan }) => {
  const { selectedStudentName, selectedStudentId, selectedStudentAge, selectedStudentGrade } = useScreeningStore();

  const handleResult = (result: ScreeningResult) => {
    if (selectedStudentId) {
      result.studentId = selectedStudentId;
    }
    onResult?.(result);
  };

  return (
    <React.Suspense
      fallback={
        <div className="flex items-center justify-center h-48">
          <div className="w-6 h-6 border-2 border-[var(--accent-color)] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ScreeningModule
        initialProfile={{
          studentName: selectedStudentName,
          age: selectedStudentAge,
          grade: selectedStudentGrade,
          studentId: selectedStudentId || undefined,
          respondent: 'teacher',
        }}
        onBack={onBack}
        onSelectActivity={() => { }}
        onResult={handleResult}
        onGeneratePlan={onGeneratePlan || (() => { })}
      />
    </React.Suspense>
  );
};

// Lazy import from original ScreeningModule to maintain backward compatibility
const ScreeningModule = React.lazy(
  () =>
    import('../Screening/ScreeningModule').then((m) => ({
      default: m.ScreeningModule,
    }))
);

export default ScreeningAssessment;
