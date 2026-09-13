import React from 'react';
import { FascicleItem, FascicleMetadata } from '../../types/fascicle';
import { Student } from '../../types';

interface FascicleExecutiveSummaryPageProps {
  items: FascicleItem[];
  metadata: FascicleMetadata;
  student: Student | null;
  totalPages: number;
}

export const FascicleExecutiveSummaryPage: React.FC<FascicleExecutiveSummaryPageProps> = ({
  items,
  metadata,
  student,
  totalPages,
}) => {
  const summaryNote = metadata.coverPageSettings?.summaryNote ||
    'Bu fasikül, öğrencinin özel öğrenme gereksinimleri (Disleksi / DEHB / Diskalkuli) gözetilerek nöro-pedagojik sarmal yaklaşımla hazırlanmıştır.';

  return (
    <div
      className="print-exact worksheet-page relative flex flex-col justify-between p-[12mm] mx-auto overflow-hidden w-[210mm] h-[297mm] box-border bg-white border border-zinc-200 shadow-2xl mb-12"
      style={{
        fontFamily: 'Lexend, sans-serif',
        position: 'relative',
      }}
    >
      <div>
        {/* Header Band */}
        <div className="flex justify-between items-center pb-4 border-b-2 border-purple-500/40 mb-6">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-purple-600">
              NÖRO-PEDAGOJİK EVALUATION & GEİLŞİM
            </span>
            <h2 className="text-2xl font-black text-zinc-900 tracking-tight mt-0.5">
              Fasikül Sonu Değerlendirme Raporu
            </h2>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 font-bold text-xl border border-purple-200">
            📊
          </div>
        </div>

        {/* Executive Summary Card */}
        <div className="p-5 bg-gradient-to-br from-purple-50 to-indigo-50/50 border border-purple-200/60 rounded-2xl mb-6 shadow-sm">
          <h4 className="text-xs font-black text-purple-900 uppercase tracking-widest mb-2 flex items-center gap-2">
            <span>Öğretmen & Uzman Pedagojik Özeti</span>
          </h4>
          <p className="text-xs text-purple-950/80 leading-relaxed font-medium">
            {summaryNote}
          </p>
        </div>

        {/* Targeted Cognitive Skills Grid */}
        <div className="mb-6">
          <h3 className="text-xs font-black text-zinc-700 uppercase tracking-widest mb-3">
            Hedeflenen Bilişsel & Akademik Beceriler
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { title: 'Görsel & Mekansal Algı', desc: 'Disleksi dostu hizalama ve sekansik takip', icon: '👁️' },
              { title: 'Aritmetik & Sayı Hissi', desc: 'Diskalkuli sarmal işlem adımları', icon: '🔢' },
              { title: 'Odaklanma & Çalışma Belleği', desc: 'DEHB uyumlu mikro-görev döngüleri', icon: '🧠' },
              { title: 'Okuduğunu Anlama & Dil', desc: '5N1K ve bağlamsal çıkarım', icon: '📖' },
            ].map((skill, i) => (
              <div key={i} className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl flex items-start gap-3">
                <span className="text-lg">{skill.icon}</span>
                <div>
                  <h4 className="text-xs font-bold text-zinc-800">{skill.title}</h4>
                  <p className="text-[10px] text-zinc-500 mt-0.5">{skill.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Student Assessment Rating Matrix */}
        <div className="mb-6 border border-zinc-200 rounded-2xl p-4 bg-white">
          <h3 className="text-xs font-black text-zinc-700 uppercase tracking-widest mb-3">
            Öğrenci Gelişim & Değerlendirme Çetelesi
          </h3>
          <div className="space-y-3">
            {[
              'Görevleri Bağımsız Tamamlama Oranı',
              'Yönergeyi Anlama ve Uygulama Derecesi',
              'Zaman Kullanımı ve Odak Süresi',
              'Görsel İşlemleme ve Algısal Hız'
            ].map((metric, i) => (
              <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-zinc-100 last:border-none">
                <span className="font-bold text-zinc-700">{metric}</span>
                <div className="flex gap-2 text-zinc-300">
                  {['★', '★', '★', '★', '★'].map((star, sIdx) => (
                    <span key={sIdx} className="cursor-pointer hover:text-amber-400 text-sm">
                      ☆
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Teacher & Parent Signatures */}
        <div className="grid grid-cols-2 gap-6 pt-4 border-t border-dashed border-zinc-300">
          <div className="p-4 bg-zinc-50/80 rounded-xl border border-zinc-200 text-center">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-6">
              Özel Eğitim Uzmanı / Öğretmen İmza
            </span>
            <div className="h-px bg-zinc-300 w-2/3 mx-auto mb-1" />
            <span className="text-[10px] font-bold text-zinc-600">Tarih: ____ / ____ / 20__</span>
          </div>
          <div className="p-4 bg-zinc-50/80 rounded-xl border border-zinc-200 text-center">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-6">
              Veli / Aile Görüşü ve İmza
            </span>
            <div className="h-px bg-zinc-300 w-2/3 mx-auto mb-1" />
            <span className="text-[10px] font-bold text-zinc-600">Not / Düşünce: ________________</span>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="pt-4 border-t border-zinc-200 flex justify-between items-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-graduation-cap text-purple-600" />
          <span>BDMIND EDUMIND • GELİŞİM RAPORU</span>
        </div>
        <div>SAYFA {totalPages}</div>
      </div>
    </div>
  );
};
