import React from 'react';
import { ThemeProvider } from '../../../shared/store/ThemeProvider';

export default function TurkceSuperStudyoLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-[var(--dyslexia-bg-color,#FFFDF0)] text-[var(--dyslexia-text-color,#1F2937)] font-sans selection:bg-blue-200">
        <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/50 border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
                T
              </div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight">
                Türkçe Süper Stüdyo
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
                Premium
              </div>
            </div>
          </div>
        </header>

        <main
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-all duration-300"
          style={{
            fontFamily: 'var(--dyslexia-font-family)',
            lineHeight: 'var(--dyslexia-line-height)',
            letterSpacing: 'var(--dyslexia-letter-spacing)',
            wordSpacing: 'var(--dyslexia-word-spacing)',
            fontSize: 'var(--dyslexia-font-size)',
          }}
        >
          {children}
        </main>
      </div>
    </ThemeProvider>
  );
}
