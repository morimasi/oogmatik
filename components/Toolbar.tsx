import React from 'react';
import { StyleSettings } from '../App';

interface ToolbarProps {
  settings: StyleSettings;
  onSettingsChange: (newSettings: StyleSettings) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ settings, onSettingsChange }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md flex items-center justify-between gap-4 print-hidden">
        <div className="flex items-center gap-4">
             {/* Font Family */}
            <div className="flex items-center gap-2">
                <label htmlFor="fontFamily" className="text-sm font-medium hidden sm:inline">Yazı Tipi:</label>
                <select 
                    id="fontFamily" 
                    value={settings.fontFamily} 
                    onChange={(e) => onSettingsChange({...settings, fontFamily: e.target.value})}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                >
                    <option value="sans-serif">Sans-serif</option>
                    <option value="serif">Serif</option>
                    <option value="monospace">Monospace</option>
                </select>
            </div>

            {/* Font Size */}
            <div className="flex items-center gap-2">
                <label htmlFor="fontSize" className="text-sm font-medium hidden sm:inline">Boyut:</label>
                <input 
                    type="number" 
                    id="fontSize"
                    value={settings.fontSize}
                    onChange={(e) => onSettingsChange({...settings, fontSize: Number(e.target.value)})}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-20 p-1.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                    className="p-0.5 h-7 w-7 block bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 cursor-pointer rounded-lg"
                />
            </div>
        </div>
      
        <button onClick={handlePrint} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
            <i className="fa-solid fa-print mr-2"></i>Yazdır
        </button>
    </div>
  );
};

export default Toolbar;