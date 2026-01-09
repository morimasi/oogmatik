
import React from 'react';
import { ReadingFlowData } from '../../../types';
import { PedagogicalHeader, ReadingRuler } from '../common';
import { EditableText } from '../../Editable';

export const ReadingFlowSheet: React.FC<{ data: ReadingFlowData }> = ({ data }) => (
    <div className="flex flex-col font-lexend p-2 relative h-full">
        <ReadingRuler />
        <PedagogicalHeader title={data.title} instruction="Metni önce heceleyerek, sonra akıcı bir şekilde oku." note={data.pedagogicalNote} />
        <div className="mt-10 p-12 bg-zinc-50 border-4 border-zinc-100 rounded-[3.5rem] shadow-inner flex-1 flex flex-col justify-center overflow-hidden">
            {(data.text?.paragraphs || []).map((p, pIdx) => (
                <div key={pIdx} className="mb-8 last:mb-0">
                    {(p.sentences || []).map((s, sIdx) => (
                        <p key={sIdx} className="text-3xl leading-[2.5] font-dyslexic text-zinc-800 text-justify tracking-wide mb-6">
                            {(s.syllables || []).map((syl, sylIdx) => (
                                <span key={sylIdx} className="hover:bg-yellow-100 px-1 rounded transition-colors cursor-help border-b-2 border-zinc-200">
                                    <EditableText value={syl.text} tag="span" />
                                </span>
                            ))}
                        </p>
                    ))}
                </div>
            ))}
        </div>
    </div>
);
