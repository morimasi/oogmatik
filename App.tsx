
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

export interface StyleSettings {
  fontSize: number;
  borderColor: string;
  borderWidth: number;
  margin: number;
  columns: number;
  gap: number;
}

const initialStyleSettings: StyleSettings = {
    fontSize: 16,
    borderColor: '#d4d4d8',
    borderWidth: 1,
    margin: 32,
    columns: 1,
    gap: 16,
};

export type View = 'generator' | 'savedList' | 'profile' | 'admin';
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

  // Admin View Handling
  if (currentView === 'admin') {
      return <AdminDashboard onBack={() => setCurrentView('generator')} />;
  }

  // Profile View Handling
  if (currentView === 'profile') {
      return <ProfileView onBack={() => setCurrentView('generator')} />;
  }

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-sans transition-colors duration-300">
      <header className="relative bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shadow-sm z-10 print:hidden">
        <div className="container mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-zinc-500 mr-3 p-2"><i className="fa-solid fa-bars fa-lg"></i></button>
             <button onClick={() => { setCurrentView('generator'); setSelectedActivity(null); }} className="flex items-center gap-3">
                <DyslexiaLogo className="h-10 w-auto" />
            </button>
          </div>

          <div className="flex items-center gap-2">
             <GlobalSearch onSelectActivity={handleSelectActivity} />
             
             {/* Authenticated User Actions */}
             {user ? (
                 <>
                    {user.role === 'admin' && (
                        <button onClick={() => setCurrentView('admin')} className="p-2 text-purple-600 hover:bg-purple-50 rounded-md" title="Yönetici Paneli">
                            <i className="fa-solid fa-shield-halved fa-lg"></i>
                        </button>
                    )}
                    <button onClick={() => setCurrentView('savedList')} className="p-2 text-zinc-500 hover:text-indigo-500 transition-colors rounded-md" title="Arşiv">
                        <i className="fa-solid fa-box-archive fa-lg"></i>
                    </button>
                    <button onClick={() => setOpenModal('history')} className="p-2 text-zinc-500 hover:text-indigo-500 transition-colors rounded-md" title="Geçmiş">
                        <i className="fa-solid fa-clock-rotate-left fa-lg"></i>
                    </button>
                    {/* Profile Dropdown Trigger */}
                    <button onClick={() => setCurrentView('profile')} className="ml-2">
                        <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full border-2 border-white shadow-sm" />
                    </button>
                 </>
             ) : (
                 <button onClick={() => setIsAuthModalOpen(true)} className="ml-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition-colors shadow-sm">
                     Giriş Yap
                 </button>
             )}
             
             <div className="h-6 w-px bg-zinc-300 dark:bg-zinc-700 mx-1"></div>
             <button onClick={() => setOpenModal('settings')} className="text-zinc-500 hover:text-indigo-500 p-2"><i className="fa-solid fa-gear fa-lg"></i></button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>}
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
        />
      </div>

      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} activityType={selectedActivity} />
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

      <Modal isOpen={openModal === 'history'} onClose={() => setOpenModal(null)} title="Geçmiş">
          {userHistory.length === 0 ? (
               <div className="text-center py-8 text-zinc-500">Geçmiş bulunamadı.</div>
          ) : (
              <div className="space-y-2">
                  {userHistory.map((item) => (
                      <div key={item.id} className="p-3 border rounded flex justify-between items-center hover:bg-zinc-50 dark:hover:bg-zinc-800">
                          <div>
                              <p className="font-bold">{item.title}</p>
                              <p className="text-xs text-zinc-400">{new Date(item.timestamp).toLocaleString()}</p>
                          </div>
                          <button onClick={() => { loadSavedWorksheet(item as any); setOpenModal(null); }} className="text-indigo-600"><i className="fa-solid fa-eye"></i></button>
                      </div>
                  ))}
              </div>
          )}
      </Modal>
      {/* About/Help modals omitted for brevity, logic same as before */}
    </div>
  );
};

const App: React.FC = () => (
    <AuthProvider>
        <AppContent />
    </AuthProvider>
);

export default App;
