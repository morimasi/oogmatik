import React from 'react';
import { motion } from 'framer-motion';
import { useSuperTurkceStore } from '../../store';
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
];

export const CategoryDashboard: React.FC = () => {
    const { setActiveCategory, archiveHistory, vocabularyBank } = useSuperTurkceStore();

    return (
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
            </div>
        </div>
    );
};
