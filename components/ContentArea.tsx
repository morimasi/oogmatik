import React, { memo, useState, useRef, useEffect, useCallback } from 'react';
import { ActivityType, WorksheetData, SavedWorksheet, SingleWorksheetData, StyleSettings, View, CollectionItem, WorkbookSettings, StudentProfile, SavedAssessment, OverlayItem, AssessmentReport } from '../types';
import Worksheet from './Worksheet';
import { Toolbar } from './Toolbar';
import { SavedWorksheetsView } from './SavedWorksheetsView';
import { SharedWorksheetsView } from './SharedWorksheetsView';
import { useAuth } from '../context/AuthContext';
import { ACTIVITIES, ACTIVITY_CATEGORIES } from '../constants';
import { SkeletonLoader } from './SkeletonLoader';
import { AssessmentModule } from './AssessmentModule';
import { FavoritesSection } from './FavoritesSection';
import { ShareModal } from './ShareModal';
import { worksheetService } from '../services/worksheetService';
import { WorkbookView } from './WorkbookView';
import { EditableContext } from './Editable';
import { DrawLayer } from './DrawLayer';
import { speechService } from '../utils/speechService';
import { paginationService } from '../services/paginationService';
// @ts-ignore
import html2canvas from 'html2canvas';


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
                
                return (
                    <span 
                        key={i} 
                        className={`inline-block ${isAnimated ? 'dyslexia-flip text-[var(--accent-color)]' : ''}`}
                        style={isAnimated ? { animationDelay: `${delay}s`, animationDuration: `${duration}s` } : {}}
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
  studentProfile,
  zenMode,
  toggleZenMode
}) => {
    const { user } = useAuth();
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false); 
    const [isDrawMode, setIsDrawMode] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [showQR, setShowQR] = useState(false);
    const [processedData, setProcessedData] = useState<WorksheetData>([]);
    
    // --- INFINITE CANVAS STATE ---
    const [scale, setScale] = useState(0.8);
    const [position, setPosition] = useState({ x: 0, y: 50 });
    const [isDragging, setIsDragging] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const lastMousePos = useRef({ x: 0, y: 0 });
    const canvasRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    
    // --- OVERLAY STATE ---
    const [overlayItems, setOverlayItems] = useState<OverlayItem[]>([]);
    
    // Data Processing & Reset
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
    }, [worksheetData, activityType, styleSettings.smartPagination, styleSettings.columns, styleSettings.scale, styleSettings.fontSize, styleSettings.margin]);

    // Initial Center
    useEffect(() => {
        if (processedData && processedData.length > 0) {
            centerCanvas();
        }
        setIsEditMode(false);
        setIsDrawMode(false);
        setOverlayItems([]); 
        speechService.stop();
        setIsSpeaking(false);
    }, [activityType, processedData?.length]);

    const centerCanvas = useCallback(() => {
        if (containerRef.current) {
            const viewportW = containerRef.current.clientWidth;
            // A4 dimensions at 96dpi approx
            const pageWidth = styleSettings.orientation === 'landscape' ? 1123 : 794;
            
            // Calculate scale to fit width with padding
            const targetScale = Math.min(0.9, (viewportW - 80) / pageWidth); 
            
            // Center horizontally
            const centeredX = (viewportW - (pageWidth * targetScale)) / 2;
            
            setScale(targetScale);
            setPosition({ x: centeredX, y: 50 });
            setCurrentPage(0);
        }
    }, [styleSettings.orientation]);

    const scrollToPage = (index: number) => {
        if (!containerRef.current) return;
        const viewportW = containerRef.current.clientWidth;
        
        const isLandscape = styleSettings.orientation === 'landscape';
        const PAGE_WIDTH_MM = isLandscape ? 297 : 210;
        const PAGE_HEIGHT_MM = isLandscape ? 210 : 297;
        const PX_PER_MM = 3.78;
        
        const PAGE_WIDTH_PX = PAGE_WIDTH_MM * PX_PER_MM;
        const PAGE_HEIGHT_PX = PAGE_HEIGHT_MM * PX_PER_MM;
        
        const VERTICAL_GAP = 64; // gap-16 (4rem)
        const VERTICAL_PADDING = 64; // py-16
        
        // Target Y position to center this page at top
        // The page's actual Y coordinate in the world is:
        const pageWorldY = VERTICAL_PADDING + index * (PAGE_HEIGHT_PX + VERTICAL_GAP);
        
        // We want this worldY to be at screen Y = 50px
        // equation: screenY = worldY * scale + translateY
        // translateY = screenY - (worldY * scale)
        const newY = 50 - (pageWorldY * scale);
        
        // Keep horizontal centering
        const newX = (viewportW - (PAGE_WIDTH_PX * scale)) / 2;

        setPosition({ x: newX, y: newY });
        setCurrentPage(index);
    };

    // --- CANVAS INTERACTION HANDLERS ---
    
    const handleWheel = useCallback((e: React.WheelEvent) => {
        if (currentView !== 'generator' || !processedData) return;
        
        if (e.ctrlKey || e.metaKey) {
            // ZOOM
            e.preventDefault();
            const zoomSensitivity = -0.001;
            const delta = e.deltaY * zoomSensitivity;
            const newScale = Math.min(Math.max(0.1, scale + delta), 4);
            
            // Zoom towards pointer
            const rect = containerRef.current!.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            // World coordinates before zoom
            const worldX = (mouseX - position.x) / scale;
            const worldY = (mouseY - position.y) / scale;
            
            // New position to keep world coordinate under mouse
            const newX = mouseX - worldX * newScale;
            const newY = mouseY - worldY * newScale;
            
            setScale(newScale);
            setPosition({ x: newX, y: newY });
        } else {
            // PAN (Regular scroll wheel)
            // Just move Y position, maybe X if shift held
            setPosition(prev => ({
                x: prev.x - (e.shiftKey ? e.deltaY : e.deltaX),
                y: prev.y - (e.shiftKey ? e.deltaX : e.deltaY)
            }));
        }
    }, [scale, position, currentView, processedData]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (currentView !== 'generator' || !processedData) return;
        // Check if clicking on interactive elements
        const target = e.target as HTMLElement;
        if (
            target.closest('button') || 
            target.closest('input') || 
            target.closest('.edit-handle') || 
            target.closest('.editable-element') || 
            target.isContentEditable
        ) return;

        // Middle mouse button or Spacebar+LeftClick triggers pan
        if (e.button === 1 || e.button === 0) { 
            setIsDragging(true);
            lastMousePos.current = { x: e.clientX, y: e.clientY };
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        e.preventDefault();
        
        const deltaX = e.clientX - lastMousePos.current.x;
        const deltaY = e.clientY - lastMousePos.current.y;
        
        setPosition(prev => ({
            x: prev.x + deltaX,
            y: prev.y + deltaY
        }));
        
        lastMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        const handleGlobalUp = () => setIsDragging(false);
        window.addEventListener('mouseup', handleGlobalUp);
        return () => window.removeEventListener('mouseup', handleGlobalUp);
    }, []);

    // --- OTHER ACTIONS ---
    const handleTakeSnapshot = async () => {
        const elements = document.querySelectorAll('.worksheet-item');
        if (!elements || elements.length === 0) return;
        const editIndicators = document.querySelectorAll('.edit-handle');
        editIndicators.forEach((el: any) => el.style.display = 'none');
        try {
            const canvas = await html2canvas(elements[0] as HTMLElement, { scale: 2, useCORS: true, backgroundColor: null });
            const link = document.createElement('a');
            link.download = `bursa-disleksi-snap-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            alert("Hata oluştu.");
        } finally {
            editIndicators.forEach((el: any) => el.style.display = '');
        }
    };

    const generateAutoName = () => {
        if (!activityType) return 'Kaydedilmiş Etkinlik';
        const activity = ACTIVITIES.find(a => a.id === activityType);
        const title = activity ? activity.title : activityType;
        const now = new Date();
        return `${studentProfile?.name ? studentProfile.name + ' - ' : ''}${title} ${now.toLocaleDateString()}`;
    };

    const handleSave = () => {
        if (activityType && processedData) {
            onSave(generateAutoName(), activityType, processedData);
        }
    }

    const handleShare = () => {
        if (!user) {
            if(confirm("Giriş yapmanız gerekiyor. Giriş ekranına gitmek ister misiniz?")) onOpenAuth();
            return;
        }
        if (activityType && processedData) setIsShareModalOpen(true);
    };

    const handleConfirmShare = async (receiverId: string) => {
        if (!user || !activityType || !processedData) return;
        setIsSharing(true);
        try {
            const name = generateAutoName();
            const activity = ACTIVITIES.find(a => a.id === activityType);
            const category = ACTIVITY_CATEGORIES.find(c => c.activities.includes(activityType)) || { id: 'general', title: 'Genel', icon: '', activities: [] };
            
            const worksheetToShare: SavedWorksheet = {
                id: 'temp-share',
                userId: user.id, 
                name, 
                activityType, 
                worksheetData: processedData,
                icon: activity!.icon,
                category: { id: category.id, title: category.title },
                createdAt: new Date().toISOString(),
                styleSettings: styleSettings,
                studentProfile: studentProfile || undefined
            };
    
            await worksheetService.shareWorksheet(worksheetToShare, user.id, user.name, receiverId);
            alert('Paylaşıldı!');
            setIsShareModalOpen(false);
        } catch (error) {
            alert('Paylaşım hatası.');
        } finally {
            setIsSharing(false);
        }
    };

    const handleAddToWorkbookFromReport = (assessment: SavedAssessment) => {
        const newItem: CollectionItem = {
            id: crypto.randomUUID(),
            activityType: ActivityType.ASSESSMENT_REPORT, 
            data: assessment, 
            settings: { ...styleSettings, showStudentInfo: false, showFooter: false },
            title: `Rapor: ${assessment.studentName}`
        };
        setWorkbookItems(prev => [...prev, newItem]);
    };

    const handleAddText = () => {
        setOverlayItems(prev => [...prev, { id: crypto.randomUUID(), type: 'text', content: 'Metin', x: 100, y: 100, pageIndex: currentPage }]);
        setIsEditMode(true); 
    };

    const handleAddSticker = (url: string) => {
        setOverlayItems(prev => [...prev, { id: crypto.randomUUID(), type: 'sticker', content: url, x: 150, y: 150, pageIndex: currentPage }]);
        setIsEditMode(true);
    };

    const handleSpeak = () => {
        if (!processedData || processedData.length === 0) return;
        const page = processedData[currentPage]; 
        const text = [page.title, page.instruction, page.story, page.prompt].filter(Boolean).join('. ');
        if (text) {
            setIsSpeaking(true);
            speechService.speak(text, () => setIsSpeaking(false));
        }
    };

    const handleStopSpeak = () => {
        speechService.stop();
        setIsSpeaking(false);
    };

    const getBreadcrumbs = () => {
        if (currentView === 'savedList') return ['Ana Sayfa', 'Arşivim'];
        if (currentView === 'shared') return ['Ana Sayfa', 'Paylaşılanlar'];
        if (currentView === 'assessment') return ['Ana Sayfa', 'Değerlendirme'];
        if (currentView === 'favorites') return ['Ana Sayfa', 'Favoriler'];
        if (currentView === 'workbook') return ['Ana Sayfa', 'Çalışma Kitapçığı'];
        if (currentView === 'generator' && activityType) {
            const act = ACTIVITIES.find(a => a.id === activityType);
            const cat = ACTIVITY_CATEGORIES.find(c => c.activities.includes(activityType));
            return ['Ana Sayfa', cat?.title || 'Kategori', act?.title || 'Etkinlik'];
        }
        return ['Ana Sayfa'];
    };

  return (
    <EditableContext.Provider value={{ isEditMode, zoom: scale }}>
    <main className={`flex-1 flex flex-col h-full bg-[var(--bg-primary)] transition-colors duration-300 overflow-hidden`}>
      
      {/* TOP BAR */}
      <div className={`shrink-0 bg-[var(--bg-paper)] border-b border-[var(--border-color)] p-3 z-20 shadow-sm relative transition-all duration-300 ${zenMode ? 'opacity-0 hover:opacity-100 absolute top-0 left-0 right-0' : ''}`}>
          {!zenMode && (
              <nav className="mb-2 flex items-center text-xs text-[var(--text-secondary)]">
                {getBreadcrumbs().map((crumb, idx) => (
                    <React.Fragment key={idx}>
                        <span onClick={() => idx === 0 && onBackToGenerator()} className={`cursor-pointer hover:text-[var(--accent-color)] ${idx===getBreadcrumbs().length-1?'font-bold text-[var(--text-primary)]':''}`}>{crumb}</span>
                        {idx < getBreadcrumbs().length - 1 && <i className="fa-solid fa-chevron-right text-[8px] mx-2 opacity-50"></i>}
                    </React.Fragment>
                ))}
              </nav>
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
                    onSnapshot={handleTakeSnapshot} 
                    onAddText={handleAddText}
                    onAddSticker={handleAddSticker}
                    isDrawMode={isDrawMode}
                    onToggleDraw={() => setIsDrawMode(!isDrawMode)}
                    onSpeak={handleSpeak}
                    isSpeaking={isSpeaking}
                    onStopSpeak={handleStopSpeak}
                    showQR={showQR}
                    onToggleQR={() => setShowQR(!showQR)}
                    worksheetData={processedData}
                />
          )}
      </div>

      {/* INFINITE CANVAS AREA */}
      <div 
        ref={containerRef}
        className={`flex-1 relative overflow-hidden bg-zinc-200 dark:bg-zinc-900 canvas-viewport ${zenMode ? 'bg-zinc-900' : ''}`}
        style={{ 
            cursor: isDragging ? 'grabbing' : (isEditMode ? 'default' : 'grab'),
            backgroundImage: `radial-gradient(#9ca3af 1px, transparent 1px)`,
            backgroundSize: `${20 * scale}px ${20 * scale}px`,
            backgroundPosition: `${position.x}px ${position.y}px`
        }}
        onWheel={currentView === 'generator' && processedData ? handleWheel : undefined}
        onMouseDown={currentView === 'generator' && processedData ? handleMouseDown : undefined}
        onMouseMove={currentView === 'generator' && processedData ? handleMouseMove : undefined}
        onMouseUp={currentView === 'generator' && processedData ? handleMouseUp : undefined}
      >
          {/* PAGE NAVIGATOR SIDEBAR */}
          {processedData && processedData.length > 1 && (
              <div className="absolute left-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2 p-2 bg-white/80 dark:bg-black/50 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 max-h-[70vh] overflow-y-auto custom-scrollbar transition-transform duration-300 hover:scale-105">
                  {processedData.map((_, i) => (
                      <button
                          key={i}
                          onClick={(e) => { e.stopPropagation(); scrollToPage(i); }}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shadow-sm transition-all ${
                              currentPage === i 
                              ? 'bg-indigo-600 text-white ring-2 ring-indigo-300' 
                              : 'bg-white text-zinc-600 hover:bg-indigo-50 dark:bg-zinc-800 dark:text-zinc-300'
                          }`}
                      >
                          {i+1}
                      </button>
                  ))}
              </div>
          )}

          {/* Mode Indicators */}
          {isEditMode && <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-2 rounded-full shadow-xl z-50 font-bold text-xs flex items-center gap-2 pointer-events-none"><i className="fa-solid fa-pen-ruler"></i> Düzenleme Modu</div>}
          {isDrawMode && <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-orange-600 text-white px-4 py-2 rounded-full shadow-xl z-50 font-bold text-xs flex items-center gap-2 pointer-events-none"><i className="fa-solid fa-pen-nib"></i> Çizim Modu</div>}
          
          {/* Zoom Controls */}
          {processedData && (
              <div className="absolute bottom-6 right-6 flex items-center gap-1 bg-white dark:bg-zinc-800 p-1 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700 z-50">
                  <button onClick={() => setScale(s => Math.max(0.1, s - 0.1))} className="w-8 h-8 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded"><i className="fa-solid fa-minus"></i></button>
                  <span className="text-xs font-mono font-bold w-10 text-center">{Math.round(scale * 100)}%</span>
                  <button onClick={() => setScale(s => Math.min(4, s + 0.1))} className="w-8 h-8 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded"><i className="fa-solid fa-plus"></i></button>
                  <button onClick={centerCanvas} className="w-8 h-8 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded border-l ml-1"><i className="fa-solid fa-expand"></i></button>
              </div>
          )}

          {currentView === 'generator' ? (
            <>
                {error && !error.startsWith("Bilgi:") && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-2xl border-2 border-red-500 z-50 max-w-md text-center">
                        <i className="fa-solid fa-circle-exclamation text-4xl text-red-500 mb-4"></i>
                        <h3 className="text-xl font-bold mb-2">Hata</h3>
                        <p className="text-zinc-600 dark:text-zinc-300 mb-4">{error}</p>
                        <button onClick={onBackToGenerator} className="bg-zinc-900 text-white px-6 py-2 rounded-lg">Geri Dön</button>
                    </div>
                )}

                {isLoading && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-black/80 backdrop-blur-sm">
                         <div className="text-center">
                             <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                             <p className="font-bold text-indigo-600 animate-pulse">İçerik Hazırlanıyor...</p>
                         </div>
                    </div>
                )}

                {!isLoading && !error && (!processedData || processedData.length === 0) && (
                     <div className="flex flex-col items-center justify-center h-full w-full pointer-events-none select-none opacity-50">
                         <i className="fa-solid fa-wand-magic-sparkles text-6xl mb-4 text-zinc-300"></i>
                         <p className="text-xl font-bold text-zinc-400">Bir etkinlik seçin ve oluşturun.</p>
                    </div>
                )}
                
                {/* TRANSFORM LAYER */}
                {processedData && processedData.length > 0 && (
                    <div 
                        className="absolute origin-top-left transition-transform duration-75 ease-out will-change-transform"
                        style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${scale})` }}
                    >
                        <DrawLayer isActive={isDrawMode} zoom={scale} />
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
            <div className="absolute inset-0 overflow-y-auto p-4"><SavedWorksheetsView onLoad={onLoadSaved} onBack={onBackToGenerator} /></div>
          ) : currentView === 'shared' ? (
            <div className="absolute inset-0 overflow-y-auto p-4"><SharedWorksheetsView onLoad={onLoadSaved} onBack={onBackToGenerator} /></div>
          ) : currentView === 'assessment' ? (
              <div className="absolute inset-0 overflow-y-auto bg-white dark:bg-zinc-900">
                  <AssessmentModule onBack={onBackToGenerator} onSelectActivity={id => {if(onSelectActivity) onSelectActivity(id)}} onAddToWorkbook={handleAddToWorkbookFromReport} onAutoGenerateWorkbook={onAutoGenerateWorkbook} />
              </div>
          ) : currentView === 'favorites' ? (
              <div className="absolute inset-0 overflow-y-auto bg-white dark:bg-zinc-900"><FavoritesSection onSelectActivity={id => {if(onSelectActivity) onSelectActivity(id)}} onBack={onBackToGenerator} /></div>
          ) : currentView === 'workbook' ? (
              <div className="absolute inset-0 overflow-y-auto bg-white dark:bg-zinc-900"><WorkbookView items={workbookItems} setItems={setWorkbookItems} settings={workbookSettings} setSettings={setWorkbookSettings} onBack={onBackToGenerator} /></div>
          ) : null}

        <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} onShare={handleConfirmShare} isSending={isSharing} />
      </div>
    </main>
    </EditableContext.Provider>
  );
};

export default React.memo(ContentArea);