import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UiSettings, AppTheme } from '../types';
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

type TabId = 'appearance' | 'typography' | 'accessibility';

interface ThemeEntry {
  id: AppTheme;
  name: string;
  color: string;
  accent: string;
  desc: string;
  premium?: boolean;
}

const THEME_GROUPS: { label: string; themes: ThemeEntry[] }[] = [
  {
    label: 'Karanlık',
    themes: [
      { id: 'anthracite', name: 'Anthracite', color: '#121214', accent: '#6366f1', desc: 'Profesyonel' },
      { id: 'dark', name: 'Obsidian Deep', color: '#09090B', accent: '#818CF8', desc: 'Derin' },
      { id: 'space', name: 'Deep Space', color: '#020617', accent: '#38bdf8', desc: 'Sonsuz' },
      { id: 'anthracite-gold', name: 'Imperial Stone', color: '#1C1917', accent: '#F59E0B', desc: 'Prestijli' },
      { id: 'anthracite-cyber', name: 'Cyber Punk', color: '#020202', accent: '#F43F5E', desc: 'Dinamik' },
      { id: 'oled-black', name: 'OLED Black', color: '#000000', accent: '#3B82F6', desc: 'OLED', premium: true },
    ],
  },
  {
    label: 'Açık',
    themes: [
      { id: 'light', name: 'Milk & Honey', color: '#F8FAFC', accent: '#4F46E5', desc: 'Ferah' },
    ],
  },
  {
    label: 'Doğa',
    themes: [
      { id: 'ocean', name: 'Nordic Mist', color: '#082F49', accent: '#38BDF8', desc: 'Huzurlu' },
      { id: 'nature', name: 'Emerald Forest', color: '#052E16', accent: '#4ADE80', desc: 'Doğal' },
    ],
  },
  {
    label: 'Premium',
    themes: [
      { id: 'dyslexia-cream', name: 'Krem Mavi', color: '#F5F0DC', accent: '#3B6EA5', desc: 'BDA', premium: true },
      { id: 'dyslexia-mint', name: 'Nane Yeşili', color: '#E8FFF5', accent: '#2D9D78', desc: 'Rahatlatıcı', premium: true },
    ],
  },
];

const FONTS: { id: string; name: string; desc: string }[] = [
  { id: 'Lexend', name: 'Lexend', desc: 'Okuma akıcılığı' },
  { id: 'OpenDyslexic', name: 'OpenDyslexic', desc: 'Disleksi özel' },
  { id: 'Inter', name: 'Inter', desc: 'Profesyonel' },
  { id: 'Comic Neue', name: 'Comic Neue', desc: 'Çocuk dostu' },
];

const FONT_WEIGHTS: { id: UiSettings['fontWeight']; label: string; value: string }[] = [
  { id: 'thin', label: 'Thin', value: '300' },
  { id: 'normal', label: 'Normal', value: '400' },
  { id: 'medium', label: 'Medium', value: '500' },
  { id: 'bold', label: 'Bold', value: '700' },
  { id: 'black', label: 'Black', value: '900' },
];

const BORDER_RADII: { id: NonNullable<UiSettings['borderRadius']>; label: string; preview: string }[] = [
  { id: 'none', label: 'Kare', preview: '0px' },
  { id: 'sm', label: 'Hafif', preview: '6px' },
  { id: 'xl', label: 'Normal', preview: '16px' },
  { id: 'full', label: 'Yuvarlak', preview: '9999px' },
];

const ANIMATION_LEVELS: { id: NonNullable<UiSettings['animationLevel']>; label: string; desc: string }[] = [
  { id: 'full', label: 'Tam', desc: 'Tüm animasyonlar' },
  { id: 'reduced', label: 'Azaltılmış', desc: 'Minimal hareket' },
  { id: 'none', label: 'Yok', desc: 'Animasyon yok' },
];

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'appearance', label: 'Görünüm', icon: 'fa-palette' },
  { id: 'typography', label: 'Tipografi', icon: 'fa-font' },
  { id: 'accessibility', label: 'Erişilebilirlik', icon: 'fa-universal-access' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  uiSettings,
  onUpdateUiSettings,
  theme,
  onUpdateTheme,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('appearance');
  const [themeRecommendation, setThemeRecommendation] = useState<ThemeRecommendation | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Theme Intelligence
  useEffect(() => {
    if (isOpen) {
      themeIntelligence
        .recommendTheme('system')
        .then((rec) => {
          if (rec && rec.theme !== theme && rec.confidence >= 0.6) {
            setThemeRecommendation(rec);
          } else {
            setThemeRecommendation(null);
          }
        })
        .catch(() => {});
    }
  }, [isOpen, theme]);

  // Focus trap & Escape
  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [isOpen, onClose]);

  const handleReset = useCallback(() => {
    onUpdateUiSettings({
      fontFamily: 'Lexend',
      fontSizeScale: 1,
      fontWeight: 'normal',
      letterSpacing: 'normal',
      lineHeight: 1.6,
      saturation: 100,
      compactMode: false,
      premiumIntensity: 60,
      contrastLevel: 50,
      borderRadius: 'xl',
      animationLevel: 'full',
    });
    onUpdateTheme('anthracite');
  }, [onUpdateUiSettings, onUpdateTheme]);

  const updateSetting = useCallback(
    <K extends keyof UiSettings>(key: K, value: UiSettings[K]) => {
      onUpdateUiSettings({ ...uiSettings, [key]: value });
    },
    [uiSettings, onUpdateUiSettings]
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-xl z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label="Görüntü ayarları"
        >
          <motion.div
            ref={modalRef}
            className="bg-[var(--bg-paper)] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden border border-[var(--border-color)] font-['Lexend']"
            initial={{ scale: 0.95, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 12 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-sliders-h text-[var(--accent-color)] text-xs"></i>
                <span className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-tight">
                  Ayarlar
                </span>
              </div>

              <nav className="flex items-center gap-1" role="tablist" aria-label="Ayar sekmeleri">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    aria-controls={`panel-${tab.id}`}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold uppercase tracking-tight transition-all duration-200 flex items-center gap-1.5 ${
                      activeTab === tab.id
                        ? 'bg-[var(--accent-color)] text-white shadow-md'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-paper)]'
                    }`}
                  >
                    <i className={`fa-solid ${tab.icon} text-[10px]`}></i>
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </nav>

              <button
                onClick={onClose}
                aria-label="Kapat"
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--bg-paper)] hover:bg-red-500/10 hover:text-red-500 transition-all active:scale-90 text-[var(--text-muted)]"
              >
                <i className="fa-solid fa-times text-sm"></i>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4" role="tabpanel">
              {/* Live Preview (Collapsible) */}
              <div className="mb-4">
                <button
                  onClick={() => setPreviewOpen(!previewOpen)}
                  className="flex items-center gap-2 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.3em] hover:text-[var(--text-primary)] transition-colors"
                  aria-expanded={previewOpen}
                  aria-controls="live-preview"
                >
                  <i className={`fa-solid fa-chevron-${previewOpen ? 'down' : 'right'} text-[8px]`}></i>
                  Canlı Önizleme
                </button>
                <AnimatePresence>
                  {previewOpen && (
                    <motion.div
                      id="live-preview"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
                      className="overflow-hidden"
                    >
                      <div
                        className="mt-3 p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] transition-all duration-300"
                        style={{
                          fontFamily: uiSettings.fontFamily,
                          lineHeight: uiSettings.lineHeight,
                          filter: `saturate(${uiSettings.saturation}%) contrast(${100 + uiSettings.contrastLevel}%)`,
                        }}
                      >
                        <div className="w-8 h-1 bg-[var(--accent-color)] rounded-full mb-3"></div>
                        <h4
                          className="text-base font-bold mb-2 text-[var(--text-primary)]"
                          style={{ fontSize: `${16 * uiSettings.fontSizeScale}px` }}
                        >
                          Disleksi Dostu Tipografi
                        </h4>
                        <p
                          className="text-xs text-[var(--text-secondary)]"
                          style={{ fontSize: `${12 * uiSettings.fontSizeScale}px` }}
                        >
                          Görsel hiyerarşi ve doğru boşluklandırma, disleksi desteği alan çocukların{' '}
                          <span className="text-[var(--accent-color)] font-bold">metinleri %35 daha hızlı</span> anlamlandırmasını sağlar.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Theme Intelligence Recommendation */}
              <AnimatePresence>
                {themeRecommendation && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="mb-4 p-3 rounded-xl bg-[var(--accent-muted)] border border-[var(--accent-color)]/20 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-wand-magic-sparkles text-[var(--accent-color)] text-xs"></i>
                      <span className="text-[11px] font-semibold text-[var(--text-primary)]">
                        Önerilen tema: <strong>{themeRecommendation.theme}</strong>
                        <span className="text-[var(--text-muted)] ml-1">
                          ({Math.round(themeRecommendation.confidence * 100)}% güven)
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          onUpdateTheme(themeRecommendation.theme);
                          themeIntelligence.trackRecommendationAcceptance('system', themeRecommendation.theme, true);
                          setThemeRecommendation(null);
                        }}
                        className="px-2 py-1 rounded-lg text-[10px] font-bold bg-[var(--accent-color)] text-white hover:opacity-90 transition-opacity"
                      >
                        Uygula
                      </button>
                      <button
                        onClick={() => {
                          themeIntelligence.trackRecommendationAcceptance('system', themeRecommendation.theme, false);
                          setThemeRecommendation(null);
                        }}
                        className="px-2 py-1 rounded-lg text-[10px] font-bold text-[var(--text-muted)] hover:bg-[var(--bg-paper)] transition-colors"
                      >
                        Reddet
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Appearance Tab */}
              {activeTab === 'appearance' && (
                <div className="space-y-4" id="panel-appearance" role="tabpanel" aria-labelledby="tab-appearance">
                  {THEME_GROUPS.map((group) => (
                    <section key={group.label}>
                      <h3 className="text-[10px] font-bold text-[var(--text-muted)] tracking-[0.2em] uppercase mb-2 flex items-center gap-2">
                        {group.label}
                        {group.themes.some((t) => t.premium) && (
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            Premium
                          </span>
                        )}
                      </h3>
                      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                        {group.themes.map((t) => (
                          <button
                            key={t.id}
                            onClick={() => onUpdateTheme(t.id)}
                            aria-label={`${t.name} temasını seç`}
                            aria-pressed={theme === t.id}
                            className={`group p-2 rounded-xl border-2 transition-all duration-200 ${
                              theme === t.id
                                ? 'border-[var(--accent-color)] bg-[var(--accent-muted)] shadow-md'
                                : 'border-[var(--border-color)] hover:border-[var(--accent-color)]/30'
                            }`}
                          >
                            <div
                              className="w-full aspect-square rounded-lg mb-1.5 shadow-inner"
                              style={{ backgroundColor: t.color }}
                            ></div>
                            <span className="text-[9px] font-bold text-[var(--text-primary)] block text-center truncate leading-tight">
                              {t.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    </section>
                  ))}

                  {/* Settings Grid */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    {/* Compact Mode */}
                    <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-[11px] uppercase text-[var(--text-primary)]">Kompakt</h4>
                        <p className="text-[9px] text-[var(--text-muted)] mt-0.5">Sıkıştırılmış düzen</p>
                      </div>
                      <button
                        role="switch"
                        aria-checked={uiSettings.compactMode}
                        aria-label="Kompakt mod"
                        onClick={() => updateSetting('compactMode', !uiSettings.compactMode)}
                        className={`w-10 h-6 rounded-full relative transition-colors ${
                          uiSettings.compactMode ? 'bg-[var(--accent-color)]' : 'bg-[var(--bg-paper)] border border-[var(--border-color)]'
                        }`}
                      >
                        <div
                          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                            uiSettings.compactMode ? 'left-5' : 'left-1 shadow-sm'
                          }`}
                        ></div>
                      </button>
                    </div>

                    {/* Glassmorphism */}
                    <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-[11px] uppercase text-[var(--text-primary)]">Cam</h4>
                        <span className="text-[9px] font-bold text-[var(--accent-color)]">
                          {uiSettings.premiumIntensity}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={uiSettings.premiumIntensity}
                        aria-label="Glassmorphism yoğunluğu"
                        onChange={(e) => updateSetting('premiumIntensity', parseInt(e.target.value))}
                        className="w-full h-1 bg-[var(--bg-paper)] rounded-full appearance-none accent-[var(--accent-color)]"
                      />
                    </div>

                    {/* Border Radius */}
                    <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                      <h4 className="font-bold text-[11px] uppercase text-[var(--text-primary)] mb-2">Köşe</h4>
                      <div className="flex gap-1">
                        {BORDER_RADII.map((r) => (
                          <button
                            key={r.id}
                            onClick={() => updateSetting('borderRadius', r.id)}
                            aria-label={`Köşe: ${r.label}`}
                            aria-pressed={uiSettings.borderRadius === r.id}
                            className={`flex-1 py-1.5 rounded-lg text-[9px] font-bold transition-all ${
                              uiSettings.borderRadius === r.id
                                ? 'bg-[var(--accent-color)] text-white'
                                : 'bg-[var(--bg-paper)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                            }`}
                          >
                            {r.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Animation Level */}
                    <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                      <h4 className="font-bold text-[11px] uppercase text-[var(--text-primary)] mb-2">Animasyon</h4>
                      <div className="flex gap-1">
                        {ANIMATION_LEVELS.map((a) => (
                          <button
                            key={a.id}
                            onClick={() => updateSetting('animationLevel', a.id)}
                            aria-label={`Animasyon: ${a.label}`}
                            aria-pressed={uiSettings.animationLevel === a.id}
                            className={`flex-1 py-1.5 rounded-lg text-[9px] font-bold transition-all ${
                              uiSettings.animationLevel === a.id
                                ? 'bg-[var(--accent-color)] text-white'
                                : 'bg-[var(--bg-paper)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                            }`}
                          >
                            {a.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Typography Tab */}
              {activeTab === 'typography' && (
                <div className="space-y-4" id="panel-typography" role="tabpanel" aria-labelledby="tab-typography">
                  {/* Font Selection */}
                  <section>
                    <h3 className="text-[10px] font-bold text-[var(--text-muted)] tracking-[0.2em] uppercase mb-2 flex items-center gap-2">
                      <i className="fa-solid fa-font text-[var(--accent-color)]"></i> Yazı Karakteri
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {FONTS.map((f) => (
                        <button
                          key={f.id}
                          onClick={() => updateSetting('fontFamily', f.id)}
                          aria-label={`${f.id} fontunu seç`}
                          aria-pressed={uiSettings.fontFamily === f.id}
                          className={`p-3 text-left rounded-xl border-2 transition-all duration-200 ${
                            uiSettings.fontFamily === f.id
                              ? 'border-[var(--accent-color)] bg-[var(--accent-muted)]'
                              : 'border-[var(--border-color)] hover:border-[var(--accent-color)]/30'
                          }`}
                        >
                          <span className="block text-lg font-medium mb-1 text-[var(--text-primary)]" style={{ fontFamily: f.id }}>
                            Abc 123
                          </span>
                          <h4 className="text-[11px] font-bold uppercase tracking-tight text-[var(--text-primary)]">{f.name}</h4>
                          <p className="text-[9px] text-[var(--text-muted)]">{f.desc}</p>
                        </button>
                      ))}
                    </div>
                  </section>

                  {/* Font Weight */}
                  <section className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                    <h4 className="font-bold text-[11px] uppercase text-[var(--text-primary)] mb-2">Yazı Kalınlığı</h4>
                    <div className="flex gap-1">
                      {FONT_WEIGHTS.map((w) => (
                        <button
                          key={w.id}
                          onClick={() => updateSetting('fontWeight', w.id)}
                          aria-label={`Yazı kalınlığı: ${w.label}`}
                          aria-pressed={uiSettings.fontWeight === w.id}
                          className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all ${
                            uiSettings.fontWeight === w.id
                              ? 'bg-[var(--accent-color)] text-white'
                              : 'bg-[var(--bg-paper)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                          }`}
                          style={{ fontWeight: w.value as React.CSSProperties['fontWeight'] }}
                        >
                          {w.label}
                        </button>
                      ))}
                    </div>
                  </section>

                  {/* Line Height */}
                  <section className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold text-[11px] uppercase text-[var(--text-primary)]">Satır Aralığı</h4>
                      <span className="px-2 py-0.5 bg-[var(--bg-paper)] rounded-md text-[10px] font-bold text-[var(--accent-color)] border border-[var(--border-color)]">
                        {uiSettings.lineHeight.toFixed(1)}x
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1.0"
                      max="2.5"
                      step="0.1"
                      value={uiSettings.lineHeight}
                      aria-label="Satır aralığı"
                      onChange={(e) => updateSetting('lineHeight', parseFloat(e.target.value))}
                      className="w-full h-1 bg-[var(--bg-paper)] rounded-full appearance-none accent-[var(--accent-color)]"
                    />
                  </section>
                </div>
              )}

              {/* Accessibility Tab */}
              {activeTab === 'accessibility' && (
                <div className="space-y-3" id="panel-accessibility" role="tabpanel" aria-labelledby="tab-accessibility">
                  <h3 className="text-[10px] font-bold text-[var(--text-muted)] tracking-[0.2em] uppercase mb-2 flex items-center gap-2">
                    <i className="fa-solid fa-universal-access text-[var(--accent-color)]"></i> Erişilebilirlik
                  </h3>

                  {/* System Scale */}
                  <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold text-[11px] uppercase text-[var(--text-primary)]">Sistem Ölçeği</h4>
                      <span className="text-[9px] font-bold text-[var(--accent-color)]">
                        %{Math.round(uiSettings.fontSizeScale * 100)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.8"
                      max="1.5"
                      step="0.05"
                      value={uiSettings.fontSizeScale}
                      aria-label="Sistem ölçeği"
                      onChange={(e) => updateSetting('fontSizeScale', parseFloat(e.target.value))}
                      className="w-full h-1 bg-[var(--bg-paper)] rounded-full appearance-none accent-[var(--accent-color)]"
                    />
                  </div>

                  {/* Wide Letter Spacing */}
                  <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-[11px] uppercase text-[var(--text-primary)]">Geniş Harf Aralığı</h4>
                      <p className="text-[9px] text-[var(--text-muted)] mt-0.5">Harf karışıklığını önler</p>
                    </div>
                    <button
                      role="switch"
                      aria-checked={uiSettings.letterSpacing === 'wide'}
                      aria-label="Geniş harf aralığı"
                      onClick={() =>
                        updateSetting('letterSpacing', uiSettings.letterSpacing === 'wide' ? 'normal' : 'wide')
                      }
                      className={`w-10 h-6 rounded-full relative transition-colors ${
                        uiSettings.letterSpacing === 'wide'
                          ? 'bg-[var(--accent-color)]'
                          : 'bg-[var(--bg-paper)] border border-[var(--border-color)]'
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                          uiSettings.letterSpacing === 'wide' ? 'left-5' : 'left-1 shadow-sm'
                        }`}
                      ></div>
                    </button>
                  </div>

                  {/* Saturation */}
                  <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold text-[11px] uppercase text-[var(--text-primary)]">Renk Doygunluğu</h4>
                      <span className="text-[9px] font-bold text-[var(--accent-color)]">{uiSettings.saturation}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={uiSettings.saturation}
                      aria-label="Renk doygunluğu"
                      onChange={(e) => updateSetting('saturation', parseInt(e.target.value))}
                      className="w-full h-1 bg-[var(--bg-paper)] rounded-full appearance-none accent-[var(--accent-color)]"
                    />
                  </div>

                  {/* Dynamic Contrast */}
                  <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold text-[11px] uppercase text-[var(--text-primary)]">Dinamik Kontrast</h4>
                      <span className="text-[9px] font-bold text-[var(--accent-color)]">+{uiSettings.contrastLevel}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      step="5"
                      value={uiSettings.contrastLevel}
                      aria-label="Dinamik kontrast"
                      onChange={(e) => updateSetting('contrastLevel', parseInt(e.target.value))}
                      className="w-full h-1 bg-[var(--bg-paper)] rounded-full appearance-none accent-[var(--accent-color)]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]">
              <button
                onClick={handleReset}
                className="py-1.5 px-3 rounded-lg text-[9px] font-bold text-rose-500 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all uppercase tracking-widest"
                aria-label="Tüm ayarları varsayılana döndür"
              >
                Varsayılana Dön
              </button>
              <span className="text-[9px] text-[var(--text-muted)]">
                {Object.values(THEME_GROUPS).flat().length} tema · 11 ayar
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
