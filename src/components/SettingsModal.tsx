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
}: SettingsModalProps) => {
  const [activeTab, setActiveTab] = useState<'appearance' | 'typography' | 'accessibility'>(
    'appearance'
  );
  const prefersReducedMotion = useReducedMotion();
  const [themeRecommendation, setThemeRecommendation] = useState<ThemeRecommendation | null>(null);

  useEffect(() => {
    if (isOpen) {
      themeIntelligence
        .recommendTheme('system')
        .then((rec) => {
          if (rec && rec.theme !== theme && rec.confidence >= 0.6) {
            setThemeRecommendation(rec);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const themes: { id: AppTheme; name: string; color: string; desc: string; accent: string }[] = [
    { id: 'light', name: 'Milk & Honey', color: '#F8FAFC', accent: '#4F46E5', desc: 'Ferah eğitim' },
    { id: 'anthracite', name: 'Anthracite', color: '#121214', accent: '#6366f1', desc: 'Profesyonel' },
    { id: 'dark', name: 'Obsidian Deep', color: '#09090B', accent: '#818CF8', desc: 'Derin' },
    { id: 'ocean', name: 'Nordic Mist', color: '#082F49', accent: '#38BDF8', desc: 'Huzurlu' },
    { id: 'nature', name: 'Emerald Forest', color: '#052E16', accent: '#4ADE80', desc: 'Doğal' },
    { id: 'anthracite-gold', name: 'Imperial Stone', color: '#1C1917', accent: '#F59E0B', desc: 'Prestijli' },
    { id: 'anthracite-cyber', name: 'Cyber Punk', color: '#020202', accent: '#F43F5E', desc: 'Dinamik' },
    { id: 'space', name: 'Deep Space', color: '#020617', accent: '#38bdf8', desc: 'Sonsuz' },
  ];

  const fonts: { id: UiSettings['fontFamily']; name: string; desc: string }[] = [
    { id: 'Lexend', name: 'Lexend', desc: 'Okuma akıcılığı için modern yapı' },
    { id: 'OpenDyslexic', name: 'OpenDyslexic', desc: 'Disleksi özel tasarımı' },
    { id: 'Inter', name: 'Inter', desc: 'Profesyonel ve net' },
    { id: 'Comic Neue', name: 'Comic Neue', desc: 'Çocuk dostu yapı' },
  ];

  const tabs = [
    { id: 'appearance', label: 'Görünüm', icon: 'fa-palette' },
    { id: 'typography', label: 'Tipografi', icon: 'fa-font' },
    { id: 'accessibility', label: 'Erişilebilirlik', icon: 'fa-universal-access' },
  ] as const;

  const handleReset = () => {
    if (confirm('Ayarlar sıfırlanacak. Emin misiniz?')) {
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
          className="fixed inset-0 bg-black/80 backdrop-blur-2xl z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-[var(--bg-paper)] rounded-[3rem] shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col md:flex-row overflow-hidden border border-[var(--border-color)] font-['Lexend']"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
          >
            {/* Sidebar Sub-nav */}
            <div className="w-full md:w-72 bg-[var(--bg-secondary)] border-r border-[var(--border-color)] flex flex-col p-8">
              <div className="mb-10">
                <h2 className="text-2xl font-black text-[var(--text-primary)] flex items-center gap-3 tracking-tighter uppercase">
                  <i className="fa-solid fa-sliders-h text-[var(--accent-color)]"></i>
                  Ayarlar
                </h2>
              </div>

              <div className="flex-1 space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left p-4 rounded-2xl transition-all duration-300 flex items-center gap-4 ${activeTab === tab.id ? 'bg-[var(--accent-color)] text-white shadow-xl' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-paper)]'}`}
                  >
                    <i className={`fa-solid ${tab.icon} w-5`}></i>
                    <span className="text-sm font-black uppercase tracking-tight">{tab.label}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={handleReset}
                className="mt-auto py-4 px-4 rounded-2xl text-[10px] font-black text-rose-500 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all uppercase tracking-widest text-center"
              >
                 Varsayılana Dön
              </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 bg-[var(--bg-paper)] flex flex-col h-full overflow-hidden relative">
              <div className="absolute top-8 right-8 z-10">
                <button
                  onClick={onClose}
                  className="w-12 h-12 flex items-center justify-center rounded-2xl bg-[var(--bg-secondary)] hover:bg-red-500/10 hover:text-red-500 transition-all active:scale-90"
                >
                  <i className="fa-solid fa-times text-xl"></i>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-12">
                {/* Preview Card */}
                <div className="mb-12">
                  <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.4em] mb-4 block">Canlı Simülasyon</span>
                  <div
                    className="p-10 rounded-[2.5rem] border border-[var(--border-color)] transition-all duration-500 bg-[var(--bg-secondary)] relative overflow-hidden"
                    style={{
                      fontFamily: uiSettings.fontFamily,
                      lineHeight: uiSettings.lineHeight,
                      filter: `saturate(${uiSettings.saturation}%) contrast(${100 + uiSettings.contrastLevel}%)`,
                    }}
                  >
                     <div className="relative z-10">
                        <div className="w-12 h-1 w-12 bg-[var(--accent-color)] rounded-full mb-6"></div>
                        <h4 className="text-3xl font-black mb-4 tracking-tighter" style={{ fontSize: `${28 * uiSettings.fontSizeScale}px` }}>
                          Disleksi Dostu Tipografi
                        </h4>
                        <p className="text-xl font-medium opacity-80" style={{ fontSize: `${18 * uiSettings.fontSizeScale}px` }}>
                          Görsel hiyerarşi ve doğru boşluklandırma, disleksi desteği alan çocukların 
                          metinleri %35 daha hızlı anlamlandırmasını sağlar. <span className="text-[var(--accent-color)] font-black">Deneyim odaklı eğitim.</span>
                        </p>
                     </div>
                  </div>
                </div>

                <div className="animate-in slide-in-from-bottom-4 duration-500">
                  {activeTab === 'appearance' && (
                    <div className="space-y-10">
                      <section>
                         <h3 className="text-xs font-black text-[var(--text-muted)] tracking-[0.3em] uppercase mb-6 flex items-center gap-3">
                           <i className="fa-solid fa-palette text-[var(--accent-color)]"></i> Renk Teması
                         </h3>
                         <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                           {themes.map((t) => (
                             <button
                               key={t.id}
                               onClick={() => onUpdateTheme(t.id)}
                               className={`group p-4 rounded-3xl border-2 transition-all duration-300 ${theme === t.id ? 'border-[var(--accent-color)] bg-[var(--accent-muted)]' : 'border-[var(--border-color)] hover:border-[var(--accent-color)]/30'}`}
                             >
                                <div className="w-full aspect-square rounded-2xl mb-3 shadow-inner" style={{ backgroundColor: t.color }}></div>
                                <span className="text-[11px] font-black uppercase text-[var(--text-primary)] block text-center truncate">{t.name}</span>
                             </button>
                           ))}
                         </div>
                      </section>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-8 rounded-[2rem] bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-between">
                           <div>
                              <h4 className="font-black text-sm uppercase">Kompakt Arayüz</h4>
                              <p className="text-[10px] text-[var(--text-muted)] font-bold mt-1">Sıkıştırılmış Bento-grid düzeni</p>
                           </div>
                           <button
                             onClick={() => onUpdateUiSettings({ ...uiSettings, compactMode: !uiSettings.compactMode })}
                             className={`w-14 h-8 rounded-full relative transition-colors ${uiSettings.compactMode ? 'bg-[var(--accent-color)]' : 'bg-[var(--bg-paper)] border border-[var(--border-color)]'}`}
                           >
                             <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${uiSettings.compactMode ? 'left-7' : 'left-1 shadow-sm'}`}></div>
                           </button>
                        </div>

                        <div className="p-8 rounded-[2rem] bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                           <div className="flex justify-between items-center mb-4">
                             <h4 className="font-black text-sm uppercase">Glassmorphism</h4>
                             <span className="text-[10px] font-black text-[var(--accent-color)]">{uiSettings.premiumIntensity}%</span>
                           </div>
                           <input
                              type="range"
                              min="0" max="100" step="5"
                              value={uiSettings.premiumIntensity}
                              onChange={(e) => onUpdateUiSettings({ ...uiSettings, premiumIntensity: parseInt(e.target.value) })}
                              className="w-full h-1.5 bg-[var(--bg-paper)] rounded-full appearance-none accent-[var(--accent-color)]"
                           />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'typography' && (
                    <div className="space-y-10">
                       <section>
                         <h3 className="text-xs font-black text-[var(--text-muted)] tracking-[0.3em] uppercase mb-6 flex items-center gap-3">
                           <i className="fa-solid fa-font text-[var(--accent-color)]"></i> Yazı Karakteri
                         </h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {fonts.map((f) => (
                              <button
                                key={f.id}
                                onClick={() => onUpdateUiSettings({ ...uiSettings, fontFamily: f.id })}
                                className={`p-8 text-left rounded-[2rem] border-2 transition-all duration-300 relative overflow-hidden ${uiSettings.fontFamily === f.id ? 'border-[var(--accent-color)] bg-[var(--accent-muted)]' : 'border-[var(--border-color)] hover:border-[var(--accent-color)]/30'}`}
                              >
                                <span className="block text-3xl font-medium mb-3" style={{ fontFamily: f.id }}>Abc 123</span>
                                <h4 className="text-sm font-black uppercase tracking-tight">{f.name}</h4>
                                <p className="text-[10px] text-[var(--text-muted)] font-bold">{f.desc}</p>
                              </button>
                            ))}
                         </div>
                       </section>

                       <section className="p-10 rounded-[2.5rem] bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                          <div className="flex justify-between items-center mb-6">
                            <div>
                               <h4 className="font-black text-sm uppercase tracking-wider">Satır Aralığı (Reading Fluidity)</h4>
                               <p className="text-[10px] text-[var(--text-muted)] font-bold mt-1">Okuma derinliği optimizasyonu</p>
                            </div>
                            <span className="px-4 py-2 bg-[var(--bg-paper)] rounded-xl text-xs font-black text-[var(--accent-color)] border border-[var(--border-color)]">
                               {uiSettings.lineHeight.toFixed(1)}x
                            </span>
                          </div>
                          <input
                             type="range" min="1.0" max="2.5" step="0.1"
                             value={uiSettings.lineHeight}
                             onChange={(e) => onUpdateUiSettings({ ...uiSettings, lineHeight: parseFloat(e.target.value) })}
                             className="w-full h-2 bg-[var(--bg-paper)] rounded-full appearance-none accent-[var(--accent-color)]"
                          />
                       </section>
                    </div>
                  )}

                  {activeTab === 'accessibility' && (
                    <div className="space-y-6">
                       <h3 className="text-xs font-black text-[var(--text-muted)] tracking-[0.3em] uppercase mb-6 flex items-center gap-3">
                          <i className="fa-solid fa-universal-access text-[var(--accent-color)]"></i> Kapsayıcı Eğitim Ayarları
                       </h3>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="p-8 rounded-[2rem] bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                             <div className="flex justify-between items-center mb-4">
                                <h4 className="font-black text-sm uppercase">Sistem Ölçeği</h4>
                                <span className="text-[10px] font-black text-[var(--accent-color)]">{Math.round(uiSettings.fontSizeScale * 100)}%</span>
                             </div>
                             <input
                                type="range" min="0.8" max="1.5" step="0.05"
                                value={uiSettings.fontSizeScale}
                                onChange={(e) => onUpdateUiSettings({ ...uiSettings, fontSizeScale: parseFloat(e.target.value) })}
                                className="w-full h-1.5 bg-[var(--bg-paper)] rounded-full appearance-none accent-[var(--accent-color)]"
                             />
                          </div>

                          <div className="p-8 rounded-[2rem] bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-between">
                             <div>
                                <h4 className="font-black text-sm uppercase">Geniş Harf Aralığı</h4>
                                <p className="text-[10px] text-[var(--text-muted)] font-bold mt-1">Harf karışıklığını önler</p>
                             </div>
                             <button
                               onClick={() => onUpdateUiSettings({ ...uiSettings, letterSpacing: uiSettings.letterSpacing === 'wide' ? 'normal' : 'wide' })}
                               className={`w-14 h-8 rounded-full relative transition-colors ${uiSettings.letterSpacing === 'wide' ? 'bg-[var(--accent-color)]' : 'bg-[var(--bg-paper)] border border-[var(--border-color)]'}`}
                             >
                                <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${uiSettings.letterSpacing === 'wide' ? 'left-7' : 'left-1 shadow-sm'}`}></div>
                             </button>
                          </div>

                          <div className="p-8 rounded-[2rem] bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                             <div className="flex justify-between items-center mb-4">
                                <h4 className="font-black text-sm uppercase">Renk Saturasyonu</h4>
                                <span className="text-[10px] font-black text-[var(--accent-color)]">{uiSettings.saturation}%</span>
                             </div>
                             <input
                                type="range" min="0" max="100" step="5"
                                value={uiSettings.saturation}
                                onChange={(e) => onUpdateUiSettings({ ...uiSettings, saturation: parseInt(e.target.value) })}
                                className="w-full h-1.5 bg-[var(--bg-paper)] rounded-full appearance-none accent-[var(--accent-color)]"
                             />
                          </div>

                          <div className="p-8 rounded-[2rem] bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                             <div className="flex justify-between items-center mb-4">
                                <h4 className="font-black text-sm uppercase">Dinamik Kontrast</h4>
                                <span className="text-[10px] font-black text-[var(--accent-color)]">+{uiSettings.contrastLevel}%</span>
                             </div>
                             <input
                                type="range" min="0" max="50" step="5"
                                value={uiSettings.contrastLevel}
                                onChange={(e) => onUpdateUiSettings({ ...uiSettings, contrastLevel: parseInt(e.target.value) })}
                                className="w-full h-1.5 bg-[var(--bg-paper)] rounded-full appearance-none accent-[var(--accent-color)]"
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
