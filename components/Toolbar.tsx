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
  
  const layoutOptions: StyleSettings['layout'][] = ['1x1', '1x2', '2x2'];
  const pageViewOptions: StyleSettings['pageView'][] = ['single', 'double'];

  return (
    <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-zinc-200 dark:border-zinc-700/50 p-2 rounded-lg shadow-md flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 print:hidden">
        {/* Ayarlar */}
        <div className="flex-1 flex flex-col md:flex-row gap-2 flex-wrap items-center">
             {/* Font Ayarları */}
            <div className="flex items-center gap-4 p-2 rounded-md bg-zinc-100 dark:bg-zinc-800/50 w-full md:w-auto">
                <div className="flex items-center gap-2">
                    <label htmlFor="fontSize" className="text-sm font-medium hidden sm:inline">Boyut:</label>
                    <input 
                        type="number" 
                        id="fontSize"
                        value={settings.fontSize}
                        onChange={(e) => onSettingsChange({...settings, fontSize: Number(e.target.value)})}
                        className="bg-zinc-50 border border-zinc-300 text-zinc-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-20 p-1.5 dark:bg-zinc-700 dark:border-zinc-600 dark:text-white"
                    />
                </div>
                 <div className="flex items-center gap-2">
                    <label htmlFor="dyslexiaFontToggle" className="text-sm font-medium">Disleksi Fontu:</label>
                    <button
                        id="dyslexiaFontToggle"
                        role="switch"
                        aria-checked={settings.dyslexiaFriendlyFont}
                        onClick={() => onSettingsChange({ ...settings, dyslexiaFriendlyFont: !settings.dyslexiaFriendlyFont })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 dark:focus-visible:ring-offset-zinc-800 ${settings.dyslexiaFriendlyFont ? 'bg-indigo-600' : 'bg-zinc-300 dark:bg-zinc-600'}`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.dyslexiaFriendlyFont ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
            </div>

            {/* Yazdırma Ayarları */}
             <div className="flex items-center gap-4 p-2 rounded-md bg-zinc-100 dark:bg-zinc-800/50 flex-1 flex-wrap">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Düzen:</span>
                    <div className="flex rounded-md shadow-sm">
                        {layoutOptions.map(layout => (
                             <button key={layout} onClick={() => onSettingsChange({...settings, layout})} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-indigo-500 dark:focus-visible:ring-offset-zinc-800 ${settings.layout === layout ? 'bg-indigo-600 text-white shadow' : 'bg-zinc-200 dark:bg-zinc-600 hover:bg-zinc-300 dark:hover:bg-zinc-500'}`}>
                                {layout}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex-1 flex items-center gap-2 min-w-[150px]">
                    <label htmlFor="margin" className="text-sm font-medium">Boşluk:</label>
                    <input type="range" id="margin" min="0" max="80" value={settings.margin} onChange={(e) => onSettingsChange({...settings, margin: Number(e.target.value)})} className="w-full h-2 bg-zinc-200 dark:bg-zinc-600 rounded-lg appearance-none cursor-pointer" />
                </div>
                 <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Görünüm:</span>
                    <div className="flex rounded-md shadow-sm">
                        {pageViewOptions.map(view => (
                             <button key={view} onClick={() => onSettingsChange({...settings, pageView: view})} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-indigo-500 dark:focus-visible:ring-offset-zinc-800 ${settings.pageView === view ? 'bg-indigo-600 text-white shadow' : 'bg-zinc-200 dark:bg-zinc-600 hover:bg-zinc-300 dark:hover:bg-zinc-500'}`}>
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
