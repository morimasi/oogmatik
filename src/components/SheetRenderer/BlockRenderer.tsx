import React from 'react';
import { WorksheetBlock } from '../../types';
import { EditableText } from '../Editable';
import { recursiveSafeText } from '../../utils/textUtils';
import { ImageDisplay } from '../sheets/common';

// BOLT OPTIMIZATION: Memoize BlockRenderer to prevent unnecessary re-renders of individual blocks
export const BlockRenderer = React.memo(({ block }: { block: WorksheetBlock }) => {
  const content: any = block.content;
  if (!content) return null;

  const blockStyle = {
    textAlign: (block.style?.textAlign as unknown as any) || 'left',
    fontWeight: (block.style?.fontWeight as unknown as any) || 'normal',
    fontSize: block.style?.fontSize ? `${block.style.fontSize}px` : undefined,
    backgroundColor: block.style?.backgroundColor || 'transparent',
    borderRadius: block.style?.borderRadius ? `${block.style.borderRadius}px` : undefined,
    color: block.style?.color || 'inherit',
  };

  switch (block.type) {
    case 'header':
      return (
        <h2
          className="block-header font-black uppercase text-center mb-4 print:mb-2 border-b-4 border-[var(--worksheet-border-color,#000)] pb-2 print:pb-1 break-inside-avoid print:break-inside-avoid"
          style={{
            ...blockStyle,
            fontSize: 'calc(var(--worksheet-font-size, 16px) * 1.5)',
            fontFamily: 'var(--worksheet-font-family, Lexend)',
            letterSpacing: 'var(--worksheet-letter-spacing)',
            wordSpacing: 'var(--worksheet-word-spacing)'
          }}
        >
          <EditableText value={recursiveSafeText(content.text || content)} tag="span" />
        </h2>
      );

    case 'text':
      return (
        <div
          className="block-text mb-4 print:mb-1 break-inside-avoid print:break-inside-avoid"
          style={{
            ...blockStyle,
            fontSize: 'var(--worksheet-font-size, 18px)',
            fontFamily: 'var(--worksheet-font-family, Lexend)',
            lineHeight: 'var(--worksheet-line-height, 1.6)',
            letterSpacing: 'var(--worksheet-letter-spacing)',
            wordSpacing: 'var(--worksheet-word-spacing)',
            marginBottom: 'var(--worksheet-paragraph-spacing, 20px)'
          }}
        >
          <EditableText value={recursiveSafeText(content.text || content)} tag="div" />
        </div>
      );

    case 'grid': {
      const cells = content.cells || content.items || content.data || [];
      const cols = content.cols || content.columns || 4;
      return (
        <div className="block-svg-shape flex justify-center mb-4 print:mb-2 break-inside-avoid print:break-inside-avoid">
          <div
            className="block-grid-container grid gap-2 border-4 border-black p-4 print:p-2 bg-zinc-50 rounded-2xl"
            style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
          >
            {cells.map((cell: any, i: number) => (
              <div
                key={i}
                className="block-grid-cell w-12 h-12 border-2 border-zinc-300 bg-white rounded-lg flex items-center justify-center font-black text-xl"
              >
                <EditableText value={recursiveSafeText(cell)} tag="span" />
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'table': {
      const headers: string[] = content.headers || content.columns || [];
      const rows: any[][] = content.rows || content.data || content.items || [];
      return (
        <div className="block-table-container overflow-hidden border-4 border-black rounded-2xl mb-4 print:mb-2 bg-white mx-auto max-w-full shadow-sm break-inside-avoid print:break-inside-avoid">
          <table className="w-full border-collapse">
            {headers.length > 0 && (
              <thead className="bg-zinc-100">
                <tr>
                  {headers.map((h: string, i: number) => (
                    <th
                      key={i}
                      className="p-3 text-[10px] font-black uppercase border-r border-black last:border-0"
                    >
                      {recursiveSafeText(h)}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {rows.map((row: any[], i: number) => (
                <tr key={i} className="border-t border-zinc-200">
                  {(Array.isArray(row) ? row : Object.values(row)).map((cell, j) => (
                    <td
                      key={j}
                      className="p-3 text-center font-bold text-sm border-r border-zinc-100 last:border-0"
                    >
                      <EditableText value={recursiveSafeText(cell)} tag="span" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    case 'logic_card':
      return (
        <div className="block-logic-card p-5 print:p-2 border-[3px] border-zinc-900 rounded-[2.5rem] bg-white shadow-sm flex flex-col gap-3 print:gap-1 mb-3 print:mb-1 break-inside-avoid print:break-inside-avoid">
          <div className="logic-text-box bg-zinc-900 text-white p-3 rounded-2xl text-center text-sm font-bold italic mb-1">
            <EditableText value={recursiveSafeText(content.text)} tag="p" />
          </div>
          {content.data && (
            <div className="flex justify-center gap-3">
              {content.data.map((box: string[], bIdx: number) => (
                <div
                  key={bIdx}
                  className="border-2 border-zinc-800 p-2 rounded-xl bg-zinc-50 flex flex-wrap justify-center gap-1 min-w-[60px]"
                >
                  {box.map((num, nIdx) => (
                    <span key={nIdx} className="font-mono font-black text-base">
                      {num}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-around pt-2 border-t-2 border-dashed border-zinc-100">
            {(content.options || []).map((opt: string, oIdx: number) => (
              <div key={oIdx} className="flex flex-col items-center gap-1">
                <div className="logic-option-btn w-9 h-9 rounded-xl border-2 border-zinc-200 flex items-center justify-center font-black text-sm">
                  {opt}
                </div>
                <span className="text-[8px] font-black text-zinc-300 uppercase">
                  {String.fromCharCode(65 + oIdx)}
                </span>
              </div>
            ))}
          </div>
        </div>
      );

    case 'footer_validation':
      return (
        <div className="block-footer-val mt-4 p-6 bg-zinc-900 text-white rounded-[2.5rem] border-4 border-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 break-inside-avoid print:break-inside-avoid">
          <div className="flex-1">
            <h4 className="text-xl font-black tracking-tight mb-1 uppercase">
              KONTROL VE DOĞRULAMA
            </h4>
            <p className="text-xs text-zinc-400 font-medium leading-relaxed italic">
              <EditableText value={recursiveSafeText(content.text)} tag="span" />
            </p>
          </div>
          <div className="flex items-center gap-5 bg-white/10 p-4 rounded-[1.5rem] border border-white/20">
            <div className="text-center">
              <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest block mb-1">
                HEDEF
              </span>
              <div className="target-value text-3xl font-black text-amber-400 font-mono">
                {content.targetValue}
              </div>
            </div>
            <div className="w-px h-10 bg-white/20"></div>
            <div className="text-center">
              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-1">
                CEVABIM
              </span>
              <div className="w-16 h-8 border-b-4 border-dashed border-zinc-700"></div>
            </div>
          </div>
        </div>
      );

    case 'svg_shape':
      return (
        <div className="block-svg-shape flex justify-center mb-4 break-inside-avoid print:break-inside-avoid">
          <div className="svg-container w-32 h-32 p-2 border-2 border-zinc-100 rounded-2xl bg-white shadow-sm">
            <svg viewBox={content.viewBox || '0 0 100 100'} className="w-full h-full text-black">
              {(content.paths || []).map((p: string, i: number) => (
                <path
                  key={i}
                  d={p}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              ))}
            </svg>
          </div>
        </div>
      );

    case 'cloze_test': {
      const rawText = recursiveSafeText(content.text || content);
      const parts = rawText.split(/(\[.*?\])/g);
      return (
        <div
          className="block-cloze p-5 print:p-2 bg-zinc-50 border-2 border-dashed border-zinc-300 rounded-[2rem] mb-4 print:mb-1 relative break-inside-avoid print:break-inside-avoid"
          style={{ lineHeight: '2.4', fontSize: '11px' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 bg-zinc-900 text-white text-[8px] font-black uppercase tracking-widest rounded-full">
              <i className="fa-solid fa-pen-nib mr-1"></i>Boşluk Doldur
            </span>
            {content.blanks && (
              <span className="text-[8px] text-zinc-400 font-bold">
                {content.blanks.length} boşluk
              </span>
            )}
          </div>
          <div className="font-dyslexic text-zinc-800" style={{ lineHeight: '2.4' }}>
            {parts.map((part: string, i: number) =>
              part.startsWith('[') && part.endsWith(']') ? (
                <span key={i} className="inline-flex flex-col items-center mx-1 align-bottom">
                  <span className="cloze-blank inline-block min-w-[80px] border-b-[2px] border-zinc-700 text-transparent select-none text-xs leading-none pb-0.5">
                    {part.slice(1, -1)}
                  </span>
                  <span className="cloze-label text-[6px] text-zinc-300 font-bold tracking-widest">
                    YAZ
                  </span>
                </span>
              ) : (
                <EditableText key={i} value={part} tag="span" />
              )
            )}
          </div>
        </div>
      );
    }

    case 'categorical_sorting': {
      const cats: string[] = content.categories || [];
      const items: any[] = content.items || [];
      const unassigned = items.filter((it: any) => !it.category);
      const colCount = Math.min(cats.length || 2, 4);
      return (
        <div className="block-categorical mb-4 break-inside-avoid print:break-inside-avoid">
          {unassigned.length > 0 && (
            <div className="block-cat-bank mb-3 p-3 bg-white border-2 border-zinc-100 rounded-xl">
              <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-2">
                Sırala →
              </p>
              <div className="flex flex-wrap gap-1.5">
                {unassigned.map((item: any, j: number) => (
                  <span
                    key={j}
                    className="block-cat-item px-2 py-1 bg-zinc-100 border border-zinc-200 rounded-lg text-xs font-black text-zinc-700"
                  >
                    {recursiveSafeText(item.label || item)}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${colCount}, 1fr)` }}>
            {cats.map((cat: string, i: number) => {
              const catItems = items.filter((item: any) => item.category === cat);
              return (
                <div key={i} className="flex flex-col gap-1.5">
                  <div className="block-cat-header bg-zinc-900 text-white p-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest text-center">
                    {cat}
                  </div>
                  <div className="block-cat-body flex-1 min-h-[80px] border-2 border-zinc-200 border-dashed rounded-xl p-2 flex flex-col gap-1 bg-white/50">
                    {catItems.map((item: any, j: number) => (
                      <div
                        key={j}
                        className="block-cat-item px-2 py-1 bg-white border border-zinc-200 rounded-lg text-xs font-bold flex items-center gap-1.5"
                      >
                        <div className="w-1 h-1 rounded-full bg-zinc-300 flex-shrink-0"></div>
                        {recursiveSafeText(item.label || item)}
                      </div>
                    ))}
                    {catItems.length === 0 && (
                      <div className="flex-1 flex items-center justify-center">
                        <p className="text-[8px] text-zinc-300 font-bold">Boş Bırak</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    case 'match_columns': {
      const CIRCLED = [
        '\u2460',
        '\u2461',
        '\u2462',
        '\u2463',
        '\u2464',
        '\u2465',
        '\u2466',
        '\u2467',
        '\u2468',
        '\u2469',
      ];
      const leftItems: any[] = content.leftColumn || content.left || [];
      const rightItems: any[] = content.rightColumn || content.right || [];
      return (
        <div className="block-match mb-4 print:mb-1 break-inside-avoid print:break-inside-avoid p-4 print:p-2 bg-white border-2 border-zinc-100 rounded-[2rem] shadow-sm">
          <div className="flex gap-3">
            <div className="flex-1 flex flex-col gap-1.5">
              <p className="block-match-label text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1 text-center">
                Kavram
              </p>
              {leftItems.map((item: any, i: number) => (
                <div
                  key={i}
                  className="block-match-item flex items-center gap-2 p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold"
                >
                  <span className="block-match-circled text-indigo-500 font-black flex-shrink-0">
                    {CIRCLED[i] || i + 1}
                  </span>
                  <span className="flex-1">{recursiveSafeText(item.text || item)}</span>
                  <div className="w-2.5 h-2.5 rounded-full border-2 border-zinc-400 bg-white flex-shrink-0"></div>
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center w-6 pt-6">
              {leftItems.map((_: any, i: number) => (
                <div key={i} className="flex-1 flex items-center">
                  <div className="w-5 border-t border-dashed border-zinc-200"></div>
                </div>
              ))}
            </div>
            <div className="flex-1 flex flex-col gap-1.5">
              <p className="block-match-label text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1 text-center">
                Eşleşim
              </p>
              {rightItems.map((item: any, i: number) => (
                <div
                  key={i}
                  className="block-match-item flex items-center gap-2 p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold"
                >
                  <div className="w-2.5 h-2.5 rounded-full border-2 border-zinc-400 bg-white flex-shrink-0"></div>
                  <span className="flex-1">{recursiveSafeText(item.text || item)}</span>
                  <span className="w-5 border-b border-zinc-400 inline-block flex-shrink-0"></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    case 'visual_clue_card':
      return (
        <div className="block-clue-card p-4 bg-gradient-to-br from-indigo-50 to-white border-2 border-indigo-100 rounded-[1.5rem] mb-3 flex items-start gap-3 border-l-4 border-l-indigo-500 break-inside-avoid print:break-inside-avoid">
          <div className="clue-icon w-10 h-10 bg-indigo-500 text-white rounded-xl flex items-center justify-center text-base shadow-sm flex-shrink-0">
            <i className={`fa-solid ${content.icon || 'fa-lightbulb'}`}></i>
          </div>
          <div className="flex-1 min-w-0">
            <h5 className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.15em] mb-0.5">
              {content?.title || 'KLİNİK İPUCU'}
            </h5>
            <p className="text-xs font-bold text-zinc-700 leading-snug italic">
              {content.clue || content.description}
            </p>
          </div>
        </div>
      );

    case 'neuro_marker':
      return (
        <div
          className={`block-neuro my-2 flex ${content.position === 'center' ? 'justify-center' : 'justify-start'}`}
        >
          {content.neuroType === 'tracking' && (
            <div className="flex gap-1.5 items-center opacity-30">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="neuro-dot w-2 h-2 rounded-full bg-zinc-900"></div>
              ))}
              <i className="fa-solid fa-eye text-[9px]"></i>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="neuro-dot w-2 h-2 rounded-full bg-zinc-900"></div>
              ))}
            </div>
          )}
          {content.neuroType === 'saccadic' && (
            <div className="w-full flex justify-between px-6 relative h-10 items-center">
              <div className="absolute inset-x-6 h-0.5 bg-zinc-100 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-zinc-200"></div>
              <div className="w-7 h-10 border-2 border-zinc-900 rounded-full flex items-center justify-center bg-white z-10 shadow-sm relative">
                <div className="w-2.5 h-2.5 bg-zinc-900 rounded-full"></div>
                <div className="absolute -bottom-5 text-[6px] font-black text-zinc-400 uppercase">
                  BAŞLA
                </div>
              </div>
              <div className="w-10 h-5 border-2 border-zinc-300 rounded-lg bg-zinc-50 z-10"></div>
              <div className="w-7 h-10 border-2 border-zinc-900 rounded-full flex items-center justify-center bg-white z-10 shadow-sm relative">
                <div className="w-3.5 h-3.5 border-2 border-zinc-900 rounded-full flex items-center justify-center">
                  <div className="w-1 h-1 bg-zinc-900 rounded-full"></div>
                </div>
                <div className="absolute -bottom-5 text-[6px] font-black text-zinc-400 uppercase">
                  BİTİR
                </div>
              </div>
            </div>
          )}
          {content.neuroType === 'focus' && (
            <div className="flex gap-3 items-center">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="neuro-dot w-3 h-3 rounded-full border-2 border-zinc-900"
                  style={{ opacity: 0.1 * (i * 3) }}
                ></div>
              ))}
              <div className="w-4 h-4 rounded-full bg-zinc-900 opacity-70"></div>
              {[3, 2, 1].map((i) => (
                <div
                  key={i}
                  className="neuro-dot w-3 h-3 rounded-full border-2 border-zinc-900"
                  style={{ opacity: 0.1 * (i * 3) }}
                ></div>
              ))}
            </div>
          )}
        </div>
      );

    case 'image':
      return (
        <div className="block-svg-shape mb-4 flex justify-center break-inside-avoid print:break-inside-avoid">
          <ImageDisplay
            prompt={content.prompt}
            className="w-full h-48 rounded-[2rem] shadow-md border-4 border-white"
          />
        </div>
      );

    default:
      return (
        <div className="p-4 border-2 border-amber-100 bg-amber-50 rounded-2xl text-[9px] font-mono text-amber-700 opacity-50">
          [Bilinmeyen Blok: {block.type}] - Veri: {JSON.stringify(content).slice(0, 50)}...
        </div>
      );
  }
});
