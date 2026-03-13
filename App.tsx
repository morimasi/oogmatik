// @ts-nocheck
import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
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
  ActiveCurriculumSession,
} from './types';
import Sidebar from './components/Sidebar';
import ContentArea from './components/ContentArea';
import { ACTIVITIES, ACTIVITY_CATEGORIES } from './constants';
import DyslexiaLogo from './components/DyslexiaLogo';
import GlobalSearch from './components/GlobalSearch';
import { FeedbackModal } from './components/FeedbackModal';
import { AuthModal } from './components/AuthModal';
import { messagingService } from './services/messagingService';
import { worksheetService } from './services/worksheetService';
import { curriculumService } from './services/curriculumService';
import { SettingsModal } from './components/SettingsModal';
import { TourGuide, TourStep } from './components/TourGuide';
import { loadCurrentUserPaperSize } from './services/paperSizeApi';
import { usePaperSizeStore } from './store/usePaperSizeStore';
import { PaperSize } from './utils/printService';
import { StudentInfoModal } from './components/StudentInfoModal';
import { HistoryView } from './components/HistoryView';
import { PaperSizeInitializer } from './components/PaperSizeInitializer';
import { useAuthStore } from './store/useAuthStore';
import { AssessmentReportViewer } from './components/AssessmentReportViewer';
import * as offlineGenerators from './services/offlineGenerators';

// Lazy Loaded Components
const ProfileView = lazy(() =>
  import('./components/ProfileView').then((module) => ({ default: module.ProfileView }))
);
const AdminDashboard = lazy(() =>
  import('./components/AdminDashboard').then((module) => ({ default: module.AdminDashboard }))
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
const AssessmentModule = lazy(() =>
  import('./components/AssessmentModule').then((module) => ({ default: module.AssessmentModule }))
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
};

const initialUiSettings: UiSettings = {
  fontFamily: 'Lexend',
  fontSizeScale: 1,
  letterSpacing: 'normal',
  lineHeight: 1.6,
  saturation: 100,
};

type ModalType = 'settings' | 'history' | 'about' | 'developer';
type ExtendedView =
  | View
  | 'ocr'
  | 'curriculum'
  | 'reading-studio'
  | 'math-studio'
  | 'students'
  | 'assessment'
  | 'screening'
  | 'profile';

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
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <div
        className="bg-[var(--bg-paper)] rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar relative border border-[var(--border-color)]"
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)]">
            <h2 className="text-xl font-black text-[var(--accent-color)] tracking-tight">
              {title}
            </h2>
            <button
              onClick={(e) => {
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

const DeveloperModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <div
        className="bg-[var(--bg-primary)] rounded-[2.5rem] shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto custom-scrollbar relative border border-[var(--border-color)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Background */}
        <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-br from-[var(--accent-color)] to-[var(--accent-hover)] rounded-t-[2.5rem] overflow-hidden opacity-90">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
          ></div>
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[var(--bg-primary)] to-transparent"></div>
        </div>

        {/* Close Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors z-10 backdrop-blur-md"
        >
          <i className="fa-solid fa-times text-lg"></i>
        </button>

        <div className="relative pt-12 px-6 sm:px-12 pb-12">
          {/* Developer Avatar & Intro */}
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-12 relative z-10">
            <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-white dark:border-[#09090b] shadow-xl shrink-0 bg-white">
              {/* Varsayılan avatar yerine modern bir icon veya gerçek bir geliştirici fotosu konabilir */}
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=developer"
                alt="Developer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-center md:text-left flex-1">
              <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white tracking-tighter mb-2">
                Bursa Disleksi Geliştirici Ekibi
              </h2>
              <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest flex items-center justify-center md:justify-start gap-2">
                <i className="fa-solid fa-code text-indigo-500"></i> AI & Eğitim Teknolojileri
              </p>
            </div>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-800 shadow-sm border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 hover:border-indigo-200 transition-all hover:-translate-y-1"
              >
                <i className="fa-brands fa-github text-xl"></i>
              </a>
              <a
                href="#"
                className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-800 shadow-sm border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-blue-600 hover:border-blue-200 transition-all hover:-translate-y-1"
              >
                <i className="fa-brands fa-linkedin text-xl"></i>
              </a>
              <a
                href="mailto:iletisim@bursadisleksi.com"
                className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-800 shadow-sm border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-rose-600 hover:border-rose-200 transition-all hover:-translate-y-1"
              >
                <i className="fa-solid fa-envelope text-xl"></i>
              </a>
            </div>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Mission */}
            <div className="md:col-span-2 bg-white dark:bg-zinc-800 p-8 rounded-[2rem] border border-zinc-200 dark:border-zinc-700 shadow-sm hover:shadow-lg transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-full transition-transform group-hover:scale-110"></div>
              <div className="flex items-center gap-4 mb-6 relative">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 flex items-center justify-center text-xl">
                  <i className="fa-solid fa-rocket"></i>
                </div>
                <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest">
                  Vizyonumuz
                </h3>
              </div>
              <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed relative">
                Amacımız, özel eğitim ihtiyacı olan bireyler için{' '}
                <strong>yapay zeka destekli</strong>, kişiselleştirilmiş ve bilimsel temellere
                dayanan araçlar üreterek öğrenme süreçlerini hızlandırmak ve eğitimcilerin yükünü
                hafifletmektir. Teknoloji ve pedagojiyi harmanlayarak fırsat eşitliği sunmayı
                hedefliyoruz.
              </p>
            </div>

            {/* Version Info */}
            <div className="bg-white dark:bg-zinc-800 p-8 rounded-[2rem] border border-zinc-200 dark:border-zinc-700 shadow-sm flex flex-col justify-center items-center text-center group">
              <div className="w-20 h-20 rounded-full bg-zinc-50 dark:bg-zinc-900 border-4 border-white dark:border-zinc-800 shadow-inner flex items-center justify-center mb-4 group-hover:rotate-180 transition-transform duration-700">
                <i className="fa-solid fa-microchip text-3xl text-zinc-400"></i>
              </div>
              <div className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter mb-1">
                v2.4.0
              </div>
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest bg-zinc-100 dark:bg-zinc-900 px-3 py-1 rounded-full">
                Güncel Sürüm
              </div>
            </div>

            {/* Tech Stack */}
            <div className="md:col-span-3 bg-white dark:bg-zinc-800 p-8 rounded-[2rem] border border-zinc-200 dark:border-zinc-700 shadow-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-xl">
                  <i className="fa-solid fa-layer-group"></i>
                </div>
                <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest">
                  Kullanılan Teknolojiler
                </h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                {[
                  { name: 'React', icon: 'fa-brands fa-react text-blue-500' },
                  { name: 'TypeScript', icon: 'fa-brands fa-js text-blue-600' },
                  { name: 'Tailwind', icon: 'fa-solid fa-wind text-cyan-500' },
                  { name: 'Firebase', icon: 'fa-solid fa-fire text-yellow-500' },
                  { name: 'OpenAI', icon: 'fa-solid fa-brain text-emerald-500' },
                  { name: 'Node.js', icon: 'fa-brands fa-node-js text-green-600' },
                ].map((tech) => (
                  <div
                    key={tech.name}
                    className="flex flex-col items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-colors"
                  >
                    <i className={`${tech.icon} text-3xl mb-3`}></i>
                    <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                      {tech.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 text-center border-t border-zinc-200 dark:border-zinc-800 pt-8">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
              &copy; {new Date().getFullYear()} Bursa Disleksi. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

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

const HeaderDropdown = ({
  label,
  icon,
  children,
  colorClass = 'text-[var(--text-secondary)]',
}: {
  label: string;
  icon: string;
  children?: any;
  colorClass?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all hover:bg-[var(--surface-glass)] font-bold text-xs uppercase tracking-wider ${colorClass}`}
      >
        <i className={`fa-solid ${icon}`}></i>
        <span className="hidden xl:inline">{label}</span>
        <i className="fa-solid fa-chevron-down text-[8px] opacity-50"></i>
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full pt-2 z-50 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="bg-[var(--panel-bg)] border border-[var(--border-color)] rounded-2xl shadow-2xl p-2 min-w-[200px] overflow-hidden backdrop-blur-xl ring-1 ring-white/5">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

const DropdownItem = ({
  icon,
  label,
  onClick,
  badge,
}: {
  icon: string;
  label: string;
  onClick?: () => void;
  badge?: number;
}) => (
  <button
    onClick={(e) => {
      e.stopPropagation();
      if (onClick && typeof onClick === 'function') {
        onClick();
      }
    }}
    className="w-full flex items-center justify-between px-4 py-3 hover:bg-[var(--surface-glass)] rounded-xl transition-colors group"
  >
    <div className="flex items-center gap-3">
      <i
        className={`fa-solid ${icon} w-4 text-center text-[var(--text-muted)] group-hover:text-[var(--accent-color)] transition-colors`}
      ></i>
      <span className="text-xs font-bold text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">
        {label}
      </span>
    </div>
    {badge !== undefined && badge > 0 && (
      <span className="bg-[var(--accent-color)] text-[var(--bg-primary)] text-[9px] font-black px-1.5 py-0.5 rounded-full">
        {badge}
      </span>
    )}
  </button>
);

import { useAuthStore } from './store/useAuthStore';
import { useStudentStore } from './store/useStudentStore';
import { useAppStore } from './store/useAppStore';

const AppContent = () => {
  const authStore = useAuthStore();
  const studentStore = useStudentStore();
  const { isEditMode, zoomScale } = useAppStore();

  // Global PaperSize initialization glue to App root (to be implemented in root-level effect later)

  // Global Initialization
  useEffect(() => {
    const unsubscribeAuth = authStore.initialize();
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!authStore.user) return;
    const unsubscribeStudents = studentStore.fetchStudents(authStore.user.id);
    return () => unsubscribeStudents();
  }, [authStore.user]);

  const { user, logout } = authStore;
  const { activeStudent, setActiveStudent, students } = studentStore;

  const [currentView, setCurrentView] = useState('generator' as ExtendedView);
  const [viewHistory, setViewHistory] = useState([] as ExtendedView[]);
  const [selectedActivity, setSelectedActivity] = useState(null as ActivityType | null);
  const [worksheetData, setWorksheetData] = useState(null as WorksheetData);
  const [isLoading, setIsLoading] = useState(false as boolean);
  const [error, setError] = useState(null as string | null);
  const [activeCurriculumSession, setActiveCurriculumSession] = useState(
    null as ActiveCurriculumSession | null
  );
  const [loadedCurriculum, setLoadedCurriculum] = useState(null as Curriculum | null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    try {
      const stored = localStorage.getItem('app-sidebar-width');
      return stored ? parseInt(stored) : 320;
    } catch (e) {
      return 320;
    }
  });
  const [zenMode, setZenMode] = useState(false);
  const [openModal, setOpenModal] = useState(null as ModalType | null);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isTourOpen, setIsTourOpen] = useState(false);
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

  const [theme, setTheme] = useState(
    (() => {
      try {
        const storedTheme = localStorage.getItem('app-theme');
        return (storedTheme as AppTheme) || 'anthracite';
      } catch (e) {
        return 'anthracite';
      }
    })() as AppTheme
  );
  const [uiSettings, setUiSettings] = useState(
    (() => {
      try {
        const stored = localStorage.getItem('app-ui-settings');
        return stored ? { ...initialUiSettings, ...JSON.parse(stored) } : initialUiSettings;
      } catch (e) {
        return initialUiSettings;
      }
    })() as UiSettings
  );

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

    localStorage.setItem('app-ui-settings', JSON.stringify(uiSettings));
  }, [uiSettings]);

  // Theme effect
  useEffect(() => {
    // Handle basic dark/light first
    if (
      theme === 'dark' ||
      theme === 'anthracite' ||
      theme === 'space' ||
      theme.includes('anthracite')
    ) {
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
      'theme-anthracite-cyber'
    );
    // Add selected theme class
    document.documentElement.classList.add(`theme-${theme}`);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', `${sidebarWidth}px`);
    localStorage.setItem('app-sidebar-width', sidebarWidth.toString());
  }, [sidebarWidth]);
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

  const navigateTo = (view: ExtendedView) => {
    if (currentView === view) return;
    setViewHistory((prev: ExtendedView[]) => [...prev, currentView]);
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

  // --- NAVIGATION HELPERS (Resets state before switching view) ---
  const handleOpenStudio = (viewName: ExtendedView) => {
    setSelectedActivity(null);
    setWorksheetData(null);
    setActiveCurriculumSession(null);
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
  const addToHistory = (activityType: ActivityType, data: SingleWorksheetData[]) => {
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
      await worksheetService.saveWorksheet(
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
      alert(`Etkinlik "${name}" adıyla arşivinize kaydedildi.`);
    } catch (e: any) {
      alert(`Kaydedilirken bir hata oluştu: ${e.message}.`);
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
    setSelectedActivity(item.activityType);
    setWorksheetData(item.worksheetData);
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
      alert('Harika! Aktivite tamamlandı ve plana işlendi.');
    } catch (e) {
      alert('Bir hata oluştu.');
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
        } as SavedAssessment,
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
            console.error(`Failed to auto-generate ${activityId}`, genErr);
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
    } catch (e) {
      alert('Otomatik kitapçık oluşturulurken bir hata meydana geldi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[var(--bg-primary)] font-sans transition-colors duration-300">
      <header
        className={`relative bg-[var(--bg-paper)]/80 backdrop-blur-md border-b border-[var(--border-color)] shadow-sm z-50 transition-all duration-500 ${zenMode ? '-mt-24 opacity-0 pointer-events-none' : 'mt-0 opacity-100'}`}
      >
        <div className="w-full px-6 py-4 flex justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden text-[var(--text-muted)] p-2 hover:text-[var(--text-primary)] transition-colors"
            >
              <i className="fa-solid fa-bars-staggered fa-lg"></i>
            </button>
            <button
              id="tour-logo"
              onClick={() => {
                navigateTo('generator');
                setSelectedActivity(null);
                setWorksheetData(null);
                setActiveCurriculumSession(null);
              }}
              className="flex items-center gap-3"
            >
              <DyslexiaLogo className="h-10 w-auto" />
            </button>
          </div>

          <div className="flex-1 max-w-xl hidden md:block">
            <GlobalSearch onSelectActivity={handleSelectActivity} />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenStudio('assessment')}
              className="hidden sm:flex items-center gap-2 px-6 py-2.5 bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-[var(--bg-primary)] rounded-2xl text-xs font-black shadow-lg transition-all active:scale-95"
            >
              <i className="fa-solid fa-user-doctor"></i> DEĞERLENDİRME
            </button>

            <button
              onClick={() => handleOpenStudio('students')}
              className="hidden lg:flex items-center gap-2 px-6 py-2.5 bg-[var(--surface-glass)] hover:bg-[var(--accent-muted)] text-[var(--accent-color)] rounded-2xl text-xs font-black shadow-sm transition-all active:scale-95 border border-[var(--border-color)]"
            >
              <i className="fa-solid fa-user-graduate"></i> ÖĞRENCİLERİM
            </button>
            <div className="h-8 w-px bg-[var(--border-color)] mx-2"></div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => navigateTo('workbook')}
                className="relative p-2.5 text-[var(--text-muted)] hover:text-[var(--accent-color)] transition-all rounded-xl hover:bg-[var(--accent-muted)]"
                title="Kitapçık"
              >
                <i className="fa-solid fa-book-medical fa-lg"></i>
                {workbookItems.length > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-[var(--accent-color)] text-[var(--bg-primary)] text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-[var(--bg-paper)]">
                    {workbookItems.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => navigateTo('messages')}
                className="relative p-2.5 text-[var(--text-muted)] hover:text-[var(--accent-color)] transition-all rounded-xl hover:bg-[var(--accent-muted)]"
                title="Mesajlar"
              >
                <i className="fa-solid fa-comment-dots fa-lg"></i>
                {unreadCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-red-500 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-[var(--bg-paper)]">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>

            <HeaderDropdown
              label="Kitaplığım"
              icon="fa-bookmark"
              colorClass="text-[var(--accent-color)]"
            >
              <DropdownItem
                icon="fa-heart"
                label="Favoriler"
                onClick={() => navigateTo('favorites')}
              />
              <DropdownItem
                icon="fa-box-archive"
                label="Arşiv"
                onClick={() => navigateTo('savedList')}
              />
              <DropdownItem
                icon="fa-share-nodes"
                label="Paylaşılanlar"
                onClick={() => navigateTo('shared')}
              />
              <DropdownItem
                icon="fa-clock-rotate-left"
                label="İşlem Geçmişi"
                onClick={() => setOpenModal('history')}
              />
            </HeaderDropdown>

            <HeaderDropdown label="Destek" icon="fa-circle-info">
              <DropdownItem
                icon="fa-circle-play"
                label="Tur Başlat"
                onClick={() => setIsTourOpen(true)}
              />
              <DropdownItem
                icon="fa-headset"
                label="Yardım Masası"
                onClick={() => setIsFeedbackOpen(true)}
              />
              <DropdownItem
                icon="fa-circle-question"
                label="Hakkımızda"
                onClick={() => setOpenModal('about')}
              />
              <DropdownItem
                icon="fa-laptop-code"
                label="Geliştirici"
                onClick={() => setOpenModal('developer')}
              />
            </HeaderDropdown>

            <div className="h-8 w-px bg-[var(--border-color)] mx-2"></div>

            {user ? (
              <HeaderDropdown
                label={user.name.split(' ')[0]}
                icon="fa-user-circle"
                colorClass="text-[var(--text-primary)]"
              >
                <DropdownItem
                  icon="fa-user-gear"
                  label="Profil Ayarları"
                  onClick={() => navigateTo('profile')}
                />
                <DropdownItem
                  icon="fa-sliders"
                  label="Görünüm Ayarları"
                  onClick={() => setOpenModal('settings')}
                />
                {user.role === 'admin' && (
                  <div className="h-px bg-[var(--border-color)] my-1"></div>
                )}
                {user.role === 'admin' && (
                  <DropdownItem
                    icon="fa-shield-halved"
                    label="Admin Paneli"
                    onClick={() => navigateTo('admin')}
                  />
                )}
                <div className="h-px bg-[var(--border-color)] my-1"></div>
                <DropdownItem
                  icon="fa-arrow-right-from-bracket"
                  label="Çıkış Yap"
                  onClick={async () => {
                    await logout();
                  }}
                />
              </HeaderDropdown>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-6 py-2.5 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-2xl text-xs font-black shadow-lg transition-all active:scale-95"
              >
                GİRİŞ YAP
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}
        <div
          className={`transition-all duration-500 ease-in-out h-full relative group/sidebar-container ${zenMode ? 'w-0 opacity-0 overflow-hidden' : ''}`}
          style={{ width: zenMode ? 0 : sidebarWidth, marginLeft: zenMode ? -sidebarWidth : 0 }}
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
            onOpenScreening={() => handleOpenStudio('screening')}
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
        </div>
      </div>

      {/* SPECIAL RENDER FOR STUDIOS WHEN IN THAT VIEW */}
      {currentView === 'curriculum' && (
        <div className="absolute inset-0 bg-white dark:bg-zinc-900 z-[60] overflow-hidden">
          <Suspense fallback={<LoadingSpinner />}>
            <CurriculumView
              onBack={handleGoBack}
              onSelectActivity={handleSelectActivity as any}
              onStartCurriculumActivity={handleStartCurriculumActivity}
              initialPlan={loadedCurriculum}
              preFillData={screeningPlanData}
            />
          </Suspense>
        </div>
      )}

      {currentView === 'reading-studio' && (
        <div className="absolute inset-0 bg-white dark:bg-zinc-900 z-[60] overflow-hidden">
          <Suspense fallback={<LoadingSpinner />}>
            <ReadingStudio
              onBack={handleGoBack}
              onAddToWorkbook={handleAddToWorkbookGeneral as any}
            />
          </Suspense>
        </div>
      )}

      {currentView === 'math-studio' && (
        <div className="absolute inset-0 bg-white dark:bg-zinc-900 z-[60] overflow-hidden">
          <Suspense fallback={<LoadingSpinner />}>
            <MathStudio onBack={handleGoBack} onAddToWorkbook={handleAddToWorkbookGeneral as any} />
          </Suspense>
        </div>
      )}

      {currentView === 'ocr' && (
        <div className="absolute inset-0 bg-white dark:bg-zinc-900 z-[60] overflow-hidden">
          <Suspense fallback={<LoadingSpinner />}>
            <OCRScanner onBack={handleGoBack} onResult={handleOCRResult} />
          </Suspense>
        </div>
      )}

      {currentView === 'profile' && (
        <div className="absolute inset-0 bg-white dark:bg-zinc-900 z-[60] overflow-hidden">
          <Suspense fallback={<LoadingSpinner />}>
            <ProfileView
              onBack={handleGoBack}
              onSelectActivity={handleSelectActivity}
              onLoadSaved={loadSavedWorksheet}
              theme={theme}
              uiSettings={uiSettings}
              onUpdateTheme={setTheme}
              onUpdateUiSettings={setUiSettings}
              onOpenSettingsModal={() => setOpenModal('settings')}
            />
          </Suspense>
        </div>
      )}

      {currentView === 'students' && (
        <div className="absolute inset-0 bg-white dark:bg-zinc-900 z-[60] overflow-hidden">
          <Suspense fallback={<LoadingSpinner />}>
            <StudentDashboard onBack={handleGoBack} onLoadMaterial={loadSavedWorksheet} />
          </Suspense>
        </div>
      )}

      {currentView === 'messages' && (
        <div className="absolute inset-0 bg-white dark:bg-zinc-900 z-[60] overflow-hidden">
          <Suspense fallback={<LoadingSpinner />}>
            <MessagesView onBack={handleGoBack} />
          </Suspense>
        </div>
      )}

      {/* Admin view is special, keeps its own context */}
      {currentView === 'admin' && (
        <div className="absolute inset-0 bg-white dark:bg-zinc-900 z-[70] overflow-hidden">
          <Suspense fallback={<LoadingSpinner />}>
            <AdminDashboard onBack={handleGoBack} />
          </Suspense>
        </div>
      )}

      {/* Assessment and Screening run inside ContentArea via currentView prop, but need special handling in ContentArea */}
      {currentView === 'screening' && (
        <div className="absolute inset-0 bg-white dark:bg-zinc-900 z-[60] overflow-hidden">
          <Suspense fallback={<LoadingSpinner />}>
            <ScreeningModule
              onBack={handleGoBack}
              onSelectActivity={handleSelectActivity}
              onAddToWorkbook={handleAddToWorkbookGeneral as any}
              onGeneratePlan={(n: string, a: number, w: string[], c?: string) =>
                handleGeneratePlanFromScreening(n, a, w, c)
              }
            />
          </Suspense>
        </div>
      )}

      <TourGuide steps={tourSteps} isOpen={isTourOpen} onClose={() => setIsTourOpen(false)} />
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        activityType={selectedActivity}
        activityTitle={
          selectedActivity ? ACTIVITIES.find((a) => a.id === selectedActivity)?.title : undefined
        }
      />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
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
        onUpdateUiSettings={setUiSettings}
        theme={theme}
        onUpdateTheme={setTheme}
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
    </div>
  );
};

export const App = () => {
  return (
    <>
      <PaperSizeInitializer />
      <AppContent />
    </>
  );
};
