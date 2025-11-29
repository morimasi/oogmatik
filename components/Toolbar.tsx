
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
}

const Toolbar: React.FC<ToolbarProps> = ({ settings, onSettingsChange, onSave, onFeedback, onShare, onDownloadPDF, onTogglePreview, isPreviewMode }) => {
  const [showVisualMenu, setShowVisualMenu] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  // Compact Slider Component Helper
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

  return (
    <div id="tour-toolbar" className="bg-[var(--panel-bg)] backdrop-blur-xl border border-[var(--border-color)] px-3 py-2 rounded-xl shadow-sm flex flex-wrap items-center justify-between gap-y-2 gap-x-4 print:hidden transition-all duration-300 relative">
        
        {/* Settings Group - Wraps on small screens */}
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

             {/* Updated Scale Slider */}
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
                icon="fa-border-all" 
                title="Kenar Boşluğu" 
                min={0} max={80} 
                value={settings.margin} 
                onChange={(v: number) => onSettingsChange({...settings, margin: v})}
             />

             <div className="h-3 w-px bg-zinc-600 hidden sm:block"></div>

             <CompactSlider 
                icon="fa-table-columns" 
                title="Sütun Sayısı" 
                min={1} max={6} 
                value={settings.columns} 
                onChange={(v: number) => onSettingsChange({...settings, columns: v})}
             />

             <div className="h-3 w-px bg-zinc-600 hidden sm:block"></div>

             {/* Pedagogical Note Toggle */}
             <button
                onClick={() => onSettingsChange({...settings, showPedagogicalNote: !settings.showPedagogicalNote})}
                className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold transition-colors ${settings.showPedagogicalNote ? 'bg-indigo-500/20 text-indigo-300' : 'bg-[var(--bg-inset)] text-[var(--text-muted)]'}`}
                title={settings.showPedagogicalNote ? "Eğitmen Notunu Gizle" : "Eğitmen Notunu Göster"}
             >
                 <i className={`fa-solid ${settings.showPedagogicalNote ? 'fa-eye' : 'fa-eye-slash'}`}></i> Not
             </button>

             {/* Visual Settings Dropdown Trigger */}
             <div className="relative">
                 <button
                    onClick={() => setShowVisualMenu(!showVisualMenu)}
                    className="flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold transition-colors bg-[var(--bg-inset)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    title="Görsel Ayarlar"
                 >
                     <i className="fa-solid fa-paintbrush"></i> Görünüm
                 </button>
                 
                 {showVisualMenu && (
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
                         <button onClick={() => setShowVisualMenu(false)} className="text-[10px] text-center text-zinc-500 hover:text-zinc-300 w-full mt-1">Kapat</button>
                     </div>
                 )}
             </div>
        </div>
      
        {/* Actions Group */}
        <div className="flex items-center gap-2 shrink-0 ml-auto">
            {/* Preview Mode Button */}
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
    </div>
  );
};

export default Toolbar;
