import React from 'react';
import { ActivityType, WorksheetData, SavedWorksheet, SingleWorksheetData } from '../types';
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
  onDeleteSaved
}) => {
    
    const handleSave = (name: string) => {
        if (activityType && worksheetData) {
            onSave(name, activityType, worksheetData);
        } else {
            alert("Kaydedilecek bir çalışma sayfası bulunmuyor.");
        }
    }

  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 printable-area">
      {currentView === 'generator' ? (
        <>
            {activityType && worksheetData && (
                <div className="mb-6">
                    <Toolbar settings={styleSettings} onSettingsChange={onStyleChange} onSave={handleSave} />
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
                     <div className="text-center text-zinc-500 dark:text-zinc-400">
                        <div className="w-24 h-24 bg-zinc-100 dark:bg-zinc-800/50 rounded-full flex items-center justify-center mb-4 mx-auto">
                            <i className="fa-solid fa-wand-magic-sparkles fa-3x text-zinc-400 dark:text-zinc-500"></i>
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Başlamaya Hazır Mısınız?</h2>
                        <p>Sol menüden bir etkinlik seçin ve ayarlarınızı yaparak <br /> "Etkinlik Oluştur" butonuna tıklayın.</p>
                    </div>
                </div>
            )}
            
            {worksheetData && (
                <Worksheet activityType={activityType} data={worksheetData} settings={styleSettings} />
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