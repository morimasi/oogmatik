
import React, { useState, useEffect, useRef } from 'react';
import { StyleSettings, WorksheetData } from '../types';
import { printService } from '../utils/printService';
import { snapshotService } from '../utils/snapshotService';
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
  onSpeak?: () => void;
  isSpeaking?: boolean;
  onStopSpeak?: () => void;
  showQR?: boolean;
  onToggleQR?: () => void;
  worksheetData?: WorksheetData;
  isCurriculumMode?: boolean;
  onCompleteCurriculumTask?: () => void;
}

// --- MICRO COMPONENTS ---

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
        {isLoading ? (
            <i className="fa-solid fa-circle-notch fa-spin"></i>
        ) : (
            <i className={`fa-solid ${icon}`}></i>
        )}
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
        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{label}</span>
        <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 rounded-md p-0.5">
            <button 
                onClick={() => onChange(Math.max(min, value - step))}
                className="w-6 h-6 flex items-center justify-center text-zinc-500 hover:bg-white dark:hover:bg-zinc-700 rounded shadow-sm transition-all"
                disabled={value <= min}
            >
                <i className="fa-solid fa-minus text-[10px]"></i>
            </button>
            <span className="text-xs font-mono font-bold w-8 text-center">{Math.round(value * 100) / 100}{unit}</span>
            <button 
                onClick={() => onChange(Math.min(max, value + step))}
                className="w-6 h-6 flex items-center justify-center text-zinc-500 hover:bg-white dark:hover:bg-zinc-700 rounded shadow-sm transition-all"
                disabled={value >= max}
            >
                <i className="fa-solid fa-plus text-[10px]"></i>
            </button>
        </div>
    </div>
);

const Toggle = ({ label, checked, onChange }: any) => (
    <div className="flex items-center justify-between py-1 cursor-pointer group" onClick={() => onChange(!checked)}>
        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200 transition-colors">{label}</span>
        <div className={`w-8 h-4 rounded-full relative transition-colors ${checked ? 'bg-indigo-500' : 'bg-zinc-300 dark:bg-zinc-600'}`}>
            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${checked ? 'left-4.5' : 'left-0.5'}`}></div>
        </div>
    </div>
);

const DropdownPanel = ({ title, children, onClose }: any) => {
    // Click outside handler
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                // Check if click was on the trigger button (prevent closing immediately if clicking toggle)
                const target = event.target as HTMLElement;
                if (!target.closest('button[data-dropdown-trigger]')) {
                    onClose();
                }
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    return (
        <div ref={ref} className="absolute top-full mt-2 left-0 w-72 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-2xl z-50 p-4 animate-in fade-in zoom-in-95 origin-top-left ring-1 ring-black/5">
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-zinc-100 dark:border-zinc-800">
                <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest">{title}</h4>
                <button onClick={onClose} className="text-zinc-300 hover:text-zinc-500"><i className="fa-solid fa-times"></i></button>
            </div>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {children}
            </div>
        </div>
    );
};

export const Toolbar: React.FC<ToolbarProps> = ({ 
    settings, onSettingsChange, onSave, onFeedback, onShare, onTogglePreview, isPreviewMode, 
    onAddToWorkbook, workbookItemCount, onViewWorkbook, onToggleEdit, isEditMode, onSnapshot, 
    onAddText, onAddSticker, onSpeak, isSpeaking, onStopSpeak, 
    showQR, onToggleQR, worksheetData,
    isCurriculumMode, onCompleteCurriculumTask
}) => {
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const [isStickerPickerOpen, setIsStickerPickerOpen] = useState(false);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [isProcessingSnapshot, setIsProcessingSnapshot] = useState(false);
    const [isProcessingSave, setIsProcessingSave] = useState(false);
    
    // Derived detail level based on current settings
    const getDetailLevel = (): 'clean' | 'standard' | 'teacher' | 'custom' => {
        if (!settings.showTitle && !settings.showInstruction && !settings.showPedagogicalNote && !settings.showFooter) return 'clean';
        if (settings.showTitle && settings.showInstruction && !settings.showPedagogicalNote && settings.showStudentInfo) return 'standard';
        if (settings.showTitle && settings.showInstruction && settings.showPedagogicalNote && settings.showStudentInfo && settings.showFooter) return 'teacher';
        return 'custom';
    };

    const setDetailLevel = (level: 'clean' | 'standard' | 'teacher') => {
        let updates: Partial<StyleSettings> = {};
        if (level === 'clean') {
            updates = { showTitle: false, showInstruction: false, showPedagogicalNote: false, showStudentInfo: false, showFooter: false };
        } else if (level === 'standard') {
            updates = { showTitle: true, showInstruction: true, showPedagogicalNote: false, showStudentInfo: true, showFooter: true };
        } else if (level === 'teacher') {
            updates = { showTitle: true, showInstruction: true, showPedagogicalNote: true, showStudentInfo: true, showFooter: true };
        }
        onSettingsChange({ ...settings, ...updates });
    };

    const currentLevel = getDetailLevel();

    const toggleMenu = (menu: string) => {
        setActiveMenu(activeMenu === menu ? null : menu);
        setIsStickerPickerOpen(false);
    };

    const updateSetting = (key: keyof StyleSettings, value: any) => {
        onSettingsChange({ ...settings, [key]: value });
    };

    const handlePrintPreview = () => {
        if (!worksheetData) return;
        setIsPreviewModalOpen(true);
    };
    
    const handleSnapshot = async () => {
        setIsProcessingSnapshot(true);
        try {
            await snapshotService.takeSnapshot('.worksheet-item', 'bursa-disleksi-etkinlik');
        } catch (e) {
            console.error(e);
            alert("Görüntü oluşturulamadı.");
        } finally {
            setIsProcessingSnapshot(false);
        }
    };
    
    const handleSaveClick = async () => {
        setIsProcessingSave(true);
        try {
            await onSave();
        } finally {
            setTimeout(() => setIsProcessingSave(false), 500); // Visual feedback
        }
    };

    return (
        <div className="flex items-center justify-between gap-2 h-12 select-none relative">
            
            {/* LEFT: SETTINGS GROUPS */}
            <div className="flex items-center gap-2">
                
                {/* 1. Layout Group */}
                <div className="relative">
                    <MenuButton 
                        icon="fa-ruler-combined" 
                        label="Düzen" 
                        active={false} 
                        isOpen={activeMenu === 'layout'}
                        onClick={() => toggleMenu('layout')} 
                        data-dropdown-trigger
                    />
                    {activeMenu === 'layout' && (
                        <DropdownPanel title="Sayfa Düzeni" onClose={() => setActiveMenu(null)}>
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-zinc-500 mb-2">Kağıt Yönü</p>
                                <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
                                    <button onClick={() => updateSetting('orientation', 'portrait')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${settings.orientation === 'portrait' ? 'bg-white shadow-sm text-indigo-600' : 'text-zinc-500'}`}>Dikey</button>
                                    <button onClick={() => updateSetting('orientation', 'landscape')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${settings.orientation === 'landscape' ? 'bg-white shadow-sm text-indigo-600' : 'text-zinc-500'}`}>Yatay</button>
                                </div>
                            </div>
                            
                            <NumberControl 
                                label="Sütun Sayısı" 
                                value={settings.columns} 
                                onChange={(v: number) => updateSetting('columns', v)} 
                                min={1} max={4} 
                            />
                            
                            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                                <p className="text-xs font-bold text-indigo-500 mb-2 flex items-center gap-1">
                                    <i className="fa-solid fa-wand-magic-sparkles"></i> Akıllı Akış
                                </p>
                                <NumberControl 
                                    label="Ölçek (Zoom)" 
                                    value={settings.scale} 
                                    onChange={(v: number) => updateSetting('scale', v)} 
                                    min={0.5} max={1.5} step={0.1} unit="x" 
                                />
                                <Toggle 
                                    label="Oto-Sayfalama" 
                                    checked={settings.smartPagination} 
                                    onChange={(v: boolean) => updateSetting('smartPagination', v)} 
                                />
                            </div>
                        </DropdownPanel>
                    )}
                </div>

                {/* 2. Typography Group */}
                <div className="relative">
                    <MenuButton 
                        icon="fa-font" 
                        label="Yazı" 
                        active={false} 
                        isOpen={activeMenu === 'typography'}
                        onClick={() => toggleMenu('typography')} 
                        data-dropdown-trigger
                    />
                    {activeMenu === 'typography' && (
                        <DropdownPanel title="Tipografi" onClose={() => setActiveMenu(null)}>
                            <div className="space-y-2">
                                <p className="text-xs font-bold text-zinc-500">Yazı Tipi</p>
                                <select 
                                    value={settings.fontFamily} 
                                    onChange={(e) => updateSetting('fontFamily', e.target.value)}
                                    className="w-full text-xs p-2 rounded-lg border border-zinc-200 bg-zinc-50 outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="OpenDyslexic">OpenDyslexic (Okuma Dostu)</option>
                                    <option value="Lexend">Lexend (Modern)</option>
                                    <option value="Comic Neue">Comic Neue (Eğlenceli)</option>
                                    <option value="Inter">Inter (Standart)</option>
                                </select>
                            </div>

                            <NumberControl label="Punto" value={settings.fontSize} onChange={(v: number) => updateSetting('fontSize', v)} min={12} max={36} unit="px" />
                            <NumberControl label="Satır Aralığı" value={settings.lineHeight} onChange={(v: number) => updateSetting('lineHeight', v)} min={1} max={2.5} step={0.1} />
                            <NumberControl label="Harf Boşluğu" value={settings.letterSpacing} onChange={(v: number) => updateSetting('letterSpacing', v)} min={0} max={5} unit="px" />
                            
                            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                                <p className="text-xs font-bold text-zinc-400 mb-2 uppercase">Hazır Ayarlar</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <button 
                                        onClick={() => {
                                            onSettingsChange({...settings, fontFamily: 'OpenDyslexic', lineHeight: 2, letterSpacing: 2, fontSize: 18});
                                        }}
                                        className="px-2 py-1.5 bg-indigo-50 text-indigo-700 rounded text-[10px] font-bold hover:bg-indigo-100 border border-indigo-200"
                                    >
                                        Disleksi Modu
                                    </button>
                                    <button 
                                        onClick={() => {
                                            onSettingsChange({...settings, fontFamily: 'Inter', lineHeight: 1.2, letterSpacing: 0, fontSize: 14, columns: 2});
                                        }}
                                        className="px-2 py-1.5 bg-zinc-100 text-zinc-600 rounded text-[10px] font-bold hover:bg-zinc-200 border border-zinc-200"
                                    >
                                        Sıkışık Mod
                                    </button>
                                </div>
                            </div>
                        </DropdownPanel>
                    )}
                </div>

                {/* 3. Appearance Group (Replaces old 'Görünüm' with Detail Levels) */}
                <div className="relative">
                    <MenuButton 
                        icon="fa-sliders" 
                        label="Detaylar" 
                        active={false} 
                        isOpen={activeMenu === 'appearance'}
                        onClick={() => toggleMenu('appearance')} 
                        data-dropdown-trigger
                    />
                    {activeMenu === 'appearance' && (
                        <DropdownPanel title="Görünüm ve Detaylar" onClose={() => setActiveMenu(null)}>
                            {/* Detail Level Selector */}
                            <div className="bg-zinc-100 p-1 rounded-lg flex mb-4">
                                <button onClick={() => setDetailLevel('clean')} className={`flex-1 py-1.5 text-[10px] font-bold rounded ${currentLevel === 'clean' ? 'bg-white shadow-sm text-black' : 'text-zinc-500'}`}>Sade</button>
                                <button onClick={() => setDetailLevel('standard')} className={`flex-1 py-1.5 text-[10px] font-bold rounded ${currentLevel === 'standard' ? 'bg-white shadow-sm text-black' : 'text-zinc-500'}`}>Öğrenci</button>
                                <button onClick={() => setDetailLevel('teacher')} className={`flex-1 py-1.5 text-[10px] font-bold rounded ${currentLevel === 'teacher' ? 'bg-white shadow-sm text-black' : 'text-zinc-500'}`}>Öğretmen</button>
                            </div>

                            <div className="space-y-1">
                                <p className="text-xs font-bold text-zinc-500 mb-2">Kenarlık Stili</p>
                                <div className="grid grid-cols-3 gap-2">
                                    {['none', 'simple', 'math', 'verbal', 'stars', 'geo'].map(b => (
                                        <button 
                                            key={b}
                                            onClick={() => updateSetting('themeBorder', b)}
                                            className={`h-8 border rounded flex items-center justify-center hover:bg-zinc-50 ${settings.themeBorder === b ? 'ring-2 ring-indigo-500 border-transparent' : 'border-zinc-200'}`}
                                            title={b}
                                        >
                                            <div className={`w-4 h-4 ${b === 'none' ? 'border border-dashed border-zinc-300' : 'bg-zinc-200'}`}></div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <NumberControl label="Kenar Boşluğu" value={settings.margin} onChange={(v: number) => updateSetting('margin', v)} min={0} max={100} unit="px" />
                            
                            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                                <p className="text-xs font-bold text-zinc-400 mb-2 uppercase">Özel Ayarlar</p>
                                <Toggle label="Başlık" checked={settings.showTitle} onChange={(v: boolean) => updateSetting('showTitle', v)} />
                                <Toggle label="Yönerge" checked={settings.showInstruction} onChange={(v: boolean) => updateSetting('showInstruction', v)} />
                                <Toggle label="Pedagojik Not" checked={settings.showPedagogicalNote} onChange={(v: boolean) => updateSetting('showPedagogicalNote', v)} />
                                <Toggle label="Öğrenci Bilgisi" checked={settings.showStudentInfo} onChange={(v: boolean) => updateSetting('showStudentInfo', v)} />
                                <Toggle label="Alt Bilgi" checked={settings.showFooter} onChange={(v: boolean) => updateSetting('showFooter', v)} />
                                <Toggle label="Görsel (Image)" checked={settings.showImage} onChange={(v: boolean) => updateSetting('showImage', v)} />
                            </div>
                        </DropdownPanel>
                    )}
                </div>

            </div>

            <Divider />

            {/* MIDDLE: TOOLS */}
            <div className="flex items-center gap-1">
                <IconButton 
                    icon="fa-pen-to-square" 
                    title="Düzenle (Metin)" 
                    active={isEditMode} 
                    onClick={onToggleEdit} 
                />
                
                <div className="relative">
                    <IconButton 
                        icon="fa-icons" 
                        title="Çıkartma Ekle" 
                        active={isStickerPickerOpen}
                        onClick={() => setIsStickerPickerOpen(!isStickerPickerOpen)}
                    />
                    {isStickerPickerOpen && onAddSticker && (
                        <StickerPicker onSelect={(url) => { onAddSticker(url); setIsStickerPickerOpen(false); }} onClose={() => setIsStickerPickerOpen(false)} />
                    )}
                </div>

                <div className="w-px h-6 bg-zinc-200 mx-1"></div>

                <IconButton 
                    icon={isSpeaking ? "fa-stop" : "fa-volume-high"} 
                    title="Sesli Oku (TTS)" 
                    active={isSpeaking}
                    onClick={isSpeaking ? onStopSpeak : onSpeak} 
                    colorClass={isSpeaking ? "text-red-500 animate-pulse" : ""}
                />
                <IconButton 
                    icon="fa-qrcode" 
                    title="QR Kod Ekle" 
                    active={showQR} 
                    onClick={onToggleQR} 
                />
            </div>

            <Divider />

            {/* RIGHT: ACTIONS */}
            <div className="flex items-center gap-2">
                {isCurriculumMode ? (
                    <button 
                        onClick={onCompleteCurriculumTask}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors shadow-md animate-in fade-in zoom-in"
                        title="Görevi Tamamla ve Plana Dön"
                    >
                        <i className="fa-solid fa-check-circle"></i>
                        <span className="hidden lg:inline">Görevi Tamamla</span>
                    </button>
                ) : (
                    <button 
                        onClick={onAddToWorkbook}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200"
                        title="Kitapçığa Ekle"
                    >
                        <i className="fa-solid fa-plus-circle"></i>
                        <span className="hidden lg:inline">Kitapçık</span>
                        <span className="bg-emerald-600 text-white px-1.5 py-0.5 rounded-full text-[10px]">{workbookItemCount}</span>
                    </button>
                )}

                <div className="flex bg-zinc-100 p-1 rounded-lg">
                    <IconButton 
                        icon="fa-print" 
                        title="Yazdır / PDF Önizle" 
                        onClick={handlePrintPreview}
                    />
                    <IconButton 
                        icon="fa-camera" 
                        title="Görüntü Olarak Kaydet (PNG)" 
                        onClick={handleSnapshot}
                        isLoading={isProcessingSnapshot}
                    />
                    <IconButton 
                        icon="fa-save" 
                        title="Kaydet" 
                        onClick={handleSaveClick}
                        isLoading={isProcessingSave}
                    />
                    <IconButton 
                        icon="fa-share-nodes" 
                        title="Paylaş" 
                        onClick={onShare}
                    />
                </div>
            </div>

            {/* Print Preview Modal */}
            {worksheetData && (
                <PrintPreviewModal 
                    isOpen={isPreviewModalOpen} 
                    onClose={() => setIsPreviewModalOpen(false)} 
                    worksheetData={worksheetData} 
                    title="Baskı Önizleme"
                />
            )}
        </div>
    );
};
