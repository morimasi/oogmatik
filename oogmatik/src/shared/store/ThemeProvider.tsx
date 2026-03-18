import React, { ReactNode, useEffect } from 'react';
import { useGlobalStore } from './useGlobalStore';

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { theme, dyslexiaSettings } = useGlobalStore();

  useEffect(() => {
    // Apply theme
    document.documentElement.setAttribute('data-theme', theme);

    // Apply dyslexia settings
    const root = document.documentElement;
    root.style.setProperty(
      '--dyslexia-font-family',
      `"${dyslexiaSettings.fontFamily}", sans-serif`
    );
    root.style.setProperty('--dyslexia-line-height', String(dyslexiaSettings.lineHeight));
    root.style.setProperty('--dyslexia-letter-spacing', `${dyslexiaSettings.letterSpacing}%`);
    root.style.setProperty('--dyslexia-word-spacing', `${dyslexiaSettings.wordSpacing}%`);
    root.style.setProperty('--dyslexia-font-size', `${dyslexiaSettings.fontSize}px`);
  }, [theme, dyslexiaSettings]);

  return <>{children}</>;
};
