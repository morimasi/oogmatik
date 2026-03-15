'use client';
import React, { useState } from 'react';
import { ThemeProvider } from '../../../shared/store/ThemeProvider';
import { useGlobalStore, Theme } from '../../../shared/store/useGlobalStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Focus, Sun, Moon, Contrast, Palette, ChevronDown } from 'lucide-react';

function ZenModeOverlay({ active }: { active: boolean }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 pointer-events-none z-[55]"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.08) 100%)',
          }}
        />
      )}
    </AnimatePresence>
  );
}

function ThemeSwitcher() {
  const { theme, setTheme } = useGlobalStore();
  const [open, setOpen] = useState(false);

  const themes: { id: Theme; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'light', label: 'Varsayılan', icon: <Sun size={14} />, color: 'text-yellow-600' },
    { id: 'warm', label: 'Sıcak Tema', icon: <Palette size={14} />, color: 'text-orange-600' },
    { id: 'cool', label: 'Soğuk Tema', icon: <Moon size={14} />, color: 'text-blue-600' },
    {
      id: 'high-contrast',
      label: 'Yüksek Kontrast',
      icon: <Contrast size={14} />,
      color: 'text-gray-900',
    },
  ];

  const current = themes.find((t) => t.id === theme) || themes[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-full text-sm font-semibold text-gray-600 hover:bg-white hover:shadow-sm transition-all"
      >
        {current.icon}
        <span className="hidden sm:inline">{current.label}</span>
        <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden z-[80]"
          >
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTheme(t.id);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium transition-colors hover:bg-gray-50 ${theme === t.id ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600'}`}
              >
                <span className={t.color}>{t.icon}</span>
                {t.label}
                {theme === t.id && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-indigo-500" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clickaway */}
      {open && <div className="fixed inset-0 z-[79]" onClick={() => setOpen(false)} />}
    </div>
  );
}

export default function TurkceSuperStudyoLayout({ children }: { children: React.ReactNode }) {
  const [zenMode, setZenMode] = useState(false);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-[var(--dyslexia-bg-color,#FFFDF0)] text-[var(--dyslexia-text-color,#1F2937)] font-sans selection:bg-blue-200">
        {/* Zen Mode overlay */}
        <ZenModeOverlay active={zenMode} />

        {/* Header */}
        <AnimatePresence>
          {!zenMode && (
            <motion.header
              initial={{ y: 0 }}
              exit={{ y: -80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/60 border-b border-gray-200/50 shadow-sm"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <div className="flex items-center gap-3 pl-12">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
                    T
                  </div>
                  <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight">
                    Türkçe Süper Stüdyo
                  </h1>
                </div>

                <div className="flex items-center gap-3">
                  {/* Theme Switcher */}
                  <ThemeSwitcher />

                  {/* Zen Mode Toggle */}
                  <button
                    onClick={() => setZenMode(!zenMode)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-all border ${zenMode
                        ? 'bg-indigo-100 border-indigo-300 text-indigo-700 shadow-inner'
                        : 'bg-white/60 backdrop-blur-sm border-gray-200/50 text-gray-500 hover:bg-white hover:text-indigo-600 hover:shadow-sm'
                      }`}
                    title="Odak Modu"
                  >
                    <Focus size={16} />
                    <span className="hidden sm:inline">Odak</span>
                  </button>

                  {/* Premium Badge */}
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-yellow-100 to-amber-100 text-amber-800 rounded-full text-sm font-bold border border-amber-200/50">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    Premium
                  </div>
                </div>
              </div>
            </motion.header>
          )}
        </AnimatePresence>

        {/* Zen Mode: Mini back-to-normal button */}
        <AnimatePresence>
          {zenMode && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => setZenMode(false)}
              className="fixed top-4 right-4 z-[70] p-2 bg-white/80 backdrop-blur-md rounded-full shadow-lg border border-gray-200/50 text-indigo-600 hover:bg-white transition-all"
              title="Odak Modundan Çık"
            >
              <Focus size={18} />
            </motion.button>
          )}
        </AnimatePresence>

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
