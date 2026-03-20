import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  DEFAULT_DYSLEXIA_SETTINGS,
  DYSLEXIA_FONTS,
  CONTRAST_THEMES,
  type FontFamilyKey,
  type ContrastTheme,
} from '../constants/pdfConfig';

export interface DyslexiaSettings {
  dyslexiaMode: boolean;
  fontFamily: FontFamilyKey;
  highContrast: boolean;
  contrastTheme: ContrastTheme;
  lineHeight: number;
  letterSpacing: number;
  fontSize: number;
}

export interface UseDyslexiaSettingsReturn {
  settings: DyslexiaSettings;
  toggleDyslexiaMode: () => void;
  setFontFamily: (font: FontFamilyKey) => void;
  toggleHighContrast: () => void;
  setContrastTheme: (theme: ContrastTheme) => void;
  setLineHeight: (value: number) => void;
  setLetterSpacing: (value: number) => void;
  setFontSize: (size: number) => void;
  resetSettings: () => void;
  cssVars: React.CSSProperties;
  containerClasses: string;
}

const STORAGE_KEY = 'oogmatik-dyslexia-settings';

function loadSettings(): DyslexiaSettings {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return { ...DEFAULT_DYSLEXIA_SETTINGS, ...JSON.parse(saved) };
  } catch {
    /* ignore localStorage errors */
  }
  return { ...DEFAULT_DYSLEXIA_SETTINGS };
}

export function useDyslexiaSettings(
  initialOverrides?: Partial<DyslexiaSettings>,
): UseDyslexiaSettingsReturn {
  const [settings, setSettings] = useState<DyslexiaSettings>(() => ({
    ...loadSettings(),
    ...initialOverrides,
  }));

  /* ─── Ayarları localStorage'a kaydet ─── */
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      /* ignore */
    }
  }, [settings]);

  /* ─── Disleksi modu toggle ─── */
  const toggleDyslexiaMode = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      dyslexiaMode: !prev.dyslexiaMode,
      fontFamily: !prev.dyslexiaMode ? 'OpenDyslexic' : 'default',
      lineHeight: !prev.dyslexiaMode ? 1.8 : DEFAULT_DYSLEXIA_SETTINGS.lineHeight,
      letterSpacing: !prev.dyslexiaMode ? 1 : DEFAULT_DYSLEXIA_SETTINGS.letterSpacing,
    }));
  }, []);

  const setFontFamily = useCallback((font: FontFamilyKey) => {
    setSettings((prev) => ({ ...prev, fontFamily: font }));
  }, []);

  const toggleHighContrast = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      highContrast: !prev.highContrast,
      contrastTheme: !prev.highContrast ? 'highContrast' : 'default',
    }));
  }, []);

  const setContrastTheme = useCallback((theme: ContrastTheme) => {
    setSettings((prev) => ({
      ...prev,
      contrastTheme: theme,
      highContrast: theme !== 'default',
    }));
  }, []);

  const setLineHeight = useCallback((value: number) => {
    setSettings((prev) => ({ ...prev, lineHeight: Math.max(1, Math.min(value, 4)) }));
  }, []);

  const setLetterSpacing = useCallback((value: number) => {
    setSettings((prev) => ({ ...prev, letterSpacing: Math.max(0, Math.min(value, 10)) }));
  }, []);

  const setFontSize = useCallback((size: number) => {
    setSettings((prev) => ({ ...prev, fontSize: Math.max(10, Math.min(size, 32)) }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings({ ...DEFAULT_DYSLEXIA_SETTINGS });
  }, []);

  /* ─── CSS değişkenleri hesapla ─── */
  const cssVars: React.CSSProperties = useMemo(() => {
    const fontDef = DYSLEXIA_FONTS[settings.fontFamily];
    const themeDef = CONTRAST_THEMES[settings.contrastTheme];
    return {
      '--pdf-font-family': fontDef.family,
      '--pdf-line-height': settings.lineHeight,
      '--pdf-letter-spacing': `${settings.letterSpacing}px`,
      '--pdf-font-size': `${settings.fontSize}px`,
      '--pdf-page-bg': themeDef.pageBg,
      '--pdf-text-color': themeDef.text,
    } as React.CSSProperties;
  }, [settings]);

  /* ─── Container sınıfları ─── */
  const containerClasses = useMemo(() => {
    const theme = CONTRAST_THEMES[settings.contrastTheme];
    return [theme.bg, settings.dyslexiaMode ? 'dyslexia-mode' : ''].filter(Boolean).join(' ');
  }, [settings.contrastTheme, settings.dyslexiaMode]);

  return {
    settings,
    toggleDyslexiaMode,
    setFontFamily,
    toggleHighContrast,
    setContrastTheme,
    setLineHeight,
    setLetterSpacing,
    setFontSize,
    resetSettings,
    cssVars,
    containerClasses,
  };
}
