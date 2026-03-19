import React from 'react';
import { motion } from 'framer-motion';
import { useSuperTurkceStore } from '../../store';
import { VocabularyItem } from '../../types';
<<<<<<< HEAD
=======
import { SuperTypography, SuperButton, SuperBadge } from '../../../shared/ui/atoms';
import { SuperCard } from '../../../shared/ui/organisms';
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060

export const VocabularyPanel: React.FC = () => {
    const { vocabularyBank, removeVocabularyWord, setActiveCategory } = useSuperTurkceStore();

    return (
<<<<<<< HEAD
        <div className="flex-1 bg-slate-50 p-8 overflow-y-auto w-full h-full relative">
            <button
                onClick={() => setActiveCategory(null)}
                className="absolute top-8 left-8 w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:shadow-md transition-all z-10"
=======
        <div className="flex-1 bg-[#0a0a0b] p-8 overflow-y-auto w-full h-full relative custom-scrollbar">
            <button
                onClick={() => setActiveCategory(null)}
                className="absolute top-8 left-8 w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all active:scale-95 z-20"
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
            >
                <i className="fa-solid fa-arrow-left"></i>
            </button>

<<<<<<< HEAD
            <div className="max-w-5xl mx-auto mt-4">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 text-xl">
                            <i className="fa-solid fa-piggy-bank"></i>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Kelime Kumbarası</h1>
                            <p className="text-slate-500 text-sm mt-1">Yapay Zeka ve motorlar tarafından keşfedilen {vocabularyBank.length} hedef sözcük.</p>
                        </div>
                    </div>

                    <div className="bg-white border border-emerald-100 px-4 py-2 rounded-xl flex items-center gap-3 shadow-sm">
                        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold">
                            {vocabularyBank.length}
                        </div>
                        <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                            Toplam Kelime
=======
            <div className="max-w-6xl mx-auto mt-4 space-y-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-2xl shadow-xl shadow-emerald-500/5">
                            <i className="fa-solid fa-piggy-bank"></i>
                        </div>
                        <div>
                            <SuperTypography variant="h2" weight="extrabold">Kelime Kumbarası</SuperTypography>
                            <SuperTypography variant="body" color="muted" className="mt-1">
                                AI ve üretim motorları tarafından keşfedilen <span className="text-emerald-400 font-bold">{vocabularyBank.length}</span> hedef sözcük.
                            </SuperTypography>
                        </div>
                    </div>

                    <div className="hidden md:flex bg-emerald-500/5 border border-emerald-500/20 px-6 py-3 rounded-2xl items-center gap-4 shadow-xl">
                        <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-emerald-500/20">
                            {vocabularyBank.length}
                        </div>
                        <div>
                            <SuperTypography variant="caption" weight="extrabold" className="uppercase tracking-widest text-emerald-500">
                                SÖZCÜK HAZİNESİ
                            </SuperTypography>
                            <SuperTypography variant="caption" color="muted">Aktif Kelime Sayısı</SuperTypography>
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
                        </div>
                    </div>
                </div>

                {vocabularyBank.length === 0 ? (
<<<<<<< HEAD
                    <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm border-dashed">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 text-3xl">
                            <i className="fa-solid fa-seedling"></i>
                        </div>
                        <h3 className="text-lg font-bold text-slate-700">Kumbaranız şu an boş.</h3>
                        <p className="text-slate-500 text-sm max-w-sm mx-auto mt-2">
                            Sihirli Soru Üret motoruyla etkinlikler ürettikçe "Boşluk Doldurma", "Söz Varlığı" ve benzeri şablonlardaki hedef kazanım kelimeleri otomatik olarak burada birikir.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {vocabularyBank.map((vocab: VocabularyItem, idx: number) => (
                            <motion.div
                                key={vocab.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                className="group bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all relative overflow-hidden flex flex-col items-center text-center"
                            >
                                <button
                                    onClick={() => removeVocabularyWord(vocab.id)}
                                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-rose-50 text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500 hover:text-white flex items-center justify-center text-[10px]"
                                    title="Kumbaradan Çıkar"
                                >
                                    <i className="fa-solid fa-xmark"></i>
                                </button>

                                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 mb-3 text-lg group-hover:scale-110 transition-transform">
                                    <i className="fa-solid fa-font"></i>
                                </div>

                                <h3 className="text-xl font-bold text-slate-800 lowercase tracking-tight mb-1">{vocab.word}</h3>

                                {vocab.meaning && (
                                    <p className="text-xs text-slate-500 italic mt-1 mb-2 line-clamp-2">{vocab.meaning}</p>
                                )}

                                {vocab.contextSource && (
                                    <span className="text-[9px] font-semibold text-slate-400 bg-slate-50 px-2 py-1 rounded-full mt-auto truncate w-full">
                                        {vocab.contextSource.substring(0, 25)}...
                                    </span>
                                )}

                                <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-emerald-50 rounded-full opacity-0 group-hover:opacity-50 transition-opacity pointer-events-none"></div>
=======
                    <div className="text-center py-24 bg-white/5 rounded-3xl border border-white/10 border-dashed">
                        <div className="w-20 h-20 bg-emerald-500/5 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500/20 text-3xl">
                            <i className="fa-solid fa-seedling"></i>
                        </div>
                        <SuperTypography variant="h4" weight="bold">Kumbaranız şu an boş.</SuperTypography>
                        <SuperTypography variant="body" color="muted" className="max-w-sm mx-auto mt-2 text-center">
                            Sihirli Soru Üret motoruyla etkinlikler ürettikçe hedef kazanım kelimeleri otomatik olarak burada birikir.
                        </SuperTypography>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {vocabularyBank.map((vocab: VocabularyItem, idx: number) => (
                            <motion.div
                                key={vocab.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <SuperCard
                                    title={vocab.word}
                                    variant="glass"
                                    className="h-full border-none ring-1 ring-white/5 group hover:ring-emerald-500/30"
                                    icon={<i className="fa-solid fa-font text-lg"></i>}
                                    footer={
                                        <div className="flex items-center justify-between">
                                            <SuperBadge variant="success" className="bg-emerald-500/5 uppercase tracking-tighter">KEŞFEDİLDİ</SuperBadge>
                                            <button
                                                onClick={() => removeVocabularyWord(vocab.id)}
                                                className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center text-xs"
                                                title="Kumbaradan Çıkar"
                                            >
                                                <i className="fa-solid fa-trash-can"></i>
                                            </button>
                                        </div>
                                    }
                                >
                                    <div className="space-y-3 mb-2 min-h-[80px]">
                                        {vocab.meaning && (
                                            <SuperTypography variant="caption" color="secondary" className="italic leading-relaxed">
                                                "{vocab.meaning}"
                                            </SuperTypography>
                                        )}
                                        {vocab.contextSource && (
                                            <div className="flex items-start gap-2 pt-2 opacity-50">
                                                <i className="fa-solid fa-link text-[10px] mt-1 text-emerald-500"></i>
                                                <SuperTypography variant="caption" color="muted" className="text-[10px] line-clamp-2 uppercase font-bold tracking-tight">
                                                    {vocab.contextSource}
                                                </SuperTypography>
                                            </div>
                                        )}
                                    </div>
                                </SuperCard>
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
