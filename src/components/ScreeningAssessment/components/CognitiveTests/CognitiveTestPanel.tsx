import { useState, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ArrowLeft, ArrowRight, CircleCheck as CheckCircle2, Loader2 } from 'lucide-react';
import type { CognitiveDomain, SubTestResult } from '../../../../types';

const AssessmentEngine = lazy(() =>
  import('../../../assessment/AssessmentEngine').then((m) => ({
    default: m.AssessmentEngine,
  }))
);

interface CognitiveTestPanelProps {
  studentName: string;
  onComplete: (results: SubTestResult[]) => void;
  onBack: () => void;
}

const TEST_DOMAINS: Array<{
  domain: CognitiveDomain;
  label: string;
  description: string;
  icon: string;
  duration: string;
}> = [
  { domain: 'visual_spatial_memory', label: 'Görsel-Uzamsal Bellek', description: 'Şekilleri ve desenleri hatırlama', icon: 'fa-grid-2', duration: '~3 dk' },
  { domain: 'selective_attention', label: 'Seçici Dikkat (Stroop)', description: 'Dikkat dağıtıcılara karşı odaklanma', icon: 'fa-eye', duration: '~4 dk' },
  { domain: 'processing_speed', label: 'İşlem Hızı', description: 'Hızlı isimlendirme ve tepki süresi', icon: 'fa-gauge-high', duration: '~2 dk' },
  { domain: 'logical_reasoning', label: 'Mantıksal Akıl Yürütme', description: 'Problem çözme ve desen bulma', icon: 'fa-puzzle-piece', duration: '~5 dk' },
  { domain: 'phonological_loop', label: 'Fonolojik Döngü', description: 'Sesleri işlemleme ve tekrar etme', icon: 'fa-ear-listen', duration: '~3 dk' },
  { domain: 'visual_search', label: 'Görsel Arama', description: 'Hedef uyaranı karmaşada bulma', icon: 'fa-magnifying-glass', duration: '~3 dk' },
  { domain: 'working_memory', label: 'Çalışma Belleği', description: 'Bilgiyi geçici olarak saklama ve işleme', icon: 'fa-brain', duration: '~4 dk' },
  { domain: 'planning', label: 'Planlama', description: 'Strateji geliştirme ve hedefe ulaşma', icon: 'fa-chess-board', duration: '~5 dk' },
  { domain: 'auditory_processing', label: 'İşitsel İşleme', description: 'Sesleri algılama ve ayırt etme', icon: 'fa-volume-high', duration: '~3 dk' },
  { domain: 'visual_motor_integration', label: 'Görsel-Motor Entegrasyon', description: 'El-göz koordinasyonu', icon: 'fa-palette', duration: '~4 dk' },
  { domain: 'verbal_comprehension', label: 'Sözel Kavrama', description: 'Kelime anlamları ve ilişkileri', icon: 'fa-book', duration: '~3 dk' },
];

export const CognitiveTestPanel: React.FC<CognitiveTestPanelProps> = ({
  studentName,
  onComplete,
  onBack,
}) => {
  const [currentTestIndex, setCurrentTestIndex] = useState(-1);
  const [results, setResults] = useState<SubTestResult[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  const handleTestComplete = (result: SubTestResult) => {
    const updated = [...results, result];
    setResults(updated);

    if (currentTestIndex < TEST_DOMAINS.length - 1) {
      setCurrentTestIndex(currentTestIndex + 1);
    } else {
      setIsComplete(true);
      onComplete(updated);
    }
  };

  const handleSkip = () => {
    const skipResult: SubTestResult = {
      testId: TEST_DOMAINS[currentTestIndex].domain,
      name: TEST_DOMAINS[currentTestIndex].label,
      score: 0,
      rawScore: 0,
      totalItems: 0,
      avgReactionTime: 0,
      accuracy: 0,
      status: 'skipped',
      timestamp: Date.now(),
    };
    handleTestComplete(skipResult);
  };

  if (isComplete) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-6">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
        </div>
        <h3 className="text-xl font-black text-[var(--text-primary)]">Tüm Testler Tamamlandı</h3>
        <p className="text-sm text-[var(--text-secondary)] text-center max-w-md">
          {studentName} için {results.length} bilişsel test başarıyla uygulandı.
        </p>
      </div>
    );
  }

  if (currentTestIndex === -1) {
    return (
      <div className="space-y-4">
        <div className="bg-[var(--bg-paper)] rounded-2xl border border-[var(--border-color)] p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-black text-[var(--text-primary)]">Bilişsel Test Bataryası</h3>
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                {studentName} için {TEST_DOMAINS.length} test
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6">
            {TEST_DOMAINS.map((test, i) => (
              <div
                key={test.domain}
                className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]"
              >
                <div className="w-8 h-8 rounded-lg bg-[var(--bg-paper)] flex items-center justify-center border border-[var(--border-color)] shrink-0">
                  <i className={`fa-solid ${test.icon} text-[var(--accent-color)] text-xs`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-xs text-[var(--text-primary)] truncate">{test.label}</p>
                  <p className="text-[8px] font-medium text-[var(--text-muted)]">{test.duration}</p>
                </div>
                <span className="text-[8px] font-black text-[var(--text-muted)]">#{i + 1}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[var(--border-color)]">
            <button onClick={onBack} className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
              Vazgeç
            </button>
            <button
              onClick={() => setCurrentTestIndex(0)}
              className="px-6 py-3 bg-[var(--accent-color)] text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 flex items-center gap-2"
            >
              Testlere Başla
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentTest = TEST_DOMAINS[currentTestIndex];

  return (
    <div className="flex flex-col h-full">
      <div className="bg-[var(--bg-paper)] border-b border-[var(--border-color)] p-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={handleSkip}
            className="w-7 h-7 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--surface-glass)] transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <div>
            <p className="text-xs font-black text-[var(--text-primary)]">{currentTest.label}</p>
            <p className="text-[8px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
              Test {currentTestIndex + 1} / {TEST_DOMAINS.length}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {TEST_DOMAINS.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i < currentTestIndex ? 'bg-emerald-500' : i === currentTestIndex ? 'bg-[var(--accent-color)]' : 'bg-[var(--bg-secondary)] border border-[var(--border-color)]'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-[var(--accent-color)]" />
            </div>
          }
        >
          <AssessmentEngine domain={currentTest.domain} onComplete={handleTestComplete} />
        </Suspense>
      </div>
    </div>
  );
};
