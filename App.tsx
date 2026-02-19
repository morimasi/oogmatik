
import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { ActivityType, WorksheetData, SavedWorksheet, SingleWorksheetData, AppTheme, HistoryItem, StyleSettings, View, UiSettings, CollectionItem, WorkbookSettings, StudentProfile, AssessmentReport, GeneratorOptions, SavedAssessment, Curriculum, ActiveCurriculumSession } from './types';
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

type ModalType = 'settings' | 'history' | 'about' | 'developer';
type ExtendedView = View | 'ocr' | 'curriculum' | 'reading-studio' | 'math-studio' | 'students';

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

const HeaderDropdown: React.FC<{ 
    label: string, 
    icon: string, 
    children: React.ReactNode, 
    colorClass?: string 
}> = ({ label, icon, children, colorClass = "text-zinc-500" }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="relative group" onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
            <button className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800 font-bold text-xs uppercase tracking-wider ${colorClass}`}>
                <i className={`fa-solid ${icon}`}></i>
                <span className="hidden xl:inline">{label}</span>
                <i className="fa-solid fa-chevron-down text-[8px] opacity-50"></i>
            </button>
            {isOpen && (
                <div className="absolute right-0 top-full pt-2 z-50 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-2 min-w-[200px] overflow-hidden">
                        {children}
                    </div>
                </div>
            )}
        </div>
    );
};

const DropdownItem: React.FC<{ icon: string, label: string, onClick: () => void, badge?: number }> = ({ icon, label, onClick, badge }) => (
    <button onClick={onClick} className="w-full flex items-center justify-between px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl transition-colors group">
        <div className="flex items-center gap-3">
            <i className={`fa-solid ${icon} w-4 text-center text-zinc-400 group-hover:text-indigo-500 transition-colors`}></i>
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{label}</span>
        </div>
        {badge !== undefined && badge > 0 && <span className="bg-indigo-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">{badge}</span>}
    </button>
);

const AppContent: React.FC = () => {
    const { user, logout } = useAuth();
    const { activeStudent, setActiveStudent, students } = useStudent();
    const [currentView, setCurrentView] = useState<ExtendedView>('generator');
    const [viewHistory, setViewHistory] = useState<ExtendedView[]>([]); 
    const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(null);
    const [worksheetData, setWorksheetData] = useState<WorksheetData>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [activeCurriculumSession, setActiveCurriculumSession] = useState<ActiveCurriculumSession | null>(null);
    const [loadedCurriculum, setLoadedCurriculum] = useState<Curriculum | null>(null);
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
    const [selectedSavedReport, setSelectedSavedReport] = useState<SavedAssessment | null>(null);
    const [workbookItems, setWorkbookItems] = useState<CollectionItem[]>([]);
    const [workbookSettings, setWorkbookSettings] = useState<WorkbookSettings>({
        title: 'Çalışma Kitapçığı', studentName: '', schoolName: '', year: new Date().getFullYear().toString(),
        teacherNote: '', theme: 'modern', accentColor: '#4f46e5', coverStyle: 'centered',
        showTOC: true, showPageNumbers: true, showWatermark: false, watermarkOpacity: 0.05, showBackCover: true
    });
    const [theme, setTheme] = useState<AppTheme>(() => {
        try { const storedTheme = localStorage.getItem('app-theme'); return (storedTheme as AppTheme) || 'anthracite'; } catch (e) { return 'anthracite'; }
    });
    const [uiSettings, setUiSettings] = useState<UiSettings>(() => {
        try { const stored = localStorage.getItem('app-ui-settings'); return stored ? { ...initialUiSettings, ...JSON.parse(stored) } : initialUiSettings; } catch (e) { return initialUiSettings; }
    });
    const [styleSettings, setStyleSettings] = useState<StyleSettings>(initialStyleSettings);
    const [historyItems, setHistoryItems] = useState<HistoryItem[]>(() => {
        try { const stored = localStorage.getItem('user_history'); return stored ? JSON.parse(stored) : []; } catch { return []; }
    });

    const navigateTo = (view: ExtendedView) => { if (currentView === view) return; setViewHistory(prev => [...prev, currentView]); setCurrentView(view); };
    const handleGoBack = () => {
        if (currentView === 'generator' && activeCurriculumSession) { setActiveCurriculumSession(null); navigateTo('curriculum'); return; }
        if (viewHistory.length > 0) { const newHistory = [...viewHistory]; const prevView = newHistory.pop(); setViewHistory(newHistory); if (prevView) setCurrentView(prevView); } else { setCurrentView('generator'); }
    };

    useEffect(() => { localStorage.setItem('user_history', JSON.stringify(historyItems)); }, [historyItems]);
    const addToHistory = (activityType: ActivityType, data: SingleWorksheetData[]) => {
        const activity = ACTIVITIES.find(a => a.id === activityType);
        const category = ACTIVITY_CATEGORIES.find(c => c.activities.includes(activityType));
        if (!activity || !category) return;
        const newItem: HistoryItem = { id: Date.now().toString() + Math.random(), userId: user?.id || 'guest', activityType, data, timestamp: new Date().toISOString(), title: activity.title, category: { id: category.id, title: category.title } };
        setHistoryItems(prev => [newItem, ...prev].slice(0, 100));
    };
    const clearHistory = () => { setHistoryItems([]); };
    const deleteHistoryItem = (id: string) => { setHistoryItems(prev => prev.filter(i => i.id !== id)); };
    const handleRestoreFromHistory = (item: HistoryItem) => { loadSavedWorksheet({ id: item.id, userId: item.userId, name: item.title, activityType: item.activityType, worksheetData: item.data, createdAt: item.timestamp, icon: ACTIVITIES.find(a => a.id === item.activityType)?.icon || 'fa-file', category: item.category }); setOpenModal(null); };
    const handleSaveHistoryItem = (item: HistoryItem) => { if (!user) { setIsAuthModalOpen(true); return; } addSavedWorksheet(`${item.title} (Geçmiş)`, item.activityType, item.data); };
    const addSavedWorksheet = async (name: string, activityType: ActivityType, data: SingleWorksheetData[]) => {
        if (!user) { setIsAuthModalOpen(true); return; }
        const activity = ACTIVITIES.find(a => a.id === activityType);
        const category = ACTIVITY_CATEGORIES.find(c => c.activities.includes(activityType));
        if (!activity || !category) return;
        try { await worksheetService.saveWorksheet(user.id, name, activityType, data, activity.icon, { id: category.id, title: category.title }, styleSettings, studentProfile || undefined, studentProfile?.studentId); alert(`Etkinlik "${name}" adıyla arşivinize kaydedildi.`); } catch (e: any) { alert(`Kaydedilirken bir hata oluştu: ${e.message}.`); }
    };

    const loadSavedWorksheet = (item: any) => {
        if (item.report || item.activityType === ActivityType.ASSESSMENT_REPORT) { setSelectedSavedReport(item as SavedAssessment); return; }
        if (item.schedule && item.durationDays) { setLoadedCurriculum(item as Curriculum); navigateTo('curriculum'); return; }
        if (item.activityType === ActivityType.WORKBOOK || item.workbookItems) { if (item.workbookItems && item.workbookSettings) { setWorkbookItems(item.workbookItems); setWorkbookSettings(item.workbookSettings); navigateTo('workbook'); } return; }
        setSelectedActivity(item.activityType); setWorksheetData(item.worksheetData); if (item.styleSettings) setStyleSettings(item.styleSettings);
        if (item.studentProfile) { setStudentProfile(item.studentProfile); if (item.studentId) { const s = students.find(x => x.id === item.studentId); if (s) setActiveStudent(s); } } else { setStudentProfile(null); setActiveStudent(null); }
        navigateTo('generator'); setIsSidebarExpanded(true); 
    };

    const handleSelectActivity = (activityType: ActivityType | null) => { if (currentView !== 'generator') navigateTo('generator'); setActiveCurriculumSession(null); setSelectedActivity(activityType); setWorksheetData(null); setError(null); setCurrentView('generator'); if (isSidebarOpen) setIsSidebarOpen(false); if (activityType) setIsSidebarExpanded(true); };
    const handleStartCurriculumActivity = (planId: string, day: number, activityId: string, activityType: string, studentName: string, title: string, difficulty: 'Easy' | 'Medium' | 'Hard', goal: string, studentId?: string) => { setActiveCurriculumSession({ planId, day, activityId, studentName, activityTitle: title, studentId, difficulty, goal }); if (studentId) { const s = students.find(x => x.id === studentId); if (s) setActiveStudent(s); } else { setStudentProfile({ name: studentName, school: '', grade: '', date: new Date().toLocaleDateString('tr-TR') }); } setSelectedActivity(activityType as ActivityType); setWorksheetData(null); navigateTo('generator'); setIsSidebarExpanded(true); };
    const handleCompleteCurriculumActivity = async () => {
        if (!activeCurriculumSession || !user) return; setIsLoading(true);
        try { if (worksheetData) await addSavedWorksheet(`${activeCurriculumSession.studentName} - ${activeCurriculumSession.activityTitle}`, selectedActivity!, worksheetData); await curriculumService.updateActivityStatus(activeCurriculumSession.planId, activeCurriculumSession.day, activeCurriculumSession.activityId, 'completed'); setActiveCurriculumSession(null); navigateTo('curriculum'); alert("Harika! Aktivite tamamlandı ve plana işlendi."); } catch (e) { alert("Bir hata oluştu."); } finally { setIsLoading(false); }
    };

    const handleAddToWorkbookGeneral = (activityType: ActivityType, data: any) => {
        if (activityType && data) {
            const dataArray = Array.isArray(data) ? data : [data];
            const newItems: CollectionItem[] = dataArray.map((sheet: any) => ({ id: crypto.randomUUID(), activityType: activityType, data: sheet, settings: { ...styleSettings }, title: sheet.title || ACTIVITIES.find(a => a.id === activityType)?.title || 'Etkinlik' }));
            setWorkbookItems(prev => [...prev, ...newItems]);
            const btn = document.getElementById('add-to-wb-btn');
            if(btn) { btn.classList.add('scale-125', 'bg-green-500', 'text-white'); setTimeout(() => btn.classList.remove('scale-125', 'bg-green-500', 'text-white'), 300); }
        }
    };
    const handleAddToWorkbook = () => { if (selectedActivity && worksheetData) handleAddToWorkbookGeneral(selectedActivity, worksheetData); };
    const handleAddDirectToWorkbook = (item: any) => {
        const newItems: CollectionItem[] = [{ id: crypto.randomUUID(), activityType: item.activityType, data: item.data, settings: { ...styleSettings, ...item.settings }, title: item.title }];
        setWorkbookItems(prev => [...prev, ...newItems]);
    };

    const handleOCRResult = (result: any) => { setSelectedActivity(ActivityType.OCR_CONTENT); setWorksheetData(result); navigateTo('generator'); setIsSidebarExpanded(true); };
    const handleAutoGenerateWorkbook = async (report: AssessmentReport) => {
        setIsLoading(true); navigateTo('workbook'); const newItems: CollectionItem[] = [];
        const defaultOptions: GeneratorOptions = { mode: 'fast', difficulty: 'Orta', worksheetCount: 1, itemCount: 10, gridSize: 10, operationType: 'mixed', numberRange: '1-20' };
        try {
            const reportItem: CollectionItem = { id: crypto.randomUUID(), activityType: ActivityType.ASSESSMENT_REPORT, data: { id: 'temp-report', userId: user?.id || 'guest', studentName: studentProfile?.name || 'Öğrenci', gender: 'Erkek', age: 7, grade: studentProfile?.grade || '1. Sınıf', createdAt: new Date().toISOString(), report: report } as SavedAssessment, settings: { ...styleSettings, showStudentInfo: false, showFooter: false }, title: `Rapor: ${studentProfile?.name || 'Öğrenci'}` };
            newItems.push(reportItem);
            for (const roadItem of report.roadmap) {
                const activityId = roadItem.activityId as ActivityType;
                const pascalName = activityId.toLowerCase().split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
                const generatorName = `generateOffline${pascalName}`;
                const generator = (offlineGenerators as any)[generatorName];
                if (generator) {
                    try { const generatedData = await generator(defaultOptions); generatedData.forEach((sheet: any) => { newItems.push({ id: crypto.randomUUID(), activityType: activityId, data: sheet, settings: { ...styleSettings }, title: ACTIVITIES.find(a => a.id === activityId)?.title || activityId }); }); } catch (genErr) { console.error(`Failed to auto-generate ${activityId}`, genErr); }
                }
            }
            setWorkbookItems(newItems); setWorkbookSettings(prev => ({ ...prev, title: `Kişisel Gelişim Planı`, studentName: studentProfile?.name || '', teacherNote: "Bu kitapçık, yapılan değerlendirme sonucunda belirlenen ihtiyaçlara yönelik olarak yapay zeka tarafından otomatik oluşturulmuştur." }));
        } catch (e) { alert("Otomatik kitapçık oluşturulurken bir hata meydana geldi."); } finally { setIsLoading(false); }
    };

    return (
        <div className="flex flex-col h-screen bg-transparent font-sans transition-colors duration-300">
            <header className={`relative bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 shadow-sm z-50 transition-all duration-500 ${zenMode ? '-mt-24 opacity-0 pointer-events-none' : 'mt-0 opacity-100'}`}>
                <div className="w-full px-6 py-4 flex justify-between items-center gap-6">
                    
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-zinc-400 p-2 hover:text-zinc-900 transition-colors"><i className="fa-solid fa-bars-staggered fa-lg"></i></button>
                        <button id="tour-logo" onClick={() => { navigateTo('generator'); setSelectedActivity(null); setWorksheetData(null); setActiveCurriculumSession(null); }} className="flex items-center gap-3">
                            <DyslexiaLogo className="h-10 w-auto" />
                        </button>
                    </div>

                    <div className="flex-1 max-w-xl hidden md:block">
                        <GlobalSearch onSelectActivity={handleSelectActivity} />
                    </div>

                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => navigateTo('assessment')} 
                            className="hidden sm:flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-95"
                        >
                            <i className="fa-solid fa-user-doctor"></i> DEĞERLENDİRME
                        </button>

                        <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800 mx-2"></div>

                        <div className="flex items-center gap-1">
                            <button onClick={() => navigateTo('workbook')} className="relative p-2.5 text-zinc-400 hover:text-emerald-500 transition-all rounded-xl hover:bg-emerald-50" title="Kitapçık">
                                <i className="fa-solid fa-book-medical fa-lg"></i>
                                {workbookItems.length > 0 && <span className="absolute top-0.5 right-0.5 bg-emerald-500 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">{workbookItems.length}</span>}
                            </button>
                            <button onClick={() => navigateTo('messages')} className="relative p-2.5 text-zinc-400 hover:text-indigo-500 transition-all rounded-xl hover:bg-indigo-50" title="Mesajlar">
                                <i className="fa-solid fa-comment-dots fa-lg"></i>
                                {unreadCount > 0 && <span className="absolute top-0.5 right-0.5 bg-red-500 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">{unreadCount}</span>}
                            </button>
                        </div>

                        <HeaderDropdown label="Kitaplığım" icon="fa-bookmark" colorClass="text-emerald-600 dark:text-emerald-400">
                            <DropdownItem icon="fa-heart" label="Favoriler" onClick={() => navigateTo('favorites')} />
                            <DropdownItem icon="fa-box-archive" label="Arşiv" onClick={() => navigateTo('savedList')} />
                            <DropdownItem icon="fa-share-nodes" label="Paylaşılanlar" onClick={() => navigateTo('shared')} />
                            <DropdownItem icon="fa-clock-rotate-left" label="İşlem Geçmişi" onClick={() => setOpenModal('history')} />
                        </HeaderDropdown>

                        <HeaderDropdown label="Destek" icon="fa-circle-info">
                            <DropdownItem icon="fa-circle-play" label="Tur Başlat" onClick={() => setIsTourOpen(true)} />
                            <DropdownItem icon="fa-headset" label="Yardım Masası" onClick={() => setIsFeedbackOpen(true)} />
                            <DropdownItem icon="fa-circle-question" label="Hakkımızda" onClick={() => setOpenModal('about')} />
                            <DropdownItem icon="fa-laptop-code" label="Geliştirici" onClick={() => setOpenModal('developer')} />
                        </HeaderDropdown>

                        <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800 mx-2"></div>

                        {user ? (
                            <HeaderDropdown label={user.name.split(' ')[0]} icon="fa-user-circle" colorClass="text-zinc-900 dark:text-white">
                                <DropdownItem icon="fa-user-gear" label="Profil Ayarları" onClick={() => navigateTo('profile')} />
                                <DropdownItem icon="fa-sliders" label="Görünüm Ayarları" onClick={() => setOpenModal('settings')} />
                                {user.role === 'admin' && <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1"></div>}
                                {user.role === 'admin' && <DropdownItem icon="fa-shield-halved" label="Admin Paneli" onClick={() => navigateTo('admin')} />}
                                <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1"></div>
                                <DropdownItem icon="fa-arrow-right-from-bracket" label="Çıkış Yap" onClick={logout} />
                            </HeaderDropdown>
                        ) : (
                            <button onClick={() => setIsAuthModalOpen(true)} className="px-6 py-2.5 bg-zinc-900 text-white dark:bg-white dark:text-black rounded-2xl text-xs font-black shadow-lg transition-all active:scale-95">GİRİŞ YAP</button>
                        )}
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>}
                <div onMouseEnter={() => setIsSidebarExpanded(true)} className={`transition-all duration-500 ease-in-out h-full ${zenMode ? '-ml-80 w-0 opacity-0 overflow-hidden' : ''}`}>
                    <Sidebar
                        isSidebarOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} selectedActivity={selectedActivity}
                        onSelectActivity={handleSelectActivity} setWorksheetData={setWorksheetData} setIsLoading={setIsLoading}
                        setError={setError} isLoading={isLoading} onAddToHistory={addToHistory}
                        onOpenOCR={() => navigateTo('ocr')} onOpenCurriculum={() => navigateTo('curriculum')}
                        onOpenReadingStudio={() => navigateTo('reading-studio')} onOpenMathStudio={() => navigateTo('math-studio')}
                        onOpenScreening={() => navigateTo('screening')}
                        activeCurriculumSession={activeCurriculumSession} isExpanded={isSidebarExpanded}
                    />
                </div>
                <div className="flex-1 flex flex-col overflow-hidden" onMouseEnter={() => setIsSidebarExpanded(false)}>
                    <ContentArea
                        currentView={currentView as View} onBackToGenerator={() => { if(currentView !== 'generator') handleGoBack(); else { setSelectedActivity(null); setWorksheetData(null); setActiveCurriculumSession(null); } }}
                        activityType={selectedActivity} worksheetData={worksheetData} isLoading={isLoading} error={error}
                        styleSettings={styleSettings} onStyleChange={setStyleSettings} onSave={addSavedWorksheet}
                        onLoadSaved={loadSavedWorksheet} onFeedback={() => setIsFeedbackOpen(true)} onOpenAuth={() => setIsAuthModalOpen(true)}
                        onSelectActivity={handleSelectActivity} workbookItems={workbookItems} setWorkbookItems={setWorkbookItems}
                        workbookSettings={workbookSettings} setWorkbookSettings={setWorkbookSettings} onAddToWorkbook={handleAddToWorkbook}
                        onAutoGenerateWorkbook={handleAutoGenerateWorkbook} studentProfile={studentProfile} zenMode={zenMode}
                        toggleZenMode={() => setZenMode(!zenMode)} activeCurriculumSession={activeCurriculumSession}
                        onCompleteCurriculumActivity={handleCompleteCurriculumActivity}
                        onAddDirectToWorkbook={handleAddDirectToWorkbook}
                    />
                </div>
            </div>

            <TourGuide steps={tourSteps} isOpen={isTourOpen} onClose={() => setIsTourOpen(false)} />
            <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} activityType={selectedActivity} activityTitle={selectedActivity ? ACTIVITIES.find(a => a.id === selectedActivity)?.title : undefined} />
            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
            <StudentInfoModal isOpen={isStudentModalOpen} onClose={() => setIsStudentModalOpen(false)} currentProfile={studentProfile} onSave={(p) => setStudentProfile(p)} onClear={() => setStudentProfile(null)} />
            <SettingsModal isOpen={openModal === 'settings'} onClose={() => setOpenModal(null)} uiSettings={uiSettings} onUpdateUiSettings={setUiSettings} theme={theme} onUpdateTheme={setTheme} />
            <AssessmentReportViewer assessment={selectedSavedReport} onClose={() => setSelectedSavedReport(null)} user={user} onSelectActivity={handleSelectActivity} />
            <Modal isOpen={openModal === 'history'} onClose={() => setOpenModal(null)} title="İşlem Geçmişi"><HistoryView historyItems={historyItems} onRestore={handleRestoreFromHistory} onSaveToArchive={handleSaveHistoryItem} onDelete={deleteHistoryItem} onClearAll={clearHistory} onClose={() => setOpenModal(null)} /></Modal>
            <Modal isOpen={openModal === 'about'} onClose={() => setOpenModal(null)} title="Hakkımızda"><div className="text-center space-y-6"><DyslexiaLogo className="h-16 w-auto mx-auto" /><div className="space-y-4 text-zinc-600 dark:text-zinc-300"><p className="leading-relaxed">Bursa Disleksi AI, özel öğrenme güçlüğü yaşayan bireylerin eğitim süreçlerini desteklemek, eğitmen ve ailelere kişiselleştirilmiş, bilimsel temelli materyaller sunmak amacıyla geliştirilmiş yeni nesil bir yapay zeka platformudur.</p></div></div></Modal>
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
