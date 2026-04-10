import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UiSettings, AppTheme } from '../types';
import { premiumMotion } from '../utils/motionPresets';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { themeIntelligence, ThemeRecommendation } from '../services/themeIntelligence';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  uiSettings: UiSettings;
  onUpdateUiSettings: (newSettings: UiSettings) => void;
  theme: AppTheme;
  onUpdateTheme: (newTheme: AppTheme) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  uiSettings,
  onUpdateUiSettings,
  theme,
  onUpdateTheme,
}) => {
  const [activeTab, setActiveTab] = useState<'appearance' | 'typography' | 'accessibility'>(
    'appearance'
  );
  const prefersReducedMotion = useReducedMotion();
  const [themeRecommendation, setThemeRecommendation] = useState<ThemeRecommendation | null>(null);

  // Load theme recommendation on open
  useEffect(() => {
    if (isOpen) {
      themeIntelligence
        .recommendTheme('system')
        .then((rec) => {
          if (rec && rec.theme !== theme && rec.confidence >= 0.6) {
            setThemeRecommendation(rec);
          }
        })
        .catch(() => {
          /* silently fail */
        });
    }
  }, [isOpen]);

  // Esc tuşu ile kapatma
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const themes: { id: AppTheme; name: string; color: string; desc: string; accent: string }[] = [
    {
      id: 'light',
      name: 'Milk & Honey',
      color: '#F8FAFC',
      accent: '#4F46E5',
      desc: 'Temiz, ferah, klasik eğitim',
    },
    {
      id: 'anthracite',
      name: 'Anthracite',
      color: '#121214',
      accent: '#6366f1',
      desc: 'Varsayılan — derin profesyonel',
    },
    {
      id: 'dark',
      name: 'Obsidian Deep',
      color: '#09090B',
      accent: '#818CF8',
      desc: 'Kararlı, derin, profesyonel',
    },
    {
      id: 'ocean',
      name: 'Nordic Mist',
      color: '#082F49',
      accent: '#38BDF8',
      desc: 'Dingin, odaklı, huzurlu',
    },
    {
      id: 'nature',
      name: 'Emerald Forest',
      color: '#052E16',
      accent: '#4ADE80',
      desc: 'Doğal, büyümeyi teşvik eden',
    },
    {
      id: 'anthracite-gold',
      name: 'Imperial Stone',
      color: '#1C1917',
      accent: '#F59E0B',
      desc: 'Prestijli, kurumsal, güçlü',
    },
    {
      id: 'anthracite-cyber',
      name: 'Cyber Punk',
      color: '#020202',
      accent: '#F43F5E',
      desc: 'Dinamik, enerjik, gelecekçi',
    },
    {
      id: 'space',
      name: 'Deep Space',
      color: '#020617',
      accent: '#38bdf8',
      desc: 'Sonsuz derin mavi evren',
    },
    {
      id: 'oled-black',
      name: 'OLED Siyah',
      color: '#000000',
      accent: '#3b82f6',
      desc: 'True black - OLED ekranlar için',
    },
    {
      id: 'dyslexia-cream',
      name: 'Disleksi Krem',
      color: '#fff8e7',
      accent: '#1e40af',
      desc: 'Disleksi dostu krem & mavi',
    },
    {
      id: 'dyslexia-mint',
      name: 'Disleksi Nane',
      color: '#f0fdf4',
      accent: '#059669',
      desc: 'Disleksi dostu mint yeşil',
    },
  ];

  const fonts: { id: UiSettings['fontFamily']; name: string; desc: string }[] = [
    {
      id: 'OpenDyslexic',
      name: 'OpenDyslexic',
      desc: 'Disleksi için özel tasarlanmış (Varsayılan)',
    },
    { id: 'Lexend', name: 'Lexend', desc: 'Okuma akıcılığını artıran modern yapı' },
    { id: 'Inter', name: 'Inter', desc: 'Temiz, net ve profesyonel sans-serif' },
    { id: 'Comic Neue', name: 'Comic Neue', desc: 'Çocuklar için samimi ve el yazısına yakın' },
    { id: 'Lora', name: 'Lora', desc: 'Uzun okuma metinleri için klasik serif' },
  ];

  const tabs = [
    {
      id: 'appearance',
      label: 'Tema ve Renkler',
      icon: 'fa-palette',
      desc: 'Görsel kimlik ve renk paletleri',
    },
    {
      id: 'typography',
      label: 'Tipografi',
      icon: 'fa-font',
      desc: 'Yazı tipleri ve okuma ayarları',
    },
    {
      id: 'accessibility',
      label: 'Erişilebilirlik',
      icon: 'fa-universal-access',
      desc: 'Özel gereksinim optimizasyonları',
    },
  ] as const;

  const handleReset = () => {
    if (confirm('Tüm görünüm ayarları varsayılana döndürülecek. Emin misiniz?')) {
      onUpdateUiSettings({
        fontFamily: 'Lexend',
        fontSizeScale: 1,
        letterSpacing: 'normal',
        lineHeight: 1.6,
        saturation: 100,
        compactMode: false,
        premiumIntensity: 80,
        contrastLevel: 0,
      });
      onUpdateTheme('anthracite');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-2 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
        >
          {/* Container Wrapper: Max width and height with scrolling enabled */}
          <motion.div
            className="bg-white dark:bg-[#121214] rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.3)] w-full max-w-5xl h-full max-h-[95vh] flex flex-col md:flex-row overflow-hidden border border-zinc-200 dark:border-zinc-800/60"
            variants={prefersReducedMotion ? {} : premiumMotion.glassEnter}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {/* SOL PANEL: Navigasyon (Sabit genişlik, taşma durumunda kayar) */}
            <div className="w-full md:w-72 bg-zinc-50 dark:bg-[#0a0a0c] border-r border-zinc-200 dark:border-zinc-800/60 flex flex-col shrink-0 h-full max-h-[20vh] md:max-h-full overflow-y-auto">
              <div className="p-6 border-b border-zinc-200 dark:border-zinc-800/60 shrink-0">
                <h2 className="text-xl font-black text-zinc-800 dark:text-zinc-100 flex items-center gap-3 tracking-tight">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <i className="fa-solid fa-sliders"></i>
                  </div>
                  Sistem Görünümü
                </h2>
                <p className="text-xs text-zinc-500 mt-2 font-medium">
                  Bursa Disleksi AI platformunun görsel deneyimini kişiselleştirin.
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left p-4 rounded-2xl transition-all duration-200 flex items-start gap-4 group relative overflow-hidden ${activeTab === tab.id ? 'bg-white dark:bg-zinc-800/80 shadow-md border border-zinc-200/50 dark:border-zinc-700/50' : 'hover:bg-zinc-200/50 dark:hover:bg-zinc-800/40 border border-transparent'}`}
                  >
                    {activeTab === tab.id && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-l-2xl"></div>
                    )}
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${activeTab === tab.id ? 'bg-indigo-500 text-white' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300'}`}
                    >
                      <i className={`fa-solid ${tab.icon}`}></i>
                    </div>
                    <div>
                      <h3
                        className={`text-sm font-bold ${activeTab === tab.id ? 'text-zinc-900 dark:text-white' : 'text-zinc-600 dark:text-zinc-400'}`}
                      >
                        {tab.label}
                      </h3>
                      <p className="text-[10px] text-zinc-500 mt-0.5 leading-snug">{tab.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="p-4 border-t border-zinc-200 dark:border-zinc-800/60 bg-zinc-100/50 dark:bg-zinc-900/20 shrink-0">
                <button
                  onClick={handleReset}
                  className="w-full py-3 px-4 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 border border-transparent hover:border-red-200 dark:hover:border-red-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-rotate-left"></i> Fabrika Ayarlarına Dön
                </button>
              </div>
            </div>

            {/* SAĞ PANEL: İçerik (Kayar alan) */}
            <div className="flex-1 flex flex-col bg-white dark:bg-[#121214] min-w-0 relative h-full">
              {/* Header (Mobil Kapatma) */}
              <div className="absolute top-4 right-4 z-10 md:hidden">
                <button
                  onClick={onClose}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-500 transition-all transform hover:scale-105 active:scale-95 shadow-sm border border-zinc-200 dark:border-zinc-700"
                >
                  <i className="fa-solid fa-times text-lg"></i>
                </button>
              </div>

              {/* İçerik Alanı: Yeterli padding ve overflow ile dolu bir yükseklik */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10">
                {/* CANLI ÖNİZLEME KUTUSU (Her sekmede görünür) */}
                <div className="mb-10 shrink-0">
                  <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-eye text-indigo-500"></i> Canlı Önizleme
                  </h3>
                  <div
                    className={`p-8 rounded-3xl border transition-all duration-500 shadow-inner overflow-hidden relative ${theme === 'light' ? 'bg-zinc-50 border-zinc-200' : theme === 'dark' ? 'theme-dark border-zinc-800' : `theme-${theme} border-white/5`}`}
                    style={{
                      fontFamily: uiSettings.fontFamily,
                      lineHeight: uiSettings.lineHeight,
                      letterSpacing: uiSettings.letterSpacing === 'wide' ? '0.05em' : 'normal',
                      filter: `saturate(${uiSettings.saturation}%) contrast(${100 + uiSettings.contrastLevel}%)`,
                      backgroundColor: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <div
                      className="absolute inset-0 opacity-10 pointer-events-none"
                      style={{
                        backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
                        backgroundSize: '24px 24px',
                      }}
                    ></div>

                    <div className="relative z-10 max-w-lg">
                      <div
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold mb-4 uppercase tracking-wider"
                        style={{
                          backgroundColor: 'var(--bg-secondary, rgba(128,128,128,0.1))',
                          color: 'var(--accent-color, #6366f1)',
                        }}
                      >
                        <i className="fa-solid fa-bolt"></i> Simülasyon Aktif
                      </div>
                      <h4
                        className="text-2xl font-black mb-3"
                        style={{ fontSize: `${24 * uiSettings.fontSizeScale}px` }}
                      >
                        Disleksi Dostu Tasarım
                      </h4>
                      <p
                        className="opacity-80 font-medium"
                        style={{ fontSize: `${16 * uiSettings.fontSizeScale}px` }}
                      >
                        Eğitim materyallerinin çocukların bilişsel yükünü azaltacak şekilde, doğru
                        renk, kontrast ve tipografi ile sunulması öğrenme hızını{' '}
                        <strong style={{ color: 'var(--accent-color, #6366f1)' }}>
                          %40'a kadar
                        </strong>{' '}
                        artırabilir.
                      </p>
                    </div>
                  </div>
                </div>

                {/* SEKME İÇERİKLERİ */}
                <div className="animate-in slide-in-from-right-8 fade-in duration-300">
                  {/* TEMA SEKME */}
                  {activeTab === 'appearance' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-bold text-zinc-800 dark:text-white mb-1">
                          Renk Paleti
                        </h3>
                        <p className="text-sm text-zinc-500 mb-6">
                          Uygulamanın genel renk şemasını seçin. Koyu temalar göz yorgunluğunu
                          azaltır.
                        </p>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                          {themes.map((t) => (
                            <button
                              key={t.id}
                              onClick={() => onUpdateTheme(t.id)}
                              className={`group relative p-1 rounded-2xl transition-all duration-300 focus:outline-none ${theme === t.id ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-white dark:ring-offset-[#121214]' : 'hover:scale-[1.02]'}`}
                            >
                              <div
                                className={`w-full aspect-[4/3] rounded-xl shadow-sm border overflow-hidden flex flex-col relative ${theme === t.id ? 'border-indigo-500' : 'border-zinc-200 dark:border-zinc-800'}`}
                                style={{ backgroundColor: t.color }}
                              >
                                {/* Mini Mockup */}
                                <div
                                  className="h-6 border-b flex items-center px-2 gap-1.5"
                                  style={{
                                    borderColor: 'rgba(128,128,128,0.1)',
                                    backgroundColor: 'rgba(128,128,128,0.05)',
                                  }}
                                >
                                  <div className="w-2 h-2 rounded-full opacity-30 bg-current"></div>
                                  <div className="w-2 h-2 rounded-full opacity-30 bg-current"></div>
                                </div>
                                <div className="flex-1 p-3 flex gap-2">
                                  <div className="w-1/3 h-full rounded opacity-10 bg-current"></div>
                                  <div className="w-2/3 flex flex-col gap-2">
                                    <div
                                      className="w-full h-3 rounded"
                                      style={{ backgroundColor: t.accent }}
                                    ></div>
                                    <div className="w-2/3 h-2 rounded opacity-20 bg-current"></div>
                                    <div className="w-4/5 h-2 rounded opacity-20 bg-current"></div>
                                  </div>
                                </div>
                                {theme === t.id && (
                                  <div className="absolute inset-0 bg-indigo-500/10 flex items-center justify-center backdrop-blur-[1px]">
                                    <div className="w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center shadow-lg animate-in zoom-in">
                                      <i className="fa-solid fa-check"></i>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="mt-3 text-center">
                                <p
                                  className={`text-sm font-bold ${theme === t.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-700 dark:text-zinc-300'}`}
                                >
                                  {t.name}
                                </p>
                                <p className="text-[10px] text-zinc-500 line-clamp-1">{t.desc}</p>
                              </div>
                            </button>
                          ))}
                        </div>

                        {/* Theme Intelligence Recommendation Banner */}
                        <AnimatePresence>
                          {themeRecommendation && (
                            <motion.div
                              className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-200 dark:border-indigo-700/40 flex items-center gap-3"
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                            >
                              <div className="w-9 h-9 shrink-0 bg-indigo-500 rounded-xl flex items-center justify-center text-white">
                                <i className="fa-solid fa-wand-magic-sparkles text-sm"></i>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-indigo-800 dark:text-indigo-200">
                                  AI Tema Önerisi
                                </p>
                                <p className="text-xs text-indigo-600 dark:text-indigo-400 truncate">
                                  {themeRecommendation.reason}
                                </p>
                              </div>
                              <div className="flex gap-2 shrink-0">
                                <button
                                  onClick={() => {
                                    onUpdateTheme(themeRecommendation.theme);
                                    setThemeRecommendation(null);
                                  }}
                                  className="px-3 py-1.5 text-xs font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                  Uygula
                                </button>
                                <button
                                  onClick={() => setThemeRecommendation(null)}
                                  className="px-3 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-800/30 rounded-lg transition-colors"
                                >
                                  Kapat
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Kompakt Mod */}
                        <div className="p-5 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between group hover:border-indigo-300 transition-colors">
                          <div>
                            <h4 className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                              <i className="fa-solid fa-compress text-indigo-500"></i> Kompakt Mod
                            </h4>
                            <p className="text-[10px] text-zinc-500 mt-0.5">
                              Ekran alanını daha verimli kullanmak için boşlukları daraltır.
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              onUpdateUiSettings({
                                ...uiSettings,
                                compactMode: !uiSettings.compactMode,
                              })
                            }
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${uiSettings.compactMode ? 'bg-indigo-600' : 'bg-zinc-300 dark:bg-zinc-700'}`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${uiSettings.compactMode ? 'translate-x-6' : 'translate-x-1'}`}
                            />
                          </button>
                        </div>

                        {/* Premium His Slider */}
                        <div className="p-5 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2 text-sm">
                              <i className="fa-solid fa-sparkles text-indigo-500"></i> Premium His
                              (Glass)
                            </h4>
                            <span className="text-[10px] font-mono font-bold text-indigo-600">
                              {uiSettings.premiumIntensity}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={uiSettings.premiumIntensity}
                            onChange={(e) =>
                              onUpdateUiSettings({
                                ...uiSettings,
                                premiumIntensity: parseInt(e.target.value),
                              })
                            }
                            className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TİPOGRAFİ SEKME */}
                  {activeTab === 'typography' && (
                    <div className="space-y-8">
                      <div>
                        <h3 className="text-lg font-bold text-zinc-800 dark:text-white mb-1">
                          Yazı Tipi (Font)
                        </h3>
                        <p className="text-sm text-zinc-500 mb-6">
                          Disleksi ve özel öğrenme güçlüğü için optimize edilmiş fontlar.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {fonts.map((f) => (
                            <button
                              key={f.id}
                              onClick={() =>
                                onUpdateUiSettings({ ...uiSettings, fontFamily: f.id })
                              }
                              className={`p-5 text-left border-2 rounded-2xl transition-all duration-200 relative overflow-hidden group ${uiSettings.fontFamily === f.id ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10' : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600'}`}
                            >
                              {uiSettings.fontFamily === f.id && (
                                <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/10 rounded-bl-full"></div>
                              )}
                              <div className="flex justify-between items-start mb-2">
                                <span
                                  className={`text-2xl ${uiSettings.fontFamily === f.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-800 dark:text-zinc-200'}`}
                                  style={{ fontFamily: f.id }}
                                >
                                  Aa Bb Cc
                                </span>
                                {uiSettings.fontFamily === f.id && (
                                  <i className="fa-solid fa-circle-check text-indigo-500 text-lg"></i>
                                )}
                              </div>
                              <h4 className="font-bold text-zinc-900 dark:text-white text-sm">
                                {f.name}
                              </h4>
                              <p className="text-xs text-zinc-500 mt-1">{f.desc}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                              <i className="fa-solid fa-arrows-up-down text-indigo-500"></i> Satır
                              Yüksekliği
                            </h4>
                            <p className="text-xs text-zinc-500 mt-0.5">
                              Satırlar arası boşluğu artırarak okumayı kolaylaştırır.
                            </p>
                          </div>
                          <div className="px-3 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 shadow-sm">
                            {uiSettings.lineHeight.toFixed(1)}x
                          </div>
                        </div>
                        <div className="relative pt-2">
                          <input
                            type="range"
                            min="1.0"
                            max="2.5"
                            step="0.1"
                            value={uiSettings.lineHeight}
                            onChange={(e) =>
                              onUpdateUiSettings({
                                ...uiSettings,
                                lineHeight: parseFloat(e.target.value),
                              })
                            }
                            className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                          />
                          <div className="flex justify-between text-[10px] font-bold text-zinc-400 mt-2 uppercase tracking-wider">
                            <span>Sıkışık</span>
                            <span>Dengeli</span>
                            <span>Çok Geniş</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ERİŞİLEBİLİRLİK SEKME */}
                  {activeTab === 'accessibility' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-bold text-zinc-800 dark:text-white mb-1">
                          Erişilebilirlik ve Odak
                        </h3>
                        <p className="text-sm text-zinc-500 mb-6">
                          Öğrenme güçlüğü çeken bireyler için bilişsel yükü azaltan ayarlar.
                        </p>
                      </div>

                      <div className="grid gap-6">
                        {/* Arayüz Ölçeği */}
                        <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h4 className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                                <i className="fa-solid fa-magnifying-glass-plus text-indigo-500"></i>{' '}
                                Arayüz Ölçeği
                              </h4>
                              <p className="text-xs text-zinc-500 mt-0.5">
                                Tüm metin ve elementlerin boyutunu büyütün.
                              </p>
                            </div>
                            <div className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                              {Math.round(uiSettings.fontSizeScale * 100)}%
                            </div>
                          </div>
                          <input
                            type="range"
                            min="0.8"
                            max="1.5"
                            step="0.05"
                            value={uiSettings.fontSizeScale}
                            onChange={(e) =>
                              onUpdateUiSettings({
                                ...uiSettings,
                                fontSizeScale: parseFloat(e.target.value),
                              })
                            }
                            className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                          />
                        </div>

                        {/* Harf Aralığı Toggle */}
                        <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-between group hover:border-indigo-300 transition-colors">
                          <div>
                            <h4 className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                              <i className="fa-solid fa-text-width text-indigo-500"></i> Geniş Harf
                              Aralığı
                            </h4>
                            <p className="text-xs text-zinc-500 mt-1 max-w-md">
                              Harflerin birbirine yapışmasını ve "dans etmesini" (kalabalık
                              etkisini) önlemek için harf aralarını açar.
                            </p>
                          </div>
                          <div className="relative inline-block w-14 align-middle select-none shrink-0">
                            <input
                              type="checkbox"
                              checked={uiSettings.letterSpacing === 'wide'}
                              onChange={(e) =>
                                onUpdateUiSettings({
                                  ...uiSettings,
                                  letterSpacing: e.target.checked ? 'wide' : 'normal',
                                })
                              }
                              className="toggle-checkbox absolute block w-7 h-7 rounded-full bg-white border-4 appearance-none cursor-pointer transition-transform duration-300 ease-in-out z-10 checked:translate-x-7 checked:border-indigo-500"
                              style={{
                                borderColor:
                                  uiSettings.letterSpacing === 'wide' ? '#6366f1' : '#e4e4e7',
                              }}
                            />
                            <label
                              className={`toggle-label block overflow-hidden h-7 rounded-full cursor-pointer transition-colors duration-300 ${uiSettings.letterSpacing === 'wide' ? 'bg-indigo-500' : 'bg-zinc-200 dark:bg-zinc-700'}`}
                            ></label>
                          </div>
                        </div>

                        {/* Renk Doygunluğu (Saturasyon) */}
                        <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h4 className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                                <i className="fa-solid fa-droplet text-indigo-500"></i> Renk
                                Doygunluğu
                              </h4>
                              <p className="text-xs text-zinc-500 mt-0.5">
                                Dikkat dağınıklığını azaltmak için renkleri soluklaştırın.
                              </p>
                            </div>
                            <div className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                              {uiSettings.saturation}%
                            </div>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={uiSettings.saturation}
                            onChange={(e) =>
                              onUpdateUiSettings({
                                ...uiSettings,
                                saturation: parseInt(e.target.value),
                              })
                            }
                            className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                          />
                        </div>

                        {/* Kontrast Ayarı */}
                        <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h4 className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                                <i className="fa-solid fa-circle-half-stroke text-indigo-500"></i>{' '}
                                Ekstra Kontrast
                              </h4>
                              <p className="text-xs text-zinc-500 mt-0.5">
                                Görsel ayrımı artırmak için renk zıtlığını güçlendirin.
                              </p>
                            </div>
                            <div className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                              +{uiSettings.contrastLevel}%
                            </div>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="50"
                            step="5"
                            value={uiSettings.contrastLevel}
                            onChange={(e) =>
                              onUpdateUiSettings({
                                ...uiSettings,
                                contrastLevel: parseInt(e.target.value),
                              })
                            }
                            className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
