
import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { ActivityType, WorksheetData, SavedWorksheet, SingleWorksheetData, AppTheme, HistoryItem, StyleSettings, View, UiSettings, CollectionItem, WorkbookSettings, StudentProfile, AssessmentReport, GeneratorOptions, SavedAssessment } from './types';
import Sidebar from './components/Sidebar';
import ContentArea from './components/ContentArea';
import { ACTIVITIES, ACTIVITY_CATEGORIES } from './constants';
import DyslexiaLogo from './components/DyslexiaLogo';
import GlobalSearch from './components/GlobalSearch';
import { FeedbackModal } from './components/FeedbackModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './components/AuthModal';
import { messagingService } from './services/messagingService';
import { worksheetService } from './services/worksheetService';
import { SettingsModal } from './components/SettingsModal';
import { TourGuide, TourStep } from './components/TourGuide';
import { StudentInfoModal } from './components/StudentInfoModal';
import * as offlineGenerators from './services/offlineGenerators'; // Import directly for auto-generation

// Lazy Loaded Components
const ProfileView = lazy(() => import('./components/ProfileView').then(module => ({ default: module.ProfileView })));
const AdminDashboard = lazy(() => import('./components/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
const MessagesView = lazy(() => import('./components/MessagesView').then(module => ({ default: module.MessagesView })));

const initialStyleSettings: StyleSettings = {
    fontSize: 16,
    scale: 1, 
    borderColor: '#d4d4d8',
    borderWidth: 1,
    margin: 20, 
    columns: 1,
    gap: 16,
    orientation: 'portrait',
    themeBorder: 'simple',
    contentAlign: 'center',
    fontWeight: 'normal',
    fontStyle: 'normal',
    visualStyle: 'card', 
    showPedagogicalNote: false,
    showMascot: false,
    showStudentInfo: false,
    showTitle: false,
    showInstruction: false,
    showImage: false,
    showFooter: false
};

const initialUiSettings: UiSettings = {
    fontFamily: 'OpenDyslexic',
    fontSizeScale: 1,
    letterSpacing: 'normal',
    lineHeight: 1.6,
    saturation: 100
};

type ModalType = 'how-to-use' | 'about' | 'contact' | 'history' | 'settings' | 'developer';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  const [isRendered, setIsRendered] = useState(false);
  useEffect(() => { if (isOpen) setIsRendered(true); }, [isOpen]);
  const handleTransitionEnd = () => { if (!isOpen) setIsRendered(false); };
  if (!isRendered) return null;

  return (
    <div 
      className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300 ease-out ${isOpen ? 'opacity-100' : 'opacity-0'}`} 
      onClick={onClose}
      onTransitionEnd={handleTransitionEnd}
    >
      <div 
        className={`bg-[var(--bg-paper)] rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col transition-all duration-300 ease-out ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--bg-inset)] transition-colors"><i className="fa-solid fa-times"></i></button>
        </header>
        <div className="p-6 overflow-y-auto space-y-4 text-[var(--text-secondary)] custom-scrollbar">{children}</div>
      </div>
    </div>
  );
};

const tourSteps: TourStep[] = [
    { targetId: 'tour-logo', title: 'Ana Sayfa', content: 'Uygulamaya hoş geldiniz! Buraya tıklayarak her zaman ana ekrana dönebilir ve etkinlik seçimini sıfırlayabilirsiniz.', position: 'bottom' },
    { targetId: 'tour-sidebar', title: 'Etkinlik Menüsü', content: 'Uygulamanın kalbi burası! Üretmek istediğiniz etkinlik kategorisini ve türünü bu menüden seçin. Seçim yaptıktan sonra ayar ekranı açılacaktır.', position: 'right' },
    { targetId: 'tour-search', title: 'Hızlı Arama', content: 'Yüzlerce etkinlik arasında kaybolmayın. Aradığınız bir etkinliğe buradan hızlıca ulaşabilirsiniz.', position: 'bottom' },
    { targetId: 'tour-content', title: 'İçerik Alanı', content: 'Seçtiğiniz etkinlik ayarları ve ürettiğiniz çalışma kağıtlarınız bu ana alanda görüntülenir.', position: 'left' },
    { targetId: 'tour-toolbar', title: 'Araç Çubuğu', content: 'Etkinlik oluşturulduktan sonra, bu araç çubuğu belirir. Yazdırma, kaydetme, paylaşma ve görünüm ayarlarını (ölçek, kenar boşluğu vb.) buradan yapabilirsiniz.', position: 'bottom' },
    { targetId: 'tour-workbook-btn', title: 'Çalışma Kitapçığı', content: 'Buradan farklı etkinlikleri biriktirip, tek seferde basabileceğiniz bir kitapçık oluşturabilirsiniz.', position: 'bottom' },
    { targetId: 'tour-favorites-btn', title: 'Favoriler', content: 'En çok kullanılan etkinliklere buradan hızlıca ulaşabilirsiniz.', position: 'bottom' },
    { targetId: 'tour-archive-btn', title: 'Arşiv', content: 'Kaydettiğiniz tüm etkinliklere buradan ulaşabilir, tekrar açabilir veya arkadaşlarınızla paylaşabilirsiniz.', position: 'bottom' },
    { targetId: 'tour-profile-btn', title: 'Profiliniz', content: 'Hesap bilgilerinizi, istatistiklerinizi ve değerlendirme raporlarınızı yönetmek için profilinize gidin.', position: 'bottom' },
];

const LoadingSpinner = () => (
    <div className="flex h-full w-full items-center justify-center text-indigo-500">
        <i className="fa-solid fa-circle-notch fa-spin text-3xl"></i>
    </div>
);

// Helper for Pascal Case (for generator lookup)
const toPascalCase = (str: string): string => {
    return str.toLowerCase().split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
};

const AppContent: React.FC = () => {
  const { user, logout } = useAuth();
  const [currentView, setCurrentView] = useState<View>('generator');
  const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(null);
  const [worksheetData, setWorksheetData] = useState<WorksheetData>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  
  const [zenMode, setZenMode] = useState(false);

  const [openModal, setOpenModal] = useState<ModalType | null>(null);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isTourOpen, setIsTourOpen] = useState(false);
  
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);

  // Workbook State
  const [workbookItems, setWorkbookItems] = useState<CollectionItem[]>([]);
  const [workbookSettings, setWorkbookSettings] = useState<WorkbookSettings>({
      title: 'Çalışma Kitapçığı',
      studentName: '',
      schoolName: '',
      year: new Date().getFullYear().toString(),
      teacherNote: '',
      theme: 'modern',
      accentColor: '#4f46e5',
      coverStyle: 'centered',
      showTOC: true,
      showPageNumbers: true,
      showWatermark: false,
      watermarkOpacity: 0.05,
      showBackCover: true
  });
  
  const [theme, setTheme] = useState<AppTheme>(() => {
      try {
          const storedTheme = localStorage.getItem('app-theme');
          return (storedTheme as AppTheme) || 'anthracite';
      } catch (e) {
          return 'anthracite';
      }
  });

  const [uiSettings, setUiSettings] = useState<UiSettings>(() => {
      try {
          const stored = localStorage.getItem('app-ui-settings');
          return stored ? { ...initialUiSettings, ...JSON.parse(stored) } : initialUiSettings;
      } catch (e) {
          return initialUiSettings;
      }
  });

  const [styleSettings, setStyleSettings] = useState<StyleSettings>(initialStyleSettings);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
      // console.log("🔥 App Initialized");
  }, []);

  const refreshNotifications = useCallback(async () => {
      if (user) {
          try {
              const count = await messagingService.getUnreadCount(user.id);
              setUnreadCount(count);
          } catch (e) { console.error(e); }
      }
  }, [user]);

  useEffect(() => {
      if (user) {
          refreshNotifications();
          const interval = setInterval(refreshNotifications, 30000);
          return () => clearInterval(interval);
      }
  }, [user, refreshNotifications]);

  useEffect(() => {
      if (!user && ['profile', 'admin', 'messages', 'shared'].includes(currentView)) {
          setCurrentView('generator');
      }
  }, [user, currentView]);

  useEffect(() => {
      try {
          const root = document.documentElement;
          const themesToRemove = [
              'theme-light', 'dark', 'theme-anthracite', 'theme-anthracite-gold', 
              'theme-anthracite-cyber', 'theme-anthracite-bumblebee', 'theme-anthracite-stone', 
              'theme-anthracite-honey', 'theme-anthracite-onyx', 'theme-space', 'theme-nature', 'theme-ocean'
          ];
          root.classList.remove(...themesToRemove);
          if (theme === 'dark') {
              root.classList.add('dark');
          } else if (theme === 'light') {
              root.classList.add('theme-light');
          } else if (theme === 'anthracite') {
              // Default
          } else {
              root.classList.add(`theme-${theme}`);
          }
          localStorage.setItem('app-theme', theme);
      } catch (e) {
          console.error("Theme application failed:", e);
      }
  }, [theme]);

  useEffect(() => {
      try {
          const root = document.documentElement;
          const fontVal = uiSettings.fontFamily === 'Lexend' ? 'Lexend' :
                          uiSettings.fontFamily === 'OpenDyslexic' ? 'OpenDyslexic' : 
                          uiSettings.fontFamily === 'Inter' ? 'Inter' :
                          uiSettings.fontFamily === 'Comic Neue' ? 'Comic Neue' :
                          uiSettings.fontFamily === 'Lora' ? 'Lora' : 'OpenDyslexic';
                          
          root.style.setProperty('--ui-font', fontVal);
          root.style.setProperty('--ui-scale', uiSettings.fontSizeScale.toString());
          root.style.setProperty('--ui-spacing', uiSettings.letterSpacing === 'wide' ? '0.05em' : 'normal');
          root.style.setProperty('--ui-line-height', (uiSettings.lineHeight || 1.6).toString());
          root.style.setProperty('--ui-saturation', `${uiSettings.saturation || 100}%`);
          
          localStorage.setItem('app-ui-settings', JSON.stringify(uiSettings));
      } catch (e) {
          console.error("UI Settings application failed:", e);
      }
  }, [uiSettings]);

  const addToHistory = (activityType: ActivityType, data: SingleWorksheetData[]) => {
      const activity = ACTIVITIES.find(a => a.id === activityType);
      const category = ACTIVITY_CATEGORIES.find(c => c.activities.includes(activityType));
      if (!activity || !category) return;

      const newItem: HistoryItem = {
          id: Date.now().toString() + Math.random(),
          userId: user?.id || '',
          activityType,
          data,
          timestamp: new Date().toISOString(),
          title: activity.title,
          category: { id: category.id, title: category.title }
      };

      const updatedHistory = [newItem, ...historyItems].slice(0, 50);
      setHistoryItems(updatedHistory);
      try { sessionStorage.setItem('sessionHistory', JSON.stringify(updatedHistory)); } catch (e) {}
  };

  const addSavedWorksheet = async (name: string, activityType: ActivityType, data: SingleWorksheetData[]) => {
    if (!user) {
        setIsAuthModalOpen(true);
        return;
    }
    const activity = ACTIVITIES.find(a => a.id === activityType);
    const category = ACTIVITY_CATEGORIES.find(c => c.activities.includes(activityType));
    if (!activity || !category) return;

    try {
        await worksheetService.saveWorksheet(
            user.id,
            name,
            activityType,
            data,
            activity.icon,
            { id: category.id, title: category.title },
            styleSettings,
            studentProfile || undefined
        );
        alert(`Etkinlik "${name}" adıyla arşivinize kaydedildi.`);
    } catch (e: any) {
        console.error("Save error:", e);
        alert(`Kaydedilirken bir hata oluştu: ${e.message || 'Bilinmeyen hata'}.`);
    }
  };

  const loadSavedWorksheet = (worksheet: SavedWorksheet) => {
    if (worksheet.activityType === ActivityType.WORKBOOK) {
        if (worksheet.workbookItems && worksheet.workbookSettings) {
            setWorkbookItems(worksheet.workbookItems);
            setWorkbookSettings(worksheet.workbookSettings);
            setCurrentView('workbook');
        }
    } else {
        setSelectedActivity(worksheet.activityType);
        setWorksheetData(worksheet.worksheetData);
        if (worksheet.styleSettings) {
            setStyleSettings(worksheet.styleSettings);
        }
        if (worksheet.studentProfile) {
            setStudentProfile(worksheet.studentProfile);
        } else {
            setStudentProfile(null);
        }
        setCurrentView('generator');
    }
  };

  const handleSelectActivity = (activityType: ActivityType | null) => {
    setSelectedActivity(activityType);
    setWorksheetData(null);
    setError(null);
    setCurrentView('generator');
    if (isSidebarOpen) setIsSidebarOpen(false);
  };

  const handleAddToWorkbook = () => {
        if (selectedActivity && worksheetData) {
            const newItems: CollectionItem[] = worksheetData.map(sheet => ({
                id: crypto.randomUUID(),
                activityType: selectedActivity,
                data: sheet,
                settings: { ...styleSettings },
                title: sheet.title || ACTIVITIES.find(a => a.id === selectedActivity)?.title || 'Etkinlik'
            }));
            setWorkbookItems(prev => [...prev, ...newItems]);
            
            const btn = document.getElementById('add-to-wb-btn');
            if(btn) {
                btn.classList.add('scale-125', 'bg-green-500', 'text-white');
                setTimeout(() => btn.classList.remove('scale-125', 'bg-green-500', 'text-white'), 300);
            }
        }
  };

  // --- SMART ROUTE: AUTO WORKBOOK GENERATION ---
  const handleAutoGenerateWorkbook = async (report: AssessmentReport) => {
      setIsLoading(true);
      setCurrentView('workbook'); // Switch to view immediately to show progress implicitly
      
      const newItems: CollectionItem[] = [];
      
      // Default Generator Options for robustness
      const defaultOptions: GeneratorOptions = {
          mode: 'fast',
          difficulty: 'Orta',
          worksheetCount: 1,
          itemCount: 10,
          gridSize: 10,
          operationType: 'mixed',
          numberRange: '1-20',
      };

      try {
          // Add Report Cover if available
          // We need a SavedAssessment like structure but constructed from the report data
          const reportItem: CollectionItem = {
              id: crypto.randomUUID(),
              activityType: ActivityType.ASSESSMENT_REPORT,
              data: { // Construct a SavedAssessment-like object manually for the viewer
                  id: 'temp-report',
                  userId: user?.id || 'guest',
                  studentName: studentProfile?.name || 'Öğrenci',
                  gender: 'Erkek', // Default
                  age: 7, // Default
                  grade: studentProfile?.grade || '1. Sınıf',
                  createdAt: new Date().toISOString(),
                  report: report // The actual report content
              } as SavedAssessment, 
              settings: { ...styleSettings, showStudentInfo: false, showFooter: false },
              title: `Rapor: ${studentProfile?.name || 'Öğrenci'}`
          };
          newItems.push(reportItem);

          // Generate activities from roadmap
          for (const roadItem of report.roadmap) {
              const activityId = roadItem.activityId as ActivityType;
              const pascalName = toPascalCase(activityId);
              const generatorName = `generateOffline${pascalName}`;
              
              // @ts-ignore - Dynamic lookup of offline generators
              const generator = offlineGenerators[generatorName];
              
              if (generator) {
                  try {
                      // Generate specific content
                      const generatedData = await generator(defaultOptions);
                      
                      // Map to workbook items
                      generatedData.forEach((sheet: any) => {
                          newItems.push({
                              id: crypto.randomUUID(),
                              activityType: activityId,
                              data: sheet,
                              settings: { ...styleSettings },
                              title: ACTIVITIES.find(a => a.id === activityId)?.title || activityId
                          });
                      });
                  } catch (genErr) {
                      console.error(`Failed to auto-generate ${activityId}`, genErr);
                  }
              }
          }
          
          setWorkbookItems(newItems);
          setWorkbookSettings(prev => ({
              ...prev,
              title: `Kişisel Gelişim Planı`,
              studentName: studentProfile?.name || '',
              teacherNote: "Bu kitapçık, yapılan değerlendirme sonucunda belirlenen ihtiyaçlara yönelik olarak yapay zeka tarafından otomatik oluşturulmuştur."
          }));

      } catch (e) {
          console.error("Auto generation failed", e);
          alert("Otomatik kitapçık oluşturulurken bir hata meydana geldi.");
      } finally {
          setIsLoading(false);
      }
  };

  const handleAddToWorkbookFromReport = (assessment: SavedAssessment) => {
        const newItem: CollectionItem = {
            id: crypto.randomUUID(),
            activityType: ActivityType.ASSESSMENT_REPORT, 
            data: assessment, // Pass the full SavedAssessment object
            settings: { ...styleSettings, showStudentInfo: false, showFooter: false },
            title: `Rapor: ${assessment.studentName}`
        };
        setWorkbookItems(prev => [...prev, newItem]);
  };

  const AssessmentModule = lazy(() => import('./components/AssessmentModule').then(module => ({ default: module.AssessmentModule })));

  if (currentView === 'admin') {
      return (
          <Suspense fallback={<LoadingSpinner />}>
              <AdminDashboard onBack={() => setCurrentView('generator')} />
          </Suspense>
      );
  }
  if (currentView === 'profile') {
      return (
          <Suspense fallback={<LoadingSpinner />}>
              <ProfileView onBack={() => setCurrentView('generator')} onSelectActivity={handleSelectActivity} />
          </Suspense>
      );
  }
  if (currentView === 'messages') {
      return (
          <Suspense fallback={<LoadingSpinner />}>
              <MessagesView onBack={() => setCurrentView('generator')} onRefreshNotifications={refreshNotifications} />
          </Suspense>
      );
  }

  const headerIconBtnClass = "p-2 text-[var(--text-secondary)] hover:text-[var(--accent-color)] hover:drop-shadow-[0_0_5px_rgba(251,191,36,0.5)] transition-all duration-300 rounded-md";

  return (
    <div className="flex flex-col h-screen bg-transparent font-sans transition-colors duration-300">
      
      <header className={`relative bg-[var(--panel-bg)] backdrop-blur-sm border-b border-[var(--border-color)] shadow-sm z-10 print:hidden transition-all duration-500 ${zenMode ? '-mt-20 opacity-0 pointer-events-none' : 'mt-0 opacity-100'}`}>
        <div className="w-full px-4 sm:px-6 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-[var(--text-muted)] mr-3 p-2 hover:text-[var(--text-primary)] transition-colors"><i className="fa-solid fa-bars fa-lg"></i></button>
             <button id="tour-logo" onClick={() => { setCurrentView('generator'); setSelectedActivity(null); }} className="flex items-center gap-3 px-2 py-1 rounded-lg relative z-50">
                <DyslexiaLogo className="h-10 w-auto" />
            </button>
          </div>

          <div className="flex items-center gap-2">
             <div id="tour-search">
                <GlobalSearch onSelectActivity={handleSelectActivity} />
             </div>
             
             <div className="flex items-center gap-1 border-r border-[var(--border-color)] pr-2 mx-1">
                <button onClick={() => setIsTourOpen(true)} className={headerIconBtnClass} title="Nasıl Kullanılır?">
                    <i className="fa-solid fa-question-circle fa-lg"></i>
                </button>
                <button onClick={() => setOpenModal('developer')} className={headerIconBtnClass} title="Geliştirici İletişim">
                    <i className="fa-solid fa-laptop-code fa-lg"></i>
                </button>
                <button onClick={() => setOpenModal('about')} className={headerIconBtnClass} title="Hakkımızda">
                    <i className="fa-solid fa-circle-info fa-lg"></i>
                </button>
                <button onClick={() => setIsFeedbackOpen(true)} className={headerIconBtnClass} title="İletişim / Hata Bildir">
                    <i className="fa-solid fa-headset fa-lg"></i>
                </button>
             </div>
             
             <button 
                onClick={() => setCurrentView('assessment')} 
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[var(--accent-color)] text-black rounded-full text-xs font-extrabold shadow-md hover:shadow-[var(--accent-color)]/30 hover:scale-105 transition-all border border-[var(--accent-hover)]"
                title="Öğrenme Güçlüğü Analizi"
             >
                 <i className="fa-solid fa-user-doctor"></i> Değerlendirme
             </button>

             <div className="h-6 w-px bg-[var(--border-color)] mx-1 hidden sm:block"></div>

             <div className="flex items-center gap-2">
             
                <button id="tour-workbook-btn" onClick={() => setCurrentView('workbook')} className="relative p-2 text-[var(--text-secondary)] hover:text-emerald-500 hover:drop-shadow-[0_0_5px_rgba(16,185,129,0.8)] transition-all rounded-md group" title="Çalışma Kitapçığı">
                    <i className="fa-solid fa-book-open-reader fa-lg"></i>
                    {workbookItems.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[10px] font-bold px-1.5 rounded-full border border-black min-w-[18px] text-center">
                            {workbookItems.length}
                        </span>
                    )}
                </button>

                <button id="tour-favorites-btn" onClick={() => setCurrentView('favorites')} className="p-2 text-[var(--text-secondary)] hover:text-red-500 hover:drop-shadow-[0_0_5px_rgba(239,68,68,0.8)] transition-all rounded-md relative group" title="Favoriler">
                    <i className="fa-solid fa-heart fa-lg"></i>
                </button>

             {user ? (
                 <>
                    {user.role === 'admin' && (
                        <button onClick={() => setCurrentView('admin')} className="p-2 text-purple-400 hover:bg-purple-900/20 rounded-md relative hover:text-white hover:drop-shadow-[0_0_5px_rgba(168,85,247,0.8)] transition-all" title="Yönetici Paneli">
                            <i className="fa-solid fa-shield-halved fa-lg"></i>
                        </button>
                    )}
                    
                    <button id="tour-messages-btn" onClick={() => setCurrentView('messages')} className={headerIconBtnClass + " relative"} title="Mesajlar">
                        <i className="fa-solid fa-envelope fa-lg"></i>
                        {unreadCount > 0 && (
                            <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-1.5 rounded-full border-2 border-black">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    <button id="tour-shared-btn" onClick={() => setCurrentView('shared')} className={headerIconBtnClass} title="Paylaşılanlar">
                        <i className="fa-solid fa-share-nodes fa-lg"></i>
                    </button>

                    <button id="tour-archive-btn" onClick={() => setCurrentView('savedList')} className={headerIconBtnClass} title="Arşiv">
                        <i className="fa-solid fa-box-archive fa-lg"></i>
                    </button>
                    <button id="tour-history-btn" onClick={() => setOpenModal('history')} className={headerIconBtnClass} title="Geçmiş">
                        <i className="fa-solid fa-clock-rotate-left fa-lg"></i>
                    </button>
                    
                    <button id="tour-profile-btn" onClick={() => setCurrentView('profile')} className="ml-2">
                        <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full border-2 border-[var(--border-color)] shadow-sm hover:border-[var(--accent-color)] transition-colors bg-zinc-800" />
                    </button>
                 </>
             ) : (
                 <button onClick={() => setIsAuthModalOpen(true)} className="ml-2 px-5 py-2 bg-[var(--bg-paper)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-lg font-black text-sm hover:bg-[var(--bg-inset)] transition-all shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                     Giriş Yap
                 </button>
             )}
             </div>
             
             <div className="h-6 w-px bg-[var(--border-color)] mx-1"></div>
             <button onClick={() => setOpenModal('settings')} className={headerIconBtnClass}><i className="fa-solid fa-gear fa-lg"></i></button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>}
        
        <div 
            onMouseEnter={() => setIsSidebarExpanded(true)} 
            className={`transition-all duration-500 ease-in-out h-full ${zenMode ? '-ml-80 w-0 opacity-0 overflow-hidden' : ''}`}
        >
            <Sidebar
                isSidebarOpen={isSidebarOpen}
                closeSidebar={() => setIsSidebarOpen(false)}
                selectedActivity={selectedActivity}
                onSelectActivity={handleSelectActivity}
                setWorksheetData={setWorksheetData}
                setIsLoading={setIsLoading}
                setError={setError}
                isLoading={isLoading}
                onAddToHistory={addToHistory}
                isExpanded={isSidebarExpanded}
                onOpenStudentModal={() => setIsStudentModalOpen(true)}
                studentProfile={studentProfile}
            />
        </div>
        
        <div 
            className="flex-1 flex flex-col overflow-hidden" 
            onMouseEnter={() => setIsSidebarExpanded(false)}
        >
            {/* Main Content Render Logic */}
            {isLoading && currentView === 'workbook' && (
                <div className="flex flex-col items-center justify-center h-full w-full bg-zinc-50 dark:bg-zinc-900 z-50">
                    <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                    <h3 className="text-xl font-bold text-indigo-600">Kitapçık Hazırlanıyor...</h3>
                    <p className="text-zinc-500">Kişiselleştirilmiş materyaller oluşturuluyor.</p>
                </div>
            )}

            <ContentArea
              currentView={currentView}
              onBackToGenerator={() => { setCurrentView('generator'); setSelectedActivity(null); setWorksheetData(null); }}
              activityType={selectedActivity}
              worksheetData={worksheetData}
              isLoading={isLoading}
              error={error}
              styleSettings={styleSettings}
              onStyleChange={setStyleSettings}
              onSave={addSavedWorksheet}
              onLoadSaved={loadSavedWorksheet}
              onFeedback={() => setIsFeedbackOpen(true)}
              onOpenAuth={() => setIsAuthModalOpen(true)}
              onSelectActivity={handleSelectActivity}
              workbookItems={workbookItems}
              setWorkbookItems={setWorkbookItems}
              workbookSettings={workbookSettings}
              setWorkbookSettings={setWorkbookSettings}
              onAddToWorkbook={handleAddToWorkbook}
              studentProfile={studentProfile}
              zenMode={zenMode}
              toggleZenMode={() => setZenMode(!zenMode)}
            />
            
            {/* Assessment View Integration */}
            {currentView === 'assessment' && (
                <div className="absolute inset-0 bg-white dark:bg-zinc-900 z-40 overflow-y-auto">
                    <Suspense fallback={<LoadingSpinner />}>
                        <AssessmentModule 
                            onBack={() => setCurrentView('generator')}
                            onSelectActivity={handleSelectActivity}
                            onAddToWorkbook={handleAddToWorkbookFromReport}
                            onAutoGenerateWorkbook={handleAutoGenerateWorkbook}
                        />
                    </Suspense>
                </div>
            )}
        </div>
      </div>
      
      <TourGuide steps={tourSteps} isOpen={isTourOpen} onClose={() => setIsTourOpen(false)} />

      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} activityType={selectedActivity} activityTitle={selectedActivity ? ACTIVITIES.find(a => a.id === selectedActivity)?.title : undefined} />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      
      <StudentInfoModal 
          isOpen={isStudentModalOpen} 
          onClose={() => setIsStudentModalOpen(false)} 
          currentProfile={studentProfile}
          onSave={(p) => setStudentProfile(p)}
          onClear={() => setStudentProfile(null)}
      />

      <SettingsModal 
          isOpen={openModal === 'settings'} 
          onClose={() => setOpenModal(null)}
          uiSettings={uiSettings}
          onUpdateUiSettings={setUiSettings}
          theme={theme}
          onUpdateTheme={setTheme}
      />

      <Modal isOpen={openModal === 'history'} onClose={() => setOpenModal(null)} title="İşlem Geçmişi">
          {historyItems.length === 0 ? (
               <div className="text-center py-8 text-zinc-500">
                   <i className="fa-solid fa-clock-rotate-left text-4xl mb-3 opacity-20"></i>
                   <p>Henüz bir işlem geçmişiniz bulunmuyor.</p>
               </div>
          ) : (
              <div className="space-y-3">
                  {historyItems.map((item) => (
                      <div key={item.id} className="p-3 border border-[var(--border-color)] rounded-lg flex justify-between items-center hover:bg-[var(--bg-inset)] transition-colors">
                          <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-full bg-[var(--bg-primary)] text-[var(--accent-color)] flex items-center justify-center">
                                   <i className="fa-solid fa-file-pen"></i>
                                </div>
                               <div>
                                  <p className="font-bold text-sm text-[var(--text-primary)]">{item.title}</p>
                                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                                      <span><i className="fa-regular fa-calendar mr-1"></i>{new Date(item.timestamp).toLocaleDateString('tr-TR')}</span>
                                      <span><i className="fa-regular fa-clock mr-1"></i>{new Date(item.timestamp).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}</span>
                                  </div>
                               </div>
                          </div>
                          <button onClick={() => { loadSavedWorksheet(item as any); setOpenModal(null); }} className="px-3 py-1.5 text-xs font-bold bg-[var(--bg-inset)] text-[var(--text-primary)] rounded-md hover:bg-[var(--bg-secondary)] transition-colors">
                              Tekrar Aç
                          </button>
                      </div>
                  ))}
              </div>
          )}
      </Modal>

      <Modal isOpen={openModal === 'about'} onClose={() => setOpenModal(null)} title="Hakkımızda">
        <div className="text-center space-y-6">
            <DyslexiaLogo className="h-16 w-auto mx-auto" />
            <div className="space-y-4 text-zinc-600 dark:text-zinc-300">
                <p className="leading-relaxed">
                    Bursa Disleksi AI, özel öğrenme güçlüğü yaşayan bireylerin eğitim süreçlerini desteklemek, eğitmen ve ailelere kişiselleştirilmiş, bilimsel temelli materyaller sunmak amacıyla geliştirilmiş yeni nesil bir yapay zeka platformudur.
                </p>
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
                    <p className="text-xs font-bold text-indigo-800 dark:text-indigo-300 uppercase tracking-widest mb-1">Resmi Web Sitesi</p>
                    <a href="https://www.bursadisleksi.com" target="_blank" rel="noopener noreferrer" className="text-xl font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                        www.bursadisleksi.com
                    </a>
                </div>
            </div>
            <div className="pt-6 border-t border-[var(--border-color)]">
                <p className="text-xs text-zinc-500">Versiyon 1.0.3</p>
                <p className="text-xs text-zinc-500">© 2024 Bursa Disleksi</p>
            </div>
        </div>
      </Modal>

      <Modal isOpen={openModal === 'developer'} onClose={() => setOpenModal(null)} title="Geliştirici & İletişim">
        <div className="space-y-6">
            <div className="flex flex-col items-center p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-700">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl shadow-lg mb-4">
                    <i className="fa-solid fa-code"></i>
                </div>
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Barış Mutlu Altunel</h3>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Full Stack Developer & Eğitim Teknoloğu</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a href="mailto:morimasi@gmail.com" className="flex items-center gap-3 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group bg-white dark:bg-zinc-800">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <i className="fa-solid fa-envelope"></i>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-zinc-400 uppercase">E-posta</p>
                        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">morimasi@gmail.com</p>
                    </div>
                </a>
                
                <a href="https://twitter.com/barismutlualtunel" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-sky-500 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-all group bg-white dark:bg-zinc-800">
                    <div className="w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-900 text-sky-600 dark:text-sky-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <i className="fa-brands fa-x-twitter"></i>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-zinc-400 uppercase">Twitter / X</p>
                        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">@barismutlualtunel</p>
                    </div>
                </a>

                <a href="https://instagram.com/bbmaltunel" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all group bg-white dark:bg-zinc-800">
                    <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-900 text-pink-600 dark:text-pink-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <i className="fa-brands fa-instagram"></i>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-zinc-400 uppercase">Instagram</p>
                        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">@bbmaltunel</p>
                    </div>
                </a>

                <div className="flex items-center gap-3 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 opacity-80">
                    <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-500 flex items-center justify-center">
                        <i className="fa-solid fa-location-dot"></i>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-zinc-400 uppercase">Konum</p>
                        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Bursa, Türkiye</p>
                    </div>
                </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-zinc-900 text-white p-6 shadow-xl border border-zinc-700 group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <i className="fa-solid fa-wand-magic-sparkles text-8xl"></i>
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3 text-amber-400">
                        <i className="fa-solid fa-lightbulb"></i>
                        <span className="text-xs font-bold uppercase tracking-wider">Proje Geliştirme</span>
                    </div>
                    <h4 className="text-lg font-bold mb-2">Dijital Eğitim Materyali Projeleri</h4>
                    <p className="text-sm text-zinc-300 leading-relaxed mb-4">
                        Kurumunuza özel, yapay zeka destekli ve modern arayüze sahip dijital eğitim çözümleri için profesyonel destek alın.
                    </p>
                    <a href="mailto:morimasi@gmail.com?subject=Proje%20Talebi" className="inline-flex items-center gap-2 text-xs font-bold bg-white text-black px-5 py-2.5 rounded-lg hover:bg-zinc-200 transition-colors shadow-lg">
                        <span>Teklif Al</span>
                        <i className="fa-solid fa-arrow-right"></i>
                    </a>
                </div>
            </div>
        </div>
      </Modal>

    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};
