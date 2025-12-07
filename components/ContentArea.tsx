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
  // Workbook Props
  workbookItems: CollectionItem[];
  setWorkbookItems: React.Dispatch<React.SetStateAction<CollectionItem[]>>;
  workbookSettings: WorkbookSettings;
  setWorkbookSettings: React.Dispatch<React.SetStateAction<WorkbookSettings>>;
  onAddToWorkbook: () => void;
  onAutoGenerateWorkbook?: (report: AssessmentReport) => void;
  studentProfile?: StudentProfile | null;
  // Zen Mode
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
    
    // --- SMART PAGINATION STATE ---
    const [processedData, setProcessedData] = useState<WorksheetData>([]);

    // Process data whenever raw data or relevant settings change
    useEffect(() => {
        if (!worksheetData) {
            setProcessedData([]);
            return;
        }
        
        if (activityType) {
            // Apply Dynamic Pagination Logic
            const paged = paginationService.process(worksheetData, activityType, styleSettings);
            setProcessedData(paged);
        } else {
            setProcessedData(worksheetData);
        }
    }, [worksheetData, activityType, styleSettings.smartPagination, styleSettings.columns, styleSettings.scale, styleSettings.fontSize, styleSettings.margin]);

    
    // Phase 4: TTS & QR
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [showQR, setShowQR] = useState(false);
    
    // --- INFINITE CANVAS STATE ---
    const [scale, setScale] = useState(0.8); // Start slightly zoomed out to see full page
    const [position, setPosition] = useState({ x: 0, y: 50 }); // Initial padding
    const [isDragging, setIsDragging] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const lastMousePos = useRef({ x: 0, y: 0 });
    const canvasRef = useRef<HTMLDivElement>(null);
    
    // --- OVERLAY STATE ---
    const [overlayItems, setOverlayItems] = useState<OverlayItem[]>([]);
    
    // Reset canvas when activity changes or data loads
    useEffect(() => {
        if (processedData && processedData.length > 0) {
            centerCanvas();
        }
        setIsEditMode(false);
        setIsDrawMode(false);
        setOverlayItems([]); 
        
        if (speechService.isActive()) {
            speechService.stop();
            setIsSpeaking(false);
        }
    }, [activityType, processedData?.length]); // Dep changed to processedData length to recenter on repagination

    const centerCanvas = useCallback(() => {
        if (canvasRef.current) {
            const viewportW = canvasRef.current.clientWidth;
            // A4 Width approx 794px at 96 DPI (210mm). 
            // We want to center it horizontally.
            // Initial scale 0.8 is usually good for desktop.
            const pageWidth = styleSettings.orientation === 'landscape' ? 1123 : 794;
            const initialScale = Math.min(0.9, (viewportW - 100) / pageWidth); 
            const centeredX = (viewportW - (pageWidth * initialScale)) / 2;
            
            setScale(initialScale);
            setPosition({ x: centeredX, y: 40 });
            setCurrentPage(0);
        }
    }, [styleSettings.orientation]);

    const scrollToPage = (index: number) => {
        if (!canvasRef.current) return;
        const viewportW = canvasRef.current.clientWidth;
        
        // A4 Dimensions (Approx 96 DPI)
        // 210mm x 297mm | 1mm ~ 3.78px
        const isLandscape = styleSettings.orientation === 'landscape';
        const PAGE_WIDTH_MM = isLandscape ? 297 : 210;
        const PAGE_HEIGHT_MM = isLandscape ? 210 : 297;
        
        const PX_PER_MM = 3.78;
        const PAGE_WIDTH_PX = PAGE_WIDTH_MM * PX_PER_MM;
        const PAGE_HEIGHT_PX = PAGE_HEIGHT_MM * PX_PER_MM;
        
        const VERTICAL_GAP = 64; // gap-16 (4rem)
        const VERTICAL_PADDING = 64; // py-16 (4rem)
        
        // Calculate center target
        // We want the top of the selected page to be at ~50px from top of viewport
        const pageTopY = VERTICAL_PADDING + index * (PAGE_HEIGHT_PX + VERTICAL_GAP);
        const targetViewportY = 50; 
        
        // formula: pageTopY * scale + translateY = targetViewportY
        // translateY = targetViewportY - (pageTopY * scale)
        const newY = targetViewportY - (pageTopY * scale);
        
        // Keep X centered
        const newX = (viewportW - (PAGE_WIDTH_PX * scale)) / 2;

        setPosition({ x: newX, y: newY });
        setCurrentPage(index);
    };

    // --- CANVAS INTERACTION HANDLERS ---

    const handleWheel = useCallback((e: React.WheelEvent) => {
        // Only zoom if we are in generator view and have data
        if (currentView !== 'generator' || !processedData) return;
        
        // Prevent default browser zoom if ctrl is pressed (optional, browsers handle this differently)
        if (e.ctrlKey) e.preventDefault();

        // Zoom sensitivity
        const zoomSensitivity = -0.001; 
        const delta = e.deltaY * zoomSensitivity;
        const newScale = Math.min(Math.max(0.2, scale + delta), 4);
        
        // Calculate zoom to pointer logic
        // 1. Get mouse position relative to canvas container
        const rect = canvasRef.current!.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // 2. Calculate point on canvas (world space) before zoom
        const canvasX = (mouseX - position.x) / scale;
        const canvasY = (mouseY - position.y) / scale;

        // 3. Calculate new position to keep that point under mouse
        const newX = mouseX - canvasX * newScale;
        const newY = mouseY - canvasY * newScale;

        setScale(newScale);
        setPosition({ x: newX, y: newY });
    }, [scale, position, currentView, processedData]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (currentView !== 'generator' || !processedData) return;
        
        // Don't drag if clicking interactive elements (inputs, edit handles)
        const target = e.target as HTMLElement;
        if (target.closest('button') || target.closest('input') || target.closest('.edit-handle') || target.closest('.editable-element') || target.tagName === 'TEXTAREA') {
            return;
        }

        setIsDragging(true);
        lastMousePos.current = { x: e.clientX, y: e.clientY };
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

    // Global mouse up to catch drags that leave the window
    useEffect(() => {
        const handleGlobalUp = () => setIsDragging(false);
        window.addEventListener('mouseup', handleGlobalUp);
        return () => window.removeEventListener('mouseup', handleGlobalUp);
    }, []);


    const handleTakeSnapshot = async () => {
        const elements = document.querySelectorAll('.worksheet-item');
        if (!elements || elements.length === 0) return;

        // Hide edit handles temporarily
        const editIndicators = document.querySelectorAll('.edit-handle');
        editIndicators.forEach((el: any) => el.style.display = 'none');

        try {
            // We take only the first page for snapshot thumbnail
            const canvas = await html2canvas(elements[0] as HTMLElement, {
                scale: 2, 
                useCORS: true, 
                backgroundColor: null 
            });

            const link = document.createElement('a');
            const activityName = activityType ? activityType.replace(/_/g, '-').toLowerCase() : 'etkinlik';
            link.download = `bursa-disleksi-${activityName}-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();

        } catch (err) {
            console.error("Snapshot failed:", err);
            alert("Ekran görüntüsü alınırken bir hata oluştu.");
        } finally {
            editIndicators.forEach((el: any) => el.style.display = '');
        }
    };

    const generateAutoName = () => {
        if (!activityType) return 'Kaydedilmiş Etkinlik';
        const activity = ACTIVITIES.find(a => a.id === activityType);
        const title = activity ? activity.title : activityType;
        
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        const hour = String(now.getHours()).padStart(2, '0');
        const minute = String(now.getMinutes()).padStart(2, '0');
        
        const prefix = studentProfile?.name ? `${studentProfile.name} - ` : '';
        return `${prefix}${title} - ${day}.${month}.${year} ${hour}:${minute}`;
    };

    const handleSave = () => {
        if (activityType && processedData) {
            const name = generateAutoName();
            onSave(name, activityType, processedData);
        }
    }

    const handleShare = () => {
        if (!user) {
            if(confirm("Paylaşım yapabilmek için lütfen önce sisteme kaydolun veya giriş yapın. Giriş ekranına gitmek ister misiniz?")) {
                onOpenAuth();
            }
            return;
        }
        if (!activityType || !processedData) return;
        setIsShareModalOpen(true);
    };

    const handleConfirmShare = async (receiverId: string) => {
        if (!user || !activityType || !processedData) return;
        setIsSharing(true);
        try {
            const name = generateAutoName();
            const activity = ACTIVITIES.find(a => a.id === activityType);
            const category = ACTIVITY_CATEGORIES.find(c => c.activities.includes(activityType)) || { 
                id: 'general', 
                title: 'Genel', 
                icon: 'fa-solid fa-folder', 
                activities: [] 
            };
            
            const worksheetToShare: SavedWorksheet = {
                id: 'temp-share-id',
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
            await onSave(name, activityType, processedData);
            
            alert('Etkinlik paylaşıldı ve arşivinize kaydedildi!');
            setIsShareModalOpen(false);
        } catch (error) {
            console.error("Anında paylaşım hatası:", error);
            alert('Paylaşım sırasında bir hata oluştu.');
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

    // --- OVERLAY HANDLERS ---
    const handleAddText = () => {
        const newItem: OverlayItem = {
            id: crypto.randomUUID(),
            type: 'text',
            content: 'Metin',
            x: 100, 
            y: 100,
            pageIndex: currentPage 
        };
        setOverlayItems(prev => [...prev, newItem]);
        setIsEditMode(true); 
    };

    const handleAddSticker = (url: string) => {
        const newItem: OverlayItem = {
            id: crypto.randomUUID(),
            type: 'sticker',
            content: url,
            x: 150,
            y: 150,
            pageIndex: currentPage
        };
        setOverlayItems(prev => [...prev, newItem]);
        setIsEditMode(true);
    };

    // --- PHASE 4: TTS HANDLER ---
    const handleSpeak = () => {
        if (!processedData || processedData.length === 0) return;
        const page = processedData[currentPage]; 
        const parts = [];
        if (page.title) parts.push(page.title);
        if (page.instruction) parts.push(page.instruction);
        if (page.story) parts.push(page.story);
        if (page.prompt) parts.push(page.prompt);
        if (page.questions) parts.push("Sorular başlıyor.");
        
        const fullText = parts.join('. ');
        
        if (fullText) {
            setIsSpeaking(true);
            speechService.speak(fullText, () => setIsSpeaking(false));
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
            const cat = ACTIVITY_CATEGORIES.find(c => c.activities.includes(activityType || '' as ActivityType));
            return ['Ana Sayfa', cat?.title || 'Kategori', act?.title || 'Etkinlik'];
        }
        return ['Ana Sayfa'];
    };

    const breadcrumbs = getBreadcrumbs();

  return (
    <EditableContext.Provider value={{ isEditMode, zoom: scale }}>
    <main className={`flex-1 flex flex-col h-full bg-[var(--bg-primary)] transition-colors duration-300 overflow-hidden`}>
      
      {/* 1. TOP BAR (Toolbar & Breadcrumbs) - Fixed Height */}
      <div className={`shrink-0 bg-[var(--bg-paper)] border-b border-[var(--border-color)] p-4 z-20 shadow-sm relative transition-all duration-300 ${zenMode ? 'opacity-0 hover:opacity-100 absolute top-0 left-0 right-0' : ''}`}>
          {!zenMode && (
              <nav className="mb-4 flex items-center text-sm text-[var(--text-secondary)]" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-2">
                    {breadcrumbs.map((crumb, idx) => (
                        <li key={idx} className="flex items-center">
                            {idx > 0 && <i className="fa-solid fa-chevron-right text-[10px] mx-2 opacity-50"></i>}
                            <span 
                                onClick={() => { if(idx === 0) onBackToGenerator(); }}
                                className={`${idx === breadcrumbs.length - 1 ? "font-bold text-[var(--accent-color)]" : "hover:text-[var(--text-primary)] cursor-pointer"}`}
                            >
                                {crumb}
                            </span>
                        </li>
                    ))}
                </ol>
              </nav>
          )}

          {/* TOOLBAR */}
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
                    // TTS
                    onSpeak={handleSpeak}
                    isSpeaking={isSpeaking}
                    onStopSpeak={handleStopSpeak}
                    // QR
                    showQR={showQR}
                    onToggleQR={() => setShowQR(!showQR)}
                    worksheetData={processedData}
                />
          )}
      </div>

      {/* 2. MAIN CANVAS AREA (Infinite Canvas) */}
      <div 
        ref={canvasRef}
        className={`flex-1 relative overflow-hidden bg-zinc-200 dark:bg-zinc-900 canvas-viewport ${zenMode ? 'bg-zinc-900' : ''} group`}
        style={{ 
            cursor: isDragging ? 'grabbing' : (isEditMode ? 'default' : 'grab'),
            // Dot Pattern Background that scales with canvas
            backgroundImage: `radial-gradient(#9ca3af 1px, transparent 1px)`,
            backgroundSize: `${20 * scale}px ${20 * scale}px`,
            backgroundPosition: `${position.x}px ${position.y}px`
        }}
        onWheel={currentView === 'generator' && processedData ? handleWheel : undefined}
        onMouseDown={currentView === 'generator' && processedData ? handleMouseDown : undefined}
        onMouseMove={currentView === 'generator' && processedData ? handleMouseMove : undefined}
        onMouseUp={currentView === 'generator' && processedData ? handleMouseUp : undefined}
      >
          {/* PAGE NAVIGATOR SIDEBAR (VISIBLE ON HOVER) */}
          {processedData && processedData.length > 1 && (
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
                              title={`${i+1}. Sayfa`}
                          >
                              {i+1}
                          </button>
                      ))}
                  </div>
              </div>
          )}

          {/* Mode Overlay Info */}
          {isEditMode && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-2 rounded-full shadow-xl z-50 font-bold text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-4 pointer-events-none sticky">
                  <i className="fa-solid fa-pen-ruler"></i> Düzenleme Modu
              </div>
          )}
          {isDrawMode && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-orange-600 text-white px-4 py-2 rounded-full shadow-xl z-50 font-bold text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-4 pointer-events-none sticky">
                  <i className="fa-solid fa-pen-nib"></i> Çizim Modu
              </div>
          )}
          
          {/* FLOATING ZOOM CONTROLS */}
          {processedData && (
              <div className="absolute bottom-6 right-6 flex items-center gap-2 bg-white dark:bg-zinc-800 p-1 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700 z-50">
                  <button onClick={() => setScale(s => Math.max(0.1, s - 0.1))} className="w-8 h-8 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-300">
                      <i className="fa-solid fa-minus"></i>
                  </button>
                  <span className="text-xs font-mono font-bold w-12 text-center text-zinc-800 dark:text-zinc-200">{Math.round(scale * 100)}%</span>
                  <button onClick={() => setScale(s => Math.min(5, s + 0.1))} className="w-8 h-8 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-300">
                      <i className="fa-solid fa-plus"></i>
                  </button>
                  <button onClick={centerCanvas} className="w-8 h-8 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-300 border-l dark:border-zinc-700 ml-1" title="Merkezle">
                      <i className="fa-solid fa-expand"></i>
                  </button>
              </div>
          )}

          {currentView === 'generator' ? (
            <>
                {/* ERROR STATE */}
                {error && !error.startsWith("Bilgi:") && (
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4 pointer-events-none">
                        <div className="bg-[var(--bg-paper)] border-2 border-red-500/30 rounded-2xl shadow-xl overflow-hidden pointer-events-auto">
                            <div className="bg-red-50 p-4 flex justify-center">
                                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                    <i className="fa-solid fa-circle-exclamation text-3xl text-white"></i>
                                </div>
                            </div>
                            <div className="p-8 text-center">
                                <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Bir Sorun Oluştu</h3>
                                <p className="text-[var(--text-secondary)] mb-6">{error}</p>
                                <button onClick={onBackToGenerator} className="w-full bg-[var(--accent-color)] text-black hover:bg-[var(--accent-hover)] font-bold py-3 px-4 rounded-xl transition-colors">Ayarlara Dön</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* LOADING STATE */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center absolute inset-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm pointer-events-none">
                        <div className="text-center mb-8">
                            <p className="text-lg font-semibold text-[var(--accent-color)] animate-pulse">
                                <i className="fa-solid fa-wand-magic-sparkles mr-2"></i>
                                Yapay zeka etkinliğinizi hazırlıyor...
                            </p>
                        </div>
                        <SkeletonLoader />
                    </div>
                )}

                {/* WELCOME / EMPTY STATE */}
                {!isLoading && !error && (!processedData || processedData.length === 0) && (
                     <div className="flex flex-col items-center justify-center h-full w-full pointer-events-none">
                         <div className="text-center p-8 max-w-3xl bg-[var(--panel-bg)] backdrop-blur-sm rounded-3xl border border-[var(--border-color)] shadow-2xl w-full mx-4">
                            <div className="w-32 h-32 bg-[var(--bg-inset)] rounded-full flex items-center justify-center mb-6 mx-auto ring-8 ring-[var(--accent-color)] ring-opacity-20 shadow-xl transform hover:scale-110 transition-transform">
                                <i className="fa-solid fa-wand-magic-sparkles text-5xl text-[var(--accent-color)]"></i>
                            </div>
                            <LandingText />
                            <p className="mt-6 text-[var(--text-muted)] text-lg leading-relaxed">
                                Eğitimi kişiselleştirmek hiç bu kadar kolay olmamıştı.<br/>
                                <strong>Disleksi</strong>, <strong>Diskalkuli</strong> ve <strong>Dikkat Eksikliği</strong> için özel olarak tasarlanmış materyaller üretin.
                            </p>
                        </div>
                    </div>
                )}
                
                {/* WORKSHEET CONTENT LAYER */}
                {processedData && processedData.length > 0 && (
                    // TRANSFORM LAYER: Scales and moves everything inside
                    <div 
                        className="absolute origin-top-left transition-transform duration-75 ease-out will-change-transform"
                        style={{ 
                            transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${scale})`,
                        }}
                    >
                        {/* DRAW LAYER (Absolute Overlay relative to content for alignment) */}
                        <DrawLayer isActive={isDrawMode} zoom={scale} />

                        {/* The Worksheet pages (now inside the canvas) */}
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
            <div className="w-full max-w-5xl h-full overflow-y-auto mx-auto p-4 absolute inset-0"><SavedWorksheetsView onLoad={onLoadSaved} onBack={onBackToGenerator} /></div>
          ) : currentView === 'shared' ? (
            <div className="w-full max-w-5xl h-full overflow-y-auto mx-auto p-4 absolute inset-0"><SharedWorksheetsView onLoad={onLoadSaved} onBack={onBackToGenerator} /></div>
          ) : currentView === 'assessment' ? (
              <div className="w-full h-full overflow-y-auto absolute inset-0 bg-white dark:bg-zinc-900">
                  <AssessmentModule 
                    onBack={onBackToGenerator} 
                    onSelectActivity={(id) => { if (onSelectActivity) onSelectActivity(id); }} 
                    onAddToWorkbook={handleAddToWorkbookFromReport}
                    onAutoGenerateWorkbook={onAutoGenerateWorkbook}
                  />
              </div>
          ) : currentView === 'favorites' ? (
              <div className="w-full h-full overflow-y-auto absolute inset-0 bg-white dark:bg-zinc-900"><FavoritesSection onSelectActivity={(id) => { if (onSelectActivity) onSelectActivity(id); }} onBack={onBackToGenerator} /></div>
          ) : currentView === 'workbook' ? (
              <div className="w-full h-full overflow-y-auto absolute inset-0 bg-white dark:bg-zinc-900"><WorkbookView items={workbookItems} setItems={setWorkbookItems} settings={workbookSettings} setSettings={setWorkbookSettings} onBack={onBackToGenerator} /></div>
          ) : null}

        <ShareModal 
            isOpen={isShareModalOpen} 
            onClose={() => setIsShareModalOpen(false)} 
            onShare={handleConfirmShare} 
            isSending={isSharing}
        />
      </div>
    </main>
    </EditableContext.Provider>
  );
};

export default React.memo(ContentArea);