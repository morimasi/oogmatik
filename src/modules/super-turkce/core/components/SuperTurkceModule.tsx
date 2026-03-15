import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PDFViewer } from '@react-pdf/renderer';
import Cockpit from './Cockpit/Cockpit';
import { CategoryDashboard } from './CategoryDashboard/CategoryDashboard';
import { A4PrintableSheetV2 } from '../../features/grid-pdf/A4PrintableSheetV2';
import { useSuperTurkceStore } from '../store';
import { ActivityType } from '../../../../../types';
import { registerPdfFonts } from '../../shared/pdf-utils/fonts';

// Fontları uygulamanın başlangıcında kaydediyoruz
registerPdfFonts();

interface SuperTurkceModuleProps {
    onBack?: () => void;
    onAddToWorkbook?: (data: any) => void;
    onSave?: (name: string, activityType: any, data: any[]) => Promise<any>;
    onShareToCommunity?: () => void;
}

const SuperTurkceModule: React.FC<SuperTurkceModuleProps> = ({ onBack, onAddToWorkbook, onSave, onShareToCommunity }) => {
    const { selectedObjective, activeCategory, setActiveCategory } = useSuperTurkceStore();

    const handleSaveToArchive = async () => {
        if (onSave && selectedObjective) {
            try {
                await onSave(`${selectedObjective.description.substring(0, 30)}...`, ActivityType.SUPER_TURKCE_MATCHING || 'super_turkce' as any, []);
            } catch (error) {
                console.error("Save error:", error);
            }
        }
    };

    const handleAddWorkbook = () => {
        if (onAddToWorkbook && selectedObjective) {
            onAddToWorkbook({
                title: selectedObjective.description,
            });
        }
    };

    const handleBackClick = () => {
        if (activeCategory) {
            setActiveCategory(null); // Alt stüdyodan Ana Portal'a dön
        } else if (onBack) {
            onBack(); // Ana Portal'dan App Anasayfasına dön
        }
    };

    // Stüdyo ismini almak için yardımcı fonksiyon
    const getStudioName = () => {
        switch (activeCategory) {
            case 'okuma_anlama': return 'Okuma Anlama & Yorumlama';
            case 'mantik_muhakeme': return 'Mantık Muhakeme & Paragraf';
            case 'dil_bilgisi': return 'Dil Bilgisi ve Anlatım Bozuklukları';
            case 'yazim_noktalama': return 'Yazım Kuralları ve Noktalama';
            case 'soz_varligi': return 'Deyimler, Atasözleri ve Söz Varlığı';
            case 'ses_olaylari': return 'Hece ve Ses Olayları';
            default: return 'Bilinmeyen Stüdyo';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="flex flex-col w-full h-full bg-slate-50 overflow-hidden"
        >
            {/* Üst Bar (Toolbar & Navigasyon) */}
            <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10 shadow-sm">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleBackClick}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors"
                    >
                        <i className="fa-solid fa-arrow-left"></i>
                    </button>
                    <div className="flex flex-col">
                        <span className="font-extrabold text-slate-800 text-lg">
                            {activeCategory ? getStudioName() : 'Süper Türkçe Stüdyoları'}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                            {activeCategory ? 'Çalışma Yaprağı Üretimi' : 'Kategori Seçimi (Ana Portal)'}
                        </span>
                    </div>
                </div>

                {activeCategory && (
                    <div className="flex items-center gap-2">
                        <button onClick={handleSaveToArchive} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl text-xs font-bold transition-all">
                            <i className="fa-solid fa-box-archive"></i> Arşive Kaydet
                        </button>
                        <button onClick={handleAddWorkbook} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-xl text-xs font-bold transition-all">
                            <i className="fa-solid fa-book-medical"></i> Kitapçığa Ekle
                        </button>
                        <button onClick={() => alert('PDF bilgisayarınıza iniyor...')} className="flex items-center gap-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition-all">
                            <i className="fa-solid fa-file-arrow-down"></i> İndir
                        </button>
                        <button onClick={() => onShareToCommunity ? onShareToCommunity() : alert('Topluluk paylaşımı yakında aktif edilecek.')} className="flex items-center gap-2 px-4 py-2 bg-sky-50 hover:bg-sky-100 text-sky-600 rounded-xl text-xs font-bold transition-all">
                            <i className="fa-solid fa-share-nodes"></i> Toplulukta Paylaş
                        </button>
                        <div className="w-px h-6 bg-slate-200 mx-2"></div>
                        <button onClick={() => window.print()} className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-bold shadow-md shadow-brand-500/20 transition-all">
                            <i className="fa-solid fa-print"></i> Yazdır
                        </button>
                    </div>
                )}
            </div>

            {/* İçerik Alanı (Dynamic Render) */}
            <div className="flex-1 overflow-hidden flex relative bg-slate-100/30">
                <AnimatePresence mode="wait">
                    {!activeCategory ? (
                        <motion.div
                            key="dashboard"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="w-full h-full"
                        >
                            <CategoryDashboard />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="substudio"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="flex w-full h-full"
                        >
                            {/* Sol Panel: Alt Stüdyo Formu (Sub-Cockpit) */}
                            <Cockpit />

                            {/* Sağ Panel: A4 Önizleme Alanı */}
                            <div className="flex-1 flex flex-col p-6 overflow-hidden">
                                {selectedObjective ? (
                                    <div className="flex-1 rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-white">
                                        <PDFViewer width="100%" height="100%" className="border-none">
                                            <A4PrintableSheetV2 />
                                        </PDFViewer>
                                    </div>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                                        <div className="w-20 h-20 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center mb-6">
                                            <i className="fa-regular fa-file-pdf text-3xl"></i>
                                        </div>
                                        <h3 className="text-2xl font-bold text-slate-800 mb-2">Çalışma Kağıdı Üretimi</h3>
                                        <p className="text-slate-500 text-center max-w-sm">
                                            Sol panelden sınıf ve konu parametrelerini seçip, çıktı formatını belirleyerek A4 üretimini başlatabilirsiniz.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default SuperTurkceModule;
