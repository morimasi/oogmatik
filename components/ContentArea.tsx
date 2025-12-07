
import React, { memo, useState, useRef, useEffect, useCallback } from 'react';
import { ActivityType, WorksheetData, SavedWorksheet, SingleWorksheetData, StyleSettings, View, CollectionItem, WorkbookSettings, StudentProfile, SavedAssessment, OverlayItem, AssessmentReport } from '../types';
import Worksheet from './Worksheet';
import { ACTIVITIES } from '../constants';
import { EditableContext } from './Editable';
import { SavedWorksheetsView } from './SavedWorksheetsView';
import { SharedWorksheetsView } from './SharedWorksheetsView';
import { FavoritesSection } from './FavoritesSection';
import { WorkbookView } from './WorkbookView';
import { Toolbar } from './Toolbar';
import { DrawLayer } from './DrawLayer';
import DyslexiaLogo from './DyslexiaLogo';
import { speechService } from '../utils/speechService';

interface ContentAreaProps {
    currentView: View;
    onBackToGenerator: () => void;
    activityType: ActivityType | null;
    worksheetData: WorksheetData;
    isLoading: boolean;
    error: string | null;
    styleSettings: StyleSettings;
    onStyleChange: (settings: StyleSettings) => void;
    onSave: (name: string, activityType: ActivityType, data: SingleWorksheetData[]) => Promise<void>;
    onLoadSaved: (worksheet: SavedWorksheet) => void;
    onFeedback: () => void;
    onOpenAuth: () => void;
    onSelectActivity: (id: ActivityType) => void;
    workbookItems: CollectionItem[];
    setWorkbookItems: React.Dispatch<React.SetStateAction<CollectionItem[]>>;
    workbookSettings: WorkbookSettings;
    setWorkbookSettings: React.Dispatch<React.SetStateAction<WorkbookSettings>>;
    onAddToWorkbook: () => void;
    onAutoGenerateWorkbook: (report: AssessmentReport) => void;
    studentProfile: StudentProfile | null;
    zenMode: boolean;
    toggleZenMode: () => void;
}

const LandingText = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-60">
        <DyslexiaLogo className="w-64 h-auto mb-8 text-zinc-300 dark:text-zinc-600" />
        <h2 className="text-2xl font-bold text-zinc-400 dark:text-zinc-500 mb-2">Hoş Geldiniz</h2>
        <p className="text-zinc-400 dark:text-zinc-500 max-w-md">
            Sol menüden bir etkinlik seçerek başlayın veya kayıtlı çalışmalarınızı görüntüleyin.
        </p>
    </div>
);

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
    onLoadSaved,
    onFeedback,
    onOpenAuth,
    onSelectActivity,
    workbookItems,
    setWorkbookItems,
    workbookSettings,
    setWorkbookSettings,
    onAddToWorkbook,
    onAutoGenerateWorkbook,
    studentProfile,
    zenMode,
    toggleZenMode
}) => {
    // Local UI State
    const [isEditMode, setIsEditMode] = useState(false);
    const [isDrawMode, setIsDrawMode] = useState(false);
    const [scale, setScale] = useState(1);
    const [showQR, setShowQR] = useState(false);
    const [overlayItems, setOverlayItems] = useState<OverlayItem[]>([]);
    
    // Reset state when activity changes
    useEffect(() => {
        setIsEditMode(false);
        setIsDrawMode(false);
        setOverlayItems([]);
        setShowQR(false);
    }, [activityType]);

    // SMART INHERITANCE: Sync UI Theme to Worksheet
    useEffect(() => {
        if (activityType) {
            const rootStyle = getComputedStyle(document.documentElement);
            const themeBorderColor = rootStyle.getPropertyValue('--border-color').trim();
            
            const activity = ACTIVITIES.find(a => a.id === activityType);
            
            // Merge defaults with current theme colors
            const newSettings = {
                ...styleSettings,
                borderColor: themeBorderColor || styleSettings.borderColor,
                ...activity?.defaultStyle
            };
            
            onStyleChange(newSettings);
        }
    }, [activityType]);

    const handleSaveCurrent = async () => {
        if (activityType && worksheetData) {
            const name = prompt("Çalışma sayfası için bir isim girin:", "Adsız Çalışma");
            if (name) {
                await onSave(name, activityType, worksheetData);
            }
        }
    };

    const handleAddSticker = (url: string) => {
        setOverlayItems(prev => [...prev, {
            id: crypto.randomUUID(),
            type: 'sticker',
            content: url,
            x: 50,
            y: 50,
            pageIndex: 0 // Default to first page for now
        }]);
    };

    // Render logic based on view
    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center h-full">
                    <i className="fa-solid fa-circle-notch fa-spin text-4xl text-indigo-500 mb-4"></i>
                    <p className="text-zinc-500 font-medium">İçerik hazırlanıyor...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-500 text-2xl">
                        <i className="fa-solid fa-triangle-exclamation"></i>
                    </div>
                    <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-200 mb-2">Bir Hata Oluştu</h3>
                    <p className="text-zinc-600 dark:text-zinc-400 max-w-md">{error}</p>
                    <button onClick={onBackToGenerator} className="mt-6 px-6 py-2 bg-zinc-200 hover:bg-zinc-300 rounded-lg text-zinc-700 font-bold transition-colors">
                        Geri Dön
                    </button>
                </div>
            );
        }

        switch (currentView) {
            case 'savedList':
                return <SavedWorksheetsView onLoad={onLoadSaved} onBack={onBackToGenerator} />;
            case 'shared':
                return <SharedWorksheetsView onLoad={onLoadSaved} onBack={onBackToGenerator} />;
            case 'favorites':
                return <FavoritesSection onSelectActivity={onSelectActivity} onBack={onBackToGenerator} />;
            case 'workbook':
                return (
                    <WorkbookView 
                        items={workbookItems} 
                        setItems={setWorkbookItems} 
                        settings={workbookSettings} 
                        setSettings={setWorkbookSettings} 
                        onBack={onBackToGenerator} 
                    />
                );
            case 'generator':
            default:
                if (!worksheetData || !activityType) return <LandingText />;
                
                return (
                    <div className="flex flex-col h-full relative">
                        {/* Toolbar */}
                        <div className="bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 p-2 shadow-sm z-20">
                            <Toolbar 
                                settings={styleSettings}
                                onSettingsChange={onStyleChange}
                                onSave={handleSaveCurrent}
                                onFeedback={onFeedback}
                                onTogglePreview={() => { /* Handled in Toolbar internally */ }}
                                isPreviewMode={false}
                                onAddToWorkbook={onAddToWorkbook}
                                workbookItemCount={workbookItems.length}
                                onViewWorkbook={() => { /* Navigate handled by parent usually */ }}
                                onToggleEdit={() => setIsEditMode(!isEditMode)}
                                isEditMode={isEditMode}
                                isDrawMode={isDrawMode}
                                onToggleDraw={() => setIsDrawMode(!isDrawMode)}
                                onAddSticker={handleAddSticker}
                                onSpeak={() => {
                                    // Simple TTS for instruction/title
                                    const text = `${worksheetData[0]?.title}. ${worksheetData[0]?.instruction}`;
                                    speechService.speak(text);
                                }}
                                isSpeaking={speechService.isActive()}
                                onStopSpeak={() => speechService.stop()}
                                showQR={showQR}
                                onToggleQR={() => setShowQR(!showQR)}
                                worksheetData={worksheetData}
                            />
                        </div>

                        {/* Worksheet Container */}
                        <div className="flex-1 overflow-auto bg-zinc-100 dark:bg-zinc-900/50 p-8 relative custom-scrollbar flex justify-center">
                            <EditableContext.Provider value={{ isEditMode, zoom: scale }}>
                                <div className="relative">
                                    <Worksheet 
                                        activityType={activityType} 
                                        data={worksheetData} 
                                        settings={styleSettings} 
                                        studentProfile={studentProfile}
                                        overlayItems={overlayItems}
                                        showQR={showQR}
                                    />
                                    {isDrawMode && <DrawLayer isActive={true} zoom={styleSettings.scale} />}
                                </div>
                            </EditableContext.Provider>
                        </div>

                        {/* Zen Mode Toggle (Floating) */}
                        <button 
                            onClick={toggleZenMode}
                            className="absolute bottom-4 right-4 w-10 h-10 bg-white/80 dark:bg-black/50 backdrop-blur rounded-full flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white shadow-lg border border-zinc-200 dark:border-zinc-700 transition-all z-30"
                            title={zenMode ? "Zen Modundan Çık" : "Zen Modu"}
                        >
                            <i className={`fa-solid ${zenMode ? 'fa-compress' : 'fa-expand'}`}></i>
                        </button>
                    </div>
                );
        }
    };

    return (
        <div className="w-full h-full bg-zinc-50 dark:bg-black transition-colors duration-300">
            {renderContent()}
        </div>
    );
};

export default React.memo(ContentArea);
