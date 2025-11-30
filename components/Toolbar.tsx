
import React, { useState } from 'react';
import { StyleSettings } from '../types';

interface ToolbarProps {
  settings: StyleSettings;
  onSettingsChange: (newSettings: StyleSettings) => void;
  onSave: () => void;
  onFeedback?: () => void;
  onShare?: () => void;
  onDownloadPDF?: () => void;
  onTogglePreview: () => void;
  isPreviewMode: boolean;
  onAddToWorkbook?: () => void;
  workbookItemCount?: number;
  onViewWorkbook?: () => void;
  onToggleEdit?: () => void;
  isEditMode?: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({ 
    settings, 
    onSettingsChange, 
    onSave, 
    onFeedback, 
    onShare, 
    onDownloadPDF, 
    onTogglePreview, 
    isPreviewMode,
    onAddToWorkbook,
    workbookItemCount = 0,
    onViewWorkbook,
    onToggleEdit,
    isEditMode
}) => {
  const [activeMenu, setActiveMenu] = useState<'none' | 'visual' | 'print' | 'type'>('none');

  const handlePrint = () => {
    window.print();
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
          className={`flex items-center gap-2 w-full p-2 rounded text-xs font-medium transition-colors ${active ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-inset)]'}`}
      >
          <i className={`fa-solid ${icon} w-4 text-center`}></i>
          <span className="flex-1 text-left">{label}</span>
          {active && <i className="fa-solid fa-check text-[10px]"></i>}
      </button>
  );

  return (
    <div id="tour-toolbar" className="bg-[var(--panel-bg)] backdrop-blur-xl border border-[var(--border-color)] px-3 py-2 rounded-xl shadow-sm flex flex-wrap items-center justify-between gap-y-2 gap-x-4 print:hidden transition-all duration-300 relative">
        
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
                min={0.5} max={1.5} step={0.1}
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

             {/* Visual Settings Dropdown */}
             <div className="relative">
                 <button
                    onClick={() => setActiveMenu(activeMenu === 'visual' ? 'none' : 'visual')}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold transition-colors ${activeMenu === 'visual' ? 'bg-[var(--accent-color)] text-black' : 'bg-[var(--bg-inset)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                    title="Görsel Ayarlar"
                 >
                     <i className="fa-solid fa-paintbrush"></i> Stil
                 </button>
                 
                 {activeMenu === 'visual' && (
                     <div className="absolute top-full left-0 mt-2 w-48 bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-lg shadow-xl p-3 z-50 flex flex-col gap-3 animate-in fade-in zoom-in-95">
                         <div className="flex justify-between items-center">
                             <span className="text-xs font-bold text-[var(--text-secondary)]">Maskot</span>
                             <div className="relative inline-block w-8 align-middle select-none transition duration-200 ease-in">
                                <input type="checkbox" checked={settings.showMascot} onChange={(e) => onSettingsChange({...settings, showMascot: e.target.checked})} className="toggle-checkbox absolute block w-4 h-4 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 checked:border-indigo-600"/>
                                <label className="toggle-label block overflow-hidden h-4 rounded-full bg-zinc-300 cursor-pointer"></label>
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
                    title="Yazı Ayarları"
                 >
                     <i className="fa-solid fa-font"></i> Yazı
                 </button>
                 
                 {activeMenu === 'type' && (
                     <div className="absolute top-full left-0 mt-2 w-48 bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-lg shadow-xl p-3 z-50 flex flex-col gap-2 animate-in fade-in zoom-in-95">
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
                             <span className="text-xs font-bold text-[var(--text-secondary)] block mb-1">Punto</span>
                             <input type="range" min="12" max="32" value={settings.fontSize} onChange={(e) => onSettingsChange({...settings, fontSize: Number(e.target.value)})} className="w-full h-1 bg-zinc-600 rounded-lg appearance-none cursor-pointer accent-[var(--accent-color)]" />
                         </div>
                     </div>
                 )}
             </div>

             {/* Print Visibility Dropdown */}
             <div className="relative">
                 <button
                    onClick={() => setActiveMenu(activeMenu === 'print' ? 'none' : 'print')}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold transition-colors ${activeMenu === 'print' ? 'bg-[var(--accent-color)] text-black' : 'bg-[var(--bg-inset)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                    title="Yazdırma Görünürlüğü"
                 >
                     <i className="fa-solid fa-eye"></i> Görünürlük
                 </button>
                 
                 {activeMenu === 'print' && (
                     <div className="absolute top-full left-0 mt-2 w-56 bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-lg shadow-xl p-2 z-50 flex flex-col gap-1 animate-in fade-in zoom-in-95">
                         <ToggleButton icon="fa-user-pen" label="Öğrenci Bilgi Alanı" active={settings.showStudentInfo} onClick={() => onSettingsChange({...settings, showStudentInfo: !settings.showStudentInfo})} />
                         <ToggleButton icon="fa-graduation-cap" label="Eğitmen Notu" active={settings.showPedagogicalNote} onClick={() => onSettingsChange({...settings, showPedagogicalNote: !settings.showPedagogicalNote})} />
                         <ToggleButton icon="fa-copyright" label="Alt Bilgi (Footer)" active={settings.showFooter} onClick={() => onSettingsChange({...settings, showFooter: !settings.showFooter})} />
                         <ToggleButton icon="fa-otter" label="Maskot" active={settings.showMascot} onClick={() => onSettingsChange({...settings, showMascot: !settings.showMascot})} />
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
                    className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all flex items-center gap-1.5 shadow-sm border ${isEditMode ? 'bg-indigo-600 text-white border-indigo-600 ring-2 ring-indigo-200' : 'bg-white text-zinc-600 border-zinc-300 hover:bg-zinc-50'}`}
                    title="Düzenleme Modu"
                >
                    <i className="fa-solid fa-pen-ruler"></i>
                    <span className="hidden sm:inline">Düzenle</span>
                </button>
            )}

            {onAddToWorkbook && (
                <button 
                    id="add-to-wb-btn"
                    onClick={onAddToWorkbook}
                    className="w-8 h-8 flex items-center justify-center rounded-lg transition-all bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/50 hover:text-emerald-300 relative"
                    title="Kitapçığa Ekle"
                >
                    <i className="fa-solid fa-plus-circle"></i>
                </button>
            )}
            
            {onViewWorkbook && (
                <button 
                    onClick={onViewWorkbook}
                    className="px-3 py-1.5 bg-[var(--bg-inset)] border border-[var(--border-color)] rounded text-[10px] font-bold transition-colors flex items-center gap-1.5 hover:bg-[var(--bg-paper)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    title="Kitapçığı Görüntüle"
                >
                    <i className="fa-solid fa-book-open"></i>
                    {workbookItemCount > 0 && <span className="bg-emerald-500 text-white rounded-full px-1.5 text-[9px]">{workbookItemCount}</span>}
                </button>
            )}

            <div className="w-px h-4 bg-zinc-600 mx-1"></div>

            <button 
                onClick={onTogglePreview} 
                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${isPreviewMode ? 'bg-[var(--accent-color)] text-black' : 'text-[var(--text-muted)] hover:bg-[var(--bg-inset)]'}`}
                title="Önizleme / Zen Modu"
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
            
             <button onClick={onSave} className="px-3 py-1.5 text-emerald-400 bg-emerald-900/20 hover:bg-emerald-900/40 rounded text-[10px] font-bold transition-colors flex items-center gap-1.5" title="Arşive Kaydet">
                <i className="fa-solid fa-save"></i>
                <span className="hidden sm:inline">Kaydet</span>
            </button>

            <button onClick={onShare} className="px-3 py-1.5 text-violet-400 bg-violet-900/20 hover:bg-violet-900/40 rounded text-[10px] font-bold transition-colors flex items-center gap-1.5" title="Paylaş">
                <i className="fa-solid fa-share-nodes"></i>
                <span className="hidden sm:inline">Paylaş</span>
            </button>
            
            <button onClick={onDownloadPDF || handlePrint} className="ml-1 bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-black text-[10px] font-bold py-1.5 px-2.5 rounded shadow-sm transition-colors flex items-center gap-1.5">
                <i className="fa-solid fa-file-pdf"></i> <span>İndir</span>
            </button>

            <button onClick={handlePrint} className="bg-zinc-700 hover:bg-zinc-600 text-white text-[10px] font-bold py-1.5 px-2.5 rounded shadow-sm transition-colors flex items-center gap-1.5">
                <i className="fa-solid fa-print"></i> <span>Yazdır</span>
            </button>
        </div>
        
        {/* Click outside listener to close menus could be added here or handled by parent */}
        {activeMenu !== 'none' && (
            <div className="fixed inset-0 z-40" onClick={() => setActiveMenu('none')}></div>
        )}
    </div>
  );
};

export default Toolbar;
