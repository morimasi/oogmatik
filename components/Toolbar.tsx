
import React, { useState } from 'react';
import { StyleSettings } from '../types';
import { printService } from '../utils/printService';

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
}

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
    onSnapshot
}) => {
  const [activeMenu, setActiveMenu] = useState<'none' | 'visual' | 'visibility' | 'type' | 'theme'>('none');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAction = async (action: 'print' | 'download') => {
      setIsProcessing(true);
      // Wait for React to render any pending updates
      setTimeout(async () => {
          await printService.generatePdf('.worksheet-item', 'Etkinlik', { action });
          setIsProcessing(false);
      }, 100);
  };

  const CompactSlider = ({ icon, value, min, max, step, onChange, title, displayValue }: any) => (
      <div className="flex items-center gap-1.5 group" title={title}>
          <i className={`fa-solid ${icon} text-[var(--text-muted)] group-hover:text-[var(--accent-color)] transition-colors text-xs w-4 text-center`}></i>
          <input 
              type="range" 
              min={min} 
              max={max} 
              step={step || 1}
              value={value}
              onChange={(e) => onChange(Number(e.target.value))}
              className="w-16 h-1 bg-zinc-600 rounded-lg appearance-none cursor-pointer accent-[var(--accent-color)] hover:accent-[var(--accent-hover)] transition-all"
          />
          <span className="text-[10px] font-mono text-[var(--text-secondary)] w-6 text-right leading-none">{displayValue || value}</span>
      </div>
  );

  const ToggleButton = ({ icon, label, active, onClick }: { icon: string, label: string, active: boolean, onClick: () => void }) => (
      <button 
          onClick={onClick}
          className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg text-[10px] font-bold transition-all border ${active ? 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800' : 'bg-[var(--bg-inset)] text-[var(--text-secondary)] border-transparent hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}
      >
          <i className={`fa-solid ${icon} text-lg`}></i>
          <span>{label}</span>
      </button>
  );

  return (
    <div id="tour-toolbar" className="bg-[var(--panel-bg)] backdrop-blur-xl border border-[var(--border-color)] px-3 py-2 rounded-xl shadow-sm flex flex-wrap items-center justify-between gap-y-2 gap-x-4 transition-all duration-300 relative">
        
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
             {/* Orientation Toggle */}
             <div className="flex items-center bg-[var(--bg-inset)] rounded-lg p-1 mr-2">
                <button 
                    onClick={() => onSettingsChange({...settings, orientation: 'portrait'})}
                    className={`p-1.5 rounded-md transition-all ${settings.orientation === 'portrait' ? 'bg-[var(--bg-paper)] shadow-sm text-[var(--accent-color)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                    title="Dikey (Portrait)"
                >
                    <i className="fa-regular fa-file"></i>
                </button>
                <button 
                    onClick={() => onSettingsChange({...settings, orientation: 'landscape'})}
                    className={`p-1.5 rounded-md transition-all ${settings.orientation === 'landscape' ? 'bg-[var(--bg-paper)] shadow-sm text-[var(--accent-color)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                    title="Yatay (Landscape)"
                >
                    <i className="fa-regular fa-file fa-rotate-90"></i>
                </button>
            </div>

             <CompactSlider 
                icon="fa-magnifying-glass" 
                title="Ölçek / Zoom" 
                min={0.5} max={2.0} step={0.1}
                value={settings.scale} 
                onChange={(v: number) => onSettingsChange({...settings, scale: v})}
                displayValue={`${Math.round(settings.scale * 100)}%`}
             />
             
             <div className="h-3 w-px bg-zinc-600 hidden sm:block"></div>

             <CompactSlider 
                icon="fa-table-columns" 
                title="Sütun Sayısı" 
                min={1} max={6} 
                value={settings.columns} 
                onChange={(v: number) => onSettingsChange({...settings, columns: v})}
             />

             {/* Style Settings Dropdown */}
             <div className="relative">
                 <button
                    onClick={() => setActiveMenu(activeMenu === 'theme' ? 'none' : 'theme')}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold transition-colors ${activeMenu === 'theme' ? 'bg-[var(--accent-color)] text-black' : 'bg-[var(--bg-inset)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                    title="Görsel Stil"
                 >
                     <i className="fa-solid fa-swatchbook"></i> Tema
                 </button>
                 
                 {activeMenu === 'theme' && (
                     <div className="absolute top-full left-0 mt-2 w-48 bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-lg shadow-xl p-3 z-50 flex flex-col gap-3 animate-in fade-in zoom-in-95">
                         <div>
                             <span className="text-xs font-bold text-[var(--text-secondary)] block mb-1">Kart Stili</span>
                             <div className="grid grid-cols-2 gap-1">
                                 {['minimal', 'boxed', 'card', 'zebra'].map((s) => (
                                     <button 
                                        key={s} 
                                        onClick={() => onSettingsChange({...settings, visualStyle: s as any})}
                                        className={`h-8 rounded border flex items-center justify-center text-[10px] font-bold uppercase transition-all ${settings.visualStyle === s ? 'bg-[var(--accent-color)] text-black border-transparent' : 'bg-[var(--bg-inset)] text-[var(--text-muted)] border-transparent hover:bg-zinc-700'}`}
                                     >
                                         {s}
                                     </button>
                                 ))}
                             </div>
                         </div>
                         <div>
                             <span className="text-xs font-bold text-[var(--text-secondary)] block mb-1">Çerçeve</span>
                             <div className="grid grid-cols-3 gap-1">
                                 {['none', 'simple', 'math', 'verbal', 'stars', 'geo'].map((b) => (
                                     <button 
                                        key={b} 
                                        onClick={() => onSettingsChange({...settings, themeBorder: b as any})}
                                        className={`h-8 rounded border flex items-center justify-center text-[10px] font-bold uppercase transition-all ${settings.themeBorder === b ? 'bg-[var(--accent-color)] text-black border-transparent' : 'bg-[var(--bg-inset)] text-[var(--text-muted)] border-transparent hover:bg-zinc-700'}`}
                                     >
                                         {b.slice(0,3)}
                                     </button>
                                 ))}
                             </div>
                         </div>
                         <div>
                             <span className="text-xs font-bold text-[var(--text-secondary)] block mb-1">Kenar Boşluğu</span>
                             <input type="range" min="0" max="80" value={settings.margin} onChange={(e) => onSettingsChange({...settings, margin: Number(e.target.value)})} className="w-full h-1 bg-zinc-600 rounded-lg appearance-none cursor-pointer accent-[var(--accent-color)]" />
                         </div>
                     </div>
                 )}
             </div>

             {/* Typography Dropdown */}
             <div className="relative">
                 <button
                    onClick={() => setActiveMenu(activeMenu === 'type' ? 'none' : 'type')}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold transition-colors ${activeMenu === 'type' ? 'bg-[var(--accent-color)] text-black' : 'bg-[var(--bg-inset)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                    title="Tipografi Ayarları"
                 >
                     <i className="fa-solid fa-font"></i> Yazı
                 </button>
                 
                 {activeMenu === 'type' && (
                     <div className="absolute top-full left-0 mt-2 w-56 bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-lg shadow-xl p-3 z-50 flex flex-col gap-3 animate-in fade-in zoom-in-95">
                         
                         {/* Font Family */}
                         <div>
                             <span className="text-xs font-bold text-[var(--text-secondary)] block mb-1">Font</span>
                             <select 
                                value={settings.fontFamily || 'OpenDyslexic'} 
                                onChange={(e) => onSettingsChange({...settings, fontFamily: e.target.value as any})}
                                className="w-full bg-[var(--bg-inset)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] p-1 rounded"
                             >
                                 <option value="OpenDyslexic">OpenDyslexic</option>
                                 <option value="Lexend">Lexend (Okuma)</option>
                                 <option value="Inter">Inter (Modern)</option>
                                 <option value="Comic Neue">Comic Sans (El Yazısı)</option>
                                 <option value="Lora">Lora (Kitap)</option>
                             </select>
                         </div>

                         <div className="flex justify-between bg-[var(--bg-inset)] p-1 rounded">
                             <button onClick={() => onSettingsChange({...settings, fontWeight: settings.fontWeight === 'bold' ? 'normal' : 'bold'})} className={`p-1.5 rounded flex-1 ${settings.fontWeight === 'bold' ? 'bg-white text-black shadow-sm' : 'text-zinc-500'}`}><i className="fa-solid fa-bold"></i></button>
                             <button onClick={() => onSettingsChange({...settings, fontStyle: settings.fontStyle === 'italic' ? 'normal' : 'italic'})} className={`p-1.5 rounded flex-1 ${settings.fontStyle === 'italic' ? 'bg-white text-black shadow-sm' : 'text-zinc-500'}`}><i className="fa-solid fa-italic"></i></button>
                         </div>
                         
                         <div className="flex justify-between bg-[var(--bg-inset)] p-1 rounded">
                             <button onClick={() => onSettingsChange({...settings, contentAlign: 'left'})} className={`p-1.5 rounded flex-1 ${settings.contentAlign === 'left' ? 'bg-white text-black shadow-sm' : 'text-zinc-500'}`}><i className="fa-solid fa-align-left"></i></button>
                             <button onClick={() => onSettingsChange({...settings, contentAlign: 'center'})} className={`p-1.5 rounded flex-1 ${settings.contentAlign === 'center' ? 'bg-white text-black shadow-sm' : 'text-zinc-500'}`}><i className="fa-solid fa-align-center"></i></button>
                             <button onClick={() => onSettingsChange({...settings, contentAlign: 'right'})} className={`p-1.5 rounded flex-1 ${settings.contentAlign === 'right' ? 'bg-white text-black shadow-sm' : 'text-zinc-500'}`}><i className="fa-solid fa-align-right"></i></button>
                         </div>
                         
                         <div>
                             <span className="text-xs font-bold text-[var(--text-secondary)] block mb-1">Punto (Boyut)</span>
                             <input type="range" min="12" max="32" value={settings.fontSize} onChange={(e) => onSettingsChange({...settings, fontSize: Number(e.target.value)})} className="w-full h-1 bg-zinc-600 rounded-lg appearance-none cursor-pointer accent-[var(--accent-color)]" />
                         </div>

                         <div>
                             <span className="text-xs font-bold text-[var(--text-secondary)] block mb-1">Satır Aralığı</span>
                             <input type="range" min="10" max="25" value={(settings.lineHeight || 1.5) * 10} onChange={(e) => onSettingsChange({...settings, lineHeight: Number(e.target.value) / 10})} className="w-full h-1 bg-zinc-600 rounded-lg appearance-none cursor-pointer accent-[var(--accent-color)]" />
                         </div>

                         <div>
                             <span className="text-xs font-bold text-[var(--text-secondary)] block mb-1">Harf Aralığı</span>
                             <input type="range" min="0" max="50" value={(settings.letterSpacing || 0) * 10} onChange={(e) => onSettingsChange({...settings, letterSpacing: Number(e.target.value) / 10})} className="w-full h-1 bg-zinc-600 rounded-lg appearance-none cursor-pointer accent-[var(--accent-color)]" />
                         </div>
                     </div>
                 )}
             </div>

             {/* Visibility Dropdown (Enhanced) */}
             <div className="relative">
                 <button
                    onClick={() => setActiveMenu(activeMenu === 'visibility' ? 'none' : 'visibility')}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold transition-colors ${activeMenu === 'visibility' ? 'bg-[var(--accent-color)] text-black' : 'bg-[var(--bg-inset)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                    title="Sayfa Bileşenleri"
                 >
                     <i className="fa-solid fa-eye"></i> Görünürlük
                 </button>
                 
                 {activeMenu === 'visibility' && (
                     <div className="absolute top-full left-0 mt-2 w-64 bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-lg shadow-xl p-3 z-50 animate-in fade-in zoom-in-95">
                         <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase mb-2">Sayfa Bileşenleri</h4>
                         <div className="grid grid-cols-2 gap-2">
                             <ToggleButton icon="fa-user-pen" label="Öğrenci" active={settings.showStudentInfo} onClick={() => onSettingsChange({...settings, showStudentInfo: !settings.showStudentInfo})} />
                             <ToggleButton icon="fa-heading" label="Başlık" active={settings.showTitle} onClick={() => onSettingsChange({...settings, showTitle: !settings.showTitle})} />
                             <ToggleButton icon="fa-quote-left" label="Yönerge" active={settings.showInstruction} onClick={() => onSettingsChange({...settings, showInstruction: !settings.showInstruction})} />
                             <ToggleButton icon="fa-image" label="Görsel" active={settings.showImage} onClick={() => onSettingsChange({...settings, showImage: !settings.showImage})} />
                             <ToggleButton icon="fa-graduation-cap" label="Eğt. Notu" active={settings.showPedagogicalNote} onClick={() => onSettingsChange({...settings, showPedagogicalNote: !settings.showPedagogicalNote})} />
                             <ToggleButton icon="fa-otter" label="Maskot" active={settings.showMascot} onClick={() => onSettingsChange({...settings, showMascot: !settings.showMascot})} />
                             <ToggleButton icon="fa-copyright" label="Alt Bilgi" active={settings.showFooter} onClick={() => onSettingsChange({...settings, showFooter: !settings.showFooter})} />
                         </div>
                     </div>
                 )}
             </div>

        </div>
      
        {/* Actions Group */}
        <div className="flex items-center gap-2 shrink-0 ml-auto">
            {/* EDIT TOGGLE BUTTON */}
            {onToggleEdit && (
                <button 
                    onClick={onToggleEdit}
                    disabled={isProcessing}
                    className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all flex items-center gap-1.5 shadow-sm border ${isEditMode ? 'bg-indigo-600 text-white border-indigo-600 ring-2 ring-indigo-200 animate-pulse' : 'bg-white text-zinc-600 border-zinc-300 hover:bg-zinc-50'}`}
                    title={isEditMode ? "Düzenlemeyi Bitir ve Kaydet" : "Düzenleme Modu"}
                >
                    {isEditMode ? (
                        <>
                            <i className="fa-solid fa-check"></i>
                            <span className="hidden sm:inline">Bitir</span>
                        </>
                    ) : (
                        <>
                            <i className="fa-solid fa-pen-ruler"></i>
                            <span className="hidden sm:inline">Düzenle</span>
                        </>
                    )}
                </button>
            )}

            {/* DOWNLOAD PDF BUTTON */}
            <button 
                onClick={() => handleAction('download')}
                disabled={isProcessing}
                className="px-3 py-1.5 rounded-md text-[10px] font-bold transition-all flex items-center gap-1.5 shadow-sm border bg-red-600 text-white border-red-700 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                title="PDF İndir"
            >
                {isProcessing ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-file-pdf"></i>}
                <span className="hidden sm:inline">PDF İndir</span>
            </button>

            {/* PRINT BUTTON */}
            <button 
                onClick={() => handleAction('print')}
                disabled={isProcessing}
                className="px-3 py-1.5 rounded-md text-[10px] font-bold transition-all flex items-center gap-1.5 shadow-sm border bg-zinc-800 text-white border-zinc-900 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Yazdır (A4)"
            >
                {isProcessing ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-print"></i>}
                <span className="hidden sm:inline">Yazdır</span>
            </button>

            {onAddToWorkbook && (
                <button 
                    id="add-to-wb-btn"
                    onClick={onAddToWorkbook}
                    disabled={isProcessing}
                    className="w-8 h-8 flex items-center justify-center rounded-lg transition-all bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/50 hover:text-emerald-300 relative disabled:opacity-50"
                    title="Kitapçığa Ekle"
                >
                    <i className="fa-solid fa-plus-circle"></i>
                </button>
            )}
            
            {onViewWorkbook && (
                <button 
                    onClick={onViewWorkbook}
                    disabled={isProcessing}
                    className="px-3 py-1.5 bg-[var(--bg-inset)] border border-[var(--border-color)] rounded text-[10px] font-bold transition-colors flex items-center gap-1.5 hover:bg-[var(--bg-paper)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-50"
                    title="Kitapçığı Görüntüle"
                >
                    <i className="fa-solid fa-book-open"></i>
                    {workbookItemCount > 0 && <span className="bg-emerald-50 text-white rounded-full px-1.5 text-[9px]">{workbookItemCount}</span>}
                </button>
            )}

            <div className="w-px h-4 bg-zinc-600 mx-1"></div>

            <button 
                onClick={onTogglePreview} 
                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${isPreviewMode ? 'bg-[var(--accent-color)] text-black' : 'text-[var(--text-muted)] hover:bg-[var(--bg-inset)]'}`}
                title="Zen Modu (Odaklan)"
            >
                <i className={`fa-solid ${isPreviewMode ? 'fa-compress' : 'fa-expand'}`}></i>
            </button>

            <button 
                onClick={onFeedback} 
                className="px-3 py-1.5 text-rose-400 bg-rose-900/20 hover:bg-rose-900/40 rounded text-[10px] font-bold transition-colors flex items-center gap-1.5" 
                title="Geri Bildirim Ver"
            >
                <i className="fa-solid fa-comment-dots"></i>
                <span className="hidden sm:inline">Geri Bildirim</span>
            </button>
            
            <div className="w-px h-4 bg-zinc-600 mx-1"></div>
            
             <button onClick={onSave} disabled={isProcessing} className="px-3 py-1.5 text-emerald-400 bg-emerald-900/20 hover:bg-emerald-900/40 rounded text-[10px] font-bold transition-colors flex items-center gap-1.5 disabled:opacity-50" title="Arşive Kaydet">
                <i className="fa-solid fa-save"></i>
                <span className="hidden sm:inline">Kaydet</span>
            </button>

            <button onClick={onShare} disabled={isProcessing} className="px-3 py-1.5 text-violet-400 bg-violet-900/20 hover:bg-violet-900/40 rounded text-[10px] font-bold transition-colors flex items-center gap-1.5 disabled:opacity-50" title="Paylaş">
                <i className="fa-solid fa-share-nodes"></i>
                <span className="hidden sm:inline">Paylaş</span>
            </button>
        </div>
        
        {/* Click outside listener to close menus */}
        {activeMenu !== 'none' && (
            <div className="fixed inset-0 z-40" onClick={() => setActiveMenu('none')}></div>
        )}
    </div>
  );
};

export default Toolbar;
