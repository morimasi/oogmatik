
import React, { useState, useRef, useEffect } from 'react';
import { StyleSettings, WorksheetData } from '../types';
import { printService } from '../utils/printService';
import { snapshotService } from '../utils/snapshotService';

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

const Divider = () => <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-700 mx-2 self-center"></div>;

const IconButton = ({ icon, onClick, active, title, disabled, badge, colorClass, isLoading }: any) => (
    <button 
        onClick={onClick}
        disabled={disabled || isLoading}
        title={title}
        className={`relative w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-200 ${
            active 
            ? 'bg-zinc-900 text-white dark:bg-white dark:text-black shadow-md transform scale-105' 
            : `text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 ${colorClass || 'hover:text-zinc-900 dark:hover:text-zinc-200'}`
        } ${(disabled || isLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
        {isLoading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className={`fa-solid ${icon}`}></i>}
        {badge > 0 && !isLoading && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-900">
                {badge}
            </span>
        )}
    </button>
);

const MenuButton = ({ icon, label, onClick, active, isOpen }: any) => (
    <button
        onClick={onClick}
        data-dropdown-trigger
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all border select-none ${
            active || isOpen
            ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-700 dark:text-indigo-300'
            : 'bg-white border-transparent text-zinc-600 hover:bg-zinc-50 hover:border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
        }`}
    >
        <i className={`fa-solid ${icon} ${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-400'}`}></i>
        <span className="hidden xl:inline">{label}</span>
        <i className={`fa-solid fa-chevron-down text-[10px] ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
    </button>
);

const NumberControl = ({ label, value, onChange, min, max, step = 1, unit = '' }: any) => (
    <div className="flex items-center justify-between py-1">
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight">{label}</span>
        <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 rounded-md p-0.5">
            <button onClick={() => onChange(Math.max(min, value - step))} className="w-6 h-6 flex items-center justify-center text-zinc-500 hover:bg-white dark:hover:bg-zinc-700 rounded shadow-sm transition-all" disabled={value <= min}><i className="fa-solid fa-minus text-[10px]"></i></button>
            <span className="text-xs font-mono font-bold w-10 text-center">{Math.round(value * 100) / 100}{unit}</span>
            <button onClick={() => onChange(Math.min(max, value + step))} className="w-6 h-6 flex items-center justify-center text-zinc-500 hover:bg-white dark:hover:bg-zinc-700 rounded shadow-sm transition-all" disabled={value >= max}><i className="fa-solid fa-plus text-[10px]"></i></button>
        </div>
    </div>
);

const Toggle = ({ label, checked, onChange }: any) => (
    <div className="flex items-center justify-between py-1 cursor-pointer group" onClick={() => onChange(!checked)}>
        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200 transition-colors">{label}</span>
        <div className={`w-8 h-4 rounded-full relative transition-colors ${checked ? 'bg-indigo-500' : 'bg-zinc-300 dark:bg-zinc-600'}`}>
            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-all ${checked ? 'left-4.5' : 'left-0.5'}`}></div>
        </div>
    </div>
);

const DropdownPanel = ({ title, children, onClose, className = "" }: any) => {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                const target = event.target as HTMLElement;
                if (!target.closest('button[data-dropdown-trigger]')) onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    return (
        <div ref={ref} className={`absolute top-full mt-2 left-0 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-2xl z-50 p-4 animate-in fade-in zoom-in-95 origin-top-left ring-1 ring-black/5 ${className}`}>
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-zinc-100 dark:border-zinc-800">
                <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest">{title}</h4>
                <button onClick={onClose} className="text-zinc-300 hover:text-zinc-500"><i className="fa-solid fa-times"></i></button>
            </div>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">{children}</div>
        </div>
    );
};

export const Toolbar: React.FC<ToolbarProps> = ({ 
    settings, onSettingsChange, onSave, onFeedback, onShare, onTogglePreview, isPreviewMode, 
    onAddToWorkbook, workbookItemCount, onToggleEdit, isEditMode,
    onAddSticker, onSpeak, isSpeaking, onStopSpeak, 
    showQR, onToggleQR, worksheetData,
    isCurriculumMode, onCompleteCurriculumTask
}) => {
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    
    const updateSetting = (key: keyof StyleSettings, value: any) => {
        onSettingsChange({ ...settings, [key]: value });
    };

    return (
        <div className="flex items-center justify-between gap-2 h-12 select-none relative">
            <div className="flex items-center gap-2">
                <div className="relative">
                    <MenuButton icon="fa-font" label="Tipografi" isOpen={activeMenu === 'typo'} onClick={() => setActiveMenu(activeMenu === 'typo' ? null : 'typo')} />
                    {activeMenu === 'typo' && (
                        <DropdownPanel title="Yazı Ayarları" onClose={() => setActiveMenu(null)} className="w-80">
                            <NumberControl label="Punto" value={settings.fontSize} onChange={(v:any) => updateSetting('fontSize', v)} min={12} max={48} />
                            <NumberControl label="Satır Aralığı" value={settings.lineHeight} onChange={(v:any) => updateSetting('lineHeight', v)} min={1} max={3} step={0.1} />
                            <NumberControl label="Harf Aralığı" value={settings.letterSpacing} onChange={(v:any) => updateSetting('letterSpacing', v)} min={0} max={10} step={0.5} />
                            <NumberControl label="Kelime Aralığı" value={settings.wordSpacing || 0} onChange={(v:any) => updateSetting('wordSpacing', v)} min={0} max={20} />
                            <NumberControl label="Paragraf Boşluğu" value={settings.paragraphSpacing || 20} onChange={(v:any) => updateSetting('paragraphSpacing', v)} min={0} max={60} />
                            <div className="pt-2 border-t border-zinc-100">
                                <label className="text-[10px] font-black text-zinc-400 uppercase mb-2 block">Yazı Tipi</label>
                                <div className="grid grid-cols-2 gap-1">
                                    {['Lexend', 'OpenDyslexic', 'Inter', 'Comic Neue'].map(f => (
                                        <button key={f} onClick={() => updateSetting('fontFamily', f)} className={`py-1.5 text-[10px] rounded border transition-all ${settings.fontFamily === f ? 'bg-indigo-600 text-white' : 'hover:bg-zinc-100'}`} style={{ fontFamily: f }}>{f}</button>
                                    ))}
                                </div>
                            </div>
                        </DropdownPanel>
                    )}
                </div>

                <div className="relative">
                    <MenuButton icon="fa-eye" label="Klinik Odak" active={settings.focusMode} isOpen={activeMenu === 'clinical'} onClick={() => setActiveMenu(activeMenu === 'clinical' ? null : 'clinical')} />
                    {activeMenu === 'clinical' && (
                        <DropdownPanel title="Erişilebilirlik Araçları" onClose={() => setActiveMenu(null)} className="w-72">
                            <Toggle label="Odak Modu (Takip Cetveli)" checked={settings.focusMode} onChange={(v:any) => updateSetting('focusMode', v)} />
                            {settings.focusMode && (
                                <div className="space-y-4 pt-2 border-t border-zinc-100 animate-in fade-in duration-300">
                                    <NumberControl label="Cetvel Yüksekliği" value={settings.rulerHeight || 80} onChange={(v:any) => updateSetting('rulerHeight', v)} min={40} max={200} />
                                    <NumberControl label="Maske Opaklığı" value={settings.maskOpacity || 0.4} onChange={(v:any) => updateSetting('maskOpacity', v)} min={0.1} max={0.9} step={0.1} />
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-zinc-500 uppercase">Cetvel Rengi</label>
                                        <div className="flex gap-2">
                                            {['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#000000'].map(c => (
                                                <button key={c} onClick={() => updateSetting('rulerColor', c)} className={`w-6 h-6 rounded-full border-2 transition-all ${settings.rulerColor === c ? 'border-zinc-900 scale-125' : 'border-transparent'}`} style={{ backgroundColor: c }} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </DropdownPanel>
                    )}
                </div>
            </div>

            <Divider />

            <div className="flex items-center gap-1">
                <IconButton icon="fa-pen-to-square" title="Editör Modu" active={isEditMode} onClick={onToggleEdit} />
                <IconButton icon={isSpeaking ? "fa-stop" : "fa-volume-high"} title="Sesli Oku" active={isSpeaking} onClick={isSpeaking ? onStopSpeak : onSpeak} colorClass={isSpeaking ? "text-red-500 animate-pulse" : ""} />
            </div>

            <Divider />

            <div className="flex items-center gap-2">
                <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
                    <IconButton icon="fa-print" title="Yazdır (PDF)" onClick={async () => await printService.generatePdf('.worksheet-page', settings.title, { action: 'print' })} />
                    <IconButton icon="fa-camera" title="Görüntü Olarak Kaydet" onClick={() => snapshotService.takeSnapshot('.worksheet-page', 'etkinlik')} />
                    <IconButton icon="fa-save" title="Arşive Kaydet" onClick={onSave} />
                </div>
                {onShare && <IconButton icon="fa-share-nodes" title="Paylaş" onClick={onShare} colorClass="bg-indigo-600 text-white hover:bg-indigo-700" />}
            </div>
        </div>
    );
};

const CompactToggleGroup = ({ label, selected, onChange, options }: any) => (
    <div className="space-y-1">
        <label className="text-[10px] font-bold text-zinc-500 uppercase block">{label}</label>
        <div className="flex bg-zinc-100 p-1 rounded-lg">
            {options.map((opt: any) => (
                <button key={opt.value} onClick={() => onChange(opt.value)} className={`flex-1 py-1.5 text-[10px] font-bold rounded ${selected === opt.value ? 'bg-white shadow-sm text-indigo-600' : 'text-zinc-500 hover:text-zinc-700'}`}>{opt.label}</button>
            ))}
        </div>
    </div>
);
