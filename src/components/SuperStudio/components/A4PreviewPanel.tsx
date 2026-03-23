import React from 'react';
import { ActionToolbar } from './ActionToolbar';
import { useSuperStudioStore } from '../../../store/useSuperStudioStore';
import { motion, AnimatePresence } from 'framer-motion';

export const A4PreviewPanel: React.FC = () => {
    const { generatedContents, isGenerating } = useSuperStudioStore();

    return (
        <div className="flex-1 flex flex-col h-full">
            {/* İşlevsel Araç Çubuğu (Toolbar) */}
            <div className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-6 z-20">
                <div className="flex items-center text-slate-400 text-sm">
                    <span className="text-indigo-400 mr-3 relative flex h-3 w-3">
                        {isGenerating && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>}
                        <span className={`relative inline-flex rounded-full h-3 w-3 ${isGenerating ? 'bg-indigo-500' : 'bg-slate-500'}`}></span>
                    </span>
                    A4 Canlı Önizleme {generatedContents.length > 0 && <span className="ml-2 bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full text-xs font-semibold">{generatedContents.length} Sayfa</span>}
                </div>

                <ActionToolbar />
            </div>

            {/* A4 Canvas Area */}
            <div className="flex-1 overflow-y-auto bg-slate-950 p-8 flex flex-col items-center custom-scrollbar pb-32">
                <AnimatePresence mode="popLayout">
                    {isGenerating ? (
                        <motion.div
                            key="generating"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-[210mm] min-h-[297mm] bg-white/5 border border-slate-800 shadow-2xl relative mb-8 flex flex-col items-center justify-center rounded-xl"
                        >
                            <div className="flex flex-col items-center space-y-6">
                                <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-indigo-400 font-medium text-lg text-center px-8">Bilişsel Yüke Uygun A4 İçerikleri <br /> Özel Eğitim AI Motoruyla Üretiliyor...</p>
                            </div>
                        </motion.div>
                    ) : generatedContents.length === 0 ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="w-[210mm] min-h-[297mm] bg-white shadow-2xl relative mb-8 flex flex-col items-center justify-center p-8 text-slate-800 font-lexend"
                        >
                            <div className="text-center text-slate-400 border-2 border-dashed border-slate-200 p-16 rounded-2xl">
                                <span className="text-5xl mb-6 block">📄</span>
                                <p className="font-semibold text-xl text-slate-500">Henüz etkinlik üretilmedi.</p>
                                <p className="text-base mt-3">Sol panelden şablonlarınızı seçip çoklu üretime başlayın.</p>
                            </div>
                        </motion.div>
                    ) : (
                        generatedContents.map((content, index) => (
                            <motion.div
                                key={content.id}
                                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ delay: index * 0.1, duration: 0.5, type: 'spring' }}
                                className="w-[210mm] min-h-[297mm] bg-white shadow-2xl relative mb-12 p-12 text-slate-800 font-lexend print:shadow-none print:m-0 print:p-0 print:w-full print:min-h-0 page-break-after-always"
                            >
                                {/* Header / Student Name / Grade space */}
                                <div className="flex justify-between items-end border-b-2 border-slate-800 pb-5 mb-10">
                                    <div>
                                        <h1 className="text-3xl font-bold text-slate-900 mb-3">{content.pages[0].title}</h1>
                                        <div className="text-xs font-bold text-slate-600 uppercase tracking-widest bg-slate-100 px-3 py-1.5 rounded-md inline-block">Süper Türkçe Stüdyosu</div>
                                    </div>
                                    <div className="flex flex-col items-end text-sm space-y-3 font-medium">
                                        <div className="flex items-center"><span className="text-slate-500 mr-3 w-16">Ad Soyad:</span> <span className="w-48 border-b-2 border-slate-300 inline-block h-4"></span></div>
                                        <div className="flex items-center"><span className="text-slate-500 mr-3 w-16">Sınıf/No:</span> <span className="w-48 border-b-2 border-slate-300 inline-block h-4"></span></div>
                                        <div className="flex items-center"><span className="text-slate-500 mr-3 w-16">Tarih:</span> <span className="w-48 border-b-2 border-slate-300 inline-block h-4"></span></div>
                                    </div>
                                </div>

                                {/* Content Body */}
                                <div className="space-y-6 text-lg leading-relaxed text-justify px-2">
                                    {content.pages[0].content}
                                </div>

                                {/* Pedagogical Note Footer (Hidden on print) */}
                                <div className="absolute bottom-10 left-12 right-12 bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-lg text-sm text-indigo-900 print:hidden shadow-sm">
                                    <span className="font-bold mr-2 text-indigo-700">Uzman / PDR Notu:</span>
                                    {content.pages[0].pedagogicalNote}
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
