
import React, { useState, useEffect, useRef } from 'react';
import { StyleSettings, WorksheetData } from '../types';
import { printService } from '../utils/printService';
import { StickerPicker } from './StickerPicker';
import { PrintPreviewModal } from './PrintPreviewModal';

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
  isDrawMode?: boolean;
  onToggleDraw?: () => void;
  onSpeak?: () => void;
  isSpeaking?: boolean;
  onStopSpeak?: () => void;
  showQR?: boolean;
  onToggleQR?: () => void;
  worksheetData?: WorksheetData;
}

// --- MICRO COMPONENTS FOR STABILITY ---

const Divider = () => <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700 mx-1 self-center opacity-50"></div>;

const IconButton = ({ icon, onClick, active, title, disabled, badge }: any) => (
    <button 
        onClick={onClick}
        disabled={disabled}
        title={title}
        className={`relative w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 ${
            active 
            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 shadow-sm ring-1 ring-indigo-200 dark:ring-indigo-800' 
            : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-200'
        } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
    >
        <i className={`fa-solid ${icon}`}></i>
        {badge > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center border border-white dark:border-zinc-900">
                {badge}
            </span>
        )}
    </button>
);

const MenuButton = ({ icon, label, onClick, active }: any) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
            active
            ? 'bg-zinc-800 text-white border-zinc-900 dark:bg-white dark:text-zinc-900 shadow-md transform scale-105'
            : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700 dark:hover:bg-zinc-700'
        }`}
    >
        <i className={`fa-solid ${icon}`}></i>
        <span className="hidden xl:inline">{label}</span>
    </button>
);

const CompactSlider = ({ icon, value, min, max, step, onChange, title, displayValue, unit }: any) => (
    <div className="flex items-center gap-2 group relative px-2 py-1 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors" title={title}>
        <i className={`fa-solid ${icon} text-[10px] text-zinc-400 group-hover:text-indigo-500 transition-colors w-3 text-center`}></i>
        <input 
            type="range" 
            min={min} 
            max={max} 
            step={step || 1}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-20 h-1 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-zinc-600 dark:accent-zinc-400 hover:accent-indigo-600"
        />
        <span className="text-[9px] font-mono text-zinc-500 dark:text-zinc-400 w-8 text-right tabular-nums">
            {displayValue || value}{unit}
        </span>
    </div>
);

const DropdownPanel = ({ title, children, onClose }: any) => {
    // Click outside handler
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    return (
        <div ref={ref} className="absolute top-full mt-2 left-0 w-72 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl z-50 p-4 animate-in fade-in zoom-in-95 origin-top-left">
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-zinc-100 dark:border-zinc-800">
                <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest">{title}</h4>
                <button onClick={onClose} className="text-zinc-300 hover:text-zinc-500"><i className="fa-solid fa-times"></i></button>
            </div>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
                {children}
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---

const Toolbar: React.FC<ToolbarProps> = ({ 
    settings, 
    onSettingsChange, 
    onSave, 
    onFeedback, 
    onShare, 
    onTogglePreview, 
    isPreviewMode,
    onAddToWorkbook,
    workbookItemCount = 0,
    onViewWorkbook,
    onToggleEdit,
    isEditMode,
    onSnapshot,
    onAddText,
    onAddSticker,
    isDrawMode,
    onToggleDraw,
    onSpeak,
    isSpeaking,
    onStopSpeak,
    showQR,
    onToggleQR,
    worksheetData
}) => {
  const [activeMenu, setActiveMenu] = useState<'none' | 'layout' | 'typography' | 'visual' | 'scaffold'>('none');
  const [showStickers, setShowStickers] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Close menus on specific actions
  const closeMenu = () => setActiveMenu('none');

  const handleAction = async (action: 'print' | 'download') => {
      if (action === 'print') {
          setShowPrintModal(true);
      } else {
          setIsProcessing(true);
          setTimeout(async () => {
              try {
                  await printService.generatePdf('.worksheet-item', 'Etkinlik', { action });
              } catch (error) {
                  console.error("İşlem hatası:", error);
                  alert("İşlem sırasında bir hata oluştu.");
              } finally {
                  setIsProcessing(false);
              }
          }, 100);
      }
  };

  // Preset Handlers
  const applyDyslexiaPreset = () => {
      onSettingsChange({
          ...settings,
          fontFamily: 'OpenDyslexic',
          lineHeight: 2.0,
          letterSpacing: 2, // Wide
          fontSize: 18,
          contentAlign: 'left',
          themeBorder: 'simple',
          visualStyle: 'zebra' // Zebra striping helps tracking
      });
  };

  const applyCompactPreset = () => {
      onSettingsChange({
          ...settings,
          fontFamily: 'Inter',
          lineHeight: 1.2,
          letterSpacing: 0,
          fontSize: 14,
          margin: 10,
          gap: 8,
          visualStyle: 'boxed'
      });
  };

  return (
    <>
    <div id="tour-toolbar" className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 px-4 py-2 rounded-2xl shadow-lg flex flex-wrap items-center justify-between gap-y-2 gap-x-2 transition-all duration-300 relative w-full">
        
        {/* LEFT SECTION: DOCUMENT & LAYOUT */}
        <div className="flex items-center gap-2">
             {/* Orientation Switcher */}
             <div className="bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg flex">
                <button 
                    onClick={() => onSettingsChange({...settings, orientation: 'portrait'})}
                    className={`w-7 h-7 rounded flex items-center justify-center transition-all ${settings.orientation === 'portrait' ? 'bg-white dark:bg-zinc-600 shadow text-zinc-900 dark:text-zinc-100' : 'text-zinc-400 hover:text-zinc-600'}`}
                    title="Dikey"
                >
                    <i className="fa-regular fa-file"></i>
                </button>
                <button 
                    onClick={() => onSettingsChange({...settings, orientation: 'landscape'})}
                    className={`w-7 h-7 rounded flex items-center justify-center transition-all ${settings.orientation === 'landscape' ? 'bg-white dark:bg-zinc-600 shadow text-zinc-900 dark:text-zinc-100' : 'text-zinc-400 hover:text-zinc-600'}`}
                    title="Yatay"
                >
                    <i className="fa-regular fa-file fa-rotate-90"></i>
                </button>
            </div>

            <Divider />

            {/* LAYOUT ENGINE (Smart Reflow + Columns) */}
            <div className="relative">
                <MenuButton 
                    icon="fa-solid fa-table-columns" 
                    label="Yerleşim" 
                    active={activeMenu === 'layout'} 
                    onClick={() => setActiveMenu(activeMenu === 'layout' ? 'none' : 'layout')} 
                />
                {activeMenu === 'layout' && (
                    <DropdownPanel title="Sayfa Fiziği" onClose={closeMenu}>
                        {/* Smart Reflow Control */}
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg border border-emerald-100 dark:border-emerald-800/50">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                                    <i className="fa-solid fa-wand-magic-sparkles"></i> Akıllı Akış
                                </span>
                                <div className={`w-8 h-4 rounded-full relative cursor-pointer transition-colors ${settings.smartPagination ? 'bg-emerald-500' : 'bg-zinc-300'}`} onClick={() => onSettingsChange({...settings, smartPagination: !settings.smartPagination})}>
                                    <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all ${settings.smartPagination ? 'left-4.5' : 'left-0.5'}`}></div>
                                </div>
                            </div>
                            <p className="text-[10px] text-emerald-700/70 dark:text-emerald-400/70 leading-snug">
                                İçerik taştığında otomatik olarak yeni sayfa oluşturur ve boşlukları optimize eder.
                            </p>
                        </div>

                        {/* Column Control */}
                        <div>
                            <span className="text-xs font-bold text-zinc-500 block mb-2">Sütun Yapısı</span>
                            <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded p-1">
                                {[1, 2, 3, 4].map(col => (
                                    <button
                                        key={col}
                                        onClick={() => onSettingsChange({...settings, columns: col})}
                                        className={`flex-1 py-1 text-xs font-bold rounded transition-all ${settings.columns === col ? 'bg-white dark:bg-zinc-600 shadow text-black dark:text-white' : 'text-zinc-400 hover:text-zinc-600'}`}
                                    >
                                        {col}x
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Scale Control */}
                        <CompactSlider 
                            icon="fa-magnifying-glass" 
                            title="Ölçek" 
                            value={settings.scale} min={0.5} max={2.0} step={0.05} 
                            displayValue={Math.round(settings.scale * 100)} unit="%"
                            onChange={(v: number) => onSettingsChange({...settings, scale: v})} 
                        />

                        {/* Margin Control */}
                        <CompactSlider 
                            icon="fa-border-all" 
                            title="Kenar Boşluğu" 
                            value={settings.margin} min={0} max={100} 
                            displayValue={settings.margin} unit="mm"
                            onChange={(v: number) => onSettingsChange({...settings, margin: v})} 
                        />
                        
                        {/* Gap Control */}
                        <CompactSlider 
                            icon="fa-arrows-left-right-to-line" 
                            title="Öğe Aralığı" 
                            value={settings.gap} min={0} max={50} 
                            displayValue={settings.gap} unit="px"
                            onChange={(v: number) => onSettingsChange({...settings, gap: v})} 
                        />
                    </DropdownPanel>
                )}
            </div>

            {/* TYPOGRAPHY (Scientific Presets) */}
            <div className="relative">
                <MenuButton 
                    icon="fa-solid fa-font" 
                    label="Yazı" 
                    active={activeMenu === 'typography'} 
                    onClick={() => setActiveMenu(activeMenu === 'typography' ? 'none' : 'typography')} 
                />
                {activeMenu === 'typography' && (
                    <DropdownPanel title="Tipografi ve Okunabilirlik" onClose={closeMenu}>
                        
                        {/* Quick Presets */}
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            <button onClick={applyDyslexiaPreset} className="p-2 border border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 rounded-lg text-left hover:bg-blue-100 transition-colors">
                                <span className="block text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase">Disleksi Modu</span>
                                <span className="block text-[9px] text-blue-500">Kolay okuma</span>
                            </button>
                            <button onClick={applyCompactPreset} className="p-2 border border-zinc-200 bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 rounded-lg text-left hover:bg-zinc-100 transition-colors">
                                <span className="block text-[10px] font-bold text-zinc-700 dark:text-zinc-300 uppercase">Sıkışık Mod</span>
                                <span className="block text-[9px] text-zinc-500">Veri tasarrufu</span>
                            </button>
                        </div>

                        {/* Font Family */}
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-zinc-500">Yazı Tipi</span>
                            <select 
                                value={settings.fontFamily || 'OpenDyslexic'} 
                                onChange={(e) => onSettingsChange({...settings, fontFamily: e.target.value as any})}
                                className="w-full text-xs p-2 bg-zinc-100 dark:bg-zinc-800 border-none rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                            >
                                <option value="OpenDyslexic">OpenDyslexic (Özel)</option>
                                <option value="Lexend">Lexend (Akıcı)</option>
                                <option value="Inter">Inter (Modern)</option>
                                <option value="Comic Neue">Comic Sans (El Yazısı)</option>
                                <option value="Lora">Lora (Kitap)</option>
                            </select>
                        </div>

                        {/* Alignment */}
                        <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded">
                             {['left', 'center', 'right'].map((align: any) => (
                                 <button
                                    key={align}
                                    onClick={() => onSettingsChange({...settings, contentAlign: align})}
                                    className={`flex-1 py-1 rounded text-xs transition-colors ${settings.contentAlign === align ? 'bg-white dark:bg-zinc-600 shadow text-black dark:text-white' : 'text-zinc-400'}`}
                                 >
                                     <i className={`fa-solid fa-align-${align}`}></i>
                                 </button>
                             ))}
                        </div>

                        <CompactSlider 
                            icon="fa-text-height" 
                            title="Punto" 
                            value={settings.fontSize} min={10} max={40} 
                            displayValue={settings.fontSize} unit="px"
                            onChange={(v: number) => onSettingsChange({...settings, fontSize: v})} 
                        />
                        <CompactSlider 
                            icon="fa-arrows-up-down" 
                            title="Satır Aralığı" 
                            value={(settings.lineHeight || 1.5) * 10} min={10} max={30} 
                            displayValue={settings.lineHeight} unit=""
                            onChange={(v: number) => onSettingsChange({...settings, lineHeight: v / 10})} 
                        />
                        <CompactSlider 
                            icon="fa-text-width" 
                            title="Harf Aralığı" 
                            value={(settings.letterSpacing || 0) * 10} min={0} max={100} 
                            displayValue={settings.letterSpacing} unit="px"
                            onChange={(v: number) => onSettingsChange({...settings, letterSpacing: v / 10})} 
                        />
                        
                        <div className="flex gap-2">
                            <button 
                                onClick={() => onSettingsChange({...settings, fontWeight: settings.fontWeight === 'bold' ? 'normal' : 'bold'})}
                                className={`flex-1 py-1.5 rounded text-xs font-bold border transition-colors ${settings.fontWeight === 'bold' ? 'bg-zinc-800 text-white border-zinc-900' : 'bg-white text-zinc-600 border-zinc-200'}`}
                            >
                                <i className="fa-solid fa-bold mr-1"></i> Kalın
                            </button>
                            <button 
                                onClick={() => onSettingsChange({...settings, fontStyle: settings.fontStyle === 'italic' ? 'normal' : 'italic'})}
                                className={`flex-1 py-1.5 rounded text-xs font-bold border transition-colors ${settings.fontStyle === 'italic' ? 'bg-zinc-800 text-white border-zinc-900' : 'bg-white text-zinc-600 border-zinc-200'}`}
                            >
                                <i className="fa-solid fa-italic mr-1"></i> İtalik
                            </button>
                        </div>
                    </DropdownPanel>
                )}
            </div>

            {/* VISUAL THEME (Cards/Borders) */}
            <div className="relative">
                <MenuButton 
                    icon="fa-solid fa-swatchbook" 
                    label="Tema" 
                    active={activeMenu === 'visual'} 
                    onClick={() => setActiveMenu(activeMenu === 'visual' ? 'none' : 'visual')} 
                />
                {activeMenu === 'visual' && (
                    <DropdownPanel title="Görsel Stil" onClose={closeMenu}>
                        <div>
                            <span className="text-xs font-bold text-zinc-500 block mb-2">Kart Yapısı</span>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    {id: 'minimal', label: 'Minimal', icon: 'fa-square-full'},
                                    {id: 'boxed', label: 'Kutulu', icon: 'fa-border-all'},
                                    {id: 'card', label: 'Kart', icon: 'fa-note-sticky'},
                                    {id: 'zebra', label: 'Zebra', icon: 'fa-bars'},
                                ].map((style) => (
                                    <button
                                        key={style.id}
                                        onClick={() => onSettingsChange({...settings, visualStyle: style.id as any})}
                                        className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${settings.visualStyle === style.id ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-zinc-200 text-zinc-500 hover:border-zinc-400'}`}
                                    >
                                        <i className={`fa-regular ${style.icon} mb-1 text-sm`}></i>
                                        <span className="text-[10px] font-bold uppercase">{style.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="mt-4">
                            <span className="text-xs font-bold text-zinc-500 block mb-2">Çerçeve Deseni</span>
                            <div className="grid grid-cols-3 gap-2">
                                {['none', 'simple', 'math', 'verbal', 'stars', 'geo'].map((border) => (
                                    <button
                                        key={border}
                                        onClick={() => onSettingsChange({...settings, themeBorder: border as any})}
                                        className={`py-2 text-[10px] font-bold uppercase rounded border transition-all ${settings.themeBorder === border ? 'bg-zinc-800 text-white border-zinc-900' : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'}`}
                                    >
                                        {border}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="mt-4">
                            <CompactSlider 
                                icon="fa-pen-fancy" 
                                title="Çerçeve Kalınlığı" 
                                value={settings.borderWidth} min={0} max={10} 
                                displayValue={settings.borderWidth} unit="px"
                                onChange={(v: number) => onSettingsChange({...settings, borderWidth: v})} 
                            />
                        </div>
                    </DropdownPanel>
                )}
            </div>

            {/* SCAFFOLDING (Visibility) */}
            <div className="relative">
                <MenuButton 
                    icon="fa-solid fa-eye" 
                    label="Görünürlük" 
                    active={activeMenu === 'scaffold'} 
                    onClick={() => setActiveMenu(activeMenu === 'scaffold' ? 'none' : 'scaffold')} 
                />
                {activeMenu === 'scaffold' && (
                    <DropdownPanel title="Sayfa Bileşenleri" onClose={closeMenu}>
                        <div className="space-y-4">
                            {/* Header Group */}
                            <div>
                                <h5 className="text-[10px] font-bold text-indigo-500 uppercase mb-2 border-b border-indigo-100 pb-1">Sayfa Başı</h5>
                                <div className="space-y-1">
                                    <label className="flex items-center justify-between text-xs font-medium text-zinc-700 cursor-pointer hover:bg-zinc-50 p-1 rounded">
                                        <span>Öğrenci Bilgisi</span>
                                        <input type="checkbox" checked={settings.showStudentInfo} onChange={e => onSettingsChange({...settings, showStudentInfo: e.target.checked})} className="accent-indigo-600"/>
                                    </label>
                                    <label className="flex items-center justify-between text-xs font-medium text-zinc-700 cursor-pointer hover:bg-zinc-50 p-1 rounded">
                                        <span>Ana Başlık</span>
                                        <input type="checkbox" checked={settings.showTitle} onChange={e => onSettingsChange({...settings, showTitle: e.target.checked})} className="accent-indigo-600"/>
                                    </label>
                                </div>
                            </div>

                            {/* Content Group */}
                            <div>
                                <h5 className="text-[10px] font-bold text-amber-500 uppercase mb-2 border-b border-amber-100 pb-1">İçerik Desteği</h5>
                                <div className="space-y-1">
                                    <label className="flex items-center justify-between text-xs font-medium text-zinc-700 cursor-pointer hover:bg-zinc-50 p-1 rounded">
                                        <span>Yönerge Metni</span>
                                        <input type="checkbox" checked={settings.showInstruction} onChange={e => onSettingsChange({...settings, showInstruction: e.target.checked})} className="accent-amber-600"/>
                                    </label>
                                    <label className="flex items-center justify-between text-xs font-medium text-zinc-700 cursor-pointer hover:bg-zinc-50 p-1 rounded">
                                        <span>Konu Görseli</span>
                                        <input type="checkbox" checked={settings.showImage} onChange={e => onSettingsChange({...settings, showImage: e.target.checked})} className="accent-amber-600"/>
                                    </label>
                                    <label className="flex items-center justify-between text-xs font-medium text-zinc-700 cursor-pointer hover:bg-zinc-50 p-1 rounded">
                                        <span>Pedagojik Not</span>
                                        <input type="checkbox" checked={settings.showPedagogicalNote} onChange={e => onSettingsChange({...settings, showPedagogicalNote: e.target.checked})} className="accent-amber-600"/>
                                    </label>
                                </div>
                            </div>

                            {/* Footer Group */}
                            <div>
                                <h5 className="text-[10px] font-bold text-zinc-400 uppercase mb-2 border-b border-zinc-100 pb-1">Sayfa Sonu</h5>
                                <div className="space-y-1">
                                    <label className="flex items-center justify-between text-xs font-medium text-zinc-700 cursor-pointer hover:bg-zinc-50 p-1 rounded">
                                        <span>Sevimli Maskot</span>
                                        <input type="checkbox" checked={settings.showMascot} onChange={e => onSettingsChange({...settings, showMascot: e.target.checked})} className="accent-zinc-600"/>
                                    </label>
                                    <label className="flex items-center justify-between text-xs font-medium text-zinc-700 cursor-pointer hover:bg-zinc-50 p-1 rounded">
                                        <span>Alt Bilgi (Footer)</span>
                                        <input type="checkbox" checked={settings.showFooter} onChange={e => onSettingsChange({...settings, showFooter: e.target.checked})} className="accent-zinc-600"/>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </DropdownPanel>
                )}
            </div>
        </div>

        <Divider />

        {/* RIGHT SECTION: ACTIONS & TOOLS */}
        <div className="flex items-center gap-2 ml-auto">
            
            {/* Interactive Tools */}
            <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
                {onSpeak && (
                    <IconButton 
                        icon={isSpeaking ? "fa-stop" : "fa-volume-high"} 
                        onClick={isSpeaking ? onStopSpeak : onSpeak} 
                        active={isSpeaking} 
                        title="Sesli Oku" 
                    />
                )}
                {onToggleQR && (
                    <IconButton 
                        icon="fa-qrcode" 
                        onClick={onToggleQR} 
                        active={showQR} 
                        title="QR Kod" 
                    />
                )}
            </div>

            {/* Editor Tools */}
            {isEditMode && (
                <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg animate-in slide-in-from-right-2">
                    <IconButton icon="fa-font" onClick={onAddText} title="Metin Ekle" />
                    <div className="relative">
                        <IconButton icon="fa-icons" onClick={() => setShowStickers(!showStickers)} active={showStickers} title="Çıkartma" />
                        {showStickers && onAddSticker && (
                            <StickerPicker onSelect={(url) => { onAddSticker(url); setShowStickers(false); }} onClose={() => setShowStickers(false)} />
                        )}
                    </div>
                    <IconButton icon="fa-pen-nib" onClick={onToggleDraw} active={isDrawMode} title="Çizim" />
                </div>
            )}

            {/* Mode Switcher */}
            {onToggleEdit && (
                <button 
                    onClick={onToggleEdit}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        isEditMode 
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                        : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
                    }`}
                >
                    <i className={`fa-solid ${isEditMode ? 'fa-check' : 'fa-pen-ruler'}`}></i>
                    <span className="hidden sm:inline">{isEditMode ? 'Bitir' : 'Düzenle'}</span>
                </button>
            )}

            <Divider />

            {/* Output Actions */}
            <div className="flex gap-2">
                {onAddToWorkbook && (
                    <IconButton icon="fa-plus-circle" onClick={onAddToWorkbook} title="Kitapçığa Ekle" badge={workbookItemCount} />
                )}
                {onViewWorkbook && (
                    <IconButton icon="fa-book-open" onClick={onViewWorkbook} title="Kitapçığı Görüntüle" disabled={workbookItemCount === 0} />
                )}
                
                <button 
                    onClick={() => handleAction('print')}
                    disabled={isProcessing}
                    className="flex items-center gap-2 px-4 py-1.5 bg-zinc-900 hover:bg-black text-white rounded-lg text-xs font-bold transition-transform active:scale-95 disabled:opacity-50"
                >
                    {isProcessing ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-print"></i>}
                    <span className="hidden lg:inline">Yazdır</span>
                </button>

                <IconButton icon="fa-save" onClick={onSave} title="Kaydet" disabled={isProcessing} />
                <IconButton icon="fa-share-nodes" onClick={onShare} title="Paylaş" disabled={isProcessing} />
            </div>
        </div>
        
        {/* Click outside listener to close menus is handled inside DropdownPanel now */}
    </div>
    
    {worksheetData && (
        <PrintPreviewModal 
            isOpen={showPrintModal} 
            onClose={() => setShowPrintModal(false)}
            worksheetData={worksheetData}
            title={settings.showTitle ? "Etkinlik" : undefined}
        />
    )}
    </>
  );
};

export default Toolbar;
