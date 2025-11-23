
import React, { memo } from 'react';
import { ActivityType, WorksheetData, SavedWorksheet, SingleWorksheetData, StyleSettings, View } from '../types';
import Worksheet from './Worksheet';
import Toolbar from './Toolbar';
import { SavedWorksheetsView } from './SavedWorksheetsView';
import { SharedWorksheetsView } from './SharedWorksheetsView';
import { useAuth } from '../context/AuthContext';
import { ACTIVITIES, ACTIVITY_CATEGORIES } from '../constants';
import { SkeletonLoader } from './SkeletonLoader';
import { AssessmentModule } from './AssessmentModule';

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
  savedWorksheets: SavedWorksheet[];
  onLoadSaved: (worksheet: SavedWorksheet) => void;
  onDeleteSaved: (id: string) => void;
  onFeedback: () => void;
  onOpenAuth: () => void; 
}

// Extracted component to prevent re-definition on every render
const LandingText = memo(() => {
    const text = "Her şey tersti sen farkında olana kadar...";
    return (
        <h2 className="text-3xl font-bold mb-2 text-zinc-800 dark:text-zinc-200 leading-normal text-center max-w-2xl mx-auto">
            {text.split('').map((char, i) => {
                if (char === ' ') return <span key={i}> </span>;
                // Apply animation to 'e', 'a', 'o', 'b', 'd', 'p'
                const isAnimated = ['e', 'a', 'ı', 'i', 'o', 'ö', 'u', 'ü', 'b', 'd', 'p'].includes(char.toLowerCase()) && Math.random() > 0.3;
                const delay = Math.random() * -5;
                const duration = 4 + Math.random() * 4;
                
                return (
                    <span 
                        key={i} 
                        className={`inline-block ${isAnimated ? 'dyslexia-flip text-indigo-600 dark:text-indigo-400' : ''}`}
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
  savedWorksheets,
  onLoadSaved,
  onDeleteSaved,
  onFeedback,
  onOpenAuth
}) => {
    const { user } = useAuth();

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
        
        return `${title} - ${day}.${month}.${year} ${hour}:${minute}`;
    };

    const handleSave = () => {
        if (activityType && worksheetData) {
            const name = generateAutoName();
            onSave(name, activityType, worksheetData);
            alert(`Etkinlik "${name}" adıyla kaydedildi.`);
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

        const name = generateAutoName();
        onSave(name, activityType, worksheetData);
        alert(`Etkinlik "${name}" olarak kaydedildi. Şimdi 'Arşiv' menüsüne giderek 'Paylaş' butonuna tıklayabilir ve arkadaşlarınızı seçebilirsiniz.`);
    };

    const handleDownloadPDF = () => {
        const originalTitle = document.title;
        const activityName = activityType ? activityType.replace(/_/g, ' ').toLowerCase() : 'etkinlik';
        document.title = `BursaDisleksi_${activityName}_${new Date().toLocaleDateString('tr-TR').replace(/\./g, '-')}`;
        window.print();
        document.title = originalTitle;
    };

    // --- BREADCRUMBS LOGIC ---
    const getBreadcrumbs = () => {
        if (currentView === 'savedList') return ['Ana Sayfa', 'Arşivim'];
        if (currentView === 'shared') return ['Ana Sayfa', 'Paylaşılanlar'];
        if (currentView === 'assessment') return ['Ana Sayfa', 'Değerlendirme'];
        if (currentView === 'generator' && activityType) {
            const act = ACTIVITIES.find(a => a.id === activityType);
            const cat = ACTIVITY_CATEGORIES.find(c => c.activities.includes(activityType || '' as ActivityType));
            return ['Ana Sayfa', cat?.title || 'Kategori', act?.title || 'Etkinlik'];
        }
        return ['Ana Sayfa'];
    };

    const breadcrumbs = getBreadcrumbs();

  return (
    <main id="tour-content" className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 printable-area relative bg-transparent">
      
      {/* Breadcrumbs */}
      <nav className="mb-4 flex items-center text-sm text-zinc-500 dark:text-zinc-400 print:hidden" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2">
            {breadcrumbs.map((crumb, idx) => (
                <li key={idx} className="flex items-center">
                    {idx > 0 && <i className="fa-solid fa-chevron-right text-[10px] mx-2 opacity-50"></i>}
                    <span 
                        onClick={() => { if(idx === 0) onBackToGenerator(); }}
                        className={`${idx === breadcrumbs.length - 1 ? "font-bold text-indigo-600 dark:text-indigo-400" : "hover:text-zinc-800 dark:hover:text-zinc-200 cursor-pointer"}`}
                    >
                        {crumb}
                    </span>
                </li>
            ))}
        </ol>
      </nav>

      {currentView === 'generator' ? (
        <>
            {activityType && worksheetData && (
                <div className="mb-6 fade-in print:hidden">
                    <Toolbar 
                        settings={styleSettings} 
                        onSettingsChange={onStyleChange} 
                        onSave={handleSave} 
                        onFeedback={onFeedback}
                        onShare={handleShare}
                        onDownloadPDF={handleDownloadPDF}
                    />
                    {error && error.startsWith("Bilgi:") && (
                        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-200 rounded-lg text-sm border border-blue-200 dark:border-blue-800 flex items-center animate-pulse">
                            <i className="fa-solid fa-circle-info mr-2"></i>
                            {error}
                        </div>
                    )}
                </div>
            )}
            
            {isLoading && (
                <div className="flex flex-col h-full">
                    <div className="text-center mb-8">
                        <p className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 animate-pulse">
                            <i className="fa-solid fa-wand-magic-sparkles mr-2"></i>
                            Yapay zeka etkinliğinizi hazırlıyor...
                        </p>
                    </div>
                    <SkeletonLoader />
                </div>
            )}

            {error && !error.startsWith("Bilgi:") && (
                <div className="flex justify-center items-center h-full p-4">
                    <div className="bg-white dark:bg-zinc-800 border-2 border-red-100 dark:border-red-900/30 rounded-2xl shadow-xl max-w-lg w-full overflow-hidden">
                        <div className="bg-red-500 p-4 flex justify-center">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <i className="fa-solid fa-circle-exclamation text-3xl text-white"></i>
                            </div>
                        </div>
                        <div className="p-8 text-center">
                            <h3 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-2">Bir Sorun Oluştu</h3>
                            <p className="text-zinc-600 dark:text-zinc-400 mb-6">{error}</p>
                            
                            {(error.includes('429') || error.includes('kota') || error.includes('ücretsiz katman')) && (
                                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800 text-sm text-left mb-6">
                                    <p className="font-bold text-amber-800 dark:text-amber-200 mb-1"><i className="fa-solid fa-bolt mr-2"></i>Çözüm Önerisi</p>
                                    <p className="text-zinc-600 dark:text-zinc-400">
                                        Google yapay zeka servisi şu an yoğun. Beklemek yerine <strong>Hızlı Mod</strong> ile devam edebilirsiniz.
                                    </p>
                                </div>
                            )}

                            <div className="flex flex-col gap-3">
                                <button 
                                    onClick={onBackToGenerator}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition-colors"
                                >
                                    Ayarlara Dön
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {!isLoading && !error && !worksheetData && (
                 <div className="flex flex-col justify-center items-center h-full relative min-h-[500px] animate-in fade-in duration-500">
                    <div className="absolute inset-0 overflow-hidden -z-10">
                        {/* Decorative Icons */}
                        <i className="fa-solid fa-lightbulb text-zinc-200/50 dark:text-zinc-700/50 absolute text-8xl" style={{ top: '15%', left: '10%', animation: 'float 8s ease-in-out infinite' }}></i>
                        <i className="fa-solid fa-book-open text-zinc-200/50 dark:text-zinc-700/50 absolute text-7xl" style={{ top: '60%', left: '5%', animation: 'float 12s ease-in-out infinite 2s' }}></i>
                        <i className="fa-solid fa-puzzle-piece text-zinc-200/50 dark:text-zinc-700/50 absolute text-9xl" style={{ top: '20%', right: '8%', animation: 'float 10s ease-in-out infinite 1s' }}></i>
                    </div>
                     <div className="text-center p-8 z-10 max-w-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-3xl border border-zinc-200 dark:border-zinc-700 shadow-2xl">
                        <div className="w-32 h-32 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-6 mx-auto ring-8 ring-indigo-100/50 dark:ring-indigo-900/20 shadow-xl transform hover:scale-110 transition-transform">
                            <i className="fa-solid fa-wand-magic-sparkles text-5xl text-indigo-600 dark:text-indigo-400"></i>
                        </div>
                        <LandingText />
                        <p className="mt-6 text-zinc-500 dark:text-zinc-400 text-lg leading-relaxed">
                            Eğitimi kişiselleştirmek hiç bu kadar kolay olmamıştı.<br/>
                            <strong>Disleksi</strong>, <strong>Diskalkuli</strong> ve <strong>Dikkat Eksikliği</strong> için özel olarak tasarlanmış materyaller üretin.
                        </p>
                        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                            <button onClick={() => document.getElementById('tour-search')?.click()} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 hover:scale-105 transition-all font-bold flex items-center justify-center gap-3 text-lg">
                                <i className="fa-solid fa-magnifying-glass"></i>
                                <span>Hemen Başla</span>
                            </button>
                            <button onClick={onOpenAuth} className="px-8 py-4 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border-2 border-zinc-200 dark:border-zinc-600 rounded-2xl shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all font-bold flex items-center justify-center gap-3 text-lg">
                                <i className="fa-solid fa-user-circle"></i>
                                <span>Profilim</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {worksheetData && (
                <div className="fade-in">
                  <Worksheet activityType={activityType} data={worksheetData} settings={styleSettings} />
                </div>
            )}
        </>
      ) : currentView === 'savedList' ? (
        <SavedWorksheetsView 
            savedWorksheets={savedWorksheets}
            onLoad={onLoadSaved}
            onDelete={onDeleteSaved}
            onBack={onBackToGenerator}
        />
      ) : currentView === 'shared' ? (
        <SharedWorksheetsView 
            onLoad={onLoadSaved}
            onBack={onBackToGenerator}
        />
      ) : null}
    </main>
  );
};

export default React.memo(ContentArea);
