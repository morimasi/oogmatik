import React from 'react';
import { FascicleItem, FascicleMetadata } from '../../types/fascicle';
import { Student } from '../../types';

interface FascicleTableOfContentsPageProps {
  items: FascicleItem[];
  metadata: FascicleMetadata;
  student: Student | null;
  pageNumber?: number;
  firstContentPageNumber?: number;
  totalPages?: number;
}

export const FascicleTableOfContentsPage: React.FC<FascicleTableOfContentsPageProps> = ({
  items,
  metadata,
  student,
  pageNumber,
  firstContentPageNumber,
  totalPages,
}) => {
  const isCoverActive = metadata.coverPageSettings?.enabled !== false;
  const tocPageNumber = pageNumber ?? (isCoverActive ? 2 : 1);
  let currentPageAcc = firstContentPageNumber ?? (tocPageNumber + 1);

  const isManyItems = items.length > 7;
  const isTwoColumns = items.length > 8;

  return (
    <div
      className="print-exact worksheet-page relative flex flex-col justify-between p-[10mm] mx-auto overflow-hidden w-[210mm] h-[297mm] box-border bg-white border border-zinc-200 shadow-2xl mb-12"
      style={{
        fontFamily: 'Lexend, sans-serif',
        position: 'relative',
      }}
    >
      {/* Header Band */}
      <div className="flex-1 min-h-0 flex flex-col">
        <div className="flex justify-between items-center pb-3 border-b-2 border-accent/40 mb-4 shrink-0">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-accent">
              FASİKÜL İÇERİK PLANI
            </span>
            <h2 className="text-xl font-black text-zinc-900 tracking-tight mt-0.5">
              İçindekiler & Çalışma Haritası
            </h2>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-zinc-500 block">
              {metadata.title && metadata.title !== 'İsimsiz Fasikül' ? metadata.title : 'Özel Eğitim Fasikülü'}
            </span>
            <span className="text-[10px] text-zinc-400 font-medium">
              Toplam {items.length} Etkinlik Modülü
            </span>
          </div>
        </div>

        {/* Informative Student Banner */}
        {student && (
          <div className={`p-2.5 bg-accent/5 border border-accent/20 rounded-xl flex items-center justify-between shrink-0 ${isManyItems ? 'mb-3' : 'mb-5'}`}>
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold text-xs shrink-0">
                🎓
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-zinc-800 block truncate">
                  Öğrenci: {student.name}
                </span>
                <span className="text-[9px] text-zinc-500">
                  Hedef Seviye: {metadata.targetAgeGroup} Yaş • {metadata.targetProfile.toUpperCase()} Desteği
                </span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[9px] font-bold text-accent uppercase tracking-widest block">
                Tahmini Süre
              </span>
              <span className="text-xs font-black text-zinc-700">
                ~{metadata.estimatedDurationMin || 40} Dakika
              </span>
            </div>
          </div>
        )}

        {/* Table of Contents List */}
        <div className={`flex-1 min-h-0 overflow-hidden ${isTwoColumns ? 'grid grid-cols-2 gap-2 content-start' : isManyItems ? 'space-y-1.5' : 'space-y-2.5'}`}>
          {items.map((item, idx) => {
            const startPage = currentPageAcc;
            currentPageAcc += item.pageCount || 1;

            const formattedTitle = (item.content as any)?.title || 
              (item.content as any)?.pageConfig?.title || 
              item.type.replace(/_/g, ' ').replace(/-/g, ' ').toUpperCase();

            return (
              <div
                key={item.id || idx}
                className={`flex items-center justify-between rounded-lg border border-zinc-100 bg-zinc-50/50 hover:bg-zinc-50 transition-colors ${
                  isManyItems ? 'p-2 py-1.5' : 'p-3 py-2'
                }`}
              >
                {/* Index & Checkbox */}
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-5 h-5 rounded bg-white border border-zinc-300 flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-zinc-400">☐</span>
                  </div>

                  <span className="w-5 text-[11px] font-black text-accent shrink-0">
                    {String(idx + 1).padStart(2, '0')}.
                  </span>

                  <div className="min-w-0 flex-1 pr-2">
                    <h4 className="text-[11px] font-bold text-zinc-800 truncate">
                      {formattedTitle}
                    </h4>
                    {!isTwoColumns && (
                      <span className="text-[8px] text-zinc-400 font-medium truncate block">
                        Modül Türü: {item.type}
                      </span>
                    )}
                  </div>
                </div>

                {/* Difficulty & Page Number */}
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${
                      item.difficulty === 'Zor'
                        ? 'bg-red-50 text-red-600 border border-red-200'
                        : item.difficulty === 'Orta'
                        ? 'bg-amber-50 text-amber-600 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                    }`}
                  >
                    {item.difficulty}
                  </span>

                  <div className="flex items-center gap-0.5 min-w-[36px] justify-end text-right">
                    <span className="text-[11px] font-black text-zinc-900">
                      S. {startPage}
                    </span>
                    {(item.pageCount || 1) > 1 && (
                      <span className="text-[8px] text-zinc-400 font-bold">
                        -{startPage + (item.pageCount || 1) - 1}
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
      <div className="pt-3 border-t border-zinc-200 flex justify-between items-center text-[9px] font-bold text-zinc-400 uppercase tracking-widest shrink-0">
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-book-open text-accent" />
          <span>BDMIND EDUMIND • BÖLÜM KILAVUZU</span>
        </div>
        <div>SAYFA {tocPageNumber} {totalPages ? `/ ${totalPages}` : ''}</div>
      </div>
    </div>
  );
};
