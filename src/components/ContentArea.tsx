// @ts-nocheck
import React, { memo, useState, useRef, useEffect, useCallback } from 'react';
import {
  ActivityType,
  WorksheetData,
  SavedWorksheet,
  SingleWorksheetData,
  StyleSettings,
  View,
  CollectionItem,
  WorkbookSettings,
  StudentProfile,
  AssessmentReport,
  _OverlayItem,
} from '../types';
import _Worksheet from './Worksheet';
import { Toolbar } from './Toolbar';
import { SavedWorksheetsView } from './SavedWorksheetsView';
import { SharedWorksheetsView } from './SharedWorksheetsView';
import { useAuthStore } from '../store/useAuthStore';
import { ACTIVITIES } from '../constants';
import { SkeletonLoader } from './SkeletonLoader';
import { FavoritesSection } from './FavoritesSection';
import { ShareModal } from './ShareModal';
import { WorkbookView } from './WorkbookView';
import { useAppStore } from '../store/useAppStore';
import { useWorksheetStore } from '../store/useWorksheetStore';
import { usePaperSizeStore } from '../store/usePaperSizeStore';
import { useAssignmentStore } from '../store/useAssignmentStore';
import { paginationService } from '../services/paginationService';

import { UniversalWorksheetWrapper } from './UniversalStudio/UniversalWorksheetWrapper';
import { A4EditorPanel } from './A4Editor/A4EditorPanel';
import { UniversalPreviewFrame } from './shared/UniversalPreviewFrame';

interface ContentAreaProps {
  currentView: View;
  onBackToGenerator: () => void;
  activityType: ActivityType | null;
  worksheetData: WorksheetData;
  setWorksheetData?: (data: WorksheetData | null) => void;
  isLoading: boolean;
  error: string | null;
  styleSettings: StyleSettings;
  onStyleChange: (settings: StyleSettings) => void;
  onSave: (name: string, activityType: ActivityType, data: SingleWorksheetData[]) => void;
  onLoadSaved: (worksheet: SavedWorksheet) => void;
  onFeedback: () => void;
  onOpenAuth: () => void;
  onSelectActivity?: (activityType: ActivityType) => void;
  workbookItems: CollectionItem[];
  setWorkbookItems: React.Dispatch<React.SetStateAction<CollectionItem[]>>;
  workbookSettings: WorkbookSettings;
  setWorkbookSettings: React.Dispatch<React.SetStateAction<WorkbookSettings>>;
  onAddToWorkbook: () => void; // This is the general trigger
  onAutoGenerateWorkbook?: (report: AssessmentReport) => void;
  studentProfile?: StudentProfile | null;
  zenMode: boolean;
  toggleZenMode: () => void;
  activeCurriculumSession?: {
    planId: string;
    day: number;
    activityId: string;
    activityTitle: string;
    studentName: string;
  } | null;
  onCompleteCurriculumActivity?: () => void;
  // New handler for direct item addition (like from reports)
  onAddDirectToWorkbook?: (item: any) => void;
}

const LandingText = memo(() => {
  const text = 'Her şey tersti sen farkında olana kadar...';
  return (
    <h2 className="text-4xl font-black mb-6 text-[var(--text-primary)] leading-tight text-center max-w-3xl mx-auto tracking-tighter">
      {text.split('').map((char, i) => {
        if (char === ' ') return <span key={i}> </span>;
        // Rastgele harfleri animasyonlu yap (Bursa Disleksi logosu mantığıyla)
        const _isAnimated = true;
        const delay = Math.random() * -10;
        const duration = 5 + Math.random() * 5;
        return (
          <span
            key={i}
            className={`inline-block dyslexia-flip`}
            style={{ animationDelay: `${delay}s`, animationDuration: `${duration}s` }}
          >
            {char}
          </span>
        );
      })}
    </h2>
  );
});

const ContentArea: React.FC<ContentAreaProps> = ({
  currentView,
  onBackToGenerator,
  activityType,
  worksheetData,
  setWorksheetData,
  isLoading,
  error,
  styleSettings,
  onStyleChange,
  onSave,
  onLoadSaved,
  onFeedback,
  onOpenAuth,
  onSelectActivity,
  workbookItems,
  setWorkbookItems,
  workbookSettings,
  setWorkbookSettings,
  onAddToWorkbook,
  onAutoGenerateWorkbook,
  _studentProfile,
  zenMode,
  toggleZenMode,
  activeCurriculumSession,
  onCompleteCurriculumActivity,
  onAddDirectToWorkbook,
}) => {
  const { user } = useAuthStore();
  const {
    activeWorksheetId,
    activeWorksheetTitle,
    setActiveWorksheet,
    _setCurrentView,
    _addHistoryView,
  } = useWorksheetStore();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isShareSending, setIsShareSending] = useState(false);

  // Sharing logic
  const handleShare = async (receiverIds: string[]) => {
    if (!user) {
      onOpenAuth?.();
      return;
    }

    setIsShareSending(true);
    try {
      let currentId = activeWorksheetId;

      // If not saved yet, save it first
      if (!currentId && worksheetData) {
        const title =
          activeWorksheetTitle ||
          (Array.isArray(worksheetData)
            ? worksheetData[0]?.title
            : (worksheetData as any)?.title) ||
          'Yeni Etkinlik';
        currentId = await onSave!(title, activityType!, worksheetData);
        if (currentId) {
          setActiveWorksheet(currentId, title);
        }
      }

      if (currentId) {
        await worksheetService.shareWorksheet(currentId, user.id, user.name, receiverIds);
        alert('Çalışma başarıyla paylaşıldı!');
        setIsShareModalOpen(false);
      } else {
        alert('Önce çalışmayı kaydetmelisiniz.');
      }
    } catch (error: any) {
      console.error('Share error:', error);
      alert(`Paylaşım başarısız: ${error.message}`);
    } finally {
      setIsShareSending(false);
    }
  };

  const handleAssign = async () => {
    if (!user) {
      alert("Önce giriş yapmalısınız.");
      onOpenAuth?.();
      return;
    }
    
    try {
      let currentId = activeWorksheetId;

      // If not saved yet, save it first
      if (!currentId && worksheetData) {
        const title =
          activeWorksheetTitle ||
          (Array.isArray(worksheetData)
            ? worksheetData[0]?.title
            : (worksheetData as any)?.title) ||
          'Yeni Etkinlik';
        currentId = await onSave!(title, activityType!, worksheetData);
        if (currentId) {
          setActiveWorksheet(currentId, title);
        }
      }

      if (currentId) {
        useAssignmentStore.getState().setIsAssignModalOpen(true, currentId);
      } else {
        alert('Önce çalışmayı kaydetmelisiniz.');
      }
    } catch (error: any) {
      console.error('Assign error:', error);
      alert(`Atama başlatılamadı: ${error.message}`);
    }
  };
  const { isEditMode, setEditMode, zoomScale, setZoomScale } = useAppStore();


  // Scroller container ref
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const processedData = React.useMemo(() => {
    if (!worksheetData) return [];

    const safeData = Array.isArray(worksheetData) ? [...worksheetData] : [{ ...worksheetData }];

    // Assign IDs to blocks if they don't have one, to allow editor selection
    safeData.forEach((ws) => {
      const blocks = ws.layoutArchitecture?.blocks || ws.blocks || [];
      blocks.forEach((block: any, idx: number) => {
        if (!block.id)
          block.id = `block_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 5)}`;
      });
    });

    const isRichContent =
      activityType === ActivityType.AI_WORKSHEET_CONVERTER ||
      activityType === ActivityType.OCR_CONTENT ||
      safeData.some((d) => d.sections);

    if (activityType && !isRichContent) {
      const paged = paginationService.process(safeData, activityType, styleSettings);
      return Array.isArray(paged) && paged.length > 0 ? paged : safeData;
    }
    
    return safeData;
  }, [worksheetData, activityType, styleSettings.smartPagination, styleSettings.columns, styleSettings.rows]);

  // Native Wheel Listener to prevent default scroll and strictly zoom
  useEffect(() => {
    const scroller = scrollContainerRef.current;
    if (!scroller) return;

    const handleWheel = (e: WheelEvent) => {
      if (currentView !== 'generator' || processedData.length === 0 || isLoading) return;

      // Kontrol: Fare A4 kağıdı üzerinde mi?
      const target = e.target as HTMLElement;
      const isHoveringPaper =
        target.closest('.worksheet-page') || target.closest('[data-worksheet-content="true"]');

      if (!isHoveringPaper) {
        // Sadece çalışma kağıdı dısında ve CTRL tuşu kapalıysa scroll devam etsin
        if (!e.ctrlKey) return;

        // CTRL basılıysa boşlukta da zoom yapsın
        e.preventDefault();
      } else {
        // Kağıt üzerindeyken HER ZAMAN zoom yap (Kullanıcı isteği)
        // Eğer CTRL basılı değilse yine de e.preventDefault() yaparak sayfayı kaydırmayı engelle ve zoom yap
        e.preventDefault();
      }

      // ZOOM LOGIC
      const zoomSpeed = 0.0012;
      const delta = -e.deltaY * zoomSpeed;

      const newScale = Math.min(Math.max(0.3, zoomScale + delta), 2.5);
      setZoomScale(newScale);
    };

    // passive: false is critical to allow preventDefault()
    scroller.addEventListener('wheel', handleWheel, { passive: false });
    return () => scroller.removeEventListener('wheel', handleWheel);
  }, [currentView, processedData.length, isLoading]);

  const breadcrumbs =
    currentView === 'savedList'
      ? ['Ana Sayfa', 'Arşivim']
      : currentView === 'workbook'
        ? ['Ana Sayfa', 'Kitapçık']
        : currentView === 'favorites'
          ? ['Ana Sayfa', 'Atölyem']
          : ['Ana Sayfa'];

  // Lazy imports for large modules
  const AssessmentModule = React.lazy(() =>
    import('./AssessmentModule').then((module) => ({ default: module.AssessmentModule }))
  );
  const ScreeningModule = React.lazy(() =>
    import('./Screening/ScreeningModule').then((module) => ({ default: module.ScreeningModule }))
  );

  const SinavStudyosu = React.lazy(() =>
    import('./SinavStudyosu').then((module) => ({ default: module.SinavStudyosu }))
  );

  const MatSinavStudyosu = React.lazy(() =>
    import('./MatSinavStudyosu').then((module) => ({
      default: module.MatSinavStudyosu,
    }))
  );

  const ActivityStudio = React.lazy(() =>
    import('./ActivityStudio').then((module) => ({ default: module.ActivityStudio }))
  );

  return (
    <main className="flex-1 flex flex-col h-full bg-[var(--bg-primary)] overflow-hidden">
      {/* TOOLBAR */}
      <div
        className={`shrink-0 bg-[var(--bg-paper)] border-b border-[var(--border-color)] p-4 z-40 shadow-sm relative transition-all duration-300 ${zenMode ? 'hidden' : ''}`}
      >
        <div className="flex justify-between items-center mb-4">
          <nav className="flex items-center text-sm text-[var(--text-secondary)]">
            <ol className="flex items-center space-x-2">
              {breadcrumbs.map((crumb, idx) => (
                <li key={idx} className="flex items-center">
                  {idx > 0 && (
                    <i className="fa-solid fa-chevron-right text-[10px] mx-2 opacity-50"></i>
                  )}
                  <span
                    onClick={() => idx === 0 && onBackToGenerator()}
                    className={`${idx === breadcrumbs.length - 1 ? 'font-bold text-[var(--accent-color)]' : 'hover:text-[var(--text-primary)] cursor-pointer'} `}
                  >
                    {crumb}
                  </span>
                </li>
              ))}
            </ol>
          </nav>
        </div>

        {currentView === 'generator' && activityType && (processedData.length > 0 || isLoading) && (
          <Toolbar
            settings={styleSettings}
            onSettingsChange={onStyleChange}
            onSave={() => onSave('Etkinlik', activityType, processedData)}
            onAssign={handleAssign}
            onFeedback={onFeedback}
            onShare={() => setIsShareModalOpen(true)}
            onTogglePreview={toggleZenMode}
            isPreviewMode={zenMode}
            onAddToWorkbook={() => onAddToWorkbook()}
            workbookItemCount={workbookItems.length}
            onToggleEdit={() => setEditMode(!isEditMode)}
            isEditMode={isEditMode}
            worksheetData={processedData}
            isCurriculumMode={!!activeCurriculumSession}
            onCompleteCurriculumTask={onCompleteCurriculumActivity}
          />
        )}
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* VIEWPORT - THE DESK SURFACE */}
        <div
          ref={scrollContainerRef}
          className={`flex-1 relative overflow-hidden transition-colors duration-500 ${zenMode ? 'viewport-surface-zen' : 'viewport-surface'}`}
        >
          {/* justify-start and items-start for fixed top anchoring */}
          <div className="w-full h-full flex flex-col items-center justify-start py-0">
            {currentView === 'generator' ? (
              <>
                {isLoading && (
                  <div className="flex flex-col items-center justify-center py-40 w-full animate-in fade-in">
                    <SkeletonLoader />
                    <p className="mt-6 font-black text-indigo-600 animate-pulse uppercase tracking-[0.3em]">
                      AI Hazırlıyor...
                    </p>
                  </div>
                )}

                {!isLoading && processedData.length === 0 && !error ? (
                  <div className="flex flex-col items-center justify-center py-40 w-full animate-in fade-in duration-1000">
                    <LandingText />
                    <div className="relative group/logo mt-12">
                      <img
                        src="/assets/logo.png"
                        alt="Logo"
                        className="h-32 w-auto relative z-10 transition-all duration-700 cursor-pointer select-none star-glow hover:scale-125 animate-breathing-logo"
                      />

                      {/* Minimalist Parıltı Efektleri */}
                      <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-white rounded-full opacity-0 group-hover/logo:opacity-100 group-hover/logo:animate-[star-sparkle_2s_infinite] transition-opacity" />
                      <div className="absolute bottom-4 left-0 w-1 h-1 bg-white rounded-full opacity-0 group-hover/logo:opacity-100 group-hover/logo:animate-[star-sparkle_2.5s_infinite_0.5s] transition-opacity" />
                    </div>
                  </div>
                ) : null}

                {error && (
                  <div className="bg-red-50 p-10 rounded-[3rem] border-2 border-red-100 text-center max-w-lg mt-20">
                    <i className="fa-solid fa-triangle-exclamation text-red-500 text-5xl mb-4"></i>
                    <p className="text-red-700 font-bold">{error}</p>
                  </div>
                )}

                {/* FIXED TOP CENTERING SCALING */}
                {processedData.length > 0 && !isLoading && (
                  <div className="w-full h-full flex-1 min-h-0 bg-transparent overflow-hidden">
                    <UniversalPreviewFrame
                      mode="html"
                      title={
                        activeWorksheetTitle ||
                        ACTIVITIES.find((a: any) => a.id === activityType)?.title ||
                        'Yeni Etkinlik'
                      }
                      zoom={zoomScale}
                      onZoomChange={setZoomScale}
                      downloadLink={undefined}

                    >
                      <UniversalWorksheetWrapper
                        activityType={activityType}
                        worksheetData={processedData}
                        scale={1}
                        styleSettings={styleSettings}
                      />
                    </UniversalPreviewFrame>
                  </div>
                )}
              </>
            ) : (
              <div className={`w-full h-full ${currentView === 'workbook' ? '' : 'p-8 max-w-7xl'}`}>
                {currentView === 'savedList' ? (
                  <SavedWorksheetsView onLoad={onLoadSaved} onBack={onBackToGenerator} />
                ) : currentView === 'workbook' ? (
                  <WorkbookView
                    items={workbookItems}
                    setItems={setWorkbookItems}
                    settings={workbookSettings}
                    setSettings={setWorkbookSettings}
                    onBack={onBackToGenerator}
                  />
                ) : currentView === 'favorites' ? (
                  <FavoritesSection
                    onSelectActivity={onSelectActivity!}
                    onBack={onBackToGenerator}
                  />
                ) : currentView === 'shared' ? (
                  <SharedWorksheetsView onLoad={onLoadSaved} onBack={onBackToGenerator} />
                ) : null}
              </div>
            )}
          </div>

          {/* ZOOM INDICATOR - THEMED */}
          {processedData.length > 0 && !isLoading && currentView === 'generator' && (
            <div className="fixed bottom-10 left-10 z-50 bg-[var(--bg-paper)] text-[var(--text-primary)] px-5 py-2.5 rounded-2xl text-xs font-black shadow-2xl border border-[var(--border-color)] animate-in slide-in-from-left-4 backdrop-blur-md opacity-80 hover:opacity-100 transition-opacity">
              BOYUT: %{Math.round(zoomScale * 100)}
            </div>
          )}
        </div>

        <A4EditorPanel worksheetData={worksheetData} setWorksheetData={setWorksheetData} />
      </div>

      {currentView === 'assessment' && (
        <div className="absolute inset-0 bg-white dark:bg-zinc-900 z-[60] overflow-y-auto">
          <React.Suspense
            fallback={
              <div className="flex items-center justify-center h-full">
                <i className="fa-solid fa-spinner fa-spin text-4xl text-indigo-500"></i>
              </div>
            }
          >
            <AssessmentModule
              onBack={onBackToGenerator}
              onSelectActivity={onSelectActivity!}
              onAddToWorkbook={onAddDirectToWorkbook}
              onAutoGenerateWorkbook={onAutoGenerateWorkbook}
            />
          </React.Suspense>
        </div>
      )}

      {currentView === 'screening' && (
        <div className="absolute inset-0 bg-white dark:bg-zinc-900 z-[60] overflow-y-auto">
          <React.Suspense
            fallback={
              <div className="flex items-center justify-center h-full">
                <i className="fa-solid fa-spinner fa-spin text-4xl text-purple-500"></i>
              </div>
            }
          >
            <ScreeningModule
              onBack={onBackToGenerator}
              onSelectActivity={onSelectActivity}
              onAddToWorkbook={onAddDirectToWorkbook}
            />
          </React.Suspense>
        </div>
      )}

      {currentView === 'sinav-studyosu' && (
        <div className="absolute inset-0 bg-white dark:bg-zinc-900 z-[60] overflow-y-auto">
          <React.Suspense
            fallback={
              <div className="flex items-center justify-center h-full">
                <i className="fa-solid fa-spinner fa-spin text-4xl text-amber-500"></i>
              </div>
            }
          >
            <SinavStudyosu />
          </React.Suspense>
        </div>
      )}

      {currentView === 'mat-sinav-studyosu' && (
        <div className="absolute inset-0 bg-white dark:bg-zinc-900 z-[60] overflow-y-auto">
          <React.Suspense
            fallback={
              <div className="flex items-center justify-center h-full">
                <i className="fa-solid fa-spinner fa-spin text-4xl text-blue-500"></i>
              </div>
            }
          >
            <MatSinavStudyosu />
          </React.Suspense>
        </div>
      )}

      {currentView === 'activity-studio' && (
        <div className="absolute inset-0 bg-white dark:bg-zinc-900 z-[60] overflow-y-auto">
          <React.Suspense
            fallback={
              <div className="flex items-center justify-center h-full">
                <i className="fa-solid fa-spinner fa-spin text-4xl text-fuchsia-500"></i>
              </div>
            }
          >
            <ActivityStudio
              onBack={onBackToGenerator}
              onAddToWorkbook={onAddDirectToWorkbook}
            />
          </React.Suspense>
        </div>
      )}

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onShare={handleShare}
        worksheetId={activeWorksheetId || ''}
        worksheetTitle={activeWorksheetTitle}
        isSending={isShareSending}
      />
    </main>
  );
};

export default React.memo(ContentArea);
