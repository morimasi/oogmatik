import React from 'react';
import { EsAnlamliKelimeItem, EsAnlamliKelimelerData } from '../../../types/verbal';
import { PedagogicalHeader } from '../common';
import { EditableElement, EditableText } from '../../Editable';

const BLANK_SEPARATOR = '_______';

interface Props {
  data: EsAnlamliKelimelerData | EsAnlamliKelimelerData[] | null;
}

const CONTEXT_COLORS: Record<string, string> = {
  'Resmi': 'bg-blue-100 text-blue-700',
  'Günlük': 'bg-green-100 text-green-700',
  'Edebi': 'bg-purple-100 text-purple-700',
};

export const EsAnlamliKelimelerSheet: React.FC<Props> = ({ data }) => {
  const activity = Array.isArray(data) ? data[0] : data;
  if (!activity) return null;

  const items: EsAnlamliKelimeItem[] = activity.items || [];
  const layout = activity.settings?.layout || 'card_grid';

  const colsClass = items.length <= 4 ? 'grid-cols-2' : 'grid-cols-3';

  if (layout === 'card_grid' || !layout) {
    return (
      <div className="w-full h-full p-4 print:p-2 flex flex-col bg-white font-['Lexend'] text-zinc-900 gap-3 print:gap-2">
        <PedagogicalHeader
          title={activity.title || 'EŞ ANLAMLI KELİMELER'}
          instruction={activity.instruction || 'Her kelimenin eş anlamlılarını incele ve cümleyi tamamla.'}
          note={activity.pedagogicalNote}
        />

        <div className={`grid ${colsClass} gap-3 print:gap-2 flex-1 content-start`}>
          {items.map((item, idx) => (
            <EditableElement
              key={item.id || idx}
              className="flex flex-col gap-2 p-3 print:p-2 border-2 border-zinc-100 rounded-2xl bg-white shadow-sm hover:border-indigo-200 hover:shadow-md transition-all break-inside-avoid"
            >
              {/* Kelime Başlığı */}
              <div className="flex items-center gap-2">
                {item.emoji && (
                  <span className="text-2xl shrink-0">{item.emoji}</span>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base font-black text-zinc-900 uppercase tracking-tight">
                      <EditableText value={item.sourceWord} tag="span" />
                    </span>
                    {item.usageContext && (
                      <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full ${CONTEXT_COLORS[item.usageContext] || 'bg-zinc-100 text-zinc-500'}`}>
                        {item.usageContext}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Eş Anlamlılar */}
              <div>
                <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1">EŞ ANLAMLILARI</p>
                <div className="flex flex-wrap gap-1">
                  {item.synonyms.map((syn, i) => (
                    <span key={i} className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 rounded-full text-[10px] font-bold text-indigo-700">
                      <EditableText value={syn} tag="span" />
                    </span>
                  ))}
                </div>
              </div>

              {/* Zıt Anlam */}
              {item.antonym && (
                <div className="flex items-center gap-2">
                  <span className="text-[8px] font-black text-rose-400 uppercase tracking-widest">ZIT:</span>
                  <span className="px-2 py-0.5 bg-rose-50 border border-rose-100 rounded-full text-[10px] font-bold text-rose-600">
                    <EditableText value={item.antonym} tag="span" />
                  </span>
                </div>
              )}

              {/* Örnek Cümle */}
              {item.exampleSentence && (
                <div className="bg-zinc-50 rounded-xl p-2 border border-zinc-100">
                  <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1">CÜMLE</p>
                  <p className="text-[11px] font-bold text-zinc-700 leading-relaxed">
                    {item.exampleSentence.split(BLANK_SEPARATOR).map((part, i, arr) => (
                      <React.Fragment key={i}>
                        {part}
                        {i < arr.length - 1 && (
                          <span className="inline-block min-w-[60px] border-b-2 border-dashed border-indigo-400 mx-1 text-transparent select-none">___</span>
                        )}
                      </React.Fragment>
                    ))}
                  </p>
                </div>
              )}

              {/* Etimoloji Notu */}
              {item.etymologyNote && (
                <p className="text-[8px] italic text-zinc-400 border-t border-zinc-100 pt-1">
                  {item.etymologyNote}
                </p>
              )}
            </EditableElement>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center text-[8px] text-zinc-400 font-bold uppercase tracking-widest border-t border-zinc-100 pt-2 print:pt-1">
          <span>Toplam {items.length} Kelime</span>
          <span>Ad: _________________ | Tarih: _________</span>
        </div>
      </div>
    );
  }

  // Fallback for list / match_columns layouts
  return (
    <div className="w-full h-full p-4 print:p-2 flex flex-col bg-white font-['Lexend'] text-zinc-900">
      <PedagogicalHeader
        title={activity.title || 'EŞ ANLAMLI KELİMELER'}
        instruction={activity.instruction || 'Her kelimenin eş anlamlılarını incele.'}
        note={activity.pedagogicalNote}
      />
      <div className="flex flex-col gap-2 mt-3">
        {items.map((item, idx) => (
          <EditableElement key={idx} className="flex items-center gap-4 p-3 border border-zinc-100 rounded-xl">
            <span className="font-black text-sm uppercase w-24 shrink-0">{item.sourceWord}</span>
            <span className="text-zinc-400 text-xs">→</span>
            <span className="text-sm font-bold text-indigo-700">{item.synonyms.join(', ')}</span>
          </EditableElement>
        ))}
      </div>
    </div>
  );
};
