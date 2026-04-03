import { useState, useCallback } from 'react';
import { useUIStore } from '../../../store/useUIStore';
import { DEFAULT_DYSLEXIA_SETTINGS } from '../constants/pdfConfig';
import type { DyslexiaFontFamily } from '../constants/pdfConfig';

export interface DyslexiaSettings {
  fontFamily: DyslexiaFontFamily;
  highContrast: boolean;
  lineHeight: number;
  letterSpacing: number;
  backgroundColor: string;
}

export interface DyslexiaSettingsActions {
  setFontFamily: (fontFamily: DyslexiaFontFamily) => void;
  setHighContrast: (enabled: boolean) => void;
  setLineHeight: (value: number) => void;
  setLetterSpacing: (value: number) => void;
  setBackgroundColor: (color: string) => void;
  resetDyslexiaSettings: () => void;
}

export type UseDyslexiaSettingsReturn = DyslexiaSettings & DyslexiaSettingsActions;

interface UseDyslexiaSettingsOptions {
  initialSettings?: Partial<DyslexiaSettings>;
}

export function useDyslexiaSettings(
  options: UseDyslexiaSettingsOptions = {},
): UseDyslexiaSettingsReturn {
  const { initialSettings } = options;

  // Sync font/lineHeight/letterSpacing with global UIStore style settings
  const updateStyleSettings = useUIStore((s) => s.updateStyleSettings);

  const [fontFamily, setFontFamilyState] = useState<DyslexiaFontFamily>(
    initialSettings?.fontFamily ?? DEFAULT_DYSLEXIA_SETTINGS.fontFamily,
  );
  const [highContrast, setHighContrastState] = useState<boolean>(
    initialSettings?.highContrast ?? DEFAULT_DYSLEXIA_SETTINGS.highContrast,
  );
  const [lineHeight, setLineHeightState] = useState<number>(
    initialSettings?.lineHeight ?? DEFAULT_DYSLEXIA_SETTINGS.lineHeight,
  );
  const [letterSpacing, setLetterSpacingState] = useState<number>(
    initialSettings?.letterSpacing ?? DEFAULT_DYSLEXIA_SETTINGS.letterSpacing,
  );
  const [backgroundColor, setBackgroundColorState] = useState<string>(
    initialSettings?.backgroundColor ?? DEFAULT_DYSLEXIA_SETTINGS.backgroundColor,
  );

  const setFontFamily = useCallback(
    (value: DyslexiaFontFamily) => {
      setFontFamilyState(value);
      const mappedFont = value === 'default' ? 'Lexend' : value;
      updateStyleSettings({ fontFamily: mappedFont });
    },
    [updateStyleSettings],
  );

  const setHighContrast = useCallback((enabled: boolean) => {
    setHighContrastState(enabled);
  }, []);

  const setLineHeight = useCallback(
    (value: number) => {
      setLineHeightState(value);
      updateStyleSettings({ lineHeight: value });
    },
    [updateStyleSettings],
  );

  const setLetterSpacing = useCallback(
    (value: number) => {
      setLetterSpacingState(value);
      updateStyleSettings({ letterSpacing: value });
    },
    [updateStyleSettings],
  );

  const setBackgroundColor = useCallback((color: string) => {
    setBackgroundColorState(color);
  }, []);

  const resetDyslexiaSettings = useCallback(() => {
    const defaults = { ...DEFAULT_DYSLEXIA_SETTINGS, ...initialSettings };
    setFontFamilyState(defaults.fontFamily);
    setHighContrastState(defaults.highContrast);
    setLineHeightState(defaults.lineHeight);
    setLetterSpacingState(defaults.letterSpacing);
    setBackgroundColorState(defaults.backgroundColor);
    updateStyleSettings({
      fontFamily: defaults.fontFamily === 'default' ? 'Lexend' : defaults.fontFamily,
      lineHeight: defaults.lineHeight,
      letterSpacing: defaults.letterSpacing,
    });
  }, [initialSettings, updateStyleSettings]);

  return {
    fontFamily,
    highContrast,
    lineHeight,
    letterSpacing,
    backgroundColor,
    setFontFamily,
    setHighContrast,
    setLineHeight,
    setLetterSpacing,
    setBackgroundColor,
    resetDyslexiaSettings,
  };
}
