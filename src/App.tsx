// @ts-nocheck
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
  Curriculum,
} from './types';
import Sidebar from './components/Sidebar';
import ContentArea from './components/ContentArea';
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
import * as offlineGenerators from './services/offlineGenerators';
import { useUIStore } from './store/useUIStore';
import { useWorksheetStore } from './store/useWorksheetStore';
import { AppHeader } from './components/AppHeader';
import { AssignModal } from './components/Student/AssignModal';

// Landing Page
const LandingPage = lazy(() =>
  import('./pages/LandingPage').then((module) => ({ default: module.default }))
);

// Lazy Loaded Components
const ProfileView = lazy(() =>
  import('./components/ProfileView').then((module) => ({ default: module.ProfileView }))
);
const AdminDashboard = lazy(() =>
  import('./components/AdminDashboard/index').then((module) => ({ default: module.AdminDashboard }))
);
const MessagesView = lazy(() =>
  import('./components/MessagesView').then((module) => ({ default: module.MessagesView }))
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
const InfographicStudio = lazy(() =>
  import('./components/InfographicStudio').then((module) => ({ default: module.InfographicStudio }))
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
  maskOpacity: 0.4,
  footerText: '',
};

type ModalType = 'settings' | 'history' | 'about' | 'developer' | 'pdf-viewer';

const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-full w-full min-h-[200px]">
    <div className="w-10 h-10 border-4 border-[var(--accent-muted)] border-t-[var(--accent-color)] rounded-full animate-spin"></div>
  </div>
);

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) => {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300"
      onClick={(e: React.MouseEvent) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <div
        className="bg-[var(--bg-paper)] rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar relative border border-[var(--border-color)]"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)]">
            <h2 className="text-xl font-black text-[var(--accent-color)] tracking-tight">
              {title}
            </h2>
            <button
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onClose();
              }}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              <i className="fa-solid fa-times text-xl"></i>
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

import { DeveloperModal } from './components/DeveloperModal';

const tourSteps: TourStep[] = [
  {
    targetId: 'tour-logo',
    title: 'Hoş Geldiniz',
    content: 'Bursa Disleksi AI platformuna hoş geldiniz. Hızlı bir tura başlayalım mı?',
    position: 'bottom',
  },
  {
    targetId: 'tour-search',
    title: 'Etkinlik Arama',
    content: 'İstediğiniz etkinliği veya konuyu buradan hızla bulabilirsiniz.',
    position: 'bottom',
  },
  {
    targetId: 'tour-sidebar',
    title: 'Kategoriler',
    content: 'Sol menüden etkinlik kategorilerine ulaşabilirsiniz.',
    position: 'right',
  },
  {
    targetId: 'tour-workbook-btn',
    title: 'Çalışma Kitapçığı',
    content: 'Seçtiğiniz etkinlikleri buraya ekleyerek tek bir PDF kitapçık oluşturabilirsiniz.',
    position: 'bottom',
  },
  {
    targetId: 'tour-ocr-btn',
    title: 'Akıllı Tarayıcı (OCR)',
    content: 'Fiziksel kağıtları tarayıp dijitalleştirmek için bu ikonu kullanın.',
    position: 'right',
  },
  {
    targetId: 'tour-history-btn',
    title: 'Geçmiş',
    content: 'Daha önce oluşturduğunuz etkinliklere buradan ulaşabilirsiniz.',
    position: 'bottom',
  },
];

import { useStudentStore } from './store/useStudentStore';

import { logInfo, logError, logWarn } from './utils/logger.js';
const AppContent = () => {
  const authStore = useAuthStore();
  const studentStore = useStudentStore();
  const toast = useToastStore();

  // Global PaperSize initialization glue to App root (to be implemented in root-level effect later)

  // Global Initialization
  useEffect(() => {
    const unsubscribeAuth = authStore.initialize();
    return () => unsubscribeAuth();
  }, [authStore.initialize]);

  useEffect(() => {
    if (!authStore.user) return;
    const unsubscribeStudents = studentStore.fetchStudents(authStore.user.id);
    return () => unsubscribeStudents();
  }, [authStore.user, studentStore.fetchStudents]);
  const { user } = authStore;
  const { setActiveStudent, students } = studentStore;

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
  } = useUIStore();

  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [openModal, setOpenModal] = useState(null as ModalType | null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [unreadCount] = useState(0);
  const [studentProfile, setStudentProfile] = useState(null as StudentProfile | null);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [selectedSavedReport, setSelectedSavedReport] = useState(null as SavedAssessment | null);
  const [workbookItems, setWorkbookItems] = useState([] as CollectionItem[]);
  const [workbookSettings, setWorkbookSettings] = useState({
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
    showBackCover: true,
  } as WorkbookSettings);

  // Screening to Plan Bridge
  const [screeningPlanData, setScreeningPlanData] = useState(
    null as { name: string; age: number; weaknesses: string[]; diagnosisContext?: string } | null
  );

  const [loadedInfographicData, setLoadedInfographicData] = useState(null);

  // Apply UI settings to document root when they change
  useEffect(() => {
    document.documentElement.style.setProperty('--app-font-family', uiSettings.fontFamily);
    document.documentElement.style.setProperty(
      '--app-font-size-scale',
      uiSettings.fontSizeScale.toString()
    );
    document.documentElement.style.setProperty(
      '--app-line-height',
      uiSettings.lineHeight.toString()
    );
    document.documentElement.style.setProperty(
      '--app-letter-spacing',
      uiSettings.letterSpacing === 'wide' ? '0.05em' : 'normal'
    );
    document.documentElement.style.setProperty('--app-saturation', `${uiSettings.saturation}%`);

    // Add a class for wide letter spacing to target specific elements if needed
    if (uiSettings.letterSpacing === 'wide') {
      document.documentElement.classList.add('letter-spacing-wide');
    } else {
      document.documentElement.classList.remove('letter-spacing-wide');
    }

    // Apply styles directly to body for inherited properties
    document.body.style.fontFamily = uiSettings.fontFamily;
    document.body.style.fontSize = `${16 * uiSettings.fontSizeScale}px`;
    document.body.style.lineHeight = uiSettings.lineHeight.toString();
    document.body.style.letterSpacing = uiSettings.letterSpacing === 'wide' ? '0.05em' : 'normal';
    document.body.style.filter = `saturate(${uiSettings.saturation}%)`;

    // Apply Focus Mode globally
    if (uiSettings.focusMode) {
      document.body.classList.add('focus-mode-active');
    } else {
      document.body.classList.remove('focus-mode-active');
    }
  }, [uiSettings]);

  // Tüm koyu temalar — tema sınıflandırması için merkezi sabit
  const DARK_THEMES: AppTheme[] = [
    'dark',
    'anthracite',
    'space',
    'anthracite-gold',
    'anthracite-cyber',
    'ocean',
    'nature',
  ];

  // Theme effect
  useEffect(() => {
    // Handle basic dark/light first
    const DARK_THEMES: AppTheme[] = [
      'dark',
      'anthracite',
      'space',
      'anthracite-gold',
      'anthracite-cyber',
      'oled-black',
    ];
    if (DARK_THEMES.includes(theme) || theme.includes('anthracite')) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Remove all theme classes first
    document.documentElement.classList.remove(
      'theme-light',
      'theme-dark',
      'theme-anthracite',
      'theme-space',
      'theme-nature',
      'theme-ocean',
      'theme-anthracite-gold',
      'theme-anthracite-cyber',
      'theme-oled-black',
      'theme-dyslexia-cream',
      'theme-dyslexia-mint'
    );
    // Add selected theme class
    document.documentElement.classList.add(`theme-${theme}`);
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', `${sidebarWidth}px`);
  }, [sidebarWidth]);

  // FAZ 4: Print trigger — yazdırmadan önce light tema zorlama, sonra eski haline döndürme
  useEffect(() => {
    const handleBeforePrint = () => {
      // Tüm tema sınıflarını kaldır ve light tema uygula
      document.documentElement.classList.add('printing-forced-light');
      document.documentElement.classList.remove('dark');
      document.body.style.filter = 'none';
    };

    const handleAfterPrint = () => {
      document.documentElement.classList.remove('printing-forced-light');
      // Eski temayı geri yükle
      if (DARK_THEMES.includes(theme)) {
        document.documentElement.classList.add('dark');
      }
      document.body.style.filter = `saturate(${uiSettings.saturation}%)`;
    };

    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);

    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, [theme, uiSettings.saturation]);
  const [styleSettings, setStyleSettings] = useState(initialStyleSettings as StyleSettings);
  const [historyItems, setHistoryItems] = useState(
    (() => {
      try {
        const stored = localStorage.getItem('user_history');
        return stored ? JSON.parse(stored) : [];
      } catch {
        return [];
      }
    })() as HistoryItem[]
  );

  const navigateTo = (view: View) => {
    if (currentView === view) return;
    addHistoryView(currentView);
    setCurrentView(view);
  };
  const handleGoBack = () => {
    if (currentView === 'generator' && activeCurriculumSession) {
      setActiveCurriculumSession(null);
      navigateTo('curriculum');
      return;
    }
    const prevView = popHistoryView();
    if (prevView) {
      setCurrentView(prevView);
    } else {
      setCurrentView('generator');
    }
  };

  // --- NAVIGATION HELPERS (Resets state before switching view) ---
  const handleOpenStudio = (viewName: View) => {
    resetGeneratorContext();
    navigateTo(viewName);
  };

  const handleGeneratePlanFromScreening = (
    studentName: string,
    age: number,
    weaknesses: string[],
    diagnosisContext?: string
  ) => {
    setScreeningPlanData({ name: studentName, age, weaknesses, diagnosisContext });
    handleOpenStudio('curriculum');
  };

  useEffect(() => {
    localStorage.setItem('user_history', JSON.stringify(historyItems));
  }, [historyItems]);
  const addToHistory = (activityType: ActivityType, data: WorksheetData) => {
    if (!data) return;
    const activity = ACTIVITIES.find((a) => a.id === activityType);
    const category = ACTIVITY_CATEGORIES.find((c) => c.activities.includes(activityType));
    if (!activity || !category) return;
    const newItem: HistoryItem = {
      id: Date.now().toString() + Math.random(),
      userId: user?.id || 'guest',
      activityType,
      data,
      timestamp: new Date().toISOString(),
      title: activity.title,
      category: { id: category.id, title: category.title },
    };
    setHistoryItems((prev: HistoryItem[]) => [newItem, ...prev].slice(0, 100));
  };
  const clearHistory = () => {
    setHistoryItems([]);
  };
  const deleteHistoryItem = (id: string) => {
    setHistoryItems((prev: HistoryItem[]) => prev.filter((i: HistoryItem) => i.id !== id));
  };
  const handleRestoreFromHistory = (item: HistoryItem) => {
    loadSavedWorksheet({
      id: item.id,
      userId: item.userId,
      name: item.title,
      activityType: item.activityType,
      worksheetData: item.data,
      createdAt: item.timestamp,
      icon: ACTIVITIES.find((a) => a.id === item.activityType)?.icon || 'fa-file',
      category: item.category,
    });
    setOpenModal(null);
  };
  const handleSaveHistoryItem = (item: HistoryItem) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    addSavedWorksheet(`${item.title} (Geçmiş)`, item.activityType, item.data);
  };
  const addSavedWorksheet = async (
    name: string,
    activityType: ActivityType,
    data: SingleWorksheetData[]
  ) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    const activity = ACTIVITIES.find((a) => a.id === activityType);
    const category = ACTIVITY_CATEGORIES.find((c) => c.activities.includes(activityType));
    if (!activity || !category) return;
    try {
      const saved = await worksheetService.saveWorksheet(
        user.id,
        name,
        activityType,
        data,
        activity.icon,
        { id: category.id, title: category.title },
        styleSettings,
        studentProfile || undefined,
        studentProfile?.studentId
      );
      toast.success(`Etkinlik "${name}" adıyla arşivinize kaydedildi.`);
      return saved.id;
    } catch (e: any) {
      toast.error(`Kaydedilirken bir hata oluştu: ${(e as Error).message}.`);
      return null;
    }
  };

  const loadSavedWorksheet = (item: SavedWorksheet | Curriculum | SavedAssessment | any) => {
    if (item.report || item.activityType === ActivityType.ASSESSMENT_REPORT) {
      setSelectedSavedReport(item as SavedAssessment);
      return;
    }
    if (item.schedule && item.durationDays) {
      setLoadedCurriculum(item as Curriculum);
      navigateTo('curriculum');
      return;
    }
    if (item.activityType === ActivityType.WORKBOOK || item.workbookItems) {
      if (item.workbookItems && item.workbookSettings) {
        setWorkbookItems(item.workbookItems);
        setWorkbookSettings(item.workbookSettings);
        navigateTo('workbook');
      }
      return;
    }
    if (item.activityType === ActivityType.INFOGRAPHIC_STUDIO) {
      setLoadedInfographicData(item.worksheetData);
      navigateTo('infographic-studio');
      return;
    }
    setSelectedActivity(item.activityType);
    setWorksheetData(item.worksheetData);
    setActiveWorksheet(item.id, item.name);
    if (item.styleSettings) setStyleSettings(item.styleSettings);
    if (item.studentProfile) {
      setStudentProfile(item.studentProfile);
      if (item.studentId) {
        const s = students.find((x: { id: string }) => x.id === item.studentId);
        if (s) setActiveStudent(s);
      }
    } else {
      setStudentProfile(null);
      setActiveStudent(null);
    }
    navigateTo('generator');
    setIsSidebarExpanded(true);
  };

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
    difficulty: 'Easy' | 'Medium' | 'Hard',
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
      const s = students.find((x: any) => x.id === studentId);
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

  const handleAddToWorkbookGeneral = (activityType: ActivityType, data: any) => {
    if (activityType && data) {
      const dataArray = Array.isArray(data) ? data : [data];
      const newItems: CollectionItem[] = dataArray.map((sheet: any) => ({
        id: crypto.randomUUID(),
        activityType: activityType,
        data: sheet,
        settings: { ...styleSettings },
        title: sheet.title || ACTIVITIES.find((a) => a.id === activityType)?.title || 'Etkinlik',
      }));
      setWorkbookItems((prev: CollectionItem[]) => [...prev, ...newItems]);
      const btn = document.getElementById('add-to-wb-btn');
      if (btn) {
        btn.classList.add('scale-125', 'bg-green-500', 'text-white');
        setTimeout(() => btn.classList.remove('scale-125', 'bg-green-500', 'text-white'), 300);
      }
    }
  };
  const handleAddToWorkbook = () => {
    if (selectedActivity && worksheetData)
      handleAddToWorkbookGeneral(selectedActivity, worksheetData);
  };
  const handleAddDirectToWorkbook = (item: CollectionItem) => {
    const newItems: CollectionItem[] = [
      {
        id: crypto.randomUUID(),
        activityType: item.activityType,
        data: item.data,
        settings: { ...styleSettings, ...item.settings },
        title: item.title,
      },
    ];
    setWorkbookItems((prev: CollectionItem[]) => [...prev, ...newItems]);
  };

  const handleOCRResult = (result: any) => {
    setSelectedActivity(ActivityType.OCR_CONTENT);
    setWorksheetData(result);
    navigateTo('generator');
    setIsSidebarExpanded(true);
  };
  const handleAutoGenerateWorkbook = async (report: AssessmentReport) => {
    setIsLoading(true);
    navigateTo('workbook');
    const newItems: CollectionItem[] = [];
    const defaultOptions: GeneratorOptions = {
      mode: 'fast',
      difficulty: 'Orta',
      worksheetCount: 1,
      itemCount: 10,
      gridSize: 10,
      operationType: 'mixed',
      numberRange: '1-20',
    };
    try {
      const reportItem: CollectionItem = {
        id: crypto.randomUUID(),
        activityType: ActivityType.ASSESSMENT_REPORT,
        data: {
          id: 'temp-report',
          userId: user?.id || 'guest',
          studentName: studentProfile?.name || 'Öğrenci',
          gender: 'Erkek',
          age: 7,
          grade: studentProfile?.grade || '1. Sınıf',
          createdAt: new Date().toISOString(),
          report: report,
        } as unknown as Record<string, unknown>,
        settings: { ...styleSettings, showStudentInfo: false, showFooter: false },
        title: `Rapor: ${studentProfile?.name || 'Öğrenci'}`,
      };
      newItems.push(reportItem);
      for (const roadItem of report.roadmap) {
        const activityId = roadItem.activityId as ActivityType;
        const pascalName = activityId
          .toLowerCase()
          .split('_')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join('');
        const generatorName = `generateOffline${pascalName}`;
        const generator = (offlineGenerators as any)[generatorName];
        if (generator) {
          try {
            const generatedData = await generator(defaultOptions);
            generatedData.forEach((sheet: any) => {
              newItems.push({
                id: crypto.randomUUID(),
                activityType: activityId,
                data: sheet,
                settings: { ...styleSettings },
                title: ACTIVITIES.find((a) => a.id === activityId)?.title || activityId,
              });
            });
          } catch (genErr) {
            logError(`Failed to auto-generate ${activityId}`, genErr);
          }
        }
      }
      setWorkbookItems(newItems);
      setWorkbookSettings((prev: WorkbookSettings) => ({
        ...prev,
        title: `Kişisel Gelişim Planı`,
        studentName: studentProfile?.name || '',
        teacherNote:
          'Bu kitapçık, yapılan değerlendirme sonucunda belirlenen ihtiyaçlara yönelik olarak yapay zeka tarafından otomatik oluşturulmuştur.',
      }));
    } catch (_e) {
      toast.error('Otomatik kitaçık oluşturulurken bir hata meydana geldi.');
    } finally {
      setIsLoading(false);
    }
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

  return (
    <div
      className={`flex flex-col h-screen bg-[var(--bg-primary)] font-sans transition-colors duration-300 ${styleSettings.orientation === 'landscape' ? 'app-orientation-landscape' : 'app-orientation-portrait'}`}
    >
      <AppHeader
        workbookItemsCount={workbookItems.length}
        unreadCount={unreadCount}
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
          className={`transition-all duration-500 ease-in-out h-full relative group/sidebar-container ${zenMode || currentView === 'workbook' || currentView === 'assessment' ? 'w-0 opacity-0 pointer-events-none' : 'opacity-100'}`}
          style={{
            width:
              zenMode || currentView === 'workbook' || currentView === 'assessment'
                ? 0
                : sidebarWidth,
          }}
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
            onOpenOCR={() => handleOpenStudio('ocr')}
            onOpenCurriculum={() => handleOpenStudio('curriculum')}
            onOpenReadingStudio={() => handleOpenStudio('reading-studio')}
            onOpenMathStudio={() => handleOpenStudio('math-studio')}
            onOpenSuperTurkce={() => handleOpenStudio('super-turkce')}
            onOpenInfographicStudio={() => handleOpenStudio('infographic-studio')}
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
            setWorksheetData={setWorksheetData}
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

          {/* SPECIAL RENDER FOR STUDIOS WHEN IN THAT VIEW - MOVED INSIDE CONTENT CONTAINER */}
          <AnimatePresence mode="wait">
            {[
              'curriculum',
              'reading-studio',
              'math-studio',
              'super-turkce',
              'activity-studio',
              'infographic-studio',
              'ocr',
              'profile',
              'students',
              'messages',
              'admin',
              'screening',
              'sinav-studyosu',
              'mat-sinav-studyosu',
              'sari-kitap-studio',
              'kelime-cumle-studio',
            ].includes(currentView) && (
                <motion.div
                  key={currentView}
                  className={`absolute inset-0 bg-[var(--bg-primary)] overflow-hidden ${currentView === 'admin' ? 'z-[75]' : 'z-[60]'}`}
                  variants={pageTransition}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <Suspense fallback={<LoadingSpinner />}>
                    {currentView === 'curriculum' && (
                      <CurriculumView
                        onBack={handleGoBack}
                        onSelectActivity={handleSelectActivity as any}
                        onStartCurriculumActivity={handleStartCurriculumActivity}
                        initialPlan={loadedCurriculum}
                        preFillData={screeningPlanData}
                      />
                    )}
                    {currentView === 'reading-studio' && (
                      <ReadingStudio
                        onBack={handleGoBack}
                        onAddToWorkbook={handleAddToWorkbookGeneral as any}
                      />
                    )}
                    {currentView === 'math-studio' && (
                      <MathStudio
                        onBack={handleGoBack}
                        onAddToWorkbook={handleAddToWorkbookGeneral as any}
                      />
                    )}
                    {currentView === 'super-turkce' && <SuperStudio />}
                    {currentView === 'activity-studio' && (
                      <ActivityStudio
                        onBack={handleGoBack}
                        onAddToWorkbook={handleAddToWorkbookGeneral as any}
                      />
                    )}
                    {currentView === 'infographic-studio' && (
                      <InfographicStudio
                        onBack={() => {
                          setLoadedInfographicData(null);
                          handleGoBack();
                        }}
                        onSave={addSavedWorksheet}
                        onAddToWorkbook={handleAddToWorkbookGeneral as any}
                        initialData={loadedInfographicData}
                      />
                    )}
                    {currentView === 'ocr' && (
                      <OCRScanner onBack={handleGoBack} onResult={handleOCRResult} />
                    )}
                    {currentView === 'profile' && (
                      <ProfileView
                        onBack={handleGoBack}
                        onSelectActivity={handleSelectActivity}
                        onLoadSaved={loadSavedWorksheet}
                        theme={theme}
                        uiSettings={uiSettings}
                        onUpdateTheme={(t: AppTheme) => setTheme(t)}
                        onUpdateUiSettings={(s: UiSettings) => updateUiSettings(s)}
                        onOpenSettingsModal={() => setOpenModal('settings')}
                      />
                    )}
                    {currentView === 'students' && (
                      <StudentDashboard onBack={handleGoBack} onLoadMaterial={loadSavedWorksheet} />
                    )}
                    {currentView === 'messages' && <MessagesView onBack={handleGoBack} />}
                    {currentView === 'admin' && <AdminDashboard onBack={handleGoBack} />}
                    {currentView === 'screening' && (
                      <ScreeningModule
                        onBack={handleGoBack}
                        onSelectActivity={handleSelectActivity}
                        onAddToWorkbook={handleAddToWorkbookGeneral as any}
                        onGeneratePlan={(n: string, a: number, w: string[], c?: string) =>
                          handleGeneratePlanFromScreening(n, a, w, c)
                        }
                      />
                    )}
                    {currentView === 'sinav-studyosu' && (
                      <SinavStudyosu onAddToWorkbook={handleAddToWorkbookGeneral as any} />
                    )}
                    {currentView === 'mat-sinav-studyosu' && (
                      <MatSinavStudyosu onAddToWorkbook={handleAddToWorkbookGeneral as any} />
                    )}
                    {currentView === 'sari-kitap-studio' && (
                      <SariKitapStudio
                        onBack={handleGoBack}
                        onAddToWorkbook={handleAddToWorkbookGeneral as any}
                      />
                    )}
                    {currentView === 'kelime-cumle-studio' && (
                      <KelimeCumleStudio
                        onBack={handleGoBack}
                        onAddToWorkbook={handleAddToWorkbookGeneral as any}
                      />
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
      <Modal isOpen={openModal === 'about'} onClose={() => setOpenModal(null)} title="Hakkımızda">
        <div className="text-center space-y-6">
          <DyslexiaLogo className="h-16 w-auto mx-auto" />
          <div className="space-y-4 text-zinc-600 dark:text-zinc-300">
            <p className="leading-relaxed">
              Bursa Disleksi AI, özel öğrenme güçlüğü yaşayan bireylerin eğitim süreçlerini
              desteklemek, eğitmen ve ailelere kişiselleştirilmiş, bilimsel temelli materyaller
              sunmak amacıyla geliştirilmiş yeni nesil bir yapay zeka platformudur.
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
