
import React, { useState, useEffect, useMemo } from 'react';
import { ActivityType, WorksheetData, SavedWorksheet, SingleWorksheetData, AppTheme, Activity, HistoryItem, User } from './types';
import Sidebar from './components/Sidebar';
import ContentArea from './components/ContentArea';
import { ACTIVITIES, ACTIVITY_CATEGORIES } from './constants';
import DyslexiaLogo from './components/DyslexiaLogo';
import GlobalSearch from './components/GlobalSearch';
import { FeedbackModal } from './components/FeedbackModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './components/AuthModal';
import { ProfileView } from './components/ProfileView';
import { AdminDashboard } from './components/AdminDashboard';
import { MessagesView } from './components/MessagesView';
import { messagingService } from './services/messagingService';
import { TourGuide, TourStep } from './components/TourGuide';
import { SharedWorksheetsView } from './components/SharedWorksheetsView';
import { SavedWorksheetsView } from './components/SavedWorksheetsView';
import { AssessmentModule } from './components/AssessmentModule';

export interface StyleSettings {
  fontSize: number;
  borderColor: string;
  borderWidth: number;
  margin: number;
  columns: number;
  gap: number;
  showPedagogicalNote: boolean;
}

const initialStyleSettings: StyleSettings = {
    fontSize: 16,
    borderColor: '#d4d4d8',
    borderWidth: 1,
    margin: 32,
    columns: 1,
    gap: 16,
    showPedagogicalNote: true,
};

export type View = 'generator' | 'savedList' | 'profile' | 'admin' | 'messages' | 'shared' | 'assessment';
type ModalType = 'how-to-use' | 'about' | 'contact' | 'history' | 'settings';

// Modal Component (reused)
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
        className={`bg-white dark:bg-zinc-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col transition-all duration-300 ease-out ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-700">
          <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-200">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700"><i className="fa-solid fa-times"></i></button>
        </header>
        <div className="p-6 overflow-y-auto space-y-4 text-zinc-600 dark:text-zinc-300">{children}</div>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT WRAPPED IN PROVIDER ---
const AppContent: React.FC = () => {
  const { user, logout } = useAuth();
  const [currentView, setCurrentView] = useState<View>('generator');
  const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(null);
  const [worksheetData, setWorksheetData] = useState<WorksheetData>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openModal, setOpenModal] = useState<ModalType | null>(null);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isTourOpen, setIsTourOpen] = useState(false);
  
  const [theme, setTheme] = useState<AppTheme>(() => {
      const storedTheme = localStorage.getItem('app-theme');
      return (storedTheme as AppTheme) || 'light';
  });

  const [styleSettings, setStyleSettings] = useState<StyleSettings>(initialStyleSettings);
  const [savedWorksheets, setSavedWorksheets] = useState<SavedWorksheet[]>([]);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);

  // Filtered data based on User ID
  const userSavedWorksheets = useMemo(() => {
      if (!user) return []; // Or local storage only items
      return savedWorksheets.filter(ws => ws.userId === user.id || !ws.userId); // Show owned or legacy
  }, [savedWorksheets, user]);

  const userHistory = useMemo(() => {
      if (!user) return historyItems.filter(h => !h.userId);
      return historyItems.filter(h => h.userId === user.id);
  }, [historyItems, user]);

  useEffect(() => {
      const root = document.documentElement;
      root.classList.remove('dark', 'theme-pastel', 'theme-contrast', 'theme-sepia');
      if (theme === 'dark') root.classList.add('dark');
      else if (theme !== 'light') root.classList.add(`theme-${theme}`);
      localStorage.setItem('app-theme', theme);
  }, [theme]);

  // First Launch Tour Check
  useEffect(() => {
      const hasSeenTour = localStorage.getItem('has_seen_tour_v2');
      if (!hasSeenTour) {
          const timer = setTimeout(() => {
              setIsTourOpen(true);
          }, 1500);
          return () => clearTimeout(timer);
      }
  }, []);

  const handleTourClose = () => {
      setIsTourOpen(false);
      localStorage.setItem('has_seen_tour_v2', 'true');
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem('savedWorksheets');
      if (stored) setSavedWorksheets(JSON.parse(stored));
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
      try {
          const stored = sessionStorage.getItem('sessionHistory');
          if (stored) setHistoryItems(JSON.parse(stored));
      } catch (e) { console.error(e); }
  }, []);

  // Check unread messages periodically
  useEffect(() => {
      if(user) {
          const check = () => setUnreadCount(messagingService.getUnreadCount(user.id));
          check();
          const interval = setInterval(check, 5000);
          return () => clearInterval(interval);
      }
  }, [user]);

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
      sessionStorage.setItem('sessionHistory', JSON.stringify(updatedHistory));
  };

  const addSavedWorksheet = (name: string, activityType: ActivityType, data: SingleWorksheetData[]) => {
    if (!user) {
        setIsAuthModalOpen(true); // Require login to save
        return;
    }
    const activity = ACTIVITIES.find(a => a.id === activityType);
    const category = ACTIVITY_CATEGORIES.find(c => c.activities.includes(activityType));
    if (!activity || !category) return;

    const newWorksheet: SavedWorksheet = {
      id: new Date().toISOString() + Math.random(),
      userId: user.id,
      name,
      activityType,
      worksheetData: data,
      createdAt: new Date().toISOString(),
      icon: activity.icon,
      category: { id: category.id, title: category.title },
    };
    const updated = [...savedWorksheets, newWorksheet];
    setSavedWorksheets(updated);
    localStorage.setItem('savedWorksheets', JSON.stringify(updated));
  };

  const deleteSavedWorksheet = (id: string) => {
    const updated = savedWorksheets.filter(ws => ws.id !== id);
    setSavedWorksheets(updated);
    localStorage.setItem('savedWorksheets', JSON.stringify(updated));
  };

  const loadSavedWorksheet = (worksheet: SavedWorksheet) => {
    setSelectedActivity(worksheet.activityType);
    setWorksheetData(worksheet.worksheetData);
    setCurrentView('generator');
  };

  const handleSelectActivity = (activityType: ActivityType | null) => {
    setSelectedActivity(activityType);
    setWorksheetData(null);
    setError(null);
    setCurrentView('generator');
    if (isSidebarOpen) setIsSidebarOpen(false);
  };

  // View Routing
  if (currentView === 'admin') {
      return <AdminDashboard onBack={() => setCurrentView('generator')} />;
  }
  if (currentView === 'profile') {
      return <ProfileView onBack={() => setCurrentView('generator')} />;
  }
  if (currentView === 'messages') {
      return <MessagesView onBack={() => setCurrentView('generator')} />;
  }
  if (currentView === 'assessment') {
      return (
          <AssessmentModule 
              onBack={() => setCurrentView('generator')} 
              onSelectActivity={(id) => {
                  handleSelectActivity(id);
              }} 
          />
      );
  }

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-sans transition-colors duration-300">
      
      <TourGuide steps={[]} isOpen={isTourOpen} onClose={handleTourClose} />

      <header className="relative bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shadow-sm z-10 print:hidden">
        <div className="container mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-zinc-500 mr-3 p-2"><i className="fa-solid fa-bars fa-lg"></i></button>
             <button id="tour-logo" onClick={() => { setCurrentView('generator'); setSelectedActivity(null); }} className="flex items-center gap-3 px-2 py-1 rounded-lg">
                <DyslexiaLogo className="h-10 w-auto" />
            </button>
          </div>

          <div className="flex items-center gap-2">
             <div id="tour-search">
                <GlobalSearch onSelectActivity={handleSelectActivity} />
             </div>
             
             <button 
                onClick={() => setCurrentView('assessment')}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-full text-xs font-bold shadow-md hover:shadow-lg hover:scale-105 transition-all"
                title="Öğrenme Güçlüğü Analizi"
             >
                 <i className="fa-solid fa-user-doctor"></i> Değerlendirme
             </button>

             <div className="h-6 w-px bg-zinc-300 dark:bg-zinc-700 mx-1 hidden sm:block"></div>

             {/* Authenticated User Actions */}
             <div className="flex items-center gap-2">
             {user ? (
                 <>
                    {user.role === 'admin' && (
                        <button onClick={() => setCurrentView('admin')} className="p-2 text-purple-600 hover:bg-purple-50 rounded-md relative" title="Yönetici Paneli">
                            <i className="fa-solid fa-shield-halved fa-lg"></i>
                        </button>
                    )}
                    
                    <button id="tour-messages-btn" onClick={() => setCurrentView('messages')} className="p-2 text-zinc-500 hover:text-indigo-500 transition-colors rounded-md relative" title="Mesajlar">
                        <i className="fa-solid fa-envelope fa-lg"></i>
                        {unreadCount > 0 && (
                            <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-1.5 rounded-full border-2 border-white dark:border-zinc-900">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    <button id="tour-shared-btn" onClick={() => setCurrentView('shared')} className="p-2 text-zinc-500 hover:text-indigo-500 transition-colors rounded-md" title="Paylaşılanlar">
                        <i className="fa-solid fa-share-nodes fa-lg"></i>
                    </button>

                    <button id="tour-archive-btn" onClick={() => setCurrentView('savedList')} className="p-2 text-zinc-500 hover:text-indigo-500 transition-colors rounded-md" title="Arşiv">
                        <i className="fa-solid fa-box-archive fa-lg"></i>
                    </button>
                    <button id="tour-history-btn" onClick={() => setOpenModal('history')} className="p-2 text-zinc-500 hover:text-indigo-500 transition-colors rounded-md" title="Geçmiş">
                        <i className="fa-solid fa-clock-rotate-left fa-lg"></i>
                    </button>
                    
                    {/* Profile Dropdown Trigger */}
                    <button id="tour-profile-btn" onClick={() => setCurrentView('profile')} className="ml-2">
                        <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full border-2 border-white shadow-sm" />
                    </button>
                 </>
             ) : (
                 <button onClick={() => setIsAuthModalOpen(true)} className="ml-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition-colors shadow-sm">
                     Giriş Yap
                 </button>
             )}
             </div>
             
             <div className="h-6 w-px bg-zinc-300 dark:bg-zinc-700 mx-1"></div>
             <button onClick={() => setOpenModal('settings')} className="text-zinc-500 hover:text-indigo-500 p-2"><i className="fa-solid fa-gear fa-lg"></i></button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>}
        {/* Sidebar is always shown for remaining views (generator, savedList, shared) */}
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
        />
        
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
          savedWorksheets={userSavedWorksheets}
          onLoadSaved={loadSavedWorksheet}
          onDeleteSaved={deleteSavedWorksheet}
          onFeedback={() => setIsFeedbackOpen(true)}
          onOpenAuth={() => setIsAuthModalOpen(true)}
        />
      </div>

      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} activityType={selectedActivity} activityTitle={selectedActivity ? ACTIVITIES.find(a => a.id === selectedActivity)?.title : undefined} />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      
      <Modal isOpen={openModal === 'settings'} onClose={() => setOpenModal(null)} title="Görünüm Ayarları">
          <div className="space-y-4">
              <h3 className="font-bold text-zinc-800 dark:text-zinc-200">Tema</h3>
              <div className="grid grid-cols-3 gap-3">
                  {['light', 'dark', 'pastel', 'sepia', 'contrast'].map((t) => (
                      <button key={t} onClick={() => setTheme(t as AppTheme)} className={`p-3 border rounded capitalize ${theme === t ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700' : 'border-zinc-200'}`}>
                          {t}
                      </button>
                  ))}
              </div>
          </div>
      </Modal>

      <Modal isOpen={openModal === 'history'} onClose={() => setOpenModal(null)} title="İşlem Geçmişi">
          {userHistory.length === 0 ? (
               <div className="text-center py-8 text-zinc-500">
                   <i className="fa-solid fa-clock-rotate-left text-4xl mb-3 opacity-20"></i>
                   <p>Henüz bir işlem geçmişiniz bulunmuyor.</p>
               </div>
          ) : (
              <div className="space-y-3">
                  {userHistory.map((item) => (
                      <div key={item.id} className="p-3 border border-zinc-200 dark:border-zinc-700 rounded-lg flex justify-between items-center hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                          <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                                   <i className="fa-solid fa-file-pen"></i>
                               </div>
                               <div>
                                  <p className="font-bold text-sm text-zinc-800 dark:text-zinc-200">{item.title}</p>
                                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                                      <span><i className="fa-regular fa-calendar mr-1"></i>{new Date(item.timestamp).toLocaleDateString('tr-TR')}</span>
                                      <span><i className="fa-regular fa-clock mr-1"></i>{new Date(item.timestamp).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}</span>
                                  </div>
                               </div>
                          </div>
                          <button onClick={() => { loadSavedWorksheet(item as any); setOpenModal(null); }} className="px-3 py-1.5 text-xs font-bold bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 transition-colors">
                              Tekrar Aç
                          </button>
                      </div>
                  ))}
              </div>
          )}
      </Modal>

      <Modal isOpen={openModal === 'about'} onClose={() => setOpenModal(null)} title="Hakkımızda">
        <div className="text-center space-y-4">
            <DyslexiaLogo className="h-12 w-auto mx-auto mb-4" />
            <p className="text-zinc-600 dark:text-zinc-300">
                Bursa Disleksi Ai, disleksi ve öğrenme güçlüğü yaşayan bireylerin eğitimine destek olmak amacıyla geliştirilmiş yapay zeka destekli bir platformdur.
            </p>
            <p className="text-zinc-600 dark:text-zinc-300">
                Eğitmenler ve aileler için özelleştirilebilir, eğlenceli ve bilimsel temelli etkinlikler sunarak öğrenme sürecini kolaylaştırmayı hedefler.
            </p>
            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-700">
                <p className="text-xs text-zinc-400">Versiyon 1.0.0</p>
                <p className="text-xs text-zinc-400">© 2024 Bursa Disleksi</p>
            </div>
        </div>
      </Modal>

    </div>
  );
};

const App: React.FC = () => (
    <AuthProvider>
        <AppContent />
    </AuthProvider>
);

export default App;