import React from 'react';
import { BookOpen, Puzzle, SpellCheck, Library, Sparkles } from 'lucide-react';

export default function TurkceSuperStudyoPage() {
  const studios = [
    {
      id: 'metin-paragraf',
      title: 'Metin & Paragraf Stüdyosu',
      description: 'Kişiselleştirilmiş metin üretimi ve anlama soruları.',
      icon: <BookOpen className="w-8 h-8 text-indigo-500" />,
      color: 'bg-indigo-50 border-indigo-200 hover:border-indigo-400 hover:shadow-indigo-100',
    },
    {
      id: 'mantik-muhakeme',
      title: 'Mantık & Muhakeme Stüdyosu',
      description: 'Neden-sonuç ilişkileri ve görsel mantık bulmacaları.',
      icon: <Puzzle className="w-8 h-8 text-rose-500" />,
      color: 'bg-rose-50 border-rose-200 hover:border-rose-400 hover:shadow-rose-100',
    },
    {
      id: 'yazim-noktalama',
      title: 'Yazım & Noktalama Stüdyosu',
      description: 'Hatalı metni düzeltme ve noktalama yerleştirme.',
      icon: <SpellCheck className="w-8 h-8 text-amber-500" />,
      color: 'bg-amber-50 border-amber-200 hover:border-amber-400 hover:shadow-amber-100',
    },
    {
      id: 'soz-varligi',
      title: 'Söz Varlığı & Kelime Fabrikası',
      description: 'Eş/Zıt anlam, deyimler ve kelime oyunları.',
      icon: <Library className="w-8 h-8 text-emerald-500" />,
      color: 'bg-emerald-50 border-emerald-200 hover:border-emerald-400 hover:shadow-emerald-100',
    },
  ];

  return (
    <div className="space-y-12">
      <section className="text-center max-w-3xl mx-auto mt-10">
        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
          Özel Çalışma Kağıtları <br className="hidden md:block" /> Saniyeler İçinde Hazır
        </h2>
        <p className="text-xl text-gray-600 mb-10 leading-relaxed">
          Disleksi dostu, pedagojik olarak yapılandırılmış ve yapay zeka destekli materyal üretim
          merkezine hoş geldiniz.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
        {studios.map((studio) => (
          <a
            key={studio.id}
            href={`/turkce-super-studyo/${studio.id}`}
            className={`group relative p-8 rounded-3xl border-2 transition-all duration-300 ease-in-out shadow-sm hover:shadow-xl hover:-translate-y-1 ${studio.color} flex flex-col gap-4 overflow-hidden backdrop-blur-sm`}
          >
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              {studio.icon}
            </div>

            <div className="bg-white w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm mb-2 group-hover:scale-110 transition-transform duration-300">
              {studio.icon}
            </div>

            <h3 className="text-2xl font-bold text-gray-900">{studio.title}</h3>
            <p className="text-gray-600 leading-relaxed flex-grow">{studio.description}</p>

            <div className="mt-4 flex items-center text-sm font-semibold text-gray-900 bg-white/50 w-fit px-4 py-2 rounded-full group-hover:bg-white transition-colors">
              <Sparkles className="w-4 h-4 mr-2 text-indigo-500" />
              AI ile Üret
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
