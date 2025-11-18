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
    const grouped = savedWorksheets.reduce((acc: Record<string, { title: string; worksheets: SavedWorksheet[] }>, ws) => {
      const categoryId = ws.category?.id || 'uncategorized';
      const categoryTitle = ws.category?.title || 'Kategorisiz';
      
      if (!acc[categoryId]) {
        acc[categoryId] = { title: categoryTitle, worksheets: [] };
      }
      acc[categoryId].worksheets.push(ws);
      return acc;
    }, {} as Record<string, { title: string; worksheets: SavedWorksheet[] }>);

    // Sort worksheets within each group by date (newest first)
    // FIX: Explicitly typed 'group' to resolve a TypeScript inference issue where it was 'unknown'.
    Object.values(grouped).forEach((group: { title: string; worksheets: SavedWorksheet[] }) => {
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
