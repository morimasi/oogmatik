
import React from 'react';
import { StyleSettings } from '../App';

interface ToolbarProps {
  settings: StyleSettings;
  onSettingsChange: (newSettings: StyleSettings) => void;
  onSave: (name: string) => void;
  onFeedback?: () => void;
  onShare?: () => void;
  onDownloadPDF?: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ settings, onSettingsChange, onSave, onFeedback, onShare, onDownloadPDF }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    const name = prompt('Çalışma sayfasına bir ad verin:', 'Kaydedilmiş Etkinlik');
    if (name) {
      onSave(name);
    }
  };
  
  // Compact Slider Component Helper
  const CompactSlider = ({ icon, value, min, max, step, onChange, title, displayValue }: any) => (
      <div className="flex items-center gap-1.5 group" title={title}>
          <i className={`fa-solid ${icon} text-zinc-400 group-hover:text-indigo-500 transition-colors text-xs w-4 text-center`}></i>
          <input 
              type="range" 
              min={min} 
              max={max} 
              step={step || 1}
              value={value}
              onChange={(e) => onChange(Number(e.target.value))}
              className="w-16 h-1 bg-zinc-200 dark:bg-zinc-600 rounded-lg appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-500 transition-all"
          />
          <span className="text-[10px] font-mono text-zinc-500 w-6 text-right leading-none">{displayValue || value}</span>
      </div>
  );

  return (
    <div id="tour-toolbar" className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-700/50 px-3 py-2 rounded-xl shadow-sm flex flex-wrap items-center justify-between gap-y-2 gap-x-4 print:hidden transition-all">
        
        {/* Settings Group - Wraps on small screens */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
             <CompactSlider 
                icon="fa-magnifying-glass" 
                title="Yakınlaştırma" 
                min={8} max={32} 
                value={settings.fontSize} 
                onChange={(v: number) => onSettingsChange({...settings, fontSize: v})}
                displayValue={`${Math.round(settings.fontSize / 16 * 100)}%`}
             />
             
             <div className="h-3 w-px bg-zinc-300 dark:bg-zinc-700 hidden sm:block"></div>

             <CompactSlider 
                icon="fa-border-all" 
                title="Kenar Boşluğu" 
                min={0} max={80} 
                value={settings.margin} 
                onChange={(v: number) => onSettingsChange({...settings, margin: v})}
             />

             <div className="h-3 w-px bg-zinc-300 dark:bg-zinc-700 hidden sm:block"></div>

             <CompactSlider 
                icon="fa-table-columns" 
                title="Sütun Sayısı" 
                min={1} max={3} 
                value={settings.columns} 
                onChange={(v: number) => onSettingsChange({...settings, columns: v})}
             />

             <div className="h-3 w-px bg-zinc-300 dark:bg-zinc-700 hidden sm:block"></div>

             <CompactSlider 
                icon="fa-arrows-left-right-to-line" 
                title="Öğe Aralığı (Gap)" 
                min={8} max={48} step={4}
                value={settings.gap} 
                onChange={(v: number) => onSettingsChange({...settings, gap: v})}
             />

             <div className="h-3 w-px bg-zinc-300 dark:bg-zinc-700 hidden sm:block"></div>

             {/* Pedagogical Note Toggle */}
             <button
                onClick={() => onSettingsChange({...settings, showPedagogicalNote: !settings.showPedagogicalNote})}
                className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold transition-colors ${settings.showPedagogicalNote ? 'bg-indigo-50 text-indigo-600' : 'bg-zinc-100 text-zinc-400'}`}
                title={settings.showPedagogicalNote ? "Eğitmen Notunu Gizle" : "Eğitmen Notunu Göster"}
             >
                 <i className={`fa-solid ${settings.showPedagogicalNote ? 'fa-eye' : 'fa-eye-slash'}`}></i> Not
             </button>
        </div>
      
        {/* Actions Group */}
        <div className="flex items-center gap-1 shrink-0 ml-auto">
            <button onClick={onFeedback} className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded transition-colors" title="Hata Bildir">
                <i className="fa-solid fa-flag text-sm"></i>
            </button>
            
            <div className="w-px h-4 bg-zinc-300 dark:bg-zinc-700 mx-1"></div>
            
            <button onClick={onShare} className="p-1.5 text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded transition-colors" title="Paylaş">
                <i className="fa-solid fa-share-nodes text-sm"></i>
            </button>

            <button onClick={handleSave} className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded transition-colors" title="Kaydet">
                <i className="fa-solid fa-save text-sm"></i>
            </button>
            
            <button onClick={onDownloadPDF || handlePrint} className="ml-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold py-1.5 px-2.5 rounded shadow-sm transition-colors flex items-center gap-1.5">
                <i className="fa-solid fa-file-pdf"></i> <span>İndir</span>
            </button>

            <button onClick={handlePrint} className="bg-zinc-800 hover:bg-zinc-900 text-white text-[10px] font-bold py-1.5 px-2.5 rounded shadow-sm transition-colors flex items-center gap-1.5">
                <i className="fa-solid fa-print"></i> <span>Yazdır</span>
            </button>
        </div>
    </div>
  );
};

export default Toolbar;