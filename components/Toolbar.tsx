
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
      <div className="flex items-center gap-2 group" title={title}>
          <i className={`fa-solid ${icon} text-zinc-400 group-hover:text-indigo-500 transition-colors text-sm w-4 text-center`}></i>
          <input 
              type="range" 
              min={min} 
              max={max} 
              step={step || 1}
              value={value}
              onChange={(e) => onChange(Number(e.target.value))}
              className="w-16 md:w-20 h-1.5 bg-zinc-200 dark:bg-zinc-600 rounded-lg appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-500 transition-all"
          />
          <span className="text-[10px] font-mono text-zinc-500 w-6 text-right">{displayValue || value}</span>
      </div>
  );

  return (
    <div id="tour-toolbar" className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-zinc-200 dark:border-zinc-700/50 px-3 py-2 rounded-lg shadow-sm flex items-center justify-between gap-4 print:hidden h-14">
        
        {/* Settings Group - Single Line */}
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-1">
             <CompactSlider 
                icon="fa-magnifying-glass" 
                title="Yakınlaştırma" 
                min={8} max={32} 
                value={settings.fontSize} 
                onChange={(v: number) => onSettingsChange({...settings, fontSize: v})}
                displayValue={`${Math.round(settings.fontSize / 16 * 100)}%`}
             />
             
             <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700"></div>

             <CompactSlider 
                icon="fa-border-all" 
                title="Kenar Boşluğu" 
                min={0} max={80} 
                value={settings.margin} 
                onChange={(v: number) => onSettingsChange({...settings, margin: v})}
             />

             <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700"></div>

             <CompactSlider 
                icon="fa-table-columns" 
                title="Sütun Sayısı" 
                min={1} max={3} 
                value={settings.columns} 
                onChange={(v: number) => onSettingsChange({...settings, columns: v})}
             />

             <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700"></div>

             <CompactSlider 
                icon="fa-arrows-left-right-to-line" 
                title="Öğe Aralığı (Gap)" 
                min={8} max={48} step={4}
                value={settings.gap} 
                onChange={(v: number) => onSettingsChange({...settings, gap: v})}
             />
        </div>
      
        {/* Actions Group */}
        <div className="flex items-center gap-1 shrink-0">
            <button onClick={onFeedback} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-md transition-colors" title="Hata Bildir">
                <i className="fa-solid fa-flag"></i>
            </button>
            
            <div className="w-px h-5 bg-zinc-300 dark:bg-zinc-700 mx-1"></div>
            
            <button onClick={onShare} className="p-2 text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-md transition-colors" title="Paylaş">
                <i className="fa-solid fa-share-nodes"></i>
            </button>

            <button onClick={handleSave} className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-md transition-colors" title="Kaydet">
                <i className="fa-solid fa-save"></i>
            </button>
            
            <button onClick={onDownloadPDF || handlePrint} className="ml-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-1.5 px-3 rounded shadow-sm transition-colors flex items-center gap-2">
                <i className="fa-solid fa-file-pdf"></i> <span className="hidden sm:inline">İndir</span>
            </button>

            <button onClick={handlePrint} className="bg-zinc-800 hover:bg-zinc-900 text-white text-xs font-bold py-1.5 px-3 rounded shadow-sm transition-colors flex items-center gap-2">
                <i className="fa-solid fa-print"></i> <span className="hidden sm:inline">Yazdır</span>
            </button>
        </div>
    </div>
  );
};

export default Toolbar;
