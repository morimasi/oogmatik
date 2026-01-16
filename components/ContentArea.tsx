
import React, { memo, useState, useRef, useEffect, useCallback } from 'react';
import { ActivityType, WorksheetData, SavedWorksheet, SingleWorksheetData, StyleSettings, View, CollectionItem, WorkbookSettings, StudentProfile, AssessmentReport, OverlayItem } from '../types';
import Worksheet from './Worksheet';
import { Toolbar } from './Toolbar';
import { SavedWorksheetsView } from './SavedWorksheetsView';
import { SharedWorksheetsView } from './SharedWorksheetsView';
import { useAuth } from '../context/AuthContext';
import { ACTIVITIES } from '../constants';
import { SkeletonLoader } from './SkeletonLoader';
import { FavoritesSection } from './FavoritesSection';
import { ShareModal } from './ShareModal';
import { WorkbookView } from './WorkbookView';
import { EditableContext } from './Editable';
import { paginationService } from '../services/paginationService';

interface ContentAreaProps {
  currentView: View;
  onBackToGenerator: () => void;
  activityType: ActivityType | null;
  worksheetData: WorksheetData;
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
  onAddToWorkbook: () => void;
  onAutoGenerateWorkbook?: (report: AssessmentReport) => void;
  studentProfile?: StudentProfile | null;
  zenMode: boolean;
  toggleZenMode: () => void;
  activeCurriculumSession?: { planId: string, day: number, activityId: string, activityTitle: string, studentName: string } | null;
  onCompleteCurriculumActivity?: () => void;
}

const LandingText = memo(() => {
    const text = "Her şey tersti sen farkında olana kadar...";
    return (
        <h2 className="text-3xl font-bold mb-2 text-[var(--text-primary)] leading-normal text-center max-w-2xl mx-auto">
            {text.split('').map((char, i) => {
                if (char === ' ') return <span key={i}> </span>;
                const isAnimated = ['e', 'a', 'ı', 'i', 'o', 'ö', 'u', 'ü', 'b', 'd', 'p'].includes(char.toLowerCase()) && Math.random() > 0.3;
                return <span key={i} className={`inline-block ${isAnimated ? 'dyslexia-flip text-[var(--accent-color)]' : ''}`}>{char}</span>;
            })}
        </h2>
    );
});

const ContentArea: React.FC<ContentAreaProps> = ({
  currentView, onBackToGenerator, activityType, worksheetData, isLoading, error, styleSettings, onStyleChange, onSave, onLoadSaved, onFeedback, onOpenAuth, onSelectActivity, workbookItems, setWorkbookItems, workbookSettings, setWorkbookSettings, onAddToWorkbook, onAutoGenerateWorkbook, studentProfile, zenMode, toggleZenMode, activeCurriculumSession, onCompleteCurriculumActivity
}) => {
    const { user } = useAuth();
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [scale, setScale] = useState(0.85);
    const [processedData, setProcessedData] = useState<SingleWorksheetData[]>([]);
    
    // Scroller container ref
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!worksheetData) {
            setProcessedData([]);
            return;
        }
        const safeData = Array.isArray(worksheetData) ? worksheetData : [worksheetData];
        const isRichContent = activityType === ActivityType.AI_WORKSHEET_CONVERTER || activityType === ActivityType.OCR_CONTENT || safeData.some(d => d.sections);

        if (activityType && !isRichContent) {
            const paged = paginationService.process(safeData, activityType, styleSettings);
            setProcessedData(Array.isArray(paged) && paged.length > 0 ? paged : safeData);
        } else {
            setProcessedData(safeData);
        }
    }, [worksheetData, activityType, styleSettings.smartPagination, styleSettings.columns]);

    // Native Wheel Listener to prevent default scroll and strictly zoom
    useEffect(() => {
        const scroller = scrollContainerRef.current;
        if (!scroller) return;

        const handleWheel = (e: WheelEvent) => {
            if (currentView !== 'generator' || processedData.length === 0 || isLoading) return;

            // PREVENT DEFAULT SCROLLING
            e.preventDefault();

            // ZOOM LOGIC
            const zoomSpeed = 0.0012;
            const delta = -e.deltaY * zoomSpeed;
            
            setScale(prevScale => {
                const newScale = Math.min(Math.max(0.3, prevScale + delta), 2.5);
                return newScale;
            });
        };

        // passive: false is critical to allow preventDefault()
        scroller.addEventListener('wheel', handleWheel, { passive: false });
        return () => scroller.removeEventListener('wheel', handleWheel);
    }, [currentView, processedData.length, isLoading]);

    const breadcrumbs = currentView === 'savedList' ? ['Ana Sayfa', 'Arşivim'] : 
                      currentView === 'workbook' ? ['Ana Sayfa', 'Kitapçık'] :
                      currentView === 'favorites' ? ['Ana Sayfa', 'Atölyem'] : ['Ana Sayfa'];

  return (
    <EditableContext.Provider value={{ isEditMode, zoom: scale }}>
    <main className={`flex-1 flex flex-col h-full bg-[var(--bg-primary)] overflow-hidden`}>
      
      {/* TOOLBAR */}
      <div className={`shrink-0 bg-[var(--bg-paper)] border-b border-[var(--border-color)] p-4 z-20 shadow-sm relative transition-all duration-300 ${zenMode ? 'hidden' : ''}`}>
          <div className="flex justify-between items-center mb-4">
              <nav className="flex items-center text-sm text-[var(--text-secondary)]">
                <ol className="flex items-center space-x-2">
                    {breadcrumbs.map((crumb, idx) => (
                        <li key={idx} className="flex items-center">
                            {idx > 0 && <i className="fa-solid fa-chevron-right text-[10px] mx-2 opacity-50"></i>}
                            <span onClick={() => idx === 0 && onBackToGenerator()} className={`${idx === breadcrumbs.length - 1 ? "font-bold text-[var(--accent-color)]" : "hover:text-[var(--text-primary)] cursor-pointer"}`}>{crumb}</span>
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
                    onFeedback={onFeedback}
                    onShare={() => setIsShareModalOpen(true)}
                    onTogglePreview={toggleZenMode}
                    isPreviewMode={zenMode}
                    onAddToWorkbook={() => onAddToWorkbook()}
                    workbookItemCount={workbookItems.length}
                    onToggleEdit={() => setIsEditMode(!isEditMode)} 
                    isEditMode={isEditMode} 
                    worksheetData={processedData}
                    isCurriculumMode={!!activeCurriculumSession}
                    onCompleteCurriculumTask={onCompleteCurriculumActivity}
                />
          )}
      </div>

      {/* VIEWPORT - NO WHEEL SCROLL ALLOWED */}
      <div 
        ref={scrollContainerRef}
        className={`flex-1 relative overflow-y-auto overflow-x-hidden scroll-smooth custom-scrollbar ${zenMode ? 'bg-zinc-900' : 'bg-zinc-100'}`}
      >
          {/* justify-start and items-start for fixed top anchoring */}
          <div className="w-full flex flex-col items-center justify-start min-h-full py-0">
            
            {currentView === 'generator' ? (
                <>
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center py-40 w-full animate-in fade-in">
                            <SkeletonLoader />
                            <p className="mt-6 font-black text-indigo-600 animate-pulse uppercase tracking-[0.3em]">AI Hazırlıyor...</p>
                        </div>
                    )}

                    {!isLoading && !error && processedData.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-40 w-full opacity-40">
                             <LandingText />
                             <p className="text-zinc-500 font-medium mt-4">Bir etkinlik seçin ve farkı görün.</p>
                        </div>
                    )}
                    
                    {error && (
                        <div className="bg-red-50 p-10 rounded-[3rem] border-2 border-red-100 text-center max-w-lg mt-20">
                            <i className="fa-solid fa-triangle-exclamation text-red-500 text-5xl mb-4"></i>
                            <p className="text-red-700 font-bold">{error}</p>
                        </div>
                    )}

                    {/* FIXED TOP CENTERING SCALING */}
                    {processedData.length > 0 && !isLoading && (
                        <div 
                            className="transition-transform duration-100 ease-out will-change-transform"
                            style={{ 
                                transform: `scale(${scale})`,
                                transformOrigin: 'top center',
                                marginTop: '20px', // Küçük bir estetik üst boşluk (zum merkezi etkilenmez)
                                marginBottom: '200px' // Alt tarafta nefes alma alanı
                            }}
                        >
                            <Worksheet 
                                activityType={activityType} 
                                data={processedData}
                                settings={styleSettings} 
                                studentProfile={studentProfile}
                            />
                        </div>
                    )}
                </>
            ) : (
                <div className="p-8 w-full max-w-7xl">
                    {currentView === 'savedList' ? (
                        <SavedWorksheetsView onLoad={onLoadSaved} onBack={onBackToGenerator} />
                    ) : currentView === 'workbook' ? (
                        <WorkbookView items={workbookItems} setItems={setWorkbookItems} settings={workbookSettings} setSettings={setWorkbookSettings} onBack={onBackToGenerator} />
                    ) : currentView === 'favorites' ? (
                        <FavoritesSection onSelectActivity={onSelectActivity!} onBack={onBackToGenerator} />
                    ) : currentView === 'shared' ? (
                        <SharedWorksheetsView onLoad={onLoadSaved} onBack={onBackToGenerator} />
                    ) : null}
                </div>
            )}
          </div>

          {/* ZOOM INDICATOR */}
          {processedData.length > 0 && !isLoading && currentView === 'generator' && (
              <div className="fixed bottom-10 right-10 z-50 bg-indigo-600 text-white px-5 py-2.5 rounded-2xl text-xs font-black shadow-2xl border-2 border-white/20 animate-in slide-in-from-right-4">
                  ÖLÇEK: %{Math.round(scale * 100)}
              </div>
          )}
      </div>

      <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} onShare={() => {}} />
    </main>
    </EditableContext.Provider>
  );
};

export default React.memo(ContentArea);
