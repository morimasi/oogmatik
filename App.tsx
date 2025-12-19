
import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { ActivityType, WorksheetData, SavedWorksheet, SingleWorksheetData, AppTheme, HistoryItem, StyleSettings, View, UiSettings, CollectionItem, WorkbookSettings, StudentProfile, AssessmentReport, GeneratorOptions, SavedAssessment, Curriculum, CurriculumActivityStatus } from './types';
import Sidebar from './components/Sidebar';
import ContentArea from './components/ContentArea';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './components/AuthModal';
import { StudentInfoModal } from './components/StudentInfoModal';
import { SettingsModal } from './components/SettingsModal';

// Lazy load components
const MathStudio = lazy(() => import('./components/MathStudio/MathStudio').then(module => ({ default: module.MathStudio })));
const ReadingStudio = lazy(() => import('./components/ReadingStudio/ReadingStudio').then(module => ({ default: module.ReadingStudio })));
const OCRScanner = lazy(() => import('./components/OCRScanner').then(module => ({ default: module.OCRScanner })));
const CurriculumView = lazy(() => import('./components/CurriculumView').then(module => ({ default: module.CurriculumView })));
const AdminDashboard = lazy(() => import('./components/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
const MessagesView = lazy(() => import('./components/MessagesView').then(module => ({ default: module.MessagesView })));

// Type extended view
type ExtendedView = View | 'ocr' | 'curriculum' | 'reading-studio' | 'math-studio';

// Internal App Content to use Auth Context
const AppContent = () => {
  // State definitions matching the errors
  const [currentView, setCurrentView] = useState<ExtendedView>('generator');
  const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(null);
  const [worksheetData, setWorksheetData] = useState<WorksheetData>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [zenMode, setZenMode] = useState(false);
  
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [styleSettings, setStyleSettings] = useState<StyleSettings>({ 
      fontSize: 16, scale: 1, borderColor: '#000', borderWidth: 1, margin: 20, columns: 1, gap: 10,
      orientation: 'portrait', themeBorder: 'simple', contentAlign: 'left', fontWeight: 'normal', fontStyle: 'normal',
      visualStyle: 'simple', showPedagogicalNote: true, showMascot: false, showStudentInfo: true,
      showTitle: true, showInstruction: true, showImage: true, showFooter: true, smartPagination: true,
      fontFamily: 'OpenDyslexic', lineHeight: 1.5, letterSpacing: 0
  });
  
  const [workbookItems, setWorkbookItems] = useState<CollectionItem[]>([]);
  const [workbookSettings, setWorkbookSettings] = useState<WorkbookSettings>({
       title: 'Çalışma Kitabım', studentName: '', schoolName: '', year: '2024-2025', teacherNote: '',
       theme: 'modern', accentColor: '#4f46e5', coverStyle: 'centered', showTOC: true, showPageNumbers: true,
       showWatermark: false, watermarkOpacity: 0.1, showBackCover: true
  });

  const [activeCurriculumSession, setActiveCurriculumSession] = useState<{ planId: string, day: number, activityId: string, activityTitle: string, studentName: string } | null>(null);
  
  // Auth & Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  // Handlers
  const handleSelectActivity = (id: ActivityType | null) => {
      setSelectedActivity(id);
      if (id) {
          // Reset data when changing activity? Maybe.
          // setWorksheetData(null); 
      }
  };

  const handleGoBack = () => {
      setCurrentView('generator');
      setSelectedActivity(null);
  };

  const navigateTo = (view: ExtendedView) => {
      setCurrentView(view);
      if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const addToHistory = (activityType: ActivityType, data: WorksheetData) => {
      // Implement history adding logic if needed locally, or assume Sidebar/Generator handles it via service
  };
  
  const handleCompleteCurriculumActivity = () => {
      if (activeCurriculumSession) {
          // Logic to complete activity
          setActiveCurriculumSession(null);
          navigateTo('curriculum');
      }
  };

  // Render Logic
  if (currentView === 'math-studio') return (
      <Suspense fallback={<div className="flex items-center justify-center h-screen"><i className="fa-solid fa-circle-notch fa-spin text-4xl text-indigo-600"></i></div>}>
          <MathStudio onBack={handleGoBack} />
      </Suspense>
  );

  if (currentView === 'reading-studio') return (
      <Suspense fallback={<div className="flex items-center justify-center h-screen"><i className="fa-solid fa-circle-notch fa-spin text-4xl text-indigo-600"></i></div>}>
          <ReadingStudio onBack={handleGoBack} />
      </Suspense>
  );

  if (currentView === 'ocr') return (
       <Suspense fallback={<div className="flex items-center justify-center h-screen"><i className="fa-solid fa-circle-notch fa-spin text-4xl text-indigo-600"></i></div>}>
          <OCRScanner onBack={handleGoBack} onResult={() => {}} />
      </Suspense>
  );

  if (currentView === 'curriculum') return (
      <Suspense fallback={<div className="flex items-center justify-center h-screen"><i className="fa-solid fa-circle-notch fa-spin text-4xl text-indigo-600"></i></div>}>
          <CurriculumView 
              onBack={handleGoBack} 
              onSelectActivity={(id) => { setSelectedActivity(id as ActivityType); setCurrentView('generator'); }} 
              onStartCurriculumActivity={(planId, day, activityId, activityType, studentName, title) => {
                  // Setup session and go to generator
                  setActiveCurriculumSession({ planId, day, activityId, activityTitle: title, studentName });
                  setSelectedActivity(activityType as ActivityType);
                  setCurrentView('generator');
              }}
          />
      </Suspense>
  );

    if (currentView === 'admin') return (
      <Suspense fallback={<div className="flex items-center justify-center h-screen"><i className="fa-solid fa-circle-notch fa-spin text-4xl text-indigo-600"></i></div>}>
          <AdminDashboard onBack={handleGoBack} />
      </Suspense>
  );

    if (currentView === 'messages') return (
      <Suspense fallback={<div className="flex items-center justify-center h-screen"><i className="fa-solid fa-circle-notch fa-spin text-4xl text-indigo-600"></i></div>}>
          <MessagesView onBack={handleGoBack} />
      </Suspense>
  );


  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white font-sans transition-colors duration-300">
        {/* Sidebar */}
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

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0 relative">
             {/* Header / Mobile Toggle - assuming included in ContentArea or separate */}
             <ContentArea 
                currentView={currentView as View}
                onBackToGenerator={handleGoBack}
                activityType={selectedActivity}
                worksheetData={worksheetData}
                isLoading={isLoading}
                error={error}
                styleSettings={styleSettings}
                onStyleChange={setStyleSettings}
                onSave={() => {}}
                onLoadSaved={(saved) => { setWorksheetData(saved.worksheetData); setSelectedActivity(saved.activityType); }}
                onFeedback={() => {}}
                onOpenAuth={() => setIsAuthModalOpen(true)}
                onSelectActivity={handleSelectActivity}
                workbookItems={workbookItems}
                setWorkbookItems={setWorkbookItems}
                workbookSettings={workbookSettings}
                setWorkbookSettings={setWorkbookSettings}
                onAddToWorkbook={() => {}}
                onAutoGenerateWorkbook={() => {}}
                studentProfile={studentProfile}
                zenMode={zenMode}
                toggleZenMode={() => setZenMode(!zenMode)}
                activeCurriculumSession={activeCurriculumSession}
                onCompleteCurriculumActivity={handleCompleteCurriculumActivity}
             />
        </div>

        {/* Modals */}
        <StudentInfoModal 
            isOpen={isStudentModalOpen} 
            onClose={() => setIsStudentModalOpen(false)} 
            currentProfile={studentProfile} 
            onSave={setStudentProfile}
            onClear={() => setStudentProfile(null)}
        />
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
};

export const App = () => {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
};
