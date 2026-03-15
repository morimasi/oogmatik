import React from 'react';
import { motion } from 'framer-motion';
import { useSuperTurkceStore } from '../../store';

const CATEGORIES = [
    { id: 'okuma_anlama', title: 'Okuma Anlama & Yorumlama', icon: 'fa-book-open', color: 'bg-blue-500', bgColor: 'bg-blue-50 text-blue-700' },
    { id: 'mantik_muhakeme', title: 'Mantık Muhakeme & Paragraf', icon: 'fa-brain', color: 'bg-indigo-500', bgColor: 'bg-indigo-50 text-indigo-700' },
    { id: 'dil_bilgisi', title: 'Dil Bilgisi ve Anlatım Bozuklukları', icon: 'fa-spell-check', color: 'bg-emerald-500', bgColor: 'bg-emerald-50 text-emerald-700' },
    { id: 'yazim_noktalama', title: 'Yazım Kuralları ve Noktalama', icon: 'fa-pen-clip', color: 'bg-rose-500', bgColor: 'bg-rose-50 text-rose-700' },
    { id: 'soz_varligi', title: 'Deyimler, Atasözleri ve Söz Varlığı', icon: 'fa-quote-left', color: 'bg-amber-500', bgColor: 'bg-amber-50 text-amber-700' },
    { id: 'ses_olaylari', title: 'Hece ve Ses Olayları', icon: 'fa-music', color: 'bg-purple-500', bgColor: 'bg-purple-50 text-purple-700' },
];

export const CategoryDashboard: React.FC = () => {
    const { setActiveCategory } = useSuperTurkceStore();

    return (
        <div className="flex-1 bg-slate-50 p-8 overflow-y-auto w-full h-full">
            <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
                <div className="mb-12 text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight mb-4">
                        Süper Türkçe <span className="text-brand-500">Stüdyoları</span>
                    </h1>
                    <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                        A4 formatında, matbaa kalitesinde ve her biri alanında uzmanlaşmış 6 farklı çalışma yaprağı fabrikasına hoş geldiniz. Üretmek istediğiniz kategoriye tıklayın.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {CATEGORIES.map((cat, idx) => (
                        <motion.div
                            key={cat.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            onClick={() => setActiveCategory(cat.id)}
                            className="group relative bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-xl hover:border-brand-300 transition-all cursor-pointer overflow-hidden"
                        >
                            <div className="flex items-start justify-between mb-8 relative z-10">
                                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${cat.bgColor}`}>
                                    <i className={`fa-solid ${cat.icon} text-2xl`}></i>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-brand-50 transition-colors">
                                    <i className="fa-solid fa-arrow-right text-slate-400 group-hover:text-brand-500 transition-colors -rotate-45 group-hover:rotate-0"></i>
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2 relative z-10 group-hover:text-brand-600 transition-colors">{cat.title}</h3>
                            <p className="text-sm text-slate-500 relative z-10">Kategoriye özel en az 10 alt şablon ve ultra özelleştirilebilir yapay zeka destekli üretim motoru.</p>

                            {/* Dekoratif Arkaplan Blob'u */}
                            <div className={`absolute -right-10 -bottom-10 w-32 h-32 rounded-full opacity-5 blur-2xl group-hover:opacity-10 transition-opacity ${cat.color}`}></div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};
