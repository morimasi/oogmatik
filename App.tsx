import React, { useState, useEffect, CSSProperties } from 'react';
import { ActivityType, WorksheetData, SavedWorksheet, SingleWorksheetData } from './types';
import Sidebar from './components/Sidebar';
import ContentArea from './components/ContentArea';
import { ACTIVITIES, ACTIVITY_CATEGORIES } from './constants';

export interface StyleSettings {
  fontSize: number;
  borderColor: string;
  borderWidth: number;
  dyslexiaFriendlyFont: boolean;
  layout: '1x1' | '1x2' | '2x2';
  margin: number;
  pageView: 'single' | 'double';
}

export type View = 'generator' | 'savedList';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('generator');
  const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(null);
  const [worksheetData, setWorksheetData] = useState<WorksheetData>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [styleSettings, setStyleSettings] = useState<StyleSettings>({
    fontSize: 16,
    borderColor: '#d4d4d8', // zinc-300
    borderWidth: 1,
    dyslexiaFriendlyFont: false,
    layout: '1x1',
    margin: 32, // p-8 tailwind değeri
    pageView: 'single',
  });
  const [savedWorksheets, setSavedWorksheets] = useState<SavedWorksheet[]>([]);

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
    <div className="flex flex-col h-screen bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-sans">
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
            <svg
              className="animated-logo w-12 h-12 text-indigo-500 mr-3 hidden sm:block"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v0A2.5 2.5 0 0 1 9.5 7v0A2.5 2.5 0 0 1 7 4.5v0A2.5 2.5 0 0 1 9.5 2m0 0V1" />
              <path d="M9.5 7v3.5" />
              <path d="M14.5 2A2.5 2.5 0 0 1 17 4.5v0A2.5 2.5 0 0 1 14.5 7v0A2.5 2.5 0 0 1 12 4.5v0A2.5 2.5 0 0 1 14.5 2m0 0V1" />
              <path d="M14.5 7v3.5" />
              <path d="M12 14a2.5 2.5 0 0 0 2.5 2.5v0a2.5 2.5 0 0 0 2.5 2.5" />
              <path d="M12 19.5a2.5 2.5 0 0 1-2.5-2.5v0a2.5 2.5 0 0 1-2.5-2.5" />
              <path d="M12 14v-1.5" />
              <path d="M12 19.5V22" />
              <path d="M17 19.5a2.5 2.5 0 0 0 2.5-2.5v0a2.5 2.5 0 0 0-2.5-2.5" />
              <path d="M7 19.5a2.5 2.5 0 0 1-2.5-2.5v0A2.5 2.5 0 0 1 7 14.5" />
              <path d="M14.5 10.5h-5" />
              <path d="M17 14.5h3.5" />
              <path d="M3.5 14.5H7" />
              <path d="M17.5 10.5c.38 0 .75.02 1.12.05" />
              <path d="M5.38 10.55A12.3 12.3 0 0 0 3.5 10.5" />
              <path d="M12 1A11 11 0 1 0 12 23 11 11 0 1 0 12 1" />
            </svg>
            <div>
                 <h1 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-500">
                    Bursa Disleksi Ai
                </h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:block">Disleksi Dostu Yapay Zeka Destekli Etkinlikler</p>
            </div>
          </div>
          <a 
            href="https://github.com/google-gemini" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-zinc-500 dark:text-zinc-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors p-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 dark:focus-visible:ring-offset-zinc-900"
            aria-label="Google Gemini on GitHub"
          >
            <i className="fa-brands fa-github fa-2x"></i>
          </a>
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
          savedWorksheets={savedWorksheets}
          onShowSavedList={() => setCurrentView('savedList')}
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
    </div>
  );
};

export default App;