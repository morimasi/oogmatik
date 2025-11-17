import React from 'react';
import { StyleSettings } from '../App';
import { SingleWorksheetData } from '../types';

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

  return (
    <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-zinc-200 dark:border-zinc-700/50 p-2 rounded-lg shadow-md flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-4">
            {/* Font Size */}
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

             {/* Border Color */}
            <div className="flex items-center gap-2">
                <label htmlFor="borderColor" className="text-sm font-medium hidden sm:inline">Kenarlık:</label>
                <input 
                    type="color" 
                    id="borderColor"
                    value={settings.borderColor}
                    onChange={(e) => onSettingsChange({...settings, borderColor: e.target.value})}
                    className="p-0.5 h-7 w-7 block bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 cursor-pointer rounded-lg"
                />
            </div>
        </div>
      
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