// @ts-nocheck

import React, { useState, useRef, useEffect } from 'react';
import { StyleSettings, WorksheetData } from '../types';
import { usePaperSizeStore } from '../store/usePaperSizeStore';
import { printService, PaperSize } from '../utils/printService';
import { snapshotService, SnapshotAction } from '../utils/snapshotService';
import { PremiumPaperSizeSelector } from './PremiumPaperSizeSelector';
import { ExportProgressModal } from './ExportProgressModal';
import { useA4EditorStore } from '../store/useA4EditorStore';
import { useToastStore } from '../store/useToastStore';

interface ToolbarProps {
  settings: StyleSettings;
  onSettingsChange: (newSettings: StyleSettings) => void;
  onSave: () => void;
  onFeedback?: () => void;
  onShare?: () => void;
  onTogglePreview: () => void;
  isPreviewMode: boolean;
  onAddToWorkbook?: () => void;
  workbookItemCount?: number;
  onViewWorkbook?: () => void;
  onToggleEdit?: () => void;
  isEditMode?: boolean;
  onSnapshot?: () => void;
  onAddText?: () => void;
  onAddSticker?: (url: string) => void;
  onSpeak?: () => void;
  isSpeaking?: boolean;
  onStopSpeak?: () => void;
  showQR?: boolean;
  onToggleQR?: () => void;
  worksheetData?: WorksheetData;
  isCurriculumMode?: boolean;
  onCompleteCurriculumTask?: () => void;
}

const Divider = () => (
  <div className="h-10 w-px bg-gradient-to-b from-transparent via-[var(--border-color)] to-transparent mx-3 self-center opacity-50"></div>
);

const IconButton = ({
  icon,
  onClick,
  active,
  title,
  disabled,
  badge,
  colorClass,
  isLoading,
  variant = 'default',
}: any) => {
  const variants = {
    default: active
      ? 'bg-[var(--accent-color)] text-white shadow-[0_0_15px_rgba(var(--accent-rgb),0.4)] scale-105'
      : 'text-[var(--text-secondary)] hover:bg-white/10 hover:text-[var(--text-primary)] hover:shadow-lg',
    premium:
      'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-orange-200 hover:shadow-orange-300 hover:scale-110',
    danger: 'hover:bg-red-50 text-red-500 hover:text-red-600',
    ghost: 'hover:bg-gray-100/50 text-gray-500 hover:text-gray-900',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      title={title}
      className={`relative w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 transform active:scale-95 ${variants[variant] || variants.default} ${colorClass || ''} ${disabled || isLoading ? 'opacity-40 cursor-not-allowed' : ''}`}
    >
      {isLoading ? (
        <i className="fa-solid fa-circle-notch fa-spin text-sm"></i>
      ) : (
        <i className={`fa-solid ${icon} text-base`}></i>
      )}
      {badge > 0 && !isLoading && (
        <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-black h-5 min-w-[20px] px-1.5 rounded-full flex items-center justify-center border-2 border-[var(--bg-paper)] shadow-sm animate-pulse">
          {badge}
        </span>
      )}
    </button>
  );
};

const MenuButton = ({ icon, label, onClick, active, isOpen, color = 'indigo' }: any) => {
  const colorClasses = {
    indigo: 'text-indigo-600 border-indigo-100 bg-indigo-50/30',
    emerald: 'text-emerald-600 border-emerald-100 bg-emerald-50/30',
    amber: 'text-amber-600 border-amber-100 bg-amber-50/30',
    violet: 'text-violet-600 border-violet-100 bg-violet-50/30',
  };

  return (
    <button
      onClick={onClick}
      data-dropdown-trigger
      className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border-2 select-none group relative overflow-hidden ${
        active || isOpen
          ? `${colorClasses[color]} border-current shadow-sm`
          : 'bg-white/60 backdrop-blur-md border-transparent text-[var(--text-secondary)] hover:border-[var(--border-color)] hover:bg-white/80'
      }`}
    >
      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-r from-transparent via-white to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000`}
      ></div>
      <i
        className={`fa-solid ${icon} text-sm transition-transform group-hover:scale-110 ${active || isOpen ? 'scale-110' : 'text-[var(--text-muted)]'}`}
      ></i>
      <span className="hidden lg:inline tracking-tight">{label}</span>
      <i
        className={`fa-solid fa-chevron-down text-[10px] opacity-40 transition-transform duration-500 ${isOpen ? 'rotate-180 opacity-100' : ''}`}
      ></i>
    </button>
  );
};

const NumberControl = ({ label, value, onChange, min, max, step = 1, unit = '', icon }: any) => (
  <div className="flex items-center justify-between py-2 group/row">
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-1.5 group-hover/row:text-[var(--accent-color)] transition-colors">
        {icon && <i className={`fa-solid ${icon} opacity-50`}></i>}
        {label}
      </span>
      <span className="text-[9px] text-[var(--text-muted)] font-medium">
        Değer: {value}
        {unit}
      </span>
    </div>
    <div className="flex items-center gap-1.5 bg-white/50 backdrop-blur-sm rounded-xl p-1 border border-[var(--border-color)] shadow-sm">
      <button
        onClick={() => onChange(Math.max(min, value - step))}
        className="w-7 h-7 flex items-center justify-center text-[var(--text-secondary)] hover:bg-white hover:text-[var(--accent-color)] hover:shadow-sm rounded-lg transition-all active:scale-90"
        disabled={value <= min}
      >
        <i className="fa-solid fa-minus text-[10px]"></i>
      </button>
      <div className="w-12 text-center">
        <span className="text-xs font-mono font-black text-[var(--text-primary)]">
          {Math.round(value * 100) / 100}
        </span>
      </div>
      <button
        onClick={() => onChange(Math.min(max, value + step))}
        className="w-7 h-7 flex items-center justify-center text-[var(--text-secondary)] hover:bg-white hover:text-[var(--accent-color)] hover:shadow-sm rounded-lg transition-all active:scale-90"
        disabled={value >= max}
      >
        <i className="fa-solid fa-plus text-[10px]"></i>
      </button>
    </div>
  </div>
);

const Toggle = ({ label, description, checked, onChange, icon }: any) => (
  <div
    className="flex items-center justify-between py-2.5 cursor-pointer group/toggle"
    onClick={() => onChange(!checked)}
  >
    <div className="flex items-center gap-3">
      {icon && (
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${checked ? 'bg-[var(--accent-muted)] text-[var(--accent-color)]' : 'bg-gray-100 text-gray-400'}`}
        >
          <i className={`fa-solid ${icon} text-xs`}></i>
        </div>
      )}
      <div className="flex flex-col">
        <span className="text-xs font-bold text-[var(--text-primary)] group-hover/toggle:text-[var(--accent-color)] transition-colors">
          {label}
        </span>
        {description && (
          <span className="text-[9px] text-[var(--text-muted)] leading-tight">{description}</span>
        )}
      </div>
    </div>
    <div
      className={`w-10 h-5 rounded-full relative transition-all duration-300 ${checked ? 'bg-[var(--accent-color)] shadow-[0_0_10px_rgba(var(--accent-rgb),0.3)]' : 'bg-gray-200'}`}
    >
      <div
        className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-md transition-all duration-300 ${checked ? 'left-6 scale-110' : 'left-1 scale-100'}`}
      ></div>
    </div>
  </div>
);

const DropdownPanel = ({ title, icon, children, onClose, className = '' }: any) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        const target = event.target as HTMLElement;
        if (!target.closest('button[data-dropdown-trigger]')) onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className={`absolute top-full mt-3 left-0 bg-white/90 backdrop-blur-2xl border border-white/40 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-[100] p-6 animate-in fade-in zoom-in-95 slide-in-from-top-4 duration-300 origin-top-left ring-1 ring-black/5 ${className}`}
    >
      <div className="flex justify-between items-center mb-5 pb-4 border-b border-gray-100/50">
        <div className="flex items-center gap-2.5">
          {icon && (
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center">
              <i className={`fa-solid ${icon} text-xs`}></i>
            </div>
          )}
          <h4 className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-[0.25em]">
            {title}
          </h4>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all"
        >
          <i className="fa-solid fa-times text-xs"></i>
        </button>
      </div>
      <div className="space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">{children}</div>
    </div>
  );
};

export const Toolbar: React.FC<ToolbarProps> = ({
  settings,
  onSettingsChange,
  onSave,
  onFeedback,
  onShare,
  onTogglePreview,
  isPreviewMode,
  onAddToWorkbook,
  workbookItemCount,
  onToggleEdit,
  isEditMode,
  onAddSticker,
  onSpeak,
  isSpeaking,
  onStopSpeak,
  showQR,
  onToggleQR,
  worksheetData,
  isCurriculumMode,
  onCompleteCurriculumTask,
}) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [snapshotMenuOpen, setSnapshotMenuOpen] = useState(false);
  const [exportProgress, setExportProgress] = useState({ open: false, percent: 0, message: '' });
  const snapshotMenuRef = useRef<HTMLDivElement>(null);
  const paperSizeStore = usePaperSizeStore();
  const toast = useToastStore();
  const paperSize = paperSizeStore.paperSize;
  const setPaperSize = paperSizeStore.setPaperSize;
  const { isEditorOpen, setEditorOpen } = useA4EditorStore();

  // Snapshot dropdown dışarı tıklanınca kapat
  useEffect(() => {
    if (!snapshotMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (snapshotMenuRef.current && !snapshotMenuRef.current.contains(e.target as Node)) {
        setSnapshotMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [snapshotMenuOpen]);

  const updateSetting = (key: keyof StyleSettings, value: any) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const applyPreset = (preset: Partial<StyleSettings>, name: string) => {
    onSettingsChange({ ...settings, ...preset });
    toast.success(`${name} profili başarıyla uygulandı!`);
  };

  // Klavye Kısayolları (Premium Geliştirme)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 's':
            e.preventDefault();
            onSave();
            break;
          case 'p': {
            e.preventDefault();
            const targetSelector = document.getElementById('print-container')
              ? '#print-container'
              : '.worksheet-page';
            printService.generatePdf(targetSelector, settings.title, {
              action: 'print',
              paperSize: paperSize,
            });
            break;
          }
          case 'b':
            if (e.shiftKey) {
              e.preventDefault();
              updateSetting('bionicReading', !settings.bionicReading);
            }
            break;
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSave, settings, paperSize]);

  return (
    <div className="flex items-center justify-between gap-3 h-16 px-4 select-none relative bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl shadow-sm">
      <div className="flex items-center gap-2.5">
        {/* Tipografi Grubu - FRONTEND MÜHENDİSİ */}
        <div className="relative">
          <MenuButton
            icon="fa-font"
            label="Tipografi"
            color="indigo"
            isOpen={activeMenu === 'typo'}
            onClick={() => setActiveMenu(activeMenu === 'typo' ? null : 'typo')}
          />
          {activeMenu === 'typo' && (
            <DropdownPanel
              title="Gelişmiş Yazı Kontrolleri"
              icon="fa-sliders"
              onClose={() => setActiveMenu(null)}
              className="w-85"
            >
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                  <NumberControl
                    label="Punto (Hassas)"
                    icon="fa-text-height"
                    value={settings.fontSize}
                    onChange={(v: any) => updateSetting('fontSize', v)}
                    min={10}
                    max={72}
                    step={0.5}
                  />
                  <NumberControl
                    label="Satır Yüksekliği"
                    icon="fa-arrows-left-right-to-line"
                    value={settings.lineHeight}
                    onChange={(v: any) => updateSetting('lineHeight', v)}
                    min={0.8}
                    max={4}
                    step={0.1}
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                    Font Ailesi
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'Lexend', name: 'Lexend (Okuma)', desc: 'Dyslexia Dostu' },
                      { id: 'OpenDyslexic', name: 'OpenDyslexic', desc: 'Klinik Standart' },
                      { id: 'Inter', name: 'Inter (Modern)', desc: 'Net Görünüm' },
                      { id: 'Comic Neue', name: 'Comic Neue', desc: 'Samimi' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => updateSetting('fontFamily', f.id)}
                        className={`group flex flex-col p-3 rounded-2xl border-2 transition-all text-left ${
                          settings.fontFamily === f.id
                            ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                            : 'border-transparent bg-white hover:border-gray-200 hover:shadow-md'
                        }`}
                      >
                        <span className="text-xs font-bold" style={{ fontFamily: f.id }}>
                          {f.name}
                        </span>
                        <span className="text-[9px] text-gray-400">{f.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                    Uzman Okuma Desteği
                  </label>
                  <Toggle
                    label="Biyonik Okuma"
                    description="Kelimelerin ilk harflerini vurgular."
                    checked={settings.bionicReading}
                    onChange={(v) => updateSetting('bionicReading', v)}
                    icon="fa-bolt"
                  />
                  <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
                    {['none', 'uppercase', 'lowercase', 'capitalize'].map((c) => (
                      <button
                        key={c}
                        onClick={() => updateSetting('letterCase', c)}
                        className={`flex-1 py-2 text-[9px] font-black uppercase rounded-lg transition-all ${settings.letterCase === c ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                      >
                        {c === 'none' ? 'Aa' : c.substring(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </DropdownPanel>
          )}
        </div>

        {/* Klinik Odak - ÖZEL ÖĞRENME PROFESÖRÜ */}
        <div className="relative">
          <MenuButton
            icon="fa-brain"
            label="Klinik Panel"
            color="emerald"
            active={settings.focusMode || settings.colorOverlay}
            isOpen={activeMenu === 'clinical'}
            onClick={() => setActiveMenu(activeMenu === 'clinical' ? null : 'clinical')}
          />
          {activeMenu === 'clinical' && (
            <DropdownPanel
              title="Erişilebilirlik ve Odak"
              icon="fa-universal-access"
              onClose={() => setActiveMenu(null)}
              className="w-80"
            >
              <div className="space-y-4">
                <div className="bg-emerald-50/30 p-4 rounded-2xl border border-emerald-100/50">
                  <Toggle
                    label="Okuma Cetveli"
                    description="Satır takibini kolaylaştırır."
                    checked={settings.focusMode}
                    onChange={(v: any) => updateSetting('focusMode', v)}
                    icon="fa-grip-lines"
                  />
                  {settings.focusMode && (
                    <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-2">
                      <NumberControl
                        label="Cetvel Yüksekliği"
                        value={settings.rulerHeight || 80}
                        onChange={(v: any) => updateSetting('rulerHeight', v)}
                        min={40}
                        max={300}
                      />
                      <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                        {['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#000000', '#ec4899'].map(
                          (c) => (
                            <button
                              key={c}
                              onClick={() => updateSetting('rulerColor', c)}
                              className={`flex-shrink-0 w-8 h-8 rounded-full border-2 transition-all ${settings.rulerColor === c ? 'border-emerald-500 scale-110 shadow-lg' : 'border-white'}`}
                              style={{ backgroundColor: c }}
                            />
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <i className="fa-solid fa-droplet"></i> Renk Katmanları (Irlen)
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { color: 'transparent', label: 'Yok' },
                      { color: '#fff9c4', label: 'Sarı' },
                      { color: '#e1f5fe', label: 'Mavi' },
                      { color: '#f1f8e9', label: 'Yeşil' },
                      { color: '#fce4ec', label: 'Pembe' },
                    ].map((o) => (
                      <button
                        key={o.color}
                        onClick={() =>
                          updateSetting('colorOverlay', o.color === 'transparent' ? undefined : o.color)
                        }
                        className={`h-10 rounded-xl border-2 transition-all ${
                          (settings.colorOverlay || 'transparent') === o.color
                            ? 'border-emerald-500 scale-105 shadow-md'
                            : 'border-gray-100 hover:border-gray-200'
                        }`}
                        style={{ backgroundColor: o.color === 'transparent' ? '#fff' : o.color }}
                        title={o.label}
                      >
                        {o.color === 'transparent' && (
                          <i className="fa-solid fa-slash text-[10px] text-gray-300"></i>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <Toggle
                    label="Heceleri Vurgula"
                    description="Okumayı hızlandıran heceleme desteği."
                    checked={settings.syllableHighlight}
                    onChange={(v) => updateSetting('syllableHighlight', v)}
                    icon="fa-layer-group"
                  />
                </div>
              </div>
            </DropdownPanel>
          )}
        </div>

        {/* Mizanpaj & Baskı - MİZANPAJ & BASKI MÜHENDİSİ */}
        <div className="relative">
          <MenuButton
            icon="fa-scroll"
            label="Mühendislik"
            color="amber"
            isOpen={activeMenu === 'layout'}
            onClick={() => setActiveMenu(activeMenu === 'layout' ? null : 'layout')}
          />
          {activeMenu === 'layout' && (
            <DropdownPanel
              title="Baskı ve Mizanpaj Mühendisliği"
              icon="fa-compass-drafting"
              onClose={() => setActiveMenu(null)}
              className="w-90"
            >
              <div className="space-y-6">
                <div className="bg-amber-50/30 p-4 rounded-2xl border border-amber-100/50">
                  <div className="flex gap-4">
                    <button
                      onClick={() => updateSetting('orientation', 'portrait')}
                      className={`flex-1 flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${settings.orientation !== 'landscape' ? 'border-amber-500 bg-white shadow-sm' : 'border-transparent bg-gray-100'}`}
                    >
                      <i className="fa-solid fa-file-lines text-lg text-amber-500"></i>
                      <span className="text-[11px] font-bold">DİKEY (A4)</span>
                    </button>
                    <button
                      onClick={() => updateSetting('orientation', 'landscape')}
                      className={`flex-1 flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${settings.orientation === 'landscape' ? 'border-amber-500 bg-white shadow-sm' : 'border-transparent bg-gray-100'}`}
                    >
                      <i className="fa-solid fa-file-lines text-lg rotate-90 text-amber-500"></i>
                      <span className="text-[11px] font-bold">YATAY</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                      Sayfa Yapısı
                    </label>
                    <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-1">
                      <NumberControl
                        label="Kenar Boşluğu (Margin)"
                        value={settings.margin || 15}
                        onChange={(v: any) => updateSetting('margin', v)}
                        min={5}
                        max={50}
                        unit="mm"
                      />
                      <NumberControl
                        label="Izgara Sıklığı"
                        value={settings.gridSize || 20}
                        onChange={(v: any) => updateSetting('gridSize', v)}
                        min={10}
                        max={100}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 px-1">
                    <Toggle
                      label="Baskı İşaretleri"
                      description="Kesim ve hizalama işaretlerini göster."
                      checked={settings.showPrintMarks}
                      onChange={(v) => updateSetting('showPrintMarks', v)}
                      icon="fa-crop-simple"
                    />
                    <Toggle
                      label="Akıllı Sayfalandırma"
                      description="İçeriği otomatik olarak sayfalara böler."
                      checked={settings.smartPagination !== false}
                      onChange={(v) => updateSetting('smartPagination', v)}
                      icon="fa-file-export"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                    Kılavuz Sistemi
                  </label>
                  <div className="flex bg-gray-100 p-1 rounded-xl">
                    {[
                      { id: 'none', icon: 'fa-slash' },
                      { id: 'rule', icon: 'fa-equals' },
                      { id: 'grid', icon: 'fa-border-all' },
                      { id: 'dot', icon: 'fa-ellipsis' },
                    ].map((g) => (
                      <button
                        key={g.id}
                        onClick={() => updateSetting('gridSystem', g.id)}
                        className={`flex-1 py-2 rounded-lg transition-all ${settings.gridSystem === g.id ? 'bg-white shadow-sm text-amber-600' : 'text-gray-400 hover:text-gray-600'}`}
                      >
                        <i className={`fa-solid ${g.icon} text-xs`}></i>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </DropdownPanel>
          )}
        </div>

        {/* Görsel Tasarım - GRAFİKER */}
        <div className="relative">
          <MenuButton
            icon="fa-palette"
            label="Kreatif"
            color="violet"
            isOpen={activeMenu === 'design'}
            onClick={() => setActiveMenu(activeMenu === 'design' ? null : 'design')}
          />
          {activeMenu === 'design' && (
            <DropdownPanel
              title="Görsel Tasarım ve Temalar"
              icon="fa-wand-magic-sparkles"
              onClose={() => setActiveMenu(null)}
              className="w-96"
            >
              <div className="space-y-6">
                {/* Hazır Profiller (Expert Presets) */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-violet-500 uppercase tracking-widest px-1">
                    Uzman Tasarım Hazır Ayarları
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() =>
                        applyPreset(
                          {
                            fontSize: 22,
                            fontFamily: 'OpenDyslexic',
                            lineHeight: 2,
                            letterSpacing: 2,
                            focusMode: true,
                            rulerColor: '#6366f1',
                            colorOverlay: '#fff9c4',
                          },
                          'Disleksi Dostu'
                        )
                      }
                      className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 hover:border-indigo-300 transition-all text-left group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <i className="fa-solid fa-brain"></i>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black text-indigo-900">DİSLEKSİ ODAK</span>
                        <span className="text-[9px] text-indigo-400">Yüksek okunabilirlik</span>
                      </div>
                    </button>
                    <button
                      onClick={() =>
                        applyPreset(
                          {
                            fontSize: 18,
                            fontFamily: 'Lexend',
                            lineHeight: 1.5,
                            themeBorder: 'simple',
                            showMascot: true,
                            showPedagogicalNote: true,
                          },
                          'Klasik Eğitim'
                        )
                      }
                      className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 hover:border-emerald-300 transition-all text-left group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <i className="fa-solid fa-graduation-cap"></i>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black text-emerald-900">KLASİK EĞİTİM</span>
                        <span className="text-[9px] text-emerald-400">Dengeli mizanpaj</span>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-gray-100">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                    Sayfa Kenarlığı
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'none', label: 'Yalın', icon: 'fa-square' },
                      { id: 'simple', label: 'Minimal', icon: 'fa-square-check' },
                      { id: 'math', label: 'Kareli', icon: 'fa-table-cells' },
                      { id: 'verbal', label: 'Çizgili', icon: 'fa-list' },
                      { id: 'stars', label: 'Eğlenceli', icon: 'fa-star' },
                      { id: 'geo', label: 'Geometrik', icon: 'fa-shapes' },
                    ].map((b) => (
                      <button
                        key={b.id}
                        onClick={() => updateSetting('themeBorder', b.id)}
                        className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${settings.themeBorder === b.id ? 'border-violet-500 bg-violet-50 shadow-sm' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                      >
                        <i
                          className={`fa-solid ${b.icon} text-sm ${settings.themeBorder === b.id ? 'text-violet-500' : 'text-gray-400'}`}
                        ></i>
                        <span className="text-[9px] font-black uppercase">{b.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                    Renk Paleti
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {[
                      { color: '#3f3f46', name: 'Kömür' },
                      { color: '#6366f1', name: 'İndigo' },
                      { color: '#10b981', name: 'Zümrüt' },
                      { color: '#f59e0b', name: 'Kehribar' },
                      { color: '#ec4899', name: 'Gül' },
                      { color: '#8b5cf6', name: 'Menekşe' },
                    ].map((c) => (
                      <button
                        key={c.color}
                        onClick={() => updateSetting('borderColor', c.color)}
                        className={`w-9 h-9 rounded-full border-4 transition-all transform hover:scale-110 active:scale-90 ${settings.borderColor === c.color ? 'border-white ring-2 ring-violet-500 shadow-lg' : 'border-transparent shadow-sm'}`}
                        style={{ backgroundColor: c.color }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 space-y-3">
                  <Toggle
                    label="Maskot ve Karakterler"
                    description="Öğrenci motivasyonu için görsel destek."
                    checked={settings.showMascot !== false}
                    onChange={(v) => updateSetting('showMascot', v)}
                    icon="fa-face-smile"
                  />
                  <Toggle
                    label="Pedagojik Notlar"
                    description="Öğretmenler için uygulama ipuçları."
                    checked={settings.showPedagogicalNote !== false}
                    onChange={(v) => updateSetting('showPedagogicalNote', v)}
                    icon="fa-lightbulb"
                  />
                </div>
              </div>
            </DropdownPanel>
          )}
        </div>
      </div>

      <Divider />

      <div className="flex items-center gap-1.5">
        <IconButton
          icon="fa-wand-magic-sparkles"
          title="A4 Tasarımcısı"
          active={isEditorOpen}
          onClick={() => setEditorOpen(!isEditorOpen)}
          colorClass={isEditorOpen ? 'bg-indigo-600 !text-white' : ''}
        />
        <IconButton
          icon={isSpeaking ? 'fa-stop' : 'fa-volume-high'}
          title="Sesli Oku"
          active={isSpeaking}
          onClick={isSpeaking ? onStopSpeak : onSpeak}
          colorClass={isSpeaking ? 'text-red-500 animate-pulse' : ''}
        />
      </div>

      <Divider />

      {/* ═══════ PREMIUM AKSİYON ÇUBUĞU ═══════ */}
      <div className="flex items-center gap-3">
        {/* Dışa Aktarma Grubu */}
        <div className="flex items-center bg-white/60 backdrop-blur-md border border-white/80 rounded-2xl p-1.5 gap-1 shadow-lg ring-1 ring-black/5">
          <button
            title="PDF Olarak İndir"
            onClick={async () => {
              try {
                setExportProgress({
                  open: true,
                  percent: 0,
                  message: 'Yüksek kaliteli PDF hazırlanıyor...',
                });
                const targetSelector = document.getElementById('print-container')
                  ? '#print-container'
                  : '.worksheet-page';
                await printService.generatePdf(targetSelector, settings.title, {
                  action: 'download',
                  paperSize: paperSize,
                  onProgress: (percent, message) => {
                    setExportProgress({ open: true, percent, message });
                  },
                });
                toast.success('PDF başarıyla indirildi!');
              } catch (e) {
                toast.error('PDF oluşturulamadı.');
              } finally {
                setTimeout(() => setExportProgress({ open: false, percent: 0, message: '' }), 800);
              }
            }}
            className="group flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-black transition-all duration-300
              bg-red-50 text-red-600 hover:bg-red-600 hover:text-white hover:shadow-red-200 hover:shadow-lg active:scale-95"
          >
            <i className="fa-solid fa-file-pdf text-sm transition-transform group-hover:rotate-12"></i>
            <span className="hidden xl:inline tracking-widest">İNDİR</span>
          </button>

          <button
            title="Yazdır"
            onClick={async () => {
              try {
                await new Promise((resolve) => setTimeout(resolve, 50));
                const targetSelector = document.getElementById('print-container')
                  ? '#print-container'
                  : '.worksheet-page';
                await printService.generatePdf(targetSelector, settings.title, {
                  action: 'print',
                  paperSize: paperSize,
                });
              } catch (e) {
                toast.error('Yazdırma başlatılamadı.');
              }
            }}
            className="group flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-black transition-all duration-300
              bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white hover:shadow-blue-200 hover:shadow-lg active:scale-95"
          >
            <i className="fa-solid fa-print text-sm transition-transform group-hover:-translate-y-0.5"></i>
            <span className="hidden xl:inline tracking-widest">YAZDIR</span>
          </button>

          <div className="relative" ref={snapshotMenuRef}>
            <button
              onClick={() => setSnapshotMenuOpen(!snapshotMenuOpen)}
              className="group flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-black transition-all duration-300
                bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white hover:shadow-purple-200 hover:shadow-lg active:scale-95"
            >
              <i className="fa-solid fa-camera text-sm transition-transform group-hover:scale-110"></i>
              <span className="hidden xl:inline tracking-widest">GÖRÜNTÜ</span>
              <i
                className={`fa-solid fa-chevron-down text-[8px] transition-transform duration-500 ${snapshotMenuOpen ? 'rotate-180' : ''}`}
              ></i>
            </button>
            {snapshotMenuOpen && (
              <div className="absolute top-full mt-3 right-0 bg-white/95 backdrop-blur-2xl border border-white/50 rounded-2xl shadow-2xl z-[110] p-2 min-w-[200px] animate-in fade-in zoom-in-95 origin-top-right">
                <button
                  onClick={() => {
                    setSnapshotMenuOpen(false);
                    snapshotService.takeSnapshot('.worksheet-page', 'etkinlik', 'download');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-gray-600 hover:bg-purple-50 hover:text-purple-600 transition-all"
                >
                  <div className="w-8 h-8 rounded-lg bg-purple-100/50 flex items-center justify-center">
                    <i className="fa-solid fa-download text-purple-500"></i>
                  </div>
                  PNG İndir
                </button>
                <button
                  onClick={async () => {
                    setSnapshotMenuOpen(false);
                    await snapshotService.takeSnapshot('.worksheet-page', 'etkinlik', 'clipboard');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-100/50 flex items-center justify-center">
                    <i className="fa-solid fa-clipboard text-blue-500"></i>
                  </div>
                  Panoya Kopyala
                </button>
                <button
                  onClick={() => {
                    setSnapshotMenuOpen(false);
                    snapshotService.takeSnapshot('.worksheet-page', 'etkinlik', 'share');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-100/50 flex items-center justify-center">
                    <i className="fa-solid fa-share-nodes text-emerald-500"></i>
                  </div>
                  Hızlı Paylaş
                </button>
              </div>
            )}
          </div>

          <PremiumPaperSizeSelector
            value={paperSize}
            onChange={(p: PaperSize) => paperSizeStore.setPaperSize(p)}
          />
        </div>

        {/* Kaydetme Grubu */}
        <div className="flex items-center bg-white/60 backdrop-blur-md border border-white/80 rounded-2xl p-1.5 shadow-lg ring-1 ring-black/5">
          <button
            onClick={async () => {
              try {
                await onSave();
                toast.success('Çalışma arşive güvenle kaydedildi!');
              } catch {
                toast.error('Kaydetme hatası.');
              }
            }}
            className="group flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-black transition-all duration-300
              bg-amber-400 text-white hover:bg-amber-500 hover:shadow-amber-200 hover:shadow-lg active:scale-95"
          >
            <i className="fa-solid fa-bookmark text-sm transition-transform group-hover:scale-110"></i>
            <span className="hidden xl:inline tracking-widest uppercase">KAYDET</span>
          </button>

          {onAddToWorkbook && (
            <button
              onClick={onAddToWorkbook}
              className="relative ml-1 w-11 h-11 flex items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all duration-300 group"
              title="Kitapçığa Ekle"
            >
              <i className="fa-solid fa-book-medical text-lg"></i>
              {workbookItemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[var(--accent-color)] text-white text-[10px] font-black h-5 min-w-[20px] px-1 rounded-full flex items-center justify-center border-2 border-white shadow-md animate-bounce">
                  {workbookItemCount}
                </span>
              )}
            </button>
          )}

          {isCurriculumMode && onCompleteCurriculumTask && (
            <button
              onClick={onCompleteCurriculumTask}
              className="ml-1 px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-[11px] font-black hover:bg-emerald-600 transition-all active:scale-95 flex items-center gap-2"
            >
              <i className="fa-solid fa-check-double"></i>
              <span>TAMAMLA</span>
            </button>
          )}
        </div>
      </div>

      <ExportProgressModal
        isOpen={exportProgress.open}
        percent={exportProgress.percent}
        message={exportProgress.message}
      />
    </div>
  );
};
