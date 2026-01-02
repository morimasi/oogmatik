
import React from 'react';
import { ReadingFlowData, LetterDiscriminationData, RapidNamingData, PhonologicalAwarenessData, MirrorLettersData, SyllableTrainData, VisualTrackingLineData, BackwardSpellingData, CodeReadingData, AttentionToQuestionData, AttentionDevelopmentData, AttentionFocusData, HandwritingPracticeData, PseudowordReadingData } from '../../types';
import { ImageDisplay, PedagogicalHeader, Shape, GridComponent, DyslexicText, HandwritingGuide, TracingText } from './common';
import { EditableElement, EditableText } from '../Editable';

// ... existing components ...

export const PseudowordReadingSheet: React.FC<{ data: PseudowordReadingData }> = ({ data }) => {
    const columns = 4;
    const words = data.words || [];
    
    return (
        <div className="flex flex-col h-full bg-white">
            <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
            
            <div className="flex-1 grid grid-cols-4 gap-x-8 gap-y-10 mt-6 content-start px-4">
                {words.map((word, i) => (
                    <EditableElement key={i} className="flex flex-col items-center">
                        <div className="text-center w-full">
                            <DyslexicText 
                                text={word} 
                                mode={data.visualMode || 'standard'} 
                                className={`font-black text-2xl tracking-widest text-zinc-800 uppercase`}
                            />
                        </div>
                        {/* Clinical Scoring Dot (Invisible in normal view, handy for print check) */}
                        <div className="mt-2 w-full flex justify-center gap-1 opacity-20">
                            <div className="w-4 h-4 rounded-full border border-zinc-300"></div>
                            <div className="w-4 h-4 rounded-full border border-zinc-300"></div>
                        </div>
                    </EditableElement>
                ))}
            </div>

            {data.scoringTable && (
                <div className="mt-12 p-6 bg-zinc-50 rounded-[2.5rem] border-2 border-zinc-100 shadow-inner break-inside-avoid">
                    <div className="flex justify-between items-center mb-4 border-b border-zinc-200 pb-2">
                        <h4 className="font-black text-[10px] text-zinc-400 uppercase tracking-[0.2em]">Klinik Değerlendirme Çizelgesi</h4>
                        <span className="text-[10px] font-bold text-indigo-500 uppercase">Zorluk: {data.difficulty}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-6">
                        <div className="space-y-1">
                            <span className="text-[9px] font-bold text-zinc-400 uppercase">Toplam Süre</span>
                            <div className="h-8 border-b-2 border-zinc-200 border-dashed"></div>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[9px] font-bold text-zinc-400 uppercase">Doğru Sayısı</span>
                            <div className="h-8 border-b-2 border-zinc-200 border-dashed"></div>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[9px] font-bold text-zinc-400 uppercase">Hata Türü</span>
                            <div className="h-8 border-b-2 border-zinc-200 border-dashed"></div>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[9px] font-bold text-zinc-400 uppercase">Gözlem Notu</span>
                            <div className="h-8 border-b-2 border-zinc-200 border-dashed"></div>
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-auto pt-6 text-center">
                 <p className="text-[8px] text-zinc-300 font-bold uppercase tracking-[0.5em]">Bursa Disleksi AI • RAN & Fonolojik İşlemleme Laboratuvarı</p>
            </div>
        </div>
    );
};

// ... remaining existing components ...
