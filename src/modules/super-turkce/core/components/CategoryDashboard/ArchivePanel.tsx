import React from 'react';
import { motion } from 'framer-motion';
import { useSuperTurkceStore } from '../../store';
import { ArchiveItem } from '../../types';

export const ArchivePanel: React.FC = () => {
    const { archiveHistory, deleteFromArchive, setActiveCategory, setDraftComponents, setGrade, setObjective, setEngineMode } = useSuperTurkceStore();

    const handleRestore = (item: ArchiveItem) => {
        // Eski arşivi tekrar Cockpit üretimine taşı (Tüm state'leri o anki hale getir)
        setGrade(item.grade);
        setObjective({ id: 'restored', title: item.objectiveTitle });
        setEngineMode(item.engineMode);
        setDraftComponents(item.drafts);
        // Pdf'i görebilmek için rastgele bir kategoriye geçir
        setActiveCategory('okuma_anlama');
    };

    return (
        <div className="flex-1 bg-slate-50 p-8 overflow-y-auto w-full h-full relative">
            <button
                onClick={() => setActiveCategory(null)}
                className="absolute top-8 left-8 w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-500 hover:text-brand-600 hover:shadow-md transition-all"
            >
                <i className="fa-solid fa-arrow-left"></i>
            </button>

            <div className="max-w-5xl mx-auto mt-4">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 text-xl">
                        <i className="fa-solid fa-box-archive"></i>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Geçmiş Arşivim</h1>
                        <p className="text-slate-500 text-sm mt-1">Daha önce ürettiğiniz {archiveHistory.length} çalışma yaprağı burada saklanıyor.</p>
                    </div>
                </div>

                {archiveHistory.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm border-dashed">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 text-3xl">
                            <i className="fa-solid fa-ghost"></i>
                        </div>
                        <h3 className="text-lg font-bold text-slate-700">Arşiviniz henüz boş.</h3>
                        <p className="text-slate-500 text-sm max-w-sm mx-auto mt-2">
                            Kokpit ekranından yapay zeka veya hızlı motorla PDF ürettiğinizde otomatik olarak buraya kaydedilir.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {archiveHistory.map((item: ArchiveItem, idx: number) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${item.engineMode === 'ai' ? 'bg-brand-50 text-brand-600' : 'bg-amber-50 text-amber-600'}`}>
                                            <i className={`fa-solid ${item.engineMode === 'ai' ? 'fa-wand-magic-sparkles' : 'fa-bolt'} mr-1`}></i>
                                            {item.engineMode === 'ai' ? 'Yapay Zeka (Gemini)' : 'Hızlı Motor'}
                                        </span>
                                        <span className="text-xs text-slate-400 font-medium">
                                            {new Date(item.createdAt).toLocaleDateString('tr-TR')} • {new Date(item.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <h3 className="text-base font-bold text-slate-800 line-clamp-1">{item.objectiveTitle}</h3>
                                    <p className="text-sm text-slate-500 mt-1">{item.grade}. Sınıf Müfredatı</p>

                                    <div className="mt-4 flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 text-xs">
                                            <i className="fa-regular fa-file-pdf"></i>
                                        </div>
                                        <span className="text-xs font-semibold text-slate-600">{item.totalActivities} Karma Etkinlik Parçası</span>
                                    </div>
                                </div>

                                <div className="mt-6 flex items-center gap-2 pt-4 border-t border-slate-100">
                                    <button
                                        onClick={() => handleRestore(item)}
                                        className="flex-1 bg-slate-900 hover:bg-black text-white text-sm font-semibold py-2.5 rounded-xl transition-all"
                                    >
                                        <i className="fa-solid fa-arrow-rotate-left mr-2"></i>
                                        Yeniden Taşı / Düzenle
                                    </button>
                                    <button
                                        onClick={() => deleteFromArchive(item.id)}
                                        className="w-10 h-10 flex items-center justify-center bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all"
                                        title="Arşivden Sil"
                                    >
                                        <i className="fa-solid fa-trash-can"></i>
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
