// @ts-nocheck

import React, { useState, useRef, useEffect } from 'react';
import { StyleSettings, WorksheetData } from '../types';
import { usePaperSizeStore } from '../store/usePaperSizeStore';
import { printService, PaperSize } from '../utils/printService';
import { snapshotService, _SnapshotAction } from '../utils/snapshotService';
import { PremiumPaperSizeSelector } from './PremiumPaperSizeSelector';
import { ExportProgressModal } from './ExportProgressModal';
import { useA4EditorStore } from '../store/useA4EditorStore';
import { useToastStore } from '../store/useToastStore';

import { logInfo, logError, logWarn } from '../utils/logger.js';
interface ToolbarProps {
  settings: StyleSettings;
  onSettingsChange: (newSettings: StyleSettings) => void;
  onSave: () => void;
  onAssign?: () => void;
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

const Divider = () => <div className="h-8 w-px bg-[var(--border-color)] mx-2 self-center"></div>;

const IconButton = ({
  icon,
  onClick,
  active,
  title,
  disabled,
  badge,
  colorClass,
  isLoading,
}: any) => (
  <button
    onClick={onClick}
    disabled={disabled || isLoading}
    title={title}
    className={`relative w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-200 ${active
        ? 'bg-[var(--accent-color)] text-[var(--bg-primary)] shadow-md transform scale-105'
        : `text-[var(--text-secondary)] hover:bg-[var(--surface-glass)] ${colorClass || 'hover:text-[var(--text-primary)]'}`
      } ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    {isLoading ? (
      <i className="fa-solid fa-circle-notch fa-spin"></i>
    ) : (
      <i className={`fa-solid ${icon}`}></i>
    )}
    {badge > 0 && !isLoading && (
      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center border-2 border-[var(--bg-paper)]">
        {badge}
      </span>
    )}
  </button>
);

// Paper size for print (A4, Letter, Legal) - default A4
const _PaperSizeSelector = () => {
  const { paperSize, setPaperSize } = usePaperSizeStore();
  return (
    <select
      value={paperSize}
      onChange={(e) => setPaperSize(e.target.value as PaperSize)}
      className="ml-2 p-1 rounded text-xs"
      style={{ backgroundColor: 'var(--bg-paper)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
      aria-label="Kağıt Boyutu"
    >
      <option value="A4">A4</option>
      <option value="Letter">Letter</option>
      <option value="Legal">Legal</option>
    </select>
  );
};

const MenuButton = ({ icon, label, onClick, active, isOpen }: any) => (
  <button
    onClick={onClick}
    data-dropdown-trigger
    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all border select-none ${active || isOpen
        ? 'bg-[var(--accent-muted)] border-[var(--accent-color)]/30 text-[var(--accent-color)]'
        : 'bg-[var(--bg-paper)] border-transparent text-[var(--text-secondary)] hover:bg-white hover:border-[var(--border-color)]'
      }`}
  >
    <i
      className={`fa-solid ${icon} ${active || isOpen ? 'text-[var(--accent-color)]' : 'text-[var(--text-muted)]'} text-[10px]`}
    ></i>
    <span className="hidden xl:inline">{label}</span>
    <i
      className={`fa-solid fa-chevron-down text-[10px] ml-1 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
    ></i>
  </button>
);

const NumberControl = ({ label, value, onChange, min, max, step = 1, unit = '' }: any) => (
  <div className="flex items-center justify-between py-1">
    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tight">
      {label}
    </span>
    <div className="flex items-center gap-2 bg-[var(--bg-secondary)] rounded-md p-0.5 border border-[var(--border-color)]">
      <button
        onClick={() => onChange(Math.max(min, value - step))}
        className="w-6 h-6 flex items-center justify-center text-[var(--text-secondary)] hover:bg-white rounded shadow-sm transition-all"
        disabled={value <= min}
      >
        <i className="fa-solid fa-minus text-[10px]"></i>
      </button>
      <span className="text-xs font-mono font-bold w-10 text-center text-[var(--text-primary)]">
        {Math.round(value * 100) / 100}
        {unit}
      </span>
      <button
        onClick={() => onChange(Math.min(max, value + step))}
        className="w-6 h-6 flex items-center justify-center text-[var(--text-secondary)] hover:bg-white rounded shadow-sm transition-all"
        disabled={value >= max}
      >
        <i className="fa-solid fa-plus text-[10px]"></i>
      </button>
    </div>
  </div>
);

const Toggle = ({ label, checked, onChange }: any) => (
  <div
    className="flex items-center justify-between py-1 cursor-pointer group"
    onClick={() => onChange(!checked)}
  >
    <span className="text-xs font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
      {label}
    </span>
    <div
      className={`w-8 h-4 rounded-full relative transition-colors ${checked ? 'bg-[var(--accent-color)]' : 'bg-[var(--border-color)]'}`}
    >
      <div
        className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-all ${checked ? 'left-4.5' : 'left-0.5'}`}
      ></div>
    </div>
  </div>
);

const DropdownPanel = ({ title, children, onClose, className = '' }: any) => {
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
      className={`absolute top-full mt-2 left-0 border rounded-xl shadow-2xl z-[100] p-5 animate-in fade-in zoom-in-95 origin-top-left ring-1 ring-black/5 ${className}`}
      style={{ backgroundColor: 'var(--bg-paper)', borderColor: 'var(--border-color)' }}
    >
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-[var(--border-color)]">
        <h4 className="text-[10px] font-black text-[var(--accent-color)] uppercase tracking-[0.2em]">
          {title}
        </h4>
        <button
          onClick={onClose}
          className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          <i className="fa-solid fa-times"></i>
        </button>
      </div>
      <div className="space-y-5 max-h-[60vh] overflow-y-auto custom-scrollbar">{children}</div>
    </div>
  );
};

export const Toolbar: React.FC<ToolbarProps> = ({
  settings,
  onSettingsChange,
  onSave,
  onAssign,
  _onFeedback,
  onShare,
  _onTogglePreview,
  _isPreviewMode,
  onAddToWorkbook,
  workbookItemCount,
  _onToggleEdit,
  _isEditMode,
  _onAddSticker,
  onSpeak,
  isSpeaking,
  onStopSpeak,
  _showQR,
  _onToggleQR,
  _worksheetData,
  _isCurriculumMode,
  _onCompleteCurriculumTask,
}) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [snapshotMenuOpen, setSnapshotMenuOpen] = useState(false);
  const [exportProgress, setExportProgress] = useState({ open: false, percent: 0, message: '' });
  const snapshotMenuRef = useRef<HTMLDivElement>(null);
  const paperSizeStore = usePaperSizeStore();
  const toast = useToastStore();
  const paperSize = paperSizeStore.paperSize;
  const _setPaperSize = paperSizeStore.setPaperSize;
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

  return (
    <div className="flex flex-wrap items-center justify-between gap-0.5 md:gap-1 min-h-10 py-0.5 select-none relative z-[60]">
      <div className="flex items-center gap-1 md:gap-2 flex-wrap">
        <div className="relative">
          <MenuButton
            icon="fa-font"
            label="Tipografi"
            isOpen={activeMenu === 'typo'}
            onClick={() => setActiveMenu(activeMenu === 'typo' ? null : 'typo')}
          />
          {activeMenu === 'typo' && (
            <DropdownPanel
              title="Yazı Ayarları"
              onClose={() => setActiveMenu(null)}
              className="w-80"
            >
              <NumberControl
                label="Punto"
                value={settings.fontSize}
                onChange={(v: any) => updateSetting('fontSize', v)}
                min={12}
                max={48}
              />
              <NumberControl
                label="Satır Aralığı"
                value={settings.lineHeight}
                onChange={(v: any) => updateSetting('lineHeight', v)}
                min={1}
                max={3}
                step={0.1}
              />
              <NumberControl
                label="Harf Aralığı"
                value={settings.letterSpacing}
                onChange={(v: any) => updateSetting('letterSpacing', v)}
                min={0}
                max={10}
                step={0.5}
              />
              <NumberControl
                label="Kelime Aralığı"
                value={settings.wordSpacing || 0}
                onChange={(v: any) => updateSetting('wordSpacing', v)}
                min={0}
                max={20}
              />
              <NumberControl
                label="Paragraf Boşluğu"
                value={settings.paragraphSpacing || 20}
                onChange={(v: any) => updateSetting('paragraphSpacing', v)}
                min={0}
                max={60}
              />
              <div className="pt-2" style={{ borderTop: '1px solid var(--border-color)' }}>
                <label className="text-[10px] font-black uppercase mb-2 block" style={{ color: 'var(--text-muted)' }}>
                  Yazı Tipi
                </label>
                <div className="grid grid-cols-2 gap-1">
                  {['Lexend', 'OpenDyslexic', 'Inter', 'Comic Neue'].map((f) => (
                    <button
                      key={f}
                      onClick={() => updateSetting('fontFamily', f)}
                      className={`py-1.5 text-[10px] rounded border transition-all`}
                      style={settings.fontFamily === f ? { backgroundColor: 'var(--accent-color)', color: '#fff', borderColor: 'var(--accent-color)' } : { borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </DropdownPanel>
          )}
        </div>

        <div className="relative">
          <MenuButton
            icon="fa-eye"
            label="Klinik Odak"
            active={settings.focusMode}
            isOpen={activeMenu === 'clinical'}
            onClick={() => setActiveMenu(activeMenu === 'clinical' ? null : 'clinical')}
          />
          {activeMenu === 'clinical' && (
            <DropdownPanel
              title="Erişilebilirlik Araçları"
              onClose={() => setActiveMenu(null)}
              className="w-72"
            >
              <Toggle
                label="Odak Modu (Takip Cetveli)"
                checked={settings.focusMode}
                onChange={(v: any) => updateSetting('focusMode', v)}
              />
              {settings.focusMode && (
                <div className="space-y-4 pt-2 animate-in fade-in duration-300" style={{ borderTop: '1px solid var(--border-color)' }}>
                  <NumberControl
                    label="Cetvel Yüksekliği"
                    value={settings.rulerHeight || 80}
                    onChange={(v: any) => updateSetting('rulerHeight', v)}
                    min={40}
                    max={200}
                  />
                  <NumberControl
                    label="Maske Opaklığı"
                    value={settings.maskOpacity || 0.4}
                    onChange={(v: any) => updateSetting('maskOpacity', v)}
                    min={0.1}
                    max={0.9}
                    step={0.1}
                  />
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase" style={{ color: 'var(--text-muted)' }}>
                      Cetvel Rengi
                    </label>
                    <div className="flex gap-2">
                      {['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#000000'].map((c) => (
                        <button
                          key={c}
                          onClick={() => updateSetting('rulerColor', c)}
                          className={`w-6 h-6 rounded-full border-2 transition-all ${settings.rulerColor === c ? 'scale-125' : 'border-transparent'}`}
                          style={{ backgroundColor: c, ...(settings.rulerColor === c ? { borderColor: 'var(--text-primary)' } : {}) }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </DropdownPanel>
          )}
        </div>

        <div className="relative">
          <MenuButton
            icon="fa-table-cells-large"
            label="Sayfa Düzeni"
            isOpen={activeMenu === 'layout'}
            onClick={() => setActiveMenu(activeMenu === 'layout' ? null : 'layout')}
          />
          {activeMenu === 'layout' && (
            <DropdownPanel
              title="Mizanpaj ve Kağıt Ayarları"
              onClose={() => setActiveMenu(null)}
              className="w-80"
            >
              <div className="space-y-4">
                <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-paper)', border: '1px solid var(--border-color)' }}>
                  <label className="text-[10px] font-black text-[var(--accent-color)] uppercase tracking-[0.2em] mb-2 block">
                    <i className="fa-solid fa-grip-vertical mr-1"></i> İçerik Yapısı
                  </label>
                  <Toggle
                    label="Etkinlik Başlığını Göster"
                    checked={settings.showTitle !== false}
                    onChange={(v: any) => updateSetting('showTitle', v)}
                  />
                  <Toggle
                    label="Yönergeyi Göster"
                    checked={settings.showInstruction !== false}
                    onChange={(v: any) => updateSetting('showInstruction', v)}
                  />
                  <div className="pt-2 mt-2 border-t border-[var(--border-color)]">
                    <NumberControl
                      label="Sayfa Marjı (mm)"
                      value={settings.margin || 15}
                      onChange={(v: any) => updateSetting('margin', v)}
                      min={5}
                      max={40}
                      step={1}
                    />
                  </div>
                </div>

                {/* Kenarlık Teması */}
                <div className="bg-white p-3 rounded-lg border border-[var(--border-color)]">
                  <label className="text-[10px] font-black text-[var(--accent-color)] uppercase tracking-[0.2em] mb-2 block">
                    <i className="fa-solid fa-border-all mr-1"></i> Kenarlık Teması
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(
                      [
                        { value: 'none', label: 'Yok', icon: 'fa-xmark' },
                        { value: 'simple', label: 'Düz', icon: 'fa-square' },
                        { value: 'math', label: 'Matematik', icon: 'fa-calculator' },
                        { value: 'verbal', label: 'Sözel', icon: 'fa-book' },
                        { value: 'stars', label: 'Yıldız', icon: 'fa-star' },
                        { value: 'geo', label: 'Geometri', icon: 'fa-shapes' },
                      ] as const
                    ).map((b) => (
                      <button
                        key={b.value}
                        onClick={() => updateSetting('themeBorder', b.value)}
                        className={`flex flex-col items-center py-2 rounded-lg border transition-all text-[10px] ${settings.themeBorder === b.value
                            ? 'border-[var(--accent-color)] bg-[var(--accent-muted)] text-[var(--text-primary)] shadow-sm font-bold'
                            : 'border-[var(--border-color)] text-[var(--text-muted)] hover:border-[var(--text-secondary)]'
                          }`}
                      >
                        <i className={`fa-solid ${b.icon} text-sm mb-0.5`}></i>
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Renk Paleti */}
                <div className="bg-white p-3 rounded-lg border border-[var(--border-color)]">
                  <label className="text-[10px] font-black text-[var(--accent-color)] uppercase tracking-[0.2em] mb-2 block">
                    <i className="fa-solid fa-palette mr-1"></i> Kenarlık Rengi
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { color: '#3f3f46', label: 'Klasik' },
                      { color: '#1e40af', label: 'Okyanus' },
                      { color: '#166534', label: 'Orman' },
                      { color: '#c2410c', label: 'Gün batımı' },
                      { color: '#581c87', label: 'Uzay' },
                      { color: '#be185d', label: 'Gül' },
                    ].map((p) => (
                      <button
                        key={p.color}
                        title={p.label}
                        onClick={() => updateSetting('borderColor', p.color)}
                        className={`w-7 h-7 rounded-full border-2 transition-all ${settings.borderColor === p.color
                            ? 'border-[var(--text-primary)] scale-125 shadow-md'
                            : 'border-transparent hover:scale-110'
                          }`}
                        style={{ backgroundColor: p.color }}
                      />
                    ))}
                  </div>
                </div>

                {/* Altbilgi Özelleştirme */}
                <div className="bg-white p-3 rounded-lg border border-[var(--border-color)]">
                  <label className="text-[10px] font-black text-[var(--accent-color)] uppercase tracking-[0.2em] mb-2 block">
                    <i className="fa-solid fa-shoe-prints mr-1"></i> Altbilgi
                  </label>
                  <Toggle
                    label="Altbilgiyi Göster"
                    checked={settings.showFooter !== false}
                    onChange={(v: any) => updateSetting('showFooter', v)}
                  />
                  {settings.showFooter !== false && (
                    <input
                      type="text"
                      placeholder="Özel altbilgi metni..."
                      value={settings.footerText || ''}
                      onChange={(e) => updateSetting('footerText', e.target.value)}
                      className="mt-2 w-full px-2 py-1.5 rounded border border-[var(--border-color)] bg-[var(--bg-paper)] text-[11px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                    />
                  )}
                </div>
              </div>
            </DropdownPanel>
          )}
        </div>
      </div>

      <Divider />

      <div className="flex items-center gap-1">
        <IconButton
          icon="fa-wand-magic-sparkles"
          title="Serbest Tasarımcı"
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
      <div className="flex items-center gap-2">
        {/* Dışa Aktarma Grubu */}
        <div className="flex items-center bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-1 gap-0.5 shadow-lg backdrop-blur-sm">
          <button
            title="PDF Olarak İndir"
            onClick={async () => {
              try {
                setExportProgress({ open: true, percent: 0, message: 'Hazırlanıyor...' });
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
                logError(e);
                toast.error('PDF oluşturulamadı.');
              } finally {
                setTimeout(() => setExportProgress({ open: false, percent: 0, message: '' }), 800);
              }
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-black transition-all duration-200
              bg-gradient-to-r from-red-500/10 to-orange-500/10 text-red-400
              hover:from-red-500/20 hover:to-orange-500/20 hover:text-red-300 hover:shadow-md hover:scale-[1.02]
              active:scale-95 uppercase tracking-wide"
          >
            <i className="fa-solid fa-file-pdf text-[11px]"></i>
            <span className="hidden lg:inline">PDF</span>
          </button>
          <button
            title="Sistem Yazdır"
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
                logError(e);
                toast.error('Yazdırma başlatılamadı.');
              }
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-black transition-all duration-200
              bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-blue-400
              hover:from-blue-500/20 hover:to-cyan-500/20 hover:text-blue-300 hover:shadow-md hover:scale-[1.02]
              active:scale-95 uppercase tracking-wide"
          >
            <i className="fa-solid fa-print text-[11px]"></i>
            <span className="hidden lg:inline">Yazdır</span>
          </button>
          
          {/* PROFESYONEL YAZDIRMA V2 */}
          <button
            title="Profesyonel Yazdır (Başlıksız/Temiz)"
            onClick={async () => {
              try {
                const { forceRenderAllPages, ensurePrintStyle } = await import('../utils/print/CSSInjector');
                const { printService } = await import('../utils/print'); // Modüler index
                
                // 1. Hazırlık
                forceRenderAllPages();
                ensurePrintStyle(paperSize);
                
                // 2. DOM Hazırlığı için kısa bekleme
                setTimeout(async () => {
                  try {
                    const selectOrder = ['#print-container', '.worksheet-page', '.print-page', '.universal-mode-canvas'];
                    let finalSelector = '';
                    for (const sel of selectOrder) {
                      if (document.querySelector(sel)) {
                        finalSelector = sel;
                        break;
                      }
                    }

                    if (!finalSelector) {
                      toast.error('Yazdırılacak içerik bulunamadı.');
                      return;
                    }

                    await printService.generatePdf(finalSelector, settings.title || 'Oogmatik_Dosya', {
                      action: 'print',
                      paperSize: paperSize,
                      quality: 'high'
                    });
                  } catch (innerErr) {
                    logError(innerErr);
                    toast.error('Yazdırma motoru hatası.');
                  }
                }, 500);
              } catch (err) {
                logError(err);
                toast.error('Sistem başlatılamadı.');
              }
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-black transition-all duration-200
              bg-gradient-to-r from-emerald-500 text-white shadow-lg shadow-emerald-200/50
              hover:from-emerald-600 hover:shadow-emerald-300/50 hover:scale-[1.05]
              active:scale-95 border border-emerald-400/20 ring-1 ring-emerald-500/20 uppercase tracking-wide"
          >
            <i className="fa-solid fa-file-pdf text-[11px]"></i>
            <span className="hidden lg:inline">Yazdır v2</span>
          </button>
          <div className="relative" ref={snapshotMenuRef}>
            <button
              title="Ekran Görüntüsü"
              onClick={() => setSnapshotMenuOpen(!snapshotMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-black transition-all duration-200
                bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-400
                hover:from-purple-500/20 hover:to-pink-500/20 hover:text-purple-300 hover:shadow-md hover:scale-[1.02]
                active:scale-95 uppercase tracking-wide"
            >
              <i className="fa-solid fa-camera text-[11px]"></i>
              <span className="hidden lg:inline">Görüntü</span>
              <i
                className={`fa-solid fa-chevron-down text-[8px] ml-0.5 transition-transform ${snapshotMenuOpen ? 'rotate-180' : ''}`}
              ></i>
            </button>
            {snapshotMenuOpen && (
              <div className="absolute top-full mt-1.5 right-0 bg-[var(--panel-bg)] border border-[var(--border-color)] rounded-xl shadow-2xl z-50 p-1.5 min-w-[200px] animate-in fade-in zoom-in-95 backdrop-blur-xl">
                <button
                  onClick={() => {
                    setSnapshotMenuOpen(false);
                    snapshotService.takeSnapshot('.worksheet-page', 'etkinlik', 'download');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] font-medium text-[var(--text-secondary)] hover:bg-white hover:text-[var(--text-primary)] transition-all"
                >
                  <i className="fa-solid fa-download text-purple-400 w-4 text-center"></i>
                  Mevcut Sayfa (PNG)
                </button>
                <button
                  onClick={() => {
                    setSnapshotMenuOpen(false);
                    snapshotService.takeSnapshot('.worksheet-page', 'etkinlik', 'download_zip');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] font-medium text-[var(--text-secondary)] hover:bg-white hover:text-[var(--text-primary)] transition-all"
                >
                  <i className="fa-solid fa-file-zipper text-indigo-400 w-4 text-center"></i>
                  Tüm Sayfalar (ZIP)
                </button>
                <div className="h-px bg-[var(--border-color)] my-1 mx-2"></div>
                <button
                  onClick={async () => {
                    setSnapshotMenuOpen(false);
                    await snapshotService.takeSnapshot('.worksheet-page', 'etkinlik', 'clipboard');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] font-medium text-[var(--text-secondary)] hover:bg-white hover:text-[var(--text-primary)] transition-all"
                >
                  <i className="fa-solid fa-clipboard text-blue-400 w-4 text-center"></i>
                  Panoya Kopyala
                </button>
                <button
                  onClick={() => {
                    setSnapshotMenuOpen(false);
                    snapshotService.takeSnapshot('.worksheet-page', 'etkinlik', 'share');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-glass)] hover:text-[var(--text-primary)] transition-all"
                >
                  <i className="fa-solid fa-share-nodes text-green-400 w-4 text-center"></i>
                  Paylaş
                </button>
              </div>
            )}
          </div>
          {/* Kağıt Boyutu */}
          <PremiumPaperSizeSelector
            value={paperSize}
            onChange={(p: PaperSize) => {
              paperSizeStore.setPaperSize(p);
              if (p === 'Extreme_Yatay') {
                updateSetting('orientation', 'landscape');
                updateSetting('columns', 2); // Yatay'da 2 sütun
                updateSetting('compact', true);
              } else if (p === 'Extreme_Dikey') {
                updateSetting('orientation', 'portrait');
                updateSetting('columns', 1);
                updateSetting('compact', true);
              }
            }}
          />
        </div>

        {/* Kaydetme & Paylaşma Grubu */}
        <div className="flex items-center bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-1 gap-0.5 shadow-lg backdrop-blur-sm">
          <button
            title="Arşive Kaydet"
            onClick={async () => {
              try {
                await onSave();
                toast.success('Etkinlik arşive kaydedildi!');
              } catch {
                toast.error('Kaydetme başarısız.');
              }
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-black transition-all duration-200
              bg-gradient-to-r from-amber-500/10 to-yellow-500/10 text-amber-400
              hover:from-amber-500/20 hover:to-yellow-500/20 hover:text-amber-300 hover:shadow-md hover:scale-[1.02]
              active:scale-95 uppercase tracking-wide"
          >
            <i className="fa-solid fa-bookmark text-[11px]"></i>
            <span className="hidden lg:inline">Kaydet</span>
          </button>
          <button
            title="Kitapçığa Ekle"
            onClick={onAddToWorkbook}
            className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-black transition-all duration-200
              bg-gradient-to-r from-indigo-500/10 to-violet-500/10 text-indigo-400
              hover:from-indigo-500/20 hover:to-violet-500/20 hover:text-indigo-300 hover:shadow-md hover:scale-[1.02]
              active:scale-95 uppercase tracking-wide"
          >
            <i className="fa-solid fa-book-medical text-[11px]"></i>
            <span className="hidden lg:inline">Kitapçık</span>
            {workbookItemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[var(--accent-color)] text-[var(--bg-primary)] text-[9px] font-black h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center border-2 border-[var(--bg-secondary)] shadow-sm">
                {workbookItemCount}
              </span>
            )}
          </button>
          
          {onAssign && (
            <button
              title="Öğrenciye Ata"
              onClick={onAssign}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-black transition-all duration-200
                bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-400
                hover:from-emerald-500/20 hover:to-teal-500/20 hover:text-emerald-300 hover:shadow-md hover:scale-[1.02]
                active:scale-95 uppercase tracking-wide"
            >
              <i className="fa-solid fa-user-plus text-[11px]"></i>
              <span className="hidden lg:inline">Ata</span>
            </button>
          )}

          {onShare && (
            <button
              title="Paylaş"
              onClick={async () => {
                // Web Share API varsa ve dosya paylaşım destekliyorsa, snapshot ile paylaş
                if (navigator.share) {
                  try {
                    await snapshotService.takeSnapshot(
                      '.worksheet-page',
                      settings.title || 'etkinlik',
                      'share'
                    );
                  } catch {
                    // Fallback: orijinal onShare çağır
                    onShare();
                  }
                } else {
                  onShare();
                }
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-black transition-all duration-200
                bg-gradient-to-r from-sky-500/10 to-blue-500/10 text-sky-400
                hover:from-sky-500/20 hover:to-blue-500/20 hover:text-sky-300 hover:shadow-md hover:scale-[1.02]
                active:scale-95 uppercase tracking-wide"
            >
              <i className="fa-solid fa-share-nodes text-[11px]"></i>
              <span className="hidden lg:inline">Paylaş</span>
            </button>
          )}
        </div>
      </div>

      {/* Export Progress Modal */}
      <ExportProgressModal
        isOpen={exportProgress.open}
        percent={exportProgress.percent}
        message={exportProgress.message}
      />
    </div>
  );
};

const _CompactToggleGroup = ({ label, selected, onChange, options }: any) => (
  <div className="space-y-1">
    <label className="text-[10px] font-bold uppercase block" style={{ color: 'var(--text-muted)' }}>{label}</label>
    <div className="flex p-1 rounded-lg" style={{ backgroundColor: 'var(--surface-elevated)' }}>
      {options.map((opt: any) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className="flex-1 py-1.5 text-[10px] font-bold rounded"
          style={selected === opt.value ? { backgroundColor: 'var(--bg-paper)', color: 'var(--accent-color)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' } : { color: 'var(--text-muted)' }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  </div>
);
