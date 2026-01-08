
import React from 'react';
import { LetterVisualMatchingData } from '../../../types';
import { PedagogicalHeader, ImageDisplay, HandwritingGuide, TracingText } from '../common';
import { EditableElement, EditableText } from '../../Editable';

export const LetterVisualMatchingSheet: React.FC<{ data: LetterVisualMatchingData }> = ({ data }) => (
    <div className="flex flex-col h-full bg-white font-lexend p-2">
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="grid grid-cols-2 gap-6 mt-8">
            {(data.pairs || []).map((pair, idx) => (
                <EditableElement key={idx} className="p-6 border-2 border-zinc-100 rounded-[2.5rem] flex items-center gap-6 bg-white shadow-sm hover:border-indigo-300 transition-all break-inside-avoid">
                    <div className="w-20 h-20 bg-zinc-900 rounded-3xl flex items-center justify-center text-5xl font-black text-white shadow-lg">
                        <EditableText value={pair.letter} tag="span" />
                    </div>
                    <div className="flex-1">
                        <div className="h-28 bg-zinc-50 rounded-2xl border-2 border-dashed border-zinc-200 mb-4 overflow-hidden">
                            <ImageDisplay prompt={pair.imagePrompt} className="w-full h-full object-contain" />
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
