import React, { useState, CSSProperties } from 'react';
import { ActivityType, WorksheetData } from './types';
import Sidebar from './components/Sidebar';
import ContentArea from './components/ContentArea';

export interface StyleSettings {
  fontFamily: string;
  fontSize: number;
  borderColor: string;
  borderWidth: number;
}

const App: React.FC = () => {
  const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(null);
  const [worksheetData, setWorksheetData] = useState<WorksheetData>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [styleSettings, setStyleSettings] = useState<StyleSettings>({
    fontFamily: 'sans-serif',
    fontSize: 16,
    borderColor: '#e5e7eb', // gray-200
    borderWidth: 1,
  });

  const handleWorksheetStyle = (): CSSProperties => {
    return {
      fontFamily: styleSettings.fontFamily,
      fontSize: `${styleSettings.fontSize}px`,
      '--worksheet-border-color': styleSettings.borderColor,
      '--worksheet-border-width': `${styleSettings.borderWidth}px`,
    } as CSSProperties;
  }

  return (
    <div className="flex flex-col h-screen bg-slate-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans">
      <header className="bg-white dark:bg-gray-800 shadow-md z-10 print:hidden">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <i className="fa-solid fa-brain text-4xl text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-cyan-500 mr-3"></i>
            <div>
                 <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-cyan-500">
                    AI Etkinlik Üretici
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Çocuklar için Eğitici ve Eğlenceli Çalışma Sayfaları</p>
            </div>
          </div>
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-gray-500 dark:text-gray-400 hover:text-teal-500 dark:hover:text-teal-400 transition-colors"
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
        />
        <ContentArea
          activityType={selectedActivity}
          worksheetData={worksheetData}
          isLoading={isLoading}
          error={error}
          styleSettings={styleSettings}
          onStyleChange={setStyleSettings}
          worksheetStyles={handleWorksheetStyle()}
        />
      </div>
    </div>
  );
};

export default App;