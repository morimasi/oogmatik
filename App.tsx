
import React, { useState, useEffect, CSSProperties, ReactNode } from 'react';
import { ActivityType, WorksheetData, SavedWorksheet, SingleWorksheetData, AppTheme } from './types';
// FIX: Error on line 3: Module '"file:///components/Sidebar"' has no default export. Fixed by adding a default export to Sidebar.tsx
import Sidebar from './components/Sidebar';
import ContentArea from './components/ContentArea';
import { ACTIVITIES, ACTIVITY_CATEGORIES } from './constants';

export interface StyleSettings {
  fontSize: number;
  borderColor: string;
  borderWidth: number;
  margin: number;
  pageView: 'single' | 'double';
}

const initialStyleSettings: StyleSettings = {
    fontSize: 16,
    borderColor: '#d4d4d8', // zinc-300
    borderWidth: 1,
    margin: 32, // p-8 tailwind değeri
    pageView: 'single',
};

export type View = 'generator' | 'savedList';
type ModalType = 'how-to-use' | 'about' | 'contact' | 'history' | 'settings';


// Modal Component
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="bg-white dark:bg-zinc-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <header className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-700">
          <h2 id="modal-title" className="text-xl font-bold text-zinc-800 dark:text-zinc-200">{title}</h2>
          <button 
            onClick={onClose} 
            className="text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-full w-8 h-8 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-label="Kapat"
          >
            <i className="fa-solid fa-times"></i>
          </button>
        </header>
        <div className="p-6 overflow-y-auto space-y-4 text-zinc-600 dark:text-zinc-300">
          {children}
        </div>
      </div>
    </div>
  );
};


const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('generator');
  const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(null);
  const [worksheetData, setWorksheetData] = useState<WorksheetData>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openModal, setOpenModal] = useState<ModalType | null>(null);
  
  // Theme state management
  const [theme, setTheme] = useState<AppTheme>(() => {
      // Initialize theme from local storage or system preference
      const storedTheme = localStorage.getItem('app-theme');
      if (storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'contrast' || storedTheme === 'pastel') {
          return storedTheme as AppTheme;
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [styleSettings, setStyleSettings] = useState<StyleSettings>(initialStyleSettings);
  const [savedWorksheets, setSavedWorksheets] = useState<SavedWorksheet[]>([]);

  // Effect to apply theme class to html element
  useEffect(() => {
      const root = document.documentElement;
      // Remove all potential theme classes
      root.classList.remove('dark', 'theme-pastel', 'theme-contrast');

      // Apply current theme class
      if (theme === 'dark') {
          root.classList.add('dark');
      } else if (theme === 'contrast') {
          root.classList.add('theme-contrast');
      } else if (theme === 'pastel') {
          root.classList.add('theme-pastel');
      }
      // 'light' is the default, so no class needed.

      localStorage.setItem('app-theme', theme);
  }, [theme]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('savedWorksheets');
      if (stored) {
        setSavedWorksheets(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Kaydedilmiş çalışma sayfaları localStorage'dan ayrıştırılamadı", e);
      setSavedWorksheets([]);
    }
  }, []);

  const handleResetApp = () => {
    setCurrentView('generator');
    setSelectedActivity(null);
    setWorksheetData(null);
    setError(null);
    setStyleSettings(initialStyleSettings);
    // Not resetting savedWorksheets as it's persistent storage
  };

  const updateLocalStorage = (worksheets: SavedWorksheet[]) => {
    localStorage.setItem('savedWorksheets', JSON.stringify(worksheets));
  };

  const addSavedWorksheet = (name: string, activityType: ActivityType, data: SingleWorksheetData[]) => {
    const activity = ACTIVITIES.find(a => a.id === activityType);
    const category = ACTIVITY_CATEGORIES.find(c => c.activities.includes(activityType));

    if (!activity || !category) {
        console.error("Kaydedilecek etkinlik veya kategori bulunamadı.");
        // Optionally, show an error to the user
        return;
    }

    const newWorksheet: SavedWorksheet = {
      id: new Date().toISOString() + Math.random(),
      name,
      activityType,
      worksheetData: data,
      createdAt: new Date().toISOString(),
      icon: activity.icon || 'fa-solid fa-file',
      category: {
        id: category.id,
        title: category.title,
      },
    };
    const updated = [...savedWorksheets, newWorksheet];
    setSavedWorksheets(updated);
    updateLocalStorage(updated);
  };

  const deleteSavedWorksheet = (id: string) => {
    const updated = savedWorksheets.filter(ws => ws.id !== id);
    setSavedWorksheets(updated);
    updateLocalStorage(updated);
  };

  const loadSavedWorksheet = (worksheet: SavedWorksheet) => {
    setSelectedActivity(worksheet.activityType);
    setWorksheetData(worksheet.worksheetData);
    setCurrentView('generator');
  };

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-sans transition-colors duration-300">
      <header className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800 shadow-sm z-10 print:hidden">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden text-zinc-500 dark:text-zinc-400 hover:text-indigo-500 dark:hover:text-indigo-400 mr-3 p-2 -ml-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 dark:focus-visible:ring-offset-zinc-900"
              aria-label="Menüyü aç"
            >
              <i className="fa-solid fa-bars fa-lg"></i>
            </button>
             <button onClick={handleResetApp} className="flex-shrink-0" aria-label="Uygulamayı sıfırla">
                <svg
                className="w-12 h-12 text-indigo-500 mr-3 hidden sm:block"
                viewBox="0 0 50 50"
                xmlns="http://www.w3.org/2000/svg"
                strokeWidth="2.5"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                >
                <g className="animated-logo">
                    <path d="M 35,25 a 10,10 0 1,1 -20,0 a 10,10 0 1,1 20,0" />
                    <path id="stem-b" d="M 15 15 V 35" />
                    <path id="stem-d" d="M 35 15 V 35" />
                </g>
                </svg>
            </button>
            <div>
                 <h1 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-500">
                    Bursa Disleksi Ai
                </h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:block">Disleksi Dostu Yapay Zeka Destekli Etkinlikler</p>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
             <button 
              onClick={() => setOpenModal('settings')}
              className="text-zinc-500 dark:text-zinc-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors p-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 dark:focus-visible:ring-offset-zinc-900"
              aria-label="Ayarları aç"
              title="Görünüm Ayarları"
            >
              <i className="fa-solid fa-gear fa-lg"></i>
            </button>
            <button 
              onClick={() => setCurrentView('savedList')}
              className="text-zinc-500 dark:text-zinc-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors p-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 dark:focus-visible:ring-offset-zinc-900"
              aria-label="Arşivi aç"
              title="Kaydedilenler"
            >
              <i className="fa-solid fa-box-archive fa-lg"></i>
            </button>
             <button 
              onClick={() => setOpenModal('history')}
              className="text-zinc-500 dark:text-zinc-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors p-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 dark:focus-visible:ring-offset-zinc-900"
              aria-label="Geçmişi aç"
              title="Geçmiş"
            >
              <i className="fa-solid fa-clock-rotate-left fa-lg"></i>
            </button>
            <button 
              onClick={() => setOpenModal('how-to-use')}
              className="hidden sm:block text-zinc-500 dark:text-zinc-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors p-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 dark:focus-visible:ring-offset-zinc-900"
              aria-label="Nasıl kullanılır modülünü aç"
              title="Nasıl Kullanılır?"
            >
              <i className="fa-solid fa-circle-question fa-lg"></i>
            </button>
             <button 
              onClick={() => setOpenModal('about')}
              className="hidden sm:block text-zinc-500 dark:text-zinc-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors p-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 dark:focus-visible:ring-offset-zinc-900"
              aria-label="Hakkımızda modülünü aç"
              title="Hakkımızda"
            >
              <i className="fa-solid fa-circle-info fa-lg"></i>
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {isSidebarOpen && (
            <div 
                className="fixed inset-0 bg-black/50 z-20 md:hidden" 
                onClick={() => setIsSidebarOpen(false)}
                aria-hidden="true"
            ></div>
        )}
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          closeSidebar={() => setIsSidebarOpen(false)}
          selectedActivity={selectedActivity}
          onSelectActivity={setSelectedActivity}
          setWorksheetData={setWorksheetData}
          setIsLoading={setIsLoading}
          setError={setError}
          isLoading={isLoading}
        />
        <ContentArea
          currentView={currentView}
          onBackToGenerator={() => {
            setCurrentView('generator');
            setSelectedActivity(null);
            setWorksheetData(null);
          }}
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
        />
      </div>

      {/* SETTINGS MODAL */}
      <Modal isOpen={openModal === 'settings'} onClose={() => setOpenModal(null)} title="Görünüm Ayarları">
          <div className="space-y-6">
              <div>
                  <h3 className="font-bold text-lg mb-3 text-zinc-800 dark:text-zinc-200">Tema Seçimi</h3>
                  <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => setTheme('light')}
                        className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${theme === 'light' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300'}`}
                      >
                          <div className="w-12 h-8 bg-zinc-100 border border-zinc-300 rounded shadow-sm"></div>
                          <span className="font-medium">Açık (Varsayılan)</span>
                      </button>
                      <button 
                        onClick={() => setTheme('dark')}
                        className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${theme === 'dark' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300'}`}
                      >
                          <div className="w-12 h-8 bg-zinc-800 border border-zinc-600 rounded shadow-sm"></div>
                          <span className="font-medium">Koyu Mod</span>
                      </button>
                      <button 
                        onClick={() => setTheme('pastel')}
                        className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${theme === 'pastel' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300'}`}
                      >
                          <div className="w-12 h-8 bg-[#fffdf5] border border-[#d3cbb8] rounded shadow-sm"></div>
                          <div className="text-center">
                            <span className="font-medium block">Pastel</span>
                            <span className="text-xs text-zinc-500">Göz Dostu / Disleksi</span>
                          </div>
                      </button>
                      <button 
                        onClick={() => setTheme('contrast')}
                        className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${theme === 'contrast' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300'}`}
                      >
                          <div className="w-12 h-8 bg-black border border-white rounded shadow-sm"></div>
                          <div className="text-center">
                             <span className="font-medium block">Yüksek Kontrast</span>
                             <span className="text-xs text-zinc-500">Görme Hassasiyeti</span>
                          </div>
                      </button>
                  </div>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md text-sm text-blue-800 dark:text-blue-200">
                  <p><i className="fa-solid fa-info-circle mr-2"></i><strong>İpucu:</strong> Pastel tema, krem rengi arka planı ve yumuşak metin renkleriyle uzun süreli okumalarda göz yorgunluğunu azaltmaya yardımcı olabilir.</p>
              </div>
          </div>
      </Modal>

      <Modal isOpen={openModal === 'how-to-use'} onClose={() => setOpenModal(null)} title="Nasıl Kullanılır?">
          <p>Bursa Disleksi Ai uygulamasıyla kişiselleştirilmiş etkinlikler oluşturmak çok kolay! Aşağıdaki adımları takip edebilirsiniz:</p>
          <ol className="list-decimal list-inside space-y-2">
              <li><strong>Kategori ve Etkinlik Seçin:</strong> Sol taraftaki menüden bir kategori seçin (örn: Kelime Oyunları) ve ardından ilginizi çeken bir etkinliğe (örn: Kelime Bulmaca) tıklayın.</li>
              <li><strong>Ayarları Yapılandırın:</strong> Etkinlik seçtikten sonra, üretim ayarları ekranı açılacaktır. Buradan "Yapay Zeka" veya "Hızlı Mod"u seçebilir, zorluk seviyesini, sayfa sayısını ve etkinliğe özel diğer ayarları (konu, kelime sayısı vb.) düzenleyebilirsiniz.</li>
              <li><strong>Etkinliği Oluşturun:</strong> Ayarlarınızı yaptıktan sonra "Etkinlik Oluştur" butonuna tıklayın. Yapay zeka sizin için benzersiz bir çalışma sayfası hazırlayacaktır.</li>
              <li><strong>Görüntüleyin ve Düzenleyin:</strong> Oluşturulan etkinlik ekranda belirecektir. Üstteki araç çubuğunu kullanarak yazı tipi boyutunu, sayfa düzenini ve kenar boşluklarını istediğiniz gibi ayarlayabilirsiniz.</li>
              <li><strong>Kaydedin veya Yazdırın:</strong> Hazırladığınız etkinliği daha sonra tekrar kullanmak için "Kaydet" butonuna tıklayabilir veya "Yazdır" butonuyla doğrudan çıktısını alabilirsiniz. Kaydedilen etkinliklere sağ üstteki Arşiv ikonundan ulaşabilirsiniz.</li>
          </ol>
      </Modal>

      <Modal isOpen={openModal === 'about'} onClose={() => setOpenModal(null)} title="Hakkımızda">
          <p>Bursa Disleksi Ai, disleksi gibi öğrenme güçlüğü yaşayan çocuklara ve onlara destek olan eğitimcilere ve ailelere yardımcı olmak amacıyla tasarlanmış bir yapay zeka destekli platformdur.</p>
          <p><strong>Misyonumuz</strong>, en son yapay zeka teknolojilerini kullanarak her çocuğun ihtiyacına uygun, eğlenceli, ilgi çekici ve pedagojik olarak değerli eğitici materyaller üretmektir. Uygulamamız, dikkat, hafıza, okuma-anlama ve mantıksal düşünme gibi temel becerileri geliştirmeye yönelik onlarca farklı etkinlik türü sunar.</p>
          <p>Disleksi dostu tasarım anlayışımız ve kişiselleştirilebilir içerik seçeneklerimizle, öğrenme sürecini daha keyifli ve etkili hale getirmeyi hedefliyoruz.</p>
      </Modal>

       <Modal isOpen={openModal === 'history'} onClose={() => setOpenModal(null)} title="Geçmiş">
          <p>Bu özellik yakında eklenecektir.</p>
          <p>Bu alanda, oturumunuz sırasında oluşturduğunuz son etkinliklerin bir listesini görebileceksiniz. Bu sayede, kaydetmeyi unuttuğunuz bir çalışmaya kolayca geri dönme imkanınız olacak.</p>
      </Modal>

      <Modal isOpen={openModal === 'contact'} onClose={() => setOpenModal(null)} title="İletişim">
          <p>Bizimle iletişime geçmekten çekinmeyin. Her türlü soru, öneri ve iş birliği teklifleriniz için aşağıdaki kanalları kullanabilirsiniz.</p>
          <div className="space-y-3 mt-4">
              <div className="flex items-center gap-4">
                  <i className="fa-solid fa-envelope fa-fw text-zinc-500"></i>
                  <a href="mailto:info@bursadisleksi.ai" className="text-indigo-500 hover:underline">info@bursadisleksi.ai</a>
              </div>
              <div className="flex items-center gap-4">
                  <i className="fa-solid fa-phone fa-fw text-zinc-500"></i>
                  <span>+90 (555) 123 45 67 (Örnek)</span>
              </div>
               <div className="flex items-start gap-4">
                  <i className="fa-solid fa-map-marker-alt fa-fw text-zinc-500 mt-1"></i>
                  <span>Örnek Mah. Teknoloji Cad. No:123<br/>Nilüfer / Bursa, Türkiye (Örnek)</span>
              </div>
          </div>
      </Modal>
    </div>
  );
};

export default App;
