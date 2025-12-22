
import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { ActivityType, WorksheetData, SavedWorksheet, SingleWorksheetData, AppTheme, HistoryItem, StyleSettings, View, UiSettings, CollectionItem, WorkbookSettings, StudentProfile, AssessmentReport, GeneratorOptions, SavedAssessment } from './types';
import Sidebar from './components/Sidebar';
import ContentArea from './components/ContentArea';
import { ACTIVITIES, ACTIVITY_CATEGORIES } from './constants';
import DyslexiaLogo from './components/DyslexiaLogo';
import GlobalSearch from './components/GlobalSearch';
import { FeedbackModal } from './components/FeedbackModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StudentProvider } from './context/StudentContext'; 
import { AuthModal } from './components/AuthModal';
import { messagingService } from './services/messagingService';
import { worksheetService } from './services/worksheetService';
import { curriculumService } from './services/curriculumService'; 
import { SettingsModal } from './components/SettingsModal';
import { TourGuide, TourStep } from './components/TourGuide';
import { StudentInfoModal } from './components/StudentInfoModal';
import { HistoryView } from './components/HistoryView'; 
import * as offlineGenerators from './services/offlineGenerators'; 

// Lazy Loaded Components - Using relative paths strictly
const ProfileView = lazy(() => import('./components/ProfileView').then(module => ({ default: module.ProfileView })));
const AdminDashboard = lazy(() => import('./components/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
const MessagesView = lazy(() => import('./components/MessagesView').then(module => ({ default: module.MessagesView })));
const OCRScanner = lazy(() => import('./components/OCRScanner').then(module => ({ default: module.OCRScanner })));
const CurriculumView = lazy(() => import('./components/CurriculumView').then(module => ({ default: module.CurriculumView })));
const ReadingStudio = lazy(() => import('./components/ReadingStudio/ReadingStudio').then(module => ({ default: module.ReadingStudio })));
const MathStudio = lazy(() => import('./components/MathStudio/MathStudio').then(module => ({ default: module.MathStudio })));

const initialStyleSettings: StyleSettings = {
    fontSize: 16,
    scale: 1, 
    borderColor: '#d4d4d8',
    borderWidth: 1,
    margin: 20, 
    columns: 1,
    gap: 16,
    orientation: 'portrait',
    themeBorder: 'simple',
    contentAlign: 'center',
    fontWeight: 'normal',
    fontStyle: 'normal',
    visualStyle: 'card', 
    showPedagogicalNote: false,
    showMascot: false,
    showStudentInfo: false,
    showTitle: false,
    showInstruction: false,
    showImage: false,
    showFooter: false,
    smartPagination: false,
    fontFamily: 'OpenDyslexic',
    lineHeight: 1.5,
    letterSpacing: 0
};

const initialUiSettings: UiSettings = {
    fontFamily: 'OpenDyslexic',
    fontSizeScale: 1,
    letterSpacing: 'normal',
    lineHeight: 1.6,
    saturation: 100
};

type ModalType = 'settings' | 'history' | 'about' | 'developer';
type ExtendedView = View | 'ocr' | 'curriculum' | 'reading-studio' | 'math-studio';

interface ActiveCurriculumSession {
    planId: string;
    studentName: string;
    day: number;
    activityId: string;
    activityTitle: string;
}

const toPascalCase = (str: string): string => {
    return str.toLowerCase().split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
};

const LoadingSpinner = () => (
    <div className="flex items-center justify-center h-full w-full min-h-[200px]">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
    </div>
);

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onClose}>
            <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-5 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-t-2xl">
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{title}</h3>
                    <button onClick={onClose} className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                        <i className="fa-solid fa-times text-lg"></i>
                    </button>
                </div>
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {children}
                </div>
            </div>
        </div>
    );
};

const tourSteps: TourStep[] = [
    { targetId: 'tour-logo', title: 'Hoş Geldiniz', content: 'Bursa Disleksi AI platformuna hoş geldiniz. Hızlı bir tura başlayalım mı?', position: 'bottom' },
    { targetId: 'tour-search', title: 'Etkinlik Arama', content: 'İstediğiniz etkinliği veya konuyu buradan hızla bulabilirsiniz.', position: 'bottom' },
    { targetId: 'tour-sidebar', title: 'Kategoriler', content: 'Sol menüden etkinlik kategorilerine ulaşabilirsiniz.', position: 'right' },
    { targetId: 'tour-workbook-btn', title: 'Çalışma Kitapçığı', content: 'Seçtiğiniz etkinlikleri buraya ekleyerek tek bir PDF kitapçık oluşturabilirsiniz.', position: 'bottom' },
    { targetId: 'tour-ocr-btn', title: 'Akıllı Tarayıcı (OCR)', content: 'Fiziksel kağıtları tarayıp dijitalleştirmek için bu ikonu kullanın.', position: 'right' },
    { targetId: 'tour-history-btn', title: 'Geçmiş', content: 'Daha önce oluşturduğunuz etkinliklere buradan ulaşabilirsiniz.', position: 'bottom' },
];

const AppContent: React.FC = () => {
    const { user, logout } = useAuth();
    const [currentView, setCurrentView] = useState<ExtendedView>('generator');
    const [viewHistory, setViewHistory] = useState<ExtendedView[]>([]); 
    
    const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(null);
    const [worksheetData, setWorksheetData] = useState<WorksheetData>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    
    const [activeCurriculumSession, setActiveCurriculumSession] = useState<ActiveCurriculumSession | null>(null);
    
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
    
    const [zenMode, setZenMode] = useState(false);

    const [openModal, setOpenModal] = useState<ModalType | null>(null);
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isTourOpen, setIsTourOpen] = useState(false);
    
    const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
    const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);

    const [workbookItems, setWorkbookItems] = useState<CollectionItem[]>([]);
    const [workbookSettings, setWorkbookSettings] = useState<WorkbookSettings>({
        title: 'Çalışma Kitapçığı',
        studentName: '',
        schoolName: '',
        year: new Date().getFullYear().toString(),
        teacherNote: '',
        theme: 'modern',
        accentColor: '#4f46e5',
        coverStyle: 'centered',
        showTOC: true,
        showPageNumbers: true,
        showWatermark: false,
        watermarkOpacity: 0.05,
        showBackCover: true
    });
    
    const [theme, setTheme] = useState<AppTheme>(() => {
        try {
            const storedTheme = localStorage.getItem('app-theme');
            return (storedTheme as AppTheme) || 'anthracite';
        } catch (e) {
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
    
    const [historyItems, setHistoryItems] = useState<HistoryItem[]>(() => {
        try {
            const stored = localStorage.getItem('user_history');
            return stored ? JSON.parse(stored) : [];
        } catch { return []; }
    });

    const navigateTo = (view: ExtendedView) => {
        if (currentView === view) return;
        setViewHistory(prev => [...prev, currentView]);
        setCurrentView(view);
    };

    const handleGoBack = () => {
        if (currentView === 'generator' && activeCurriculumSession) {
            setActiveCurriculumSession(null);
            navigateTo('curriculum');
            return;
        }

        if (viewHistory.length > 0) {
            const newHistory = [...viewHistory];
            const prevView = newHistory.pop();
            setViewHistory(newHistory);
            if (prevView) setCurrentView(prevView);
        } else {
            setCurrentView('generator');
        }
    };

    useEffect(() => {
        localStorage.setItem('user_history', JSON.stringify(historyItems));
    }, [historyItems]);

    const addToHistory = (activityType: ActivityType, data: SingleWorksheetData[]) => {
        const activity = ACTIVITIES.find(a => a.id === activityType);
        const category = ACTIVITY_CATEGORIES.find(c => c.activities.includes(activityType));
        if (!activity || !category) return;

        const newItem: HistoryItem = {
            id: Date.now().toString() + Math.random(),
            userId: user?.id || 'guest',
            activityType,
            data,
            timestamp: new Date().toISOString(),
            title: activity.title,
            category: { id: category.id, title: category.title }
        };

        setHistoryItems(prev => [newItem, ...prev].slice(0, 100));
    };

    const clearHistory = () => { setHistoryItems([]); };
    const deleteHistoryItem = (id: string) => { setHistoryItems(prev => prev.filter(i => i.id !== id)); };

    const handleRestoreFromHistory = (item: HistoryItem) => {
        loadSavedWorksheet({
            id: item.id, userId: item.userId, name: item.title, activityType: item.activityType,
            worksheetData: item.data, createdAt: item.timestamp,
            icon: ACTIVITIES.find(a => a.id === item.activityType)?.icon || 'fa-file',
            category: item.category
        });
        setOpenModal(null);
    };

    const handleSaveHistoryItem = (item: HistoryItem) => {
        if (!user) { setIsAuthModalOpen(true); return; }
        addSavedWorksheet(`${item.title} (Geçmiş)`, item.activityType, item.data);
    };

    const addSavedWorksheet = async (name: string, activityType: ActivityType, data: SingleWorksheetData[]) => {
        if (!user) { setIsAuthModalOpen(true); return; }
        const activity = ACTIVITIES.find(a => a.id === activityType);
        const category = ACTIVITY_CATEGORIES.find(c => c.activities.includes(activityType));
        if (!activity || !category) return;

        try {
            await worksheetService.saveWorksheet(
                user.id, name, activityType, data, activity.icon,
                { id: category.id, title: category.title }, styleSettings, studentProfile || undefined
            );
            alert(`Etkinlik "${name}" adıyla arşivinize kaydedildi.`);
        } catch (e: any) {
            console.error("Save error:", e);
            alert(`Kaydedilirken bir hata oluştu: ${e.message}.`);
        }
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
            else setStudentProfile(null);
            navigateTo('generator');
        }
    };

    const handleSelectActivity = (activityType: ActivityType | null) => {
        if (currentView !== 'generator') {
             navigateTo('generator');
        }
        
        setActiveCurriculumSession(null);
        
        setSelectedActivity(activityType);
        setWorksheetData(null);
        setError(null);
        setCurrentView('generator');
        if (isSidebarOpen) setIsSidebarOpen(false);
    };

    const handleStartCurriculumActivity = (planId: string, day: number, activityId: string, activityType: string, studentName: string, title: string) => {
        setActiveCurriculumSession({
            planId, day, activityId, studentName, activityTitle: title
        });
        
        setStudentProfile({ name: studentName, school: '', grade: '', date: new Date().toLocaleDateString('tr-TR') });
        setSelectedActivity(activityType as ActivityType);
        setWorksheetData(null); 
        navigateTo('generator');
    };

    const handleCompleteCurriculumActivity = async () => {
        if (!activeCurriculumSession || !user) return;
        setIsLoading(true);
        try {
            if (worksheetData) {
                 await addSavedWorksheet(`${activeCurriculumSession.studentName} - ${activeCurriculumSession.activityTitle}`, selectedActivity!, worksheetData);
            }
            
            await curriculumService.updateActivityStatus(
                activeCurriculumSession.planId,
                activeCurriculumSession.day,
                activeCurriculumSession.activityId,
                'completed'
            );
            
            setActiveCurriculumSession(null);
            navigateTo('curriculum');
            alert("Harika! Aktivite tamamlandı ve plana işlendi.");
        } catch (e) {
            console.error("Completion error", e);
            alert("Bir hata oluştu.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddToWorkbookGeneral = (activityType: ActivityType, data: any) => {
        if (activityType && data) {
            const dataArray = Array.isArray(data) ? data : [data];
            
            const newItems: CollectionItem[] = dataArray.map((sheet: any) => ({
                id: crypto.randomUUID(),
                activityType: activityType,
                data: sheet,
                settings: { ...styleSettings },
                title: sheet.title || ACTIVITIES.find(a => a.id === activityType)?.title || 'Etkinlik'
            }));
            setWorkbookItems(prev => [...prev, ...newItems]);
            
            const btn = document.getElementById('add-to-wb-btn');
            if(btn) {
                btn.classList.add('scale-125', 'bg-green-500', 'text-white');
                setTimeout(() => btn.classList.remove('scale-125', 'bg-green-500', 'text-white'), 300);
            } else {
                alert("Kitapçığa eklendi!");
            }
        }
    };

    const handleAddToWorkbook = () => {
        if (selectedActivity && worksheetData) {
            handleAddToWorkbookGeneral(selectedActivity, worksheetData);
        }
    };

    const handleAutoGenerateWorkbook = async (report: AssessmentReport) => {
        setIsLoading(true);
        navigateTo('workbook'); 
        
        const newItems: CollectionItem[] = [];
        const defaultOptions: GeneratorOptions = {
            mode: 'fast', difficulty: 'Orta', worksheetCount: 1, itemCount: 10,
            gridSize: 10, operationType: 'mixed', numberRange: '1-20',
        };

        try {
            const reportItem: CollectionItem = {
                id: crypto.randomUUID(),
                activityType: ActivityType.ASSESSMENT_REPORT,
                data: {
                    id: 'temp-report', userId: user?.id || 'guest', studentName: studentProfile?.name || 'Öğrenci',
                    gender: 'Erkek', age: 7, grade: studentProfile?.grade || '1. Sınıf',
                    createdAt: new Date().toISOString(), report: report
                } as SavedAssessment, 
                settings: { ...styleSettings, showStudentInfo: false, showFooter: false },
                title: `Rapor: ${studentProfile?.name || 'Öğrenci'}`
            };
            newItems.push(reportItem);

            for (const roadItem of report.roadmap) {
                const activityId = roadItem.activityId as ActivityType;
                const pascalName = toPascalCase(activityId);
                const generatorName = `generateOffline${pascalName}`;
                // @ts-ignore 
                const generator = offlineGenerators[generatorName];
                if (generator) {
                    try {
                        const generatedData = await generator(defaultOptions);
                        generatedData.forEach((sheet: any) => {
                            newItems.push({
                                id: crypto.randomUUID(), activityType: activityId, data: sheet,
                                settings: { ...styleSettings },
                                title: ACTIVITIES.find(a => a.id === activityId)?.title || activityId
                            });
                        });
                    } catch (genErr) { console.error(`Failed to auto-generate ${activityId}`, genErr); }
                }
            }
            setWorkbookItems(newItems);
            setWorkbookSettings(prev => ({
                ...prev,
                title: `Kişisel Gelişim Planı`,
                studentName: studentProfile?.name || '',
                teacherNote: "Bu kitapçık, yapılan değerlendirme sonucunda belirlenen ihtiyaçlara yönelik olarak yapay zeka tarafından otomatik oluşturulmuştur."
            }));
        } catch (e) {
            console.error("Auto generation failed", e);
            alert("Otomatik kitapçık oluşturulurken bir hata meydana geldi.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddToWorkbookFromReport = (assessment: SavedAssessment) => {
        const newItem: CollectionItem = {
            id: crypto.randomUUID(),
            activityType: ActivityType.ASSESSMENT_REPORT, 
            data: assessment, 
            settings: { ...styleSettings, showStudentInfo: false, showFooter: false },
            title: `Rapor: ${assessment.studentName}`
        };
        setWorkbookItems(prev => [...prev, newItem]);
    };
    
    const handleOCRResult = (result: any) => {
        alert("İçerik başarıyla tarandı!");
        navigateTo('generator');
    };

    const AssessmentModule = lazy(() => import('./components/AssessmentModule').then(module => ({ default: module.AssessmentModule })));

    if (currentView === 'admin') return <Suspense fallback={<LoadingSpinner />}><AdminDashboard onBack={handleGoBack} /></Suspense>;
    if (currentView === 'profile') return <Suspense fallback={<LoadingSpinner />}><ProfileView onBack={handleGoBack} onSelectActivity={handleSelectActivity} /></Suspense>;
    if (currentView === 'messages') return <Suspense fallback={<LoadingSpinner />}><MessagesView onBack={handleGoBack} onRefreshNotifications={() => {}} /></Suspense>;
    if (currentView === 'ocr') return <Suspense fallback={<LoadingSpinner />}><OCRScanner onBack={handleGoBack} onResult={handleOCRResult} /></Suspense>;
    
    if (currentView === 'reading-studio') return (
        <Suspense fallback={<LoadingSpinner />}>
            <ReadingStudio 
                onBack={handleGoBack} 
                onAddToWorkbook={(data: any) => handleAddToWorkbookGeneral('STORY_COMPREHENSION', data)}
            />
        </Suspense>
    );

    if (currentView === 'math-studio') return (
        <Suspense fallback={<LoadingSpinner />}>
            <MathStudio 
                onBack={handleGoBack}
                onAddToWorkbook={(data: any) => handleAddToWorkbookGeneral('MATH_STUDIO' as any, data)}
            />
        </Suspense>
    );
    
    if (currentView === 'curriculum') return (
        <Suspense fallback={<LoadingSpinner />}>
            <CurriculumView 
                onBack={handleGoBack} 
                onSelectActivity={handleSelectActivity} 
                onStartCurriculumActivity={handleStartCurriculumActivity} 
            />
        </Suspense>
    );

    const headerIconBtnClass = "p-2 text-[var(--text-secondary)] hover:text-[var(--accent-color)] hover:drop-shadow-[0_0_5px_rgba(251,191,36,0.5)] transition-all duration-300 rounded-md";

    return (
        <div className="flex flex-col h-screen bg-transparent font-sans transition-colors duration-300">
            <header className={`relative bg-[var(--panel-bg)] backdrop-blur-sm border-b border-[var(--border-color)] shadow-sm z-10 transition-all duration-500 ${zenMode ? '-mt-20 opacity-0 pointer-events-none' : 'mt-0 opacity-100'}`}>
                <div className="w-full px-4 sm:px-6 py-3 flex justify-between items-center">
                    <div className="flex items-center">
                        <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-[var(--text-muted)] mr-3 p-2 hover:text-[var(--text-primary)] transition-colors"><i className="fa-solid fa-bars fa-lg"></i></button>
                        <button id="tour-logo" onClick={() => { navigateTo('generator'); setSelectedActivity(null); setActiveCurriculumSession(null); }} className="flex items-center gap-3 px-2 py-1 rounded-lg relative z-50">
                            <DyslexiaLogo className="h-10 w-auto" />
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <GlobalSearch onSelectActivity={handleSelectActivity} />
                        
                        <div className="flex items-center gap-1 border-r border-[var(--border-color)] pr-2 mx-1">
                            <button onClick={() => setIsTourOpen(true)} className={headerIconBtnClass} title="Nasıl Kullanılır?">
                                <i className="fa-solid fa-question-circle fa-lg"></i>
                            </button>
                            <button onClick={() => setOpenModal('developer')} className={headerIconBtnClass} title="Geliştirici İletişim">
                                <i className="fa-solid fa-laptop-code fa-lg"></i>
                            </button>
                            <button onClick={() => setOpenModal('about')} className={headerIconBtnClass} title="Hakkımızda">
                                <i className="fa-solid fa-circle-info fa-lg"></i>
                            </button>
                            <button onClick={() => setIsFeedbackOpen(true)} className={headerIconBtnClass} title="İletişim / Hata Bildir">
                                <i className="fa-solid fa-headset fa-lg"></i>
                            </button>
                        </div>
                        
                        <button 
                            onClick={() => navigateTo('assessment')} 
                            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[var(--accent-color)] text-black rounded-full text-xs font-extrabold shadow-md hover:shadow-[var(--accent-color)]/30 hover:scale-105 transition-all border border-[var(--accent-hover)]"
                            title="Öğrenme Güçlüğü Analizi"
                        >
                            <i className="fa-solid fa-user-doctor"></i> Değerlendirme
                        </button>

                        <div className="h-6 w-px bg-[var(--border-color)] mx-1 hidden sm:block"></div>

                        <div className="flex items-center gap-2">
                        
                            <button id="tour-workbook-btn" onClick={() => navigateTo('workbook')} className="relative p-2 text-[var(--text-secondary)] hover:text-emerald-500 hover:drop-shadow-[0_0_5px_rgba(16,185,129,0.8)] transition-all rounded-md group" title="Çalışma Kitapçığı">
                                <i className="fa-solid fa-book-open-reader fa-lg"></i>
                                {workbookItems.length > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[10px] font-bold px-1.5 rounded-full border border-black min-w-[18px] text-center">
                                        {workbookItems.length}
                                    </span>
                                )}
                            </button>

                            <button id="tour-favorites-btn" onClick={() => navigateTo('favorites')} className="p-2 text-[var(--text-secondary)] hover:text-red-500 hover:drop-shadow-[0_0_5px_rgba(239,68,68,0.8)] transition-all rounded-md relative group" title="Favoriler">
                                <i className="fa-solid fa-heart fa-lg"></i>
                            </button>

                        {user ? (
                            <>
                                {user.role === 'admin' && (
                                    <button onClick={() => navigateTo('admin')} className="p-2 text-purple-400 hover:bg-purple-900/20 rounded-md relative hover:text-white hover:drop-shadow-[0_0_5px_rgba(168,85,247,0.8)] transition-all" title="Yönetici Paneli">
                                        <i className="fa-solid fa-shield-halved fa-lg"></i>
                                    </button>
                                )}
                                
                                <button id="tour-messages-btn" onClick={() => navigateTo('messages')} className={headerIconBtnClass + " relative"} title="Mesajlar">
                                    <i className="fa-solid fa-envelope fa-lg"></i>
                                    {unreadCount > 0 && (
                                        <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-1.5 rounded-full border-2 border-black">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>

                                <button id="tour-shared-btn" onClick={() => navigateTo('shared')} className={headerIconBtnClass} title="Paylaşılanlar">
                                    <i className="fa-solid fa-share-nodes fa-lg"></i>
                                </button>

                                <button id="tour-archive-btn" onClick={() => navigateTo('savedList')} className={headerIconBtnClass} title="Arşiv">
                                    <i className="fa-solid fa-box-archive fa-lg"></i>
                                </button>
                                <button id="tour-history-btn" onClick={() => setOpenModal('history')} className={headerIconBtnClass} title="Geçmiş">
                                    <i className="fa-solid fa-clock-rotate-left fa-lg"></i>
                                </button>
                                
                                <button id="tour-profile-btn" onClick={() => navigateTo('profile')} className="ml-2">
                                    <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full border-2 border-[var(--border-color)] shadow-sm hover:border-[var(--accent-color)] transition-colors bg-zinc-800" />
                                </button>
                            </>
                        ) : (
                            <button onClick={() => setIsAuthModalOpen(true)} className="ml-2 px-5 py-2 bg-[var(--bg-paper)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-lg font-black text-sm hover:bg-[var(--bg-inset)] transition-all shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                                Giriş Yap
                            </button>
                        )}
                        </div>
                        
                        <div className="h-6 w-px bg-[var(--border-color)] mx-1"></div>
                        <button onClick={() => setOpenModal('settings')} className={headerIconBtnClass}><i className="fa-solid fa-gear fa-lg"></i></button>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>}
                
                <div 
                    onMouseEnter={() => setIsSidebarExpanded(true)} 
                    className={`transition-all duration-500 ease-in-out h-full ${zenMode ? '-ml-80 w-0 opacity-0 overflow-hidden' : ''}`}
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
                        onAddToHistory={addToHistory}
                        isExpanded={isSidebarExpanded}
                        onOpenStudentModal={() => setIsStudentModalOpen(true)}
                        studentProfile={studentProfile}
                        styleSettings={styleSettings}
                        onOpenOCR={() => navigateTo('ocr')}
                        onOpenCurriculum={() => navigateTo('curriculum')}
                        onOpenReadingStudio={() => navigateTo('reading-studio')}
                        onOpenMathStudio={() => navigateTo('math-studio')}
                    />
                </div>
                
                <div 
                    className="flex-1 flex flex-col overflow-hidden" 
                    onMouseEnter={() => setIsSidebarExpanded(false)}
                >
                    <ContentArea
                        currentView={currentView as View}
                        onBackToGenerator={() => { 
                            if(currentView !== 'generator') handleGoBack();
                            else { setSelectedActivity(null); setWorksheetData(null); setActiveCurriculumSession(null); }
                        }}
                        activityType={selectedActivity}
                        worksheetData={worksheetData}
                        isLoading={isLoading}
                        error={error}
                        styleSettings={styleSettings}
                        onStyleChange={setStyleSettings}
                        onSave={addSavedWorksheet}
                        onLoadSaved={loadSavedWorksheet}
                        onFeedback={() => setIsFeedbackOpen(true)}
                        onOpenAuth={() => setIsAuthModalOpen(true)}
                        onSelectActivity={handleSelectActivity}
                        workbookItems={workbookItems}
                        setWorkbookItems={setWorkbookItems}
                        workbookSettings={workbookSettings}
                        setWorkbookSettings={setWorkbookSettings}
                        onAddToWorkbook={handleAddToWorkbook}
                        onAutoGenerateWorkbook={handleAutoGenerateWorkbook}
                        studentProfile={studentProfile}
                        zenMode={zenMode}
                        toggleZenMode={() => setZenMode(!zenMode)}
                        activeCurriculumSession={activeCurriculumSession}
                        onCompleteCurriculumActivity={handleCompleteCurriculumActivity}
                    />
                    
                    {currentView === 'assessment' && (
                        <div className="absolute inset-0 bg-white dark:bg-zinc-900 z-40 overflow-y-auto">
                            <Suspense fallback={<LoadingSpinner />}>
                                <AssessmentModule 
                                    onBack={handleGoBack}
                                    onSelectActivity={handleSelectActivity}
                                    onAddToWorkbook={handleAddToWorkbookFromReport}
                                    onAutoGenerateWorkbook={handleAutoGenerateWorkbook}
                                />
                            </Suspense>
                        </div>
                    )}
                </div>
            </div>

            <TourGuide steps={tourSteps} isOpen={isTourOpen} onClose={() => setIsTourOpen(false)} />
            <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} activityType={selectedActivity} activityTitle={selectedActivity ? ACTIVITIES.find(a => a.id === selectedActivity)?.title : undefined} />
            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
            <StudentInfoModal isOpen={isStudentModalOpen} onClose={() => setIsStudentModalOpen(false)} currentProfile={studentProfile} onSave={(p) => setStudentProfile(p)} onClear={() => setStudentProfile(null)} />
            <SettingsModal isOpen={openModal === 'settings'} onClose={() => setOpenModal(null)} uiSettings={uiSettings} onUpdateUiSettings={setUiSettings} theme={theme} onUpdateTheme={setTheme} />
            <Modal isOpen={openModal === 'history'} onClose={() => setOpenModal(null)} title="İşlem Geçmişi">
                <HistoryView historyItems={historyItems} onRestore={handleRestoreFromHistory} onSaveToArchive={handleSaveHistoryItem} onDelete={deleteHistoryItem} onClearAll={clearHistory} onClose={() => setOpenModal(null)} />
            </Modal>
             <Modal isOpen={openModal === 'about'} onClose={() => setOpenModal(null)} title="Hakkımızda">
                <div className="text-center space-y-6">
                    <DyslexiaLogo className="h-16 w-auto mx-auto" />
                    <div className="space-y-4 text-zinc-600 dark:text-zinc-300">
                        <p className="leading-relaxed">
                            Bursa Disleksi AI, özel öğrenme güçlüğü yaşayan bireylerin eğitim süreçlerini desteklemek, eğitmen ve ailelere kişiselleştirilmiş, bilimsel temelli materyaller sunmak amacıyla geliştirilmiş yeni nesil bir yapay zeka platformudur.
                        </p>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
        <StudentProvider>
          <AppContent />
        </StudentProvider>
    </AuthProvider>
  );
};
