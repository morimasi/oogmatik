import React, { useState, useMemo } from 'react';
import { SavedWorksheet } from '../types';
import { ACTIVITIES } from '../constants';

interface SavedWorksheetsViewProps {
  savedWorksheets: SavedWorksheet[];
  onLoad: (worksheet: SavedWorksheet) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
}

const SavedWorksheetsView: React.FC<SavedWorksheetsViewProps> = ({ savedWorksheets, onLoad, onDelete, onBack }) => {
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  const getActivityTitle = (type: SavedWorksheet['activityType']) => {
    const activity = ACTIVITIES.find(a => a.id === type);
    return activity?.title || type;
  };

  const groupedWorksheets = useMemo(() => {
    const grouped = savedWorksheets.reduce((acc, ws) => {
      const categoryId = ws.category?.id || 'uncategorized';
      const categoryTitle = ws.category?.title || 'Kategorisiz';
      
      if (!acc[categoryId]) {
        acc[categoryId] = { title: categoryTitle, worksheets: [] };
      }
      acc[categoryId].worksheets.push(ws);
      return acc;
    }, {} as Record<string, { title: string; worksheets: SavedWorksheet[] }>);

    // Sort worksheets within each group by date (newest first)
    Object.values(grouped).forEach(group => {
      group.worksheets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    });

    return Object.entries(grouped);
  }, [savedWorksheets]);

  const toggleCategory = (categoryId: string) => {
    setOpenCategory(prev => (prev === categoryId ? null : categoryId));
  };
  
  if(groupedWorksheets.length > 0 && openCategory === null) {
      setOpenCategory(groupedWorksheets[0][0]);
  }


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
        <div className="space-y-2">
            {groupedWorksheets.map(([categoryId, group]) => (
                <div key={categoryId} className="border-b border-zinc-200 dark:border-zinc-700 last:border-b-0">
                    <button 
                        onClick={() => toggleCategory(categoryId)}
                        className="w-full flex justify-between items-center p-4 text-left hover:bg-zinc-50 dark:hover:bg-zinc-700/50 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        aria-expanded={openCategory === categoryId}
                    >
                        <span className="font-bold text-lg">{group.title} ({group.worksheets.length})</span>
                        <i className={`fa-solid fa-chevron-down transition-transform ${openCategory === categoryId ? 'rotate-180' : ''}`}></i>
                    </button>

                    {openCategory === categoryId && (
                         <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40">
                             <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="sr-only md:not-sr-only">
                                        <tr>
                                            <th scope="col" className="py-2 pr-4 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Etkinlik Adı</th>
                                            <th scope="col" className="py-2 px-4 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden lg:table-cell">Türü</th>
                                            <th scope="col" className="py-2 px-4 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden sm:table-cell">Tarih</th>
                                            <th scope="col" className="relative py-2 pl-4">
                                                <span className="sr-only">İşlemler</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                                        {group.worksheets.map((ws) => (
                                            <tr key={ws.id}>
                                                <td className="py-3 pr-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-md flex items-center justify-center mr-3 shrink-0">
                                                            <i className={ws.icon}></i>
                                                        </div>
                                                        <div>
                                                           <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{ws.name}</div>
                                                            <div className="text-sm text-zinc-500 dark:text-zinc-400 lg:hidden">{getActivityTitle(ws.activityType)}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400 hidden lg:table-cell">
                                                    {getActivityTitle(ws.activityType)}
                                                </td>
                                                <td className="py-3 px-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400 hidden sm:table-cell">
                                                    {new Date(ws.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })}
                                                </td>
                                                <td className="py-3 pl-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                                    <button onClick={() => onLoad(ws)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200 transition-colors p-1 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">Yükle</button>
                                                    <button onClick={() => onDelete(ws.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200 transition-colors p-1 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500">Sil</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                         </div>
                    )}
                </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default SavedWorksheetsView;