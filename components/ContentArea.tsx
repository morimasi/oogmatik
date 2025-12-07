
import React, { memo, useState, useRef, useEffect } from 'react';
import { ActivityType, WorksheetData, SavedWorksheet, SingleWorksheetData, StyleSettings, View, CollectionItem, WorkbookSettings, StudentProfile, SavedAssessment, OverlayItem } from '../types';
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
  studentProfile,
  zenMode,
  toggleZenMode
}) => {
    const { user } = useAuth();
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false); 
    const [isDrawMode, setIsDrawMode] = useState(false);
    
    // --- INFINITE CANVAS STATE ---
    const [viewZoom, setViewZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 }); 
    const isDragging = useRef(false);
    const lastMousePos = useRef({ x: 0, y: 0 });
    
    // --- OVERLAY STATE ---
    const [overlayItems, setOverlayItems] = useState<OverlayItem[]>([]);
    
    const canvasRef = useRef<HTMLDivElement>(null);

    // Reset zoom, pan, and overlays when activity changes
    useEffect(() => {
        setViewZoom(1);
        setPan({ x: 0, y: 0 });
        setIsEditMode(false);
        setIsDrawMode(false);
        setOverlayItems([]); // Or persist if needed
    }, [activityType]);

    // Handle Mouse Wheel Zoom 
    const handleWheel = (e: React.WheelEvent) => {
        if (currentView !== 'generator' || !worksheetData) return;

        // CTRL + Wheel for Zoom
        if (e.ctrlKey) { 
             e.preventDefault();
             const delta = e.deltaY * -0.001;
             const newZoom = Math.min(Math.max(0.2, viewZoom + delta), 3);
             setViewZoom(newZoom);
        } else {
            // Standard scroll
        }
    };

    // --- PANNING HANDLERS ---
    const handleMouseDown = (e: React.MouseEvent) => {
        // Prevent panning if in draw mode or clicking edit handle
        if (isDrawMode || (e.target as HTMLElement).closest('.editable-element')) return;

        // Only pan if clicking on the background (not the page itself)
        if ((e.target as HTMLElement).classList.contains('document-viewport') || (e.target as HTMLElement).classList.contains('worksheet-page-wrapper')) {
            isDragging.current = true;
            lastMousePos.current = { x: e.clientX, y: e.clientY };
            document.body.style.cursor = 'grabbing';
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging.current) return;
        e.preventDefault();
        const deltaX = e.clientX - lastMousePos.current.x;
        const deltaY = e.clientY - lastMousePos.current.y;
        
        if (canvasRef.current) {
            canvasRef.current.scrollLeft -= deltaX;
            canvasRef.current.scrollTop -= deltaY;
        }
        
        lastMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
        isDragging.current = false;
        document.body.style.cursor = 'default';
    };

    // Global mouse up to catch drag release outside container
    useEffect(() => {
        const handleGlobalUp = () => {
            isDragging.current = false;
            document.body.style.cursor = 'default';
        };
        window.addEventListener('mouseup', handleGlobalUp);
        return () => window.removeEventListener('mouseup', handleGlobalUp);
    }, []);


    const handleTakeSnapshot = async () => {
        const elements = document.querySelectorAll('.worksheet-item');
        if (!elements || elements.length === 0) return;

        // Temporarily hide UI elements or specific markers if needed before snapshot
        const editIndicators = document.querySelectorAll('.edit-handle');
        editIndicators.forEach((el: any) => el.style.display = 'none');

        try {
            // Take snapshot of the first page for simplicity
            const canvas = await html2canvas(elements[0] as HTMLElement, {
                scale: 2, // Higher quality
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
            // Restore indicators
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
            
            if (!activity) throw new Error("Aktivite tanımları yüklenemedi");
    
            const worksheetToShare: SavedWorksheet = {
                id: 'temp-share-id',
                userId: user.id, 
                name, 
                activityType, 
                worksheetData,
                icon: activity.icon,
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
            activityType: ActivityType.ASSESSMENT_REPORT, // Use the new enum value
            data: assessment,
            settings: { ...styleSettings, showStudentInfo: false, showFooter: false },
            title: `Rapor: ${assessment.studentName}`
        };
        setWorkbookItems(prev => [...prev, newItem]);
    };

    // --- OVERLAY HANDLERS ---
    const handleAddText = () => {
        // Find visible page (current impl just adds to page 0, can be enhanced with intersection observer)
        const newItem: OverlayItem = {
            id: crypto.randomUUID(),
            type: 'text',
            content: 'Metin',
            x: 100, // Default relative position
            y: 100,
            pageIndex: 0 // Default to first page for simplicity
        };
        setOverlayItems(prev => [...prev, newItem]);
        setIsEditMode(true); // Auto-enable edit
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
    <EditableContext.Provider value={{ isEditMode, zoom: viewZoom }}>
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
                    onToggleEdit={() => setIsEditMode(!isEditMode)} 
                    isEditMode={isEditMode} 
                    onSnapshot={handleTakeSnapshot} 
                    onAddText={handleAddText}
                    onAddSticker={handleAddSticker}
                    isDrawMode={isDrawMode}
                    onToggleDraw={() => setIsDrawMode(!isDrawMode)}
                />
          )}
      </div>

      {/* 2. MAIN CONTENT AREA (Document Viewer) */}
      <div 
        ref={canvasRef}
        className={`flex-1 relative overflow-auto bg-zinc-200 dark:bg-zinc-900/50 document-viewport custom-scrollbar ${zenMode ? 'bg-zinc-900' : ''}`}
        style={{ cursor: isDragging.current ? 'grabbing' : 'default' }}
        onWheel={currentView === 'generator' && worksheetData ? handleWheel : undefined}
        onMouseDown={currentView === 'generator' && worksheetData ? handleMouseDown : undefined}
        onMouseMove={currentView === 'generator' && worksheetData ? handleMouseMove : undefined}
        onMouseUp={currentView === 'generator' && worksheetData ? handleMouseUp : undefined}
      >
          {/* Mode Overlay Info */}
          {isEditMode && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-2 rounded-full shadow-xl z-50 font-bold text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-4 pointer-events-none sticky">
                  <i className="fa-solid fa-pen-ruler"></i> Düzenleme Modu Aktif
              </div>
          )}
          {isDrawMode && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-orange-600 text-white px-4 py-2 rounded-full shadow-xl z-50 font-bold text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-4 pointer-events-none sticky">
                  <i className="fa-solid fa-pen-nib"></i> Çizim Modu Aktif
              </div>
          )}

          {currentView === 'generator' ? (
            <>
                {/* DRAW LAYER (Absolute Overlay) */}
                <DrawLayer isActive={isDrawMode} zoom={viewZoom} />

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
                    <div className="flex flex-col items-center justify-center absolute inset-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm">
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
                     <div className="flex flex-col items-center justify-center h-full w-full">
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
                    // Document Viewer Container - Handles Zoom and Layout internally in Worksheet.tsx
                    <div 
                        className={`content-preview-wrapper w-full flex flex-col items-center transition-transform duration-100 ease-out origin-top`}
                        style={{ 
                            transform: `scale(${viewZoom})`,
                            marginBottom: `${(viewZoom - 1) * 100}vh` // Add extra space at bottom when zoomed in
                        }}
                    >
                        <Worksheet 
                            activityType={activityType} 
                            data={worksheetData} 
                            settings={styleSettings} 
                            studentProfile={studentProfile}
                            overlayItems={overlayItems}
                        />
                    </div>
                )}
            </>
          ) : currentView === 'savedList' ? (
            <div className="w-full max-w-5xl h-full overflow-y-auto mx-auto p-4"><SavedWorksheetsView onLoad={onLoadSaved} onBack={onBackToGenerator} /></div>
          ) : currentView === 'shared' ? (
            <div className="w-full max-w-5xl h-full overflow-y-auto mx-auto p-4"><SharedWorksheetsView onLoad={onLoadSaved} onBack={onBackToGenerator} /></div>
          ) : currentView === 'assessment' ? (
              <div className="w-full h-full overflow-y-auto">
                  <AssessmentModule 
                    onBack={onBackToGenerator} 
                    onSelectActivity={(id) => { if (onSelectActivity) onSelectActivity(id); }} 
                    onAddToWorkbook={handleAddToWorkbookFromReport} // Handled logic
                  />
              </div>
          ) : currentView === 'favorites' ? (
              <div className="w-full h-full overflow-y-auto"><FavoritesSection onSelectActivity={(id) => { if (onSelectActivity) onSelectActivity(id); }} onBack={onBackToGenerator} /></div>
          ) : currentView === 'workbook' ? (
              <div className="w-full h-full overflow-y-auto"><WorkbookView items={workbookItems} setItems={setWorkbookItems} settings={workbookSettings} setSettings={setWorkbookSettings} onBack={onBackToGenerator} /></div>
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
