import React, { useState, useEffect, CSSProperties } from 'react';
import { ActivityType, WorksheetData, SavedWorksheet } from './types';
import Sidebar from './components/Sidebar';
import ContentArea from './components/ContentArea';
import { ACTIVITIES } from './constants';

// aistudio'nun pencere nesnesinde tanımlı olmayabileceği için TypeScript'i memnun etmek üzere bildirimi yapılıyor.
// FIX: To resolve a TypeScript error about conflicting global type declarations for `window.aistudio`,
// an `AIStudio` interface has been introduced to provide a named type, ensuring consistency across the application.
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio?: AIStudio;
  }
}

export interface StyleSettings {
  fontSize: number;
  borderColor: string;
  borderWidth: number;
}

const App: React.FC = () => {
  const [isApiKeySelected, setIsApiKeySelected] = useState<boolean>(false);
  const [checkingApiKey, setCheckingApiKey] = useState<boolean>(true);
  const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(null);
  const [worksheetData, setWorksheetData] = useState<WorksheetData>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [styleSettings, setStyleSettings] = useState<StyleSettings>({
    fontSize: 16,
    borderColor: '#e5e7eb', // gray-200
    borderWidth: 1,
  });
  const [savedWorksheets, setSavedWorksheets] = useState<SavedWorksheet[]>([]);

  useEffect(() => {
    const checkApiKey = async () => {
      try {
        if (window.aistudio && (await window.aistudio.hasSelectedApiKey())) {
          setIsApiKeySelected(true);
        }
      } catch (e) {
        console.error("API anahtarı kontrol edilirken hata oluştu:", e);
      } finally {
        setCheckingApiKey(false);
      }
    };
    // aistudio'nun kullanılabilir olması biraz zaman alabilir
    setTimeout(checkApiKey, 100);
  }, []);
  
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

  const handleSelectKey = async () => {
    if (window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
        setIsApiKeySelected(true); // Yarış koşullarını önlemek için başarı varsayılıyor
      } catch (e) {
        console.error("API anahtar seçimi açılamadı:", e);
      }
    }
  };

  const updateLocalStorage = (worksheets: SavedWorksheet[]) => {
    localStorage.setItem('savedWorksheets', JSON.stringify(worksheets));
  };

  const addSavedWorksheet = (name: string, activityType: ActivityType, data: WorksheetData) => {
    const activity = ACTIVITIES.find(a => a.id === activityType);
    const icon = activity?.icon || 'fa-solid fa-file';
    const newWorksheet: SavedWorksheet = {
      id: new Date().toISOString() + Math.random(),
      name,
      activityType,
      worksheetData: data,
      createdAt: new Date().toISOString(),
      icon,
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
  };


  const handleWorksheetStyle = (): CSSProperties => {
    return {
      fontSize: `${styleSettings.fontSize}px`,
      '--worksheet-border-color': styleSettings.borderColor,
      '--worksheet-border-width': `${styleSettings.borderWidth}px`,
    } as CSSProperties;
  }

  if (checkingApiKey) {
    return (
      <div className="flex items-center justify-center h-screen bg-stone-50 dark:bg-slate-900">
        <p className="text-lg text-gray-600 dark:text-gray-400">Yükleniyor...</p>
      </div>
    );
  }

  if (!isApiKeySelected) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-stone-50 dark:bg-slate-900 text-center p-4">
        <i className="fa-solid fa-key text-6xl text-yellow-500 mb-6"></i>
        <h1 className="text-3xl font-bold mb-2">API Anahtarı Gerekli</h1>
        <p className="max-w-md text-gray-600 dark:text-gray-400 mb-8">
          Bu yapay zeka destekli uygulamayı kullanmaya başlamak için lütfen bir Google AI Studio API anahtarı seçin.
        </p>
        <button
          onClick={handleSelectKey}
          className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center"
        >
          <i className="fa-solid fa-lock-open mr-2"></i> API Anahtarı Seç
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-stone-50 dark:bg-slate-900 text-gray-800 dark:text-gray-200 font-sans">
      <header className="bg-white dark:bg-slate-800 shadow-md z-10 print:hidden">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <i className="fa-solid fa-brain text-4xl text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-500 mr-3"></i>
            <div>
                 <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-500">
                    AI Etkinlik Üretici
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Çocuklar için Eğitici ve Eğlenceli Çalışma Sayfaları</p>
            </div>
          </div>
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-gray-500 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
            aria-label="GitHub Repository"
          >
            <i className="fa-brands fa-github fa-2x"></i>
          </a>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          selectedActivity={selectedActivity}
          onSelectActivity={setSelectedActivity}
          setWorksheetData={setWorksheetData}
          setIsLoading={setIsLoading}
          setError={setError}
          isLoading={isLoading}
          savedWorksheets={savedWorksheets}
          onLoadSaved={loadSavedWorksheet}
          onDeleteSaved={deleteSavedWorksheet}
        />
        <ContentArea
          activityType={selectedActivity}
          worksheetData={worksheetData}
          isLoading={isLoading}
          error={error}
          styleSettings={styleSettings}
          onStyleChange={setStyleSettings}
          worksheetStyles={handleWorksheetStyle()}
          onSave={addSavedWorksheet}
        />
      </div>
    </div>
  );
};

export default App;