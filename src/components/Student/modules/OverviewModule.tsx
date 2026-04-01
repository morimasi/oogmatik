import React from 'react';
import { AdvancedStudent } from '../../../types/student-advanced';
import { useToastStore } from '../../../store/useToastStore';

export const OverviewModule: React.FC<{ student: AdvancedStudent }> = ({ student }) => {
  const toast = useToastStore();

  const handleDownloadReport = () => {
    toast.success(`${student.name} için PDF raporu hazırlanıyor...`);
    setTimeout(() => toast.success('PDF başarıyla indirildi!'), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div>
          <h3 className="text-lg font-black text-zinc-900 dark:text-white">Genel Gelişim Özeti</h3>
          <p className="text-zinc-500 text-sm mt-1">Öğrencinin son 30 günlük performansı.</p>
        </div>
        <button
          onClick={handleDownloadReport}
          className="px-5 py-2.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 border border-indigo-100 dark:border-indigo-800"
        >
          <i className="fa-solid fa-download"></i> Raporu İndir
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-3xl border border-emerald-100 dark:border-emerald-900/30">
          <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-800 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center mb-4">
            <i className="fa-solid fa-arrow-trend-up"></i>
          </div>
          <h4 className="font-bold text-emerald-900 dark:text-emerald-100">Bilişsel Gelişim</h4>
          <p className="text-3xl font-black text-emerald-600 mt-2">+12%</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-3xl border border-blue-100 dark:border-blue-900/30">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-4">
            <i className="fa-solid fa-bullseye"></i>
          </div>
          <h4 className="font-bold text-blue-900 dark:text-blue-100">BEP Hedefleri</h4>
          <p className="text-3xl font-black text-blue-600 mt-2">4 / 6</p>
          <p className="text-xs text-blue-500 mt-1 font-bold">Tamamlanan</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-3xl border border-purple-100 dark:border-purple-900/30">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center mb-4">
            <i className="fa-solid fa-clock"></i>
          </div>
          <h4 className="font-bold text-purple-900 dark:text-purple-100">Çalışma Süresi</h4>
          <p className="text-3xl font-black text-purple-600 mt-2">24s</p>
          <p className="text-xs text-purple-500 mt-1 font-bold">Bu Ay</p>
        </div>
      </div>
    </div>
  );
};
