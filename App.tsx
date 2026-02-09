
import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { ActivityType, WorksheetData, SavedWorksheet, SingleWorksheetData, AppTheme, HistoryItem, StyleSettings, View, UiSettings, CollectionItem, WorkbookSettings, StudentProfile, AssessmentReport, GeneratorOptions, SavedAssessment, Curriculum } from './types';
import Sidebar from './components/Sidebar';
import ContentArea from './components/ContentArea';
import { ACTIVITIES, ACTIVITY_CATEGORIES } from './constants';
import DyslexiaLogo from './components/DyslexiaLogo';
import GlobalSearch from './components/GlobalSearch';
import { FeedbackModal } from './components/FeedbackModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StudentProvider, useStudent } from './context/StudentContext'; 
import { AuthModal } from './components/AuthModal';
import { messagingService } from './services/messagingService';
import { worksheetService } from './services/worksheetService';
import { curriculumService } from './services/curriculumService'; 
import { SettingsModal } from './components/SettingsModal';
import { TourGuide, TourStep } from './components/TourGuide';
import { StudentInfoModal } from './components/StudentInfoModal';
import { HistoryView } from './components/HistoryView'; 
import { AssessmentReportViewer } from './components/AssessmentReportViewer';
import * as offlineGenerators from './services/offlineGenerators'; 

// Lazy Loaded Components
const ProfileView = lazy(() => import('./components/ProfileView').then(module => ({ default: module.ProfileView })));
const AdminDashboard = lazy(() => import('./components/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
const MessagesView = lazy(() => import('./components/MessagesView').then(module => ({ default: module.MessagesView })));
const OCRScanner = lazy(() => import('./components/OCRScanner').then(module => ({ default: module.OCRScanner })));
const CurriculumView = lazy(() => import('./components/CurriculumView').then(module => ({ default: module.CurriculumView })));
const ReadingStudio = lazy(() => import('./components/ReadingStudio/ReadingStudio').then(module => ({ default: module.ReadingStudio })));
const MathStudio = lazy(() => import('./components/MathStudio/MathStudio').then(module => ({ default: module.MathStudio })));
const StudentDashboard = lazy(() => import('./components/Student/StudentDashboard').then(module => ({ default: module.StudentDashboard })));
const AssessmentModule = lazy(() => import('./components/AssessmentModule').then(module => ({ default: module.AssessmentModule })));

const initialStyleSettings: StyleSettings = {
    fontSize: 18, 
    scale: 1, 
    borderColor: '#3f3f46',
    borderWidth: 1,
    margin: 10,
    columns: 1,
    gap: 15,
    orientation: 'portrait',
    themeBorder: 'simple',
    contentAlign: 'left', 
    fontWeight: 'normal',
    fontStyle: 'normal',
    visualStyle: 'card', 
    showPedagogicalNote: false,
    showMascot: false,
    showStudentInfo: true,
    showTitle: true,
    showInstruction: true,
    showImage: true,
    showFooter: true,
    smartPagination: true,
    fontFamily: 'Lexend',
    lineHeight: 1.6,
    letterSpacing: 0,
    wordSpacing: 2, 
    paragraphSpacing: 24, 
    focusMode: false,
    rulerColor: '#6366f1',
    rulerHeight: 80,
    maskOpacity: 0.4
};

const initialUiSettings: UiSettings = {
    fontFamily: 'Lexend',
    fontSizeScale: 1,
    letterSpacing: 'normal',
    lineHeight: 1.6,
    saturation: 100
};

type ExtendedView = View | 'ocr' | 'curriculum' | 'reading-studio' | 'math-studio' | 'students' | 'assessment';

const LoadingSpinner = () => (
    <div className="flex items-center justify-center h-full w-full min-h-[200px]">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
    </div>
);

const AppContent: React.FC = () => {
    const { user } = useAuth();
    const { activeStudent, students } = useStudent();
    const [currentView, setCurrentView] = useState<ExtendedView>('generator');
    const [viewHistory, setViewHistory] = useState<ExtendedView[]>([]); 
    
    const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(null);
    const [worksheetData, setWorksheetData] = useState<WorksheetData>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
    const [zenMode, setZenMode] = useState(false);

    const [openModal, setOpenModal] = useState<string | null>(null);
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isTourOpen, setIsTourOpen] = useState(false);

    const [workbookItems, setWorkbookItems] = useState<CollectionItem[]>([]);
    const [workbookSettings, setWorkbookSettings] = useState<WorkbookSettings>({
        title: 'Çalışma Kitapçığı', studentName: '', schoolName: '', year: new Date().getFullYear().toString(),
        teacherNote: '', theme: 'modern', accentColor: '#4f46e5', coverStyle: 'centered',
        showTOC: true, showPageNumbers: true, showWatermark: false, watermarkOpacity: 0.05, showBackCover: true
    });
    
    const [theme, setTheme] = useState<AppTheme>('anthracite');
    const [uiSettings, setUiSettings] = useState<UiSettings>(initialUiSettings);
    const [styleSettings, setStyleSettings] = useState<StyleSettings>(initialStyleSettings);

    const navigateTo = (view: ExtendedView) => {
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
        } else {
            setCurrentView('generator');
        }
    };

    const handleSelectActivity = (activityType: ActivityType | null) => {
        setCurrentView('generator');
        setSelectedActivity(activityType);
        setWorksheetData(null);
        if (activityType) setIsSidebarExpanded(true);
    };

    const loadSavedWorksheet = (item: any) => {
        setSelectedActivity(item.activityType);
        setWorksheetData(item.worksheetData);
        if (item.styleSettings) setStyleSettings(item.styleSettings);
        navigateTo('generator');
        setIsSidebarExpanded(false);
    };

    const headerIconBtnClass = "p-2 text-[var(--text-secondary)] hover:text-[var(--accent-color)] transition-all duration-300 rounded-md";

    return (
        <div className={`flex flex-col h-screen bg-transparent font-sans transition-all duration-500 ${theme}`}>
            <header className={`relative bg-[var(--panel-bg)] backdrop-blur-md border-b border-[var(--border-color)] shadow-sm z-[60] transition-all duration-700 ${zenMode ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}>
                <div className="w-full px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button id="tour-logo" onClick={() => { navigateTo('generator'); setSelectedActivity(null); }} className="flex items-center gap-3">
                            <DyslexiaLogo className="h-9 w-auto" />
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        <GlobalSearch onSelectActivity={handleSelectActivity} />
                        <button onClick={() => navigateTo('assessment')} className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[var(--accent-color)] text-black rounded-full text-xs font-black shadow-lg hover:scale-105 transition-all">
                            <i className="fa-solid fa-user-doctor"></i> DEĞERLENDİRME
                        </button>
                        <div className="h-6 w-px bg-[var(--border-color)]"></div>
                        <button onClick={() => setZenMode(!zenMode)} className={headerIconBtnClass} title="Zen Modu (Tam Ekran)">
                            <i className="fa-solid fa-expand"></i>
                        </button>
                        <button onClick={() => setOpenModal('settings')} className={headerIconBtnClass}><i className="fa-solid fa-gear"></i></button>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden relative">
                <div 
                    className={`transition-all duration-500 ease-in-out h-full z-50 ${zenMode ? '-translate-x-full w-0' : 'translate-x-0 w-auto'}`}
                    onMouseEnter={() => setIsSidebarExpanded(true)}
                >
                    <Sidebar
                        isSidebarOpen={isSidebarOpen}
                        closeSidebar={() => setIsSidebarOpen(false)}
                        selectedActivity={selectedActivity}
                        onSelectActivity={handleSelectActivity}
                        setWorksheetData={setWorksheetData}
                        setIsLoading={setIsLoading}
                        setError={setError}
                        isLoading={isLoading}
                        onAddToHistory={() => {}}
                        isExpanded={isSidebarExpanded}
                        onOpenStudentModal={() => navigateTo('students')}
                        onOpenOCR={() => navigateTo('ocr')}
                        onOpenCurriculum={() => navigateTo('curriculum')}
                        onOpenReadingStudio={() => navigateTo('reading-studio')}
                        onOpenMathStudio={() => navigateTo('math-studio')}
                    />
                </div>
                
                <div 
                    className="flex-1 flex flex-col overflow-hidden relative z-10" 
                    onMouseEnter={() => !selectedActivity && setIsSidebarExpanded(false)}
                >
                    <Suspense fallback={<LoadingSpinner />}>
                        {currentView === 'generator' ? (
                            <ContentArea
                                currentView={currentView}
                                onBackToGenerator={() => setSelectedActivity(null)}
                                activityType={selectedActivity}
                                worksheetData={worksheetData}
                                isLoading={isLoading}
                                error={error}
                                styleSettings={styleSettings}
                                onStyleChange={setStyleSettings}
                                onSave={() => {}}
                                onLoadSaved={loadSavedWorksheet}
                                onFeedback={() => setIsFeedbackOpen(true)}
                                onOpenAuth={() => setIsAuthModalOpen(true)}
                                workbookItems={workbookItems}
                                setWorkbookItems={setWorkbookItems}
                                workbookSettings={workbookSettings}
                                setWorkbookSettings={setWorkbookSettings}
                                onAddToWorkbook={() => {}}
                                zenMode={zenMode}
                                toggleZenMode={() => setZenMode(!zenMode)}
                            />
                        ) : currentView === 'ocr' ? <OCRScanner onBack={handleGoBack} onResult={() => {}} /> :
                            currentView === 'curriculum' ? <CurriculumView onBack={handleGoBack} onSelectActivity={handleSelectActivity} onStartCurriculumActivity={() => {}} /> :
                            currentView === 'reading-studio' ? <ReadingStudio onBack={handleGoBack} /> :
                            currentView === 'math-studio' ? <MathStudio onBack={handleGoBack} /> :
                            currentView === 'students' ? <StudentDashboard onBack={handleGoBack} onLoadMaterial={loadSavedWorksheet} /> :
                            currentView === 'assessment' ? <AssessmentModule onBack={handleGoBack} onSelectActivity={handleSelectActivity} /> : null
                        }
                    </Suspense>
                </div>
            </div>

            <SettingsModal isOpen={openModal === 'settings'} onClose={() => setOpenModal(null)} uiSettings={uiSettings} onUpdateUiSettings={setUiSettings} theme={theme} onUpdateTheme={setTheme} />
            <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} activityType={selectedActivity} />
            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        </div>
    );
};

export const App: React.FC = () => (
    <AuthProvider><StudentProvider><AppContent /></StudentProvider></AuthProvider>
);
