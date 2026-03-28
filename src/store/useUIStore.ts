import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UiSettings, StyleSettings, AppTheme } from '../types';

export interface UIStoreState {
  theme: AppTheme;
  sidebarWidth: number;
  zenMode: boolean;
  isSidebarOpen: boolean;
  isTourActive: boolean;
  uiSettings: UiSettings;
  styleSettings: StyleSettings;
  showDeveloperModal: boolean;

  // Actions
  setTheme: (theme: AppTheme) => void;
  setSidebarWidth: (width: number) => void;
  setZenMode: (enabled: boolean) => void;
  setIsSidebarOpen: (isOpen: boolean) => void;
  setIsTourActive: (isActive: boolean) => void;
  updateUiSettings: (settings: Partial<UiSettings>) => void;
  updateStyleSettings: (settings: Partial<StyleSettings>) => void;
  setShowDeveloperModal: (show: boolean) => void;
}

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

const initialUiSettings: UiSettings = {
  fontFamily: 'Lexend',
  fontSizeScale: 1,
  letterSpacing: 'normal',
  lineHeight: 1.6,
  saturation: 100,
  compactMode: false,
  premiumIntensity: 60,
  contrastLevel: 50,
};

// theme, sidebarWidth ve uiSettings gibi değerleri persist edeceğiz.
export const useUIStore = create<UIStoreState>()(
  persist(
    (set) => ({
      theme: 'anthracite' as AppTheme,
      sidebarWidth: 320,
      zenMode: false,
      isSidebarOpen: false,
      isTourActive: false,
      uiSettings: initialUiSettings,
      styleSettings: initialStyleSettings,
      showDeveloperModal: false,

      setTheme: (theme) => set({ theme }),
      setSidebarWidth: (sidebarWidth) => set({ sidebarWidth }),
      setZenMode: (zenMode) => set({ zenMode }),
      setIsSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
      setIsTourActive: (isTourActive) => set({ isTourActive }),
      updateUiSettings: (newSettings) =>
        set((state: UIStoreState) => ({ uiSettings: { ...state.uiSettings, ...newSettings } })),
      updateStyleSettings: (newSettings) =>
        set((state: UIStoreState) => ({
          styleSettings: { ...state.styleSettings, ...newSettings },
        })),
      setShowDeveloperModal: (show) => set({ showDeveloperModal: show }),
    }),
    {
      name: 'app-ui-storage', // localStorage key
      partialize: (state: UIStoreState) => ({
        theme: state.theme,
        sidebarWidth: state.sidebarWidth,
        uiSettings: state.uiSettings,
      }),
    }
  )
);
