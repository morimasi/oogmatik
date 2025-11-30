
import React, { memo, useState, useRef, useEffect } from 'react';
import { ActivityType, WorksheetData, SavedWorksheet, SingleWorksheetData, StyleSettings, View, CollectionItem, WorkbookSettings } from '../types';
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
  onAddToWorkbook
}) => {
    const { user } = useAuth();
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    
    // View Zoom State (Visual Zoom only)
    const [viewZoom, setViewZoom] = useState(1);
    const canvasRef = useRef<HTMLDivElement>(null);

    // Reset zoom when activity changes
    useEffect(() => {
        setViewZoom(1);
    }, [activityType]);

    // Handle Mouse Wheel Zoom
    const handleWheel = (e: React.WheelEvent) => {
        // Only zoom if Control key is NOT pressed (standard behavior for custom zoom UIs)
        // Or if we want it to always zoom without scroll, we prevent default.
        // Let's implement: Wheel -> Zoom. Shift+Wheel -> Horizontal Scroll.
        if (e.ctrlKey || e.metaKey || !e.shiftKey) { // Zoom on simple scroll or ctrl+scroll
             // if content is scrollable vertically and user is scrolling, maybe we shouldn't zoom?
             // Requirement: "mausenın tekerlegı ıle bu beyaz a4 çalışma sayfası buyuyup kuculebılsın"
             // Implementation: We'll consume the wheel event for zoom if it happens over the canvas area.
             
             // Prevent default only if we are actually zooming to avoid page jumpiness
             // e.preventDefault(); (React synthetic events don't support preventDefault on passive listeners easily, relying on logic)
             
             const delta = e.deltaY * -0.001;
             const newZoom = Math.min(Math.max(0.2, viewZoom + delta), 3);
             setViewZoom(newZoom);
        }
    };

    const handleResetZoom = () => setViewZoom(1);

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
        const second = String(now.getSeconds()).padStart(2, '0');
        const millisecond = String(now.getMilliseconds()).padStart(3, '0');
        
        return `${title} - ${day}.${month}.${year} ${hour}:${minute}:${second}-${millisecond}`;
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
                createdAt: new Date().toISOString()
            };
    
            await worksheetService.shareWorksheet(worksheetToShare, user.id, user.name, receiverId);
            await onSave(name, activityType, worksheetData);
            
            alert('Etkinlik paylaşıldı ve arşivinize kaydedildi!');
            setIsShareModalOpen(false);
        } catch (error) {
            console.error("Anında paylaşım hatası:", error);
            alert('Paylaşım sırasında bir hata oluştu. Lütfen internet bağlantınızı kontrol edin.');
        } finally {
            setIsSharing(false);
        }
    };

    const handleDownloadPDF = () => {
        const originalTitle = document.title;
        const activityName = activityType ? activityType.replace(/_/g, ' ').toLowerCase() : 'etkinlik';
        document.title = `BursaDisleksi_${activityName}_${new Date().toLocaleDateString('tr-TR').replace(/\./g, '-')}`;
        window.print();
        document.title = originalTitle;
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
    <main className={`flex-1 flex flex-col h-full bg-[var(--bg-primary)] transition-colors duration-300 overflow-hidden`}>
      
      {/* 1. TOP BAR (Toolbar & Breadcrumbs) - Fixed Height */}
      <div className="shrink-0 bg-[var(--bg-paper)] border-b border-[var(--border-color)] p-4 print:hidden z-20 shadow-sm">
          {!isPreviewMode && (
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
                    onDownloadPDF={handleDownloadPDF}
                    onTogglePreview={() => setIsPreviewMode(!isPreviewMode)}
                    isPreviewMode={isPreviewMode}
                    onAddToWorkbook={onAddToWorkbook}
                    workbookItemCount={workbookItems.length}
                />
          )}
      </div>

      {/* 2. MAIN CONTENT AREA (Canvas) - Flexible Height */}
      <div 
        ref={canvasRef}
        className="flex-1 relative overflow-auto bg-zinc-100 dark:bg-zinc-900/50 print:bg-white print:overflow-visible custom-scrollbar flex items-center justify-center p-8"
        onWheel={currentView === 'generator' && worksheetData ? handleWheel : undefined}
      >
          {/* Zoom Controls Overlay */}
          {currentView === 'generator' && worksheetData && !isPreviewMode && (
              <div className="absolute bottom-4 right-4 z-30 flex items-center gap-2 bg-white dark:bg-zinc-800 rounded-full shadow-lg border border-zinc-200 dark:border-zinc-700 p-1.5 print:hidden">
                  <button onClick={() => setViewZoom(z => Math.max(0.2, z - 0.1))} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300"><i className="fa-solid fa-minus"></i></button>
                  <span className="text-xs font-mono font-bold w-12 text-center text-zinc-700 dark:text-zinc-200">{Math.round(viewZoom * 100)}%</span>
                  <button onClick={() => setViewZoom(z => Math.min(3, z + 0.1))} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300"><i className="fa-solid fa-plus"></i></button>
                  <button onClick={handleResetZoom} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-500" title="Sıfırla"><i className="fa-solid fa-compress"></i></button>
              </div>
          )}

          {currentView === 'generator' ? (
            <>
                {/* Error Message */}
                {error && !error.startsWith("Bilgi:") && (
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4">
                        <div className="bg-[var(--bg-paper)] border-2 border-red-500/30 rounded-2xl shadow-xl overflow-hidden">
                            <div className="bg-red-500 p-4 flex justify-center">
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

                {/* Loading State */}
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

                {/* Landing State */}
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
                
                {/* Worksheet Render Area - The Scrollable/Zoomable Canvas */}
                {worksheetData && (
                    <div 
                        className={`printable-content-parent transition-transform duration-100 ease-out origin-top`}
                        style={{ transform: `scale(${viewZoom})` }}
                    >
                      <Worksheet activityType={activityType} data={worksheetData} settings={styleSettings} />
                    </div>
                )}
            </>
          ) : currentView === 'savedList' ? (
            <div className="w-full max-w-5xl h-full overflow-y-auto"><SavedWorksheetsView onLoad={onLoadSaved} onBack={onBackToGenerator} /></div>
          ) : currentView === 'shared' ? (
            <div className="w-full max-w-5xl h-full overflow-y-auto"><SharedWorksheetsView onLoad={onLoadSaved} onBack={onBackToGenerator} /></div>
          ) : currentView === 'assessment' ? (
              <div className="w-full h-full overflow-y-auto"><AssessmentModule onBack={onBackToGenerator} onSelectActivity={(id) => { if (onSelectActivity) onSelectActivity(id); }} /></div>
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
  );
};

export default React.memo(ContentArea);
