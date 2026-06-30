import React from 'react';
import { StyleSettings } from '../../types';
import { DropdownPanel, NumberControl, Toggle } from './ToolbarShared';
import { useUIStore } from '../../store/useUIStore';
import { usePaperSizeStore } from '../../store/usePaperSizeStore';
import { PaperSize } from '../../utils/printService';
import { PremiumPaperSizeSelector } from '../PremiumPaperSizeSelector';

interface LayoutModuleProps {
  settings: StyleSettings;
  updateSetting: (key: keyof StyleSettings, value: any) => void;
  updateSettings: (updates: Partial<StyleSettings>) => void;
  isOpen: boolean;
  onClose: () => void;
}

const BORDER_THEMES = [
  { value: 'none', label: 'Yok', icon: 'fa-xmark' },
  { value: 'simple', label: 'Düz', icon: 'fa-square' },
  { value: 'math', label: 'Matematik', icon: 'fa-calculator' },
  { value: 'verbal', label: 'Sözel', icon: 'fa-book' },
  { value: 'stars', label: 'Yıldız', icon: 'fa-star' },
  { value: 'geo', label: 'Geometri', icon: 'fa-shapes' },
] as const;

const BORDER_COLORS = [
  { color: '#3f3f46', label: 'Klasik' },
  { color: '#1e40af', label: 'Okyanus' },
  { color: '#166534', label: 'Orman' },
  { color: '#c2410c', label: 'Gün batımı' },
  { color: '#581c87', label: 'Uzay' },
  { color: '#be185d', label: 'Gül' },
];

const PAPER_TEXTURES = [
    { id: 'none', label: 'Yok', icon: 'fa-ban', color: 'bg-white' },
    { id: 'ruled', label: 'Çizgili', icon: 'fa-list', color: 'bg-indigo-50/50' },
    { id: 'grid', label: 'Kareli', icon: 'fa-table-cells', color: 'bg-blue-50/50' },
    { id: 'dotted', label: 'Noktalı', icon: 'fa-ellipsis', color: 'bg-slate-50/50' },
    { id: 'parchment', label: 'Eski', icon: 'fa-scroll', color: 'bg-orange-50/50' },
    { id: 'sepia', label: 'Sepya', icon: 'fa-layer-group', color: 'bg-amber-100/50' },
    { id: 'saman', label: 'Saman', icon: 'fa-rug', color: 'bg-yellow-50/50' },
];

export const LayoutModule = ({
  settings,
  updateSetting,
  updateSettings,
  isOpen,
  onClose,
}: LayoutModuleProps) => {
  const paperSizeStore = usePaperSizeStore();
  const showPedagogicalNote = useUIStore((state) => state.styleSettings.showPedagogicalNote);
  const updateStyleSettings = useUIStore((state) => state.updateStyleSettings);
  
  if (!isOpen) return null;

  return (
    <DropdownPanel
      title="MİZANPAJ & KAĞIT"
      icon="fa-table-cells-large"
      onClose={onClose}
      className="w-80 md:w-96"
    >
      {/* Kağıt Geometrisi */}
      <div className="bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-2xl p-3 border border-indigo-500/10 mb-4 space-y-3">
        <label className="text-[10px] font-black uppercase text-indigo-700 dark:text-indigo-300 tracking-[0.2em] flex items-center gap-2 mb-2">
          <i className="fa-solid fa-file-invoice"></i> Kağıt Yapılandırması
        </label>
        
        <div className="flex items-center justify-between gap-4">
          <span className="text-[11px] font-bold text-[var(--text-secondary)]">Kağıt Boyutu</span>
          <PremiumPaperSizeSelector
            value={paperSizeStore.paperSize}
            onChange={(p: PaperSize) => {
              paperSizeStore.setPaperSize(p);
              if (p === 'Extreme_Yatay') {
                updateSettings({
                  orientation: 'landscape',
                  columns: 2,
                  compact: true,
                  margin: 10,
                });
              } else if (p === 'Extreme_Dikey') {
                updateSettings({
                  orientation: 'portrait',
                  columns: 1,
                  compact: false,
                  margin: 15,
                });
              }
            }}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
           <NumberControl
            label="Sütun"
            icon="fa-columns"
            value={settings.columns || 1}
            onChange={(v: number) => updateSetting('columns', v)}
            min={1}
            max={4}
          />
          <NumberControl
            label="Kanal (Gutter)"
            icon="fa-arrows-left-right"
            value={settings.gutter || 20}
            onChange={(v: number) => updateSetting('gutter', v)}
            min={0}
            max={100}
            step={5}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
           <NumberControl
            label="Marj (mm)"
            icon="fa-maximize"
            value={settings.margin || 15}
            onChange={(v: number) => updateSetting('margin', v)}
            min={5}
            max={50}
          />
           <NumberControl
            label="İçerik Ölçeği"
            icon="fa-expand"
            value={settings.contentScale || 1}
            onChange={(v: number) => updateSetting('contentScale', v)}
            min={0.5}
            max={1.5}
            step={0.05}
          />
           <Toggle
            label="Kompakt"
            icon="fa-compress-arrows-alt"
            checked={settings.compact}
            onChange={(v: boolean) => updateSetting('compact', v)}
            />
        </div>
      </div>

       {/* Kağıt Dokusu */}
       <div className="bg-[var(--bg-paper)] p-3 rounded-2xl border border-[var(--border-color)] shadow-sm mb-4">
          <label className="text-[10px] font-black text-[var(--accent-color)] uppercase tracking-[0.2em] mb-3 block flex items-center gap-2">
            <i className="fa-solid fa-scroll"></i> Kağıt Dokusu
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {PAPER_TEXTURES.map((tx) => (
                <button
                key={tx.id}
                onClick={() => updateSetting('paperTexture', tx.id)}
                className={`flex flex-col items-center gap-1.5 p-1.5 rounded-xl border-2 transition-all text-[9px] ${
                    settings.paperTexture === tx.id
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-bold scale-105 shadow-sm'
                    : 'border-transparent text-[var(--text-muted)] hover:border-indigo-200'
                }`}
                >
                <div className={`w-9 h-9 rounded-lg border border-[var(--border-color)] ${tx.color} flex items-center justify-center shadow-inner`}>
                    <i className={`fa-solid ${tx.icon} ${settings.paperTexture === tx.id ? 'text-indigo-500' : 'opacity-30'}`}></i>
                </div>
                {tx.label}
                </button>
            ))}
          </div>
       </div>

      {/* Öğretmen Notu Gösterimi */}
      <div className="bg-gradient-to-br from-amber-500/5 to-orange-500/5 rounded-2xl p-3 border border-amber-500/10 shadow-sm mb-4">
        <Toggle
          label="Öğretmen / Pedagojik Notu Göster"
          icon="fa-graduation-cap"
          checked={showPedagogicalNote}
          onChange={(v: boolean) => updateStyleSettings({ showPedagogicalNote: v })}
        />
        <p className="text-[9px] text-[var(--text-muted)] mt-2 font-medium leading-relaxed italic">
          Yazdırma önizlemesinde ve PDF çıktısında pedagojik notun görünürlüğünü kontrol eder.
        </p>
      </div>

      {/* Akıllı Paketler */}
      <div className="bg-indigo-600/5 p-3 rounded-2xl border border-indigo-500/20 mb-4">
          <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-3 block flex items-center justify-between">
            <span><i className="fa-solid fa-wand-magic-sparkles mr-1.5"></i> Akıllı Paketler</span>
            <button 
                onClick={() => {
                   updateSettings({
                       fontSize: 18,
                       lineHeight: 1.8,
                       letterSpacing: 1.5,
                       wordSpacing: 4,
                       fontFamily: 'Lexend',
                       margin: 20,
                       compact: false,
                       gutter: 30
                   });
                }}
                className="text-[9px] bg-indigo-600 text-white px-2 py-0.5 rounded-full hover:bg-indigo-700 transition-colors"
            >
                AI OPTİMİZE ET
            </button>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
                { 
                    label: 'Disleksi', 
                    icon: 'fa-brain', 
                    settings: { fontFamily: 'Lexend', fontSize: 20, lineHeight: 2, letterSpacing: 2, wordSpacing: 5, paperTexture: 'none' as const } 
                },
                { 
                    label: 'Sınav', 
                    icon: 'fa-file-signature', 
                    settings: { fontFamily: 'Inter', fontSize: 13, lineHeight: 1.4, letterSpacing: 0, wordSpacing: 0, paperTexture: 'ruled' as const } 
                },
                { 
                    label: 'Eski Kitap', 
                    icon: 'fa-book-open', 
                    settings: { fontFamily: 'OpenDyslexic', fontSize: 16, lineHeight: 1.6, paperTexture: 'parchment' as const, themeBorder: 'simple' as const } 
                }
            ].map((preset) => (
                <button
                    key={preset.label}
                    onClick={() => updateSettings(preset.settings as Partial<StyleSettings>)}
                    className="flex flex-col items-center gap-1.5 p-2 rounded-xl border border-indigo-500/10 bg-white hover:border-indigo-500/30 transition-all hover:scale-105 shadow-sm"
                >
                    <i className={`fa-solid ${preset.icon} text-indigo-500 text-sm`}></i>
                    <span className="text-[9px] font-bold text-[var(--text-secondary)]">{preset.label}</span>
                </button>
            ))}
          </div>
       </div>

      {/* Kenarlık ve Temalar */}
      <div className="space-y-4">
        <div className="bg-[var(--bg-paper)] p-3 rounded-2xl border border-[var(--border-color)] shadow-sm">
          <label className="text-[10px] font-black text-[var(--accent-color)] uppercase tracking-[0.2em] mb-3 block flex items-center gap-2">
            <i className="fa-solid fa-border-all"></i> Kenarlık Teması
          </label>
          <div className="grid grid-cols-3 gap-2">
            {BORDER_THEMES.map((theme) => (
              <button
                key={theme.value}
                onClick={() => updateSetting('themeBorder', theme.value)}
                className={`flex flex-col items-center py-2.5 rounded-xl border-2 transition-all text-[10px] gap-1 ${
                  settings.themeBorder === theme.value
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-bold shadow-sm'
                    : 'border-[var(--border-color)] text-[var(--text-muted)] hover:border-indigo-400/30'
                }`}
              >
                <i className={`fa-solid ${theme.icon} text-base mb-0.5`}></i>
                {theme.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[var(--bg-paper)] p-3 rounded-2xl border border-[var(--border-color)] shadow-sm">
          <label className="text-[10px] font-black text-[var(--accent-color)] uppercase tracking-[0.2em] mb-3 block flex items-center gap-2">
            <i className="fa-solid fa-palette"></i> Kenarlık Rengi
          </label>
          <div className="flex gap-2.5 flex-wrap justify-center">
            {BORDER_COLORS.map((p) => (
              <button
                key={p.color}
                title={p.label}
                onClick={() => updateSetting('borderColor', p.color)}
                className={`w-8 h-8 rounded-full border-4 transition-all duration-300 ${
                  settings.borderColor === p.color
                    ? 'border-white ring-2 ring-indigo-500 scale-110 shadow-lg'
                    : 'border-transparent hover:scale-110 shadow-sm'
                }`}
                style={{ backgroundColor: p.color }}
              />
            ))}
          </div>
        </div>

        {/* Altbilgi */}
        <div className="bg-[var(--bg-paper)] p-3 rounded-2xl border border-[var(--border-color)] shadow-sm">
           <label className="text-[10px] font-black text-[var(--accent-color)] uppercase tracking-[0.2em] mb-2 block flex items-center gap-2">
            <i className="fa-solid fa-shoe-prints"></i> Sayfa Altbilgisi
          </label>
          <Toggle
            label="Altbilgiyi Göster"
            checked={settings.showFooter !== false}
            onChange={(v: boolean) => updateSetting('showFooter', v)}
          />
          {settings.showFooter !== false && (
            <div className="mt-2 group relative">
                <input
                  type="text"
                  placeholder="Özel altbilgi metni..."
                  value={settings.footerText || ''}
                  onChange={(e: any) => updateSetting('footerText', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-paper)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-indigo-500 outline-none transition-all"
                />
                <i className="fa-solid fa-keyboard absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-indigo-500 text-[10px]"></i>
            </div>
          )}
        </div>
      </div>
    </DropdownPanel>
  );
};
