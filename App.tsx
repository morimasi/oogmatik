
import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { ActivityType, WorksheetData, SavedWorksheet, SingleWorksheetData, AppTheme, HistoryItem, StyleSettings, View, UiSettings, CollectionItem, WorkbookSettings, StudentProfile, AssessmentReport, GeneratorOptions, SavedAssessment } from './types';
import Sidebar from './components/Sidebar';
import ContentArea from './components/ContentArea';
import { ACTIVITIES, ACTIVITY_CATEGORIES } from './constants';
import DyslexiaLogo from './components/DyslexiaLogo';
import GlobalSearch from './components/GlobalSearch';
import { FeedbackModal } from './components/FeedbackModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './components/AuthModal';
import { historyService } from './services/historyService';
import { worksheetService } from './services/worksheetService';
import { SettingsModal } from './components/SettingsModal';
import { TourGuide, TourStep } from './components/TourGuide';
import { StudentInfoModal } from './components/StudentInfoModal';

// Lazy Loaded Components
const ProfileView = lazy(() => import('./components/ProfileView').then(module => ({ default: module.ProfileView })));
const AdminDashboard = lazy(() => import('./components/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
const MessagesView = lazy(() => import('./components/MessagesView').then(module => ({ default: module.MessagesView })));
const OCRScanner = lazy(() => import('./components/OCRScanner').then(module => ({ default: module.OCRScanner })));
const CurriculumView = lazy(() => import('./components/CurriculumView').then(module => ({ default: module.CurriculumView })));
const ReadingStudio = lazy(() => import('./components/ReadingStudio/ReadingStudio').then(module => ({ default: module.ReadingStudio })));

const initialStyleSettings: StyleSettings = { fontSize: 16, scale: 1, borderColor: '#d4d4d8', borderWidth: 1, margin: 20, columns: 1, gap: 16, orientation: 'portrait', themeBorder: 'simple', contentAlign: 'center', fontWeight: 'normal', fontStyle: 'normal', visualStyle: 'card', showPedagogicalNote: false, showMascot: false, showStudentInfo: false, showTitle: false, showInstruction: false, showImage: false, showFooter: false, smartPagination: false, fontFamily: 'OpenDyslexic', lineHeight: 1.5, letterSpacing: 0 };
const initialUiSettings: UiSettings = { fontFamily: 'OpenDyslexic', fontSizeScale: 1, letterSpacing: 'normal', lineHeight: 1.6, saturation: 100 };

const LoadingSpinner = () => ( <div className="flex items-center justify-center h-full w-full min-h-[200px]"><div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div></div> );

const AppContent: React.FC = () => {
    const { user, logout } = useAuth();
    const [currentView, setCurrentView] = useState<View | 'ocr' | 'curriculum' | 'reading-studio'>('generator');
    const [viewHistory, setViewHistory] = useState<(View | 'ocr' | 'curriculum' | 'reading-studio')[]>([]); 
    
    const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(null);
    const [worksheetData, setWorksheetData] = useState<WorksheetData>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
    const [openModal, setOpenModal] = useState<'settings' | 'history' | 'about' | 'developer' | null>(null);
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isTourOpen, setIsTourOpen] = useState(false);
    const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
    const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
    const [workbookItems, setWorkbookItems] = useState<CollectionItem[]>([]);
    const [workbookSettings, setWorkbookSettings] = useState<WorkbookSettings>({ title: 'Çalışma Kitapçığı', studentName: '', schoolName: '', year: new Date().getFullYear().toString(), teacherNote: '', theme: 'modern', accentColor: '#4f46e5', coverStyle: 'centered', showTOC: true, showPageNumbers: true, showWatermark: false, watermarkOpacity: 0.05, showBackCover: true });
    const [theme, setTheme] = useState<AppTheme>('anthracite');
    const [uiSettings, setUiSettings] = useState<UiSettings>(initialUiSettings);
    const [styleSettings, setStyleSettings] = useState<StyleSettings>(initialStyleSettings);
    const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);

    // SYNC HISTORY ON LOGIN
    useEffect(() => {
        if (user) {
            historyService.getHistory(user.id).then(setHistoryItems);
        } else {
            setHistoryItems([]);
        }
    }, [user]);

    const navigateTo = (view: View | 'ocr' | 'curriculum' | 'reading-studio') => {
        if (currentView === view) return;
        setViewHistory(prev => [...prev, currentView]);
        setCurrentView(view);
    };

    const handleGoBack = () => {
        if (viewHistory.length > 0) {
            const newHistory = [...viewHistory];
            const prevView = newHistory.pop();
            setViewHistory(newHistory);
            if (prevView) setCurrentView(prevView);
        } else { setCurrentView('generator'); }
    };

    const addToHistory = async (activityType: ActivityType, data: SingleWorksheetData[]) => {
        const activity = ACTIVITIES.find(a => a.id === activityType);
        const category = ACTIVITY_CATEGORIES.find(c => c.activities.includes(activityType));
        if (!activity || !category) return;

        const newItem = {
            userId: user?.id || 'guest',
            activityType,
            data,
            timestamp: new Date().toISOString(),
            title: activity.title,
            category: { id: category.id, title: category.title }
        };

        if (user) {
            await historyService.addToHistory(user.id, newItem);
            const updatedHistory = await historyService.getHistory(user.id);
            setHistoryItems(updatedHistory);
        } else {
            setHistoryItems(prev => [ { ...newItem, id: Date.now().toString() }, ...prev ].slice(0, 20));
        }
    };

    const clearHistory = async () => { if (user) { await historyService.clearHistory(user.id); setHistoryItems([]); } };
    const deleteHistoryItem = async (id: string) => { if (user) { await historyService.deleteHistoryItem(user.id, id); setHistoryItems(prev => prev.filter(i => i.id !== id)); } };

    const handleRestoreFromHistory = (item: HistoryItem) => {
        setSelectedActivity(item.activityType);
        setWorksheetData(item.data);
        navigateTo('generator');
        setOpenModal(null);
    };

    const handleSaveHistoryItem = async (item: HistoryItem) => {
        if (!user) { setIsAuthModalOpen(true); return; }
        await worksheetService.saveWorksheet(user.id, `${item.title} (Geçmiş)`, item.activityType, item.data, 'fa-solid fa-clock-rotate-left', item.category);
        alert("Arşive kaydedildi.");
    };

    const loadSavedWorksheet = (worksheet: SavedWorksheet) => {
        if (worksheet.activityType === ActivityType.WORKBOOK) {
            if (worksheet.workbookItems && worksheet.workbookSettings) {
                setWorkbookItems(worksheet.workbookItems);
                setWorkbookSettings(worksheet.workbookSettings);
                navigateTo('workbook');
            }
        } else {
            setSelectedActivity(worksheet.activityType);
            setWorksheetData(worksheet.worksheetData);
            if (worksheet.styleSettings) setStyleSettings(worksheet.styleSettings);
            if (worksheet.studentProfile) setStudentProfile(worksheet.studentProfile);
            navigateTo('generator');
        }
    };

    return (
        <div className="flex flex-col h-screen bg-transparent font-sans transition-colors duration-300">
            <header className="relative bg-[var(--panel-bg)] backdrop-blur-sm border-b border-[var(--border-color)] shadow-sm z-10">
                <div className="w-full px-4 sm:px-6 py-3 flex justify-between items-center">
                    <button id="tour-logo" onClick={() => { navigateTo('generator'); setSelectedActivity(null); }} className="flex items-center gap-3 px-2 py-1 rounded-lg"><DyslexiaLogo className="h-10 w-auto" /></button>
                    <div className="flex items-center gap-2">
                        <GlobalSearch onSelectActivity={(id) => { setSelectedActivity(id); navigateTo('generator'); }} />
                        {user ? (
                            <div className="flex items-center gap-2">
                                <button onClick={() => setOpenModal('history')} className="p-2 text-[var(--text-secondary)] hover:text-indigo-500 transition-all"><i className="fa-solid fa-clock-rotate-left fa-lg"></i></button>
                                <button onClick={() => navigateTo('workbook')} className="relative p-2 text-emerald-500"><i className="fa-solid fa-book-open-reader fa-lg"></i>{workbookItems.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1 rounded-full">{workbookItems.length}</span>}</button>
                                <button onClick={() => navigateTo('profile')} className="ml-2"><img src={user.avatar} className="w-9 h-9 rounded-full border-2 border-[var(--border-color)]" /></button>
                            </div>
                        ) : (
                            <button onClick={() => setIsAuthModalOpen(true)} className="px-5 py-2 bg-indigo-600 text-white rounded-lg font-bold">Giriş Yap</button>
                        )}
                        <button onClick={() => setOpenModal('settings')} className="p-2 text-zinc-400"><i className="fa-solid fa-gear fa-lg"></i></button>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                <Sidebar
                    isSidebarOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)}
                    selectedActivity={selectedActivity} onSelectActivity={setSelectedActivity}
                    setWorksheetData={setWorksheetData} setIsLoading={setIsLoading} setError={setError} isLoading={isLoading}
                    onAddToHistory={addToHistory} isExpanded={isSidebarExpanded}
                    onOpenStudentModal={() => setIsStudentModalOpen(true)} studentProfile={studentProfile}
                    onOpenOCR={() => navigateTo('ocr')} onOpenCurriculum={() => navigateTo('curriculum')}
                    onOpenReadingStudio={() => navigateTo('reading-studio')}
                />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <ContentArea
                        currentView={currentView as any} onBackToGenerator={handleGoBack}
                        activityType={selectedActivity} worksheetData={worksheetData} isLoading={isLoading} error={error}
                        styleSettings={styleSettings} onStyleChange={setStyleSettings}
                        onSave={(name, type, data) => worksheetService.saveWorksheet(user!.id, name, type, data, 'fa-file', {id:'gen', title:'Genel'})}
                        onLoadSaved={loadSavedWorksheet} onFeedback={() => setIsFeedbackOpen(true)} onOpenAuth={() => setIsAuthModalOpen(true)}
                        workbookItems={workbookItems} setWorkbookItems={setWorkbookItems}
                        workbookSettings={workbookSettings} setWorkbookSettings={setWorkbookSettings}
                        onAddToWorkbook={() => {}} studentProfile={studentProfile} zenMode={false} toggleZenMode={() => {}}
                    />
                </div>
            </div>

            <SettingsModal isOpen={openModal === 'settings'} onClose={() => setOpenModal(null)} uiSettings={uiSettings} onUpdateUiSettings={setUiSettings} theme={theme} onUpdateTheme={setTheme} />
            {openModal === 'history' && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-zinc-800 w-full max-w-4xl max-h-[85vh] rounded-3xl overflow-hidden flex flex-col">
                        <div className="p-4 border-b flex justify-between items-center bg-zinc-50 dark:bg-zinc-900">
                            <h3 className="font-bold">İşlem Geçmişi</h3>
                            <button onClick={() => setOpenModal(null)} className="text-zinc-400">Kapat</button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4">
                            <div className="space-y-3">
                                {historyItems.map(item => (
                                    <div key={item.id} className="p-4 border rounded-xl flex justify-between items-center bg-white dark:bg-zinc-800">
                                        <div><h4 className="font-bold">{item.title}</h4><p className="text-xs text-zinc-400">{new Date(item.timestamp).toLocaleString()}</p></div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleRestoreFromHistory(item)} className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold">Aç</button>
                                            <button onClick={() => deleteHistoryItem(item.id)} className="p-1.5 text-red-500"><i className="fa-solid fa-trash"></i></button>
                                        </div>
                                    </div>
                                ))}
                                {historyItems.length === 0 && <div className="text-center py-20 text-zinc-400">Geçmiş boş.</div>}
                            </div>
                        </div>
                        <div className="p-4 border-t flex justify-end">
                            <button onClick={clearHistory} className="text-red-500 text-sm font-bold">Tümünü Temizle</button>
                        </div>
                    </div>
                </div>
            )}
            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
            <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} activityType={selectedActivity} />
            <StudentInfoModal isOpen={isStudentModalOpen} onClose={() => setIsStudentModalOpen(false)} currentProfile={studentProfile} onSave={setStudentProfile} onClear={() => setStudentProfile(null)} />
        </div>
    );
};

export const App: React.FC = () => ( <AuthProvider><AppContent /></AuthProvider> );
