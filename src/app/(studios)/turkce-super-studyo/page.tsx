'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Puzzle, SpellCheck, Library, Sparkles, FileText, GraduationCap } from 'lucide-react';

type StudioId =
  | 'metin-paragraf'
  | 'mantik-muhakeme'
  | 'yazim-noktalama'
  | 'soz-varligi'
  | 'calisma-kagidi'
  | 'ogretmen-paneli';

interface TurkceSuperStudyoPageProps {
  onNavigate: (studioId: StudioId) => void;
}

const studios: {
  id: StudioId;
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  borderColor: string;
  iconBg: string;
}[] = [
    {
      id: 'metin-paragraf',
      title: 'Metin & Paragraf Stüdyosu',
      description: 'Kişiselleştirilmiş metin üretimi ve anlama soruları.',
      icon: <BookOpen className="w-7 h-7" />,
      gradient: 'from-indigo-500 to-blue-600',
      borderColor: 'border-indigo-200/60',
      iconBg: 'bg-indigo-100 text-indigo-600',
    },
    {
      id: 'mantik-muhakeme',
      title: 'Mantık & Muhakeme Stüdyosu',
      description: 'Neden-sonuç ilişkileri ve görsel mantık bulmacaları.',
      icon: <Puzzle className="w-7 h-7" />,
      gradient: 'from-rose-500 to-pink-600',
      borderColor: 'border-rose-200/60',
      iconBg: 'bg-rose-100 text-rose-600',
    },
    {
      id: 'yazim-noktalama',
      title: 'Yazım & Noktalama Stüdyosu',
      description: 'Hatalı metni düzeltme ve noktalama yerleştirme.',
      icon: <SpellCheck className="w-7 h-7" />,
      gradient: 'from-amber-500 to-orange-600',
      borderColor: 'border-amber-200/60',
      iconBg: 'bg-amber-100 text-amber-600',
    },
    {
      id: 'soz-varligi',
      title: 'Söz Varlığı & Kelime Fabrikası',
      description: 'Eş/Zıt anlam, deyimler ve kelime oyunları.',
      icon: <Library className="w-7 h-7" />,
      gradient: 'from-emerald-500 to-teal-600',
      borderColor: 'border-emerald-200/60',
      iconBg: 'bg-emerald-100 text-emerald-600',
    },
    {
      id: 'calisma-kagidi',
      title: 'Çalışma Kağıdı Stüdyosu',
      description: 'PDF fasikül üretimi, yazdırma ve paylaşım merkezi.',
      icon: <FileText className="w-7 h-7" />,
      gradient: 'from-teal-500 to-cyan-600',
      borderColor: 'border-teal-200/60',
      iconBg: 'bg-teal-100 text-teal-600',
    },
    {
      id: 'ogretmen-paneli',
      title: 'Soru Fabrikası (Öğretmen)',
      description: 'Metinden AI ile otomatik soru üretimi ve yönetimi.',
      icon: <GraduationCap className="w-7 h-7" />,
      gradient: 'from-violet-500 to-purple-600',
      borderColor: 'border-violet-200/60',
      iconBg: 'bg-violet-100 text-violet-600',
    },
  ];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
  },
};

export default function TurkceSuperStudyoPage({ onNavigate }: TurkceSuperStudyoPageProps) {
  return (
    <div className="space-y-12">
      {/* Hero Section with glassmorphism */}
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="text-center max-w-3xl mx-auto mt-6"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100/80 backdrop-blur-sm text-indigo-700 rounded-full text-sm font-bold mb-6 border border-indigo-200/50">
          <Sparkles className="w-4 h-4" />
          Premium Materyal Üretim Merkezi
        </div>
        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight leading-tight">
          Özel Çalışma Kağıtları <br className="hidden md:block" /> Saniyeler İçinde Hazır
        </h2>
        <p className="text-xl text-gray-600 mb-4 leading-relaxed max-w-2xl mx-auto">
          Disleksi dostu, pedagojik olarak yapılandırılmış ve yapay zeka destekli materyal üretim
          merkezine hoş geldiniz.
        </p>
      </motion.section>

      {/* Studio Cards Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6 max-w-6xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {studios.map((studio) => (
          <motion.button
            key={studio.id}
            variants={itemVariants}
            onClick={() => onNavigate(studio.id)}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.98 }}
            className={`group relative text-left p-6 rounded-3xl border-2 ${studio.borderColor} bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col gap-3 overflow-hidden`}
          >
            {/* Background gradient orb */}
            <div
              className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${studio.gradient} opacity-[0.07] group-hover:opacity-[0.14] group-hover:scale-125 transition-all duration-500`}
            />

            {/* Icon */}
            <div
              className={`w-14 h-14 rounded-2xl ${studio.iconBg} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300 relative z-10`}
            >
              {studio.icon}
            </div>

            <h3 className="text-xl font-bold text-gray-900 relative z-10">{studio.title}</h3>
            <p className="text-gray-500 leading-relaxed text-sm flex-grow relative z-10">
              {studio.description}
            </p>

            <div
              className={`mt-2 flex items-center text-xs font-bold bg-gradient-to-r ${studio.gradient} bg-clip-text text-transparent relative z-10`}
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
              AI ile Üret →
            </div>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
