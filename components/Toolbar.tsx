
import React from 'react';
import { StyleSettings } from '../App';

interface ToolbarProps {
  settings: StyleSettings;
  onSettingsChange: (newSettings: StyleSettings) => void;
  onSave: (name: string) => void;
  onFeedback?: () => void;
  onShare?: () => void; // New Prop
  onDownloadPDF?: () => void; // New Prop
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
  
  return (
    <div id="tour-toolbar" className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-zinc-200 dark:border-zinc-700/50 p-2 rounded-lg shadow-md flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 print:hidden">
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
                    <label htmlFor="margin" className="text-sm font-medium">Kenar:</label>
                    <input type="range" id="margin" min="0" max="80" value={settings.margin} onChange={(e) => onSettingsChange({...settings, margin: Number(e.target.value)})} className="w-full h-2 bg-zinc-200 dark:bg-zinc-600 rounded-lg appearance-none cursor-pointer" aria-label="Kenar Boşluğu"/>
                </div>
                 <div className="flex-1 flex items-center gap-2 min-w-[150px]">
                    <label htmlFor="columns" className="text-sm font-medium">Sütun:</label>
                    <input type="range" id="columns" min="1" max="4" step="1" value={settings.columns} onChange={(e) => onSettingsChange({...settings, columns: Number(e.target.value)})} className="w-full h-2 bg-zinc-200 dark:bg-zinc-600 rounded-lg appearance-none cursor-pointer" aria-label="Sütun Sayısı"/>
                    <span className="text-sm font-bold w-6 text-center">{settings.columns}</span>
                </div>
                <div className="flex-1 flex items-center gap-2 min-w-[150px]">
                    <label htmlFor="gap" className="text-sm font-medium">Aralık:</label>
                    <input type="range" id="gap" min="0" max="64" step="4" value={settings.gap} onChange={(e) => onSettingsChange({...settings, gap: Number(e.target.value)})} className="w-full h-2 bg-zinc-200 dark:bg-zinc-600 rounded-lg appearance-none cursor-pointer" aria-label="Öğe Aralığı"/>
                </div>
            </div>
        </div>
      
        {/* Eylemler */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
            <button onClick={onFeedback} className="bg-rose-100 hover:bg-rose-200 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 dark:hover:bg-rose-900/50 font-bold py-2 px-3 rounded-lg transition-colors flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500" title="Hata Bildir">
                <i className="fa-solid fa-flag"></i>
            </button>
            
            <div className="w-px h-8 bg-zinc-300 dark:bg-zinc-700 mx-1"></div>
            
            <button onClick={onShare} className="bg-violet-100 hover:bg-violet-200 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 dark:hover:bg-violet-900/50 font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2" title="Paylaş">
                <i className="fa-solid fa-share-nodes"></i> <span className="hidden xl:inline">Paylaş</span>
            </button>

            <button onClick={handleSave} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:focus-visible:ring-offset-zinc-800">
                <i className="fa-solid fa-save"></i><span className="hidden lg:inline">Kaydet</span>
            </button>
            
            <button onClick={onDownloadPDF || handlePrint} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500 dark:focus-visible:ring-offset-zinc-800">
                <i className="fa-solid fa-file-pdf"></i><span className="hidden lg:inline">PDF İndir</span>
            </button>

            <button onClick={handlePrint} className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sky-500 dark:focus-visible:ring-offset-zinc-800">
                <i className="fa-solid fa-print"></i><span className="hidden lg:inline">Yazdır</span>
            </button>
        </div>
    </div>
  );
};

export default Toolbar;
