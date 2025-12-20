
import React, { memo, useState, useRef, useEffect, useCallback } from 'react';
import { ActivityType, WorksheetData, SavedWorksheet, SingleWorksheetData, StyleSettings, View, CollectionItem, WorkbookSettings, StudentProfile, SavedAssessment, OverlayItem, AssessmentReport } from '../types';
import Worksheet from './Worksheet';
import { Toolbar } from './Toolbar';
import { SavedWorksheetsView } from './SavedWorksheetsView';
import { SharedWorksheetsView } from './SharedWorksheetsView';
import { useAuth } from '../context/AuthContext';
import { ACTIVITIES } from '../constants';
import { SkeletonLoader } from './SkeletonLoader';
import { AssessmentModule } from './AssessmentModule';
import { FavoritesSection } from './FavoritesSection';
import { ShareModal } from './ShareModal';
import { WorkbookView } from './WorkbookView';
import { EditableContext } from './Editable';
import { speechService } from '../utils/speechService';
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
                const delay = Math.random() * -5;
                const duration = 4 + Math.random() * 4;
                return <span key={i} className={`inline-block ${isAnimated ? 'dyslexia-flip text-[var(--accent-color)]' : ''}`} style={isAnimated ? { animationDelay: `${delay}s`, animationDuration: `${duration}s` } : {}}>{char}</span>;
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
    
    // --- SMART PAGINATION STATE ---
    const [processedData, setProcessedData] = useState<WorksheetData>([]);

    useEffect(() => {
        if (!worksheetData) {
            setProcessedData([]);
            return;
        }
        
        if (activityType) {
            const paged = paginationService.process(worksheetData, activityType, styleSettings);
            setProcessedData(paged);
        } else {
            setProcessedData(worksheetData);
        }
    }, [worksheetData, activityType, styleSettings.smartPagination, styleSettings.columns]); 

    useEffect(() => {
        if (activityType) {
            const activity = ACTIVITIES.find(a => a.id === activityType);
            if (activity && activity.defaultStyle) {
                onStyleChange({ ...styleSettings, ...activity.defaultStyle });
            }
        }
    }, [activityType]);
    
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [showQR, setShowQR] = useState(false);
    const [scale, setScale] = useState(0.65);
    const [position, setPosition] = useState({ x: 0, y: 50 });
    const [isDragging, setIsDragging] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const lastMousePos = useRef({ x: 0, y: 0 });
    const canvasRef = useRef<HTMLDivElement>(null);
    const [overlayItems, setOverlayItems] = useState<OverlayItem[]>([]);
    
    useEffect(() => {
        if (processedData && processedData.length > 0) {
            centerCanvas();
        }
        setIsEditMode(false);
        setOverlayItems([]); 
        if (speechService.isActive()) {
            speechService.stop();
            setIsSpeaking(false);
        }
    }, [activityType, processedData?.length]);

    const centerCanvas = useCallback(() => {
        if (canvasRef.current) {
            const viewportW = canvasRef.current.clientWidth;
            const pageWidth = styleSettings.orientation === 'landscape' ? 1123 : 794;
            const initialScale = Math.min(0.85, (viewportW - 100) / pageWidth); 
            const centeredX = (viewportW - (pageWidth * initialScale)) / 2;
            setScale(initialScale);
            setPosition({ x: centeredX, y: 40 });
            setCurrentPage(0);
        }
    }, [styleSettings.orientation]);

    const scrollToPage = (index: number) => {
        if (!canvasRef.current) return;
        const viewportW = canvasRef.current.clientWidth;
        const isLandscape = styleSettings.orientation === 'landscape';
        const PX_PER_MM = 3.78;
        const PAGE_HEIGHT_PX = (isLandscape ? 210 : 297) * PX_PER_MM;
        const VERTICAL_GAP = 100;
        const VERTICAL_PADDING = 100;
        const pageTopY = VERTICAL_PADDING + index * (PAGE_HEIGHT_PX + VERTICAL_GAP);
        setPosition(prev => ({ ...prev, y: 50 - (pageTopY * scale) }));
        setCurrentPage(index);
    };

    const handleWheel = useCallback((e: React.WheelEvent) => {
        if (currentView !== 'generator' || !processedData) return;
        if (e.ctrlKey) e.preventDefault();
        const zoomSensitivity = -0.001; 
        const delta = e.deltaY * zoomSensitivity;
        const newScale = Math.min(Math.max(0.2, scale + delta), 4);
        const rect = canvasRef.current!.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const canvasX = (mouseX - position.x) / scale;
        const canvasY = (mouseY - position.y) / scale;
        const newX = mouseX - canvasX * newScale;
        const newY = mouseY - canvasY * newScale;
        setScale(newScale);
        setPosition({ x: newX, y: newY });
    }, [scale, position, currentView, processedData]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (currentView !== 'generator' || !processedData) return;
        const target = e.target as HTMLElement;
        if (target.closest('button') || target.closest('input') || target.closest('.edit-handle') || target.closest('.editable-element') || target.tagName === 'TEXTAREA') return;
        setIsDragging(true);
        lastMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        e.preventDefault();
        const deltaX = e.clientX - lastMousePos.current.x;
        const deltaY = e.clientY - lastMousePos.current.y;
        setPosition(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
        lastMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => setIsDragging(false);

    useEffect(() => {
        const handleGlobalUp = () => setIsDragging(false);
        window.addEventListener('mouseup', handleGlobalUp);
        return () => window.removeEventListener('mouseup', handleGlobalUp);
    }, []);

    const generateAutoName = () => { return 'Etkinlik'; };
    const handleSave = () => { if (activityType && processedData) onSave(generateAutoName(), activityType, processedData); }
    const handleShare = () => { if(!user) { onOpenAuth(); return; } setIsShareModalOpen(true); };
    const handleConfirmShare = async (receiverId: string) => { setIsShareModalOpen(false); };

    const getBreadcrumbs = () => {
        if (currentView === 'savedList') return ['Ana Sayfa', 'Arşivim'];
        if (currentView === 'workbook') return ['Ana Sayfa', 'Kitapçık'];
        if (currentView === 'favorites') return ['Ana Sayfa', 'Atölyem'];
        if (currentView === 'shared') return ['Ana Sayfa', 'Paylaşılanlar'];
        return ['Ana Sayfa'];
    };
    const breadcrumbs = getBreadcrumbs();

  return (
    <EditableContext.Provider value={{ isEditMode, zoom: scale }}>
    <main className={`flex-1 flex flex-col h-full bg-[var(--bg-primary)] transition-colors duration-300 overflow-hidden`}>
      
      {/* 1. TOP BAR */}
      <div className={`shrink-0 bg-[var(--bg-paper)] border-b border-[var(--border-color)] p-4 z-20 shadow-sm relative transition-all duration-300 ${zenMode ? 'opacity-0 hover:opacity-100 absolute top-0 left-0 right-0' : ''}`}>
          {!zenMode && (
              <div className="flex justify-between items-center mb-4">
                  <nav className="flex items-center text-sm text-[var(--text-secondary)]" aria-label="Breadcrumb">
                    <ol className="flex items-center space-x-2">
                        {breadcrumbs.map((crumb, idx) => (
                            <li key={idx} className="flex items-center">
                                {idx > 0 && <i className="fa-solid fa-chevron-right text-[10px] mx-2 opacity-50"></i>}
                                <span onClick={() => { if(idx === 0) onBackToGenerator(); }} className={`${idx === breadcrumbs.length - 1 ? "font-bold text-[var(--accent-color)]" : "hover:text-[var(--text-primary)] cursor-pointer"}`}>{crumb}</span>
                            </li>
                        ))}
                    </ol>
                  </nav>
              </div>
          )}

          {currentView === 'generator' && activityType && processedData && (
                <Toolbar 
                    settings={styleSettings} 
                    onSettingsChange={onStyleChange} 
                    onSave={handleSave} 
                    onFeedback={onFeedback}
                    onShare={handleShare}
                    onTogglePreview={toggleZenMode}
                    isPreviewMode={zenMode}
                    onAddToWorkbook={onAddToWorkbook}
                    workbookItemCount={workbookItems.length}
                    onViewWorkbook={() => {}}
                    onToggleEdit={() => setIsEditMode(!isEditMode)} 
                    isEditMode={isEditMode} 
                    onSnapshot={() => {}} 
                    onAddText={() => {}}
                    onAddSticker={() => {}}
                    onSpeak={() => {}}
                    isSpeaking={isSpeaking}
                    onStopSpeak={() => {}}
                    showQR={showQR}
                    onToggleQR={() => setShowQR(!showQR)}
                    worksheetData={processedData}
                    isCurriculumMode={!!activeCurriculumSession}
                    onCompleteCurriculumTask={onCompleteCurriculumActivity}
                />
          )}
      </div>

      {/* 2. MAIN CANVAS AREA */}
      <div 
        ref={canvasRef}
        className={`flex-1 relative overflow-hidden bg-[var(--bg-primary)] ${zenMode ? 'bg-black' : ''} group`}
        style={{ 
            cursor: isDragging ? 'grabbing' : (isEditMode ? 'default' : 'grab'),
            backgroundImage: `radial-gradient(var(--border-color) 1px, transparent 1px)`,
            backgroundSize: `${20 * scale}px ${20 * scale}px`,
            backgroundPosition: `${position.x}px ${position.y}px`
        }}
        onWheel={currentView === 'generator' && processedData ? handleWheel : undefined}
        onMouseDown={currentView === 'generator' && processedData ? handleMouseDown : undefined}
        onMouseMove={currentView === 'generator' && processedData ? handleMouseMove : undefined}
        onMouseUp={currentView === 'generator' && processedData ? handleMouseUp : undefined}
      >
          {/* PAGE NAVIGATOR SIDEBAR */}
          {processedData && processedData.length > 1 && currentView === 'generator' && (
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-50 transition-all duration-300 opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-0">
                  <div className="bg-white/80 dark:bg-black/50 backdrop-blur-md p-2 rounded-2xl shadow-xl border border-white/20 flex flex-col gap-2 max-h-[70vh] overflow-y-auto custom-scrollbar">
                      {processedData.map((_, i) => (
                          <button
                              key={i}
                              onClick={(e) => { e.stopPropagation(); scrollToPage(i); }}
                              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-all flex-shrink-0 ${
                                  currentPage === i 
                                  ? 'bg-indigo-600 text-white scale-110 ring-2 ring-indigo-300' 
                                  : 'bg-white text-zinc-600 hover:bg-indigo-50 dark:bg-zinc-800 dark:text-zinc-300'
                              }`}
                          >
                              {i+1}
                          </button>
                      ))}
                  </div>
              </div>
          )}

          {/* FLOATING ZOOM CONTROLS */}
          {processedData && currentView === 'generator' && (
              <div className="absolute bottom-6 right-6 flex items-center gap-2 bg-white dark:bg-zinc-800 p-1 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700 z-50">
                  <button onClick={() => setScale(s => Math.max(0.1, s - 0.1))} className="w-8 h-8 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-300"><i className="fa-solid fa-minus"></i></button>
                  <span className="text-xs font-mono font-bold w-12 text-center text-zinc-800 dark:text-zinc-200">{Math.round(scale * 100)}%</span>
                  <button onClick={() => setScale(s => Math.min(5, s + 0.1))} className="w-8 h-8 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-300"><i className="fa-solid fa-plus"></i></button>
                  <button onClick={centerCanvas} className="w-8 h-8 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-300 border-l dark:border-zinc-700 ml-1"><i className="fa-solid fa-expand"></i></button>
              </div>
          )}

          {currentView === 'generator' ? (
            <>
                {isLoading && (
                    <div className="flex flex-col items-center justify-center absolute inset-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm pointer-events-none">
                        <SkeletonLoader />
                    </div>
                )}

                {!isLoading && !error && (!processedData || processedData.length === 0) && (
                     <div className="flex flex-col items-center justify-center h-full w-full pointer-events-none">
                         <div className="text-center p-8 max-w-3xl bg-[var(--panel-bg)] backdrop-blur-sm rounded-3xl border border-[var(--border-color)] shadow-2xl w-full mx-4">
                            <LandingText />
                        </div>
                    </div>
                )}
                
                {processedData && processedData.length > 0 && (
                    <div 
                        className="absolute origin-top-left transition-transform duration-75 ease-out will-change-transform"
                        style={{ 
                            transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${scale})`,
                        }}
                    >
                        <Worksheet 
                            activityType={activityType} 
                            data={processedData}
                            settings={styleSettings} 
                            studentProfile={studentProfile}
                            overlayItems={overlayItems}
                            showQR={showQR}
                        />
                    </div>
                )}
            </>
          ) : currentView === 'savedList' ? (
            <div className="w-full max-w-7xl h-full overflow-y-auto mx-auto p-4 absolute inset-0 custom-scrollbar">
                <SavedWorksheetsView onLoad={onLoadSaved} onBack={onBackToGenerator} />
            </div>
          ) : currentView === 'workbook' ? (
            <div className="w-full h-full overflow-y-auto absolute inset-0 custom-scrollbar bg-zinc-100 dark:bg-zinc-950">
                <WorkbookView 
                    items={workbookItems} 
                    setItems={setWorkbookItems} 
                    settings={workbookSettings} 
                    setSettings={setWorkbookSettings} 
                    onBack={onBackToGenerator} 
                />
            </div>
          ) : currentView === 'favorites' ? (
            <div className="w-full h-full overflow-y-auto absolute inset-0 custom-scrollbar">
                <FavoritesSection 
                    onSelectActivity={(id) => { if(onSelectActivity) onSelectActivity(id); }} 
                    onBack={onBackToGenerator} 
                />
            </div>
          ) : currentView === 'shared' ? (
            <div className="w-full max-w-7xl h-full overflow-y-auto mx-auto p-4 absolute inset-0 custom-scrollbar">
                <SharedWorksheetsView onLoad={onLoadSaved} onBack={onBackToGenerator} />
            </div>
          ) : null}

        <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} onShare={handleConfirmShare} />
      </div>
    </main>
    </EditableContext.Provider>
  );
};

export default React.memo(ContentArea);
