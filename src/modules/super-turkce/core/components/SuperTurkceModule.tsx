import React from 'react';
import { motion } from 'framer-motion';
import { PDFViewer } from '@react-pdf/renderer';
import Cockpit from './Cockpit/Cockpit';
import { MatchingLinesPdf } from '../../features/matching-lines/MatchingLinesPdf';
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
    const { selectedObjective } = useSuperTurkceStore();

    const handleSaveToArchive = async () => {
        if (onSave && selectedObjective) {
            try {
                // Şimdilik test amaçlı boş veri yollayıp arşiv özelliği test ediliyor.
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
                // İleride gerçek JSON eklenecek
            });
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="flex w-full h-full bg-slate-50 overflow-hidden"
        >
            {/* Sol Panel: Etkinlik Üretim Formu */}
            <Cockpit />

            {/* Sağ Panel: A4 Önizleme Alanı */}
            <div className="flex-1 flex flex-col p-4 overflow-hidden gap-4">
                {selectedObjective ? (
                    <>
                        <div className="flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-brand-100 text-brand-600 rounded-xl flex items-center justify-center">
                                    <i className="fa-solid fa-file-pdf"></i>
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-800">A4 Çıktı Önizleme</h3>
                                    <p className="text-xs text-slate-500 font-medium">Baskıya Hazır</p>
                                </div>
                            </div>
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
                                <div className="w-px h-6 bg-slate-200 mx-1"></div>
                                <button onClick={() => window.print()} className="flex items-center gap-2 px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/20 transition-all">
                                    <i className="fa-solid fa-print"></i> Yazdır
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white relative">
                            <PDFViewer width="100%" height="100%" className="border-none">
                                <MatchingLinesPdf />
                            </PDFViewer>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white rounded-2xl border border-slate-200 shadow-sm">
                        <div className="text-center space-y-4 max-w-md">
                            <div className="w-16 h-16 bg-brand-100 text-brand-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">A4 PDF Önizleme Alanı</h3>
                            <p className="text-slate-500">
                                Sol menüden MEB kazanımını ve özellikleri seçtiğinizde, matbaa kalitesindeki etkinlik kağıdınız saniyeler içinde burada belirecektir.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default SuperTurkceModule;
