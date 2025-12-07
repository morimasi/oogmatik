
import React, { memo, useState, useRef, useEffect, useCallback } from 'react';
import { ActivityType, WorksheetData, SavedWorksheet, SingleWorksheetData, StyleSettings, View, CollectionItem, WorkbookSettings, StudentProfile, SavedAssessment, OverlayItem, AssessmentReport } from '../types';
import Worksheet from './Worksheet';
import Toolbar from './Toolbar';
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
    
    // Phase 4: TTS & QR
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [showQR, setShowQR] = useState(false);
    
    // --- INFINITE CANVAS STATE ---
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const lastMousePos = useRef({ x: 0, y: 0 });
    const canvasRef = useRef<HTMLDivElement>(null);
    
    // --- OVERLAY STATE ---
    const [overlayItems, setOverlayItems] = useState<OverlayItem[]>([]);
    
    // Reset canvas when activity changes
    useEffect(() => {
        centerCanvas();
        setIsEditMode(false);
        setIsDrawMode(false);
        setOverlayItems([]); 
        
        if (speechService.isActive()) {
            speechService.stop();
            setIsSpeaking(false);
        }
    }, [activityType, worksheetData]); // Recenter on data change

    const centerCanvas = () => {
        // Initial center with slight top padding
        if (canvasRef.current) {
            const viewportW = canvasRef.current.clientWidth;
            const viewportH = canvasRef.current.clientHeight;
            // A4 Width approx 800px at scale 1. Center it.
            setPosition({ x: (viewportW - 800) / 2, y: 50 });
            setScale(Math.min(1, viewportW / 900)); // Auto fit width slightly
        }
    };

    // --- CANVAS INTERACTION HANDLERS ---

    const handleWheel = useCallback((e: React.WheelEvent) => {
        if (currentView !== 'generator' || !worksheetData) return;
        
        // Prevent default browser zoom
        if (e.ctrlKey) e.preventDefault();

        // Check if we are wheeling over a scrollable element inside (rare in canvas mode but good practice)
        // For this implementation, we treat the whole area as canvas.

        const zoomSensitivity = 0.001;
        const newScale = Math.min(Math.max(0.1, scale - e.deltaY * zoomSensitivity), 5);
        
        // Calculate zoom to pointer
        const rect = canvasRef.current!.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Formula: NewPos = Mouse - (Mouse - OldPos) * (NewScale / OldScale)
        const newX = mouseX - (mouseX - position.x) * (newScale / scale);
        const newY = mouseY - (mouseY - position.y) * (newScale / scale);

        setScale(newScale);
        setPosition({ x: newX, y: newY });
    }, [scale, position, currentView, worksheetData]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (currentView !== 'generator' || !worksheetData) return;
        
        // Don't drag if clicking interactive elements (inputs, edit handles)
        const target = e.target as HTMLElement;
        if (target.closest('button') || target.closest('input') || target.closest('.edit-handle') || target.closest('.editable-element')) {
            return;
        }

        // Allow dragging if background OR holding space (optional, here we allow bg drag always)
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

    // Global mouse up
    useEffect(() => {
        const handleGlobalUp = () => setIsDragging(false);
        window.addEventListener('mouseup', handleGlobalUp);
        return () => window.removeEventListener('mouseup', handleGlobalUp);
    }, []);


    const handleTakeSnapshot = async () => {
        const elements = document.querySelectorAll('.worksheet-item');
        if (!elements || elements.length === 0) return;

        const editIndicators = document.querySelectorAll('.edit-handle');
        editIndicators.forEach((el: any) => el.style.display = 'none');

        try {
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
        if (activityType && worksheetData) {
            const name = generateAutoName();
            onSave(name, activityType, worksheetData);
        }
    }

    const handleShare = () => {
        if (!user) {
            if(confirm("Paylaşım yapabilmek için lütfen önce sisteme kaydolun veya giriş yapın. Giriş ekranına gitmek ister misiniz?")) {
                onOpenAuth();
            }
            return;
        }
        if (!activityType || !worksheetData) return;
        setIsShareModalOpen(true);
    };

    const handleConfirmShare = async (receiverId: string) => {
        if (!user || !activityType || !worksheetData) return;
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
                worksheetData,
                icon: activity!.icon,
                category: { id: category.id, title: category.title },
                createdAt: new Date().toISOString(),
                styleSettings: styleSettings,
                studentProfile: studentProfile || undefined
            };
    
            await worksheetService.shareWorksheet(worksheetToShare, user.id, user.name, receiverId);
            await onSave(name, activityType, worksheetData);
            
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
            pageIndex: 0 
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
            pageIndex: 0
        };
        setOverlayItems(prev => [...prev, newItem]);
        setIsEditMode(true);
    };

    // --- PHASE 4: TTS HANDLER ---
    const handleSpeak = () => {
        if (!worksheetData || worksheetData.length === 0) return;
        const page = worksheetData[0]; 
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
          {currentView === 'generator' && activityType && worksheetData && (
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
                    worksheetData={worksheetData}
                />
          )}
      </div>

      {/* 2. MAIN CANVAS AREA */}
      <div 
        ref={canvasRef}
        className={`flex-1 relative overflow-hidden bg-zinc-200 dark:bg-zinc-900 canvas-viewport ${zenMode ? 'bg-zinc-900' : ''}`}
        style={{ 
            cursor: isDragging ? 'grabbing' : 'grab',
            // Dot Pattern Background
            backgroundImage: `radial-gradient(#9ca3af 1px, transparent 1px)`,
            backgroundSize: `${20 * scale}px ${20 * scale}px`,
            backgroundPosition: `${position.x}px ${position.y}px`
        }}
        onWheel={currentView === 'generator' && worksheetData ? handleWheel : undefined}
        onMouseDown={currentView === 'generator' && worksheetData ? handleMouseDown : undefined}
        onMouseMove={currentView === 'generator' && worksheetData ? handleMouseMove : undefined}
        onMouseUp={currentView === 'generator' && worksheetData ? handleMouseUp : undefined}
      >
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
          
          {/* ZOOM CONTROLS (Floating) */}
          {worksheetData && (
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

                {!isLoading && !error && !worksheetData && (
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
                
                {worksheetData && (
                    // TRANSFORM LAYER
                    <div 
                        className="absolute origin-top-left transition-transform duration-75 ease-out will-change-transform"
                        style={{ 
                            transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${scale})`,
                        }}
                    >
                        {/* DRAW LAYER (Absolute Overlay relative to content) */}
                        <DrawLayer isActive={isDrawMode} zoom={scale} />

                        <Worksheet 
                            activityType={activityType} 
                            data={worksheetData} 
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
