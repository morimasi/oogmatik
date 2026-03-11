import React from 'react';
import { LetterVisualMatchingData } from '../../../types';
import { PedagogicalHeader, ImageDisplay, HandwritingGuide, TracingText } from '../common';
import { EditableElement, EditableText } from '../../Editable';

export const LetterVisualMatchingSheet = ({ data }: { data: LetterVisualMatchingData }) => (
  <div className="flex flex-col bg-white font-lexend p-2 overflow-visible">
    <PedagogicalHeader
      title={data.title}
      instruction={data.instruction}
      note={data.pedagogicalNote}
    />
    <div className="grid grid-cols-2 gap-6 print:gap-2 mt-8 print:mt-2">
      {(data.pairs || []).map((pair, idx) => (
        <EditableElement
          key={idx}
          className="p-6 print:p-2 border-2 border-zinc-100 rounded-[2.5rem] flex items-center gap-6 print:gap-2 bg-white shadow-sm hover:border-indigo-300 transition-all break-inside-avoid"
        >
          <div className="w-20 h-20 bg-zinc-900 rounded-3xl flex items-center justify-center text-5xl font-black text-white shadow-lg">
            <EditableText value={pair.letter} tag="span" />
          </div>
          <div className="flex-1">
            <div className="h-28 bg-zinc-50 rounded-2xl border-2 border-dashed border-zinc-200 mb-4 print:mb-1 overflow-hidden">
<<<<<<< HEAD
              <ImageDisplay prompt={pair.imagePrompt} className="w-full h-full  object-contain" />
=======
              <ImageDisplay prompt={pair.imagePrompt} className="w-full h-full print:h-0 object-contain" />
>>>>>>> 7ddd6a5ed99eef0e234e449bd0286508a88609b4
            </div>
            {data.settings.showTracing && (
              <HandwritingGuide height={60}>
                <TracingText text={pair.letter} fontSize="40px" />
              </HandwritingGuide>
            )}
          </div>
        </EditableElement>
      ))}
    </div>
  </div>
);

<<<<<<< HEAD

=======
>>>>>>> 7ddd6a5ed99eef0e234e449bd0286508a88609b4
