import React from 'react';
import { LetterVisualMatchingData } from '../../../types';
import { PedagogicalHeader, ImageDisplay, HandwritingGuide, TracingText } from '../common';
import { EditableElement, EditableText } from '../../Editable';

export const LetterVisualMatchingSheet = ({ data }: { data: LetterVisualMatchingData }) => {
  const settings = data.settings || {};
  const pairs = data.pairs || [];
  const cols = settings.gridCols || 3;

  return (
    <div className="flex flex-col bg-white font-lexend p-2 print:p-1.5 overflow-hidden h-full w-full">
      <PedagogicalHeader
        title={data.title}
        instruction={data.instruction}
      />
      <div
        className="grid gap-2 print:gap-1.5 mt-2 print:mt-1"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {pairs.map((pair, idx) => (
          <EditableElement
            key={idx}
            className="p-2 print:p-1.5 border border-zinc-200 rounded-xl flex flex-col gap-2 print:gap-1 bg-white shadow-sm hover:border-indigo-300 transition-all break-inside-avoid"
          >
            <div className="flex items-center gap-2 print:gap-1">
              <div className="w-10 h-10 print:w-8 print:h-8 shrink-0 bg-zinc-800 rounded-lg flex items-center justify-center text-xl print:text-lg font-black text-white shadow">
                <EditableText value={pair.letter} tag="span" />
              </div>
              <span className="text-[10px] print:text-[8px] font-bold text-zinc-500 uppercase leading-tight">
                {pair.word}
              </span>
            </div>
            <div className="h-24 print:h-16 bg-zinc-50 rounded-lg border border-dashed border-zinc-300 overflow-hidden">
              {pair.imageBase64 && pair.imageBase64.trim().startsWith('<svg') ? (
                <div
                  className="w-full h-full flex items-center justify-center p-1"
                  dangerouslySetInnerHTML={{ __html: pair.imageBase64 }}
                />
              ) : (
                <ImageDisplay
                  prompt={`${pair.letter} harfi ile başlayan ${pair.imagePrompt || 'nesne'}, boyama sayfası stili, sade çizim`}
                  className="w-full h-full"
                  base64={pair.imageBase64}
                />
              )}
            </div>
            {settings.showTracing && (
              <div className="mt-0.5">
                <HandwritingGuide height={28}>
                  <TracingText text={pair.letter} fontSize="20px" />
                </HandwritingGuide>
              </div>
            )}
          </EditableElement>
        ))}
      </div>
    </div>
  );
};


