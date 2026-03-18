import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'high-contrast' | 'warm' | 'cool';
export type DyslexiaFont =
  | 'OpenDyslexic'
  | 'Lexend'
  | 'Atkinson Hyperlegible'
  | 'Comic Sans MS'
  | 'System';

export interface DyslexiaSettings {
  fontFamily: DyslexiaFont;
  lineHeight: number; // e.g. 1.5, 1.75, 2.0
  letterSpacing: number; // percentage or px, e.g. 10 for 10%
  wordSpacing: number; // percentage or px, e.g. 10 for 10%
  fontSize: number; // base font size in px
}

export interface GlobalStoreState {
  theme: Theme;
  dyslexiaSettings: DyslexiaSettings;
  setTheme: (theme: Theme) => void;
  updateDyslexiaSettings: (settings: Partial<DyslexiaSettings>) => void;
}

export const useGlobalStore = create<GlobalStoreState>()(
  persist(
    (set) => ({
      theme: 'light',
      dyslexiaSettings: {
        fontFamily: 'OpenDyslexic',
        lineHeight: 1.75,
        letterSpacing: 10,
        wordSpacing: 10,
        fontSize: 16,
      },
      setTheme: (theme) => set({ theme }),
      updateDyslexiaSettings: (settings) =>
        set((state) => ({
          dyslexiaSettings: { ...state.dyslexiaSettings, ...settings },
        })),
    }),
    {
      name: 'oogmatik-global-store',
    }
  )
);
