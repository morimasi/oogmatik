import React from 'react';
import { StyleSettings } from '../App';

interface ToolbarProps {
  settings: StyleSettings;
  onSettingsChange: (newSettings: StyleSettings) => void;
  onSave: (name: string) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ settings, onSettingsChange, onSave }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    const name = prompt('Çalışma sayfasına bir ad verin:', 'Kaydedilmiş Etkinlik');
    if (name) {
      onSave(name);
    }
  };
  
  const pageViewOptions: StyleSettings['pageView'][] = ['single', 'double'];

  return (
    <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-zinc-200 dark:border-zinc-700/50 p-2 rounded-lg shadow-md flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 print:hidden">
        {/* Ayarlar */}
        <div className="flex-1 flex flex-col md:flex-row gap-2 flex-wrap items-center">
             {/* Yakınlaştırma Ayarları */}
            <div className="flex items-center gap-4 p-2 rounded-md bg-zinc-100 dark:bg-zinc-800/50 w-full md:w-auto">
                <div className="flex items-center gap-2">
                    <label htmlFor="zoom" className="text-sm font-medium hidden sm:inline">Yakınlaştırma:</label>
                    <input 
                        type="range" 
                        id="zoom"
                        min="8"
                        max="32"
                        step="1"
                        value={settings.fontSize}
                        onChange={(e) => onSettingsChange({...settings, fontSize: Number(e.target.value)})}
                        className="w-24 h-2 bg-zinc-200 dark:bg-zinc-600 rounded-lg appearance-none cursor-pointer"
                        aria-label="Yakınlaştırma"
                    />
                    <span className="text-sm w-12 text-center" aria-live="polite">{Math.round(settings.fontSize / 16 * 100)}%</span>
                </div>
            </div>

            {/* Yazdırma Ayarları */}
             <div className="flex items-center gap-4 p-2 rounded-md bg-zinc-100 dark:bg-zinc-800/50 flex-1 flex-wrap">
                <div className="flex-1 flex items-center gap-2 min-w-[150px]">
                    <label htmlFor="margin" className="text-sm font-medium">Kenar Boşluğu:</label>
                    <input type="range" id="margin" min="0" max="80" value={settings.margin} onChange={(e) => onSettingsChange({...settings, margin: Number(e.target.value)})} className="w-full h-2 bg-zinc-200 dark:bg-zinc-600 rounded-lg appearance-none cursor-pointer" aria-label="Kenar Boşluğu"/>
                </div>
                 <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Sayfa Görünümü:</span>
                    <div className="flex rounded-md shadow-sm">
                        {pageViewOptions.map(view => (
                             <button key={view} onClick={() => onSettingsChange({...settings, pageView: view})} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-indigo-500 dark:focus-visible:ring-offset-zinc-800 ${settings.pageView === view ? 'bg-indigo-600 text-white shadow' : 'bg-zinc-200 dark:bg-zinc-600 hover:bg-zinc-300 dark:hover:bg-zinc-500'}`} aria-pressed={settings.pageView === view}>
                                {view === 'single' ? 'Tek Sayfa' : 'Çift Sayfa'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      
        {/* Eylemler */}
        <div className="flex items-center gap-2">
            <button onClick={handleSave} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500 dark:focus-visible:ring-offset-zinc-800">
                <i className="fa-solid fa-save"></i><span className="hidden sm:inline">Kaydet</span>
            </button>
            <button onClick={handlePrint} className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sky-500 dark:focus-visible:ring-offset-zinc-800">
                <i className="fa-solid fa-print"></i><span className="hidden sm:inline">Yazdır</span>
            </button>
        </div>
    </div>
  );
};

export default Toolbar;
