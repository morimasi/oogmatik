/**
 * 1. BOŞLUK DOLDURMA BİLEŞENİ (Premium A4 & Tema Uyumlu)
 */

import React from 'react';
import {
  FillBlanksData,
  MultipleChoiceVerbalData,
  WordCompletionData,
  MixedSentenceData,
  AntonymData
} from '../../types/verbal.js';

export const FillBlanksRenderer: React.FC<{ data: FillBlanksData, isPrinting?: boolean }> = ({ data, isPrinting }) => {
  return (
    <div className={`space-y-4 ${isPrinting ? 'p-0 text-black' : 'p-6 text-[var(--text-primary)]'}`}>
      <div className="border-b-2 border-accent/20 pb-2 mb-4">
        <h2 className="text-xl font-black text-accent uppercase tracking-tight">{data.content?.title}</h2>
        <p className={`text-sm font-medium ${isPrinting ? 'text-gray-600' : 'text-[var(--text-muted)]'}`}>{data.content?.instruction}</p>
      </div>

      {data.content?.wordBank && (
        <div className="bg-accent/5 border-2 border-dashed border-accent/20 rounded-2xl p-4 flex flex-wrap gap-3 mb-6">
          <span className="w-full text-[10px] font-bold text-accent/60 uppercase mb-1">Kelime Bankası</span>
          {data.content.wordBank.map((word: string, i: number) => (
            <span key={i} className={`px-3 py-1 border border-accent/10 rounded-lg text-sm font-bold shadow-2xs text-accent ${isPrinting ? 'bg-white' : 'bg-[var(--bg-paper)]'}`}>
              {word}
            </span>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-y-4">
        {data.items?.map((item: { sentence: string }, index: number) => (
          <div key={index} className="flex items-start gap-3 group">
            <span className="w-6 h-6 rounded-full bg-accent text-white text-[10px] flex items-center justify-center font-black flex-shrink-0 mt-1">
              {index + 1}
            </span>
            <div className={`flex-1 text-lg leading-relaxed border-b border-dashed border-[var(--border-color)] pb-2 group-hover:border-accent/40 transition-colors ${isPrinting ? 'text-black border-gray-200' : 'text-[var(--text-primary)]'}`}>
              {item.sentence.split('____').map((part: string, i: number, arr: string[]) => (
                <React.Fragment key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <span className="inline-block min-w-[100px] border-b-2 border-accent/40 mx-1 text-accent font-bold text-center italic">
                      &nbsp;
                    </span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * 2. ÇOKTAN SEÇMELİ BİLEŞEN (Premium A4 & Tema Uyumlu)
 */
export const MultipleChoiceVerbalRenderer: React.FC<{ data: MultipleChoiceVerbalData, isPrinting?: boolean }> = ({ data, isPrinting }) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className={`text-2xl font-black leading-none mb-2 ${isPrinting ? 'text-gray-900' : 'text-[var(--text-primary)]'}`}>{data.content?.title}</h2>
        <div className="h-1 w-20 bg-accent mx-auto rounded-full"></div>
      </div>

      <div className={`grid ${data.settings?.columnLayout === 2 ? 'grid-cols-2' : 'grid-cols-1'} gap-8`}>
        {data.items?.map((item: { question: string; options: string[] }, idx: number) => (
          <div key={idx} className={`rounded-2xl border p-5 hover:border-accent/20 transition-all cursor-default shadow-2xs ${isPrinting ? 'bg-white border-gray-100' : 'bg-[var(--bg-paper)] border-[var(--border-color)]'}`}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-accent font-black text-lg">{idx + 1}.</span>
              <p className={`font-extrabold leading-tight ${isPrinting ? 'text-gray-800' : 'text-[var(--text-primary)]'}`}>{item.question}</p>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {item.options.map((opt: string, i: number) => (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border hover:bg-accent/5 transition-colors group ${isPrinting ? 'border-gray-100' : 'border-[var(--border-color)]/60'}`}>
                  <span className={`w-6 h-6 rounded-lg group-hover:bg-accent group-hover:text-white flex items-center justify-center text-[10px] font-black transition-colors ${isPrinting ? 'bg-gray-100 text-gray-400' : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'}`}>
                    {['A', 'B', 'C', 'D'][i]}
                  </span>
                  <span className={`text-sm font-medium group-hover:text-accent transition-colors ${isPrinting ? 'text-gray-600' : 'text-[var(--text-primary)]'}`}>{opt}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * 3. KELİME TAMAMLAMA BİLEŞENİ (Premium A4 & Tema Uyumlu)
 */
export const WordCompletionRenderer: React.FC<{ data: WordCompletionData, isPrinting?: boolean }> = ({ data, isPrinting }) => {
  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-accent/10 to-transparent p-4 rounded-r-3xl border-l-4 border-accent">
        <h2 className="text-xl font-black text-accent uppercase tracking-tighter">{data.content?.title}</h2>
        <p className="text-xs text-accent/60 font-bold">{data.content?.instruction}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {data.items?.map((item: { imagePrompt?: string; word: string }, idx: number) => (
          <div key={idx} className={`flex flex-col items-center p-4 rounded-2xl border hover:shadow-xl hover:border-accent/10 transition-all group ${isPrinting ? 'bg-gray-50/50 border-gray-100 hover:bg-white' : 'bg-[var(--bg-paper)] border-[var(--border-color)] hover:bg-[var(--bg-paper)]'}`}>
            {item.imagePrompt && (
              <div className={`w-16 h-16 rounded-xl mb-3 flex items-center justify-center border shadow-inner group-hover:scale-110 transition-transform ${isPrinting ? 'bg-white border-gray-100' : 'bg-[var(--bg-secondary)] border-[var(--border-color)]'}`}>
                <span className="text-2xl">🖼️</span>
              </div>
            )}
            <div className="flex gap-1">
              {item.word.split('').map((char: string, ci: number) => (
                <div key={ci} className={`w-8 h-10 rounded-lg flex items-center justify-center text-xl font-black shadow-2xs border-2 ${char === '_' ? 'border-accent bg-accent/5 text-transparent animate-pulse' : isPrinting ? 'border-gray-200 bg-white text-gray-800' : 'border-[var(--border-color)] bg-[var(--bg-paper)] text-[var(--text-primary)]'}`}>
                  {char !== '_' ? char : ''}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * 4. KARIŞIK CÜMLE BİLEŞENİ (Premium A4 & Tema Uyumlu)
 */
export const MixedSentenceRenderer: React.FC<{ data: MixedSentenceData, isPrinting?: boolean }> = ({ data, isPrinting }) => {
  return (
    <div className="space-y-6">
      {data.items?.map((item: { scrambledWords: string[] }, idx: number) => (
        <div key={idx} className={`p-6 rounded-3xl border-2 hover:border-accent/40 transition-all shadow-2xs ${isPrinting ? 'bg-white border-gray-100' : 'bg-[var(--bg-paper)] border-[var(--border-color)]'}`}>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center text-accent font-black">
              {idx + 1}
            </div>
            <div className="flex flex-wrap gap-2">
              {item.scrambledWords.map((word: string, wi: number) => (
                <div key={wi} className={`px-4 py-2 border rounded-xl text-sm font-bold shadow-2xs cursor-move hover:bg-accent/5 hover:border-accent/20 transition-colors ${isPrinting ? 'bg-gray-50 border-gray-200 text-gray-700' : 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-primary)]'}`}>
                  {word}
                </div>
              ))}
            </div>
          </div>
          <div className={`h-20 w-full rounded-2xl border-2 border-dashed flex items-center px-4 relative group ${isPrinting ? 'bg-gray-50/50 border-gray-200' : 'bg-[var(--bg-secondary)]/50 border-[var(--border-color)]'}`}>
            <span className={`absolute -top-3 left-4 px-2 text-[10px] font-bold group-hover:text-accent transition-colors ${isPrinting ? 'bg-white text-gray-400' : 'bg-[var(--bg-paper)] text-[var(--text-muted)]'}`}>DOĞRU CÜMLE BURAYA</span>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * 5. ZIT ANLAM BİLEŞENİ (Premium A4 & Tema Uyumlu)
 */
export const AntonymRenderer: React.FC<{ data: AntonymData, isPrinting?: boolean }> = ({ data, isPrinting }) => {
  return (
    <div className="space-y-8">
      <div className={`flex items-center justify-between border-b-2 pb-4 ${isPrinting ? 'border-gray-100' : 'border-[var(--border-color)]'}`}>
        <h2 className={`text-3xl font-black tracking-tighter ${isPrinting ? 'text-gray-800' : 'text-[var(--text-primary)]'}`}>
          Zıt Anlam <span className="text-accent underline decoration-accent/30 underline-offset-8">Dedektifi</span>
        </h2>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-accent text-white text-[10px] font-black rounded-full uppercase">Kelimeleri Eşleştir</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
        {data.items?.map((item: { word: string }, idx: number) => (
          <div key={idx} className={`flex items-center justify-between p-4 rounded-2xl border-2 shadow-2xs hover:translate-x-1 transition-all ${isPrinting ? 'bg-white border-gray-50' : 'bg-[var(--bg-paper)] border-[var(--border-color)]'}`}>
            <div className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black ${isPrinting ? 'bg-gray-100 text-gray-400' : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'}`}>
                {idx + 1}
              </div>
              <span className={`text-lg font-black ${isPrinting ? 'text-gray-800' : 'text-[var(--text-primary)]'}`}>{item.word}</span>
            </div>
            <div className={`flex-1 mx-8 border-b-2 border-dashed relative ${isPrinting ? 'border-gray-100' : 'border-[var(--border-color)]'}`}>
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[8px] font-bold text-accent/60 italic">ZIT ANLAMINI BUL</span>
            </div>
            <div className="w-32 h-10 bg-accent/5 border-2 border-dashed border-accent/20 rounded-xl relative group overflow-hidden">
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-accent/30 opacity-40">..............</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
