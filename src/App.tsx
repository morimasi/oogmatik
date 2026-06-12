
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { pageTransition } from './utils/motionPresets';
import { useToastStore } from './store/useToastStore';
import { ToastContainer } from './components/ToastContainer';
import {
  ActivityType,
  WorksheetData,
  SavedWorksheet,
  SingleWorksheetData,
  AppTheme,
  HistoryItem,
  StyleSettings,
  View,
  UiSettings,
  CollectionItem,
  WorkbookSettings,
  StudentProfile,
  AssessmentReport,
  GeneratorOptions,
  SavedAssessment,
  ScreeningResult,
  Curriculum,
  Difficulty,
} from './types';
import { Clock, UserMinus as UserX } from 'lucide-react';
import Sidebar from './components/Sidebar';
const ContentArea = lazy(() => import('./components/ContentArea').then(m => ({ default: m.default })));
import { ACTIVITIES, ACTIVITY_CATEGORIES } from './constants';
import DyslexiaLogo from './components/DyslexiaLogo';
import { FeedbackModal } from './components/FeedbackModal';
import { AuthModal } from './components/AuthModal';
import { worksheetService } from './services/worksheetService';
import { curriculumService } from './services/curriculumService';
import { SettingsModal } from './components/SettingsModal';
import { TourGuide, TourStep } from './components/TourGuide';
import { StudentInfoModal } from './components/StudentInfoModal';
import { HistoryView } from './components/HistoryView';
import { PaperSizeInitializer } from './components/PaperSizeInitializer';
import { useAuthStore } from './store/useAuthStore';
import { AssessmentReportViewer } from './components/AssessmentReportViewer';
import { useAppStore } from './store/useAppStore';
import { useWorksheetStore } from './store/useWorksheetStore';
import { useUIStore } from './store/useUIStore';
import { useProfileData } from './components/Profile/hooks/useProfileData';
import { AppHeader } from './components/AppHeader';
import { AssignModal } from './components/Student/AssignModal';
import { useGlobalSettings } from './hooks/useGlobalSettings';
import { GuideModule, TourModule, PremiumHelpModule, AboutModule, DeveloperVisionModule } from './components/Onboarding';
const ScreeningAssessment = lazy(() => import('./components/ScreeningAssessment').then(m => ({ default: m.ScreeningAssessment })));
import LoginPage from './pages/LoginPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { rbacService } from './services/rbacService';
import * as offlineGenerators from './services/offlineGenerators';

import { useNavigationLogic } from './hooks/useNavigationLogic';
import { useHistoryManager } from './hooks/useHistoryManager';
import { useWorksheetManager } from './hooks/useWorksheetManager';
import { useWorkbookActions } from './hooks/useWorkbookActions';

// Landing Page
const LandingPage = lazy(() =>
  import('./pages/LandingPage').then((module) => ({ default: module.default }))
);

// Lazy Loaded Components
const Profile = lazy(() =>
  import('./components/Profile').then((module) => ({ default: module.Profile }))
);
const AdminDashboard = lazy(() =>
  import('./components/AdminDashboard/index').then((module) => ({ default: module.AdminDashboard }))
);

const OCRScanner = lazy(() =>
  import('./components/OCRScanner').then((module) => ({ default: module.OCRScanner }))
);
const CurriculumView = lazy(() =>
  import('./components/CurriculumView').then((module) => ({ default: module.CurriculumView }))
);
const ReadingStudio = lazy(() =>
  import('./components/ReadingStudio/ReadingStudio').then((module) => ({
    default: module.ReadingStudio,
  }))
);
const MathStudio = lazy(() =>
  import('./components/MathStudio/MathStudio').then((module) => ({ default: module.MathStudio }))
);
const SuperStudio = lazy(() =>
  import('./components/SuperStudio').then((module) => ({ default: module.SuperStudio }))
);
const ActivityStudio = lazy(() =>
  import('./components/ActivityStudio').then((module) => ({ default: module.ActivityStudio }))
);
const PDFViewer = lazy(() =>
  import('./components/PDFViewer/PDFViewer').then((module) => ({ default: module.PDFViewer || module.default }))
);

const StudentDashboard = lazy(() =>
  import('./components/Student/StudentDashboard').then((module) => ({
    default: module.StudentDashboard,
  }))
);
const ScreeningModule = lazy(() =>
  import('./components/Screening/ScreeningModule').then((module) => ({
    default: module.ScreeningModule,
  }))
);
const SinavStudyosu = lazy(() =>
  import('./components/SinavStudyosu').then((module) => ({ default: module.SinavStudyosu }))
);
const MatSinavStudyosu = lazy(() =>
  import('./components/MatSinavStudyosu').then((module) => ({ default: module.MatSinavStudyosu }))
);
const SariKitapStudio = lazy(() =>
  import('./components/SariKitapStudio').then((module) => ({ default: module.SariKitapStudio }))
);
const KelimeCumleStudio = lazy(() =>
  import('./components/KelimeCumleStudio').then((module) => ({ default: module.default }))
);


import { LoadingSpinner } from './components/shared/LoadingSpinner';
import { Modal } from './components/shared/Modal';
import { initialStyleSettings } from './constants/initialSettings';
import { tourSteps } from './constants/tourSteps';

type ModalType = 'settings' | 'history' | 'about' | 'developer' | 'pdf-viewer';





import { DeveloperModal } from './components/DeveloperModal';



import { useStudentStore } from './store/useStudentStore';

import { logInfo, logError, logWarn } from './utils/logger.js';
import { ConnectPanel } from './components/Student/modules/ConnectPanel';
const AppContent = () => {
  const authStore = useAuthStore();
  const studentStore = useStudentStore();
  const toast = useToastStore();

  // Profile data hook
  const profileData = useProfileData();

  // Global PaperSize initialization glue to App root (to be implemented in root-level effect later)

  // Global Initialization
  useEffect(() => {
    logInfo("Initializing Auth Store in App.tsx...");
    const unsubscribeAuth = authStore.initialize();

    // Initialize RBAC Service
    rbacService.initialize().then(() => {
      logInfo("RBAC Service Initialized");
    });

    return () => {
      logInfo("Cleaning up Auth Store initialization...");
      unsubscribeAuth();
    };
  }, []); // Remove authStore.initialize from dependencies to prevent re-renders

  useEffect(() => {
    if (!authStore.user) return;
    const isAdmin = authStore.user.role === 'superadmin' || authStore.user.role === 'admin';
    const unsubscribeStudents = studentStore.fetchStudents(authStore.user.id, isAdmin);
    return () => unsubscribeStudents();
  }, [authStore.user, studentStore.fetchStudents]);
  const { user } = authStore;
  const { activeStudent, setActiveStudent, students } = studentStore;

  const {
    currentView,
    setCurrentView,
    addHistoryView,
    popHistoryView,
    selectedActivity,
    setSelectedActivity,
    worksheetData,
    setWorksheetData,
    activeCurriculumSession,
    setActiveCurriculumSession,
    setActiveWorksheet,
    isLoading,
    setIsLoading,
    error,
    setError,
    studioData,
    setStudioData,
    resetGeneratorContext,
  } = useWorksheetStore();

  const [loadedCurriculum, setLoadedCurriculum] = useState(null as Curriculum | null);

  const {
    theme,
    setTheme,
    sidebarWidth,
    setSidebarWidth,
    zenMode,
    setZenMode,
    isSidebarOpen,
    setIsSidebarOpen,
    isTourActive,
    setIsTourActive,
    uiSettings,
    updateUiSettings,
    showConnect,
    setShowConnect
  } = useUIStore();

  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [openModal, setOpenModal] = useState(null as ModalType | null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [studentProfile, setStudentProfile] = useState(null as StudentProfile | null);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [selectedSavedReport, setSelectedSavedReport] = useState(null as SavedAssessment | null);  // Screening to Plan Bridge
  const [screeningPlanData, setScreeningPlanData] = useState(
    null as { name: string; age: number; weaknesses: string[]; diagnosisContext?: string } | null
  );

  // Onboarding Modules State
  const [activeOnboardingModule, setActiveOnboardingModule] = useState<'guide' | 'tour' | 'help' | 'about' | 'developer' | null>(null);
  const [isAdvancedScreeningOpen, setIsAdvancedScreeningOpen] = useState(false);

  // Automatically open GuideModule for first-time login
  useEffect(() => {
    if (authStore.user) {
      const isGuideCompleted = localStorage.getItem(`bdmind_guide_completed_${authStore.user.id}`) === 'true';
      if (!isGuideCompleted) {
        setActiveOnboardingModule('guide');
      }
    }
  }, [authStore.user]);

  useGlobalSettings(uiSettings, theme, sidebarWidth);

  // Onboarding Modules Event Listeners
  useEffect(() => {
    const handleOpenGuide = () => setActiveOnboardingModule('guide');
    const handleOpenTour = () => setActiveOnboardingModule('tour');
    const handleOpenHelp = () => setActiveOnboardingModule('help');
    const handleOpenAbout = () => setActiveOnboardingModule('about');
    const handleOpenDeveloper = () => setActiveOnboardingModule('developer');

    window.addEventListener('openGuide', handleOpenGuide);
    window.addEventListener('openTour', handleOpenTour);
    window.addEventListener('openHelp', handleOpenHelp);
    window.addEventListener('openAbout', handleOpenAbout);
    window.addEventListener('openDeveloper', handleOpenDeveloper);

    return () => {
      window.removeEventListener('openGuide', handleOpenGuide);
      window.removeEventListener('openTour', handleOpenTour);
      window.removeEventListener('openHelp', handleOpenHelp);
      window.removeEventListener('openAbout', handleOpenAbout);
      window.removeEventListener('openDeveloper', handleOpenDeveloper);
    };
  }, []);
  const [styleSettings, setStyleSettings] = useState(initialStyleSettings as StyleSettings);
  const { navigateTo, handleGoBack, handleOpenStudio, handleGeneratePlanFromScreening } = useNavigationLogic(
    setScreeningPlanData,
    setIsAdvancedScreeningOpen
  );
  
  const {
    workbookItems,
    setWorkbookItems,
    workbookSettings,
    setWorkbookSettings,
    handleAddToWorkbookGeneral,
    handleAddToWorkbook,
    handleAddDirectToWorkbook,
    handleAutoGenerateWorkbook,
  } = useWorkbookActions(
    styleSettings,
    selectedActivity,
    worksheetData,
    user,
    studentProfile,
    toast,
    setIsLoading,
    navigateTo
  );

  const { addSavedWorksheet, loadSavedWorksheet } = useWorksheetManager(
    styleSettings,
    studentProfile,
    setStudentProfile,
    setStyleSettings,
    setIsAuthModalOpen,
    setWorkbookItems,
    setWorkbookSettings,
    setSelectedSavedReport,
    setLoadedCurriculum,
    navigateTo,
    setIsSidebarExpanded
  );

  const { historyItems, addToHistory, clearHistory, deleteHistoryItem, handleRestoreFromHistory, handleSaveHistoryItem } = useHistoryManager(
    addSavedWorksheet,
    loadSavedWorksheet,
    setOpenModal,
    setIsAuthModalOpen
  );

  const handleSelectActivity = (activityType: ActivityType | null) => {
    if (currentView !== 'generator') navigateTo('generator');
    setActiveCurriculumSession(null);
    setSelectedActivity(activityType);
    setWorksheetData(null);
    setActiveWorksheet(null);
    setError(null);
    setCurrentView('generator');
    if (isSidebarOpen) setIsSidebarOpen(false);
    if (activityType) setIsSidebarExpanded(true);
  };
  const handleStartCurriculumActivity = (
    planId: string,
    day: number,
    activityId: string,
    activityType: string,
    studentName: string,
    title: string,
    difficulty: Difficulty,
    goal: string,
    studentId?: string
  ) => {
    setActiveCurriculumSession({
      planId,
      day,
      activityId,
      studentName,
      activityTitle: title,
      studentId,
      difficulty,
      goal,
    });
    if (studentId) {
      const s = students.find((x: { id: string }) => x.id === studentId);
      if (s) setActiveStudent(s);
    } else {
      setStudentProfile({
        name: studentName,
        school: '',
        grade: '',
        date: new Date().toLocaleDateString('tr-TR'),
      });
    }
    setSelectedActivity(activityType as ActivityType);
    setWorksheetData(null);
    navigateTo('generator');
    setIsSidebarExpanded(true);
  };
  const handleCompleteCurriculumActivity = async () => {
    if (!activeCurriculumSession || !user) return;
    setIsLoading(true);
    try {
      if (worksheetData)
        await addSavedWorksheet(
          `${activeCurriculumSession.studentName} - ${activeCurriculumSession.activityTitle}`,
          selectedActivity!,
          worksheetData
        );
      await curriculumService.updateActivityStatus(
        activeCurriculumSession.planId,
        activeCurriculumSession.day,
        activeCurriculumSession.activityId,
        'completed'
      );
      setActiveCurriculumSession(null);
      navigateTo('curriculum');
      toast.success('Harika! Aktivite tamamlandı ve plana işlendi.');
    } catch (_e) {
      toast.error('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetWorksheetData = async (data: WorksheetData | null) => {
    setWorksheetData(data);
    if (activeCurriculumSession && data) {
      try {
        setIsLoading(true);
        await curriculumService.updateActivityStatus(
          activeCurriculumSession.planId,
          activeCurriculumSession.day,
          activeCurriculumSession.activityId,
          'completed'
        );
        await addSavedWorksheet(
          `${activeCurriculumSession.studentName} - ${activeCurriculumSession.activityTitle}`,
          selectedActivity!,
          data
        );
        setActiveCurriculumSession(null);
        toast.success(`Harika! ${activeCurriculumSession.activityTitle} üretildi ve plana otomatik işlendi! 🎉`);
      } catch (e) {
        logError(e instanceof Error ? e : new Error(String(e)), { context: 'handleSetWorksheetData:autoCompletePlan' });
        toast.error('Plan tamamlama sırasında bir hata oluştu. Lütfen tekrar deneyin.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleOCRResult = (result: unknown) => {
    setSelectedActivity(ActivityType.OCR_CONTENT);
    setWorksheetData(result as WorksheetData);
    navigateTo('generator');
    setIsSidebarExpanded(true);
  };

  // Check if we should show landing page
  const params = new URLSearchParams(window.location.search);
  const showLanding = params.get('landing') === 'true';

  // If showing landing page, render it instead of the full app
  if (showLanding) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <LandingPage />
      </Suspense>
    );
  }

  // FAZ 5: Mandatory Authentication Gate
  if (authStore.isLoading) {
    return <LoadingSpinner />;
  }

  if (!authStore.user) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <LoginPage />
      </Suspense>
    );
  }

  if (authStore.user.status === 'pending') {
    return (
      <div className="min-h-screen w-screen h-screen flex items-center justify-center bg-[var(--bg-primary)] p-4 font-lexend relative overflow-hidden">
        {/* Abstract background shapes */}
        <div className="absolute w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[120px] -top-40 -left-40 pointer-events-none" />
        <div className="absolute w-[400px] h-[400px] rounded-full bg-violet-500/10 blur-[100px] -bottom-20 -right-20 pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md p-8 rounded-[2.5rem] bg-white/40 dark:bg-black/20 border border-zinc-200 dark:border-white/5 backdrop-blur-2xl shadow-2xl flex flex-col items-center text-center relative"
        >
          {/* Clock Icon Wrapper */}
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-6 animate-pulse shadow-lg shadow-amber-500/5">
            <Clock size={32} className="animate-spin" style={{ animationDuration: '10s' }} />
          </div>

          <h1 className="text-xl font-black text-[var(--text-primary)] tracking-tight mb-2">Kayıt İşleminiz Başarıyla Tamamlandı! 🎉</h1>
          <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-4 bg-amber-500/10 px-3 py-1 rounded-full">Yönetici Onayı Bekleniyor</p>

          <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">
            bdmind platformuna başarıyla kayıt oldunuz. Güvenlik ve pedagojik standartlar gereği, öğretmen hesaplarının tamamı yönetici onayından geçmektedir.
          </p>

          <div className="p-4 bg-white/50 dark:bg-black/30 border border-zinc-200 dark:border-white/5 rounded-2xl w-full text-left mb-6">
            <h4 className="text-[10px] font-black text-[var(--text-muted)] uppercase mb-2 tracking-wider">Bilgilendirme Notu</h4>
            <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">
              Hesabınız onaylandığında <strong className="text-[var(--text-primary)]">{authStore.user.email}</strong> adresinize otomatik bir onay e-postası gönderilecektir. Sorularınız için <a href="mailto:morimasi@gmail.com" className="text-indigo-500 font-bold hover:underline">morimasi@gmail.com</a> adresi ile iletişime geçebilirsiniz.
            </p>
          </div>

          <button
            onClick={() => authStore.logout()}
            className="w-full py-3 bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] text-xs font-black uppercase tracking-wider rounded-2xl border border-[var(--border-color)] transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm"
          >
            <UserX size={14} /> Oturumu Kapat
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col h-screen bg-[var(--bg-primary)] font-sans transition-colors duration-300 ${styleSettings.orientation === 'landscape' ? 'app-orientation-landscape' : 'app-orientation-portrait'}`}
    >
      <AppHeader
        workbookItemsCount={workbookItems.length}
        onOpenModal={(modal: ModalType) => setOpenModal(modal)}
        onOpenFeedback={() => setIsFeedbackOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onSelectActivity={handleSelectActivity}
        onOpenStudio={handleOpenStudio}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}
        <div
          className={`transition-all duration-500 ease-in-out h-full relative group/sidebar-container ${isAdvancedScreeningOpen || zenMode || ['workbook', 'assessment', 'profile', 'admin', 'favorites', 'savedList', 'shared', 'students', 'curriculum', 'screening', 'reading-studio', 'math-studio', 'super-turkce', 'infographic-studio', 'activity-studio', 'sinav-studyosu', 'mat-sinav-studyosu', 'sari-kitap-studio', 'kelime-cumle-studio', 'ocr'].includes(currentView) ? 'w-0 opacity-0 pointer-events-none' : 'opacity-100'}`}
          style={{
            width:
              isAdvancedScreeningOpen || zenMode || ['workbook', 'assessment', 'profile', 'admin', 'favorites', 'savedList', 'shared', 'students', 'curriculum', 'screening', 'reading-studio', 'math-studio', 'super-turkce', 'infographic-studio', 'activity-studio', 'sinav-studyosu', 'mat-sinav-studyosu', 'sari-kitap-studio', 'kelime-cumle-studio', 'ocr'].includes(currentView)
                ? 0
                : (currentView === 'generator' && selectedActivity) ? 296 : 250,
          }}
        >
          <Sidebar
            isSidebarOpen={isSidebarOpen}
            closeSidebar={() => setIsSidebarOpen(false)}
            selectedActivity={selectedActivity}
            onSelectActivity={handleSelectActivity}
            setWorksheetData={handleSetWorksheetData}
            setIsLoading={setIsLoading}
            setError={setError}
            isLoading={isLoading}
            onAddToHistory={addToHistory}
            onOpenOCR={() => handleOpenStudio('ocr')}
            onOpenCurriculum={() => handleOpenStudio('curriculum')}
            onOpenReadingStudio={() => handleOpenStudio('reading-studio')}
            onOpenMathStudio={() => handleOpenStudio('math-studio')}
            onOpenSuperTurkce={() => handleOpenStudio('super-turkce')}
            onOpenActivityStudio={() => handleOpenStudio('activity-studio')}
            onOpenScreening={() => handleOpenStudio('screening')}
            onOpenSinavStudyosu={() => handleOpenStudio('sinav-studyosu')}
            onOpenMatSinavStudyosu={() => handleOpenStudio('mat-sinav-studyosu')}
            onOpenSariKitapStudio={() => handleOpenStudio('sari-kitap-studio')}
            onOpenKelimeCumleStudio={() => handleOpenStudio('kelime-cumle-studio')}
            activeCurriculumSession={activeCurriculumSession}
            isExpanded={isSidebarExpanded}
            width={sidebarWidth}
            onWidthChange={setSidebarWidth}
          />
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          <Suspense fallback={<LoadingSpinner />}>
            <ContentArea
              currentView={currentView as View}
              onBackToGenerator={() => {
                if (currentView !== 'generator') handleGoBack();
                else {
                  setSelectedActivity(null);
                  setWorksheetData(null as any);
                  setActiveCurriculumSession(null);
                }
              }}
              activityType={selectedActivity}
              worksheetData={worksheetData}
              setWorksheetData={handleSetWorksheetData}
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
              onAddDirectToWorkbook={handleAddDirectToWorkbook}
            />
          </Suspense>

          {/* SPECIAL RENDER FOR STUDIOS WHEN IN THAT VIEW - MOVED INSIDE CONTENT CONTAINER */}
          <AnimatePresence mode="wait">
            {[
              'curriculum',
              'reading-studio',
              'math-studio',
              'super-turkce',
              'activity-studio',
              'ocr',
              'profile',
              'students',
              'admin',
              'screening',
              'sinav-studyosu',
              'mat-sinav-studyosu',
              'sari-kitap-studio',
              'kelime-cumle-studio',
            ].includes(currentView) && (
                <motion.div
                  key={currentView}
                  className={`absolute inset-0 bg-[var(--bg-primary)] overflow-y-auto overflow-x-hidden ${currentView === 'admin' ? 'z-[75]' : 'z-[60]'}`}
                  variants={pageTransition}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <Suspense fallback={<LoadingSpinner />}>
                    {currentView === 'curriculum' && (
                      <ProtectedRoute module="curriculum" onBack={handleGoBack}>
                        <CurriculumView
                          onBack={handleGoBack}
                          onSelectActivity={handleSelectActivity as any}
                          onStartCurriculumActivity={handleStartCurriculumActivity}
                          initialPlan={loadedCurriculum}
                          preFillData={screeningPlanData}
                        />
                      </ProtectedRoute>
                    )}
                    {currentView === 'reading-studio' && (
                      <ProtectedRoute module="reading-studio" onBack={handleGoBack}>
                        <ReadingStudio
                          onBack={handleGoBack}
                          onAddToWorkbook={handleAddToWorkbookGeneral as any}
                          initialData={studioData}
                        />
                      </ProtectedRoute>
                    )}
                    {currentView === 'math-studio' && (
                      <ProtectedRoute module="math-studio" onBack={handleGoBack}>
                        <MathStudio
                          onBack={handleGoBack}
                          onAddToWorkbook={handleAddToWorkbookGeneral as any}
                          initialData={studioData}
                        />
                      </ProtectedRoute>
                    )}
                    {currentView === 'super-turkce' && (
                      <ProtectedRoute module="super-studio" onBack={handleGoBack}>
                        <SuperStudio />
                      </ProtectedRoute>
                    )}
                    {currentView === 'activity-studio' && (
                      <ProtectedRoute module="activity-studio" onBack={handleGoBack}>
                        <ActivityStudio
                          onBack={handleGoBack}
                          onAddToWorkbook={(data: unknown) => handleAddToWorkbookGeneral(data as Record<string, unknown>)}
                        />
                      </ProtectedRoute>
                    )}
                    {currentView === 'ocr' && (
                      <ProtectedRoute module="activity-studio" onBack={handleGoBack}>
                        <OCRScanner onBack={handleGoBack} onResult={handleOCRResult} />
                      </ProtectedRoute>
                    )}
                    {currentView === 'profile' && (
                      <Profile
                        data={profileData}
                        activeStudent={activeStudent}
                        onBack={handleGoBack}
                        onSelectActivity={(id: string) => handleSelectActivity(id as ActivityType)}
                        onLoadSaved={loadSavedWorksheet}
                        theme={theme}
                        uiSettings={uiSettings}
                        onUpdateTheme={(t: AppTheme) => setTheme(t)}
                        onUpdateUiSettings={(s: UiSettings) => updateUiSettings(s)}
                        onOpenSettingsModal={() => setOpenModal('settings')}
                        onNavigateToCurriculum={() => navigateTo('curriculum')}
                      />
                    )}
                    {currentView === 'students' && (
                      <ProtectedRoute module="students" onBack={handleGoBack}>
                        <StudentDashboard
                          onBack={handleGoBack}
                          onLoadMaterial={loadSavedWorksheet}
                          onStartCurriculumActivity={handleStartCurriculumActivity}
                        />
                      </ProtectedRoute>
                    )}
                    {currentView === 'admin' && (
                      <ProtectedRoute module="admin" onBack={handleGoBack}>
                        <AdminDashboard onBack={handleGoBack} />
                      </ProtectedRoute>
                    )}
                    {currentView === 'screening' && (
                      <ProtectedRoute module="screening" onBack={handleGoBack}>
                        <ScreeningModule
                          onBack={handleGoBack}
                          onSelectActivity={handleSelectActivity}
                          onAddToWorkbook={(data: unknown) => handleAddToWorkbookGeneral(data as Record<string, unknown>)}
                          onGeneratePlan={(n: string, a: number, w: string[], c?: string) =>
                            handleGeneratePlanFromScreening(n, a, w, c)
                          }
                        />
                      </ProtectedRoute>
                    )}
                    {currentView === 'sinav-studyosu' && (
                      <ProtectedRoute module="sinav-studyosu" onBack={handleGoBack}>
                        <SinavStudyosu onAddToWorkbook={(type: ActivityType, data: unknown) => handleAddToWorkbookGeneral(type, data as Record<string, unknown>)} initialData={studioData} />
                      </ProtectedRoute>
                    )}
                    {currentView === 'mat-sinav-studyosu' && (
                      <ProtectedRoute module="math-studio" onBack={handleGoBack}>
                        <MatSinavStudyosu 
                          onAddToWorkbook={(type: ActivityType, data: unknown) => handleAddToWorkbookGeneral(type, data as Record<string, unknown>)} 
                          initialData={studioData}
                        />
                      </ProtectedRoute>
                    )}
                    {currentView === 'sari-kitap-studio' && (
                      <ProtectedRoute module="sari-kitap" onBack={handleGoBack}>
                        <SariKitapStudio
                          onBack={handleGoBack}
                          onAddToWorkbook={() => handleAddToWorkbookGeneral(ActivityType.SARI_KITAP_STUDIO, worksheetData as unknown as Record<string, unknown>)}
                          initialData={studioData}
                        />
                      </ProtectedRoute>
                    )}
                    {currentView === 'kelime-cumle-studio' && (
                      <ProtectedRoute module="kelime-cumle" onBack={handleGoBack}>
                        <KelimeCumleStudio
                          onBack={handleGoBack}
                          onAddToWorkbook={(data: unknown) => handleAddToWorkbookGeneral(ActivityType.KELIME_CUMLE, data as Record<string, unknown>)}
                        />
                      </ProtectedRoute>
                    )}

                  </Suspense>
                </motion.div>
              )}
          </AnimatePresence>
        </div>
      </div>

      <TourGuide steps={tourSteps} isOpen={isTourActive} onClose={() => setIsTourActive(false)} />
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        activityType={selectedActivity}
        activityTitle={
          selectedActivity ? ACTIVITIES.find((a) => a.id === selectedActivity)?.title : undefined
        }
      />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <AssignModal />
      <StudentInfoModal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        currentProfile={studentProfile}
        onSave={(p: StudentProfile) => setStudentProfile(p)}
        onClear={() => setStudentProfile(null)}
      />
      <SettingsModal
        isOpen={openModal === 'settings'}
        onClose={() => setOpenModal(null)}
        uiSettings={uiSettings}
        onUpdateUiSettings={(s: UiSettings) => updateUiSettings(s)}
        theme={theme}
        onUpdateTheme={(t: AppTheme) => setTheme(t)}
      />
      <DeveloperModal isOpen={openModal === 'developer'} onClose={() => setOpenModal(null)} />
      <AssessmentReportViewer
        assessment={selectedSavedReport}
        onClose={() => setSelectedSavedReport(null)}
        user={user}
        onSelectActivity={handleSelectActivity}
        onGeneratePlan={(name: string, age: number, weaknesses: string[], context?: string) =>
          handleGeneratePlanFromScreening(name, age, weaknesses, context)
        }
      />
      <Modal
        isOpen={openModal === 'history'}
        onClose={() => setOpenModal(null)}
        title="İşlem Geçmişi"
      >
        <HistoryView
          historyItems={historyItems}
          onRestore={handleRestoreFromHistory}
          onSaveToArchive={handleSaveHistoryItem}
          onDelete={deleteHistoryItem}
          onClearAll={clearHistory}
          onClose={() => setOpenModal(null)}
        />
      </Modal>
      <Modal isOpen={openModal === 'about'} onClose={() => setOpenModal(null)} title="Hakkımızda & Vizyon" maxWidth="max-w-4xl">
        <div className="space-y-12">
          {/* Hero Showcase */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative h-72 rounded-[3rem] overflow-hidden group border border-[var(--border-color)] shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
          >
            <img
              src="/media__1777555251633.png"
              className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105"
              alt="bdmind Premium"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-transparent to-transparent"></div>
            <div className="absolute bottom-10 left-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center">
                  <i className="fa-solid fa-star text-[var(--accent-color)] text-xl"></i>
                </div>
                <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic">OOGMATİK <span className="text-[var(--accent-color)]">PREMIUM</span></h3>
              </div>
              <p className="text-white/50 text-[10px] font-black uppercase tracking-[0.5em]">Future of Special Education Architecture</p>
            </div>
          </motion.div>

          {/* Core Pillars - Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="md:col-span-2 p-8 bg-[var(--bg-secondary)] rounded-[2.5rem] border border-[var(--border-color)] relative overflow-hidden group"
            >
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[var(--accent-color)]/5 rounded-full blur-3xl group-hover:bg-[var(--accent-color)]/10 transition-all"></div>
              <h4 className="text-[10px] font-black text-[var(--accent-color)] uppercase mb-4 tracking-[0.2em] flex items-center gap-2">
                <i className="fa-solid fa-microchip"></i> TEKNOLOJİMİZ
              </h4>
              <p className="text-lg font-medium text-[var(--text-primary)] leading-tight tracking-tight mb-4">
                Yapay zeka motorumuz, Bursa Disleksi'nin <span className="font-bold border-b-2 border-[var(--accent-color)]/30">20 yıllık klinik tecrübesini</span> saniyeler içinde kişiselleştirilmiş bir müfredata dönüştürür.
              </p>
              <p className="text-[11px] text-[var(--text-muted)] leading-relaxed opacity-70">
                Gemini 2.5 Flash mimarisi üzerine inşa edilen platformumuz, her çocuğun öğrenme paternini analiz ederek bilişsel yükü optimize edilmiş aktiviteler üretir.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="p-8 bg-gradient-to-br from-indigo-900 to-[#121214] rounded-[2.5rem] border border-white/5 shadow-xl flex flex-col justify-center text-center"
            >
              <div className="text-4xl font-black text-white mb-2 tracking-tighter">100K+</div>
              <div className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-6">ÜRETİLEN MATERYAL</div>
              <div className="h-px w-10 bg-white/10 mx-auto mb-6"></div>
              <p className="text-[10px] font-medium text-white/50 leading-relaxed uppercase tracking-tighter">Türkiye genelinde binlerce özel eğitimciye güç veriyoruz.</p>
            </motion.div>
          </div>

          {/* Philosophy Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-8 rounded-[2.5rem] bg-[var(--bg-paper)] border border-[var(--border-color)] flex items-start gap-6">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                <i className="fa-solid fa-graduation-cap text-2xl"></i>
              </div>
              <div>
                <h4 className="text-xs font-black text-[var(--text-primary)] uppercase mb-2 tracking-tighter">MEB & PISA UYUMU</h4>
                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">Etkinliklerimiz sadece disleksi dostu değil, aynı zamanda güncel MEB müfredatı ve PISA standartlarıyla tam senkronize şekilde tasarlanmıştır.</p>
              </div>
            </div>

            <div className="p-8 rounded-[2.5rem] bg-[var(--bg-paper)] border border-[var(--border-color)] flex items-start gap-6">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <i className="fa-solid fa-fingerprint text-2xl"></i>
              </div>
              <div>
                <h4 className="text-xs font-black text-[var(--text-primary)] uppercase mb-2 tracking-tighter">KİŞİSELLEŞTİRİLMİŞ İZ</h4>
                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">Her çocuğun parmak izi kadar eşsiz olduğunu biliyoruz. bdmind ile standart değil, "terzi dikimi" eğitim materyalleri saniyeler içinde elinizde.</p>
              </div>
            </div>
          </div>

          {/* Signature Footer */}
          <div className="pt-8 border-t border-[var(--border-color)] flex flex-col items-center text-center">
            <DyslexiaLogo className="h-8 opacity-40 grayscale mb-6" />
            <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.5em] opacity-30">
              BURSA DİSLEKSİ EDU-TECH SOLUTIONS &middot; EST 2004
            </p>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={openModal === 'pdf-viewer' || !!pdfPreviewUrl}
        title="PDF Önizleme"
        onClose={() => {
          setOpenModal(null);
          setPdfPreviewUrl(null);
        }}
      >
        <div style={{ height: '70vh', width: '100%' }}>
          <Suspense fallback={<LoadingSpinner />}>
            {pdfPreviewUrl && <PDFViewer url={pdfPreviewUrl} />}
            {!pdfPreviewUrl && (
              <div className="flex items-center justify-center h-full text-zinc-500">
                Görüntülenecek PDF dosyası bulunamadı.
              </div>
            )}
          </Suspense>
        </div>
      </Modal>

      {/* Onboarding Modules */}
      {activeOnboardingModule === 'guide' && (
        <GuideModule onClose={() => setActiveOnboardingModule(null)} />
      )}
      {activeOnboardingModule === 'tour' && (
        <TourModule onClose={() => setActiveOnboardingModule(null)} />
      )}
      {activeOnboardingModule === 'help' && (
        <PremiumHelpModule onClose={() => setActiveOnboardingModule(null)} />
      )}
      {activeOnboardingModule === 'about' && (
        <AboutModule onClose={() => setActiveOnboardingModule(null)} />
      )}
      {activeOnboardingModule === 'developer' && (
        <DeveloperVisionModule onClose={() => setActiveOnboardingModule(null)} />
      )}



      {/* Premium Floating Chat Panel (Oogmatik Connect) */}
      <AnimatePresence>
        {showConnect && (
          <motion.div
            initial={{ opacity: 0, x: 400, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 400, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-[88px] bottom-0 w-[410px] z-[1000] shadow-[-20px_0_50px_rgba(0,0,0,0.5)]"
          >
            <ConnectPanel 
              student={activeStudent || { id: 'global', name: 'Genel Kanallar' } as any}
              currentUser={{ 
                id: authStore.user?.id || 'guest', 
                name: authStore.user?.name || 'Misafir', 
                role: (authStore.user?.role === 'admin' ? 'admin' : 'teacher') as any
              }}
              onClose={() => setShowConnect(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Screening Assessment Module */}
      {isAdvancedScreeningOpen && (
        <ScreeningAssessment
          onClose={() => setIsAdvancedScreeningOpen(false)}
          userRole={(user?.role === 'admin' ? 'admin' : 'teacher')}
          onGeneratePlan={handleGeneratePlanFromScreening}
          onAddToWorkbook={(data) => handleAddToWorkbookGeneral(ActivityType.ASSESSMENT_REPORT, data as unknown as Record<string, unknown>)}
        />
      )}
    </div>
  );
};

export const App = () => {
  return (
    <>
      <PaperSizeInitializer />
      <AppContent />
      <ToastContainer />
    </>
  );
};
