import React from 'react';
import { StyleSettings } from '../../../types';
import { SemanticLinkerData, SemanticLinkerItem, SemanticLinkerOption } from '../../../modules/activities/semantic-linker/types';

interface SemanticLinkerSheetProps {
  data: SemanticLinkerData | Record<string, unknown>;
  settings?: StyleSettings;
}

export const SemanticLinkerSheet: React.FC<SemanticLinkerSheetProps> = ({ data }) => {
  const resolvedData = (data as Record<string, unknown>) || {};
  const rawItems = (resolvedData.items || (resolvedData.content as Record<string, unknown>)?.items) as unknown;
  const items: SemanticLinkerItem[] = Array.isArray(rawItems) ? (rawItems as SemanticLinkerItem[]) : [];

  const title = (resolvedData.title as string) || 'Anlamsal İlişki Kurma';
  const instruction =
    (resolvedData.instruction as string) ||
    'Hedef sözcük ile seçenekler arasındaki anlamsal bağı inceleyerek doğru seçeneği işaretleyiniz.';
  const pedagogicalNote = (resolvedData.pedagogicalNote as string) || '';

  const columns = items.length > 6 ? 2 : 1;

  return (
    <div className="w-full h-full p-6 print:p-4 flex flex-col justify-between bg-white font-['Lexend'] text-zinc-900 select-none">
      {/* Üst Başlık ve Yönerge */}
      <div className="border-b-2 border-dashed border-zinc-200 pb-3 mb-4 shrink-0">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm print:hidden">
              <i className="fa-solid fa-link text-lg"></i>
            </div>
            <div>
              <h1 className="text-xl print:text-base font-black text-zinc-800 tracking-tight uppercase">
                {title}
              </h1>
              <p className="text-xs print:text-[10px] text-zinc-600 font-medium mt-0.5 leading-snug">
                {instruction}
              </p>
            </div>
          </div>
          <div className="hidden sm:flex print:flex flex-col items-end text-[10px] font-semibold text-zinc-400">
            <span>Tarih: ___ / ___ / 202_</span>
            <span>Adı Soyadı: __________________</span>
          </div>
        </div>

        {/* Öğretmen / Pedagojik Not */}
        {pedagogicalNote && (
          <div className="mt-2.5 px-3 py-1.5 bg-amber-50/80 border border-amber-200 rounded-xl text-[10px] print:text-[8px] text-amber-900 flex items-start gap-2">
            <i className="fa-solid fa-lightbulb text-amber-600 mt-0.5 shrink-0"></i>
            <span className="font-medium leading-relaxed">
              <strong className="font-bold">Öğretmen Notu:</strong> {pedagogicalNote}
            </span>
          </div>
        )}
      </div>

      {/* Soru Grid Alanı */}
      <div
        className={`grid ${
          columns === 2 ? 'grid-cols-2 gap-3.5 print:gap-2' : 'grid-cols-1 gap-3 print:gap-2'
        } flex-1 content-start`}
      >
        {items.map((item, idx) => {
          const isNegated = Boolean(item.isNegated);
          const options: SemanticLinkerOption[] = Array.isArray(item.options) ? item.options : [];

          return (
            <div
              key={item.id || `item-${idx}`}
              className="rounded-2xl border-2 border-zinc-100 bg-zinc-50/40 p-3 print:p-2.5 flex flex-col justify-between shadow-xs hover:border-indigo-200 transition-colors break-inside-avoid"
            >
              {/* Soru Başlık Şeridi */}
              <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-zinc-100">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-lg bg-zinc-900 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                    {idx + 1}
                  </span>
                  <span
                    className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      isNegated
                        ? 'bg-rose-100 text-rose-700 border border-rose-200'
                        : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                    }`}
                  >
                    {isNegated ? 'İlişkili Değildir' : 'İlişkilidir'}
                  </span>
                </div>
                <span className="text-[9px] font-bold text-zinc-300 print:text-zinc-400">
                  #{idx + 1}
                </span>
              </div>

              {/* Soru Kökü */}
              <div className="mb-3">
                <p className="text-xs print:text-[11px] font-bold text-zinc-800 leading-snug">
                  <span className="px-1.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-900 font-extrabold underline decoration-indigo-300 underline-offset-2">
                    {item.targetWord}
                  </span>{' '}
                  sözcüğü aşağıdakilerden hangisiyle{' '}
                  {isNegated ? (
                    <span className="text-rose-700 font-black underline decoration-rose-300 underline-offset-2">
                      ilişkili değildir?
                    </span>
                  ) : (
                    <span className="text-indigo-900 font-black">ilişkilidir?</span>
                  )}
                </p>
              </div>

              {/* Seçenekler (Öğrenci Kâğıdında Doğru Cevap Gizlidir - Sıfır Sızıntı) */}
              <div className="grid grid-cols-3 gap-2 mt-auto">
                {options.map((opt, oIdx) => {
                  const letter = String.fromCharCode(65 + oIdx); // A, B, C
                  return (
                    <div
                      key={opt.id || `opt-${oIdx}`}
                      className="group flex items-center gap-2 p-2 rounded-xl bg-white border border-zinc-200 hover:border-indigo-300 transition-all cursor-pointer shadow-2xs"
                    >
                      <div className="w-5 h-5 rounded-full border-2 border-zinc-300 group-hover:border-indigo-500 flex items-center justify-center text-[10px] font-black text-zinc-600 group-hover:text-indigo-600 shrink-0 bg-zinc-50">
                        {letter}
                      </div>
                      <span className="text-[11px] print:text-[9.5px] font-bold text-zinc-700 leading-tight truncate">
                        {opt.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Alt Değerlendirme & Bilgi Bandı */}
      <div className="mt-4 pt-3 border-t-2 border-zinc-100 flex items-center justify-between text-[10px] text-zinc-500 shrink-0">
        <div className="flex items-center gap-2 font-bold tracking-wider text-zinc-400 uppercase text-[9px]">
          <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block"></span>
          <span>bdmind Özel Eğitim & Bilişsel Gelişim</span>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-black">
          <div className="px-2.5 py-1 bg-zinc-100 rounded-lg border border-zinc-200">
            Doğru: <span className="text-zinc-400">____</span>
          </div>
          <div className="px-2.5 py-1 bg-zinc-100 rounded-lg border border-zinc-200">
            Yanlış: <span className="text-zinc-400">____</span>
          </div>
          <div className="px-2.5 py-1 bg-indigo-50 rounded-lg border border-indigo-200 text-indigo-700">
            Puan: <span className="text-indigo-300">____</span>
          </div>
        </div>
      </div>
    </div>
  );
};
