
import React, { useState, useEffect } from 'react';
import { ActivityType, WorksheetData, SavedWorksheet, SingleWorksheetData, AppTheme, HistoryItem, StyleSettings, View, UiSettings } from './types';
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
import { worksheetService } from './services/worksheetService';
import { keepAlive, checkDbConnection } from './services/supabaseClient';
import { SettingsModal } from './components/SettingsModal';
import { TourGuide, TourStep } from './components/TourGuide';

const initialStyleSettings: StyleSettings = {
    fontSize: 16,
    borderColor: '#d4d4d8',
    borderWidth: 1,
    margin: 32,
    columns: 1,
    gap: 16,
    showPedagogicalNote: true,
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
        className={`bg-white dark:bg-zinc-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col transition-all duration-300 ease-out ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-700">
          <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-200">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700"><i className="fa-solid fa-times"></i></button>
        </header>
        <div className="p-6 overflow-y-auto space-y-4 text-zinc-600 dark:text-zinc-300 custom-scrollbar">{children}</div>
      </div>
    </div>
  );
};

const tourSteps: TourStep[] = [
    { targetId: 'tour-logo', title: 'Ana Sayfa', content: 'Uygulamaya hoş geldiniz! Buraya tıklayarak her zaman ana ekrana dönebilir ve etkinlik seçimini sıfırlayabilirsiniz.', position: 'bottom' },
    { targetId: 'tour-sidebar', title: 'Etkinlik Menüsü', content: 'Uygulamanın kalbi burası! Üretmek istediğiniz etkinlik kategorisini ve türünü bu menüden seçin. Seçim yaptıktan sonra ayar ekranı açılacaktır.', position: 'right' },
    { targetId: 'tour-search', title: 'Hızlı Arama', content: 'Yüzlerce etkinlik arasında kaybolmayın. Aradığınız bir etkinliğe buradan hızlıca ulaşabilirsiniz.', position: 'bottom' },
    { targetId: 'tour-content', title: 'İçerik Alanı', content: 'Seçtiğiniz etkinlik ayarları ve ürettiğiniz çalışma kağıtlarınız bu ana alanda görüntülenir.', position: 'left' },
    { targetId: 'tour-toolbar', title: 'Araç Çubuğu', content: 'Etkinlik oluşturulduktan sonra, bu araç çubuğu belirir. Yazdırma, kaydetme, paylaşma ve görünüm ayarlarını (yakınlaştırma, kenar boşluğu vb.) buradan yapabilirsiniz.', position: 'bottom' },
    { targetId: 'tour-favorites-btn', title: 'Favoriler', content: 'En çok kullanılan etkinliklere buradan hızlıca ulaşabilirsiniz.', position: 'bottom' },
    { targetId: 'tour-archive-btn', title: 'Arşiv', content: 'Kaydettiğiniz tüm etkinliklere buradan ulaşabilir, tekrar açabilir veya arkadaşlarınızla paylaşabilirsiniz.', position: 'bottom' },
    { targetId: 'tour-profile-btn', title: 'Profiliniz', content: 'Hesap bilgilerinizi, istatistiklerinizi ve değerlendirme raporlarınızı yönetmek için profilinize gidin.', position: 'bottom' },
];

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
      try {
          const storedTheme = localStorage.getItem('app-theme');
          return (storedTheme as AppTheme) || 'anthracite';
      } catch (e) {
          console.warn("LocalStorage access failed", e);
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
  const [savedWorksheets, setSavedWorksheets] = useState<SavedWorksheet[]>([]);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
      const checkConnection = async () => {
          console.log("🔄 Supabase bağlantısı test ediliyor...");
          const isConnected = await checkDbConnection();
          if (isConnected) {
              console.log("✅ Supabase bağlantısı başarılı.");
          } else {
              console.error("❌ Supabase bağlantısı başarısız. Lütfen internet bağlantınızı kontrol edin.");
          }
      };
      
      checkConnection();
      keepAlive();
      
      const interval = setInterval(() => {
          keepAlive();
      }, 120000);
      return () => clearInterval(interval);
  }, []);

  useEffect(() => {
      if (user) {
          loadUserWorksheets();
          const checkMsgs = async () => {
              try {
                  const count = await messagingService.getUnreadCount(user.id);
                  setUnreadCount(count);
              } catch (e) { console.error(e); }
          };
          checkMsgs();
          const interval = setInterval(checkMsgs, 30000);
          return () => clearInterval(interval);
      } else {
          setSavedWorksheets([]);
      }
  }, [user]);

  useEffect(() => {
      if (!user && ['profile', 'admin', 'messages', 'shared'].includes(currentView)) {
          setCurrentView('generator');
      }
  }, [user, currentView]);

  const loadUserWorksheets = async () => {
      if (user) {
          try {
              const sheets = await worksheetService.getUserWorksheets(user.id);
              setSavedWorksheets(sheets);
          } catch (e) {
              console.error("Worksheets load failed:", e);
          }
      }
  };

  useEffect(() => {
      try {
          const root = document.documentElement;
          const themesToRemove = ['dark', 'theme-pastel', 'theme-contrast', 'theme-sepia', 'theme-purple', 'theme-orange', 'theme-maroon', 'theme-anthracite', 'theme-anthracite-gold', 'theme-anthracite-cyber', 'theme-anthracite-bumblebee', 'theme-anthracite-stone', 'theme-anthracite-honey', 'theme-anthracite-onyx'];
          root.classList.remove(...themesToRemove);
          if (theme === 'dark') root.classList.add('dark');
          else if (theme !== 'light') root.classList.add(`theme-${theme}`);
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

  useEffect(() => {
      try {
          const stored = sessionStorage.getItem('sessionHistory');
          if (stored) {
              try {
                  setHistoryItems(JSON.parse(stored));
              } catch (parseError) {
                  sessionStorage.removeItem('sessionHistory');
              }
          }
      } catch (e) { console.error("SessionStorage access failed:", e); }
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
            { id: category.id, title: category.title }
        );
        loadUserWorksheets(); 
    } catch (e: any) {
        console.error("Save error:", e);
        alert(`Kaydedilirken bir hata oluştu: ${e.message || 'Detaylar için konsolu kontrol edin.'}`);
    }
  };

  const deleteSavedWorksheet = async (id: string) => {
    await worksheetService.deleteWorksheet(id);
    loadUserWorksheets();
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

  if (currentView === 'admin') {
      return <AdminDashboard onBack={() => setCurrentView('generator')} />;
  }
  if (currentView === 'profile') {
      return <ProfileView onBack={() => setCurrentView('generator')} />;
  }
  if (currentView === 'messages') {
      return <MessagesView onBack={() => setCurrentView('generator')} />;
  }

  return (
    <div className="flex flex-col h-screen bg-transparent font-sans transition-colors duration-300">
      
      <header className="relative bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-700/50 shadow-sm z-10 print:hidden">
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
             
             <div className="flex items-center gap-1 border-r border-zinc-300 dark:border-zinc-700 pr-2 mx-1">
                <button onClick={() => setIsTourOpen(true)} className="p-2 text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors rounded-md" title="Nasıl Kullanılır?">
                    <i className="fa-solid fa-question-circle fa-lg"></i>
                </button>
                <button onClick={() => setOpenModal('developer')} className="p-2 text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors rounded-md" title="Geliştirici İletişim">
                    <i className="fa-solid fa-laptop-code fa-lg"></i>
                </button>
                <button onClick={() => setOpenModal('about')} className="p-2 text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors rounded-md" title="Hakkımızda">
                    <i className="fa-solid fa-circle-info fa-lg"></i>
                </button>
                <button onClick={() => setIsFeedbackOpen(true)} className="p-2 text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors rounded-md" title="İletişim / Hata Bildir">
                    <i className="fa-solid fa-headset fa-lg"></i>
                </button>
             </div>
             
             <button 
                onClick={() => setCurrentView('assessment')} // Assesment Module
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-full text-xs font-bold shadow-md hover:shadow-lg hover:scale-105 transition-all"
                title="Öğrenme Güçlüğü Analizi"
             >
                 <i className="fa-solid fa-user-doctor"></i> Değerlendirme
             </button>

             <div className="h-6 w-px bg-zinc-300 dark:bg-zinc-700 mx-1 hidden sm:block"></div>

             <div className="flex items-center gap-2">
             
                {/* Favorites Button - Always visible */}
                <button id="tour-favorites-btn" onClick={() => setCurrentView('favorites')} className="p-2 text-zinc-500 hover:text-red-500 transition-colors rounded-md relative group" title="Favoriler">
                    <i className="fa-solid fa-heart fa-lg"></i>
                    <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-zinc-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">Favoriler</span>
                </button>

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
          savedWorksheets={savedWorksheets}
          onLoadSaved={loadSavedWorksheet}
          onDeleteSaved={deleteSavedWorksheet}
          onFeedback={() => setIsFeedbackOpen(true)}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onSelectActivity={handleSelectActivity}
        />
      </div>
      
      <TourGuide steps={tourSteps} isOpen={isTourOpen} onClose={() => setIsTourOpen(false)} />

      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} activityType={selectedActivity} activityTitle={selectedActivity ? ACTIVITIES.find(a => a.id === selectedActivity)?.title : undefined} />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      
      {/* SETTINGS MODAL */}
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

      <Modal isOpen={openModal === 'developer'} onClose={() => setOpenModal(null)} title="Geliştirici İletişim">
        <div className="text-center space-y-6">
            {/* Intro */}
            <div>
                <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 mb-3">Uygulama Geliştiricisi</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    Uygulama ile ilgili her türlü soru, öneri veya geri bildiriminiz için bizimle iletişime geçebilirsiniz. Gelişimimize katkıda bulunduğunuz için teşekkür ederiz.
                </p>
            </div>

            {/* Contact Info Box */}
            <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-3">
                <div className="flex flex-col items-center gap-1">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">E-posta</span>
                    <a href="mailto:morimasi@gmail.com" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">morimasi@gmail.com</a>
                </div>
                <div className="flex justify-center gap-3 flex-wrap">
                    <span className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-600 px-3 py-1 rounded-full text-sm font-medium text-zinc-600 dark:text-zinc-300">
                        <i className="fa-brands fa-instagram mr-1"></i> @bbmaltunel
                    </span>
                    <span className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-600 px-3 py-1 rounded-full text-sm font-medium text-zinc-600 dark:text-zinc-300">
                        <i className="fa-brands fa-x-twitter mr-1"></i> @barismutlualtunel
                    </span>
                </div>
            </div>

            {/* Pitch / CTA */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-6 rounded-xl shadow-lg text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                <div className="relative z-10">
                    <h4 className="font-bold text-lg mb-2">Dijital Eğitim Materyali Projeleriniz İçin</h4>
                    <p className="text-sm text-indigo-100 leading-relaxed">
                        Belirlediğiniz bir alanda, istediğiniz mantıklı işlevlere sahip özgür, güvenli ve eğitsel dijital ürün çözümleri için lütfen iletişime geçiniz.
                    </p>
                </div>
            </div>
        </div>
      </Modal>

    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
