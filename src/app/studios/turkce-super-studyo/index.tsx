import React, { useState, Suspense, lazy } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import TurkceSuperStudyoLayout from './layout';
import TurkceSuperStudyoPage from './page';
import { ArrowLeft, ChevronRight, Home } from 'lucide-react';

// Lazy load sub-studio pages for performance
const MetinParagrafPage = lazy(() => import('./metin-paragraf/page'));
const MantikMuhakemePage = lazy(() => import('./mantik-muhakeme/page'));
const YazimNoktalamaPage = lazy(() => import('./yazim-noktalama/page'));
const SozVarligiPage = lazy(() => import('./soz-varligi/page'));
const CalismaKagidiPage = lazy(() => import('./calisma-kagidi/page'));
const OgretmenPaneliPage = lazy(() => import('./ogretmen-paneli/page'));

type StudioView =
  | 'home'
  | 'metin-paragraf'
  | 'mantik-muhakeme'
  | 'yazim-noktalama'
  | 'soz-varligi'
  | 'calisma-kagidi'
  | 'ogretmen-paneli';

const viewTitles: Record<StudioView, string> = {
  home: 'Türkçe Süper Stüdyo',
  'metin-paragraf': 'Metin & Paragraf Stüdyosu',
  'mantik-muhakeme': 'Mantık & Muhakeme Stüdyosu',
  'yazim-noktalama': 'Yazım & Noktalama Stüdyosu',
  'soz-varligi': 'Söz Varlığı & Kelime Fabrikası',
  'calisma-kagidi': 'Çalışma Kağıdı Stüdyosu',
  'ogretmen-paneli': 'Soru Fabrikası (Öğretmen)',
};

// Loading fallback with smooth animation
function StudioLoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-indigo-500">
      <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
      <p className="text-lg font-semibold text-gray-500">Stüdyo yükleniyor...</p>
    </div>
  );
}

// Breadcrumb navigation
function Breadcrumb({
  currentView,
  onNavigate,
}: {
  currentView: StudioView;
  onNavigate: (view: StudioView) => void;
}) {
  if (currentView === 'home') return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-6 px-1"
    >
      <button
        onClick={() => onNavigate('home')}
        className="flex items-center gap-1 hover:text-indigo-600 transition-colors"
      >
        <Home size={14} />
        Ana Sayfa
      </button>
      <ChevronRight size={14} className="text-gray-300" />
      <span className="text-gray-800 font-bold">{viewTitles[currentView]}</span>
    </nav>
  );
}

export default function TurkceSuperStudyoEntry({ onBack }: { onBack: () => void }) {
  const [currentView, setCurrentView] = useState<StudioView>('home');

  const navigateTo = (view: StudioView) => {
    setCurrentView(view);
  };

  const handleBack = () => {
    if (currentView !== 'home') {
      setCurrentView('home');
    } else {
      onBack();
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return <TurkceSuperStudyoPage onNavigate={navigateTo} />;
      case 'metin-paragraf':
        return <MetinParagrafPage />;
      case 'mantik-muhakeme':
        return <MantikMuhakemePage />;
      case 'yazim-noktalama':
        return <YazimNoktalamaPage />;
      case 'soz-varligi':
        return <SozVarligiPage />;
      case 'calisma-kagidi':
        return <CalismaKagidiPage />;
      case 'ogretmen-paneli':
        return <OgretmenPaneliPage />;
      default:
        return <TurkceSuperStudyoPage onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="absolute inset-0 bg-[var(--dyslexia-bg-color,#FFFDF0)] z-[60] overflow-y-auto">
      {/* Back button */}
      <motion.button
        onClick={handleBack}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="fixed top-4 left-4 z-[70] flex items-center justify-center gap-2 px-4 py-2.5 bg-white/80 backdrop-blur-md rounded-full shadow-lg border border-gray-200/50 text-gray-600 hover:bg-white hover:text-indigo-600 hover:shadow-xl transition-all duration-300"
      >
        <ArrowLeft size={18} />
        <span className="text-sm font-bold hidden sm:inline">
          {currentView !== 'home' ? 'Stüdyo Seçimi' : 'Geri'}
        </span>
      </motion.button>

      <TurkceSuperStudyoLayout>
        <Breadcrumb currentView={currentView} onNavigate={navigateTo} />

        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <Suspense fallback={<StudioLoadingFallback />}>{renderCurrentView()}</Suspense>
          </motion.div>
        </AnimatePresence>
      </TurkceSuperStudyoLayout>
    </div>
  );
}
