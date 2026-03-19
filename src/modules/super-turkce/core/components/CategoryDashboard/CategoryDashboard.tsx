import React from 'react';
import { motion } from 'framer-motion';
import { useSuperTurkceStore } from '../../store';
<<<<<<< HEAD

const CATEGORIES = [
    { id: 'okuma_anlama', title: 'Okuma Anlama & Yorumlama', icon: 'fa-book-open', color: 'bg-blue-500', bgColor: 'bg-blue-50 text-blue-700' },
    { id: 'mantik_muhakeme', title: 'Mantık Muhakeme & Paragraf', icon: 'fa-brain', color: 'bg-indigo-500', bgColor: 'bg-indigo-50 text-indigo-700' },
    { id: 'dil_bilgisi', title: 'Dil Bilgisi ve Anlatım Bozuklukları', icon: 'fa-spell-check', color: 'bg-emerald-500', bgColor: 'bg-emerald-50 text-emerald-700' },
    { id: 'yazim_noktalama', title: 'Yazım Kuralları ve Noktalama', icon: 'fa-pen-clip', color: 'bg-rose-500', bgColor: 'bg-rose-50 text-rose-700' },
    { id: 'soz_varligi', title: 'Deyimler, Atasözleri ve Söz Varlığı', icon: 'fa-quote-left', color: 'bg-amber-500', bgColor: 'bg-amber-50 text-amber-700' },
    { id: 'ses_olaylari', title: 'Hece ve Ses Olayları', icon: 'fa-music', color: 'bg-purple-500', bgColor: 'bg-purple-50 text-purple-700' },
=======
import { SuperTypography, SuperButton, SuperBadge } from '../../../shared/ui/atoms';
import { StatCard } from '../../../shared/ui/molecules';
import { SuperCard } from '../../../shared/ui/organisms';

const CATEGORIES = [
    {
        id: 'okuma_anlama',
        title: 'Okuma Anlama & Yorumlama',
        subtitle: 'Derinlemesine Analiz Fabrikası',
        icon: <i className="fa-solid fa-book-open"></i>,
        description: 'Kategoriye özel en az 10 alt şablon ve multimodal Gemini 2.0 destekli üretim motoru.'
    },
    {
        id: 'mantik_muhakeme',
        title: 'Mantık Muhakeme & Paragraf',
        subtitle: 'Bilişsel Beceri Atölyesi',
        icon: <i className="fa-solid fa-brain"></i>,
        description: 'Muhakeme yeteneğini zorlayan, yeni nesil soru kalıpları ve pedagojik denetimli içerik.'
    },
    {
        id: 'dil_bilgisi',
        title: 'Dil Bilgisi ve Anlatım',
        subtitle: 'Linguistik Hassasiyet',
        icon: <i className="fa-solid fa-spell-check"></i>,
        description: 'Modern müfredat uyumlu, kuralları oyunlaştıran ve hatasız JSON çıktısı sağlayan modül.'
    },
    {
        id: 'yazim_noktalama',
        title: 'Yazım Kuralları ve Noktalama',
        subtitle: 'Ortografi Standartları',
        icon: <i className="fa-solid fa-pen-clip"></i>,
        description: 'Yazım hatalarını anlık tespit eden ve düzeltme odaklı interaktif materyal üretimi.'
    },
    {
        id: 'soz_varligi',
        title: 'Deyimler & Atasözleri',
        subtitle: 'Semantik Hazine',
        icon: <i className="fa-solid fa-quote-left"></i>,
        description: 'Kültürel mirası modern görsellerle birleştiren, zenginleştirilmiş söz varlığı paneli.'
    },
    {
        id: 'ses_olaylari',
        title: 'Hece ve Ses Olayları',
        subtitle: 'Fonetik Dinamikler',
        icon: <i className="fa-solid fa-music"></i>,
        description: 'Ses bilgisi kurallarını disleksi dostu fontlar ve düzenlerle sunan özel tasarım stüdyosu.'
    },
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
];

export const CategoryDashboard: React.FC = () => {
    const { setActiveCategory, archiveHistory, vocabularyBank } = useSuperTurkceStore();

    return (
<<<<<<< HEAD
        <div className="flex-1 bg-slate-50 p-8 overflow-y-auto w-full h-full">
            <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
                <div className="mb-12 text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight mb-4">
                        Süper Türkçe <span className="text-brand-500">Stüdyoları</span>
                    </h1>
                    <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                        A4 formatında, matbaa kalitesinde ve her biri alanında uzmanlaşmış 6 farklı çalışma yaprağı fabrikasına hoş geldiniz. Üretmek istediğiniz kategoriye tıklayın.
                    </p>

                    {/* Faz 10 - Post Production (Arşiv ve Kumbara) Navigasyonu */}
                    <div className="flex items-center justify-center gap-4 mt-8">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setActiveCategory('archive')}
                            className="flex items-center gap-3 bg-white border border-slate-200 px-6 py-3 rounded-2xl shadow-sm hover:shadow-md hover:border-brand-300 transition-all text-slate-700 font-semibold"
                        >
                            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500">
                                <i className="fa-solid fa-box-archive"></i>
                            </div>
                            Geçmiş Arşivim
                            {archiveHistory.length > 0 && (
                                <span className="ml-2 bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs">{archiveHistory.length} Kayıt</span>
                            )}
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setActiveCategory('vocabulary')}
                            className="flex items-center gap-3 bg-white border border-slate-200 px-6 py-3 rounded-2xl shadow-sm hover:shadow-md hover:border-brand-300 transition-all text-slate-700 font-semibold"
                        >
                            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                                <i className="fa-solid fa-piggy-bank"></i>
                            </div>
                            Kelime Kumbarası
                            {vocabularyBank.length > 0 && (
                                <span className="ml-2 bg-brand-50 text-brand-600 px-2 py-0.5 rounded-full text-xs font-bold">{vocabularyBank.length}</span>
                            )}
                        </motion.button>
                    </div>
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
=======
        <div className="flex-1 bg-[#0a0a0b] p-6 md:p-12 overflow-y-auto w-full h-full custom-scrollbar">
            <div className="max-w-7xl mx-auto space-y-12">

                {/* Header Section */}
                <section className="text-center space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <SuperBadge variant="primary" pulse>Platform v3.0 | Multimodal AI Enabled</SuperBadge>
                    </motion.div>

                    <SuperTypography variant="h1" weight="extrabold" className="bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">
                        Süper Türkçe <span className="text-indigo-500 italic">Üretim Portalı</span>
                    </SuperTypography>

                    <SuperTypography variant="body" color="secondary" className="max-w-3xl mx-auto leading-relaxed">
                        Matbaa kalitesinde, ultra-professional ve her biri alanında uzmanlaşmış 6 farklı üretim fabrikasına hoş geldiniz.
                        İşlem yapmak istediğiniz fabrikayı seçerek üretimi başlatın.
                    </SuperTypography>

                    <div className="flex flex-wrap items-center justify-center gap-4 pt-6">
                        <StatCard
                            label="Kayıtlı Arşiv"
                            value={archiveHistory.length}
                            icon={<i className="fa-solid fa-box-archive"></i>}
                            trend={`${archiveHistory.length > 0 ? '+12%' : '0%'}`}
                            trendUp={archiveHistory.length > 0}
                            className="w-48"
                        />
                        <StatCard
                            label="Kelime Kumbarası"
                            value={vocabularyBank.length}
                            icon={<i className="fa-solid fa-piggy-bank"></i>}
                            trend="Aktif"
                            trendUp
                            className="w-48"
                        />
                    </div>
                </section>

                {/* Categories Grid */}
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {CATEGORIES.map((cat, idx) => (
                        <motion.div
                            key={cat.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05, duration: 0.4 }}
                        >
                            <SuperCard
                                title={cat.title}
                                subtitle={cat.subtitle}
                                icon={cat.icon}
                                badge={idx === 0 ? 'Popüler' : undefined}
                                className="h-full group"
                                onClick={() => setActiveCategory(cat.id)}
                                footer={
                                    <div className="flex items-center justify-between text-indigo-400 group-hover:text-white transition-colors">
                                        <span className="text-xs font-bold uppercase tracking-widest">Stüdyoya Gir</span>
                                        <i className="fa-solid fa-chevron-right text-xs group-hover:translate-x-1 transition-transform"></i>
                                    </div>
                                }
                            >
                                <SuperTypography variant="caption" color="secondary" className="line-clamp-3">
                                    {cat.description}
                                </SuperTypography>
                            </SuperCard>
                        </motion.div>
                    ))}
                </section>

                {/* Quick Actions */}
                <section className="flex flex-wrap items-center justify-center gap-6 pt-12">
                    <SuperButton
                        variant="glass"
                        size="lg"
                        leftIcon={<i className="fa-solid fa-clock-rotate-left"></i>}
                        onClick={() => setActiveCategory('archive')}
                    >
                        Arşivi İncele
                    </SuperButton>
                    <SuperButton
                        variant="primary"
                        size="lg"
                        leftIcon={<i className="fa-solid fa-wand-magic-sparkles"></i>}
                        onClick={() => setActiveCategory('okuma_anlama')}
                    >
                        Hızlı Üretim Başlat
                    </SuperButton>
                </section>
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
            </div>
        </div>
    );
};
