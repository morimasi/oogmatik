import React from 'react';
import { SavedWorksheet } from '../types';
import { ACTIVITIES } from '../constants';

interface SavedWorksheetsViewProps {
  savedWorksheets: SavedWorksheet[];
  onLoad: (worksheet: SavedWorksheet) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
}

const SavedWorksheetsView: React.FC<SavedWorksheetsViewProps> = ({ savedWorksheets, onLoad, onDelete, onBack }) => {
  const getActivityTitle = (type: SavedWorksheet['activityType']) => {
    // Find the specific activity title, even if there are duplicates with different descriptions
    const activity = ACTIVITIES.find(a => a.id === type);
    return activity?.title || type;
  };

  return (
    <div className="bg-white dark:bg-zinc-800/50 rounded-xl shadow-sm p-4 sm:p-6 md:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-700">
        <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-200">Kaydedilmiş Etkinlikler</h2>
        <button 
          onClick={onBack}
          className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm font-semibold rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 flex items-center gap-2 shrink-0"
        >
          <i className="fa-solid fa-plus"></i>Yeni Etkinlik Oluştur
        </button>
      </div>

      {savedWorksheets.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-700/50 rounded-full flex items-center justify-center mb-4 mx-auto">
            <i className="fa-solid fa-folder-open fa-2x text-zinc-400 dark:text-zinc-500"></i>
          </div>
          <p className="text-zinc-500 dark:text-zinc-400">Henüz kaydedilmiş bir etkinlik bulunmuyor.</p>
        </div>
      ) : (
        <>
            {/* Card View for Mobile */}
            <div className="block md:hidden space-y-4">
            {[...savedWorksheets].reverse().map((ws) => (
                <div key={ws.id} className="bg-white dark:bg-zinc-800 rounded-lg shadow p-4 border border-zinc-200 dark:border-zinc-700">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-md flex items-center justify-center shrink-0">
                        <i className={ws.icon}></i>
                    </div>
                    <div>
                        <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{ws.name}</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">{getActivityTitle(ws.activityType)}</p>
                    </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2 shrink-0 ml-2">
                        <button onClick={() => onLoad(ws)} className="text-sm text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200 font-semibold">Yükle</button>
                        <button onClick={() => onDelete(ws.id)} className="text-sm text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200 font-semibold">Sil</button>
                    </div>
                </div>
                <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-700">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Tarih: {new Date(ws.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                </div>
                </div>
            ))}
            </div>

            {/* Table View for Desktop */}
            <div className="overflow-x-auto hidden md:block">
            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
                <thead className="bg-zinc-50 dark:bg-zinc-700/50">
                <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Etkinlik Adı</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Türü</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Tarih</th>
                    <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">İşlemler</span>
                    </th>
                </tr>
                </thead>
                <tbody className="bg-white dark:bg-zinc-800 divide-y divide-zinc-200 dark:divide-zinc-700">
                {[...savedWorksheets].reverse().map((ws) => (
                    <tr key={ws.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                        <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-md flex items-center justify-center mr-4 shrink-0">
                            <i className={ws.icon}></i>
                        </div>
                        <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{ws.name}</div>
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400">
                        {getActivityTitle(ws.activityType)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400">
                        {new Date(ws.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button onClick={() => onLoad(ws)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200 transition-colors p-1 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">Yükle</button>
                        <button onClick={() => onDelete(ws.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200 transition-colors p-1 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500">Sil</button>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        </>
      )}
    </div>
  );
};

export default SavedWorksheetsView;
