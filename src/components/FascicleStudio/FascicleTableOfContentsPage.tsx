import React from 'react';
import { FascicleItem, FascicleMetadata } from '../../types/fascicle';
import { Student } from '../../types';

interface FascicleTableOfContentsPageProps {
  items: FascicleItem[];
  metadata: FascicleMetadata;
  student: Student | null;
}

export const FascicleTableOfContentsPage: React.FC<FascicleTableOfContentsPageProps> = ({
  items,
  metadata,
  student,
}) => {
  let currentPageAcc = 3; // Kapak = 1, İçindekiler = 2 -> ilk aktivite sayfa 3'ten başlar

  return (
    <div
      className="print-exact worksheet-page relative flex flex-col justify-between p-[12mm] mx-auto overflow-hidden w-[210mm] h-[297mm] box-border bg-white border border-zinc-200 shadow-2xl mb-12"
      style={{
        fontFamily: 'Lexend, sans-serif',
        position: 'relative',
      }}
    >
      {/* Header Band */}
      <div>
        <div className="flex justify-between items-center pb-4 border-b-2 border-accent/40 mb-6">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-accent">
              FASİKÜL İÇERİK PLANI
            </span>
            <h2 className="text-2xl font-black text-zinc-900 tracking-tight mt-0.5">
              İçindekiler & Çalışma Haritası
            </h2>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-zinc-500 block">
              {metadata.title || 'Fasikül'}
            </span>
            <span className="text-[10px] text-zinc-400 font-medium">
              Toplam {items.length} Etkinlik Modülü
            </span>
          </div>
        </div>

        {/* Informative Student Banner */}
        {student && (
          <div className="mb-6 p-3 bg-accent/5 border border-accent/20 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold text-sm">
                🎓
              </div>
              <div>
                <span className="text-xs font-bold text-zinc-800 block">
                  Öğrenci: {student.name}
                </span>
                <span className="text-[10px] text-zinc-500">
                  Hedef Seviye: {metadata.targetAgeGroup} Yaş • {metadata.targetProfile.toUpperCase()} Desteği
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-accent uppercase tracking-widest block">
                Tahmini Süre
              </span>
              <span className="text-xs font-black text-zinc-700">
                ~{metadata.estimatedDurationMin || 40} Dakika
              </span>
            </div>
          </div>
        )}

        {/* Table of Contents List */}
        <div className="space-y-3">
          {items.map((item, idx) => {
            const startPage = currentPageAcc;
            currentPageAcc += item.pageCount || 1;

            const formattedTitle = (item.content as any)?.title || 
              (item.content as any)?.pageConfig?.title || 
              item.type.replace(/-/g, ' ').toUpperCase();

            return (
              <div
                key={item.id || idx}
                className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 bg-zinc-50/50 hover:bg-zinc-50 transition-colors"
              >
                {/* Index & Checkbox */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-6 h-6 rounded-lg bg-white border border-zinc-300 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-zinc-400">☐</span>
                  </div>

                  <span className="w-6 text-xs font-black text-accent shrink-0">
                    {String(idx + 1).padStart(2, '0')}.
                  </span>

                  <div className="min-w-0 flex-1 pr-4">
                    <h4 className="text-xs font-bold text-zinc-800 truncate">
                      {formattedTitle}
                    </h4>
                    <span className="text-[9px] text-zinc-400 font-medium">
                      Modül Türü: {item.type}
                    </span>
                  </div>
                </div>

                {/* Difficulty & Page Number */}
                <div className="flex items-center gap-4 shrink-0">
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      item.difficulty === 'Zor'
                        ? 'bg-red-50 text-red-600 border border-red-200'
                        : item.difficulty === 'Orta'
                        ? 'bg-amber-50 text-amber-600 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                    }`}
                  >
                    {item.difficulty}
                  </span>

                  <div className="flex items-center gap-1 min-w-[60px] justify-end">
                    <span className="text-xs font-black text-zinc-900">
                      S. {startPage}
                    </span>
                    {item.pageCount > 1 && (
                      <span className="text-[9px] text-zinc-400 font-bold">
                        -{startPage + item.pageCount - 1}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Branding */}
      <div className="pt-4 border-t border-zinc-200 flex justify-between items-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-book-open text-accent" />
          <span>BDMIND EDUMIND • BÖLÜM KILAVUZU</span>
        </div>
        <div>SAYFA 2</div>
      </div>
    </div>
  );
};
