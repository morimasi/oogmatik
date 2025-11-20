
import React from 'react';
import { ActivityType, WorksheetData, SavedWorksheet, SingleWorksheetData } from '../types';
// FIX: Error on line 3: Module '"file:///components/Worksheet"' has no default export. Fixed by adding a default export to Worksheet.tsx
import Worksheet from './Worksheet';
import Toolbar from './Toolbar';
import { StyleSettings, View } from '../App';
import { SavedWorksheetsView } from './SavedWorksheetsView';

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
  onFeedback: () => void; // Added prop
}

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
  onFeedback
}) => {
    
    const handleSave = (name: string) => {
        if (activityType && worksheetData) {
            onSave(name, activityType, worksheetData);
        } else {
            alert("Kaydedilecek bir çalışma sayfası bulunmuyor.");
        }
    }

  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 printable-area relative">
      {currentView === 'generator' ? (
        <>
            {activityType && worksheetData && (
                <div className="mb-6 fade-in print:hidden">
                    <Toolbar 
                        settings={styleSettings} 
                        onSettingsChange={onStyleChange} 
                        onSave={handleSave} 
                        onFeedback={onFeedback}
                    />
                </div>
            )}
            
            {isLoading && (
                <div className="flex justify-center items-center h-full">
                    <div className="text-center">
                        <svg className="animate-spin mx-auto h-12 w-12 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="mt-4 text-lg font-semibold">Yapay zeka çalışıyor...</p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Etkinliğiniz hazırlanıyor, lütfen bekleyin.</p>
                    </div>
                </div>
            )}

            {error && (
                <div className="flex justify-center items-center h-full">
                    <div className="bg-red-100 dark:bg-red-900/50 border-l-4 border-red-500 text-red-700 dark:text-red-200 p-4 rounded-md shadow-md max-w-2xl mx-auto" role="alert">
                        <p className="font-bold">Bir Hata Oluştu</p>
                        <p>{error}</p>
                    </div>
                </div>
            )}

            {!isLoading && !error && !worksheetData && (
                 <div className="flex justify-center items-center h-full">
                    <div className="absolute inset-0 overflow-hidden -z-10">
                        <i className="fa-solid fa-lightbulb text-zinc-200/50 dark:text-zinc-700/50 absolute text-8xl" style={{ top: '15%', left: '10%', animation: 'float 8s ease-in-out infinite' }}></i>
                        <i className="fa-solid fa-book-open text-zinc-200/50 dark:text-zinc-700/50 absolute text-7xl" style={{ top: '60%', left: '5%', animation: 'float 12s ease-in-out infinite 2s' }}></i>
                        <i className="fa-solid fa-puzzle-piece text-zinc-200/50 dark:text-zinc-700/50 absolute text-9xl" style={{ top: '20%', right: '8%', animation: 'float 10s ease-in-out infinite 1s' }}></i>
                        <i className="fa-solid fa-atom text-zinc-200/50 dark:text-zinc-700/50 absolute text-6xl" style={{ bottom: '10%', right: '20%', animation: 'float 9s ease-in-out infinite 3s' }}></i>
                         <i className="fa-solid fa-shapes text-zinc-200/50 dark:text-zinc-700/50 absolute text-7xl" style={{ bottom: '15%', left: '30%', animation: 'float 11s ease-in-out infinite 0.5s' }}></i>
                    </div>
                     <div className="text-center p-8">
                        <div className="w-32 h-32 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-6 mx-auto ring-8 ring-indigo-100/50 dark:ring-indigo-900/20">
                            <i className="fa-solid fa-wand-magic-sparkles text-5xl text-indigo-500 dark:text-indigo-400"></i>
                        </div>
                        <h2 className="text-3xl font-bold mb-2 text-zinc-800 dark:text-zinc-200">Başlamaya Hazır Mısınız?</h2>
                        <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
                           Öğrenmeyi eğlenceli hale getirin. Sol menüden bir etkinlik seçerek yapay zekanın sihrini keşfedin.
                        </p>
                    </div>
                </div>
            )}
            
            {worksheetData && (
                <div className="fade-in">
                  <Worksheet activityType={activityType} data={worksheetData} settings={styleSettings} />
                </div>
            )}
        </>
      ) : (
        <SavedWorksheetsView 
            savedWorksheets={savedWorksheets}
            onLoad={onLoadSaved}
            onDelete={onDeleteSaved}
            onBack={onBackToGenerator}
        />
      )}
    </main>
  );
};

export default ContentArea;
