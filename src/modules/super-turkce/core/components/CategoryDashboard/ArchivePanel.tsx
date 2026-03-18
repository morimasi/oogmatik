import React from 'react';
import { motion } from 'framer-motion';
import { useSuperTurkceStore } from '../../store';
import { ArchiveItem } from '../../types';
import { SuperTypography, SuperButton, SuperBadge } from '../../../shared/ui/atoms';
import { SuperCard } from '../../../shared/ui/organisms';

export const ArchivePanel: React.FC = () => {
    const { archiveHistory, deleteFromArchive, setActiveCategory, setDraftComponents, setGrade, setObjective, setEngineMode } = useSuperTurkceStore();

    const handleRestore = (item: ArchiveItem) => {
        setGrade(item.grade);
        setObjective({ id: 'restored', title: item.objectiveTitle });
        setEngineMode(item.engineMode);
        setDraftComponents(item.drafts);
        setActiveCategory('okuma_anlama');
    };

    return (
        <div className="flex-1 bg-[#0a0a0b] p-8 overflow-y-auto w-full h-full relative custom-scrollbar">
            <button
                onClick={() => setActiveCategory(null)}
                className="absolute top-8 left-8 w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all active:scale-95 z-20"
            >
                <i className="fa-solid fa-arrow-left"></i>
            </button>

            <div className="max-w-6xl mx-auto mt-4 space-y-10">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-2xl shadow-xl shadow-indigo-500/5">
                        <i className="fa-solid fa-box-archive"></i>
                    </div>
                    <div>
                        <SuperTypography variant="h2" weight="extrabold">Geçmiş Arşivim</SuperTypography>
                        <SuperTypography variant="body" color="muted" className="mt-1">
                            Daha önce ürettiğiniz <span className="text-zinc-100 font-bold">{archiveHistory.length}</span> çalışma yaprağı burada güvenle saklanıyor.
                        </SuperTypography>
                    </div>
                </div>

                {archiveHistory.length === 0 ? (
                    <div className="text-center py-24 bg-white/5 rounded-3xl border border-white/10 border-dashed">
                        <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6 text-zinc-700 text-3xl">
                            <i className="fa-solid fa-ghost"></i>
                        </div>
                        <SuperTypography variant="h4" weight="bold">Arşiviniz henüz boş.</SuperTypography>
                        <SuperTypography variant="body" color="muted" className="max-w-sm mx-auto mt-2">
                            Kokpit ekranından yapay zeka veya hızlı motorla PDF ürettiğinizde otomatik olarak buraya kaydedilir.
                        </SuperTypography>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {archiveHistory.map((item: ArchiveItem, idx: number) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <SuperCard
                                    title={item.objectiveTitle}
                                    subtitle={`${item.grade}. Sınıf Müfredatı`}
                                    badge={item.engineMode === 'ai' ? 'Gemini AI' : 'Hızlı'}
                                    className="h-full border-none ring-1 ring-white/10"
                                    footer={
                                        <div className="flex items-center gap-3">
                                            <SuperButton
                                                variant="primary"
                                                size="sm"
                                                className="flex-1"
                                                leftIcon={<i className="fa-solid fa-arrow-rotate-left"></i>}
                                                onClick={() => handleRestore(item)}
                                            >
                                                Yeniden Düzenle
                                            </SuperButton>
                                            <SuperButton
                                                variant="secondary"
                                                size="sm"
                                                className="!bg-red-500/10 !text-red-400 border border-red-500/20 hover:!bg-red-500/20"
                                                onClick={() => deleteFromArchive(item.id)}
                                            >
                                                <i className="fa-solid fa-trash-can"></i>
                                            </SuperButton>
                                        </div>
                                    }
                                >
                                    <div className="flex items-center justify-between mt-2 mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-zinc-500">
                                                <i className="fa-regular fa-file-pdf"></i>
                                            </div>
                                            <SuperTypography variant="caption" color="secondary" weight="semibold">
                                                {item.totalActivities} Dinamik Modül
                                            </SuperTypography>
                                        </div>
                                        <SuperTypography variant="caption" color="muted" weight="bold">
                                            {new Date(item.createdAt).toLocaleDateString('tr-TR')}
                                        </SuperTypography>
                                    </div>
                                </SuperCard>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
