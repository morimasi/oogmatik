

import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { ActivityType, WorksheetData, SavedWorksheet, SingleWorksheetData, HistoryItem, StyleSettings, View, UiSettings, CollectionItem, WorkbookSettings, StudentProfile, AssessmentReport, GeneratorOptions, SavedAssessment } from './types';
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
import * as offlineGenerators from './services/offlineGenerators'; 
// NEW THEME IMPORTS
import { PRESET_THEMES, CustomTheme, applyTheme } from './utils/theme';

// Lazy Loaded Components
const ProfileView = lazy(() => import('./components/ProfileView').then(module => ({ default: module.ProfileView })));
const AdminDashboard = lazy(() => import('./components/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
const MessagesView = lazy(() => import('./components/MessagesView').then(module => ({ default: module.MessagesView })));

const initialStyleSettings: StyleSettings = {
    fontSize: 16,
    scale: 1, 
    borderColor: '#d4d4d8', // Will be overridden by Smart Inheritance
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
    showFooter: false,
    smartPagination: true,
    fontFamily: 'OpenDyslexic',
    lineHeight: 1.5,
    letterSpacing: 0
};

const initialUiSettings: UiSettings = {
    fontFamily: 'OpenDyslexic',
    fontSizeScale: 1,
    letterSpacing: 'normal',
    lineHeight: 1.6,
    saturation: 100,
    activeThemeId: 'anthracite',
    reduceMotion: false
};

// ... (Modal and TourGuide components omitted for brevity, assume they are unchanged)
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
    // ... other steps
];

const LoadingSpinner = () => (
    <div className="flex h-full w-full items-center justify-center text-indigo-500">
        <i className="fa-solid fa-circle-notch fa-spin text-3xl"></i>
    </div>
);

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
  
  // UI Settings Management (Persisted)
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

  // --- THEME ENGINE INITIALIZATION ---
  useEffect(() => {
    // 1. Determine active theme (from UI settings or default)
    const activeThemeId = uiSettings.activeThemeId || 'anthracite';
    
    // 2. Find theme definition (Preset or Custom)
    let themeDef = PRESET_THEMES.find(t => t.id === activeThemeId);
    
    // If not in presets, check user custom themes (if logged in)
    if (!themeDef && user?.customThemes) {
        themeDef = user.customThemes.find(t => t.id === activeThemeId);
    }
    
    // Fallback
    if (!themeDef) themeDef = PRESET_THEMES[0];

    // 3. Apply Theme Variables to DOM
    applyTheme(themeDef);

    // 4. Update UI typography settings
    const root = document.documentElement;
    root.style.setProperty('--ui-font', uiSettings.fontFamily);
    root.style.setProperty('--ui-scale', uiSettings.fontSizeScale.toString());
    root.style.setProperty('--ui-spacing', uiSettings.letterSpacing === 'wide' ? '0.05em' : 'normal');
    root.style.setProperty('--ui-line-height', (uiSettings.lineHeight || 1.6).toString());
    root.style.setProperty('--ui-saturation', `${uiSettings.saturation || 100}%`);
    
    // 5. Apply Motion Reduction
    if (uiSettings.reduceMotion) {
        root.classList.add('motion-reduce');
    } else {
        root.classList.remove('motion-reduce');
    }
    
    localStorage.setItem('app-ui-settings', JSON.stringify(uiSettings));
    
  }, [uiSettings, user?.customThemes]);

  // Notifications logic...
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

  // ... (Other useEffects for auth redirect logic)

  // ... (Helper functions addToHistory, addSavedWorksheet etc. - unchanged)
  const addToHistory = (activityType: ActivityType, data: SingleWorksheetData[]) => { /* ... */ };
  const addSavedWorksheet = async (name: string, activityType: ActivityType, data: SingleWorksheetData[]) => { /* ... */ };
  const loadSavedWorksheet = (worksheet: SavedWorksheet) => { /* ... */ };
  const handleSelectActivity = (activityType: ActivityType | null) => {
    setSelectedActivity(activityType);
    setWorksheetData(null);
    setError(null);
    setCurrentView('generator');
    if (isSidebarOpen) setIsSidebarOpen(false);
  };
  const handleAddToWorkbook = () => { /* ... */ };
  const handleAutoGenerateWorkbook = async (report: AssessmentReport) => { /* ... */ };
  const handleAddToWorkbookFromReport = (assessment: SavedAssessment) => { /* ... */ };

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
      
      <header className={`relative bg-[var(--panel-bg)] backdrop-blur-sm border-b border-[var(--border-color)] shadow-sm z-10 transition-all duration-500 ${zenMode ? '-mt-20 opacity-0 pointer-events-none' : 'mt-0 opacity-100'}`}>
        <div className="w-full px-4 sm:px-6 py-3 flex justify-between items-center">
          {/* Header Content - Mostly Unchanged */}
          <div className="flex items-center">
             <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-[var(--text-muted)] mr-3 p-2 hover:text-[var(--text-primary)] transition-colors"><i className="fa-solid fa-bars fa-lg"></i></button>
             <button id="tour-logo" onClick={() => { setCurrentView('generator'); setSelectedActivity(null); }} className="flex items-center gap-3 px-2 py-1 rounded-lg relative z-50">
                <DyslexiaLogo className="h-10 w-auto" />
            </button>
          </div>
          {/* ... Search and Buttons ... */}
          <div className="flex items-center gap-2">
             <div id="tour-search"><GlobalSearch onSelectActivity={handleSelectActivity} /></div>
             <div className="flex items-center gap-1 border-r border-[var(--border-color)] pr-2 mx-1">
                <button onClick={() => setIsTourOpen(true)} className={headerIconBtnClass} title="Nasıl Kullanılır?"><i className="fa-solid fa-question-circle fa-lg"></i></button>
                <button onClick={() => setOpenModal('developer')} className={headerIconBtnClass} title="Geliştirici İletişim"><i className="fa-solid fa-laptop-code fa-lg"></i></button>
                <button onClick={() => setOpenModal('about')} className={headerIconBtnClass} title="Hakkımızda"><i className="fa-solid fa-circle-info fa-lg"></i></button>
                <button onClick={() => setIsFeedbackOpen(true)} className={headerIconBtnClass} title="İletişim / Hata Bildir"><i className="fa-solid fa-headset fa-lg"></i></button>
             </div>
             
             {/* Assessment Button */}
             <button onClick={() => setCurrentView('assessment')} className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[var(--accent-color)] text-black rounded-full text-xs font-extrabold shadow-md hover:shadow-[var(--accent-color)]/30 hover:scale-105 transition-all border border-[var(--accent-hover)]">
                 <i className="fa-solid fa-user-doctor"></i> Değerlendirme
             </button>

             <div className="h-6 w-px bg-[var(--border-color)] mx-1 hidden sm:block"></div>

             {/* User & Settings */}
             <div className="flex items-center gap-2">
                <button id="tour-workbook-btn" onClick={() => setCurrentView('workbook')} className="relative p-2 text-[var(--text-secondary)] hover:text-emerald-500 hover:drop-shadow-[0_0_5px_rgba(16,185,129,0.8)] transition-all rounded-md group" title="Çalışma Kitapçığı">
                    <i className="fa-solid fa-book-open-reader fa-lg"></i>
                    {workbookItems.length > 0 && <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[10px] font-bold px-1.5 rounded-full border border-black min-w-[18px] text-center">{workbookItems.length}</span>}
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
                        {unreadCount > 0 && <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-1.5 rounded-full border-2 border-black">{unreadCount}</span>}
                    </button>
                    <button id="tour-shared-btn" onClick={() => setCurrentView('shared')} className={headerIconBtnClass} title="Paylaşılanlar"><i className="fa-solid fa-share-nodes fa-lg"></i></button>
                    <button id="tour-archive-btn" onClick={() => setCurrentView('savedList')} className={headerIconBtnClass} title="Arşiv"><i className="fa-solid fa-box-archive fa-lg"></i></button>
                    <button id="tour-history-btn" onClick={() => setOpenModal('history')} className={headerIconBtnClass} title="Geçmiş"><i className="fa-solid fa-clock-rotate-left fa-lg"></i></button>
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
        
        <div onMouseEnter={() => setIsSidebarExpanded(true)} className={`transition-all duration-500 ease-in-out h-full ${zenMode ? '-ml-80 w-0 opacity-0 overflow-hidden' : ''}`}>
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
                styleSettings={styleSettings}
            />
        </div>
        
        <div className="flex-1 flex flex-col overflow-hidden" onMouseEnter={() => setIsSidebarExpanded(false)}>
            {/* Loading / Workbook Spinner */}
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
              onAutoGenerateWorkbook={handleAutoGenerateWorkbook}
              studentProfile={studentProfile}
              zenMode={zenMode}
              toggleZenMode={() => setZenMode(!zenMode)}
            />
            
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
      
      <StudentInfoModal isOpen={isStudentModalOpen} onClose={() => setIsStudentModalOpen(false)} currentProfile={studentProfile} onSave={(p) => setStudentProfile(p)} onClear={() => setStudentProfile(null)} />

      <SettingsModal 
          isOpen={openModal === 'settings'} 
          onClose={() => setOpenModal(null)}
          uiSettings={uiSettings}
          onUpdateUiSettings={setUiSettings}
          activeThemeId={uiSettings.activeThemeId || 'anthracite'}
          onUpdateTheme={(newTheme) => setUiSettings(prev => ({...prev, activeThemeId: newTheme.id}))}
      />

      <Modal isOpen={openModal === 'history'} onClose={() => setOpenModal(null)} title="İşlem Geçmişi">
          {/* History Content - Unchanged */}
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
                               <div className="w-10 h-10 rounded-full bg-[var(--bg-primary)] text-[var(--accent-color)] flex items-center justify-center"><i className="fa-solid fa-file-pen"></i></div>
                               <div>
                                  <p className="font-bold text-sm text-[var(--text-primary)]">{item.title}</p>
                                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                                      <span>{new Date(item.timestamp).toLocaleDateString('tr-TR')}</span>
                                  </div>
                               </div>
                          </div>
                          <button onClick={() => { loadSavedWorksheet(item as any); setOpenModal(null); }} className="px-3 py-1.5 text-xs font-bold bg-[var(--bg-inset)] text-[var(--text-primary)] rounded-md hover:bg-[var(--bg-secondary)] transition-colors">Tekrar Aç</button>
                      </div>
                  ))}
              </div>
          )}
      </Modal>

      {/* About & Developer & Contact Modals - Unchanged */}
      <Modal isOpen={openModal === 'about'} onClose={() => setOpenModal(null)} title="Hakkımızda">
        <div className="text-center space-y-6">
            <DyslexiaLogo className="h-16 w-auto mx-auto" />
            <div className="space-y-4 text-zinc-600 dark:text-zinc-300">
                <p>Bursa Disleksi AI, özel öğrenme güçlüğü yaşayan bireyler için...</p>
                {/* ... content ... */}
            </div>
        </div>
      </Modal>
      {/* ... */}
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