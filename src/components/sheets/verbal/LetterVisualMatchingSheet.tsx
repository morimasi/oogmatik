import React from 'react';
import { LetterVisualMatchingData } from '../../../types';
import { PedagogicalHeader, ImageDisplay, HandwritingGuide, TracingText } from '../common';
import { EditableElement, EditableText } from '../../Editable';

export const LetterVisualMatchingSheet = ({ data }: { data: LetterVisualMatchingData }) => (
  <div className="flex flex-col bg-white font-lexend p-3 print:p-2 overflow-visible min-h-[297mm]">
    <PedagogicalHeader
      title={data.title}
      instruction={data.instruction}
    />
    <div className="grid grid-cols-2 gap-4 print:gap-2 mt-4 print:mt-2">
      {(data.pairs || []).map((pair, idx) => (
        <EditableElement
          key={idx}
          className="p-3 print:p-1.5 border border-zinc-200 rounded-xl flex items-center gap-3 print:gap-1.5 bg-white shadow-sm hover:border-indigo-300 transition-all break-inside-avoid"
        >
          <div className="w-14 h-14 bg-zinc-800 rounded-xl flex items-center justify-center text-3xl font-black text-white shadow">
            <EditableText value={pair.letter} tag="span" />
          </div>
          <div className="flex-1">
            <div className="h-20 bg-zinc-50 rounded-lg border border-dashed border-zinc-300 mb-2 print:mb-1 overflow-hidden">
              <ImageDisplay
                prompt={`${pair.letter} harfi ile başlayan ${pair.imagePrompt || 'nesne'}, boyama sayfası stili, sade çizim`}
                className="w-full h-full object-contain"
              />
            </div>
            {data.settings.showTracing && (
              <HandwritingGuide height={40}>
                <TracingText text={pair.letter} fontSize="28px" />
              </HandwritingGuide>
            )}
          </div>
        </EditableElement>
      ))}
    </div>
  </div>
);


